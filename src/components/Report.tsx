import type { CSSProperties, ReactNode } from "react";
import { Lucide, Tile } from "./icons";
import { DEMO_EMAIL, PATTERNS, type MiniName, type PatternId } from "@/lib/synthetic";

const s = (name: string): CSSProperties => ({ animationName: name });
const dx = (v: string) => ({ "--dx": v }) as CSSProperties;

/* Mini animations: markup from 05-search-flow.html, motion is pure CSS. */
export function Mini({ name }: { name: MiniName }) {
  switch (name) {
    case "rec":
      return (
        <div className="mini m-rec" aria-hidden="true">
          <div className="bub a" style={s("s5")}>Hi Jane, £140k remote role. Quick take-home test?</div>
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
            <div className="ok a" style={s("s70")}>Signed in as Jane</div>
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

export function PatternSec({ id }: { id: PatternId }) {
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
      <div><Mini name={p.anim} /></div>
      <span className="go" aria-hidden="true"><Lucide name="arrow-right" /></span>
    </a>
  );
}

export const FINDINGS = [
  <Sec key="breach" mini="breach">
    <Para lead={<>Your <span className="nw"><Tile kind="email" />email</span> is in 3 breaches.</>} rest=" The newest was DevForum in 2023. We can see the names of the breaches, but we cannot tell which of your details each one leaked." />
  </Sec>,
  <Sec key="steal" mini="steal">
    <Para lead="In March, a program on your laptop copied 23 saved logins." rest=" Two were for work tools, and someone may be selling them." />
  </Sec>,
  <Sec key="prof" mini="prof">
    <Para lead="To a scammer, you look like a senior JavaScript developer who is open to work."
      rest={<> Your <span className="nw"><Tile kind="linkedin" />LinkedIn</span> and <span className="nw"><Tile kind="github" />GitHub</span> both say so, and two published scams target people like you.</>} />
  </Sec>,
];

export function FinalSec({ onMail }: { onMail: () => void }) {
  return (
    <Sec>
      <Para lead="Each of these attacks starts in one place and finishes in another." rest=" The flood of sign-ups arrives by email, and the request for screen access comes by phone. The recruiter writes on LinkedIn, and the malware sits in a GitHub repo." />
      <p className="lesson">When a message pushes you to act fast, reply through a channel you already use with that person or company.</p>
      <p className="lesson">If someone asks you to run their code or share your screen, check who they are before you do it.</p>
      <div className="actions">
        <button type="button" className="pill dark" onClick={onMail}>
          <span className="nw"><Tile kind="email" />Email me this report</span>
        </button>
      </div>
    </Sec>
  );
}
