import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────

// Fills the quiz up to results, returns the SID from the URL.
// Pass exactDays to answer durationExact; omit to skip it (passer).
async function fillQuizAndGetSid(
  page: Page,
  opts: {
    duration?: "short" | "week" | "long";
    exactDays?: number;
    pace?: "relax" | "balanced" | "dense";
    group?: "solo" | "couple" | "friends" | "family";
  } = {},
): Promise<string> {
  const { duration = "week", exactDays, pace = "balanced", group = "couple" } = opts;
  const DURATION_LABEL: Record<string, RegExp> = {
    short: /2.3\s*jours/i,
    week:  /4.7/i,
    long:  /8.14/i,
  };
  const PACE_LABEL: Record<string, RegExp> = {
    relax:    /relax/i,
    balanced: /équilibré/i,
    dense:    /dense/i,
  };
  const GROUP_LABEL: Record<string, RegExp> = {
    solo:    /solo/i,
    couple:  /couple/i,
    friends: /amis/i,
    family:  /famille/i,
  };

  await page.goto("/quiz");
  await page.getByRole("radio", { name: /moyen/i }).click();
  await page.getByRole("radio", { name: DURATION_LABEL[duration] }).click();

  if (exactDays !== undefined) {
    // Use negative lookbehind to avoid matching "11" when selecting "1", etc.
    await page.getByRole("radio", { name: new RegExp(`(?<!\\d)${exactDays} jours?`, "i") }).click();
  } else {
    await page.getByRole("button", { name: /passer/i }).click(); // skip durationExact
  }

  await page.getByRole("radio", { name: /seulement la période/i }).click(); // departurePrecision
  await page.getByRole("radio", { name: /printemps/i }).click();             // period
  await page.getByRole("radio", { name: GROUP_LABEL[group] }).click();
  await page.getByRole("radio", { name: PACE_LABEL[pace] }).click();
  await page.getByRole("radio", { name: /peu importe/i }).first().click();  // env
  await page.getByRole("radio", { name: /peu importe/i }).first().click();  // flightTolerance
  await page.getByRole("radio", { name: /peu importe/i }).first().click();  // flightBudget
  await page.getByRole("button", { name: /passer/i }).click();              // styles: skip
  await page.getByRole("button", { name: /passer/i }).click();              // interests: skip

  await page.waitForURL(/\/results\?sid=/, { timeout: 10_000 });
  await page.locator(".result-card").first().waitFor({ timeout: 5_000 });

  return new URL(page.url()).searchParams.get("sid")!;
}

async function goToItinerary(page: Page, slug: string, sid: string): Promise<void> {
  await page.goto(`/itinerary/${slug}?sid=${sid}`);
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });
}

// ─── Tests — accès direct ─────────────────────────────────────────

test("accès direct sans session — template complet (exact_template)", async ({ page }) => {
  await page.goto("/itinerary/lisbonne");
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });

  // 5 template days + 1 overview tab = 6 buttons
  const tabs = page.locator(".itin-day-nav [role=tab]");
  await expect(tabs).toHaveCount(6);
  await expect(page.locator(".itin-duration-warning")).toHaveCount(0);
  await expect(page.locator(".itin-adaptation")).toHaveCount(0);
});

// ─── Tests — durationExact via quiz ───────────────────────────────

test("durationExact=1 — itinéraire 1 jour, best-of mode", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "short", exactDays: 1 });
  await goToItinerary(page, "lisbonne", sid);

  const tabs = page.locator(".itin-day-nav [role=tab]");
  await expect(tabs).toHaveCount(2); // 1 day + overview
});

test("durationExact=3 — itinéraire tronqué à 3 jours", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "short", exactDays: 3 });
  await goToItinerary(page, "lisbonne", sid);

  const tabs = page.locator(".itin-day-nav [role=tab]");
  await expect(tabs).toHaveCount(4); // 3 days + overview
});

test("durationExact=5 — template complet (exact_template), pas d'adaptation visible", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "week", exactDays: 5 });
  await goToItinerary(page, "lisbonne", sid);

  const tabs = page.locator(".itin-day-nav [role=tab]");
  await expect(tabs).toHaveCount(6); // 5 days + overview
  await expect(page.locator(".itin-adaptation")).toHaveCount(0);
  await expect(page.locator(".itin-duration-warning")).toHaveCount(0);
});

test("durationExact=7 — étendu avec villes secondaires", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "long", exactDays: 7 });
  await goToItinerary(page, "lisbonne", sid);

  const tabs = page.locator(".itin-day-nav [role=tab]");
  await expect(tabs).toHaveCount(8); // 7 days + overview
  await expect(page.locator(".itin-adaptation")).toBeVisible();
  await expect(page.locator(".itin-adaptation")).toContainText(/zones secondaires/i);
});

test("durationExact=14 — warning de contenu épuisé visible", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "long", exactDays: 14 });
  await goToItinerary(page, "lisbonne", sid);

  await expect(page.locator(".itin-duration-warning")).toBeVisible();
  await expect(page.locator(".itin-duration-warning")).toContainText(/programme complet/i); // lisbonne = city_plus
  // Nombre de tabs < 14+1 (pas assez de contenu)
  const tabs = page.locator(".itin-day-nav [role=tab]");
  const count = await tabs.count();
  expect(count).toBeLessThan(15);
});

test("sans durationExact (passer) — fallback sur duration bracket", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "short" }); // no exactDays → 3 days
  await goToItinerary(page, "lisbonne", sid);

  const tabs = page.locator(".itin-day-nav [role=tab]");
  // "short" → durationDays=3, Lisbonne template=5 → compressed_best_of → 3 tabs + overview = 4
  await expect(tabs).toHaveCount(4);
});

// ─── Tests — navigation et warning ───────────────────────────────

test("navigation jour par jour toujours fonctionnelle après compression", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "short", exactDays: 2 });
  await goToItinerary(page, "lisbonne", sid);

  await page.locator(".itin-day-btn", { hasText: "J1" }).click();
  await expect(page.locator(".day-view")).toBeVisible({ timeout: 3_000 });
});

test("ligne adaptation absente pour exact_template", async ({ page }) => {
  await page.goto("/itinerary/lisbonne");
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });
  await expect(page.locator(".itin-adaptation")).toHaveCount(0);
});

// ─── Tests — adaptation rythme / groupe ──────────────────────────

test("pace=relax — .itin-pace-profile visible avec label 'relax'", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "short", exactDays: 3, pace: "relax" });
  await goToItinerary(page, "lisbonne", sid);

  const profile = page.locator(".itin-pace-profile");
  await expect(profile).toBeVisible();
  await expect(profile).toContainText(/relax/i);
});

test("pace=balanced — aucun .itin-pace-profile affiché", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "short", exactDays: 3, pace: "balanced" });
  await goToItinerary(page, "lisbonne", sid);

  await expect(page.locator(".itin-pace-profile")).toHaveCount(0);
});

test("group=family — .itin-pace-profile visible avec label 'famille'", async ({ page }) => {
  const sid = await fillQuizAndGetSid(page, { duration: "short", exactDays: 3, group: "family" });
  await goToItinerary(page, "lisbonne", sid);

  const profile = page.locator(".itin-pace-profile");
  await expect(profile).toBeVisible();
  await expect(profile).toContainText(/famille/i);
});

test("accès direct sans session — aucun .itin-pace-profile", async ({ page }) => {
  await page.goto("/itinerary/lisbonne");
  await page.locator(".itin-day-nav").waitFor({ timeout: 5_000 });
  await expect(page.locator(".itin-pace-profile")).toHaveCount(0);
});
