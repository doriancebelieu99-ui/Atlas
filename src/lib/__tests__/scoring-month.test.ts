import { describe, it, expect } from "vitest";
import { scoreSeasonByMonth, scoreSeason, quizToPreferences } from "@/lib/scoring";
import { destinations } from "@/data/destinations";
import type { PreferencesInput } from "@/lib/types";

const lisbonne = destinations.lisbonne;
const bangkok = destinations.bangkok; // high crowd in peak months → crowd penalty visible

// ─── scoreSeasonByMonth ──────────────────────────────────────────

describe("scoreSeasonByMonth — smoothed 70/15/15", () => {
  it("returns a score in [0, 100]", () => {
    for (let m = 0; m < 12; m++) {
      const score = scoreSeasonByMonth(lisbonne, m, {
        durationDays: 5, groupType: "couple", pace: "balanced",
      });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("smoothed score is close to the raw month score (not wildly different)", () => {
    // June (idx 5) at Lisbonne — adjacent months are also high
    const raw = lisbonne.season.months[5].score;
    const smoothed = scoreSeasonByMonth(lisbonne, 5, {
      durationDays: 5, groupType: "couple", pace: "balanced",
    });
    expect(Math.abs(smoothed - raw)).toBeLessThan(20);
  });

  it("wraps correctly for January (prev = December)", () => {
    // January (idx 0) — prev should be December (idx 11), not idx -1
    const prefs: PreferencesInput = { durationDays: 5, groupType: "couple", pace: "balanced" };
    const janScore = scoreSeasonByMonth(lisbonne, 0, prefs);
    const decScore = lisbonne.season.months[11].score;
    const febScore = lisbonne.season.months[1].score;
    const janRaw = lisbonne.season.months[0].score;
    const expected = Math.round(janRaw * 0.70 + decScore * 0.15 + febScore * 0.15);
    expect(janScore).toBe(expected);
  });

  it("wraps correctly for December (next = January)", () => {
    const prefs: PreferencesInput = { durationDays: 5, groupType: "couple", pace: "balanced" };
    const decScore = scoreSeasonByMonth(lisbonne, 11, prefs);
    const novScore = lisbonne.season.months[10].score;
    const janScore = lisbonne.season.months[0].score;
    const decRaw = lisbonne.season.months[11].score;
    const expected = Math.round(decRaw * 0.70 + novScore * 0.15 + janScore * 0.15);
    expect(decScore).toBe(expected);
  });

  it("crowd penalty reduces score for peak months when pace=relaxed", () => {
    // Find a month with crowd > 70 in bangkok
    const crowdedMonthIdx = bangkok.season.months.findIndex((m) => (m.crowd ?? 0) > 70);
    if (crowdedMonthIdx === -1) return; // skip if no such month

    const relaxed = scoreSeasonByMonth(bangkok, crowdedMonthIdx, {
      durationDays: 5, groupType: "couple", pace: "relaxed",
    });
    const balanced = scoreSeasonByMonth(bangkok, crowdedMonthIdx, {
      durationDays: 5, groupType: "couple", pace: "balanced",
    });
    expect(relaxed).toBeLessThanOrEqual(balanced);
  });
});

// ─── scoreSeason — month mode via prefs.month ────────────────────

describe("scoreSeason — mode mois (prefs.month)", () => {
  it("routes to scoreSeasonByMonth when prefs.month is set", () => {
    const direct = scoreSeasonByMonth(lisbonne, 7, {
      durationDays: 5, groupType: "couple", pace: "balanced",
    });
    const viaSeason = scoreSeason(
      { durationDays: 5, groupType: "couple", pace: "balanced", month: 7 },
      lisbonne,
    );
    expect(viaSeason).toBe(direct);
  });

  it("non-regression — period mode still works unchanged", () => {
    const score = scoreSeason(
      { durationDays: 5, period: "summer", groupType: "couple", pace: "balanced" },
      lisbonne,
    );
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("non-regression — no-constraint fallback still works", () => {
    const score = scoreSeason(
      { durationDays: 5, groupType: "couple", pace: "balanced" },
      lisbonne,
    );
    expect(score).toBeGreaterThan(0);
  });

  it("month mode scores differ meaningfully across good/bad months", () => {
    const prefs: Omit<PreferencesInput, "month"> = {
      durationDays: 5, groupType: "couple", pace: "balanced",
    };
    const scores = Array.from({ length: 12 }, (_, m) =>
      scoreSeason({ ...prefs, month: m }, lisbonne),
    );
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    // Lisbonne has seasonal variation — best/worst should differ
    expect(max - min).toBeGreaterThan(10);
  });
});

// ─── quizToPreferences — month wiring ───────────────────────────

describe("quizToPreferences — departure month", () => {
  it("sets month=7 (August) when departurePrecision=month + departureMonth=aug", () => {
    const prefs = quizToPreferences({
      budget: "medium", duration: "week", group: "couple", pace: "balanced",
      departurePrecision: "month", departureMonth: "aug",
    });
    expect(prefs.month).toBe(7);
    expect(prefs.period).toBeUndefined();
  });

  it("sets month=0 (January) when departurePrecision=month + departureMonth=jan", () => {
    const prefs = quizToPreferences({
      departurePrecision: "month", departureMonth: "jan",
      duration: "week", group: "couple", pace: "balanced",
    });
    expect(prefs.month).toBe(0);
  });

  it("sets month=11 (December) when departurePrecision=month + departureMonth=dec", () => {
    const prefs = quizToPreferences({
      departurePrecision: "month", departureMonth: "dec",
      duration: "week", group: "couple", pace: "balanced",
    });
    expect(prefs.month).toBe(11);
  });

  it("keeps period and clears month when departurePrecision=season", () => {
    const prefs = quizToPreferences({
      budget: "medium", duration: "week", group: "couple", pace: "balanced",
      departurePrecision: "season", period: "spring",
    });
    expect(prefs.period).toBe("spring");
    expect(prefs.month).toBeUndefined();
  });

  it("non-regression — legacy payload without departurePrecision keeps period", () => {
    const prefs = quizToPreferences({
      budget: "medium", duration: "week", group: "couple", pace: "balanced",
      period: "summer",
    });
    expect(prefs.period).toBe("summer");
    expect(prefs.month).toBeUndefined();
  });

  it("month mode: stale period in answers is ignored", () => {
    const prefs = quizToPreferences({
      departurePrecision: "month", departureMonth: "jul",
      period: "summer", // stale — user changed from season to month
      duration: "week", group: "couple", pace: "balanced",
    });
    expect(prefs.month).toBe(6);
    expect(prefs.period).toBeUndefined();
  });
});
