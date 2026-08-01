import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, DownloadCloud } from "lucide-react"

export function AnalysisView() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const renderValue = (value: unknown) => {
    if (value === null || value === undefined) return ""
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item : JSON.stringify(item, null, 2)))
        .join("\n")
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  useEffect(() => {
    if (!id) return

    let mounted = true

    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("email_analysis")
          .select("*")
          .eq("id", id)
          .single()

        if (error) {
          console.error(error)
          throw error
        }

        if (!mounted) return
        setAnalysis(data)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [id])

  const copyJson = async () => {
    if (!analysis) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))
      alert("Copied report to clipboard")
    } catch {
      alert("Unable to copy to clipboard")
    }
  }

  const downloadJson = () => {
    if (!analysis) return
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `phishlens-analysis-${id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-24 px-4 text-center text-white">
        <p>Loading analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-24 px-4 text-center">
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="container max-w-4xl mx-auto py-24 px-4 text-center text-white">
        <p>No analysis found.</p>
        <Button asChild>
          <Link to="/dashboard">Back</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analysis</h1>
        <div className="flex gap-2">
          <Button onClick={copyJson} variant="secondary"><Copy className="mr-2 h-4 w-4" /> Copy JSON</Button>
          <Button onClick={downloadJson} className="bg-blue-600 hover:bg-blue-700 text-white"><DownloadCloud className="mr-2 h-4 w-4" /> Download JSON</Button>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Sender</p>
              <p className="text-white font-medium">{analysis.sender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="text-white font-medium">{analysis.subject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-white font-medium">{analysis.created_at ? new Date(analysis.created_at).toLocaleString() : "Unknown"}</p>
            </div>
            <div className="flex items-center">
              <div className="w-full">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <RiskScoreGauge score={Number(analysis.risk_score ?? 0)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>AI Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{(analysis.reasons && analysis.reasons.length > 0) ? renderValue(analysis.reasons) : "No detailed reasons provided."}</p>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-muted-foreground">
            {(analysis.recommendations || []).map((r: any, i: number) => (
              <li key={i}>{renderValue(r)}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Links & Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Domains</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(analysis.domains || []).map((d: any, i: number) => (
                  <span key={i} className="bg-background/50 px-2 py-1 rounded text-xs font-mono">{renderValue(d)}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Links</p>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {(analysis.urls || []).map((u: any, i: number) => (
                  <div key={i} className="bg-background/50 p-2 rounded font-mono text-xs break-all">{renderValue(u)}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
