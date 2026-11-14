"""Getting around without a car from ITDP's Atlas of Sustainable City Transport: writes pipeline/sources/itdp.py.
Usage: python3 import_itdp.py DIR   (DIR holds atlas_cities_{pnrt,pns,pnpb,pncf,blockdensity}.csv, downloaded from atlas.itdp.org)
ITDP measures each GHSL urban centre (the whole built-up area, so one area can hold several atlas cities). Its files carry names,
not coordinates, so a city is matched by name and country: the area's first name, or one of the joint areas listed in SECOND_OK."""
import csv, json, sys, unicodedata, re, collections, glob, os, hashlib, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources.more_cities import WORLD, US_METROS
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'input') + '/'
base = json.load(open(H + 'base.json', encoding='utf8'))
num2name = {int(k): v[0] for k, v in base['countries'].items()}
city_cty = {c[0]: num2name.get(int(c[3]), '?') if str(c[3]).isdigit() else c[3] for c in base['cities']}
for r in json.load(open(H + 'cities_added.json', encoding='utf8')): city_cty.setdefault(r[0], num2name.get(int(r[3]), '?') if str(r[3]).isdigit() else r[3])
for n, v in WORLD.items(): city_cty.setdefault(n, v[0])
for n in US_METROS: city_cty.setdefault(n, 'United States')
city_cty['Singapore'] = 'Singapore'
norm = lambda s: re.sub(r'[^a-z ]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip()

CA = {'russian federation': 'russia', 'tanzania united republic of': 'tanzania', 'korea republic of': 'south korea', 'republic of korea': 'south korea', 'democratic republic of the congo': 'dr congo', 'republic of congo': 'congo brazzaville', 'palestine state of': 'palestine', 'republic of the congo': 'congo brazzaville', 'dominican rep': 'dominican republic', 'viet nam': 'vietnam',
      'iran islamic republic of': 'iran', 'turkiye': 'turkey', 'congo the democratic republic of the': 'dr congo', 'syrian arab republic': 'syria',
      'bolivia plurinational state of': 'bolivia', 'venezuela bolivarian republic of': 'venezuela', 'lao peoples democratic republic': 'laos',
      'moldova republic of': 'moldova', 'cote divoire': 'ivory coast', 'czechia': 'czech republic', 'taiwan province of china': 'taiwan',
      'united kingdom of great britain and northern ireland': 'united kingdom', 'netherlands kingdom of the': 'netherlands', 'hong kong': 'china'}
CN = lambda s: CA.get(norm(s), norm(s))
ALIAS = {'San José (Costa Rica)': 'san jose', 'Panama City': 'panama', 'Córdoba (Argentina)': 'cordoba', 'Quebec City': 'quebec',
         'Chittagong': 'chattogram', 'New York City': 'new york', 'Washington DC': 'washington', 'Hong Kong': 'hong kong'}
# cities that are a second name of a joint urban area (GHSL draws one built-up area around both); any other second-name hit is a different town
SECOND_OK = {'San Francisco', 'Taipei', 'Manila', 'Guangzhou', 'Foshan', 'Kyoto', 'La Paz', 'Vitória'}
D = sys.argv[1]
def load(f, col):
    p = glob.glob(os.path.join(D, f'*atlas_cities_{f}.csv'))[0]
    return p, {r['hdc']: float(r[col]) for r in csv.DictReader(open(p, encoding='utf-8-sig')) if r[col] not in ('', 'NA')}
rows = list(csv.DictReader(open(glob.glob(os.path.join(D, '*atlas_cities_pncf.csv'))[0], encoding='utf-8-sig')))
ITN = collections.defaultdict(list)
for r in rows:
    nm = re.sub(r'^The ', '', r['name']); nm = re.sub(r' area$', '', nm)
    for part in nm.split(' / '): ITN[norm(part)].append((r['hdc'], r['country'], r['name']))
match = {}
for c, ct in city_cty.items():
    key = ALIAS.get(c, norm(re.sub(r' [A-Z]{2}$', '', c)))
    first = lambda x: norm(re.sub(r' area$', '', re.sub(r'^The ', '', x[2])).split(' / ')[0]) == key
    cands = list({x[0]: x for x in ITN.get(key, []) if CN(x[1]) == CN(ct) and (first(x) or c in SECOND_OK)}.values())
    if len(cands) == 1: match[c] = cands[0]
COLS = (('pnrt', 'transit_pnrt_2025'), ('pns', 'walk_pns_2025'), ('pnpb', 'bike_pnpb_2025'), ('pncf', 'walk_pncf_2025'), ('blockdensity', 'city_blockdensity_2025'))
T = {f: load(f, col) for f, col in COLS}
ITDP = {}
for c, (hdc, _ct, area) in sorted(match.items()):
    v = [T[f][1].get(hdc) for f, _ in COLS]
    if None in v: continue
    ITDP[c] = tuple(round(100 * x, 1) for x in v[:4]) + (round(v[4], 1), area)
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]
files = ', '.join(f'{os.path.basename(T[f][0])} sha256 {sha(T[f][0])}' for f, _ in COLS)
out = f'''"""ITDP Atlas of Sustainable City Transport, 2025 values (https://atlas.itdp.org/). Higher is better for all five.
Made by pipeline/import_itdp.py on {datetime.date.today()}; edit the source files and re-run it rather than editing these numbers. Files: {files}.
city -> (% of people near rapid transport (metro, light rail, bus rapid transit), % within walking distance of both healthcare and schools,
         % within 300 m of a protected bike lane, % near a car-free place (park, plaza or pedestrian street), city blocks per km², ITDP's name for the urban area)
"""
ITDP = {{
''' + ''.join(f'    {k!r}: {v!r},\n' for k, v in ITDP.items()) + '}\n'
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sources', 'itdp.py'), 'w').write(out)
print(f'ITDP: {len(ITDP)} atlas cities matched')
