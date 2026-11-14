"""Turn downloaded data files into source tables (pipeline/sources/air.py, honesty.py, work_hours.py, disaster_risk.py).

    python3 pipeline/import_tables.py --who FILE.xlsx --wb FILE.json --cpi FILE.xlsx --hours FILE.csv --wri FILE.csv

Only needed when one of the files is updated; build.py reads the tables this writes, never the files themselves.
Needs openpyxl (WHO, CPI). The list of atlas cities comes from data/atlas.js.

  --who  WHO Ambient Air Quality Database, update Jun 2026 (V8.0): who-ambient-air-quality-database-version-2026-v8.xlsx
  --wb   World Bank API dump of EN.ATM.PM25.MC.M3, PM2.5 mean annual exposure (country, modelled; IHME GBD)
  --cpi  Transparency International, CPI2025_Results.xlsx (sheet "CPI2025")
  --hours Our World in Data, annual-working-hours-per-worker.csv (Penn World Table 11.0, updated 5 Aug 2025)
  --wri  WorldRiskIndex trend file from HDX, worldriskindex-trend.csv (WorldRiskReport 2026), column W

City air quality: a city gets the WHO figure for the settlement with the same name (WHO writes "Name/ISO3"; US settlements
are metro areas, "Pittsburgh PA/USA"; Mexican ones carry the state, "Puebla Puebla/MEX"; local names such as "Munchen" are
in ALIAS below). A match is dropped if WHO's coordinates are more than 150 km away, which separates same-named places
(Portland OR and Portland ME). The value is the average of the latest three years measured from 2019 on; places measured
only before 2019 are left to the gap-filling model, like places WHO doesn't list."""
import argparse, csv, io, json, math, re, hashlib, unicodedata, collections, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'pipeline' / 'sources'

# local or official names WHO uses for atlas cities (checked one by one against WHO's coordinates)
ALIAS = {
    'Munich': ['munchen'], 'Vienna': ['wien'], 'Copenhagen': ['kobenhavn'], 'Prague': ['praha'], 'Warsaw': ['warszawa'],
    'Lisbon': ['lisboa'], 'Milan': ['milano'], 'Athens': ['athina'], 'Gothenburg': ['goteborg'], 'Bucharest': ['bucuresti'],
    'Brussels': ['bruxelles brussel'], 'Naples': ['napoli'], 'Heraklion': ['irakleio'], 'Nicosia': ['lefkosia'],
    'Marrakesh': ['marrakech'], 'Frankfurt': ['frankfurt am main'], 'Helsinki': ['helsinki helsingfors'],
    'Ho Chi Minh City': ['ho chi minh'], 'San José (Costa Rica)': ['san jose'], 'Tromsø': ['tromso'], "St. John's": ['st johns'],
    'Guatemala City': ['guatemala'], 'Bengaluru': ['bangalore'], 'Querétaro': ['santiago de queretaro'],
    'New York City': ['new york newark jersey city'], 'Washington DC': ['washington arlington alexandria'],
    'Oklahoma City': ['oklahoma'], 'Honolulu': ['urban honolulu'], 'Daytona Beach': ['deltona daytona beach ormond beach'],
    'Sarasota': ['north port sarasota bradenton'], 'Steubenville': ['weirton steubenville'], 'Lebanon NH': ['claremont lebanon'],
    'Athens GA': ['athens clarke county'], 'San Juan': ['san juan carolina caguas'], 'Pretoria': ['tshwane'],
    'Bloemfontein': ['mangaung metropolitan'], 'Durban': ['ethekwini'], 'Santo Domingo': ['distrito nacional'],
    'Jakarta': ['dki jakarta'], 'Riyadh': ['riyadh region'], 'Kuwait City': ['al dasma'], 'Sarajevo': ['kobilja glava'],
    'Denpasar': ['bali'], 'Palembang': ['south sumatera'], 'Hat Yai': ['songkhla'], 'Baguio': ['baguio benguet'],
    'Mexico City': ['* ciudad de mexico'],   # WHO lists the city's boroughs ("Coyoacan Ciudad de Mexico"): averaged
}
# WHO suffixes that only add a region or "greater"
DROP_TAIL = [['greater', 'city']]
US_ST = set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA '
            'RI SC SD TN TX UT VT VA WA WV WI WY DC PR'.lower().split())
