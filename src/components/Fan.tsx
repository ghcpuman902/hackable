import type { CSSProperties, ReactNode } from "react";
import { BRAND_BG, BrandIcon, type Brand } from "./brand-icons";
import { Lucide } from "./icons";
import { FAN, type FanCard, type ScanTool } from "@/lib/synthetic";
import "./fan.css";

export type CardState = "idle" | "checking" | "ok" | "hit";

export function Logo({ card }: { card: FanCard }) {
  if ("brand" in card.icon) {
    return <span className="lg" style={{ "--c": BRAND_BG[card.icon.brand] } as CSSProperties}><BrandIcon name={card.icon.brand} /></span>;
  }
  return <span className="lg" style={{ "--c": card.icon.bg } as CSSProperties}><Lucide name={card.icon.lucide} w={2} /></span>;
}

const T = ({ c, children }: { c: string; children: ReactNode }) => <span className="t" style={{ "--c": c } as CSSProperties}>{children}</span>;
const Hd = ({ c, icon, label }: { c: string; icon: ReactNode; label: string }) => <div className="hd"><T c={c}>{icon}</T><b>{label}</b></div>;
const B = (n: Brand) => <BrandIcon name={n} />;
const L = (n: string) => <Lucide name={n} w={2} />;
const Dot = ({ c, children, ink }: { c: string; children: ReactNode; ink?: boolean }) =>
  <span className="dot" style={{ "--c": c, color: ink ? "#171717" : undefined } as CSSProperties}>{children}</span>;

/* Scene art, markup from 06-landing.html. */
const MOCK: Record<string, ReactNode> = {
  email: <div className="mc"><div className="hd"><Dot c="#e5484d">AB</Dot><b>Acme Bank Security</b></div><b>Your account is locked</b>Confirm your details within 24 hours or…</div>,
  dm: <div className="mc"><div className="hd"><Dot c="#0A66C2">RH</Dot><b>Rachel Hart</b></div>Loved your GitHub. Quick paid coding test? Remote, £140k.</div>,
  sms: <div className="mc sms"><b>PARCEL</b>Your parcel is held. Pay £1.99 to release it: parcel-redeliver.co</div>,
  site: <div className="mc"><div className="url">{L("lock")}acrne-bank-login.com</div><div className="bar"></div><div className="bar"></div><div className="btn2"></div></div>,
  call: <div className="mc"><div className="hd"><Dot c="#525252">{L("phone-call")}</Dot><b>Help Desk IT is calling</b></div><div className="acts"><i></i><i></i></div></div>,
  linkedin: <div className="mc"><Hd c="#0A66C2" icon={B("linkedin")} label="LinkedIn" /><div className="who"><Dot c="#fbbf24" ink>JD</Dot><span><b>Jane Doe Smith</b>Product · London</span></div></div>,
  github: <div className="mc"><Hd c="#181717" icon={B("github")} label="GitHub" /><b>janedoe</b>41 repos · email in commits</div>,
  breach: <div className="mc"><Hd c="#e5484d" icon={L("shield-alert")} label="Data breach" /><div className="big">Found in 3 breaches</div><div className="tags"><i>Email</i><i>Username</i></div></div>,
  people: <div className="mc"><Hd c="#8e51ff" icon={L("user-search")} label="People search" /><b>Jane D. Smith</b>Age 32 · Manchester</div>,
  social: <div className="mc"><Hd c="linear-gradient(45deg,#f58529,#dd2a7b,#8134af)" icon={B("instagram")} label="Social" /><b>@janedoesmith</b>1.2k followers</div>,
  forum: <div className="mc"><Hd c="#FF6600" icon={B("hackernews")} label="Forum" /><b>janedoe88</b>Member since 2019</div>,
};

/* Which source each scene card turns into when a check runs. */
const TOOL: Record<string, ScanTool> = {
  breach: "hibpTest", github: "github", linkedin: "linkedin", site: "web", email: "hudsonRock",
  dm: "leakCheck", people: "peopleSearch", sms: "publicContact", social: "social", forum: "forum",
};

/* [kind, key, left %, start height %, depth, tilt, phone [left, height] or 0], from 06. Cards appear once; icons repeat.
   Phones show four cards in two columns (26% and 74%) with small icons down the middle. Every phone piece shares
   one duration (PHONE_DUR), so the scene moves as one and the gaps between pieces never close. */
