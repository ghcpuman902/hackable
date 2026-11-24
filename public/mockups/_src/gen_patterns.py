from pattern_shell import build

COMMON_CSS = r'''
.win{position:absolute;inset:18px;border-radius:12px;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);overflow:hidden}
.win .bar{height:30px;display:flex;align-items:center;gap:6px;padding:0 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}
.win .bar i{width:9px;height:9px;border-radius:50%;background:var(--line)}
.win .bar span{margin-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.panel{position:absolute;inset:30px 0 0 0;padding:22px;opacity:0;transform:translateY(10px);transition:opacity .45s,transform .45s;pointer-events:none}
.panel.show{opacity:1;transform:none}
.fade-in{opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s}
.fade-in.on{opacity:1;transform:none}
'''

# ------------------------------------------------------------------ 1. Fake recruiter
build('03-pattern-fake-recruiter.html', n=1, title='Fake recruiter coding test',
tags='<span class="tag danger">High match · 92%</span><span class="tag">Also called: Contagious Interview</span>',
lede='A dream job offer, <span class="g">then a coding test.</span> The test is the trap.',
css=COMMON_CSS + r'''
.msg .who{display:flex;gap:12px;align-items:center;margin-bottom:16px}
.msg .av{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#c7d2fe,#a5b4fc);display:grid;place-items:center;font-weight:700;color:#3730a3}
.msg .who b{display:block;font-size:15px} .msg .who span{font-size:12.5px;color:var(--muted)}
.bubble{background:var(--surface);border-radius:4px 16px 16px 16px;padding:14px 16px;font-size:clamp(14px,1.6vw,17px);line-height:1.45;max-width:92%;margin-bottom:10px}
.bubble.me{margin-left:auto;background:var(--ink);color:#fff;border-radius:16px 4px 16px 16px;max-width:60%}
.pill{display:inline-block;font-size:12px;font-weight:600;background:var(--ok-bg);color:#1a7f4b;border-radius:999px;padding:2px 8px;margin-top:4px}
.repo h4{margin:0 0 12px;font-size:15px} .repo h4 span{color:var(--muted);font-weight:500}
.file{display:flex;gap:10px;align-items:center;padding:9px 12px;border:1px solid var(--line);border-top:0;font:13.5px var(--mono)}
.file:first-of-type{border-top:1px solid var(--line);border-radius:8px 8px 0 0} .file:last-of-type{border-radius:0 0 8px 8px}
.file.bad{background:var(--danger-bg);color:#b42318}
.file .d{width:14px;height:12px;border-radius:2px;background:#8aa4d6}.file .f{width:11px;height:14px;border-radius:2px;border:1.5px solid #a1a1aa}
.readme{margin-top:14px;font-size:14px;border-left:3px solid var(--line);padding-left:12px;color:var(--muted)}
.readme b{color:var(--ink)}
.term{background:#0f1115;color:#d4d4d8;font:clamp(11.5px,1.35vw,14px)/1.65 var(--mono)}
.term .ln{white-space:pre-wrap;opacity:0} .term .ln.on{opacity:1}
.term .p{color:#4ade80} .term .r{color:#fb7185} .term .dim{color:#71717a}
.cursor{display:inline-block;width:8px;height:1.1em;background:#d4d4d8;vertical-align:-2px;animation:bl 1s steps(1) infinite}
@keyframes bl{50%{opacity:0}}
.exfil{display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;gap:6px}
.node{text-align:center;font-size:13px;font-weight:600}
.node .box{width:clamp(64px,11vw,110px);aspect-ratio:1;margin:0 auto 8px;border-radius:16px;display:grid;place-items:center}
.node.you .box{background:var(--surface);border:1px solid var(--line)}
.node.them .box{background:var(--ink)}
.lane{position:relative;height:200px}
.loot{position:absolute;left:0;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:5px 9px;border-radius:999px;background:var(--danger-bg);color:#b42318;white-space:nowrap;opacity:0}
.exfil.go .loot{animation:fly 2.4s ease-in-out forwards}
@keyframes fly{0%{opacity:0;transform:translateX(-30%)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateX(105%)}}
.mal{grid-column:1/-1;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:6px}
.mal span{font:600 12px var(--mono);padding:4px 10px;border-radius:6px;background:var(--ink);color:#fff}
@media (max-width:600px){.panel{padding:14px}.msg .who{margin-bottom:10px}.msg .av{width:36px;height:36px}.bubble{font-size:13.5px;padding:9px 12px;margin-bottom:7px}.file{padding:7px 10px;font-size:12px}.lane{height:180px}.loot{font-size:11px}}
''',
stage=r'''<div class="win"><div class="bar"><i></i><i></i><i></i><span id="bar1">Messages</span></div>
  <div class="panel msg" id="pA">
    <div class="who"><div class="av">AM</div><div><b>Alex Morgan</b><span>Talent Partner · Blockvault Labs</span></div></div>
    <div class="bubble fade-in" id="b1">Hi Jane, loved your React work on GitHub. We have a remote senior role, £140k. Interested?</div>
    <div class="bubble me fade-in" id="b2">Yes, sounds great!</div>
    <div class="bubble fade-in" id="b3">Brilliant. First, a short take-home test. Please run it locally today. <br><span class="pill">github.com/blockvault-labs/take-home</span></div>
  </div>
  <div class="panel repo" id="pB">
    <h4>blockvault-labs / <span>take-home</span></h4>
    <div class="file"><i class="d"></i>src</div>
    <div class="file"><i class="f"></i>README.md</div>
    <div class="file"><i class="f"></i>package.json</div>
    <div class="file bad fade-in" id="bad"><i class="f" style="border-color:#e5484d"></i>scripts/setup.js · runs on install</div>
    <div class="readme"><b>To start:</b> npm install, then npm start. Send us a screen recording when done.</div>
  </div>
  <div class="panel term" id="pC">
    <div class="ln"><span class="p">jane@laptop</span> ~/take-home $ npm install</div>
    <div class="ln dim">&gt; take-home@1.0.0 postinstall</div>
    <div class="ln dim">&gt; node scripts/setup.js</div>
    <div class="ln">added 214 packages in 6s</div>
    <div class="ln r">  ↳ quietly downloading a second program…</div>
    <div class="ln r">  ↳ reading saved browser logins…</div>
    <div class="ln r">  ↳ reading crypto wallets and SSH keys…</div>
    <div class="ln"><span class="p">jane@laptop</span> ~/take-home $ <span class="cursor"></span></div>
  </div>
  <div class="panel exfil" id="pD">
    <div class="node you"><div class="box"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.6"><rect x="3" y="5" width="18" height="11" rx="1.5"/><path d="M1.5 19h21"/></svg></div>Your laptop</div>
    <div class="lane">
      <div class="loot" style="top:18px;animation-delay:0s">🔑 Saved passwords</div>
      <div class="loot" style="top:62px;animation-delay:.5s">🍪 Login sessions</div>
      <div class="loot" style="top:106px;animation-delay:1s">◎ Crypto wallet</div>
      <div class="loot" style="top:150px;animation-delay:1.5s">⌘ SSH keys</div>
    </div>
    <div class="node them"><div class="box"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><rect x="4" y="3" width="16" height="7" rx="1.5"/><rect x="4" y="14" width="16" height="7" rx="1.5"/><circle cx="8" cy="6.5" r=".8" fill="#fff"/><circle cx="8" cy="17.5" r=".8" fill="#fff"/></svg></div>Their server</div>
    <div class="mal"><span>BeaverTail steals</span><span>InvisibleFerret stays in</span></div>
  </div>
</div>''',
text=r'''
<section><h2>Why you</h2><div class="why"><span class="tag">Open to work</span><span class="tag">Senior JavaScript</span><span class="tag">Public GitHub</span><span class="tag">Email in commits</span></div></section>
<section><h2>How it works</h2><ol>
<li>A friendly recruiter offers a well-paid remote role.</li>
<li>They send a coding test as a repo and ask you to run it today.</li>
<li>Running <code>npm install</code> or opening it in VS Code runs hidden code.</li>
<li>It steals saved logins and wallets, then leaves a backdoor.</li></ol></section>
<section><h2>Signs</h2><ul>
<li>Pay looks too good and the process is very fast.</li>
<li>The test must run on your own machine, today.</li>
<li>The repo has install scripts or odd files in <code>.vscode</code>.</li></ul></section>
<section><h2>What to do</h2><ul class="do">
<li>Run tests in a throwaway cloud box or container, never your laptop.</li>
<li>Read <code>package.json</code> scripts before you install.</li>
<li>Check the recruiter on the company's own careers page.</li></ul></section>
<section class="refs"><h2>Read more</h2><ul>
<li><a href="https://www.microsoft.com/en-us/security/blog/2026/03/11/contagious-interview-malware-delivered-through-fake-developer-job-interviews/">Microsoft: Contagious Interview</a></li>
<li><a href="https://unit42.paloaltonetworks.com/north-korean-threat-actors-lure-tech-job-seekers-as-fake-recruiters/">Unit 42: fake recruiters</a></li>
<li><a href="https://www.atlassian.com/blog/how-we-build/disrupting-contagious-interview">Atlassian: disrupting it</a></li></ul></section>''',
prev='<a href="02-progress.html"><span>Back to</span>Search results</a>',
nextlink='<a href="03-pattern-session-hijack.html" style="text-align:right"><span>Next pattern</span>Stolen login sessions →</a>',
js=r'''
const $=id=>document.getElementById(id);
const panels=['pA','pB','pC','pD'];
function show(id){ panels.forEach(p=>$(p).classList.toggle('show',p===id)); }
function reset(){ show(null); document.querySelectorAll('.fade-in,.ln').forEach(n=>n.classList.remove('on')); $('pD').classList.remove('go'); }
const later=(fn,ms,now)=> now ? fn() : setTimeout(fn,ms);
player([
 ['A recruiter messages you about a dream job.',4200,now=>{ show('pA'); $('bar1').textContent='Messages'; later(()=>$('b1').classList.add('on'),200,now); later(()=>$('b2').classList.add('on'),1300,now); later(()=>$('b3').classList.add('on'),2300,now); }],
 ['They send a coding test to run on your laptop.',3600,now=>{ show('pB'); $('bar1').textContent='github.com/blockvault-labs/take-home'; later(()=>$('bad').classList.add('on'),1500,now); }],
 ['You type npm install. Hidden code runs too.',4600,now=>{ show('pC'); $('bar1').textContent='Terminal'; document.querySelectorAll('#pC .ln').forEach((l,i)=>later(()=>l.classList.add('on'),300+i*480,now)); }],
 ['Your logins and wallets go to their server.',4200,now=>{ show('pD'); $('bar1').textContent='What leaves your laptop'; $('pD').classList.remove('go'); void $('pD').offsetWidth; $('pD').classList.add('go'); if(now) document.querySelectorAll('.loot').forEach(l=>{l.style.animation='none';l.style.opacity=1;l.style.left='8%';}); }]
], reset);
''')

