/* Synthetic data only. No network calls. */
import type { Brand } from "@/components/brand-icons";

/* ---- scan sources: one AI SDK tool each, one fan card each ---- */
export type ScanTool = "web" | "linkedin" | "github" | "hudsonRock" | "leakCheck" | "hibpTest"
  | "forum" | "peopleSearch" | "publicContact" | "social";
/* source, detail and facts are set only by live checks (SCAN_MODE=live); synthetic results leave them out.
   facts carry what the live report is built from. */
export type Facts = {
  emails?: string[]; repos?: string[]; passwords?: boolean;
  /* creds: a stealer log, combolist or credential stuffing list. checked: the breach sources that answered. */
  breaches?: { name: string; date?: string; email?: string; passwords?: boolean; creds?: boolean }[];
  pastes?: { name: string; date?: string; email?: string; creds?: boolean }[]; checked?: string[];
  devices?: string[]; stealerLists?: string[]; noDevice?: boolean; profiles?: string[]; linked?: string[]; domains?: string[]; results?: number; username?: string;
};
export type ScanResult = { found: string; hit: boolean; source?: "live" | "skipped" | "unavailable"; detail?: string; facts?: Facts };

export type FanCard = {
  tool: ScanTool;
  title: string;
  icon: { brand: Brand } | { lucide: string; bg: string };
  checking: string;
  result: ScanResult;
  /* shown on phones (the 06 phone scene has six check rows) */
  phone?: boolean;
};

/* Run order, as in 06: each source lights up in turn. Phone sources come first so the phone list fills top to bottom.
   Keep every status line under about 30 characters so it fits one 13px row at 390px. */
export const FAN: FanCard[] = [
  { tool: "hibpTest", title: "Data breaches", icon: { lucide: "shield-alert", bg: "#e5484d" },
    checking: "Checking breaches", result: { found: "Found: 3 breaches", hit: true }, phone: true },
  { tool: "github", title: "GitHub", icon: { brand: "github" },
    checking: "Checking GitHub", result: { found: "Found: email in commits", hit: true }, phone: true },
  { tool: "linkedin", title: "LinkedIn", icon: { brand: "linkedin" },
    checking: "Checking LinkedIn", result: { found: "Found: open to work", hit: false }, phone: true },
  { tool: "hudsonRock", title: "Stolen logins", icon: { lucide: "key-round", bg: "#f99c00" },
    checking: "Checking stealer logs", result: { found: "Found: 23 saved logins", hit: true }, phone: true },
  { tool: "peopleSearch", title: "People search", icon: { lucide: "user-search", bg: "#8e51ff" },
    checking: "Checking people search", result: { found: "Found: home town", hit: true }, phone: true },
  { tool: "publicContact", title: "Phone", icon: { lucide: "phone-call", bg: "#009767" },
    checking: "Checking your number", result: { found: "Found: mobile number", hit: true }, phone: true },
  { tool: "web", title: "Web", icon: { lucide: "globe", bg: "#00a5ef" },
    checking: "Checking the web", result: { found: "Found: 14 mentions", hit: false } },
  { tool: "leakCheck", title: "Leaked passwords", icon: { lucide: "lock", bg: "#0A66C2" },
    checking: "Checking leak lists", result: { found: "Found: 3 passwords", hit: true } },
  { tool: "social", title: "Social", icon: { brand: "instagram" },
    checking: "Checking social", result: { found: "Found: public profile", hit: false } },
  { tool: "forum", title: "Forums", icon: { brand: "hackernews" },
    checking: "Checking forums", result: { found: "Found: 3 old posts", hit: false } },
];
/* Live mode has no free source for people search or phone numbers, so those cards are dropped. The rest keep
   the 06 order, and the first six still fill the phone list. */
export const LIVE_DROPPED: ScanTool[] = ["peopleSearch", "publicContact"];
const PHONE_ROWS = FAN.filter((c) => c.phone).length;
const LIVE_FAN: FanCard[] = FAN.filter((c) => !LIVE_DROPPED.includes(c.tool)).map((c, i) => ({ ...c, phone: i < PHONE_ROWS }));
export const fanFor = (live: boolean): FanCard[] => (live ? LIVE_FAN : FAN);

/* Timing, as in 06: sources are checked one at a time. A new one starts every STEP_MS and
   each takes CHECK_MS, which is shorter, so only one card is checking at any moment. */
export const START_MS = 300;
export const STEP_MS = 720;
export const CHECK_MS = 640;

/* ---- landing ---- */
export const EXAMPLES = [
  "Jane Doe Smith, jane@example.com",
  "@alexchen, github.com/alexchen",
  "+44 7700 900123, Priya Kapoor",
  "linkedin.com/in/markreynolds, Mark Reynolds",
  "priya.k@example.org, @priyak",
];

