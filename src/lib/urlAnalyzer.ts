import { analyzeDomain } from "./domainAnalyzer";
import type { URLAnalysisResult, URLIndicator } from "./urlTypes";

const SHORTENER_DOMAINS = [
  "bit.ly", "tinyurl.com", "t.co", "ow.ly", "is.gd", "buff.ly", "adf.ly", "goo.gl"
];

const SUSPICIOUS_KEYWORDS = [
  "login", "verify", "secure", "account", "update", "password", "wallet", "payment", "claim", "confirm", "billing"
];

const MAX_URL_INPUT_LENGTH = 1000;

export function analyzeURL(inputUrl: string): URLAnalysisResult {
  const trimmed = inputUrl.trim();
  const cleanedInput = trimmed
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, "");

  const sanitized = cleanedInput.substring(0, MAX_URL_INPUT_LENGTH);
  let processedUrl = sanitized;
  let domain = "";
  let isHTTPS = false;
  let parsedUrl: URL | null = null;
  const invalidScheme = /^(javascript|data|vbscript|file|mailto):/i.test(sanitized);

  if (sanitized.length > 0 && !sanitized.startsWith("http://") && !sanitized.startsWith("https://") && !invalidScheme) {
    processedUrl = `https://${sanitized}`;
  }

  try {
    parsedUrl = new URL(processedUrl);
  } catch {
    parsedUrl = null;
  }

  if (parsedUrl && (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:")) {
    domain = parsedUrl.hostname.toLowerCase();
    isHTTPS = parsedUrl.protocol === "https:";
  } else if (invalidScheme) {
    domain = "unsupported-scheme";
    isHTTPS = false;
  } else {
    const fallbackDomain = sanitized.split("/")[0].toLowerCase();
    domain = /^[a-z0-9.-]+$/i.test(fallbackDomain) ? fallbackDomain : "unknown";
  }

  let riskScore = 0;
  const indicators: URLIndicator[] = [];
  const reasons: string[] = [];
  const threatCategories: string[] = [];

  if (invalidScheme || domain === "unknown") {
    riskScore += 25;
    reasons.push("Input could not be parsed as a valid web address and may be malformed.");
    indicators.push({
      type: "medium",
      category: "URL Structure",
      title: "Malformed or Unsupported URL",
      description: "The provided input is not a valid HTTP/HTTPS URL and may be unsafe to visit.",
    });
  }

  // 1. Check IP address
  const isIPAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(domain);
  if (isIPAddress) {
    riskScore += 35;
    reasons.push("Direct IP address URL used instead of a registered domain name.");
    indicators.push({
      type: "high",
      category: "URL Structure",
      title: "Direct IP Address Link",
      description: "Direct IP URLs bypass standard domain reputation filters and are heavily associated with attack infrastructure.",
    });
  }

  // 2. Check URL shorteners
  const isShortened = SHORTENER_DOMAINS.includes(domain);
  if (isShortened) {
    riskScore += 25;
    reasons.push("Uses a URL shortener service that obscures the real destination website.");
    indicators.push({
      type: "medium",
      category: "URL Structure",
      title: "Obfuscated Shortened Link",
      description: "Shortened links conceal the actual web server hosting the target landing page.",
    });
  }

  // 3. Domain Analysis (Lookalikes, typosquatting)
  const domainInfo = analyzeDomain(domain);
  riskScore += domainInfo.namingScore;

  if (domainInfo.isLookalike) {
    threatCategories.push("Brand Impersonation");
    if (domainInfo.targetBrand) {
      reasons.push(`Domain impersonates ${domainInfo.targetBrand} using lookalike characters or fake security suffixes.`);
    }
    indicators.push({
      type: "high",
      category: "Domain & Typo",
      title: "Lookalike / Typosquatted Domain",
      description: `Disguised domain structure crafted to imitate ${domainInfo.targetBrand || "trusted brands"}.`,
    });
  }

  domainInfo.reasons.forEach((r) => {
    if (!reasons.includes(r)) reasons.push(r);
  });

  // 4. Keyword & Intent Checks
  const lowerUrl = processedUrl.toLowerCase();
  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((kw) => lowerUrl.includes(kw));

  if (matchedKeywords.length > 0) {
    if (domainInfo.isLookalike || isIPAddress || isShortened || riskScore >= 30) {
      riskScore += matchedKeywords.length * 15;
      threatCategories.push("Credential Harvesting Prompt");
      reasons.push(`Contains credential/verification keyword(s): "${matchedKeywords.join(", ")}".`);
      indicators.push({
        type: "high",
        category: "Keywords & Intent",
        title: "Sensitive Action Keywords",
        description: `URL contains action keywords ("${matchedKeywords.join(", ")}") targeting account access or credentials.`,
      });
    }
  }

  // 5. Random Character Heuristics (e.g., secure-login-48392-xj29.com)
  if (/[a-z0-9]{4,}-[a-z0-9]{4,}/i.test(domain) && (domain.includes("login") || domain.includes("secure"))) {
    riskScore += 20;
    reasons.push("Domain contains randomized alphanumeric strings combined with security keywords.");
    indicators.push({
      type: "medium",
      category: "Domain & Typo",
      title: "Randomized Naming Pattern",
      description: "Automated domain generation pattern detected.",
    });
  }

  // Cap Score 0-100
  riskScore = Math.min(Math.max(riskScore, 0), 100);

  // Risk Level
  let riskLevel: "Safe" | "Suspicious" | "High Risk" = "Safe";
  if (riskScore >= 71) {
    riskLevel = "High Risk";
  } else if (riskScore >= 31) {
    riskLevel = "Suspicious";
  } else {
    riskLevel = "Safe";
  }

  if (threatCategories.length === 0) {
    if (riskLevel === "High Risk") threatCategories.push("Malicious Web Destination");
    else if (riskLevel === "Suspicious") threatCategories.push("Suspicious Link");
    else threatCategories.push("Legitimate Link");
  }

  // Confidence rating
  let confidence: "High" | "Medium" | "Low" = "Low";
  if (indicators.length >= 2 || riskScore >= 71 || domainInfo.isLookalike) {
    confidence = "High";
  } else if (indicators.length >= 1 || riskScore >= 31) {
    confidence = "Medium";
  } else {
    confidence = "High";
  }

  // Positive safe indicators if clean
  if (riskLevel === "Safe") {
    reasons.push("Domain matches standard official naming conventions.");
    reasons.push("No obvious brand impersonation or typosquatting detected.");
    reasons.push("No credential harvesting prompts found in URL path.");
    indicators.push({
      type: "safe",
      category: "Protocol & Security",
      title: "Clean Domain Reputation Structure",
      description: "Domain structure exhibits standard web conventions with no malicious patterns.",
    });
  }

  // Actionable recommendations
  const recommendations: string[] = [];
  if (riskLevel === "High Risk") {
    recommendations.push("DO NOT visit this website or click the link.");
    recommendations.push("DO NOT enter any passwords, email addresses, or personal information.");
    recommendations.push("Manually type the official company domain into your web browser instead.");
    recommendations.push("Report this link to your security team or anti-phishing registry.");
  } else if (riskLevel === "Suspicious") {
    recommendations.push("Exercise extreme caution before navigating to this destination.");
    recommendations.push("Verify the sender or original context of where you received this link.");
    recommendations.push("Avoid entering any login credentials or payment details.");
  } else {
    recommendations.push("No immediate threats detected, but always verify web destinations.");
    recommendations.push("Ensure the browser displays a valid HTTPS padlock when visiting.");
  }

  return {
    url: trimmed,
    domain,
    riskScore,
    riskLevel,
    confidence,
    threatCategories,
    reasons,
    indicators,
    recommendations,
    isIPAddress,
    isShortened,
    isHTTPS,
    lookalikeBrand: domainInfo.targetBrand,
  };
}
