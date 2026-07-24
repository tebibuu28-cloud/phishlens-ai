const KNOWN_BRANDS: Record<string, string[]> = {
  microsoft: ["microsoft", "msft", "office365", "m365", "azure", "outlook", "hotmail"],
  paypal: ["paypal", "pypl"],
  google: ["google", "gmail", "gsuite", "googlecloud"],
  apple: ["apple", "icloud", "itunes"],
  amazon: ["amazon", "aws"],
  netflix: ["netflix"],
  bankofamerica: ["bankofamerica", "bofa"],
  wellsfargo: ["wellsfargo"],
  chase: ["chase", "jpmorgan"],
  dhl: ["dhl"],
  fedex: ["fedex"],
  ups: ["ups"],
  linkedin: ["linkedin"],
  facebook: ["facebook", "meta", "instagram"],
};

export interface DomainAnalysis {
  isLookalike: boolean;
  targetBrand?: string;
  isIP: boolean;
  subdomainCount: number;
  hyphenCount: number;
  digitCount: number;
  namingScore: number;
  reasons: string[];
}

export function analyzeDomain(domain: string): DomainAnalysis {
  const lower = domain.toLowerCase();
  const reasons: string[] = [];
  let isLookalike = false;
  let targetBrand: string | undefined;

  // 1. IP Address check
  const isIP = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(lower);
  if (isIP) {
    reasons.push("Domain uses a raw IPv4 address rather than a registered domain name.");
  }

  // 2. Character counts
  const parts = lower.split(".");
  const subdomainCount = Math.max(parts.length - 2, 0);
  const hyphenCount = (lower.match(/-/g) || []).length;
  const digitCount = (lower.match(/\d/g) || []).length;

  if (subdomainCount >= 3) {
    reasons.push(`Contains an excessive number of subdomains (${subdomainCount} subdomains).`);
  }
  if (hyphenCount >= 3) {
    reasons.push(`Domain contains ${hyphenCount} hyphens, commonly used to craft fake legitimate-looking links.`);
  }

  // 3. Typosquatting / Character Substitution Check (0->o, 1->l, 5->s, 3->e, v->u)
  const sanitized = lower
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/5/g, "s")
    .replace(/3/g, "e")
    .replace(/vv/g, "w");

  for (const [brand, keywords] of Object.entries(KNOWN_BRANDS)) {
    for (const kw of keywords) {
      if (sanitized.includes(kw) && !lower.includes(kw)) {
        isLookalike = true;
        targetBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
        reasons.push(`Domain uses character substitution (e.g. 0 instead of o) to impersonate ${targetBrand}.`);
        break;
      }
      // Check brand combined with security words e.g. google-security-alert-login.com
      if (lower.includes(kw) && (lower.includes("security") || lower.includes("verify") || lower.includes("alert") || lower.includes("login"))) {
        const isOfficial = lower === `${kw}.com` || lower.endsWith(`.${kw}.com`) || lower.endsWith(`.${kw}.org`);
        if (!isOfficial) {
          isLookalike = true;
          targetBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
          reasons.push(`Appends security keywords onto the brand name "${kw}" outside of its official domain.`);
        }
      }
    }
    if (isLookalike) break;
  }

  let namingScore = 0;
  if (isIP) namingScore += 35;
  if (isLookalike) namingScore += 40;
  if (subdomainCount >= 3) namingScore += 15;
  if (hyphenCount >= 2) namingScore += 15;

  return {
    isLookalike,
    targetBrand,
    isIP,
    subdomainCount,
    hyphenCount,
    digitCount,
    namingScore,
    reasons,
  };
}
