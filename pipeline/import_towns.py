"""US towns and the metro each is in, so the find box can find a town the atlas doesn't score on its own:

    python3 pipeline/import_towns.py        (needs the network; writes pipeline/input/us_towns.txt)
    python3 pipeline/write_towns.py         (build.py runs it too; writes data/towns.js)

Two files from the Census Bureau's ACS 2020-2024 5-year summary file (table-based), nothing estimated here:
  - acsdt5y2024-b01003.dat   total population of every geography. Its rows give
        160  a place (city, town, village, borough, census-designated place)
        155  the part of a place in each county (a place can cross county lines)
        060  a county subdivision (in New England and a few other states these towns are the real municipalities)
        322  each county with the metro or micro area it belongs to (2023 delineations)
  - Geos20245YR.txt          the name and state of each geography
A place goes with the county that holds most of its people, and through that county with its metro area. County
subdivisions are kept only in the states where they are towns people name as their home (TOWN_STATES).
Kept: places and towns with at least MIN_POP people that lie in a metropolitan or micropolitan area.
"""
import collections, io, pathlib, re, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'pipeline' / 'input' / 'us_towns.txt'
BASE = 'https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/'
DAT = BASE + 'data/5YRData/acsdt5y2024-b01003.dat'
GEOS = BASE + 'documentation/Geos20245YR.txt'
MIN_POP = 2500
TOWN_STATES = {'09', '23', '25', '33', '44', '50', '34', '36', '42', '26', '27', '55'}   # New England, NJ, NY, PA, MI, MN, WI
# the kind of place, written after its name ("Cupertino city", "Tysons CDP"); dropped for display
KIND = re.compile(r'\s+(city and borough|consolidated government|metropolitan government|unified government|urban county|'
                  r'charter township|city|town|township|village|borough|CDP|municipality|plantation|comunidad|zona urbana|'
                  r'location|gore|grant|purchase)$')
display = lambda full: KIND.sub('', re.sub(r'\s+\(balance\)$', '', full.split(',')[0].strip()))   # one kind word only: "Jersey City city" -> "Jersey City"


def get(url):
    print('get', url)
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'where-should-you-live atlas'}), timeout=300) as r:
        return r.read().decode('utf8', 'replace')


pop, county_part, cbsa_of_county = {}, collections.defaultdict(list), {}
for line in get(DAT).splitlines()[1:]:
    gid, est = line.split('|')[:2]
    if not est.lstrip('-').isdigit() or int(est) < 0:
        continue
    n, code = int(est), gid.split('US', 1)[-1]
    if gid.startswith('1600000US') or gid.startswith('0600000US'):
        pop[gid] = n
    elif gid.startswith('1550000US'):            # state 2, place 5, county 3
        county_part['1600000US' + code[:7]].append((n, code[:2] + code[7:10]))
    elif gid.startswith('322M700US'):            # state 2, cbsa 5, county 3
        cbsa_of_county[code[:2] + code[7:10]] = code[2:7]

names, lines = {}, get(GEOS).splitlines()
col = {k: i for i, k in enumerate(lines[0].split('|'))}
for line in lines[1:]:
    f = line.split('|')
    if len(f) > col['NAME'] and f[col['GEO_ID']] in pop:
        names[f[col['GEO_ID']]] = (f[col['NAME']], f[col['STUSAB']].upper())

rows = []
for gid, n in pop.items():
    if n < MIN_POP or gid not in names:
        continue
    full, st = names[gid]
    code = gid.split('US', 1)[1]
    if gid.startswith('06'):
        if code[:2] not in TOWN_STATES:
            continue
        county = code[:5]
    else:
        parts = county_part.get(gid)
        if not parts:
            continue
        county = max(parts)[1]
    cbsa = cbsa_of_county.get(county)
    name = display(full).strip()
    if not cbsa or not name or re.search(r'\d|unorganized|district|precinct', name, re.I):
        continue
    rows.append((name, st, n, cbsa, gid))

# a town that is both a place and a county subdivision (or two of either) under one name in one metro: keep the larger
best = {}
for r in rows:
    k = (r[0].lower(), r[1], r[3])
    if k not in best or r[2] > best[k][2]:
        best[k] = r
rows = sorted(best.values(), key=lambda r: (-r[2], r[0]))
OUT.write_text('# US places and towns with at least %d people, and the metro or micro area (CBSA code, 2023 delineations) each is in.\n'
               '# Census Bureau, ACS 2020-2024 5-year summary file: %s and %s. Made by pipeline/import_towns.py.\n'
               '# name | state | population | CBSA | Census GEO_ID\n' % (MIN_POP, DAT, GEOS)
               + ''.join('|'.join(map(str, r)) + '\n' for r in rows), encoding='utf8')
print(len(rows), 'towns;', sum(1 for r in rows if r[1] == 'CA'), 'in California')
