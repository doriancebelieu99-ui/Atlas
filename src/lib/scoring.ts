// ─── Atlas — Scoring Engine ───────────────────────────────────────
// Migrated from atlas-backend/src/server/services/scoring.ts
// Adapted to work with frontend Destination type.
// All logic preserved: weights, budget, season, style, duration, logistics, interests, pace.

import type {
  PreferencesInput,
  CriteriaScores,
  ScoringWeights,
  DestinationScoreResult,
  Destination,
  BudgetLevel,
} from "./types";

// ─── Default Weights (from blueprint §11.1) ──────────────────────

const DEFAULT_WEIGHTS: ScoringWeights = {
  budget: 0.20,
  season: 0.15,
  style: 0.18,
  duration: 0.10,
  logistics: 0.10,
  interests: 0.13,
  pace: 0.08,
  group: 0.08,
  environment: 0.12,
  flightTime: 0.10,
};

// ─── Weight Adjustment ────────────────────────────────────────────

export function adjustWeights(prefs: PreferencesInput): ScoringWeights {
  const w = { ...DEFAULT_WEIGHTS };

  if (prefs.budget === "low") {
    w.budget = 0.30;
    w.style = 0.15;
  } else if (prefs.budget === "premium") {
    w.budget = 0.10;
    w.interests = 0.20;
  }

  if (prefs.groupType === "family") {
    w.logistics = 0.18;
    w.pace = 0.12;
    w.style = 0.15;
    w.group = 0.12;
  }

  if (!prefs.styles || prefs.styles.length === 0) {
    w.style = 0;
  }

  if (!prefs.budget) {
    w.budget = 0;
  }

  if (!prefs.environment || prefs.environment === "any") {
    w.environment = 0;
  }

  if (!prefs.flightTolerance || prefs.flightTolerance === "any") {
    w.flightTime = 0;
  }

  // Normalize to sum = 1
  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(w) as (keyof ScoringWeights)[]) {
    w[key] = w[key] / sum;
  }

  return w;
}

// ─── Duration Mapping ─────────────────────────────────────────────

function durationToDays(duration: string | undefined): number {
  const map: Record<string, number> = {
    short: 3,
    week: 5,
    long: 10,
    extended: 18,
  };
  return map[duration ?? "week"] ?? 5;
}

function parseIdealDuration(s: string): [number, number] {
  const nums = s.match(/\d+/g)?.map(Number) ?? [3, 5];
  return [nums[0], nums[1] ?? nums[0]];
}

// ─── Individual Scorers ───────────────────────────────────────────

export function scoreBudget(prefs: PreferencesInput, dest: Destination): number {
  if (!prefs.budget) return 0;

  const budgetRanges: Record<string, [number, number]> = {
    low: [20, 60],
    medium: [60, 140],
    high: [140, 280],
    premium: [280, 600],
  };

  const [userMin, userMax] = budgetRanges[prefs.budget];
  const userMid = (userMin + userMax) / 2;
  const destMid = (dest.budget.comfort.min + dest.budget.comfort.max) / 2;

  if (userMax < dest.budget.economy.min) return 0;
  if (userMin > dest.budget.premium.max) return 80;

  const ratio = userMid / destMid;
  let score: number;
  if (ratio >= 0.8 && ratio <= 1.5) score = 100;
  else if (ratio >= 0.6) score = 70 + ((ratio - 0.6) / 0.2) * 30;
  else if (ratio >= 0.4) score = 40 + ((ratio - 0.4) / 0.2) * 30;
  else score = ratio * 100;

  return Math.round(Math.max(0, Math.min(100, score)));
}

// ─── Month Scoring ────────────────────────────────────────────────
// Applies crowd penalty to a single month's raw score.

function rawMonthScore(dest: Destination, idx: number, prefs: PreferencesInput): number {
  const m = dest.season.months[((idx % 12) + 12) % 12];
  let s = m?.score ?? 50;
  const crowd = m?.crowd;
  if (crowd && crowd > 70) {
    let penalty = (crowd - 70) * 0.3;
    if (prefs.pace === "relaxed" || prefs.groupType === "family") penalty *= 1.5;
    s = Math.max(0, s - penalty);
  }
  return s;
}