MX_ST = ['aguascalientes', 'baja california sur', 'baja california', 'campeche', 'chiapas', 'chihuahua', 'ciudad de mexico',
         'coahuila', 'colima', 'durango', 'guanajuato', 'guerrero', 'hidalgo', 'jalisco', 'mexico', 'michoacan', 'morelos',
         'nayarit', 'nuevo leon', 'oaxaca', 'puebla', 'queretaro', 'quintana roo', 'san luis potosi', 'sinaloa', 'sonora',
         'tabasco', 'tamaulipas', 'tlaxcala', 'veracruz', 'yucatan', 'zacatecas']
MAX_KM, FIRST_YEAR, YEARS = 150, 2019, 3
CITY_ISO3 = {'Singapore': 'SGP'}   # a city-state with no country entry in the atlas


def toks(s):
    return re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).split()


def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


def num(x):
    try: return float(x)
    except (TypeError, ValueError): return None


def dist(a, b):
    p = math.pi / 180; x = (b[1] - a[1]) * p * math.cos((a[0] + b[0]) / 2 * p); y = (b[0] - a[0]) * p
    return 6371 * math.hypot(x, y)


def who_rows(path):
    """The workbook holds one CSV line per row, split into extra cells wherever the line had a comma: put them back together."""
    import openpyxl
    wb = openpyxl.load_workbook(path, read_only=True); lines = []
    for r in wb.worksheets[0].iter_rows(values_only=True):
        c = list(r)
        while c and c[-1] is None: c.pop()
        if c: lines.append(','.join('' if x is None else str(x) for x in c))
    rows = list(csv.DictReader(io.StringIO('\n'.join(lines))))
    assert all(None not in r and len(r) == 21 for r in rows), 'WHO rows did not parse into 21 columns'
    return rows, wb.sheetnames[0]


def who_key(name, iso3):
    """WHO settlement name -> (tokens, state codes): drops "/ISO3", a US metro's state codes, a Mexican state, "Greater City"."""
    t = toks(name.split('/')[0]); states = []
    if iso3 in ('USA', 'PRI'):
        while t and t[-1] in US_ST: states.append(t.pop())
    if iso3 == 'MEX':
        for st in MX_ST:
            s = st.split()
            if len(t) > len(s) and t[-len(s):] == s: t = t[:-len(s)]; break
    for tail in DROP_TAIL:
        if len(t) > len(tail) and t[-len(tail):] == tail: t = t[:-len(tail)]
    return t, states


