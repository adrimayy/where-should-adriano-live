'use strict';
const DATA = window.ATLAS; // loaded by data/atlas.js (built by build.py); data/lakes-hires.js loads only when the map zooms in
const $ = id => document.getElementById(id);
// the release number, from <html data-v>: every file the page loads later asks for this release's copy
const VER = document.documentElement.dataset.v || '';
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('atlas.' + k);
      return v == null ? d : v;
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('atlas.' + k, v);
    } catch (e) {}
  },
  del(k) {
    try {
      localStorage.removeItem('atlas.' + k);
    } catch (e) {}
  },
};
// Start over as a brand-new visitor: clears everything this site saved in the browser.
// Reached two ways: the small "Clear everything" button at the end of the method notes, or by opening the page with #reset.
function clearSaved() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('atlas.'))
      .forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch (e) {}
}
function wipeAll() {
  clearSaved();
  location.replace(location.pathname + location.search);
}
if (/^#reset$/i.test(location.hash)) {
  clearSaved();
  history.replaceState(null, '', location.pathname + location.search);
}