// Smoothed monthly score: 70% chosen month + 15% previous + 15% next.
// Wraps correctly for January (← December) and December (→ January).
export function scoreSeasonByMonth(dest: Destination, monthIdx: number, prefs: PreferencesInput): number {
  const prev = (monthIdx - 1 + 12) % 12;
  const next = (monthIdx + 1) % 12;
  return Math.round(
    rawMonthScore(dest, monthIdx, prefs) * 0.70 +
    rawMonthScore(dest, prev,     prefs) * 0.15 +
    rawMonthScore(dest, next,     prefs) * 0.15,
  );
}

export function scoreSeason(prefs: PreferencesInput, dest: Destination): number {
  if (prefs.month !== undefined) {
    return scoreSeasonByMonth(dest, prefs.month, prefs);
  }

  if (prefs.period) {
    const periodMonths: Record<string, number> = {
      spring: 3,
      summer: 6,
      autumn: 9,
      winter: 0,
    };
    return scoreSeasonByMonth(dest, periodMonths[prefs.period], prefs);
  }

  // No temporal constraint — average of 3 best months
  const sorted = [...dest.season.months].sort((a, b) => b.score - a.score);
  return (sorted[0].score + sorted[1].score + sorted[2].score) / 3;
}

const STYLE_ALIASES: Record<string, string[]> = {
  authentic_local:     ["authentique", "accessible", "abordable", "taille humaine"],
  culture_patrimoine:  ["historique", "monumentale", "mystique", "raffinée"],
  food_artdevivre:     ["gastronomique", "sensorielle", "créative"],
  energie_urbaine:     ["festive", "vibrante", "passionnée", "chaotique", "cosmopolite"],
  calme_contemplation: ["romantique", "photogénique", "poétique", "contemplative", "apaisante", "épurée"],
  nature_grand_air:    ["sauvage", "nordique", "dépaysante", "colorée"],
};

export function scoreStyle(prefs: PreferencesInput, dest: Destination): number {
  if (!prefs.styles || prefs.styles.length === 0) return 70;

  const destStyles = [
    ...dest.ambiance.map((a) => a.toLowerCase()),
    ...dest.targetProfiles.map((p) => p.toLowerCase()),
  ];

  let matches = 0;
  for (const style of prefs.styles) {
    const aliases = STYLE_ALIASES[style];
    if (aliases) {
      if (aliases.some((alias) => destStyles.some((ds) => ds.includes(alias)))) {
        matches++;
      }
    } else {
      if (destStyles.some((ds) => ds.includes(style.toLowerCase()))) {
        matches++;
      }
    }
  }

  const ratio = matches / prefs.styles.length;
  return Math.round(50 + ratio * 50);
}

export function scoreDuration(prefs: PreferencesInput, dest: Destination): number {
  const d = prefs.durationDays ?? durationToDays(undefined);
  const [min, max] = parseIdealDuration(dest.idealDuration);

  if (d >= min && d <= max) return 100;
  if (d < min) {
    const deficit = min - d;
    if (deficit <= 1) return 80;
    if (deficit <= 2) return 60;
    return Math.max(20, 100 - deficit * 20);
  }

  const excess = d - max;
  if (excess <= 2) return 85;
  if (excess <= 4) return 65;
  return Math.max(30, 100 - excess * 10);
}

export function scoreLogistics(prefs: PreferencesInput, dest: Destination): number {
  let score = dest.safety.logisticsScore;
  if (prefs.groupType === "family" && score < 60) {
    score = score * 0.8;
  }
  return Math.round(Math.min(100, score));
}

