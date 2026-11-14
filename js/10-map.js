'use strict';
/* ---------------- map ---------------- */
const ui = {
  opac: false,
  view: 'score',
  mins: {},
  colorBy: store.get('colorBy', 'tier'),
  region: store.get('region', 'atlantic'),
  showC: true,
  showD: true,
  labels: true,
  rankType: 'city',
  tiers: new Set(TIERS),
  minScore: 0,
  must: new Set(),
  showAll: false,
  sel: null,
  cmp: [],
};
const narrow = matchMedia('(max-width:640px)').matches,
  touch = matchMedia('(pointer:coarse)').matches;
const VW = 960,
  VH = narrow ? 720 : 500;
// Land is drawn on a canvas from cached shapes (Path2D, projected once): a pan or zoom repaints the cached shapes at a new
// scale instead of recomputing or re-laying-out thousands of SVG nodes.
const svg = d3.select('#map'),
  cv = svg.node(),
  ctx = cv.getContext('2d');
cv.style.aspectRatio = `${VW} / ${VH}`;
const osvg = d3.select('#overlay').attr('viewBox', `0 0 ${VW} ${VH}`).style('aspect-ratio', `${VW} / ${VH}`),
  oroot = osvg.append('g'),
  gPlaceNames = oroot.append('g').attr('pointer-events', 'none'),
  gCities = oroot.append('g'),
  gLabels = oroot.append('g').attr('pointer-events', 'none'),
  gClusters = oroot.append('g').attr('pointer-events', 'none'),
  // the selection is a ring around the dot, on its own layer: the dot keeps its size and the ring stays a fixed
  // number of screen pixels at every zoom
  // a copy of the selected dot, drawn above the group circles so a neighbouring group never covers it
  selDot = oroot.append('circle').attr('class', 'selring').attr('display', 'none'),
  selRing = oroot
    .append('circle')
    .attr('class', 'selring')
    .attr('fill', 'none')
    .attr('pointer-events', 'none')
    .attr('display', 'none');
let proj,
  path,
  features = [],
  zoomK = 1,
  landFC = null,
  zoom,
  MESH = null,
  HIRES = false,
  LAND = null;
