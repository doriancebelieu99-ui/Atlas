import { destinations as seedData } from "@/data/destinations";
import type { Destination } from "./types";

const destinationList = Object.values(seedData) as Destination[];

export function getAllDestinations(): Destination[] {
  return [...destinationList].sort((a, b) => b.score - a.score);
}

export function getDestinationBySlug(slug: string): Destination | null {
  if (!slug) return null;
  return destinationList.find((d) => d.slug === slug) ?? null;
}

export function getDestinationsBySlugs(slugs: string[]): Destination[] {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  return slugs
    .map((slug) => destinationList.find((d) => d.slug === slug) ?? null)
    .filter((d): d is Destination => d !== null);
}

export function getItineraryBySlug(slug: string) {
  const destination = getDestinationBySlug(slug);
  return destination?.itinerary ?? null;
}