# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sweep.e2e.ts >> every visible control and link completes without browser errors
- Location: e2e/sweep.e2e.ts:26:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Tim Cook', exact: true })

```

# Page snapshot

```yaml
- generic [ref=f20e1]:
  - generic [ref=f20e2]:
    - link "Mangle Kuo, open Hackable" [ref=f20e3] [cursor=pointer]:
      - /url: https://mangle-hackable.vercel.app
      - generic [ref=f20e4]: Mangle Kuo
    - navigation [ref=f20e8]:
      - link "Hackable" [ref=f20e9] [cursor=pointer]:
        - /url: /
      - generic [ref=f20e13]:
        - link "Home" [ref=f20e14] [cursor=pointer]:
          - /url: /
        - link "How it works" [ref=f20e15] [cursor=pointer]:
          - /url: /how-it-works
        - link "Privacy" [ref=f20e16] [cursor=pointer]:
          - /url: /privacy
        - link "Patterns" [ref=f20e17] [cursor=pointer]:
          - /url: /patterns
      - link "Subscribe" [ref=f20e18] [cursor=pointer]:
        - /url: "#"
    - generic [ref=f20e20]:
      - heading "See what’s public about you" [level=1] [ref=f20e21]
      - paragraph [ref=f20e22]: Search your online presence to see which attack patterns could target you.
      - group "Who to check" [ref=f20e24]:
        - combobox "Name, email or link" [active] [ref=f20e25]
        - button "Check" [disabled] [ref=f20e26]
      - generic [ref=f20e32]:
        - generic [ref=f20e33]:
          - button "JD Jane Doe Smith" [ref=f20e34] [cursor=pointer]:
            - generic [ref=f20e35]: JD
            - generic [ref=f20e47]: Jane Doe Smith
          - button "TC Tim Cook" [ref=f20e48] [cursor=pointer]:
            - generic [ref=f20e49]: TC
            - generic [ref=f20e51]: Tim Cook
          - button "AC Alex Chen" [ref=f20e52] [cursor=pointer]:
            - generic [ref=f20e53]: AC
            - generic [ref=f20e65]: Alex Chen
          - button "JH Jensen Huang" [ref=f20e66] [cursor=pointer]:
            - generic [ref=f20e67]: JH
            - generic [ref=f20e69]: Jensen Huang
          - button "PK Priya Kapoor" [ref=f20e70] [cursor=pointer]:
            - generic [ref=f20e71]: PK
            - generic [ref=f20e85]: Priya Kapoor
          - button "MK Mangle Kuo" [ref=f20e86] [cursor=pointer]:
            - generic [ref=f20e87]: MK
            - generic [ref=f20e89]: Mangle Kuo
          - button "MR Mark Reynolds" [ref=f20e90] [cursor=pointer]:
            - generic [ref=f20e91]: MR
            - generic [ref=f20e101]: Mark Reynolds
          - button "KM Kai Mercer" [ref=f20e102] [cursor=pointer]:
            - generic [ref=f20e103]: KM
            - generic [ref=f20e105]: Kai Mercer
          - button "EG Ellis Grey" [ref=f20e106] [cursor=pointer]:
            - generic [ref=f20e107]: EG
            - generic [ref=f20e109]: Ellis Grey
          - button "RH Rose Hart" [ref=f20e110] [cursor=pointer]:
            - generic [ref=f20e111]: RH
            - generic [ref=f20e113]: Rose Hart
        - generic [ref=f20e114]:
          - generic [ref=f20e115]:
            - generic [ref=f20e116]: Sources we check
            - generic [ref=f20e117]: Web
            - button "LinkedIn" [ref=f20e122] [cursor=pointer]
            - button "GitHub" [ref=f20e126] [cursor=pointer]
            - generic [ref=f20e130]: LeakCheck
          - generic [ref=f20e135]:
            - generic [ref=f20e136]: Have I Been Pwned
            - generic [ref=f20e140]: Public records
            - generic [ref=f20e144]: Forums
    - generic:
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic:
              - generic: AB
              - generic: Acme Bank Security
            - generic: Your account is locked
            - text: Confirm your details within 24 hours or…
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic: LinkedIn
            - generic:
              - generic: JD
              - generic:
                - generic: Jane Doe Smith
                - text: Product · London
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic: Data breach
            - generic: Found in 3 breaches
            - generic:
              - generic: Email
              - generic: Username
      - generic:
        - generic [aria-hidden]:
          - generic: acrne-bank-login.com
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic: GitHub
            - generic: janedoe
            - text: 41 repos · email in commits
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic:
              - generic: RH
              - generic: Rachel Hart
            - text: Loved your GitHub. Quick paid coding test? Remote, £140k.
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic: People search
            - generic: Jane D. Smith
            - text: Age 32 · Manchester
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic: PARCEL
            - text: "Your parcel is held. Pay £1.99 to release it: parcel-redeliver.co"
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic: Social
            - generic: "@janedoesmith"
            - text: 1.2k followers
      - generic:
        - generic [aria-hidden]:
          - generic:
            - generic: Forum
            - generic: janedoe88
            - text: Member since 2019
      - generic:
        - generic [aria-hidden]:
          - generic: Help Desk IT is calling
  - contentinfo [ref=f20e149]:
    - paragraph [ref=f20e150]: Built at Innovators Guild Retail AI
    - paragraph [ref=f20e151]: Nebius Token Factory and Tavily
    - paragraph [ref=f20e152]: We only look at public data, and we keep nothing after your report.
  - alert [ref=f20e153]
