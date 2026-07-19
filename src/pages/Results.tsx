import { useLocation, Link } from "react-router-dom";
import { ShieldAlert, CheckCircle, AlertTriangle, Link as LinkIcon, Mail } from "lucide-react";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ParsedEmail } from "@/lib/parser";
import { AnalysisResult } from "@/lib/detector";

export function Results() {
  const location = useLocation();
  const state = location.state as { parsedData: ParsedEmail; analysisResult: AnalysisResult } | null;

  if (!state) {
    return (
      <div className="container max-w-4xl mx-auto py-24 px-4 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">No Data Found</h1>
        <p className="text-muted-foreground mb-8">
          It looks like you navigated here directly. Please submit an email for analysis first.
        </p>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link to="/analyzer">Go to Analyzer</Link>
        </Button>
      </div>
    );
  }

  const { parsedData, analysisResult } = state;

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analysis Results</h1>
          <p className="text-muted-foreground">
            Subject: <span className="text-white font-medium">{parsedData.subject}</span>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/analyzer">Analyze Another Email</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gauge & Verdict */}
        <div className="space-y-8">
          <Card className="glass flex flex-col items-center justify-center p-8 text-center border-border/50 shadow-2xl">
            <RiskScoreGauge score={analysisResult.score} />
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-white mb-2">{analysisResult.riskLevel}</h2>
              <p className="text-sm text-muted-foreground">
                {analysisResult.riskLevel === "Safe" && "This email shows no obvious signs of phishing."}
                {analysisResult.riskLevel === "Suspicious" && "This email exhibits several questionable patterns."}
                {analysisResult.riskLevel === "High Risk" && "This email is highly likely to be a malicious attempt."}
              </p>
            </div>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" /> Headers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Sender</p>
                <p className="font-mono text-sm text-white break-all bg-background/50 p-2 rounded mt-1 border border-border/50">
                  {parsedData.sender}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                <p className="font-mono text-sm text-white bg-background/50 p-2 rounded mt-1 border border-border/50">
                  {parsedData.date}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Triggers & Reasons */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" /> Risk Factors Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResult.reasons.length === 0 ? (
                <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Clean</AlertTitle>
                  <AlertDescription>No major risk factors were detected in this email.</AlertDescription>
                </Alert>
              ) : (
                <ul className="space-y-3">
                  {analysisResult.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3 bg-rose-500/5 border border-rose-500/10 p-4 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-white text-sm leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                {analysisResult.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Artifacts (URLs and Domains) */}
          {(parsedData.urls.length > 0 || parsedData.domains.length > 0) && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-purple-400" /> Extracted Artifacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {parsedData.domains.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">Associated Domains</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.domains.map((domain, i) => (
                        <Badge key={i} variant="outline" className="bg-background/50 font-mono">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {parsedData.urls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">Links Found ({parsedData.urls.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {parsedData.urls.map((url, i) => (
                        <div key={i} className="bg-background/50 border border-border/50 p-3 rounded-md break-all font-mono text-xs text-muted-foreground flex items-center justify-between group hover:border-purple-500/30 transition-colors">
                          <span>{url}</span>
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
