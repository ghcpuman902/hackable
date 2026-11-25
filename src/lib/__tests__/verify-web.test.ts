import { describe, expect, it } from "vitest";
import { outputFlags } from "../flags";
import { pickPatterns, signalsFrom, type Findings } from "../pattern-score";
import { tagsFor } from "../report-tags";
import { verifyWebResult, verifyWebResults } from "../verify-web";

const identifiers = { emails: ["manglekuo@gmail.com"], handles: ["manglekuo"], names: ["Mangle Kuo"] };

describe("web result verification", () => {
  it("drops a Facebook namesake and a CleanTalk similar address", () => {
    expect(verifyWebResult({ title: "Mangle Kuo on Facebook", url: "https://facebook.example/mangle" }, identifiers)).toBeNull();
    expect(verifyWebResult({ title: "CleanTalk check", content: "manglekuo2@gmail.com", url: "https://cleantalk.example/a" }, identifiers)).toBeNull();
  });

  it("confirms a mixed case exact email and only whole handle matches", () => {
    expect(verifyWebResult({ title: "Profile", content: "MANGLEKUO@GMAIL.COM", url: "https://example.com/a" }, identifiers)?.status).toBe("confirmed");
    expect(verifyWebResult({ title: "manglekuo2", url: "https://example.com/b" }, identifiers)).toBeNull();
    expect(verifyWebResult({ title: "@manglekuo profile", url: "https://example.com/c" }, identifiers)?.status).toBe("confirmed");
  });

  it("keeps a name with a second identifier as possible, never confirmed", () => {
    expect(verifyWebResult({ title: "Mangle Kuo", content: "Contact gmail.com", url: "https://example.com/a" }, identifiers)?.status).toBe("possible");
  });

  it("checks unresolved pages in parallel and only keeps pages that verify", async () => {
    const got = await verifyWebResults([
      { title: "Untitled", url: "https://example.com/a" },
      { title: "No match", url: "https://example.com/b" },
    ], identifiers, async (url) => url.endsWith("/a") ? "MangleKuo@gmail.com" : "someone else");
    expect(got).toEqual([{ title: "Untitled", url: "https://example.com/a", content: "MangleKuo@gmail.com", status: "confirmed" }]);
  });

  it("possible web results do not add tags or pattern signals", () => {
    const findings: Findings = { web: { found: "Found: 0 results", hit: false, source: "live", facts: { possibleWebResults: [{ title: "Mangle Kuo", url: "https://example.com/a" }] } } };
    expect(signalsFrom(findings)).toEqual([]);
    expect(tagsFor(null, outputFlags(findings).filter((flag) => flag.state === "yes").map((flag) => flag.id))).toEqual(["NoProfile"]);
    expect(pickPatterns({ signals: signalsFrom(findings) })).toEqual([]);
  });
});

describe("web result verification edges", () => {
  const ids = { emails: ["manglekuo@gmail.com"], handles: [], names: [] };
  it("a longer address that ends with the email is not a match", () => {
    expect(verifyWebResult({ title: "List", content: "contact xmanglekuo@gmail.com", url: "https://a.example" }, ids)).toBeNull();
    expect(verifyWebResult({ title: "List", content: "manglekuo@gmail.com.au", url: "https://a.example" }, ids)).toBeNull();
    expect(verifyWebResult({ title: "List", content: "mail: <manglekuo@gmail.com>.", url: "https://a.example" }, ids)?.status).toBe("confirmed");
  });
  it("a bot check page is never confirmed, from the snippet or from the fetched page", async () => {
    expect(verifyWebResult({ title: "Just a moment...", content: "ghcpuman902", url: "https://devpost.example/ghcpuman902" }, { handles: ["ghcpuman902"] })).toBeNull();
    const out = await verifyWebResults([{ title: "Profile", url: "https://devpost.example/ghcpuman902" }], { handles: ["ghcpuman902"] },
      async () => "<title>Just a moment...</title> ghcpuman902 challenges.cloudflare.com");
    expect(out).toEqual([]);
  });
  it("the email's local part confirms as an exact handle only", () => {
    const withLocal = { emails: ["manglekuo@gmail.com"], handles: ["manglekuo"], names: [] };
    expect(verifyWebResult({ title: "Mangle Kuo (@manglekuo)", url: "https://instagram.example/manglekuo" }, withLocal)?.status).toBe("confirmed");
    expect(verifyWebResult({ title: "Mangekyo Sharingan", url: "https://fandom.example" }, withLocal)).toBeNull();
    expect(verifyWebResult({ title: "manglekuo2 shop", url: "https://shop.example" }, withLocal)).toBeNull();
  });
});
