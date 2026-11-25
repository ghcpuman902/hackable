import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const paths = ["/", "/patterns", "/how-it-works", "/privacy", "/compare"];
const reportPages = ["Tim Cook", "Jane Doe Smith"];
const timeoutMs = 2_500;

type Result = { subject: string; result: string };

function internal(href: string, baseURL: string) {
  const target = new URL(href, baseURL);
  return target.origin === new URL(baseURL).origin;
}

async function visitReport(page: Page, name: string) {
  const state = encodeURIComponent(JSON.stringify({ chips: [name] }));
  await page.goto(`/?q=${state}`);
  await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
}

async function visibleButtons(page: Page) {
  return page.locator('button:visible, [role="button"]:visible');
}

test("every visible control and link completes without browser errors", async ({ page, request, baseURL }, testInfo) => {
  test.setTimeout(90_000);
  const origin = baseURL ?? "http://127.0.0.1:3092";
  const results: Result[] = [];
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(`page error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console error: ${message.text()}`);
  });

  const pages: { label: string; open: () => Promise<void> }[] = paths.map((path) => ({
    label: path,
    open: () => page.goto(path).then(() => undefined),
  }));
  pages.push(...reportPages.map((name) => ({ label: `${name} report`, open: () => visitReport(page, name) })));

  for (const current of pages) {
    await current.open();
    const count = await (await visibleButtons(page)).count();
    for (let index = 0; index < count; index += 1) {
      await current.open();
      const buttons = await visibleButtons(page);
      const button = buttons.nth(index);
      const label = (await button.innerText()).trim() || (await button.getAttribute("aria-label")) || `button ${index + 1}`;
      const disabled = await button.isDisabled().catch(() => false);
      const sendsData = current.label === "/compare" || await button.evaluate((element) => Boolean(element.closest("form")));
      if (disabled || sendsData || (current.label === "/" && label === "Check")) {
        results.push({ subject: `${current.label}: ${label}`, result: "skipped" });
        continue;
      }
      await button.click({ timeout: timeoutMs });
      results.push({ subject: `${current.label}: ${label}`, result: "clicked" });
    }
  }

  const hrefs = new Set<string>();
  for (const current of pages) {
    await current.open();
    for (const href of await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")).filter((href): href is string => Boolean(href)))) hrefs.add(href);
  }

  for (const href of [...hrefs].sort()) {
    if (href.startsWith("#")) {
      results.push({ subject: href, result: "fragment" });
      continue;
    }
    const url = new URL(href, origin).toString();
    const protocol = new URL(url).protocol;
    if (protocol !== "http:" && protocol !== "https:") {
      results.push({ subject: href, result: "not an HTTP link" });
      continue;
    }
    let response;
    try {
      response = await request.get(url, { timeout: timeoutMs, failOnStatusCode: false, maxRedirects: 5 });
    } catch (error) {
      results.push({ subject: href, result: `unavailable: ${error instanceof Error ? error.message : String(error)}` });
      continue;
    }
    const status = response.status();
    if (internal(href, origin)) {
      expect(status, `${href} returned ${status}`).toBeLessThan(400);
      results.push({ subject: href, result: `${status}` });
    } else if ([404, 410].includes(status) || status >= 500) {
      expect(status, `${href} returned ${status}`).not.toBe(status);
    } else {
      results.push({ subject: href, result: [403, 429].includes(status) ? `${status}, blocked: check by hand` : `${status}` });
    }
  }

  await writeSweepReport(testInfo, results, browserErrors);
  expect(browserErrors, browserErrors.join("\n")).toEqual([]);
});

async function writeSweepReport(testInfo: TestInfo, results: Result[], browserErrors: string[]) {
  const lines = ["# E2E sweep report", "", `Project: ${testInfo.project.name}`, "", "## Controls and links", ""];
  for (const entry of results) lines.push(`- ${entry.subject}: ${entry.result}`);
  lines.push("", "## Browser errors", "", ...(browserErrors.length ? browserErrors.map((error) => `- ${error}`) : ["- None"]), "");
  const report = resolve(process.cwd(), "_agent/overnight/sweep-report.md");
  const text = lines.join("\n");
  await mkdir(dirname(report), { recursive: true });
  if (testInfo.project.name === "mobile") await writeFile(report, text);
  else await appendFile(report, "\n" + text);
}
