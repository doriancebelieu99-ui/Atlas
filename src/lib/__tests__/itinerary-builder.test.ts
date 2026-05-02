import { describe, it, expect } from "vitest";
import { buildItinerary } from "@/lib/itinerary-builder";
import { destinations } from "@/data/destinations";

const lisbonne = destinations.lisbonne;
const TEMPLATE_LEN = lisbonne.itinerary!.days.length; // 5

// ─── adaptationMode ──────────────────────────────────────────────

describe("buildItinerary — adaptationMode", () => {
  it("N == templateLen → exact_template", () => {
    expect(buildItinerary(lisbonne, TEMPLATE_LEN).adaptationMode).toBe("exact_template");
  });

  it("N < templateLen → compressed_best_of", () => {
    expect(buildItinerary(lisbonne, 3).adaptationMode).toBe("compressed_best_of");
  });

  it("N == 1 → compressed_best_of", () => {
    expect(buildItinerary(lisbonne, 1).adaptationMode).toBe("compressed_best_of");
  });

  it("N > templateLen mais contenu dispo → extended_with_cities", () => {
    expect(buildItinerary(lisbonne, TEMPLATE_LEN + 1).adaptationMode).toBe("extended_with_cities");
  });

  it("N > tout le contenu dispo → exhausted_content", () => {
    expect(buildItinerary(lisbonne, 999).adaptationMode).toBe("exhausted_content");
  });
});

// ─── generatedDays & requestedDays ───────────────────────────────

describe("buildItinerary — generatedDays / requestedDays", () => {
  it("generatedDays == days.length (toujours cohérent)", () => {
    for (const n of [1, 3, 5, 7, 14]) {
      const r = buildItinerary(lisbonne, n);
      expect(r.generatedDays).toBe(r.days.length);
    }
  });

  it("requestedDays == N (préserve la demande, même si contenu insuffisant)", () => {
    expect(buildItinerary(lisbonne, 14).requestedDays).toBe(14);
    expect(buildItinerary(lisbonne, 1).requestedDays).toBe(1);
  });

  it("exact_template: generatedDays == requestedDays", () => {
    const r = buildItinerary(lisbonne, TEMPLATE_LEN);
    expect(r.generatedDays).toBe(r.requestedDays);
  });

  it("exhausted_content: generatedDays < requestedDays", () => {
    const r = buildItinerary(lisbonne, 999);
    expect(r.generatedDays).toBeLessThan(r.requestedDays);
  });

  it("templateDays reflète toujours le template original", () => {
    expect(buildItinerary(lisbonne, 3).templateDays).toBe(TEMPLATE_LEN);
    expect(buildItinerary(lisbonne, 10).templateDays).toBe(TEMPLATE_LEN);
  });
});

// ─── Compression intelligente (compressed_best_of) ───────────────

describe("buildItinerary — compression best-of", () => {
  it("N=1 → 1 jour généré", () => {
    expect(buildItinerary(lisbonne, 1).days).toHaveLength(1);
  });

  it("N=3 → 3 jours générés", () => {
    expect(buildItinerary(lisbonne, 3).days).toHaveLength(3);
  });

  it("compression ≠ slice naïf : le jour de départ (J5) est exclu pour N=3", () => {
    const r = buildItinerary(lisbonne, 3);
    // J5 "Derniers instants" a 0 activités culture → importance basse
    // Ne doit pas apparaître dans un best-of de 3
    const hasJ5Zone = r.days.some((d) => d.zone === "Au choix");
    expect(hasJ5Zone).toBe(false);
  });

  it("compression ≠ slice naïf : N=1 ne retourne pas forcément J1", () => {
    const r = buildItinerary(lisbonne, 1);
    // J1 (arrivée, 1 culture) < J2 (Alfama, 3 culture) ou J3 (Belém, 3 culture)
    // Le jour retourné doit avoir plus de valeur que J1 "arrivée"
    const day = r.days[0];
    const cultureCount = day.activities.filter((a) => a.type === "culture").length;
    expect(cultureCount).toBeGreaterThanOrEqual(2);
  });

  it("jours sélectionnés respectent l'ordre chronologique du template", () => {
    const r = buildItinerary(lisbonne, 3);
    for (let i = 1; i < r.days.length; i++) {
      expect(r.days[i].number).toBeGreaterThan(r.days[i - 1].number);
    }
  });
});

// ─── Extension (extended_with_cities / exhausted_content) ─────────

describe("buildItinerary — extension avec villes", () => {
  it("extended: days.length == durationDays quand contenu suffisant", () => {
    const r = buildItinerary(lisbonne, TEMPLATE_LEN + 1);
    expect(r.days.length).toBe(TEMPLATE_LEN + 1);
    expect(r.adaptationMode).toBe("extended_with_cities");
  });

  it("jours synthétiques ont au moins une activité culture", () => {
    const r = buildItinerary(lisbonne, TEMPLATE_LEN + 1);
    const synthDay = r.days[TEMPLATE_LEN]; // first synthetic
    expect(synthDay.activities.some((a) => a.type === "culture")).toBe(true);
  });

  it("exhausted: jours <= maxAvailableDays même si N > max", () => {
    const r = buildItinerary(lisbonne, 999);
    expect(r.days.length).toBeLessThan(999);
    expect(r.days.length).toBeGreaterThan(0);
  });
});

