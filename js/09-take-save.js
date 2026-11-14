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
function loadTake(o) {
  W = { ...PRESETS.mine, ...(o.w || {}) };
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
