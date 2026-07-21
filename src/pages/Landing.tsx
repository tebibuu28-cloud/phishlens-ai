import { Link } from "react-router-dom"
import {
  ShieldAlert,
  Zap,
  Lock,
  Search,
  Brain,
  FileText,
  GraduationCap,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

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


        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">

          Know if an email is a <br className="hidden md:block" />

          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            phishing attempt
          </span>

          {" "}in seconds.

        </h1>


        <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">

          PhishLens AI scans suspicious emails, detects hidden threats,
          and explains the risks in plain English so you can stay safe.

        </p>


        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >

            <Link to="/analyzer">

              <Search className="mr-2 h-5 w-5" />

              Analyze an Email Now

            </Link>

          </Button>



          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl"
          >

            <Link to="/about">
              Learn How It Works
            </Link>

          </Button>


        </div>

      </div>



      {/* Features */}

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">


        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center space-y-4">

          <div className="p-4 bg-blue-500/10 rounded-full text-blue-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white">
            Instant Analysis
          </h3>

          <p className="text-muted-foreground">
            Paste email content or upload .eml files to get a risk score and detailed explanation.
          </p>

        </div>



        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center space-y-4">

          <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400">
            <Search className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white">
            Deep Scanning
          </h3>

          <p className="text-muted-foreground">
            Analyze URLs, urgency signals, and social engineering patterns.
          </p>

        </div>



        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center space-y-4">

          <div className="p-4 bg-purple-500/10 rounded-full text-purple-400">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white">
            Privacy First
          </h3>

          <p className="text-muted-foreground">
            Your email content stays private.
          </p>

        </div>


      </div>




      {/* Why Different */}

      <div className="max-w-5xl w-full mt-32 space-y-12">


        <div className="text-center space-y-4">

          <h2 className="text-3xl md:text-5xl font-bold text-white">

            Not just detection.

            <span className="text-blue-400">
              {" "}Explanation.
            </span>

          </h2>


          <p className="text-muted-foreground text-lg">

            Most phishing tools only say dangerous.
            PhishLens AI explains why.

          </p>

        </div>



        <div className="grid md:grid-cols-2 gap-8">


          <div className="glass p-8 rounded-2xl">

            <h3 className="text-xl font-bold text-white mb-6">
              Traditional Tools
            </h3>

            <ul className="space-y-4 text-muted-foreground">

              <li>❌ Only alerts</li>
              <li>❌ No explanation</li>
              <li>❌ No education</li>

            </ul>

          </div>



          <div className="glass p-8 rounded-2xl border border-blue-500/30">

            <h3 className="text-xl font-bold text-white mb-6">
              PhishLens AI
            </h3>

            <ul className="space-y-4 text-muted-foreground">

              <li>✅ Risk score</li>
              <li>✅ Highlighted evidence</li>
              <li>✅ Confidence explanation</li>
              <li>✅ Security education</li>

            </ul>

          </div>


        </div>


      </div>




      {/* How It Works */}

      <div className="max-w-5xl w-full mt-32">


        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-12">

          How PhishLens Works

        </h2>


        <div className="grid md:grid-cols-3 gap-8">


          <div className="glass p-8 rounded-2xl text-center">

            <FileText className="mx-auto w-10 h-10 text-blue-400 mb-4"/>

            <h3 className="text-xl font-bold text-white">
              Upload Email
            </h3>

            <p className="text-muted-foreground mt-3">
              Paste suspicious email text.
            </p>

          </div>



          <div className="glass p-8 rounded-2xl text-center">

            <Brain className="mx-auto w-10 h-10 text-emerald-400 mb-4"/>

            <h3 className="text-xl font-bold text-white">
              AI Analysis
            </h3>

            <p className="text-muted-foreground mt-3">
              Detect phishing patterns.
            </p>

          </div>



          <div className="glass p-8 rounded-2xl text-center">

            <GraduationCap className="mx-auto w-10 h-10 text-purple-400 mb-4"/>

            <h3 className="text-xl font-bold text-white">
              Learn & Protect
            </h3>

            <p className="text-muted-foreground mt-3">
              Understand attacks.
            </p>

          </div>


        </div>


      </div>




      {/* Demo Section */}

      <div className="max-w-5xl w-full mt-32">


        <div className="text-center mb-12">

          <h2 className="text-3xl md:text-5xl font-bold text-white">
            See PhishLens AI In Action
          </h2>

          <p className="text-muted-foreground mt-4">
            Example phishing investigation.
          </p>

        </div>



        <div className="grid md:grid-cols-2 gap-8">


          <div className="glass p-8 rounded-2xl">

            <div className="flex gap-3 items-center mb-5">

              <AlertTriangle className="text-red-400"/>

              <h3 className="text-xl font-bold text-white">
                Suspicious Email
              </h3>

            </div>


            <p className="text-muted-foreground">

              "Your account will be suspended within 24 hours.
              Verify your password immediately."

            </p>

          </div>



          <div className="glass p-8 rounded-2xl border border-red-500/30">

            <div className="flex gap-3 items-center mb-5">

              <CheckCircle className="text-emerald-400"/>

              <h3 className="text-xl font-bold text-white">
                Analysis Result
              </h3>

            </div>


            <p className="text-4xl font-bold text-red-400">
              92%
            </p>


            <ul className="mt-5 text-muted-foreground space-y-2">

              <li>🚨 Urgency detected</li>
              <li>🔑 Password request</li>
              <li>🔗 Suspicious link</li>

            </ul>

          </div>


        </div>


      </div>





      {/* Final CTA */}

      <div className="max-w-4xl w-full mt-32 text-center glass rounded-3xl p-12">


        <h2 className="text-3xl md:text-5xl font-bold text-white">

          Ready to investigate suspicious emails?

        </h2>


        <p className="text-muted-foreground mt-5">

          Detect threats and learn how attackers operate.

        </p>



        <Button
          asChild
          size="lg"
          className="mt-8 bg-blue-600 hover:bg-blue-700 rounded-xl px-10"
        >

          <Link to="/analyzer">

            <Search className="mr-2"/>

            Start Analysis

          </Link>

        </Button>


      </div>


    </div>
  )
}