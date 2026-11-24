# Rubric: model report vs golden

Score each check pass or fail. A report ships only with 7 of 8, and checks 1 and 2 are hard fails.

1. **No invented facts.** Every factual claim maps to an item in the raw JSON with isThisPerson true. Anything else fails, however plausible.
2. **Namesakes rejected.** No claim uses an item labelled isThisPerson false (footballer Tim Cook, NUS Jensen Huang, Hao Kuo and so on).
3. **Clean results stay clean.** A "not found" result (Hudson Rock, XposedOrNot) is never turned into a risk. Public figures get no breach or leak claims at all.
4. **Shape.** At most 6 blocks, alternating one bold sentence and 2 or 3 plain sentences, starting bold. No headings, eyebrows or subtitles.
5. **Type fits the evidence.** One short type name, and the first plain block gives the two or three facts that earn it, each linked.
6. **Patterns are real.** Each scam named matches a pattern id in fraud-patterns.json whose triggers fit the person's flags, linked to that pattern's own source.
7. **Exactly one lesson, one link.** The lesson is one concrete action, and its link comes from fraud-patterns.json sources and loads (HTTP 200).
8. **Style.** British spelling, no dashes, plain short words, phone friendly, calm not alarmist. Uncertain items (guessed emails) are worded as guesses.
