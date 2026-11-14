'use strict';
/* ---------------- factors, presets, styles ---------------- */
const FACTORS = [
  { k: 'home', i: 16 },
  { k: 'jobs', i: 1 },
  { k: 'hlth', i: 2 },
  { k: 'commute', i: 15 },
  { k: 'move', i: 5 },
  { k: 'happy', i: 11 },
  { k: 'cult', i: 7 },
  { k: 'open', i: 9 },
  { k: 'pay', i: 8 },
  { k: 'hours', i: 19 },
  { k: 'clim', i: 0 },
  { k: 'day', calc: true },
  { k: 'air', i: 17 },
  { k: 'risk', i: 20 },
  { k: 'free', i: 3 },
  { k: 'safe', i: 4 },
  { k: 'honest', i: 18 },
  { k: 'women', i: 12 },
  { k: 'lgbt', i: 13 },
  { k: 'pol', calc: true },
  { k: 'perm', i: 10 },
  { k: 'lang', i: 6 },
  { k: 'fam', calc: true },
  { k: 'kin', calc: true },
];
const TECHL = {
  en: ['Tech job market', 'Weak tech job market'],
  es: ['Mercado laboral tech', 'Mercado laboral tech débil'],
};
const FS = k =>
  k === 'jobs' && FIELD === 'tech'
    ? (STR[LANG] || {}).techl || TECHL[BASE_LANG()]
    : (FSTR[LANG] || {})[k] || FSTR.en[k];
const FL = k => FS(k)[0],
  FD = k => FS(k)[1];
const PRESETS = {
  // money left after rent covers rent; housing is only about availability
  mine: {
    pol: 1.25,
    home: 1,
    jobs: 2.25,
    commute: 2,
    move: 2.5,
    hlth: 2.25,
    happy: 1,
    cult: 1.5,
    open: 1.5,
    pay: 1.75,
    clim: 2.25,
    day: 1,
    free: 1.5,
    safe: 1,
    perm: 1,
    lang: 0.75,
    fam: 1.5,
    women: 1,
    lgbt: 1,
    air: 1,
    honest: 1,
    hours: 1,
    risk: 1,
  },
  career: {
    pol: 0,
    home: 1.5,
    commute: 1,
    move: 1.5,
    hlth: 1,
    happy: 0.5,
    cult: 1.5,
    open: 1,
    pay: 2.5,
    clim: 0.75,
    jobs: 3,
    day: 0.5,
    free: 1.25,
    safe: 1,
    perm: 2,
    lang: 1,
    fam: 0.5,
    women: 0.5,
    lgbt: 0.5,
    air: 0.75,
    honest: 1,
    hours: 0.5,
    risk: 0.75,
  },
  balance: {
    pol: 0,
    home: 2,
    commute: 1.5,
    move: 1.5,
    hlth: 3,
    happy: 2,
    cult: 1,
    open: 2,
    pay: 1,
    clim: 1.5,
    jobs: 0.75,
    day: 1.5,
    free: 1.5,
    safe: 1.5,
    perm: 1,
    lang: 1,
    fam: 1,
    women: 1,
    lgbt: 1,
    air: 1.5,
    honest: 1,
    hours: 2,
    risk: 1.5,
  },
  equal: { ...Object.fromEntries(FACTORS.map(f => [f.k, 1])), pol: 0, kin: 0 },
};
// cultural familiarity is off unless the person turns it up
for (const p of Object.values(PRESETS)) if (p.kin == null) p.kin = 0;
const CALC = new Set(['day', 'fam', 'pol', 'kin']),
  RULES = new Set(['perm', 'lang']);
const FEEDBACK_URL = '';
let useEst = false,
  useImp = true,
  TRIPS = {};
const IMPUTABLE = new Set([
  'clim',
  'hlth',
  'free',
  'safe',
  'move',
  'pay',
  'open',
  'happy',
  'women',
  'lgbt',
  'commute',
  'jobs',
  'home',
  'air',
  'honest',
  'hours',
  'risk',
]);
const CRUCIAL = ['home', 'jobs', 'hlth', 'safe', 'free', 'pay'];
// Every factor sits under exactly one of three goals
const GOALS = {
  growth: ['jobs', 'pay', 'perm', 'lang'],
  happiness: ['happy', 'open', 'cult', 'clim', 'day', 'fam', 'kin', 'women', 'lgbt', 'pol', 'hours'],
  ease: ['home', 'commute', 'move', 'hlth', 'safe', 'free', 'air', 'honest', 'risk'],
};
const GOALOF = Object.fromEntries(Object.entries(GOALS).flatMap(([g, ks]) => ks.map(k => [k, g])));
// The main drawback, grouped into 8 colors (Okabe-Ito palette, safe for color blindness)
const GROUP = {
  pay: 'money',
  home: 'housing',
  jobs: 'jobs',
  hours: 'jobs',
  air: 'climate',
  risk: 'climate',
  honest: 'rights',
  perm: 'jobs',
  clim: 'climate',
  day: 'climate',
  commute: 'around',
  move: 'around',
  free: 'rights',
  safe: 'rights',
  women: 'rights',
  lgbt: 'rights',
  pol: 'rights',
  hlth: 'rights',
  open: 'people',
  happy: 'people',
  cult: 'people',
  lang: 'people',
  kin: 'people',
  fam: 'distance',
  none: 'none',
};
const GROUPS = ['money', 'housing', 'jobs', 'climate', 'around', 'rights', 'people', 'distance', 'none'];
const GROUPCOL = {
  money: '#E69F00',
  housing: '#56B4E9',
  jobs: '#009E73',
  climate: '#F0E442',
  around: '#0072B2',
  rights: '#D55E00',
  people: '#CC79A7',
  distance: '#8c6d46',
  none: '#9aa6af',
};
// Assumed measurement error of published values, points on the 1-5 scale (crowd surveys about 0.5, official statistics about 0.25)
const ME = {
  home: 0.4,
  pay: 0.5,
  cost: 0.5,
  commute: 0.5,
  move: 0.5,
  clim: 0.3,
  safe: 0.35,
  hlth: 0.35,
  free: 0.25,
  jobs: 0.25,
  open: 0.5,
  happy: 0.3,
  women: 0.25,
  lgbt: 0.25,
  cult: 0.25,
  air: 0.25,
  honest: 0.25,
  hours: 0.3,
  risk: 0.3,
};
let useCont = true,
  useME = true,
  RANKBY = 'lo',
  AGG = 'mean',
  NORMM = 'z',
  WARPG = 1,
  LASTS = false,
  LASTS_D = 0,
  HAPPYMODE = 'report',
  REACH = false;
