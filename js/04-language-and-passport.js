'use strict';
/* ---------------- language and passport ---------------- */
let LANGMODE = 'both',
  PERMMODE = 'usmx',
  FIELD = 'tech',
  CLIMMODE = 'mild',
  POLMODE = 'd';
const POLM = DATA.pol || {},
  TMEAN = DATA.tmean || {},
  THOT = DATA.thot || {};
// US state politics: band from the 2024 margin, in the direction the user prefers ('d' or 'r'); places outside the US have no value
function polBand(x) {
  return x >= 20 ? 5 : x >= 8 ? 4 : x >= -3 ? 3 : x >= -12 ? 2 : 1;
}
// the state sets most laws, the county is daily life: the two 2024 results count equally
function polFor(e) {
  const m = e.type === 'city' ? POLM[e.name] : null;
  if (m == null) return null;
  const sg = POLMODE === 'r' ? -1 : 1,
    c = POLC[e.name],
    a = polBand(sg * m);
  return c == null ? a : (a + polBand(sg * c)) / 2;
}
const FIELD_IDX = { finance: 0, health: 1, creative: 2, academia: 3 };
const HIGHLAND = new Set([
  'city:Mexico City',
  'city:Bogotá',
  'city:Medellín',
  'city:Nairobi',
  'city:Kigali',
  'city:San José (Costa Rica)',
  'city:Guadalajara',
  'city:Querétaro',
  'city:Quito',
  'city:Puebla',
  'country:484',
  'country:170',
  'country:404',
  'country:646',
  'country:188',
  'country:68',
  'country:218',
]);
function warmth(e) {
  const tm = e.type === 'city' ? TMEAN[e.name] : null;
  if (tm != null) return tm >= 24 ? 5 : tm >= 19 ? 4 : tm >= 14 ? 3 : tm >= 9 ? 2 : 1;
  if (HIGHLAND.has(e.key)) return 3;
  const a = Math.abs(e.lat0);
  return a < 20 ? 5 : a < 30 ? 4 : a < 40 ? 3 : a < 50 ? 2 : 1;
}
function climFor(e, m) {
  if (e.base.clim == null) return null;
  if (m === 'mild' || !e.hasGeo) return e.base.clim;
  const w = warmth(e);
  return m === 'warm' ? [0, 1, 2, 4, 5, 5][w] : [0, 3, 5, 4, 2, 1][w];
}
function jobsFor(e, f) {
  return e.base.jobs;
}
function fieldJobs(e) {
  const i = FIELD_IDX[FIELD];
  if (i == null || !e.fields) return null;
  const v = +e.fields[i];
  return v > 0 ? v : null;
}
function payFor(e, f) {
  if (f === 'remote') return e.cost || e.base.pay;
  return e.base.pay;
}
const EU = new Set([
  40, 56, 100, 191, 196, 203, 208, 233, 246, 250, 276, 300, 348, 372, 380, 428, 440, 442, 528, 616, 620, 642,
  703, 705, 724, 752,
]);
const PERM_EU = { 756: 4, 578: 4, 352: 4, 826: 3, 840: 2, 124: 3, 36: 3, 554: 3, 484: 3 };
const ES_COUNTRIES = new Set([
  724, 484, 320, 340, 222, 558, 188, 591, 192, 214, 630, 170, 862, 218, 604, 68, 600, 858, 32, 152, 226,
]);
const EN_IN_ES = { 724: 3, 32: 3, 188: 3, 591: 3, 630: 5 };
const EN_CITY = {
  Madrid: 3,
  Barcelona: 3,
  'Mexico City': 3,
  'Buenos Aires': 3,
  Santiago: 3,
  'San José (Costa Rica)': 3,
  'Panama City': 3,
  Tampico: 1,
};
const ES_US_CITY = {
  Miami: 5,
  Houston: 4,
  'Los Angeles': 4,
  'New York City': 4,
  'San Diego': 4,
  Phoenix: 3,
  Chicago: 3,
  Austin: 3,
};
const ES_NEAR = { 620: 2, 76: 2, 380: 2 };
const PERM_US = { 484: 3, 724: 2, 36: 4, 554: 4, 372: 3, 124: 4, 826: 4 };
const PERM_MX = { 840: 2, 36: 2, 372: 2, 554: 3, 124: 4, 826: 4, 484: 5, 724: 3 };
const isoOf = e => (e.type === 'city' ? e.iso : e.id);
function engScore(e) {
  const n = isoOf(e);
  if (ES_COUNTRIES.has(n)) return (e.type === 'city' && EN_CITY[e.name]) || EN_IN_ES[n] || 2;
  return e.base.lang;
}
function spaScore(e) {
  const n = isoOf(e);
  if (ES_COUNTRIES.has(n)) return n === 226 ? 4 : 5;
  if (n === 840) return e.type === 'city' ? ES_US_CITY[e.name] || 2 : 3;
  return ES_NEAR[n] || 1;
}
function okayEng(s) {
  return s >= 5 ? 4 : s >= 4 ? 3 : Math.max(1, s - 1);
}
// ---- any languages: the setting is either one of the original quiz answers (kept so old links give the same result)
// or "L:fr2,de1": each language the person speaks, 2 = fluent, 1 = some. Where each language works: DATA.langs (pipeline/sources/languages.py)
const LANGT = DATA.langs || { names: {}, country: {}, city: {} };
const LANG_PICK = ['en', 'es', ...Object.keys(LANGT.names)];
const LANG_NATIVE = {
  en: 'English',
  es: 'Español',
  ...Object.fromEntries(Object.entries(LANGT.names).map(([k, v]) => [k, v[1]])),
};
const LEGACY_LM = {
  both: { en: 2, es: 2 },
  en: { en: 2 },
  enok: { en: 1 },
  es: { es: 2 },
  esen: { es: 2, en: 1 },
};
function langSpec(m) {
  if (LEGACY_LM[m]) return { ...LEGACY_LM[m] };
  const o = {};
  if (typeof m === 'string' && m.startsWith('L:'))
    m.slice(2)
      .split(',')
      .forEach(p => {
        const r = /^([a-z]{2})([12])$/.exec(p);
        if (r) o[r[1]] = +r[2];
      });
  return o;
}
function langCode(o) {
  const ks = Object.keys(o).filter(k => o[k]);
  if (!ks.length) return 'en';
  for (const [c, v] of Object.entries(LEGACY_LM))
    if (ks.length === Object.keys(v).length && ks.every(k => v[k] === o[k])) return c;
  return 'L:' + ks.map(k => k + o[k]).join(',');
}
function otherLang(e, l) {
  const c = e.type === 'city' ? (LANGT.city[e.name] || {})[l] : null;
  if (c) return c;
  return (LANGT.country[l] || {})[isoOf(e)] || 1;
}
const langLevel = (e, l) => (l === 'en' ? engScore(e) : l === 'es' ? spaScore(e) : otherLang(e, l));
// the languages a browser says its user reads, as a starting guess for the quiz
function browserLangs() {
  const o = {};
  (navigator.languages || [navigator.language || 'en']).forEach(t => {
    let k = (t || '').toLowerCase().slice(0, 2);
    if (k === 'ur') k = 'hi';
    if (k === 'id') k = 'ms';
    if (k === 'sk') k = 'cs';
    if (LANG_PICK.includes(k)) o[k] = 2;
  });
  return Object.keys(o).length ? o : { en: 2 };
}
function langFor(e, m) {
  if (e.base.lang == null) return null;
  if (!LEGACY_LM[m] && m !== 'both') {
    const o = langSpec(m);
    let best = 1;
    for (const [l, lv] of Object.entries(o)) {
      const s = langLevel(e, l);
      best = Math.max(best, lv === 2 ? s : okayEng(s));
    }
    return best;
  }
  switch (m) {
    case 'en':
      return engScore(e);
    case 'enok':
      return okayEng(engScore(e));
    case 'es':
      return spaScore(e);
    case 'esen':
      return Math.max(spaScore(e), okayEng(engScore(e)));
    default:
      return e.base.lang;
  }
}
// ---- cultural familiarity: a rule built on facts, not a measurement of how welcome anyone will feel.
// "Where you're from" = the countries of your passports and home bases. 5 = one of those countries; 4 = shares a main
// language and a world region with one; 3 = shares either; 1 = neither. A language is shared when it's a main language
// of the origin country and widely used (level 4+) in the destination city. Regions: World Bank regions (pipeline/sources/economy.py).
const REG = DATA.region || {};
function mainLangs(n) {
  const c = byIso[n],
    o = [];
  if (!c || !c.base) return o;
  if (engScore(c) >= 5) o.push('en');
  if (spaScore(c) >= 5) o.push('es');
  for (const [l, t] of Object.entries(LANGT.country)) if (t[n] >= 5) o.push(l);
  return o;
}
const origins = () => [...new Set([...passSpec(PERMMODE), ...HOMES.map(h => +isoOf(h)).filter(Boolean)])];
function kinFor(e) {
  const n = +isoOf(e),
    os = origins();
  e.kinWhy = null;
  if (!n || !os.length) return null;
  if (os.includes(n)) {
    e.kinWhy = [n];
    return 5;
  }
  // the destination's languages are taken at city level, so Spanish-speaking Miami or Los Angeles count for someone from Mexico
  const ml = new Set(LANG_PICK.filter(l => langLevel(e, l) >= 4)),
    rg = REG[n];
  let best = 1,
    why = [];
  for (const o of os) {
    const lang = mainLangs(o).some(l => ml.has(l)),
      reg = rg && REG[o] === rg,
      v = lang && reg ? 4 : lang || reg ? 3 : 1;
    if (v > best) {
      best = v;
      why = [o];
    } else if (v === best && v > 1) why.push(o);
  }
  e.kinWhy = why;
  return best;
}
// ---- any passports: one of the original answers (us, mx, usmx, eu) or "P:250,076" (ISO numeric codes).
// Rules: DATA.work (pipeline/sources/work_rights.py): citizenship, free-movement zones, nationality routes, and the normal route.
const WORK = DATA.work || { zones: [], routes: [], anyone: {} };
const LEGACY_PM = { usmx: [840, 484], us: [840], mx: [484] };
function passSpec(m) {
  if (LEGACY_PM[m]) return LEGACY_PM[m].slice();
  if (m === 'eu') return [...EU];
  if (typeof m === 'string' && m.startsWith('P:')) return m.slice(2).split(',').map(Number).filter(Boolean);
  return [];
}
function passCode(ps) {
  const s = [...new Set(ps)].sort((a, b) => a - b);
  for (const [c, v] of Object.entries(LEGACY_PM))
    if (v.length === s.length && [...v].sort((a, b) => a - b).every((x, i) => x === s[i])) return c;
  return s.length ? 'P:' + s.join(',') : 'usmx';
}
function permRule(n, ps) {
  n = +n;
  let best = (WORK.anyone[n] || [2])[0],
    why = (WORK.anyone[n] || [0, ''])[1];
  for (const p of ps) {
    if (p === n) return [5, 'citizen'];
    for (const [nm, l, cs] of WORK.zones)
      if (l > best && cs.includes(p) && cs.includes(n)) {
        best = l;
        why = nm;
      }
    for (const [d, l, cs, r] of WORK.routes)
      if (d === n && l > best && cs.includes(p)) {
        best = l;
        why = r;
      }
    const t = p === 840 ? PERM_US : p === 484 ? PERM_MX : null;
    if (t && t[n] != null && t[n] > best) {
      best = t[n];
      why = '';
    }
  }
  return [best, why];
}
function permFor(e, m) {
  const b = e.base.perm;
  if (b == null) return null;
  const n = isoOf(e);
  if (!LEGACY_PM[m] && m !== 'eu') return permRule(n, passSpec(m))[0];
  if (m === 'us') return PERM_US[n] ?? b;
  if (m === 'mx') return PERM_MX[n] ?? b;
  if (m === 'eu') return EU.has(n) ? 5 : (PERM_EU[n] ?? 2);
  return b;
}
