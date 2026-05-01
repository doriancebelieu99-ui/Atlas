import { describe, it, expect } from "vitest";
import {
  scoreBudget,
  scoreSeason,
  scoreDuration,
  scoreLogistics,
  scoreInterests,
  scorePace,
  scoreDestination,
  rankDestinations,
  quizToPreferences,
  adjustWeights,
} from "@/lib/scoring";
import { destinations, destinationList } from "@/data/destinations";
import type { PreferencesInput } from "@/lib/types";

const lisbonne = destinations.lisbonne;
const marrakech = destinations.marrakech;

// ─── quizToPreferences ──────────────────────────────────────────

describe("quizToPreferences", () => {
  it("converts quiz answers to PreferencesInput", () => {
    const prefs = quizToPreferences({
      budget: "medium",
      duration: "week",
      period: "spring",
      group: "couple",
      pace: "balanced",
      interests: ["food", "art"],
    });

    expect(prefs.budget).toBe("medium");
    expect(prefs.durationDays).toBe(5);
    expect(prefs.period).toBe("spring");
    expect(prefs.groupType).toBe("couple");
    expect(prefs.pace).toBe("balanced");
    expect(prefs.interests).toEqual(["food", "art"]);
  });

  it("applies defaults for missing fields", () => {
    const prefs = quizToPreferences({ budget: "low" });

    expect(prefs.budget).toBe("low");
    expect(prefs.durationDays).toBe(5); // default "week"
    expect(prefs.groupType).toBe("couple"); // default
    expect(prefs.pace).toBe("balanced"); // default
    expect(prefs.interests).toEqual([]);
  });
});

// ─── adjustWeights ──────────────────────────────────────────────

