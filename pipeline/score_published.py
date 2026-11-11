"""Step 1 of the build: turn published numbers into 1-5 scores for every country and city.
Reads data/base.json and data/cities_added.json, writes build/published.json. Usage: score_published.py BASE ADDED OUT
The numbers live in sources/, the 1-5 thresholds in bands.py; this file only combines them."""
import json, sys, unicodedata, statistics, math, re, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bands import *
from sources.health import *
from sources.freedom import *
from sources.safety import *
from sources.numbeo import *
from sources.people import *
from sources.jobs import *
from sources.housing import *
from sources.climate import *
from sources.politics import *
from sources.getting_around import *
from sources.economy import *
IN, ADD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(IN, encoding='utf8'))
# merge cities added later (data/cities_added.json)
_have = {c[0] for c in D['cities']}
for name, lat, lon, iso_, lang, jobs, cult, fields, en, es, nes in json.load(open(ADD, encoding='utf8')):
    if name in _have: continue
    cv = D['countries'].get(iso_.zfill(3)) or D['countries'].get(iso_)
    cd = cv[1].ljust(17, '0'); csrc = cv[3].split(',')
    s = f"3{jobs}0{cd[3]}33{lang}{cult}{cd[8]}" + cd[9:15] + "00"
    src = ','.join(x for x in ('open', 'happy', 'women', 'lgbt') if x in csrc)
    D['cities'].append([name, lat, lon, iso_, s, en, src, es, nes, fields])
# digit layout: 0 clim 1 jobs 2 hlth 3 free 4 safe 5 move 6 lang 7 cult 8 pay 9 open 10 perm 11 happy 12 women 13 lgbt 14 cost 15 commute 16 home
IDX = dict(clim=0, jobs=1, hlth=2, free=3, safe=4, move=5, lang=6, cult=7, pay=8, open=9, perm=10, happy=11, women=12, lgbt=13, cost=14, commute=15, home=16)
def setd(s, k, v): i = IDX[k]; s = s.ljust(17, '0'); return s[:i] + str(v) + s[i+1:]
# RAW[place][factor] = [[source key, value as published, band], ...] -- shown in the page's "how this score was calculated" table
RAW = {}
def rec(place, f, key, val, band):
    # the 4th item is the continuous value (see bands.py); records without one count as exactly their band
    if band: RAW.setdefault(place, {}).setdefault(f, []).append([key, val, int(band), round(getattr(band, 'c', float(band)), 3)])
def fmtn(x): return ('%.1f' % x).rstrip('0').rstrip('.') if isinstance(x, float) else str(x)
def norm(n): return unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode().lower().replace('.', '').replace('(china)', '').strip()
N2I = {norm(v[0]): int(k) for k, v in D['countries'].items()}
ALIAS = {'czechia':203,'czech republic':203,'turkiye':792,'turkey':792,'viet nam':704,'vietnam':704,'russian federation':643,'russia':643,'lao pdr':418,'laos':418,
 'syrian arab republic':760,'syria':760,'democratic republic of the congo':180,'dr congo':180,'democratic republic of congo':180,'congo':178,'republic of the congo':178,
 'congo (brazzaville)':178,"cote d'ivoire":384,'ivory coast':384,'bosnia and herzegovina':70,'bosnia and hercegovina':70,'north macedonia':807,'macedonia':807,
 'dominican republic':214,'central african republic':140,'equatorial guinea':226,'palestine':275,'west bank and gaza':275,'eswatini':748,'south korea':410,
 'taiwan':158,'united states':840,'united states of america':840,'united kingdom':826,'united arab emirates':784,'saudi arabia':682,'kosovo':'Kosovo',
 'kosovo (disputed territory)':'Kosovo','trinidad and tobago':780,'papua new guinea':598,'solomon islands':90,'timor-leste':626,'guinea-bissau':624,
 'sierra leone':694,'south africa':710,'south sudan':728,'new zealand':554,'costa rica':188,'el salvador':222,'sri lanka':144,'burkina faso':854,
 'puerto rico':630,'belize':84,'kyrgyzstan':417,'kyrgyz republic':417,'the gambia':270,'gambia':270,'north korea':408,'bahamas':44,'western sahara':732}
