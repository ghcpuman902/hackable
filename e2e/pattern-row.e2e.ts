import { expect, test, type Page } from "@playwright/test";

/* The matched patterns under a report: one sideways row of scene cards, each linking to its pattern.
   Cached presets and the demo person only, so nothing reaches a live source. */
const PEOPLE: { name: string; chips: string[] }[] = [
  { name: "Tim Cook", chips: ["Tim Cook"] },
  { name: "Jensen Huang", chips: ["Jensen Huang"] },
  { name: "Mangle Kuo", chips: ["Mangle Kuo"] },
  { name: "Jane Doe Smith", chips: ["Jane Doe Smith", "jane@hibp-integration-tests.com", "linkedin.com/in/janedoe-demo"] },
];

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

async function stubLiveCalls(page: Page) {
  await page.route("**/api/preload", (r) => r.fulfill({ status: 204 }));
  await page.route("**/api/flags", (r) => r.fulfill({ json: { flags: [] } }));
  await page.route("**/api/reason", (r) => r.fulfill({ json: { markdown: "", patterns: [] } }));
  await page.route("**/api/suggest", (r) => r.fulfill({ json: { groups: [], extras: {} } }));
}

for (const person of PEOPLE) {
  test(`the ${person.name} report shows its patterns as one sideways row of scene cards`, async ({ page }) => {
    await stubLiveCalls(page);
    await page.goto(`/?q=${encodeURIComponent(JSON.stringify({ chips: person.chips }))}`);
    const row = page.locator("#report .pr");
    await expect(row).toBeVisible({ timeout: 10_000 });

    const cards = row.locator(".pr-card");
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    if (n >= 2) await expect(row.locator(".pr-h")).toHaveText(`You're matched with ${WORDS[n] ?? n} patterns`);
    else await expect(row.locator(".pr-h")).toHaveCount(0);

    for (let i = 0; i < n; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute("href", /^\/patterns#[a-z0-9-]+$/);
      await expect(card.locator('[role="img"]')).toBeVisible();
    }
    const tops = await cards.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size, "the cards sit in one row").toBe(1);

    /* The page itself never scrolls sideways; only the row does. */
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(0);

    /* Tabbing to the last card brings it fully into view inside the row. */
    await cards.first().focus();
    for (let i = 1; i < n; i++) await page.keyboard.press("Tab");
    await expect(cards.nth(n - 1)).toBeFocused();
    await expect.poll(() => cards.nth(n - 1).evaluate((el) => {
      const r = el.getBoundingClientRect(), s = el.closest(".pr-row")!.getBoundingClientRect();
      return `${Math.max(0, Math.round(s.left - r.left))} ${Math.max(0, Math.round(r.right - s.right))}`;
    }), "the last card's overhang on the left and right of the row").toBe("0 0");
  });
}
