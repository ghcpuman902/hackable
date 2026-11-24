# Build notes for the coding agent (not user-facing)

Mockups for "Mirror" (working name), Innovators Guild Retail AI & Agents Hackathon, 24 Nov 2026.
Build target: one Next.js page based on `05-search-flow.html`. Pages 01–04 are earlier references (chip input, progress feed, full pattern pages, report typography).

## Flow (05)
- Landing: only the chip search box, centred, with the Me / Someone else switch under it.
- Submit (Enter on empty input, or the arrow button): the box moves to the top and results stream below on the same page.
- Results: source pills tick off (spinner → green done / red hit), then report cards appear one by one.
- URL as state: submit pushes `?q=<json {who, consent, chips:[raw...]}>`. Loading that URL restores the chips and reruns. Back returns to the landing state.
- Consent: choosing "Someone else" reveals "They agreed". Submit stays disabled until it is ticked. The space is reserved (visibility), so nothing shifts.
- Patterns: `PATTERNS`, `LEAD_PATTERNS` (Mangle's pick: fake-recruiter, signup-bombing) and `EXTRA_PATTERNS` (session-hijack, behind "One more pattern") in the 05 script. Reorder or drop there. `?all=1` shows every pattern.
- Each pattern card links to its full 03 page.
- In the real app, stream the same steps from the agent route: source status, then report sections. Sources: Hudson Rock Cavalier (no key), LeakCheck public API (no key), HIBP with the test key on `*@hibp-integration-tests.com`, public web search.
- "Email me this report" sends via Resend to the user's own address. In the mockup it only shows a toast.

## Chip input (shared by 01 and 05)
- Gmail To-field rules: comma, semicolon, Enter and Tab commit. A space commits only after an email, link or @handle, so names keep their spaces. A paste splits on commas and newlines.
- Double-click a chip (or Enter/F2 when it has focus) to edit it as text. Escape cancels. One edit can split into several chips.
- Backspace on an empty input selects the last chip, then a second Backspace deletes it. Duplicates shake the existing chip.
- Type detection: email, LinkedIn, GitHub, X, other URL, @handle, phone, name, free text. Each type has a lucide glyph in a solid tile (inlined SVG, stroke 2.5).
- Test hook: `window.__mirror.chips`.

## Style
- Text style: S-quintex/qag/reports/hack-style-brief.md. Inter 600, -0.025em, 22px/1.5 below 640px and 28px/1.45 above. Lead #171717, then grey #737373. Inline icon tiles only where the icon means something (chip types).
- Card token (`--card-bg`, `--card-shadow`, `--card-radius`, class `.mk-card`): light grey fill, white 1px inset highlight from manglekuo `surface-shell-glass` (`inset 0 0 0 1px color-mix(in oklch, white 90%, transparent)`), Tailwind v4 `shadow-sm` outside, 4xl radius (2rem). Values come from Dev's read of packages/ui/src/styles/globals.css plus the token map in /workspace/RESULTS-job2-mgmk.md. Tune them in one place.
- Mangle's UI rules: no hint, instruction or descriptive text. No eyebrows or subtitles. Never repeat a value shown elsewhere. No layout shift. Inputs at least 17px. Targets at least 24px (44px on touch).
- Motion: the mini animations are pure CSS on an 8 s loop and respect prefers-reduced-motion.

## Data
Synthetic only: "Jane Doe", hibp-integration-tests.com, made-up breach and company names. Live demo subjects: Mangle, or an organiser who agrees on the day.

## Screenshot helpers
`05-search-flow.html?demo=1` prefills chips. `?q=...&speed=20` jumps to results. `02-progress.html?speed=50`. `03-*.html?scene=3`.

## Attack patterns: sources and naming (checked 24 Nov 2026)
Cards follow the published names and MITRE ATT&CK technique IDs. IDs appear on hover/focus of each stage pill, not in the body text.
- Contagious Interview (lead 1). Recruiter message T1566.003 → coding-test repo T1204 → npm install T1059.007 → browser logins T1555.003 → wallets and sessions T1539. Malware names BeaverTail (stealer and loader) and InvisibleFerret (Python backdoor); Microsoft also reports OtterCookie and VS Code task abuse.
  - Microsoft Security Blog, "Contagious Interview: Malware delivered through fake developer job interviews", 11 Mar 2026: https://www.microsoft.com/en-us/security/blog/2026/03/11/contagious-interview-malware-delivered-through-fake-developer-job-interviews/
  - Unit 42, "Contagious Interview: DPRK Threat Actors Lure Tech Industry Job Seekers to Install New Variants of BeaverTail and InvisibleFerret Malware" (CL-STA-0240): https://unit42.paloaltonetworks.com/north-korean-threat-actors-lure-tech-job-seekers-as-fake-recruiters/
- Email bomb, then a help-desk call (lead 2; replaces plain sign-up flood). Email Bombing T1667 → Spearphishing Voice T1566.004 (phone or Teams as "Help Desk IT") → Quick Assist / AnyDesk, Remote Access Tools T1219 → credential theft, then Black Basta ransomware T1486.
  - Microsoft Security Blog, "Threat actors misusing Quick Assist in social engineering attacks leading to ransomware" (Storm-1811), 15 May 2024: https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/
  - CISA, "#StopRansomware: Black Basta" AA24-131A (Nov 2024 update on spam then fake tech-support calls): https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-131a
  - MITRE ATT&CK T1667 Email Bombing: https://attack.mitre.org/techniques/T1667/ and Storm-1811 G1046: https://attack.mitre.org/groups/G1046/
- Pass-the-cookie (extra). T1555.003 → T1539 → T1550.004. IDs from MITRE ATT&CK (not re-fetched today); infostealer evidence from Hudson Rock Cavalier.
- Meta-lessons (final card): urgency in one channel, the ask in another; trust moves, so check out of band; reading is safe, run/allow/approve is where it happens.
