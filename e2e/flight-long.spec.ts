import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Destinations dont flightHoursFromParis > 7 — liste stable tirée de destinations.ts
const LONG_HAUL_SLUGS = new Set([
  "montreal", "new-york", "zanzibar", "bangkok", "le-cap",
  "rio-de-janeiro", "kyoto", "mexico", "tokyo", "lima",
  "singapour", "bali", "buenos-aires", "sydney",
]);

// ─── Helper : remplit le quiz jusqu'à /results ────────────────────
// Profil minimal (medium/week/spring/couple/balanced) avec flightTolerance variable.
// Q8 et Q9 sont passés via le bouton "Passer" pour rester rapide.

async function fillQuizWithFlight(page: Page, flightTolerance: "short" | "any" | "long") {
  await page.goto("/quiz");
  await expect(page).toHaveURL("/quiz");

  await page.getByRole("radio", { name: /moyen/i }).click();          // Q1 budget: medium
  await page.getByRole("radio", { name: /4–7/i }).click();            // Q2 duration: week
  await page.getByRole("radio", { name: /printemps/i }).click();      // Q3 period: spring
  await page.getByRole("radio", { name: /couple/i }).click();         // Q4 group: couple
  await page.getByRole("radio", { name: /équilibré/i }).click();      // Q5 pace: balanced
  await page.getByRole("radio", { name: /peu importe/i }).first().click(); // Q6 env: any

  // Q7 flightTolerance : valeur variable
  if (flightTolerance === "long") {
    await page.getByRole("radio", { name: /long-courrier/i }).click();
  } else if (flightTolerance === "short") {
    await page.getByRole("radio", { name: /vol court/i }).click();
  } else {
    await page.getByRole("radio", { name: /peu importe/i }).first().click(); // any
  }

  await page.getByRole("button", { name: /passer/i }).click(); // Q8 styles: skip
  await page.getByRole("button", { name: /passer/i }).click(); // Q9 interests: skip

  await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
  await page.locator(".result-card").first().waitFor({ timeout: 5_000 });
}

// ═════════════════════════════════════════════════════════════════════
// TEST 1 : classement long-courrier — top 5 majoritairement lointains
// ═════════════════════════════════════════════════════════════════════

test(
  "flightTolerance long — au moins 4 des 5 premières destinations sont long-courrier",
  async ({ page }) => {
    await page.goto("/quiz");
    await expect(page).toHaveURL("/quiz");

    await page.getByRole("radio", { name: /premium/i }).click();
    await page.getByRole("radio", { name: /15/i }).click();
    await page.getByRole("radio", { name: /hiver/i }).click();
    await page.getByRole("radio", { name: /couple/i }).click();
    await page.getByRole("radio", { name: /équilibré/i }).click();
    await page.getByRole("radio", { name: /peu importe/i }).first().click();
    await page.getByRole("radio", { name: /long-courrier/i }).click();

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
// TEST 2 : signal banner visible avec flightTolerance = "long"
// ═════════════════════════════════════════════════════════════════════

test(
  "flightTolerance long — le bloc signal long-courrier est affiché sur /results",
  async ({ page }) => {
    await fillQuizWithFlight(page, "long");

    const signal = page.locator(".results-flight-signal");
    await expect(signal).toBeVisible();
    await expect(signal).toContainText("Classement long-courrier");
    await expect(signal).toContainText("Les destinations les plus éloignées");
  },
);

// ═════════════════════════════════════════════════════════════════════
// TEST 3 : signal banner absent avec flightTolerance = "any"
// ═════════════════════════════════════════════════════════════════════

test(
  "flightTolerance any — le bloc signal long-courrier est absent sur /results",
  async ({ page }) => {
    await fillQuizWithFlight(page, "any");

    await expect(page.locator(".results-flight-signal")).toHaveCount(0);
  },
);

// ═════════════════════════════════════════════════════════════════════
// TEST 4 : signal banner absent avec flightTolerance = "short"
// ═════════════════════════════════════════════════════════════════════

test(
  "flightTolerance short — le bloc signal long-courrier est absent sur /results",
  async ({ page }) => {
    await fillQuizWithFlight(page, "short");

    await expect(page.locator(".results-flight-signal")).toHaveCount(0);
  },
);
