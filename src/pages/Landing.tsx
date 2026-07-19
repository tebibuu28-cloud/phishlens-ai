import { Link } from "react-router-dom"
import { ShieldAlert, Zap, Lock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20 mb-4">
          <Zap className="w-4 h-4" />
          <span>Powered by AI Threat Detection</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
          Know if an email is a <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            phishing attempt
          </span>{" "}
          in seconds.
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
          PhishLens AI scans suspicious emails, detects hidden threats, and explains the risks in plain English so you can stay safe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button asChild size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)]">
            <Link to="/analyzer">
              <Search className="mr-2 h-5 w-5" />
              Analyze an Email Now
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl border-border hover:bg-white/5">
            <Link to="/about">Learn How It Works</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:border-blue-500/50 transition-colors">
          <div className="p-4 bg-blue-500/10 rounded-full text-blue-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Instant Analysis</h3>
          <p className="text-muted-foreground">Paste email content or upload .eml files to get an immediate risk score and detailed breakdown.</p>
        </div>
        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:border-emerald-500/50 transition-colors">
          <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Deep Scanning</h3>
          <p className="text-muted-foreground">We analyze sender reputation, hidden URLs, urgency triggers, and social engineering tactics.</p>
        </div>
        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center space-y-4 hover:border-purple-500/50 transition-colors">
          <div className="p-4 bg-purple-500/10 rounded-full text-purple-400">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Privacy First</h3>
          <p className="text-muted-foreground">Your data never leaves your browser unless absolutely necessary. We do not store your emails.</p>
        </div>
      </div>
    </div>
  )
}
