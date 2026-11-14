'use strict';
/* ---------------- quiz ---------------- */
// One thing per question; scale questions all run low to high with the same three answers;
// options without a natural order (nominal) are shuffled, keeping "other / doesn't matter" answers last.
// Importance questions are swing questions: they name a real change from a worse place to a better one.
const SW = [0.5, 1.5, 2.5];
const QUIZ = [
  {
    id: 'field',
    nominal: 1,
    fixed: 2,
    w: [{}, {}, {}, {}, {}, {}, { jobs: 0 }],
    mk: 'field',
    m: ['tech', 'finance', 'health', 'creative', 'academia', 'general', 'remote'],
  },
  { id: 'reach', nominal: 0, w: [{}, {}], mk: 'reach', m: ['yes', 'no'] },
  { id: 'horizon', w: [{}, {}, {}], mult: { jobs: [0.8, 1, 1.3] } },
  { id: 'jobs', w: SW.map(x => ({ jobs: x })) },
  { id: 'pay', w: SW.map(x => ({ pay: x })) },
  { id: 'home', w: SW.map(x => ({ home: x })) },
  { id: 'move', w: [{ move: 0.75 }, { move: 1.5 }, { move: 2.5 }] },
  { id: 'commute', w: SW.map(x => ({ commute: x })) },
  { id: 'hlth', w: [{ hlth: 0.75 }, { hlth: 1.75 }, { hlth: 3 }] },
  { id: 'air', w: SW.map(x => ({ air: x })) },
  { id: 'hours', w: SW.map(x => ({ hours: x })) },
  { id: 'risk', w: SW.map(x => ({ risk: x })) },
  {
    id: 'clim',
    nominal: 1,
    fixed: 1,
    w: [
      { clim: 1.5, day: 1 },
      { clim: 1.5, day: 0.75 },
      { clim: 1.25, day: 0.5 },
      { clim: 0.75, day: 2 },
      { clim: 0.25, day: 0.25 },
    ],
    mk: 'clim',
    m: ['mild', 'warm', 'cool', 'mild', 'mild'],
  },
  { id: 'open', w: SW.map(x => ({ open: x })) },
  { id: 'cult', w: SW.map(x => ({ cult: x })) },
  { id: 'fam', w: [{ fam: 0.25 }, { fam: 1 }, { fam: 2 }] },
  { id: 'kin', w: [{ kin: 0 }, { kin: 0.75 }, { kin: 2 }] },
  { id: 'safe', w: SW.map(x => ({ safe: x })) },
  { id: 'happy', w: SW.map(x => ({ happy: x })) },
  { id: 'free', w: SW.map(x => ({ free: x })) },
  { id: 'honest', w: SW.map(x => ({ honest: x })) },
  { id: 'women', w: [{ women: 0 }, { women: 0.75 }, { women: 1.5 }, { women: 2.5 }] },
  { id: 'lgbt', w: [{ lgbt: 0 }, { lgbt: 0.75 }, { lgbt: 1.5 }, { lgbt: 2.5 }] },
  {
    id: 'pol',
    nominal: 1,
    fixed: 1,
    w: [{ pol: 1.5 }, { pol: 1.5 }, { pol: 0 }],
    mk: 'pol',
    m: ['d', 'r', 'd'],
  },
  // values about how to judge, not what to weigh: may a strength offset a weakness, and how to treat thin data
  { id: 'weak', nominal: 0, w: [{}, {}], mk: 'agg', m: ['mean', 'geo'] },
  { id: 'sure', nominal: 0, w: [{}, {}], mk: 'sure', m: ['lo', 'mid'] },
  {
    id: 'lang',
    picker: 'lang',
    nominal: 1,
    fixed: 1,
    w: [{ lang: 0.75 }, { lang: 1.25 }, { lang: 1.5 }, { lang: 1.5 }, { lang: 1.25 }, { lang: 0.25 }],
    mk: 'lang',
    m: ['both', 'en', 'enok', 'es', 'esen', 'both'],
  },
  {
    id: 'perm',
    picker: 'perm',
    nominal: 1,
    fixed: 1,
    w: [{ perm: 1 }, { perm: 1 }, { perm: 1 }, { perm: 1 }, { perm: 0 }],
    mk: 'perm',
    m: ['usmx', 'us', 'mx', 'eu', 'usmx'],
  },
];
// a 6-question version is the default; the full quiz is one tap away
const SIMPLE = ['field', 'clim', 'move', 'jobs', 'lang', 'perm'];
let QLIST = QUIZ.filter(q => SIMPLE.includes(q.id)),
  ORDER = {};