export function scoreInterests(prefs: PreferencesInput, dest: Destination): number {
  if (!prefs.interests || prefs.interests.length === 0) return 70;

  const destKeywords = [
    dest.mainInterest.toLowerCase(),
    ...dest.ambiance.map((a) => a.toLowerCase()),
    ...dest.whyGo.map((w) => w.title.toLowerCase()),
    ...dest.whyGo.map((w) => w.description.toLowerCase()),
  ].join(" ");

  let matches = 0;
  const interestKeywords: Record<string, string[]> = {
    architecture: ["architecture", "monument", "palais", "cathédrale", "mudéjare", "monastère"],
    food: ["gastronomie", "gastronomique", "food", "cuisine", "pizza", "tapas", "repas", "foodies"],
    history: ["histoire", "historique", "patrimoine", "unesco", "grecs", "romain"],
    nightlife: ["nocturne", "festif", "fête", "nuit", "bar"],
    nature: ["nature", "paysage", "plage", "montagne", "jardin", "cascades"],
    art: ["art", "musée", "créatif", "galerie", "street art"],
  };

  for (const interest of prefs.interests) {
    const keywords = interestKeywords[interest] ?? [interest];
    if (keywords.some((kw) => destKeywords.includes(kw))) {
      matches++;
    }
  }

  const ratio = matches / prefs.interests.length;
  return Math.round(40 + ratio * 60);
}

export function scorePace(prefs: PreferencesInput, dest: Destination): number {
  const paceOrder = ["relaxed", "balanced", "dense", "very_active"];
  const destPaceMap: Record<string, string> = {
    "Équilibré": "balanced",
    "Relax": "relaxed",
    "Dense": "dense",
  };

  const userIdx = paceOrder.indexOf(prefs.pace);
  const destIdx = paceOrder.indexOf(destPaceMap[dest.pace] ?? "balanced");
  const diff = Math.abs(userIdx - destIdx);

  if (diff === 0) return 100;
  if (diff === 1) return 75;
  if (diff === 2) return 45;
  return 20;
}

// ─── Group Scorer ─────────────────────────────────────────────────

const COUPLE_AMBIANCE = ["Romantique", "Photogénique", "Poétique", "Contemplative", "Raffinée"];
const FRIENDS_AMBIANCE = ["Festive", "Vibrante", "Cosmopolite", "Gastronomique", "Créative"];

export function scoreGroup(prefs: PreferencesInput, dest: Destination): number {
  const ambianceLower = dest.ambiance.map((a) => a.toLowerCase());

  if (prefs.groupType === "solo") {
    let base = dest.safety.logisticsScore;
    if (dest.safety.overall === "Modéré") base -= 10;
    return Math.round(Math.min(100, Math.max(50, base)));
  }

  if (prefs.groupType === "couple") {
    const hits = COUPLE_AMBIANCE.filter((tag) => ambianceLower.includes(tag.toLowerCase())).length;
    return Math.round(Math.min(100, Math.max(50, 72 + hits * 4)));
  }

  if (prefs.groupType === "friends") {
    const hits = FRIENDS_AMBIANCE.filter((tag) => ambianceLower.includes(tag.toLowerCase())).length;
    return Math.round(Math.min(100, Math.max(50, 72 + hits * 5)));
  }

  // family
  let base = 60;
  if (dest.targetProfiles.includes("Famille")) base += 25;
  base += Math.max(0, (dest.safety.logisticsScore - 60) / 2);
  if (dest.safety.overall === "Facile") base += 5;
  return Math.round(Math.min(100, Math.max(50, base)));
}

// ─── Environment Scorer ───────────────────────────────────────────

export function scoreEnvironment(prefs: PreferencesInput, dest: Destination): number {
  if (!prefs.environment || prefs.environment === "any") return 75;
  if (prefs.environment === dest.environment) return 100;
  if (dest.environment === "mixed") return 75;
  const crossScores: Record<string, Record<string, number>> = {
    urban:   { coastal: 60, nature: 50 },
    coastal: { urban: 55, nature: 60 },
    nature:  { urban: 45, coastal: 65 },
  };
  return crossScores[prefs.environment]?.[dest.environment] ?? 50;
}

