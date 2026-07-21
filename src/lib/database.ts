export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string | null
        }
        Insert: {
          id?: string
          email: string
        }
        Update: {
          id?: string
          email?: string
        }
      }
      email_analysis: {
        Row: {
          id: string
          user_id: string
          sender: string
          subject: string
          body: string
          risk_score: number
          level: "low" | "medium" | "high"
          reasons: Json
          recommendations: Json
          created_at: string | null
        }
        Insert: {
          user_id: string
          sender: string
          subject: string
          body: string
          risk_score: number
          level: "low" | "medium" | "high"
          reasons: Json
          recommendations: Json
        }
        Update: {
          id?: string
          user_id?: string
          sender?: string
          subject?: string
          body?: string
          risk_score?: number
          level?: "low" | "medium" | "high"
          reasons?: Json
          recommendations?: Json
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
