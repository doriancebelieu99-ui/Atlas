// ─── Test Setup ───────────────────────────────────────────────────
// Sets ATLAS_DB_PATH to :memory: BEFORE any module import,
// then resets the DB singleton after each suite.

import { beforeAll, afterAll } from "vitest";

// This MUST run before any import of db.ts / sessions.ts / destinations.ts
process.env.ATLAS_DB_PATH = ":memory:";

// Lazy import to ensure env is set first
let resetDb: () => void;

beforeAll(async () => {
  const dbModule = await import("@/lib/db");
  resetDb = dbModule.resetDb;
  // Trigger DB init + seed
  dbModule.getDb();
});

afterAll(() => {
  resetDb?.();
});
