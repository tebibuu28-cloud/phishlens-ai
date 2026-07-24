export interface DemoURL {
  id: string;
  url: string;
  label: string;
  category: "Safe" | "Suspicious" | "High Risk";
  description: string;
}

export const DEMO_URLS: DemoURL[] = [
  {
    id: "chatgpt",
    url: "https://chatgpt.com",
    label: "ChatGPT Official",
    category: "Safe",
    description: "Official OpenAI ChatGPT web application URL.",
  },
  {
    id: "github",
    url: "https://github.com",
    label: "GitHub Official",
    category: "Safe",
    description: "Official GitHub developer platform domain.",
  },
  {
    id: "google",
    url: "https://google.com",
    label: "Google Official",
    category: "Safe",
    description: "Official Google search engine homepage domain.",
  },
  {
    id: "micros0ft-fake",
    url: "https://micros0ft-security-login.com",
    label: "Microsoft Lookalike Phish",
    category: "High Risk",
    description: "Typosquatted domain using 0 instead of o to harvest Microsoft 365 credentials.",
  },
  {
    id: "paypa1-fake",
    url: "https://paypa1-verification.com",
    label: "PayPal Impersonation",
    category: "High Risk",
    description: "Character substitution replacing l with 1 to spoof PayPal account verification.",
  },
  {
    id: "google-alert-fake",
    url: "https://google-security-alert-login.com",
    label: "Google Alert Impersonation",
    category: "High Risk",
    description: "Fake security alert domain appending login keywords onto Google's name.",
  },
];
