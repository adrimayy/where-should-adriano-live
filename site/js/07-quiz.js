/* ---------------- quiz ---------------- */
// Krosnick: one thing per question; scale questions all run low to high with the same three answers;
// options without a natural order (nominal) are shuffled, keeping "other / doesn't matter" answers last.
// Keeney: importance questions are swing questions: they name a real change from a worse place to a better one.
const SW=[0.5,1.5,2.5];
const QUIZ=[
 {id:'field',nominal:1,fixed:1,w:[{},{},{},{},{},{},{jobs:0}],mk:'field',m:['tech','finance','health','creative','academia','general','remote']},
 {id:'reach',nominal:0,w:[{},{}],mk:'reach',m:['yes','no']},
 {id:'horizon',w:[{},{},{}],mult:{jobs:[0.8,1,1.3]}},
 {id:'jobs',w:SW.map(x=>({jobs:x}))},
 {id:'pay',w:SW.map(x=>({pay:x}))},
 {id:'home',w:SW.map(x=>({home:x}))},
 {id:'move',w:[{move:0.75},{move:1.5},{move:2.5}]},
 {id:'commute',w:SW.map(x=>({commute:x}))},
 {id:'hlth',w:[{hlth:0.75},{hlth:1.75},{hlth:3}]},
 {id:'clim',nominal:1,fixed:1,w:[{clim:1.5,day:1},{clim:1.5,day:0.75},{clim:1.25,day:0.5},{clim:0.75,day:2},{clim:0.25,day:0.25}],mk:'clim',m:['mild','warm','cool','mild','mild']},
 {id:'open',w:SW.map(x=>({open:x}))},
 {id:'cult',w:SW.map(x=>({cult:x}))},
 {id:'fam',w:[{fam:0.25},{fam:1},{fam:2}]},
 {id:'safe',w:SW.map(x=>({safe:x}))},
 {id:'free',w:SW.map(x=>({free:x}))},
 {id:'women',w:[{women:0},{women:0.75},{women:1.5},{women:2.5}]},
 {id:'lgbt',w:[{lgbt:0},{lgbt:0.75},{lgbt:1.5},{lgbt:2.5}]},
 {id:'pol',nominal:1,fixed:1,w:[{pol:1.5},{pol:1.5},{pol:0}],mk:'pol',m:['d','r','d']},
 {id:'lang',nominal:1,fixed:1,w:[{lang:0.75},{lang:1.25},{lang:1.5},{lang:1.5},{lang:1.25},{lang:0.25}],mk:'lang',m:['both','en','enok','es','esen','both']},
 {id:'perm',nominal:1,fixed:1,w:[{perm:1},{perm:1},{perm:1},{perm:1},{perm:0}],mk:'perm',m:['usmx','us','mx','eu','usmx']}];
// Levels: a 5-question version is the default; the full quiz is one tap away
const SIMPLE=['field','clim','move','jobs','perm'];
let QLIST=QUIZ.filter(q=>SIMPLE.includes(q.id)),ORDER={};
let ANS={},QSTEP=0,HOMEKEYS=[];
const qText=id=>QSTR[LANG][id];
const QBASE={...PRESETS.equal,pol:0,happy:1,women:0.75,lgbt:0.75};
function weightsFromQuiz(a){const w={...QBASE};QUIZ.forEach(q=>{if(typeof a[q.id]==='number'&&q.w[a[q.id]])Object.assign(w,q.w[a[q.id]]);});
  QUIZ.forEach(q=>{if(q.mult&&typeof a[q.id]==='number')for(const k in q.mult)w[k]=(w[k]||0)*q.mult[k][a[q.id]];});return w;}
