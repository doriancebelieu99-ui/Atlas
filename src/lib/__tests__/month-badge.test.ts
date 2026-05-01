import { describe, it, expect } from "vitest";
import { monthSeasonBadge } from "@/components/results/ResultCard";

describe("monthSeasonBadge", () => {
  it("score = 80 → level top, dot ●, label très favorable", () => {
    const b = monthSeasonBadge(80, "Août");
    expect(b.level).toBe("top");
    expect(b.dot).toBe("●");
    expect(b.label).toBe("Août · Très favorable");
  });

  it("score = 100 → level top", () => {
    expect(monthSeasonBadge(100, "Juin").level).toBe("top");
  });

  it("score = 79 → level ok, dot ○", () => {
    const b = monthSeasonBadge(79, "Août");
    expect(b.level).toBe("ok");
    expect(b.dot).toBe("○");
    expect(b.label).toBe("Août · Correct");
  });

  it("score = 60 → level ok (borne basse incluse)", () => {
    expect(monthSeasonBadge(60, "Janvier").level).toBe("ok");
  });

  it("score = 59 → level off, dot ◐, label période difficile", () => {
    const b = monthSeasonBadge(59, "Décembre");
    expect(b.level).toBe("off");
    expect(b.dot).toBe("◐");
    expect(b.label).toBe("Décembre · Période difficile");
  });

  it("score = 0 → level off", () => {
    expect(monthSeasonBadge(0, "Février").level).toBe("off");
  });

  it("le label contient le nom du mois transmis", () => {
    expect(monthSeasonBadge(90, "Juillet").label).toContain("Juillet");
    expect(monthSeasonBadge(70, "Mars").label).toContain("Mars");
    expect(monthSeasonBadge(40, "Novembre").label).toContain("Novembre");
  });
});