def iso(name):
    n = norm(name)
    if n in ALIAS: return ALIAS[n]
    return N2I.get(n)
def parse(txt):
    out = {}
    for part in txt.split(';'):
        part = part.strip()
        if not part: continue
        name, *vals = part.rsplit(' ', 1) if ':' not in part else [part.split(':')[0]] + [part.split(':')[1]]
        out[name.strip()] = vals[0].strip()
    return out
UHC = {iso(k): float(v) for k, v in parse(UHC_T).items() if iso(k) is not None}
EIU = {iso(k): float(v) for k, v in parse(EIU_T).items() if iso(k) is not None}
def nparse(txt):
    out = {}
    for part in txt.split(';'):
        if ':' not in part: continue
        k, v = part.split(':'); out[norm(k.strip())] = [float(x) for x in v.split(',')]
    return out
NCOL = nparse(NCOL); NQOL = nparse(NQOL)
def cparse(txt, n):
    out = {}
    for part in txt.split(';'):
        part = part.strip()
        if not part: continue
        toks = part.split(' '); vals = [float(x) for x in toks[-n:]]; name = ' '.join(toks[:-n])
        i = iso(name)
        if i is not None: out[i] = vals
    return out
NC_COL = cparse(NCTRY_COL, 2); NC_QOL = cparse(NCTRY_QOL, 4)
MAI = {iso(k): float(v) for k, v in parse(MAI_T).items() if iso(k) is not None}
EQD = {}
for part in EQD_T.split(';'):
    nm, x = part.rsplit(':', 1); i = iso(nm.strip().replace('Democratic Republic of the Congo', 'DR Congo').replace('Republic of the Congo', 'Congo (Brazzaville)') if 'Congo' in nm else nm.strip())
    if i is not None: EQD[i] = int(x)
def avg(bands):
    b = [x for x in bands if x]
    return int(math.floor(statistics.mean(b) + 0.5)) if b else 0   # half rounds up, consistently
WHR_L = WHR.split(';'); WPS_L = WPS.split(';')
WHR_R = {}; WPS_R = {}
for r_, n_ in enumerate(WHR_L, 1):
    i_ = iso(n_)
    if i_ is not None and i_ not in WHR_R: WHR_R[i_] = r_
for r_, n_ in enumerate(WPS_L, 1):
    i_ = iso(n_)
    if i_ is not None and i_ not in WPS_R: WPS_R[i_] = r_
EI25 = {iso(k): v for k, v in EI25.items() if iso(k) is not None}
def nparse2(txt):
    o = {}
    for part in txt.split(';'):
        nm, x = part.rsplit(':', 1); i_ = iso(nm.strip())
        if i_ is not None: o[i_] = float(x)
    return o
UNEMP = nparse2(UNEMP_T); YOUTH = nparse2(YOUTH_T); INFORMAL = nparse2(INFORMAL_T)
AVC = {iso(k): v for k, v in AV_COUNTRY.items() if iso(k) is not None}
UNC = {iso(k): v for k, v in UNCOVERED.items()}
OPEN_X = {iso(k): v for k, v in OPEN_COUNTRY_EXTRA.items()}
def av_key(src, kind): return src + {'rank': 'r', 'hard': 'h', 'easy': 'e', 'vac': ''}[kind]
CITY_BURDEN = {}
TMEAN = {}; POL = {}; POLC = {}; THOT = {}   # iso -> list of solo rent-burden ratios of its cities with Numbeo data (for the country-level housing figure)
NAME_N = {'New York City':'new york','Washington DC':'washington dc','Bogotá':'bogota','Medellín':'medellin','São Paulo':'sao paulo','Querétaro':'queretaro',
          'Mérida':'merida','Kraków':'krakow','Málaga':'malaga','Bengaluru':'bengaluru','Cambridge UK':'cambridge uk','Córdoba (Argentina)':'cordoba (argentina)'}