function modesFromQuiz(a){const o={lang:'en',perm:'us',field:'general',clim:'mild',pol:'d',reach:'no'};QUIZ.forEach(q=>{if(q.mk&&typeof a[q.id]==='number')o[q.mk]=q.m[a[q.id]];});return o;}
function orderedPlaces(needGeo){
  const ok=e=>listable(e)&&(!needGeo||e.hasGeo),az=(a,b)=>dn(a).localeCompare(dn(b),LANG);
  const feat=FEATURED.map(k=>byKey[k]).filter(e=>e&&ok(e));
  const cs=ents.filter(e=>ok(e)&&e.type==='city'&&!feat.includes(e)).sort(az),co=ents.filter(e=>ok(e)&&e.type==='country').sort(az);
  return [[L('grpSuggested'),feat],[L('grpCities'),cs],[L('grpCountries'),co]];
}
function homeSelect(id,val){
  const opt=e=>`<option value="${e.key}" ${val===e.key?'selected':''}>${dn(e)}${e.type==='city'&&countryOf(e)?' ('+countryOf(e)+')':''}</option>`;
  return `<select id="${id}"><option value="">${L('none')}</option>${orderedPlaces(true).map(([g,arr])=>`<optgroup label="${g}">${arr.map(opt).join('')}</optgroup>`).join('')}</select>`;
}
function renderQuiz(){
  const total=QLIST.length+1,n=QSTEP+1;const Q=$('qwrap');
  let body;
  if(QSTEP<QLIST.length){const q=QLIST[QSTEP],[title,opts]=qText(q.id),ord=ORDER[q.id]||opts.map((o,i)=>i);
    const mt=/^([^:?]{3,40}): (.+)$/.exec(title),head=mt?mt[1]:title,sub=mt?mt[2].charAt(0).toUpperCase()+mt[2].slice(1):'';
    body=`${QSTEP===0?`<p class="meta gilbert">${L('gilbert')}</p>`:''}<div class="qtitle">${head}</div>${sub?`<p class="meta qsub">${sub}</p>`:''}<div class="opts">${ord.map(i=>`<button class="opt" data-i="${i}" aria-pressed="${ANS[q.id]===i}"><span class="dot"></span><span>${opts[i]}</span></button>`).join('')}</div>`;}
  else body=`<div class="qtitle">${L('homeQ')}</div><p class="meta">${L('homeSub')}</p><div style="display:flex;flex-wrap:wrap;gap:12px"><div class="field"><label class="lab" for="qh1">${L('home1')}</label>${homeSelect('qh1',HOMEKEYS[0]||'')}</div><div class="field"><label class="lab" for="qh2">${L('home2')}</label>${homeSelect('qh2',HOMEKEYS[1]||'')}</div></div>`;
  Q.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span class="lab">${fmt(L('qOf'),{n,t:total})}</span><button class="ghost" id="qSkip">${L('skip')}</button></div>
  <div class="progress"><span style="width:${Math.round(n/total*100)}%"></span></div>${body}
  <div class="qnav"><button id="qBack" ${QSTEP===0?'hidden':''}>${L('back')}</button>${QSTEP<QLIST.length?`<span class="toggles"><button class="ghost" id="qUnsure">${L('unsure')}</button>${typeof ANS[QLIST[QSTEP].id]==='number'?`<button id="qNext">${L('next')}</button>`:''}</span>`:`<button class="primary" id="qDone">${L('finish')}</button>`}</div>`;
  Q.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ANS[QLIST[QSTEP].id]=+b.dataset.i;Q.querySelectorAll('.opt').forEach(x=>x.setAttribute('aria-pressed',x===b));setTimeout(()=>{QSTEP++;renderQuiz();},180);});
  if($('qBack'))$('qBack').onclick=()=>{QSTEP=Math.max(0,QSTEP-1);renderQuiz();};
  if($('qNext'))$('qNext').onclick=()=>{QSTEP++;renderQuiz();};
  if($('qUnsure'))$('qUnsure').onclick=()=>{ANS[QLIST[QSTEP].id]='skip';QSTEP++;renderQuiz();};
  if($('qh1')){$('qh1').onchange=$('qh2').onchange=()=>{HOMEKEYS=[$('qh1').value,$('qh2').value];};}
  if($('qDone'))$('qDone').onclick=finishQuiz;
  $('qSkip').onclick=()=>{$('quizPanel').hidden=true;if(MODE!=='yours')showMap();};
}
// Holmes: shuffle once per person and keep that order on later visits, so the quiz doesn't rearrange itself
let QSEED=+store.get('qseed',0);if(!QSEED){QSEED=1+Math.floor(Math.random()*1e9);store.set('qseed',String(QSEED));}
function shuffle(a){const rnd=mulberry32(QSEED+a.length);for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startQuiz(full){ANS={};QSTEP=0;HOMEKEYS=[];QLIST=full===true?QUIZ.slice():QUIZ.filter(q=>SIMPLE.includes(q.id));
  ORDER={};QUIZ.forEach(q=>{const n=QSTR.en[q.id][1].length,idx=[...Array(n).keys()];if(q.nominal){const k=q.fixed||0;ORDER[q.id]=shuffle(idx.slice(0,n-k)).concat(idx.slice(n-k));}});
  $('quizPanel').hidden=false;renderQuiz();$('quizPanel').scrollIntoView({block:'start'});}
// Krosnick: show what every unanswered question defaulted to, and let the person change it here
function renderDefaults(){const el=$('vsDefaults');if(!el)return;const un=QUIZ.filter(q=>typeof ANS[q.id]!=='number');if(!un.length){el.innerHTML='';return;}
  const defOf=q=>q.mk?L('defModes')[q.mk]:Object.keys(q.w[0]||{}).map(k=>`${FL(k)} ${fmtW(QBASE[k]??1)}`).join(', ')||'—';
  el.innerHTML=`<details class="box"><summary><span>${fmt(L('defaultsTitle'),{n:un.length})}</span></summary><div class="inner"><p class="meta">${L('defaultsNote')}</p>${un.map(q=>{const [t,opts]=qText(q.id);return `<label class="field"><span class="meta">${t}</span><select data-q="${q.id}"><option value="">${L('keepDefault')}: ${defOf(q)}</option>${opts.map((o,i)=>`<option value="${i}">${o}</option>`).join('')}</select></label>`;}).join('')}</div></details>`;
  el.querySelectorAll('select[data-q]').forEach(sel=>sel.onchange=()=>{if(sel.value==='')return;ANS[sel.dataset.q]=+sel.value;applyQuizAnswers();weightsUI();refreshAll();saveTake();renderDefaults();});}
function applyQuizAnswers(){QUIZW=weightsFromQuiz(ANS);W={...QUIZW};const md=modesFromQuiz(ANS);LANGMODE=md.lang;PERMMODE=md.perm;FIELD=md.field;CLIMMODE=md.clim;POLMODE=md.pol;REACH=md.reach==='yes';LASTS=false;}
function finishQuiz(){
  if($('qh1'))HOMEKEYS=[$('qh1').value,$('qh2').value].filter(Boolean);
  applyQuizAnswers();
  HOMES=homesFromKeys(HOMEKEYS);gate=gateOpen=norm=true;MODE='yours';store.set('view','yours');
  applyHomes();weightsUI();refreshAll();saveTake();renderDefaults();
  $('quizPanel').hidden=true;$('vsPanel').hidden=false;$('vsPanel').scrollIntoView({block:'start'});
}

