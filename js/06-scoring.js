'use strict';
// someone who knows Adriano can turn on his take and the comparison with it
let KNOWS = store.get('knows', '') === '1';
const vsAd = () => MODE === 'yours' && KNOWS;
/* ---------------- scoring ---------------- */
let gateHot = true,
  gateSmall = true,
  gateFar = true,
  W = { ...PRESETS.mine },
  gate = true,
  gateOpen = true,
  norm = true,
  MODE = 'neutral',
  QUIZW = null;
let STATS = {};
function warp(v) {
  return WARPG === 1 ? v : 1 + 4 * Math.pow(Math.max(0, (v - 1) / 4), WARPG);
}
function computeStats() {
  STATS = {};
  FACTORS.forEach(f => {
    const v = ents.filter(e => listable(e) && e.v && e.v[f.k] != null).map(e => warp(e.v[f.k]));
    STATS[f.k] = { m: d3.mean(v) || 3, sd: d3.deviation(v) || 1, mn: d3.min(v) ?? 1, mx: d3.max(v) ?? 5 };
  });
}
// rescaling: z-score (same average and spread) or min-max (same lowest and highest); the warp stands in for moving every cut-off together
function nv(k, v) {
  v = warp(v);
  if (!norm) return v;
  const s = STATS[k];
  if (NORMM === 'minmax') return s.mx > s.mn ? 1 + (4 * (v - s.mn)) / (s.mx - s.mn) : 3;
  return Math.max(1, Math.min(5, 3 + (v - s.m) / s.sd));
}
function aggScore(vals) {
  if (AGG === 'geo') {
    let lw = 0,
      sw = 0;
    for (const [w, x] of vals) {
      lw += w * Math.log(Math.max(1, x));
      sw += w;
    }
    return sw ? ((Math.exp(lw / sw) - 1) / 4) * 100 : 0;
  }
  let t = 0,
    sw = 0;
  for (const [w, x] of vals) {
    t += (w * (x - 1)) / 4;
    sw += w;
  }
  return sw ? (t / sw) * 100 : 0;
}
function Phi(z) {
  return 0.5 * (1 + Math.tanh(0.7978845608 * (z + 0.044715 * z * z * z)));
}
// chance a filled-in value is at or below a cut-off: share of its 20 draws, or a normal approximation
function pBelow(e, k, cut) {
  const d = e.dr && e.dr[k];
  if (d) return d.filter(x => x <= cut).length / d.length;
  const m = e.v[k],
    s = e.sd[k] || 1;
  return m == null ? 0 : Phi((cut + 0.5 - m) / s);
}
function contOf(e, k, raw) {
  if (
    !useCont ||
    CALC.has(k) ||
    RULES.has(k) ||
    (k === 'clim' && CLIMMODE !== 'mild') ||
    (k === 'pay' && (FIELD === 'remote' || e.payAdj))
  )
    return raw;
  const own = CONTV[e.type === 'city' ? 'city:' + e.name : 'c:' + e.id];
  if (own && own[k] != null) return own[k];
  if (e.type === 'city') {
    const c = CONTV['c:' + e.iso],
      ce = e.countryEnt;
    if (c && c[k] != null && ce && ce.sc[k] === raw && !(RAWD['city:' + e.name] || {})[k]) return c[k];
  }
  return raw;
}
function backed(e, k) {
  if (CALC.has(k) || RULES.has(k)) return true;
  if (k === 'clim' && CLIMMODE !== 'mild') return !!e.hasGeo;
  if (k === 'pay' && FIELD === 'remote') return e.src.has('cost');
  return e.src.has(k);
}
const counts = (e, k) => useEst || backed(e, k);
function resolve(e) {
  e.v = {};
  e.sd = {};
  e.how = {};
  e.me = {};
  e.dr = {};
  FACTORS.forEach(f => {
    const k = f.k,
      raw = e.sc[k];
    if (k === 'happy' && HAPPYMODE === 'beyond') {
      const hv = HAPPYR['c:' + (e.type === 'city' ? e.iso : e.id)];
      if (hv != null) {
        e.v[k] = hv;
        e.sd[k] = 0;
        e.me[k] = 0.4;
        e.how[k] = 'obs';
      } else {
        e.v[k] = null;
        e.how[k] = 'none';
      }
      return;
    }
    if (k === 'jobs' && useEst && fieldJobs(e) != null) {
      e.v[k] = fieldJobs(e);
      e.sd[k] = 1;
      e.how[k] = 'est';
      return;
    }
    if (raw != null && backed(e, k)) {
      e.v[k] = contOf(e, k, raw);
      e.sd[k] = 0;
      e.me[k] = ME[k] || 0;
      e.how[k] = 'obs';
      return;
    }
    const ik = k === 'pay' && FIELD === 'remote' ? 'cost' : k,
      im = e.imp && e.imp[ik];
    if (useImp && im && IMPUTABLE.has(k) && !(k === 'clim' && CLIMMODE !== 'mild')) {
      e.v[k] = im[0];
      e.sd[k] = im[1] || 1;
      e.dr[k] = im[2] ? Array.from(im[2], Number) : null;
      e.how[k] = 'imp';
      return;
    }
    if (useEst && raw != null) {
      e.v[k] = raw;
      e.sd[k] = 1;
      e.how[k] = 'est';
      return;
    }
    e.v[k] = null;
    e.how[k] = 'none';
  });
  // tech/software: the job market is averaged with the city's tech-ecosystem rank
  const tb = FIELD === 'tech' ? techOf(e) : null;
  if (tb != null && e.how.jobs !== 'est') {
    const j = e.v.jobs;
    if (j == null) {
      e.v.jobs = e.sc.jobs = tb;
      e.how.jobs = 'obs';
      e.sd.jobs = 0;
      e.me.jobs = ME.jobs;
    } else if (e.how.jobs === 'obs') e.v.jobs = e.sc.jobs = (j + tb) / 2;
    else {
      e.v.jobs = (j + tb) / 2;
      e.sd.jobs = (e.sd.jobs || 1) / 2;
      if (e.dr.jobs) e.dr.jobs = e.dr.jobs.map(d => (d + tb) / 2);
    }
  }
}
function evaluate(e) {
  const sc = e.sc,
    V = e.v;
  let tot = 0,
    sw = 0,
    swImp = 0;
  const part = {},
    vals = [];
  FACTORS.forEach(f => {
    const v = V[f.k];
    if (v == null || W[f.k] <= 0) return;
    const x = nv(f.k, v),
      p = (W[f.k] * (x - 1)) / 4;
    vals.push([W[f.k], x]);
    part[f.k] = p;
    tot += p;
    sw += W[f.k];
    if (e.how[f.k] !== 'obs') swImp += W[f.k];
  });
  const score = Math.round(aggScore(vals));
  Object.keys(part).forEach(k => (part[k] = (part[k] / sw) * 100));
  let den = 0;
  FACTORS.forEach(f => {
    if (W[f.k] > 0 && (useEst || !EST_ONLY.has(f.k))) den += W[f.k];
  });
  let tier = score >= CUT.fit ? 'fit' : score >= CUT.ok ? 'ok' : score >= CUT.caution ? 'caution' : 'avoid';
  if (!useImp && den && sw / den < 0.75) tier = 'nodata';
  let gated = false,
    lim = 'none',
    likely = false;
  const war = CONFLICT.has(isoOf(e));
  // The freedom dealbreaker protects people moving somewhere new. It doesn't apply to a country whose passport the person holds
  // (they already have that country's rights and protections as a citizen), or when they said freedom barely matters
  // (weight 0.5 or less). The freedom score itself still counts at whatever weight they chose. War stays a dealbreaker for everyone.
  const own = passSpec(PERMMODE).includes(+isoOf(e)),
    freeGate = gate && !own && W.free > 0.5;
  e.freeWhy = gate && !war && sc.free != null && sc.free <= 2 && !freeGate ? (own ? 'own' : 'low') : '';
  if ((freeGate && e.how.free === 'obs' && sc.free <= 2) || (gate && war)) {
    tier = 'avoid';
    gated = true;
    lim = war ? 'safe' : 'free';
  }
  // Dealbreakers also apply to filled-in values, when they're more likely than not below the cut-off
  else if (freeGate && e.how.free === 'imp' && pBelow(e, 'free', 2) > 0.5) {
    tier = 'avoid';
    gated = true;
    lim = 'free';
    likely = true;
  } else if (tier === 'nodata') {
  } else if (
    gate &&
    e.how.safe === 'obs' &&
    sc.safe === 1 &&
    W.safe > 0 &&
    (tier === 'fit' || tier === 'ok')
  ) {
    tier = 'caution';
    gated = true;
    lim = 'safe';
  } else if (
    gate &&
    e.how.safe === 'imp' &&
    W.safe > 0 &&
    pBelow(e, 'safe', 1) > 0.5 &&
    (tier === 'fit' || tier === 'ok')
  ) {
    tier = 'caution';
    gated = true;
    lim = 'safe';
    likely = true;
  } else if (gateOpen && e.how.open === 'obs' && sc.open === 1 && (tier === 'fit' || tier === 'ok')) {
    tier = 'caution';
    gated = true;
    lim = 'open';
  } else if (gateFar && e.flights && e.flights.some(h => h > 18) && (tier === 'fit' || tier === 'ok')) {
    tier = 'caution';
    gated = true;
    lim = 'fam';
  } else if (
    gateHot &&
    CLIMMODE !== 'warm' &&
    e.type === 'city' &&
    THOT[e.name] >= 27 &&
    (tier === 'fit' || tier === 'ok')
  ) {
    tier = 'caution';
    gated = true;
    lim = 'clim';
  } else if (
    // "lots to do" counting double or more is a floor as well as a weight: a metro under 500,000 people (the lowest
    // band) can do well on everything else and still not be what the person asked for
    gateSmall &&
    W.cult >= 2 &&
    e.type === 'city' &&
    e.how.cult === 'obs' &&
    sc.cult === 1 &&
    (tier === 'fit' || tier === 'ok')
  ) {
    tier = 'caution';
    gated = true;
    lim = 'cult';
  } else {
    let worst = -1;
    FACTORS.forEach(f => {
      const v = V[f.k];
      if (v == null || W[f.k] <= 0 || v > 2.5) return;
      const pen = (5 - v) * W[f.k];
      if (pen > worst) {
        worst = pen;
        lim = f.k;
      }
    });
  }
  // a top verdict needs published data on every crucial factor you weight, and on at least 80% of your weighted priorities
  const capMiss = CRUCIAL.filter(k => W[k] > 0 && e.how[k] !== 'obs');
  let dataCap = null;
  // thin: more than a fifth of the score filled in; sorts after well-measured places in its verdict
  const thin = !!(sw && swImp / sw > 0.2);
  if (tier === 'fit' && (capMiss.length || thin)) {
    tier = 'ok';
    dataCap = capMiss.length ? capMiss : ['share'];
  }
  const known = FACTORS.filter(f => sc[f.k] != null);
  const nb = known.filter(f => backed(e, f.k)).length;
  const cap = dataCap ? 'ok' : gated ? tier : null;
  return {
    part,
    dataCap,
    thin,
    score,
    tier,
    lim,
    gated,
    likely,
    cap,
    conf: known.length ? nb / known.length : 0,
    known: known.length,
    backed: nb,
    impShare: sw ? swImp / sw : 0,
  };
}
function applyPersonal() {
  ents.forEach(e => {
    if (!e.base)
      e.base = { lang: e.sc.lang, perm: e.sc.perm, jobs: e.sc.jobs, clim: e.sc.clim, pay: e.sc.pay };
    e.sc.lang = langFor(e, LANGMODE);
    e.sc.perm = permFor(e, PERMMODE);
    e.sc.jobs = jobsFor(e, FIELD);
    e.sc.clim = climFor(e, CLIMMODE);
    e.sc.pay = payFor(e, FIELD);
    e.sc.kin = kinFor(e);
    e.sc.pol = polFor(e);
  });
}
function applyHomes() {
  ents.forEach(famFor);
}
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// a run's verdict: its score's band, held under the same caps as the real verdict (dealbreakers, the data rule)
function tierAt(s, e) {
  if (e.tier === 'nodata') return 'nodata';
  let t = s >= CUT.fit ? 'fit' : s >= CUT.ok ? 'ok' : s >= CUT.caution ? 'caution' : 'avoid';
  if (e.cap && TR[e.cap] > TR[t]) t = e.cap;
  return t;
}
function scoreWith(e, pick) {
  const vals = [];
  for (const f of FACTORS) {
    const k = f.k,
      w = W[k];
    if (!(w > 0)) continue;
    const x = pick(k);
    if (x == null) continue;
    vals.push([w, nv(k, x)]);
  }
  return aggScore(vals);
}
let SIM = { R: 0, top: {} };
// The likely ranges take 120 recalculations of every place: by far the slowest thing the page does (seconds on a phone).
// It is written as steps so it can run all at once (simulate: tests, Adriano's snapshot) or a few milliseconds at a time
// in the background (simulateSoon: every tap), with the same result either way.
function* simSteps() {
  // 120 recalculations. Filled-in values take one of their 20 imputed draws per run (multiple imputation);
  // published values move by their measurement error, so fully measured places get a range too.
  const R = 120,
    M = 20,
    rand = mulberry32(20261109),
    gauss = () => {
      const u = 1 - rand(),
        v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
  const cl = x => Math.max(1, Math.min(5, x));
  const list = ents.filter(listable),
    D = list.map(() => new Float32Array(R)),
    S0 = list.map(e => e.score); // the scores these ranges belong to (see carryRanges)
  for (let r = 0; r < R; r++) {
    if (r) yield;
    list.forEach((e, i) => {
      D[i][r] = scoreWith(e, k => {
        const v = e.v[k];
        if (v == null) return null;
        if (e.how[k] === 'imp') {
          const d = e.dr[k];
          return d ? d[r % d.length] : cl(v + (e.sd[k] || 0) * gauss());
        }
        if (useME && e.how[k] === 'obs' && e.me[k]) return cl(v + e.me[k] * gauss());
        return v;
      });
    });
  }
  const q = (a, p) => a[Math.min(a.length - 1, Math.max(0, Math.round(p * (a.length - 1))))];
  for (let i = 0; i < list.length; i++) {
    if (i % 48 === 47) yield;
    const e = list[i];
    const s = Array.from(D[i]).sort((a, b) => a - b);
    e.lo = Math.round(q(s, 0.1));
    e.hi = Math.round(q(s, 0.9));
    e.med = Math.round(q(s, 0.5));
    e.sim0 = { lo: e.lo, hi: e.hi, med: e.med, score: S0[i] };
    e.rk = [];
    e.pFit = e.cap && e.cap !== 'fit' ? 0 : D[i].filter(x => x >= CUT.fit).length / R;
    // Rubin's rules: score each of the 20 completed datasets; total variance = within (measurement error) + (1 + 1/M) x between
    const hasDr = Object.keys(e.dr || {}).some(k => e.dr[k] && W[k] > 0);
    let B = 0;
    if (hasDr) {
      const Q = [];
      for (let m = 0; m < M; m++)
        Q.push(scoreWith(e, k => (e.how[k] === 'imp' && e.dr[k] ? e.dr[k][m] : e.v[k])));
      B = d3.variance(Q) || 0;
    }
    let sw = 0,
      U = 0;
    FACTORS.forEach(f => {
      if (W[f.k] > 0 && e.v[f.k] != null) sw += W[f.k];
    });
    if (useME)
      FACTORS.forEach(f => {
        const k = f.k;
        if (W[k] > 0 && e.v[k] != null && e.how[k] === 'obs' && e.me[k]) {
          const sc = norm && NORMM === 'z' ? 1 / (STATS[k].sd || 1) : 1;
          U += Math.pow((W[k] / sw) * 25 * e.me[k] * sc, 2);
        }
      });
    e.rubin = { sd: Math.sqrt(U + (1 + 1 / M) * B), between: Math.sqrt(B), within: Math.sqrt(U) };
  }
  SIM = { R };
  const K = new Float64Array(list.length);
  for (const tp of ['city', 'country']) {
    const idx = list.map((e, i) => i).filter(i => list[i].type === tp);
    for (let r = 0; r < R; r++) {
      yield;
      // verdict first, then score: one number per place, worked out once per run, not once per comparison
      idx.forEach(i => (K[i] = TR[tierAt(D[i][r], list[i])] * 1000 - D[i][r]));
      const ord = idx.slice().sort((a, b) => K[a] - K[b]);
      ord.forEach((i, pos) => list[i].rk.push(pos + 1));
    }
    idx.forEach(i => {
      const s = list[i].rk.sort((a, b) => a - b);
      list[i].rlo = q(s, 0.1);
      list[i].rhi = q(s, 0.9);
      list[i].rn = idx.length;
      list[i].pTop = s.filter(x => x <= 10).length / R;
      delete list[i].rk;
    });
  }
}
function simulate() {
  SIMJOB++;
  for (const _ of simSteps());
  document.documentElement.dataset.sim = 'done';
}
// The same simulation in the background: about 10 ms of work, then a pause so taps and scrolling get through.
// Anything that changes the scores (recompute) cancels a run in progress; done() is called only if it finished.
let SIMJOB = 0;
function simulateSoon(done) {
  const my = ++SIMJOB,
    it = simSteps();
  document.documentElement.dataset.sim = 'busy';
  const step = () => {
    if (my !== SIMJOB) return;
    const t = performance.now();
    let r;
    do r = it.next();
    while (!r.done && performance.now() - t < 10);
    if (!r.done) return setTimeout(step, 0);
    document.documentElement.dataset.sim = 'done';
    if (done) done();
  };
  setTimeout(step, 40);
}
// Until a background run finishes, each place keeps its last likely range, moved by however much its score just changed.
// The width of a range comes from how well a place is measured, which a change of weights barely alters, so the order
// on screen is already close to final and rarely moves when the new ranges arrive.
function carryRanges() {
  ents.forEach(e => {
    const s = e.sim0;
    if (!s) return;
    const d = e.score - s.score;
    e.lo = s.lo + d;
    e.hi = s.hi + d;
    e.med = s.med + d;
  });
}
// for hybrid work, a city also gets the job market of the best hub within 120 km (about 1.5 hours)
function applyReach() {
  if (!REACH) return;
  const cs = ents.filter(e => e.type === 'city' && e.hasGeo);
  cs.forEach(e => {
    e.hub = null;
    let best = e.v.jobs ?? -1;
    cs.forEach(o => {
      if (o === e || o.how.jobs !== 'obs' || o.v.jobs == null) return;
      if (km([e.lat0, e.lon0], [o.lat0, o.lon0]) <= 120 && o.v.jobs > best) {
        best = o.v.jobs;
        e.hub = o;
      }
    });
    if (e.hub) {
      e.v.jobs = best;
      e.how.jobs = 'obs';
      e.sd.jobs = 0;
      e.me.jobs = ME.jobs;
      e.dr.jobs = null;
    }
  });
}
function recompute(fast) {
  SIMJOB++; // a background simulation of the old scores is out of date
  applyPersonal();
  ents.forEach(resolve);
  applyReach();
  computeStats();
  ents.forEach(e => Object.assign(e, evaluate(e)));
  if (!fast) simulate();
}
// test hook: lets tests/robustness.py re-score with other weights without the UI
window.__atlas = {
  ents: () => ents,
  listable: e => listable(e),
  getW: () => ({ ...W }),
  setW: o => {
    W = { ...o };
  },
  setNorm: b => {
    norm = b;
  },
  setImp: b => {
    useImp = b;
  },
  presets: () => PRESETS,
  setAgg: v => {
    AGG = v;
  },
  setNormM: v => {
    NORMM = v;
  },
  setWarp: v => {
    WARPG = v;
  },
  setRankBy: v => {
    RANKBY = v;
  },
  setCont: b => {
    useCont = b;
  },
  quick: () => {
    applyPersonal();
    ents.forEach(resolve);
    applyReach();
    computeStats();
    ents.forEach(e => Object.assign(e, evaluate(e), { lo: null }));
  },
  full: () => recompute(),
  adFull: () => adFull(),
  sim: () => SIM,
  strings: () => ({ STR, QSTR, FSTR }),
};
function homesFromKeys(keys) {
  return (keys || []).map(k => byKey[k] || ents.find(x => x.name === k)).filter(e => e && e.hasGeo);
}
// Adriano's scores under his own settings, for the comparisons. Scores and verdicts are worked out on the spot. His
// likely ranges (which order "Adriano's top 5" and the line in the hero) come from adSimSoon, in the background, from
// the inputs frozen here: the visitor's settings can change underneath without disturbing that run.
let AD_FULL = false,
  AD_IN = null,
  ADJOB = 0;
function snapshotAdriano() {
  const save = {
    POLMODE,
    W,
    HOMES,
    LANGMODE,
    PERMMODE,
    FIELD,
    PAYLVL,
    CLIMMODE,
    gate,
    gateOpen,
    norm,
    gateFar,
    gateHot,
    gateSmall,
    useEst,
    useImp,
    REACH,
    HAPPYMODE,
    AGG,
    NORMM,
  };
  W = { ...PRESETS.mine };
  HOMES = homesFromKeys(ADRIANO_HOMES);
  LANGMODE = 'both';
  PERMMODE = 'usmx';
  FIELD = 'tech';
  PAYLVL = 1;
  CLIMMODE = 'mild';
  POLMODE = 'd';
  gate = gateOpen = norm = gateFar = gateHot = gateSmall = true;
  useEst = false;
  useImp = true;
  REACH = false;
  HAPPYMODE = 'report';
  AGG = 'mean';
  NORMM = 'z';
  applyHomes();
  recompute(true);
  ents.forEach(e => {
    e.ad = { score: e.score, tier: e.tier, lo: null, hi: null, med: null };
  });
  // resolve() and computeStats() make new objects every time, so these stay as they are now
  AD_IN = {
    W,
    STATS,
    useME,
    list: ents.filter(listable).map(e => ({ e, v: e.v, how: e.how, sd: e.sd, dr: e.dr, me: e.me })),
  };
  AD_FULL = false;
  ADJOB++;
  ({
    POLMODE,
    W,
    HOMES,
    LANGMODE,
    PERMMODE,
    FIELD,
    PAYLVL,
    CLIMMODE,
    gate,
    gateOpen,
    norm,
    gateFar,
    gateHot,
    gateSmall,
    useEst,
    useImp,
    REACH,
    HAPPYMODE,
    AGG,
    NORMM,
  } = save);
  applyHomes();
  recompute(true);
  carryRanges();
}
// The same 120 recalculations as simSteps, for Adriano's frozen inputs: his settings are z-scores and a weighted mean.
function* adSimSteps(A) {
  const R = 120,
    rand = mulberry32(20261109),
    gauss = () => {
      const u = 1 - rand(),
        v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    cl = x => Math.max(1, Math.min(5, x));
  const score = pick => {
    let t = 0,
      sw = 0;
    for (const f of FACTORS) {
      const w = A.W[f.k];
      if (!(w > 0)) continue;
      const x = pick(f.k);
      if (x == null) continue;
      const st = A.STATS[f.k];
      t += (w * (cl(3 + (warp(x) - st.m) / st.sd) - 1)) / 4;
      sw += w;
    }
    return sw ? (t / sw) * 100 : 0;
  };
  const D = A.list.map(() => new Float32Array(R));
  for (let r = 0; r < R; r++) {
    if (r) yield;
    A.list.forEach((o, i) => {
      D[i][r] = score(k => {
        const v = o.v[k];
        if (v == null) return null;
        if (o.how[k] === 'imp') {
          const d = o.dr[k];
          return d ? d[r % d.length] : cl(v + (o.sd[k] || 0) * gauss());
        }
        if (A.useME && o.how[k] === 'obs' && o.me[k]) return cl(v + o.me[k] * gauss());
        return v;
      });
    });
  }
  const q = (a, p) => a[Math.min(a.length - 1, Math.max(0, Math.round(p * (a.length - 1))))];
  A.list.forEach((o, i) => {
    const s = Array.from(D[i]).sort((a, b) => a - b);
    Object.assign(o.e.ad, {
      lo: Math.round(q(s, 0.1)),
      hi: Math.round(q(s, 0.9)),
      med: Math.round(q(s, 0.5)),
    });
  });
}
// all at once (tests)
function adFull() {
  if (AD_FULL) return;
  ADJOB++;
  for (const _ of adSimSteps(AD_IN));
  AD_FULL = true;
}
// in the background, the first time something that ranks places Adriano's way is on screen
function adSimSoon() {
  if (AD_FULL || adSimSoon.job === ADJOB) return;
  const my = (adSimSoon.job = ADJOB),
    it = adSimSteps(AD_IN);
  const step = () => {
    if (my !== ADJOB) return;
    const t = performance.now();
    let r;
    do r = it.next();
    while (!r.done && performance.now() - t < 8);
    if (!r.done) return setTimeout(step, 0);
    AD_FULL = true;
    if (typeof heroNow === 'function') heroNow();
    if (typeof renderVs === 'function' && document.body.classList.contains('adv')) renderVs();
  };
  setTimeout(step, 500);
}
HOMES = homesFromKeys(ADRIANO_HOMES);
applyHomes();
recompute(true);
snapshotAdriano();
