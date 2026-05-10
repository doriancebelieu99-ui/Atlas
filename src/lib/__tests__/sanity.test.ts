// Sanity check: scoring engine produces differentiated, sensible results
// across representative user profiles. Not a unit test — a smell test.

import { describe, it, expect } from "vitest";
import { rankDestinations } from "@/lib/scoring";
import { destinationList } from "@/data/destinations";

const dests = destinationList;

describe("Sanity check — scoring differentiation", () => {
  it("famille budget serré printemps — should surface accessible, family-friendly destinations", () => {
    const results = rankDestinations(
      {
        budget: "low",
        durationDays: 7,
        period: "spring",
        groupType: "family",
        pace: "balanced",
        styles: ["authentic_local"],
        interests: ["food", "history"],
        environment: "urban",
        flightTolerance: "short",
      },
      dests,
    );

    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    console.log("Famille budget serré printemps →", results.map((r) => `${r.name} (${r.totalScore}%)`).join(", "));
    // Top pick should be affordable — Lisbonne, Porto, Séville or Barcelone
    expect(["Lisbonne", "Porto", "Séville", "Barcelone"]).toContain(top.name);
    // Budget not zero (destination is accessible at some level)
    expect(top.criteriaScores.budget).toBeGreaterThan(0);
    // Kyoto must be filtered out (flight > 3h from Paris with short tolerance → flightTime=15 + season penalty)
    const kyoto = results.find((r) => r.name === "Kyoto");
    expect(kyoto).toBeUndefined();
  });

  it("couple premium automne nature — should surface nature/mixed destinations", () => {
    const results = rankDestinations(
      {
        budget: "premium",
        durationDays: 10,
        period: "autumn",
        groupType: "couple",
        pace: "balanced",
        styles: ["calme_contemplation", "nature_grand_air"],
        interests: ["nature", "art"],
        environment: "nature",
        flightTolerance: "medium",
      },
      dests,
    );

    expect(results.length).toBeGreaterThan(0);
    console.log("Couple premium automne nature →", results.map((r) => `${r.name} (${r.totalScore}%)`).join(", "));
    // Reykjavik or Madère should rank high (nature/coastal + autumn)
    const top3 = results.slice(0, 3).map((r) => r.name);
    const naturalDests = ["Reykjavik", "Madère", "Crète"];
    expect(top3.some((n) => naturalDests.includes(n))).toBe(true);
  });

  it("amis été vol court — should surface short-haul summer destinations", () => {
    const results = rankDestinations(
      {
        budget: "medium",
        durationDays: 5,
        period: "summer",
        groupType: "friends",
        pace: "dense",
        styles: ["energie_urbaine", "food_artdevivre"],
        interests: ["nightlife", "food"],
        environment: "urban",
        flightTolerance: "short",
      },
      dests,
    );

    expect(results.length).toBeGreaterThan(0);
    console.log("Amis été vol court →", results.map((r) => `${r.name} (${r.totalScore}%)`).join(", "));
    // flightTolerance: "short" is now a hard filter — all results must be ≤ 3h from Paris
    for (const r of results) {
      const dest = dests.find((d) => d.slug === r.slug)!;
      expect(dest.flightHoursFromParis).toBeLessThanOrEqual(3);
    }
    // Istanbul (3.5h), Marrakech (3.5h), Madère (3.5h), Crète (3.5h), Kyoto (12h) must be absent
    const filtered = ["Istanbul", "Marrakech", "Madère", "Crète", "Kyoto"];
    for (const name of filtered) {
      expect(results.find((r) => r.name === name)).toBeUndefined();
    }
  });

  it("solo budget medium hiver coastal — Crète should score poorly (avoid) but not crash", () => {
    const results = rankDestinations(
      {
        budget: "medium",
        durationDays: 7,
        period: "winter",
        groupType: "solo",
        pace: "relaxed",
        styles: ["calme_contemplation"],
        interests: ["nature"],
        environment: "coastal",
        flightTolerance: "medium",
      },
      dests,
    );

    expect(results.length).toBeGreaterThan(0);
    console.log("Solo budget medium hiver coastal →", results.map((r) => `${r.name} (${r.totalScore}%)`).join(", "));
    // Crète in winter has poor season — it may be filtered out or score very low
    const crete = results.find((r) => r.name === "Crète");
    if (crete) {
      expect(crete.criteriaScores.season).toBeLessThan(60);
    }
  });

  it("scores are bounded 0–100 for all destinations across all profiles", () => {
    const profiles = [
      { budget: "low" as const, durationDays: 3, groupType: "solo" as const, pace: "relaxed" as const },
      { budget: "premium" as const, durationDays: 14, groupType: "couple" as const, pace: "dense" as const },
      { budget: "medium" as const, durationDays: 7, groupType: "family" as const, pace: "balanced" as const },
    ];

    for (const prefs of profiles) {
      const results = rankDestinations(prefs, dests, 20);
      for (const r of results) {
        expect(r.totalScore).toBeGreaterThanOrEqual(0);
        expect(r.totalScore).toBeLessThanOrEqual(100);
        for (const [, v] of Object.entries(r.criteriaScores)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("no more than 2 destinations per country in results", () => {
    const results = rankDestinations(
      { budget: "medium", durationDays: 7, groupType: "couple", pace: "balanced" },
      dests,
      20,
    );
    const countryCount: Record<string, number> = {};
    for (const r of results) {
      countryCount[r.country] = (countryCount[r.country] ?? 0) + 1;
      expect(countryCount[r.country]).toBeLessThanOrEqual(2);
    }
  });

  it("anti-cannibalisation — couple premium automne nature : Reykjavik devance Bergen", () => {
    // Bergen (90%) ne doit pas supplanter Reykjavik (91%) sur son profil de référence.
    const results = rankDestinations(
      {
        budget: "premium",
        durationDays: 10,
        period: "autumn",
        groupType: "couple",
        pace: "balanced",
        styles: ["calme_contemplation", "nature_grand_air"],
        interests: ["nature", "art"],
        environment: "nature",
        flightTolerance: "medium",
      },
      dests,
      20,
    );

    const reykIdx = results.findIndex((r) => r.slug === "reykjavik");
    const bergIdx = results.findIndex((r) => r.slug === "bergen");
    expect(reykIdx, "Reykjavik doit apparaître dans le top 20").toBeGreaterThanOrEqual(0);
    expect(bergIdx, "Bergen doit apparaître dans le top 20").toBeGreaterThanOrEqual(0);
    expect(reykIdx, "Reykjavik doit devancer Bergen sur ce profil").toBeLessThan(bergIdx);
  });

  it("visibilité — Copenhague top 5 sur profil couple premium printemps urban", () => {
    // Copenhague (94%) est une destination urbaine-design à fort score premium —
    // elle doit apparaître dans le top 5 sur son profil cible.
    const results = rankDestinations(
      {
        budget: "premium",
        durationDays: 4,
        period: "spring",
        groupType: "couple",
        pace: "balanced",
        styles: ["energie_urbaine", "food_artdevivre"],
        interests: ["food", "art"],
        environment: "urban",
        flightTolerance: "short",
      },
      dests,
      20,
    );

    const cphIdx = results.findIndex((r) => r.slug === "copenhague");
    expect(cphIdx, "Copenhague doit apparaître dans le top 20").toBeGreaterThanOrEqual(0);
    expect(cphIdx, "Copenhague doit être dans le top 5 sur ce profil").toBeLessThan(5);
  });

  it("anti-cannibalisation — famille low-spring-short : Vienne absente, Budapest sous Séville", () => {
    // Protège l'ordre éditorial : les capitales d'Europe centrale ne doivent
    // pas supplanter les destinations méditerranéennes sur un profil famille/budget serré.
    const results = rankDestinations(
      {
        budget: "low",
        durationDays: 7,
        period: "spring",
        groupType: "family",
        pace: "balanced",
        styles: ["authentic_local"],
        interests: ["food", "history"],
        environment: "urban",
        flightTolerance: "short",
      },
      dests,
      20,
    );

    // Vienne : economy.min (65) > budget:low userMax (60) → budget score = 0 → hard-filtré
    expect(results.find((r) => r.name === "Vienne")).toBeUndefined();

    // Séville et Budapest doivent toutes deux apparaître dans le top 20
    const sevIdx = results.findIndex((r) => r.name === "Séville");
    const budIdx = results.findIndex((r) => r.name === "Budapest");
    expect(sevIdx, "Séville doit être dans le top 20").toBeGreaterThanOrEqual(0);
    expect(budIdx, "Budapest doit être dans le top 20").toBeGreaterThanOrEqual(0);

    // Budapest doit être classée après Séville
    expect(budIdx, "Budapest ne doit pas devancer Séville sur ce profil").toBeGreaterThan(sevIdx);
  });
});
