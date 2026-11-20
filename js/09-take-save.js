'use strict';
/* ---------------- take: save, share, load ---------------- */
function takeState() {
  return {
    v: 3,
    rc: REACH ? 1 : 0,
    w: W,
    h: HOMES.map(h => h.key),
    lm: LANGMODE,
    pm: PERMMODE,
    pl: POLMODE,
    fd: FIELD,
    cm: CLIMMODE,
    g: gate ? 1 : 0,
    o: gateOpen ? 1 : 0,
    f: gateFar ? 1 : 0,
    ht: gateHot ? 1 : 0,
    sm: gateSmall ? 1 : 0,
    n: norm ? 1 : 0,
    e: useEst ? 1 : 0,
    m: useImp ? 1 : 0,
    ag: AGG,
    tr: TRIPS,
    a: ANS,
  };
}
function saveTake() {
  if (MODE === 'yours') store.set('take', JSON.stringify(takeState()));
}
// A link made before a factor existed doesn't carry a weight for it. Those weights take the values they had by default
// when such links were made (Adriano's picks up to v57; the later, optional factors off), so an old link keeps showing
// what its maker saw when Adriano changes his own picks.
const LINK_DEFAULTS = {
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
  kin: 0,
  tz: 0,
  sea: 0,
};
function loadTake(o) {
  W = { ...LINK_DEFAULTS, ...(o.w || {}) };
  HOMES = homesFromKeys(o.h);
  LANGMODE = o.lm || 'en';
  PERMMODE = o.pm || 'us';
  POLMODE = o.pl || 'd';
  FIELD = o.fd || 'general';
  CLIMMODE = o.cm || 'mild';
  gate = o.g !== 0;
  gateOpen = o.o !== 0;
  gateFar = o.f !== 0;
  gateHot = o.ht !== 0;
  gateSmall = o.sm !== 0;
  norm = o.n !== 0;
  useEst = o.e === 1;
  useImp = o.m !== 0;
  TRIPS = o.tr || {};
  ANS = o.a || {};
  REACH = o.rc === 1;
  AGG = o.ag === 'geo' ? 'geo' : 'mean';
  QUIZW = Object.keys(ANS).length ? weightsFromQuiz(ANS) : null;
  MODE = 'yours';
}
const enc = o =>
  btoa(unescape(encodeURIComponent(JSON.stringify(o))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));
function toast(msg) {
  $('toast').textContent = msg;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => ($('toast').textContent = ''), 4500);
}
