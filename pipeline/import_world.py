"""Country tables from three downloads: writes pipeline/sources/world_updates.py.
Usage: python3 import_world.py --fh-cl civil-liberties-score-fh.csv --fh-pr political-rights-score-fh.csv
                               --unodc data_cts_intentional_homicide.xlsx --ilo HOW_TEMP_SEX_NB_A.csv
- Freedom House, Freedom in the World 2026 (data year 2025) via Our World in Data: total score = civil liberties (0-60) + political rights (0-40).
- UNODC, victims of intentional homicide per 100,000 people: each country's latest year, 2015 or later.
- ILOSTAT, average weekly hours actually worked per employed person (main job), latest year: used only where the Penn World Table
  has no annual hours, because a week's hours leave out holidays and so cannot stand in for PWT where PWT exists."""
import argparse, csv, json, os, re, sys, unicodedata, hashlib, datetime
import openpyxl

ap = argparse.ArgumentParser()
for a in ('--fh-cl', '--fh-pr', '--unodc', '--ilo'): ap.add_argument(a, required=True)
A = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__))
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]
norm = lambda s: re.sub(r'[^a-z]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())
A3N = {}
for k, v in json.load(open(os.path.join(HERE, 'input', 'a3.json'))).items(): A3N.setdefault(k, v)   # ISO3 -> number

# ---- Freedom House ----
def owid(p, col):
    return {(r['Code'], int(r['Year'])): int(r[col]) for r in csv.DictReader(open(p, encoding='utf-8-sig')) if r['Code'] and not r['Code'].startswith('OWID')}
cl, pr = owid(A.fh_cl, 'Civil liberties score'), owid(A.fh_pr, 'Political rights score')
FH_YEAR = max(y for _, y in cl)
FH_ALL = {A3N[c]: cl[(c, FH_YEAR)] + pr[(c, FH_YEAR)] for c, y in cl if y == FH_YEAR and (c, y) in pr and c in A3N}
FH_CITY = {n: cl[(c, FH_YEAR)] + pr[(c, FH_YEAR)] for n, c in (('Singapore', 'SGP'), ('Hong Kong', 'HKG')) if (c, FH_YEAR) in cl}

# ---- UNODC homicide ----
rows = list(openpyxl.load_workbook(A.unodc, read_only=True).worksheets[0].iter_rows(values_only=True))
h = rows[2]; I = {k: h.index(k) for k in h}
rate, count = {}, {}
for r in rows[3:]:
    if (r[I['Indicator']], r[I['Dimension']], r[I['Sex']], r[I['Age']]) != ('Victims of intentional homicide', 'Total', 'Total', 'Total'): continue
    (rate if r[I['Unit of measurement']].startswith('Rate') else count)[(r[I['Iso3_code']], r[I['Year']])] = r[I['VALUE']]
NAMES = {r[I['Iso3_code']]: r[I['Country']] for r in rows[3:] if r[I['Iso3_code']]}
# countries UNODC reports in parts: add up the deaths and the populations implied by each part's rate
for whole, parts in (('GBR', ('GBR_E_W', 'GBR_S', 'GBR_NI')), ('IRQ', ('IRQ_C', 'IRQ_KRI'))):
    for y in {y for (c, y) in rate if c in parts}:
        if all((p, y) in rate and (p, y) in count and rate[(p, y)] for p in parts) and (whole, y) not in rate:
            d = sum(count[(p, y)] for p in parts); pop = sum(count[(p, y)] / rate[(p, y)] for p in parts)
            rate[(whole, y)] = d / pop
HOM_UNODC = {}
for (c, y), v in rate.items():
    if c in A3N and y >= 2015 and (A3N[c] not in HOM_UNODC or y > HOM_UNODC[A3N[c]][1]): HOM_UNODC[A3N[c]] = (round(v, 1), y)

# ---- ILOSTAT weekly hours ----
N2C = {norm(NAMES[c]): c for c in NAMES if len(c) == 3}
N2C.update({norm(r['Entity']): r['Code'] for r in csv.DictReader(open(A.fh_cl, encoding='utf-8-sig')) if r['Code'] and not r['Code'].startswith('OWID')})
EXTRA = {'Naoero': 'NRU', 'Micronesia, Federated States of': 'FSM', 'Occupied Palestinian Territory': 'PSE', 'Türkiye': 'TUR', 'Cape Verde': 'CPV',
         'Congo': 'COG', 'Congo, Democratic Republic of the': 'COD', 'Brunei Darussalam': 'BRN', 'Kosovo': 'XKX',
         'United Kingdom of Great Britain and Northern Ireland': 'GBR', "Lao People's Democratic Republic": 'LAO', 'Tanzania, United Republic of': 'TZA'}
HOURS_ILO = {}
for x in csv.DictReader(open(A.ilo, encoding='utf-8-sig')):
    if x['sex.label'] != 'Total' or 'Modelled' in x['source.label']: continue   # national surveys only, not ILO's regional model
    c = EXTRA.get(x['ref_area.label']) or N2C.get(norm(x['ref_area.label']))
    v = float(x['obs_value'])
    if c and 20 <= v <= 60: HOURS_ILO[c] = (v, int(x['time']))   # outside 20-60 h a week is a data error (Belarus: 3.88)

fmt = lambda d: '{\n' + ''.join(f'    {k!r}: {v!r},\n' for k, v in sorted(d.items(), key=lambda t: str(t[0]))) + '}\n'
open(os.path.join(HERE, 'sources', 'world_updates.py'), 'w').write(f'''"""Country tables refreshed Nov 2026. Made by pipeline/import_world.py on {datetime.date.today()}; re-run it rather than editing these numbers.

FH_ALL: Freedom House, Freedom in the World (data year {FH_YEAR}), total score 0-100 = civil liberties + political rights, via Our World in Data
  (civil-liberties-score-fh.csv sha256 {sha(A.fh_cl)}, political-rights-score-fh.csv sha256 {sha(A.fh_pr)}). Country number -> score.
  https://ourworldindata.org/grapher/civil-liberties-score-fh  https://ourworldindata.org/grapher/political-rights-score-fh
HOM_UNODC: UNODC, victims of intentional homicide per 100,000 people (data_cts_intentional_homicide.xlsx, 12 Jul 2026, sha256 {sha(A.unodc)}),
  each country's latest year from 2015 on; the UK and Iraq are their parts added together. Country number -> (rate, year).
  https://dataunodc.un.org/dp-intentional-homicide-victims
HOURS_ILO: ILOSTAT, average weekly hours actually worked per employed person, main job, national labour force surveys
  ({os.path.basename(A.ilo)}, sha256 {sha(A.ilo)}). ISO3 -> (hours a week, year). Used only where the Penn World Table has no annual hours.
  https://ilostat.ilo.org/topics/working-time/
HOURS_OECD: OECD, average hours actually worked per worker per year, for countries where the Penn World Table 11 figure contradicts every
  other source. Mexico: PWT 11 gives 1,629 h for 2023, but PWT 10.01 gave 2,137 h for 2019, ILOSTAT gives 42.1 h a week (2025), and the OECD
  gives 2,193 h for 2024 (OECD Economic Surveys: Mexico 2026, Basic statistics of Mexico, 2024).
  https://www.oecd.org/en/publications/oecd-economic-surveys-mexico-2026_8a7c0ac4-en/full-report/basic-statistics-of-mexico-2024_d948ba58.html
"""
FH_YEAR = {FH_YEAR}
FH_ALL = {fmt(FH_ALL)}
FH_CITY = {FH_CITY!r}   # territories scored as cities
HOM_UNODC = {fmt(HOM_UNODC)}
HOURS_ILO = {fmt(HOURS_ILO)}
HOURS_OECD = {{'MEX': (2193, 2024)}}
''')
print(f'Freedom House {FH_YEAR}: {len(FH_ALL)} countries; UNODC homicide: {len(HOM_UNODC)} countries; ILO weekly hours: {len(HOURS_ILO)} countries')
