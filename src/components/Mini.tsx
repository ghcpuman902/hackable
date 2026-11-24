"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Lucide, Tile } from "./icons";
import { DEMO_EMAIL, type MiniName } from "@/lib/synthetic";
import "./mini.css";

/* When something arrives, in seconds from the moment the Mini scrolls into view. */
const at = (sec: number) => ({ "--at": sec + "s" }) as CSSProperties;
const dx = (v: string) => ({ "--dx": v }) as CSSProperties;

/* Other people's addresses in the leaked list. The names sit under a black bar, so only their length shows. */
const LEAKED: [string, string][] = [
  ["mark.t", "gmail.com"], ["lucy", "outlook.com"], ["a.patel", "proton.me"], ["", ""], ["tom88", "yahoo.co.uk"], ["sam_k", "icloud.com"],
];
const [MINE, MINE_HOST] = DEMO_EMAIL.split("@");

/* Mini animations: markup from 05-search-flow.html. Each plays once when it is mostly on screen, then holds
   its end state (see mini.css). */
export function Mini({ name, who = "Jane" }: { name: MiniName; who?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("on"); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = (c: string) => `mini ${c}`;

  switch (name) {
    case "rec":
      return (
        <div ref={ref} className={cls("m-rec")} aria-hidden="true">
          <div className="bub a" style={at(0.2)}>Hi {who}, £140k remote role. Quick take-home test?</div>
          <div className="term a" style={at(1)}>
            <div><span className="p">$</span> npm install</div>
            <div className="a" style={at(1.7)}>added 214 packages</div>
            <div className="a r" style={at(2.4)}>postinstall: setup.js</div>
            <div className="a r" style={at(3.1)}>reading saved logins…</div>
          </div>
          <div className="loot"><b style={at(3.9)}>passwords</b><b style={at(4.15)}>sessions</b><b style={at(4.4)}>wallet</b></div>
        </div>
      );
    case "flood":
      return (
        <div ref={ref} className={cls("m-flood")} aria-hidden="true">
          <div className="bar">Inbox<span><b></b></span></div>
          <div className="list"><div className="feed"><div className="real">Order confirmed: £2,399</div><div className="stack"></div></div></div>
        </div>
      );
    case "vish":
      return (
        <div ref={ref} className={cls("m-flood m-vish")} aria-hidden="true">
          <div className="bar">Inbox<span><b></b></span></div>
          <div className="list"><div className="feed"><div className="stack"></div></div></div>
          <div className="call" style={at(2.9)}>Help Desk IT is calling<span>Teams · &quot;We can stop the spam&quot;</span></div>
          <div className="qa a" style={at(4.3)}>Quick Assist: share screen?<b>Allow</b></div>
        </div>
      );
    case "sess":
      return (
        <div ref={ref} className={cls("m-sess")} aria-hidden="true">
          <div className="w you"><span className="ck"></span>GitHub<br /><span className="ck"></span>Email<br /><span className="ck"></span>Slack</div>
          <div className="fly"></div>
          <div className="w them">
            <span className="x a" style={at(2.1)}>password</span>
            <span className="x a" style={at(2.6)}>2-step code</span>
            <div className="ok a" style={at(3.2)}>Signed in as {who === "there" ? "you" : who}</div>
          </div>
        </div>
      );
    case "breach":
      return (
        <div ref={ref} className={cls("m-breach")} aria-hidden="true">
          <span className="sh s2" style={at(0)}></span>
          <span className="sh s1" style={at(0.08)}></span>
          <div className="doc">
            <div className="dh">DevForum 2023</div>
            {LEAKED.map(([n, h], i) => (
              <div key={i} className={i === 3 ? "r me" : "r"} style={at(0.45 + i * 0.08)}>
                <span><span className="rd">{i === 3 ? MINE : n}</span>@{i === 3 ? MINE_HOST : h}</span>
              </div>
            ))}
          </div>
          <span className="glass"><Lucide name="search" w={2} /></span>
        </div>
      );
    case "steal":
      return (
        <div ref={ref} className={cls("m-steal")} aria-hidden="true">
          <div className="lap"></div>
          <span className="k" style={{ ...dx("calc(-50% - 68px)"), ...at(0.3) }}>GitHub</span>
          <span className="k" style={{ ...dx("-50%"), ...at(0.8) }}>Slack</span>
          <span className="k" style={{ ...dx("calc(-50% + 68px)"), ...at(1.3) }}>Bank</span>
          <span className="k" style={{ ...dx("-50%"), ...at(1.8), ["--dy" as string]: "-62px" }}>Shop</span>
        </div>
      );
    case "prof":
      return (
        <div ref={ref} className={cls("m-prof")} aria-hidden="true">
          <div className="row">
            <span className="pill a" style={at(0.3)}><span className="nw"><Tile kind="linkedin" />Open to work</span></span>
            <span className="pill a" style={at(0.75)}><span className="nw"><Tile kind="github" />41 repos</span></span>
          </div>
          <div className="row">
            <span className="pill a" style={at(1.2)}>JavaScript</span>
            <span className="pill a" style={at(1.6)}>London</span>
          </div>
          <div className="arrow" style={at(2.2)}></div>
          <div className="lab a" style={at(2.55)}>Senior developer, job hunting</div>
        </div>
      );
  }
}
