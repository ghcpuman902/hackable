import { expect, type Page } from "@playwright/test";

/* Shared by the demo notice spec and the click-everything sweep. */

export async function openReport(page: Page, name = "Tim Cook") {
  await page.route("**/api/preload", (r) => r.fulfill({ status: 204 }));
  await page.goto(`/?q=${encodeURIComponent(JSON.stringify({ chips: [name] }))}`);
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
}

/* Wait until every finite animation (the slide in) has ended, so positions can be measured. */
export async function settled(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.effect?.getComputedTiming().iterations === Infinity || a.playState === "finished"), undefined, { timeout: 5_000 });
}

export const dialog = (page: Page) => page.getByRole("dialog", { name: "Hackable is a hackathon demo" });

export async function openFromNav(page: Page) {
  const opener = page.locator("nav.nav").getByRole("button", { name: "Subscribe" });
  await opener.click();
  await expect(dialog(page)).toBeVisible();
  return opener;
}

export async function openFromCard(page: Page) {
  const opener = page.locator("#report").getByRole("button", { name: "Subscribe" });
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await expect(dialog(page)).toBeVisible();
  return opener;
}

/* The projects link is always there; the LinkedIn link only while LINKEDIN_POST_URL is set. */
export async function checkLinks(page: Page) {
  const projects = dialog(page).getByRole("link", { name: "More of my projects" });
  await expect(projects).toHaveAttribute("href", "https://manglekuo.com");
  await expect(projects).toHaveAttribute("target", "_blank");
  await expect(projects).toHaveAttribute("rel", /noopener/);
  await expect(projects).toHaveAttribute("rel", /noreferrer/);
  const linkedin = dialog(page).getByRole("link", { name: "Read the LinkedIn post" });
  const count = await linkedin.count();
  if (count > 0) {
    await expect(linkedin).toHaveAttribute("target", "_blank");
    await expect(linkedin).toHaveAttribute("rel", /noopener/);
  }
  return { linkedinShown: count > 0 };
}

export type CloseWay = "Escape" | "backdrop" | "close button";

export async function closeBy(page: Page, way: CloseWay) {
  if (way === "Escape") await page.keyboard.press("Escape");
  else if (way === "close button") await dialog(page).getByRole("button", { name: "Close" }).click();
  else {
    /* Tap well away from the panel: the top left corner is always backdrop, on the modal and on the sheet. */
    await page.mouse.click(4, 4);
  }
  await expect(dialog(page)).toBeHidden();
}

/* The inputs on the page: the search box is the only one, and none of them takes an email address. */
export async function inputsOnPage(page: Page) {
  return page.locator("input").evaluateAll((els) => els.map((el) => ({ type: (el as HTMLInputElement).type, name: el.getAttribute("aria-label") ?? el.id })));
}