let ANS = {},
  QSTEP = 0,
  HOMEKEYS = [];
const qText = id => (QSTR[LANG] || {})[id] || QSTR.en[id];
const QBASE = { ...PRESETS.equal, pol: 0, happy: 1, women: 0.75, lgbt: 0.75 };
// "picker" questions (languages, passports) take any number of answers; older saved answers are numbers and still work
const picked = v => v && typeof v === 'object';
const answered = q => typeof ANS[q.id] === 'number' || (q.picker && picked(ANS[q.id]));
function pickerW(q, v) {
  if (q.picker === 'lang') return { lang: v.learn ? 0.25 : 1.25 };
  return { perm: v.ignore || !(v.sel || []).length ? 0 : 1 };
}
function pickerMode(q, v) {
  if (q.picker === 'lang') return langCode(v.sel || {});
  return passCode(v.sel || []);
}
function weightsFromQuiz(a) {
  const w = { ...QBASE };
  QUIZ.forEach(q => {
    if (q.picker && picked(a[q.id])) Object.assign(w, pickerW(q, a[q.id]));
    else if (typeof a[q.id] === 'number' && q.w[a[q.id]]) Object.assign(w, q.w[a[q.id]]);
  });
  QUIZ.forEach(q => {
    if (q.mult && typeof a[q.id] === 'number')
      for (const k in q.mult) w[k] = (w[k] || 0) * q.mult[k][a[q.id]];
  });
  return w;
}
function modesFromQuiz(a) {
  const o = {
    lang: 'en',
    perm: 'us',
    field: 'general',
    clim: 'mild',
    pol: 'd',
    reach: 'no',
    agg: 'mean',
    sure: 'lo',
  };
  QUIZ.forEach(q => {
    if (q.mk && q.picker && picked(a[q.id])) o[q.mk] = pickerMode(q, a[q.id]);
    else if (q.mk && typeof a[q.id] === 'number') o[q.mk] = q.m[a[q.id]];
  });
  return o;
}
// languages: tap once for fluent, again for "some", again to remove. Passports: pick from every country.
function pickerBody(q) {
  const v = (ANS[q.id] = picked(ANS[q.id])
    ? ANS[q.id]
    : q.picker === 'lang'
      ? { sel: browserLangs() }
      : { sel: [] });
  const [title] = qText(q.id);
  if (q.picker === 'lang') {
    const lv = k => (v.sel || {})[k] || 0,
      lab = ['', 'langSome', 'langFluent'];
    return `<div class="qtitle">${title}</div><p class="meta qsub">${L('langHint')}</p><div class="chips">${LANG_PICK.map(k => `<button class="lchip lv${lv(k)}" data-l="${k}" aria-pressed="${lv(k) > 0}" title="${lv(k) ? L(lab[lv(k)]) : ''}"><span lang="${k}">${LANG_NATIVE[k]}</span>${lv(k) === 1 ? `<small>${L('langSome')}</small>` : ''}</button>`).join('')}</div>
      <label class="check"><input type="checkbox" id="qLearn" ${v.learn ? 'checked' : ''}> ${L('langLearn')}</label>`;
  }
  const cs = ents
    .filter(e => e.type === 'country' && typeof e.id === 'number' && e.a2)
    .sort((a, b) => dn(a).localeCompare(dn(b), LANG));
  return `<div class="qtitle">${title}</div><p class="meta qsub">${L('passHint')}</p>
    <div class="chips">${(v.sel || []).map(n => `<button class="lchip lv2" data-p="${n}" aria-label="${L('remove')} ${dn(byIso[n] || { a2: '', name: n })}">${dn(byIso[n] || { a2: '', name: String(n) })} <span aria-hidden="true">×</span></button>`).join('')}</div>
    <div class="field"><label class="lab" for="qPass">${L('passAdd')}</label><select id="qPass"><option value="">—</option>${cs.map(e => `<option value="${e.id}">${dn(e)}</option>`).join('')}</select></div>
    <label class="check"><input type="checkbox" id="qIgnore" ${v.ignore ? 'checked' : ''}> ${L('passIgnore')}</label>`;
}
function wirePicker(q) {
  const v = ANS[q.id],
    Q = $('qwrap');
  Q.querySelectorAll('[data-l]').forEach(
    b =>
      (b.onclick = () => {
        const k = b.dataset.l,
          n = ((v.sel[k] || 0) + 2) % 3;
        if (n) v.sel[k] = n;
        else delete v.sel[k];
        renderQuiz();
      })
  );
  Q.querySelectorAll('[data-p]').forEach(
    b =>
      (b.onclick = () => {
        v.sel = v.sel.filter(x => x !== +b.dataset.p);
        renderQuiz();
      })
  );
  if ($('qPass'))
    $('qPass').onchange = e => {
      const n = +e.target.value;
      if (n && !v.sel.includes(n)) v.sel.push(n);
      renderQuiz();
    };
  if ($('qLearn'))
    $('qLearn').onchange = e => {
      v.learn = e.target.checked;
    };
  if ($('qIgnore'))
    $('qIgnore').onchange = e => {
      v.ignore = e.target.checked;
    };
}
function orderedPlaces(needGeo) {
  const ok = e => listable(e) && (!needGeo || e.hasGeo),
    az = (a, b) => dn(a).localeCompare(dn(b), LANG);
  const feat = FEATURED.map(k => byKey[k]).filter(e => e && ok(e));
  const cs = ents.filter(e => ok(e) && e.type === 'city' && !feat.includes(e)).sort(az),
    co = ents.filter(e => ok(e) && e.type === 'country').sort(az);
  return [
    [L('grpSuggested'), feat],
    [L('grpCities'), cs],
    [L('grpCountries'), co],
  ];
}
// ---- place picker: search box, a short "Suggested" list, then every place A–Z with letter headers and a letter rail.
// Suggested places also keep their alphabetical spot. The value lives in a hidden input.
const placeLabel = e =>
  e ? dn(e) + (e.type === 'city' && countryOf(e) ? ', ' + countryOf(e) : '') : L('none');
