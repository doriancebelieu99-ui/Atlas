import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Destinations dont flightHoursFromParis > 7 — liste tirée de destinations.ts
const LONG_HAUL_SLUGS = new Set([
  "montreal", "new-york", "zanzibar", "bangkok", "le-cap",
  "rio-de-janeiro", "kyoto", "mexico", "tokyo", "lima",
  "singapour", "bali", "buenos-aires", "sydney",
  "hanoi", "kenya", "la-havane", "rajasthan", "oman",
  "siem-reap", "costa-rica",
]);

// ─── Generic quiz helper ──────────────────────────────────────────
// Fills the 9-question quiz with a minimal profile, overridable per test.
// Q8 (styles) and Q9 (interests) are always skipped via "Passer".

interface QuizOpts {
  budget?: "low" | "medium" | "high" | "premium";
  duration?: "short" | "week" | "long" | "extended";
  group?: "solo" | "couple" | "friends" | "family";
  flightTolerance?: "short" | "any" | "long";
  departureMonth?: "jan"|"feb"|"mar"|"apr"|"may"|"jun"|"jul"|"aug"|"sep"|"oct"|"nov"|"dec";
}

const MONTH_LABEL: Record<string, RegExp> = {
  jan: /janvier/i, feb: /février/i, mar: /mars/i, apr: /avril/i,
  may: /mai/i, jun: /juin/i, jul: /juillet/i, aug: /août/i,
  sep: /septembre/i, oct: /octobre/i, nov: /novembre/i, dec: /décembre/i,
};

async function fillQuizMinimal(page: Page, opts: QuizOpts = {}) {
  const {
    budget = "medium",
    duration = "week",
    group = "couple",
    flightTolerance = "any",
    departureMonth,
  } = opts;

  await page.goto("/quiz");

  const BUDGET = { low: /serré/i, medium: /moyen/i, high: /confort/i, premium: /premium/i };
  const DURATION = { short: /2–3/i, week: /4–7/i, long: /8–14/i, extended: /15/i };
  const GROUP = { solo: /solo/i, couple: /couple/i, friends: /amis/i, family: /famille/i };

  await page.getByRole("radio", { name: BUDGET[budget] }).click();
  await page.getByRole("radio", { name: DURATION[duration] }).click();
  await page.getByRole("button", { name: /passer/i }).click();               // skip durationExact
  if (departureMonth) {
    await page.getByRole("radio", { name: /mon mois exact/i }).click();
    await page.getByRole("radio", { name: MONTH_LABEL[departureMonth] }).click();
  } else {
    await page.getByRole("radio", { name: /seulement la période/i }).click(); // departurePrecision
    await page.getByRole("radio", { name: /printemps/i }).click();             // period: spring
  }
  await page.getByRole("radio", { name: GROUP[group] }).click();
  await page.getByRole("radio", { name: /équilibré/i }).click();           // Q5 pace: balanced
  await page.getByRole("radio", { name: /peu importe/i }).first().click(); // Q6 env: any

  if (flightTolerance === "long") {
    await page.getByRole("radio", { name: /long-courrier/i }).click();
  } else if (flightTolerance === "short") {
    await page.getByRole("radio", { name: /vol court/i }).click();
  } else {
    await page.getByRole("radio", { name: /peu importe/i }).first().click();
  }

  await page.getByRole("radio", { name: /peu importe/i }).first().click(); // flightBudget: flexible
  await page.getByRole("button", { name: /passer/i }).click(); // styles: skip
  await page.getByRole("button", { name: /passer/i }).click(); // interests: skip

  await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
  await page.locator(".result-card").first().waitFor({ timeout: 5_000 });
}

// ═════════════════════════════════════════════════════════════════════
// TEST 1 — classement long-courrier : top 5 majoritairement lointains
// (profil complet avec styles + intérêts — non refactorisé intentionnellement)
// ═════════════════════════════════════════════════════════════════════

