# Golden samples for the report prompt

Built 24 Nov 2026 for the Hackable / Mirror demo. Three people, one raw file and one hand written report each.

- `*.raw.json`: what a scammer could find. Each item has field, snippet, source_url, query, source, isThisPerson and reason. Namesakes are included on purpose with isThisPerson false.
- `*.golden.md`: the target report, then grader notes (type, profile, pattern ids, lesson link, what was rejected or left out).
- `rubric.md`: 8 checks for judging model output against the golden.
- `build_raw.py`: regenerates the raw JSON.

How to use: feed a raw file to the Nemotron reasoning pass, then score its report with the rubric against the matching golden.

Rules: Tim Cook and Jensen Huang are public role facts only, no breach or leak lookups. Mangle Kuo is the owner's own data (XposedOrNot, Hudson Rock, GitHub API). Breach names are stored, passwords never.
