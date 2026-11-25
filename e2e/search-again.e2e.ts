import { expect, test, type Page } from "@playwright/test";

/* A second search after a report: the first runs from a preset (cached, no live call). Every other request is answered
   here, so nothing reaches a live source whatever mode the server is in. */
async function stubLiveCalls(page: Page) {
  await page.route("**/api/preload", (r) => r.fulfill({ status: 204 }));
  await page.route("**/api/flags", (r) => r.fulfill({ json: { flags: [] } }));
  await page.route("**/api/reason", (r) => r.fulfill({ json: { markdown: "", patterns: [] } }));
  await page.route("**/api/suggest", (r) => r.fulfill({ json: { groups: [], extras: {} } }));
}

const scanBody = (req: { url(): string; method(): string; postData(): string | null }) =>
  req.url().endsWith("/api/scan") && req.method() === "POST" ? req.postData() ?? "" : null;

test("adding a chip after a report searches again with every chip", async ({ page }) => {
  await stubLiveCalls(page);
  const bodies: string[] = [];
  page.on("request", (req) => { const b = scanBody(req); if (b !== null) bodies.push(b); });

  await page.goto("/");
  await page.getByRole("button", { name: "Jensen Huang" }).click();
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
  expect(bodies).toHaveLength(1);

  /* The second search is mocked to fail fast: what matters is that it starts, with both chips. */
  await page.route("**/api/scan", (r) => r.abort());

  const entry = page.getByLabel("Name, email or link");
  await entry.fill("kai@example.com");
  await entry.press("Enter");
  await expect(page.locator(".chip")).toHaveCount(2);

  const check = page.getByRole("button", { name: "Check" });
  await expect(check).toBeEnabled();
  const second = page.waitForRequest((req) => scanBody(req) !== null);
  await check.click();
  const body = await second.then((req) => req.postData() ?? "");
  expect(body).toContain("Jensen Huang");
  expect(body).toContain("kai@example.com");

  /* The address holds both chips, as a shared link would. */
  await expect.poll(() => decodeURIComponent(new URL(page.url()).search)).toContain("kai@example.com");
  await expect.poll(() => decodeURIComponent(new URL(page.url()).search)).toContain("Jensen Huang");
  await expect(page.locator(".chip")).toHaveCount(2);
});

test("pressing Enter in the box searches again after a report", async ({ page }) => {
  await stubLiveCalls(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Jensen Huang" }).click();
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });

  await page.route("**/api/scan", (r) => r.abort());
  const entry = page.getByLabel("Name, email or link");
  await entry.fill("kai@example.com");
  await entry.press("Enter");
  await expect(page.locator(".chip")).toHaveCount(2);

  const second = page.waitForRequest((req) => scanBody(req) !== null);
  await entry.press("Enter");
  expect(await second.then((req) => req.postData() ?? "")).toContain("kai@example.com");
});

test("the report keeps showing the person who was searched while chips change", async ({ page }) => {
  await stubLiveCalls(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Jensen Huang" }).click();
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
  const before = await page.locator("#report").innerText();

  const entry = page.getByLabel("Name, email or link");
  await entry.fill("kai@example.com");
  await entry.press("Enter");
  await expect(page.locator(".chip")).toHaveCount(2);
  expect(await page.locator("#report").innerText()).toBe(before);
});
