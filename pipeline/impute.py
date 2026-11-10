"""Gap filling for the atlas.
Countries: iterative regression imputation (each factor predicted from the others), the MICE-style approach
recommended for composite indicators. Cities: city value = a + b * (its country's value), fitted on cities that
have both. Accuracy of both is measured by hiding known values and predicting them (5-fold / leave-one-out)."""
import json, sys, numpy as np, warnings
from sklearn.experimental import enable_iterative_imputer  # noqa
from sklearn.impute import IterativeImputer
from sklearn.linear_model import BayesianRidge
warnings.filterwarnings('ignore')
IN, OUT = sys.argv[1], sys.argv[2]
D = json.load(open(IN, encoding='utf8'))
IDX = dict(clim=0, jobs=1, hlth=2, free=3, safe=4, move=5, pay=8, open=9, happy=11, women=12, lgbt=13, cost=14, commute=15, home=16)
F = list(IDX)
CITYF = ['clim', 'commute', 'move', 'pay', 'cost', 'safe', 'jobs', 'home']
rng = np.random.default_rng(7)

# ---------- country matrix ----------
ckeys = [('n', k) for k in D['countries']] + [('b', k) for k in D['byName']]
def crow(kind, k):
    v = (D['countries'] if kind == 'n' else D['byName'])[k]
    s = v[1].ljust(17, '0'); src = set(filter(None, v[3].split(',')))
    return [float(s[IDX[f]]) if (f in src and s[IDX[f]] != '0') else np.nan for f in F]
X = np.array([crow(*k) for k in ckeys])
polar = [i for i, (kind, k) in enumerate(ckeys) if kind == 'n' and int(k) in (10, 260)]
keep = [i for i in range(len(ckeys)) if i not in polar]
iso_row = {int(k): i for i, (kind, k) in enumerate(ckeys) if kind == 'n'}

# country values derived from their cities where the country itself has no figure (city-level factors only)
cities = D['cities']
def cval(c, f):
    s = c[4].ljust(17, '0'); src = set(filter(None, c[6].split(',')))
    return float(s[IDX[f]]) if (f in src and s[IDX[f]] != '0') else np.nan
from_cities = {}
for f in CITYF:
    j = F.index(f)
    for iso, i in iso_row.items():
        if np.isnan(X[i, j]):
            vals = [cval(c, f) for c in cities if int(c[3]) == iso]
            vals = [v for v in vals if not np.isnan(v)]
            if vals: from_cities[(i, j)] = (float(np.mean(vals)), float(np.std(vals)) if len(vals) > 1 else 0.0)

def impute(M):
    imp = IterativeImputer(estimator=BayesianRidge(), max_iter=25, random_state=0, min_value=1, max_value=5, initial_strategy='mean')
    return imp.fit_transform(M)

Xk = X[keep].copy()
for (i, j), (m, _) in from_cities.items():
    if i in keep: Xk[keep.index(i), j] = m
Xfill = impute(Xk)

# ---------- cross-validated accuracy for countries ----------
acc_country = {}
for j, f in enumerate(F):
    obs = [r for r in range(len(Xk)) if not np.isnan(X[keep][r, j])]
    if len(obs) < 15: continue
    folds = np.array_split(rng.permutation(obs), 5); errs = []
    for fold in folds:
        M = Xk.copy(); M[fold, j] = np.nan
        P = impute(M)
        errs += list(P[fold, j] - X[keep][fold, j])
    errs = np.array(errs)
    acc_country[f] = dict(mae=round(float(np.mean(np.abs(errs))), 2), rmse=round(float(np.sqrt(np.mean(errs ** 2))), 2), n=len(obs))
# spread for values derived from cities
for (i, j), (m, sd) in list(from_cities.items()):
    from_cities[(i, j)] = (m, max(sd, 0.5))

# ---------- city model: city = a + b * country ----------
city_rows = []
for c in cities:
    i = iso_row.get(int(c[3]))
    city_rows.append(i)
country_fill = {i: Xfill[keep.index(i)] for i in iso_row.values() if i in keep}
models, acc_city = {}, {}
def popband(c):
    src = set(filter(None, c[6].split(',')))
    return float(c[4][7]) if 'cult' in src and c[4][7] != '0' else 2.0