describe("adjustWeights", () => {
  it("weights sum to 1", () => {
    const prefs: PreferencesInput = {
      budget: "medium",
      durationDays: 5,
      groupType: "couple",
      pace: "balanced",
    };
    const w = adjustWeights(prefs);
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("increases budget weight for low budget", () => {
    const low = adjustWeights({ budget: "low", durationDays: 5, groupType: "solo", pace: "balanced" });
    const med = adjustWeights({ budget: "medium", durationDays: 5, groupType: "solo", pace: "balanced" });
    expect(low.budget).toBeGreaterThan(med.budget);
  });

  it("increases logistics weight for family", () => {
    const fam = adjustWeights({ budget: "medium", durationDays: 5, groupType: "family", pace: "balanced" });
    const solo = adjustWeights({ budget: "medium", durationDays: 5, groupType: "solo", pace: "balanced" });
    expect(fam.logistics).toBeGreaterThan(solo.logistics);
  });
});

// ─── Individual scorers ─────────────────────────────────────────

describe("scoreBudget", () => {
  it("returns high score when budget matches comfort range", () => {
    const score = scoreBudget(
      { budget: "medium", durationDays: 5, groupType: "couple", pace: "balanced" },
      lisbonne, // comfort: 90-140, medium user: 60-140
    );
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("returns 0 when budget is far below economy", () => {
    // Fake a very cheap budget against a hypothetically expensive destination
    const score = scoreBudget(
      { budget: "low", durationDays: 5, groupType: "solo", pace: "balanced" },
      { ...lisbonne, budget: { ...lisbonne.budget, economy: { min: 200, max: 300 } } },
    );
    expect(score).toBe(0);
  });

  it("caps at 80 when budget far exceeds premium", () => {
    const score = scoreBudget(
      { budget: "premium", durationDays: 5, groupType: "solo", pace: "balanced" },
      marrakech, // premium max: 250, user min: 280
    );
    expect(score).toBe(80);
  });
});

describe("scoreSeason", () => {
  it("uses period mapping when no month specified", () => {
    const score = scoreSeason(
      { budget: "medium", durationDays: 5, period: "spring", groupType: "couple", pace: "balanced" },
      lisbonne, // spring month 3 (April) = score 85
    );
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it("uses direct month when specified (smoothed: 70% June + 15% May + 15% July)", () => {
    const score = scoreSeason(
      { budget: "medium", durationDays: 5, month: 5, groupType: "couple", pace: "balanced" },
      lisbonne, // June raw ~95, smoothed result slightly lower due to 70/15/15 weighting
    );
    expect(score).toBeGreaterThanOrEqual(80);
  });
});

describe("scoreDuration", () => {
  it("returns 100 when duration matches ideal range", () => {
    // Lisbonne: "3 à 5 jours", user: 4
    const score = scoreDuration(
      { budget: "medium", durationDays: 4, groupType: "couple", pace: "balanced" },
      lisbonne,
    );
    expect(score).toBe(100);
  });

  it("penalizes when too short", () => {
    const score = scoreDuration(
      { budget: "medium", durationDays: 1, groupType: "couple", pace: "balanced" },
      lisbonne, // ideal 3-5, user 1 → deficit 2
    );
    expect(score).toBeLessThan(80);
  });
});

describe("scoreLogistics", () => {
  it("returns destination logistics score", () => {
    const score = scoreLogistics(
      { budget: "medium", durationDays: 5, groupType: "couple", pace: "balanced" },
      lisbonne, // logisticsScore: 88
    );
    expect(score).toBe(88);
  });

  it("penalizes low logistics for family", () => {
    const score = scoreLogistics(
      { budget: "medium", durationDays: 5, groupType: "family", pace: "balanced" },
      marrakech, // logisticsScore: 62
    );
    expect(score).toBeLessThanOrEqual(62);
  });
});

describe("scorePace", () => {
  it("returns 100 for matching pace", () => {
    const score = scorePace(
      { budget: "medium", durationDays: 5, groupType: "couple", pace: "balanced" },
      lisbonne, // pace: "Équilibré"
    );
    expect(score).toBe(100);
  });

  it("returns lower score for mismatched pace", () => {
    const score = scorePace(
      { budget: "medium", durationDays: 5, groupType: "couple", pace: "dense" },
      lisbonne,
    );
    expect(score).toBeLessThan(100);
  });
});

describe("scoreInterests", () => {
  it("returns 70 when no interests specified", () => {
    const score = scoreInterests(
      { budget: "medium", durationDays: 5, groupType: "couple", pace: "balanced" },
      lisbonne,
    );
    expect(score).toBe(70);
  });

  it("returns higher score when interests match", () => {
    const score = scoreInterests(
      { budget: "medium", durationDays: 5, groupType: "couple", pace: "balanced", interests: ["food", "history"] },
      lisbonne, // gastronomique, patrimoine
    );
    expect(score).toBeGreaterThan(70);
  });
});

// ─── Full scoring ───────────────────────────────────────────────

describe("scoreDestination", () => {
  it("returns a complete score result", () => {
    const prefs: PreferencesInput = {
      budget: "medium",
      durationDays: 5,
      period: "spring",
      groupType: "couple",
      pace: "balanced",
      interests: ["food", "art"],
    };

    const result = scoreDestination(prefs, lisbonne);

    expect(result.slug).toBe("lisbonne");
    expect(result.name).toBe("Lisbonne");
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.criteriaScores.budget).toBeGreaterThanOrEqual(0);
    expect(result.criteriaScores.season).toBeGreaterThanOrEqual(0);
    expect(result.budgetEstimate.min).toBeGreaterThan(0);
    expect(result.budgetEstimate.max).toBeGreaterThan(result.budgetEstimate.min);
    expect(result.highlights.length).toBeGreaterThanOrEqual(0);
    expect(result.ambiance).toContain("Romantique");
  });
});

// ─── rankDestinations ───────────────────────────────────────────

describe("rankDestinations", () => {
  const prefs: PreferencesInput = {
    budget: "medium",
    durationDays: 5,
    period: "spring",
    groupType: "couple",
    pace: "balanced",
    interests: ["food"],
  };

  it("returns sorted results", () => {
    const results = rankDestinations(prefs, destinationList);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].totalScore).toBeGreaterThanOrEqual(results[i].totalScore);
    }
  });

  it("respects max 2 per country diversity rule", () => {
    const results = rankDestinations(prefs, destinationList);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r.country] = (counts[r.country] ?? 0) + 1;
      expect(counts[r.country]).toBeLessThanOrEqual(2);
    }
  });

  it("filters out budget score = 0", () => {
    const results = rankDestinations(prefs, destinationList);
    for (const r of results) {
      expect(r.criteriaScores.budget).toBeGreaterThan(0);
    }
  });

  it("filters out season score < 20", () => {
    const results = rankDestinations(prefs, destinationList);
    for (const r of results) {
      expect(r.criteriaScores.season).toBeGreaterThanOrEqual(20);
    }
  });

  it("respects maxResults limit", () => {
    const results = rankDestinations(prefs, destinationList, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("hard-filters destinations > 3h when flightTolerance is short", () => {
    const shortPrefs: PreferencesInput = { ...prefs, flightTolerance: "short" };
    const results = rankDestinations(shortPrefs, destinationList);
    for (const r of results) {
      const dest = destinationList.find((d) => d.slug === r.slug)!;
      expect(dest.flightHoursFromParis).toBeLessThanOrEqual(3);
    }
  });

  it("hard-filters destinations > 7h when flightTolerance is medium", () => {
    const medPrefs: PreferencesInput = { ...prefs, flightTolerance: "medium" };
    const results = rankDestinations(medPrefs, destinationList);
    for (const r of results) {
      const dest = destinationList.find((d) => d.slug === r.slug)!;
      expect(dest.flightHoursFromParis).toBeLessThanOrEqual(7);
    }
    expect(results.find((r) => r.name === "Kyoto")).toBeUndefined();
  });

  it("does not filter destinations when flightTolerance is any", () => {
    const anyPrefs: PreferencesInput = { ...prefs, flightTolerance: "any" };
    const shortPrefs: PreferencesInput = { ...prefs, flightTolerance: "short" };
    const anyResults = rankDestinations(anyPrefs, destinationList);
    const shortResults = rankDestinations(shortPrefs, destinationList);
    expect(anyResults.length).toBeGreaterThanOrEqual(shortResults.length);
  });
});
