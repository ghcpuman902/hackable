import { describe, expect, it } from "vitest";
import { autoSlug } from "../live-sources";
import { cleanReportMarkdown } from "../report-md";
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
