"""Step 2 of the build: fill gaps in the published data, test how accurate the fill-ins are, and test whether the gaps follow a pattern.
Reads build/published.json, writes build/final.json. Usage: fill_gaps.py IN OUT

Countries
  - Helper variables (not scored): GDP per person (log), population (log) and world region (sources/economy.py).
  - Missing-at-random check: for each factor, compare wealth, size and region of countries with and without a figure, and how well
    those three predict which countries are missing (cross-validated AUC; 0.5 = no pattern).
  - Multiple imputation: 20 completed datasets. Each one draws the other gaps from the model's posterior (so the uncertainty carries
    through), refits the factor's regression on a bootstrap sample of countries, and then uses predictive mean matching: the value
    filled in is a real published value, taken from one of the 5 countries whose predicted value is closest. That keeps the 1-5 values
    on the scale they come in. The page scores each completed dataset and combines them (Rubin's rules).
  - Accuracy is measured two ways: hiding random known values (5-fold), and hiding values the way real gaps happen (more often in
    poorer, smaller places, weighted by the missingness model). A factor whose error is above 1.0 point on either test is not filled in.
Cities
  - City value = a + b x (its country's value), with metro population as a second predictor for jobs, plus a partially pooled
    country effect: the average gap between the country's other cities and the model, shrunk toward zero by how many cities
    the country has (a multilevel model's random intercept). Accuracy is leave-one-out. Draws use the country's draws."""
import json, sys, os, math, numpy as np, warnings
from sklearn.experimental import enable_iterative_imputer  # noqa
from sklearn.impute import IterativeImputer
from sklearn.linear_model import BayesianRidge, LogisticRegression
from sklearn.model_selection import cross_val_score
warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources.economy import GDPPC_T, POPN_T, REGION
IN, OUT = sys.argv[1], sys.argv[2]
D = json.load(open(IN, encoding='utf8'))
IDX = dict(clim=0, jobs=1, hlth=2, free=3, safe=4, move=5, pay=8, open=9, happy=11, women=12, lgbt=13, cost=14, commute=15, home=16,
           air=17, honest=18, hours=19, risk=20)
NDIG = 21
F = list(IDX)
CITYF = ['clim', 'commute', 'move', 'pay', 'cost', 'safe', 'jobs', 'home', 'air']
M_DRAWS, MAX_ERR, K_DONORS = 20, 1.0, 5
rng = np.random.default_rng(7)

# ---------- helper variables ----------
def norm(n):
    import unicodedata
    return unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode().lower().strip()
ALIAS = {'czech republic': 'czechia', 'east timor': 'timor-leste', 'macau': 'macao', 'dr congo': 'democratic republic of the congo',
         'congo': 'republic of the congo', 'ivory coast': "cote d'ivoire", 'turkey': 'turkiye', 'western sahara': 'w. sahara'}
def tparse(t): return {norm(a): float(b) for a, b in (p.strip().split('|') for p in t.replace('\n', '').split(';') if p.strip())}
GDP, POP = tparse(GDPPC_T), tparse(POPN_T)
def lookup(tab, name):
    n = norm(name)
    for cand in (n, ALIAS.get(n), {v: k for k, v in ALIAS.items()}.get(n)):
        if cand and cand in tab: return tab[cand]
    return None
REGS = sorted(set(REGION.values()))

ckeys = [('n', k) for k in D['countries']] + [('b', k) for k in D['byName']]
def crec(kind, k): return (D['countries'] if kind == 'n' else D['byName'])[k]
def crow(kind, k):
    v = crec(kind, k); s = v[1].ljust(NDIG, '0'); src = set(filter(None, v[3].split(',')))
    return [float(s[IDX[f]]) if (f in src and s[IDX[f]] != '0') else np.nan for f in F]
def hrow(kind, k):
    v = crec(kind, k); nm = v[0]; a2 = v[5] if len(v) > 5 else None
    g, p = lookup(GDP, nm), lookup(POP, nm)
    reg = REGION.get(a2 or '', None)
    return [math.log(g) if g else np.nan, math.log(p) if p else np.nan] + [float(reg == r) if reg else np.nan for r in REGS]
X = np.array([crow(*k) for k in ckeys]); H = np.array([hrow(*k) for k in ckeys])
names = [crec(*k)[0] for k in ckeys]
polar = [i for i, (kind, k) in enumerate(ckeys) if kind == 'n' and int(k) in (10, 260)]
keep = [i for i in range(len(ckeys)) if i not in polar]
iso_row = {int(k): i for i, (kind, k) in enumerate(ckeys) if kind == 'n'}
helper_cover = dict(gdp=int(np.sum(~np.isnan(H[keep, 0]))), pop=int(np.sum(~np.isnan(H[keep, 1]))), region=int(np.sum(~np.isnan(H[keep, 2]))), n=len(keep))

