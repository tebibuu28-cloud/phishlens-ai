import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mail, Lock, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function Login() {
  const navigate = useNavigate()
  const { user, loading, signIn, signInWithGitHub } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard")
    }
  }, [loading, user, navigate])

  async function handleLogin() {
    setFormError(null)

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter your email and password.")
      return
    }

    setIsSubmitting(true)

    try {
      await signIn(email, password)
      navigate("/dashboard")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Login failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGitHubLogin() {
    setFormError(null)
    setIsSubmitting(true)

    try {
      await signInWithGitHub()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "GitHub login failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass border border-white/10 p-8 shadow-2xl shadow-black/20">
        <Card className="bg-[#0b1220]/95 border border-white/10 shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3 text-blue-400">
              <ShieldCheck className="h-8 w-8" />
              <div>
                <CardTitle>Secure Login</CardTitle>
                <CardDescription>Access your PhishLens AI dashboard.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {formError ? (
              <Alert variant="destructive">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="bg-transparent border-0 px-0 text-white placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Lock className="h-5 w-5 text-blue-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="bg-transparent border-0 px-0 text-white placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Signing in…" : "Login"}
            </Button>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-white/10" />
              <span>OR</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <Button
              onClick={handleGitHubLogin}
              disabled={isSubmitting}
              variant="outline"
              className="w-full text-white border-white/10 bg-white/5 hover:bg-white/10"
            >
              Continue with GitHub
            </Button>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>New to PhishLens AI?</span>
              <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
                Create account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
