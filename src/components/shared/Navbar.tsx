import { Link } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { Button } from "../ui/button"
import { useAuth } from "@/hooks/useAuth"

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <ShieldCheck className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-white">
            Phish<span className="text-blue-500">Lens</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            About
          </Link>
          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
                {user.email}
              </span>
              <Button onClick={() => void signOut()} variant="secondary" size="sm" className="text-white border border-white/10 bg-white/5 hover:bg-white/10">
                Logout
              </Button>
              <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Login
              </Link>
              <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
          <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/analyzer">Try Analyzer</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
