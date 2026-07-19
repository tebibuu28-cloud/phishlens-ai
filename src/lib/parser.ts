export interface ParsedEmail {
  sender: string;
  subject: string;
  date: string;
  body: string;
  urls: string[];
  emails: string[];
  domains: string[];
}

export function parseEmail(rawContent: string): ParsedEmail {
  // 1. Separate headers and body
  // Emails typically separate headers and body with a double newline
  const splitPoint = rawContent.indexOf('\n\n') !== -1 ? rawContent.indexOf('\n\n') : rawContent.indexOf('\r\n\r\n');
  
  let headers = rawContent;
  let body = "";
  
  if (splitPoint !== -1) {
    headers = rawContent.substring(0, splitPoint);
    body = rawContent.substring(splitPoint).trim();
  } else {
    // If we can't find a clear split, we'll just treat the whole thing as body and try to extract what we can
    body = rawContent;
  }

  // 2. Extract Headers using Regex
  const senderMatch = headers.match(/^From:\s*(.*)$/im);
  const subjectMatch = headers.match(/^Subject:\s*(.*)$/im);
  const dateMatch = headers.match(/^Date:\s*(.*)$/im);

  const sender = senderMatch ? senderMatch[1].trim() : "Unknown Sender";
  const subject = subjectMatch ? subjectMatch[1].trim() : "No Subject";
  const date = dateMatch ? dateMatch[1].trim() : "Unknown Date";

  // 3. Extract artifacts from body
  // URL Regex (matches http, https, and www)
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  const urls = Array.from(body.matchAll(urlRegex)).map(m => m[0]);

  // Email Regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emails = Array.from(body.matchAll(emailRegex)).map(m => m[0]);
  
  // Also check sender for email address if it's in a format like "Name <email@domain.com>"
  if (sender !== "Unknown Sender") {
    const senderEmailMatch = sender.match(emailRegex);
    if (senderEmailMatch) {
      emails.push(...senderEmailMatch);
    }
  }

  // Deduplicate URLs and Emails
  const uniqueUrls = [...new Set(urls)];
  const uniqueEmails = [...new Set(emails)];

  // 4. Extract Domains from URLs and Emails
  const domains: string[] = [];
  
  uniqueUrls.forEach(url => {
    try {
      // Add http protocol if missing for URL parsing
      const urlToParse = url.startsWith('http') ? url : `http://${url}`;
      const urlObj = new URL(urlToParse);
      domains.push(urlObj.hostname);
    } catch (e) {
      // Ignore invalid URLs
    }
  });

  uniqueEmails.forEach(email => {
    const parts = email.split('@');
    if (parts.length === 2) {
      domains.push(parts[1]);
    }
  });

  const uniqueDomains = [...new Set(domains)];

  return {
    sender,
    subject,
    date,
    body,
    urls: uniqueUrls,
    emails: uniqueEmails,
    domains: uniqueDomains
  };
}
