export interface ParsedAttachment {
  filename: string;
  extension: string;
  isSuspicious: boolean;
}

export interface HighlightItem {
  text: string;
  type: "url" | "domain" | "email" | "urgency" | "credential" | "phone" | "spoof" | "attachment";
  explanation: string;
}

export interface ParsedEmail {
  sender: string;
  displayName: string;
  senderEmail: string;
  senderDomain: string;
  replyTo?: string;
  replyToDomain?: string;
  subject: string;
  date: string;
  body: string;
  urls: string[];
  emails: string[];
  domains: string[];
  ipUrls: string[];
  phoneNumbers: string[];
  attachments: ParsedAttachment[];
  hasDisplayNameSpoofing: boolean;
  hasReplyToMismatch: boolean;
  lookalikeDomains: string[];
  grammarAnomalies: string[];
}

const DANGEROUS_EXTENSIONS = [
  "exe", "scr", "vbs", "bat", "cmd", "js", "jse", "wsf", "wsh", "ps1",
  "iso", "img", "dmg", "zip", "rar", "7z", "tar", "gz", "docm", "xlsm", "pptm", "htm", "html"
];

const KNOWN_BRANDS = [
  "microsoft", "paypal", "google", "apple", "amazon", "netflix", "bankofamerica",
  "wellsfargo", "chase", "dhl", "fedex", "ups", "linkedin", "meta", "facebook", "instagram"
];

const MAX_INPUT_LENGTH = 500000; // 500k chars max to prevent ReDoS / CPU lockup
const MAX_BODY_LENGTH = 200000; // Bound body text for highlights and analysis
const MAX_HEADER_VALUE_LENGTH = 2048; // Prevent malformed header injection
const MAX_MATCHED_ITEMS = 300;

function sanitizeText(value: string, maxLength = MAX_HEADER_VALUE_LENGTH): string {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .trim()
    .substring(0, maxLength);
}

function matchAllSafe(regex: RegExp, text: string, limit = MAX_MATCHED_ITEMS): RegExpMatchArray[] {
  const clone = new RegExp(regex.source, regex.flags);
  const matches: RegExpMatchArray[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = clone.exec(text)) !== null && matches.length < limit) {
    matches.push(match);
    if (match[0].length === 0) {
      clone.lastIndex += 1;
    }
  }

  return matches;
}

