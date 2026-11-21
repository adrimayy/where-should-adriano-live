"""Pay by kind of work: what a kind of work pays, per 1,000 of average pay in the same place.

Two published tables, each kept in pipeline/input with its source and how it was read:
  ilostat_earnings_by_occupation.txt   119 countries: mean monthly earnings of employees by ISCO-08 major group
                                       (ILOSTAT), latest year from 2020 on
  oews_2025_metro_pay.txt              109 US metro areas: annual mean wage by occupation group (BLS OEWS, May 2025)
The page (js/07-quiz.js, JOBS) maps each kind of work in the quiz to one ISCO-08 group and one OEWS column.
Every line carries a check value, so a miscopied figure stops the build."""
import math, pathlib, re, statistics

INPUT = pathlib.Path(__file__).resolve().parent.parent / 'input'
ISCO = 'pqcsto' + 'e'            # groups 2, 3, 4, 5, 7, 8, 9 (see the file header)
OEWS = 'abcdefghijlmnopqr'       # the 17 kinds of work in quiz order (see the file header)


def _rows(name, key, letters):
    pat = re.compile('^' + key + ''.join(f' {x}(\\d+)' for x in letters) + r' k(\d+)$')
    for line in (INPUT / name).read_text(encoding='utf8').splitlines():
        if not line.strip() or line.startswith('#'): continue
        m = pat.match(line.strip())
        assert m, f'{name}: cannot read "{line}"'
        *head, check = m.groups()
        vals = [int(v) for v in head[-len(letters):]]
        assert sum(vals) % 97 == int(check), f'{name}: check value fails on "{line}"'
        yield head[:-len(letters)], vals


# Countries with no table of their own get an estimate from the nine countries most like them: closest in income (log GDP
# per person, PPP), with a country outside the same world region counted as half a log-point further away. Each group's
# figure is the middle value of those nine. Checked by leaving each of the 110 countries with figures out in turn
# (python3 pipeline/sources/job_pay.py): the estimate is off by 16 points of average pay on average, the same as the
# region's middle value, against 18 for the world's and 22 for using the United States' figures everywhere.
K, REGION_PENALTY = 9, 0.5
EXTRA = {'SGP': 702}   # a city in the atlas with no country outline of its own on the map
GDP_ALIAS = {'Czechia': 'Czech Republic', 'Türkiye': 'Turkey', "Côte d'Ivoire": 'Ivory Coast', 'Hong Kong SAR': 'Hong Kong',
             'Bosnia and Herz.': 'Bosnia and Herzegovina', 'Central African Rep.': 'Central African Republic', 'Dem. Rep. Congo': 'DR Congo',
             'Dominican Rep.': 'Dominican Republic', 'Eq. Guinea': 'Equatorial Guinea', 'Solomon Is.': 'Solomon Islands',
             'Timor-Leste': 'East Timor', 'eSwatini': 'Eswatini'}


def _gdp():
    from sources.economy import GDPPC_T
    g = {a.strip(): float(b) for a, b in (p.split('|') for p in GDPPC_T.replace('\n', '').split(';') if '|' in p)}
    return lambda name: g.get(name) or g.get(GDP_ALIAS.get(name, ''))


def _estimate(i, own, loginc, region, skip=None):
    """Middle value, group by group, of the K countries with figures most like country i."""
    if i in loginc:
        near = sorted((k for k in own if k != skip and k in loginc),
                      key=lambda k: abs(loginc[k] - loginc[i]) + (0 if region.get(k) == region.get(i) else REGION_PENALTY))[:K]
    else:   # no income figure (four countries): every country of its region with figures, or failing that the world
        near = [k for k in own if k != skip and region.get(k) == region.get(i)] or [k for k in own if k != skip]
    return [round(statistics.median(own[k][j] for k in near)) for j in range(1, len(ISCO) + 1)]


def tables(a3, cities, cbsa, countries, region):
    """a3: ISO3 -> country number; cities: the atlas's city names; cbsa: US city name -> Census CBSA code;
    countries: number -> name; region: number -> world region.
    c: country number -> [year, seven groups]; year 0 marks an estimate from similar countries. m: US city -> 17 kinds."""
    c = {}
    for (iso3, yy), vals in _rows('ilostat_earnings_by_occupation.txt', r'([A-Z]{3})(\d\d)', ISCO):
        num = a3.get(iso3) or EXTRA.get(iso3)
        if num: c[int(num)] = [2000 + int(yy)] + vals
    gdp = _gdp()
    loginc = {i: math.log(gdp(n)) for i, n in countries.items() if gdp(n)}
    own = dict(c)
    for i in countries:
        if i not in own:
            est = _estimate(i, own, loginc, region)
            if est: c[i] = [0] + est
    metro = {code: vals for (code,), vals in _rows('oews_2025_metro_pay.txt', r'c(\d{5})', OEWS)}
    m = {n: metro[str(cbsa[n])] for n in cities if n in cbsa and str(cbsa[n]) in metro}
    return {'c': c, 'm': m}


if __name__ == '__main__':   # how good is the estimate? leave each country with figures out and predict it
    import json, sys
    sys.path.insert(0, str(INPUT.parent))
    root = INPUT.parent.parent
    s = (root / 'data' / 'atlas.js').read_text(encoding='utf8'); D = json.loads(s[s.index('{'):s.rindex('}') + 1])
    countries = {int(k): v[0] for k, v in D['countries'].items()}; region = {int(k): v for k, v in D['region'].items()}
    own = {int(k): v for k, v in D['jobpay']['c'].items() if v[0]}
    gdp = _gdp(); loginc = {i: math.log(gdp(n)) for i, n in countries.items() if gdp(n)}
    have = [i for i in own if i in loginc]
    def mae(pred):
        e = [abs(p[j] - own[i][j + 1]) for i in have for p in [pred(i)] if p for j in range(len(ISCO))]
        return round(statistics.mean(e) / 10, 1)
    med = lambda rows: [statistics.median(r[j] for r in rows) for j in range(1, len(ISCO) + 1)]
    print(len(have), 'countries with figures and income; mean absolute error in points of average pay:')
    print('  similar countries (used):', mae(lambda i: _estimate(i, own, loginc, region, skip=i)))
    print('  region middle value:     ', mae(lambda i: med([own[k] for k in have if k != i and region.get(k) == region.get(i)]) if any(k != i and region.get(k) == region.get(i) for k in have) else None))
    print('  world middle value:      ', mae(lambda i: med([own[k] for k in have if k != i])))
    print('  United States figures:   ', mae(lambda i: own[840][1:] if i != 840 else None))
    print('estimated:', sum(1 for v in D['jobpay']['c'].values() if not v[0]), 'countries')
