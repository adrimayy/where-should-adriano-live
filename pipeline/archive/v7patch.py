import sys
S = sys.argv[1]
t = open(f'{S}/v6.html', encoding='utf8').read()
def rep(o, n):
    global t
    assert o in t, 'MISSING: ' + o[:100]
    t = t.replace(o, n, 1)

# ---------- entities carry imputed values ----------
rep("Object.entries(DATA.countries).forEach(([id,[name,s,note,src,noteEs,a2]])=>{const e={type:'country',id:+id,key:'country:'+(+id),name,a2,",
    "Object.entries(DATA.countries).forEach(([id,[name,s,note,src,noteEs,a2,imp]])=>{const e={type:'country',id:+id,key:'country:'+(+id),name,a2,imp:imp||{},")
rep("Object.entries(DATA.byName).forEach(([k,[name,s,note,src,noteEs,a2]])=>{const e={type:'country',id:k,key:'country:'+k,name,a2,",
    "Object.entries(DATA.byName).forEach(([k,[name,s,note,src,noteEs,a2,imp]])=>{const e={type:'country',id:k,key:'country:'+k,name,a2,imp:imp||{},")
rep("DATA.cities.map(([name,lat,lon,iso,s,note,src,noteEs,nameEs,fields,lvl])=>({type:'city',key:'city:'+name,name,nameEs,fields,natl:lvl==='country',",
    "DATA.cities.map(([name,lat,lon,iso,s,note,src,noteEs,nameEs,fields,lvl,imp])=>({type:'city',key:'city:'+name,name,nameEs,fields,imp:imp||{},natl:lvl==='country',")
rep("let useEst=false,TRIPS={};", "let useEst=false,useImp=true,TRIPS={};\nconst IMPUTABLE=new Set(['clim','hlth','free','safe','move','pay','open','happy','women','lgbt','commute']);")

# ---------- resolve each factor to observed, filled-in, or estimated ----------
rep("function evaluate(e){", """function resolve(e){
  e.v={};e.sd={};e.how={};
  FACTORS.forEach(f=>{const k=f.k,raw=e.sc[k];
    if(raw!=null&&backed(e,k)){e.v[k]=raw;e.sd[k]=0;e.how[k]='obs';return;}
    const ik=(k==='pay'&&FIELD==='remote')?'cost':k,im=e.imp&&e.imp[ik];
    if(useImp&&im&&IMPUTABLE.has(k)&&!(k==='clim'&&CLIMMODE!=='mild')){e.v[k]=im[0];e.sd[k]=im[1]||1;e.how[k]='imp';return;}
    if(useEst&&raw!=null){e.v[k]=raw;e.sd[k]=1;e.how[k]='est';return;}
    e.v[k]=null;e.how[k]='none';});
}
function evaluate(e){""")
rep("  const sc=e.sc;let tot=0,sw=0;\n  FACTORS.forEach(f=>{const v=sc[f.k];if(v==null||W[f.k]<=0||!counts(e,f.k))return;tot+=W[f.k]*(nv(f.k,v)-1)/4;sw+=W[f.k];});",
    "  const sc=e.sc,V=e.v;let tot=0,sw=0,swImp=0;\n  FACTORS.forEach(f=>{const v=V[f.k];if(v==null||W[f.k]<=0)return;tot+=W[f.k]*(nv(f.k,v)-1)/4;sw+=W[f.k];if(e.how[f.k]!=='obs')swImp+=W[f.k];});")
rep("  if(den&&sw/den<0.75)tier='nodata';", "  if(!useImp&&den&&sw/den<0.75)tier='nodata';")
rep("  if(gate&&((sc.free!=null&&sc.free<=2&&counts(e,'free'))||war)){", "  if(gate&&((e.how.free==='obs'&&sc.free<=2)||war)){")
rep("  else if(gateOpen&&sc.open===1&&counts(e,'open')&&", "  else if(gateOpen&&e.how.open==='obs'&&sc.open===1&&")
rep("  else{let worst=-1;FACTORS.forEach(f=>{const v=sc[f.k];if(v==null||W[f.k]<=0||v>2||!counts(e,f.k))return;",
    "  else{let worst=-1;FACTORS.forEach(f=>{const v=V[f.k];if(v==null||W[f.k]<=0||v>2.5)return;")
