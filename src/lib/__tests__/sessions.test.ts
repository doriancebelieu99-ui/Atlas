// Tests the real src/lib/sessions.ts module.
// DB is in-memory via setup.ts — no atlas.db file touched.

import { describe, it, expect } from "vitest";
import { createSession, getSession } from "@/lib/sessions";
import { randomUUID } from "crypto";
import type { QuizAnswers, PreferencesInput, DestinationScoreResult } from "@/lib/types";

const answers: QuizAnswers = { budget: "medium", duration: "week", group: "couple" };

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
    image: "https://example.com/img.jpg",
    totalScore: 92,
    criteriaScores: {
      budget: 100, season: 85, style: 70,
      duration: 100, logistics: 88, interests: 80, pace: 100,
    },
    highlights: ["Bon budget"],
    limitations: [],
    budgetEstimate: { min: 450, max: 700, variant: "comfort" },
    ambiance: ["Romantique"],
  },
];

describe("createSession (real module)", () => {
  it("returns a valid UUID", () => {
    const id = createSession(answers, prefs, results);
    expect(id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
  });

  it("returns unique IDs on each call", () => {
    const id1 = createSession(answers, prefs, results);
    const id2 = createSession(answers, prefs, results);
    expect(id1).not.toBe(id2);
  });
});

describe("getSession (real module)", () => {
  it("retrieves a session created by createSession", () => {
    const id = createSession(answers, prefs, results);
    const session = getSession(id);

    expect(session).not.toBeNull();
    expect(session!.id).toBe(id);
    expect(session!.answers).toEqual(answers);
    expect(session!.preferences).toEqual(prefs);
    expect(session!.results).toHaveLength(1);
    expect(session!.results[0].slug).toBe("lisbonne");
    expect(session!.results[0].totalScore).toBe(92);
    expect(session!.createdAt).toBeTruthy();
  });

  it("returns null for non-existent UUID", () => {
    const session = getSession(randomUUID());
    expect(session).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getSession("")).toBeNull();
  });

  it("returns null for short string", () => {
    expect(getSession("abc")).toBeNull();
  });

  it("returns null for malicious input", () => {
    expect(getSession("'; DROP TABLE search_sessions; --")).toBeNull();
  });

  it("returns null for path traversal attempt", () => {
    expect(getSession("../../../etc/passwd")).toBeNull();
  });

  it("preserves complex results with multiple destinations", () => {
    const multiResults: DestinationScoreResult[] = [
      { ...results[0] },
      { ...results[0], slug: "porto", name: "Porto", totalScore: 85 },
      { ...results[0], slug: "naples", name: "Naples", totalScore: 78 },
    ];

    const id = createSession(answers, prefs, multiResults);
    const session = getSession(id);

    expect(session!.results).toHaveLength(3);
    expect(session!.results.map((r) => r.slug)).toEqual(["lisbonne", "porto", "naples"]);
    expect(session!.results.map((r) => r.totalScore)).toEqual([92, 85, 78]);
  });

  it("preserves all criteria scores", () => {
    const id = createSession(answers, prefs, results);
    const session = getSession(id);
    const scores = session!.results[0].criteriaScores;

    expect(scores.budget).toBe(100);
    expect(scores.season).toBe(85);
    expect(scores.logistics).toBe(88);
  });
});