# ------------------------------------------------------------------ 2. Sign-up bombing
build('03-pattern-signup-bombing.html', n=3, title='Sign-up bombing',
tags='<span class="tag warn">Medium match · 64%</span><span class="tag">Also called: email bombing</span>',
lede='Hundreds of welcome emails <span class="g">arrive at once. One of them</span> is real.',
css=COMMON_CSS + r'''
.mail{position:absolute;inset:30px 0 0 0;display:grid;grid-template-columns:150px 1fr}
.side{border-right:1px solid var(--line);padding:14px 10px;font-size:13px}
.side div{display:flex;justify-content:space-between;padding:7px 10px;border-radius:8px;color:var(--muted)}
.side .in{background:var(--info-bg);color:#0b4fc4;font-weight:700}
.side .count{font-variant-numeric:tabular-nums}
.list{position:relative;overflow:hidden}
.row{display:grid;grid-template-columns:20px 130px 1fr 44px;gap:10px;align-items:center;height:38px;padding:0 14px;border-bottom:1px solid var(--line);font-size:13px;background:#fff;animation:drop .25s ease-out}
.row .dot{width:8px;height:8px;border-radius:50%;background:var(--info)}
.row b{font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)}
.row span em{font-style:normal;color:var(--ink)}
.row time{font-size:11.5px;color:var(--faint);text-align:right}
.row.real{background:var(--danger-bg)} .row.real .dot{background:var(--danger)} .row.real span em{color:#b42318;font-weight:600}
@keyframes drop{from{transform:translateY(-38px)}to{transform:none}}
.found{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:12px;background:var(--ink);color:#fff;font-size:14px;font-weight:600;white-space:nowrap;opacity:0;transition:opacity .4s}
.found.on{opacity:1}
.pinned{position:absolute;left:0;right:0;top:0;z-index:2;box-shadow:0 0 0 2px var(--danger),0 8px 30px rgba(229,72,77,.25);opacity:0;transition:opacity .4s}
.pinned.on{opacity:1}
@media (max-width:600px){.mail{grid-template-columns:1fr}.side{display:none}.row{grid-template-columns:14px 92px 1fr}.row time{display:none}}
''',
stage=r'''<div class="win"><div class="bar"><i></i><i></i><i></i><span>Inbox (<b id="cnt2">1</b>) · jane@hibp-integration-tests.com</span></div>
  <div class="mail">
    <div class="side"><div class="in">Inbox <span class="count" id="cnt">2</span></div><div>Starred</div><div>Sent</div><div>Spam <span class="count" id="spam">0</span></div></div>
    <div class="list" id="list">
      <div class="row real pinned" id="pin"><i class="dot"></i><b>ShopLane</b><span><em>Order confirmed: MacBook Pro, £2,399</em> · not you? Act now</span><time>09:02</time></div>
    </div>
  </div>
  <div class="found" id="found">🔎 The real alert is now on page 9</div>
</div>''',
text=r'''
<section><h2>Why you</h2><div class="why"><span class="tag">Public email</span><span class="tag">Shopping accounts in breaches</span><span class="tag">Saved card likely</span></div></section>
<section><h2>How it works</h2><ol>
<li>Someone logs in to your account with a leaked password.</li>
<li>They buy something or change your details. You get an alert.</li>
<li>Seconds later, a bot signs your email up to hundreds of sites.</li>
<li>The alert is buried. By the time you find it, it's too late.</li></ol></section>
<section><h2>Signs</h2><ul>
<li>A sudden flood of “Welcome” and “Confirm your email” messages.</li>
<li>They are from real sites you never visited.</li></ul></section>
<section><h2>What to do</h2><ul class="do">
<li>Don't just delete. Search the flood for orders, logins and password resets.</li>
<li>Check your bank and shopping accounts straight away.</li>
<li>Change the leaked passwords and turn on two-step sign-in.</li></ul></section>''',
prev='<a href="03-pattern-session-hijack.html"><span>Previous</span>← Stolen login sessions</a>',
nextlink='<a href="04-report.html" style="text-align:right"><span>Finish</span>Your report →</a>',
js=r'''
const $=id=>document.getElementById(id);
const SITES=['Pixelbox','Notewise','Hikehub','Fabrica','Tunefold','Greenbasket','Loopline','Quillr','Snapmint','Brightpost','Cookloft','Wavely','Stackpad','Petpals','Driftwell','Mapnest','Glowkit','Readly','Fitforge','Craftory'];
const SUBJ=['Welcome! Please confirm your email','Confirm your subscription','Verify your account','Thanks for signing up','Your newsletter starts today','One more step to finish'];
let n=2, iv=null, k=0;
const list=$('list');
function row(real){
  const r=document.createElement('div'); r.className='row'+(real?' real':'');
  const s=SITES[k%SITES.length], m=SUBJ[(k*7)%SUBJ.length]; k++;
  r.innerHTML= real ? $('pin').innerHTML : '<i class="dot"></i><b>'+s+'</b><span><em>'+m+'</em> · '+s.toLowerCase()+'.com</span><time>09:0'+Math.min(9,2+Math.floor(k/30))+'</time>';
  list.insertBefore(r, list.children[1] || null);
  while (list.children.length>16) list.lastChild.remove();
  n++; $('cnt').textContent=n.toLocaleString('en-GB'); $('cnt2').textContent=$('cnt').textContent;
}
function reset(){ clearInterval(iv); list.querySelectorAll('.row:not(#pin)').forEach(r=>r.remove()); n=1; k=0; $('cnt').textContent='1'; $('pin').classList.remove('on'); $('found').classList.remove('on'); $('spam').textContent='0'; }
function flood(ms, total, now){ if(now){ for(let i=0;i<14;i++) row(); n+=total-14; $('cnt').textContent=n.toLocaleString('en-GB'); return; } let c=0; clearInterval(iv); iv=setInterval(()=>{ row(); if(++c>=total) clearInterval(iv); }, ms); }
player([
 ['09:02. An order alert arrives. You didn\'t buy anything.',3200,now=>{ row(true); $('cnt').textContent='2'; }],
 ['09:03. Then the flood starts.',4200,now=>flood(110,36,now)],
 ['Hundreds of sites send a welcome email. All real, all automatic.',4600,now=>{ flood(45,90,now); if(!now) setTimeout(()=>{ n+=1100; $('cnt').textContent=n.toLocaleString('en-GB'); $('cnt2').textContent=$('cnt').textContent; $('spam').textContent='212'; },3800); else { n+=1100; $('cnt').textContent=n.toLocaleString('en-GB'); $('cnt2').textContent=$('cnt').textContent; $('spam').textContent='212'; } }],
 ['That is the point. The real alert is buried.',4400,now=>{ $('found').classList.add('on'); $('pin').classList.add('on'); }]
], reset);
''')

