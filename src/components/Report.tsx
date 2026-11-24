import type { CSSProperties, ReactNode } from "react";
import { Lucide, Tile } from "./icons";
import type { Preset } from "@/lib/presets";
import { DEMO_EMAIL, PATTERNS, type MiniName, type PatternId, type ScanResult, type ScanTool } from "@/lib/synthetic";

const s = (name: string): CSSProperties => ({ animationName: name });
const dx = (v: string) => ({ "--dx": v }) as CSSProperties;

/* Mini animations: markup from 05-search-flow.html, motion is pure CSS. */
export function Mini({ name, who = "Jane" }: { name: MiniName; who?: string }) {
  switch (name) {
    case "rec":
      return (
        <div className="mini m-rec" aria-hidden="true">
          <div className="bub a" style={s("s5")}>Hi {who}, £140k remote role. Quick take-home test?</div>
          <div className="term a" style={s("s20")}>
            <div><span className="p">$</span> npm install</div>
            <div className="a" style={s("s30")}>added 214 packages</div>
            <div className="a r" style={s("s40")}>postinstall: setup.js</div>
            <div className="a r" style={s("s50")}>reading saved logins…</div>
          </div>
          <div className="loot"><b>passwords</b><b>sessions</b><b>wallet</b></div>
        </div>
      );
    case "flood":
      return (
        <div className="mini m-flood" aria-hidden="true">
          <div className="bar">Inbox<span><b></b></span></div>
          <div className="list"><div className="stack"></div><div className="real">Order confirmed: £2,399</div></div>
        </div>
      );
    case "vish":
      return (
        <div className="mini m-flood m-vish" aria-hidden="true">
          <div className="bar">Inbox<span><b></b></span></div>
          <div className="list"><div className="stack"></div></div>
          <div className="call a" style={s("s45")}>Help Desk IT is calling<span>Teams · &quot;We can stop the spam&quot;</span></div>
          <div className="qa a" style={s("s65")}>Quick Assist: share screen?<b>Allow</b></div>
        </div>
      );
    case "sess":
      return (
        <div className="mini m-sess" aria-hidden="true">
          <div className="w you"><span className="ck"></span>GitHub<br /><span className="ck"></span>Email<br /><span className="ck"></span>Slack</div>
          <div className="fly"></div>
          <div className="w them">
            <span className="x a" style={s("s60")}>password</span>
            <span className="x a" style={s("s65")}>2-step code</span>
            <div className="ok a" style={s("s70")}>Signed in as {who === "there" ? "you" : who}</div>
          </div>
        </div>
      );
    case "breach":
      return (
        <div className="mini m-breach" aria-hidden="true">
          <span className="mail"><Tile kind="email" />{DEMO_EMAIL}</span>
          <b className="a" style={s("s15")}>DevForum 2023</b>
          <b className="a" style={s("s30")}>ShopLane 2021</b>
          <b className="a" style={s("s45")}>PixelPrint 2019</b>
        </div>
      );
    case "steal":
      return (
        <div className="mini m-steal" aria-hidden="true">
          <div className="lap"></div>
          <span className="k" style={dx("-130%")}>GitHub</span>
          <span className="k" style={dx("-50%")}>Slack</span>
          <span className="k" style={dx("30%")}>Bank</span>
          <span className="k" style={dx("-90%")}>Shop</span>
        </div>
      );
    case "prof":
      return (
        <div className="mini m-prof" aria-hidden="true">
          <div className="row">
            <span className="pill a" style={s("s5")}><span className="nw"><Tile kind="linkedin" />Open to work</span></span>
            <span className="pill a" style={s("s15")}><span className="nw"><Tile kind="github" />41 repos</span></span>
          </div>
          <div className="row">
            <span className="pill a" style={s("s25")}>JavaScript</span>
            <span className="pill a" style={s("s30")}>London</span>
          </div>
          <div className="arrow a" style={s("s40")}></div>
          <div className="lab a" style={s("s45")}>Senior developer, job hunting</div>
        </div>
      );
  }
}

export function Para({ lead, rest }: { lead: ReactNode; rest: ReactNode }) {
  return <p className="qx"><span className="lead">{lead}</span><span className="rest">{rest}</span></p>;
}

export function Sec({ children, mini }: { children: ReactNode; mini?: MiniName }) {
  return (
    <section className={`sec mk-card${mini ? "" : " plain"}`}>
      <div>{children}</div>
      {mini && <div><Mini name={mini} /></div>}
    </section>
  );
}

