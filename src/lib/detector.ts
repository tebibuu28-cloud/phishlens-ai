import type { ParsedEmail, HighlightItem } from "./parser";

export interface ExplanationReason {
  category: "Domain & Sender" | "Urgency & Phrasing" | "Fear & Threats" | "Credentials & Fraud" | "Links & Artifacts" | "Attachments" | "Grammar & Formatting";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface AnalysisResult {
  score: number;
  confidence: "High" | "Medium" | "Low";
  riskLevel: "Safe" | "Suspicious" | "High Risk";
  threatCategory: string;
  reasons: string[];
  structuredReasons: ExplanationReason[];
  recommendations: string[];
  highlights: HighlightItem[];
  senderDomain: string;
  shortenedUrlCount: number;
  ipUrlCount: number;
  suspiciousDomainMismatch: boolean;
}

// 1. Urgency Tactics
const URGENCY_KEYWORDS = [
  { phrase: "urgent", weight: 15, title: "Urgency phrase used" },
  { phrase: "account suspended", weight: 25, title: "Account suspension warning" },
  { phrase: "verify immediately", weight: 20, title: "Immediate verification demand" },
  { phrase: "immediate action required", weight: 20, title: "Urgent action directive" },
  { phrase: "within 24 hours", weight: 15, title: "Tight artificial deadline" },
  { phrase: "act now", weight: 10, title: "Pressure phrase" },
  { phrase: "final notice", weight: 15, title: "Ultimatum warning" },
];

// 2. Fear Tactics
const FEAR_KEYWORDS = [
  { phrase: "legal action", weight: 25, title: "Legal action threat" },
  { phrase: "security warning", weight: 15, title: "Fear-inducing security alert" },
  { phrase: "unauthorized access", weight: 20, title: "Unauthorized breach claim" },
  { phrase: "account termination", weight: 25, title: "Account termination warning" },
  { phrase: "law enforcement", weight: 30, title: "Authority impersonation threat" },
];

// 3. Credential Requests
const CREDENTIAL_KEYWORDS = [
  { phrase: "password", weight: 15, title: "Password field requested" },
  { phrase: "login", weight: 15, title: "Login prompt detected" },
  { phrase: "verification", weight: 15, title: "Account verification request" },
  { phrase: "account confirmation", weight: 20, title: "Confirmation lure" },
  { phrase: "verify account", weight: 25, title: "Account credential verification prompt" },
  { phrase: "reset password", weight: 20, title: "Password reset request" },
  { phrase: "confirm identity", weight: 20, title: "Identity confirmation prompt" },
];

// 4. Financial & Fraud Keywords
const FINANCIAL_KEYWORDS = [
  { phrase: "overdue invoice", weight: 20, title: "Unpaid invoice claim" },
  { phrase: "wire transfer", weight: 25, title: "Direct funds transfer directive" },
  { phrase: "gift card", weight: 25, title: "Untraceable payment demand" },
  { phrase: "crypto", weight: 20, title: "Cryptocurrency demand" },
  { phrase: "bank details", weight: 20, title: "Banking credentials request" },
  { phrase: "unrecognized charge", weight: 15, title: "Fake billing alert" },
];

export function analyzeEmail(email: ParsedEmail): AnalysisResult {
  let score = 0;
  const reasons: string[] = [];
  const structuredReasons: ExplanationReason[] = [];
  const recommendations: string[] = [];
  const highlights: HighlightItem[] = [];

  const textToAnalyze = `${email.subject} ${email.body}`.toLowerCase();

  // 1. Sender & Domain Spoofing Analysis
  if (email.hasDisplayNameSpoofing) {
    score += 35;
    const msg = `Sender domain is impersonating ${email.displayName} (actual address: ${email.senderEmail}).`;
    reasons.push(msg);
    structuredReasons.push({
      category: "Domain & Sender",
      title: "Display Name Impersonation",
      description: msg,
      severity: "high",
    });
    highlights.push({
      text: email.displayName,
      type: "spoof",
      explanation: `Display name impersonation: claims to be ${email.displayName} but originates from domain ${email.senderDomain}.`,
    });
  }

  if (email.hasReplyToMismatch) {
    score += 25;
    const msg = `Reply-To domain (${email.replyToDomain}) differs from Sender domain (${email.senderDomain}).`;
    reasons.push(msg);
    structuredReasons.push({
      category: "Domain & Sender",
      title: "Domain Mismatch",
      description: msg,
      severity: "high",
    });
    if (email.replyTo) {
      highlights.push({
        text: email.replyTo,
        type: "email",
        explanation: "Domain mismatch: replies will be sent to a different address.",
      });
    }
  }

  if (email.lookalikeDomains.length > 0) {
    score += 30;
    const msg = `Link redirects to lookalike domain (${email.lookalikeDomains.join(", ")}).`;
    reasons.push(msg);
    structuredReasons.push({
      category: "Domain & Sender",
      title: "Lookalike Domain Detected",
      description: msg,
      severity: "high",
    });
    email.lookalikeDomains.forEach((domain) => {
      highlights.push({
        text: domain,
        type: "domain",
        explanation: "Lookalike domain: designed to visually resemble legitimate services.",
      });
    });
  }

  // 2. Language Tactics Analysis
  // Urgency
  URGENCY_KEYWORDS.forEach(({ phrase, weight, title }) => {
    if (textToAnalyze.includes(phrase)) {
      score += weight;
      const msg = `Email creates urgency ("${phrase}").`;
      if (!reasons.includes(msg)) reasons.push(msg);
      structuredReasons.push({
        category: "Urgency & Phrasing",
        title,
        description: msg,
        severity: weight >= 20 ? "high" : "medium",
      });
      highlights.push({
        text: phrase,
        type: "urgency",
        explanation: `Urgency tactic: "${phrase}" pressures the recipient to act quickly.`,
      });
    }
  });

  // Fear
  FEAR_KEYWORDS.forEach(({ phrase, weight, title }) => {
    if (textToAnalyze.includes(phrase)) {
      score += weight;
      const msg = `Uses fear tactics ("${phrase}").`;
      if (!reasons.includes(msg)) reasons.push(msg);
      structuredReasons.push({
        category: "Fear & Threats",
        title,
        description: msg,
        severity: "high",
      });
      highlights.push({
        text: phrase,
        type: "urgency",
        explanation: `Fear tactic: "${phrase}" uses threat or legal intimidation.`,
      });
    }
  });

  // Credentials
  CREDENTIAL_KEYWORDS.forEach(({ phrase, weight, title }) => {
    if (textToAnalyze.includes(phrase)) {
      score += weight;
      const msg = `Requests account verification / credential input ("${phrase}").`;
      if (!reasons.includes(msg)) reasons.push(msg);
      structuredReasons.push({
        category: "Credentials & Fraud",
        title,
        description: msg,
        severity: "high",
      });
      highlights.push({
        text: phrase,
        type: "credential",
        explanation: `Credential theft indicator: "${phrase}" attempts to collect login information.`,
      });
    }
  });

  // Financial
  FINANCIAL_KEYWORDS.forEach(({ phrase, weight, title }) => {
    if (textToAnalyze.includes(phrase)) {
      score += weight;
      const msg = `Requests payment / invoice processing ("${phrase}").`;
      if (!reasons.includes(msg)) reasons.push(msg);
      structuredReasons.push({
        category: "Credentials & Fraud",
        title,
        description: msg,
        severity: "medium",
      });
      highlights.push({
        text: phrase,
        type: "credential",
        explanation: `Financial request: "${phrase}" involves payment details or funds.`,
      });
    }
  });

  // Highlight Phone Numbers
  email.phoneNumbers.forEach((phone) => {
    highlights.push({
      text: phone,
      type: "phone",
      explanation: "Phone number detected: fake support lines are commonly used in vishing scams.",
    });
  });

  // 3. Link & Artifact Checks
  const shortenedDomains = ["bit.ly", "tinyurl.com", "t.co", "ow.ly", "is.gd", "buff.ly"];
  const shortenedUrls = email.urls.filter((url) => shortenedDomains.some((sd) => url.includes(sd)));
  if (shortenedUrls.length > 0) {
    score += 25;
    const msg = `Link redirects to shortened / obfuscated URL.`;
    reasons.push(msg);
    structuredReasons.push({
      category: "Links & Artifacts",
      title: "Shortened Link Redirect",
      description: msg,
      severity: "medium",
    });
    shortenedUrls.forEach((url) => {
      highlights.push({
        text: url,
        type: "url",
        explanation: "Shortened link conceals the actual destination domain.",
      });
    });
  }

  const ipUrlCount = email.ipUrls.length;
  if (ipUrlCount > 0) {
    score += 30;
    const msg = `Link redirects to suspicious IP-based address (${email.ipUrls[0]}).`;
    reasons.push(msg);
    structuredReasons.push({
      category: "Links & Artifacts",
      title: "IP-based Address Link",
      description: msg,
      severity: "high",
    });
    email.ipUrls.forEach((url) => {
      highlights.push({
        text: url,
        type: "url",
        explanation: "Direct IP address URL bypassing domain name safety checks.",
      });
    });
  }

  email.urls.forEach((url) => {
    if (!shortenedUrls.includes(url) && !email.ipUrls.includes(url)) {
      highlights.push({
        text: url,
        type: "url",
        explanation: "Extracted URL link.",
      });
    }
  });

  // 4. Attachments
  const suspiciousAttachments = email.attachments.filter((a) => a.isSuspicious);
  if (suspiciousAttachments.length > 0) {
    score += 35;
    const names = suspiciousAttachments.map((a) => a.filename).join(", ");
    const msg = `Contains high-risk file attachment (${names}).`;
    reasons.push(msg);
    structuredReasons.push({
      category: "Attachments",
      title: "Suspicious Attachment",
      description: msg,
      severity: "high",
    });
    suspiciousAttachments.forEach((att) => {
      highlights.push({
        text: att.filename,
        type: "attachment",
        explanation: `Suspicious attachment (.${att.extension}) used to drop malicious payloads.`,
      });
    });
  }

  // 5. Grammar & Formatting Anomalies
  if (email.grammarAnomalies.length > 0) {
    score += 15;
    email.grammarAnomalies.forEach((anomaly) => {
      reasons.push(anomaly);
      structuredReasons.push({
        category: "Grammar & Formatting",
        title: "Grammatical Anomaly",
        description: anomaly,
        severity: "low",
      });
    });
  }

  // 6. Score Mapping & Risk Level (0-30 Low, 31-70 Suspicious, 71-100 High Risk)
  score = Math.min(Math.max(score, 0), 100);

  let riskLevel: "Safe" | "Suspicious" | "High Risk" = "Safe";
  if (score >= 71) {
    riskLevel = "High Risk";
  } else if (score >= 31) {
    riskLevel = "Suspicious";
  } else {
    riskLevel = "Safe";
  }

  // Threat Category classification
  let threatCategory = "Clean Email";
  if (email.hasDisplayNameSpoofing || email.hasReplyToMismatch || email.lookalikeDomains.length > 0) {
    threatCategory = "Credential Harvesting / Brand Impersonation";
  } else if (suspiciousAttachments.length > 0) {
    threatCategory = "Malware Attachment Vector";
  } else if (score >= 71) {
    threatCategory = "Social Engineering / Phishing Attack";
  } else if (score >= 31) {
    threatCategory = "Suspicious Communication";
  }

  // Confidence calculation
  let confidence: "High" | "Medium" | "Low" = "Low";
  if (structuredReasons.length >= 3 || score >= 71) {
    confidence = "High";
  } else if (structuredReasons.length >= 1 || score >= 31) {
    confidence = "Medium";
  }

  // Actionable recommendations
  if (riskLevel === "Safe") {
    recommendations.push("Verify the sender's email address matches the claimed organization.");
    recommendations.push("Ensure links point to legitimate domains before clicking.");
  } else if (riskLevel === "Suspicious") {
    recommendations.push("Do not click any embedded links or open attached files.");
    recommendations.push("Verify this communication through an official phone number or website.");
    recommendations.push("Report this message to your security team or IT helpdesk.");
  } else {
    recommendations.push("DO NOT click any links or download any attachments.");
    recommendations.push("DO NOT reply or call any phone numbers listed in the email.");
    recommendations.push("Report as phishing immediately in your email client and delete the message.");
    recommendations.push("If credentials were submitted, change your passwords immediately.");
  }

  return {
    score,
    confidence,
    riskLevel,
    threatCategory,
    reasons,
    structuredReasons,
    recommendations,
    highlights,
    senderDomain: email.senderDomain,
    shortenedUrlCount: shortenedUrls.length,
    ipUrlCount,
    suspiciousDomainMismatch: email.hasReplyToMismatch || email.hasDisplayNameSpoofing,
  };
}
