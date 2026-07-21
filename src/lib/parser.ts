export interface ParsedEmail {
  sender: string;
  senderDomain: string;
  subject: string;
  date: string;
  body: string;
  urls: string[];
  emails: string[];
  domains: string[];
  ipUrls: string[];
}

export function parseEmail(rawContent: string): ParsedEmail {
  // 1. Separate headers and body
  const doubleNewLineIndex = rawContent.indexOf("\n\n");
  const windowsNewLineIndex = rawContent.indexOf("\r\n\r\n");

  let splitPoint = -1;

  if (doubleNewLineIndex !== -1) {
    splitPoint = doubleNewLineIndex;
  } else if (windowsNewLineIndex !== -1) {
    splitPoint = windowsNewLineIndex;
  }

  let headers = rawContent;
  let body = "";

  if (splitPoint !== -1) {
    headers = rawContent.substring(0, splitPoint);
    body = rawContent.substring(splitPoint).trim();
  } else {
    body = rawContent;
  }

  // 2. Extract email headers
  const senderMatch = headers.match(/^From:\s*(.*)$/im);
  const subjectMatch = headers.match(/^Subject:\s*(.*)$/im);
  const dateMatch = headers.match(/^Date:\s*(.*)$/im);

  const sender = senderMatch
    ? senderMatch[1].trim()
    : "Unknown Sender";

  const emailRegex =
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

  const senderEmailMatch = sender.match(emailRegex);
  const senderDomain = senderEmailMatch && senderEmailMatch[0].includes("@")
    ? senderEmailMatch[0].split("@")[1].toLowerCase()
    : "unknown";

  const subject = subjectMatch
    ? subjectMatch[1].trim()
    : "No Subject";

  const date = dateMatch
    ? dateMatch[1].trim()
    : "Unknown Date";


  // 3. Extract URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

  const urls = Array.from(body.matchAll(urlRegex))
    .map((match) => match[0]);


  // 4. Extract emails
  const emails = Array.from(body.matchAll(emailRegex))
    .map((match) => match[0]);


  // Check sender for email address
  if (sender !== "Unknown Sender") {
    const senderEmailMatch = sender.match(emailRegex);

    if (senderEmailMatch) {
      emails.push(...senderEmailMatch);
    }
  }


  // 5. Remove duplicates
  const uniqueUrls = [...new Set(urls)];
  const uniqueEmails = [...new Set(emails)];


  // 6. Extract domains
  const domains: string[] = [];
  const ipUrls: string[] = [];


  uniqueUrls.forEach((url) => {
    try {
      const urlToParse = url.startsWith("http")
        ? url
        : `http://${url}`;

      const urlObj = new URL(urlToParse);
      const hostname = urlObj.hostname.toLowerCase();

      domains.push(hostname);

      if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
        ipUrls.push(url);
      }
    } catch {
      // Ignore invalid URLs
    }
  });


  uniqueEmails.forEach((email) => {
    const parts = email.split("@");

    if (parts.length === 2) {
      domains.push(parts[1]);
    }
  });


  const uniqueDomains = [...new Set(domains)];


  // 7. Return parsed email object
  return {
    sender,
    senderDomain,
    subject,
    date,
    body,
    urls: uniqueUrls,
    emails: uniqueEmails,
    domains: uniqueDomains,
    ipUrls,
  };
}