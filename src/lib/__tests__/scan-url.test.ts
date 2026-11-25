import { describe, expect, it } from "vitest";
import { chipsFromSearch, historyMode, scanSearch } from "../scan-url";
import { PRESETS } from "../presets";

describe("scan address", () => {
  it("every preset round trips through ?q, the same as a typed search", () => {
    for (const p of PRESETS) expect(chipsFromSearch(scanSearch([p.name]))).toEqual([p.name]);
  });

  it("keeps several chips, commas and odd characters", () => {
    const chips = ["manglekuo@gmail.com", "ghcpuman902", "O'Brien, Jr & Co"];
    expect(chipsFromSearch(scanSearch(chips))).toEqual(chips);
  });

  it("an address with no scan is a clean landing", () => {
    for (const s of ["", "?", "?demo", "?all", "?q=", "#report"]) expect(chipsFromSearch(s)).toBeNull();
  });

  it("an unreadable or empty ?q is a clean landing, never a scan of nothing", () => {
    for (const q of ["not json", "{}", '{"chips":[]}', '{"chips":["  "]}', '{"chips":"x"}', "[1]"])
      expect(chipsFromSearch("?q=" + encodeURIComponent(q))).toBeNull();
  });

  it("a new scan adds a history entry, the same scan again replaces it", () => {
    const a = scanSearch(["Tim Cook"]);
    const b = scanSearch(["Jensen Huang"]);
    expect(historyMode("", a)).toBe("push");
    expect(historyMode(a, b)).toBe("push");
    expect(historyMode(a, a)).toBe("replace");
  });
});