# country values derived from their cities where the country itself has no figure (city-level factors only)
cities = D['cities']
def cval(c, f):
    s = c[4].ljust(NDIG, '0'); src = set(filter(None, c[6].split(',')))
    return float(s[IDX[f]]) if (f in src and s[IDX[f]] != '0') else np.nan
from_cities = {}
for f in CITYF:
    j = F.index(f)
    for iso, i in iso_row.items():
        if np.isnan(X[i, j]):
            vals = [v for v in (cval(c, f) for c in cities if int(c[3]) == iso) if not np.isnan(v)]
            if vals: from_cities[(i, j)] = (float(np.mean(vals)), max(float(np.std(vals)) if len(vals) > 1 else 0.0, 0.5))

Xk = X[keep].copy(); Hk = H[keep]
for (i, j), (m, _) in from_cities.items():
    if i in keep: Xk[keep.index(i), j] = m
nF = len(F)
def impute(M, seed=0, post=False):
    Z = np.hstack([M, Hk])
    imp = IterativeImputer(estimator=BayesianRidge(), max_iter=15, random_state=seed, sample_posterior=post, initial_strategy='mean')
    Z = imp.fit_transform(Z); Z[:, :nF] = np.clip(Z[:, :nF], 1, 5); return Z
Zfill = impute(Xk); Xfill = Zfill[:, :nF]

# ---------- is it missing at random? ----------
Hc = Hk.copy()
for j in range(Hc.shape[1]):
    col = Hc[:, j]; col[np.isnan(col)] = np.nanmean(col)
mar = {}
for j, f in enumerate(F):
    miss = np.isnan(Xk[:, j])
    if miss.sum() < 5 or (~miss).sum() < 5: continue
    sd_g, sd_p = np.std(Hc[:, 0]), np.std(Hc[:, 1])
    dg = (Hc[miss, 0].mean() - Hc[~miss, 0].mean()) / sd_g; dp = (Hc[miss, 1].mean() - Hc[~miss, 1].mean()) / sd_p
    try: auc = float(np.mean(cross_val_score(LogisticRegression(max_iter=500), Hc, miss.astype(int), cv=5, scoring='roc_auc')))
    except Exception: auc = float('nan')
    reg_m = {r: round(float(np.mean(Hc[miss, 2 + k])), 2) for k, r in enumerate(REGS)}
    top = max(reg_m, key=reg_m.get)
    mar[f] = dict(missing=int(miss.sum()), gdp_gap=round(float(dg), 2), pop_gap=round(float(dp), 2), auc=round(auc, 2), top_region=top, top_share=reg_m[top])

# ---------- accuracy: random holdout and holdout that mimics the real gaps ----------
def holdout_err(j, rows, reps=1):
    errs = []
    for fold in rows:
        M = Xk.copy(); M[fold, j] = np.nan
        P = impute(M)[:, j]; errs += list(P[fold] - X[keep][fold, j])
    return np.array(errs)
