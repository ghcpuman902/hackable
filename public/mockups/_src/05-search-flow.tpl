<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mirror</title>
<style>
/*BASE*/
body{min-height:100svh}
.app{max-width:760px;margin:0 auto;padding:0 20px 64px}
.top{padding-top:calc(50svh - 64px);transition:padding-top .6s cubic-bezier(.2,.8,.2,1)}
body.results .top{padding-top:20px}
@@FIELDCSS@@
.field{padding-right:62px}
.go-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:0;background:var(--n900);color:#fff;display:grid;place-items:center;cursor:pointer;padding:12px;transition:background .15s}
.go-btn svg{width:100%;height:100%}
.go-btn:disabled{background:#d4d4d4;cursor:default}
.chip .lbl{max-width:380px}
.under{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin-top:14px;min-height:36px}
body.results .under{justify-content:flex-start}
.seg{display:inline-flex;padding:3px;border-radius:999px;background:#f5f5f5}
.seg label{position:relative}
.seg input{position:absolute;opacity:0}
.seg span{display:block;padding:6px 12px;border-radius:999px;font-size:14px;font-weight:600;color:var(--n500);cursor:pointer;min-height:30px}
.seg input:checked+span{background:#fff;color:var(--n900);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.seg input:focus-visible+span{outline:2px solid var(--info)}
.consent{visibility:hidden;display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#9a5b00;background:var(--warn-bg);border-radius:999px;padding:6px 12px;cursor:pointer;min-height:36px}
.consent.on{visibility:visible} .consent.agreed{background:var(--ok-bg);color:#1a7f4b}
.consent input{width:18px;height:18px;margin:0;accent-color:var(--n900)}
/* results */
.results-area{display:none}
body.results .results-area{display:block}
.sources{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0}
.src{display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 10px;border-radius:999px;border:1px solid var(--n200);font-size:14px;font-weight:600;color:var(--n500);letter-spacing:-.01em;transition:color .3s}
.src i{width:12px;height:12px;border-radius:50%;border:2px solid #a3a3a3;border-right-color:transparent;animation:spin .7s linear infinite}
.src.done{color:var(--n900)} .src.done i{border:0;background:var(--ok);animation:none;width:9px;height:9px}
.src.hit{color:var(--n900)} .src.hit i{border:0;background:var(--danger);animation:none;width:9px;height:9px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.report{display:grid;gap:18px;margin-top:28px}
.sec{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:24px;align-items:center;padding:24px 24px 24px 30px;animation:rise .5s ease-out both;text-decoration:none;color:inherit}
.sec .qx{margin:0}
.sec.plain{grid-template-columns:1fr}
a.sec .go{position:absolute;top:18px;right:18px;width:32px;height:32px;border-radius:50%;background:#fff;display:grid;place-items:center;color:var(--n900);padding:8px;box-shadow:0 1px 2px rgba(0,0,0,.06);transition:transform .2s}
a.sec .go svg{width:100%;height:100%}
a.sec:hover .go{transform:translateX(2px)}
a.sec{padding-right:64px}
.more{justify-self:start;border:0;background:none;font:600 15px var(--font);color:var(--n500);cursor:pointer;padding:10px 4px;min-height:44px}
.more:hover{color:var(--n900)}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.actions .pill{cursor:pointer;min-height:44px}
.actions .pill.dark{background:var(--n900);color:#fff;border-color:var(--n900)} .actions .pill.dark .nw{color:#fff}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--n900);color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;font-weight:600;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
.toast.on{opacity:1}
@media (max-width:700px){
  .top{padding-top:calc(42svh - 64px)}
  .sec,a.sec{grid-template-columns:1fr;gap:18px;padding:22px 20px}
  a.sec .qx{padding-right:36px}
  .field{border-radius:22px;padding-left:44px} .field .lens{left:15px}
  .chip .lbl{max-width:190px}
}

.pname{font:700 13px var(--font);letter-spacing:.01em;color:var(--n900);margin:0 0 8px;display:block}
.chain{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:14px 0 0;padding:0;list-style:none}
.chain li{position:relative;font:600 13px/1 var(--font);color:var(--n800);background:#fff;border-radius:999px;padding:7px 10px;cursor:help}
.chain li+li::before{content:"";position:absolute;left:-6px;top:50%;width:6px;height:1px;background:#d4d4d4}
.chain li[data-id]:hover::after,.chain li[data-id]:focus::after{content:attr(data-id);position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);white-space:nowrap;font:600 11px var(--mono);background:var(--n900);color:#fff;padding:4px 7px;border-radius:6px}
.lesson{margin:14px 0 0;font:600 16px/1.4 var(--font);letter-spacing:-.01em;color:var(--n900)}
.cite{display:block;margin-top:8px;font:500 12px/1.4 var(--font);color:#a3a3a3}
.m-vish .call{position:absolute;left:11%;right:11%;top:44px;background:var(--n900);color:#fff;border-radius:14px;padding:10px 12px;font-size:12px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.m-vish .call span{display:block;font-weight:500;color:#a3a3a3;font-size:11px}
.m-vish .qa{position:absolute;left:11%;right:11%;bottom:14px;background:#fff;border:1px solid var(--n200);border-radius:12px;padding:9px 12px;font-size:12px;font-weight:600;color:var(--n900);display:flex;justify-content:space-between;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.12)}
.m-vish .qa b{background:var(--danger);color:#fff;border-radius:999px;padding:3px 9px;font-size:11px}
/* mini animations: CSS only, 8s loop, scaled-down versions of the 03 pages */
.mini{position:relative;height:190px;border-radius:1.25rem;background:#fff;overflow:hidden;font-family:var(--font)}
.mini *{box-sizing:border-box}
.mini .a{opacity:0;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:ease-out}
@@STEPS@@
.m-rec .bub{position:absolute;left:12px;top:12px;right:36px;background:#f5f5f5;border-radius:4px 12px 12px 12px;padding:8px 10px;font-size:12.5px;font-weight:600;color:var(--n900)}
.m-rec .term{position:absolute;left:12px;right:12px;bottom:12px;height:100px;background:#0f1115;border-radius:10px;padding:9px 11px;font:11.5px/1.55 var(--mono);color:#d4d4d8}
.m-rec .term .p{color:#4ade80} .m-rec .term .r{color:#fb7185}
.m-rec .loot{position:absolute;right:-4px;bottom:40px;display:flex;flex-direction:column;gap:4px;align-items:flex-end}
.m-rec .loot b{font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--danger);color:#fff;opacity:0;animation:leave 8s infinite}
.m-rec .loot b:nth-child(2){animation-delay:.25s}.m-rec .loot b:nth-child(3){animation-delay:.5s}
@keyframes leave{0%,66%{opacity:0;transform:translateX(-40px)}72%{opacity:1;transform:translateX(-14px)}88%{opacity:1;transform:translateX(0)}95%,100%{opacity:0;transform:translateX(40px)}}
.m-flood .bar{position:absolute;left:0;right:0;top:0;height:28px;border-bottom:1px solid var(--n200);display:flex;align-items:center;padding:0 12px;font-size:11.5px;font-weight:700;color:var(--n900)}
.m-flood .bar span{margin-left:auto;color:#0b4fc4}
.m-flood .bar span b{font-weight:700;animation:cnt 8s steps(1) infinite}
.m-flood .bar span b::after{content:"2";animation:cnt 8s steps(1) infinite}
@keyframes cnt{0%{content:"2"}25%{content:"38"}40%{content:"212"}55%{content:"640"}70%,100%{content:"1,284"}}
.m-flood .list{position:absolute;left:0;right:0;top:28px;bottom:0;overflow:hidden}
.m-flood .stack{height:0;position:relative;background:repeating-linear-gradient(#fff 0 24px,#f0f0f0 24px 25px);animation:grow 8s infinite ease-in}
.m-flood .stack::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 9px,#e5e5e5 9px 13px,transparent 13px 25px);-webkit-mask:linear-gradient(90deg,transparent 0 12px,#000 12px 38%,transparent 38% 44%,#000 44% 82%,transparent 82%);mask:linear-gradient(90deg,transparent 0 12px,#000 12px 38%,transparent 38% 44%,#000 44% 82%,transparent 82%)}
.m-flood .real{height:26px;display:flex;align-items:center;gap:6px;padding:0 12px;font-size:11.5px;font-weight:700;color:#b42318;background:var(--danger-bg)}
.m-flood .real::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--danger)}
@keyframes grow{0%,18%{height:0}75%,100%{height:600px}}
.m-sess .w{position:absolute;top:20px;bottom:20px;width:40%;background:#f5f5f5;border-radius:10px;padding:28px 10px 10px;font-size:11.5px;font-weight:600;color:var(--n500)}
.m-sess .w::before{content:"";position:absolute;left:0;right:0;top:0;height:20px;border-radius:10px 10px 0 0;background:#e5e5e5}
.m-sess .w.you{left:12px} .m-sess .w.them{right:12px} .m-sess .w.them::before{background:#18181b}
.m-sess .ck{display:inline-block;width:12px;height:12px;border-radius:50%;background:#d6a15a;vertical-align:-2px;margin-right:4px}
.m-sess .fly{position:absolute;left:30%;top:46%;width:14px;height:14px;border-radius:50%;background:#d6a15a;box-shadow:0 0 0 3px rgba(214,161,90,.25);opacity:0;animation:cross 8s infinite ease-in-out}
@keyframes cross{0%,25%{opacity:0;left:30%}30%{opacity:1;left:30%}55%{opacity:1;left:66%}60%,100%{opacity:0;left:66%}}
.m-sess .ok{margin-top:8px;padding:8px;border-radius:7px;background:var(--ok-bg);color:#1a5c38;font-weight:700}
.m-sess .x{display:block;margin-top:6px;text-decoration:line-through;color:#b42318}
.m-breach{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px}
.m-breach .mail{font-size:11.5px;font-weight:700;color:var(--n900);background:#f5f5f5;border-radius:999px;padding:6px 12px;display:inline-flex;align-items:center;max-width:92%;overflow:hidden;white-space:nowrap}
.m-breach b{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--danger-bg);color:#b42318}
.m-steal{display:grid;place-items:center}
.m-steal .lap{width:110px;height:70px;border:3px solid var(--n900);border-radius:8px;background:#fff;position:relative;margin-top:36px}
.m-steal .lap::after{content:"";position:absolute;left:-18px;right:-18px;bottom:-12px;height:7px;border-radius:0 0 6px 6px;background:var(--n900)}
.m-steal .k{position:absolute;left:50%;top:60%;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--danger);color:#fff;white-space:nowrap;opacity:0;animation:up 8s infinite}
.m-steal .k:nth-child(3){animation-delay:.6s}.m-steal .k:nth-child(4){animation-delay:1.2s}.m-steal .k:nth-child(5){animation-delay:1.8s}
@keyframes up{0%,10%{opacity:0;transform:translate(-50%,0)}18%{opacity:1}55%{opacity:1;transform:translate(var(--dx,-50%),-92px)}62%,100%{opacity:0;transform:translate(var(--dx,-50%),-110px)}}
.m-prof{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.m-prof .row{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.m-prof .row .pill{font-size:12.5px;padding:3px 9px}
.m-prof .lab{font-size:13px;font-weight:700;color:#fff;background:var(--n900);padding:7px 12px;border-radius:10px}
.m-prof .arrow{width:2px;height:16px;background:#d4d4d4}
@media (prefers-reduced-motion:reduce){.mini .a,.m-rec .loot b,.m-steal .k{opacity:1!important;animation:none!important}.m-flood .stack{height:600px;animation:none}.m-sess .fly{display:none}}
</style>
</head>
<body>
<div class="app">
  <div class="top">
    <form class="search" id="form" autocomplete="off" onsubmit="return false">
      <div class="field" id="field" role="group" aria-label="Who to check">
        <span class="lens">{{i:search}}</span>
        <input class="entry" id="entry" type="text" spellcheck="false" aria-label="Name, email or link" placeholder="Name, email or link">
        <button type="button" class="go-btn" id="submit" aria-label="Check" disabled>{{i:arrow-right}}</button>
      </div>
    </form>
    <div class="under">
      <div class="seg" role="radiogroup" aria-label="Who is this for?">
        <label><input type="radio" name="who" value="me" checked><span>Me</span></label>
        <label><input type="radio" name="who" value="other"><span>Someone else</span></label>
      </div>
      <label class="consent" id="consent"><input type="checkbox" id="agreed"><span id="ctext">They agreed</span></label>
    </div>
  </div>
  <div class="results-area" id="results" aria-live="polite">
    <div class="sources" id="sources"></div>
    <div class="report" id="report"></div>
  </div>
</div>
<div class="toast" id="toast">Sent to jane@hibp-integration-tests.com</div>

<script>
@@CHIPJS@@
/* ---------- mini animations (markup only; motion is CSS) ---------- */
const MINI = {
  rec: `<div class="mini m-rec" aria-hidden="true">
    <div class="bub a" style="animation-name:s5">Hi Jane, £140k remote role. Quick take-home test?</div>
    <div class="term a" style="animation-name:s20"><div><span class="p">$</span> npm install</div>
      <div class="a" style="animation-name:s30">added 214 packages</div>
      <div class="a r" style="animation-name:s40">postinstall: setup.js</div>
      <div class="a r" style="animation-name:s50">reading saved logins…</div></div>
    <div class="loot"><b>passwords</b><b>sessions</b><b>wallet</b></div></div>`,
  flood: `<div class="mini m-flood" aria-hidden="true">
    <div class="bar">Inbox<span><b></b></span></div>
    <div class="list"><div class="stack"></div><div class="real">Order confirmed: £2,399</div></div></div>`,
  vish: `<div class="mini m-flood m-vish" aria-hidden="true">
    <div class="bar">Inbox<span><b></b></span></div>
    <div class="list"><div class="stack"></div></div>
    <div class="call a" style="animation-name:s45">Help Desk IT is calling<span>Teams · "We can stop the spam"</span></div>
    <div class="qa a" style="animation-name:s65">Quick Assist: share screen?<b>Allow</b></div></div>`,
  sess: `<div class="mini m-sess" aria-hidden="true">
    <div class="w you"><span class="ck"></span>GitHub<br><span class="ck"></span>Email<br><span class="ck"></span>Slack</div>
    <div class="fly"></div>
    <div class="w them"><span class="x a" style="animation-name:s60">password</span><span class="x a" style="animation-name:s65">2-step code</span><div class="ok a" style="animation-name:s70">Signed in as Jane</div></div></div>`,
  breach: `<div class="mini m-breach" aria-hidden="true">
    <span class="mail">${ICON.email}jane@hibp-integration-tests.com</span>
    <b class="a" style="animation-name:s15">DevForum 2023</b><b class="a" style="animation-name:s30">ShopLane 2021</b><b class="a" style="animation-name:s45">PixelPrint 2019</b></div>`,
  steal: `<div class="mini m-steal" aria-hidden="true"><div class="lap"></div>
    <span class="k" style="--dx:-130%">GitHub</span><span class="k" style="--dx:-50%">Slack</span><span class="k" style="--dx:30%">Bank</span><span class="k" style="--dx:-90%">Shop</span></div>`,
  prof: `<div class="mini m-prof" aria-hidden="true">
    <div class="row"><span class="pill a" style="animation-name:s5"><span class="nw">${ICON.linkedin}Open to work</span></span><span class="pill a" style="animation-name:s15"><span class="nw">${ICON.github}41 repos</span></span></div>
    <div class="row"><span class="pill a" style="animation-name:s25">JavaScript</span><span class="pill a" style="animation-name:s30">London</span></div>
    <div class="arrow a" style="animation-name:s40"></div>
    <div class="lab a" style="animation-name:s45">Senior developer, job hunting</div></div>`
};

/* ---------- scam patterns: reorder or drop here ---------- */
const PATTERNS = {
  'contagious-interview': {name:'Contagious Interview', anim:'rec', href:'03-pattern-fake-recruiter.html',
    lead:'A fake recruiter sends you a coding test, and running it infects your laptop.', rest:' When you run npm install, the repo starts BeaverTail. It copies your saved logins and crypto wallets, then installs a backdoor called InvisibleFerret.',
    chain:[['Recruiter message','T1566.003 Spearphishing via Service'],['Coding test repo','T1204 User Execution'],['npm install','T1059.007 JavaScript'],['Browser logins','T1555.003 Credentials from Web Browsers'],['Wallets and sessions','T1539 Steal Web Session Cookie']],
    lesson:'Run take-home tests from recruiters you have not met in a GitHub Codespace or on a spare machine.',
    cite:'Contagious Interview · Microsoft Threat Intelligence · Unit 42 (CL-STA-0240) · MITRE ATT&CK'},
  'email-bomb-vishing': {name:'Email bomb, then a help-desk call', anim:'vish', href:'03-pattern-signup-bombing.html',
    lead:'Hundreds of sign-up emails hit your inbox, and then someone from "IT" calls to help.', rest:' The caller asks you to open Quick Assist and share your screen. Once you allow it, they can take your logins and later install ransomware.',
    chain:[['Inbox flood','T1667 Email Bombing'],['Call on Teams or phone','T1566.004 Spearphishing Voice'],['Quick Assist','T1219 Remote Access Tools'],['Logins, then ransomware','T1486 Data Encrypted for Impact']],
    lesson:'If IT calls you about spam, hang up and ring the help desk on the number from your company intranet.',
    cite:'Black Basta email bomb · Microsoft Threat Intelligence (Storm-1811) · CISA AA24-131A · MITRE ATT&CK'},
  'session-hijack': {name:'Pass-the-cookie', anim:'sess', href:'03-pattern-session-hijack.html',
    lead:'A copied browser cookie lets someone into your accounts without your password or code.', rest:' Infostealers take the cookie that keeps you signed in, and the attacker loads it in their own browser.',
    chain:[['Infostealer','T1555.003 Credentials from Web Browsers'],['Session cookie','T1539 Steal Web Session Cookie'],['Replay it','T1550.004 Web Session Cookie']],
    lesson:'After a leak, press Sign out of all sessions in each account\'s security settings, then change the password.',
    cite:'Pass-the-cookie · MITRE ATT&CK T1539 · Hudson Rock Cavalier'}
};
const LEAD_PATTERNS  = ['contagious-interview','email-bomb-vishing'];
const EXTRA_PATTERNS = ['session-hijack'];

const SOURCES = [['Web','done'],['LinkedIn','done'],['GitHub','done'],['Hudson Rock','hit'],['LeakCheck','hit'],['Have I Been Pwned','hit']];
const para = (lead, rest) => `<p class="qx"><span class="lead">${lead}</span><span class="rest">${rest}</span></p>`;
const sec = (inner, mini) => `<section class="sec mk-card${mini?'':' plain'}"><div>${inner}</div>${mini?`<div>${MINI[mini]}</div>`:''}</section>`;
const patternSec = id => { const p=PATTERNS[id];
  const chain = '<ol class="chain">'+p.chain.map(([n,t])=>`<li tabindex="0" data-id="${t}" title="${t}">${n}</li>`).join('')+'</ol>';
  return `<a class="sec mk-card" href="${p.href}"><div>${para(p.lead,p.rest)}${chain}<p class="lesson">${p.lesson}</p><span class="cite">${p.cite}</span></div><div>${MINI[p.anim]}</div><span class="go" aria-hidden="true">${LUCIDE['arrow-right']}</span></a>`; };
function reportParts(showAll){
  const parts = [
    sec(para(`Your <span class="nw">${ICON.email}email</span> is in 3 breaches.`, ' The newest was DevForum in 2023. We only saw the breach names.'), 'breach'),
    sec(para('In March, a program on your laptop copied 23 saved logins.', ' Two were for work tools, and someone may be selling them.'), 'steal'),
    sec(para('To a scammer, you look like a senior JavaScript developer who is open to work.', ` Your <span class="nw">${ICON.linkedin}LinkedIn</span> and <span class="nw">${ICON.github}GitHub</span> both say so, and two published scams target people like you.`), 'prof'),
    ...LEAD_PATTERNS.map(patternSec),
  ];
  if (showAll) parts.push(...EXTRA_PATTERNS.map(patternSec));
  else if (EXTRA_PATTERNS.length) parts.push(`<button type="button" class="more" id="morebtn">One more pattern</button>`);
  parts.push(sec(para('Both scams start in one channel and make the request in another.', ' The flood comes by email and the request comes by phone. The recruiter writes on LinkedIn, and the malware sits in a GitHub repo.')+
    '<p class="lesson">When a message pushes you to act fast, reply through a channel you already use with that person or company.</p><p class="lesson">Stop and check whenever someone asks you to run their code or share your screen.</p>'+
    `<div class="actions"><button class="pill dark" id="mail"><span class="nw">${ICON.email}Email me this report</span></button></div>`));
  return parts;
}

/* ---------- consent + submit ---------- */
const submitBtn = document.getElementById('submit'), consent = document.getElementById('consent'), agreed = document.getElementById('agreed');
const who = () => document.querySelector('input[name=who]:checked').value;
function updateSubmit(){
  const other = who()==='other';
  consent.classList.toggle('on', other);
  consent.classList.toggle('agreed', other && agreed.checked);
  document.getElementById('ctext').textContent = other && agreed.checked ? 'Agreed '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : 'They agreed';
  submitBtn.disabled = !(chips.length || entry.value.trim()) || (other && !agreed.checked);
}
document.querySelectorAll('input[name=who]').forEach(r=>r.addEventListener('change', updateSubmit));
agreed.addEventListener('change', updateSubmit);
entry.addEventListener('input', updateSubmit);

const params = new URLSearchParams(location.search);
const SPEED = +params.get('speed') || 1;
let timers = [];
function runResults(){
  timers.forEach(clearTimeout); timers=[];
  const srcEl=document.getElementById('sources'), report=document.getElementById('report');
  report.innerHTML='';
  srcEl.innerHTML = SOURCES.map(([n])=>`<span class="src"><i></i>${n}</span>`).join('');
  document.body.classList.add('results');
  const at=(ms,fn)=>timers.push(setTimeout(fn, ms/SPEED));
  let t=700;
  SOURCES.forEach(([n,state],i)=>{ t+=450; at(t, ()=> srcEl.children[i].classList.add(state)); });
  reportParts(params.has('all')).forEach(html => { t+=450; at(t, ()=>{ report.insertAdjacentHTML('beforeend', html); wire(); }); });
}
function wire(){
  const m=document.getElementById('morebtn');
  if (m && !m.dataset.w){ m.dataset.w=1; m.onclick=()=>{ m.insertAdjacentHTML('afterend', EXTRA_PATTERNS.map(patternSec).join('')); m.remove(); }; }
  const mail=document.getElementById('mail');
  if (mail && !mail.dataset.w){ mail.dataset.w=1; mail.onclick=()=>{const t=document.getElementById('toast');t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2400);}; }
}
/* URL as state: ?q= holds the chips, so refresh, share and Back work */
function stateFromUI(){ return {who:who(), consent: who()==='other' ? new Date().toISOString() : null, chips: chips.map(({raw})=>raw)}; }
submitBtn.addEventListener('click', () => {
  commit(); if (!chips.length || submitBtn.disabled) return;
  entry.blur();
  history.pushState(null,'','?q='+encodeURIComponent(JSON.stringify(stateFromUI())));
  runResults();
});
function restore(){
  const q = new URLSearchParams(location.search).get('q');
  if (!q){ timers.forEach(clearTimeout); document.body.classList.remove('results'); return false; }
  try { const s=JSON.parse(q); chips=[]; add((s.chips||[]).join(', ')); if (s.who==='other'){ document.querySelector('input[value=other]').checked=true; agreed.checked=!!s.consent; } updateSubmit(); runResults(); return true; } catch(e){ return false; }
}
addEventListener('popstate', restore);
window.__mirror = { get chips(){ return chips.map(c=>({kind:c.kind,label:c.label})); }, detect, tokenize };
if (!restore()) {
  if (params.has('demo')) add('Jane Doe, jane@hibp-integration-tests.com, linkedin.com/in/janedoe-demo');
  entry.focus();
}
</script>
</body>
</html>
