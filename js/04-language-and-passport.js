'use strict';
/* ---------------- language and passport ---------------- */
let LANGMODE = 'both',
  PERMMODE = 'usmx',
  FIELD = 'tech',
  CLIMMODE = 'mild',
  POLMODE = 'd',
  // the person's kind of work (an index into JOBS; -1 = not said), set by the quiz's job question
  PAYJOB = -1;
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
  // warmth 1 (coldest) to 5 (hottest); 'cool' = four seasons, 'cold' = the colder the better
  return m === 'warm' ? [0, 1, 2, 4, 5, 5][w] : m === 'cold' ? [0, 5, 4, 3, 2, 1][w] : [0, 3, 5, 4, 2, 1][w];
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
// ---- kinds of work, and what each pays next to average pay ----
// [id, how the job market is judged (see fieldJobs), US annual mean wage, ISCO-08 group(s)].
// The wage is the occupation group's annual mean in the US Bureau of Labor Statistics' Occupational Employment and Wage
// Statistics, May 2025 (released 15 May 2026; all occupations: $69,770). It is used for US places without metro figures.
// The last entry points into a country's row of ILOSTAT figures (DATA.jobpay.c): 1 professionals, 2 technicians and
// associate professionals, 3 clerical support, 4 service and sales, 5 craft and related trades, 6 plant and machine
// operators, 7 elementary occupations. Two numbers: the mean of both.
const ALLPAY = 69770;
const JOBS = [
  ['food', 'general', 37150, 4], // food preparation and serving related
  ['store', 'general', 37310, 4], // retail salespersons
  ['trades', 'general', 64370, 5], // construction and extraction + installation, maintenance and repair, weighted by employment
  ['drive', 'general', 49850, 6], // transportation and material moving
  ['factory', 'general', 51600, 6], // production
  ['clean', 'general', 40880, 7], // building and grounds cleaning and maintenance
  ['beauty', 'general', 41070, 4], // personal care and service
  ['care', 'general', 40800, 4], // healthcare support
  ['medical', 'health', 108700, 1], // healthcare practitioners and technical
  ['teach', 'general', 67540, 1], // educational instruction and library
  ['office', 'general', 51560, 3], // office and administrative support
  ['tech', 'tech', 115680, 1], // computer and mathematical + architecture and engineering, weighted by employment
  ['biz', 'finance', 95230, [1, 2]], // business and financial operations
  ['art', 'creative', 79790, 1], // arts, design, entertainment, sports and media
  ['sci', 'academia', 94600, 1], // life, physical and social science
  ['farm', 'general', 41510, 7], // farming, fishing and forestry (hired farm work is an elementary occupation in ISCO-08)
  ['guard', 'general', 60720, 4], // protective service
  ['other', 'general', ALLPAY, 0],
];
// DATA.jobpay (pipeline/sources/job_pay.py): c = country -> [year, the seven ISCO groups per 1,000 of average pay]
// (year 0: an estimate from nine similar countries); m = US city -> the 17 kinds of work above, from its metro area.
const JOBPAY = DATA.jobpay || { c: {}, m: {} };
// What the person's kind of work pays in this place, as a share of average pay there, from the closest published
// figure: the US metro area, the US as a whole, the country, or (flagged) similar countries. null: nothing to go on.
function jobShare(e, j = PAYJOB) {
  const J = JOBS[j];
  if (!J || !J[3]) return null;
  const iso = +isoOf(e);
  if (iso === 840) {
    const m = e.type === 'city' ? JOBPAY.m[e.name] : null;
    return m && m[j] > 0 ? { r: m[j] / 1000, src: 'metro' } : { r: J[2] / ALLPAY, src: 'us' };
  }
  const c = JOBPAY.c[iso];
  if (!c) return null;
  const xs = []
    .concat(J[3])
    .map(i => c[i])
    .filter(x => x > 0);
  if (!xs.length) return null;
  return { r: xs.reduce((a, b) => a + b, 0) / xs.length / 1000, src: c[0] ? 'country' : 'est', y: c[0] };
}
// ---- money left after rent, for the person's kind of work ----
// The published figure is for an average salary. A cook and a software developer pay the same rent, so with typical pay
// at a share r of average the figure becomes (r × pay − rent) ÷ prices. It is judged against the same cut-offs,
// scaled by r (what is left as a share of that paycheck): (pay − rent ÷ r) ÷ prices against $3,000 / 2,000 / 1,200 / 500.
// Only places with separate pay and rent figures can be re-worked; the rest keep their published score.
const MONEY_KNOTS = [
  [500, 1.5],
  [1200, 2.5],
  [2000, 3.5],
  [3000, 4.5],
];
// the same ladder as pipeline/bands.py b_money: straight lines through the cut-offs, held between 1 and 5
function moneyScore(x) {
  const K = MONEY_KNOTS;
  let i = 0;
  while (i < K.length - 2 && x >= K[i + 1][0]) i++;
  const c = K[i][1] + ((K[i + 1][1] - K[i][1]) * (x - K[i][0])) / (K[i + 1][0] - K[i][0]);
  return Math.round(Math.max(1, Math.min(5, c)) * 100) / 100;
}
let CMONEY = null;
// [money left on average pay, rent], both a month and in New York prices. A country: the mean of its cities with
// Numbeo figures, which is how its published figure is made (pipeline/score_published.py).
function moneyParts(e) {
  if (e.type === 'city') {
    const m = MONEYD[e.name];
    return m ? [(m[0] - m[1]) / (m[2] / 100), m[1] / (m[2] / 100)] : null;
  }
  if (!CMONEY) {
    CMONEY = {};
    ents.forEach(c => {
      const m = c.type === 'city' ? MONEYD[c.name] : null;
      if (!m || m[3] === 'acs') return;
      const t = (CMONEY[+c.iso] = CMONEY[+c.iso] || [0, 0, 0]);
      t[0] += (m[0] - m[1]) / (m[2] / 100);
      t[1] += m[1] / (m[2] / 100);
      t[2]++;
    });
  }
  const t = CMONEY[+e.id];
  return t ? [t[0] / t[2], t[1] / t[2]] : null;
}
// dollars a month left after rent on typical pay for that work (New York prices); null without pay and rent figures
function moneyLeftAt(e, r) {
  let p = moneyParts(e);
  // a city scored with its country's figure moves with its country
  if (!p && e.type === 'city' && e.countryEnt && !(RAWD['city:' + e.name] || {}).pay)
    p = moneyParts(e.countryEnt);
  return p ? r * p[0] - (1 - r) * p[1] : null;
}
// Most places have no pay and rent figures of their own: their pay value is filled in by the gap-filling model, or is
// a country figure without rent. They move with their country: the amount (on the 1-5 scale) by which the country's
// figure changes when it is re-worked for the person's kind of work. A country without city figures takes the middle
// shift of its world region's countries (three or more), else the world's.
// Checked on the 260 cities that do have figures, each predicted from its country alone: off by 0.45 of a point for
// food service, 0.26 for driving, 0.22 for office work, 0.14 for computing. Leaving such places untouched would be off
// by 1.31, 0.60, 0.50 and 0.45, and would make every place without figures look better to lower-paid workers.
let PAYSHIFT = { job: null };
function payShift(e) {
  if (PAYSHIFT.job !== PAYJOB) {
    const own = c => {
      const sh = jobShare(c),
        p = moneyParts(c);
      return sh && p ? moneyScore((sh.r * p[0] - (1 - sh.r) * p[1]) / sh.r) - moneyScore(p[0]) : null;
    };
    const cs = ents.filter(c => c.type === 'country').map(c => [+c.id, own(c)]),
      has = cs.filter(x => x[1] != null);
    PAYSHIFT = { job: PAYJOB, by: {} };
    for (const [id, d] of cs) {
      const reg = has.filter(x => REG[x[0]] && REG[x[0]] === REG[id]).map(x => x[1]),
        pool = reg.length >= 3 ? reg : has.map(x => x[1]);
      PAYSHIFT.by[id] = d != null ? d : pool.length ? d3.median(pool) : 0;
    }
  }
  return PAYSHIFT.by[+isoOf(e)] || 0;
}
function payFor(e, f) {
  e.payAdj = false;
  if (f === 'remote') return e.cost || e.base.pay;
  const sh = e.base.pay != null ? jobShare(e) : null;
  if (sh) {
    const x = moneyLeftAt(e, sh.r);
    if (x != null) {
      e.payAdj = true;
      return moneyScore(x / sh.r);
    }
  }
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
// world region by country number (the data file's keys are zero-padded: "076")
const REG = {};
for (const k in DATA.region || {}) REG[+k] = DATA.region[k];
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
  if (typeof m === 'string' && m.startsWith('P:'))
    return m.slice(2).split(';')[0].split(',').map(Number).filter(Boolean);
  return [];
}
// countries where the person may already work without holding the passport (a resident, a work permit): "P:484;R:840"
function resSpec(m) {
  const r = typeof m === 'string' ? /;R:([\d,]+)/.exec(m) : null;
  return r ? r[1].split(',').map(Number).filter(Boolean) : [];
}
function passCode(ps, res) {
  const s = [...new Set(ps)].sort((a, b) => a - b),
    r = [...new Set(res || [])].filter(n => n && !s.includes(n));
  if (!r.length)
    for (const [c, v] of Object.entries(LEGACY_PM))
      if (v.length === s.length && [...v].sort((a, b) => a - b).every((x, i) => x === s[i])) return c;
  // no passports given means none, never Adriano's (an empty 'P:' reads back as [])
  return 'P:' + s.join(',') + (r.length ? ';R:' + r.join(',') : '');
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
  if (resSpec(m).includes(+n)) return 5; // allowed to work there already
  if (!LEGACY_PM[m] && m !== 'eu') return permRule(n, passSpec(m))[0];
  if (m === 'us') return PERM_US[n] ?? b;
  if (m === 'mx') return PERM_MX[n] ?? b;
  if (m === 'eu') return EU.has(n) ? 5 : (PERM_EU[n] ?? 2);
  return b;
}