// ─── Flight Time Scorer ───────────────────────────────────────────

export function scoreFlightTime(prefs: PreferencesInput, dest: Destination): number {
  if (!prefs.flightTolerance || prefs.flightTolerance === "any") return 100;
  const hours = dest.flightHoursFromParis;
  if (prefs.flightTolerance === "short") {
    if (hours <= 3) return 100;
    if (hours <= 4.5) return 55;
    return 15;
  }
  if (prefs.flightTolerance === "long") {
    if (hours > 10) return 100;
    if (hours > 7) return 80;
    if (hours > 4) return 45;
    return 15;
  }
  // medium
  if (hours <= 7) return 100;
  if (hours <= 10) return 65;
  return 25;
}

// ─── Main Scoring Function ────────────────────────────────────────

export function scoreDestination(
  prefs: PreferencesInput,
  dest: Destination,
): DestinationScoreResult {
  const weights = adjustWeights(prefs);

  const criteriaScores: CriteriaScores = {
    budget: scoreBudget(prefs, dest),
    season: scoreSeason(prefs, dest),
    style: scoreStyle(prefs, dest),
    duration: scoreDuration(prefs, dest),
    logistics: scoreLogistics(prefs, dest),
    interests: scoreInterests(prefs, dest),
    pace: scorePace(prefs, dest),
    group: scoreGroup(prefs, dest),
    environment: scoreEnvironment(prefs, dest),
    flightTime: scoreFlightTime(prefs, dest),
  };

  const totalScore = Math.round(
    criteriaScores.budget * weights.budget +
    criteriaScores.season * weights.season +
    criteriaScores.style * weights.style +
    criteriaScores.duration * weights.duration +
    criteriaScores.logistics * weights.logistics +
    criteriaScores.interests * weights.interests +
    criteriaScores.pace * weights.pace +
    criteriaScores.group * weights.group +
    criteriaScores.environment * weights.environment +
    criteriaScores.flightTime * weights.flightTime,
  );

  const sorted = Object.entries(criteriaScores).sort(([, a], [, b]) => b - a);

  const highlights = sorted
    .filter(([, s]) => s >= 75)
    .slice(0, 3)
    .map(([key, s]) => generateHighlight(key, s, prefs, dest));

  const limitations = sorted
    .filter(([, s]) => s < 50)
    .map(([key, s]) => generateLimitation(key, s, prefs, dest));

  const variant =
    prefs.budget === "low" ? "economy" : prefs.budget === "premium" ? "premium" : "comfort";
  const bk =
    variant === "economy" ? dest.budget.economy : variant === "premium" ? dest.budget.premium : dest.budget.comfort;
  const days = prefs.durationDays ?? durationToDays(undefined);

  return {
    slug: dest.slug,
    name: dest.name,
    country: dest.country,
    image: dest.image,
    totalScore,
    criteriaScores,
    highlights,
    limitations,
    budgetEstimate: { min: bk.min * days, max: bk.max * days, variant },
    ambiance: dest.ambiance,
    hasItinerary: dest.itinerary !== null,
  };
}

// ─── Rank Multiple Destinations ───────────────────────────────────

export function rankDestinations(
  prefs: PreferencesInput,
  dests: Destination[],
  maxResults = 8,
): DestinationScoreResult[] {
  // Hard filter: flight tolerance (before scoring — labels are exact ranges)
  let eligible = dests;
  if (prefs.flightTolerance === "short") {
    eligible = dests.filter((d) => d.flightHoursFromParis <= 3);
  } else if (prefs.flightTolerance === "medium") {
    eligible = dests.filter((d) => d.flightHoursFromParis <= 7);
  }

  let results = eligible.map((d) => scoreDestination(prefs, d));

  // Hard filters from blueprint §11.7
  if (prefs.budget) {
    results = results.filter((r) => r.criteriaScores.budget > 0);
  }
  results = results.filter((r) => r.criteriaScores.season >= 20);

  results.sort((a, b) => b.totalScore - a.totalScore);

  // Diversity: max 2 per country
  const countryCount: Record<string, number> = {};
  results = results.filter((r) => {
    const count = countryCount[r.country] ?? 0;
    if (count >= 2) return false;
    countryCount[r.country] = count + 1;
    return true;
  });

  return results.slice(0, maxResults);
}

