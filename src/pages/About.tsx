import { ShieldCheck, EyeOff, AlertOctagon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function About() {
  return (
    <div className="container max-w-5xl mx-auto py-16 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Defending against the invisible.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Phishing attacks have evolved. PhishLens AI is designed to help you see past the deception by analyzing patterns, urgency triggers, and hidden malicious links.
        </p>
      </div>

      {/* Educational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="glass border-border/50 hover:border-blue-500/50 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <CardHeader>
            <ShieldCheck className="w-10 h-10 text-blue-400 mb-2" />
            <CardTitle className="text-xl text-white">Zero Trust</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Never assume an email is safe just because it looks like it came from a trusted company. Scammers can easily fake the "Sender Name". Always verify the actual email address behind the name.
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 hover:border-emerald-500/50 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <CardHeader>
            <AlertOctagon className="w-10 h-10 text-emerald-400 mb-2" />
            <CardTitle className="text-xl text-white">Manufactured Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Phishing relies on panic. If an email tells you your account will be deleted "within 24 hours" unless you click a link, it is almost certainly a scam designed to make you act without thinking.
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 hover:border-purple-500/50 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <CardHeader>
            <EyeOff className="w-10 h-10 text-purple-400 mb-2" />
            <CardTitle className="text-xl text-white">Hidden Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              The text of a link might say "paypal.com", but the actual hidden destination could be "paypaI-security-update.com". PhishLens AI automatically extracts and exposes these hidden URLs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-background/50 border border-border/50 rounded-2xl p-12 max-w-3xl mx-auto animate-in fade-in duration-1000 delay-700">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to test an email?</h2>
        <p className="text-muted-foreground mb-8">
          Paste your suspicious email into our Analyzer to get an instant, privacy-focused risk assessment.
        </p>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8">
          <Link to="/analyzer">
            Go to Analyzer <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

    </div>
  );
}