acc_country = {}
for j, f in enumerate(F):
    obs = [r for r in range(len(Xk)) if not np.isnan(X[keep][r, j])]
    if len(obs) < 15: continue
    e1 = holdout_err(j, np.array_split(rng.permutation(obs), 5))
    # propensity of being missing, from wealth, size and region; hide known values with probability proportional to it
    miss = np.isnan(Xk[:, j]).astype(int)
    if 3 <= miss.sum() <= len(miss) - 3:
        pr = LogisticRegression(max_iter=500).fit(Hc, miss).predict_proba(Hc)[:, 1]
    else: pr = np.full(len(Xk), 0.5)
    w = pr[obs] / (1 - pr[obs] + 1e-6); w = w / w.sum()
    folds = [rng.choice(obs, size=max(3, len(obs) // 5), replace=False, p=w) for _ in range(5)]
    e2 = holdout_err(j, folds)
    acc_country[f] = dict(mae=round(float(np.mean(np.abs(e1))), 2), rmse=round(float(np.sqrt(np.mean(e1 ** 2))), 2),
                          mae_gaps=round(float(np.mean(np.abs(e2))), 2), rmse_gaps=round(float(np.sqrt(np.mean(e2 ** 2))), 2), n=len(obs))
SKIP = sorted(f for f, a in acc_country.items() if max(a['mae'], a['mae_gaps']) > MAX_ERR)
def c_sd(f): a = acc_country.get(f, {}); return max(a.get('rmse', 1.0), a.get('rmse_gaps', 0))

# ---------- multiple imputation with predictive mean matching ----------
miss_cells = [(r, j) for r in range(len(Xk)) for j in range(nF) if np.isnan(Xk[r, j]) and F[j] not in SKIP]
DRAWS = {cell: [] for cell in miss_cells}
COUNTRY_DRAW = []   # per draw: completed factor matrix (used as the country predictor for cities)
for m in range(M_DRAWS):
    Zm = impute(Xk, seed=100 + m, post=True); Cm = Zm[:, :nF].copy()
    for j in range(nF):
        mrows = [r for r, jj in miss_cells if jj == j]
        if not mrows: continue
        obs = np.where(~np.isnan(Xk[:, j]))[0]
        others = [c for c in range(Zm.shape[1]) if c != j]
        boot = rng.choice(obs, size=len(obs), replace=True)
        reg = BayesianRidge().fit(Zm[boot][:, others], Xk[boot, j])
        pred = reg.predict(Zm[:, others])
        for r in mrows:
            donors = obs[np.argsort(np.abs(pred[obs] - pred[r]))[:K_DONORS]]
            v = float(Xk[rng.choice(donors), j]); DRAWS[(r, j)].append(v); Cm[r, j] = v
    COUNTRY_DRAW.append(Cm)

# ---------- city model with a partially pooled country effect ----------
city_rows = [iso_row.get(int(c[3])) for c in cities]
country_fill = {i: Xfill[keep.index(i)] for i in iso_row.values() if i in keep}
def popband(c):
    src = set(filter(None, c[6].split(',')))
    return float(c[4][7]) if 'cult' in src and c[4][7] != '0' else 2.0
def cx_for(c, i, j, f, Cm=None):
    """Country-level predictor for a city: the country's published figure, else the mean of the country's other cities,
    else the country's filled-in value (a draw, when drawing)."""
    if not np.isnan(X[i, j]): return X[i, j], 'obs'
    others = [v for v in (cval(o, f) for o in cities if int(o[3]) == int(c[3]) and o is not c) if not np.isnan(v)]
    if others: return float(np.mean(others)), 'cities'
    return float((Cm if Cm is not None else Xfill)[keep.index(i)][j]), 'imputed'
models, acc_city, pool = {}, {}, {}
for f in CITYF:
    j = F.index(f); rows = []
    for ci, (c, i) in enumerate(zip(cities, city_rows)):
        y = cval(c, f)
        if i is None or i not in keep or np.isnan(y): continue
        x, _ = cx_for(c, i, j, f); rows.append((ci, int(c[3]), x, popband(c), y))
    iso_ = np.array([r[1] for r in rows]); xs = np.array([r[2] for r in rows]); ys = np.array([r[4] for r in rows])
    A = np.vstack([np.ones_like(xs), xs] + ([np.array([r[3] for r in rows])] if f == 'jobs' else [])).T
    def fit(mask):
        co = np.linalg.lstsq(A[mask], ys[mask], rcond=None)[0]; res = ys[mask] - A[mask] @ co
        # variance components for the country effect: between-country (tau2) and within (sigma2)
        g = {}
        for k_, r_ in zip(iso_[mask], res): g.setdefault(k_, []).append(r_)
        multi = [v for v in g.values() if len(v) > 1]
        s2 = float(np.mean([np.var(v, ddof=1) for v in multi])) if multi else float(np.var(res))
        t2 = max(0.0, float(np.var([np.mean(v) for v in g.values()])) - s2 / max(1, np.mean([len(v) for v in g.values()])))
        return co, g, s2, t2
    def pooled(g, s2, t2, k_, excl=None):
        r_ = list(g.get(k_, []))
        if excl is not None and excl in r_: r_.remove(excl)
        n = len(r_)
        return (n * t2 / (n * t2 + s2)) * float(np.mean(r_)) if n and t2 > 0 else 0.0
    co, g, s2, t2 = fit(np.ones(len(xs), bool))
    models[f] = [float(x) for x in co]; pool[f] = dict(tau=round(math.sqrt(t2), 2), sigma=round(math.sqrt(s2), 2))
    loo, loo0 = [], []
    for k in range(len(xs)):
        msk = np.ones(len(xs), bool); msk[k] = False
        ck, gk, s2k, t2k = fit(msk)
        p0 = A[k] @ ck; loo0.append(p0 - ys[k]); loo.append(p0 + pooled(gk, s2k, t2k, iso_[k]) - ys[k])
    loo, loo0 = np.array(loo), np.array(loo0)
    acc_city[f] = dict(mae=round(float(np.mean(np.abs(loo))), 2), rmse=round(float(np.sqrt(np.mean(loo ** 2))), 2),
                       mae_nopool=round(float(np.mean(np.abs(loo0))), 2), n=int(len(xs)))
    models[f] = (co, g, s2, t2, pooled, ys)

# ---------- write ----------
def enc(vals): return ''.join(str(int(round(v))) for v in vals)
n_imp = n_tot = 0
for r, (kind, k) in enumerate(ckeys):
    v = crec(kind, k); imp = {}
    if r in keep:
        rr = keep.index(r)
        for j, f in enumerate(F):
            n_tot += 1
            if not np.isnan(X[r, j]): continue
            if (r, j) in from_cities:
                m, sd = from_cities[(r, j)]; imp[f] = [round(m, 2), round(sd, 2)]; n_imp += 1
            elif (rr, j) in DRAWS:
                d = DRAWS[(rr, j)]; n_imp += 1
                imp[f] = [round(float(np.mean(d)), 2), round(max(float(np.std(d)), 0.25), 2), enc(d)]
    while len(v) < 7: v.append(None)
    v[6] = imp
c_imp = c_tot = 0
for c, i in zip(cities, city_rows):
    imp = {}
    if i is not None and i in keep:
        rr = keep.index(i); src = set(filter(None, c[6].split(',')))
        for f in F:
            j = F.index(f)
            if f in CITYF:
                c_tot += 1
                if not np.isnan(cval(c, f)): continue
                c_imp += 1
                co, g, s2, t2, pooled, ys = models[f]
                off = pooled(g, s2, t2, int(c[3])); rm = acc_city[f]['rmse']
                def pred(Cm=None):
                    cx, how = cx_for(c, i, j, f, Cm)
                    return co[0] + co[1] * cx + (co[2] * popband(c) if len(co) > 2 else 0) + off, how
                p, how = pred()
                draws = []
                for m in range(M_DRAWS):
                    pm, _ = pred(COUNTRY_DRAW[m]); pm += rng.normal(0, rm)
                    donors = ys[np.argsort(np.abs(ys - pm))[:K_DONORS]]   # nearest published city values
                    draws.append(float(rng.choice(donors)))
                sd = math.sqrt(rm ** 2 + (co[1] * c_sd(f)) ** 2) if how == 'imputed' else rm
                imp[f] = [round(float(np.clip(p, 1, 5)), 2), round(sd, 2), enc(draws)]
            elif f not in src and np.isnan(X[i, j]) and f not in SKIP and (rr, j) in DRAWS:
                d = DRAWS[(rr, j)]; imp[f] = [round(float(np.mean(d)), 2), round(max(float(np.std(d)), 0.25), 2), enc(d)]
    c.append(imp)
for f in CITYF: models[f] = [round(x, 3) for x in models[f][0]]
# ---------- happiness beyond income, health and freedom: what's left of life satisfaction after those three ----------
HR = {}
jh, jl, jf = F.index('happy'), F.index('hlth'), F.index('free')
rows_ = [r for r in range(len(Xk)) if not np.isnan(Xk[r, jh]) and not np.isnan(Hk[r, 0])]
A_ = np.column_stack([np.ones(len(rows_)), Xfill[rows_, jl], Xfill[rows_, jf], Hk[rows_, 0]])
co_ = np.linalg.lstsq(A_, Xk[rows_, jh], rcond=None)[0]; res_ = Xk[rows_, jh] - A_ @ co_
r2_ = 1 - np.var(res_) / np.var(Xk[rows_, jh])
for r, v in zip(rows_, res_):
    kind, k = ckeys[keep[r]]
    if kind == 'n': HR['c:' + str(int(k))] = round(float(np.clip(3 + v / np.std(res_), 1, 5)), 2)
D['happyres'] = HR
D['meta'] = dict(happy_r2=round(float(r2_), 2), acc_country=acc_country, acc_city=acc_city, country_filled=round(n_imp / n_tot, 3), city_filled=round(c_imp / c_tot, 3),
                 skip=SKIP, max_err=MAX_ERR, mar=mar, draws=M_DRAWS, helpers=helper_cover, pool=pool)
json.dump(D, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print('helpers found for', helper_cover)
print('country accuracy', json.dumps(acc_country))
print('not filled in (error above %.1f):' % MAX_ERR, SKIP)
print('missing-at-random check', json.dumps(mar))
print('city accuracy', json.dumps(acc_city))
print('country effect (tau) vs within-country spread (sigma)', json.dumps(pool))
print('share filled: countries', D['meta']['country_filled'], 'cities', D['meta']['city_filled'])
for nm in ['East Hampton', 'Tampico', 'Amsterdam']:
    c = [x for x in cities if x[0] == nm][0]; print(nm, c[-1])