const tip = $('tip');
const A3 = DATA.a3;
const NAME_ALIAS = {
  Kosovo: 'Kosovo',
  'Republic of Kosovo': 'Kosovo',
  'N. Cyprus': 'N. Cyprus',
  'Northern Cyprus': 'N. Cyprus',
  Somaliland: 'Somaliland',
};
function entOfFeature(d) {
  const nm = d.properties && d.properties.name;
  return (
    byIso[A3[d.id]] ||
    (isFinite(+d.id) && byIso[+d.id]) ||
    byName[NAME_ALIAS[nm]] ||
    ents.find(x => x.type === 'city' && x.name === nm && (nm === 'Singapore' || nm === 'Hong Kong')) ||
    null
  );
}
const FALLBACK = {};
function fallbackEnt(d) {
  const nm = (d.properties && d.properties.name) || '?';
  if (FALLBACK[nm]) return FALLBACK[nm];
  const e = (FALLBACK[nm] = {
    type: 'country',
    id: 'est-' + nm,
    key: 'country:est-' + nm,
    name: nm,
    sc: factorsOf('2223222202220240'),
    note: 'Not individually scored. Shown with a cautious default estimate.',
    noteEs: 'Sin calificación individual. Se muestra con una estimación prudente.',
    src: new Set(),
    est: true,
  });
  e.base = { lang: e.sc.lang, perm: e.sc.perm, jobs: e.sc.jobs, clim: e.sc.clim, pay: e.sc.pay };
  e.cost = 4;
  ents.push(e);
  return e;
}
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}
async function getWorld() {
  // the standard outlines load first so the map appears fast; the detailed ones only when someone zooms in (maybeHires)
  const lo = [
    'https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.world.min.js',
    'https://cdn.jsdelivr.net/npm/datamaps@0.5.10/dist/datamaps.world.min.js',
    'https://unpkg.com/datamaps@0.5.10/dist/datamaps.world.min.js',
  ];
  for (const s of lo) {
    if (window.Datamap && window.Datamap.prototype.worldTopo) break;
    try {
      await loadScript(s);
    } catch (e) {}
  }
  const t = window.Datamap && window.Datamap.prototype.worldTopo;
  if (!t || !t.objects) throw new Error('no map data');
  return topoFeatures(t);
}
function topoFeatures(t) {
  const obj = t.objects.world || Object.values(t.objects)[0];
  MESH = null;
  if (topojson.mesh) {
    try {
      MESH = {
        borders: topojson.mesh(t, obj, (a, b) => a !== b),
        coast: topojson.mesh(t, obj, (a, b) => a === b),
      };
    } catch (e) {}
  }
  return topojson
    .feature(t, obj)
    .features.filter(f => f.geometry)
    .map(fixWinding);
}
function bindCountries(fs) {
  features = fs;
  features.forEach(d => {
    d._e = entOfFeature(d) || fallbackEnt(d);
    if (!d._e.hasGeo) {
      const c = d3.geoCentroid(d);
      setGeo(d._e, c[1], c[0], true);
    }
  });
  features.forEach(d => {
    d._lab = bigCentroid(d);
    d._area = d3.geoArea(d);
  });
  landFC = { type: 'FeatureCollection', features: features.filter(d => d.id !== 'ATA' && +d.id !== 10) };
  if (proj) cacheLand();
}
let STATES = null;
async function loadStates() {
  const srcs = [
    'https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.usa.min.js',
    'https://cdn.jsdelivr.net/npm/datamaps@0.5.10/dist/datamaps.usa.min.js',
    'https://unpkg.com/datamaps@0.5.10/dist/datamaps.usa.min.js',
  ];
  for (const s of srcs) {
    try {
      await loadScript(s);
      const t = window.Datamap && window.Datamap.prototype.usaTopo;
      if (t && t.objects) {
        const obj = t.objects.usa || Object.values(t.objects)[0];
        const fs = topojson
          .feature(t, obj)
          .features.filter(f => f.geometry)
          .map(fixWinding);
        fs.forEach(f => {
          f._lab = bigCentroid(f);
        });
        STATES = { fs, mesh: topojson.mesh ? topojson.mesh(t, obj, (a, b) => a !== b) : null };
        drawGeo();
        vis();
        return;
      }
    } catch (e) {}
  }
}
// label point of a shape: the centre of its largest piece (so France isn't labelled in the Atlantic because of French Guiana)
function bigCentroid(f) {
  const g = f.geometry;
  if (g.type !== 'MultiPolygon') return d3.geoCentroid(f);
  let best = null,
    ba = -1;
  for (const c of g.coordinates) {
    const p = { type: 'Polygon', coordinates: c },
      a = d3.geoArea(p);
    if (a > ba) {
      ba = a;
      best = p;
    }
  }
  return d3.geoCentroid(best);
}
let _hiP = null;
function maybeHires() {
  if (HIRES || _hiP || zoomK < 2.2) return;
  const hi = [
    'https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.world.hires.min.js',
    'https://cdn.jsdelivr.net/npm/datamaps@0.5.10/dist/datamaps.world.hires.min.js',
    'https://unpkg.com/datamaps@0.5.10/dist/datamaps.world.hires.min.js',
  ];
  const before = window.Datamap && window.Datamap.prototype.worldTopo;
  _hiP = (async () => {
    for (const s of hi) {
      try {
        await loadScript(s);
        const t = window.Datamap && window.Datamap.prototype.worldTopo;
        if (t && t !== before && t.objects) {
          HIRES = true;
          bindCountries(topoFeatures(t));
          drawGeo();
          paint();
          return;
        }
      } catch (e) {}
    }
  })();
}
// one-tap views; most cities sit on the two sides of the Atlantic
const REGIONS = {
  world: null,
  atlantic: [
    [-128, 14],
    [32, 62],
  ],
  na: [
    [-128, 17],
    [-62, 56],
  ],
  eu: [
    [-11, 35],
    [31, 61],
  ],
  la: [
    [-118, -42],
    [-34, 30],
  ],
  ap: [
    [68, -45],
    [178, 46],
  ],
};
function regionView(r, animate) {
  ui.region = r;
  store.set('region', r);
  document
    .querySelectorAll('#regions button')
    .forEach(b => b.setAttribute('aria-pressed', b.dataset.r === r));
  if (!proj || !zoom) return;
  const bb = REGIONS[r];
  let tr = d3.zoomIdentity;
  if (bb) {
    const ring = [];
    for (let i = 0; i <= 8; i++) {
      const x = bb[0][0] + ((bb[1][0] - bb[0][0]) * i) / 8;
      ring.push(proj([x, bb[0][1]]), proj([x, bb[1][1]]));
    }
    const xs = ring.map(p => p[0]),
      ys = ring.map(p => p[1]);
    const x0 = Math.min(...xs),
      x1 = Math.max(...xs),
      y0 = Math.min(...ys),
      y1 = Math.max(...ys),
      pad = narrow ? 0.84 : 0.94,
      k = Math.max(1, Math.min(12, pad / Math.max((x1 - x0) / VW, (y1 - y0) / VH)));
    const cx = VW / 2 - (narrow ? VW * 0.05 : 0); // keep the view clear of the zoom buttons on the right
    tr = d3.zoomIdentity.translate(cx - (k * (x0 + x1)) / 2, VH / 2 - (k * (y0 + y1)) / 2).scale(k);
  }
  goTo(tr, animate ? 650 : 0);
}
function fixWinding(f) {
  if (!f.geometry) return f;
  if (d3.geoArea(f) > 2 * Math.PI) {
    const g = f.geometry,
      rev = r => r.slice().reverse();
    if (g.type === 'Polygon') g.coordinates = g.coordinates.map(rev);
    else if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map(p => p.map(rev));
  }
  return f;
}
// A place below any minimum you set is out, whatever else it scores; the rest are ranked by weighted score
function passes(e) {
  if (!ui.tiers.has(e.tier) || e.score < ui.minScore) return false;
  for (const k in ui.mins) {
    const v = e.v && e.v[k];
    if (v == null || v < ui.mins[k] - 1e-9) return false;
  }
  return true;
}
// scores round to 5 without crossing a verdict line: 68 shows as 65 (Workable), never 70 next to a Workable chip
const bandOf = x => (x >= CUT.fit ? 3 : x >= CUT.ok ? 2 : x >= CUT.caution ? 1 : 0);
const r5 = x => {
    const r = Math.round(x / 5) * 5;
    return bandOf(r) === bandOf(x) ? r : Math.floor(x / 5) * 5;
  },
  pct = x => Math.round((x || 0) * 100) + '%';
