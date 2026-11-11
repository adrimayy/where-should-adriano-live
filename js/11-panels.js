"use strict";
/* ---------------- panels ---------------- */
function whyLine(e){
  if(e.tier==='nodata')return L('whyNoData');
  const ks=FACTORS.filter(f=>e.sc[f.k]!=null&&e.sc[f.k]>=4&&W[f.k]>0&&counts(e,f.k)).sort((a,b)=>W[b.k]-W[a.k]||e.sc[b.k]-e.sc[a.k]).slice(0,3).map(f=>FL(f.k).toLowerCase());
  const join=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+(LANG==='es'?' y ':', and ')+a[a.length-1];
  const good=ks.length?fmt(L('whyGood'),{x:join(ks)}):L('whyNone');
  const bad=e.lim!=='none'?' '+fmt(L('whyBad'),{x:FD(e.lim).toLowerCase()}):'';
  const cap=e.dataCap?' '+(e.dataCap[0]==='share'?L('capShare'):fmt(L('capData'),{x:join(e.dataCap.map(k=>FL(k).toLowerCase()))})):'';
  const lk=e.likely?' '+fmt(L('likelyCap'),{x:FL(e.lim).toLowerCase(),p:pct(pBelow(e,e.lim,e.lim==='free'?2:1))}):'';
  return good+bad+cap+lk;
}
function srcTag(e,k){if(e.how&&e.how[k]==='imp')return `<span class="tag" style="color:var(--you)">${L('tagImp')}</span>`;if(CALC.has(k)||(k==='clim'&&CLIMMODE!=='mild'))return `<span class="tag">${L('tagCalc')}</span>`;if(backed(e,k))return `<span class="tag">${L('tagData')}</span>`;return `<span class="tag" style="color:var(--muted)">${L('tagEst')}</span>`;}
// what each published figure covers, and its year (Davis: geography; Cairo: per-source year)
const SRCMETA={uhc:['country','2023'],nqolh:['city','2026'],census_ins:['country','2025'],coneval:['country','2022'],eiu:['country','2023'],fh:['country','2026'],
 hom:['country','2022–23'],fbi:['city','2024'],nqols:['city','2026'],ei25s:['country','2025'],ei24f:['country','2024'],eicity24s:['city','2024'],mai:['country','2016–17'],
 nlpp:['country','2026'],ncol:['city','2026'],ncolc:['country','2026'],nqolc:['city','2026'],nqolt:['city','2026'],ntr:['city','2026'],eq:['country','2026'],whr:['country','2026'],
 wps:['country','2025'],iloy:['country','2024'],ilo:['country','2024'],inf:['country','latest'],gdp:['metro','2021–24'],gdpnyc:['metro','2024'],bea:['county','2024'],
 pop:['metro','2021–24'],popnyc:['metro','2024'],nychvs:['city','2023'],censusmsa:['metro','2024'],census:['country','2025'],ei25r:['country','2025'],ei25h:['country','2025'],
 ei24r:['country','2024'],ei24e:['country','2024'],eicity24r:['city','2024'],eicity24h:['city','2024'],ei26r:['country','2026'],temp:['station','1991–2020'],
 tempnear:['station','1991–2020'],pres24:['state','2024'],county24:['county','2024'],cmhc:['city','2025'],lirr:['town','2026'],sblink:['city','2025'],sblinknyc:['metro','2025'],
 items:['city','Apr 2026'],itemsn:['city rent, national pay','Apr 2026'],nidx:['city','2026'],money:['country (its cities)','2026']};
