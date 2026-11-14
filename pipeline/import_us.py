"""Turn the downloaded US metro and county files into pipeline/sources/us_local.py.
Usage: python3 import_us.py --cbsa cbsa-est2025-alldata.csv --laus ssamatab1.xlsx --epa annual_conc_by_monitor_2024.csv annual_conc_by_monitor_2025.csv
                            --chr analytic_supplement_20260325.csv
Every US metro in the atlas is matched to its Census CBSA code through the ACS file (sources/more_cities.CBSA); counties are
rolled up to metros with the Census county list inside the CBSA population file. Nothing is estimated: a metro is left out
when the published figures don't cover it."""
import argparse, csv, collections, hashlib, os, sys, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources.more_cities import US_METROS, CBSA, dist

ap = argparse.ArgumentParser()
ap.add_argument('--cbsa', required=True)
ap.add_argument('--laus', required=True)
ap.add_argument('--epa', nargs='+', required=True)
ap.add_argument('--chr', required=True)
A = ap.parse_args()
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]

# ---- county -> CBSA, and metro population (for coverage checks) ----
COUNTY_CBSA, CPOP = {}, {}
for x in csv.DictReader(open(A.cbsa, encoding='latin-1')):
    if x['LSAD'] == 'County or equivalent':
        COUNTY_CBSA[x['STCOU']] = x['CBSA']; CPOP[x['STCOU']] = int(x['POPESTIMATE2025'])
MPOP = collections.Counter()
for c, m in COUNTY_CBSA.items(): MPOP[m] += CPOP[c]

# ---- BLS LAUS: unemployment rate, labour-force-weighted over the latest 12 months that have data ----
import openpyxl
S = collections.defaultdict(dict)
for r in openpyxl.load_workbook(A.laus, read_only=True).worksheets[0].iter_rows(min_row=5, values_only=True):
    if r[0] and isinstance(r[8], (int, float)) and isinstance(r[6], (int, float)): S[r[2]][(int(r[4]), int(r[5]))] = (r[8], r[6])
months = sorted({m for v in S.values() for m in v})[-12:]
UNEMP_US = {}
for n in US_METROS:
    ok = [m for m in months if m in S.get(CBSA.get(n), {})]
    if len(ok) >= 10:
        UNEMP_US[n] = round(100 * sum(S[CBSA[n]][m][0] for m in ok) / sum(S[CBSA[n]][m][1] for m in ok), 1)
win = '%s–%s' % ('%d-%02d' % months[0], '%d-%02d' % months[-1])

# ---- EPA: annual mean PM2.5 (parameter 88101, FRM/FEM, standard "PM25 Annual 2024", complete years only, wildfire days kept) ----
site_year = collections.defaultdict(list); SITE_POS = {}
for p in A.epa:
    for x in csv.DictReader(open(p)):
        if x['Parameter Code'] != '88101' or x['Pollutant Standard'] != 'PM25 Annual 2024' or x['Completeness Indicator'] != 'Y': continue
        if x['Event Type'] not in ('No Events', 'Events Included'): continue
        k = (x['State Code'] + x['County Code'], x['Site Num'], int(x['Year']))
        site_year[k].append(float(x['Arithmetic Mean'])); SITE_POS[k[:2]] = (float(x['Latitude']), float(x['Longitude']))
PM_US = {}
for n, (_st, _pop, la, lo) in US_METROS.items():
    # monitors in the metro within 30 km of the main city's centre: a metro can span deserts and mountains far from where people live
    yy = collections.defaultdict(list)
    for (cty, site, yr), v in site_year.items():
        if COUNTY_CBSA.get(cty) == CBSA.get(n) and dist((la, lo), SITE_POS[(cty, site)]) <= 30: yy[yr].append(sum(v) / len(v))
    if yy:
        ys = sorted(yy); means = [sum(yy[y]) / len(yy[y]) for y in ys]
        PM_US[n] = (round(sum(means) / len(means), 1), '–'.join(map(str, sorted({ys[0], ys[-1]}))), max(len(yy[y]) for y in ys))

# ---- County Health Rankings: homicides (deaths per 100,000, 2017-2023) and uninsured under 65 (SAHIE 2023), summed over counties ----
num, den, cov = (collections.defaultdict(lambda: collections.Counter()) for _ in range(3))
for x in csv.DictReader(open(A.chr, encoding='latin-1')):
    m = COUNTY_CBSA.get(x['fipscode'])
    if not m: continue
    for k in ('v015', 'v085'):
        if x[k + '_numerator'] and x[k + '_denominator']:
            num[m][k] += float(x[k + '_numerator']); den[m][k] += float(x[k + '_denominator']); cov[m][k] += CPOP.get(x['fipscode'], 0)
HOM_US, UNINS_US = {}, {}
for n in US_METROS:
    m = CBSA.get(n)
    if not m or not MPOP[m]: continue
    # a figure only when the counties that publish it hold at least 80% of the metro's people (small counties are suppressed)
    if cov[m]['v015'] >= 0.8 * MPOP[m]: HOM_US[n] = round(1e5 * num[m]['v015'] / den[m]['v015'], 1)
    if cov[m]['v085'] >= 0.8 * MPOP[m]: UNINS_US[n] = round(100 * num[m]['v085'] / den[m]['v085'], 1)

fmt = lambda d: '{\n' + ''.join(f'    {k!r}: {v!r},\n' for k, v in sorted(d.items())) + '}\n'
out = f'''"""US metro figures from federal statistics, by Census CBSA (2023 delineations). Lower is better for all four.
Made by pipeline/import_us.py on {datetime.date.today()}; edit the source files and re-run it rather than editing these numbers.

UNEMP_US: BLS Local Area Unemployment Statistics, metropolitan areas, seasonally adjusted (ssamatab1.xlsx, sha256 {sha(A.laus)}).
  Unemployment rate % over {win}, total unemployed / total labour force for the months published (Oct 2025 was not, because of the shutdown).
  https://www.bls.gov/lau/metrossa.htm
PM_US: EPA Air Quality System annual concentration by monitor ({', '.join(os.path.basename(p) + ' sha256 ' + sha(p) for p in A.epa)}).
  PM2.5 µg/m³: FRM/FEM monitors (88101), complete years, wildfire-smoke days included. Each site's mean, averaged across the metro's
  sites within 30 km of the main city's centre, then across years. metro -> (value, years, sites). https://aqs.epa.gov/aqsweb/airdata/download_files.html
HOM_US: County Health Rankings & Roadmaps, supplemental release 25 Mar 2026 ({os.path.basename(A.chr)}, sha256 {sha(A.chr)}), measure 15:
  homicide deaths per 100,000 people, 2017-2023 (NCHS mortality files), counties summed to the metro. Given only where the counties
  that publish it hold at least 80% of the metro's people. https://www.countyhealthrankings.org/health-data
UNINS_US: same release, measure 85: % of people under 65 without health insurance, 2023 (Census SAHIE), counties summed.
County -> metro: Census Bureau Vintage 2025 CBSA population estimates ({os.path.basename(A.cbsa)}, sha256 {sha(A.cbsa)}).
"""
UNEMP_US = {fmt(UNEMP_US)}
PM_US = {fmt(PM_US)}
HOM_US = {fmt(HOM_US)}
UNINS_US = {fmt(UNINS_US)}
'''
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sources', 'us_local.py'), 'w').write(out)
print(f'US metros {len(US_METROS)}: unemployment {len(UNEMP_US)} ({win}), PM2.5 {len(PM_US)}, homicide {len(HOM_US)}, uninsured {len(UNINS_US)}')