// ─── Adaptation rythme / groupe ──────────────────────────────────

describe("buildItinerary — pace & group adaptation", () => {
  // Lisbonne J4 = Sintra : intensity 4, transportMinutes 100, freeSlots 0
  // Verified scores for N=3:
  //   balanced : J2(12) J3(12) J4(10)  → J4 included
  //   relaxed  : J2(13) J3(13) J1(9)   → J4 excluded (score 8)
  //   dense    : J2(15) J3(15) J4(14)  → J4 included
  //   family   : J2(14) J3(13) J5(7)   → J4 excluded (score 5)

  it("balanced (défaut) : même résultat qu'un appel sans opts", () => {
    const base = buildItinerary(lisbonne, 3);
    const balanced = buildItinerary(lisbonne, 3, { pace: "balanced" });
    expect(balanced.days.map((d) => d.number)).toEqual(base.days.map((d) => d.number));
  });

  it("relaxed, N=3 : exclut J4 (Sintra, intensité 4)", () => {
    const r = buildItinerary(lisbonne, 3, { pace: "relaxed" });
    expect(r.days.every((d) => d.intensity < 4)).toBe(true);
    expect(r.days.some((d) => d.zone === "Sintra (excursion)")).toBe(false);
  });

  it("dense, N=3 : inclut J4 (Sintra, intensité 4)", () => {
    const r = buildItinerary(lisbonne, 3, { pace: "dense" });
    expect(r.days.some((d) => d.zone === "Sintra (excursion)")).toBe(true);
  });

  it("family, N=3 : exclut J4 (100′ transport, 0 freeSlots)", () => {
    const r = buildItinerary(lisbonne, 3, { groupType: "family" });
    expect(r.days.every((d) => d.transportMinutes < 100)).toBe(true);
    expect(r.days.some((d) => d.zone === "Sintra (excursion)")).toBe(false);
  });

  it("paceProfile défini pour relaxed", () => {
    const r = buildItinerary(lisbonne, 3, { pace: "relaxed" });
    expect(r.paceProfile).toBeDefined();
    expect(r.paceProfile?.label).toMatch(/relax/i);
  });

  it("paceProfile défini pour dense", () => {
    const r = buildItinerary(lisbonne, 3, { pace: "dense" });
    expect(r.paceProfile).toBeDefined();
    expect(r.paceProfile?.label).toMatch(/dense/i);
  });

  it("paceProfile défini pour family", () => {
    const r = buildItinerary(lisbonne, 3, { groupType: "family" });
    expect(r.paceProfile).toBeDefined();
    expect(r.paceProfile?.label).toMatch(/famille/i);
  });

  it("paceProfile absent pour balanced sans groupe spécial", () => {
    expect(buildItinerary(lisbonne, 3).paceProfile).toBeUndefined();
    expect(buildItinerary(lisbonne, 3, { pace: "balanced" }).paceProfile).toBeUndefined();
  });

  it("adaptation rythme n'affecte pas exact_template (N == templateLen)", () => {
    const r = buildItinerary(lisbonne, TEMPLATE_LEN, { pace: "relaxed" });
    expect(r.adaptationMode).toBe("exact_template");
    expect(r.days).toHaveLength(TEMPLATE_LEN);
  });

  it("jours sélectionnés toujours en ordre chronologique (relax)", () => {
    const r = buildItinerary(lisbonne, 3, { pace: "relaxed" });
    for (let i = 1; i < r.days.length; i++) {
      expect(r.days[i].number).toBeGreaterThan(r.days[i - 1].number);
    }
  });
});

// ─── Numérotation ────────────────────────────────────────────────

describe("buildItinerary — numérotation", () => {
  it("jours numérotés de 1 à N sans trou", () => {
    for (const n of [1, 2, 3, 5, 7]) {
      const r = buildItinerary(lisbonne, n);
      r.days.forEach((d, i) => expect(d.number).toBe(i + 1));
    }
  });
});

// ─── Warnings ────────────────────────────────────────────────────

describe("buildItinerary — durationWarning", () => {
  it("pas de warning dans la plage idéale (3–5 jours)", () => {
    expect(buildItinerary(lisbonne, 4).durationWarning).toBeUndefined();
    expect(buildItinerary(lisbonne, 5).durationWarning).toBeUndefined();
  });

  it("warning quand N < idealMin (<3)", () => {
    const w = buildItinerary(lisbonne, 2).durationWarning;
    expect(w).toBeDefined();
    expect(w).toMatch(/recommandée/i);
    expect(w).toMatch(/3 à 5 jours/);
  });

  it("warning quand contenu épuisé", () => {
    const r = buildItinerary(lisbonne, 999);
    expect(r.durationWarning).toBeDefined();
    expect(r.durationWarning).toMatch(/contenu disponible/i);
  });

  it("pas de warning en extended si la demande est raisonnable", () => {
    const r = buildItinerary(lisbonne, TEMPLATE_LEN + 1);
    expect(r.durationWarning).toBeUndefined();
  });
});
