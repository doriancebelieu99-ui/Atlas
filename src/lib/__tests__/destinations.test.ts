import { describe, it, expect } from "vitest";
import {
  getAllDestinations,
  getDestinationBySlug,
  getDestinationsBySlugs,
  getItineraryBySlug,
} from "@/lib/destinations";

// These tests hit the real SQLite DB (auto-seeded on first access).

describe("getAllDestinations", () => {
  it("returns all seeded destinations", () => {
    const dests = getAllDestinations();
    expect(dests.length).toBe(63);
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

  it("contextNotes, when present, contain valid topics and non-empty texts", () => {
    const VALID_TOPICS = new Set(["solo", "socialNorms", "identityContext"]);
    const dests = getAllDestinations();
    for (const d of dests) {
      if (!d.safety.contextNotes) continue;
      expect(d.safety.contextNotes.length).toBeGreaterThan(0);
      for (const note of d.safety.contextNotes) {
        expect(VALID_TOPICS.has(note.topic), `${d.slug}: unknown topic "${note.topic}"`).toBe(true);
        expect(note.text.length, `${d.slug}: empty text for topic "${note.topic}"`).toBeGreaterThan(20);
      }
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
  it("returns itinerary for Lisbonne (5 days)", () => {
    const result = getItineraryBySlug("lisbonne");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Porto (5 days)", () => {
    const result = getItineraryBySlug("porto");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Séville (4 days)", () => {
    const result = getItineraryBySlug("seville");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Naples (4 days)", () => {
    const result = getItineraryBySlug("naples");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Marrakech (4 days)", () => {
    const result = getItineraryBySlug("marrakech");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Istanbul (5 days)", () => {
    const result = getItineraryBySlug("istanbul");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for New York (5 days)", () => {
    const result = getItineraryBySlug("new-york");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Montréal (4 days)", () => {
    const result = getItineraryBySlug("montreal");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Rio de Janeiro (5 days)", () => {
    const result = getItineraryBySlug("rio-de-janeiro");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Tokyo (5 days)", () => {
    const result = getItineraryBySlug("tokyo");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Bangkok (4 days)", () => {
    const result = getItineraryBySlug("bangkok");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Le Cap (5 days)", () => {
    const result = getItineraryBySlug("le-cap");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Buenos Aires (5 days)", () => {
    const result = getItineraryBySlug("buenos-aires");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Bali (5 days)", () => {
    const result = getItineraryBySlug("bali");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Mexico City (5 days)", () => {
    const result = getItineraryBySlug("mexico");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Singapour (4 days)", () => {
    const result = getItineraryBySlug("singapour");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Sydney (5 days)", () => {
    const result = getItineraryBySlug("sydney");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Zanzibar (5 days)", () => {
    const result = getItineraryBySlug("zanzibar");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Lima (5 days)", () => {
    const result = getItineraryBySlug("lima");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Prague (4 days)", () => {
    const result = getItineraryBySlug("prague");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Dubrovnik (4 days)", () => {
    const result = getItineraryBySlug("dubrovnik");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Oman (5 days)", () => {
    const result = getItineraryBySlug("oman");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Vienne (4 days)", () => {
    const result = getItineraryBySlug("vienne");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Budapest (4 days)", () => {
    const result = getItineraryBySlug("budapest");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Athènes (4 days)", () => {
    const result = getItineraryBySlug("athenes");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Édimbourg (4 days)", () => {
    const result = getItineraryBySlug("edimbourg");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Hanoï (4 days)", () => {
    const result = getItineraryBySlug("hanoi");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Jordanie (4 days)", () => {
    const result = getItineraryBySlug("jordanie");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Rajasthan (4 days)", () => {
    const result = getItineraryBySlug("rajasthan");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for La Havane (4 days)", () => {
    const result = getItineraryBySlug("la-havane");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Kenya (4 days)", () => {
    const result = getItineraryBySlug("kenya");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Tbilissi (4 days)", () => {
    const result = getItineraryBySlug("tbilissi");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Copenhague (3 days)", () => {
    const result = getItineraryBySlug("copenhague");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(3);
  });

  it("returns itinerary for Samarkand (4 days)", () => {
    const result = getItineraryBySlug("samarkand");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Bergen (3 days)", () => {
    const result = getItineraryBySlug("bergen");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(3);
  });

  it("returns itinerary for Siem Reap (4 days)", () => {
    const result = getItineraryBySlug("siem-reap");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Costa Rica (4 days)", () => {
    const result = getItineraryBySlug("costa-rica");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(4);
  });

  it("returns itinerary for Séoul (5 days)", () => {
    const result = getItineraryBySlug("seoul");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Taipei (5 days)", () => {
    const result = getItineraryBySlug("taipei");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Kuala Lumpur (5 days)", () => {
    const result = getItineraryBySlug("kuala-lumpur");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Hong Kong (5 days)", () => {
    const result = getItineraryBySlug("hong-kong");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Shanghai (5 days)", () => {
    const result = getItineraryBySlug("shanghai");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Pékin (5 days)", () => {
    const result = getItineraryBySlug("pekin");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Osaka (5 days)", () => {
    const result = getItineraryBySlug("osaka");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Busan (5 days)", () => {
    const result = getItineraryBySlug("busan");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Fukuoka (5 days)", () => {
    const result = getItineraryBySlug("fukuoka");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Sapporo (5 days)", () => {
    const result = getItineraryBySlug("sapporo");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Bologne (5 days)", () => {
    const result = getItineraryBySlug("bologne");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Berlin (5 days)", () => {
    const result = getItineraryBySlug("berlin");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Londres (5 days)", () => {
    const result = getItineraryBySlug("londres");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Rome (5 days)", () => {
    const result = getItineraryBySlug("rome");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Madrid (5 days)", () => {
    const result = getItineraryBySlug("madrid");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Milan (5 days)", () => {
    const result = getItineraryBySlug("milan");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Venise (5 days)", () => {
    const result = getItineraryBySlug("venise");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Bruxelles (5 days)", () => {
    const result = getItineraryBySlug("bruxelles");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns itinerary for Dublin (5 days)", () => {
    const result = getItineraryBySlug("dublin");
    expect(result).not.toBeNull();
    expect(result!.days).toHaveLength(5);
  });

  it("returns null for unknown slug", () => {
    expect(getItineraryBySlug("atlantis")).toBeNull();
  });
});
