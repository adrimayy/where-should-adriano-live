"use strict";
const DATA=window.ATLAS;   // loaded by data/atlas.js, the one data file (built by build.py)
const $=id=>document.getElementById(id);
const store={get(k,d){try{const v=localStorage.getItem('atlas.'+k);return v==null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem('atlas.'+k,v);}catch(e){}},del(k){try{localStorage.removeItem('atlas.'+k);}catch(e){}}};