# pre-pass: solo rent burden for every city with Numbeo data
CITY_MONEY = {}; MONEY = {}; MONEYD = {}; WALKD = {}
# calibrate the index route against cities that have item prices: Numbeo's indices imply salaries about a third higher than its
# item-price salaries, so index-based pay and rent are scaled by the median ratio over the overlapping cities
_pr, _rr = [], []
for nm_, (rent_i, pay_i) in ITEMS.items():
    col_ = NCOL.get(NAME_N.get(nm_, norm(nm_)))
    if col_: _pr.append(NYC_PAY * col_[3] * col_[0] / 1e4 / pay_i); _rr.append(NYC_RENT * col_[1] / 100 / rent_i)
CAL_PAY, CAL_RENT, CAL_N = statistics.median(_pr), statistics.median(_rr), len(_pr)
def idx_pay(col): return NYC_PAY * col[3] * col[0] / 1e4 / CAL_PAY
def idx_rent(col): return NYC_RENT * col[1] / 100 / CAL_RENT
for c in D['cities']:
    col = NCOL.get(NAME_N.get(c[0], norm(c[0])))
    if col: CITY_BURDEN.setdefault(int(c[3]), []).append(burden(col[1], col[0], col[3]))
    if c[0] in ITEMS and col: MONEY[c[0]] = ('items', money_left(ITEMS[c[0]][1], ITEMS[c[0]][0], col[0]))
    elif col: MONEY[c[0]] = ('nidx', money_left(idx_pay(col), idx_rent(col), col[0]))
    if c[0] in MONEY: CITY_MONEY.setdefault(int(c[3]), []).append(MONEY[c[0]][1])
