import { describe, expect, it } from "vitest";
import { autoSlug } from "../live-sources";
import { outputFlags, travelBreaches, type FlagId } from "../flags";
import { patternsFor } from "../patterns";
import { dedupePivots, pivotLabel, pivotValue } from "../pivots";
import { ALLOWED_TAGS, cleanReportMarkdown, parseReport } from "../report-md";
import { FLAG_TAG, NO_PROFILE_TAG, PROFILE_TAG, tagLine, tagsFor, withTagLine } from "../report-tags";
import { scanFailed } from "../scan-outcome";
import type { ScanResult, ScanTool } from "../synthetic";

describe("autoSlug", () => {
  it("treats Gravatar's made up slugs as not a handle", () => {
    expect(autoSlug("devotedlypassionate12b997a1ec")).toBe(true);
    expect(autoSlug("a".repeat(8) + "0123456789abcdef0123456789abcdef")).toBe(true);
    expect(autoSlug("0123456789abcdef0123456789abcdef")).toBe(true);
  });
  it("keeps chosen slugs", () => {
    for (const s of ["manglekuo", "ghcpuman902", "johnsmith1985", "jane.doe", "facade"]) expect(autoSlug(s)).toBe(false);
  });
});

describe("footnotes for the same page", () => {
  it("merge into one definition and one marker", () => {
    const url = "https://github.com/ghcpuman902";
    const md = `**You are a developer.**\n\nYour email is on GitHub[^1]. You go by Mangle Kuo[^2][^1].\n\n[^1]: [Email on GitHub](${url})\n[^2]: [Name on GitHub](${url})`;
    const out = cleanReportMarkdown(md, [url])!;
    expect(out).toContain("Mangle Kuo[^1].");
    expect(out).not.toContain("[^2]");
    expect(out.match(/^\[\^1\]:/gm)).toHaveLength(1);
  });
});

describe("scanFailed", () => {
  const tools: ScanTool[] = ["leakCheck", "github"];
  const down: ScanResult = { found: "Could not check", hit: false, source: "unavailable" };
  const clean: ScanResult = { found: "No leaks found", hit: false, source: "live" };
  it("a stream error is a failed scan, not an all clear", () => {
    expect(scanFailed("error", tools, {})).toBe(true);
  });
  it("every source unavailable is a failed scan", () => {
    expect(scanFailed("ready", tools, { leakCheck: down, github: down })).toBe(true);
  });
  it("one source answering is a real result", () => {
    expect(scanFailed("ready", tools, { leakCheck: clean, github: down })).toBe(false);
  });
  it("a scan still running has not failed", () => {
    expect(scanFailed("streaming", tools, { leakCheck: down })).toBe(false);
  });
});

describe("report tags", () => {
  it("Tim Cook's profile reads #HighValueIndividual", () => {
    expect(tagLine(tagsFor("High Value Individual", []))).toBe("#HighValueIndividual");
  });
  it("profile first, then one tag per flag, without repeats", () => {
    expect(tagsFor("Crypto Worker", ["same-username-everywhere", "public-email-in-commits", "same-username-everywhere"]))
      .toEqual(["CryptoWorker", "SameUsername", "PublicCommitEmail"]);
  });
  it("no profile and no flags gives #NoProfile, flags alone need no placeholder", () => {
    expect(tagsFor(null, [])).toEqual(["NoProfile"]);
    expect(tagsFor(null, ["stealer-log-hit"])).toEqual(["StealerLog"]);
  });
  it("every tag is allowed through the report clean up", () => {
    const all = [...Object.values(PROFILE_TAG), NO_PROFILE_TAG, ...Object.values(FLAG_TAG)];
    expect(all.every((t) => ALLOWED_TAGS.includes(t))).toBe(true);
  });
  it("a live report gets our tag line before the footnotes, and the writer's own tag line goes", () => {
    const md = "**You are The Code Sharer.**\n\n> [!TIP]\n> **Use a separate email.**[^1]\n\n#TheCodeSharer #CryptoWorker\n\n[^1]: [GitHub](https://github.com/x)";
    const out = withTagLine(md, ["PublicCommitEmail"]);
    expect(out).toBe("**You are The Code Sharer.**\n\n> [!TIP]\n> **Use a separate email.**[^1]\n\n#PublicCommitEmail\n\n[^1]: [GitHub](https://github.com/x)");
    expect(parseReport(out).tags).toEqual(["PublicCommitEmail"]);
  });
  it("adds the line when the writer wrote none and there are no footnotes", () => {
    expect(withTagLine("**Hello.**", ["NoProfile"])).toBe("**Hello.**\n\n#NoProfile");
  });
});