test(
  "flightTolerance long — au moins 4 des 5 premières destinations sont long-courrier",
  async ({ page }) => {
    await page.goto("/quiz");
    await expect(page).toHaveURL("/quiz");

    await page.getByRole("radio", { name: /premium/i }).click();
    await page.getByRole("radio", { name: /15/i }).click();
    await page.getByRole("button", { name: /passer/i }).click();              // skip durationExact
    await page.getByRole("radio", { name: /seulement la période/i }).click(); // departurePrecision
    await page.getByRole("radio", { name: /hiver/i }).click();                // period: winter
    await page.getByRole("radio", { name: /couple/i }).click();
    await page.getByRole("radio", { name: /équilibré/i }).click();
    await page.getByRole("radio", { name: /peu importe/i }).first().click(); // env
    await page.getByRole("radio", { name: /long-courrier/i }).click();       // flightTolerance
    await page.getByRole("radio", { name: /peu importe/i }).first().click(); // flightBudget

    await page.getByRole("button", { name: /culture/i }).click();
    await page.getByRole("button", { name: /vie urbaine/i }).click();
    await page.getByRole("button", { name: /valider/i }).click();

    await page.getByRole("button", { name: /architecture/i }).click();
    await page.getByRole("button", { name: /histoire/i }).click();
    await page.getByRole("button", { name: /gastronomie/i }).click();
    await page.getByRole("button", { name: /valider/i }).click();

    await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
    await page.locator(".result-card").first().waitFor({ timeout: 5_000 });

    const firstFiveSlugs = await page.locator(".result-card").evaluateAll(
      (cards) => cards.slice(0, 5).map((c) => c.getAttribute("data-slug") ?? ""),
    );
    expect(firstFiveSlugs).toHaveLength(5);
    const longHaulCount = firstFiveSlugs.filter((slug) => LONG_HAUL_SLUGS.has(slug)).length;
    expect(
      longHaulCount,
      `Attendu ≥4 long-courriers dans le top 5, obtenu ${longHaulCount}.\nTop 5 : ${firstFiveSlugs.join(", ")}`,
    ).toBeGreaterThanOrEqual(4);
  },
);

// ═════════════════════════════════════════════════════════════════════
// TESTS 2–7 : signaux contextuels — présence et libellé
// ═════════════════════════════════════════════════════════════════════

test("signal — flightTolerance long : bloc 'Classement long-courrier' affiché", async ({ page }) => {
  await fillQuizMinimal(page, { flightTolerance: "long" });
  const signal = page.locator(".results-flight-signal");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("Classement long-courrier");
  await expect(signal).toContainText("Les destinations les plus éloignées");
});

test("signal — flightTolerance short : bloc 'Vols courts uniquement' affiché", async ({ page }) => {
  await fillQuizMinimal(page, { flightTolerance: "short" });
  const signal = page.locator(".results-flight-signal");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("Vols courts uniquement");
  await expect(signal).toContainText("moins de 3 heures de Paris");
});

test("signal — budget low : bloc 'Budget serré' affiché", async ({ page }) => {
  await fillQuizMinimal(page, { budget: "low" });
  const signal = page.locator(".results-flight-signal");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("Budget serré");
  await expect(signal).toContainText("tarif minimum dépasse votre fourchette");
});

test("signal — group family : bloc 'Voyage en famille' affiché", async ({ page }) => {
  await fillQuizMinimal(page, { group: "family" });
  const signal = page.locator(".results-flight-signal");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("Voyage en famille");
  await expect(signal).toContainText("facilité logistique");
});

test("signal — duration short : bloc 'Séjour court' affiché", async ({ page }) => {
  await fillQuizMinimal(page, { duration: "short" });
  const signal = page.locator(".results-flight-signal");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("Séjour court");
  await expect(signal).toContainText("2 à 3 jours");
});

test("signal — flightTolerance any : aucun bloc signal affiché", async ({ page }) => {
  await fillQuizMinimal(page, { flightTolerance: "any" });
  await expect(page.locator(".results-flight-signal")).toHaveCount(0);
});

// ═════════════════════════════════════════════════════════════════════
// TEST 8 — priorité : budget=low prend le dessus sur flightTolerance=long
// ═════════════════════════════════════════════════════════════════════

test(
  "priorité signal — budget low + flightTolerance long : 'Budget serré' affiché (pas long-courrier)",
  async ({ page }) => {
    await fillQuizMinimal(page, { budget: "low", flightTolerance: "long" });
    const signal = page.locator(".results-flight-signal");
    await expect(signal).toBeVisible();
    await expect(signal).toContainText("Budget serré");
    await expect(signal).not.toContainText("Classement long-courrier");
  },
);