rep("  return {score,tier,lim,gated,conf:known.length?nb/known.length:0,known:known.length,backed:nb};",
    "  return {score,tier,lim,gated,conf:known.length?nb/known.length:0,known:known.length,backed:nb,impShare:sw?swImp/sw:0};")
rep("function computeStats(){STATS={};FACTORS.forEach(f=>{const v=ents.filter(e=>listable(e)&&e.sc[f.k]!=null&&counts(e,f.k)).map(e=>e.sc[f.k]);",
    "function computeStats(){STATS={};FACTORS.forEach(f=>{const v=ents.filter(e=>listable(e)&&e.v&&e.v[f.k]!=null).map(e=>e.v[f.k]);")

# ---------- Monte Carlo over the measured error of filled-in values ----------
rep("function recompute(){applyPersonal();computeStats();ents.forEach(e=>Object.assign(e,evaluate(e)));}",
"""function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function simulate(){
  const R=120,rand=mulberry32(20261109),gauss=()=>{const u=1-rand(),v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
  const list=ents.filter(listable),D=list.map(()=>new Float32Array(R));
  for(let r=0;r<R;r++){list.forEach((e,i)=>{let tot=0,sw=0;for(const f of FACTORS){const k=f.k,v=e.v[k],w=W[k];if(v==null||w<=0)continue;let x=v;const sd=e.sd[k];if(sd>0)x=Math.max(1,Math.min(5,v+sd*gauss()));tot+=w*(nv(k,x)-1)/4;sw+=w;}D[i][r]=sw?tot/sw*100:0;});}
  const q=(a,p)=>a[Math.min(a.length-1,Math.max(0,Math.round(p*(a.length-1))))];
  list.forEach((e,i)=>{const s=Array.from(D[i]).sort((a,b)=>a-b);e.lo=Math.round(q(s,0.1));e.hi=Math.round(q(s,0.9));e.rk=[];});
  ['city','country'].forEach(tp=>{const idx=list.map((e,i)=>i).filter(i=>list[i].type===tp);
    for(let r=0;r<R;r++){idx.slice().sort((a,b)=>D[b][r]-D[a][r]).forEach((i,pos)=>list[i].rk.push(pos+1));}
    idx.forEach(i=>{const s=list[i].rk.sort((a,b)=>a-b);list[i].rlo=q(s,0.1);list[i].rhi=q(s,0.9);list[i].rn=idx.length;delete list[i].rk;});});
}
function recompute(){applyPersonal();ents.forEach(resolve);computeStats();ents.forEach(e=>Object.assign(e,evaluate(e)));simulate();}""")

# ---------- snapshot and saved takes ----------
rep("const save={W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,useEst};", "const save={W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,useEst,useImp};")
rep("gate=gateOpen=norm=gateFar=true;useEst=false;\n  applyHomes();recompute();ents.forEach(e=>{e.ad={score:e.score,tier:e.tier};});",
    "gate=gateOpen=norm=gateFar=true;useEst=false;useImp=true;\n  applyHomes();recompute();ents.forEach(e=>{e.ad={score:e.score,tier:e.tier,lo:e.lo,hi:e.hi};});")
rep("({W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,useEst}=save);", "({W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,useEst,useImp}=save);")
rep("e:useEst?1:0,tr:TRIPS,", "e:useEst?1:0,m:useImp?1:0,tr:TRIPS,")
rep("useEst=o.e===1;TRIPS=o.tr||{};", "useEst=o.e===1;useImp=o.m!==0;TRIPS=o.tr||{};")
rep("gate=gateOpen=norm=gateFar=true;useEst=false;applyHomes();weightsUI();refreshAll();showMap();};", "gate=gateOpen=norm=gateFar=true;useEst=false;useImp=true;applyHomes();weightsUI();refreshAll();showMap();};")

