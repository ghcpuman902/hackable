import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeLiveContext } from "../live-sources";
import { checkStatus, clearClauses, scanFailed } from "../scan-outcome";
import { FAN, type ScanResult, type ScanTool } from "../synthetic";

/* Simulated source failures. No network: global fetch is replaced, so these never touch a real API. */
const TOOLS = FAN.map((c) => c.tool);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

type Route = (url: URL, init?: RequestInit) => Response | Promise<Response>;
function stubFetch(routes: Partial<Record<string, Route>>, fallback: Route = () => json({}, 404)) {
  const calls: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    calls.push(url.hostname);
    return (routes[url.hostname] ?? fallback)(url, init);
  }));
  return calls;
}

async function scan(query: string) {
  const pivots: unknown[] = [];
  const run = makeLiveContext({ quiet: true, fresh: true }).scan(query, new AbortController().signal, (p) => pivots.push(p));
  const out: Partial<Record<ScanTool, ScanResult>> = {};
  await Promise.all(TOOLS.map(async (t) => { out[t] = await run(t); }));
  return { out, pivots };
}

/* A hung source: never answers, rejects only when the shared deadline aborts the request. */
const hang: Route = (_url, init) => new Promise((_, reject) => {
  init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
});

beforeEach(() => {
  vi.stubEnv("TAVILY_API_KEY", "");
  vi.stubEnv("GITHUB_TOKEN", "");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("every source down", () => {
  it("a username search returns an unavailable result per source, never throws, and counts as a failed scan", async () => {
    stubFetch({}, () => { throw new TypeError("fetch failed"); });
    const { out } = await scan("downuser");
    expect(Object.keys(out)).toHaveLength(TOOLS.length);
    for (const t of ["social", "forum", "linkedin", "web", "hudsonRock", "github"] as const) {
      expect(out[t]?.source, t).toBe("unavailable");
      expect(out[t]?.found, t).toBe("Could not check");
      expect(out[t]?.hit, t).toBe(false);
    }
    /* Leak checks have no email to look up, so they are skipped rather than down. */
    expect(out.hibpTest?.source).toBe("skipped");
    expect(out.leakCheck?.source).toBe("skipped");
    expect(scanFailed("ready", TOOLS, out)).toBe(true);
  });

  it("an email search with every source down is a failed scan too", async () => {
    stubFetch({}, () => { throw new TypeError("fetch failed"); });
    const { out } = await scan("down.person@example.com");
    expect(out.leakCheck?.source).toBe("unavailable");
    expect(out.hibpTest?.source).toBe("unavailable");
    expect(scanFailed("ready", TOOLS, out)).toBe(true);
  });
});

describe("timeouts", () => {
  it("a hung source ends at the shared deadline with a timed out result, and the others still answer", async () => {
    stubFetch({
      "cavalier.hudsonrock.com": hang,
      "api.github.com": (url) => (url.pathname === "/users/hangsome"
        ? json({ login: "hangsome", name: null, email: null, public_repos: 3, followers: 1, created_at: "2019-01-01T00:00:00Z" })
        : json([])),
    });
    const t0 = Date.now();
    const { out } = await scan("hangsome");
    expect(Date.now() - t0).toBeLessThan(8000);
    expect(out.hudsonRock?.source).toBe("unavailable");
    expect(out.hudsonRock?.detail).toBe("Timed out after 4s");
    expect(out.github?.found).toBe("Found GitHub profile");
    expect(scanFailed("ready", TOOLS, out)).toBe(false);
  }, 15_000);

  it("a source that times out by itself reads the same", async () => {
    stubFetch({ "hacker-news.firebaseio.com": () => { throw new DOMException("The operation timed out", "TimeoutError"); } });
    const { out } = await scan("timeoutuser");
    expect(out.forum?.source).toBe("unavailable");
    expect(out.forum?.detail).toBe("Timed out after 4s");
  });
});

describe("partial results", () => {
  const routes = {
    "leakcheck.io": () => new Response("Too many requests", { status: 429 }),
    "api.xposedornot.com": () => json({ breaches: [["Adobe", "Dropbox"]] }),
    "cavalier.hudsonrock.com": () => json({ message: "ok", stealers: [] }),
    "api.github.com": () => json({ message: "API rate limit exceeded" }, 403),
    "api.gravatar.com": () => json({}, 404),
  };

  it("one breach source down still reports what the others found, and says which was missed", async () => {
    stubFetch(routes);
    const { out } = await scan("partialperson@example.com");
    expect(out.leakCheck?.source).toBe("unavailable");
    expect(out.leakCheck?.detail).toContain("LeakCheck HTTP 429");
    expect(out.hibpTest?.hit).toBe(true);
    expect(out.hibpTest?.facts?.breaches?.map((b) => b.name)).toEqual(["Adobe", "Dropbox"]);
    expect(out.hibpTest?.facts?.checked).toEqual(["XposedOrNot"]);
    expect(out.hibpTest?.detail).toContain("could not check LeakCheck");
  });

  it("a GitHub rate limit is an unavailable GitHub card and does not stop the other cards", async () => {
    stubFetch(routes);
    const { out } = await scan("partialperson@example.com");
    expect(out.github?.source).toBe("unavailable");
    expect(out.hudsonRock?.found).toBe("No stealer logs found");
    expect(scanFailed("ready", TOOLS, out)).toBe(false);
  });

  it("when only some profile checks fail, the social card keeps the ones that answered", async () => {
    stubFetch({
      "api.gravatar.com": () => { throw new TypeError("fetch failed"); },
      "keybase.io": () => json({ status: { code: 0 }, them: [{ basics: { username: "keyuser" } }] }),
    });
    const { out } = await scan("partialperson@example.com, @keyuser");
    expect(out.social?.source).toBe("live");
    expect(out.social?.facts?.profiles).toEqual(["Keybase"]);
    expect(out.social?.detail).toContain("could not check");
  });

  it("a failing web search does not take down the LinkedIn card's neighbours", async () => {
    stubFetch({
      "html.duckduckgo.com": () => new Response("", { status: 202 }),
      "keybase.io": () => json({ them: [null] }),
      "hacker-news.firebaseio.com": () => json(null),
      "cavalier.hudsonrock.com": () => json({ stealers: [] }),
    });
    const { out } = await scan("websearchless");
    expect(out.web?.source).toBe("unavailable");
    expect(out.web?.detail).toContain("rate limited");
    expect(out.linkedin?.source).toBe("unavailable");
    expect(out.social?.source).toBe("live");
  });
});

describe("what a failed scan may say", () => {
  const ok: ScanResult = { found: "No stealer logs found", hit: false, source: "live" };
  const down: ScanResult = { found: "Could not check", hit: false, source: "unavailable" };
  const skipped: ScanResult = { found: "No email to check", hit: false, source: "skipped" };
  const hit: ScanResult = { found: "Found: Gravatar", hit: true, source: "live" };

  it("a stream that drops after a source found something keeps the report", () => {
    expect(scanFailed("error", ["github", "hudsonRock"], { github: hit })).toBe(false);
  });
  it("a stream that drops with only clean answers is still a failure, never an all clear", () => {
    expect(scanFailed("error", ["github", "hudsonRock"], { github: ok })).toBe(true);
  });
  it("skipped sources are not answers: down plus skipped is a failed scan", () => {
    expect(scanFailed("ready", ["leakCheck", "github"], { leakCheck: skipped, github: down })).toBe(true);
  });
  it("skipped plus a real clean answer is a real result", () => {
    expect(scanFailed("ready", ["leakCheck", "hudsonRock"], { leakCheck: skipped, hudsonRock: ok })).toBe(false);
  });
  it("cached preset results, which carry no source, count as answers", () => {
    expect(scanFailed("ready", ["github"], { github: { found: "Clear", hit: false } })).toBe(false);
  });
  it("checkStatus tells checked, skipped and down apart", () => {
    expect([checkStatus(ok), checkStatus(skipped), checkStatus(down), checkStatus(undefined)]).toEqual(["checked", "skipped", "down", "skipped"]);
  });
  it("an all clear claims only the kinds of source that answered", () => {
    expect(clearClauses({ leakCheck: ok, hudsonRock: ok })).toEqual(["leaks", "stealer logs", "scam signals"]);
    expect(clearClauses({ leakCheck: skipped, hibpTest: skipped, hudsonRock: ok })).toEqual(["stealer logs", "scam signals"]);
    expect(clearClauses({ leakCheck: down, hudsonRock: down })).toEqual(["scam signals"]);
  });
});
