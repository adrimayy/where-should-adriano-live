'use strict';
/* ---------------- panels ---------------- */
// the one-line version for the map sheet: two strengths and the main drawback
// a label inside a sentence: lower case, except in German, where nouns keep their capital letter
const low = s => (LANG === 'de' ? s : s.toLowerCase());
// what this place does well among the things the person weighs (4 or 5 out of 5), most important first
function strengths(e, n) {
  return FACTORS.filter(f => e.sc[f.k] != null && e.sc[f.k] >= 4 && W[f.k] > 0 && counts(e, f.k))
    .sort((a, b) => W[b.k] - W[a.k] || e.sc[b.k] - e.sc[a.k])
    .slice(0, n)
    .map(f => f.k);
}
function whyShort(e) {
  const ks = strengths(e, 2).map(FL);
  const parts = [];
  if (ks.length) parts.push(fmt(L('whyGood'), { x: ks.join(', ') }));
  if (e.lim !== 'none') parts.push(fmt(L('whyBad'), { x: FD(e.lim) }));
  return parts.join(' · ') || L('whyNone');
}
// A ranking row's reasons at a glance: up to two strengths (+) and the main drawback (−), the way people list pros and
// cons. Where the verdict sits below what the score alone would give, the reason follows in words.
function rowWhy(e) {
  const pro = strengths(e, 2).map(k => `<span class="why5 pro">+ ${FL(k)}</span>`),
    con =
      e.lim !== 'none' ? [`<span class="why5 con">− ${FD(e.lim)}${e.gated ? L('dealRule') : ''}</span>`] : [];
  const cap = e.dataCap
    ? `<span class="capnote">${e.dataCap[0] === 'share' ? L('capShare') : fmt(L('capData'), { x: e.dataCap.map(k => low(FL(k))).join(', ') })}</span>`
    : '';
  return (pro.concat(con).join('') || L('whyNone')) + cap;
}
function whyLine(e) {
  if (e.tier === 'nodata') return L('whyNoData');
  const ks = FACTORS.filter(f => e.sc[f.k] != null && e.sc[f.k] >= 4 && W[f.k] > 0 && counts(e, f.k))
    .sort((a, b) => W[b.k] - W[a.k] || e.sc[b.k] - e.sc[a.k])
    .slice(0, 3)
    .map(f => low(FL(f.k)));
  const join = a => {
    try {
      return new Intl.ListFormat(LANG, { type: 'conjunction' }).format(a);
    } catch (e) {
      return a.join(', ');
    }
  };
  const good = ks.length ? fmt(L('whyGood'), { x: join(ks) }) : L('whyNone');
  const bad = e.lim !== 'none' ? ' ' + fmt(L('whyBad'), { x: low(FD(e.lim)) }) : '';
  const cap = e.dataCap
    ? ' ' +
      (e.dataCap[0] === 'share'
        ? L('capShare')
        : fmt(L('capData'), { x: join(e.dataCap.map(k => low(FL(k)))) }))
    : '';
  const lk = e.likely
    ? ' ' + fmt(L('likelyCap'), { x: low(FL(e.lim)), p: pct(pBelow(e, e.lim, e.lim === 'free' ? 2 : 1)) })
    : '';
  const fw = e.freeWhy ? ' ' + L(e.freeWhy === 'own' ? 'freeOwn' : 'freeLow') : '';
  // a dealbreaker can put a place below what its score says: say so, with the tier the score alone would give
  const raw =
    e.score >= CUT.fit ? 'fit' : e.score >= CUT.ok ? 'ok' : e.score >= CUT.caution ? 'caution' : 'avoid';
  const gn =
    e.gated && raw !== e.tier
      ? ' ' +
        fmt(L('gatedNote'), {
          s: Math.round(e.score / 5) * 5,
          t: L('tiersShort')[raw],
          x: low(FL(e.lim)),
        })
      : '';
  return good + bad + cap + lk + gn + fw;
}
function srcTag(e, k) {
  if (e.how && e.how[k] === 'imp')
    return `<span class="tag calc-only" style="color:var(--you)">${L('tagImp')}</span>`;
  if (CALC.has(k) || (k === 'clim' && CLIMMODE !== 'mild'))
    return `<span class="tag calc-only">${L('tagCalc')}</span>`;
  if (backed(e, k)) return `<span class="tag calc-only">${L('tagData')}</span>`;
  return `<span class="tag calc-only" style="color:var(--muted)">${L('tagEst')}</span>`;
}
// what each published figure covers, and its year (Davis: geography; Cairo: per-source year)
const SRCMETA = {
  uhc: ['country', '2023'],
  nqolh: ['city', '2026'],
  census_ins: ['country', '2025'],
  coneval: ['country', '2022'],
  eiu: ['country', '2023'],
  fh: ['country', '2026'],
  epa: ['city', ''],
  laus: ['metro', '2025–26'],
  eurostat: ['region', ''],
  chrhom: ['metro', '2017–2023'],
  sahie: ['metro', '2023'],
  itdp: ['urban area', '2025'],
  oecdh: ['country', ''],
  iloh: ['country', ''],
  hom: ['country', ''],
  fbi: ['city', '2024'],
  nqols: ['city', '2026'],
  gallup: ['country', '2024'],
  ei26s: ['country', '2026'],
  ei25s: ['country', '2025'],
  ei24f: ['country', '2024'],
  eicity24s: ['city', '2024'],
  mai: ['country', '2016–17'],
  nlpp: ['country', '2026'],
  ncol: ['city', '2026'],
  ncolc: ['country', '2026'],
  nqolc: ['city', '2026'],
  nqolt: ['city', '2026'],
  ntr: ['city', '2026'],
  eq: ['country', '2026'],
  whr: ['country', '2026'],
  wps: ['country', '2025'],
  iloy: ['country', '2024'],
  ilo: ['country', '2024'],
  inf: ['country', 'latest'],
  gdp: ['metro', '2021–24'],
  gdpnyc: ['metro', '2024'],
  bea: ['county', '2024'],
  pop: ['metro', '2021–24'],
  popnyc: ['metro', '2024'],
  nychvs: ['city', '2023'],
  censusmsa: ['metro', '2024'],
  census: ['country', '2025'],
  ei25r: ['country', '2025'],
  ei25h: ['country', '2025'],
  ei24r: ['country', '2024'],
  ei24e: ['country', '2024'],
  eicity24r: ['city', '2024'],
  eicity24h: ['city', '2024'],
  ei26r: ['country', '2026'],
  temp: ['station', '1991–2020'],
  tempnear: ['station', '1991–2020'],
  rpp: ['metro', '2023'],
  acspay: ['metro', '2025'],
  acscomm: ['metro', '2024'],
  acsvac: ['metro', '2024'],
  tempjj: ['station', '1991–2020'],
  tempjjnear: ['station', '1991–2020'],
  tempctt: ['station', '1991–2020'],
  pres24: ['state', '2024'],
  county24: ['county', '2024'],
  cmhc: ['city', '2025'],
  lirr: ['town', '2026'],
  sblink: ['city', '2026'],
  sblinknyc: ['metro', '2026'],
  items: ['city', 'Apr 2026'],
  itemsn: ['city rent, national pay', 'Apr 2026'],
  nidx: ['city', '2026'],
  money: ['country (its cities)', '2026'],
  who: ['city', ''],
  wbpm: ['country', '2023'],
  cpi: ['country', '2025'],
  pwt: ['country', ''],
  wri: ['country', '2026'],
};
const barCol = v => (
  (v = Math.round(v)),
  v >= 4 ? '#2f9e5b' : v === 3 ? '#e9b02b' : v === 2 ? '#e57a3c' : '#cf3f3f'
);
function rawFor(e, k) {
  const own = RAWD[e.type === 'city' ? 'city:' + e.name : 'c:' + e.id] || {};
  if (own[k]) return own[k].map(r => ({ r, natl: r[0].endsWith('*') }));
  if (e.type === 'city' && e.how[k] === 'obs') {
    const c = RAWD['c:' + e.iso] || {};
    if (c[k]) return c[k].map(r => ({ r, natl: true }));
  }
  return [];
}
function calcTable(e) {
  const lang = LANG === 'es' ? 1 : 0,
    rows = [...FACTORS].sort((a, b) => (W[b.k] || 0) - (W[a.k] || 0));
  let tot = 0;
  const body = rows
    .map(f => {
      const k = f.k,
        how = e.how[k],
        w = W[k] || 0,
        v = e.v[k];
      let src = '';
      if (k === 'kin' && e.kinWhy)
        src =
          L('tagCalc') +
          ': ' +
          (e.kinWhy.length
            ? fmt(L('kinSrc'), { x: e.kinWhy.map(n => dn(byIso[n] || { name: String(n) })).join(', ') })
            : L('kinNone'));
      if (k === 'day' && e.hasGeo)
        src = fmt(L('calcDay'), {
          h: hmOf(e.dayH)[0],
          m: hmOf(e.dayH)[1],
        });
      else if (k === 'fam' && e.flights && e.flights.length)
        src = fmt(L('calcTrip'), { h: e.flights.map(x => Math.round(x)).join(' / ') });
      else if (k === 'tz' && e.gaps && e.gaps.length)
        src = fmt(L('calcTz'), { h: e.gaps.map(x => +x.toFixed(1)).join(' / ') });
      else if (k === 'sea' && e.coast != null) src = fmt(L('calcSea'), { km: e.coast });
      else if (k === 'perm') {
        const v0 = e.sc.perm;
        src = `<div>${L('permRight')}: <b>${v0 >= 5 ? L('yes') : L('no')}</b></div><div>${L('permRoute')}: <b>${v0 >= 5 ? '—' : v0 >= 4 ? L('routeEasy') : v0 >= 3 ? L('routeSome') : L('routeHard')}</b></div><div class="muted">${L('calcRule')} · ${L('verified')}</div>`;
      } else if (k === 'lang') src = L('calcRule');
      else if (k === 'pol' && isoOf(e) !== 840) src = `<span class="muted">${L('notApplicable')}</span>`;
      else if (k === 'pol') {
        const rs = rawFor(e, 'pol');
        src = rs.length
          ? rs
              .map(
                ({ r }) =>
                  `<div><a href="${RAWU[r[0]]}" target="_blank" rel="noopener">${RAWL[r[0]][LANG === 'es' ? 1 : 0]}</a>: <span class="mono">${r[1]}</span> → <b>${polBand((POLMODE === 'r' ? -1 : 1) * parseFloat(r[1].split(': ')[1].replace(/^R \+/, '-').replace(/^D \+/, '')))}</b> <span class="muted">· ${SRCMETA[r[0]][0]} · 2024</span></div>`
              )
              .join('')
          : `<span class="muted">${L('calcNone')}</span>`;
      } else if (k === 'clim' && CLIMMODE !== 'mild') src = L('tagCalc') + ': ' + L('latitude');
      else {
        const rs = rawFor(e, k).concat(
          k === 'jobs' && FIELD === 'tech' && e.how.jobs !== 'est' ? rawFor(e, 'tech') : []
        );
        src = rs
          .map(({ r, natl }) => {
            const key = r[0].replace('*', ''),
              lb = RAWL[key] || [key, key, null],
              u = lb[2] && RAWU[lb[2]];
            const md = SRCMETA[key] || ['', ''],
              unit = natl ? 'country' : md[0],
              ut = L('units')[unit] || unit;
            return `<div>${u ? `<a href="${u}" target="_blank" rel="noopener">${lb[lang]}</a>` : lb[lang]}: <span class="mono">${r[1]}</span> → <b>${r[2]}</b>${r[3] != null && Math.abs(r[3] - r[2]) > 0.04 && useCont ? ` <span class="muted mono">(${r[3].toFixed(2)})</span>` : ''} <span class="muted">· ${ut}${md[1] ? ' · ' + md[1] : ''}</span></div>`;
          })
          .join('');
        if (how === 'imp')
          src += `<div class="muted">${fmt(L('calcImp'), { sd: (e.sd[k] || 0).toFixed(1) })}${e.dr[k] ? ' · ' + fmt(L('calcDraws'), { d: e.dr[k].map(x => Math.round(x)).join('') }) : ''}</div>`;
        if (k === 'jobs' && e.hub) src += `<div class="muted">${fmt(L('hubNote'), { c: dn(e.hub) })}</div>`;
        if (k === 'pay' && e.payAdj) {
          // how the figure was re-worked for the person's kind of work, and where that pay level comes from
          const sh = jobShare(e),
            left = Math.round(moneyLeftAt(e, sh.r) / 10) * 10,
            from = fmt(L('paySrc')[sh.src], {
              y: sh.y,
              u: RAWU[{ metro: 'oewsm', us: 'oews' }[sh.src] || 'ilopay'],
            });
          src += `<div class="muted">${fmt(L('payJobNote'), { p: Math.round(sh.r * 100), x: (left < 0 ? '−$' : '$') + Math.abs(left).toLocaleString('en-US'), s: from })}</div>`;
        }
        if (k === 'pay' && e.payMove != null)
          src += `<div class="muted">${fmt(L('payJobMove'), { d: (e.payMove > 0 ? '+' : e.payMove < 0 ? '−' : '') + Math.abs(e.payMove).toFixed(1) })}</div>`;
        if (how === 'est') src += `<div class="muted">${L('calcEst')}</div>`;
        if (!src) src = `<span class="muted">${L('calcNone')}</span>`;
      }
      const used =
        v == null
          ? '—'
          : (how === 'imp' ? '≈' + v.toFixed(1) : String(Math.round(v * 100) / 100)) +
            (norm && v != null ? ` <span class="muted">[${nv(k, v).toFixed(1)}]</span>` : '');
      const pts = e.part && e.part[k] != null ? e.part[k] : null;
      if (pts != null) tot += pts;
      return `<tr style="${w > 0 ? '' : 'opacity:.5'}"><td>${FL(k)}</td><td>${src}</td><td class="mono">${used}</td><td class="mono">${fmtW(w)}</td><td class="mono">${pts != null ? pts.toFixed(1) : w > 0 ? '—' : L('calcOff')}</td></tr>`;
    })
    .join('');
  return `<details class="calc" id="calcT" open><summary><b>${L('calcTitle')}</b></summary><div class="biastable"><table><thead><tr><th>${L('calcFactor')}</th><th>${L('calcSrc')}</th><th>${L('calcUsed')}</th><th>${L('calcW')}</th><th>${L('calcPts')}</th></tr></thead><tbody>${body}<tr><td><b>${L('calcTotal')}</b></td><td></td><td></td><td></td><td class="mono"><b>${AGG === 'geo' ? e.score : tot.toFixed(1)}</b></td></tr></tbody></table></div><p class="meta">${L('calcNote')}${AGG === 'geo' ? ' ' + L('geoNote') : ''}</p>
  ${e.rubin ? `<p class="meta mono">${fmt(L('rubinLine'), { t: e.rubin.sd.toFixed(1), b: e.rubin.between.toFixed(1), w: e.rubin.within.toFixed(1) })}</p>` : ''}</details>`;
}
// ---- compared with where you live now ----
// A score out of 5 says little on its own; "43 minutes there, 30 here" says what would change. For the factors the
// person weighs: this place's published figure next to the same figure for their home, in the plain words of the
// quiz's examples (swText). Only figures measured the same way in both places (SWING: the same source, or sources that
// report the same thing; a city against a city, a country against a country), never a filled-in value, and nothing
// when the two places share the figure.
// Each line is better (good), worse, or about the same. "About the same" takes both tests: the two figures are within
// 10% of each other, and on the page's 1-5 scale they are closer than the factor's assumed measurement error (ME).
// A factor is often scored from more than the one figure a sentence can hold (healthcare: three sources; access to
// transit: five figures in one). Where the figure points one way and the page's own score for the two places points
// the other, the figure alone would mislead, so nothing is said about that factor.
// Real differences come first, most important first.
function homeFigures(e) {
  const h = MODE === 'yours' ? HOMES[0] : null;
  if (!h || h === e) return [];
  const city = x => (x.type === 'city' ? x : null),
    country = x => (x.type === 'city' ? x.countryEnt || null : x),
    out = [];
  // o.val: the figure shown (o.lo: lower is better); o.score: the page's 1-5 value for it; o.tol: the smallest gap
  // that counts; o.same: its own test for "about the same"; o.k: the factor, to check the figure against its score
  const pair = (kind, A, B, o) => {
    if (!A || !B || A === B) return null;
    const x = o.val(A),
      y = o.val(B);
    if (x == null || y == null) return null;
    const t = swText(kind, A, B, x, y);
    if (!t) return null;
    const good = o.lo ? y < x : y > x,
      d = o.score(B) - o.score(A),
      close = Math.abs(x - y) <= 0.1 * Math.max(Math.abs(x), Math.abs(y)),
      whole = X => (o.k && X.how && X.how[o.k] === 'obs' && X.v[o.k] != null ? X.v[o.k] : null),
      D = whole(A) != null && whole(B) != null ? whole(B) - whole(A) : 0;
    if ((Math.abs(d) >= o.tol && d > 0 !== good) || (Math.abs(D) >= o.tol && D > 0 !== good)) return null;
    return { t, good, same: o.same ? o.same(x, y) : close && Math.abs(d) < o.tol, a: A.key, b: B.key };
  };
  [...FACTORS]
    .filter(f => W[f.k] > 0)
    .sort((a, b) => W[b.k] - W[a.k])
    .forEach(f => {
      const k = f.k;
      let r = null;
      // worked out from the map: under half an hour of daylight, or the same distance band from the sea, is no difference
      if (k === 'day')
        r = pair('day', city(h), city(e), {
          val: x => (x.hasGeo ? x.dayH : null),
          score: x => x.dayH,
          tol: 0.5,
          same: (x, y) => Math.abs(x - y) < 0.5,
        });
      else if (k === 'sea')
        r = pair('sea', city(h), city(e), {
          val: x => (x.coast != null ? x.coast : null),
          lo: 1,
          score: x => seaBand(x.coast),
          tol: 0.5,
          same: (x, y) => seaBand(x) === seaBand(y),
        });
      else {
        // pay that comes from elsewhere (remote work, a pension, a student budget): what counts is prices there
        const kind = k === 'pay' && FIELD === 'remote' ? 'cost' : k,
          S = SWING[kind],
          tol = ME[kind] || 0.25;
        if (!S) return;
        // typical pay for the person's kind of work, where both cities have pay and rent figures
        if (k === 'pay' && e.payAdj) {
          const val = x => payJobLeft(x, PAYJOB);
          r = pair('payjob', city(h), city(e), { val, score: x => moneyScore(val(x)), tol, k });
        }
        for (const g of r ? [] : S.g) {
          const val = x => swingVal(x, kind, g.s),
            score = x => ((x = swingRow(x, kind, g.s)), x[3] != null ? x[3] : x[2]),
            both = city(h) && city(e) && val(h) != null && val(e) != null,
            at = (g.t || (both ? 'city' : 'country')) === 'city' ? city : country;
          r = pair(kind, at(h), at(e), { val, lo: S.lo, score, tol, k });
          if (r) break;
        }
      }
      if (r) out.push({ k, ...r });
    });
  return out.filter(x => !x.same).concat(out.filter(x => x.same));
}
// Two or three plain sentences, from published figures only: where this place sits among the others in the atlas,
// on factors you weigh. Comparisons within the atlas, not superlatives, so they hold up; rounded down to 5%.
function factLines(e) {
  if (e.est || !e.how) return '';
  const pool = ents.filter(x => x.type === e.type && listable(x) && x !== e),
    c = [];
  FACTORS.forEach(f => {
    const k = f.k;
    if (f.calc || TRADE_SKIP.has(k) || !(W[k] > 0)) return;
    if (e.how[k] !== 'obs' || !backed(e, k) || e.v[k] == null) return;
    const xs = pool.filter(x => x.how && x.how[k] === 'obs' && x.v[k] != null).map(x => x.v[k]);
    if (xs.length < 30) return;
    const below = xs.filter(v => v < e.v[k]).length / xs.length,
      above = xs.filter(v => v > e.v[k]).length / xs.length;
    if (below >= 0.8) c.push({ k, good: true, p: below, s: below * (1 + W[k]) });
    else if (above >= 0.8) c.push({ k, good: false, p: above, s: above * (1 + W[k]) });
  });
  const by = (a, b) => b.s - a.s,
    pick = c
      .filter(x => x.good)
      .sort(by)
      .slice(0, 2)
      .concat(
        c
          .filter(x => !x.good)
          .sort(by)
          .slice(0, 1)
      );
  if (!pick.length) return '';
  const city = e.type === 'city';
  return `<ul class="facts">${pick
    .map(
      x =>
        `<li class="${x.good ? 'good' : 'bad'}">${fmt(L(x.good ? (city ? 'factGoodC' : 'factGoodN') : city ? 'factBadC' : 'factBadN'), { f: FL(x.k), p: Math.floor(x.p * 20) * 5 })}</li>`
    )
    .join('')}</ul>`;
}
// one factor's line: its name, a bar and its 1-5 value (or why it has none)
function brow(e, f) {
  const how = e.how[f.k];
  if (how === 'imp') {
    const m = e.v[f.k],
      sd = e.sd[f.k];
    return `<div class="brow"><span class="lbl">${FL(f.k)}${srcTag(e, f.k)}</span><span class="track"><span class="fill" style="width:${m * 20}%;background:${barCol(Math.round(m))};opacity:.55"></span></span><span class="v">≈${m.toFixed(1)}/5<span class="calc-only"> ±${sd.toFixed(1)}</span></span></div>`;
  }
  const v = e.sc[f.k];
  if (v == null) {
    const na = f.k === 'pol' && isoOf(e) !== 840;
    return `<div class="brow" style="opacity:.6"><span class="lbl">${FL(f.k)}${na ? '' : srcTag(e, f.k)}</span><span class="track"></span><span class="v">${na ? L('notApplicable') : L('noData')}</span></div>`;
  }
  if (!(W[f.k] > 0) && (how === 'obs' || how === 'est')) {
    return `<div class="brow" style="opacity:.45"><span class="lbl">${FL(f.k)}${srcTag(e, f.k)}</span><span class="track"><span class="fill" style="width:${v * 20}%;background:${barCol(v)}"></span></span><span class="v">${Math.round(v * 10) / 10}/5 · ${L('wOff')}</span></div>`;
  }
  const off = how !== 'obs' && how !== 'est';
  return `<div class="brow${v <= 2 && !off ? ' weak' : ''}" style="${off ? 'opacity:.45' : ''}"><span class="lbl">${FL(f.k)}${srcTag(e, f.k)}</span><span class="track"><span class="fill" style="width:${v * 20}%;background:${barCol(v)}"></span></span><span class="v">${off ? L('notCounted') : Math.round(v * 10) / 10 + '/5'}</span></div>`;
}
// The published figure behind one factor for this place, in plain lines: the source (linked), the figure as published,
// what it covers (this city, its metro area, the whole country) and its year. Factors the page works out itself say how.
function figLines(e, k) {
  const U = L('units'),
    how = e.how[k],
    out = [];
  if (k === 'kin')
    out.push(
      e.kinWhy && e.kinWhy.length
        ? fmt(L('kinSrc'), { x: e.kinWhy.map(n => dn(byIso[n] || { name: String(n) })).join(', ') })
        : L('kinNone')
    );
  else if (k === 'day') {
    if (e.hasGeo)
      out.push(
        fmt(L('calcDay'), {
          h: hmOf(e.dayH)[0],
          m: hmOf(e.dayH)[1],
        })
      );
  } else if (k === 'fam') {
    if (e.flights && e.flights.length)
      out.push(fmt(L('calcTrip'), { h: e.flights.map(x => Math.round(x)).join(' / ') }));
  } else if (k === 'tz') {
    if (e.gaps && e.gaps.length)
      out.push(fmt(L('calcTz'), { h: e.gaps.map(x => +x.toFixed(1)).join(' / ') }));
  } else if (k === 'sea') {
    if (e.coast != null) out.push(fmt(L('calcSea'), { km: e.coast }));
  } else if (k === 'perm' || k === 'lang') out.push(L('calcRule'));
  else if (k === 'clim' && CLIMMODE !== 'mild') out.push(L('latitude'));
  else if (!(k === 'pol' && isoOf(e) !== 840)) {
    rawFor(e, k)
      .concat(k === 'jobs' && FIELD === 'tech' && how !== 'est' ? rawFor(e, 'tech') : [])
      .forEach(({ r, natl }) => {
        const key = r[0].replace('*', ''),
          lb = RAWL[key] || [key, key, null],
          u = lb[2] && RAWU[lb[2]],
          md = SRCMETA[key] || ['', ''],
          unit = natl ? 'country' : md[0],
          name = lb[LANG === 'es' ? 1 : 0];
        out.push(
          `${u ? `<a href="${u}" target="_blank" rel="noopener">${name}</a>` : name}: <span class="mono">${r[1]}</span><span class="muted">${unit ? ' · ' + (U[unit] || unit) : ''}${md[1] ? ' · ' + md[1] : ''}</span>`
        );
      });
    if (how === 'imp') out.push(`<span class="muted">${L('figImp')}</span>`);
    else if (how === 'est') out.push(`<span class="muted">${L('calcEst')}</span>`);
  }
  return out.length ? `<div class="gfig">${out.map(x => `<div>${x}</div>`).join('')}</div>` : '';
}
// ---- what the score is made of ----
// The 26 factors under the page's eight groups, the group that counts most for this person first. A group is one
// line: its name, how much of this person's score rests on it, and how the place does on it (the weighted mean of its
// factors, the same sum the score uses). A tap opens the factors, each with the published figure behind it. A group
// the person has opened stays open from place to place, so two places can be read side by side.
function breakdown(e) {
  const G = {};
  let sw = 0;
  FACTORS.forEach(f => {
    const g = (G[GROUP[f.k]] = G[GROUP[f.k]] || { fs: [], w: 0, pts: 0 }),
      on = e.v[f.k] != null && W[f.k] > 0;
    g.fs.push(f);
    if (on) {
      g.w += W[f.k];
      g.pts += (e.part && e.part[f.k]) || 0;
      sw += W[f.k];
    }
  });
  const order = GROUPS.filter(g => G[g]).sort((a, b) => G[b].w - G[a].w);
  ui.gopen = ui.gopen || new Set();
  return `<div class="grps"><span class="lab">${L('madeOf')}</span>${order
    .map(g => {
      const x = G[g],
        share = sw ? x.w / sw : 0,
        // points won out of the points this group could give, back on the page's 1-5 scale
        v = x.w ? 1 + (4 * x.pts) / (share * 100) : null,
        pc = Math.round(share * 100);
      return `<details class="grp${x.w ? '' : ' off'}" data-g="${g}"${ui.gopen.has(g) ? ' open' : ''}><summary><span class="gname">${L('groups')[g]}<small>${x.w ? fmt(L('gShare'), { p: pc < 1 ? '<1' : pc }) : L('notCounted')}</small></span><span class="track">${v == null ? '' : `<span class="fill" style="width:${v * 20}%;background:${barCol(v)}"></span>`}</span><span class="v">${v == null ? '' : Math.round(v * 10) / 10 + '/5'}</span>${IC('chev', 18)}</summary><div class="gbody">${x.fs
        .sort((a, b) => (W[b.k] || 0) - (W[a.k] || 0))
        .map(f => brow(e, f) + figLines(e, f.k))
        .join('')}</div></details>`;
    })
    .join('')}</div>`;
}
// ---- see the place: a photo, a real map, links out ----
// Everything in this block comes from outside the page, so none of it is asked for until a place's details are open,
// and each piece shows only when it has something exact to show. A link goes to this place's own page on the other
// site or it is not there (data/places.js lists only pages that were checked); the photo and the map take themselves
// away when they do not load. Nothing here is scored.
let _plP = null,
  _mlP = null,
  _rmap = null;
