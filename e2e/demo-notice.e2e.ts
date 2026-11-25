import { expect, test } from "@playwright/test";
import { checkLinks, closeBy, dialog, inputsOnPage, openFromCard, openFromNav, openReport, settled, type CloseWay } from "./demo-notice-helpers";

/* Runs at 390 (a bottom sheet) and 1440 (a centred modal) through the two Playwright projects. */

test.describe("demo notice", () => {
  test("opens from the nav, shows the links and returns focus on every way of closing", async ({ page }, info) => {
    await page.goto("/");
    const phone = info.project.name === "mobile";
    for (const way of ["Escape", "backdrop", "close button"] as CloseWay[]) {
      const opener = await openFromNav(page);
      await settled(page);
      const box = (await dialog(page).locator(".demo-notice-panel").boundingBox())!;
      const viewport = page.viewportSize()!;
      if (phone) {
        /* A sheet: full width, resting on the bottom edge. */
        expect(Math.round(box.x)).toBe(0);
        expect(Math.round(box.width)).toBe(viewport.width);
        expect(Math.round(box.y + box.height)).toBe(viewport.height);
      } else {
        /* A modal: centred, narrower than the page. */
        expect(box.width).toBeLessThan(viewport.width / 2);
        expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(2);
        expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThan(2);
      }
      const close = await dialog(page).getByRole("button", { name: "Close" }).boundingBox();
      expect(close!.width).toBeGreaterThanOrEqual(44);
      expect(close!.height).toBeGreaterThanOrEqual(44);
      await checkLinks(page);
      await closeBy(page, way);
      await expect(opener).toBeFocused();
    }
  });

  test("focus moves into the dialog and stays inside while it is open", async ({ page }) => {
    await page.goto("/");
    await openFromNav(page);
    const inside = () => page.evaluate(() => Boolean(document.activeElement?.closest("dialog")));
    expect(await inside()).toBe(true);
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
      expect(await inside()).toBe(true);
    }
    await page.keyboard.press("Shift+Tab");
    expect(await inside()).toBe(true);
  });

  test("the report card opens the same dialog", async ({ page }) => {
    await openReport(page);
    await openFromCard(page);
    await checkLinks(page);
    await expect(page.locator("dialog[open]")).toHaveCount(1);
    await closeBy(page, "Escape");
  });

  test("no email is collected anywhere", async ({ page }) => {
    const sent: string[] = [];
    page.on("request", (req) => { if (req.method() !== "GET" && /subscribe|email/i.test(req.url() + (req.postData() ?? ""))) sent.push(req.url()); });
    await openReport(page);
    await openFromCard(page);
    await closeBy(page, "close button");
    expect(sent).toEqual([]);
    expect(await page.locator('input[type="email"]').count()).toBe(0);
    const inputs = await inputsOnPage(page);
    expect(inputs.every((i) => i.type !== "email")).toBe(true);
    expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(0);
  });
});
