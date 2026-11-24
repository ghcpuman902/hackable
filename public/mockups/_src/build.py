import pathlib,re
src=pathlib.Path(__file__).parent; out=src.parent
base=(src/'base.css').read_text()
for f in sorted(src.glob('*.html')):
    t=f.read_text().replace('/*BASE*/',base)
    (out/f.name).write_text(t); print('built',f.name)
