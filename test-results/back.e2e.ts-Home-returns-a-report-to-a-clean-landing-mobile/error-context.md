# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: back.e2e.ts >> Home returns a report to a clean landing
- Location: e2e/back.e2e.ts:21:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Home', exact: true })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - link "Hackable" [ref=e4] [cursor=pointer]:
        - /url: /
      - link "Subscribe" [ref=e8] [cursor=pointer]:
        - /url: "#"
    - generic [ref=e10]:
      - heading "See what’s public about you" [level=1]
      - paragraph: Search your online presence to see which attack patterns could target you.
      - group "Who to check" [ref=e12]:
        - button "Jensen Huang Remove" [ref=e13]:
          - generic [ref=e14]: Jensen Huang
          - button "Remove" [ref=e20] [cursor=pointer]
        - combobox "Name, email or link" [ref=e23]
        - button "Check" [disabled] [ref=e24]
    - generic:
      - generic:
        - generic:
          - generic:
            - generic: LinkedIn
            - generic: "Watch for: fake recruiters"
      - generic:
        - generic:
          - generic:
            - generic: Web
            - generic: "Found: public role at Nvidia"
    - generic [ref=e32]:
      - generic [ref=e34]:
        - heading "Jensen, 4 of 8 checks found something." [level=2] [ref=e35]
        - list [ref=e36]:
          - listitem [ref=e37]:
            - generic [ref=e41]: fake recruiters
          - listitem [ref=e42]:
            - generic [ref=e47]: public role at Nvidia
          - listitem [ref=e48]:
            - generic [ref=e52]: impersonation
          - listitem [ref=e53]:
            - generic [ref=e57]: state hackers
      - generic [ref=e59]:
        - paragraph [ref=e61]:
          - strong [ref=e62]: "You are The Headline: this week, almost every story about AI has your name in it."
        - generic [ref=e63]:
          - paragraph [ref=e64]: NVIDIA reinstated you as chief executive on 23 November 2026, and you are due before three House committees on 1 December.
          - generic [ref=e65]:
            - link "nvidianews.nvidia.com" [ref=e67] [cursor=pointer]:
              - /url: https://nvidianews.nvidia.com/news/nvidia-board-reinstates-jensen-huang-as-president-ceo-and-board-director
            - generic [ref=e68]:
              - text: ·
              - link "CNBC on the House hearings" [ref=e69] [cursor=pointer]:
                - /url: https://www.cnbc.com/2026/11/24/jensen-huang-nvidia-congress-gtc.html
        - generic [ref=e70]:
          - complementary [ref=e71]:
            - paragraph [ref=e75]:
              - strong [ref=e76]: Big news is the best bait, and phishing dressed up as a news story feeds on weeks like this.
              - text: State groups also send tailored phishing. Your work address is easy to guess too, because NVIDIA uses first initial plus surname.
          - generic [ref=e77]:
            - link "Tailored phishing from state groups" [ref=e79] [cursor=pointer]:
              - /url: /patterns#state-spearphishing
            - generic [ref=e80]:
              - text: ·
              - link "NVIDIA email format" [ref=e81] [cursor=pointer]:
                - /url: https://www.clay.com/dossier/nvidia-email-format
        - paragraph [ref=e83]:
          - strong [ref=e84]: Any urgent message about the hearings could be a lure.
        - generic [ref=e85]:
          - complementary [ref=e86]:
            - paragraph [ref=e90]:
              - strong [ref=e91]: Treat any urgent message about the hearings as fake until you check it another way.
              - text: Don't click the link or reply. Contact the sender through a number or address you already trust.
          - link "Phishing that uses a news story" [ref=e94] [cursor=pointer]:
            - /url: /patterns#news-hook-phishing
        - paragraph [ref=e96]:
          - generic [ref=e97]: "#HighValueIndividual"
          - generic [ref=e98]: "#TargetOfSpies"
          - generic [ref=e99]: "#TheHeadline"
      - list [ref=e101]:
        - listitem [ref=e102]:
          - link [ref=e103] [cursor=pointer]:
            - /url: /patterns#state-spearphishing
            - heading "Tailored phishing from state groups" [level=3] [ref=e104]
            - paragraph [ref=e105]: A carefully researched message that feels like it came from a colleague.
        - listitem [ref=e106]:
          - link [ref=e107] [cursor=pointer]:
            - /url: /patterns#news-hook-phishing
            - heading "Phishing that uses a news story" [level=3] [ref=e108]
            - paragraph [ref=e109]: A message about something you were just in the news for.
      - generic [ref=e111]:
        - generic [ref=e112]:
          - heading "Get an updated report when something new turns up" [level=2] [ref=e113]
          - generic [ref=e114]: Email address
          - generic [ref=e115]:
            - textbox "Email address" [ref=e116]
            - button "Keep me posted" [ref=e117] [cursor=pointer]
        - generic:
          - status
  - contentinfo [ref=e118]:
    - paragraph [ref=e119]: Built at Innovators Guild Retail AI
    - paragraph [ref=e120]: Nebius Token Factory and Tavily
    - paragraph [ref=e121]: We only look at public data, and we keep nothing after your report.
  - alert [ref=e122]
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | async function expectCleanLanding(page: Page) {
  4  |   await expect(page).toHaveURL(/\/$/);
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
> 26 |     await page.getByRole("link", { name: linkName, exact: true }).click();
     |                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  27 |     await expectCleanLanding(page);
  28 |   });
  29 | }
  30 | 
```