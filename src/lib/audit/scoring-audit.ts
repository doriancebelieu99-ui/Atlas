// ─── Scoring Audit — diagnostic complet ──────────────────────────
// Montre le classement INTÉGRAL (26 destinations) avec scores détaillés
// sur 5 profils contrastés, pour trouver la vraie cause du problème.

import { describe, it } from "vitest";
import { scoreDestination, rankDestinations, quizToPreferences, adjustWeights } from "@/lib/scoring";
import { destinations as destMap } from "@/data/destinations";
import type { QuizAnswers } from "@/lib/types";

const ALL_DESTS = Object.values(destMap);

function fullRanking(label: string, answers: QuizAnswers, top = 26) {
  const prefs = quizToPreferences(answers);
  const weights = adjustWeights(prefs);

  const results = ALL_DESTS.map((d) => scoreDestination(prefs, d))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Apply hard filters (same as rankDestinations)
  const filtered = results.filter((r) => {
    if (prefs.budget && r.criteriaScores.budget === 0) return false;
    if (r.criteriaScores.season < 20) return false;
    return true;
  });

  const flightMap: Record<string, number> = {};
  ALL_DESTS.forEach((d) => { flightMap[d.slug] = d.flightHoursFromParis; });

  console.log(`\n${"═".repeat(80)}`);
  console.log(`PROFIL : ${label}`);
  console.log(`Poids effectifs : ${JSON.stringify(
    Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, Math.round(v * 100) + "%"]))
  )}`);
  console.log(`${"─".repeat(80)}`);
  console.log(
    `${"#".padEnd(3)} ${"Destination".padEnd(16)} ${"Pays".padEnd(12)} ${"Vol".padEnd(5)} ${"TOT".padEnd(5)} ` +
    `${"BDG".padEnd(5)} ${"SZN".padEnd(5)} ${"STY".padEnd(5)} ${"DUR".padEnd(5)} ` +
    `${"LOG".padEnd(5)} ${"INT".padEnd(5)} ${"PCE".padEnd(5)} ${"GRP".padEnd(5)} ${"ENV".padEnd(5)} ${"FLT"}`
  );
  filtered.slice(0, top).forEach((r, i) => {
    const cs = r.criteriaScores;
    const h = flightMap[r.slug] ?? "?";
    const longHaul = (h as number) > 7 ? "✈" : " ";
    console.log(
      `${(i + 1).toString().padEnd(3)} ${(r.name + longHaul).padEnd(17)} ${r.country.padEnd(12)} ${String(h).padEnd(5)} ${r.totalScore.toString().padEnd(5)} ` +
      `${cs.budget.toString().padEnd(5)} ${cs.season.toString().padEnd(5)} ${cs.style.toString().padEnd(5)} ${cs.duration.toString().padEnd(5)} ` +
      `${cs.logistics.toString().padEnd(5)} ${cs.interests.toString().padEnd(5)} ${cs.pace.toString().padEnd(5)} ${cs.group.toString().padEnd(5)} ${cs.environment.toString().padEnd(5)} ${cs.flightTime}`
    );
  });

  // Stats: long-haul (>7h) in top 5 vs top 8
  const top5LH = filtered.slice(0, 5).filter((r) => (flightMap[r.slug] ?? 0) > 7).length;
  const top8LH = filtered.slice(0, 8).filter((r) => (flightMap[r.slug] ?? 0) > 7).length;
  console.log(`Long-courrier (>7h) dans top-5 : ${top5LH} | dans top-8 : ${top8LH}`);
}

// ─── 5 profils à auditer ──────────────────────────────────────────

const PROFILES: [string, QuizAnswers][] = [
  [
    "Long-courrier + gros budget — flightTolerance: any (neutralité)",
    {
      budget: "premium",
      duration: "extended",
      period: "winter",
      group: "couple",
      pace: "balanced",
      environment: "any",
      flightTolerance: "any",
      styles: ["culture_patrimoine", "energie_urbaine"],
      interests: ["architecture", "history", "food"],
    },
  ],
  [
    "Long-courrier + gros budget — flightTolerance: long (NOUVEAU SIGNAL)",
    {
      budget: "premium",
      duration: "extended",
      period: "winter",
      group: "couple",
      pace: "balanced",
      environment: "any",
      flightTolerance: "long",
      styles: ["culture_patrimoine", "energie_urbaine"],
      interests: ["architecture", "history", "food"],
    },
  ],
  [
    "Couple premium + séjour extended + any flight",
    {
      budget: "premium",
      duration: "extended",
      period: "autumn",
      group: "couple",
      pace: "relaxed",
      environment: "any",
      flightTolerance: "any",
      styles: ["calme_contemplation", "culture_patrimoine"],
      interests: ["nature", "art", "history"],
    },
  ],
  [
    "Solo nature + long séjour + any flight",
    {
      budget: "medium",
      duration: "long",
      period: "winter",
      group: "solo",
      pace: "balanced",
      environment: "nature",
      flightTolerance: "any",
      styles: ["nature_grand_air", "calme_contemplation"],
      interests: ["nature", "history"],
    },
  ],
  [
    "Budget medium + any flight (contrôle — ne doit PAS changer)",
    {
      budget: "medium",
      duration: "week",
      period: "summer",
      group: "couple",
      pace: "balanced",
      environment: "coastal",
      flightTolerance: "any",
      styles: ["food_artdevivre", "calme_contemplation"],
      interests: ["food", "nature"],
    },
  ],
  [
    "Amis + été + vol court (contrôle — ne doit PAS changer)",
    {
      budget: "medium",
      duration: "week",
      period: "summer",
      group: "friends",
      pace: "dense",
      environment: "coastal",
      flightTolerance: "short",
      styles: ["energie_urbaine", "food_artdevivre"],
      interests: ["nightlife", "food"],
    },
  ],
];

describe("Scoring audit — diagnostic complet", () => {
  it("affiche le classement intégral pour les 5 profils", () => {
    console.log("\n\n" + "█".repeat(80));
    console.log("AUDIT SCORING — CLASSEMENT COMPLET (26 destinations)");
    console.log("Légende : ✈ = long-courrier (>7h), TOT=score total, BDG=budget, SZN=saison,");
    console.log("          STY=style, DUR=durée, LOG=logistique, INT=intérêts, PCE=rythme,");
    console.log("          GRP=groupe, ENV=environnement, FLT=temps de vol");
    console.log("█".repeat(80));
    PROFILES.forEach(([label, answers]) => fullRanking(label, answers));
    console.log("\n" + "█".repeat(80) + "\n");
  });
});