export function parseEmail(rawContent: string): ParsedEmail {
  // Clamp input size defensively and remove control characters
  const trimmedContent = String(rawContent || "").substring(0, MAX_INPUT_LENGTH);
  const safeContent = trimmedContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

  // 1. Separate headers and body
  const doubleNewLineIndex = safeContent.indexOf("\n\n");
  const windowsNewLineIndex = safeContent.indexOf("\r\n\r\n");

  let splitPoint = -1;
  if (doubleNewLineIndex !== -1 && windowsNewLineIndex !== -1) {
    splitPoint = Math.min(doubleNewLineIndex, windowsNewLineIndex);
  } else if (doubleNewLineIndex !== -1) {
    splitPoint = doubleNewLineIndex;
  } else if (windowsNewLineIndex !== -1) {
    splitPoint = windowsNewLineIndex;
  }

  let headers = safeContent;
  let body = "";

  if (splitPoint !== -1) {
    const delimiterLength = safeContent.startsWith("\r\n\r\n", splitPoint) ? 4 : 2;
    headers = safeContent.substring(0, splitPoint);
    body = safeContent.substring(splitPoint + delimiterLength).trim();
  } else {
    body = safeContent;
  }

  body = sanitizeText(body, MAX_BODY_LENGTH);

  // 2. Extract email headers
  const senderMatch = headers.match(/^From:\s*(.*)$/im);
  const replyToMatch = headers.match(/^Reply-To:\s*(.*)$/im);
  const subjectMatch = headers.match(/^Subject:\s*(.*)$/im);
  const dateMatch = headers.match(/^Date:\s*(.*)$/im);

  const senderRaw = senderMatch ? sanitizeText(senderMatch[1]) : "Unknown Sender";
  const replyToRaw = replyToMatch ? sanitizeText(replyToMatch[1]) : undefined;
  const subject = subjectMatch ? sanitizeText(subjectMatch[1]) : "No Subject";
  const date = dateMatch ? sanitizeText(dateMatch[1]) : "Unknown Date";

  // Parse display name vs email address
  let displayName = "";
  let senderEmail = "";
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  const emailInSender = senderRaw.match(emailRegex);
  if (emailInSender && emailInSender.length > 0) {
    senderEmail = emailInSender[0].toLowerCase();
    // Extract display name before <
    const namePart = senderRaw.replace(/<.*>/, "").replace(/"/g, "").trim();
    displayName = namePart.length > 0 ? namePart : senderEmail.split("@")[0];
  } else {
    senderEmail = senderRaw.toLowerCase();
    displayName = senderRaw;
  }

  const senderDomain = senderEmail.includes("@") ? senderEmail.split("@")[1] : "unknown";

  // Check Display Name Spoofing (e.g., Display name says "Microsoft Security" but email is "xyz@random.com")
  let hasDisplayNameSpoofing = false;
  const lowerDisplayName = displayName.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (lowerDisplayName.includes(brand) && !senderDomain.includes(brand)) {
      hasDisplayNameSpoofing = true;
      break;
    }
  }

  // Parse Reply-To header
  let replyToDomain: string | undefined;
  let hasReplyToMismatch = false;
  if (replyToRaw) {
    const replyToEmails = replyToRaw.match(emailRegex);
    if (replyToEmails && replyToEmails.length > 0) {
      const replyToEmail = replyToEmails[0].toLowerCase();
      replyToDomain = replyToEmail.split("@")[1];
      if (replyToDomain && senderDomain !== "unknown" && replyToDomain !== senderDomain) {
        hasReplyToMismatch = true;
      }
    }
  }

  // 3. Extract URLs
  const urlRegex = /(https?:\/\/[^\s<"']+)|(www\.[^\s<"']+)/gi;
  const rawUrls = matchAllSafe(urlRegex, body).map((match) => match[0]);
  const uniqueUrls = [...new Set(rawUrls)];

  // 4. Extract Emails from body
  const bodyEmails = matchAllSafe(emailRegex, body).map((match) => match[0].toLowerCase());
  if (senderEmail && senderEmail !== "unknown sender") {
    bodyEmails.push(senderEmail);
  }
  const uniqueEmails = [...new Set(bodyEmails)];

  // 5. Extract Domains & IP URLs
  const domains: string[] = [];
  const ipUrls: string[] = [];
  const lookalikeDomains: string[] = [];

  uniqueUrls.forEach((url) => {
    try {
      const urlToParse = url.startsWith("http") ? url : `http://${url}`;
      const urlObj = new URL(urlToParse);
      const hostname = urlObj.hostname.toLowerCase();
      domains.push(hostname);

      if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
        ipUrls.push(url);
      }

      // Typosquatting / Lookalike domain check (e.g. micros0ft, paypa1, g00gle)
      if (/[0-9]/.test(hostname)) {
        for (const brand of KNOWN_BRANDS) {
          const sanitizedHost = hostname.replace(/0/g, "o").replace(/1/g, "l").replace(/5/g, "s").replace(/3/g, "e");
          if (sanitizedHost.includes(brand) && !hostname.includes(brand)) {
            lookalikeDomains.push(hostname);
          }
        }
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  uniqueEmails.forEach((email) => {
    const parts = email.split("@");
    if (parts.length === 2) {
      domains.push(parts[1].toLowerCase());
    }
  });

  const uniqueDomains = [...new Set(domains)];
  const uniqueLookalikeDomains = [...new Set(lookalikeDomains)];

  // 6. Phone Numbers Extraction
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g;
  const phoneMatches = matchAllSafe(phoneRegex, body).map((match) => match[0].trim());
  const uniquePhoneNumbers = [...new Set(phoneMatches.filter((p) => p.length >= 7))];

  // 7. Parse Attachments (look in headers or body text for filename hints e.g. Attachment: invoice.exe)
  const attachments: ParsedAttachment[] = [];
  const attachmentRegex = /(?:Content-Disposition|Attachment|Attached|File):\s*(?:filename=)?["']?([a-zA-Z0-9._-]+\.([a-zA-Z0-9]+))["']?/gi;
  const attachmentMatches = matchAllSafe(attachmentRegex, safeContent, 50);
  attachmentMatches.forEach((match) => {
    const filename = match[1];
    const ext = match[2]?.toLowerCase() || "";
    attachments.push({
      filename,
      extension: ext,
      isSuspicious: DANGEROUS_EXTENSIONS.includes(ext),
    });
  });

  // 8. Grammar & Spelling Anomalies Heuristics
  const grammarAnomalies: string[] = [];
  const excessiveExclamation = (body.match(/!{2,}/g) || []).length;
  if (excessiveExclamation > 0) {
    grammarAnomalies.push(`Excessive exclamation marks (${excessiveExclamation} occurrence(s)).`);
  }

  const suspiciousCapitalization = (body.match(/\b[A-Z]{4,}\b/g) || []).length;
  if (suspiciousCapitalization > 3) {
    grammarAnomalies.push("Multiple words written in ALL CAPS to artificially induce panic.");
  }

  if (/\b(kindly|dear customer|dear user|valued client)\b/i.test(body) && hasDisplayNameSpoofing) {
    grammarAnomalies.push("Generic greeting used despite claiming to be a target brand notification.");
  }

  return {
    sender: senderRaw,
    displayName,
    senderEmail,
    senderDomain,
    replyTo: replyToRaw,
    replyToDomain,
    subject,
    date,
    body,
    urls: uniqueUrls,
    emails: uniqueEmails,
    domains: uniqueDomains,
    ipUrls,
    phoneNumbers: uniquePhoneNumbers,
    attachments,
    hasDisplayNameSpoofing,
    hasReplyToMismatch,
    lookalikeDomains: uniqueLookalikeDomains,
    grammarAnomalies,
  };
}