import { describe, it, expect } from "vitest";
import {
  getAllDestinations,
  getDestinationBySlug,
  getDestinationsBySlugs,
  getItineraryBySlug,
  getDestinationCount,
} from "@/lib/destinations";

// These tests hit the real SQLite DB (auto-seeded on first access).

describe("getAllDestinations", () => {
  it("returns all seeded destinations", () => {
    const dests = getAllDestinations();
    expect(dests.length).toBe(5);
  });

  it("returns destinations sorted by score descending", () => {
    const dests = getAllDestinations();
    for (let i = 1; i < dests.length; i++) {
      expect(dests[i - 1].score).toBeGreaterThanOrEqual(dests[i].score);
    }
  });

  it("each destination has required fields", () => {
    const dests = getAllDestinations();
    for (const d of dests) {
      expect(d.slug).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.country).toBeTruthy();
      expect(d.budget).toBeTruthy();
      expect(d.season).toBeTruthy();
      expect(d.safety).toBeTruthy();
      expect(d.cities.length).toBeGreaterThan(0);
    }
  });
});

describe("getDestinationBySlug", () => {
  it("returns Lisbonne for slug 'lisbonne'", () => {
    const dest = getDestinationBySlug("lisbonne");
    expect(dest).not.toBeNull();
    expect(dest!.name).toBe("Lisbonne");
    expect(dest!.country).toBe("Portugal");
  });

  it("returns null for unknown slug", () => {
    expect(getDestinationBySlug("atlantis")).toBeNull();
  });

  it("returns null for empty slug", () => {
    expect(getDestinationBySlug("")).toBeNull();
  });

  it("sanitizes malicious slug", () => {
    expect(getDestinationBySlug("'; DROP TABLE destinations; --")).toBeNull();
  });
});

describe("getDestinationsBySlugs", () => {
  it("returns destinations in requested order", () => {
    const dests = getDestinationsBySlugs(["porto", "lisbonne"]);
    expect(dests).toHaveLength(2);
    expect(dests[0].slug).toBe("porto");
    expect(dests[1].slug).toBe("lisbonne");
  });

  it("skips unknown slugs", () => {
    const dests = getDestinationsBySlugs(["lisbonne", "atlantis", "porto"]);
    expect(dests).toHaveLength(2);
  });

  it("returns empty array for all unknown slugs", () => {
    const dests = getDestinationsBySlugs(["atlantis", "mordor"]);
    expect(dests).toHaveLength(0);
  });
});

describe("getItineraryBySlug", () => {
  it("returns itinerary for Lisbonne", () => {
    const result = getItineraryBySlug("lisbonne");
  it("returns itinerary for Lisbonne (5 days)", () => {
    const result = getItineraryBySlug("lisbonne");
    expect(result).not.toBeNull();
    expect(result!.destination.name).toBe("Lisbonne");
    expect(result!.itinerary.days).toHaveLength(5);
  });

  it("returns itinerary for Porto (4 days)", () => {
    const result = getItineraryBySlug("porto");
    expect(result).not.toBeNull();
    expect(result!.destination.name).toBe("Porto");
    expect(result!.itinerary.days).toHaveLength(4);
  });

  it("returns itinerary for Séville (4 days)", () => {
    const result = getItineraryBySlug("seville");
    expect(result).not.toBeNull();
    expect(result!.destination.name).toBe("Séville");
    expect(result!.itinerary.days).toHaveLength(4);
  });

  it("returns itinerary for Naples (4 days)", () => {
    const result = getItineraryBySlug("naples");
    expect(result).not.toBeNull();
    expect(result!.destination.name).toBe("Naples");
    expect(result!.itinerary.days).toHaveLength(4);
  });

  it("returns null for destination without itinerary (Marrakech)", () => {
    expect(getItineraryBySlug("marrakech")).toBeNull();
  });

  it("returns null for unknown slug", () => {
    expect(getItineraryBySlug("atlantis")).toBeNull();
  });
});

describe("getDestinationCount", () => {
  it("returns 5 seeded destinations", () => {
    expect(getDestinationCount()).toBe(5);
  });
});
