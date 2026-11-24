# Renderer fixtures (unit tests before integration)

Fixed inputs for the report markdown renderer, so it can be tested without Nemotron.

## What is here
- `valid/` 8 well formed reports (0, 1, 2 and 3 cards; with and without tags and footnotes). Synthetic people only. All URLs come from `research/fraud-patterns.json`.
- `messy/` 20 adversarial outputs a weak model might write.
- `expected.json` structural expectations per fixture: `fallback`, `cardKinds`, `footnotesPerCard`, `headingsToBold`, `droppedLinks`, `droppedCards`, `droppedTags`, optional `keptTags`, `mustNotContain`, `maxPlainSentencesPerCard`, `lintWarnings`. `_decision` notes record behaviour choices that the renderer owner should confirm.
- `whitelist.json` allowed URLs (every source in fraud-patterns.json) and the 14 allowed tags. If the renderer also allows per scan source URLs, pass those in and extend this list.
- `renderer.fixtures.test.ts` vitest test that runs `cleanReport` then `parseReport` on every fixture.
- `build_fixtures.py` regenerates everything. Edit fixtures there, not by hand.

## Drop into the repo
1. Copy this folder to `src/lib/__tests__/renderer-fixtures/` and the test file to `src/lib/__tests__/renderer.fixtures.test.ts`.
2. Fix the import names at the top of the test to the real exports in `src/lib/report-md.ts`.
3. Edit only `normalise()` in the test so it maps the real parse result onto the expected shape.
4. `npm i -D vitest` if missing, then `npx vitest run src/lib/__tests__/renderer.fixtures.test.ts`.

## Behaviour decisions baked in (change expected.json if you disagree)
- Unknown alert type such as `[!DANGER]` becomes a NOTE card. Lowercase alert types are normalised.
- More than 3 cards: keep the first 3, count the rest in `droppedCards`.
- Card text is trimmed to the bold sentence plus 2 plain sentences.
- Footnote markers with no definition are removed; unused definitions are removed.
- Non whitelisted links keep their text and lose the href; footnotes that only point off the whitelist are removed.
- Dashes become commas. American spelling is flagged, not rewritten.
- JSON, empty output, or nothing left after clean up means `fallback: true` (use the rules based report).
