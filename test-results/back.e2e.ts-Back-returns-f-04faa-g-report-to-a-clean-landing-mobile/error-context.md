# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: back.e2e.ts >> Back returns from a Jensen Huang report to a clean landing
- Location: e2e/back.e2e.ts:11:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/$/
Received string:  "about:blank"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html>…</html>
       - unexpected value "about:blank"

```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | async function expectCleanLanding(page: Page) {
> 4  |   await expect(page).toHaveURL(/\/$/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  5  |   await expect(page.getByLabel("Name, email or link")).toHaveValue("");
  6  |   await expect(page.locator(".chip")).toHaveCount(0);
  7  |   await expect(page.locator("#report")).toHaveCount(0);
  8  |   await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  9  | }
  10 | 
  11 | test("Back returns from a Jensen Huang report to a clean landing", async ({ page }) => {
  12 |   await page.goto("/");
  13 |   await page.getByRole("button", { name: "Jensen Huang" }).click();
  14 |   await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
  15 | 
  16 |   await page.goBack();
  17 |   await expectCleanLanding(page);
  18 | });
  19 | 
  20 | for (const linkName of ["Hackable", "Home"]) {
  21 |   test(`${linkName} returns a report to a clean landing`, async ({ page }) => {
  22 |     await page.goto("/");
  23 |     await page.getByRole("button", { name: "Jensen Huang" }).click();
  24 |     await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
  25 | 
  26 |     await page.getByRole("link", { name: linkName, exact: true }).click();
  27 |     await expectCleanLanding(page);
  28 |   });
  29 | }
  30 | 
```