const placesData = () =>
  (_plP =
    _plP ||
    (window.ATLAS_PLACES // the one-file copy carries it along
      ? Promise.resolve(window.ATLAS_PLACES)
      : loadScript('data/places.js?v=' + VER).then(
          () => window.ATLAS_PLACES || {},
          () => ((_plP = null), {})
        )));
const escH = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const MAPLIB = [
  'https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.1/dist/maplibre-gl.js',
  'https://unpkg.com/maplibre-gl@5.24.1/dist/maplibre-gl.js',
];
const TILESTYLE = 'https://tiles.openfreemap.org/styles/liberty';
function mapLib() {
  return (_mlP =
    _mlP ||
    (async () => {
      for (const u of MAPLIB) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = u.replace(/\.js$/, '.css');
        document.head.appendChild(css);
        try {
          await loadScript(u);
          if (window.maplibregl) return window.maplibregl;
        } catch (x) {}
        css.remove();
      }
      _mlP = null; // a later place tries again: the connection may be back
      throw new Error('no map library');
    })());
}
// where a map of this place should look: a city and about an hour around it; a country's largest piece, edge to edge
function geoView(e) {
  if (e.type === 'city') return e.lat == null ? null : { lat: e.lat, lon: e.lon, zoom: 8 };
  const f = (typeof features !== 'undefined' ? features : []).find(d => d._e === e);
  if (!f) return null;
  let big = f;
  if (f.geometry.type === 'MultiPolygon') {
    let ba = -1;
    for (const c of f.geometry.coordinates) {
      const p = { type: 'Feature', geometry: { type: 'Polygon', coordinates: c } },
        a = d3.geoArea(p);
      if (a > ba) ((ba = a), (big = p));
    }
  }
  const [[w, s], [x, n]] = d3.geoBounds(big),
    c = d3.geoCentroid(big),
    span = Math.max(x >= w ? x - w : x + 360 - w, (n - s) * 1.7, 0.5);
  return {
    lat: c[1],
    lon: c[0],
    zoom: Math.max(2, Math.min(9, Math.floor(Math.log2(300 / span)))),
    // across the date line a box would wrap the wrong way round: the centre and zoom do
    box:
      x >= w && n - s < 150
        ? [
            [w, s],
            [x, n],
          ]
        : null,
  };
}
function realMap(e, box) {
  const v = geoView(e),
    fig = box.parentNode; // the map and the line under it that says whose map it is
  if (!v) return void (fig.hidden = true);
  const start = () =>
    mapLib()
      .then(ml => {
        if (!box.isConnected) return;
        // The same rules as the page's own map, with the same hint when they are needed: one finger scrolls the page
        // and two fingers move and pinch the map; the wheel scrolls the page and Ctrl or ⌘ + wheel zooms. A double tap
        // zooms in. Full screen is the map's alone, so there one finger moves it.
        const map = (_rmap = new ml.Map({
          container: box,
          style: TILESTYLE,
          center: [v.lon, v.lat],
          zoom: v.zoom,
          attributionControl: false, // the credit is the line under the map: on a map this small the built-in one covers it
          cooperativeGestures: true,
          locale: {
            'CooperativeGesturesHandler.MobileHelpText': L('hintTouch'),
            'CooperativeGesturesHandler.WindowsHelpText': L('hintMouse'),
            'CooperativeGesturesHandler.MacHelpText': L('hintMouse'),
          },
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
        }));
        if (map.touchZoomRotate) map.touchZoomRotate.disableRotation();
        map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');
        if (v.box) map.fitBounds(v.box, { padding: 18, animate: false });
        const home = () =>
          v.box
            ? map.fitBounds(v.box, { padding: 18 })
            : map.easeTo({ center: [v.lon, v.lat], zoom: v.zoom });
        const btn = (icon, label, fn) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.innerHTML = IC(icon, 18, 2);
          b.title = label;
          b.setAttribute('aria-label', label);
          b.onclick = fn;
          return b;
        };
        const onKey = ev => ev.key === 'Escape' && (ev.stopPropagation(), full(false));
        const full = on => {
          fig.classList.toggle('full', on);
          document.body.classList.toggle('map-full', on);
          if (map.cooperativeGestures) map.cooperativeGestures[on ? 'disable' : 'enable']();
          fb.innerHTML = IC(on ? 'shrink' : 'expand', 18, 2);
          fb.title = L(on ? 'mapSmall' : 'mapFull');
          fb.setAttribute('aria-label', fb.title);
          document[on ? 'addEventListener' : 'removeEventListener']('keydown', onKey, true);
          map.resize();
        };
        const fb = btn('expand', L('mapFull'), () => full(!fig.classList.contains('full')));
        map._leaveFull = () => full(false);
        map.addControl(
          {
            onAdd() {
              const d = document.createElement('div');
              d.className = 'maplibregl-ctrl maplibregl-ctrl-group rmctl';
              d.append(btn('reset', fmt(L('mapBack'), { p: dn(e) }), home), fb);
              return d;
            },
            onRemove() {},
          },
          'top-right'
        );
        let drawn = false;
        const quit = () => {
          if (drawn) return;
          try {
            map.remove();
          } catch (x) {}
          if (_rmap === map) _rmap = null;
          fig.hidden = true;
        };
        const t = setTimeout(quit, 12000);
        map.on('error', quit); // before the first drawing, an error means the style or its tiles are not coming
        map.on('load', () => {
          drawn = true;
          clearTimeout(t);
          fig.classList.add('on');
          if (e.type === 'city')
            return void new ml.Marker({ color: '#0f766e' }).setLngLat([e.lon, e.lat]).addTo(map);
          const cs = ents.filter(c => c.type === 'city' && c.iso === e.id && c.lat != null);
          if (!cs.length) return;
          map.addSource('pts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: cs.map(c => ({
                type: 'Feature',
                properties: { key: c.key },
                geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
              })),
            },
          });
          map.addLayer({
            id: 'pts',
            type: 'circle',
            source: 'pts',
            paint: {
              'circle-radius': 5,
              'circle-color': '#0f766e',
              'circle-stroke-color': '#fff',
              'circle-stroke-width': 1.5,
            },
          });
          map.on('click', 'pts', ev => openPlace(byKey[ev.features[0].properties.key]));
          map.on('mouseenter', 'pts', () => (map.getCanvas().style.cursor = 'pointer'));
          map.on('mouseleave', 'pts', () => (map.getCanvas().style.cursor = ''));
        });
      })
      .catch(() => (fig.hidden = true));
  // not before the box is about to be seen: someone who reads the verdict and goes back downloads nothing
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      es => {
        if (es.some(x => x.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: '300px' }
    );
    io.observe(box);
  } else start();
}
// Reddit: a search, not a city's own subreddit. Reddit refuses every automated check (servers, automated browsers
// and a script on a home connection alike), so no subreddit could be confirmed to exist; a search for people writing
// about moving to the place always lands somewhere real. The place's English name, with the state spelled out where
// the atlas needed one to tell two cities apart (Portland ME is "Portland Maine").
const US_STATE = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'DC',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};
function redditSearch(e) {
  const name = e.name
    .replace(/\s*\((.*?)\)\s*$/, ' $1')
    .replace(/ ([A-Z]{2})$/, (m, st) => ' ' + (US_STATE[st] || st));
  return 'https://www.reddit.com/search/?q=' + encodeURIComponent('moving to ' + name);
}
const outLink = (brand, label, url) =>
  `<a href="${url}" target="_blank" rel="noopener"><small>${brand}</small><b>${label}</b></a>`;
