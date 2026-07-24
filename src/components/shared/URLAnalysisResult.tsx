import { ShieldAlert, AlertTriangle, CheckCircle2, Globe, Copy, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import type { URLAnalysisResult } from "@/lib/urlTypes";

interface URLAnalysisResultProps {
  result: URLAnalysisResult;
  onReset?: () => void;
}

export function URLAnalysisResultView({ result, onReset }: URLAnalysisResultProps) {
  const { url, domain, riskScore, riskLevel, confidence, threatCategories, reasons, indicators, recommendations, lookalikeBrand, isIPAddress, isShortened } = result;

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      alert("URL Security Report copied to clipboard.");
    } catch {
      alert("Unable to copy report.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1">
            <span>Link Security Analysis</span>
            <span>/</span>
            <span className="text-white">{domain}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" /> Domain & Link Intelligence
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={copyReport} variant="outline" size="sm" className="border-border/60 text-slate-300 text-xs">
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy JSON
          </Button>
          {onReset && (
            <Button onClick={onReset} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
              Analyze Another Link
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Risk Gauge & Domain Stats */}
        <div className="space-y-6">
          {/* Risk Score Card */}
          <Card className="glass flex flex-col items-center justify-center p-6 text-center border-border/50 shadow-2xl">
            <RiskScoreGauge score={riskScore} />
            <div className="mt-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">{riskLevel}</h3>
                <Badge variant="outline" className="text-xs font-mono border-border/60">
                  {riskScore}/100
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {riskLevel === "Safe" && "This link exhibits standard official domain patterns with no malicious indicators."}
                {riskLevel === "Suspicious" && "Exhibits several questionable structural patterns requiring caution."}
                {riskLevel === "High Risk" && "High confidence brand impersonation or malicious link redirect."}
              </p>
            </div>
          </Card>

          {/* Domain Breakdown */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">
                Domain Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Target Hostname</p>
                <p className="font-mono text-white bg-background/50 p-2 rounded border border-border/50 break-all">
                  {domain}
                </p>
              </div>

              {lookalikeBrand && (
                <div>
                  <p className="text-muted-foreground mb-1">Impersonated Brand</p>
                  <p className="font-mono text-rose-300 bg-rose-500/10 p-2 rounded border border-rose-500/30 font-semibold">
                    {lookalikeBrand}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-background/40 p-2 rounded border border-border/40 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Shortened URL</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{isShortened ? "Yes (Flagged)" : "No"}</p>
                </div>
                <div className="bg-background/40 p-2 rounded border border-border/40 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">IP Hostname</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{isIPAddress ? "Yes (High Risk)" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Explanation, Threat Indicators & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Security Explanation */}
          <Card className="glass border-border/60 shadow-xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              riskLevel === "High Risk" ? "bg-rose-500" : riskLevel === "Suspicious" ? "bg-amber-500" : "bg-emerald-500"
            }`} />

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className={`w-5 h-5 ${
                    riskLevel === "High Risk" ? "text-rose-400" : riskLevel === "Suspicious" ? "text-amber-400" : "text-emerald-400"
                  }`} />
                  Security Assessment
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background/60 text-muted-foreground border-border text-xs">
                    Confidence: <span className="text-white ml-1 font-semibold">{confidence}</span>
                  </Badge>
                  {threatCategories.map((cat, i) => (
                    <Badge key={i} className={`${
                      riskLevel === "High Risk" ? "bg-rose-500/20 text-rose-300 border-rose-500/40" :
                      riskLevel === "Suspicious" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                      "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    } border text-xs`}>
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-background/50 border border-border/50 font-mono break-all text-slate-200">
                <span className="text-muted-foreground font-sans mr-2">Analyzed Link:</span>
                <span>{url}</span>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-white text-sm">Why PhishLens Flagged This Link:</p>
                <ul className="space-y-2">
                  {reasons.map((reason, i) => (
                    <li key={i} className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs leading-relaxed ${
                      riskLevel === "High Risk" ? "bg-rose-500/10 border-rose-500/20 text-rose-200" :
                      riskLevel === "Suspicious" ? "bg-amber-500/10 border-amber-500/20 text-amber-200" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                    }`}>
                      {riskLevel === "Safe" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Threat Indicators Breakdown */}
          {indicators.length > 0 && (
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-400" /> Threat Indicators Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {indicators.map((ind, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background/40 border border-border/40 space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            ind.type === "high" ? "bg-rose-400" : ind.type === "medium" ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                          {ind.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {ind.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed pl-4">
                        {ind.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Recommended Actions Checklist */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Actionable Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 bg-background/40 p-2.5 rounded border border-border/40">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                      riskLevel === "High Risk" ? "text-rose-400" : "text-emerald-400"
                    }`} />
                    <span className="leading-normal">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
