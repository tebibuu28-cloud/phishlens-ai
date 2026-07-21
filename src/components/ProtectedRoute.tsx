import { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-white">
        <div className="rounded-3xl bg-[#0b1220]/90 border border-white/10 p-8 text-center shadow-xl">
          <p className="text-lg font-semibold">Checking your session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