// a Creative Commons licence's own page, from its short name ("CC BY-SA 4.0", "CC BY 2.0 de", "CC0")
function licenceUrl(lic) {
  const m = /^CC[ -](BY(?:-(?:SA|ND|NC|NC-SA|NC-ND))?)[ -](\d\.\d)(?: ([a-z]{2}))?$/i.exec(lic || '');
  if (m)
    return `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/${m[3] ? m[3].toLowerCase() + '/' : ''}`;
  return /^CC0/i.test(lic || '') ? 'https://creativecommons.org/publicdomain/zero/1.0/' : '';
}
const commons = (file, w) =>
  'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=' + w;
// The block is built once for a place and kept while the page redraws around it (a slider moved, the simulation done):
// a map and a photo that reloaded on every redraw would flicker and download twice.
function seePlace(e, slot) {
  const old = $('detail')._see;
  if (old && old.dataset.key === e.key && old.dataset.lang === LANG) {
    slot.replaceWith(old);
    if (_rmap) _rmap.resize();
    return;
  }
  if (_rmap) {
    try {
      if (_rmap._leaveFull) _rmap._leaveFull();
      _rmap.remove();
    } catch (x) {}
    _rmap = null;
  }
  const v = geoView(e),
    see = document.createElement('div');
  see.className = 'see';
  see.dataset.key = e.key;
  see.dataset.lang = LANG;
  see.innerHTML = `<span class="lab">${L('seeT')}</span><div class="seephoto"></div><figure class="mapfig"><div class="rmap" role="region" aria-label="${escH(fmt(L('mapAlt'), { p: dn(e) }))}"></div><figcaption><a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></figcaption></figure><div class="links">${
    v
      ? outLink(
          'Google Maps',
          L('lkMap'),
          `https://www.google.com/maps/@?api=1&map_action=map&center=${(+v.lat).toFixed(4)},${(+v.lon).toFixed(4)}&zoom=${e.type === 'city' ? 11 : v.zoom + 1}`
        )
      : ''
  }${outLink('Reddit', L('lkReddit'), redditSearch(e))}</div><p class="meta seenote">${L('seeNote')}</p>`;
  slot.replaceWith(see);
  $('detail')._see = see;
  realMap(e, see.querySelector('.rmap'));
  placesData().then(P => {
    if (!see.isConnected && $('detail')._see !== see) return;
    const d = e.type === 'city' ? (P.c || {})[e.name] : (P.n || {})[e.id];
    if (!d) return;
    const [, en, alt, , home, img, by, lic] = d,
      links = see.querySelector('.links');
    // the article in the page's language where there is one, else the English one
    const t = alt && alt[LANG] != null ? alt[LANG] || en : null,
      lang = LANG !== 'en' && t ? LANG : 'en',
      wiki = en
        ? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent((lang === 'en' ? en : t).replace(/ /g, '_'))}`
        : '';
    if (wiki) {
      const first = links.querySelector('a[href*="google.com/maps"]');
      first
        ? first.insertAdjacentHTML('afterend', outLink('Wikipedia', L('lkWiki'), wiki))
        : links.insertAdjacentHTML('afterbegin', outLink('Wikipedia', L('lkWiki'), wiki));
    }
    if (home)
      links.insertAdjacentHTML(
        'beforeend',
        outLink('Zillow', L('lkHomes'), `https://www.zillow.com/${home}/rentals/`)
      );
    if (img) {
      // The photo is the way into the article. The line under it is the credit: who made it, under which licence
      // (linked where the licence has a page of its own), and its page on Wikimedia Commons, where both are set out.
      const fig = document.createElement('figure'),
        file = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(img)}`,
        deed = licenceUrl(lic),
        pic = `<img alt="${escH(dn(e))}" loading="lazy" decoding="async" src="${commons(img, 500)}" srcset="${commons(img, 500)} 500w, ${commons(img, 960)} 960w" sizes="(max-width: 700px) 100vw, 440px">`;
      fig.className = 'photo';
      fig.innerHTML =
        (wiki
          ? `<a class="pimg" href="${wiki}" target="_blank" rel="noopener" aria-label="${escH(L('lkWiki') + ': ' + dn(e))}">${pic}</a>`
          : pic) +
        `<figcaption>${L('photo')}: ${by ? escH(by) + ' · ' : ''}${lic ? (deed ? `<a href="${deed}" target="_blank" rel="noopener license">${escH(lic)}</a>` : escH(lic)) + ' · ' : ''}<a href="${file}" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption>`;
      fig.querySelector('img').onerror = () => fig.remove();
      see.querySelector('.seephoto').appendChild(fig);
    }
  });
}
// A place's details take the list's place in its column (openPlace) and give it back (closePlace): the person never
// leaves where they were. Until a place is opened the panel stays empty and out of the way.
function detail(e) {
  const D = $('detail'),
    on = !!e && ui.open;
  D.hidden = !on;
  // wide: the details take the list's column. Narrower: they open over the page, and the list stays where it is under them.
  $('listPane').hidden = on && wideMQ.matches;
  if (!on) {
    D.innerHTML = '';
    // the real map holds a drawing surface: give it back when the details close
    if (_rmap) {
      try {
        if (_rmap._leaveFull) _rmap._leaveFull();
        _rmap.remove();
      } catch (x) {}
      _rmap = null;
    }
    D._see = null;
    return;
  }
  const drag = e.lim === 'none' ? L('noDrag') : fmt(L('drag'), { x: low(FD(e.lim)) });
  const big = `<div class="big">${r5(e.score)}<small>/100</small></div>`;
  const rangeLine = `<div class="calc-only"><div class="drange">${rbar(e)}</div><p class="mono muted">${fmt(L('rangeLine'), { lo: e.lo, hi: e.hi, rlo: e.rlo, rhi: e.rhi, n: e.rn })} · ${fmt(L('probLine'), { f: pct(e.pFit), t: pct(e.pTop) })}${e.impShare > 0.005 ? ' · ' + fmt(L('impShare'), { p: Math.round(e.impShare * 100) }) : ''}</p><p class="meta">${L('roundNote')} <button class="ghost linkbtn" id="toCalc">${L('seeCalc')}</button></p></div>`;
  // the five that matter most to the person; the rest come with the calculations
  const hf = homeFigures(e),
    vsHome = hf.length
      ? `<div class="vshome"><span class="lab">${fmt(L('vsHomeT'), { a: dn(HOMES[0]) })}</span><ul class="facts">${hf.map((x, i) => `<li class="${x.same ? 'same' : x.good ? 'good' : 'bad'}${i >= 5 ? ' calc-only' : ''}">${x.t}</li>`).join('')}</ul><p class="meta calc-only">${L('vsHomeNote')}</p></div>`
      : '';
  // back to the list, and a step to the place before or after in it, without going back first
  const ord = ui.order || [],
    at = ord.indexOf(e.key),
    step = (i, ic) => {
      const p = at >= 0 ? byKey[ord[i]] : null;
      return `<button class="ghost dstep" data-go="${p ? p.key : ''}" ${p ? `aria-label="${dn(p)}" title="${dn(p)}"` : 'disabled aria-hidden="true"'}>${IC(ic, 20)}</button>`;
    };
  D.innerHTML = `<div class="dnav"><button class="ghost" id="dBack">${IC('left', 18)}<span>${L(!wideMQ.matches && ui.pane === 'map' ? 'paneMap' : 'ranking')}</span></button><span class="dsteps">${at >= 0 ? `<span class="meta mono">${at + 1} / ${ord.length}</span>` : ''}${step(at - 1, 'left')}${step(at + 1, 'right')}</span></div>
  ${ui.via && ui.via.key === e.key ? `<p class="via">${escH(L('viaTown').replace('{t}', ui.via.town)).replace('{m}', dn(e))}</p>` : ''}<div class="dhead"><div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="eyebrow">${e.type === 'city' ? L('city') + ' · ' + countryOf(e) : L('country')}${e.est ? ' · ' + L('estimated') : ''}</span><h2 style="font-size:24px">${dn(e)}</h2><div class="toggles">${chip(e.tier)}<button class="chipbtn" id="cmpBtn">${ui.cmp.includes(e) ? L('removeCmp') : L('addCmp')}</button></div></div>${big}</div>
  ${rangeLine}<p style="font-weight:500">${whyLine(e)}${e.gated ? L('dealRule') : ''}</p>${factLines(e)}${vsHome}<p class="meta">${noteOf(e) || ''}</p>${e.natl ? `<p class="meta">${L('natlNote')}</p>` : ''}
  ${
    e.hasGeo
      ? `<p class="mono muted">${fmt(L('shortest'), { h: hmOf(e.dayH)[0], m: hmOf(e.dayH)[1] })}${
          HOMES.filter(h => h !== e).length
            ? ' · ' +
              HOMES.map((h, i) =>
                h === e ? '' : fmt(L('flightTo'), { h: Math.round(e.flights[i]), p: dn(h) })
              )
                .filter(Boolean)
                .join(', ')
            : ''
        }${e.geoApprox ? L('fromCenter') : ''}</p>`
      : ''
  }
  ${breakdown(e)}
  ${HOMES.length && e.hasGeo ? `<div class="field"><span class="lab">${L('tripTitle')}</span><div class="toggles">${HOMES.map((h, i) => (h === e ? '' : `<label class="meta" style="display:flex;gap:6px;align-items:center">${dn(h)} <input type="number" min="0" max="60" step="0.5" data-h="${h.key}" value="${TRIPS[e.key + '|' + h.key] || ''}" placeholder="${Math.round(e.flights[i])}" style="width:70px;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--fg)"> h</label>`)).join('')}</div><p class="meta">${L('tripNote')}</p></div>` : ''}
  <div id="seeSlot"></div>
  <div class="calc-only">${calcTable(e)}
  <p class="meta">${fmt(L('backed'), { b: e.backed, k: e.known })}</p></div>
  ${RACED[isoOf(e)] ? `<p class="meta">${fmt(L('raceInfo'), { r: RACED[isoOf(e)][0], i: RACED[isoOf(e)][1] })} <a href="${RAWU.wvsrace}" target="_blank" rel="noopener">KCL / WVS</a></p>` : ''}
  ${e.type === 'city' ? `<details class="calc"><summary><b>${L('nbhdTitle')}</b></summary><p class="meta">${L('nbhd')}</p>${WALKD[e.name] ? `<p class="meta">${fmt(L('walkInfo'), { w: WALKD[e.name][0], t: WALKD[e.name][1] })} <a href="${RAWU.walk}" target="_blank" rel="noopener">${L('walkLink')}</a></p>` : ''}</details>` : ''}
  
  <details class="calc"><summary><b>${L('askTitle')}</b></summary><p class="meta">${L('askNote')}</p><ol class="meta">${residentQs(
    e
  )
    .map(q => `<li>${q}</li>`)
    .join('')}</ol></details>
  ${passSpec(PERMMODE).includes(840) && isoOf(e) !== 840 ? `<p class="meta">${L('taxNote')} <a href="https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad" target="_blank" rel="noopener">IRS</a></p>` : ''}`;
  seePlace(e, $('seeSlot'));
  $('cmpBtn').onclick = () => toggleCmp(e);
  $('dBack').onclick = () => closePlace();
  D.querySelectorAll('details.grp').forEach(
    d => (d.ontoggle = () => ui.gopen[d.open ? 'add' : 'delete'](d.dataset.g))
  );
  D.querySelectorAll('.dstep[data-go]').forEach(
    b => (b.onclick = () => b.dataset.go && openPlace(byKey[b.dataset.go]))
  );
  $('toCalc').onclick = () => {
    const c = $('calcT');
    c.open = true;
    c.scrollIntoView({ block: 'start' });
  };
  D.querySelectorAll('input[data-h]').forEach(
    inp =>
      (inp.onchange = () => {
        const k = e.key + '|' + inp.dataset.h,
          v = parseFloat(inp.value);
        if (v > 0) TRIPS[k] = v;
        else delete TRIPS[k];
        applyHomes();
        refreshAll();
        saveTake();
      })
  );
}
// Three questions for someone who lives there, from this place's weakest and least certain factors
const RQ = {
  en: {
    home: 'How long did it take you to find your place, and what would you do differently?',
    pay: 'After rent, what does a normal month cost you, and how much is left?',
    jobs: 'How did you find your job, and how long did it take?',
    commute: 'How long is your door-to-door commute, and how much does it vary?',
    move: 'Can you really live here without a car? What do you still drive for?',
    open: 'How did you make your first friends here, and how long did it take?',
    clim: 'Which months are hard here, and how do people cope?',
    safe: 'Which areas do locals avoid, and is it different at night?',
    hlth: 'How do you see a doctor here, and how long is the wait?',
    cult: 'What do you do on a normal weekend, and what do you travel elsewhere for?',
    happy: 'What do people here complain about most?',
    free: 'Is there anything you avoid saying or doing in public here?',
    perm: 'How did your visa or work permit go, and what slowed it down?',
    lang: 'How far do you get in daily life without the local language?',
    fam: 'How often do you go home, and what does the trip really take?',
    day: 'How do the short winter days affect you?',
    women: 'How safe do the women you know feel getting around, day and night?',
    lgbt: 'How open can LGBTQ+ people be at work and in public here?',
    pol: 'How much does local politics affect daily life here?',
    air: 'How often is the air bad here, and what do people do about it?',
    honest: 'Have you ever been asked for a bribe or a favour to get something done here?',
    hours:
      'How many hours does a normal full-time job really take here, and how much vacation do people get?',
    risk: 'Which natural disasters actually hit this area, and how ready are buildings and services for them?',
  },
  es: {
    home: '¿Cuánto tardaste en encontrar dónde vivir y qué harías distinto?',
    pay: 'Después de la renta, ¿cuánto gastas en un mes normal y cuánto te queda?',
    jobs: '¿Cómo encontraste tu trabajo y cuánto tardaste?',
    commute: '¿Cuánto dura tu trayecto de puerta a puerta y cuánto varía?',
    move: '¿De verdad se puede vivir aquí sin auto? ¿Para qué sigues manejando?',
    open: '¿Cómo hiciste tus primeros amigos aquí y cuánto tardaste?',
    clim: '¿Qué meses son difíciles aquí y cómo los sobrelleva la gente?',
    safe: '¿Qué zonas evita la gente de aquí, y cambia de noche?',
    hlth: '¿Cómo vas al médico aquí y cuánto hay que esperar?',
    cult: '¿Qué haces un fin de semana normal y para qué viajas a otro lado?',
    happy: '¿De qué se queja más la gente aquí?',
    free: '¿Hay algo que evites decir o hacer en público aquí?',
    perm: '¿Cómo te fue con la visa o el permiso de trabajo y qué lo retrasó?',
    lang: '¿Qué tanto puedes hacer en el día a día sin el idioma local?',
    fam: '¿Cada cuánto vas a casa y cuánto tarda el viaje de verdad?',
    day: '¿Cómo te afectan los días cortos de invierno?',
    women: '¿Qué tan seguras se sienten las mujeres que conoces al moverse, de día y de noche?',
    lgbt: '¿Qué tan abiertamente pueden vivir las personas LGBTQ+ en el trabajo y en público aquí?',
    pol: '¿Cuánto afecta la política local la vida diaria aquí?',
    air: '¿Qué tan seguido está mal el aire aquí y qué hace la gente al respecto?',
    honest: '¿Alguna vez te han pedido una mordida o un favor para resolver un trámite aquí?',
    hours:
      '¿Cuántas horas toma de verdad un trabajo de tiempo completo aquí y cuántas vacaciones tiene la gente?',
    risk: '¿Qué desastres naturales pegan de verdad en esta zona y qué tan preparados están los edificios y servicios?',
  },
};
function residentQs(e) {
  const ks = FACTORS.filter(f => W[f.k] > 0 && e.v[f.k] != null);
  const weak = [...ks].sort((a, b) => e.v[a.k] - e.v[b.k] || W[b.k] - W[a.k]).map(f => f.k);
  const unsure = [...ks]
    .filter(f => e.how[f.k] === 'imp')
    .sort((a, b) => (e.sd[b.k] || 0) - (e.sd[a.k] || 0))
    .map(f => f.k);
  const pick = [];
  for (const k of [weak[0], weak[1], unsure[0], weak[2], weak[3]])
    if (k && !pick.includes(k) && pick.length < 3) pick.push(k);
  return pick.map(k => (RQ[LANG] || RQ[BASE_LANG()])[k]);
}
function toggleCmp(e) {
  const i = ui.cmp.indexOf(e);
  if (i >= 0) ui.cmp.splice(i, 1);
  else {
    if (ui.cmp.length >= 3) ui.cmp.shift();
    ui.cmp.push(e);
  }
  renderCmp();
  detail(ui.sel);
  pcard();
  list(); // keep the hearts in the ranking in step
}
function renderCmp() {
  const G = $('cmp');
  $('cmpClear').hidden = !ui.cmp.length;
  $('cmpPanel').hidden = !ui.cmp.length;
  // the hearts fill a table further down the page: a link to it sits with the other actions at the top
  $('toCmp').hidden = !ui.cmp.length;
  $('toCmp').textContent = `${L('compare')} (${ui.cmp.length}) ↓`;
  if (!ui.cmp.length) {
    G.innerHTML = '';
    return;
  }
  G.style.minWidth = '';
  G.style.gridTemplateColumns = `140px repeat(${ui.cmp.length},minmax(120px,1fr))`;
  let h =
    '<span></span>' +
    ui.cmp
      .map(
        (e, i) =>
          `<span class="h"><span>${dn(e)}</span><button data-i="${i}" aria-label="${L('removeCmp')}">${IC('x', 14)}</button></span>`
      )
      .join('');
  h +=
    `<span class="meta">${L('overall')}</span>` +
    ui.cmp
      .map(
        e =>
          `<span class="cell">${chip(e.tier)}<b class="mono" style="font-size:14px">${r5(e.score)}</b></span>`
      )
      .join('');
  FACTORS.forEach(f => {
    const vals = ui.cmp.map(e => e.sc[f.k]),
      best = Math.max(...vals.map(v => (v == null ? -1 : v)));
    h +=
      `<span class="meta">${FL(f.k)}</span>` +
      vals
        .map(v =>
          v == null
            ? `<span class="cell muted mono">${L('noData')}</span>`
            : `<span class="cell"><span class="track"><span class="fill" style="width:${v * 20}%;background:${barCol(v)}"></span></span><span class="mono" style="${v === best && ui.cmp.length > 1 ? 'font-weight:600;color:var(--fg)' : 'color:var(--muted)'}">${Math.round(v * 10) / 10}</span></span>`
        )
        .join('');
  });
  G.innerHTML = h;
  G.querySelectorAll('button[data-i]').forEach(
    b =>
      (b.onclick = () => {
        ui.cmp.splice(+b.dataset.i, 1);
        renderCmp();
        detail(ui.sel);
        pcard();
      })
  );
}
// the factors you weigh most, for the chips on each result
function topKeys(n) {
  return FACTORS.filter(f => (W[f.k] || 0) > 0)
    .sort((a, b) => W[b.k] - W[a.k] || FACTORS.indexOf(a) - FACTORS.indexOf(b))
    .slice(0, n)
    .map(f => f.k);
}
// "Safety 4/5" for each of your top priorities, coloured by the score; * marks a filled-in estimate
function whyChips(e, n) {
  return topKeys(n)
    .map(k => {
      const v = e.v[k];
      if (v == null) return '';
      const im = e.how && e.how[k] !== 'obs';
      return `<span class="why5" style="--c:${barCol(Math.round(v))}" title="${FL(k)}${im ? ' (' + L('tagImp') + ')' : ''}">${FL(k)} <b>${Math.round(v)}/5</b>${im ? '<span class="calc-only">*</span>' : ''}</span>`;
    })
    .join('');
}
function list() {
  // ranks are counted inside the stay-or-go tab that is open (best in your country is 1 there)
  const all = ents.filter(e => e.type === ui.rankType && listable(e) && inScope(e));
  let rows = all.filter(passes).sort((a, b) => byRank(a, b) || dn(a).localeCompare(dn(b)));
  // the first screenful: ten on a phone (the map comes after the list there), twenty beside the map
  const first = matchMedia('(max-width: 640px)').matches ? 10 : 20,
    shown = ui.showAll ? rows : rows.slice(0, first);
  const sortedAll = [...all].sort((a, b) => byRank(a, b) || dn(a).localeCompare(dn(b)));
  // a place's number is its position in the open tab, whatever is filtered out; details step through this order
  const rankOf = new Map(sortedAll.map((e, i) => [e, i + 1]));
  ui.order = rows.map(e => e.key);
  const heart = e => {
    const on = ui.cmp.includes(e);
    return `<button class="heart" data-heart="${e.key}" aria-pressed="${on}" aria-label="${L(on ? 'removeCmp' : 'addCmp')}: ${dn(e)}" title="${L(on ? 'removeCmp' : 'addCmp')}">${IC('heart', 18)}</button>`;
  };
  const place = e =>
    `<b>${dn(e)}</b>${e.type === 'city' ? ` <span class="muted">${countryOf(e)}</span>` : ''}`;
  // The list is ordered by verdict, then well-measured places before thinly measured ones, then score. Where either
  // changes from one row to the next, a line says so: otherwise a 65 under a 60 looks like a mistake.
  const divider = (e, p) =>
    !p || ui.view === 'profile'
      ? ''
      : p.tier !== e.tier
        ? `<div class="lgroup">${chip(e.tier)}</div>`
        : e.thin && !p.thin
          ? `<div class="lgroup thin">${L('fewFigs')}</div>`
          : '';
  const tip = e => `${L('tiers')[e.tier]} · ${fmt(L('probLine'), { f: pct(e.pFit), t: pct(e.pTop) })}`;
  // the best match gets a card; the rest are rows. The factor table shows plain rows.
  const hero = ui.view !== 'profile' && shown[0] && shown[0] === sortedAll.find(passes);
  if (ui.view === 'profile') {
    $('list').innerHTML = profileTable(shown);
  } else
    $('list').innerHTML =
      shown
        .map(
          (e, i) =>
            divider(e, shown[i - 1]) +
            (hero && i === 0
              ? `<div class="rw top1${ui.sel === e ? ' sel' : ''}"><button class="row hero1" data-key="${e.key}" title="${tip(e)}"><span class="eyebrow">${L('topPick')}</span><span class="hname">${place(e)}</span><span class="hscore">${sym(e.tier)}<span class="sn">${r5(e.score)}</span><span class="meta">${L('tiers')[e.tier]}</span></span>${rbar(e)}<span class="chips5">${whyChips(e, 6)}</span><span class="why">${whyLine(e)}${e.gated ? L('dealRule') : ''}</span></button>${heart(e)}</div>`
              : `<div class="rw${ui.sel === e ? ' sel' : ''}"><button class="row" data-key="${e.key}" title="${tip(e)}"><span class="n">${rankOf.get(e)}</span><span class="nm">${place(e)}</span><span class="sc">${sym(e.tier)}<span class="sn">${r5(e.score)}</span>${rbar(e)}</span><span class="why">${rowWhy(e)}</span></button>${heart(e)}</div>`)
        )
        .join('') || `<p class="meta" style="padding:12px 6px">${L('nothing')}</p>`;
  $('more').hidden = ui.showAll || rows.length <= first;
  $('rankmeta').textContent =
    rows.length < all.length ? fmt(L('rankmeta'), { n: rows.length, t: all.length }) : '';
  $('list').title = L('rangeKey');
  $('list')
    .querySelectorAll('.row,[data-key]')
    .forEach(b => (b.onclick = () => openPlace(byKey[b.dataset.key])));
  // a heart puts the place in Compare (up to 3)
  $('list')
    .querySelectorAll('[data-heart]')
    .forEach(
      b =>
        (b.onclick = ev => {
          ev.stopPropagation();
          const e = byKey[b.dataset.heart],
            had = ui.cmp.includes(e);
          toggleCmp(e);
          gtoast(
            had ? fmt(L('cmpRemoved'), { p: dn(e) }) : fmt(L('cmpAdded'), { p: dn(e), n: ui.cmp.length })
          );
        })
    );
}
// One tap per factor: off, counts (weight 1), ★ counts double (2). Reads the current weights, so quiz answers and
// sliders show up here; fine-tuning stays on the sliders.
const PLEVEL = w => (w >= 1.75 ? 2 : w > 0 ? 1 : 0);
function prioUI() {
  const act = document.activeElement,
    focusK = act && act.classList && act.classList.contains('pchip') ? act.dataset.k : null;
  const P = $('prio');
  if (!P) return;
  P.innerHTML =
    `<span class="lab">${L('ppHead')}</span><p class="meta">${L('ppHow')}</p>` +
    Object.entries(GOALS)
      .map(
        ([g, ks]) =>
          `<div class="pgrp"><span class="lab">${L('goals')[g]}</span><div class="pchips">${ks
            .map(k => {
              const lv = PLEVEL(W[k] || 0);
              return `<button class="pchip" data-k="${k}" data-lv="${lv}" aria-pressed="${lv > 0}" aria-label="${FL(k)}: ${L('ppLv')[lv]}">${lv === 2 ? '★ ' : lv === 1 ? '✓ ' : ''}${FL(k)}</button>`;
            })
            .join('')}</div></div>`
      )
      .join('') +
    `<div class="pfoot"><button class="linkbtn" id="preset2">${L(QUIZW ? 'ppResetQuiz' : 'ppReset')}</button><button class="linkbtn" id="pfine">${L('ppFine')}</button></div>`;
  P.querySelectorAll('.pchip').forEach(
    b =>
      (b.onclick = () => {
        const k = b.dataset.k,
          lv = (+b.dataset.lv + 1) % 3;
        W[k] = [0, 1, 2][lv];
        $('preset').value = 'custom';
        if ($('w-' + k)) {
          $('w-' + k).value = W[k];
          $('o-' + k).textContent = fmtW(W[k]);
        }
        goalShares();
        // the chip shows its new state at once; the scores follow on the next frame (refreshSoon also saves)
        prioUI();
        refreshSoon(false);
      })
  );
  $('preset2').onclick = () => {
    W = { ...(QUIZW || PRESETS.equal) };
    weightsUI();
    refreshAll();
    saveTake();
  };
  $('pfine').onclick = () => {
    setAdv(true);
    setSheet(false);
    $('weightsBox').open = true;
    $('weightsBox').scrollIntoView({ block: 'start' });
  };
  if (focusK) $('ppanel').querySelector(`.pchip[data-k="${focusK}"]`)?.focus();
}
// How the scores are calculated (ranges, legends, method boxes, the calculation table): hidden unless asked for
function setAdv(on) {
  document.body.classList.toggle('adv', on);
  store.set('adv', on);
  $('advBtn').textContent = L(on ? 'advHide' : 'advShow');
  if (typeof renderResults === 'function' && !$('resPanel').hidden) renderResults();
  $('advBtn').setAttribute('aria-pressed', on);
  if (!on && ui.view === 'profile') {
    ui.view = 'score';
    $('vScore').setAttribute('aria-pressed', true);
    $('vProfile').setAttribute('aria-pressed', false);
    list();
  }
}
// ---- one place for every control ----
// The panel holds everything a person can change: cities or countries, where, the "only show" filters and what
// matters. On a wide screen it is the left column, always open. On a narrower one it is a sheet behind the Filters
// button in the bar, and the bar also carries the find box, list-or-map and cities-or-countries, so nothing has to be
// scrolled to. The find box and the cities-or-countries switch are one element each, moved to where they belong.
const wideMQ = matchMedia('(min-width: 1180px)');
function setSheet(open) {
  open = !!open && !wideMQ.matches;
  $('ppanel').classList.toggle('open', open);
  $('ctlBtn').setAttribute('aria-expanded', open);
  $('sheetBg').hidden = !open;
  document.body.classList.toggle('sheet-open', open);
  if (open) $('pclose').focus({ preventScroll: true });
}
function placeControls() {
  const wide = wideMQ.matches;
  if (wide) $('mapbox').insertBefore($('searchBox'), $('mapbox').firstChild);
  else $('searchHome').appendChild($('searchBox'));
  (wide ? $('kindHome') : $('kindBar')).appendChild($('kindSeg'));
  if (wide) setSheet(false);
}
// the Filters button says how many filters are narrowing the list (priorities re-rank; they do not narrow)
function ctlBadge() {
  const f = ui.f,
    n =
      f.reg.size +
      f.cost.size +
      (f.big ? 1 : 0) +
      (f.work ? 1 : 0) +
      (!$('scopeBar').hidden && ui.scope !== 'all' ? 1 : 0);
  $('ctlBtn').innerHTML =
    `${IC('filter', 18, 2)}<span>${L('filters')}</span>${n ? `<b class="mono">${n}</b>` : ''}`;
}
// Too narrow for the list and the map side by side: they are two views of the same results behind one switch. The
// list keeps its place while the map is looked at.
function setPane(p) {
  if (ui.pane === p) return;
  if (ui.pane !== 'map') ui.listY = window.scrollY;
  ui.pane = p;
  $('split').dataset.pane = p;
  press('vList', p === 'list');
  press('vMap', p === 'map');
  if (wideMQ.matches) return;
  // the map opens right under the bar; the list comes back where it was left
  const top =
    $('split').getBoundingClientRect().top + window.scrollY - $('bar').getBoundingClientRect().bottom;
  window.scrollTo({ top: p === 'map' ? Math.min(window.scrollY, top) : ui.listY || 0, behavior: 'instant' });
}
// ---- find a place ----
// One find box: on the map on a wide screen, in the bar right above it on a phone. It suggests places as you type,
// the best match first, and goes to the one picked: its details open and the map moves to it. It does not narrow
// the list (the filters do that), so nothing vanishes while typing.
const foldS = s =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
// US towns the atlas doesn't score on their own (data/towns.js, loaded when the find box is first used): typing one
// offers the metro it is in, after the atlas's own places with an equally good match.
let _twP = null,
  _towns = null;
const townsData = () =>
  (_twP =
    _twP ||
    (window.ATLAS_TOWNS
      ? Promise.resolve(window.ATLAS_TOWNS)
      : loadScript('data/towns.js?v=' + VER).then(
          () => window.ATLAS_TOWNS,
          () => null
        )
    ).then(d => {
      if (!d) return (_twP = null);
      _towns = d.t
        .map(([n, st, m]) => ({ town: n, st, f: foldS(n), e: byKey['city:' + m] }))
        .filter(t => t.e);
      if ($('search').value.trim()) suggUI();
    }));
const matchLevel = (f, q) =>
  f === q
    ? 0
    : f.startsWith(q)
      ? 1
      : f.split(/[\s,()-]+/).some(w => w.startsWith(q))
        ? 2
        : f.includes(q)
          ? 3
          : 9;
function suggest(q) {
  q = foldS(q);
  if (!q) return [];
  const hit = e => Math.min(...[dn(e), e.name].map(n => matchLevel(foldS(n), q)));
  const own = ents
    .filter(listable)
    .map(e => [hit(e), 0, e])
    .filter(x => x[0] < 9);
  const towns = [];
  if (_towns && q.length > 1)
    for (let i = 0; i < _towns.length && towns.length < 40; i++) {
      const t = _towns[i],
        lv = matchLevel(t.f, q);
      if (lv < 9 && listable(t.e)) towns.push([lv, 1, t, i]);
    }
  const rank = x => (x[1] ? -x[3] : 0); // towns: the larger first (the file is largest first)
  return [...own, ...towns]
    .sort(
      (a, b) =>
        a[0] - b[0] ||
        a[1] - b[1] ||
        (a[1] ? rank(b) - rank(a) : byRank(a[2], b[2]) || dn(a[2]).localeCompare(dn(b[2])))
    )
    .slice(0, 7)
    .map(x => x[2]);
}
const _sg = { list: [], at: -1 };
function suggMark() {
  $('sugg')
    .querySelectorAll('li[data-i]')
    .forEach(li => li.setAttribute('aria-selected', +li.dataset.i === _sg.at));
  if (_sg.at >= 0) $('search').setAttribute('aria-activedescendant', 'sg' + _sg.at);
  else $('search').removeAttribute('aria-activedescendant');
}
function suggUI() {
  const inp = $('search'),
    ul = $('sugg'),
    open = !!inp.value.trim();
  _sg.list = open ? suggest(inp.value) : [];
  _sg.at = _sg.list.length ? 0 : -1;
  ul.hidden = !open;
  inp.setAttribute('aria-expanded', open);
  ul.innerHTML = !open
    ? ''
    : _sg.list.length
      ? _sg.list
          .map((x, i) => {
            const e = x.town ? x.e : x,
              what = x.town
                ? `${escH(x.town)}, ${x.st} <small>${L('townIn').replace('{m}', dn(e))}</small>`
                : `${dn(e)} <small>${e.type === 'city' ? countryOf(e) : L('units').country}</small>`;
            return `<li role="option" id="sg${i}" data-i="${i}">${sym(e.tier)}<span class="snm">${what}</span><b class="mono">${r5(e.score)}</b></li>`;
          })
          .join('')
      : `<li class="none">${L('noMatch')}</li>`;
  suggMark();
}
function suggMove(d) {
  if (!_sg.list.length) return;
  _sg.at = (_sg.at + d + _sg.list.length) % _sg.list.length;
  suggMark();
}
function goToPlace(x) {
  if (!x) return;
  // a town opens its metro, whose details then say which town led there
  const e = x.town ? x.e : x;
  ui.via = x.town ? { key: e.key, town: x.town + ', ' + x.st } : null;
  $('search').value = '';
  suggUI();
  $('search').blur();
  // the list and the "3 / 744" in the details follow the kind of place that was picked
  if (e.type !== ui.rankType) $(e.type === 'city' ? 'rCities' : 'rCountries').click();
  openPlace(e);
}
// Stay-or-go tabs above the results: the country the person lives in, other countries, or everywhere. Shown once we
// know where they live and the map has cities there. Someone who wants to stay can open the other tab out of curiosity.
function scopeUI() {
  const el = $('scopeBar');
  if (!el) return;
  const h = MODE === 'yours' && HOMES[0] ? byIso[+isoOf(HOMES[0])] : null,
    n = h ? ents.filter(e => e.type === 'city' && listable(e) && +isoOf(e) === +h.id).length : 0;
  if (!n) {
    el.hidden = true;
    el.innerHTML = '';
    if (MODE === 'yours') ui.scope = 'all';
    ctlBadge();
    return;
  }
  const tab = (v, label) => `<button data-s="${v}" aria-pressed="${ui.scope === v}">${label}</button>`;
  const note =
    ui.scope === 'home' && n < 5
      ? fmt(L(n === 1 ? 'scopeFew1' : 'scopeFew'), { n, c: dn(h) })
      : ui.scope === 'away' && ANS.scope === 0
        ? fmt(L('scopeCurious'), { c: dn(h) })
        : '';
  el.hidden = false;
  el.innerHTML =
    `<span class="lab">${L('scopeLab')}</span><div class="seg" role="group" aria-label="${L('scopeLab')}">${tab('home', dn(h))}${tab('away', L('scopeAway'))}${tab('all', L('scopeAll'))}</div>` +
    (note ? `<p class="meta">${note}</p>` : '');
  ctlBadge();
  el.querySelectorAll('[data-s]').forEach(
    b =>
      (b.onclick = () => {
        if (ui.scope === b.dataset.s) return;
        ui.scope = b.dataset.s;
        scopeUI();
        scopeView();
        filtersChanged();
        renderResults();
        renderLive();
      })
  );
}
// "Only show" pills: narrow the map and ranking without changing a score
function pillsUI() {
  const f = ui.f,
    pill = (grp, v, label, on) =>
      `<button class="pill" data-g="${grp}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
  const any = f.reg.size || f.cost.size || f.big || f.work;
  $('pills').setAttribute('aria-label', L('onlyShow'));
  $('filtSum').textContent = L('onlyShow');
  ctlBadge();
  $('pills').innerHTML =
    `<span class="pgroup">${['eu', 'na', 'la', 'ap', 'af'].map(r => pill('reg', r, r === 'af' ? L('regAf') : L('regions')[r], f.reg.has(r))).join('')}</span>` +
    `<span class="pgroup" title="${L('costPills')}">${[1, 2, 3, 4].map(c => pill('cost', c, '$'.repeat(c), f.cost.has(c))).join('')}</span>` +
    `<span class="pgroup">${pill('big', 1, L('bigCities'), f.big)}${pill('work', 1, L('canWork'), f.work)}</span>` +
    (any ? `<button class="linkbtn" id="pillClear">${L('clear')}</button>` : '');
  $('pills')
    .querySelectorAll('.pill')
    .forEach(
      b =>
        (b.onclick = () => {
          const g = b.dataset.g,
            v = g === 'cost' ? +b.dataset.v : b.dataset.v;
          if (g === 'reg' || g === 'cost') f[g].has(v) ? f[g].delete(v) : f[g].add(v);
          else f[g] = !f[g];
          // a region filter also moves the map there (one region: that region; none or several: the default view)
          if (g === 'reg')
            regionView(
              f.reg.size === 1 && REGIONS[[...f.reg][0]] ? [...f.reg][0] : f.reg.size ? 'world' : 'atlantic',
              true
            );
          pillsUI();
          filtersChanged();
        })
    );
  if ($('pillClear'))
    $('pillClear').onclick = () => {
      f.reg.clear();
      f.cost.clear();
      f.big = f.work = false;
      pillsUI();
      filtersChanged();
    };
}
// The likely range (10th to 90th percentile of the 120 recalculations) as a bar, the score as a tick, the Strong-fit line dotted
function rbar(e) {
  const lo = e.lo ?? e.score,
    hi = e.hi ?? e.score;
  return `<span class="rbar" title="${lo}–${hi}"><span class="cut" style="left:${CUT.fit}%"></span><span class="rb" style="left:${lo}%;width:${Math.max(1.5, hi - lo)}%;background:${TIERCOL[e.tier]}"></span><span class="rt" style="left:${e.score}%"></span></span>`;
}
// Each factor on its own, nothing combined
function profileTable(rows) {
  const ks = FACTORS.filter(f => W[f.k] > 0)
    .sort((a, b) => W[b.k] - W[a.k])
    .map(f => f.k);
  const cell = (e, k) => {
    const v = e.v[k];
    if (v == null) return `<td class="muted">–</td>`;
    const im = e.how[k] !== 'obs';
    return `<td style="background:${barCol(v)}${im ? '55' : 'cc'};color:#111;text-align:center" title="${FL(k)}${im ? ' (' + L('tagImp') + ')' : ''}">${Math.round(v * 10) / 10}${im ? '*' : ''}</td>`;
  };
  return `<p class="meta">${L('profileNote')}</p><div class="biastable"><table class="prof"><thead><tr><th>${L(ui.rankType === 'city' ? 'city' : 'country')}</th>${ks.map(k => `<th title="${FL(k)}">${FL(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(e => `<tr><td><button class="ghost" data-key="${e.key}" style="min-height:0;padding:0;font:inherit;text-align:left">${dn(e)}</button></td>${ks.map(k => cell(e, k)).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function select(e, focus) {
  ui.sel = e;
  if (!e) ui.open = false;
  detail(e);
  paint();
  list();
  if (focus && e) focusOn(e);
}
// One entry in the browser's history while something is open on top of the page (a place's details, the quiz), so the
// phone's Back button steps back inside the page instead of leaving it.
const NAV = { skip: 0 };
// the page puts the person back where they were itself (closePlace); the browser's own guess would fight it
try {
  history.scrollRestoration = 'manual';
} catch (err) {}
function navOpen(kind) {
  try {
    if (!history.state || history.state.atlas !== kind) history.pushState({ atlas: kind }, '');
  } catch (err) {}
}
function navClose(kind) {
  try {
    if (history.state && history.state.atlas === kind) {
      NAV.skip++;
      history.back();
    }
  } catch (err) {}
}
window.addEventListener('popstate', () => {
  if (NAV.skip > 0) return void NAV.skip--;
  if (ui.open) closePlace(true);
  else if (!$('quizPanel').hidden) quizBack();
});
// Open a place's details where the list is, remembering how far down the page the person was.
function openPlace(e) {
  if (!e) return;
  if (!ui.open) ui.backY = window.scrollY;
  ui.open = true;
  select(e, true);
  navOpen('place');
  // Wide: the details take the list's column, so its top comes into view. Narrower: they open over the page, which
  // stays exactly where it was underneath.
  if (wideMQ.matches) $('rankSec').scrollIntoView({ block: 'start', behavior: 'instant' });
  else $('detail').scrollTop = 0;
  document.body.classList.add('place-open');
  if ($('dBack')) $('dBack').focus({ preventScroll: true });
}
// Back to the list, at the spot the person left it. The place stays marked on the map.
function closePlace(fromHistory) {
  if (!ui.open) return;
  ui.via = null;
  const key = ui.sel && ui.sel.key;
  ui.open = false;
  document.body.classList.remove('place-open');
  detail(null);
  pcard();
  if (!fromHistory) navClose('place');
  window.scrollTo({ top: ui.backY || 0, behavior: 'instant' }); // a jump, not a glide through the whole list
  const row = key && $('list').querySelector(`.row[data-key="${CSS.escape(key)}"]`);
  if (row) row.focus({ preventScroll: true });
}
const fmtW = v => (+v).toFixed(2).replace(/\.?0+$/, '') + '×';
const gsum = g => GOALS[g].reduce((a, k) => a + (W[k] || 0), 0);
// a goal's slider is its share of all the weight, so the three always add up to 100%
function goalShares() {
  const tot = FACTORS.reduce((a, f) => a + (W[f.k] || 0), 0) || 1;
  Object.keys(GOALS).forEach(g => {
    const pc = Math.round((gsum(g) / tot) * 100);
    if ($('gw-' + g)) $('gw-' + g).textContent = pc + '%';
    if ($('g-' + g) && document.activeElement !== $('g-' + g)) $('g-' + g).value = pc;
  });
}
const GMIX = {};
// give goal g the sum `to`, keeping the mix of its factors (the last one it had, if it is at zero)
function setGoalSum(g, to) {
  const cur = gsum(g);
  if (cur > 0) GMIX[g] = GOALS[g].map(k => (W[k] || 0) / cur);
  const mix = GMIX[g] || GOALS[g].map(() => 1 / GOALS[g].length);
  GOALS[g].forEach((k, i) => (W[k] = to * mix[i]));
}
function setGoalShare(g, share) {
  const tot = FACTORS.reduce((a, f) => a + (W[f.k] || 0), 0) || FACTORS.length;
  const others = Object.keys(GOALS).filter(o => o !== g);
  const osum = others.reduce((a, o) => a + gsum(o), 0);
  setGoalSum(g, tot * share);
  others.forEach(o => setGoalSum(o, tot * (1 - share) * (osum > 0 ? gsum(o) / osum : 1 / others.length)));
  // factor sliders stop at 3x; only the proportions matter to the score
  const mx = Math.max(...FACTORS.map(f => W[f.k] || 0));
  if (mx > 3) FACTORS.forEach(f => (W[f.k] = ((W[f.k] || 0) * 3) / mx));
  FACTORS.forEach(f => {
    if (!$('w-' + f.k)) return;
    $('w-' + f.k).value = W[f.k];
    $('o-' + f.k).textContent = fmtW(Math.round(W[f.k] * 100) / 100);
  });
}
function weightsUI() {
  $('weights').innerHTML =
    `<span class="lab">${L('goalsTitle')}</span>` +
    Object.entries(GOALS)
      .map(
        ([
          g,
          ks,
        ]) => `<div class="goal"><div class="wrow goalrow"><label for="g-${g}"><b>${L('goals')[g]}</b></label><input type="range" id="g-${g}" min="0" max="100" step="1" value="0"><output class="mono" id="gw-${g}"></output></div>
    <details class="gdet" data-g="${g}" ${ui.gopen && ui.gopen.has(g) ? 'open' : ''}><summary class="meta">${fmt(L('goalFactors'), { n: ks.length })}</summary>${ks.map(k => `<div class="wrow"><label for="w-${k}">${FL(k)}</label><input type="range" id="w-${k}" min="0" max="3" step="0.25" value="${W[k] ?? 0}"><output id="o-${k}">${fmtW(W[k] ?? 0)}</output></div>`).join('')}</details></div>`
      )
      .join('');
  goalShares();
  document.querySelectorAll('.gdet').forEach(
    d =>
      (d.ontoggle = () => {
        ui.gopen = ui.gopen || new Set();
        d.open ? ui.gopen.add(d.dataset.g) : ui.gopen.delete(d.dataset.g);
      })
  );
  Object.keys(GOALS).forEach(g => {
    const el = $('g-' + g);
    el.oninput = ev => {
      setGoalShare(g, +ev.target.value / 100);
      $('preset').value = 'custom';
      goalShares();
      refreshSoon(true);
    };
    el.onchange = () => {
      refreshAll();
      saveTake();
    };
  });
  // while dragging, re-score without the 120 recalculations; run them when the slider is released
  FACTORS.forEach(f => {
    const el = $('w-' + f.k);
    el.oninput = ev => {
      W[f.k] = +ev.target.value;
      $('o-' + f.k).textContent = fmtW(W[f.k]);
      $('preset').value = 'custom';
      goalShares();
      refreshSoon(true);
    };
    el.onchange = () => {
      refreshAll();
      saveTake();
    };
  });
  $('preset').innerHTML = Object.entries(L('presets'))
    .filter(([k]) => k !== 'quiz' || QUIZW)
    .map(([k, v]) => `<option value="${k}" ${k === 'custom' ? 'hidden' : ''}>${v}</option>`)
    .join('');
  $('preset').value = 'custom';
  $('useCont').checked = useCont;
  $('useME').checked = useME;
  $('lasts').checked = LASTS;
  $('reach').checked = REACH;
  $('rankBy').innerHTML = Object.entries(L('rankBy'))
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join('');
  $('rankBy').value = RANKBY;
  $('aggSel').innerHTML = Object.entries(L('agg'))
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join('');
  $('aggSel').value = AGG;
  $('normM').innerHTML = Object.entries(L('normM'))
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join('');
  $('normM').value = NORMM;
  $('happyM').innerHTML = Object.entries(L('happyM'))
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join('');
  $('happyM').value = HAPPYMODE;
  const swap = (id, v) => {
    const el = $(id),
      w = el.closest('.hpick') || el;
    w.outerHTML = homeSelect(id, v);
  };
  swap('home1', HOMES[0] ? HOMES[0].key : '');
  swap('home2', HOMES[1] ? HOMES[1].key : '');
  $('home1').onchange = $('home2').onchange = () => {
    HOMES = homesFromKeys([$('home1').value, $('home2').value].filter(Boolean));
    applyHomes();
    refreshAll();
    saveTake();
  };
  $('useEst').checked = useEst;
  $('useImp').checked = useImp;
  $('norm').checked = norm;
  $('gate').checked = gate;
  $('gateOpen').checked = gateOpen;
  $('gateFar').checked = gateFar;
  $('gateHot').checked = gateHot;
  $('gateSmall').checked = gateSmall;
}
const HIST = [];
let _lastState = null,
  _restoring = false;
function snapState() {
  return JSON.stringify({
    MODE,
    W,
    h: HOMES.map(x => x.key),
    LANGMODE,
    PERMMODE,
    POLMODE,
    FIELD,
    PAYJOB,
    CLIMMODE,
    gate,
    gateOpen,
    gateFar,
    gateHot,
    gateSmall,
    norm,
    useEst,
    useImp,
    useCont,
    useME,
    AGG,
    NORMM,
    HAPPYMODE,
    REACH,
    LASTS,
    LASTS_D,
    QUIZW,
    ANS,
  });
}
function trackState() {
  if (_restoring) return;
  // undo starts with the first take: there is nothing to go back to before it
  if (MODE !== 'yours') {
    HIST.length = 0;
    _lastState = null;
    return;
  }
  const cur = snapState();
  if (_lastState && cur !== _lastState) {
    HIST.push(_lastState);
    if (HIST.length > 40) HIST.shift();
  }
  _lastState = cur;
  const b = $('undoBtn');
  if (b) b.disabled = !HIST.length;
}
function undo() {
  if (!HIST.length) return;
  const j = HIST.pop(),
    o = JSON.parse(j);
  ({
    MODE,
    W,
    LANGMODE,
    PERMMODE,
    POLMODE,
    FIELD,
    PAYJOB,
    CLIMMODE,
    gate,
    gateOpen,
    gateFar,
    gateHot,
    gateSmall,
    norm,
    useEst,
    useImp,
    useCont,
    useME,
    AGG,
    NORMM,
    HAPPYMODE,
    REACH,
    LASTS,
    LASTS_D,
    QUIZW,
    ANS,
  } = o);
  HOMES = homesFromKeys(o.h);
  _restoring = true;
  applyHomes();
  weightsUI();
  refreshAll();
  _restoring = false;
  _lastState = j;
  $('undoBtn').disabled = !HIST.length;
  saveTake();
  gtoast(L('undone'));
}
function gtoast(msg, withUndo) {
  const t = $('gtoast');
  t.innerHTML = `<span>${msg}</span>${withUndo ? `<button id="gtUndo">${L('undo')}</button>` : ''}`;
  t.hidden = false;
  if (withUndo)
    $('gtUndo').onclick = () => {
      undo();
      t.hidden = true;
    };
  clearTimeout(gtoast.t);
  gtoast.t = setTimeout(() => {
    t.hidden = true;
  }, 6500);
}
function renderLive() {
  const el = $('liveTop');
  if (!el) return;
  const rows = ents
    .filter(e => listable(e) && e.type === ui.rankType && passes(e))
    .sort(byRank)
    .slice(0, 5);
  el.innerHTML = `<span class="lab">${fmt(L('liveTop'), { t: low(L(ui.rankType === 'city' ? 'cities' : 'countries')) })}</span><ol>${rows.map(e => `<li><span>${sym(e.tier)}${dn(e)} <span class="mono muted">${r5(e.score)}</span></span></li>`).join('')}</ol>`;
}
// Before there is a take (the quiz finished, a saved take, or a shared link) nothing is scored on screen. Underneath,
// every factor counts the same and nothing is known about the person.
function setNeutral() {
  MODE = 'neutral';
  W = { ...PRESETS.equal, perm: 0, lang: 0, fam: 0, pol: 0 };
  HOMES = [];
  LANGMODE = 'en';
  PERMMODE = 'P:';
  FIELD = 'general';
  PAYJOB = -1;
  CLIMMODE = 'mild';
  POLMODE = 'd';
  gate = gateOpen = norm = gateFar = gateHot = gateSmall = true;
  useEst = false;
  useImp = true;
  REACH = false;
  HAPPYMODE = 'report';
  LASTS = false;
}
// the map, the ranking and the settings appear with the take (body.took, css/atlas.css); the first card follows it too
function syncMode() {
  const took = MODE === 'yours';
  document.body.classList.toggle('took', took);
}
let _rq = 0,
  _fast = true;
function refreshSoon(fast) {
  _fast = _fast && !!fast;
  if (_rq) return;
  _rq = requestAnimationFrame(() => {
    _rq = 0;
    const f = _fast;
    _fast = true;
    refreshAll(f);
    if (!f) saveTake();
  });
}
// what the ranking shows first, to tell whether the background simulation changed anything on screen
const topKeysNow = () =>
  ents
    .filter(e => e.type === ui.rankType && listable(e) && passes(e))
    .sort(byRank)
    .slice(0, 40)
    .map(e => e.key + ':' + e.tier)
    .join();
let TOPSIG = '';
// the new likely ranges are in: redraw what shows them. The plain view only shows the order, which usually hasn't moved.
function afterSim() {
  const adv = document.body.classList.contains('adv');
  if (!adv && topKeysNow() === TOPSIG) return;
  list();
  detail(ui.sel);
  if (adv) {
    renderCmp();
    renderResults();
    renderEff();
  }
  renderUnsure();
  TOPSIG = topKeysNow();
}
function refreshAll(fast) {
  // scores and verdicts now (fast); the likely ranges follow from the background and never hold up a tap
  recompute(true);
  carryRanges();
  TOPSIG = topKeysNow();
  if (!fast) simulateSoon(afterSim);
  syncMode();
  scopeUI();
  paint();
  list();
  detail(ui.sel);
  renderCmp();
  renderResults();
  renderEff();
  renderLive();
  renderUnsure();
  prioUI();
  if (!fast) trackState();
}
// how much each factor actually moves the scores: its share of the variance of scores across places (covariance of its points with the total)
function renderEff() {
  const el = $('effw');
  if (!el) return;
  const pool = ents.filter(e => listable(e) && e.type === ui.rankType && e.part);
  if (pool.length < 3) {
    el.innerHTML = '';
    return;
  }
  const s = pool.map(e => e.score),
    ms = d3.mean(s),
    vs = d3.variance(s) || 1,
    tot = FACTORS.reduce((a, f) => a + (W[f.k] > 0 ? W[f.k] : 0), 0) || 1;
  const rows = FACTORS.filter(f => W[f.k] > 0)
    .map(f => {
      const p = pool.map(e => e.part[f.k] || 0),
        mp = d3.mean(p);
      let c = 0;
      p.forEach((x, i) => {
        c += (x - mp) * (s[i] - ms);
      });
      c /= pool.length - 1;
      return { k: f.k, w: W[f.k] / tot, eff: c / vs };
    })
    .sort((a, b) => b.eff - a.eff);
  el.innerHTML = `<span class="lab">${L('effTitle')}</span><p class="meta">${fmt(L('effNote'), { t: low(L(ui.rankType === 'city' ? 'cities' : 'countries')) })}</p><div class="biastable"><table style="min-width:0"><thead><tr><th>${L('calcFactor')}</th><th>${L('effSlider')}</th><th>${L('effReal')}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${FL(r.k)}</td><td class="mono">${pct(r.w)}</td><td class="mono">${Math.round(r.eff * 100)}%</td></tr>`).join('')}</tbody></table></div>`;
}
function tierFilters() {
  $('tierFilters').innerHTML = TIERS.map(
    t =>
      `<button class="chipbtn" data-t="${t}" aria-pressed="${ui.tiers.has(t)}"><span class="sw" style="background:${TIERCOL[t]}"></span>${L('tiers')[t]}</button>`
  ).join('');
  $('tierFilters')
    .querySelectorAll('button')
    .forEach(
      b =>
        (b.onclick = () => {
          const t = b.dataset.t;
          ui.tiers.has(t) ? ui.tiers.delete(t) : ui.tiers.add(t);
          b.setAttribute('aria-pressed', ui.tiers.has(t));
          filtersChanged();
        })
    );
}
function mustUI() {
  $('mustMenu').innerHTML = FACTORS.map(
    f =>
      `<label class="minrow"><span>${FL(f.k)}</span><select data-k="${f.k}"><option value="">${L('anyMin')}</option>${[2, 3, 4, 5].map(n => `<option value="${n}" ${ui.mins[f.k] === n ? 'selected' : ''}>${n}+</option>`).join('')}</select></label>`
  ).join('');
  $('mustMenu')
    .querySelectorAll('select')
    .forEach(
      c =>
        (c.onchange = () => {
          const v = +c.value;
          if (v) ui.mins[c.dataset.k] = v;
          else delete ui.mins[c.dataset.k];
          filtersChanged();
        })
    );
}
function filtersChanged() {
  ui.showAll = false;
  paint();
  list();
}
function selectsUI() {
  // fewer ways to color the map: verdict, score, main drawback, or one factor
  if (ui.colorBy === 'quant' || ui.colorBy === 'conf') ui.colorBy = 'tier';
  const co = $('colorBy');
  co.innerHTML =
    Object.entries(L('colorOpts'))
      .filter(([k]) => k !== 'quant' && k !== 'conf')
      .map(([k, v]) => `<option value="${k}">${v}</option>`)
      .join('') + FACTORS.map(f => `<option value="f:${f.k}">${FL(f.k)}</option>`).join('');
  if (![...co.options].some(o => o.value === ui.colorBy)) ui.colorBy = 'tier';
  co.value = ui.colorBy;
  $('regions').innerHTML = Object.entries(L('regions'))
    .map(([k, v]) => `<button class="chipbtn" data-r="${k}" aria-pressed="${ui.region === k}">${v}</button>`)
    .join('');
  document
    .querySelectorAll('#regions button')
    .forEach(b => (b.onclick = () => regionView(b.dataset.r, true)));
  $('search').placeholder = L('find');
  $('search').setAttribute('aria-label', L('find'));
  $('sico').innerHTML = IC('search', 18, 2);
  $('pclose').innerHTML = IC('x', 18);
  $('pclose').setAttribute('aria-label', L('ppClose'));
  $('kindSeg').setAttribute('aria-label', L('kindLab'));
  $('paneSeg').setAttribute('aria-label', L('paneList') + ' / ' + L('paneMap'));
  ctlBadge();
}
function impSection() {
  const M = DATA.meta || {},
    ac = M.acc_country || {},
    ai = M.acc_city || {},
    ks = [...new Set([...Object.keys(ac), ...Object.keys(ai)])].filter(k => k !== 'cost');
  const cell = o =>
    o && isFinite(o.mae)
      ? `${Math.max(o.mae, o.mae_gaps || 0).toFixed(2)} <span class="muted">(n=${o.n})</span>`
      : '—';
  const skip = (M.skip || []).map(k => low(FL(k))).join(', ') || '—';
  const mar = M.mar || {},
    marRows = Object.entries(mar)
      .filter(([k]) => k !== 'cost')
      .sort((a, b) => b[1].auc - a[1].auc)
      .map(
        ([k, o]) =>
          `<tr><td>${FL(k)}</td><td class="mono">${o.missing}</td><td class="mono">${o.gdp_gap > 0 ? '+' : ''}${o.gdp_gap}</td><td class="mono">${o.pop_gap > 0 ? '+' : ''}${o.pop_gap}</td><td class="mono">${o.auc}</td></tr>`
      )
      .join('');
  return `<h3 style="color:var(--fg)">${L('impTitle')}</h3><p>${fmt(L('impBody'), { c: Math.round((M.country_filled || 0) * 100), y: Math.round((M.city_filled || 0) * 100), skip })}</p>
  <p>${L('marTitle')}</p><div class="biastable"><table><thead><tr><th>${L('impFactor')}</th><th>${L('marMiss')}</th><th>${L('marGdp')}</th><th>${L('marPop')}</th><th>AUC</th></tr></thead><tbody>${marRows}</tbody></table></div>
  <div class="biastable"><table><thead><tr><th>${L('impFactor')}</th><th>${L('impCountries')}</th><th>${L('impCities')}</th></tr></thead><tbody>${ks.map(k => `<tr><td>${FL(k)}</td><td>${cell(ac[k])}</td><td>${cell(ai[k])}</td></tr>`).join('')}</tbody></table></div><p>${L('impNote')}</p>`;
}
function applyLang() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = RTL.has(LANG) ? 'rtl' : 'ltr';
  document.title = L('brand');
  $('langSel').value = LANG;
  document.querySelectorAll('[data-t]').forEach(el => {
    el.textContent = L(el.dataset.t);
  });
  document.querySelectorAll('[data-th]').forEach(el => {
    el.innerHTML = L(el.dataset.th);
  });
  $('howInner').innerHTML =
    (HOW[LANG] ? '' : `<p class="meta"><i>${L('howEnglish')}</i></p>`) +
    HOW[BASE_LANG()] +
    impSection() +
    `<p class="stamp" style="color:var(--muted);font-size:12px">${L('dataUpdated')} ${DATA.built} · ${DATA.cities.length} ${L('citiesWord')}</p>` +
    (FEEDBACK_URL
      ? `<p><a href="${FEEDBACK_URL}" target="_blank" rel="noopener">${L('feedback')}</a></p>`
      : '') +
    `<p><button class="ghost linkbtn wipe" id="wipeBtn">${L('wipeAll')}</button></p>`;
  $('wipeBtn').onclick = ev => {
    const b = ev.currentTarget;
    if (!b.dataset.armed) {
      b.dataset.armed = '1';
      b.textContent = L('wipeAgain');
      setTimeout(() => {
        delete b.dataset.armed;
        b.textContent = L('wipeAll');
      }, 4000);
      return;
    }
    wipeAll();
  };
  selectsUI();
  weightsUI();
  prioUI();
  pillsUI();
  setAdv(document.body.classList.contains('adv'));
  tierFilters();
  mustUI();
  syncMode();
  renderDefaults();
  if (!$('quizPanel').hidden) TRADE ? renderTrade() : renderQuiz();
  $('zin').innerHTML = IC('plus', 16);
  $('zout').innerHTML = IC('minus', 16);
  $('zreset').innerHTML = IC('reset', 16);
  paint();
  list();
  detail(ui.sel);
  renderCmp();
  renderResults();
  if (zoom) $('maphint').textContent = touch ? L('hintTouch') : L('hintMouse');
}
