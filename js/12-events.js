'use strict';
/* ---------------- events ---------------- */
$('langSel').innerHTML = Object.entries(UI_LANGS)
  .map(([k, n]) => `<option value="${k}" lang="${k}">${n}</option>`)
  .join('');
$('langSel').onchange = e => setLang(e.target.value);
$('startQuiz').onclick = () => startQuiz(false);
// Every tap shows at once, on the way down, whatever the button then has to work out
document.addEventListener(
  'pointerdown',
  ev => {
    const b = ev.target.closest && ev.target.closest('button, .opt, .row, .pill, summary, .hprow');
    if (!b) return;
    b.classList.add('tapped');
    setTimeout(() => b.classList.remove('tapped'), 160);
  },
  { passive: true }
);
$('advBtn').onclick = () => setAdv(!document.body.classList.contains('adv'));
document.body.classList.toggle('adv', !!store.get('adv', false));
$('fullQuiz').onclick = () => sharpenQuiz();
$('tradeBtn').onclick = () => startTrades();
$('retake').onclick = () => startQuiz(false);
$('toMap').onclick = showMap;
$('toCmp').onclick = () => {
  if (ui.open) closePlace();
  $('cmpPanel').scrollIntoView({ block: 'start' });
};
// with a place's details open: Escape goes back to the list, the arrow keys step to the place before or after
document.addEventListener('keydown', ev => {
  if (
    !ui.open ||
    ev.altKey ||
    ev.ctrlKey ||
    ev.metaKey ||
    /^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName) ||
    (ev.target.closest && ev.target.closest('.rmap')) // inside the real map the arrows move the map
  )
    return;
  if (ev.key === 'Escape') return closePlace();
  const fwd = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight',
    back = fwd === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
  if (ev.key !== fwd && ev.key !== back) return;
  const i = (ui.order || []).indexOf(ui.sel && ui.sel.key),
    p = i < 0 ? null : byKey[ui.order[i + (ev.key === fwd ? 1 : -1)]];
  if (p) openPlace(p);
});
// the name in the top bar goes back to the top, like a site's logo
$('brand').onclick = () => window.scrollTo({ top: 0 });
// the unmarked button at the foot of the page: one filled-in set of answers (SAMPLE, js/07-quiz.js)
$('fillBtn').onclick = fillSample;
$('shareTake').onclick = () => {
  const url = location.href.split('#')[0] + '#t=' + enc(takeState()) + (LANG !== 'en' ? '&l=' + LANG : '');
  const ok = () => toast(L('copied'));
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(url).then(ok, () => window.prompt(L('copyPrompt'), url));
  else window.prompt(L('copyPrompt'), url);
};
$('colorBy').onchange = e => {
  ui.colorBy = e.target.value;
  store.set('colorBy', ui.colorBy);
  paint();
};
const press = (id, v) => $(id).setAttribute('aria-pressed', v);
$('tCountries').onclick = () => {
  ui.showC = !ui.showC;
  press('tCountries', ui.showC);
  press('tDots', !ui.showC);
  paint();
};
$('tCities').onclick = () => {
  ui.showD = !ui.showD;
  press('tCities', ui.showD);
  paint();
};
$('tLabels').onclick = () => {
  ui.labels = !ui.labels;
  press('tLabels', ui.labels);
  paint();
};
$('rCities').onclick = () => {
  ui.rankType = 'city';
  press('rCities', true);
  press('rCountries', false);
  ui.showAll = false;
  list();
  legend();
};
$('rCountries').onclick = () => {
  ui.rankType = 'country';
  press('rCountries', true);
  press('rCities', false);
  ui.showAll = false;
  list();
  legend();
};
$('more').onclick = () => {
  ui.showAll = true;
  list();
};
$('minScore').oninput = e => {
  ui.minScore = +e.target.value;
  $('minOut').textContent = ui.minScore;
  filtersChanged();
};
$('freset').onclick = () => {
  ui.tiers = new Set(TIERS);
  ui.minScore = 0;
  ui.mins = {};
  $('minScore').value = 0;
  $('minOut').textContent = '0';
  tierFilters();
  mustUI();
  filtersChanged();
};
$('preset').onchange = e => {
  const v = e.target.value;
  const src = v === 'quiz' ? QUIZW : PRESETS[v];
  if (!src) return;
  W = { ...src };
  weightsUI();
  $('preset').value = v;
  refreshAll();
  saveTake();
};
$('norm').onchange = e => {
  norm = e.target.checked;
  refreshAll();
  saveTake();
};
$('useEst').onchange = e => {
  useEst = e.target.checked;
  refreshAll();
  saveTake();
};
$('useImp').onchange = e => {
  useImp = e.target.checked;
  refreshAll();
  saveTake();
};
$('gate').onchange = e => {
  gate = e.target.checked;
  refreshAll();
  saveTake();
};
$('gateOpen').onchange = e => {
  gateOpen = e.target.checked;
  refreshAll();
  saveTake();
};
$('gateFar').onchange = e => {
  gateFar = e.target.checked;
  refreshAll();
  saveTake();
};
$('gateHot').onchange = e => {
  gateHot = e.target.checked;
  refreshAll();
  saveTake();
};
$('gateSmall').onchange = e => {
  gateSmall = e.target.checked;
  refreshAll();
  saveTake();
};
$('useCont').onchange = e => {
  useCont = e.target.checked;
  refreshAll();
  saveTake();
};
$('useME').onchange = e => {
  useME = e.target.checked;
  refreshAll();
  saveTake();
};
$('reach').onchange = e => {
  REACH = e.target.checked;
  refreshAll();
  saveTake();
};
$('rankBy').onchange = e => {
  RANKBY = e.target.value;
  store.set('rankBy', RANKBY);
  refreshAll();
};
$('aggSel').onchange = e => {
  AGG = e.target.value;
  refreshAll();
  saveTake();
};
$('normM').onchange = e => {
  NORMM = e.target.value;
  refreshAll();
  saveTake();
};
$('happyM').onchange = e => {
  HAPPYMODE = e.target.value;
  refreshAll();
  saveTake();
};
// Shift 30% of the weather and daylight weight to the commute and making friends, which people tend to underweight
$('lasts').onchange = e => {
  const on = e.target.checked;
  if (on && !LASTS) {
    LASTS_D = (W.clim || 0) * 0.3 + (W.day || 0) * 0.3;
    W.clim = (W.clim || 0) * 0.7;
    W.day = (W.day || 0) * 0.7;
    W.commute = (W.commute || 0) + LASTS_D / 2;
    W.open = (W.open || 0) + LASTS_D / 2;
  } else if (!on && LASTS) {
    W.clim = (W.clim || 0) / 0.7;
    W.day = (W.day || 0) / 0.7;
    W.commute = Math.max(0, (W.commute || 0) - LASTS_D / 2);
    W.open = Math.max(0, (W.open || 0) - LASTS_D / 2);
  }
  LASTS = on;
  weightsUI();
  refreshAll();
  saveTake();
};
$('tOpac').onclick = () => {
  ui.opac = !ui.opac;
  press('tOpac', ui.opac);
  paint();
};
$('vScore').onclick = () => {
  ui.view = 'score';
  press('vScore', true);
  press('vProfile', false);
  list();
};
$('vProfile').onclick = () => {
  ui.view = 'profile';
  press('vProfile', true);
  press('vScore', false);
  list();
};
$('undoBtn').onclick = undo;
$('tDots').onclick = () => {
  ui.showC = !ui.showC;
  press('tCountries', ui.showC);
  press('tDots', !ui.showC);
  paint();
};
$('cmpClear').onclick = () => {
  ui.cmp = [];
  renderCmp();
  detail(ui.sel);
  pcard();
};
$('search').oninput = () => list();
// the Find box filters the ranking as you type; Enter opens the best match (an exact name first, else the first starting with it)
$('search').onkeydown = e => {
  if (e.key !== 'Enter') return;
  const v = e.target.value.trim().toLowerCase();
  if (!v) return;
  const ok = ents.filter(x => listable(x));
  const hit =
    ok.find(x => dn(x).toLowerCase() === v || x.name.toLowerCase() === v) ||
    ok.find(x => dn(x).toLowerCase().startsWith(v));
  if (hit) openPlace(hit);
};
$('zin').onclick = () => zoom && zsel.transition().duration(300).call(zoom.scaleBy, 1.6);
$('zout').onclick = () =>
  zoom &&
  zsel
    .transition()
    .duration(300)
    .call(zoom.scaleBy, 1 / 1.6);
$('zreset').onclick = () => {
  if (!zoom) return;
  scopeView(true);
};
document.querySelectorAll('#regions button').forEach(b => (b.onclick = () => regionView(b.dataset.r, true)));
// show the bar title only after the hero headline scrolls out of view
if (window.IntersectionObserver) {
  const h = document.querySelector('.hero h1');
  if (h)
    new IntersectionObserver(([en]) =>
      document.body.classList.toggle('past-hero', !en.isIntersecting)
    ).observe(h);
} else document.body.classList.add('past-hero');
// the priorities panel is a bottom sheet on phones: the floating button opens it, Escape or the close button shuts it
$('pfab').onclick = () => setSheet(!$('ppanel').classList.contains('open'));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('ppanel').classList.contains('open')) {
    setSheet(false);
    $('pfab').focus();
  }
});
