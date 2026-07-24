export interface URLIndicator {
  type: "high" | "medium" | "low" | "safe";
  category: "Domain & Typo" | "URL Structure" | "Keywords & Intent" | "Protocol & Security";
  title: string;
  description: string;
}

export interface URLAnalysisResult {
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: "Safe" | "Suspicious" | "High Risk";
  confidence: "High" | "Medium" | "Low";
  threatCategories: string[];
  reasons: string[];
  indicators: URLIndicator[];
  recommendations: string[];
  isIPAddress: boolean;
  isShortened: boolean;
  isHTTPS: boolean;
  lookalikeBrand?: string;
}