/* Recent people. `found` = where they were found, shown as small platform tiles under the name. */
export type Found = "linkedin" | "github" | "breach" | "forum" | "x" | "social" | "phone" | "web";
export const PEOPLE: { n: string; av: string; found: Found[]; q: string }[] = [
  { n: "Jane Doe Smith", av: "#fde68a", found: ["linkedin", "github", "breach"], q: "Jane Doe Smith, jane@hibp-integration-tests.com, linkedin.com/in/janedoe-demo" },
  { n: "Alex Chen", av: "#bae6fd", found: ["github", "forum", "x"], q: "Alex Chen, @alexchen, github.com/alexchen" },
  { n: "Priya Kapoor", av: "#fbcfe8", found: ["social", "phone", "breach"], q: "Priya Kapoor, priya.k@example.org, +44 7700 900123" },
  { n: "Mark Reynolds", av: "#bbf7d0", found: ["linkedin", "web"], q: "Mark Reynolds, linkedin.com/in/markreynolds" },
];

export const SOURCES: { n: string; c: string; icon: { brand: Brand } | { lucide: string } }[] = [
  { n: "Web", c: "#00a5ef", icon: { lucide: "globe" } },
  { n: "LinkedIn", c: "#0A66C2", icon: { brand: "linkedin" } },
  { n: "GitHub", c: "#181717", icon: { brand: "github" } },
  { n: "LeakCheck", c: "#171717", icon: { lucide: "key-round" } },
  { n: "Have I Been Pwned", c: "#2A6379", icon: { brand: "hibp" } },
  { n: "Public records", c: "#737373", icon: { lucide: "landmark" } },
  { n: "Forums", c: "#FF6600", icon: { lucide: "messages-square" } },
];

/* ---- report ---- */
export type MiniName = "rec" | "flood" | "vish" | "sess" | "breach" | "steal" | "prof";

export type PatternId = "contagious-interview" | "email-bomb-vishing" | "session-hijack";
export type Pattern = { anim: MiniName; href: string; lead: string; rest: string; chain: [string, string][]; lesson: string; cite: string };

/* Copy, chains and sources from 05-search-flow.html and BUILD-NOTES "Attack patterns". */
export const PATTERNS: Record<PatternId, Pattern> = {
  "contagious-interview": { anim: "rec", href: "/mockups/03-pattern-fake-recruiter.html",
    lead: "A fake recruiter sends you a coding test, and running it infects your laptop.",
    rest: " When you run npm install, the repo starts BeaverTail. It copies your saved logins and crypto wallets, then installs a backdoor called InvisibleFerret.",
    chain: [["Recruiter message", "T1566.003 Spearphishing via Service"], ["Coding test repo", "T1204 User Execution"], ["npm install", "T1059.007 JavaScript"], ["Browser logins", "T1555.003 Credentials from Web Browsers"], ["Wallets and sessions", "T1539 Steal Web Session Cookie"]],
    lesson: "Run take-home tests from recruiters you have not met in a GitHub Codespace or on a spare machine.",
    cite: "Contagious Interview · Microsoft Threat Intelligence · Unit 42 (CL-STA-0240) · MITRE ATT&CK" },
  "email-bomb-vishing": { anim: "vish", href: "/mockups/03-pattern-signup-bombing.html",
    lead: "Hundreds of sign-up emails hit your inbox, and then someone from \"IT\" calls to help.",
    rest: " The caller asks you to open Quick Assist and share your screen. Once you allow it, they can take your logins and later install ransomware.",
    chain: [["Inbox flood", "T1667 Email Bombing"], ["Call on Teams or phone", "T1566.004 Spearphishing Voice"], ["Quick Assist", "T1219 Remote Access Tools"], ["Logins, then ransomware", "T1486 Data Encrypted for Impact"]],
    lesson: "If IT calls you about spam, hang up and ring the help desk on the number from your company intranet.",
    cite: "Black Basta email bomb · Microsoft Threat Intelligence (Storm-1811) · CISA AA24-131A · MITRE ATT&CK" },
  "session-hijack": { anim: "sess", href: "/mockups/03-pattern-session-hijack.html",
    lead: "A copied browser cookie lets someone into your accounts without your password or code.",
    rest: " Infostealers take the cookie that keeps you signed in, and the attacker loads it in their own browser.",
    chain: [["Infostealer", "T1555.003 Credentials from Web Browsers"], ["Session cookie", "T1539 Steal Web Session Cookie"], ["Replay it", "T1550.004 Web Session Cookie"]],
    lesson: "After a leak, press Sign out of all sessions in each account's security settings, then change the password.",
    cite: "Pass-the-cookie · MITRE ATT&CK T1539 · Hudson Rock Cavalier" },
};
export const LEAD_PATTERNS: PatternId[] = ["contagious-interview", "email-bomb-vishing"];
export const EXTRA_PATTERNS: PatternId[] = ["session-hijack"];

export const DEMO_EMAIL = "jane@hibp-integration-tests.com";
export const DEMO_CHIPS = "Jane Doe, jane@hibp-integration-tests.com, linkedin.com/in/janedoe-demo";