let QBR = null;
function quantBreaks() {
  const v = ents
    .filter(e => listable(e) && e.type === ui.rankType)
    .map(e => e.score)
    .sort(d3.ascending);
  QBR = [0.2, 0.4, 0.6, 0.8].map(p => d3.quantile(v, p));
}
function colorFor(e) {
  const st = MAPSTYLE;
  const ramp = t => d3.interpolateRgb(st.seq[0], st.seq[1])(Math.max(0, Math.min(1, t)));
  if (ui.colorBy === 'tier') return st.tiers[e.tier];
  if (ui.colorBy === 'score') return ramp(e.score / 100);
  if (ui.colorBy === 'conf') return ramp(e.conf);
  if (ui.colorBy === 'limit') return GROUPCOL[GROUP[e.lim] || 'none'];
  if (ui.colorBy === 'quant') {
    if (!QBR) quantBreaks();
    const c = QBR.filter(b => e.score > b).length;
    return ramp(c / 4);
  }
  if (ui.colorBy === 'vs') {
    const d = Math.max(-15, Math.min(15, e.score - e.ad.score)) / 15;
    return d < 0 ? d3.interpolateRgb('#c9d1d7', '#cf3f3f')(-d) : d3.interpolateRgb('#c9d1d7', '#7a5af0')(d);
  }
  const v = e.sc[ui.colorBy.slice(2)];
  return v == null ? st.off : ramp((v - 1) / 4);
}
function makeProj() {
  maxZoomCache = 0;
  // Web Mercator, as in Apple and Google Maps, fitted to the land
  const p = d3.geoMercator();
  if (landFC)
    p.fitExtent(
      [
        [10, 10],
        [VW - 10, VH - 10],
      ],
      landFC
    );
  else
    p.fitExtent(
      [
        [10, 10],
        [VW - 10, VH - 10],
      ],
      { type: 'Sphere' }
    );
  proj = p;
  path = d3.geoPath(p);
  proj._base = p.scale();
}
const visible = () => true;
const frameBg = st => st.ocean;
// colors may be CSS variables (light/dark themes); the canvas needs the actual values
const _root = document.documentElement;
function cssC(c) {
  if (typeof c === 'string' && c.startsWith('var(')) {
    const v = getComputedStyle(_root).getPropertyValue(c.slice(4, -1).trim()).trim();
    return v || '#ccc';
  }
  return c;
}
function cacheLand() {
  if (!proj) return;
  const pth = d3.geoPath(proj),
    P = g => {
      const d = g && pth(g);
      return d ? new Path2D(d) : null;
    };
  LAND = {
    sphere: P({ type: 'Sphere' }),
    borders: MESH ? P(MESH.borders) : null,
    coast: MESH ? P(MESH.coast) : null,
    states: STATES && STATES.mesh ? P(STATES.mesh) : null,
  };
  for (const d of features) {
    const ds = pth(d);
    d._p = ds ? new Path2D(ds) : null;
    d._b = ds ? pth.bounds(d) : null;
  }
}
// the map's width is read once per resize, not on every frame (each read can force the browser to redo the layout)
let _mw = 0,
  _mh = 0;
const mapW = () => {
    if (!_mw) {
      _mw = cv.clientWidth;
      _mh = cv.clientHeight;
    }
    return _mw || VW;
  },
  mapH = () => {
    mapW();
    return _mh || VH;
  };
if (window.ResizeObserver)
  new ResizeObserver(() => {
    _mw = 0;
  }).observe(cv);
function sizeCanvas() {
  const w = mapW(),
    dpr = Math.min(2, window.devicePixelRatio || 1),
    W = Math.round(w * dpr),
    H = Math.round(((w * VH) / VW) * dpr);
  if (cv.width !== W || cv.height !== H) {
    cv.width = W;
    cv.height = H;
  }
  return { s: w / VW, dpr };
}
let _ld = 0;
function landSoon() {
  if (_ld) return;
  _ld = requestAnimationFrame(() => {
    _ld = 0;
    drawLand();
  });
}
function drawLand() {
  if (_ld) {
    cancelAnimationFrame(_ld);
    _ld = 0;
  }
  const { s, dpr } = sizeCanvas(),
    t = _lastTV,
    k = t.k,
    st = MAPSTYLE;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!LAND) return;
  ctx.setTransform(dpr * s * k, 0, 0, dpr * s * k, dpr * s * t.x, dpr * s * t.y);
  const lw = px => px / (s * k);
  ctx.lineJoin = 'round';
  // only shapes in view are drawn
  const x0 = -t.x / k,
    y0 = -t.y / k,
    x1 = (VW - t.x) / k,
    y1 = (VH - t.y) / k,
    inView = b => b && b[1][0] >= x0 && b[0][0] <= x1 && b[1][1] >= y0 && b[0][1] <= y1;
  if (LAND.sphere) {
    ctx.fillStyle = cssC(st.ocean);
    ctx.fill(LAND.sphere);
  }
  const off = cssC(st.off);
  for (const d of features) {
    if (!d._p || !inView(d._b)) continue;
    ctx.globalAlpha = d._op ?? 1;
    ctx.fillStyle = d._fill ? cssC(d._fill) : off;
    ctx.fill(d._p);
  }
  ctx.globalAlpha = 1;
  const stroke = cssC(st.stroke);
  if (!LAND.borders) {
    ctx.lineWidth = lw(0.5);
    ctx.strokeStyle = stroke;
    for (const d of features) if (d._p && inView(d._b)) ctx.stroke(d._p);
  }
  if (LAND.states && k >= 1.8) {
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = lw(0.5);
    ctx.strokeStyle = stroke;
    ctx.stroke(LAND.states);
    ctx.globalAlpha = 1;
  }
  if (LAND.borders) {
    ctx.lineWidth = lw(0.8);
    ctx.strokeStyle = cssC('var(--border-line)');
    ctx.stroke(LAND.borders);
  }
  if (LAND.coast) {
    ctx.lineWidth = lw(0.7);
    ctx.strokeStyle = cssC('var(--coast-line)');
    ctx.stroke(LAND.coast);
  }
  const sel = ui.sel && features.find(d => d._e === ui.sel);
  if (sel && sel._p) {
    ctx.lineWidth = lw(1.8);
    ctx.strokeStyle = cssC(st.text);
    ctx.stroke(sel._p);
  }
}
// which country is under the pointer: test the cached shapes (bounding box first)
function countryAt(ev) {
  if (!LAND) return null;
  const r = cv.getBoundingClientRect(),
    s = r.width / VW,
    t = _lastTV;
  const ux = ((ev.clientX - r.left) / s - t.x) / t.k,
    uy = ((ev.clientY - r.top) / s - t.y) / t.k;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = features.length - 1; i >= 0; i--) {
    const d = features[i],
      b = d._b;
    if (!d._p || !b || ux < b[0][0] || ux > b[1][0] || uy < b[0][1] || uy > b[1][1]) continue;
    if (ctx.isPointInPath(d._p, ux, uy)) return d;
  }
  return null;
}
let _hv = 0,
  _hvEv = null;
