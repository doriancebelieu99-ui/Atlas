// ─── Atlas — SQLite Database ──────────────────────────────────────
// Tables: search_sessions, destinations
// ATLAS_DB_PATH env var overrides the default path (used by tests).

import Database from "better-sqlite3";
import path from "path";
import { destinations as seedData } from "@/data/destinations";

function resolveDbPath(): string {
  return process.env.ATLAS_DB_PATH ?? path.join(process.cwd(), "atlas.db");
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dbPath = resolveDbPath();
    _db = new Database(dbPath);
    if (dbPath !== ":memory:") {
      _db.pragma("journal_mode = WAL");
    }
    _db.pragma("synchronous = NORMAL");
    initTables(_db);
  }
  return _db;
}

/**
 * Close and reset the singleton. Used by tests for isolation.
 */
export function resetDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS search_sessions (
      id TEXT PRIMARY KEY,
      answers TEXT NOT NULL,
      preferences TEXT NOT NULL,
      results TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    DELETE FROM search_sessions
    WHERE created_at < datetime('now', '-24 hours')
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      slug TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);

  const count = db.prepare("SELECT COUNT(*) as n FROM destinations").get() as { n: number };
  if (count.n === 0) {
    seedDestinations(db);
  }
}

function seedDestinations(db: Database.Database) {
  const insert = db.prepare("INSERT INTO destinations (slug, data) VALUES (?, ?)");
  const tx = db.transaction(() => {
    for (const [slug, dest] of Object.entries(seedData)) {
      insert.run(slug, JSON.stringify(dest));
    }
  });
  tx();
}