export function PatternSec({ id, who }: { id: PatternId; who?: string }) {
  const p = PATTERNS[id];
  return (
    <a className="sec mk-card" href={p.href}>
      <div>
        <Para lead={p.lead} rest={p.rest} />
        <ol className="chain">
          {p.chain.map(([n, t]) => <li key={n} tabIndex={0} data-id={t} title={t}>{n}</li>)}
        </ol>
        <p className="lesson">{p.lesson}</p>
        <span className="cite">{p.cite}</span>
      </div>
      <div><Mini name={p.anim} who={who} /></div>
      <span className="go" aria-hidden="true"><Lucide name="arrow-right" /></span>
    </a>
  );
}

export const FINDINGS = [
  <Sec key="breach" mini="breach">
    <Para lead={<>Your <span className="nw"><Tile kind="email" />email</span> is in 3 breaches.</>} rest=" The newest was DevForum in 2023. We only saw the breach names." />
  </Sec>,
  <Sec key="steal" mini="steal">
    <Para lead="In March, a program on your laptop copied 23 saved logins." rest=" Two were for work tools, and someone may be selling them." />
  </Sec>,
  <Sec key="prof" mini="prof">
    <Para lead="To a scammer, you look like a senior JavaScript developer who is open to work."
      rest={<> Your <span className="nw"><Tile kind="linkedin" />LinkedIn</span> and <span className="nw"><Tile kind="github" />GitHub</span> both say so, and two published scams target people like you.</>} />
  </Sec>,
];

const FINAL_REST = " The flood comes by email and the request comes by phone. The recruiter writes on LinkedIn, and the malware sits in a GitHub repo.";

export function FinalSec({ onMail, both = true, rest = FINAL_REST }: { onMail: () => void; both?: boolean; rest?: string }) {
  return (
    <Sec>
      {both && <Para lead="Both scams start in one channel and make the request in another." rest={rest} />}
      <p className="lesson">When a message pushes you to act fast, reply through a channel you already use with that person or company.</p>
      <p className="lesson">Stop and check whenever someone asks you to run their code or share your screen.</p>
      <div className="actions">
        <button type="button" className="pill dark" onClick={onMail}>
          <span className="nw"><Tile kind="email" />Email me this report</span>
        </button>
      </div>
    </Sec>
  );
}

/* ---- live report (SCAN_MODE=live): built only from what the live tools returned ---- */
export type Outputs = Partial<Record<ScanTool, ScanResult>>;
const and = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/* A commit email lets a fake recruiter write about your code; any email that is public or leaked can be flooded. */
export function livePatterns(o: Outputs): PatternId[] {
  const commitEmail = (o.github?.facts?.emails?.length ?? 0) > 0;
  const publicEmail = commitEmail || !!o.social?.facts?.profiles?.includes("Gravatar") || !!o.hibpTest?.hit || !!o.leakCheck?.hit;
  const ids: PatternId[] = [];
  if (commitEmail) ids.push("contagious-interview");
  if (publicEmail) ids.push("email-bomb-vishing");
  /* Stealer logs and combolists with a password point to stolen sessions as well as stolen passwords. */
  const creds = !!o.hibpTest?.facts?.breaches?.some((b) => b.creds) || !!o.hibpTest?.facts?.pastes?.some((p) => p.creds);
  if (o.hudsonRock?.hit || creds) ids.push("session-hijack");
  return ids;
}