# ---------- countries ----------
for k, v in D['countries'].items():
    n = int(k); s = v[1].ljust(17, '0'); src = set(filter(None, v[3].split(','))); P = 'c:' + str(n)
    src -= {'safe', 'open', 'jobs', 'home', 'cult'}
    # healthcare: WHO UHC + Numbeo health care
    if n in UHC: rec(P, 'hlth', 'uhc', fmtn(UHC[n]), b_uhc(UHC[n]))
    if n in NC_QOL: rec(P, 'hlth', 'nqolh', fmtn(NC_QOL[n][1]), b_health(NC_QOL[n][1]))
    if n in UNC: rec(P, 'hlth', UNC[n][1], fmtn(UNC[n][0]) + '%', b_cover(UNC[n][0]))
    h = avg([b_uhc(UHC[n]) if n in UHC else 0, b_health(NC_QOL[n][1]) if n in NC_QOL else 0, b_cover(UNC[n][0]) if n in UNC else 0])
    s = setd(s, 'hlth', h); (src.add('hlth') if h else None)
    # freedom: EIU + Freedom House
    if n in EIU: rec(P, 'free', 'eiu', fmtn(EIU[n]), b_eiu(EIU[n]))
    if n in FH: rec(P, 'free', 'fh', str(FH[n]), b_fh(FH[n]))
    elif n in FH_FREE: rec(P, 'free', 'fh', 'Free', 4)
    fb = [b_eiu(EIU[n]) if n in EIU else 0, b_fh(FH[n]) if n in FH else (4 if n in FH_FREE else 0)]
    f = avg(fb)
    if f: s = setd(s, 'free', f); src.add('free')
    # safety: UNODC homicide + Numbeo safety
    if n in RATES: rec(P, 'safe', 'hom', fmtn(RATES[n]), b_hom(RATES[n]))
    if n in NC_QOL: rec(P, 'safe', 'nqols', fmtn(NC_QOL[n][0]), b_nsafe(NC_QOL[n][0]))
    sf = avg([b_hom(RATES[n]) if n in RATES else 0, b_nsafe(NC_QOL[n][0]) if n in NC_QOL else 0])
    if sf: s = setd(s, 'safe', sf); src.add('safe')
    # making friends / welcome: Expat Insider ranks first; Gallup migrant acceptance only where no Expat Insider rank exists
    if n in EI25: op = b_rank(EI25[n], 46); rec(P, 'open', 'ei25s', f'#{EI25[n]}/46', op)
    elif n in OPEN_X: r_, nn = OPEN_X[n]; op = b_rank(r_, nn); rec(P, 'open', 'ei24f', f'#{r_}/{nn}', op)
    elif n in MAI: op = b_mai(MAI[n]); rec(P, 'open', 'mai', fmtn(MAI[n]), op)
    else: op = 0
    s = setd(s, 'open', op)
    if op: src.add('open')
    # purchasing power, cost, climate, commute: Numbeo
    if n in CITY_MONEY:
        m = statistics.mean(CITY_MONEY[n]); s = setd(s, 'pay', b_money(m)); src.add('pay'); rec(P, 'pay', 'money', '$%d' % round(m), b_money(m))
    elif n in NC_COL:   # no city with rent data: purchasing power (salary vs prices, rent not included)
        s = setd(s, 'pay', b_lpp(NC_COL[n][1])); src.add('pay'); rec(P, 'pay', 'nlpp', fmtn(NC_COL[n][1]), b_lpp(NC_COL[n][1]))
    if n in NC_COL:
        s = setd(s, 'cost', b_cost(NC_COL[n][0])); src.add('cost'); rec(P, 'cost', 'ncolc', fmtn(NC_COL[n][0]), b_cost(NC_COL[n][0]))
    if n in NC_QOL:
        s = setd(s, 'clim', b_clim(NC_QOL[n][3])); s = setd(s, 'commute', b_comm(NC_QOL[n][2])); src |= {'clim', 'commute'}
        rec(P, 'clim', 'nqolc', fmtn(NC_QOL[n][3]), b_clim(NC_QOL[n][3])); rec(P, 'commute', 'nqolt', fmtn(NC_QOL[n][2]), b_comm(NC_QOL[n][2]))
    if n in EQD: s = setd(s, 'lgbt', b_eq(EQD[n])); src.add('lgbt'); rec(P, 'lgbt', 'eq', str(EQD[n]), b_eq(EQD[n]))
    else: src.discard('lgbt')
    if 'happy' in src and n in WHR_R: rec(P, 'happy', 'whr', f'#{WHR_R[n]}/147', int(s[11]))
    if 'women' in src and n in WPS_R: rec(P, 'women', 'wps', f'#{WPS_R[n]}/181', int(s[12]))
    # jobs: ILO unemployment, overall and ages 15-24 (the age group of new graduates)
    if n in YOUTH: rec(P, 'jobs', 'iloy', fmtn(YOUTH[n]) + '%', b_youth(YOUTH[n]))
    if n in UNEMP: rec(P, 'jobs', 'ilo', fmtn(UNEMP[n]) + '%', b_unemp(UNEMP[n]))
    if n in INFORMAL: rec(P, 'jobs', 'inf', fmtn(INFORMAL[n]) + '%', b_inf(INFORMAL[n]))
    j = avg([b_youth(YOUTH[n]) if n in YOUTH else 0, b_unemp(UNEMP[n]) if n in UNEMP else 0, b_inf(INFORMAL[n]) if n in INFORMAL else 0])
    s = setd(s, 'jobs', j)
    if j: src.add('jobs')
    # housing for one person: rent burden (mean of its cities) + availability
    hb = []   # housing is availability only; what rent costs is in money left after rent
    if n in AVC:
        kind, x, nn, sk = AVC[n]; hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind), av_text(kind, x, nn), b_av(kind, x, nn))
    for kind, x, nn, sk in AV_COUNTRY_EXTRA.get(v[0], []):
        hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind), av_text(kind, x, nn), b_av(kind, x, nn))
    hm = avg(hb); s = setd(s, 'home', hm)
    if hm: src.add('home')
    s = setd(s, 'cult', 0)   # no country-level measure; scored for cities only
    v[1] = s; v[3] = ','.join(sorted(src))
for k, v in D['byName'].items():
    v[1] = v[1].ljust(17, '0')
    if k == 'Kosovo':
        v[1] = setd(v[1], 'lgbt', b_eq(48))
        v[1] = setd(setd(v[1], 'pay', b_lpp(56.4)), 'cost', b_cost(20.4)); v[3] = 'happy,women,pay,cost,lgbt'
    v[1] = setd(setd(v[1], 'cult', 0), 'jobs', 0)