def air(who_path, cities, a3):
    rows, sheet = who_rows(who_path)
    S = collections.defaultdict(lambda: {'y': collections.defaultdict(list), 'll': []})
    for r in rows:
        v, y = num(r['pm25_concentration']), num(r['year'])
        if v is None or y is None or y < FIRST_YEAR: continue
        S[(r['iso3'], r['city'])]['y'][int(y)].append(v)
        la, lo = num(r['latitude']), num(r['longitude'])
        if la is not None and lo is not None: S[(r['iso3'], r['city'])]['ll'].append((la, lo))
    byiso = collections.defaultdict(list)
    for (i3, nm), s in S.items(): byiso[i3].append((nm, who_key(nm, i3), s))
    out, dropped = {}, []
    for name, la, lo, iso, name_es in cities:
        i3 = CITY_ISO3.get(name) or a3.get(int(iso))
        t = toks(name); st = []
        if i3 in ('USA', 'PRI') and len(t) > 1 and t[-1] in US_ST: st = [t.pop()]   # "Albany GA"
        keys = [t] + [toks(a) for a in ALIAS.get(name, []) if not a.startswith('*')]
        suffix = [toks(a[2:]) for a in ALIAS.get(name, []) if a.startswith('*')]
        hits = []
        for nm, (wt, wst), s in byiso.get(i3, []):
            if st and st[0] not in wst: continue
            same = any(wt == k or wt == ['greater'] + k for k in keys) or \
                   (i3 in ('USA', 'PRI') and any(wt[:len(k)] == k for k in keys)) or \
                   any(len(raw) > len(k) and raw[-len(k):] == k for k in suffix for raw in [toks(nm.split('/')[0])])
            if not same: continue
            d = min((dist((la, lo), p) for p in s['ll']), default=0.0)
            if d > MAX_KM: dropped.append((name, nm, round(d))); continue
            hits.append((nm, d, s))
        if not hits: continue
        if not suffix:   # one settlement: the exact name before "Greater ...", then the nearest
            hits.sort(key=lambda h: (toks(h[0].split('/')[0])[:1] == ['greater'], h[1])); hits = hits[:1]
        years = collections.defaultdict(list)
        for nm, d, s in hits:
            for y, vs in s['y'].items(): years[y].append(sum(vs) / len(vs))
        last = sorted(years)[-YEARS:]
        val = sum(sum(years[y]) / len(years[y]) for y in last) / len(last)
        label = hits[0][0] if len(hits) == 1 else f'{len(hits)} boroughs'
        out[name] = (round(val, 1), f'{last[0]}–{last[-1]}' if len(last) > 1 else str(last[0]), label)
    return out, dropped, sheet


def wb_pm25(path):
    d = json.load(open(path, encoding='utf8'))
    meta, rows = d[0], d[1]
    best = {}
    for r in rows:
        if r['value'] is None or not r['countryiso3code']: continue
        y = int(r['date']); k = r['countryiso3code']
        if k not in best or y > best[k][1]: best[k] = (round(r['value'], 1), y)
    return best, meta.get('lastupdated')


def cpi(path):
    import openpyxl
    ws = openpyxl.load_workbook(path, read_only=True, data_only=True)['CPI2025']
    rows = list(ws.iter_rows(values_only=True))
    h = list(rows[3]); i_iso, i_s = h.index('ISO3'), h.index('CPI 2025 score')
    assert h[0] == 'Country / Territory' and h[i_s] == 'CPI 2025 score'
    return {r[i_iso]: int(r[i_s]) for r in rows[4:] if r[i_iso] and r[i_s] is not None}


def owid_hours(path):
    best = {}
    for r in csv.DictReader(open(path, encoding='utf8')):
        k = r['Code']
        if not k or k.startswith('OWID'): continue
        y = int(r['Year'])
        if y >= 2015 and (k not in best or y > best[k][1]): best[k] = (round(float(r['Working hours per worker'])), y)
    return best


def wri(path):
    rows = list(csv.DictReader(open(path, encoding='utf8')))
    y = max(int(r['Year']) for r in rows)
    return {r['ISO3.Code']: round(float(r['W']), 2) for r in rows if int(r['Year']) == y}, y


