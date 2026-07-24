import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Info, Sparkles } from "lucide-react";
import type { HighlightItem, ParsedEmail } from "@/lib/parser";

interface HighlightedContentProps {
  parsedData: ParsedEmail;
  highlights: HighlightItem[];
}

interface SpanMatch {
  start: number;
  end: number;
  text: string;
  type: HighlightItem["type"];
  explanation: string;
}

export function HighlightedContent({ parsedData, highlights }: HighlightedContentProps) {
  const bodyText = parsedData.body || "";

  // Color mapping per category requirements:
  // RED: URLs, lookalikes, IP addresses, attachments
  // YELLOW: Urgency phrases, threat tactics
  // PURPLE: Display spoofing, Reply-To mismatch
  // BLUE: Credential requests, password/login prompts, phone numbers
  const getColorStyles = (type: HighlightItem["type"]) => {
    switch (type) {
      case "url":
      case "domain":
      case "attachment":
        return {
          bg: "bg-rose-500/20 hover:bg-rose-500/30",
          text: "text-rose-300 font-semibold",
          border: "border-rose-500/40",
          legendBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          label: "Red: Malicious Indicator",
        };
      case "urgency":
        return {
          bg: "bg-amber-500/20 hover:bg-amber-500/30",
          text: "text-amber-300 font-semibold",
          border: "border-amber-500/40",
          legendBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          label: "Yellow: Social Engineering / Urgency",
        };
      case "spoof":
      case "email":
        return {
          bg: "bg-purple-500/20 hover:bg-purple-500/30",
          text: "text-purple-300 font-semibold",
          border: "border-purple-500/40",
          legendBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          label: "Purple: Identity Spoofing",
        };
      case "credential":
      case "phone":
        return {
          bg: "bg-blue-500/20 hover:bg-blue-500/30",
          text: "text-blue-300 font-semibold",
          border: "border-blue-500/40",
          legendBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          label: "Blue: Suspicious Request",
        };
      default:
        return {
          bg: "bg-slate-500/20 hover:bg-slate-500/30",
          text: "text-slate-200",
          border: "border-slate-500/40",
          legendBg: "bg-slate-500/20 text-slate-300",
          label: "Gray: General Flag",
        };
    }
  };

  // Find non-overlapping span matches in the email body
  const renderedSegments = useMemo(() => {
    if (!bodyText) return [<span key="empty">No email body text provided.</span>];

    const matches: SpanMatch[] = [];
    const lowerBody = bodyText.toLowerCase();

    highlights.forEach((item) => {
      if (!item.text || item.text.length < 2) return;
      const lowerSearch = item.text.toLowerCase();
      let pos = 0;

      while ((pos = lowerBody.indexOf(lowerSearch, pos)) !== -1) {
        const end = pos + item.text.length;
        // Ensure no overlap with existing matched spans
        const hasOverlap = matches.some(
          (m) => (pos >= m.start && pos < m.end) || (end > m.start && end <= m.end)
        );
        if (!hasOverlap) {
          matches.push({
            start: pos,
            end,
            text: bodyText.substring(pos, end),
            type: item.type,
            explanation: item.explanation,
          });
        }
        pos = end;
      }
    });

    // Sort matches chronologically by position
    matches.sort((a, b) => a.start - b.start);

    // Build JSX segments alternating between plain text and highlighted spans
    const segments: React.ReactNode[] = [];
    let currentIndex = 0;

    matches.forEach((match, idx) => {
      if (match.start > currentIndex) {
        segments.push(bodyText.substring(currentIndex, match.start));
      }

      const styles = getColorStyles(match.type);
      segments.push(
        <span
          key={`highlight-${idx}`}
          className={`relative group inline-block px-1.5 py-0.5 rounded cursor-help border ${styles.bg} ${styles.text} ${styles.border} transition-colors duration-150 my-0.5`}
        >
          {match.text}
          {/* Interactive Tooltip */}
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 p-2.5 bg-slate-900/95 border border-slate-700/80 rounded-lg shadow-2xl text-xs text-white z-50 animate-in fade-in duration-200">
            <span className="font-semibold flex items-center gap-1 text-slate-200 mb-1">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Threat Intelligence
            </span>
            <span className="text-slate-300 leading-normal">{match.explanation}</span>
          </span>
        </span>
      );

      currentIndex = match.end;
    });

    if (currentIndex < bodyText.length) {
      segments.push(bodyText.substring(currentIndex));
    }

    return segments;
  }, [bodyText, highlights]);

  return (
    <Card className="glass border-border/60 shadow-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" /> Interactive Suspicious Content Highlights
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hover over highlighted phrases for threat details</span>
          </div>
        </div>

        {/* Legend Bar */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
          <Badge variant="outline" className="bg-rose-500/10 text-rose-300 border-rose-500/30 text-[11px]">
            Red: Malicious Link/Domain
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[11px]">
            Yellow: Urgency / Pressure
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[11px]">
            Purple: Spoofed Identity
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[11px]">
            Blue: Sensitive Request
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Email Headers Quick Bar */}
        <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border/40 font-mono text-xs space-y-1 text-slate-300">
          <div><span className="text-muted-foreground font-sans">From:</span> {parsedData.sender}</div>
          <div><span className="text-muted-foreground font-sans">Subject:</span> {parsedData.subject}</div>
        </div>

        {/* Highlighted Body Render Area */}
        <div className="p-4 rounded-xl bg-background/40 border border-border/50 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
          {renderedSegments}
        </div>
      </CardContent>
    </Card>
  );
}
