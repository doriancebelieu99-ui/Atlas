// ─── Atlas — Search Sessions (SQLite) ─────────────────────────────
// Same public API as before: createSession, getSession.
// Storage: SQLite table `search_sessions`.

import { randomUUID } from "crypto";
import { getDb } from "./db";
import type { QuizAnswers, PreferencesInput, DestinationScoreResult } from "./types";

export interface SearchSession {
  id: string;
  answers: QuizAnswers;
  preferences: PreferencesInput;
  results: DestinationScoreResult[];
  createdAt: string;
}

export function createSession(
  answers: QuizAnswers,
  preferences: PreferencesInput,
  results: DestinationScoreResult[],
): string {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO search_sessions (id, answers, preferences, results, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    JSON.stringify(answers),
    JSON.stringify(preferences),
    JSON.stringify(results),
    now,
  );

  return id;
}

export function getSession(id: string): SearchSession | null {
  const db = getDb();

  // Sanitize: only allow UUID characters
  const safe = id.replace(/[^a-f0-9-]/gi, "");
  if (safe.length < 36) return null;

  const row = db.prepare(
    "SELECT id, answers, preferences, results, created_at FROM search_sessions WHERE id = ?",
  ).get(safe) as {
    id: string;
    answers: string;
    preferences: string;
    results: string;
    created_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    answers: JSON.parse(row.answers),
    preferences: JSON.parse(row.preferences),
    results: JSON.parse(row.results),
    createdAt: row.created_at,
  };
}