# ---------- display ----------
rep("function srcTag(e,k){", "function srcTag(e,k){if(e.how&&e.how[k]==='imp')return `<span class=\"tag\" style=\"color:var(--you)\">${L('tagImp')}</span>`;")
rep("  <div class=\"bars\">${FACTORS.map(f=>{const v=e.sc[f.k];if(v==null)return",
    "  <div class=\"bars\">${FACTORS.map(f=>{const how=e.how[f.k];if(how==='imp'){const m=e.v[f.k],sd=e.sd[f.k];return `<div class=\"brow\"><span class=\"lbl\">${FL(f.k)}${srcTag(e,f.k)}</span><span class=\"track\"><span class=\"fill\" style=\"width:${m*20}%;background:${barCol(Math.round(m))};opacity:.55\"></span></span><span class=\"v\">≈${m.toFixed(1)} ±${sd.toFixed(1)}</span></div>`;}const v=e.sc[f.k];if(v==null)return")
rep("    const off=!counts(e,f.k);", "    const off=how!=='obs'&&how!=='est';")
rep("<div class=\"big\">${e.score}<small>/100</small></div>`;",
    "<div class=\"big\">${e.score}<small>/100</small></div>`;\n  const rangeLine=`<p class=\"mono muted\">${fmt(L('rangeLine'),{lo:e.lo,hi:e.hi,rlo:e.rlo,rhi:e.rhi,n:e.rn})}${e.impShare>0.005?' · '+fmt(L('impShare'),{p:Math.round(e.impShare*100)}):''}</p>`;")
rep("  <p style=\"font-weight:500\">${whyLine(e)}${e.gated?L('dealRule'):''}</p>", "  ${rangeLine}<p style=\"font-weight:500\">${whyLine(e)}${e.gated?L('dealRule'):''}</p>")
rep("<span class=\"sc\">${e.score}<span class=\"track\">", "<span class=\"sc\"><span>${e.score}<span class=\"rng\">${e.lo}–${e.hi}</span></span><span class=\"track\">")
rep(".row .ad{", ".rng{display:block;font-size:10.5px;color:var(--muted);line-height:1.1}\n.row .ad{")
rep("const vs=MODE==='yours'?`<span class=\"sc2\">${L('youScore')} ${e.score} · ${L('adScore')} ${e.ad.score}</span>`:`<span class=\"sc2\">${e.score}/100</span>`;",
    "const vs=MODE==='yours'?`<span class=\"sc2\">${L('youScore')} ${e.score} (${e.lo}–${e.hi}) · ${L('adScore')} ${e.ad.score}</span>`:`<span class=\"sc2\">${e.score}/100 · ${e.lo}–${e.hi}</span>`;")

# ---------- toggle ----------
rep('<label class="check"><input type="checkbox" id="useEst"><span data-t="estLabel"></span></label>',
    '<label class="check"><input type="checkbox" id="useImp" checked><span data-t="impLabel"></span></label>\n      <label class="check"><input type="checkbox" id="useEst"><span data-t="estLabel"></span></label>')
rep("$('useEst').checked=useEst;", "$('useEst').checked=useEst;$('useImp').checked=useImp;")
rep("$('useEst').onchange=e=>{becomeYours();useEst=e.target.checked;refreshAll();saveTake();};",
    "$('useEst').onchange=e=>{becomeYours();useEst=e.target.checked;refreshAll();saveTake();};\n$('useImp').onchange=e=>{becomeYours();useImp=e.target.checked;refreshAll();saveTake();};")

# ---------- accuracy section in methods ----------
rep("  $('howInner').innerHTML=HOW[LANG]+", "  $('howInner').innerHTML=HOW[LANG]+impSection()+")
rep("function applyLang(){", """function impSection(){
  const M=DATA.meta||{},ac=M.acc_country||{},ai=M.acc_city||{},ks=[...new Set([...Object.keys(ac),...Object.keys(ai)])].filter(k=>k!=='cost');
  const cell=o=>o&&isFinite(o.mae)?`${o.mae.toFixed(2)} <span class="muted">(n=${o.n})</span>`:'—';
  return `<h3 style="color:var(--fg)">${L('impTitle')}</h3><p>${fmt(L('impBody'),{c:Math.round((M.country_filled||0)*100),y:Math.round((M.city_filled||0)*100)})}</p>
  <div class="biastable"><table><thead><tr><th>${L('impFactor')}</th><th>${L('impCountries')}</th><th>${L('impCities')}</th></tr></thead><tbody>${ks.map(k=>`<tr><td>${FL(k)}</td><td>${cell(ac[k])}</td><td>${cell(ai[k])}</td></tr>`).join('')}</tbody></table></div><p>${L('impNote')}</p>`;
}
function applyLang(){""")