function homeSelect(id, val) {
  const e = byKey[val];
  return `<div class="hpick"><input type="hidden" id="${id}" value="${val || ''}"><button type="button" class="hpbtn" data-for="${id}" aria-haspopup="dialog"><span>${placeLabel(e)}</span>${IC('chev', 14, 2.4)}</button></div>`;
}
function suggestedPlaces() {
  const out = [],
    add = e => {
      if (e && e.hasGeo && listable(e) && !out.includes(e)) out.push(e);
    };
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').split('/').pop().replace(/_/g, ' ');
    if (tz) add(ents.find(e => e.type === 'city' && (e.name === tz || e.name.startsWith(tz + ' '))));
  } catch (err) {}
  for (const t of navigator.languages || []) {
    const r = (t.split('-')[1] || '').toUpperCase();
    if (r.length === 2) add(ents.find(e => e.type === 'country' && e.a2 === r));
  }
  passSpec(PERMMODE).forEach(n => add(byIso[n]));
  HOMES.forEach(h => add(byKey[h.key]));
  return out.slice(0, 6);
}
function openPicker(id) {
  const D = $('hpDialog'),
    inp = $(id),
    fold = s =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
  const all = ents.filter(e => listable(e) && e.hasGeo).sort((a, b) => dn(a).localeCompare(dn(b), LANG));
  const row = e =>
    `<button type="button" class="hprow${inp.value === (e ? e.key : '') ? ' on' : ''}" data-k="${e ? e.key : ''}"><span>${e ? dn(e) : L('none')}</span>${e ? `<small>${e.type === 'city' ? L('city') + (countryOf(e) ? ' · ' + countryOf(e) : '') : L('country')}</small>` : ''}</button>`;
  const letter = e => fold(dn(e)).charAt(0).toUpperCase();
  function render(q) {
    const L_ = $('hpList');
    q = fold(q.trim());
    if (q) {
      const hits = all
        .filter(e => fold(dn(e)).includes(q) || fold(countryOf(e) || '').startsWith(q))
        .sort((a, b) => (fold(dn(a)).startsWith(q) ? 0 : 1) - (fold(dn(b)).startsWith(q) ? 0 : 1));
      L_.innerHTML = hits.length
        ? hits.slice(0, 80).map(row).join('')
        : `<p class="meta hpempty">${L('noMatch')}</p>`;
      $('hpRail').innerHTML = '';
      return;
    }
    const sug = suggestedPlaces(),
      groups = {};
    all.forEach(e => {
      (groups[letter(e)] = groups[letter(e)] || []).push(e);
    });
    L_.innerHTML =
      row(null) +
      (sug.length ? `<h4 class="hphead">${L('grpSuggested')}</h4>${sug.map(row).join('')}` : '') +
      Object.keys(groups)
        .map(k => `<h4 class="hphead" id="hp-${k}">${k}</h4>${groups[k].map(row).join('')}`)
        .join('');
    $('hpRail').innerHTML = Object.keys(groups)
      .map(k => `<button type="button" data-l="${k}" aria-label="${k}">${k}</button>`)
      .join('');
  }
  $('hpSearch').value = '';
  $('hpSearch').placeholder = L('hpSearch');
  $('hpCancel').textContent = L('cancel');
  render('');
  $('hpSearch').oninput = ev => render(ev.target.value);
  $('hpSearch').onkeydown = ev => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      /* or the Enter would also press the button that opened the picker */ const b =
        $('hpList').querySelector('[data-k]:not([data-k=""])');
      if (b) b.click();
    }
  };
  $('hpList').onclick = ev => {
    const b = ev.target.closest('[data-k]');
    if (!b) return;
    inp.value = b.dataset.k;
    document.querySelector(`.hpbtn[data-for="${id}"] span`).textContent = placeLabel(byKey[b.dataset.k]);
    D.close();
    inp.dispatchEvent(new Event('change'));
  };
  $('hpRail').onclick = ev => {
    const b = ev.target.closest('[data-l]');
    if (b) {
      const h = $('hp-' + b.dataset.l);
      if (h) $('hpList').scrollTop = h.offsetTop - $('hpList').offsetTop;
    }
  };
  $('hpCancel').onclick = () => D.close();
  if (D.showModal) D.showModal();
  else D.setAttribute('open', '');
  $('hpList').scrollTop = 0;
  if (matchMedia('(pointer:fine)').matches) $('hpSearch').focus();
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('.hpbtn');
  if (b) openPicker(b.dataset.for);
});
// after the short quiz: the map is ready (and shown below); answering the rest is offered once, never required
let QDONE = false,
  QMORE = false;
