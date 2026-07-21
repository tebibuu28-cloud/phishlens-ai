import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Mail, Shield, TrendingUp, ShieldCheck, FileText } from "lucide-react"

const recentAnalyses = [
  { id: "AN-1024", subject: "Invoice Confirmation", result: "Safe", risk: "Low", date: "Today" },
  { id: "AN-998", subject: "Password Reset Request", result: "Phishing", risk: "High", date: "Yesterday" },
  { id: "AN-991", subject: "Security Alert", result: "Suspicious", risk: "Medium", date: "2 days ago" },
]

export function Dashboard() {
  const user = JSON.parse(localStorage.getItem("phishlens-user") || "{}")
  const userName = user.fullName || user.email || "Analyst"

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Dashboard</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Welcome back, {userName.split(" ")[0]}.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">View your recent email security analysis, monitor threats, and keep your inbox safe.</p>
        </div>
        <Button asChild className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white">
          <Link to="/analyzer">Analyze New Email</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] mt-10">
        <div className="space-y-6">
          <div className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-blue-400">Profile</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">{userName}</h2>
                <p className="mt-2 text-muted-foreground">PhishLens AI security analyst profile.</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 text-blue-400"><ShieldCheck className="h-8 w-8" /></div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass rounded-3xl border border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Total emails</p>
              <p className="mt-4 text-3xl font-semibold text-blue-400">312</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />Processed this week</div>
            </div>
            <div className="glass rounded-3xl border border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Threats detected</p>
              <p className="mt-4 text-3xl font-semibold text-red-400">17</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" />Active alerts</div>
            </div>
            <div className="glass rounded-3xl border border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Security score</p>
              <p className="mt-4 text-3xl font-semibold text-green-400">94%</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" />Strong protection</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Recent analysis</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Latest reports</h2>
            </div>
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-6 space-y-4">
            {recentAnalyses.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{item.subject}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.result === "Phishing" ? "bg-red-500/20 text-red-300" : item.result === "Safe" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                    {item.result}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground"><span>{item.id}</span><span>{item.risk} risk</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
