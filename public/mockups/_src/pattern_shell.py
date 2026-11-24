# Generates the three 03-pattern-*.html sources from one shell so they stay consistent.
import pathlib
here = pathlib.Path(__file__).parent
SHELL = r'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>03 · Pattern: {title} · Mirror (mockup)</title>
<style>
/*BASE*/
/* ---- pattern page shell (same in all three) ---- */
main.wrap{{padding-top:40px}}
.head{{max-width:900px}}
.head .tags{{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}}
.head .lede{{font-size:clamp(30px,4.2vw,48px)}}
.layout{{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:28px;margin-top:32px;align-items:start}}
.stage-wrap{{position:sticky;top:60px}}
.stage{{position:relative;aspect-ratio:4/3;border-radius:18px;background:var(--surface);border:1px solid var(--line);overflow:hidden}}
.caption{{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-top:12px}}
.caption p{{margin:0;font-size:16px;font-weight:600;min-height:48px;display:flex;align-items:center}}
.dots{{display:flex;gap:6px;flex:none}}
.dots i{{width:8px;height:8px;border-radius:50%;background:var(--line);transition:background .3s,width .3s}}
.dots i.on{{background:var(--ink);width:20px;border-radius:4px}}
.replay{{border:0;background:none;color:var(--muted);font:600 13px var(--font);cursor:pointer;padding:4px}}
.text h2{{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 10px;font-weight:600}}
.text section{{padding:18px 0;border-top:1px solid var(--line)}}
.text section:first-child{{border-top:0;padding-top:0}}
.text ol,.text ul{{margin:0;padding-left:20px}} .text li{{margin:6px 0}}
.text p{{margin:0 0 8px}}
.why{{display:flex;flex-wrap:wrap;gap:6px}}
.do li::marker{{color:var(--ok);font-weight:700}}
.refs a{{color:var(--info);text-decoration:none;font-size:14px}} .refs li{{margin:4px 0}}
.next{{display:flex;justify-content:space-between;gap:12px;margin:36px 0 0;padding-top:20px;border-top:1px solid var(--line);font-size:15px}}
.next a{{text-decoration:none;font-weight:600}} .next a span{{display:block;font-size:12px;color:var(--muted);font-weight:500}}
@media (max-width:860px){{
  .layout{{grid-template-columns:1fr}} .stage-wrap{{position:static}}
  main.wrap{{padding-top:28px}}
  .stage{{aspect-ratio:1/1}}
}}
/* ---- stage-specific ---- */
{css}
</style>
</head>
<body>
<nav class="mock-nav" aria-label="Mockup navigation (not part of the app)">
  <span class="brand"><span class="brand-mark"></span>Mirror</span>
  <span><a href="02-progress.html">← 02</a> · <b>03 Pattern {n} of 3</b> · <a href="index.html">All</a></span>
</nav>
<main class="wrap">
  <header class="head">
    <div class="tags">{tags}</div>
    <h1 class="lede">{lede}</h1>
  </header>
  <div class="layout">
    <div class="stage-wrap">
      <div class="stage" id="stage" aria-hidden="true">{stage}</div>
      <div class="caption"><p id="cap"></p><div style="display:flex;align-items:center;gap:10px"><div class="dots" id="dots"></div><button class="replay" id="replay">Replay</button></div></div>
    </div>
    <article class="text">
      {text}
      <div class="next">{prev}{nextlink}</div>
    </article>
  </div>
  <p class="demo-note">Mockup · abstract illustration · people, companies and repos shown are made up</p>
</main>
<script>
/* Scene player shared by all pattern pages: each scene = [caption, durationMs, enterFn] */
function player(scenes, resetFn){{
  const cap=document.getElementById('cap'), dots=document.getElementById('dots');
  dots.innerHTML=scenes.map(()=>'<i></i>').join('');
  let i=0, t=null;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go(k){{
    clearTimeout(t); i=k;
    if (k===0) resetFn();
    const [c,d,fn]=scenes[k]; cap.textContent=c;
    [...dots.children].forEach((n,j)=>n.classList.toggle('on',j===k));
    fn && fn();
    t=setTimeout(()=>go((k+1)%scenes.length), reduce ? d*1.5 : d);
  }}
  document.getElementById('replay').onclick=()=>go(0);
  const at=+new URLSearchParams(location.search).get('scene'); // ?scene=3 for screenshots
  if (at) {{ resetFn(); for(let k=0;k<=at;k++) {{ scenes[k][2]&&scenes[k][2](true); }} cap.textContent=scenes[at][0]; [...dots.children].forEach((n,j)=>n.classList.toggle('on',j===at)); }}
  else go(0);
}}
{js}
</script>
</body>
</html>
'''
def build(fname, **kw):
    (here/fname).write_text(SHELL.format(**kw)); print('wrote', fname)
