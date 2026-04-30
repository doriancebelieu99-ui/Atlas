import { test, expect } from "@playwright/test";

// Destinations dont flightHoursFromParis > 7 — liste stable tirée de destinations.ts
const LONG_HAUL_SLUGS = new Set([
  "montreal", "new-york", "zanzibar", "bangkok", "le-cap",
  "rio-de-janeiro", "kyoto", "mexico", "tokyo", "lima",
  "singapour", "bali", "buenos-aires", "sydney",
]);

test(
  "flightTolerance long — au moins 4 des 5 premières destinations sont long-courrier",
  async ({ page }) => {
    await page.goto("/quiz");
    await expect(page).toHaveURL("/quiz");

    // Q1 budget : premium
    await page.getByRole("radio", { name: /premium/i }).click();
    // Q2 duration : extended (15+)
    await page.getByRole("radio", { name: /15/i }).click();
    // Q3 period : hiver
    await page.getByRole("radio", { name: /hiver/i }).click();
    // Q4 group : couple
    await page.getByRole("radio", { name: /couple/i }).click();
    // Q5 pace : équilibré
    await page.getByRole("radio", { name: /équilibré/i }).click();
    // Q6 environment : peu importe (any)
    await page.getByRole("radio", { name: /peu importe/i }).first().click();
    // Q7 flightTolerance : long-courrier — le signal produit testé ici
    await page.getByRole("radio", { name: /long-courrier/i }).click();

    // Q8 styles : culture_patrimoine + energie_urbaine (multi-select)
    await page.getByRole("button", { name: /culture/i }).click();
    await page.getByRole("button", { name: /vie urbaine/i }).click();
    await page.getByRole("button", { name: /valider/i }).click();

    // Q9 interests : architecture + histoire + gastronomie (multi-select)
    await page.getByRole("button", { name: /architecture/i }).click();
    await page.getByRole("button", { name: /histoire/i }).click();
    await page.getByRole("button", { name: /gastronomie/i }).click();
    await page.getByRole("button", { name: /valider/i }).click();

    // Attendre la page results avec sid
    await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
    await page.locator(".result-card").first().waitFor({ timeout: 5_000 });

    // Lire les slugs des 5 premières cartes via data-slug
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
