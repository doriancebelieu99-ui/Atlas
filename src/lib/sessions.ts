import { randomUUID } from "crypto";
import { kv } from "@vercel/kv";
import type { QuizAnswers, PreferencesInput, DestinationScoreResult } from "./types";

export interface SearchSession {
  id: string;
  answers: QuizAnswers;
  preferences: PreferencesInput;
  results: DestinationScoreResult[];
  createdAt: string;
}

const isKVEnabled = Boolean(process.env.KV_REST_API_URL);

function sanitizeSessionId(id: string): string | null {
  const safe = id.replace(/[^a-f0-9-]/gi, "");
  if (safe.length < 36) return null;
  return safe;
}

async function createSqliteSession(
  answers: QuizAnswers,
  preferences: PreferencesInput,
  results: DestinationScoreResult[],
): Promise<string> {
  const { getDb } = await import("./db");
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

async function getSqliteSession(id: string): Promise<SearchSession | null> {
  const safe = sanitizeSessionId(id);
  if (!safe) return null;

  const { getDb } = await import("./db");
  const db = getDb();

  const row = db
    .prepare(
      "SELECT id, answers, preferences, results, created_at FROM search_sessions WHERE id = ?",
    )
    .get(safe) as
    | {
        id: string;
        answers: string;
        preferences: string;
        results: string;
        created_at: string;
      }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    answers: JSON.parse(row.answers),
    preferences: JSON.parse(row.preferences),
    results: JSON.parse(row.results),
    createdAt: row.created_at,
  };
}

async function createKvSession(
  answers: QuizAnswers,
  preferences: PreferencesInput,
  results: DestinationScoreResult[],
): Promise<string> {
  const id = randomUUID();
  const now = new Date().toISOString();

  const session: SearchSession = {
    id,
    answers,
    preferences,
    results,
    createdAt: now,
  };

  await kv.set(`session:${id}`, session, { ex: 60 * 60 * 24 });

  return id;
}

async function getKvSession(id: string): Promise<SearchSession | null> {
  const safe = sanitizeSessionId(id);
  if (!safe) return null;

  const session = await kv.get<SearchSession>(`session:${safe}`);
  return session ?? null;
}

export async function createSession(
  answers: QuizAnswers,
  preferences: PreferencesInput,
  results: DestinationScoreResult[],
): Promise<string> {
  if (isKVEnabled) {
    return createKvSession(answers, preferences, results);
  }

  return createSqliteSession(answers, preferences, results);
}

export async function getSession(id: string): Promise<SearchSession | null> {
  if (isKVEnabled) {
    return getKvSession(id);
  }

  return getSqliteSession(id);
}