cv.addEventListener('mousemove', ev => {
  _hvEv = ev;
  if (_hv) return;
  _hv = requestAnimationFrame(() => {
    _hv = 0;
    if (!ui.showC || cv.style.transform) return hideTip();
    const d = countryAt(_hvEv);
    d ? showTip(_hvEv, d._e) : hideTip();
  });
});
cv.addEventListener('mouseleave', hideTip);
// the canvas does not follow CSS colors by itself: repaint when the system or the viewer switches light/dark
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => landSoon());
new MutationObserver(() => landSoon()).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme', 'class'],
});
cv.addEventListener('click', ev => {
  if (!ui.showC) return;
  const d = countryAt(ev);
  if (d) select(d._e, false);
});
function drawGeo() {
  const st = MAPSTYLE;
  $('mapbox').style.background = frameBg(st);
  cacheLand();
  drawLand();
  placeCities();
}
// sizes are set in screen pixels, so dots and names are the same size on a phone and a laptop
const U = () => VW / mapW(); // map units per screen pixel
const SZ = {
  dot: narrow ? 6 : 5,
  city: narrow ? 12.5 : 12,
  count: narrow ? 10 : 9.5,
  country: 10,
  state: 9.5,
};
const FONT = '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif';
function placeCities() {
  // map positions change only when the projection does, so they are worked out once here and reused
  gCities.selectAll('circle').each(function (d) {
    const p = proj([d.lon, d.lat]);
    d._x = p[0];
    d._y = p[1];
    this.setAttribute('cx', p[0]);
    this.setAttribute('cy', p[1]);
  });
  vis();
}
// write an attribute only when its value changed: most dots keep theirs from one regrouping to the next
function setA(node, name, v) {
  const c = node._a || (node._a = {});
  if (c[name] === v) return;
  c[name] = v;
  if (v == null) node.removeAttribute(name);
  else node.setAttribute(name, v);
}
function ringAt() {
  const d = ui.sel,
    u = U();
  if (!d || d.type !== 'city' || d._x == null || !(ui.showD && passes(d)))
    return (selDot.attr('display', 'none'), selRing.attr('display', 'none'));
  selDot
    .attr('display', null)
    .attr('cx', d._x)
    .attr('cy', d._y)
    .attr('r', (SZ.dot * u) / zoomK)
    .attr('fill', colorFor(d))
    .attr('stroke', MAPSTYLE.dot)
    .attr('stroke-width', (1.5 * u) / zoomK);
  selRing
    .attr('display', null)
    .attr('cx', d._x)
    .attr('cy', d._y)
    .attr('r', ((SZ.dot + 4.5) * u) / zoomK)
    .style('stroke', 'var(--fg)')
    .attr('stroke-width', (2.25 * u) / zoomK);
}
// ranking order of the cities, kept until the scores or filters change (paint() clears it)
let RKC = null,
  groupedAtK = 0,
  groupedAt = 0;
// At low zoom, dots closer than about three bubble-widths are grouped under the best-ranked one, with a count
// (a wider reach than strictly needed, so dense areas like the eastern US read as a few groups, not a carpet of badges)
let CLUSTER = new Map(),
  CLUSTER_HEADS = new Map();
// real text widths (measured once per name), so names don't overlap because of a guess
const _tw = new Map(),
  _cv = document.createElement('canvas').getContext('2d');
