"""pipeline/input/us_towns.txt -> data/towns.js: US towns the find box knows, each with the atlas metro it is in.

    python3 pipeline/write_towns.py        (build.py runs it too)

The atlas scores whole US metros, not the towns inside them, so a town is not a place on the map. Typing one in the
find box (Cupertino, Tysons, Lexington MA) offers its metro (San Jose, Washington DC, Boston), and the metro's details
say which town led there. Kept: towns of at least MIN_POP people in a metro the atlas has. Left out: a town that is
already an atlas place under the same name in the same state (San Jose, East Hampton), so the find box doesn't offer
the same place twice. The page loads this file when the find box is first used.
Per town: [name, state, atlas metro]; largest first.
"""
import datetime, json, pathlib, re, sys, unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'pipeline'))
from sources.more_cities import CBSA, US_METROS

MIN_POP = 5000
# the Long Island places added on their own (pipeline/import_places.py) are in the New York metro
LONG_ISLAND = ['East Hampton', 'Southampton', 'Montauk', 'Riverhead', 'Stony Brook', 'Port Jefferson', 'Patchogue',
               'Huntington', 'Long Beach', 'Garden City']


def fold(s):
    return re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip()


t = (ROOT / 'data' / 'atlas.js').read_text(encoding='utf8')
A = json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))
us = [c[0] for c in A['cities'] if c[3] == '840']
metro_of = {code: n for n, code in CBSA.items() if n in us}                 # CBSA code -> atlas metro
state_of = {n: US_METROS[n][0] for n in us if n in US_METROS} | {n: 'NY' for n in LONG_ISLAND}
assert set(state_of) == set(us), sorted(set(us) - set(state_of))
own = {(fold(n), s) for n, s in state_of.items()}
# an atlas metro's own name ("New York City", "Washington DC") also stands for its main town
own |= {(fold(re.sub(r'\s+(City|DC|[A-Z]{2})$', '', n)), s) for n, s in state_of.items()}

towns, seen = [], set()
for line in (ROOT / 'pipeline' / 'input' / 'us_towns.txt').read_text(encoding='utf8').splitlines():
    if line.startswith('#') or not line.strip():
        continue
    name, st, pop, cbsa, _ = line.split('|')
    m = metro_of.get(cbsa)
    if int(pop) < MIN_POP or not m or (fold(name), st) in own or (fold(name), st) in seen:
        continue
    # a consolidated city-county under a longer name is the metro's own main town: Lexington-Fayette, Nashville-Davidson
    base = fold(re.sub(r'\s+(City|DC|[A-Z]{2})$', '', m))
    if st == state_of[m] and fold(name).startswith(base + ' ') and re.match(re.escape(m.split()[0]) + r'[-/]', name):
        continue
    seen.add((fold(name), st))
    towns.append([name, st, m])

out = ROOT / 'data' / 'towns.js'
out.write_text('// US towns the find box knows, each with the atlas metro it is in. Made by pipeline/write_towns.py from '
               'pipeline/input/us_towns.txt (Census Bureau, ACS 2020-2024): edit those, not this file.\n'
               'window.ATLAS_TOWNS=' + json.dumps({'asof': datetime.date.today().isoformat(), 't': towns},
                                                  ensure_ascii=False, separators=(',', ':')).replace('],[', '],\n[') + ';\n',
               encoding='utf8')
print(f'data/towns.js: {len(towns)} towns in {len({t[2] for t in towns})} metros, {out.stat().st_size // 1024} KB')
