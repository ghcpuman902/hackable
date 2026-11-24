# Builds _src/05-search-flow.html, reusing the chip CSS + JS from 01 so chip behaviour stays identical.
import pathlib
here = pathlib.Path(__file__).parent
one = (here/'01-input-chips.html').read_text()
field_css = one[one.index('/* ---- search field'):one.index('.hint{')]
chip_js = one[one.index('/*LUCIDE*/'):one.index('/* ============ Consent + submit')]
steps = ''.join(f'@keyframes s{x}{{0%,{x}%{{opacity:0;transform:translateY(4px)}}{x+4}%,90%{{opacity:1;transform:none}}97%,100%{{opacity:0}}}}\n' for x in range(5,90,5))
tpl = (here/'05-search-flow.tpl').read_text()
(here/'05-search-flow.html').write_text(tpl.replace('@@FIELDCSS@@', field_css).replace('@@CHIPJS@@', chip_js).replace('@@STEPS@@', steps))
print('wrote 05-search-flow.html')
