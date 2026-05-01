import type { Destination, ItineraryDay, CityInfo } from "./types";

export type AdaptationMode =
  | "exact_template"
  | "compressed_best_of"
  | "extended_with_cities"
  | "exhausted_content";

export interface AdaptedItinerary {
  days: ItineraryDay[];
  adaptationMode: AdaptationMode;
  requestedDays: number;
  generatedDays: number;
  templateDays: number;
  durationWarning?: string;
}

// ─── Day importance for smart compression ────────────────────────
// Higher score = more structural / iconic day.
// Culture activities weighted heavily; intensity as tie-breaker.

function dayImportance(day: ItineraryDay): number {
  const cultureCount = day.activities.filter((a) => a.type === "culture").length;
  return cultureCount * 3 + day.intensity;
}

// Select top-N template days by importance, then restore chronological order.
// This is deterministic and intentionally different from naive slice(0, N).
function compressBestOf(template: ItineraryDay[], n: number): ItineraryDay[] {
  const scored = template.map((day, originalIdx) => ({ day, score: dayImportance(day), originalIdx }));
  scored.sort((a, b) => b.score - a.score || a.originalIdx - b.originalIdx);
  const selected = scored.slice(0, n);
  selected.sort((a, b) => a.originalIdx - b.originalIdx);
  return selected.map((s) => s.day);
}

// ─── City coverage ────────────────────────────────────────────────

function isCoveredByTemplate(cityName: string, templateZones: string[]): boolean {
  const cn = cityName.toLowerCase();
  return templateZones.some((z) => z.includes(cn) || cn.includes(z));
}

// ─── Ideal duration parsing ───────────────────────────────────────

function parseIdealDuration(s: string): [number, number] {
  const nums = s.match(/\d+/g)?.map(Number) ?? [3, 5];
  return [nums[0], nums[1] ?? nums[0]];
}

// ─── Synthetic day from CityInfo ─────────────────────────────────

function syntheticDayFromCity(city: CityInfo, dayNumber: number): ItineraryDay {
  const isExcursion = city.type === "Excursion";
  return {
    number: dayNumber,
    title: city.name,
    zone: city.name,
    intensity: isExcursion ? 4 : 3,
    transportMinutes: isExcursion ? 90 : 30,
    freeSlots: 1,
    activities: [
      {
        slot: "9h–12h",
        name: `Découverte de ${city.name}`,
        type: "culture",
        duration: 180,
        icon: "🗺️",
        note: city.description,
      },
      {
        slot: "13h–14h30",
        name: "Déjeuner",
        type: "food",
        duration: 90,
        icon: "🍽️",
        note: "Cuisine locale.",
      },
      {
        slot: "15h–17h30",
        name: `Explorer ${city.name}`,
        type: "free",
        duration: 150,
        icon: "🚶",
        note: city.vibe,
      },
    ],
  };
}

// ─── Main builder ─────────────────────────────────────────────────

export function buildItinerary(
  dest: Destination,
  durationDays: number,
): AdaptedItinerary {
  const template = dest.itinerary?.days ?? [];
  const templateLen = template.length;

  // Build synthetic pool from cities not covered by any template zone
  const templateZones = template.map((d) => d.zone.toLowerCase());
  const uncoveredCities = dest.cities.filter(
    (city) => !isCoveredByTemplate(city.name, templateZones),
  );
  const syntheticPool = uncoveredCities.map((city, i) =>
    syntheticDayFromCity(city, templateLen + i + 1),
  );
  const maxAvailableDays = templateLen + syntheticPool.length;

  let rawDays: ItineraryDay[];
  let adaptationMode: AdaptationMode;

  if (durationDays === templateLen) {
    rawDays = template;
    adaptationMode = "exact_template";
  } else if (durationDays < templateLen) {
    rawDays = compressBestOf(template, Math.max(1, durationDays));
    adaptationMode = "compressed_best_of";
  } else if (durationDays <= maxAvailableDays) {
    const syntheticNeeded = durationDays - templateLen;
    rawDays = [...template, ...syntheticPool.slice(0, syntheticNeeded)];
    adaptationMode = "extended_with_cities";
  } else {
    rawDays = [...template, ...syntheticPool];
    adaptationMode = "exhausted_content";
  }

  const days = rawDays.map((d, i) => ({ ...d, number: i + 1 }));

  const [idealMin] = parseIdealDuration(dest.idealDuration);
  let durationWarning: string | undefined;

  if (durationDays < idealMin) {
    durationWarning = `Durée recommandée : ${dest.idealDuration}. Les temps forts ont été sélectionnés pour ce séjour court.`;
  } else if (adaptationMode === "exhausted_content") {
    durationWarning = `Tout le contenu disponible pour ${dest.name} est affiché (${days.length} jour${days.length > 1 ? "s" : ""} sur ${durationDays} demandés). Pour aller plus loin, combinez avec une destination voisine.`;
  }

  return {
    days,
    adaptationMode,
    requestedDays: durationDays,
    generatedDays: days.length,
    templateDays: templateLen,
    durationWarning,
  };
}