const moreLeft = () => QUIZ.filter(q => !answered(q) && ANS[q.id] !== 'skip');
function renderDone() {
  const Q = $('qwrap'),
    m = moreLeft().length;
  Q.innerHTML = `<span class="lab">${L('doneLab')}</span><div class="qtitle">${L('doneTitle')}</div><p class="meta qsub">${fmt(L('doneSub'), { n: QUIZ.filter(answered).length, m })}</p>
  <div class="donenav"><button id="doneMore">${fmt(L('doneMore'), { m })}</button><button class="primary" id="doneMap">${L('doneMap')}</button></div>`;
  $('doneMap').onclick = () => {
    QDONE = false;
    $('quizPanel').hidden = true;
    $('vsPanel').scrollIntoView({ block: 'start' });
  };
  $('doneMore').onclick = sharpenQuiz;
}
function renderQuiz() {
  if (QDONE) return renderDone();
  // the extra questions don't ask for home bases again
  if (QMORE && QSTEP >= QLIST.length) return finishQuiz();
  const total = QLIST.length + (QMORE ? 0 : 1),
    n = QSTEP + 1;
  const Q = $('qwrap');
  let body;
  if (QSTEP < QLIST.length && QLIST[QSTEP].picker)
    body = (QSTEP === 0 ? `<p class="meta qtip">${L('qtip')}</p>` : '') + pickerBody(QLIST[QSTEP]);
  else if (QSTEP < QLIST.length) {
    const q = QLIST[QSTEP],
      [title, opts] = qText(q.id),
      ord = ORDER[q.id] || opts.map((o, i) => i);
    // a trailing example in brackets becomes a quieter second line: "How much does X matter?" / "Think Tampico vs. New York."
    const mt = /^(.+?)\s*[(（](.+)[)）]\s*$/.exec(title),
      head = mt ? mt[1] : title,
      sub = mt ? mt[2] : '';
    body = `${QSTEP === 0 ? `<p class="meta qtip">${L('qtip')}</p>` : ''}<div class="qtitle">${head}</div>${sub ? `<p class="meta qsub">${sub}</p>` : ''}<div class="opts">${ord.map(i => `<button class="opt" data-i="${i}" aria-pressed="${ANS[q.id] === i}"><span class="dot"></span><span>${opts[i]}</span></button>`).join('')}</div>`;
  } else
    body = `<div class="qtitle">${L('homeQ')}</div><p class="meta">${L('homeSub')}</p><div style="display:flex;flex-wrap:wrap;gap:12px"><div class="field"><label class="lab" for="qh1">${L('home1')}</label>${homeSelect('qh1', HOMEKEYS[0] || '')}</div><div class="field"><label class="lab" for="qh2">${L('home2')}</label>${homeSelect('qh2', HOMEKEYS[1] || '')}</div></div>`;
  Q.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span class="lab">${fmt(L('qOf'), { n, t: total })}</span><button class="ghost" id="qSkip">${QMORE ? L('doneMap') : L('skip')}</button></div>
  <div class="progress"><span style="width:${Math.round((n / total) * 100)}%"></span></div>${body}
  <div class="qnav"><button id="qBack" ${QSTEP === 0 ? 'hidden' : ''}>${L('back')}</button>${QSTEP < QLIST.length ? `<span class="toggles"><button class="ghost" id="qUnsure">${L('unsure')}</button>${answered(QLIST[QSTEP]) ? `<button id="qNext">${L('next')}</button>` : ''}</span>` : `<button class="primary" id="qDone">${L('finish')}</button>`}</div>`;
  Q.querySelectorAll('.opt').forEach(
    b =>
      (b.onclick = () => {
        ANS[QLIST[QSTEP].id] = +b.dataset.i;
        Q.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-pressed', x === b));
        setTimeout(() => {
          QSTEP++;
          renderQuiz();
        }, 180);
      })
  );
  if (QSTEP < QLIST.length && QLIST[QSTEP].picker) wirePicker(QLIST[QSTEP]);
  if ($('qBack'))
    $('qBack').onclick = () => {
      QSTEP = Math.max(0, QSTEP - 1);
      renderQuiz();
    };
  if ($('qNext'))
    $('qNext').onclick = () => {
      QSTEP++;
      renderQuiz();
    };
  if ($('qUnsure'))
    $('qUnsure').onclick = () => {
      ANS[QLIST[QSTEP].id] = 'skip';
      QSTEP++;
      renderQuiz();
    };
  if ($('qh1')) {
    $('qh1').onchange = $('qh2').onchange = () => {
      HOMEKEYS = [$('qh1').value, $('qh2').value];
    };
  }
  if ($('qDone')) $('qDone').onclick = finishQuiz;
  $('qSkip').onclick = () => {
    if (QMORE) return finishQuiz();
    $('quizPanel').hidden = true;
    if (MODE !== 'yours') showMap();
  };
}
// Shuffle once per person and keep that order on later visits, so the quiz doesn't rearrange itself
let QSEED = +store.get('qseed', 0);
if (!QSEED) {
  QSEED = 1 + Math.floor(Math.random() * 1e9);
  store.set('qseed', String(QSEED));
}
function shuffle(a) {
  const rnd = mulberry32(QSEED + a.length);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// "sharpen": keep the short quiz's answers and ask only the questions not answered yet
function sharpenQuiz() {
  QSTEP = 0;
  QLIST = moreLeft();
  if (!QLIST.length) return;
  QDONE = false;
  QMORE = true;
  $('vsPanel').hidden = true;
  $('quizPanel').hidden = false;
  renderQuiz();
  $('quizPanel').scrollIntoView({ block: 'start' });
}
function startQuiz(full) {
  ANS = {};
  QSTEP = 0;
  QDONE = QMORE = false;
  HOMEKEYS = [];
  QLIST = full === true ? QUIZ.slice() : QUIZ.filter(q => SIMPLE.includes(q.id));
  ORDER = {};
  QUIZ.forEach(q => {
    const n = QSTR.en[q.id][1].length,
      idx = [...Array(n).keys()];
    if (q.nominal) {
      const k = q.fixed || 0;
      ORDER[q.id] = shuffle(idx.slice(0, n - k)).concat(idx.slice(n - k));
    }
  });
  $('quizPanel').hidden = false;
  renderQuiz();
  $('quizPanel').scrollIntoView({ block: 'start' });
}
// Show what every unanswered question defaulted to, and let the person change it here
function renderDefaults() {
  const el = $('vsDefaults');
  if (!el) return;
  const un = QUIZ.filter(q => !answered(q));
  if (!un.length) {
    el.innerHTML = '';
    return;
  }
  const defOf = q =>
    q.mk
      ? L('defModes')[q.mk]
      : Object.keys(q.w[0] || {})
          .map(k => `${FL(k)} ${fmtW(QBASE[k] ?? 1)}`)
          .join(', ') || '—';
  el.innerHTML = `<details class="box"><summary><span>${fmt(L('defaultsTitle'), { n: un.length })}</span></summary><div class="inner"><p class="meta">${L('defaultsNote')}</p>${un
    .map(q => {
      const [t, opts] = qText(q.id);
      return `<label class="field"><span class="meta">${t}</span><select data-q="${q.id}"><option value="">${L('keepDefault')}: ${defOf(q)}</option>${opts.map((o, i) => `<option value="${i}">${o}</option>`).join('')}</select></label>`;
    })
    .join('')}</div></details>`;
  el.querySelectorAll('select[data-q]').forEach(
    sel =>
      (sel.onchange = () => {
        if (sel.value === '') return;
        ANS[sel.dataset.q] = +sel.value;
        applyQuizAnswers();
        weightsUI();
        refreshAll();
        saveTake();
        renderDefaults();
      })
  );
}
function applyQuizAnswers() {
  QUIZW = weightsFromQuiz(ANS);
  W = { ...QUIZW };
  const md = modesFromQuiz(ANS);
  LANGMODE = md.lang;
  PERMMODE = md.perm;
  FIELD = md.field;
  CLIMMODE = md.clim;
  POLMODE = md.pol;
  REACH = md.reach === 'yes';
  // only an answered question changes these two; otherwise the settings panel's choice stands
  if (typeof ANS.weak === 'number') AGG = md.agg;
  if (typeof ANS.sure === 'number') {
    RANKBY = md.sure;
    store.set('rankBy', RANKBY);
  }
  if ($('aggSel')) $('aggSel').value = AGG;
  if ($('rankBy')) $('rankBy').value = RANKBY;
  LASTS = false;
}
function finishQuiz() {
  if ($('qh1')) HOMEKEYS = [$('qh1').value, $('qh2').value].filter(Boolean);
  applyQuizAnswers();
  HOMES = homesFromKeys(HOMEKEYS);
  gate = gateOpen = norm = true;
  MODE = 'yours';
  store.set('view', 'yours');
  applyHomes();
  weightsUI();
  refreshAll();
  saveTake();
  renderDefaults();
  // first time through, say it's done and offer the rest; the results and the map are already underneath
  QDONE = !QMORE && moreLeft().length > 0;
  QMORE = false;
  $('vsPanel').hidden = false;
  $('quizPanel').hidden = !QDONE;
  if (QDONE) renderDone();
  $(QDONE ? 'quizPanel' : 'vsPanel').scrollIntoView({ block: 'start' });
}