// ─── Explanation Generators ───────────────────────────────────────

function generateHighlight(
  criterion: string,
  score: number,
  prefs: PreferencesInput,
  dest: Destination,
): string {
  const map: Record<string, string> = {
    budget: `Excellent rapport qualité/prix pour votre budget.`,
    season: `Très bonne période pour visiter.`,
    style: `Correspond bien à vos envies de voyage.`,
    duration: `Durée idéale pour cette destination (${dest.idealDuration}).`,
    logistics: `Destination facile d'accès et bien organisée.`,
    interests: `Forte densité de lieux pour vos centres d'intérêt.`,
    pace: `Le rythme naturel de cette destination correspond au vôtre.`,
    group: `Destination bien adaptée à votre configuration de voyage.`,
    environment: `Le cadre de cette destination correspond à votre préférence.`,
    flightTime: `Facilement accessible depuis la France.`,
  };
  return map[criterion] ?? criterion;
}

function generateLimitation(
  criterion: string,
  score: number,
  prefs: PreferencesInput,
  dest: Destination,
): string {
  const map: Record<string, string> = {
    budget: `Budget potentiellement serré pour cette destination.`,
    season: `Période pas optimale. Consultez le calendrier saisonnier.`,
    style: `Ne correspond pas parfaitement à votre style de voyage.`,
    duration: `Durée pas idéale — recommandé : ${dest.idealDuration}.`,
    logistics: `Logistique plus complexe. Anticipez davantage.`,
    interests: `Peu de lieux pour vos centres d'intérêt principaux.`,
    pace: `Le rythme de cette destination diffère du vôtre.`,
    group: `Moins adaptée à votre configuration de voyage.`,
    environment: `Le cadre de cette destination diffère de votre préférence.`,
    flightTime: `Temps de vol assez long depuis la France.`,
  };
  return map[criterion] ?? criterion;
}

// ─── Quiz Answers → PreferencesInput Converter ────────────────────

const DEPARTURE_MONTH_IDX: Record<string, number> = {
  jan: 0, feb: 1, mar: 2,  apr: 3,  may: 4,  jun: 5,
  jul: 6, aug: 7, sep: 8,  oct: 9,  nov: 10, dec: 11,
};

export function quizToPreferences(answers: Record<string, string | string[]>): PreferencesInput {
  const durationMap: Record<string, number> = {
    short: 3,
    week: 5,
    long: 10,
    extended: 18,
  };

  const env = answers.environment as string | undefined;
  const flight = answers.flightTolerance as string | undefined;
  const departurePrecision = answers.departurePrecision as string | undefined;
  const departureMonthStr = answers.departureMonth as string | undefined;

  const useMonth = departurePrecision === "month" && departureMonthStr !== undefined;

  return {
    budget: answers.budget ? (answers.budget as BudgetLevel) : undefined,
    durationDays: durationMap[(answers.duration as string) ?? "week"] ?? 5,
    period: useMonth ? undefined : (answers.period as any),
    month: useMonth ? DEPARTURE_MONTH_IDX[departureMonthStr!] : undefined,
    groupType: (answers.group as any) ?? "couple",
    pace: (answers.pace as any) ?? "balanced",
    styles: Array.isArray(answers.styles) ? answers.styles : [],
    interests: Array.isArray(answers.interests) ? answers.interests : [],
    environment: env && env !== "any" ? env : undefined,
    flightTolerance: flight && flight !== "any" ? (flight as "short" | "medium" | "long") : undefined,
  };
}

// Alias for API route clarity
export const quizAnswersToPreferences = quizToPreferences;