function textW(t, wt, size) {
  const k = t + '|' + wt + '|' + size;
  if (_tw.has(k)) return _tw.get(k);
  _cv.font = `${wt} ${size}px ${FONT}`;
  const w = _cv.measureText(t).width;
  _tw.set(k, w);
  return w;
}
// live = called mid-zoom: regroup the dots and counts only; names are placed when the gesture ends
function vis(live) {
  const u = U(),
    R0 = SZ.dot * u,
    RB = R0 * 1.75,
    pts = [];
  // read the page layout first, before anything is changed, so the browser isn't forced to lay the map out mid-update
  const mb = $('mapbox').getBoundingClientRect(),
    uiRects = ['.zoombtns', '#maphint']
      .map(q => document.querySelector(q))
      .filter(el => el && el.offsetParent && (el.id !== 'maphint' || el.classList.contains('show')))
      .map(el => el.getBoundingClientRect());
  CLUSTER = new Map();
  groupedAtK = zoomK;
  groupedAt = performance.now();
  const circles = gCities.selectAll('circle');
  circles.each(function (d) {
    if (!(ui.showD && passes(d) && visible(d))) return;
    if (d._x == null) [d._x, d._y] = proj([d.lon, d.lat]);
    pts.push({ d, x: d._x * zoomK, y: d._y * zoomK, n: 1, solo: d === ui.sel });
  });
  if (!RKC)
    RKC = new Map(
      ents
        .filter(e => e.type === 'city' && listable(e) && passes(e))
        .sort(byRank)
        .map((e, i) => [e, i])
    );
  const RK = RKC;
  // the selected city is always its own dot: it is never folded into a group and never absorbs its neighbours
  pts.sort((a, b) => b.solo - a.solo || (RK.get(a.d) ?? 999) - (RK.get(b.d) ?? 999));
  const kept = [],
    reach = RB * 3,
    reach2 = reach * reach;
  for (const p of pts) {
    let k = null;
    for (const q of kept) {
      if (q.solo) continue;
      const dx = q.x - p.x,
        dy = q.y - p.y;
      if (dx > reach || dx < -reach || dy > reach || dy < -reach || dx * dx + dy * dy >= reach2) continue;
      k = q;
      break;
    }
    if (k) {
      k.n++;
      CLUSTER.set(p.d, k.d);
    } else kept.push(p);
  }
  const head = new Map(kept.map(p => [p.d, p.n]));
  CLUSTER_HEADS = head;
  // a group shows as one bigger dot with its count inside
  const sw = (1.5 * u) / zoomK,
    lang = LANG;
  circles.each(function (d) {
    const n = head.get(d);
    setA(this, 'r', (n > 1 ? RB : R0) / zoomK);
    setA(this, 'stroke-width', sw);
    setA(this, 'display', n ? null : 'none');
    const key = n + '|' + d.tier + '|' + lang;
    if (this._lab !== key) {
      this._lab = key;
      this.setAttribute('aria-label', `${dn(d)}, ${L('tiers')[d.tier]}${n > 1 ? ', +' + (n - 1) : ''}`);
    }
  });
  ringAt();
  // a group shows its count; the top 10 are named in bold
  gClusters
    .selectAll('text')
    .data(
      kept.filter(p => p.n > 1),
      p => p.d.key
    )
    .join('text')
    .attr('x', p => p.x / zoomK)
    .attr('y', p => p.y / zoomK)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-size', (SZ.count * u) / zoomK)
    .attr('font-weight', 700)
    .attr('font-family', FONT)
    .attr('fill', p => inkFor(colorFor(p.d)))
    .attr('stroke', 'none')
    .text(p => p.n);
  if (live) {
    // names of cities that just went into a group would float free: hide those, keep the rest where they are
    gLabels.selectAll('text').each(function (d) {
      if (!head.has(d)) this.setAttribute('display', 'none');
    });
    return;
  }
  // names stay inside the frame, clear of the map buttons, and off every dot and other name
  const tv = _lastTV,
    pad = 3 * u;
  // every box on the map (dots, names, buttons) goes into a coarse grid, so a name is only checked against its neighbours
  const CELL = 48 * u,
    grid = new Map(),
    cellsOf = b => {
      const out = [];
      for (let i = Math.floor(b.x / CELL); i <= Math.floor((b.x + b.w) / CELL); i++)
        for (let j = Math.floor(b.y / CELL); j <= Math.floor((b.y + b.h) / CELL); j++)
          out.push(i * 100003 + j);
      return out;
    },
    addBox = b => {
      for (const c of cellsOf(b)) (grid.get(c) || grid.set(c, []).get(c)).push(b);
    },
    // true if any box near b (other than b's own) passes the test
    anyNear = (b, test) => {
      for (const c of cellsOf(b)) {
        const g = grid.get(c);
        if (g) for (const o of g) if (o.own !== b.own && test(o) && ov(b, o)) return true;
      }
      return false;
    },
    eachNear = (b, fn) => {
      for (const c of cellsOf(b)) for (const o of grid.get(c) || []) if (ov(b, o)) fn(o);
    };
  const ov = (b, o) => b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.h && o.y < b.y + b.h;
  for (const p of kept) {
    const r = (p.n > 1 ? RB : R0) + u;
    addBox({ x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r, own: p.d, bub: p.n > 1 });
  }
  for (const r of uiRects)
    addBox({
      x: (r.left - mb.left) * u - tv.x - pad,
      y: (r.top - mb.top) * u - tv.y - pad,
      w: r.width * u + 2 * pad,
      h: r.height * u + 2 * pad,
      own: 'UI',
    });
  const inFrame = b =>
    b.x + tv.x >= pad && b.x + b.w + tv.x <= VW - pad && b.y + tv.y >= pad && b.y + b.h + tv.y <= VH - pad;
  const hit = b => !inFrame(b) || anyNear(b, () => true);
  const nameHit = b => !inFrame(b) || anyNear(b, o => o.own === 'L' || o.own === 'UI' || o.bub);
  const faded = new Set(),
    showL = new Set(),
    LP = new Map(),
    rk = d => RK.get(d) ?? 999,
    txt = d => dn(d);
  // in ranking order; each name tries right, left, above, below its dot; the top 10 are always named when they fit in the frame;
  // how many others depends on the zoom (a handful zoomed out, all of them close up)
  const cap = narrow ? [6, 14, 28] : [14, 28, 55],
    maxN = zoomK < 1.4 ? cap[0] : zoomK < 2.2 ? cap[1] : zoomK < 3.5 ? cap[2] : 1e9;
  let nN = 0;
  if (ui.labels)
    for (const p of [...kept].sort((a, b) => rk(a.d) - rk(b.d))) {
      if (nN >= maxN && rk(p.d) >= 10) continue;
      const w = (textW(txt(p.d), rk(p.d) < 10 ? 600 : 500, SZ.city) + 3) * u,
        h = SZ.city * 1.25 * u,
        off = (p.n > 1 ? RB : R0) + 3 * u;
      const c = [
        { b: { x: p.x + off, y: p.y - h / 2, w, h }, dx: off, dy: h * 0.3, a: 'start' },
        { b: { x: p.x - off - w, y: p.y - h / 2, w, h }, dx: -off, dy: h * 0.3, a: 'end' },
        { b: { x: p.x - w / 2, y: p.y - off - h, w, h }, dx: 0, dy: -off - h * 0.22, a: 'middle' },
        { b: { x: p.x - w / 2, y: p.y + off, w, h }, dx: 0, dy: off + h * 0.78, a: 'middle' },
      ];
      let pick = c.find(o => !hit({ ...o.b, own: p.d }));
      if (!pick && rk(p.d) < 10) pick = c.find(o => !nameHit({ ...o.b, own: p.d }));
      // still boxed in: a top-10 name may sit over lower-ranked bubbles, which fade behind it (names never cover names)
      if (!pick && rk(p.d) < 10) {
        pick = c.find(o => inFrame(o.b) && !anyNear(o.b, q => q.own === 'L' || q.own === 'UI'));
        if (pick)
          eachNear(pick.b, q => {
            if (q.bub && q.own !== p.d) faded.add(q.own);
          });
      }
      if (pick) {
        addBox({ ...pick.b, own: 'L' });
        LP.set(p.d, pick);
        showL.add(p.d);
        nN++;
      }
    }
  circles.each(function (d) {
    setA(this, 'opacity', faded.has(d) ? 0.35 : 1);
  });
  gClusters.selectAll('text').attr('opacity', q => (faded.has(q.d) ? 0 : 1));
  gLabels.raise();
  gLabels
    .selectAll('text')
    .filter(d => showL.has(d))
    .text(txt)
    .attr('text-anchor', d => LP.get(d).a)
    .attr('x', d => (d._x * zoomK + LP.get(d).dx) / zoomK)
    .attr('y', d => (d._y * zoomK + LP.get(d).dy) / zoomK);
  gLabels
    .selectAll('text')
    .attr('display', d => (showL.has(d) ? null : 'none'))
    .attr('font-weight', d => (rk(d) < 10 ? 600 : 500))
    .attr('font-size', (SZ.city * u) / zoomK)
    .attr('stroke-width', (3 * u) / zoomK);
  // country names (big countries first, more as you zoom in) and US state abbreviations (zoomed in), in the space left
  const st = MAPSTYLE,
    names = [];
  const softHit = b => !inFrame(b) || anyNear(b, o => typeof o.own === 'string');
  const cs = features
    .filter(d => d._lab && d._e && d._area > (0.0016 * (narrow ? 1.6 : 1)) / (zoomK * zoomK))
    .sort((a, b) => b._area - a._area);
  for (const d of cs) {
    const p = proj(d._lab);
    if (!p || !visible({ lon: d._lab[0], lat: d._lab[1] })) continue;
    const t = dn(d._e).toUpperCase(),
      w = (textW(t, 500, SZ.country) + t.length * 0.9 + 8) * u,
      h = SZ.country * 1.5 * u,
      b0 = { x: p[0] * zoomK - w / 2, y: p[1] * zoomK - h / 2, w, h, own: 'C' + d.id };
    // country names may sit under city dots (the halo keeps both readable) but never under another name or a button;
    // if the center is taken, try just above or below it
    const tryAt = [0, -1.2 * h, 1.2 * h].map(dy => ({ ...b0, y: b0.y + dy, dy })).find(b => !softHit(b));
    if (tryAt) {
      addBox(tryAt);
      names.push({ k: 'c' + d.id, x: p[0], y: p[1] + tryAt.dy / zoomK, t, cls: 'cn' });
    }
  }
  if (STATES && zoomK >= 2.4)
    for (const f of STATES.fs) {
      const p = proj(f._lab);
      if (!p) continue;
      const t = String(f.id),
        w = (textW(t, 500, SZ.state) + t.length * 0.8 + 8) * u,
        h = SZ.state * 1.5 * u,
        b = { x: p[0] * zoomK - w / 2, y: p[1] * zoomK - h / 2, w, h, own: 'S' + f.id };
      if (!hit(b)) {
        addBox(b);
        names.push({ k: 's' + f.id, x: p[0], y: p[1], t, cls: 'sn' });
      }
    }
  gPlaceNames
    .selectAll('text')
    .data(names, n => n.k)
    .join('text')
    .attr('x', n => n.x)
    .attr('y', n => n.y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-family', FONT)
    .attr('font-size', n => ((n.cls === 'cn' ? SZ.country : SZ.state) * u) / zoomK)
    .attr('font-weight', 500)
    .attr('letter-spacing', n => ((n.cls === 'cn' ? 0.9 : 0.5) * u) / zoomK)
    .attr('fill', 'var(--map-label)')
    .style('stroke', 'var(--halo)')
    .style('stroke-width', (2.5 * u) / zoomK)
    .style('paint-order', 'stroke')
    .style('stroke-linejoin', 'round')
    .attr('opacity', 1)
    .text(n => n.t);
}
function paint() {
  const st = MAPSTYLE,
    R = narrow ? 7 : 4.6;
  QBR = null;
  RKC = null;
  for (const d of features) {
    const ok = ui.showC && passes(d._e);
    d._fill = ok ? colorFor(d._e) : st.off;
    d._op =
      ui.showC && !ok ? 0.6 : ui.showC && ui.opac && !d._e.est ? 0.2 + 0.5 * (1 - (d._e.impShare || 0)) : 0.5;
  }
  landSoon();
  gCities
    .selectAll('circle')
    .attr('fill', d => colorFor(d))
    .attr('stroke', st.dot);
  gLabels
    .selectAll('text')
    .attr('fill', st.text)
    .style('stroke', 'var(--halo)')
    .style('paint-order', 'stroke')
    .style('stroke-linejoin', 'round')
    .attr('stroke-opacity', 1);
  $('mapbox').style.background = frameBg(st);
  vis();
  legend();
  summary();
  pcard();
}
function legend() {
  const st = MAPSTYLE;
  let h = '';
  const pool = ents.filter(e => listable(e) && e.type === ui.rankType);
  const cutTxt = {
    fit: CUT.fit + '+',
    ok: CUT.ok + '–' + (CUT.fit - 1),
    caution: CUT.caution + '–' + (CUT.ok - 1),
    avoid: '<' + CUT.caution,
    nodata: '',
  };
  if (ui.colorBy === 'tier')
    h =
      `<span class="lab">${L('verdictFor')}</span>` +
      TIERS.map(
        t =>
          `<span style="display:inline-flex;gap:5px;align-items:center">${sym(t)}${L('tiersShort')[t]} <span class="muted">${cutTxt[t]} (${pool.filter(e => e.tier === t).length})</span></span>`
      ).join('');
  else if (ui.colorBy === 'quant') {
    if (!QBR) quantBreaks();
    const b = [0, ...QBR.map(Math.round), 100];
    const ramp = t => d3.interpolateRgb(st.seq[0], st.seq[1])(t);
    h =
      `<span class="lab">${L('quantNote')}</span>` +
      [0, 1, 2, 3, 4]
        .map(
          i => `<span><span class="sw" style="background:${ramp(i / 4)}"></span>${b[i]}–${b[i + 1]}</span>`
        )
        .join('');
  } else if (ui.colorBy === 'limit')
    h = GROUPS.map(
      g => `<span><span class="sw" style="background:${GROUPCOL[g]}"></span>${L('groups')[g]}</span>`
    ).join('');
  else if (ui.colorBy === 'vs')
    h = `<span class="ramp">${L('vsLegendLow')}<span class="bar" style="background:linear-gradient(90deg,#cf3f3f,#c9d1d7,#7a5af0)"></span>${L('vsLegendHigh')}</span>`;
  else {
    const lab =
      ui.colorBy === 'score'
        ? ['0', '100']
        : ui.colorBy === 'conf'
          ? [L('legendAll'), L('legendData')]
          : [L('poor'), L('great')];
    h =
      `<span class="ramp">${lab[0]}<span class="bar" style="background:linear-gradient(90deg,${st.seq[0]},${st.seq[1]})"></span>${lab[1]}</span>` +
      (ui.colorBy.startsWith('f:')
        ? `<span><span class="sw" style="background:${st.off}"></span>${L('legendNoData')}</span>`
        : '');
  }
  $('legend').innerHTML =
    h +
    (ents.some(e => !passes(e))
      ? `<span><span class="sw" style="background:${st.off};opacity:.55"></span>${L('legendFiltered')}</span>`
      : '') +
    (ui.showC && ui.opac ? `<span class="muted">${L('opacNote')}</span>` : '');
}
function summary() {
  const c = ents.filter(e => listable(e) && e.type === 'country'),
    d = ents.filter(e => e.type === 'city');
  // only worth showing once something is filtered out
  $('fsum').textContent =
    c.filter(passes).length === c.length && d.filter(passes).length === d.length
      ? ''
      : fmt(L('fsum'), {
          c: c.filter(passes).length,
          ct: c.length,
          d: d.filter(passes).length,
          dt: d.length,
        });
  $('freset').hidden = !(ui.tiers.size < TIERS.length || ui.minScore > 0 || Object.keys(ui.mins).length > 0);
}
const TSYM = { fit: 'check', ok: 'dot', caution: 'alert', avoid: 'x', nodata: 'quest' };
function inkFor(c) {
  const m = /^#?([0-9a-f]{6})$/i.exec(c || '');
  if (!m) return '#fff';
  const n = parseInt(m[1], 16),
    l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return l > 0.6 ? '#111' : '#fff';
}
const sym = t =>
  `<i class="sym" aria-hidden="true" style="background:${TIERCOL[t]};color:${inkFor(TIERCOL[t])}">${IC(TSYM[t], 12, 2.8)}</i>`;
const chip = tier => `<span class="chip">${sym(tier)}${L('tiers')[tier]}</span>`;
function pcard() {
  const P = $('pcard'),
    e = ui.sel;
  if (!e) {
    P.hidden = true;
    return;
  }
  P.hidden = false;
  // a short sheet, like a map app: name, verdict and score, one line of why; everything else lives in Details
  const vs = vsAd()
    ? `<span class="sc2">${L('youScore')} ${r5(e.score)} · ${L('adScore')} ${r5(e.ad.score)}</span>`
    : `<span class="sc2">${r5(e.score)}<small>/100</small></span>`;
  P.innerHTML = `<div class="pchead"><span class="nm">${dn(e)}</span><button id="pcX" class="pcx" aria-label="Close">${IC('x', 14, 2.6)}</button></div><div class="pcrow">${chip(e.tier)}${vs}</div><p class="pcwhy">${whyShort(e)}</p><div class="acts"><button id="pcDet" class="tinted">${L('details')}</button><button id="pcCmp">${ui.cmp.includes(e) ? L('removeCmp') : L('addCmp')}</button></div>`;
  $('pcDet').onclick = () => $('detailSec').scrollIntoView({ block: 'start' });
  $('pcCmp').onclick = () => toggleCmp(e);
  $('pcX').onclick = () => {
    ui.sel = null;
    paint();
    detail(null);
  };
}
function showTip(ev, e) {
  if (touch) return;
  const box = $('mapbox').getBoundingClientRect();
  tip.innerHTML = `<b>${dn(e)}</b>${e.type === 'city' ? ' · ' + countryOf(e) : ''}<br>${L('tiers')[e.tier]} · ${r5(e.score)}${e.lo != null ? ` <span class="muted">(${e.lo}–${e.hi})</span>` : ''}${vsAd() ? ` · ${L('adScore')} ${r5(e.ad.score)}` : ''}<br><span class="muted">${fmt(L('probLine'), { f: pct(e.pFit), t: pct(e.pTop) })}</span>${passes(e) ? '' : ` · <span class="muted">${L('filteredOut')}</span>`}<br><span class="muted">${e.lim === 'none' ? L('noMajor') : FD(e.lim)}</span>`;
  let x = ev.clientX - box.left + 14,
    y = ev.clientY - box.top + 14;
  if (x > box.width - 260) x = ev.clientX - box.left - 260;
  if (y > box.height - 90) y = ev.clientY - box.top - 90;
  tip.style.left = Math.max(6, x) + 'px';
  tip.style.top = Math.max(6, y) + 'px';
  tip.style.opacity = 1;
}
function hideTip() {
  tip.style.opacity = 0;
}
function zoomFilter(ev) {
  if (ev.target && ev.target.closest && !ev.target.closest('#map,#overlay')) return false; // not on the zoom buttons or place card
  if (ev.type === 'wheel') return ev.ctrlKey || ev.metaKey;
  if (ev.type.startsWith('touch')) return ev.touches && ev.touches.length > 1;
  return !ev.button;
}
// Flat maps: the zoom listens on the map's frame (#mapbox), which never moves, and works in screen pixels. During a finger or
// mouse gesture the browser slides and scales the map as one picture (GPU, no redraw); the real redraw happens once at the end.
let zsel = svg;
const pxScale = () => mapW() / VW;
const toVB = t => {
  const s = pxScale();
  return d3.zoomIdentity.translate(t.x / s, t.y / s).scale(t.k);
};
const fromVB = t => {
  const s = pxScale();
  return d3.zoomIdentity.translate(t.x * s, t.y * s).scale(t.k);
};
// move the flat map to a transform given in map units (viewBox), optionally animated
// how far you can zoom: until the two closest cities sit about two dot-widths apart, and no further (12x to 60x)
let maxZoomCache = 0;
function maxZoom() {
  if (maxZoomCache) return maxZoomCache;
  const ps = ents
    .filter(e => e.type === 'city' && e.hasGeo)
    .map(e => proj([e.lon, e.lat]))
    .filter(Boolean);
  let dmin = Infinity;
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++) {
      const d = Math.hypot(ps[i][0] - ps[j][0], ps[i][1] - ps[j][1]);
      if (d > 0 && d < dmin) dmin = d;
    }
  return (maxZoomCache = Math.max(12, Math.min(60, (2.4 * SZ.dot * 2 * U()) / dmin)));
}
function goTo(tv, ms) {
  if (!zoom) return;
  (ms ? zsel.transition().duration(ms) : zsel).call(zoom.transform, fromVB(tv));
}
function setupZoom() {
  svg.on('.zoom', null).on('.drag', null);
  d3.select('#mapbox').on('.zoom', null);
  zoomK = 1;
  _lastTV = d3.zoomIdentity;
  oroot.attr('transform', null);
  cv.style.transform = '';
  {
    zsel = d3.select('#mapbox');
    let t0 = null;
    const el = svg.node();
    zoom = d3
      .zoom()
      .filter(zoomFilter)
      .scaleExtent([1, maxZoom()])
      .extent(() => [
        [0, 0],
        [mapW(), mapH()],
      ])
      .translateExtent([
        [0, 0],
        [mapW(), mapH()],
      ])
      // every move (fingers, mouse, buttons, region views): land slides as one GPU picture; dots and names are repositioned on top
      .on('start', ev => {
        t0 = ev.transform;
        _k0 = t0.k;
        el.style.transformOrigin = '0 0';
        el.style.willChange = 'transform';
      })
      .on('zoom', ev => {
        const t = ev.transform;
        if (!t0) t0 = t;
        const k = t.k / t0.k;
        el.style.transform = `translate(${t.x - k * t0.x}px,${t.y - k * t0.y}px) scale(${k})`;
        zoomK = t.k;
        _lastTV = toVB(t);
        zoomSoon();
      })
      .on('end', ev => {
        const t = ev.transform;
        el.style.transform = '';
        el.style.willChange = '';
        t0 = null;
        zoomK = t.k;
        _lastTV = toVB(t);
        oroot.attr('transform', _lastTV);
        zoomEnd();
      });
    zsel.call(zoom);
  }
  // one finger still scrolls the page; two fingers move the map
  svg.style('touch-action', 'pan-y');
  d3.select('#mapbox').style('touch-action', 'pan-y');
  $('maphint').textContent = touch ? L('hintTouch') : L('hintMouse');
}
// during a pan or zoom only the map moves and the dots and names keep their size (one update per frame);
// grouping, labels and colors are worked out once, when the gesture ends
let _zf = 0,
  _gf = 0,
  _k0 = 1;