def table(d, per=6):
    items = [f'{k!r}: {v!r}' for k, v in sorted(d.items())]
    return '{\n    ' + ',\n    '.join(', '.join(items[i:i + per]) for i in range(0, len(items), per)) + '}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--who'); ap.add_argument('--wb'); ap.add_argument('--cpi'); ap.add_argument('--hours'); ap.add_argument('--wri')
    a = ap.parse_args()
    t = (ROOT / 'data' / 'atlas.js').read_text(encoding='utf8'); D = json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))
    a3 = {}
    for k, v in D['a3'].items(): a3.setdefault(v, k)   # number -> standard code (the file also lists map codes such as SDS)
    today = datetime.date.today().isoformat()
    if a.who and a.wb:
        city, dropped, sheet = air(a.who, [(c[0], c[1], c[2], c[3], c[8]) for c in D['cities']], a3)
        ctry, upd = wb_pm25(a.wb)
        ctry = {k: v for k, v in ctry.items() if k in set(a3.values()) | {'XKX'}}   # countries only, not regional aggregates
        (OUT / 'air.py').write_text(f'''"""Clean air: fine particles (PM2.5), annual mean in micrograms per cubic metre. Lower is cleaner; the WHO guideline is 5.
Made by pipeline/import_tables.py on {today}; edit the source files and re-run it rather than editing these numbers.

AIR_CITY: WHO Ambient Air Quality Database, update Jun 2026 (V8.0), sheet {sheet}, sha256 {sha(a.who)[:16]}.
  Ground monitors. city -> (average of the latest three years from {FIRST_YEAR} on, years, the WHO settlement used).
  https://www.who.int/publications/m/item/who-ambient-air-quality-database-(update-jun-2026)
AIR_COUNTRY: World Bank WDI EN.ATM.PM25.MC.M3, PM2.5 mean annual exposure (population-weighted, modelled by IHME's Global
  Burden of Disease), API dump last updated {upd}, sha256 {sha(a.wb)[:16]}. ISO3 -> (value, year).
  https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3
Not matched (same name, WHO coordinates over {MAX_KM} km away): {dropped}"""
AIR_CITY = {table(city, 3)}
AIR_COUNTRY = {table(ctry)}
''', encoding='utf8')
        print(f'air: {len(city)} of {len(D["cities"])} cities, {len(ctry)} countries; dropped {dropped}')
    if a.cpi:
        c = cpi(a.cpi)
        (OUT / 'honesty.py').write_text(f'''"""Honest institutions: Transparency International Corruption Perceptions Index 2025 (published 10 Feb 2026).
0 = highly corrupt, 100 = very clean; perceptions of public-sector corruption by experts and business people.
Made by pipeline/import_tables.py on {today} from CPI2025_Results.xlsx, sheet CPI2025, sha256 {sha(a.cpi)[:16]}.
https://www.transparency.org/en/cpi/2025   ISO3 -> score."""
CPI = {table(c, 10)}
''', encoding='utf8')
        print(f'cpi: {len(c)} countries')
    if a.hours:
        p = owid_hours(a.hours)
        (OUT / 'work_hours.py').write_text(f'''"""Time off: average annual hours actually worked per person in work, Penn World Table 11.0 (variable avh), as published
by Our World in Data ("annual working hours per worker", updated 5 Aug 2025). Fewer hours means more time off.
Latest year per country, 2015 or later. Made by pipeline/import_tables.py on {today} from annual-working-hours-per-worker.csv,
sha256 {sha(a.hours)[:16]}.  https://ourworldindata.org/grapher/annual-working-hours-per-worker   ISO3 -> (hours, year)."""
HOURS = {table(p, 6)}
''', encoding='utf8')
        print(f'hours: {len(p)} countries')
    if a.wri:
        w, y = wri(a.wri)
        (OUT / 'disaster_risk.py').write_text(f'''"""Low disaster risk: WorldRiskIndex {y} (WorldRiskReport, Bündnis Entwicklung Hilft and IFHV Ruhr University Bochum),
column W: exposure to earthquakes, tsunamis, coastal and river floods, cyclones, droughts and sea-level rise, combined with
how vulnerable society is. 0 = lowest risk; the highest country scores about 47. A national figure.
Made by pipeline/import_tables.py on {today} from worldriskindex-trend.csv (HDX), sha256 {sha(a.wri)[:16]}.
https://data.humdata.org/dataset/worldriskindex   ISO3 -> W."""
WRI_YEAR = {y}
WRI = {table(w, 8)}
''', encoding='utf8')
        print(f'wri: {len(w)} countries, {y}')

if __name__ == '__main__':
    main()
