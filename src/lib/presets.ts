import type { PatternId, Profile, ScanResult, ScanTool } from "./synthetic";
/* Mangle's own details, used for live tests with his consent. LIVE_DEMO_CHIPS fills the search box for /?demo in
   live mode, and the cached HIBP results (_agent/data/hibp-cache.json, never committed) are read only for these emails. */
export const HIBP_CACHE_EMAILS = ["manglekuo@gmail.com", "ghcpuman902@gmail.com"];
export const LIVE_DEMO_CHIPS = "manglekuo@gmail.com, ghcpuman902@gmail.com, ghcpuman902, Mangle Kuo";

/* ---- GTA style presets (approved by Mangle on 24 Nov). Each opens a cached report and never runs a live scan.
   profile is a label the person may or may not have; when set, PROFILE_PATTERNS leads the report's patterns,
   and patterns holds any others the findings point to. Ellis Grey has no profile.
   Tim Cook and Jensen Huang are real, so their cards and report are about what attackers try on someone in that
   public role, with no breach or leak claims. The other three are made up. ---- */

export type Preset = {
  name: string; profile: Profile | null; av: string; img?: string;
  results: Partial<Record<ScanTool, ScanResult>>;
  findings: { lead: string; rest: string }[];
  patterns: PatternId[];
};

const r = (found: string, hit = false): ScanResult => ({ found, hit });
const NOT = r("Not checked");

export const PRESETS: Preset[] = [
  { name: "Tim Cook", profile: "High Value Individual", av: "#e5e5e5", img: "/avatars/tim-cook.webp",
    results: { hibpTest: NOT, github: NOT, linkedin: r("Watch for: fake profiles", true), hudsonRock: NOT,
      web: r("Found: public role at Apple", true), leakCheck: NOT, social: r("Watch for: impersonation", true), forum: r("Watch for: fake giveaways", true) },
    findings: [
      { lead: "Tim Cook runs Apple, and his name and face are known everywhere.",
        rest: " Messages and videos that borrow them can fool staff, suppliers and fans alike." },
    ],
    patterns: [] },
  { name: "Jensen Huang", profile: "Target of Spies", av: "#d9f99d", img: "/avatars/jensen-huang.webp",
    results: { hibpTest: NOT, github: NOT, linkedin: r("Watch for: fake recruiters", true), hudsonRock: NOT,
      web: r("Found: public role at Nvidia", true), leakCheck: NOT, social: r("Watch for: impersonation", true), forum: r("Watch for: state hackers", true) },
    findings: [
      { lead: "Jensen Huang runs Nvidia, whose chip designs foreign states want.",
        rest: " State hacking groups go after the staff and suppliers around companies like this, looking for designs and plans." },
      { lead: "Export rules make plans about chips valuable.",
        rest: " Anyone who learns early which chips may be sold where can trade on it or pass it on, so attackers look for those plans too." },
    ],
    patterns: [] },
  { name: "Kai Mercer", profile: "Crypto Worker", av: "#fde68a", img: "/avatars/kai-mercer.webp",
    results: { hibpTest: r("Found: 4 breaches", true), github: r("Found: email in commits", true), linkedin: r("Found: open to work", true),
      hudsonRock: r("Found: wallet logins", true), web: r("Found: conference talks"), leakCheck: r("Found: passwords in 2 leaks", true),
      social: r("Found: wallet address", true), forum: r("Found: Discord and Telegram", true) },
    findings: [
      { lead: "Kai works in crypto, so a stolen login can become an empty wallet.",
        rest: " Wallet logins turned up in stealer logs, and passwords in two leaks." },
      { lead: "Kai's GitHub and LinkedIn both say open to work.",
        rest: " That tells a fake recruiter exactly which coding test to send." },
    ],
    patterns: ["session-hijack"] },
  { name: "Ellis Grey", profile: null, av: "#e0e7ff", img: "/avatars/ellis-grey.webp",
    results: { hibpTest: r("No breaches found"), github: r("No GitHub profile"), linkedin: r("Not in search results"),
      hudsonRock: r("No stealer logs found"), web: r("Found: one old mention"), leakCheck: r("No leaks found"),
      social: r("No public profiles found"), forum: r("No forum profiles found") },
    findings: [
      { lead: "We found almost nothing about Ellis online.",
        rest: " There are no breaches, no public profiles and one old mention on the web." },
      { lead: "Staying this quiet is mostly habit.",
        rest: " A separate email for sign ups, private profiles and sign in codes on every account keep it that way." },
    ],
    patterns: [] },
  { name: "Rose Hart", profile: "Romance Target", av: "#fecdd3", img: "/avatars/rose-hart.webp",
    results: { hibpTest: r("Found: 1 breach", true), github: r("No GitHub profile"), linkedin: r("Found: public profile"),
      hudsonRock: r("No stealer logs found"), web: r("Found: public photos", true), leakCheck: r("No leaks found"),
      social: r("Found: open profile", true), forum: r("Found: hobby posts") },
    findings: [
      { lead: "Rose's public photos and hobby posts are open to anyone.",
        rest: " They give a stranger plenty to start a friendly conversation with." },
      { lead: "One old breach includes her email.",
        rest: " Nothing in it pairs the address with a password." },
    ],
    patterns: [] },
];

/* A search for exactly one preset name opens its cached profile. */
export function presetFor(query: string): Preset | undefined {
  const parts = query.split(/[,;\n]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  return parts.length === 1 ? PRESETS.find((p) => p.name.toLowerCase() === parts[0]) : undefined;
}
