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
import { User, Mail, Lock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function Signup() {
  const navigate = useNavigate()
  const { user, loading, signUp } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard")
    }
  }, [loading, user, navigate])

  async function createAccount() {
    setFormError(null)

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError("Please complete all fields.")
      return
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      await signUp(email, password)
      navigate("/dashboard")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Signup failed.")
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
              <User className="h-8 w-8" />
              <div>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Begin your PhishLens AI journey.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {formError ? (
              <Alert variant="destructive">
                <AlertTitle>Signup failed</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Full name</label>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Doe"
                className="bg-white/5 text-white placeholder:text-muted-foreground"
              />
            </div>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="bg-transparent border-0 px-0 text-white placeholder:text-muted-foreground focus-visible:ring-0"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Confirm password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  className="bg-white/5 text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button
              onClick={createAccount}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isSubmitting ? "Signing up…" : "Signup"}
            </Button>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Already have an account?</span>
              <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

