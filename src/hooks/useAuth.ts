import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) {
        setError(error.message)
      } else {
        setSession(data.session)
        setUser(data.session?.user ?? null)
      }
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setLoading(false)
      setError(error.message)
      throw error
    }

    if (data.user) {
      await (supabase as any)
        .from("profiles")
        .upsert({ id: data.user.id, email: data.user.email ?? email })
    }

    setLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setError(error.message)
      throw error
    }

    setLoading(false)
  }, [])

  const signInWithGitHub = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }

    setLoading(false)
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      error,
      signUp,
      signIn,
      signInWithGitHub,
      signOut,
    }),
    [user, session, loading, error, signUp, signIn, signInWithGitHub, signOut]
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
