import type { PatternId, ScanResult, ScanTool } from "./synthetic";
/* Mangle's own details, used for live tests with his consent. LIVE_DEMO_CHIPS fills the search box for /?demo in
   live mode, and the cached HIBP results (_agent/data/hibp-cache.json, never committed) are read only for these emails. */
export const HIBP_CACHE_EMAILS = ["manglekuo@gmail.com", "ghcpuman902@gmail.com"];
export const LIVE_DEMO_CHIPS = "manglekuo@gmail.com, ghcpuman902@gmail.com, ghcpuman902, Mangle Kuo";

/* ---- GTA style presets (approved by Mangle on 24 Nov). Each opens a cached profile and never runs a live scan.
   Tim Cook and Jensen Huang are real, so their cards and report are about what attackers try on someone in that
   public role, with no breach or leak claims. The other three are made up. ---- */

export type Preset = {
  name: string; badge: string; av: string;
  results: Partial<Record<ScanTool, ScanResult>>;
  findings: { lead: string; rest: string }[];
  patterns: PatternId[];
};

const r = (found: string, hit = false): ScanResult => ({ found, hit });
const NOT = r("Not checked");

export const PRESETS: Preset[] = [
  { name: "Tim Cook", badge: "High Value Individual", av: "#e5e5e5",
    results: { hibpTest: NOT, github: NOT, linkedin: r("Risk: fake profiles", true), hudsonRock: NOT,
      web: r("Found: public role at Apple", true), leakCheck: NOT, social: r("Risk: impersonation", true), forum: r("Risk: fake giveaways", true) },
    findings: [
      { lead: "Tim Cook runs Apple, which makes him the kind of target attackers call a whale.",
        rest: " Whaling emails go after the most senior person in a company, because one approved payment or one shared login is worth more than thousands of ordinary ones." },
      { lead: "Fake chief executive emails borrow his name to rush staff.",
        rest: " A message that seems to come from him asks someone in finance to pay an invoice today and keep it quiet." },
      { lead: "His face and voice are easy to copy.",
        rest: " Scammers use fake videos of famous business leaders to promote crypto giveaways, so a familiar face on a livestream proves nothing." },
    ],
    patterns: [] },
  { name: "Jensen Huang", badge: "Target of Spies", av: "#d9f99d",
    results: { hibpTest: NOT, github: NOT, linkedin: r("Risk: fake recruiters", true), hudsonRock: NOT,
      web: r("Found: public role at Nvidia", true), leakCheck: NOT, social: r("Risk: impersonation", true), forum: r("Risk: state hackers", true) },
    findings: [
      { lead: "Jensen Huang runs Nvidia, whose chip designs foreign states want.",
        rest: " State hacking groups go after the staff and suppliers around companies like this, looking for designs and plans." },
      { lead: "Fake recruiters go after the engineers around him.",
        rest: " A message offers a dream role and a short coding test, and running the test infects the engineer's laptop." },
      { lead: "Export rules make plans about chips valuable.",
        rest: " Anyone who learns early which chips may be sold where can trade on it or pass it on, so attackers look for those plans too." },
    ],
    patterns: ["contagious-interview"] },
  { name: "Kai Mercer", badge: "Crypto Worker", av: "#fde68a",
    results: { hibpTest: r("Found: 4 breaches", true), github: r("Found: email in commits", true), linkedin: r("Found: open to work", true),
      hudsonRock: r("Found: wallet logins", true), web: r("Found: conference talks"), leakCheck: r("Found: passwords in 2 leaks", true),
      social: r("Found: wallet address", true), forum: r("Found: Discord and Telegram", true) },
    findings: [
      { lead: "Kai works in crypto, so a stolen login can become an empty wallet.",
        rest: " Wallet drainers are fake sites and tokens that ask for one signature and then move everything out." },
      { lead: "A SIM swap would hand Kai's phone number to someone else.",
        rest: " The attacker talks the mobile network into moving the number to a new SIM, then receives every sign in code sent by text." },
      { lead: "Fake job offers with coding tests are the most likely way in.",
        rest: " Kai's GitHub and open to work profile tell a fake recruiter exactly which test to send." },
    ],
    patterns: ["contagious-interview", "session-hijack"] },
  { name: "Ellis Grey", badge: "Ghost", av: "#e0e7ff",
    results: { hibpTest: r("No breaches found"), github: r("No GitHub profile"), linkedin: r("Not in search results"),
      hudsonRock: r("No stealer logs found"), web: r("Found: one old mention"), leakCheck: r("No leaks found"),
      social: r("No public profiles found"), forum: r("No forum profiles found") },
    findings: [
      { lead: "We found almost nothing about Ellis online.",
        rest: " There are no breaches, no public profiles and one old mention on the web, so a scammer has very little to work with." },
      { lead: "Staying this quiet is mostly habit.",
        rest: " A separate email for sign ups, private profiles and sign in codes on every account keep it that way." },
    ],
    patterns: [] },
  { name: "Rose Hart", badge: "Romance Target", av: "#fecdd3",
    results: { hibpTest: r("Found: 1 breach", true), github: r("No GitHub profile"), linkedin: r("Found: public profile"),
      hudsonRock: r("No stealer logs found"), web: r("Found: public photos", true), leakCheck: r("No leaks found"),
      social: r("Found: open profile", true), forum: r("Found: hobby posts") },
    findings: [
      { lead: "Rose's open profiles make her easy to approach.",
        rest: " Public photos and hobby posts give a stranger plenty to start a friendly conversation." },
      { lead: "Pig butchering starts as friendship and ends with an investment.",
        rest: " After weeks of daily messages, the new friend shows off profits from a trading app and offers to help Rose start, and the app is fake." },
      { lead: "Romance scams ask for money once trust is built.",
        rest: " The story is usually an emergency, a frozen account or a ticket to finally meet, and the money goes by bank transfer, crypto or gift cards." },
    ],
    patterns: [] },
];

/* A search for exactly one preset name opens its cached profile. */
export function presetFor(query: string): Preset | undefined {
  const parts = query.split(/[,;\n]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  return parts.length === 1 ? PRESETS.find((p) => p.name.toLowerCase() === parts[0]) : undefined;
}
