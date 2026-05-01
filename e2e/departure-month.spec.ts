import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// ─── Helper ───────────────────────────────────────────────────────

async function fillQuizWithMonth(page: Page, month: "aug" | "jan" | "dec") {
  const MONTH_LABEL: Record<string, RegExp> = {
    aug: /août/i, jan: /janvier/i, dec: /décembre/i,
  };

  await page.goto("/quiz");
  await page.getByRole("radio", { name: /moyen/i }).click();            // budget: medium
  await page.getByRole("radio", { name: /4–7/i }).click();              // duration: week
  await page.getByRole("button", { name: /passer/i }).click();          // skip durationExact
  await page.getByRole("radio", { name: /mon mois exact/i }).click();   // departurePrecision
  await page.getByRole("radio", { name: MONTH_LABEL[month] }).click();  // departureMonth
  await page.getByRole("radio", { name: /couple/i }).click();           // group
  await page.getByRole("radio", { name: /équilibré/i }).click();        // pace
  await page.getByRole("radio", { name: /peu importe/i }).first().click(); // env
  await page.getByRole("radio", { name: /peu importe/i }).first().click(); // flightTolerance
  await page.getByRole("button", { name: /passer/i }).click();          // styles: skip
  await page.getByRole("button", { name: /passer/i }).click();          // interests: skip

  await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
  await page.locator(".result-card").first().waitFor({ timeout: 5_000 });
}

async function fillQuizWithSeason(page: Page) {
  await page.goto("/quiz");
  await page.getByRole("radio", { name: /moyen/i }).click();
  await page.getByRole("radio", { name: /4–7/i }).click();
  await page.getByRole("button", { name: /passer/i }).click();          // skip durationExact
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
}

// ─── Tests ────────────────────────────────────────────────────────

test("mois précis — signal 'Départ en Août' affiché sur /results", async ({ page }) => {
  await fillQuizWithMonth(page, "aug");
  const signal = page.locator(".results-flight-signal");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("Départ en Août");
  await expect(signal).toContainText("août");
});

test("mois précis — signal 'Départ en Janvier' affiché sur /results", async ({ page }) => {
  await fillQuizWithMonth(page, "jan");
  const signal = page.locator(".results-flight-signal");
  await expect(signal).toBeVisible();
  await expect(signal).toContainText("Départ en Janvier");
});

test("saison large — aucun signal 'Départ en' sur /results", async ({ page }) => {
  await fillQuizWithSeason(page);
  // Season mode has no departure_month signal — only other signals may appear
  const signal = page.locator(".results-flight-signal");
  const text = await signal.count() > 0 ? await signal.textContent() : "";
  expect(text).not.toMatch(/Départ en/i);
});

test("mois précis — résultats présents et classement non vide", async ({ page }) => {
  await fillQuizWithMonth(page, "aug");
  const cards = page.locator(".result-card");
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test("mode mois — le profil summary affiche 'Mois précis'", async ({ page }) => {
  await fillQuizWithMonth(page, "aug");
  const summary = page.locator(".results-summary");
  await expect(summary).toContainText(/mois précis/i);
});

test("mode mois — badge saisonnier visible sur la première carte", async ({ page }) => {
  await fillQuizWithMonth(page, "aug");
  const badge = page.locator(".result-card-month-badge").first();
  await expect(badge).toBeVisible();
  await expect(badge).toContainText("Août");
});

test("mode mois — badge saisonnier présent sur toutes les cartes résultats", async ({ page }) => {
  await fillQuizWithMonth(page, "jan");
  const badges = page.locator(".result-card-month-badge");
  const cards  = page.locator(".result-card");
  const badgeCount = await badges.count();
  const cardCount  = await cards.count();
  expect(badgeCount).toBe(cardCount);
  await expect(badges.first()).toContainText("Janvier");
});

test("mode saison — aucun badge saisonnier affiché", async ({ page }) => {
  await fillQuizWithSeason(page);
  await expect(page.locator(".result-card-month-badge")).toHaveCount(0);
});