const UNITES={country:'país',city:'ciudad',metro:'área metropolitana',county:'condado',state:'estado',station:'estación',town:'pueblo','city rent, national pay':'renta de la ciudad, sueldo nacional','country (its cities)':'país (sus ciudades)'};
const barCol=v=>(v=Math.round(v),v>=4?'#2f9e5b':v===3?'#e9b02b':v===2?'#e57a3c':'#cf3f3f');
function rawFor(e,k){
  const own=RAWD[e.type==='city'?'city:'+e.name:'c:'+e.id]||{};
  if(own[k])return own[k].map(r=>({r,natl:r[0].endsWith('*')}));
  if(e.type==='city'&&e.how[k]==='obs'){const c=RAWD['c:'+e.iso]||{};if(c[k])return c[k].map(r=>({r,natl:true}));}
  return [];
}
function calcTable(e){
  const lang=LANG==='es'?1:0,rows=[...FACTORS].sort((a,b)=>(W[b.k]||0)-(W[a.k]||0));let tot=0;
  const body=rows.map(f=>{const k=f.k,how=e.how[k],w=W[k]||0,v=e.v[k];let src='';
    if(k==='day'&&e.hasGeo)src=fmt(L('calcDay'),{h:Math.floor(e.dayH),m:String(Math.round((e.dayH%1)*60)).padStart(2,'0')});
    else if(k==='fam'&&e.flights&&e.flights.length)src=fmt(L('calcTrip'),{h:e.flights.map(x=>Math.round(x)).join(' / ')});
    else if(k==='perm'){const v0=e.sc.perm;src=`<div>${L('permRight')}: <b>${v0>=5?L('yes'):L('no')}</b></div><div>${L('permRoute')}: <b>${v0>=5?'—':v0>=4?L('routeEasy'):v0>=3?L('routeSome'):L('routeHard')}</b></div><div class="muted">${L('calcRule')} · ${L('verified')}</div>`;}
    else if(k==='lang')src=L('calcRule');
    else if(k==='pol'&&isoOf(e)!==840)src=`<span class="muted">${L('notApplicable')}</span>`;
    else if(k==='pol'){const rs=rawFor(e,'pol');src=rs.length?rs.map(({r})=>`<div><a href="${RAWU[r[0]]}" target="_blank" rel="noopener">${RAWL[r[0]][LANG==='es'?1:0]}</a>: <span class="mono">${r[1]}</span> → <b>${polBand((POLMODE==='r'?-1:1)*parseFloat(r[1].split(': ')[1].replace(/^R \+/,'-').replace(/^D \+/,'')))}</b> <span class="muted">· ${SRCMETA[r[0]][0]} · 2024</span></div>`).join(''):`<span class="muted">${L('calcNone')}</span>`;}
    else if(k==='clim'&&CLIMMODE!=='mild')src=L('tagCalc')+': '+(LANG==='es'?'latitud':'latitude');
    else{const rs=rawFor(e,k).concat(k==='jobs'&&FIELD==='tech'&&e.how.jobs!=='est'?rawFor(e,'tech'):[]);src=rs.map(({r,natl})=>{const key=r[0].replace('*',''),lb=RAWL[key]||[key,key,null],u=lb[2]&&RAWU[lb[2]];
      const md=SRCMETA[key]||['',''],unit=natl?'country':md[0],ut=LANG==='es'?(UNITES[unit]||unit):unit;
      return `<div>${u?`<a href="${u}" target="_blank" rel="noopener">${lb[lang]}</a>`:lb[lang]}: <span class="mono">${r[1]}</span> → <b>${r[2]}</b>${r[3]!=null&&Math.abs(r[3]-r[2])>0.04&&useCont?` <span class="muted mono">(${r[3].toFixed(2)})</span>`:''} <span class="muted">· ${ut}${md[1]?' · '+md[1]:''}</span></div>`;}).join('');
      if(how==='imp')src+=`<div class="muted">${fmt(L('calcImp'),{sd:(e.sd[k]||0).toFixed(1)})}${e.dr[k]?' · '+fmt(L('calcDraws'),{d:e.dr[k].map(x=>Math.round(x)).join('')}):''}</div>`;
      if(k==='jobs'&&e.hub)src+=`<div class="muted">${fmt(L('hubNote'),{c:dn(e.hub)})}</div>`;
      if(how==='est')src+=`<div class="muted">${L('calcEst')}</div>`;
      if(!src)src=`<span class="muted">${L('calcNone')}</span>`;}
    const used=v==null?'—':(how==='imp'?'≈'+v.toFixed(1):String(Math.round(v*100)/100))+(norm&&v!=null?` <span class="muted">[${nv(k,v).toFixed(1)}]</span>`:'');
    const pts=e.part&&e.part[k]!=null?e.part[k]:null;if(pts!=null)tot+=pts;
    return `<tr style="${w>0?'':'opacity:.5'}"><td>${FL(k)}</td><td>${src}</td><td class="mono">${used}</td><td class="mono">${fmtW(w)}</td><td class="mono">${pts!=null?pts.toFixed(1):(w>0?'—':L('calcOff'))}</td></tr>`;}).join('');
  return `<details class="calc" id="calcT" open><summary><b>${L('calcTitle')}</b></summary><div class="biastable"><table><thead><tr><th>${L('calcFactor')}</th><th>${L('calcSrc')}</th><th>${L('calcUsed')}</th><th>${L('calcW')}</th><th>${L('calcPts')}</th></tr></thead><tbody>${body}<tr><td><b>${L('calcTotal')}</b></td><td></td><td></td><td></td><td class="mono"><b>${AGG==='geo'?e.score:tot.toFixed(1)}</b></td></tr></tbody></table></div><p class="meta">${L('calcNote')}${AGG==='geo'?' '+L('geoNote'):''}</p>
  ${e.rubin?`<p class="meta mono">${fmt(L('rubinLine'),{t:e.rubin.sd.toFixed(1),b:e.rubin.between.toFixed(1),w:e.rubin.within.toFixed(1)})}</p>`:''}</details>`;
}
function detail(e){
  const D=$('detail');
  if(!e){D.innerHTML=`<h2>${L('pick')}</h2><p class="meta">${L('pickNote')}</p>`;return;}
  const drag=e.lim==='none'?L('noDrag'):fmt(L('drag'),{x:FD(e.lim).toLowerCase()});
  const big=MODE==='yours'?`<div style="display:flex;gap:16px;align-items:flex-end"><div><span class="lab" style="color:var(--you)">${L('youScore')}</span><div class="big">~${r5(e.score)}</div></div><div><span class="lab">${L('adScore')}</span><div class="big" style="font-size:28px;color:var(--muted)">~${r5(e.ad.score)}</div></div></div>`:`<div class="big">~${r5(e.score)}<small>/100</small></div>`;
  const rangeLine=`<div class="drange">${rbar(e)}</div><p class="mono muted">${fmt(L('rangeLine'),{lo:e.lo,hi:e.hi,rlo:e.rlo,rhi:e.rhi,n:e.rn})} · ${fmt(L('probLine'),{f:pct(e.pFit),t:pct(e.pTop)})}${e.impShare>0.005?' · '+fmt(L('impShare'),{p:Math.round(e.impShare*100)}):''}</p><p class="meta">${L('roundNote')} <button class="ghost linkbtn" id="toCalc">${L('seeCalc')}</button></p>`;
  const mins=Math.round((e.dayH%1)*60);
  D.innerHTML=`<div class="dhead"><div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="eyebrow">${e.type==='city'?L('city')+' · '+countryOf(e):L('country')}${e.est?' · '+L('estimated'):''}</span><h2 style="font-size:24px">${dn(e)}</h2><div class="toggles">${chip(e.tier)}<button class="chipbtn" id="cmpBtn">${ui.cmp.includes(e)?L('removeCmp'):L('addCmp')}</button></div></div>${big}</div>
  ${rangeLine}<p style="font-weight:500">${whyLine(e)}${e.gated?L('dealRule'):''}</p><p class="meta">${noteOf(e)||''}</p>${e.natl?`<p class="meta">${L('natlNote')}</p>`:''}
  ${e.hasGeo?`<p class="mono muted">${fmt(L('shortest'),{h:Math.floor(e.dayH),m:String(mins).padStart(2,'0')})}${HOMES.filter(h=>h!==e).length?' · '+HOMES.map((h,i)=>h===e?'':fmt(L('flightTo'),{h:Math.round(e.flights[i]),p:dn(h)})).filter(Boolean).join(', '):''}${e.geoApprox?L('fromCenter'):''}</p>`:''}
  <div class="bars">${FACTORS.map(f=>{const how=e.how[f.k];if(how==='imp'){const m=e.v[f.k],sd=e.sd[f.k];return `<div class="brow"><span class="lbl">${FL(f.k)}${srcTag(e,f.k)}</span><span class="track"><span class="fill" style="width:${m*20}%;background:${barCol(Math.round(m))};opacity:.55"></span></span><span class="v">≈${m.toFixed(1)} ±${sd.toFixed(1)}</span></div>`;}const v=e.sc[f.k];if(v==null){const na=f.k==='pol'&&isoOf(e)!==840;return `<div class="brow" style="opacity:.6"><span class="lbl">${FL(f.k)}${na?'':srcTag(e,f.k)}</span><span class="track"></span><span class="v">${na?L('notApplicable'):L('noData')}</span></div>`;}
    if(!(W[f.k]>0)&&(how==='obs'||how==='est')){return `<div class="brow" style="opacity:.45"><span class="lbl">${FL(f.k)}${srcTag(e,f.k)}</span><span class="track"><span class="fill" style="width:${v*20}%;background:${barCol(v)}"></span></span><span class="v">${Math.round(v*10)/10}/5 · ${L('wOff')}</span></div>`;}
    const off=how!=='obs'&&how!=='est';return `<div class="brow${v<=2&&!off?' weak':''}" style="${off?'opacity:.45':''}"><span class="lbl">${FL(f.k)}${srcTag(e,f.k)}</span><span class="track"><span class="fill" style="width:${v*20}%;background:${barCol(v)}"></span></span><span class="v">${off?L('notCounted'):(Math.round(v*10)/10)+'/5'}</span></div>`;}).join('')}</div>
  ${HOMES.length&&e.hasGeo?`<div class="field"><span class="lab">${L('tripTitle')}</span><div class="toggles">${HOMES.map((h,i)=>h===e?'':`<label class="meta" style="display:flex;gap:6px;align-items:center">${dn(h)} <input type="number" min="0" max="60" step="0.5" data-h="${h.key}" value="${TRIPS[e.key+'|'+h.key]||''}" placeholder="${Math.round(e.flights[i])}" style="width:70px;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--fg)"> h</label>`).join('')}</div><p class="meta">${L('tripNote')}</p></div>`:''}
  ${calcTable(e)}
  <p class="meta">${fmt(L('backed'),{b:e.backed,k:e.known})}</p>
  ${e.type==='city'?`<details class="calc"><summary><b>${L('nbhdTitle')}</b></summary><p class="meta">${L('nbhd')}</p>${WALKD[e.name]?`<p class="meta">${fmt(L('walkInfo'),{w:WALKD[e.name][0],t:WALKD[e.name][1]})} <a href="${RAWU.walk}" target="_blank" rel="noopener">${L('walkLink')}</a></p>`:''}</details>`:''}
  ${residentsBox(e)}
  <details class="calc"><summary><b>${L('askTitle')}</b></summary><p class="meta">${L('askNote')}</p><ol class="meta">${residentQs(e).map(q=>`<li>${q}</li>`).join('')}</ol></details>
  ${/us/.test(PERMMODE)&&isoOf(e)!==840?`<p class="meta">${L('taxNote')} <a href="https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad" target="_blank" rel="noopener">IRS</a></p>`:''}`;
  $('cmpBtn').onclick=()=>toggleCmp(e);wireResidents(e);$('toCalc').onclick=()=>{const c=$('calcT');c.open=true;c.scrollIntoView({block:'start'});};
  D.querySelectorAll('input[data-h]').forEach(inp=>inp.onchange=()=>{const k=e.key+'|'+inp.dataset.h,v=parseFloat(inp.value);if(v>0)TRIPS[k]=v;else delete TRIPS[k];becomeYours();applyHomes();refreshAll();saveTake();});
}
// Gilbert: three questions for someone who lives there, from this place's weakest and least certain factors
const RQ={en:{home:'How long did it take you to find your place, and what would you do differently?',pay:'After rent, what does a normal month cost you, and how much is left?',jobs:'How did you find your job, and how long did it take?',commute:'How long is your door-to-door commute, and how much does it vary?',move:'Can you really live here without a car? What do you still drive for?',open:'How did you make your first friends here, and how long did it take?',clim:'Which months are hard here, and how do people cope?',safe:'Which areas do locals avoid, and is it different at night?',hlth:'How do you see a doctor here, and how long is the wait?',cult:'What do you do on a normal weekend, and what do you travel elsewhere for?',happy:'What do people here complain about most?',free:'Is there anything you avoid saying or doing in public here?',perm:'How did your visa or work permit go, and what slowed it down?',lang:'How far do you get in daily life without the local language?',fam:'How often do you go home, and what does the trip really take?',day:'How do the short winter days affect you?',women:'How safe do the women you know feel getting around, day and night?',lgbt:'How open can LGBTQ+ people be at work and in public here?',pol:'How much does local politics affect daily life here?'},
 es:{home:'¿Cuánto tardaste en encontrar dónde vivir y qué harías distinto?',pay:'Después de la renta, ¿cuánto gastas en un mes normal y cuánto te queda?',jobs:'¿Cómo encontraste tu trabajo y cuánto tardaste?',commute:'¿Cuánto dura tu trayecto de puerta a puerta y cuánto varía?',move:'¿De verdad se puede vivir aquí sin auto? ¿Para qué sigues manejando?',open:'¿Cómo hiciste tus primeros amigos aquí y cuánto tardaste?',clim:'¿Qué meses son difíciles aquí y cómo los sobrelleva la gente?',safe:'¿Qué zonas evita la gente de aquí, y cambia de noche?',hlth:'¿Cómo vas al médico aquí y cuánto hay que esperar?',cult:'¿Qué haces un fin de semana normal y para qué viajas a otro lado?',happy:'¿De qué se queja más la gente aquí?',free:'¿Hay algo que evites decir o hacer en público aquí?',perm:'¿Cómo te fue con la visa o el permiso de trabajo y qué lo retrasó?',lang:'¿Qué tanto puedes hacer en el día a día sin el idioma local?',fam:'¿Cada cuánto vas a casa y cuánto tarda el viaje de verdad?',day:'¿Cómo te afectan los días cortos de invierno?',women:'¿Qué tan seguras se sienten las mujeres que conoces al moverse, de día y de noche?',lgbt:'¿Qué tan abiertamente pueden vivir las personas LGBTQ+ en el trabajo y en público aquí?',pol:'¿Cuánto afecta la política local la vida diaria aquí?'}};
