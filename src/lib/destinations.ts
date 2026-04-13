// ─── Atlas — Destination Data Access Layer ────────────────────────
// All destination reads go through here.
// Source: SQLite `destinations` table.
// In production: Drizzle ORM queries against PostgreSQL.

import { getDb } from "./db";
import type { Destination, ItineraryData } from "./types";

// ─── Row type from SQLite ─────────────────────────────────────────

interface DestRow {
  slug: string;
  data: string;
}

function parseRow(row: DestRow): Destination {
  return JSON.parse(row.data) as Destination;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * All published destinations, ordered by score descending.
 */
export function getAllDestinations(): Destination[] {
  const db = getDb();
  const rows = db.prepare("SELECT slug, data FROM destinations").all() as DestRow[];
  const dests = rows.map(parseRow);
  dests.sort((a, b) => b.score - a.score);
  return dests;
}

/**
 * Single destination by slug. Returns null if not found.
 */
export function getDestinationBySlug(slug: string): Destination | null {
  const db = getDb();
  const safe = slug.replace(/[^a-z0-9_-]/gi, "");
  const row = db.prepare("SELECT slug, data FROM destinations WHERE slug = ?").get(safe) as DestRow | undefined;
  return row ? parseRow(row) : null;
}

/**
 * Multiple destinations by slugs, preserving order.
 */
export function getDestinationsBySlugs(slugs: string[]): Destination[] {
  const db = getDb();
  const results: Destination[] = [];

  const stmt = db.prepare("SELECT slug, data FROM destinations WHERE slug = ?");

  for (const slug of slugs) {
    const safe = slug.replace(/[^a-z0-9_-]/gi, "");
    const row = stmt.get(safe) as DestRow | undefined;
    if (row) {
      results.push(parseRow(row));
    }
  }

  return results;
}

/**
 * Itinerary data for a destination. Returns null if no itinerary.
 */
export function getItineraryBySlug(slug: string): { destination: Destination; itinerary: ItineraryData } | null {
  const dest = getDestinationBySlug(slug);
  if (!dest || !dest.itinerary) return null;
  return { destination: dest, itinerary: dest.itinerary };
}

/**
 * Destination count.
 */
export function getDestinationCount(): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as n FROM destinations").get() as { n: number };
  return row.n;
}
