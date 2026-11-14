'use strict';
/* ---------------- quiz ---------------- */
// One thing per question; scale questions all run low to high with the same three answers;
// options without a natural order (nominal) are shuffled, keeping "other / doesn't matter" answers last.
// Importance questions are swing questions: they name a real change from a worse place to a better one.
const SW = [0.5, 1.5, 2.5];
// About you first (field, languages, passports, home), so later questions can use it; how-to-judge questions last.
// Merged (Nov 2026): job market + big busy city are both measured by metro size; freedom + honest officials move together.
// Dropped: planning horizon (it only nudged one weight) and life satisfaction (largely an outcome of the other factors;
// it still counts at half weight, QBASE). Removed ids stay readable in old saved answers: weightsFromQuiz only reads QUIZ.
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
  { id: 'where', picker: 'where', w: [] },
  { id: 'jobs', w: SW.map(x => ({ jobs: x, cult: x * 0.6 })), ex: 'jobs' },
  { id: 'pay', w: SW.map(x => ({ pay: x })), ex: 'pay' },
  { id: 'home', w: SW.map(x => ({ home: x })), ex: 'home' },
  { id: 'move', w: [{ move: 0.75 }, { move: 1.5 }, { move: 2.5 }], ex: 'move' },
  { id: 'commute', w: SW.map(x => ({ commute: x })), ex: 'commute' },
  { id: 'hlth', w: [{ hlth: 0.75 }, { hlth: 1.75 }, { hlth: 3 }], ex: 'hlth' },
  {
    id: 'clim',
    nominal: 1,
    last: [4], // "weather doesn't matter" always last; "cold winters" (5) was added later, so it is stored after it
    w: [
      { clim: 1.5, day: 1 },
      { clim: 1.5, day: 0.75 },
      { clim: 1.25, day: 0.5 },
      { clim: 0.75, day: 2 },
      { clim: 0.25, day: 0.25 },
      { clim: 1.25, day: 0.25 },
    ],
    mk: 'clim',
    m: ['mild', 'warm', 'cool', 'mild', 'mild', 'cold'],
  },
  { id: 'air', w: SW.map(x => ({ air: x })), ex: 'air' },
  { id: 'hours', w: SW.map(x => ({ hours: x })), ex: 'hours' },
  { id: 'risk', w: SW.map(x => ({ risk: x })), ex: 'risk' },
  { id: 'open', w: SW.map(x => ({ open: x })), ex: 'open' },
  { id: 'fam', w: [{ fam: 0.25 }, { fam: 1 }, { fam: 2 }] },
  { id: 'kin', w: [{ kin: 0 }, { kin: 0.75 }, { kin: 2 }] },
  { id: 'safe', w: SW.map(x => ({ safe: x })), ex: 'safe' },
  { id: 'free', w: SW.map(x => ({ free: x * 0.75, honest: x * 0.75 })), ex: 'honest' },
  { id: 'women', w: [{ women: 0 }, { women: 0.75 }, { women: 1.5 }, { women: 2.5 }], ex: 'women' },
  { id: 'lgbt', w: [{ lgbt: 0 }, { lgbt: 0.75 }, { lgbt: 1.5 }, { lgbt: 2.5 }], ex: 'lgbt' },
  {
    id: 'pol',
    nominal: 1,
    fixed: 1,
    w: [{ pol: 1.5 }, { pol: 1.5 }, { pol: 0 }],
    mk: 'pol',
    m: ['d', 'r', 'd'],
    // only for people with a US passport or a US home: the politics data covers US states and counties only
    show: () => usLinked() !== false,
  },
  // values about how to judge, not what to weigh: may a strength offset a weakness, and how to treat thin data
  { id: 'weak', nominal: 0, w: [{}, {}], mk: 'agg', m: ['mean', 'geo'] },
  { id: 'sure', nominal: 0, w: [{}, {}], mk: 'sure', m: ['lo', 'mid'] },
];
// a 6-question version is the default; the full quiz is one tap away
const SIMPLE = ['field', 'lang', 'perm', 'where', 'jobs', 'move', 'clim'];
let QLIST = QUIZ.filter(q => SIMPLE.includes(q.id)),
  ORDER = {};
let ANS = {},
  QSTEP = 0,
  HOMEKEYS = [];
