import { describe, it, expect } from "vitest";
import { getResultSignal } from "@/lib/result-signal";
import type { QuizAnswers } from "@/lib/types";

// Base answers that produce no signal on their own
const BASE: QuizAnswers = {
  budget: "medium",
  duration: "week",
  group: "couple",
  flightTolerance: "any",
  period: "spring",
  pace: "balanced",
  environment: "any",
};

// ─── Individual trigger cases ─────────────────────────────────────

describe("getResultSignal — cas individuels", () => {
  it("budget=low → key budget_low", () => {
    const signal = getResultSignal({ ...BASE, budget: "low" });
    expect(signal).not.toBeNull();
    expect(signal!.key).toBe("budget_low");
    expect(signal!.label).toBe("Budget serré");
    expect(signal!.text).toContain("tarif minimum dépasse votre fourchette");
  });

  it("flightTolerance=short → key flight_short", () => {
    const signal = getResultSignal({ ...BASE, flightTolerance: "short" });
    expect(signal).not.toBeNull();
    expect(signal!.key).toBe("flight_short");
    expect(signal!.label).toBe("Vols courts uniquement");
    expect(signal!.text).toContain("moins de 3 heures de Paris");
  });

  it("departurePrecision=month + departureMonth=aug → key departure_month", () => {
    const signal = getResultSignal({ ...BASE, departurePrecision: "month", departureMonth: "aug" });
    expect(signal).not.toBeNull();
    expect(signal!.key).toBe("departure_month");
    expect(signal!.label).toBe("Départ en Août");
    expect(signal!.text).toContain("août");
  });

  it("departurePrecision=month + departureMonth=jan → label contains Janvier", () => {
    const signal = getResultSignal({ ...BASE, departurePrecision: "month", departureMonth: "jan" });
    expect(signal!.key).toBe("departure_month");
    expect(signal!.label).toBe("Départ en Janvier");
  });

  it("departurePrecision=season → no departure_month signal", () => {
    const signal = getResultSignal({ ...BASE, departurePrecision: "season" });
    expect(signal).toBeNull(); // BASE has medium budget, any flight, couple, week
  });

  it("flightTolerance=long → key flight_long", () => {
    const signal = getResultSignal({ ...BASE, flightTolerance: "long" });
    expect(signal).not.toBeNull();
    expect(signal!.key).toBe("flight_long");
    expect(signal!.label).toBe("Classement long-courrier");
    expect(signal!.text).toContain("Les destinations les plus éloignées");
  });

  it("group=family → key family", () => {
    const signal = getResultSignal({ ...BASE, group: "family" });
    expect(signal).not.toBeNull();
    expect(signal!.key).toBe("family");
    expect(signal!.label).toBe("Voyage en famille");
    expect(signal!.text).toContain("facilité logistique");
  });

  it("duration=short → key duration_short", () => {
    const signal = getResultSignal({ ...BASE, duration: "short" });
    expect(signal).not.toBeNull();
    expect(signal!.key).toBe("duration_short");
    expect(signal!.label).toBe("Séjour court");
    expect(signal!.text).toContain("2 à 3 jours");
  });
});

// ─── No-signal cases ──────────────────────────────────────────────

describe("getResultSignal — aucun signal", () => {
  it("profil neutre (base) → null", () => {
    expect(getResultSignal(BASE)).toBeNull();
  });

  it("flightTolerance=any explicite → null", () => {
    expect(getResultSignal({ ...BASE, flightTolerance: "any" })).toBeNull();
  });

  it("budget=medium → null", () => {
    expect(getResultSignal({ ...BASE, budget: "medium" })).toBeNull();
  });

  it("budget=high → null", () => {
    expect(getResultSignal({ ...BASE, budget: "high" })).toBeNull();
  });

  it("budget=premium → null", () => {
    expect(getResultSignal({ ...BASE, budget: "premium" })).toBeNull();
  });

  it("group=solo → null", () => {
    expect(getResultSignal({ ...BASE, group: "solo" })).toBeNull();
  });

  it("duration=week → null", () => {
    expect(getResultSignal({ ...BASE, duration: "week" })).toBeNull();
  });
});

// ─── Priority cases ───────────────────────────────────────────────

describe("getResultSignal — priorités", () => {
  it("budget=low + flightTolerance=long → budget_low gagne", () => {
    const signal = getResultSignal({ ...BASE, budget: "low", flightTolerance: "long" });
    expect(signal!.key).toBe("budget_low");
  });

  it("budget=low + group=family → budget_low gagne", () => {
    const signal = getResultSignal({ ...BASE, budget: "low", group: "family" });
    expect(signal!.key).toBe("budget_low");
  });

  it("flightTolerance=short + group=family → flight_short gagne", () => {
    const signal = getResultSignal({ ...BASE, flightTolerance: "short", group: "family" });
    expect(signal!.key).toBe("flight_short");
  });

  it("flightTolerance=short + duration=short → flight_short gagne", () => {
    const signal = getResultSignal({ ...BASE, flightTolerance: "short", duration: "short" });
    expect(signal!.key).toBe("flight_short");
  });

  it("departure_month + budget=low → budget_low gagne", () => {
    const signal = getResultSignal({
      ...BASE, budget: "low", departurePrecision: "month", departureMonth: "aug",
    });
    expect(signal!.key).toBe("budget_low");
  });

  it("departure_month + flightTolerance=short → flight_short gagne", () => {
    const signal = getResultSignal({
      ...BASE, flightTolerance: "short", departurePrecision: "month", departureMonth: "aug",
    });
    expect(signal!.key).toBe("flight_short");
  });

  it("departure_month + flightTolerance=long → departure_month gagne", () => {
    const signal = getResultSignal({
      ...BASE, flightTolerance: "long", departurePrecision: "month", departureMonth: "aug",
    });
    expect(signal!.key).toBe("departure_month");
  });

  it("departure_month + group=family → departure_month gagne", () => {
    const signal = getResultSignal({
      ...BASE, group: "family", departurePrecision: "month", departureMonth: "aug",
    });
    expect(signal!.key).toBe("departure_month");
  });

  it("flightTolerance=long + group=family → flight_long gagne", () => {
    const signal = getResultSignal({ ...BASE, flightTolerance: "long", group: "family" });
    expect(signal!.key).toBe("flight_long");
  });

  it("group=family + duration=short → family gagne", () => {
    const signal = getResultSignal({ ...BASE, group: "family", duration: "short" });
    expect(signal!.key).toBe("family");
  });

  it("budget=low + flightTolerance=short + group=family → budget_low gagne", () => {
    const signal = getResultSignal({ ...BASE, budget: "low", flightTolerance: "short", group: "family" });
    expect(signal!.key).toBe("budget_low");
  });
});

// ─── Shape contract ───────────────────────────────────────────────

describe("getResultSignal — forme du résultat", () => {
  it("chaque signal retourne key, icon, label, text non vides", () => {
    const cases: QuizAnswers[] = [
      { ...BASE, budget: "low" },
      { ...BASE, flightTolerance: "short" },
      { ...BASE, departurePrecision: "month", departureMonth: "aug" },
      { ...BASE, flightTolerance: "long" },
      { ...BASE, group: "family" },
      { ...BASE, duration: "short" },
    ];
    for (const answers of cases) {
      const s = getResultSignal(answers);
      expect(s).not.toBeNull();
      expect(s!.key).toBeTruthy();
      expect(s!.icon).toBeTruthy();
      expect(s!.label).toBeTruthy();
      expect(s!.text.length).toBeGreaterThan(20);
    }
  });
});
