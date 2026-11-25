import { expect, test, type Page } from "@playwright/test";

async function expectCleanLanding(page: Page) {
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel("Name, email or link")).toHaveValue("");
  await expect(page.locator(".chip")).toHaveCount(0);
  await expect(page.locator("#report")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
}

test("Back returns from a Jensen Huang report to a clean landing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Jensen Huang" }).click();
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });

  await page.goBack();
  await expectCleanLanding(page);
});

for (const linkName of ["Hackable", "Home"]) {
  test(`${linkName} returns a report to a clean landing`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Jensen Huang" }).click();
    await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("link", { name: linkName, exact: true }).click();
    await expectCleanLanding(page);
  });
}