describe("pivot chips", () => {
  const known = ["Mangle Kuo", "ghcpuman902", "manglekuo@gmail.com"];
  it("a name or handle already known under any kind makes no chip, whatever the case", () => {
    expect(pivotValue("MANGLE KUO", "name", known)).toBeNull();
    expect(pivotValue("GhcPuman902", "handle", known)).toBeNull();
    expect(pivotValue("ghcpuman902", "name", known)).toBeNull();
  });
  it("tidies spaces and keeps a new value", () => {
    expect(pivotValue("  Mangle   K  ", "name", known)).toBe("Mangle K");
    expect(pivotValue("mangle-k", "handle", known)).toBe("mangle-k");
  });
  it("drops empty, long and malformed values", () => {
    expect(pivotValue(null, "name", [])).toBeNull();
    expect(pivotValue("   ", "name", [])).toBeNull();
    expect(pivotValue("x".repeat(101), "name", [])).toBeNull();
    expect(pivotValue("two words", "handle", [])).toBeNull();
    expect(pivotValue("-lead", "handle", [])).toBeNull();
  });
  it("the browser shows each value once, first arrival wins", () => {
    const got = dedupePivots([
      { from: "GitHub", kind: "handle", value: "mangle-k" },
      { from: "Gravatar", kind: "handle", value: "Mangle-K" },
      { from: "GitHub", kind: "name", value: "Mangle K" },
    ]);
    expect(got.map((p) => p.value)).toEqual(["mangle-k", "Mangle K"]);
  });
  it("every chip is labelled with what it is and where it came from", () => {
    expect(pivotLabel({ from: "GitHub", kind: "name", value: "x" })).toBe("Name from GitHub");
    expect(pivotLabel({ from: "Gravatar", kind: "handle", value: "x" })).toBe("Handle from Gravatar");
  });
});

describe("travel and marketplace breaches", () => {
  const results = (names: string[]): Partial<Record<ScanTool, ScanResult>> => ({
    hibpTest: { found: "Found", hit: true, source: "live", facts: { breaches: names.map((name) => ({ name })) } },
    leakCheck: { found: "Found", hit: true, source: "live", facts: { breaches: [] } },
  });
  const flag = (names: string[], id: FlagId) => outputFlags(results(names)).find((f) => f.id === id)!;

  it("an airline, hotel or booking breach gives the travel flag with the breach name as evidence", () => {
    for (const name of ["Air India", "Marriott", "Booking.com", "British Airways", "Trainline", "Airbnb"]) {
      const f = flag([name], "travel-site-breach");
      expect(f.state, name).toBe("yes");
      expect(f.evidence).toContain(name);
    }
  });
  it("a marketplace breach gives the marketplace flag, not the travel one", () => {
    for (const name of ["Vinted", "eBay", "Etsy", "Gumtree"]) {
      expect(flag([name], "marketplace-breach").state, name).toBe("yes");
      expect(flag([name], "travel-site-breach").state, name).toBe("no");
    }
  });
  it("other breaches give neither", () => {
    const names = ["Adobe", "LinkedIn", "Chess.com (2023)", "AlienStealerLogs", "Fairfax"];
    expect(flag(names, "travel-site-breach").state).toBe("no");
    expect(flag(names, "marketplace-breach").state).toBe("no");
  });
  it("the same leak under two names counts once, and long lists say how many more", () => {
    expect(travelBreaches([{ name: "Marriott" }, { name: "Marriott (2018)" }])).toEqual(["Marriott"]);
    const f = flag(["Marriott", "Hilton", "Hyatt", "Accor", "Radisson"], "travel-site-breach");
    expect(f.evidence).toContain("and 2 more");
  });
  it("LeakCheck names are read as well as HIBP names", () => {
    const o = results([]);
    o.leakCheck = { found: "Found", hit: true, source: "live", facts: { breaches: [{ name: "Depop" }] } };
    expect(outputFlags(o).find((f) => f.id === "marketplace-breach")!.state).toBe("yes");
  });
  it("no email checked is a skip, not a no", () => {
    expect(outputFlags({}).find((f) => f.id === "travel-site-breach")!.state).toBe("skip");
  });
  it("tags read #TravelSiteBreach and #MarketplaceBreach", () => {
    expect(tagLine(tagsFor(null, ["travel-site-breach", "marketplace-breach"]))).toBe("#TravelSiteBreach #MarketplaceBreach");
  });
  it("the same patterns follow as for travelling soon and selling online, counted once", () => {
    expect(patternsFor({ profile: null, flags: ["travel-site-breach"] })).toContain("fake-booking-or-visa");
    expect(patternsFor({ profile: null, flags: ["marketplace-breach"] })).toContain("marketplace-fake-buyer");
    expect(patternsFor({ profile: null, flags: ["travel-site-breach", "travelling-soon"] }))
      .toEqual(patternsFor({ profile: null, flags: ["travelling-soon"] }));
  });
});
