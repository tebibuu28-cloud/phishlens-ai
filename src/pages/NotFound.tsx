import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="glass w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center rounded-full bg-red-500/10 p-5 text-red-400 shadow-inner shadow-red-500/10">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-400">404 Not Found</p>
            <h1 className="mt-4 text-5xl font-bold text-white sm:text-6xl">Page not found</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              The page you are looking for doesn't exist or has been moved. Return to the homepage to continue monitoring email threats.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go to homepage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
