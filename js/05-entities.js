"use strict";
/* ---------------- entities ---------------- */
const CONFLICT=new Set(DATA.conflict||[]);
const RAWD=DATA.raw||{};
const techOf=e=>{const r=(RAWD[e.type==='city'?'city:'+e.name:'c:'+e.id]||{}).tech;return r?r[0][2]:null;};
function factorsOf(s){const o={};FACTORS.forEach(f=>{if(f.calc)return;const v=+s[f.i];o[f.k]=v>0?v:null;});o.day=null;o.fam=null;o.pol=null;return o;}
const srcSet=s=>new Set((s||'').split(',').filter(Boolean));
const ents=[],byIso={},byName={},byKey={};
Object.entries(DATA.countries).forEach(([id,[name,s,note,src,noteEs,a2,imp]])=>{const e={type:'country',id:+id,key:'country:'+(+id),name,a2,imp:imp||{},cost:+s[14]||null,sc:factorsOf(s),note,noteEs,src:srcSet(src),polar:+id===10||+id===260};ents.push(e);byIso[+id]=e;byKey[e.key]=e;});
Object.entries(DATA.byName).forEach(([k,[name,s,note,src,noteEs,a2,imp]])=>{const e={type:'country',id:k,key:'country:'+k,name,a2,imp:imp||{},cost:+s[14]||null,sc:factorsOf(s),note,noteEs,src:srcSet(src)};ents.push(e);byName[k]=e;byKey[e.key]=e;});
const cities=DATA.cities.map(([name,lat,lon,iso,s,note,src,noteEs,nameEs,fields,lvl,imp])=>({type:'city',key:'city:'+name,name,nameEs,fields,imp:imp||{},natl:lvl==='country',cost:+s[14]||null,lat,lon,iso:+iso,sc:factorsOf(s),note,noteEs,src:srcSet(src)}));
cities.forEach(c=>{c.countryEnt=byIso[c.iso];setGeo(c,c.lat,c.lon,false);ents.push(c);byKey[c.key]=c;const ce=c.countryEnt;if(ce&&!ce.hasGeo)setGeo(ce,c.lat,c.lon,false);});
ents.forEach(e=>{e.base={lang:e.sc.lang,perm:e.sc.perm,jobs:e.sc.jobs,clim:e.sc.clim,pay:e.sc.pay};});
const listable=e=>!e.est&&!e.polar;
let DN={};
function regionName(a2){if(!a2)return null;try{if(!DN[LANG])DN[LANG]=new Intl.DisplayNames([LANG],{type:'region'});const n=DN[LANG].of(a2);return n&&n!==a2?n:null;}catch(e){return null;}}
function dn(e){if(e.type==='city')return LANG==='es'?(e.nameEs||e.name):e.name;return regionName(e.a2)||e.name;}
function countryOf(c){if(c.countryEnt)return dn(c.countryEnt);return c.iso===702?(LANG==='es'?'Singapur':'Singapore'):'';}
const noteOf=e=>LANG==='es'?(e.noteEs||e.note):e.note;

