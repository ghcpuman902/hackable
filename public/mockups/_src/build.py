import pathlib,re
src=pathlib.Path(__file__).parent; out=src.parent
base=(src/'base.css').read_text()
import json
luc=json.loads((src/'lucide.json').read_text())
svg={k:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+v+'</svg>' for k,v in luc.items()}
for f in sorted(src.glob('*.html')):
    t=f.read_text().replace('/*BASE*/',base).replace('/*LUCIDE*/','const LUCIDE='+json.dumps(svg)+';')
    import re
    t=re.sub(r'\{\{i:([a-z-]+)\}\}',lambda m:svg[m.group(1)],t)
    (out/f.name).write_text(t); print('built',f.name)