def cx_for(c, i, j, f, exclude_self=True):
    """Country-level predictor for a city: the country's published figure, else the mean of the
    country's other cities (leaving this city out), else the country's imputed value."""
    if not np.isnan(X[i, j]): return X[i, j], 'obs'
    others = [cval(o, f) for o in cities if int(o[3]) == int(c[3]) and (o is not c or not exclude_self)]
    others = [v for v in others if not np.isnan(v)]
    if others: return float(np.mean(others)), 'cities'
    return float(country_fill[i][j]), 'imputed'
for f in CITYF:
    j = F.index(f); xs, ys = [], []
    for c, i in zip(cities, city_rows):
        y = cval(c, f)
        if i is None or i not in keep or np.isnan(y): continue
        x, how = cx_for(c, i, j, f)
        xs.append(x); ys.append(y)
    xs, ys = np.array(xs), np.array(ys)
    A = np.vstack([np.ones_like(xs), xs]).T
    if f == 'jobs':   # a city's job market tracks its own size far more than national rates, so metro population is a second predictor
        pbs = np.array([popband(c) for c, i in zip(cities, city_rows) if not (i is None or i not in keep or np.isnan(cval(c, f)))])
        A = np.vstack([np.ones_like(xs), xs, pbs]).T
    coef = np.linalg.lstsq(A, ys, rcond=None)[0]
    loo = []
    for k in range(len(xs)):
        m = np.ones(len(xs), bool); m[k] = False
        ck = np.linalg.lstsq(A[m], ys[m], rcond=None)[0]
        loo.append(A[k] @ ck - ys[k])
    loo = np.array(loo)
    models[f] = tuple(float(x) for x in coef)
    acc_city[f] = dict(mae=round(float(np.mean(np.abs(loo))), 2), rmse=round(float(np.sqrt(np.mean(loo ** 2))), 2), n=int(len(xs)))

def c_sd(f): return acc_country.get(f, {}).get('rmse', 1.0)

# ---------- write imputed values ----------
n_imp = n_tot = 0
for r, (kind, k) in enumerate(ckeys):
    v = (D['countries'] if kind == 'n' else D['byName'])[k]
    imp = {}
    if r in keep:
        rr = keep.index(r)
        for j, f in enumerate(F):
            n_tot += 1
            if np.isnan(X[r, j]):
                n_imp += 1
                if (r, j) in from_cities: m, sd = from_cities[(r, j)]
                else: m, sd = Xfill[rr, j], c_sd(f)
                imp[f] = [round(float(m), 2), round(float(sd), 2)]
    while len(v) < 7: v.append(None)
    v[6] = imp
c_imp = c_tot = 0
for c, i in zip(cities, city_rows):
    imp = {}
    if i is not None and i in keep:
        base = country_fill[i]
        for f in F:
            j = F.index(f)
            if f in CITYF:
                c_tot += 1
                if np.isnan(cval(c, f)):
                    c_imp += 1
                    co = models[f]; b = co[1]
                    cx, how = cx_for(c, i, j, f)
                    pred = co[0] + b * cx + (co[2] * popband(c) if len(co) > 2 else 0)
                    sd = acc_city[f]['rmse'] if how != 'imputed' else float(np.sqrt(acc_city[f]['rmse'] ** 2 + (b * c_sd(f)) ** 2))
                    imp[f] = [round(float(np.clip(pred, 1, 5)), 2), round(sd, 2)]
            else:
                src = set(filter(None, c[6].split(',')))
                if f not in src and np.isnan(X[i, j]):
                    imp[f] = [round(float(base[j]), 2), c_sd(f)]
    c.append(imp)
D['meta'] = dict(acc_country=acc_country, acc_city=acc_city, country_filled=round(n_imp / n_tot, 3), city_filled=round(c_imp / c_tot, 3))
json.dump(D, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print('country accuracy', json.dumps(acc_country))
print('city accuracy', json.dumps(acc_city))
print('city models', json.dumps(models))
print('share filled: countries', D['meta']['country_filled'], 'cities', D['meta']['city_filled'])
for nm in ['East Hampton', 'Tampico', 'New York City']:
    c = [x for x in cities if x[0] == nm][0]; print(nm, c[-1])