export function liveFindings(o: Outputs): ReactNode[] {
  const out: ReactNode[] = [];
  const bf = o.hibpTest?.facts;
  const breaches = bf?.breaches ?? [];
  const cite = bf?.checked?.length ? <span className="cite">{bf.checked.join(" · ")}</span> : null;
  for (const email of [...new Set(breaches.map((b) => b.email ?? ""))]) {
    const mine = breaches.filter((b) => (b.email ?? "") === email);
    const newest = mine.filter((b) => b.date).sort((a, b) => (b.date! > a.date! ? 1 : -1))[0];
    const pw = mine.filter((b) => b.passwords).length;
    const rest = [
      newest ? ` The newest was ${newest.name} in ${newest.date!.slice(0, 4)}` : "",
      pw ? `${newest ? ", and" : ""} ${pw === mine.length ? "all of them include" : pw === 1 ? "one of them includes" : `${pw} of them include`} a password.` : newest ? "." : "",
    ].join("");
    out.push(
      <Sec key={"breach" + email}>
        <Para lead={<>Your <span className="nw"><Tile kind="email" />{email || "email"}</span> {mine.length === 1 ? "is in one breach" : `is in ${mine.length} breaches`}.</>} rest={rest} />
        {cite}
      </Sec>,
    );
    const creds = [...mine.filter((b) => b.creds).map((b) => b.name), ...(bf?.pastes ?? []).filter((p) => p.creds && p.email === email).map((p) => p.name)];
    if (creds.length) {
      out.push(
        <Sec key={"creds" + email}>
          <Para lead="Lists that criminals use to break into accounts include this address."
            rest={` They include ${and(creds.slice(0, 3))}${creds.length > 3 ? " and others" : ""}, which pair it with a password, so anyone can try that login on other sites.`} />
        </Sec>,
      );
    }
  }
  if (o.leakCheck?.facts?.passwords && !breaches.length) {
    out.push(<Sec key="pw"><Para lead="Your email appears next to a password in a leaked list." rest=" Change that password wherever you still use it." /></Sec>);
  }
  const devices = o.hudsonRock?.facts?.devices ?? [];
  if (devices.length) {
    const latest = [...devices].sort().at(-1);
    out.push(
      <Sec key="steal">
        <Para lead={`A program on ${devices.length > 1 ? `${devices.length} of your devices` : "one of your devices"} copied saved logins.`}
          rest={latest && latest !== "unknown date" ? ` The latest copy was made on ${latest}, and someone may be selling the logins.` : " Someone may be selling the logins."} />
      </Sec>,
    );
  }
  const lists = o.hudsonRock?.facts?.stealerLists ?? [];
  if (!devices.length && lists.length) {
    out.push(
      <Sec key="steal">
        <Para lead="Your email is in a stealer log list."
          rest={` These lists hold logins that malware copied from infected computers.${o.hudsonRock?.facts?.noDevice ? " Hudson Rock found no infected device linked to your details, so the computer may not have been yours." : ""}`} />
      </Sec>,
    );
  }
  const emails = o.github?.facts?.emails ?? [];
  const repos = o.github?.facts?.repos ?? [];
  if (emails.length) {
    out.push(
      <Sec key="github">
        <Para lead={<>Your <span className="nw"><Tile kind="github" />GitHub</span> commits show your personal email.</>}
          rest={` Anyone can read ${and(emails)} in the history of ${and(repos)}, so a stranger can write to you about your code.`} />
      </Sec>,
    );
  }
  const social = o.social?.facts?.profiles ?? [];
  const linked = o.social?.facts?.linked ?? [];
  if (social.includes("Gravatar")) {
    out.push(
      <Sec key="gravatar">
        <Para lead={<>Your <span className="nw"><Tile kind="email" />email</span> has a public Gravatar profile.</>}
          rest={linked.length ? ` It lists your ${and(linked)} ${linked.length === 1 ? "account" : "accounts"}, so anyone who has your email can find ${linked.length === 1 ? "it" : "them"}.` : " Anyone who has your email can see its name and picture."} />
      </Sec>,
    );
  }
  const others = [...social.filter((p) => p !== "Gravatar"), ...(o.forum?.facts?.profiles ?? [])];
  const user = o.forum?.facts?.username ?? o.social?.facts?.username;
  if (others.length && user) {
    out.push(<Sec key="user"><Para lead={`Your username ${user} has public profiles on ${and(others)}.`} rest=" What you posted there can be read next to your other profiles." /></Sec>);
  }
  const web = o.web?.facts;
  if (web?.results) {
    const li = (o.linkedin?.facts?.profiles?.length ?? 0) > 0;
    out.push(
      <Sec key="web">
        <Para lead="A web search for your name finds pages about you."
          rest={` The first results include ${and((web.domains ?? []).slice(0, 4))}${li ? ", and a LinkedIn profile" : ""}.`} />
      </Sec>,
    );
  }
  if (!out.length) {
    const missed = Object.values(o).some((r) => r?.source === "unavailable");
    out.push(
      <Sec key="none">
        <Para lead="We found nothing about these details in the sources we checked."
          rest={missed ? " Some sources could not be checked, so there may be more." : " That covers breach lists, stealer logs, GitHub, Gravatar, forums and a web search."} />
      </Sec>,
    );
  }
  return out;
}

/* ---- preset profiles: a status badge and a wanted level out of five ---- */
export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" role="img" aria-label={`${n} of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} className={i < n ? "on" : undefined} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

export function presetFindings(p: Preset): ReactNode[] {
  const [head, ...more] = p.findings;
  return [
    <Sec key="head">
      <div className="wanted"><span className="badge">{p.badge}</span><Stars n={p.stars} /></div>
      <Para lead={head.lead} rest={head.rest} />
    </Sec>,
    ...more.map((f) => <Sec key={f.lead}><Para lead={f.lead} rest={f.rest} /></Sec>),
  ];
}
