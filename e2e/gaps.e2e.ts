import { expect, test, type Page } from "@playwright/test";

/* One vertical rhythm in every report: the gap between each pair of neighbouring cards and blocks is the same.
   Cached presets and the demo person only, so nothing reaches a live source. */
const REPORT_GAP = 22;
const TOLERANCE = 1;

const PEOPLE: { name: string; chips: string[] }[] = [
  { name: "Tim Cook", chips: ["Tim Cook"] },
  { name: "Jensen Huang", chips: ["Jensen Huang"] },
  { name: "Mangle Kuo", chips: ["Mangle Kuo"] },
  { name: "Jane Doe Smith", chips: ["Jane Doe Smith", "jane@hibp-integration-tests.com", "linkedin.com/in/janedoe-demo"] },
  { name: "Kai Mercer", chips: ["Kai Mercer"] },
  { name: "Rose Hart", chips: ["Rose Hart"] },
  { name: "Ellis Grey", chips: ["Ellis Grey"] },
];

async function stubLiveCalls(page: Page) {
  await page.route("**/api/preload", (r) => r.fulfill({ status: 204 }));
  await page.route("**/api/flags", (r) => r.fulfill({ json: { flags: [] } }));
  await page.route("**/api/reason", (r) => r.fulfill({ json: { markdown: "", patterns: [] } }));
  await page.route("**/api/suggest", (r) => r.fulfill({ json: { groups: [], extras: {} } }));
}

/* The blocks of the report in reading order. Wrappers that only group blocks (.rm and .er) are opened up, because the
   blocks inside them are what a reader sees as separate cards. */
async function blockGaps(page: Page) {
  return page.evaluate(() => {
    const report = document.querySelector("#report");
    if (!report) return null;
    const blocks: { label: string; top: number; bottom: number }[] = [];
    const take = (el: Element) => {
      const box = el.getBoundingClientRect();
      if (box.height === 0 || getComputedStyle(el).display === "none") return;
      blocks.push({ label: `${el.tagName.toLowerCase()}.${String(el.className).trim().replace(/\s+/g, ".")}`, top: box.top, bottom: box.bottom });
    };
    for (const wrap of Array.from(report.children)) {
      for (const el of Array.from(wrap.children)) {
        if (el.matches(".rm, .er")) Array.from(el.children).forEach(take);
        else take(el);
      }
    }
    blocks.sort((a, b) => a.top - b.top);
    return blocks.slice(1).map((b, i) => ({ between: `${blocks[i].label} and ${b.label}`, gap: b.top - blocks[i].bottom }));
  });
}

for (const person of PEOPLE) {
  test(`the ${person.name} report has the same gap between every card and block`, async ({ page }) => {
    await stubLiveCalls(page);
    await page.goto(`/?q=${encodeURIComponent(JSON.stringify({ chips: person.chips }))}`);
    await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
    /* The blocks rise in one after another; measure once every finite animation has ended. */
    await page.waitForFunction(() => document.getAnimations().every((a) => a.effect?.getComputedTiming().iterations === Infinity || a.playState === "finished"), undefined, { timeout: 10_000 });

    const gaps = await blockGaps(page);
    expect(gaps, "the report rendered").not.toBeNull();
    expect(gaps!.length, "the report has more than one block").toBeGreaterThan(1);
    for (const g of gaps!) expect(Math.abs(g.gap - REPORT_GAP), `${g.between}: ${g.gap}px`).toBeLessThanOrEqual(TOLERANCE);
  });
}