function residentQs(e){const ks=FACTORS.filter(f=>W[f.k]>0&&e.v[f.k]!=null);const weak=[...ks].sort((a,b)=>e.v[a.k]-e.v[b.k]||W[b.k]-W[a.k]).map(f=>f.k);
  const unsure=[...ks].filter(f=>e.how[f.k]==='imp').sort((a,b)=>(e.sd[b.k]||0)-(e.sd[a.k]||0)).map(f=>f.k);
  const pick=[];for(const k of [weak[0],weak[1],unsure[0],weak[2],weak[3]])if(k&&!pick.includes(k)&&pick.length<3)pick.push(k);return pick.map(k=>RQ[LANG][k]);}
// Levels: residents rate rent, how welcoming it is and day-to-day happiness. Kept apart from the score. Only where the page runs
// with the artifact database (claude.ai); on other hosts the section never appears. One document per viewer: ratings/<their id>.
let RES=null,RESAGG={},MYUID=null,MYDOC={};
(async()=>{try{if(!window.claude||typeof window.claude.use!=='function')return;const db=await window.claude.use('db'),user=await window.claude.use('user');if(!db||!user)return;
  MYUID=await user.id();if(!MYUID)return;RES=db;
  db.collection('ratings').onSnapshot(snap=>{RESAGG={};snap.docs.forEach(d=>{const c=(d.data()||{}).c||{};if(d.id===MYUID)MYDOC={...c};for(const nm in c){const r=c[nm];if(!r||!(r.r>=1&&r.w>=1&&r.h>=1))continue;const a=RESAGG[nm]=RESAGG[nm]||{n:0,r:0,w:0,h:0};a.n++;a.r+=+r.r;a.w+=+r.w;a.h+=+r.h;}});if(ui.sel&&!document.activeElement?.closest?.('#resBox'))detail(ui.sel);},()=>{});
}catch(err){}})();
function residentsBox(e){if(!RES||e.type!=='city')return '';const a=RESAGG[e.name],m=MYDOC[e.name]||{},avg=k=>a&&a.n?(a[k]/a.n).toFixed(1):'—';
  return `<details class="calc" id="resBox"><summary><b>${L('resTitle')}</b></summary><p class="meta">${L('resNote')}</p><p class="mono">${fmt(L('resAgg'),{n:a?a.n:0,r:avg('r'),w:avg('w'),h:avg('h')})}</p>
  <div class="toggles">${['r','w','h'].map(k=>`<label class="meta" style="display:flex;gap:6px;align-items:center">${L('resQ')[k]} <select data-rk="${k}"><option value="">–</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${+m[k]===n?'selected':''}>${n}</option>`).join('')}</select></label>`).join('')}<button id="resSave">${L('resSave')}</button></div><p class="meta" id="resMsg" role="status"></p></details>`;}
function wireResidents(e){const b=$('resSave');if(!b)return;b.onclick=()=>{const v={};document.querySelectorAll('#resBox select[data-rk]').forEach(sl=>{v[sl.dataset.rk]=+sl.value;});
  if(!(v.r&&v.w&&v.h)){$('resMsg').textContent=L('resNeed');return;}b.disabled=true;MYDOC[e.name]={...v,t:Date.now()};
  RES.collection('ratings').doc(MYUID).set({c:MYDOC}).then(()=>{$('resMsg').textContent=L('resSaved');b.disabled=false;}).catch(()=>{$('resMsg').textContent=L('resFail');b.disabled=false;});};}
function toggleCmp(e){const i=ui.cmp.indexOf(e);if(i>=0)ui.cmp.splice(i,1);else{if(ui.cmp.length>=3)ui.cmp.shift();ui.cmp.push(e);}renderCmp();detail(ui.sel);pcard();}
function renderCmp(){
  const G=$('cmp');$('cmpClear').hidden=!ui.cmp.length;
  if(!ui.cmp.length){G.style.gridTemplateColumns='1fr';G.style.minWidth='0';G.innerHTML=`<p class="meta">${L('cmpEmpty')}</p>`;return;}
  G.style.minWidth='';G.style.gridTemplateColumns=`140px repeat(${ui.cmp.length},minmax(120px,1fr))`;
  let h='<span></span>'+ui.cmp.map((e,i)=>`<span class="h"><span>${dn(e)}</span><button data-i="${i}" aria-label="${L('removeCmp')}">${IC('x',14)}</button></span>`).join('');
  h+=`<span class="meta">${L('overall')}</span>`+ui.cmp.map(e=>`<span class="cell">${chip(e.tier)}<b class="mono" style="font-size:14px">${e.score}</b></span>`).join('');
  if(MODE==='yours')h+=`<span class="meta">${L('adScore')}</span>`+ui.cmp.map(e=>`<span class="cell mono muted">${e.ad.score}</span>`).join('');
  FACTORS.forEach(f=>{const vals=ui.cmp.map(e=>e.sc[f.k]),best=Math.max(...vals.map(v=>v==null?-1:v));
    h+=`<span class="meta">${FL(f.k)}</span>`+vals.map(v=>v==null?`<span class="cell muted mono">${L('noData')}</span>`:`<span class="cell"><span class="track"><span class="fill" style="width:${v*20}%;background:${barCol(v)}"></span></span><span class="mono" style="${v===best&&ui.cmp.length>1?'font-weight:600;color:var(--fg)':'color:var(--muted)'}">${Math.round(v*10)/10}</span></span>`).join('');});
  G.innerHTML=h;G.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{ui.cmp.splice(+b.dataset.i,1);renderCmp();detail(ui.sel);pcard();});
}
function list(){
  const q=($('search').value||'').trim().toLowerCase();
  const all=ents.filter(e=>e.type===ui.rankType&&listable(e));
  let rows=all.filter(passes).sort((a,b)=>byRank(a,b)||dn(a).localeCompare(dn(b)));
  if(q)rows=rows.filter(e=>dn(e).toLowerCase().includes(q)||e.name.toLowerCase().includes(q)||(e.type==='city'&&countryOf(e).toLowerCase().includes(q)));
  const shown=ui.showAll||q?rows:rows.slice(0,20);const sortedAll=[...all].sort((a,b)=>byRank(a,b)||dn(a).localeCompare(dn(b)));const rankOf=e=>sortedAll.indexOf(e)+1;
  if(ui.view==='profile'){$('list').innerHTML=profileTable(shown);}
  else $('list').innerHTML=shown.map(e=>`<button class="row${ui.sel===e?' sel':''}" data-key="${e.key}" title="${L('tiers')[e.tier]} · ${fmt(L('probLine'),{f:pct(e.pFit),t:pct(e.pTop)})}"><span class="n">${rankOf(e)}</span><span style="min-width:0"><b style="font-weight:500">${dn(e)}</b>${e.type==='city'?` <span class="muted" style="font-size:12.5px">${countryOf(e)}</span>`:''}${MODE==='yours'?`<span class="ad">${L('adScore')} ~${r5(e.ad.score)}</span>`:''}</span><span class="sc">${sym(e.tier)}<span class="sn">~${r5(e.score)}</span>${rbar(e)}</span><span class="why">${e.lim==='none'?L('noMajor'):FD(e.lim)}</span></button>`).join('')||`<p class="meta" style="padding:12px 6px">${L('nothing')}</p>`;
  $('more').hidden=ui.showAll||!!q||rows.length<=20;
  $('rankmeta').textContent=fmt(L('rankmeta'),{n:rows.length,t:all.length});
  $('list').querySelectorAll('.row,[data-key]').forEach(b=>b.onclick=()=>{select(byKey[b.dataset.key],true);$('mapSec').scrollIntoView({block:'start'});});
}
// Hullman: the likely range (10th to 90th percentile of the 120 recalculations) as a bar, the score as a tick, the Strong-fit line dotted
function rbar(e){const lo=e.lo??e.score,hi=e.hi??e.score;return `<span class="rbar" title="${lo}–${hi}"><span class="cut" style="left:${CUT.fit}%"></span><span class="rb" style="left:${lo}%;width:${Math.max(1.5,hi-lo)}%;background:${TIERCOL[e.tier]}"></span><span class="rt" style="left:${e.score}%"></span></span>`;}
// Espeland: each factor on its own, nothing combined
function profileTable(rows){const ks=FACTORS.filter(f=>W[f.k]>0).sort((a,b)=>W[b.k]-W[a.k]).map(f=>f.k);
  const cell=(e,k)=>{const v=e.v[k];if(v==null)return `<td class="muted">–</td>`;const im=e.how[k]!=='obs';return `<td style="background:${barCol(v)}${im?'55':'cc'};color:#111;text-align:center" title="${FL(k)}${im?' ('+L('tagImp')+')':''}">${(Math.round(v*10)/10)}${im?'*':''}</td>`;};
  return `<p class="meta">${L('profileNote')}</p><div class="biastable"><table class="prof"><thead><tr><th>${L(ui.rankType==='city'?'city':'country')}</th>${ks.map(k=>`<th title="${FL(k)}">${FL(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(e=>`<tr><td><button class="ghost" data-key="${e.key}" style="min-height:0;padding:0;font:inherit;text-align:left">${dn(e)}</button></td>${ks.map(k=>cell(e,k)).join('')}</tr>`).join('')}</tbody></table></div>`;}
let animT=0;
function animLabel(on){$('animBtn').innerHTML=IC(on?'stop':'play',12)+' '+L(on?'animStopBtn':'animPlay');}
function animStop(){clearInterval(animT);animT=0;$('anim').hidden=true;animLabel(false);}
function animStart(){if(animT){animStop();return;}const tops=(SIM.top||{})[ui.rankType];if(!tops||!tops.length)return;const P=$('anim');P.hidden=false;animLabel(true);let r=0;
  const slow=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const draw=()=>{const keys=tops[r%tops.length];P.innerHTML=`<p class="meta">${fmt(L('animRun'),{r:r%tops.length+1,n:tops.length})}</p><ol>${keys.map(k=>`<li>${dn(byKey[k])}</li>`).join('')}</ol>`;r++;};
  draw();animT=setInterval(draw,slow?1600:500);}
function select(e,focus){ui.sel=e;detail(e);paint();list();if(focus&&e)focusOn(e);}
const fmtW=v=>(+v).toFixed(2).replace(/\.?0+$/,'')+'×';
function goalShares(){const tot=FACTORS.reduce((a,f)=>a+(W[f.k]||0),0)||1;Object.entries(GOALS).forEach(([g,ks])=>{const el=$('gw-'+g);if(el)el.textContent=Math.round(ks.reduce((a,k)=>a+(W[k]||0),0)/tot*100)+'%';});}
function weightsUI(){
  const gavg=g=>GOALS[g].reduce((a,k)=>a+(W[k]||0),0)/GOALS[g].length;
  $('weights').innerHTML=`<span class="lab">${L('goalsTitle')}</span>`+Object.entries(GOALS).map(([g,ks])=>`<div class="goal"><div class="wrow goalrow"><label for="g-${g}"><b>${L('goals')[g]}</b></label><input type="range" id="g-${g}" min="0" max="3" step="0.05" value="${gavg(g)}"><output class="mono" id="gw-${g}"></output></div>
    <details class="gdet" data-g="${g}" ${ui.gopen&&ui.gopen.has(g)?'open':''}><summary class="meta">${fmt(L('goalFactors'),{n:ks.length})}</summary>${ks.map(k=>`<div class="wrow"><label for="w-${k}">${FL(k)}</label><input type="range" id="w-${k}" min="0" max="3" step="0.25" value="${W[k]??0}"><output id="o-${k}">${fmtW(W[k]??0)}</output></div>`).join('')}</details></div>`).join('');
  goalShares();
  document.querySelectorAll('.gdet').forEach(d=>d.ontoggle=()=>{ui.gopen=ui.gopen||new Set();d.open?ui.gopen.add(d.dataset.g):ui.gopen.delete(d.dataset.g);});
  Object.keys(GOALS).forEach(g=>{const el=$('g-'+g);el.oninput=ev=>{becomeYours();const cur=gavg(g),nv=+ev.target.value;GOALS[g].forEach(k=>{W[k]=cur>0?(W[k]||0)*nv/cur:nv;$('w-'+k).value=W[k];$('o-'+k).textContent=fmtW(Math.round(W[k]*100)/100);});$('preset').value='custom';goalShares();refreshSoon(true);};el.onchange=()=>{refreshAll();saveTake();};});
  // while dragging, re-score without the 120 recalculations; run them when the slider is released
  FACTORS.forEach(f=>{const el=$('w-'+f.k);el.oninput=ev=>{becomeYours();W[f.k]=+ev.target.value;$('o-'+f.k).textContent=fmtW(W[f.k]);$('preset').value='custom';const g=GOALOF[f.k];if(g)$('g-'+g).value=GOALS[g].reduce((a,k)=>a+(W[k]||0),0)/GOALS[g].length;goalShares();refreshSoon(true);};el.onchange=()=>{refreshAll();saveTake();};});
  $('preset').innerHTML=Object.entries(L('presets')).filter(([k])=>k!=='quiz'||QUIZW).map(([k,v])=>`<option value="${k}" ${k==='custom'?'hidden':''}>${v}</option>`).join('');
  $('preset').value=MODE==='adriano'?'mine':MODE==='neutral'?'equal':'custom';
  $('useCont').checked=useCont;$('useME').checked=useME;$('lasts').checked=LASTS;$('reach').checked=REACH;
  $('rankBy').innerHTML=Object.entries(L('rankBy')).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');$('rankBy').value=RANKBY;
  $('aggSel').innerHTML=Object.entries(L('agg')).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');$('aggSel').value=AGG;
  $('normM').innerHTML=Object.entries(L('normM')).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');$('normM').value=NORMM;
  $('happyM').innerHTML=Object.entries(L('happyM')).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');$('happyM').value=HAPPYMODE;
  $('home1').outerHTML=homeSelect('home1',HOMES[0]?HOMES[0].key:'');$('home2').outerHTML=homeSelect('home2',HOMES[1]?HOMES[1].key:'');
  $('home1').onchange=$('home2').onchange=()=>{becomeYours();HOMES=homesFromKeys([$('home1').value,$('home2').value].filter(Boolean));applyHomes();refreshAll();saveTake();};
  $('useEst').checked=useEst;$('useImp').checked=useImp;$('norm').checked=norm;$('gate').checked=gate;$('gateOpen').checked=gateOpen;$('gateFar').checked=gateFar;$('gateHot').checked=gateHot;
}
const HIST=[];let _lastState=null,_restoring=false;
function snapState(){return JSON.stringify({MODE,W,h:HOMES.map(x=>x.key),LANGMODE,PERMMODE,POLMODE,FIELD,CLIMMODE,gate,gateOpen,gateFar,gateHot,norm,useEst,useImp,useCont,useME,AGG,NORMM,HAPPYMODE,REACH,LASTS,LASTS_D,QUIZW,ANS});}
function trackState(){if(_restoring)return;const cur=snapState();if(_lastState&&cur!==_lastState){HIST.push(_lastState);if(HIST.length>40)HIST.shift();}_lastState=cur;const b=$('undoBtn');if(b)b.disabled=!HIST.length;}
function undo(){if(!HIST.length)return;const j=HIST.pop(),o=JSON.parse(j);
  ({MODE,W,LANGMODE,PERMMODE,POLMODE,FIELD,CLIMMODE,gate,gateOpen,gateFar,gateHot,norm,useEst,useImp,useCont,useME,AGG,NORMM,HAPPYMODE,REACH,LASTS,LASTS_D,QUIZW,ANS}=o);
  HOMES=homesFromKeys(o.h);_restoring=true;applyHomes();weightsUI();refreshAll();_restoring=false;_lastState=j;$('undoBtn').disabled=!HIST.length;saveTake();gtoast(L('undone'));}
function gtoast(msg,withUndo){const t=$('gtoast');t.innerHTML=`<span>${msg}</span>${withUndo?`<button id="gtUndo">${L('undo')}</button>`:''}`;t.hidden=false;if(withUndo)$('gtUndo').onclick=()=>{undo();t.hidden=true;};clearTimeout(gtoast.t);gtoast.t=setTimeout(()=>{t.hidden=true;},6500);}
function renderLive(){const el=$('liveTop');if(!el)return;const rows=ents.filter(e=>listable(e)&&e.type===ui.rankType&&passes(e)).sort(byRank).slice(0,5);
  el.innerHTML=`<span class="lab">${fmt(L('liveTop'),{t:L(ui.rankType==='city'?'cities':'countries').toLowerCase()})}</span><ol>${rows.map(e=>`<li><span>${sym(e.tier)}${dn(e)} <span class="mono muted">~${r5(e.score)}</span></span></li>`).join('')}</ol>`;}
function setNeutral(){MODE='neutral';W={...PRESETS.equal,perm:0,lang:0,fam:0,pol:0};HOMES=[];LANGMODE='en';PERMMODE='usmx';FIELD='general';CLIMMODE='mild';POLMODE='d';gate=gateOpen=norm=gateFar=gateHot=true;useEst=false;useImp=true;REACH=false;HAPPYMODE='report';LASTS=false;}
function startNeutral(){setNeutral();store.set('view','neutral');applyHomes();weightsUI();refreshAll();}
function becomeYours(){if(MODE==='yours')return;gtoast(fmt(L('nowYours'),{m:MODE==='neutral'?L('eqTake'):L('adTake')}),true);if(MODE==='neutral'){MODE='yours';syncMode();return;}MODE='yours';LANGMODE='both';PERMMODE='usmx';FIELD='tech';CLIMMODE='mild';POLMODE='d';syncMode();}
function syncMode(){
  $('mAdriano').setAttribute('aria-pressed',MODE==='adriano');$('mYours').setAttribute('aria-pressed',MODE==='yours');$('mEqual').setAttribute('aria-pressed',MODE==='neutral');
  $('modeNote').textContent=MODE==='adriano'?L('modeAd'):MODE==='neutral'?L('modeEq'):L('modeYou');
  const vsOpt=$('colorBy').querySelector('option[value="vs"]');if(vsOpt)vsOpt.hidden=MODE!=='yours';
  if(MODE!=='yours'&&ui.colorBy==='vs'){ui.colorBy='tier';$('colorBy').value='tier';}
}
let _rq=0,_fast=true;function refreshSoon(fast){_fast=_fast&&!!fast;if(_rq)return;_rq=requestAnimationFrame(()=>{_rq=0;const f=_fast;_fast=true;refreshAll(f);if(!f)saveTake();});}
function refreshAll(fast){recompute(fast);syncMode();paint();list();detail(ui.sel);renderCmp();renderVs();renderEff();renderOffers();renderLive();if(!fast)trackState();}
// how much each factor actually moves the scores: its share of the variance of scores across places (covariance of its points with the total)
function renderEff(){const el=$('effw');if(!el)return;const pool=ents.filter(e=>listable(e)&&e.type===ui.rankType&&e.part);if(pool.length<3){el.innerHTML='';return;}
  const s=pool.map(e=>e.score),ms=d3.mean(s),vs=d3.variance(s)||1,tot=FACTORS.reduce((a,f)=>a+(W[f.k]>0?W[f.k]:0),0)||1;
  const rows=FACTORS.filter(f=>W[f.k]>0).map(f=>{const p=pool.map(e=>e.part[f.k]||0),mp=d3.mean(p);let c=0;p.forEach((x,i)=>{c+=(x-mp)*(s[i]-ms);});c/=(pool.length-1);return {k:f.k,w:W[f.k]/tot,eff:c/vs};}).sort((a,b)=>b.eff-a.eff);
  el.innerHTML=`<span class="lab">${L('effTitle')}</span><p class="meta">${fmt(L('effNote'),{t:L(ui.rankType==='city'?'cities':'countries').toLowerCase()})}</p><div class="biastable"><table style="min-width:0"><thead><tr><th>${L('calcFactor')}</th><th>${L('effSlider')}</th><th>${L('effReal')}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${FL(r.k)}</td><td class="mono">${pct(r.w)}</td><td class="mono">${Math.round(r.eff*100)}%</td></tr>`).join('')}</tbody></table></div>`;}
// Tamkivi: compare job offers on money left after tax and rent (take-home pay entered after tax), commute, and what differs most
function offersUI(){const el=$('offerRows');if(!el)return;const opts=ents.filter(e=>e.type==='city'&&MONEYD[e.name]).sort((a,b)=>dn(a).localeCompare(dn(b),LANG));
  const prev=[0,1,2].map(i=>[$('of'+i)?.value||'',$('op'+i)?.value||'']);
  el.innerHTML=[0,1,2].map(i=>`<div class="toggles"><select id="of${i}" aria-label="${L('offerCity')} ${i+1}"><option value="">${L('offerCity')} ${i+1}</option>${opts.map(e=>`<option value="${e.key}">${dn(e)}</option>`).join('')}</select><label class="meta" style="display:flex;gap:6px;align-items:center">${L('offerPay')} <input type="number" id="op${i}" min="0" step="50" inputmode="numeric" style="width:110px;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--fg)"></label></div>`).join('');
  [0,1,2].forEach(i=>{$('of'+i).value=prev[i][0];$('op'+i).value=prev[i][1];$('of'+i).onchange=renderOffers;$('op'+i).oninput=renderOffers;});renderOffers();}
function renderOffers(){const out=$('offerOut');if(!out||!$('of0'))return;const rows=[0,1,2].map(i=>({e:byKey[$('of'+i).value],p:parseFloat($('op'+i).value)})).filter(r=>r.e&&r.p>0);
  if(!rows.length){out.innerHTML=`<p class="meta">${L('offerEmpty')}</p>`;return;}
  const ks=FACTORS.filter(f=>W[f.k]>0&&f.k!=='pay'&&f.k!=='commute').map(f=>{const v=rows.map(r=>r.e.v[f.k]).filter(x=>x!=null);return {k:f.k,sp:v.length>1?Math.max(...v)-Math.min(...v):0};}).filter(x=>x.sp>0).sort((a,b)=>b.sp*W[b.k]-a.sp*W[a.k]).slice(0,3).map(x=>x.k);
  const money=n=>(n<0?'−':'')+'$'+Math.abs(Math.round(n)).toLocaleString('en-US'),v5=v=>v!=null?(Math.round(v*10)/10)+'/5':'—';
  out.innerHTML=`<div class="biastable"><table><thead><tr><th>${L('offerCity')}</th><th>${L('offerPay')}</th><th>${L('offerRent')}</th><th>${L('offerLeft')}</th><th>${L('offerNY')}</th><th>${FL('commute')}</th>${ks.map(k=>`<th>${FL(k)}</th>`).join('')}<th>${L('offerVerdict')}</th></tr></thead><tbody>${rows.map(({e,p})=>{const m=MONEYD[e.name],left=p-m[1];return `<tr><td>${dn(e)}</td><td class="mono">${money(p)}</td><td class="mono">${m[3]==='nidx'?'≈':''}${money(m[1])}</td><td class="mono">${money(left)}</td><td class="mono"><b>${money(left/(m[2]/100))}</b></td><td class="mono">${v5(e.v.commute)}</td>${ks.map(k=>`<td class="mono">${v5(e.v[k])}</td>`).join('')}<td>${L('tiers')[e.tier]}</td></tr>`;}).join('')}</tbody></table></div><p class="meta">${L('offerNote')}</p>`;}
function showMap(){$('mapSec').scrollIntoView({block:'start'});}
function tierFilters(){
  $('tierFilters').innerHTML=TIERS.map(t=>`<button class="chipbtn" data-t="${t}" aria-pressed="${ui.tiers.has(t)}"><span class="sw" style="background:${TIERCOL[t]}"></span>${L('tiers')[t]}</button>`).join('');
  $('tierFilters').querySelectorAll('button').forEach(b=>b.onclick=()=>{const t=b.dataset.t;ui.tiers.has(t)?ui.tiers.delete(t):ui.tiers.add(t);b.setAttribute('aria-pressed',ui.tiers.has(t));filtersChanged();});
}
function mustUI(){
  $('mustMenu').innerHTML=FACTORS.map(f=>`<label class="minrow"><span>${FL(f.k)}</span><select data-k="${f.k}"><option value="">${L('anyMin')}</option>${[2,3,4,5].map(n=>`<option value="${n}" ${ui.mins[f.k]===n?'selected':''}>${n}+</option>`).join('')}</select></label>`).join('');
  $('mustMenu').querySelectorAll('select').forEach(c=>c.onchange=()=>{const v=+c.value;if(v)ui.mins[c.dataset.k]=v;else delete ui.mins[c.dataset.k];filtersChanged();});
}
function filtersChanged(){ui.showAll=false;paint();list();}
function selectsUI(){
  const co=$('colorBy');co.innerHTML=Object.entries(L('colorOpts')).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')+FACTORS.map(f=>`<option value="f:${f.k}">${FL(f.k)}</option>`).join('');
  if(![...co.options].some(o=>o.value===ui.colorBy))ui.colorBy='tier';co.value=ui.colorBy;
  $('styleSel').innerHTML=Object.entries(L('styles')).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');$('styleSel').value=ui.style;
  $('projSel').innerHTML=Object.entries(L('projs')).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');$('projSel').value=ui.proj;
  $('regions').innerHTML=Object.entries(L('regions')).map(([k,v])=>`<button class="chipbtn" data-r="${k}" aria-pressed="${ui.region===k}">${v}</button>`).join('');
  document.querySelectorAll('#regions button').forEach(b=>b.onclick=()=>regionView(b.dataset.r,true));
  $('search').placeholder=L('findPh');
  $('names').innerHTML=orderedPlaces(false).flatMap(([g,arr])=>arr).map(e=>`<option value="${dn(e)}">`).join('');
}
function impSection(){
  const M=DATA.meta||{},ac=M.acc_country||{},ai=M.acc_city||{},ks=[...new Set([...Object.keys(ac),...Object.keys(ai)])].filter(k=>k!=='cost');
  const cell=o=>o&&isFinite(o.mae)?`${Math.max(o.mae,o.mae_gaps||0).toFixed(2)} <span class="muted">(n=${o.n})</span>`:'—';
  const skip=(M.skip||[]).map(k=>FL(k).toLowerCase()).join(', ')||'—';
  const mar=M.mar||{},marRows=Object.entries(mar).filter(([k])=>k!=='cost').sort((a,b)=>b[1].auc-a[1].auc).map(([k,o])=>`<tr><td>${FL(k)}</td><td class="mono">${o.missing}</td><td class="mono">${o.gdp_gap>0?'+':''}${o.gdp_gap}</td><td class="mono">${o.pop_gap>0?'+':''}${o.pop_gap}</td><td class="mono">${o.auc}</td></tr>`).join('');
  return `<h3 style="color:var(--fg)">${L('impTitle')}</h3><p>${fmt(L('impBody'),{c:Math.round((M.country_filled||0)*100),y:Math.round((M.city_filled||0)*100),skip})}</p>
  <p>${L('marTitle')}</p><div class="biastable"><table><thead><tr><th>${L('impFactor')}</th><th>${L('marMiss')}</th><th>${L('marGdp')}</th><th>${L('marPop')}</th><th>AUC</th></tr></thead><tbody>${marRows}</tbody></table></div>
  <div class="biastable"><table><thead><tr><th>${L('impFactor')}</th><th>${L('impCountries')}</th><th>${L('impCities')}</th></tr></thead><tbody>${ks.map(k=>`<tr><td>${FL(k)}</td><td>${cell(ac[k])}</td><td>${cell(ai[k])}</td></tr>`).join('')}</tbody></table></div><p>${L('impNote')}</p>`;
}
function applyLang(){
  document.documentElement.lang=LANG;document.title=STR[LANG].brand.replace(/^¿/,'¿');
  $('lEn').setAttribute('aria-pressed',LANG==='en');$('lEs').setAttribute('aria-pressed',LANG==='es');
  document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=L(el.dataset.t);});
  document.querySelectorAll('[data-th]').forEach(el=>{el.innerHTML=L(el.dataset.th);});
  $('prio').innerHTML=L('prio').map((p,i)=>`<span><b>${i+1}</b>${p}</span>`).join('');
  $('howInner').innerHTML=HOW[LANG]+impSection()+`<p class="stamp" style="color:var(--muted);font-size:12px">${LANG==='es'?'Datos actualizados':'Data updated'} ${DATA.built} · ${DATA.cities.length} ${LANG==='es'?'ciudades':'cities'}</p>`+(FEEDBACK_URL?`<p><a href="${FEEDBACK_URL}" target="_blank" rel="noopener">${L('feedback')}</a></p>`:'');
  selectsUI();weightsUI();tierFilters();mustUI();syncMode();offersUI();renderDefaults();
  if(!$('quizPanel').hidden)renderQuiz();
  $('zin').innerHTML=IC('plus',16);$('zout').innerHTML=IC('minus',16);$('zreset').innerHTML=IC('reset',16);animLabel(!!animT);
  paint();list();detail(ui.sel);renderCmp();renderVs();
  if(zoom)$('maphint').textContent=touch?L('hintTouch'):L('hintMouse');
}

