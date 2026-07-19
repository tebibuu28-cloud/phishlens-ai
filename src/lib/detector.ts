import { ParsedEmail } from "./parser";

export interface AnalysisResult {
  score: number; // 0 to 100
  riskLevel: "Safe" | "Suspicious" | "High Risk";
  reasons: string[];
  recommendations: string[];
}

// Heuristic keyword weights (Word: Risk Score)
const URGENCY_KEYWORDS = [
  "urgent", "immediate action required", "suspended", "act now", "within 24 hours", 
  "final notice", "alert", "attention required", "failure to respond"
];

const FINANCIAL_KEYWORDS = [
  "invoice", "payment over-due", "crypto", "bitcoin", "gift card", "lottery",
  "wire transfer", "bank details", "reward", "cash prize", "unpaid"
];

const CREDENTIAL_KEYWORDS = [
  "verify account", "reset password", "login", "update your details", 
  "security update", "confirm your identity", "validate", "credential"
];

export function analyzeEmail(email: ParsedEmail): AnalysisResult {
  let score = 0;
  const reasons: string[] = [];
  const recommendations: string[] = [];

  const textToAnalyze = `${email.subject} ${email.body}`.toLowerCase();

  // 1. Analyze Keywords
  let urgencyCount = 0;
  URGENCY_KEYWORDS.forEach(keyword => {
    if (textToAnalyze.includes(keyword)) {
      score += 15;
      urgencyCount++;
    }
  });
  if (urgencyCount > 0) {
    reasons.push(`Detected ${urgencyCount} urgency/fear trigger(s). Phishing often creates a false sense of urgency.`);
  }

  let financialCount = 0;
  FINANCIAL_KEYWORDS.forEach(keyword => {
    if (textToAnalyze.includes(keyword)) {
      score += 20;
      financialCount++;
    }
  });
  if (financialCount > 0) {
    reasons.push(`Detected ${financialCount} financial/reward keyword(s). Scams often involve money, invoices, or fake prizes.`);
  }

  let credentialCount = 0;
  CREDENTIAL_KEYWORDS.forEach(keyword => {
    if (textToAnalyze.includes(keyword)) {
      score += 25;
      credentialCount++;
    }
  });
  if (credentialCount > 0) {
    reasons.push(`Detected ${credentialCount} credential theft keyword(s). Legitimate companies rarely ask you to verify accounts via email links.`);
  }

  // 2. Analyze Links
  if (email.urls.length > 3) {
    score += 10;
    reasons.push(`Email contains a high number of links (${email.urls.length}).`);
  }
  
  // Check for shortened URLs (simple heuristic)
  const shortenedDomains = ["bit.ly", "tinyurl.com", "t.co", "ow.ly"];
  const hasShortenedUrls = email.domains.some(domain => shortenedDomains.includes(domain));
  if (hasShortenedUrls) {
    score += 30;
    reasons.push("Contains shortened URLs, which are frequently used to hide malicious destinations.");
  }

  // 3. Formatting Anomalies
  // Check for excessive ALL CAPS words
  const allCapsWords = email.body.match(/\b[A-Z]{5,}\b/g) || [];
  if (allCapsWords.length > 2) {
    score += 10;
    reasons.push("Contains excessive capital letters, a common trait in unprofessional or spam emails.");
  }

  // 4. Calculate Final Risk
  // Cap score at 100
  score = Math.min(score, 100);

  let riskLevel: "Safe" | "Suspicious" | "High Risk" = "Safe";
  if (score >= 60) {
    riskLevel = "High Risk";
  } else if (score >= 30) {
    riskLevel = "Suspicious";
  }

  // 5. Generate Recommendations
  if (riskLevel === "Safe") {
    recommendations.push("The email appears generally safe, but always verify the sender's actual email address.");
    recommendations.push("Do not click links if you were not expecting this email.");
  } else if (riskLevel === "Suspicious") {
    recommendations.push("Proceed with caution. Do not download any attachments.");
    recommendations.push("Instead of clicking links, manually navigate to the company's official website in your browser.");
  } else {
    recommendations.push("DO NOT click any links or download attachments.");
    recommendations.push("DO NOT reply to the sender.");
    recommendations.push("Mark this email as Spam/Phishing in your email client and delete it immediately.");
  }

  return {
    score,
    riskLevel,
    reasons,
    recommendations
  };
}
