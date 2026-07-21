import { Mail, MessageSquare, ShieldCheck } from "lucide-react"

export function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-3xl w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 text-blue-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Contact PhishLens AI
          </h1>

          <p className="text-muted-foreground text-lg">
            Have questions, feedback, or suggestions? 
            Contact the PhishLens AI team.
          </p>
        </div>


        {/* Contact Card */}
        <div className="glass rounded-2xl p-8 space-y-6 border border-border">

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Mail className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                PhishLens AI
              </h2>

              <a
                href="mailto:Pishlens.ai@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Email: Pishlens.ai@gmail.com
              </a>
            </div>
          </div>


          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>

            <p className="text-muted-foreground leading-relaxed">
              We welcome feedback about cybersecurity detection,
              phishing analysis accuracy, and user experience improvements.
              Your feedback helps make PhishLens AI better.
            </p>
          </div>

        </div>


        {/* Developer Note */}
        <div className="text-center text-sm text-muted-foreground">
          Built with a mission to make cybersecurity awareness accessible
          for everyone.
        </div>

      </div>
    </div>
  )
}