function zoomSoon() {
  if (_zf) return;
  _zf = requestAnimationFrame(() => {
    _zf = 0;
    zoomFrame();
  });
}
function zoomFrame() {
  const u = U(),
    R0 = SZ.dot * u;
  oroot.attr('transform', _lastTV);
  // regroup while zooming, but only once the zoom has changed enough to matter (about 10%) and at most every 90 ms,
  // so a slow phone spends its frames moving the map, not recounting dots
  const moved = Math.abs(Math.log(zoomK / (groupedAtK || zoomK)));
  const regroup = moved > 0.095 && performance.now() - groupedAt > 90;
  if (regroup) vis(true);
  if (zoomK < _k0 * 0.9)
    gLabels
      .selectAll('text')
      .filter(function () {
        return this.getAttribute('display') !== 'none' && this.getAttribute('font-weight') !== '600';
      })
      .attr('display', 'none');
  const sw = (1.5 * u) / zoomK;
  if (!regroup) {
    gCities.selectAll('circle').each(function (d) {
      if (!CLUSTER_HEADS.has(d)) return; // hidden inside a group: nothing to resize
      setA(this, 'r', (CLUSTER_HEADS.get(d) > 1 ? R0 * 1.75 : R0) / zoomK);
      setA(this, 'stroke-width', sw);
    });
    ringAt();
  }
  gLabels
    .selectAll('text')
    .attr('font-size', (SZ.city * u) / zoomK)
    .attr('stroke-width', (3 * u) / zoomK);
  gPlaceNames
    .selectAll('text')
    .attr('font-size', n => ((n.cls === 'cn' ? SZ.country : SZ.state) * u) / zoomK)
    .attr('letter-spacing', n => ((n.cls === 'cn' ? 1.2 : 0.6) * u) / zoomK);
  gClusters.selectAll('text').attr('font-size', (SZ.count * u) / zoomK);
  $('mapbox').style.background = frameBg(MAPSTYLE);
}
function zoomEnd() {
  if (_zf) {
    cancelAnimationFrame(_zf);
    _zf = 0;
  }
  _k0 = zoomK; // a frame queued during the move must not run after the final redraw
  zoomFrame();
  drawLand();
  placeCities();
  maybeHires();
}
let _lastTV = d3.zoomIdentity;
addEventListener('resize', () => {
  if (!zoom) return;
  _mw = 0;
  zoom.translateExtent([
    [0, 0],
    [mapW(), mapH()],
  ]);
  zsel.call(zoom.transform, fromVB(_lastTV));
});
function rebuild() {
  makeProj();
  setupZoom();
  drawGeo();
  paint();
  regionView(ui.region, false);
}
function focusOn(e) {
  if (!proj || !zoom) return;
  let ll;
  if (e.type === 'city') ll = [e.lon, e.lat];
  else {
    const f = features.find(d => d._e === e);
    if (!f) return;
    ll = d3.geoCentroid(f);
  }
  const p = proj(ll),
    k = Math.max(zoomK, e.type === 'city' ? 4 : 2.5);
  goTo(d3.zoomIdentity.translate(VW / 2 - k * p[0], VH / 2 - k * p[1]).scale(k), 650);
}
// the zoom hint stays out of sight until someone scrolls (without Ctrl/⌘) or drags with one finger over the map, then fades out
{
  let t = 0;
  const show = () => {
    const h = $('maphint');
    h.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => h.classList.remove('show'), 1600);
  };
  $('mapbox').addEventListener(
    'wheel',
    e => {
      if (!e.ctrlKey && !e.metaKey) show();
    },
    { passive: true }
  );
  $('mapbox').addEventListener(
    'touchmove',
    e => {
      if (e.touches.length === 1) show();
    },
    { passive: true }
  );
}
