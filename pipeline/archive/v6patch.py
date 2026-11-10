import sys
S = sys.argv[1]
t = open(f'{S}/v5.html', encoding='utf8').read()
def rep(o, n):
    global t
    assert o in t, 'MISSING: ' + o[:100]
    t = t.replace(o, n, 1)

# ---------- factors ----------
rep("const FACTORS=[{k:'move',i:5},", "const FACTORS=[{k:'commute',i:15},{k:'move',i:5},")
rep("en:{move:['Walkable and efficient','Car-dependent or inefficient'],hlth:['Healthcare and balance','Healthcare tied to your job, or poor balance'],",
    "en:{commute:['Short commutes','Long commutes'],move:['Walkable without a car','Car-dependent'],hlth:['Healthcare access','Weaker healthcare access'],")
rep("open:['Easy to make friends','Hard to make friends'],pay:['Money left after rent','Little left after rent'],",
    "open:['Welcoming to newcomers','Less welcoming to newcomers'],pay:['Purchasing power','Low purchasing power'],")
rep("es:{move:['Caminable y eficiente','Depende del auto o es ineficiente'],hlth:['Salud y equilibrio','Salud ligada al trabajo o poco equilibrio'],",
    "es:{commute:['Trayectos cortos','Trayectos largos'],move:['Caminable sin auto','Depende del auto'],hlth:['Acceso a la salud','Menor acceso a la salud'],")
rep("open:['Fácil hacer amigos','Difícil hacer amigos'],pay:['Dinero tras pagar renta','Queda poco tras la renta'],",
    "open:['Acogedor con recién llegados','Menos acogedor con recién llegados'],pay:['Poder adquisitivo','Poco poder adquisitivo'],")
rep(" mine:{move:2.5,", " mine:{commute:2,move:2.5,")
rep(" career:{move:1.5,", " career:{commute:1,move:1.5,")
rep(" balance:{move:1.5,", " balance:{commute:1.5,move:1.5,")
rep("const CALC=new Set(['day','fam']),RULES=new Set(['perm']);", "const CALC=new Set(['day','fam']),RULES=new Set(['perm','lang']);\nconst FEEDBACK_URL='';\nlet useEst=false,TRIPS={};")
rep("sc:factorsOf('222322220222024')", "sc:factorsOf('2223222202220240')")

# ---------- data-backed check and evaluation ----------
rep("function evaluate(e){", """function backed(e,k){
  if(CALC.has(k)||RULES.has(k))return true;
  if(k==='clim'&&CLIMMODE!=='mild')return !!e.hasGeo;
  if(k==='pay'&&FIELD==='remote')return e.src.has('cost');
  return e.src.has(k);
}
const counts=(e,k)=>useEst||backed(e,k);
function evaluate(e){""")
rep("  FACTORS.forEach(f=>{const v=sc[f.k];if(v==null||W[f.k]<=0)return;tot+=W[f.k]*(nv(f.k,v)-1)/4;sw+=W[f.k];});",
    "  FACTORS.forEach(f=>{const v=sc[f.k];if(v==null||W[f.k]<=0||!counts(e,f.k))return;tot+=W[f.k]*(nv(f.k,v)-1)/4;sw+=W[f.k];});")
rep("  else{let worst=-1;FACTORS.forEach(f=>{const v=sc[f.k];if(v==null||W[f.k]<=0||v>2)return;",
    "  else{let worst=-1;FACTORS.forEach(f=>{const v=sc[f.k];if(v==null||W[f.k]<=0||v>2||!counts(e,f.k))return;")
rep("const known=FACTORS.filter(f=>sc[f.k]!=null);const backed=known.filter(f=>CALC.has(f.k)||RULES.has(f.k)||e.src.has(f.k)).length;\n  return {score,tier,lim,gated,conf:known.length?backed/known.length:0,known:known.length,backed};",
    "const known=FACTORS.filter(f=>sc[f.k]!=null);const nb=known.filter(f=>backed(e,f.k)).length;\n  return {score,tier,lim,gated,conf:known.length?nb/known.length:0,known:known.length,backed:nb};")
