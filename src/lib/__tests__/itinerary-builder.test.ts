import { describe, it, expect } from "vitest";
import { buildItinerary } from "@/lib/itinerary-builder";
import { destinations } from "@/data/destinations";

const lisbonne = destinations.lisbonne;
const TEMPLATE_DAYS = lisbonne.itinerary!.days.length; // 5

describe("buildItinerary — tier classification", () => {
  it("1 jour → condensed", () => {
    expect(buildItinerary(lisbonne, 1).tier).toBe("condensed");
  });

  it("2 jours → condensed", () => {
    expect(buildItinerary(lisbonne, 2).tier).toBe("condensed");
  });

  it("3 jours → standard", () => {
    expect(buildItinerary(lisbonne, 3).tier).toBe("standard");
  });

  it("5 jours → standard", () => {
    expect(buildItinerary(lisbonne, 5).tier).toBe("standard");
  });

  it("6 jours → extended", () => {
    expect(buildItinerary(lisbonne, 6).tier).toBe("extended");
  });

  it("8 jours → extended", () => {
    expect(buildItinerary(lisbonne, 8).tier).toBe("extended");
  });

  it("9 jours → long", () => {
    expect(buildItinerary(lisbonne, 9).tier).toBe("long");
  });
});

describe("buildItinerary — nombre de jours produits", () => {
  it("condensed 2 jours → 2 jours dans le résultat", () => {
    expect(buildItinerary(lisbonne, 2).days).toHaveLength(2);
  });

  it("standard 3 jours → 3 jours (troncature du template)", () => {
    expect(buildItinerary(lisbonne, 3).days).toHaveLength(3);
  });

  it("standard 5 jours → 5 jours (template complet)", () => {
    expect(buildItinerary(lisbonne, 5).days).toHaveLength(TEMPLATE_DAYS);
  });

  it("extended → complète au-delà du template avec les villes non couvertes", () => {
    const result = buildItinerary(lisbonne, 7);
    expect(result.days.length).toBeGreaterThan(TEMPLATE_DAYS);
    expect(result.days.length).toBeLessThanOrEqual(7);
  });

  it("jours toujours numérotés de 1 à N sans trou", () => {
    const result = buildItinerary(lisbonne, 4);
    result.days.forEach((d, i) => expect(d.number).toBe(i + 1));
  });

  it("templateDays reflète la longueur du template original", () => {
    expect(buildItinerary(lisbonne, 3).templateDays).toBe(TEMPLATE_DAYS);
  });

  it("requestedDays reflète la demande, pas la longueur réelle", () => {
    const r = buildItinerary(lisbonne, 10);
    expect(r.requestedDays).toBe(10);
  });
});

describe("buildItinerary — avertissement de durée", () => {
  it("aucun warning dans la plage idéale (3–5 jours)", () => {
    expect(buildItinerary(lisbonne, 4).durationWarning).toBeUndefined();
  });

  it("warning quand durationDays < idealMin (< 3)", () => {
    const w = buildItinerary(lisbonne, 2).durationWarning;
    expect(w).toBeDefined();
    expect(w).toMatch(/recommandée/i);
    expect(w).toMatch(/3 à 5 jours/);
  });

  it("warning quand contenu épuisé avant la durée demandée", () => {
    // Lisbonne has 5 template days + few cities → asking for 14 exhausts content
    const result = buildItinerary(lisbonne, 14);
    if (result.days.length < 14) {
      expect(result.durationWarning).toBeDefined();
      expect(result.durationWarning).toMatch(/contenu disponible/i);
    }
  });

  it("pas de warning en mode standard exact (5 jours)", () => {
    expect(buildItinerary(lisbonne, 5).durationWarning).toBeUndefined();
  });
});

describe("buildItinerary — jours synthétiques (extended)", () => {
  it("jours synthétiques ont au moins une activité de type culture", () => {
    const result = buildItinerary(lisbonne, 7);
    const syntheticDays = result.days.slice(TEMPLATE_DAYS);
    for (const day of syntheticDays) {
      const hasCulture = day.activities.some((a) => a.type === "culture");
      expect(hasCulture).toBe(true);
    }
  });

  it("jours synthétiques ont un titre non vide", () => {
    const result = buildItinerary(lisbonne, 7);
    const syntheticDays = result.days.slice(TEMPLATE_DAYS);
    for (const day of syntheticDays) {
      expect(day.title).toBeTruthy();
    }
  });
});
