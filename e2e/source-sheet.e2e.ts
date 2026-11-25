import { expect, test } from "@playwright/test";

test("a grouped web source opens every result and closes in each supported way", async ({ page }) => {
  await page.goto("/test/source-sheet");
  const opener = page.getByRole("button", { name: "Web: 2 results" });
  const dialog = page.getByRole("dialog", { name: "Web: 2 results" });

  for (const close of ["Escape", "backdrop", "button"] as const) {
    await opener.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link")).toHaveCount(3);
    await expect(dialog.getByRole("heading", { name: "Confirmed matches" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Possible matches" })).toBeVisible();
    if (close === "Escape") await page.keyboard.press("Escape");
    else if (close === "button") await dialog.getByRole("button", { name: "Close" }).click();
    else await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  }
});
