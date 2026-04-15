import { getSession, type SearchSession } from "./sessions";

type ResultsOutcome =
  | { ok: true; session: SearchSession }
  | { ok: false; reason: "missing_sid" | "session_not_found" };

export async function loadResultsData(
  sid?: string | null,
): Promise<ResultsOutcome> {
  if (!sid) {
    return { ok: false, reason: "missing_sid" };
  }

  const session = await getSession(sid);

  if (!session) {
    return { ok: false, reason: "session_not_found" };
  }

  return { ok: true, session };
}