// ─── Atlas — Results Data Loader ──────────────────────────────────
// Extracted from results/page.tsx for testability.
// Server-only: reads session from SQLite.

import { getSession, type SearchSession } from "./sessions";

export type ResultsLoadOutcome =
  | { ok: true; session: SearchSession }
  | { ok: false; reason: "missing_sid" | "session_not_found" };

export function loadResultsData(sid: string | undefined | null): ResultsLoadOutcome {
  if (!sid) {
    return { ok: false, reason: "missing_sid" };
  }

  const session = getSession(sid);

  if (!session) {
    return { ok: false, reason: "session_not_found" };
  }

  return { ok: true, session };
}
