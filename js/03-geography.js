'use strict';
/* ---------------- geography ---------------- */
let HOMES = [];
const ADRIANO_HOMES = ['city:East Hampton', 'city:Tampico'];
const FEATURED = [
  'city:San Francisco',
  'city:East Hampton',
  'city:Southampton',
  'city:Montauk',
  'city:New York City',
  'city:Madrid',
  'city:Tampico',
];
function dayHours(lat) {
  const r = Math.PI / 180,
    phi = Math.abs(lat) * r,
    d = 23.44 * r,
    h0 = -0.833 * r;
  let c = (Math.sin(h0) + Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d));
  c = Math.max(-1, Math.min(1, c));
  return (2 * Math.acos(c)) / r / 15;
}
function dayScore(h) {
  return h >= 10.25 ? 5 : h >= 9.1 ? 4 : h >= 8.4 ? 3 : h >= 7.6 ? 2 : 1;
}
function km(a, b) {
  const r = Math.PI / 180,
    dl = (b[0] - a[0]) * r,
    dn = (b[1] - a[1]) * r;
  const s = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dn / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(s));
}
function flightH(a, b) {
  return km(a, b) / 830 + 0.75;
}
function famBand(t) {
  return t <= 3.5 ? 5 : t <= 6 ? 4 : t <= 8.5 ? 3 : t <= 12 ? 2 : 1;
}
function setGeo(e, lat, lon, approx) {
  e.lat0 = lat;
  e.lon0 = lon;
  e.dayH = dayHours(lat);
  e.sc.day = dayScore(e.dayH);
  e.geoApprox = approx;
  e.hasGeo = true;
  e.sc.sea = e.coast == null ? null : seaBand(e.coast);
  famFor(e);
}
const SMALL_AIRPORT = new Set([
  'city:Tampico',
  'city:East Hampton',
  'city:Southampton',
  'city:Montauk',
  'city:Riverhead',
]);
function tripH(a, h) {
  const o = TRIPS[a.key + '|' + h.key];
  if (o > 0) return o;
  const d = km([a.lat0, a.lon0], [h.lat0, h.lon0]);
  if (d < 500) return d / 60;
  return d / 830 + 0.75 + (SMALL_AIRPORT.has(h.key) && d > 1500 ? 2.5 : 0);
}
// hours between two clocks, the short way round the day
const clockGap = (a, b) => Math.min(Math.abs(a - b), 24 - Math.abs(a - b));
// 5 = same hours as home (an hour apart at most), 1 = more than nine hours apart: someone is always asleep
function tzBand(h) {
  return h <= 1 ? 5 : h <= 3 ? 4 : h <= 6 ? 3 : h <= 9 ? 2 : 1;
}
// 5 = on the water (10 km), 4 = under an hour away, 3 = a day trip, 2 = a weekend, 1 = further than 250 km
function seaBand(d) {
  return d <= 10 ? 5 : d <= 40 ? 4 : d <= 100 ? 3 : d <= 250 ? 2 : 1;
}
function famFor(e) {
  if (!e.hasGeo) return;
  e.flights = HOMES.map(h => tripH(e, h));
  e.sc.fam = HOMES.length ? Math.round(d3.mean(e.flights.map(famBand))) : null;
  e.gaps = e.utc == null ? [] : HOMES.filter(h => h.utc != null).map(h => clockGap(e.utc, h.utc));
  e.sc.tz = e.gaps.length ? Math.round(d3.mean(e.gaps.map(tzBand))) : null;
}