# ---------- cities ----------
cs = D['countries']
for c in D['cities']:
    name = c[0]; n = int(c[3]); cv = cs.get(str(n).zfill(3)) or cs.get(str(n)); P = 'city:' + name
    s = c[4].ljust(17, '0'); src = set(filter(None, c[6].split(','))) - {'safe', 'open', 'jobs', 'home', 'cult'}
    key = NAME_N.get(name, norm(name))
    col, qol = NCOL.get(key), NQOL.get(key)
    cdig = cv[1] if cv else '0' * 17; csrc = set(cv[3].split(',')) if cv else set()
    # healthcare: country WHO UHC + city Numbeo health care
    uhc = UHC.get(n, 88 if name == 'Singapore' else None)
    if uhc: rec(P, 'hlth', 'uhc', fmtn(uhc), b_uhc(uhc))
    if qol: rec(P, 'hlth', 'nqolh', fmtn(qol[1]), b_health(qol[1]))
    if n in UNC: rec(P, 'hlth', UNC[n][1], fmtn(UNC[n][0]) + '%', b_cover(UNC[n][0]))
    h = avg([b_uhc(uhc) if uhc else 0, b_health(qol[1]) if qol else 0, b_cover(UNC[n][0]) if n in UNC else 0])
    s = setd(s, 'hlth', h); (src.add('hlth') if h else None)
    if name == 'Hong Kong': s = setd(s, 'free', b_eiu(5.24)); src.add('free'); rec(P, 'free', 'eiu', '5.24', b_eiu(5.24))
    elif 'free' in csrc: s = setd(s, 'free', cdig[3]); src.add('free')
    if name == 'Singapore':
        s = setd(s, 'free', b_eiu(6.18)); s = setd(s, 'happy', 3); s = setd(s, 'women', 5); s = setd(s, 'lgbt', b_eq(44))
        src |= {'free', 'happy', 'women', 'lgbt'}
        rec(P, 'free', 'eiu', '6.18', b_eiu(6.18)); rec(P, 'happy', 'whr', '#36/147', 3); rec(P, 'women', 'wps', '#17/181', 5); rec(P, 'lgbt', 'eq', '44', b_eq(44))
    hom = FBI.get(name)
    if hom is not None: rec(P, 'safe', 'fbi', fmtn(hom), b_hom(hom))
    elif (col or qol) and n in RATES: hom = RATES.get(n); rec(P, 'safe', 'hom', fmtn(hom), b_hom(hom))
    if qol: rec(P, 'safe', 'nqols', fmtn(qol[0]), b_nsafe(qol[0]))
    sf = avg([b_hom(hom) if hom is not None else 0, b_nsafe(qol[0]) if qol else 0])
    s = setd(s, 'safe', sf if sf else int(s[4]))
    if sf: src.add('safe')
    # making friends: the city's own Expat Insider rank, else the country's
    if name in OPEN_CITY:
        r_, nn = OPEN_CITY[name]; s = setd(s, 'open', b_rank(r_, nn)); src.add('open'); rec(P, 'open', 'eicity24s', f'#{r_}/{nn}', b_rank(r_, nn))
    elif 'open' in csrc and name != 'Hong Kong': s = setd(s, 'open', cdig[9]); src.add('open')
    else: s = setd(s, 'open', 0)
    if 'lgbt' in csrc and name != 'Hong Kong': s = setd(s, 'lgbt', cdig[13]); src.add('lgbt')
    if col:
        mk, m = MONEY[name]; s = setd(s, 'pay', b_money(m)); s = setd(s, 'cost', b_cost(col[2])); src |= {'pay', 'cost'}
        if mk == 'items': MONEYD[name] = [ITEMS[name][1], ITEMS[name][0], col[0], 'items']
        else: MONEYD[name] = [round(idx_pay(col)), round(idx_rent(col)), col[0], 'nidx']
        if mk == 'items':
            pay_, rent_ = ITEMS[name][1], ITEMS[name][0]
            rec(P, 'pay', 'items' + ('n' if name in ITEMS_NATL_PAY else ''), f'(${pay_:,} - ${rent_:,}) / {fmtn(col[0])}% = ${round(m):,}', b_money(m))
        else:
            rec(P, 'pay', 'nidx', f'(≈${round(idx_pay(col)):,} - ≈${round(idx_rent(col)):,}) / {fmtn(col[0])}% = ${round(m):,}', b_money(m))
        rec(P, 'cost', 'ncol', fmtn(col[2]), b_cost(col[2]))
    else: s = setd(s, 'pay', int(s[8]) if 'pay' in src else 0)
    tk = name if name in TEMPS else TEMP_PROXY.get(name)
    cb = []
    if tk:
        tt = TEMPS[tk]; tb, tbc = b_temp(max(tt), min(tt)); cb += [tb, tb]
        rec(P, 'clim', 'temp' if tk == name else 'tempnear', f'{max(tt):.1f}° / {min(tt):.1f}°' + ('' if tk == name else f' ({tk})'), B(max(1, int(math.floor(tb + 0.5))), tbc))
        TMEAN[name] = round(sum(tt) / 12, 1)
        THOT[name] = max(tt)
    if qol:
        cb.append(b_clim(qol[4])); rec(P, 'clim', 'nqolc', fmtn(qol[4]), b_clim(qol[4]))
        s = setd(s, 'commute', b_comm(qol[2])); src.add('commute'); rec(P, 'commute', 'nqolt', fmtn(qol[2]), b_comm(qol[2]))
    else:
        s = setd(s, 'commute', 0)
    if cb: s = setd(s, 'clim', max(1, int(math.floor(statistics.mean(cb) + 0.5)))); src.add('clim')
    else: s = setd(s, 'clim', 0)
    # US state politics (2024 presidential margin); shown and scored only if the user asks for it
    if name in CITY_STATE:
        st = CITY_STATE[name]; mg = STATE_MARGIN[st]; POL[name] = mg
        rec(P, 'pol', 'pres24', f"{st}: {'D' if mg > 0 else 'R'} +{abs(mg):.1f}", 3)
        if name in CITY_COUNTY:
            cn = CITY_COUNTY[name]; cm = COUNTY_MARGIN[cn]; POLC[name] = cm
            rec(P, 'pol', 'county24', f"{cn}: {'D' if cm > 0 else 'R'} +{abs(cm):.1f}", 3)
    mv = []
    if name in CO2: mv.append(b_co2(CO2[name])); rec(P, 'move', 'ntr', fmtn(CO2[name]), b_co2(CO2[name]))
    # one car-dependence measure everywhere (Numbeo traffic CO2); Walk Score / Transit Score are shown on the page but not scored
    if name in WALK: WALKD[name] = list(WALK[name])
    if mv: s = setd(s, 'move', avg(mv)); src.add('move')
    # jobs: size of the metro economy the city belongs to + national youth unemployment
    gdp = METRO.get(name, (None,))[0]; gk = 'gdp'
    if name in NYC_COMMUTER: gdp = METRO['New York City'][0]; gk = 'gdpnyc'
    elif name in SUFFOLK: gdp = SUFFOLK_GDP; gk = 'bea'
    if gdp:
        rec(P, 'jobs', gk, '$' + fmtn(gdp) + 'bn', b_gdp(gdp))
        if n in YOUTH: rec(P, 'jobs', 'iloy', fmtn(YOUTH[n]) + '%', b_youth(YOUTH[n]))
        if n in INFORMAL: rec(P, 'jobs', 'inf', fmtn(INFORMAL[n]) + '%', b_inf(INFORMAL[n]))
        # metro GDP counts once (it overlaps with metro population, used for things happening; see tests/overlap.py)
        j = avg([b_gdp(gdp), b_youth(YOUTH[n]) if n in YOUTH else 0, b_inf(INFORMAL[n]) if n in INFORMAL else 0]); s = setd(s, 'jobs', j); src.add('jobs')
    else: s = setd(s, 'jobs', 0)
    # tech ecosystem (only counted when the field is tech): StartupBlink city rank, outside the top 1,000 = lowest band
    sb = SBLINK.get('New York City') if name in NYC_COMMUTER else SBLINK.get(name)
    if sb: rec(P, 'tech', 'sblinknyc' if name in NYC_COMMUTER else 'sblink', f'#{sb}/1000', b_sblink(sb))
    else: rec(P, 'tech', 'sblink', '>1000', 1)
    # things happening: metro population (a proxy: bigger metros have more concerts, venues and events)
    pop = METRO.get(name, (None, None))[1] or POP_EXTRA.get(name)
    pk = 'pop'
    if name in NYC_COMMUTER: pop = METRO['New York City'][1]; pk = 'popnyc'
    if pop:
        s = setd(s, 'cult', b_pop(pop)); src.add('cult'); rec(P, 'cult', pk, ('%.1fM' % (pop / 1e6)) if pop >= 1e6 else ('<0.1M' if pop < 1e5 else '%.2fM' % (pop / 1e6)), b_pop(pop))
    # housing for one person: own rent burden + availability (city figure, else national)
    hb = []   # housing is availability only (vacancy, how hard expats find it); rent is in money left after rent
    if name in AV_CITY:
        kind, x, nn, sk = AV_CITY[name]; hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind), av_text(kind, x, nn), b_av(kind, x, nn))
    elif n in AVC and n != 840 and name not in AV_EXTRA:
        kind, x, nn, sk = AVC[n]; hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind) + '*', av_text(kind, x, nn), b_av(kind, x, nn))
    for kind, x, nn, sk in AV_EXTRA.get(name, []) + ([] if (name in AV_CITY or name in AV_EXTRA) else AV_COUNTRY_EXTRA.get(cv[0] if cv else '', [])):
        star = '' if name in AV_EXTRA else '*'
        hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind) + star, av_text(kind, x, nn), b_av(kind, x, nn))
    hm = avg(hb); s = setd(s, 'home', hm)
    if hm: src.add('home')
    # towns that borrow New York's job market and things to do also take New York's commute: the train ride to Manhattan
    if name in LIRR_MIN:
        mins = LIRR_MIN[name]; s = setd(s, 'commute', b_comm(mins)); src.add('commute'); rec(P, 'commute', 'lirr', f'{mins} min', b_comm(mins))
    c[4] = s; c[6] = ','.join(sorted(src))
    c.append('own' if (col or qol) else 'country')
