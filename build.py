"""Rebuild the data file from the sources:

    python3 build.py      # pipeline/sources + pipeline/input  ->  data/atlas.js  (the only data file the page reads)

Steps: published numbers become 1-5 values (pipeline/score_published.py), then gaps are estimated (pipeline/fill_gaps.py).
Only needed when data changes; a change to the page (index.html, css/, js/) needs no build.
Needs Python 3 with numpy and scikit-learn. For the one-file claude.ai version, run bundle.py afterwards."""
import json, subprocess, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
INPUT, WORK = ROOT / 'pipeline' / 'input', ROOT / 'build'
WORK.mkdir(exist_ok=True)

def run(*args):
    print('$', ' '.join(map(str, args)))
    subprocess.run([sys.executable, *map(str, args)], check=True)

run(ROOT / 'pipeline/score_published.py', INPUT / 'base.json', INPUT / 'cities_added.json', WORK / 'published.json')
run(ROOT / 'pipeline/fill_gaps.py', WORK / 'published.json', WORK / 'final.json')

D = json.load(open(WORK / 'final.json', encoding='utf8'))
names = [c[0] for c in D['cities']]
dup = {n for n in names if names.count(n) > 1}
assert not dup, f'duplicate cities: {dup}'
for c in D['cities']:
    assert -90 <= c[1] <= 90 and -180 <= c[2] <= 180, c[0]
    assert len(c[4]) == 17 and c[4].isdigit(), c[0]
D['a3'] = json.load(open(INPUT / 'a3.json'))          # three-letter -> number country codes, for the map outlines
D['built'] = datetime.date.today().isoformat()

data = (json.dumps(D, ensure_ascii=False, separators=(',', ':')).replace('NaN', 'null')
        .replace('],"', '],\n"').replace('],[', '],\n['))
out = ROOT / 'data' / 'atlas.js'
out.parent.mkdir(exist_ok=True)
out.write_text('// Every number the page shows. Made by build.py from pipeline/sources and pipeline/input: edit those, not this file.\n'
               'window.ATLAS=' + data + ';\n', encoding='utf8')
print(f"built: {len(D['cities'])} cities, {len(D['countries'])} countries; data/atlas.js {out.stat().st_size // 1024} KB")
