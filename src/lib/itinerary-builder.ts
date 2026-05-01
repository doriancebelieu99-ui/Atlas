import type { Destination, ItineraryDay, CityInfo } from "./types";

export type ItineraryTier = "condensed" | "standard" | "extended" | "long";

export interface AdaptedItinerary {
  days: ItineraryDay[];
  tier: ItineraryTier;
  requestedDays: number;
  templateDays: number;
  durationWarning?: string;
}

function classifyTier(days: number): ItineraryTier {
  if (days <= 2) return "condensed";
  if (days <= 5) return "standard";
  if (days <= 8) return "extended";
  return "long";
}

function parseIdealDuration(s: string): [number, number] {
  const nums = s.match(/\d+/g)?.map(Number) ?? [3, 5];
  return [nums[0], nums[1] ?? nums[0]];
}

function isCoveredByTemplate(cityName: string, templateZones: string[]): boolean {
  const cn = cityName.toLowerCase();
  return templateZones.some((z) => z.includes(cn) || cn.includes(z));
}

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

export function buildItinerary(
  dest: Destination,
  durationDays: number,
): AdaptedItinerary {
  const tier = classifyTier(durationDays);
  const template = dest.itinerary?.days ?? [];

  let rawDays: ItineraryDay[];

  if (tier === "condensed" || tier === "standard") {
    rawDays = template.slice(0, durationDays);
  } else {
    const templateZones = template.map((d) => d.zone.toLowerCase());
    const uncoveredCities = dest.cities.filter(
      (city) => !isCoveredByTemplate(city.name, templateZones),
    );
    const synthetic = uncoveredCities.map((city, i) =>
      syntheticDayFromCity(city, template.length + i + 1),
    );
    rawDays = [...template, ...synthetic].slice(0, durationDays);
  }

  const days = rawDays.map((d, i) => ({ ...d, number: i + 1 }));

  const [idealMin, idealMax] = parseIdealDuration(dest.idealDuration);
  let durationWarning: string | undefined;

  if (durationDays < idealMin) {
    durationWarning = `Durée recommandée : ${dest.idealDuration}. Votre séjour est plus court — les temps forts ont été priorisés.`;
  } else if (durationDays > idealMax && days.length < durationDays) {
    durationWarning = `Tout le contenu disponible pour ${dest.name} est affiché. Pour aller plus loin, combinez avec une destination voisine.`;
  }

  return {
    days,
    tier,
    requestedDays: durationDays,
    templateDays: template.length,
    durationWarning,
  };
}