# a country's tech figure: its best-ranked city in the atlas
for c in D['cities']:
    tb = RAW.get('city:' + c[0], {}).get('tech')
    if tb:
        P = 'c:' + str(int(c[3])); cur = RAW.get(P, {}).get('tech')
        if not cur or tb[0][2] > cur[0][2] or (tb[0][2] == cur[0][2] and tb[0][1] < cur[0][1]):
            RAW.setdefault(P, {})['tech'] = [[tb[0][0] if tb[0][0] != 'sblinknyc' else 'sblink', tb[0][1] + ' (' + c[0] + ')', tb[0][2]]]
D['raw'] = RAW; D['tmean'] = TMEAN; D['thot'] = THOT; D['pol'] = POL; D['polc'] = POLC
# continuous values: the stored 1-5 digit, moved within its band by how far the underlying figures sit from the cut-offs
CONT = {}
def digits_of(P):
    if P.startswith('c:'):
        v = D['countries'].get(P[2:].zfill(3)) or D['countries'].get(P[2:]); return (v[1], set(v[3].split(','))) if v else (None, None)
    c = CITYMAP.get(P[5:]); return (c[4], set(c[6].split(','))) if c else (None, None)
CITYMAP = {c[0]: c for c in D['cities']}
for P, fs in RAW.items():
    s_, src_ = digits_of(P)
    if not s_: continue
    for f, rs in fs.items():
        if f not in IDX or f not in src_ or s_[IDX[f]] == '0': continue
        own = [r for r in rs if not r[0].endswith('*')] or rs
        off = statistics.mean(r[3] - r[2] for r in own)
        if abs(off) > 0.004: CONT.setdefault(P, {})[f] = round(max(1, min(5, int(s_[IDX[f]]) + off)), 2)
D['cont'] = CONT; D['money'] = MONEYD; D['walk'] = WALKD; D['items_snapshot'] = ITEMS_SNAPSHOT; D['money_cal'] = [round(CAL_PAY, 3), round(CAL_RENT, 3), CAL_N]
json.dump(D, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
nod = [c[0] for c in D['cities'] if c[-1] == 'country']
print('cities using country data:', nod)
print('index calibration: pay / %.3f, rent / %.3f, from %d cities with item prices' % (CAL_PAY, CAL_RENT, CAL_N))
print('UHC', len(UHC), 'EIU', len(EIU), 'MAI', len(MAI), 'NC_COL', len(NC_COL), 'NC_QOL', len(NC_QOL))
