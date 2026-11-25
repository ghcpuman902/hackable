import { describe, expect, it } from "vitest";
import { demoNoticeLinks, LINKEDIN_POST_URL } from "../site-config";

describe("demo notice links", () => {
  it("always links to the projects page", () => {
    expect(demoNoticeLinks("")[0]).toEqual({ label: "More of my projects", href: "https://manglekuo.com" });
  });

  it("hides the LinkedIn link while the address is empty or blank", () => {
    expect(demoNoticeLinks("")).toHaveLength(1);
    expect(demoNoticeLinks("   ")).toHaveLength(1);
  });

  it("shows the LinkedIn link once an address is set", () => {
    const links = demoNoticeLinks("https://www.linkedin.com/posts/example");
    expect(links).toHaveLength(2);
    expect(links[1]).toEqual({ label: "Read the LinkedIn post", href: "https://www.linkedin.com/posts/example" });
  });

  it("follows the exported constant by default", () => {
    expect(demoNoticeLinks().some((l) => l.label === "Read the LinkedIn post")).toBe(LINKEDIN_POST_URL.trim() !== "");
  });
});