# stats only from data-backed values when estimates are off
rep("function computeStats(){STATS={};FACTORS.forEach(f=>{const v=ents.filter(e=>listable(e)&&e.sc[f.k]!=null).map(e=>e.sc[f.k]);",
    "function computeStats(){STATS={};FACTORS.forEach(f=>{const v=ents.filter(e=>listable(e)&&e.sc[f.k]!=null&&counts(e,f.k)).map(e=>e.sc[f.k]);")

# ---------- travel time overrides ----------
rep("function tripH(a,h){const d=km([a.lat0,a.lon0],[h.lat0,h.lon0]);return d/830+0.75+(SMALL_AIRPORT.has(h.key)&&d>1500?2.5:0);}",
    "function tripH(a,h){const o=TRIPS[a.key+'|'+h.key];if(o>0)return o;const d=km([a.lat0,a.lon0],[h.lat0,h.lon0]);return d/830+0.75+(SMALL_AIRPORT.has(h.key)&&d>1500?2.5:0);}")
rep("const save={W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar};", "const save={W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,useEst};")
rep("FIELD='tech';CLIMMODE='mild';gate=gateOpen=norm=gateFar=true;\n  applyHomes();recompute();ents.forEach", "FIELD='tech';CLIMMODE='mild';gate=gateOpen=norm=gateFar=true;useEst=false;\n  applyHomes();recompute();ents.forEach")
rep("({W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar}=save);", "({W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,useEst}=save);")
rep("g:gate?1:0,o:gateOpen?1:0,f:gateFar?1:0,n:norm?1:0,a:ANS};", "g:gate?1:0,o:gateOpen?1:0,f:gateFar?1:0,n:norm?1:0,e:useEst?1:0,tr:TRIPS,a:ANS};")
rep("gateOpen=o.o!==0;gateFar=o.f!==0;norm=o.n!==0;", "gateOpen=o.o!==0;gateFar=o.f!==0;norm=o.n!==0;useEst=o.e===1;TRIPS=o.tr||{};")
rep("gate=gateOpen=norm=gateFar=true;applyHomes();weightsUI();refreshAll();showMap();};", "gate=gateOpen=norm=gateFar=true;useEst=false;applyHomes();weightsUI();refreshAll();showMap();};")

# ---------- quiz: commute weight and "not sure" ----------
rep(" {id:'move',w:[{move:0.75},{move:1.5},{move:2.5}]},", " {id:'move',w:[{move:0.75,commute:1},{move:1.5,commute:1.5},{move:2.5,commute:2}]},")
rep("function weightsFromQuiz(a){const w={...PRESETS.equal,happy:1,women:0,lgbt:0};QUIZ.forEach(q=>{if(a[q.id]!=null)Object.assign(w,q.w[a[q.id]]);});return w;}",
    "function weightsFromQuiz(a){const w={...PRESETS.equal,happy:1,women:0.75,lgbt:0.75};QUIZ.forEach(q=>{if(typeof a[q.id]==='number')Object.assign(w,q.w[a[q.id]]);});return w;}")
rep("QUIZ.forEach(q=>{if(q.mk&&a[q.id]!=null)o[q.mk]=q.m[a[q.id]];});return o;}", "QUIZ.forEach(q=>{if(q.mk&&typeof a[q.id]==='number')o[q.mk]=q.m[a[q.id]];});return o;}")
rep("<div class=\"qnav\"><button id=\"qBack\" ${QSTEP===0?'hidden':''}>${L('back')}</button>${QSTEP<QUIZ.length?(ANS[QUIZ[QSTEP].id]!=null?`<button id=\"qNext\">${L('next')}</button>`:'<span></span>'):",
    "<div class=\"qnav\"><button id=\"qBack\" ${QSTEP===0?'hidden':''}>${L('back')}</button>${QSTEP<QUIZ.length?`<span class=\"toggles\"><button class=\"ghost\" id=\"qUnsure\">${L('unsure')}</button>${typeof ANS[QUIZ[QSTEP].id]==='number'?`<button id=\"qNext\">${L('next')}</button>`:''}</span>`:")
rep("  if($('qNext'))$('qNext').onclick=()=>{QSTEP++;renderQuiz();};", "  if($('qNext'))$('qNext').onclick=()=>{QSTEP++;renderQuiz();};\n  if($('qUnsure'))$('qUnsure').onclick=()=>{ANS[QUIZ[QSTEP].id]='skip';QSTEP++;renderQuiz();};")

