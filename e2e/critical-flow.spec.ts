import { test, expect } from "@playwright/test";

// ─── Helper: fill the 9-question quiz ─────────────────────────────
// Q1 budget, Q2 duration, Q3 departurePrecision, Q3a period, Q4 group, Q5 pace
// Q6 environment, Q7 flightTolerance (single-select)
// Q8 styles (multi), Q9 interests (multi)

async function fillQuiz(page: import("@playwright/test").Page) {
  await page.getByRole("radio", { name: /moyen/i }).click();
  await page.getByRole("radio", { name: /4–7/i }).click();
  await page.getByRole("button", { name: /passer/i }).click();              // skip durationExact
  await page.getByRole("radio", { name: /seulement la période/i }).click(); // departurePrecision
  await page.getByRole("radio", { name: /printemps/i }).click();            // period
  await page.getByRole("radio", { name: /couple/i }).click();
  await page.getByRole("radio", { name: /équilibré/i }).click();

  // Q6 environment, Q7 flightTolerance, Q8 flightBudget : single-select → role="radio"
  await page.getByRole("radio", { name: /peu importe/i }).first().click();
  await page.getByRole("radio", { name: /peu importe/i }).first().click();
  await page.getByRole("radio", { name: /peu importe/i }).first().click();

  // Q9–Q10 : multi-select → aria-pressed buttons
  await page.getByRole("button", { name: /authentique/i }).click();
  await page.getByRole("button", { name: /valider/i }).click();
  await page.getByRole("button", { name: /gastronomie/i }).click();
  await page.getByRole("button", { name: /art & musées/i }).click();
  await page.getByRole("button", { name: /valider/i }).click();
}

// ═════════════════════════════════════════════════════════════════════
// TEST 1: Quiz → Results
// ═════════════════════════════════════════════════════════════════════

test("Quiz → Results: completes quiz and lands on results with sid", async ({ page }) => {
  // Start at home
  await page.goto("/");
  await expect(page).toHaveTitle(/atlas/i);

  // Navigate to quiz — nav CTA (footer has the same link, use first)
  await page.getByRole("link", { name: /trouver mon voyage/i }).first().click();
  await expect(page).toHaveURL("/quiz");

  // Fill the quiz
  await fillQuiz(page);

  // Should redirect to /results?sid=...
  await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
  const url = page.url();
  expect(url).toMatch(/\/results\?sid=[a-f0-9-]{36}/);

  // Should display at least one destination result
  const resultCards = page.locator(".result-card");
  await expect(resultCards.first()).toBeVisible({ timeout: 5_000 });

  const count = await resultCards.count();
  expect(count).toBeGreaterThanOrEqual(1);

  // Should show the profile summary bar
  await expect(page.locator(".results-summary")).toBeVisible();
});

// ═════════════════════════════════════════════════════════════════════
// TEST 2: Results → Destination → Back to Results (sid preserved)
// ═════════════════════════════════════════════════════════════════════

test("Results → Destination → Back: sid is preserved in navigation", async ({ page }) => {
  // Complete quiz first
  await page.goto("/quiz");
  await fillQuiz(page);
  await page.waitForURL(/\/results\?sid=/);

  // Capture the sid from the URL
  const resultsUrl = page.url();
  const sid = new URL(resultsUrl).searchParams.get("sid");
  expect(sid).toBeTruthy();

  // Click "Voir la fiche" on the first result
  await page.locator(".result-card").first().getByRole("button", { name: /voir la fiche/i }).click();

  // Should be on /destination/[slug]?sid=...
  await page.waitForURL(/\/destination\/[a-z]+\?sid=/);
  const destUrl = new URL(page.url());
  expect(destUrl.searchParams.get("sid")).toBe(sid);

  // Should display the destination hero
  await expect(page.locator(".fiche-hero")).toBeVisible();

  // Click "Retour aux résultats"
  await page.getByRole("button", { name: /retour aux résultats/i }).click();

  // Should be back on /results?sid=... with the SAME sid
  await page.waitForURL(/\/results\?sid=/);
  const backUrl = new URL(page.url());
  expect(backUrl.searchParams.get("sid")).toBe(sid);

  // Results should still be visible
  await expect(page.locator(".result-card").first()).toBeVisible();
});

// ═════════════════════════════════════════════════════════════════════
// TEST 3: Results page survives refresh
// ═════════════════════════════════════════════════════════════════════

test("Results refresh: page remains functional after browser reload", async ({ page }) => {
  // Complete quiz
  await page.goto("/quiz");
  await fillQuiz(page);
  await page.waitForURL(/\/results\?sid=/);

  // Capture state before refresh
  const urlBefore = page.url();
  const firstCardText = await page.locator(".result-card").first().textContent();

  // Hard refresh
  await page.reload();

  // URL should be unchanged
  expect(page.url()).toBe(urlBefore);

  // Should NOT redirect to /quiz
  await page.waitForTimeout(1_000);
  expect(page.url()).toContain("/results?sid=");

  // Results should still be visible with the same first card
  await expect(page.locator(".result-card").first()).toBeVisible();
  const firstCardAfter = await page.locator(".result-card").first().textContent();
  expect(firstCardAfter).toBe(firstCardText);

  // Profile summary should still be visible
  await expect(page.locator(".results-summary")).toBeVisible();
});
