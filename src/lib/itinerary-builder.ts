import type { Destination, DestinationType, ItineraryDay, CityInfo, Pace, GroupType } from "./types";

export type AdaptationMode =
  | "exact_template"
  | "compressed_best_of"
  | "extended_with_cities"
  | "exhausted_content";

export interface PaceProfile {
  label: string;
  hint: string;
}

export interface AdaptedItinerary {
  days: ItineraryDay[];
  adaptationMode: AdaptationMode;
  requestedDays: number;
  generatedDays: number;
  templateDays: number;
  durationWarning?: string;
  paceProfile?: PaceProfile;
}

export interface BuildOpts {
  pace?: Pace;
  groupType?: GroupType;
}

// ─── Day importance for smart compression ────────────────────────
// Default (balanced): culture * 3 + intensity.
// Relaxed: prefers low-intensity days.
// Dense: amplifies high-intensity days.
// Family: penalises heavy transport and rewards free slots.

function dayImportance(day: ItineraryDay, pace?: Pace, groupType?: GroupType): number {
  const cultureCount = day.activities.filter((a) => a.type === "culture").length;
  if (groupType === "family") {
    return cultureCount * 3 + day.intensity + day.freeSlots * 3 - Math.round(day.transportMinutes / 20);
  }
  if (pace === "relaxed") return cultureCount * 3 + (5 - day.intensity) * 2;
  if (pace === "dense")   return cultureCount * 3 + day.intensity * 2;
  return cultureCount * 3 + day.intensity;
}

// Select top-N template days by importance, then restore chronological order.
// This is deterministic and intentionally different from naive slice(0, N).
function compressBestOf(
  template: ItineraryDay[],
  n: number,
  pace?: Pace,
  groupType?: GroupType,
): ItineraryDay[] {
  const scored = template.map((day, originalIdx) => ({
    day,
    score: dayImportance(day, pace, groupType),
    originalIdx,
  }));
  scored.sort((a, b) => b.score - a.score || a.originalIdx - b.originalIdx);
  const selected = scored.slice(0, n);
  selected.sort((a, b) => a.originalIdx - b.originalIdx);
  return selected.map((s) => s.day);
}

// ─── Pace/group profile ───────────────────────────────────────────

function buildPaceProfile(pace?: Pace, groupType?: GroupType): PaceProfile | undefined {
  if (groupType === "family") {
    return {
      label: "Mode famille",
      hint: "Excursions longues et logistique lourde déprioritisées — rythme plus accessible pour tous.",
    };
  }
  if (pace === "relaxed") {
    return {
      label: "Mode relax",
      hint: "Journées allégées sélectionnées — laissez-vous du temps entre chaque étape.",
    };
  }
  if (pace === "dense") {
    return {
      label: "Mode dense",
      hint: "Journées chargées privilégiées — programme optimisé pour ne rien manquer.",
    };
  }
  return undefined;
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

// ─── Exhausted content warning ────────────────────────────────────

function buildExhaustedWarning(
  name: string,
  destinationType: DestinationType,
  generatedDays: number,
  _requestedDays: number,
): string {
  const n = generatedDays;
  const s = n > 1 ? "s" : "";
  switch (destinationType) {
    case "territory":
      return `${name} se prête pleinement à un séjour long. Cet itinéraire présente un noyau de ${n} jour${s} forts — pour aller plus loin, explorez les zones moins visitées à votre rythme.`;
    case "city_plus":
      return `Programme complet pour ${name} en ${n} jour${s}. Pour prolonger, explorez les zones et excursions secondaires décrites dans la fiche destination.`;
    case "compact":
    default:
      return `Programme complet pour ${name} en ${n} jour${s}. Pour un séjour plus long, combinez avec une destination voisine.`;
  }
}

// ─── Main builder ─────────────────────────────────────────────────

export function buildItinerary(
  dest: Destination,
  durationDays: number,
  opts: BuildOpts = {},
): AdaptedItinerary {
  const { pace, groupType } = opts;
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
    rawDays = compressBestOf(template, Math.max(1, durationDays), pace, groupType);
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
    durationWarning = buildExhaustedWarning(dest.name, dest.destinationType, days.length, durationDays);
  }

  return {
    days,
    adaptationMode,
    requestedDays: durationDays,
    generatedDays: days.length,
    templateDays: templateLen,
    durationWarning,
    paceProfile: buildPaceProfile(pace, groupType),
  };
}
