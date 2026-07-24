import { ShieldAlert, AlertTriangle, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/lib/detector";
import type { ParsedEmail } from "@/lib/parser";

interface ThreatExplanationProps {
  analysis: AnalysisResult;
  parsedData: ParsedEmail;
}

export function ThreatExplanation({ analysis, parsedData }: ThreatExplanationProps) {
  const { riskLevel, confidence, threatCategory, structuredReasons, recommendations } = analysis;

  // 1. Generate Executive Threat Summary
  let summaryText = "";
  let attackerIntentText = "";
  let psychologicalTrickText = "";

  if (riskLevel === "High Risk") {
    summaryText = `This message exhibits high-confidence indicators of a targeted ${threatCategory.toLowerCase()}.`;
    if (parsedData.hasDisplayNameSpoofing || parsedData.lookalikeDomains.length > 0) {
      attackerIntentText = "The attacker is attempting to steal your credentials by impersonating a trusted brand.";
    } else if (parsedData.attachments.some(a => a.isSuspicious)) {
      attackerIntentText = "The attacker is trying to deliver malicious software or script payloads to compromise your device.";
    } else {
      attackerIntentText = "The attacker is attempting to harvest sensitive credentials or manipulate payment procedures.";
    }
    psychologicalTrickText = "The message uses artificial urgency, threat of account restriction, or executive authority to force immediate action without verification.";
  } else if (riskLevel === "Suspicious") {
    summaryText = "This message displays several suspicious characteristics commonly associated with social engineering.";
    attackerIntentText = "The sender may be probing for active email addresses or attempting to bypass security filters.";
    psychologicalTrickText = "Contains coercive language or unverified destination links requiring extra caution.";
  } else {
    summaryText = "PhishLens AI analyzed this message and detected no immediate high-risk phishing indicators.";
    attackerIntentText = "The communication appears routine and aligns with standard email patterns.";
    psychologicalTrickText = "No prominent psychological manipulation tactics were detected.";
  }

  // 2. Identify Attack Techniques
  const attackTechniques: string[] = [];
  if (parsedData.hasDisplayNameSpoofing) attackTechniques.push("Display Name Impersonation");
  if (parsedData.hasReplyToMismatch) attackTechniques.push("Reply-To Routing Mismatch");
  if (parsedData.lookalikeDomains.length > 0) attackTechniques.push("Lookalike / Typosquatted Domain");
  if (analysis.shortenedUrlCount > 0) attackTechniques.push("Obfuscated Shortened URLs");
  if (analysis.ipUrlCount > 0) attackTechniques.push("Direct IP Address Links");
  if (parsedData.attachments.some(a => a.isSuspicious)) attackTechniques.push("Executable Payload Attachment");
  if (structuredReasons.some(r => r.category === "Urgency & Phrasing")) attackTechniques.push("Artificial Urgency Manipulation");
  if (structuredReasons.some(r => r.category === "Fear & Threats")) attackTechniques.push("Fear & Legal Intimidation");
  if (structuredReasons.some(r => r.category === "Credentials & Fraud")) attackTechniques.push("Credential Harvesting Prompt");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Executive Threat Summary Card */}
      <Card className="glass border-border/60 shadow-xl overflow-hidden relative">
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          riskLevel === "High Risk" ? "bg-rose-500" : riskLevel === "Suspicious" ? "bg-amber-500" : "bg-emerald-500"
        }`} />
        
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className={`w-6 h-6 ${
                riskLevel === "High Risk" ? "text-rose-400" : riskLevel === "Suspicious" ? "text-amber-400" : "text-emerald-400"
              }`} />
              Why PhishLens Flagged This Email
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background/60 text-muted-foreground border-border">
                Confidence: <span className="text-white ml-1 font-semibold">{confidence}</span>
              </Badge>
              <Badge className={`${
                riskLevel === "High Risk" ? "bg-rose-500/20 text-rose-300 border-rose-500/40" :
                riskLevel === "Suspicious" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              } border`}>
                {threatCategory}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="p-4 rounded-xl bg-background/40 border border-border/50 space-y-2">
            <p className="text-white font-medium leading-relaxed">{summaryText}</p>
            <p className="text-muted-foreground leading-relaxed">{attackerIntentText}</p>
          </div>

          {psychologicalTrickText && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold text-amber-300 block mb-0.5">Psychological Manipulation Detected</span>
                <span>{psychologicalTrickText}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Attack Breakdown & Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Attack Methods */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-400" /> Attack Vector Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Primary Attack Classification</p>
              <p className="text-sm font-semibold text-white bg-background/50 p-2.5 rounded-md border border-border/50">
                {threatCategory}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Detected Threat Indicators</p>
              {attackTechniques.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No hostile attack techniques identified.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {attackTechniques.map((tech, i) => (
                    <Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs py-1">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Security Advice Checklist */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 bg-background/40 p-2.5 rounded-md border border-border/40">
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

      {/* 3. Detailed Explanations of Flags */}
      {structuredReasons.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" /> Flag Explanations & Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {structuredReasons.map((reason, i) => (
                <div key={i} className="p-3.5 rounded-lg bg-background/50 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        reason.severity === "high" ? "bg-rose-400" : reason.severity === "medium" ? "bg-amber-400" : "bg-blue-400"
                      }`} />
                      {reason.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {reason.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
