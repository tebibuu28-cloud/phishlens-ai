import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Download, Mail, Shield, TrendingUp, ShieldCheck, FileText, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database"

type AnalysisRow = Database["public"]["Tables"]["email_analysis"]["Row"]
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

export function Dashboard() {
	const { user } = useAuth()
	const [profile, setProfile] = useState<ProfileRow | null>(null)
	const [analysisHistory, setAnalysisHistory] = useState<AnalysisRow[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const totalAnalyses = analysisHistory.length
	const highCount = analysisHistory.filter((a) => a.level === "high").length
	const mediumCount = analysisHistory.filter((a) => a.level === "medium").length
	const safeCount = analysisHistory.filter((a) => a.level === "low").length
	const avgRisk = analysisHistory.length > 0 ? Math.round((analysisHistory.reduce((s, a) => s + (a.risk_score ?? 0), 0) / analysisHistory.length) * 10) / 10 : 0

	const topSenderDomainCounts = analysisHistory.reduce<Record<string, number>>((acc, item) => {
		const match = item.sender.match(/@(.+)$/)
		const domain = match?.[1]?.toLowerCase() ?? "unknown"

		if (!domain) return acc

		acc[domain] = (acc[domain] ?? 0) + 1
		return acc
	}, {})

	const topSenderDomains = Object.entries(topSenderDomainCounts)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 3)

	const [query, setQuery] = useState("")
	const [filterLevel, setFilterLevel] = useState<"all"|"high"|"medium"|"low">("all")
	const [sortBy, setSortBy] = useState<"newest"|"oldest"|"highest">("newest")

	const exportHistoryCsv = () => {
		const headers = ["Subject", "Sender", "Risk Level", "Score", "Date"]
		const csvRows = [headers.join(",")]

		analysisHistory.forEach((item) => {
			const row = [
				`"${item.subject.replace(/"/g, '""')}"`,
				`"${item.sender.replace(/"/g, '""')}"`,
				`"${item.level}"`,
				item.risk_score.toString(),
				`"${item.created_at ?? ""}"`,
			]
			csvRows.push(row.join(","))
		})

		const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = `phishlens-history-${Date.now()}.csv`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	const fetchDashboard = async () => {
		if (!user) {
			setLoading(false)
			return
		}

		setLoading(true)
		setError(null)

		try {
			const { data: profileData, error: profileError } = await supabase
				.from("profiles")
				.select("email,created_at")
				.eq("id", user.id)
				.single()

			if (profileError) {
				console.error(profileError)
				throw profileError
			}

			const { data: analysisData, error: analysisError } = await supabase
				.from("email_analysis")
				.select("id,sender,subject,level,risk_score,created_at")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })
				.limit(50)

			if (analysisError) {
				console.error(analysisError)
				throw analysisError
			}

			// Log raw data for debugging (will appear in browser console)
			if (analysisData) console.debug("supabase: analysisData", analysisData)

			// Normalize rows to expected DB column names in case of casing differences
			const normalized = (analysisData ?? []).map((row: any) => ({
				id: String(row.id ?? ""),
				user_id: String(row.user_id ?? row.userId ?? user.id ?? ""),
				sender: String(row.sender ?? row.from ?? row.sender_email ?? ""),
				subject: String(row.subject ?? row.Subject ?? row.title ?? ""),
				body: String(row.body ?? row.Body ?? ""),
				risk_score: Number(row.risk_score ?? row.riskScore ?? row.score ?? 0),
				level: (row.level ?? row.Level ?? row.risk_level ?? row.riskLevel ?? "low") as "low" | "medium" | "high",
				reasons: row.reasons ?? row.Reasons ?? [],
				recommendations: row.recommendations ?? row.Recommendations ?? [],
				created_at: row.created_at ?? row.createdAt ?? row.createdAtTs ?? null,
			})) as AnalysisRow[]

			setProfile(profileData)
			setAnalysisHistory(normalized)
		} catch (err) {
			console.error(err)
			setError(err instanceof Error ? err.message : String(err))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void fetchDashboard()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	useEffect(() => {
		if (!user) return

		const channel = supabase
			.channel("email-analysis")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "email_analysis", filter: `user_id=eq.${user.id}` },
				() => {
					void fetchDashboard()
				}
			)
			.subscribe()

		return () => void supabase.removeChannel(channel)
	}, [user])

	const userEmail = profile?.email ?? user?.email ?? "Unknown"

	// Derived list: filtered and sorted for table display
	const filteredSortedHistory = useMemo(() => {
		let out = analysisHistory.slice()

		if (query.trim()) {
			const q = query.toLowerCase()
			out = out.filter((r) => (r.subject ?? "").toLowerCase().includes(q) || (r.sender ?? "").toLowerCase().includes(q))
		}

		if (filterLevel !== "all") {
			out = out.filter((r) => r.level === filterLevel)
		}

		if (sortBy === "newest") {
			out.sort((a, b) => (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0))
		} else if (sortBy === "oldest") {
			out.sort((a, b) => (a.created_at ? new Date(a.created_at).getTime() : 0) - (b.created_at ? new Date(b.created_at).getTime() : 0))
		} else if (sortBy === "highest") {
			out.sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
		}

		return out
	}, [analysisHistory, query, filterLevel, sortBy])

	const deleteAnalysis = async (id: string) => {
		if (!confirm("Delete this analysis? This action cannot be undone.")) return

		try {
			const { error } = await supabase.from("email_analysis").delete().eq("id", id)
			if (error) {
				console.error(error)
				alert("Unable to delete analysis")
				return
			}

			setAnalysisHistory((s) => s.filter((r) => r.id !== id))
			alert("Analysis deleted")
		} catch (err) {
			console.error(err)
			alert("Unable to delete analysis")
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen px-4 py-16 text-white container mx-auto">
				<div className="space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="glass rounded-2xl border border-white/10 p-6 animate-pulse h-28" />
						))}
					</div>
					<div className="rounded-2xl glass border border-white/10 p-6 h-64 animate-pulse" />
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-16 px-4">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p className="text-sm uppercase tracking-[0.3em] text-blue-400">Dashboard</p>
					<h1 className="mt-3 text-4xl font-bold text-white">Welcome back, {userEmail.split("@")[0]}.</h1>
					<p className="mt-3 max-w-2xl text-muted-foreground">Your PhishLens AI account stores your email scans securely.</p>
				</div>
				<Button asChild className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white">
					<Link to="/analyzer">Analyze New Email</Link>
				</Button>
			</div>

			{error ? <div className="mt-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mt-8">
			<div className="space-y-2">
				<p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Saved Scan Insights</p>
				<p className="text-white max-w-2xl">Export your history, compare the most frequent sender domains, and track risk distribution over time.</p>
			</div>
			<Button onClick={exportHistoryCsv} className="w-full max-w-xs bg-slate-700 hover:bg-slate-600 text-white">
				<Download className="mr-2 h-4 w-4" /> Export Scan History
			</Button>
		</div>

		<div className="mt-6 flex flex-col gap-3">
			<div className="flex gap-3 items-center">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search subject or sender"
					className="w-full max-w-md bg-background/50 border border-border/50 rounded px-3 py-2 text-sm text-white"
				/>
				<div className="flex gap-2">
					<button onClick={() => setFilterLevel('all')} className={`px-3 py-1 rounded ${filterLevel === 'all' ? 'bg-blue-600 text-white' : 'bg-background/50 text-muted-foreground'}`}>All</button>
					<button onClick={() => setFilterLevel('high')} className={`px-3 py-1 rounded ${filterLevel === 'high' ? 'bg-rose-500 text-white' : 'bg-background/50 text-muted-foreground'}`}>High</button>
					<button onClick={() => setFilterLevel('medium')} className={`px-3 py-1 rounded ${filterLevel === 'medium' ? 'bg-amber-500 text-white' : 'bg-background/50 text-muted-foreground'}`}>Medium</button>
					<button onClick={() => setFilterLevel('low')} className={`px-3 py-1 rounded ${filterLevel === 'low' ? 'bg-emerald-500 text-white' : 'bg-background/50 text-muted-foreground'}`}>Low</button>
				</div>
				<select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="ml-auto bg-background/50 border border-border/50 rounded px-3 py-2 text-sm text-white">
					<option value="newest">Newest</option>
					<option value="oldest">Oldest</option>
					<option value="highest">Highest Risk</option>
				</select>
			</div>
		</div>

		<div className="grid gap-6 mt-6 lg:grid-cols-3">
			<div className="glass rounded-2xl border border-white/10 p-6">
				<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Risk Distribution</p>
				<div className="space-y-4 mt-6">
					{[
						{ label: "High", value: highCount, color: "bg-red-500" },
						{ label: "Medium", value: mediumCount, color: "bg-amber-500" },
						{ label: "Low", value: safeCount, color: "bg-emerald-500" },
					].map((item) => (
						<div key={item.label} className="space-y-2">
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<span>{item.label}</span>
								<span>{totalAnalyses > 0 ? `${Math.round((item.value / totalAnalyses) * 100)}%` : "0%"}</span>
							</div>
							<div className="h-3 rounded-full bg-white/10 overflow-hidden">
								<div className={`${item.color} h-full`} style={{ width: totalAnalyses > 0 ? `${Math.round((item.value / totalAnalyses) * 100)}%` : "0%" }} />
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="glass rounded-2xl border border-white/10 p-6 lg:col-span-2">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Top Sender Domains</p>
						<h2 className="mt-2 text-2xl font-semibold text-white">Most frequent sources</h2>
					</div>
					<ShieldCheck className="h-6 w-6 text-blue-400" />
				</div>
				<div className="mt-6 space-y-3">
					{topSenderDomains.length === 0 ? (
						<p className="text-sm text-muted-foreground">Run an analysis to populate your sender domain insights.</p>
					) : (
						topSenderDomains.map(([domain, count]) => (
							<div key={domain} className="rounded-2xl bg-background/60 border border-border/50 p-4 flex items-center justify-between gap-4">
								<div>
									<p className="text-sm text-muted-foreground">{domain}</p>
									<p className="mt-1 text-lg font-medium text-white">{count} scan{count > 1 ? "s" : ""}</p>
								</div>
								<span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-200">Frequent</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>

		<div className="grid gap-6 mt-10">

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="glass rounded-2xl border border-white/10 p-6 transform transition hover:-translate-y-1 hover:shadow-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Total Analyses</p>
								<p className="mt-3 text-3xl font-semibold text-white">{totalAnalyses}</p>
								<p className="mt-2 text-sm text-muted-foreground">All saved scans</p>
							</div>
							<div className="rounded-xl bg-white/5 p-3 text-blue-400"><Mail className="h-6 w-6" /></div>
						</div>
					</div>

					<div className="glass rounded-2xl border border-white/10 p-6 transform transition hover:-translate-y-1 hover:shadow-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">High Risk Emails</p>
								<p className="mt-3 text-3xl font-semibold text-red-400">{highCount}</p>
								<p className="mt-2 text-sm text-muted-foreground">Requires immediate attention</p>
							</div>
							<div className="rounded-xl bg-white/5 p-3 text-rose-400"><Shield className="h-6 w-6" /></div>
						</div>
					</div>

					<div className="glass rounded-2xl border border-white/10 p-6 transform transition hover:-translate-y-1 hover:shadow-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Safe Emails</p>
								<p className="mt-3 text-3xl font-semibold text-emerald-300">{safeCount}</p>
								<p className="mt-2 text-sm text-muted-foreground">Low risk</p>
							</div>
							<div className="rounded-xl bg-white/5 p-3 text-emerald-300"><ShieldCheck className="h-6 w-6" /></div>
						</div>
					</div>

					<div className="glass rounded-2xl border border-white/10 p-6 transform transition hover:-translate-y-1 hover:shadow-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Average Risk Score</p>
								<p className="mt-3 text-3xl font-semibold text-blue-400">{avgRisk}</p>
								<p className="mt-2 text-sm text-muted-foreground">0 - 100 scale</p>
							</div>
							<div className="rounded-xl bg-white/5 p-3 text-amber-300"><TrendingUp className="h-6 w-6" /></div>
						</div>
					</div>
				</div>

				<div className="glass rounded-3xl border border-white/10 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Recent Analyses</p>
							<h2 className="mt-2 text-2xl font-semibold text-white">Latest activity</h2>
						</div>
						<FileText className="h-6 w-6 text-blue-400" />
					</div>

					<div className="mt-6">
						{filteredSortedHistory.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-6 py-12">
								<div className="text-center">
									<p className="text-xl font-semibold text-white">No analyses yet.</p>
									<p className="mt-2 text-sm text-muted-foreground">Analyze an email to see results here.</p>
								</div>
								<Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
									<Link to="/analyzer">Analyze Email</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full table-auto text-left">
									<thead>
										<tr className="text-sm text-muted-foreground">
											<th className="py-3 px-4">Email Subject</th>
											<th className="py-3 px-4">Risk</th>
											<th className="py-3 px-4">Score</th>
											<th className="py-3 px-4">Date</th>
								<th className="py-3 px-4">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/5">
										{filteredSortedHistory.map((item) => (
											<tr key={item.id} className="hover:bg-white/2">
												<td className="py-3 px-4">
													<div className="text-sm font-medium text-white">{item.subject}</div>
													<div className="text-xs text-muted-foreground">{item.sender}</div>
												</td>
												<td className="py-3 px-4">
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${item.level === "high" ? "bg-red-500/20 text-red-300" : item.level === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-green-500/20 text-emerald-300"}`}>
														{item.level === "high" ? "High" : item.level === "medium" ? "Medium" : "Low"}
													</span>
												</td>
												<td className="py-3 px-4 text-sm text-muted-foreground">{item.risk_score}</td>
												<td className="py-3 px-4 text-sm text-muted-foreground">{item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown"}</td>
								<td className="py-3 px-4 text-sm text-muted-foreground">
									<div className="flex gap-2">
										<Button asChild size="sm" variant="outline">
											<Link to={`/analysis/${item.id}`}>View</Link>
										</Button>
										<Button size="sm" variant="ghost" className="text-rose-300" onClick={() => deleteAnalysis(item.id)}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
 




















