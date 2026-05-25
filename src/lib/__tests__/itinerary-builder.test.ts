import { describe, it, expect } from "vitest";
import { buildItinerary } from "@/lib/itinerary-builder";
import { destinations } from "@/data/destinations";

const lisbonne = destinations.lisbonne;
const TEMPLATE_LEN = lisbonne.itinerary!.days.length; // 5
const seville = destinations.seville;   // compact
const crete   = destinations.crete;    // territory

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
  // Verified scores for N=3 (with priority bias where applicable):
  //   balanced : J2(32) J3(32) J4(10)  → J4 included, J1(-5) & J5(-8) excluded
  //   relaxed  : J2(13) J3(13) J1(9)   → J4 excluded (score 8) — no bias in relaxed
  //   dense    : J2(35) J3(35) J4(14)  → J4 included — bias amplifies anchors
  //   family   : J2(14) J3(13) J5(7)   → J4 excluded (score 5) — no bias in family

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
    // Lisbonne = city_plus → message "Programme complet"
    expect(r.durationWarning).toMatch(/programme complet/i);
  });

  it("pas de warning en extended si la demande est raisonnable", () => {
    const r = buildItinerary(lisbonne, TEMPLATE_LEN + 1);
    expect(r.durationWarning).toBeUndefined();
  });
});

// ─── Warnings — exhausted_content par destinationType ─────────────

describe("buildItinerary — exhausted warning variants", () => {
  it("city_plus (lisbonne) → 'Programme complet … fiche destination'", () => {
    const r = buildItinerary(lisbonne, 999);
    expect(r.durationWarning).toMatch(/programme complet/i);
    expect(r.durationWarning).toMatch(/fiche destination/i);
  });

  it("compact (seville) → 'Programme complet … destination voisine'", () => {
    const r = buildItinerary(seville, 999);
    expect(r.durationWarning).toMatch(/programme complet/i);
    expect(r.durationWarning).toMatch(/destination voisine/i);
  });

  it("territory (crete) → message long-séjour avec 'zones moins visitées'", () => {
    const r = buildItinerary(crete, 999);
    expect(r.durationWarning).toMatch(/zones moins visitées/i);
  });

  it("chaque variant mentionne le nom de la destination", () => {
    expect(buildItinerary(lisbonne, 999).durationWarning).toMatch(/lisbonne/i);
    expect(buildItinerary(seville, 999).durationWarning).toMatch(/séville/i);
    expect(buildItinerary(crete, 999).durationWarning).toMatch(/crète/i);
  });
});

// ─── Architecture canonique — priorité jours & activités ─────────
// Lisbonne est la destination de référence annotée :
//   J1 optional · J2 anchor · J3 anchor · J4 strong · J5 optional
// Activités bonus : Miradouro (J1), Feira da Ladra (J2),
//                  LX Factory + Coucher de soleil (J3),
//                  Time Out Market + Conservas (J5)

describe("buildItinerary — priorité jours (day.priority)", () => {
  it("N=1 balanced : retourne J2 (anchor, score 32) et non J1 (optional, score −5)", () => {
    const r = buildItinerary(lisbonne, 1);
    expect(r.days[0].zone).toBe("Alfama / Graça");
  });

  it("N=2 balanced : retourne les deux jours anchor J2 et J3", () => {
    const r = buildItinerary(lisbonne, 2);
    const zones = r.days.map((d) => d.zone);
    expect(zones).toContain("Alfama / Graça");
    expect(zones).toContain("Belém / Alcântara");
  });

  it("N=3 balanced : exclut J1 et J5 (optional) — seuls J2, J3, J4 retenus", () => {
    const r = buildItinerary(lisbonne, 3);
    const zones = r.days.map((d) => d.zone);
    expect(zones).not.toContain("Baixa / Chiado");
    expect(zones).not.toContain("Cais do Sodré / Mouraria / Baixa");
    expect(zones).toContain("Alfama / Graça");
    expect(zones).toContain("Belém / Alcântara");
    expect(zones).toContain("Sintra (excursion)");
  });

  it("N=3 relaxed : pas de biais priorité — J1 peut être retenu, J4 exclu", () => {
    const r = buildItinerary(lisbonne, 3, { pace: "relaxed" });
    // Relaxed : J2(13) J3(13) J1(9) — J4(8) exclu
    expect(r.days.some((d) => d.zone === "Sintra (excursion)")).toBe(false);
    expect(r.days.some((d) => d.zone === "Alfama / Graça")).toBe(true);
  });

  it("N=3 family : pas de biais priorité — comportement inchangé", () => {
    const r = buildItinerary(lisbonne, 3, { groupType: "family" });
    // Family : J2(14) J3(13) J5(7) — J4 exclu (transport 100′)
    expect(r.days.some((d) => d.zone === "Sintra (excursion)")).toBe(false);
  });
});

describe("buildItinerary — filtrage activités bonus (activity.priority)", () => {
  it("mode compressé N=3 : activités bonus de J3 retirées (LX Factory absent)", () => {
    const r = buildItinerary(lisbonne, 3);
    const j3 = r.days.find((d) => d.zone === "Belém / Alcântara");
    expect(j3).toBeDefined();
    expect(j3!.activities.some((a) => a.name.includes("LX Factory"))).toBe(false);
  });

  it("mode compressé N=3 : activités bonus de J3 retirées (Coucher de soleil absent)", () => {
    const r = buildItinerary(lisbonne, 3);
    const j3 = r.days.find((d) => d.zone === "Belém / Alcântara");
    expect(j3!.activities.some((a) => a.name.includes("Coucher de soleil"))).toBe(false);
  });

  it("mode compressé N=3 : activités must préservées (Monastère + Tour présent)", () => {
    const r = buildItinerary(lisbonne, 3);
    const j3 = r.days.find((d) => d.zone === "Belém / Alcântara");
    expect(j3!.activities.some((a) => a.name.includes("Monastère"))).toBe(true);
  });

  it("mode compressé N=2 : Museu do Fado (must) conservé sur J2", () => {
    const r = buildItinerary(lisbonne, 2);
    const j2 = r.days.find((d) => d.zone === "Alfama / Graça");
    expect(j2).toBeDefined();
    expect(j2!.activities.some((a) => a.name.includes("Museu do Fado"))).toBe(true);
  });

  it("mode compressé N=2 : Feira da Ladra (bonus) retirée de J2", () => {
    const r = buildItinerary(lisbonne, 2);
    const j2 = r.days.find((d) => d.zone === "Alfama / Graça");
    expect(j2!.activities.some((a) => a.name.includes("Feira da Ladra"))).toBe(false);
  });

  it("exact_template N=5 : activités bonus conservées (pas de filtrage hors compression)", () => {
    const r = buildItinerary(lisbonne, 5);
    expect(r.adaptationMode).toBe("exact_template");
    const j3 = r.days.find((d) => d.zone === "Belém / Alcântara");
    expect(j3!.activities.some((a) => a.name.includes("LX Factory"))).toBe(true);
    const j2 = r.days.find((d) => d.zone === "Alfama / Graça");
    expect(j2!.activities.some((a) => a.name.includes("Feira da Ladra"))).toBe(true);
  });

  it("destinations sans annotations (seville) : filterBonusActivities est un no-op", () => {
    // Seville's activities carry no priority field — compressed result must still have activities
    const r = buildItinerary(seville, 2);
    expect(r.adaptationMode).toBe("compressed_best_of");
    r.days.forEach((d) => expect(d.activities.length).toBeGreaterThan(0));
  });
});
