import { describe, expect, it } from "vitest";
import { autoSlug } from "../live-sources";
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