# ------------------------------------------------------------------ 3. Session hijack (infostealer)
build('03-pattern-session-hijack.html', n=2, title='Stolen login sessions',
tags='<span class="tag danger">High match · 81%</span><span class="tag">Also called: session hijack, pass-the-cookie</span>',
lede='They don\'t need your password. <span class="g">They copied the bit that says</span> you already logged in.',
css=COMMON_CSS + r'''
.duo{position:absolute;inset:18px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.duo .win{position:relative;inset:auto}
.duo .win .bar{font-size:11.5px}
.body{padding:16px;display:flex;flex-direction:column;gap:10px;height:calc(100% - 30px)}
.lbl2{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.jar{display:flex;flex-wrap:wrap;gap:6px}
.ck{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:5px 9px;border-radius:999px;background:var(--surface);border:1px solid var(--line);transition:opacity .4s}
.ck.taken{opacity:.35}
.ck i{width:10px;height:10px;border-radius:50%;background:#d6a15a;box-shadow:inset -2px -2px 0 rgba(0,0,0,.15)}
.bug{display:flex;gap:8px;align-items:center;font-size:12.5px;padding:8px 10px;border-radius:10px;background:var(--danger-bg);color:#b42318;font-weight:600;opacity:0;transition:opacity .4s}
.bug.on{opacity:1}
.login{border:1px solid var(--line);border-radius:10px;padding:12px;display:grid;gap:8px}
.inp{height:30px;border-radius:7px;border:1px solid var(--line);background:var(--surface);display:flex;align-items:center;padding:0 10px;font-size:12px;color:var(--faint);position:relative}
.inp.x::after{content:"Not needed";position:absolute;right:8px;font-size:11px;font-weight:700;color:#b42318;opacity:0;transition:opacity .3s}
.inp.x.on{text-decoration:line-through}
.inp.x.on::after{opacity:1}
.in-as{display:none;border-radius:10px;padding:14px;background:var(--ok-bg);color:#1a5c38;font-size:14px;font-weight:600}
.in-as.on{display:block;animation:pop2 .35s}
@keyframes pop2{from{transform:scale(.94);opacity:0}to{transform:none;opacity:1}}
.fly{position:absolute;z-index:5;top:42%;left:28%;display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;padding:6px 10px;border-radius:999px;background:var(--ink);color:#fff;opacity:0;pointer-events:none}
.fly.go{animation:cross 1.8s ease-in-out forwards}
.fly i{width:10px;height:10px;border-radius:50%;background:#d6a15a}
@keyframes cross{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translate(150%,-10px)}}
.them .bar{background:#18181b;color:#a1a1aa;border-color:#27272a}
@media (max-width:600px){.duo{grid-template-columns:1fr;grid-template-rows:1fr 1fr;inset:10px;gap:8px}.body{padding:10px;gap:6px}.stage{aspect-ratio:3/4}.fly{top:46%;left:40%}@keyframes cross{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translate(0,120%)}}}
''',
stage=r'''<div class="duo">
  <div class="win"><div class="bar"><i></i><i></i><i></i><span>Your laptop · browser</span></div>
    <div class="body">
      <div class="lbl2">Signed in to</div>
      <div class="jar"><span class="ck" id="c1"><i></i>Email</span><span class="ck" id="c2"><i></i>GitHub</span><span class="ck" id="c3"><i></i>Slack</span><span class="ck" id="c4"><i></i>Bank</span><span class="ck" id="c5"><i></i>Shop</span></div>
      <div class="bug" id="bug">⚠ A cracked app you installed is copying these</div>
    </div>
  </div>
  <div class="win them"><div class="bar"><i></i><i></i><i></i><span>Their browser, anywhere</span></div>
    <div class="body">
      <div class="login" id="login">
        <div class="lbl2">github.com · sign in</div>
        <div class="inp">jane@hibp-integration-tests.com</div>
        <div class="inp x" id="pw">Password ••••••••</div>
        <div class="inp x" id="tfa">Two-step code ••••••</div>
      </div>
      <div class="in-as" id="inas">✓ Signed in as Jane<br><span style="font-weight:500;font-size:12.5px">No password. No code. No alert.</span></div>
    </div>
  </div>
</div>
<div class="fly" id="fly"><i></i>GitHub session</div>''',
text=r'''
<section><h2>Why you</h2><div class="why"><span class="tag danger">Infostealer log found</span><span class="tag">23 saved logins</span><span class="tag">Work tools on same browser</span></div></section>
<section><h2>How it works</h2><ol>
<li>Malware on your computer copies your browser's saved sessions.</li>
<li>Those sessions get sold in a “stealer log”.</li>
<li>A buyer loads them and opens your accounts as you.</li>
<li>Password and two-step codes are skipped. You are already “signed in”.</li></ol></section>
<section><h2>Signs</h2><ul>
<li>Your email shows up in an infostealer check, like this one.</li>
<li>New devices or sessions in account settings you don't recognise.</li></ul></section>
<section><h2>What to do</h2><ul class="do">
<li>Clean or reset the infected computer first.</li>
<li>Sign out of all sessions everywhere, then change passwords.</li>
<li>Use passkeys where you can. Tell work if work tools were on it.</li></ul></section>
<section class="refs"><h2>Check yourself</h2><ul><li><a href="https://www.hudsonrock.com/free-tools">Hudson Rock free infostealer check</a></li></ul></section>''',
prev='<a href="03-pattern-fake-recruiter.html"><span>Previous</span>← Fake recruiter coding test</a>',
nextlink='<a href="03-pattern-signup-bombing.html" style="text-align:right"><span>Next pattern</span>Sign-up bombing →</a>',
js=r'''
const $=id=>document.getElementById(id);
function reset(){ ['c1','c2','c3','c4','c5'].forEach(c=>$(c).classList.remove('taken')); ['bug','pw','tfa','inas'].forEach(c=>$(c).classList.remove('on')); $('login').style.display=''; $('fly').classList.remove('go'); }
const later=(fn,ms,now)=> now ? fn() : setTimeout(fn,ms);
player([
 ['Your browser remembers that you are signed in.',3000,null],
 ['An infostealer copies those sessions.',3600,now=>{ $('bug').classList.add('on'); ['c1','c2','c3','c4','c5'].forEach((c,i)=>later(()=>$(c).classList.add('taken'),600+i*350,now)); }],
 ['Someone else loads one into their browser.',3400,now=>{ if(!now){ $('fly').classList.remove('go'); void $('fly').offsetWidth; $('fly').classList.add('go'); } later(()=>{$('pw').classList.add('on');},1600,now); later(()=>{$('tfa').classList.add('on');},2200,now); }],
 ['They are in. No password, no code, no alert.',4200,now=>{ $('login').style.display='none'; $('inas').classList.add('on'); }]
], reset);
''')
