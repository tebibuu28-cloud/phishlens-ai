// src/lib/history.ts
// ============================================================
// ONE authoritative place that saves analysis history.
// All analyzers MUST use only this function.
// ============================================================

import { supabase } from "@/lib/supabase";

export interface HistoryPayload {
  type: "email" | "url";
  target: string;
  risk_score: number;
  risk_level: string;
  threats: string[];
}

/**
 * Saves an analysis result to the backend history endpoint.
 *
 * Flow:
 *  1. Retrieve the current Supabase session (where the JWT lives).
 *  2. Guard: throw if there is no authenticated session.
 *  3. POST /api/history with Authorization: Bearer <token>.
 *  4. Throw a descriptive error on any non-2xx response so callers
 *     can surface the failure instead of silently dropping it.
 */
export async function saveAnalysisHistory(payload: HistoryPayload): Promise<void> {
  console.log("SAVING HISTORY");
  // ── 1. Get JWT ────────────────────────────────────────────
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("SAVE FAILED (session error)", sessionError);
    throw new Error(`[history] Could not retrieve session: ${sessionError.message}`);
  }

  const token = sessionData?.session?.access_token;

  if (!token) {
    console.error("SAVE FAILED: No active session — user is not logged in.");
    throw new Error("[history] No active session — user is not logged in.");
  }

  // ── 2. Build & validate payload ───────────────────────────
  const body: HistoryPayload = {
    type: payload.type,
    target: payload.target,
    risk_score: payload.risk_score,
    risk_level: String(payload.risk_level).toLowerCase(),
    // Ensure threats are stored as strings (avoid storing raw objects)
    threats: (Array.isArray(payload.threats) ? payload.threats : []).map((t: any) => {
      if (t === null || t === undefined) return ""
      if (typeof t === "string") return t
      if (typeof t === "object") return (t.reason || t.message || t.title) ? String(t.reason ?? t.message ?? t.title) : JSON.stringify(t)
      return String(t)
    }),
  };

  console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

  // ── 3. POST /api/history ──────────────────────────────────
  try {
    const response = await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Express verifyJwt checks Authorization header first, then cookie.
        // Supabase JS stores tokens in localStorage — not as an HTTP cookie —
        // so we MUST send the token explicitly as a Bearer header.
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("RESPONSE STATUS:", response.status);

    let detail = "";
    try {
      const json = await response.clone().json();
      detail = json?.error ?? JSON.stringify(json);
      console.log("RESPONSE BODY:", JSON.stringify(json, null, 2));
    } catch {
      detail = await response.clone().text().catch(() => "");
      console.log("RESPONSE BODY (text):", detail);
    }

    // ── 4. Throw on non-2xx ───────────────────────────────────
    if (!response.ok) {
      console.error("SAVE FAILED with status", response.status);
      throw new Error(
        `[history] POST /api/history failed ${response.status}: ${detail}`
      );
    }

    console.log("SAVE SUCCESS");
  } catch (err) {
    console.error("SAVE FAILED (exception):", err);
    if (err instanceof Error) {
      console.error("Stack Trace:", err.stack);
    }
    throw err;
  }
}