```

# Test source

```ts
  1  | import { appendFile, writeFile } from "node:fs/promises";
  2  | import { resolve } from "node:path";
  3  | import { expect, test, type Page, type TestInfo } from "@playwright/test";
  4  | 
  5  | const paths = ["/", "/patterns", "/how-it-works", "/privacy", "/compare"];
  6  | const reportPages = ["Tim Cook", "Jane Doe Smith"];
  7  | const timeoutMs = 7_000;
  8  | 
  9  | type Result = { subject: string; result: string };
  10 | 
  11 | function internal(href: string, baseURL: string) {
  12 |   const target = new URL(href, baseURL);
  13 |   return target.origin === new URL(baseURL).origin;
  14 | }
  15 | 
  16 | async function visitReport(page: Page, name: string) {
  17 |   await page.goto("/");
> 18 |   await page.getByRole("button", { name, exact: true }).click();
     |                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  19 |   await expect(page.locator("#report")).toBeVisible({ timeout: 10_000 });
  20 | }
  21 | 
  22 | async function visibleButtons(page: Page) {
  23 |   return page.locator('button:visible, [role="button"]:visible');
  24 | }
  25 | 
  26 | test("every visible control and link completes without browser errors", async ({ page, request, baseURL }, testInfo) => {
  27 |   const origin = baseURL ?? "http://127.0.0.1:3092";
  28 |   const results: Result[] = [];
  29 |   const browserErrors: string[] = [];
  30 |   page.on("pageerror", (error) => browserErrors.push(`page error: ${error.message}`));
  31 |   page.on("console", (message) => {
  32 |     if (message.type() === "error") browserErrors.push(`console error: ${message.text()}`);
  33 |   });
  34 | 
  35 |   const pages: { label: string; open: () => Promise<void> }[] = paths.map((path) => ({
  36 |     label: path,
  37 |     open: () => page.goto(path).then(() => undefined),
  38 |   }));
  39 |   pages.push(...reportPages.map((name) => ({ label: `${name} report`, open: () => visitReport(page, name) })));
  40 | 
  41 |   for (const current of pages) {
  42 |     await current.open();
  43 |     const count = await (await visibleButtons(page)).count();
  44 |     for (let index = 0; index < count; index += 1) {
  45 |       await current.open();
  46 |       const buttons = await visibleButtons(page);
  47 |       const button = buttons.nth(index);
  48 |       const label = (await button.innerText()).trim() || (await button.getAttribute("aria-label")) || `button ${index + 1}`;
  49 |       const disabled = await button.isDisabled().catch(() => false);
  50 |       const sendsData = current.label === "/compare" || await button.evaluate((element) => Boolean(element.closest("form")));
  51 |       if (disabled || sendsData || (current.label === "/" && label === "Check")) {
  52 |         results.push({ subject: `${current.label}: ${label}`, result: "skipped" });
  53 |         continue;
  54 |       }
  55 |       await button.click({ timeout: timeoutMs });
  56 |       results.push({ subject: `${current.label}: ${label}`, result: "clicked" });
  57 |     }
  58 |   }
  59 | 
  60 |   const hrefs = new Set<string>();
  61 |   for (const current of pages) {
  62 |     await current.open();
  63 |     for (const href of await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")).filter((href): href is string => Boolean(href)))) hrefs.add(href);
  64 |   }
  65 | 
  66 |   for (const href of [...hrefs].sort()) {
  67 |     if (href.startsWith("#")) {
  68 |       results.push({ subject: href, result: "fragment" });
  69 |       continue;
  70 |     }
  71 |     const url = new URL(href, origin).toString();
  72 |     const response = await request.get(url, { timeout: timeoutMs, failOnStatusCode: false, maxRedirects: 5 });
  73 |     const status = response.status();
  74 |     if (internal(href, origin)) {
  75 |       expect(status, `${href} returned ${status}`).toBeLessThan(400);
  76 |       results.push({ subject: href, result: `${status}` });
  77 |     } else if ([404, 410].includes(status) || status >= 500) {
  78 |       expect(status, `${href} returned ${status}`).not.toBe(status);
  79 |     } else {
  80 |       results.push({ subject: href, result: [403, 429].includes(status) ? `${status}, blocked: check by hand` : `${status}` });
  81 |     }
  82 |   }
  83 | 
  84 |   await writeSweepReport(testInfo, results, browserErrors);
  85 |   expect(browserErrors, browserErrors.join("\n")).toEqual([]);
  86 | });
  87 | 
  88 | async function writeSweepReport(testInfo: TestInfo, results: Result[], browserErrors: string[]) {
  89 |   const lines = ["# E2E sweep report", "", `Project: ${testInfo.project.name}`, "", "## Controls and links", ""];
  90 |   for (const entry of results) lines.push(`- ${entry.subject}: ${entry.result}`);
  91 |   lines.push("", "## Browser errors", "", ...(browserErrors.length ? browserErrors.map((error) => `- ${error}`) : ["- None"]), "");
  92 |   const report = resolve(testInfo.config.rootDir, "_agent/overnight/sweep-report.md");
  93 |   const text = lines.join("\n");
  94 |   if (testInfo.project.name === "mobile") await writeFile(report, text);
  95 |   else await appendFile(report, "\n" + text);
  96 | }
  97 | 
```