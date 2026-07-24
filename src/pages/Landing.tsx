import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Zap,
  Lock,
  Search,
  Brain,
  FileText,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PlayCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-20 px-4 sm:px-6 lg:px-8 space-y-24">

      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/30">
          <Zap className="w-3.5 h-3.5" />
          <span>YC-Quality Cybersecurity SaaS Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
          Detect phishing emails. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
            Understand the attack.
          </span>{" "}
          Stay protected.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground leading-relaxed">
          PhishLens AI scans suspicious emails, reveals attacker psychological tactics, and provides plain-English explanations so anyone can make safe security decisions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto text-base h-13 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-semibold"
          >
            <Link to="/analyzer">
              <Search className="mr-2 h-5 w-5" />
              Analyze an Email
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base h-13 px-8 rounded-xl border-border/70 hover:bg-background/80 text-slate-200"
          >
            <Link to="/analyzer">
              <PlayCircle className="mr-2 h-5 w-5 text-amber-400" />
              Try Demo
            </Link>
          </Button>
        </div>
      </div>

      {/* 3-Step Trust Section */}
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How It Works</h2>
          <p className="text-muted-foreground text-sm">Three simple steps to dissect suspicious emails and stay safe</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-border/50 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono text-xs font-semibold">Step 1</div>
            <h3 className="text-lg font-bold text-white">Paste Email</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Copy raw email content or upload a .eml file into our secure analyzer.
            </p>
          </Card>

          <Card className="glass border-border/50 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono text-xs font-semibold">Step 2</div>
            <h3 className="text-lg font-bold text-white">AI Analyzes Threats</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our engine inspects lookalikes, urgency, spoofing, and dangerous links instantly.
            </p>
          </Card>

          <Card className="glass border-border/50 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <Eye className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-semibold">Step 3</div>
            <h3 className="text-lg font-bold text-white">Understand Risks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Read plain-English threat breakdowns, view color highlights, and take recommended actions.
            </p>
          </Card>
        </div>
      </div>

      {/* 4 Feature Cards */}
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
            Core Capabilities
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold text-white">Engineered for Security Clarity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-border/50 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Threat Explanation</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instead of cryptic risk codes, PhishLens explains attacker intent, psychological triggers (urgency/fear), and target objectives in human-readable prose.
            </p>
          </Card>

          <Card className="glass border-border/50 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Suspicious Content Highlighting</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive visual highlights tag lookalike domains in red, urgency phrases in yellow, spoofed senders in purple, and credential requests in blue.
            </p>
          </Card>

          <Card className="glass border-border/50 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Risk Analysis</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Receive an exact 0–100 risk score and confidence rating based on indicators like display spoofing, Reply-To routing, IP links, and suspicious attachments.
            </p>
          </Card>

          <Card className="glass border-border/50 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Privacy-Focused Processing</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Email parsing and detection runs entirely client-side. Your sensitive communications are never stored on external third-party servers.
            </p>
          </Card>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="max-w-5xl w-full space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass p-6 border border-rose-500/20 bg-rose-500/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Traditional Email Filters
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">❌ Generic "Spam" label with zero explanation</li>
              <li className="flex items-center gap-2">❌ No visual highlights of lookalike domains</li>
              <li className="flex items-center gap-2">❌ No education on social engineering psychological tricks</li>
            </ul>
          </Card>

          <Card className="glass p-6 border border-emerald-500/30 bg-emerald-500/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> PhishLens AI Experience
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">✅ 0-100 score + explicit Threat Intent breakdown</li>
              <li className="flex items-center gap-2">✅ Interactive color-coded inline highlights & tooltips</li>
              <li className="flex items-center gap-2">✅ Clear security action checklist tailored to risk tier</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Final CTA Card */}
      <Card className="max-w-4xl w-full text-center glass rounded-3xl p-8 sm:p-12 border-blue-500/30">
        <h2 className="text-2xl sm:text-4xl font-bold text-white">
          Ready to investigate suspicious emails?
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-xl mx-auto">
          Test our detection engine with real-world phishing presets or paste any suspicious email text.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-semibold shadow-lg shadow-blue-500/20"
        >
          <Link to="/analyzer">
            <Search className="mr-2 w-4 h-4" />
            Start Analysis
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </Card>

    </div>
  );
}