# ---------- explanation sentence ----------
rep("function srcTag(e,k){", """function whyLine(e){
  const ks=FACTORS.filter(f=>e.sc[f.k]!=null&&e.sc[f.k]>=4&&W[f.k]>0&&counts(e,f.k)).sort((a,b)=>W[b.k]-W[a.k]||e.sc[b.k]-e.sc[a.k]).slice(0,3).map(f=>FL(f.k).toLowerCase());
  const join=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+(LANG==='es'?' y ':', and ')+a[a.length-1];
  const good=ks.length?fmt(L('whyGood'),{x:join(ks)}):L('whyNone');
  const bad=e.lim!=='none'?' '+fmt(L('whyBad'),{x:FD(e.lim).toLowerCase()}):'';
  return good+bad;
}
function srcTag(e,k){""")
rep("function srcTag(e,k){if(CALC.has(k))return `<span class=\"tag\">${L('tagCalc')}</span>`;if(RULES.has(k)||e.src.has(k))return `<span class=\"tag\">${L('tagData')}</span>`;return '';}",
    "function srcTag(e,k){if(CALC.has(k)||(k==='clim'&&CLIMMODE!=='mild'))return `<span class=\"tag\">${L('tagCalc')}</span>`;if(backed(e,k))return `<span class=\"tag\">${L('tagData')}</span>`;return `<span class=\"tag\" style=\"color:var(--muted)\">${L('tagEst')}</span>`;}")
rep("<p style=\"font-weight:500\">${drag}${e.gated?L('dealRule'):''}</p><p class=\"meta\">${noteOf(e)||''}</p>",
    "<p style=\"font-weight:500\">${whyLine(e)}${e.gated?L('dealRule'):''}</p><p class=\"meta\">${noteOf(e)||''}</p>${e.natl?`<p class=\"meta\">${L('natlNote')}</p>`:''}")
# bars: dim estimates that are not counted
rep("    return `<div class=\"brow${v<=2?' weak':''}\"><span class=\"lbl\">${FL(f.k)}${srcTag(e,f.k)}</span><span class=\"track\"><span class=\"fill\" style=\"width:${v*20}%;background:${barCol(v)}\"></span></span><span class=\"v\">${v}/5</span></div>`;}).join('')}</div>",
    "    const off=!counts(e,f.k);return `<div class=\"brow${v<=2&&!off?' weak':''}\" style=\"${off?'opacity:.45':''}\"><span class=\"lbl\">${FL(f.k)}${srcTag(e,f.k)}</span><span class=\"track\"><span class=\"fill\" style=\"width:${v*20}%;background:${barCol(v)}\"></span></span><span class=\"v\">${off?L('notCounted'):v+'/5'}</span></div>`;}).join('')}</div>\n  ${HOMES.length&&e.hasGeo?`<div class=\"field\"><span class=\"lab\">${L('tripTitle')}</span><div class=\"toggles\">${HOMES.map((h,i)=>`<label class=\"meta\" style=\"display:flex;gap:6px;align-items:center\">${dn(h)} <input type=\"number\" min=\"0\" max=\"60\" step=\"0.5\" data-h=\"${h.key}\" value=\"${TRIPS[e.key+'|'+h.key]||''}\" placeholder=\"${Math.round(e.flights[i])}\" style=\"width:70px;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--fg)\"> h</label>`).join('')}</div><p class=\"meta\">${L('tripNote')}</p></div>`:''}")
rep("  $('cmpBtn').onclick=()=>toggleCmp(e);\n}", """  $('cmpBtn').onclick=()=>toggleCmp(e);
  D.querySelectorAll('input[data-h]').forEach(inp=>inp.onchange=()=>{const k=e.key+'|'+inp.dataset.h,v=parseFloat(inp.value);if(v>0)TRIPS[k]=v;else delete TRIPS[k];becomeYours();applyHomes();refreshAll();saveTake();});
}""")
rep("P.innerHTML=`<span class=\"nm\">${dn(e)}</span>${chip(e.tier)}${vs}<div class=\"acts\">",
    "P.innerHTML=`<span class=\"nm\">${dn(e)}</span>${chip(e.tier)}${vs}<span class=\"meta\" style=\"flex-basis:100%\">${whyLine(e)}</span><div class=\"acts\">")

