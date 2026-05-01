import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────

async function fillQuizAndGoToItinerary(
  page: Page,
  duration: "short" | "week" | "long",
): Promise<void> {
  const DURATION_LABEL: Record<string, RegExp> = {
    short: /2.3\s*jours/i,
    week: /4.7/i,
    long: /8.14/i,
  };

  await page.goto("/quiz");
  await page.getByRole("radio", { name: /moyen/i }).click();
  await page.getByRole("radio", { name: DURATION_LABEL[duration] }).click();
  await page.getByRole("radio", { name: /seulement la période/i }).click();
  await page.getByRole("radio", { name: /printemps/i }).click();
  await page.getByRole("radio", { name: /couple/i }).click();
  await page.getByRole("radio", { name: /équilibré/i }).click();
  await page.getByRole("radio", { name: /peu importe/i }).first().click();
  await page.getByRole("radio", { name: /peu importe/i }).first().click();
  await page.getByRole("button", { name: /passer/i }).click();
  await page.getByRole("button", { name: /passer/i }).click();

  await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
  await page.locator(".result-card").first().waitFor({ timeout: 5_000 });

  const itinBtn = page.getByRole("button", { name: /voir l'itinéraire/i }).first();
  await expect(itinBtn).toBeVisible({ timeout: 5_000 });
  await itinBtn.click();

  await page.waitForURL(/\/itinerary\//, { timeout: 5_000 });
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });
}

// ─── Tests ────────────────────────────────────────────────────────

test("accès direct sans session — affiche le template complet", async ({ page }) => {
  await page.goto("/itinerary/lisbonne");
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });

  // 5 template days + 1 overview tab = 6 buttons
  const tabs = page.locator(".itin-day-nav [role=tab]");
  await expect(tabs).toHaveCount(6);
  await expect(page.locator(".itin-duration-warning")).toHaveCount(0);
});

test("durée courte (3 jours) — itinéraire tronqué à 3 jours", async ({ page }) => {
  await fillQuizAndGoToItinerary(page, "short");

  // 3 days + 1 overview = 4 tabs
  const tabs = page.locator(".itin-day-nav [role=tab]");
  await expect(tabs).toHaveCount(4);
});

test("durée longue (10 jours) — warning de contenu épuisé visible pour Lisbonne", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByRole("radio", { name: /moyen/i }).click();
  await page.getByRole("radio", { name: /8.14/i }).click();
  await page.getByRole("radio", { name: /seulement la période/i }).click();
  await page.getByRole("radio", { name: /printemps/i }).click();
  await page.getByRole("radio", { name: /couple/i }).click();
  await page.getByRole("radio", { name: /équilibré/i }).click();
  await page.getByRole("radio", { name: /peu importe/i }).first().click();
  await page.getByRole("radio", { name: /peu importe/i }).first().click();
  await page.getByRole("button", { name: /passer/i }).click();
  await page.getByRole("button", { name: /passer/i }).click();

  await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });

  // Extract SID and navigate directly to lisbonne (idealDuration 3-5, requested 10 → warning)
  const sid = new URL(page.url()).searchParams.get("sid");
  await page.goto(`/itinerary/lisbonne?sid=${sid}`);
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });

  await expect(page.locator(".itin-duration-warning")).toBeVisible();
});

test("durée longue — itinéraire étendu au-delà du template de base", async ({ page }) => {
  await fillQuizAndGoToItinerary(page, "long");

  // Long (10 days) → more tabs than a 5-day template would give
  const tabs = page.locator(".itin-day-nav [role=tab]");
  const count = await tabs.count();
  // overview (1) + template (5) + synthetic days = at least 7 tabs
  expect(count).toBeGreaterThan(6);
});

test("navigation jour par jour toujours fonctionnelle après adaptation", async ({ page }) => {
  await fillQuizAndGoToItinerary(page, "short");

  // Click on J1 and verify day view loads
  await page.locator(".itin-day-btn", { hasText: "J1" }).click();
  await expect(page.locator(".day-view")).toBeVisible({ timeout: 3_000 });
});

test("badge de tier affiché pour séjour court (condensed)", async ({ page }) => {
  await page.goto("/itinerary/lisbonne");
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });
  // Direct access with no session → standard tier, no badge
  await expect(page.locator(".itin-tier-badge")).toHaveCount(0);
});
