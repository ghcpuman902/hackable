<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product rules (Mangle)

- No eyebrow labels and no subtitles.
- Every control explains itself through its label or unit. No helper, hint or instruction text.
- No agent or developer instructions in user-facing copy.
- Inputs are at least 17px.
- No layout shift: content that appears later has reserved space or animates in without moving what is already there.
- The mockups in `public/mockups/` are the design source of truth. Port them; don't restyle them.
- Synthetic data only until real APIs are approved. No network calls to breach APIs.
- Never push, add a remote or deploy.

## Copy style (all user-facing text)

Follow `docs/copy-style/oxford-chat.md` for every UI string and short copy, and `docs/copy-style/write-clear-essays-and-explainers.md` for longer report prose. No punchy short contrast sentences, slogans or other AI-sounding patterns.
