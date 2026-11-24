/* Synthetic data only. No network calls. */
import type { Brand } from "@/components/brand-icons";

/* ---- scan sources: one AI SDK tool each, one fan card each ---- */
export type ScanTool = "web" | "linkedin" | "github" | "hudsonRock" | "leakCheck" | "hibpTest";
export type ScanResult = { found: string; hit: boolean };

export type FanCard = {
  tool: ScanTool;
  title: string;
  tag: string;
  dot: string;
  icon: { brand: Brand } | { lucide: string; bg: string };
  checking: string;
  result: ScanResult;
  delayMs: number;
};

/* Order is the fan order, left to right. */
export const FAN: FanCard[] = [
  { tool: "linkedin", title: "LinkedIn", tag: "LinkedIn", dot: "#0A66C2", icon: { brand: "linkedin" },
    checking: "Checking LinkedIn", result: { found: "Found: open to work", hit: true }, delayMs: 900 },
  { tool: "github", title: "GitHub", tag: "username", dot: "#171717", icon: { brand: "github" },
    checking: "Checking GitHub", result: { found: "Found: email in commits", hit: true }, delayMs: 1500 },
  { tool: "hibpTest", title: "Data breach", tag: "email", dot: "#2A6379", icon: { brand: "hibp" },
    checking: "Checking breaches", result: { found: "Found: 3 breaches", hit: true }, delayMs: 2100 },
  { tool: "web", title: "Web", tag: "name", dot: "#00a5ef", icon: { lucide: "globe", bg: "#00a5ef" },
    checking: "Checking the web", result: { found: "Found: 14 mentions", hit: false }, delayMs: 2700 },
  { tool: "hudsonRock", title: "Stolen logins", tag: "device", dot: "#e5484d", icon: { lucide: "key-round", bg: "#e5484d" },
    checking: "Checking stealer logs", result: { found: "Found: 23 saved logins", hit: true }, delayMs: 3300 },
  { tool: "leakCheck", title: "Leaked passwords", tag: "email", dot: "#8e51ff", icon: { lucide: "lock", bg: "#8e51ff" },
    checking: "Checking leak lists", result: { found: "Found: 3 passwords", hit: true }, delayMs: 3900 },
];

/* ---- landing ---- */
export const EXAMPLES = [
  "Jane Doe Smith, jane@example.com",
  "@alexchen, github.com/alexchen",
  "+44 7700 900123, Priya Kapoor",
  "linkedin.com/in/markreynolds, Mark Reynolds",
  "priya.k@example.org, @priyak",
];

export const PEOPLE = [
  { n: "Jane Doe Smith", av: "linear-gradient(135deg,#fbbf24,#f97316)", ring: "conic-gradient(#0A66C2 0 50%,#171717 50% 100%)", q: "Jane Doe Smith, jane@hibp-integration-tests.com, linkedin.com/in/janedoe-demo" },
  { n: "Alex Chen", av: "linear-gradient(135deg,#38bdf8,#6366f1)", ring: "conic-gradient(#171717 0 50%,#FF4500 50% 100%)", q: "Alex Chen, @alexchen, github.com/alexchen" },
  { n: "Priya Kapoor", av: "linear-gradient(135deg,#f472b6,#a855f7)", ring: "linear-gradient(45deg,#f58529,#dd2a7b,#8134af)", q: "Priya Kapoor, priya.k@example.org, +44 7700 900123" },
  { n: "Mark Reynolds", av: "linear-gradient(135deg,#34d399,#0ea5e9)", ring: "conic-gradient(#0A66C2 0 33%,#00a5ef 33% 66%,#009767 66% 100%)", q: "Mark Reynolds, linkedin.com/in/markreynolds" },
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