# ---------- strings ----------
rep(" whyNoData:'Not enough published data", " tagImp:'filled in',rangeLine:'Likely {lo}–{hi} · rank {rlo}–{rhi} of {n}',impShare:'{p}% of this score uses filled-in values',impLabel:'Fill data gaps with tested estimates (recommended). Without this, places with less published data fall to the bottom.',impTitle:'Filling gaps, and how accurate it is',impBody:'Published data is missing for {c}% of country values and {y}% of city values, mostly for smaller and poorer places. Leaving those gaps out would push those places down, so they are filled in. Countries: each missing value is predicted from the same country\\u2019s other published figures (iterative regression, the method recommended by the OECD and European Commission handbook on composite indicators). Cities: a missing value is predicted from its country\\u2019s figure and the gap measured between cities and their countries where both are published. Every filled-in value carries its measured error, and each score is recalculated 120 times with those errors to give a likely range and rank range.',impFactor:'Factor',impCountries:'Countries: average error, points on the 1–5 scale',impCities:'Cities: average error, points on the 1–5 scale',impNote:'Errors were measured by hiding values that are known and predicting them (5-fold for countries, leave-one-out for cities). An error of 0.5 means a filled-in score is typically half a point off. Making friends has the weakest prediction because its survey covers few countries.',whyNoData:'Not enough published data")
rep(" whyNoData:'No hay suficientes datos", " tagImp:'estimado',rangeLine:'Probable {lo}–{hi} · puesto {rlo}–{rhi} de {n}',impShare:'el {p}% de este puntaje usa valores estimados',impLabel:'Llenar huecos de datos con estimaciones probadas (recomendado). Sin esto, los lugares con menos datos publicados caen al fondo.',impTitle:'Cómo se llenan los huecos y qué tan preciso es',impBody:'Faltan datos publicados para el {c}% de los valores por país y el {y}% de los valores por ciudad, sobre todo en lugares más pequeños y pobres. Dejar esos huecos fuera empujaría esos lugares hacia abajo, así que se estiman. Países: cada valor faltante se predice con las demás cifras publicadas del mismo país (regresión iterativa, el método que recomienda el manual de la OCDE y la Comisión Europea sobre indicadores compuestos). Ciudades: un valor faltante se predice con la cifra de su país y la diferencia medida entre ciudades y sus países donde ambas se publican. Cada valor estimado lleva su error medido, y cada puntaje se recalcula 120 veces con esos errores para dar un rango probable y un rango de puesto.',impFactor:'Factor',impCountries:'Países: error promedio, puntos en la escala 1–5',impCities:'Ciudades: error promedio, puntos en la escala 1–5',impNote:'Los errores se midieron ocultando valores conocidos y prediciéndolos (5 partes para países, uno por uno para ciudades). Un error de 0,5 significa que un valor estimado suele desviarse medio punto. Hacer amigos es lo que peor se predice porque su encuesta cubre pocos países.',whyNoData:'No hay suficientes datos")
rep("natlNote:'No city-level data was published for this place, so national figures are used.',",
    "natlNote:'No city-level data is published for this place, so its city figures are filled in from national data and the measured gap between cities and their countries. See the likely range above.',")
rep("natlNote:'No hay datos publicados a nivel de ciudad para este lugar, así que se usan cifras nacionales.',",
    "natlNote:'No hay datos publicados a nivel de ciudad para este lugar, así que sus cifras se estiman con datos nacionales y la diferencia medida entre ciudades y sus países. Mira el rango probable arriba.',")
rep("backed:'{b} of {k} factors here come from published data, official rules or a calculation.',", "backed:'{b} of {k} factors come from published data, official rules or a calculation; the rest are filled in or estimated, as marked.',")
rep("backed:'{b} de {k} factores aquí vienen de datos publicados, reglas oficiales o un cálculo.',", "backed:'{b} de {k} factores vienen de datos publicados, reglas oficiales o un cálculo; el resto se estima, como se indica.',")
open(f'{S}/v7.html', 'w', encoding='utf8').write(t)
print('ok')
