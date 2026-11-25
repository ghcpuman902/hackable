import { expect, test, type Page } from "@playwright/test";

async function expectCleanLanding(page: Page) {
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel("Name, email or link")).toHaveValue("");
  await expect(page.locator(".chip")).toHaveCount(0);
  await expect(page.locator("#report")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
}

test("Known issue: Back returns from a Jensen Huang report to a clean landing", async ({ page }) => {
  test.fixme(true, "SearchFlow preset selection does not create the history entry that submit creates.");
  await page.goto("/");
  await page.getByRole("button", { name: "Jensen Huang" }).click();
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });

  await page.goBack();
  await expectCleanLanding(page);
});

test("Hackable returns a report to a clean landing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Jensen Huang" }).click();
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("link", { name: "Hackable", exact: true }).click();
  await expectCleanLanding(page);
});

test("Known issue: Home returns a report to a clean landing on mobile", async ({ page }, testInfo) => {
  test.fixme(testInfo.project.name === "mobile", "The mobile navigation CSS hides the Home control.");
  await page.goto("/");
  await page.getByRole("button", { name: "Jensen Huang" }).click();
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expectCleanLanding(page);
});