type Piece = ["mock" | "icon", string, number, number, 0 | 1 | 2, number, [number, number] | 0];
const P: Piece[] = [
  ["mock", "email", 31, 62, 0, -6, [26, 12]], ["mock", "linkedin", 45, 26, 0, 6, [74, 37]], ["mock", "breach", 57, 74, 0, -3, [26, 62]],
  ["mock", "site", 68, 40, 0, 4, 0], ["mock", "github", 37, 12, 1, -7, 0], ["mock", "dm", 63, 96, 1, 5, 0],
  ["mock", "people", 52, 50, 1, -5, [74, 87]], ["mock", "sms", 22, 88, 1, 6, 0], ["mock", "social", 76, 16, 1, 8, 0],
  ["mock", "forum", 15, 34, 2, -8, 0], ["mock", "call", 85, 66, 2, 5, 0],
  ["icon", "fish", 41, 86, 1, -12, 0], ["icon", "triangle-alert", 48, 6, 2, 10, [50, 4]], ["icon", "bug", 60, 20, 2, 15, [50, 24]],
  ["icon", "key-round", 73, 82, 2, -20, [50, 84]], ["icon", "lock", 27, 40, 2, -8, [50, 44]], ["icon", "at-sign", 62, 58, 1, 6, 0],
  ["icon", "siren", 34, 30, 2, -10, [50, 64]], ["icon", "fish", 58, 36, 2, 12, 0], ["icon", "triangle-alert", 44, 64, 1, -6, 0],
  ["icon", "bug", 50, 92, 2, -14, 0], ["icon", "binoculars", 66, 4, 2, 14, 0], ["icon", "at-sign", 24, 16, 2, -8, 0],
  ["icon", "lock", 80, 44, 2, 10, 0], ["icon", "fish", 10, 70, 2, -6, 0], ["icon", "siren", 90, 24, 2, 8, 0],
  ["icon", "key-round", 40, 48, 2, 18, 0], ["icon", "bug", 70, 62, 1, -10, 0], ["icon", "triangle-alert", 18, 58, 2, 6, 0],
];

const PHONE_DUR = 30;
const CLS: Record<CardState, string> = { idle: "", checking: " chk", ok: " ok", hit: " bad" };

/* The landing scene and the check list are the same pieces. Wide screens use the 06 desktop
   positions and two columns; phones (≤640px, CSS) use the phone positions and one column. */
export function Fan({ fan = FAN, states, label }: {
  fan?: FanCard[]; states?: Partial<Record<ScanTool, CardState>>; label?: (c: FanCard, s: CardState) => string;
}) {
  const phoneTools = fan.filter((c) => c.phone);
  return (
    <>
      {P.map(([type, k, l, t, z, r, m], i) => {
        const dur = 26 + ((i * 7) % 12);
        const tool = type === "mock" ? TOOL[k] : undefined;
        const card = tool && fan.find((c) => c.tool === tool);
        const vars: Record<string, string | number> = {
          "--l": l + "%", "--t": t + "%", "--lm": (m ? m[0] : l) + "%", "--tm": (m ? m[1] : t) + "%",
          "--r": r + "deg", "--dur": dur + "s", "--d": -(1 - t / 100) * dur * 0.92 + "s", "--dm": -(1 - (m ? m[1] : t) / 100) * PHONE_DUR * 0.92 + "s",
          "--sw": 5 + (i % 4) + "s",
        };
        let s: CardState = "idle";
        if (card) {
          const di = fan.indexOf(card), col = di % 2, row = Math.floor(di / 2), pi = phoneTools.indexOf(card);
          vars["--sl"] = `calc(50% ${col ? "+" : "-"} 146px)`;
          vars["--st"] = 12 + row * 74 + (col ? 30 : 0) + "px";
          vars["--stm"] = 12 + Math.max(pi, 0) * 66 + "px";
          s = states?.[card.tool] ?? "idle";
        }
        const st = card ? label?.(card, s) ?? "" : "";
        /* d: never on phones. pm: a phone check row that sits out of the phone scene. */
        const ph = m ? "" : card?.phone ? " pm" : " d";
        return (
          <div key={i} className={`pc z${z}${ph}${card ? " ck" : ""}${CLS[s]}`} style={vars as CSSProperties}>
            <div className="art" aria-hidden="true">
              {type === "mock" ? MOCK[k] : <span className={"ic" + (i % 3 ? "" : " g")}>{L(k)}</span>}
            </div>
            {card && (
              <div className="lrow">
                <Logo card={card} />
                <span><b>{card.title}</b><span className="st">{st}</span></span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export const runH = (fan: FanCard[]) => ({ phone: 40 + fan.filter((c) => c.phone).length * 66, wide: 70 + Math.ceil(fan.length / 2) * 74 });
