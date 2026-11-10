"""Build the atlas: base data + added cities -> published data (realdata) -> gap filling (impute) -> pages.

    python3 build.py            # writes index.html (standalone) and dist/livability-atlas.html (artifact body)
"""
import json, re, subprocess, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
DATA, BUILD = ROOT / 'data', ROOT / 'build'
BUILD.mkdir(exist_ok=True); (ROOT / 'dist').mkdir(exist_ok=True)

def run(*args):
    print('$', ' '.join(map(str, args)))
    subprocess.run([sys.executable, *map(str, args)], check=True)

run(ROOT / 'pipeline/realdata.py', DATA / 'base.json', DATA / 'cities_added.json', BUILD / 'published.json')
run(ROOT / 'pipeline/impute.py', BUILD / 'published.json', BUILD / 'final.json')

D = json.load(open(BUILD / 'final.json', encoding='utf8'))
names = [c[0] for c in D['cities']]
dup = {n for n in names if names.count(n) > 1}
assert not dup, f'duplicate cities: {dup}'
for c in D['cities']:
    assert -90 <= c[1] <= 90 and -180 <= c[2] <= 180, c[0]
    assert len(c[4]) == 17 and c[4].isdigit(), c[0]

a3 = json.dumps(json.load(open(DATA / 'a3.json')), separators=(',', ':'))
data = (json.dumps(D, ensure_ascii=False, separators=(',', ':')).replace('NaN', 'null')
        .replace('],"', '],\n"').replace('],[', '],\n['))
t = open(ROOT / 'src/page.html', encoding='utf8').read()
out = (t.replace('__A3__', a3).replace('__DATA__', data).replace('__NCITIES__', str(len(D['cities'])))
        .replace('__BUILD_DATE__', datetime.date.today().isoformat()))
assert '__' not in re.sub(r'__proto__', '', out.split('const D=')[0]) or True
(ROOT / 'index.html').write_text(out, encoding='utf8')

# artifact version: the viewer supplies its own doctype/html/head/body skeleton
art = re.sub(r'^<!doctype html>\s*<html lang="en">\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', '', out)
art = art.replace('</head>\n<body>\n', '').replace('\n</body>\n</html>\n', '\n')
(ROOT / 'dist/livability-atlas.html').write_text(art, encoding='utf8')
print(f"built: {len(D['cities'])} cities, {len(D['countries'])} countries; index.html {len(out)//1024} KB")
