// Tests the real src/lib/results.ts module.
// Uses real createSession + loadResultsData against in-memory DB.

import { describe, it, expect } from "vitest";
import { loadResultsData } from "@/lib/results";
import { createSession } from "@/lib/sessions";
import { randomUUID } from "crypto";
import type { QuizAnswers, PreferencesInput, DestinationScoreResult } from "@/lib/types";

const answers: QuizAnswers = { budget: "medium", duration: "week" };

const prefs: PreferencesInput = {
  budget: "medium",
  durationDays: 5,
  groupType: "couple",
  pace: "balanced",
};

const results: DestinationScoreResult[] = [
  {
    slug: "lisbonne",
    name: "Lisbonne",
    country: "Portugal",
    image: "img.jpg",
    totalScore: 90,
    criteriaScores: {
      budget: 95, season: 85, style: 70,
      duration: 100, logistics: 88, interests: 80, pace: 100, group: 80,
      environment: 75, flightTime: 100, flightBudget: 100,
    },
    highlights: ["Bon budget"],
    limitations: [],
    budgetEstimate: { min: 450, max: 700, variant: "comfort" },
    ambiance: ["Romantique"],
    hasItinerary: true,
  },
];

describe("loadResultsData", () => {
  // ─── Valid session ────────────────────────────────────────────

  it("returns ok:true with full session for valid sid", async () => {
    const sid = await createSession(answers, prefs, results);
    const outcome = await loadResultsData(sid);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return; // type narrowing

    expect(outcome.session.id).toBe(sid);
    expect(outcome.session.answers).toEqual(answers);
    expect(outcome.session.preferences).toEqual(prefs);
    expect(outcome.session.results).toHaveLength(1);
    expect(outcome.session.results[0].slug).toBe("lisbonne");
    expect(outcome.session.results[0].totalScore).toBe(90);
  });

  // ─── Missing sid ──────────────────────────────────────────────

  it("returns missing_sid for undefined", async () => {
    const outcome = await loadResultsData(undefined);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe("missing_sid");
  });

  it("returns missing_sid for null", async () => {
    const outcome = await loadResultsData(null);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe("missing_sid");
  });

  it("returns missing_sid for empty string", async () => {
    const outcome = await loadResultsData("");
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe("missing_sid");
  });

  // ─── Invalid sid ──────────────────────────────────────────────

  it("returns session_not_found for unknown UUID", async () => {
    const outcome = await loadResultsData(randomUUID());
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe("session_not_found");
  });

  it("returns session_not_found for malicious sid", async () => {
    const outcome = await loadResultsData("'; DROP TABLE search_sessions; --");
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe("session_not_found");
  });

  it("returns session_not_found for random garbage", async () => {
    const outcome = await loadResultsData("not-a-real-session-id-at-all");
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe("session_not_found");
  });
});