const qText = id => (QSTR[LANG] || {})[id] || QSTR.en[id];
const QBASE = { ...PRESETS.equal, pol: 0, happy: 0.5, women: 0.75, lgbt: 0.75 };
// "picker" questions (languages, passports) take any number of answers; older saved answers are numbers and still work
const picked = v => v && typeof v === 'object';
const answered = q => typeof ANS[q.id] === 'number' || (q.picker && picked(ANS[q.id]));
function pickerW(q, v) {
  if (q.picker === 'where') return {};
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
    lang: langCode(browserLangs()), // unanswered: the languages the visitor's browser is set to
    perm: 'P:', // unanswered: no passport assumed, so work permits are scored as for anyone
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
      : q.picker === 'where'
        ? { keys: HOMEKEYS.slice() }
        : { sel: [] });
  const [title] = qText(q.id);
  if (q.picker === 'where') {
    const k = v.keys || [];
    return `<div class="qtitle">${title}</div><p class="meta qsub">${L('homeSub')}</p><div class="homepair"><div class="field"><span class="lab">${L('home1')}</span>${homeSelect('qh1', k[0] || '')}</div><div class="field"><span class="lab">${L('home2')}</span>${homeSelect('qh2', k[1] || '')}</div></div>`;
  }
  if (q.picker === 'lang') {
    const lv = k => (v.sel || {})[k] || 0,
      lab = ['', 'langSome', 'langFluent'];
    return `<div class="qtitle">${title}</div><p class="meta qsub">${L('langHint')}</p><div class="chips">${LANG_PICK.map(k => `<button class="lchip lv${lv(k)}" data-l="${k}" aria-pressed="${lv(k) > 0}" title="${lv(k) ? L(lab[lv(k)]) : ''}"><span lang="${k}">${LANG_NATIVE[k]}</span>${lv(k) === 1 ? `<small>${L('langSome')}</small>` : ''}</button>`).join('')}</div>
      <label class="check"><input type="checkbox" id="qLearn" ${v.learn ? 'checked' : ''}> ${L('langLearn')}</label>`;
  }
  return `<div class="qtitle">${title}</div><p class="meta qsub">${L('passHint')}</p>
    <div class="chips">${(v.sel || []).map(n => `<button class="lchip lv2" data-p="${n}" aria-label="${L('remove')} ${dn(byIso[n] || { a2: '', name: n })}">${dn(byIso[n] || { a2: '', name: String(n) })} <span aria-hidden="true">×</span></button>`).join('')}</div>
    <div class="field"><span class="lab">${L('passAdd')}</span>${homeSelect('qPass', '', 'country', L('passAddBtn'))}</div>
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
      const n = (byKey[e.target.value] || {}).id;
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
  if ($('qh1'))
    $('qh1').onchange = $('qh2').onchange = () => {
      v.keys = HOMEKEYS = [$('qh1').value, $('qh2').value].filter(Boolean);
    };
}
// US passport or US home? true / false, or null when the visitor hasn't said where they're from
function usLinked() {
  const ps = picked(ANS.perm) ? ANS.perm.sel || [] : [],
    hs = HOMEKEYS.map(k => byKey[k]).filter(Boolean);
  if (!ps.length && !hs.length) return null;
  return ps.includes(840) || hs.some(e => +isoOf(e) === 840);
}
// A line under a question built from the data: how the visitor's home (or passport country) scores on that factor,
// and the best place of the same kind in its world region. Nothing when we don't know where they're from.
function qExample(k) {
  let ref = HOMEKEYS.map(x => byKey[x]).find(Boolean) || (picked(ANS.perm) ? byIso[(ANS.perm.sel || [])[0]] : null);
  // measured figures only (filled-in estimates are left out): a city without one falls back to its country
  const sc = e => (e && e.sc && e.sc[k] != null ? Math.round(e.sc[k]) : null);
  if (ref && sc(ref) == null && ref.type === 'city') ref = byIso[isoOf(ref)];
  const x = sc(ref);
  if (x == null) return '';
  const rg = DATA.region || {},
    reg = rg[isoOf(ref)];
  if (!reg) return '';
  // ties go to a place people know: for cities the bigger metro (things happening is metro size), for countries the one
  // with the most cities on the map
  const nCities = {};
  ents.forEach(e => e.type === 'city' && (nCities[isoOf(e)] = (nCities[isoOf(e)] || 0) + 1));
  const known = e => (e.type === 'city' ? e.sc.cult || 0 : nCities[isoOf(e)] || 0);
  let best = null;
  for (const e of ents) {
    if (e === ref || e.type !== ref.type || !listable(e) || rg[isoOf(e)] !== reg || sc(e) == null) continue;
    if (!best || sc(e) > sc(best) || (sc(e) === sc(best) && known(e) > known(best))) best = e;
  }
  if (!best || sc(best) <= x) return fmt(L('qCmpTop'), { a: dn(ref), x });
  return fmt(L('qCmp'), { a: dn(ref), x, b: dn(best), y: sc(best) });
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
// Every place lookup on the page (home bases, passports, job offers) opens this same searchable sheet.
// kind picks the list: 'place' = any city or country on the map, 'country' = every country (passports),
// 'offer' = cities with pay and rent figures. empty = what the button says when nothing is chosen.
const PICKERS = {
  place: () => ents.filter(e => listable(e) && e.hasGeo),
  country: () => ents.filter(e => e.type === 'country' && typeof e.id === 'number' && e.a2 && e.id !== 10), // no Antarctica
  offer: () => ents.filter(e => e.type === 'city' && MONEYD[e.name]),
};
const placeLabel = (e, empty) =>
  e ? dn(e) + (e.type === 'city' && countryOf(e) ? ', ' + countryOf(e) : '') : empty || L('none');
function homeSelect(id, val, kind = 'place', empty = '') {
  const e = byKey[val];
  return `<div class="hpick"><input type="hidden" id="${id}" value="${val || ''}"><button type="button" class="hpbtn" data-for="${id}" data-kind="${kind}" data-empty="${empty}" aria-haspopup="dialog"><span>${placeLabel(e, empty)}</span>${IC('chev', 14, 2.4)}</button></div>`;
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
  // the visitor's own passports and homes; until their answers apply, the page is showing Adriano's, so use the quiz's
  const mine = MODE === 'yours';
  (mine ? passSpec(PERMMODE) : picked(ANS.perm) ? ANS.perm.sel || [] : []).forEach(n => add(byIso[n]));
  (mine ? HOMES.map(h => byKey[h.key]) : HOMEKEYS.map(k => byKey[k])).forEach(add);
  return out.slice(0, 6);
}
function openPicker(id) {
  const D = $('hpDialog'),
    inp = $(id),
    btn = document.querySelector(`.hpbtn[data-for="${id}"]`),
    kind = (btn && btn.dataset.kind) || 'place',
    empty = (btn && btn.dataset.empty) || '',
    fold = s =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
  const all = PICKERS[kind]().sort((a, b) => dn(a).localeCompare(dn(b), LANG)),
    inList = new Set(all);
  const row = e =>
    `<button type="button" class="hprow${inp.value === (e ? e.key : '') ? ' on' : ''}" data-k="${e ? e.key : ''}"><span>${e ? dn(e) : L('none')}</span>${e && kind !== 'country' ? `<small>${e.type === 'city' ? L('city') + (countryOf(e) ? ' · ' + countryOf(e) : '') : L('country')}</small>` : ''}</button>`;
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
    const sug = suggestedPlaces().filter(e => inList.has(e)),
      groups = {};
    all.forEach(e => {
      (groups[letter(e)] = groups[letter(e)] || []).push(e);
    });
    L_.innerHTML =
      (empty ? '' : row(null)) +
      (sug.length ? `<h4 class="hphead">${L('grpSuggested')}</h4>${sug.map(row).join('')}` : '') +
      Object.keys(groups)
        .map(k => `<h4 class="hphead" id="hp-${k}">${k}</h4>${groups[k].map(row).join('')}`)
        .join('');
    $('hpRail').innerHTML = Object.keys(groups)
      .map(k => `<button type="button" data-l="${k}" aria-label="${k}">${k}</button>`)
      .join('');
  }
  $('hpSearch').value = '';
  $('hpSearch').placeholder = L({ place: 'hpSearch', country: 'hpSearchC', offer: 'hpSearchO' }[kind]);
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
    if (btn) btn.querySelector('span').textContent = placeLabel(byKey[b.dataset.k], empty);
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
const applies = q => !q.show || q.show();
const moreLeft = () => QUIZ.filter(q => !answered(q) && ANS[q.id] !== 'skip' && applies(q));
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
let QDIR = 1; // which way the person last moved, so a question that doesn't apply is skipped in that direction
function renderQuiz() {
  if (QDONE) return renderDone();
  if (QSTEP >= QLIST.length) return finishQuiz();
  const cur = QLIST[QSTEP];
  if (cur.show && !cur.show()) {
    if (!answered(cur)) ANS[cur.id] = 'skip';
    QSTEP = QDIR < 0 && QSTEP > 0 ? QSTEP - 1 : QSTEP + 1;
    return renderQuiz();
  }
  const total = QLIST.length,
    n = QSTEP + 1,
    last = QSTEP === QLIST.length - 1;
  const Q = $('qwrap');
  let body;
  if (cur.picker) body = (QSTEP === 0 ? `<p class="meta qtip">${L('qtip')}</p>` : '') + pickerBody(cur);
  else {
    const q = cur,
      [title, opts] = qText(q.id),
      ord = ORDER[q.id] || opts.map((o, i) => i);
    // a trailing example in brackets becomes a quieter second line: "How much does X matter?" / "Think Tampico vs. New York."
    const mt = /^(.+?)\s*[(（](.+)[)）]\s*$/.exec(title),
      head = mt ? mt[1] : title,
      sub = mt ? mt[2] : '',
      ex = q.ex ? qExample(q.ex) : '';
    body = `${QSTEP === 0 ? `<p class="meta qtip">${L('qtip')}</p>` : ''}<div class="qtitle">${head}</div>${sub ? `<p class="meta qsub">${sub}</p>` : ''}${ex ? `<p class="meta qsub qex">${ex}</p>` : ''}<div class="opts">${ord.map(i => `<button class="opt" data-i="${i}" aria-pressed="${ANS[q.id] === i}"><span class="dot"></span><span>${opts[i]}</span></button>`).join('')}</div>`;
  }
  Q.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span class="lab">${fmt(L('qOf'), { n, t: total })}</span><button class="ghost" id="qSkip">${QMORE ? L('doneMap') : L('skip')}</button></div>
  <div class="progress"><span style="width:${Math.round((n / total) * 100)}%"></span></div>${body}
  <div class="qnav"><button id="qBack" ${QSTEP === 0 ? 'style="visibility:hidden" tabindex="-1" aria-hidden="true"' : ''}>${L('back')}</button><span class="toggles"><button class="ghost" id="qUnsure">${L('unsure')}</button>${answered(cur) ? `<button id="qNext" ${last ? 'class="primary"' : ''}>${last ? L('finish') : L('next')}</button>` : ''}</span></div>`;
  Q.querySelectorAll('.opt').forEach(
    b =>
      (b.onclick = () => {
        ANS[QLIST[QSTEP].id] = +b.dataset.i;
        Q.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-pressed', x === b));
        setTimeout(() => {
          QDIR = 1;
          QSTEP++;
          renderQuiz();
        }, 180);
      })
  );
  if (cur.picker) wirePicker(cur);
  if ($('qBack'))
    $('qBack').onclick = () => {
      QDIR = -1;
      QSTEP = Math.max(0, QSTEP - 1);
      renderQuiz();
    };
  if ($('qNext'))
    $('qNext').onclick = () => {
      QDIR = 1;
      QSTEP++;
      renderQuiz();
    };
  if ($('qUnsure'))
    $('qUnsure').onclick = () => {
      ANS[QLIST[QSTEP].id] = 'skip';
      QDIR = 1;
      QSTEP++;
      renderQuiz();
    };
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
  QDIR = 1;
  QDONE = QMORE = false;
  HOMEKEYS = [];
  QLIST = full === true ? QUIZ.slice() : QUIZ.filter(q => SIMPLE.includes(q.id));
  ORDER = {};
  QUIZ.forEach(q => {
    const n = QSTR.en[q.id][1].length,
      idx = [...Array(n).keys()];
    if (q.last) ORDER[q.id] = shuffle(idx.filter(i => !q.last.includes(i))).concat(q.last);
    else if (q.nominal) {
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
  const un = QUIZ.filter(q => !answered(q) && q.picker !== 'where' && applies(q)); // home bases are set in the settings panel
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
  if (picked(ANS.where)) HOMEKEYS = (ANS.where.keys || []).filter(k => byKey[k]);
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
