import { useLocation, Link } from "react-router-dom";
import { AlertTriangle, Link as LinkIcon, Copy, DownloadCloud, ArrowLeft, ShieldAlert, CheckCircle } from "lucide-react";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { ThreatExplanation } from "@/components/shared/ThreatExplanation";
import { HighlightedContent } from "@/components/shared/HighlightedContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ParsedEmail } from "@/lib/parser";
import type { AnalysisResult } from "@/lib/detector";

export function Results() {
  const location = useLocation();
  const state = location.state as { parsedData: ParsedEmail; analysisResult: AnalysisResult; savedAnalysis?: { created_at: string | null } } | null;

  if (!state) {
    return (
      <div className="container max-w-4xl mx-auto py-24 px-4 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">No Analysis Data Found</h1>
        <p className="text-muted-foreground mb-8">
          Please submit an email content or try a sample in the analyzer first.
        </p>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link to="/analyzer">Go to Analyzer</Link>
        </Button>
      </div>
    );
  }

  const { parsedData, analysisResult } = state;

  const reportPayload = {
    sender: parsedData.sender,
    senderEmail: parsedData.senderEmail,
    senderDomain: parsedData.senderDomain,
    subject: parsedData.subject,
    date: parsedData.date,
    score: analysisResult.score,
    confidence: analysisResult.confidence,
    riskLevel: analysisResult.riskLevel,
    threatCategory: analysisResult.threatCategory,
    reasons: analysisResult.reasons,
    recommendations: analysisResult.recommendations,
    urls: parsedData.urls,
    domains: parsedData.domains,
    ipUrls: parsedData.ipUrls,
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(reportPayload, null, 2));
      alert("Report copied to clipboard.");
    } catch {
      alert("Unable to copy report. Please try again.");
    }
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phishlens-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white pl-0">
              <Link to="/analyzer"><ArrowLeft className="w-4 h-4 mr-1" /> Analyzer</Link>
            </Button>
            <span className="text-border">/</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Scan Results</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Security Assessment</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Subject: <span className="text-white font-medium">{parsedData.subject}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={copyReport} variant="outline" size="sm" className="border-border/60 text-slate-300">
            <Copy className="mr-2 h-3.5 w-3.5" /> Copy JSON
          </Button>
          <Button onClick={downloadReport} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <DownloadCloud className="mr-2 h-3.5 w-3.5" /> Download JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Risk Score & Headers */}
        <div className="space-y-6">
          {/* 1. Risk Score Gauge */}
          <Card className="glass flex flex-col items-center justify-center p-8 text-center border-border/50 shadow-2xl">
            <RiskScoreGauge score={analysisResult.score} />
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-white">{analysisResult.riskLevel}</h2>
                <Badge variant="outline" className="text-xs font-mono border-border/60">
                  {analysisResult.score}/100
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {analysisResult.riskLevel === "Safe" && "No prominent phishing or social engineering patterns detected."}
                {analysisResult.riskLevel === "Suspicious" && "Exhibits several suspicious indicators requiring caution."}
                {analysisResult.riskLevel === "High Risk" && "High confidence phishing or credential harvesting attack."}
              </p>
            </div>
          </Card>

          {/* Technical Details: Headers */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">
                Header Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">From Sender</p>
                <p className="font-mono text-white break-all bg-background/50 p-2.5 rounded border border-border/50">
                  {parsedData.sender}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Sender Domain</p>
                <p className="font-mono text-white bg-background/50 p-2.5 rounded border border-border/50">
                  {parsedData.senderDomain}
                </p>
              </div>
              {parsedData.replyTo && (
                <div>
                  <p className="text-muted-foreground mb-1">Reply-To Header</p>
                  <p className="font-mono text-amber-300 bg-background/50 p-2.5 rounded border border-amber-500/30 break-all">
                    {parsedData.replyTo}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Ordered Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. Threat Explanation */}
          <ThreatExplanation analysis={analysisResult} parsedData={parsedData} />

          {/* 3. Highlighted Content */}
          <HighlightedContent parsedData={parsedData} highlights={analysisResult.highlights} />

          {/* 4. Detection Reasons */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Detection Reasons & Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResult.reasons.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>No malicious risk factors detected.</span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {analysisResult.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* 5. Technical Details: Extracted Artifacts */}
          {(parsedData.urls.length > 0 || parsedData.domains.length > 0) && (
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <LinkIcon className="w-4 h-4 text-purple-400" /> Extracted Technical Artifacts ({parsedData.urls.length} Links)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {parsedData.domains.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Associated Domains</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedData.domains.map((domain, i) => (
                        <Badge key={i} variant="outline" className="bg-background/50 font-mono text-[11px]">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {parsedData.urls.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Embedded Hyperlinks</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {parsedData.urls.map((url, i) => (
                        <div key={i} className="bg-background/50 border border-border/50 p-2.5 rounded break-all font-mono text-[11px] text-slate-300">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