# ---------- estimates toggle and feedback link ----------
rep('<label class="check"><input type="checkbox" id="norm" checked><span data-t="normLabel"></span></label>',
    '<label class="check"><input type="checkbox" id="useEst"><span data-t="estLabel"></span></label>\n      <label class="check"><input type="checkbox" id="norm" checked><span data-t="normLabel"></span></label>')
rep("$('norm').checked=norm;$('gate').checked=gate;", "$('useEst').checked=useEst;$('norm').checked=norm;$('gate').checked=gate;")
rep("$('norm').onchange=e=>{becomeYours();norm=e.target.checked;refreshAll();saveTake();};", "$('norm').onchange=e=>{becomeYours();norm=e.target.checked;refreshAll();saveTake();};\n$('useEst').onchange=e=>{becomeYours();useEst=e.target.checked;refreshAll();saveTake();};")
rep("  $('howInner').innerHTML=HOW[LANG];", "  $('howInner').innerHTML=HOW[LANG]+(FEEDBACK_URL?`<p><a href=\"${FEEDBACK_URL}\" target=\"_blank\" rel=\"noopener\">${L('feedback')}</a></p>`:'');")

# ---------- strings ----------
rep(" grpSuggested:'Suggested',", " unsure:'Not sure, skip',estLabel:'Also count estimated factors (walkability without a car, things happening, jobs by field). They have no published data, so they\\u2019re off by default.',whyGood:'Strong for you on {x}.',whyNone:'No standout strengths for your priorities.',whyBad:'Weakest: {x}.',tagEst:'estimate',notCounted:'not counted',natlNote:'No city-level data was published for this place, so national figures are used.',tripTitle:'Your real door-to-door trip time',tripNote:'The placeholder is a rough estimate. Type your real trip time to replace it.',feedback:'Suggest a city or a correction',grpSuggested:'Suggested',")
rep(" grpSuggested:'Sugeridos',", " unsure:'No estoy seguro, saltar',estLabel:'Contar también los factores estimados (caminable sin auto, que pasen cosas, empleos por campo). No tienen datos publicados, así que están apagados por defecto.',whyGood:'Destaca para ti en {x}.',whyNone:'Sin fortalezas destacadas para tus prioridades.',whyBad:'Lo más débil: {x}.',tagEst:'estimado',notCounted:'no cuenta',natlNote:'No hay datos publicados a nivel de ciudad para este lugar, así que se usan cifras nacionales.',tripTitle:'Tu tiempo real de viaje puerta a puerta',tripNote:'El valor de ejemplo es una estimación. Escribe tu tiempo real para reemplazarlo.',feedback:'Sugiere una ciudad o una corrección',grpSuggested:'Sugeridos',")
rep("backed:'{b} of {k} scored factors come from data or a calculation; the rest are informed estimates.',",
    "backed:'{b} of {k} factors here come from published data, official rules or a calculation.',")
rep("backed:'{b} de {k} factores calificados vienen de datos o de un cálculo; el resto son estimaciones informadas.',",
    "backed:'{b} de {k} factores aquí vienen de datos publicados, reglas oficiales o un cálculo.',")
rep("colorOpts:{tier:'Overall verdict',score:'Overall score',limit:'Main drawback',conf:'How much is data-backed',vs:'You vs Adriano'},",
    "colorOpts:{tier:'Overall verdict',score:'Overall score',limit:'Main drawback',conf:'Share of published data',vs:'You vs Adriano'},")

# ---------- entities: mark cities that fall back to national data ----------
rep("DATA.cities.map(([name,lat,lon,iso,s,note,src,noteEs,nameEs,fields])=>({type:'city',key:'city:'+name,name,nameEs,fields,",
    "DATA.cities.map(([name,lat,lon,iso,s,note,src,noteEs,nameEs,fields,lvl])=>({type:'city',key:'city:'+name,name,nameEs,fields,natl:lvl==='country',")

# ---------- methods text ----------
a = t.index("const SRC={"); b = t.index("let LANG=store.get")
t = t[:a] + open(f'{S}/how_v6.js', encoding='utf8').read() + "\n" + t[b:]
t = t.replace('sixteen', 'seventeen').replace('dieciséis', 'diecisiete')
open(f'{S}/v6.html', 'w', encoding='utf8').write(t)
print('ok')