const CONTV = DATA.cont || {},
  POLC = DATA.polc || {},
  MONEYD = DATA.money || {},
  WALKD = DATA.walk || {},
  HAPPYR = DATA.happyres || {};
const TIERS = ['fit', 'ok', 'caution', 'avoid', 'nodata'];
const TR = { fit: 0, ok: 1, caution: 2, avoid: 3, nodata: 4 };
const EST_ONLY = new Set();
// within a verdict, order by the low end of the likely range: a well-measured 68 outranks an uncertain 68
const lo_ = e => (RANKBY === 'mid' ? (e.med != null ? e.med : e.score) : e.lo != null ? e.lo : e.score);
// and within a verdict, places with published data on what matters come before places that lean on filled-in values
const byRank = (a, b) => TR[a.tier] - TR[b.tier] || a.thin - b.thin || lo_(b) - lo_(a) || b.score - a.score;
const byAdRank = (a, b) =>
  TR[a.ad.tier] - TR[b.ad.tier] ||
  (RANKBY === 'mid'
    ? (b.ad.med ?? b.ad.score) - (a.ad.med ?? a.ad.score)
    : (b.ad.lo ?? b.ad.score) - (a.ad.lo ?? a.ad.score)) ||
  b.ad.score - a.ad.score;
const CUT = { fit: 70, ok: 60, caution: 48 };
const CATS = [...FACTORS.map(f => f.k), 'none'];
const CATPAL = [
  '#b5651d',
  '#2e8b57',
  '#2a78d6',
  '#cf3f3f',
  '#7a5af0',
  '#e87ba4',
  '#d9a400',
  '#1baf7a',
  '#e57a3c',
  '#0f6d8c',
  '#6b4f2a',
  '#8b1e3f',
  '#a33fbf',
  '#3c8c3c',
  '#c2185b',
  '#5a7d9a',
  '#00897b',
  '#795548',
  '#5c6bc0',
  '#ad1457',
  '#558b2f',
  '#6d4c41',
  '#00838f',
  '#795548',
  '#9aa6af',
];
// icons are drawn, not typed: font glyphs like ⟲ or ▶ are missing or turn into emoji on some devices
const ICONS = {
  chev: '<path d="M7 9.5l5 5 5-5"/>',
  check: '<path d="M5.5 12.5l4 4L18.5 7.5"/>',
  dot: '<circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none"/>',
  alert: '<path d="M12 6.3v7"/><circle cx="12" cy="17.6" r="1.45" fill="currentColor" stroke="none"/>',
  x: '<path d="M7 7l10 10M17 7L7 17"/>',
  quest:
    '<path d="M9.3 9.3a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2 1-1.2 1.9"/><circle cx="12" cy="17.6" r="1.45" fill="currentColor" stroke="none"/>',
  play: '<path d="M8 5.5l11 6.5-11 6.5z" fill="currentColor"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  down: '<path d="M12 5v13M6.5 12.5L12 18l5.5-5.5"/>',
};
const IC = (n, sz = 14, sw = 2.4) =>
  `<svg class="ic" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
// the one map look: light/dark through CSS variables, verdict colors safe for color blindness
const MAPSTYLE = {
  ocean: 'var(--ocean)',
  stroke: 'var(--land-stroke)',
  dot: 'var(--panel)',
  text: 'var(--fg)',
  off: 'var(--off)',
  tiers: { fit: '#1f6fb2', ok: '#8cc0e6', caution: '#f2b06b', avoid: '#b5461b' },
  seq: ['#f0f4f8', '#1f4e8c'],
};
MAPSTYLE.tiers.nodata = '#9aa6af';
const TIERCOL = MAPSTYLE.tiers;
function catColor(st, i) {
  return CATPAL[i];
}
