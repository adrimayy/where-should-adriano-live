import re, json, sys
S = sys.argv[1]
t = open(f'{S}/template.html', encoding='utf8').read()
def rep(old, new, count=1):
    global t
    assert old in t, 'missing: ' + old[:70]
    t = t.replace(old, new, count)

# ---------- document shell ----------
rep('<title>Livability Atlas</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n',
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>Where Should Adriano Live?</title>\n<meta name="description" content="An interactive atlas scoring every country and 89 cities on fourteen factors, weighted by Adriano\'s priorities. Switch to Your take to re-weight it for yourself.">\n<meta property="og:title" content="Where Should Adriano Live?">\n<meta property="og:description" content="Every country and 89 cities, scored on fourteen factors. Re-weight it for yourself.">\n')
rep('</style>\n\n<div class="wrap">', '</style>\n</head>\n<body>\n<div class="wrap">')
t = t.rstrip() + '\n</body>\n</html>\n'

# ---------- extra CSS ----------
rep('.muted{color:var(--muted)}', '''.muted{color:var(--muted)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;padding:3px;background:var(--panel);gap:3px}
.seg button{border:0;min-height:32px;padding:5px 14px;border-radius:7px;background:transparent;color:var(--muted)}
.seg button[aria-pressed="true"]{background:var(--accent);color:var(--panel)}
.about{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:16px}
@media (max-width:820px){.about{grid-template-columns:minmax(0,1fr)}}
.about ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:3px}
.quiz{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px 22px}
.q{display:flex;flex-direction:column;gap:6px;min-width:0}
.q legend{font-weight:500;font-size:14px;padding:0;margin-bottom:4px}
.q fieldset{border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}
.q label{display:flex;gap:8px;align-items:flex-start;font-size:13.5px;color:var(--muted)}
.q input{accent-color:var(--accent);margin-top:3px}
.note{font-size:13px;color:var(--muted);background:var(--chip-bg);border-radius:10px;padding:10px 12px}
.toast{font-size:13px;color:var(--accent);min-height:1.2em}''')

# ---------- header: about Adriano + mode switch ----------
a = t.index('  <header'); b = t.index('</header>') + len('</header>')
t = t[:a] + '''  <header style="display:flex;flex-direction:column;gap:12px">
    <span class="eyebrow">Livability atlas · November 2026</span>
    <h1>Where should Adriano live?</h1>
    <div class="about">
      <div style="display:flex;flex-direction:column;gap:10px">
        <p class="lede">I'm Adriano, a computer science student at Columbia in New York. I built this to figure out where I'd be happiest after I graduate. Every country and __NCITIES__ cities are scored 1 to 5 on the same fourteen factors, then weighted by what matters most to me.</p>
        <p class="lede">I want a walkable, efficient big city with mild weather and no humid heat, healthcare that covers me even if I'm laid off, lots going on, and people who are open to newcomers. Limited freedoms or active war rule a place out for me.</p>
      </div>
      <div class="panel" style="padding:14px 16px;gap:8px">
        <span class="lab">My top priorities, in order</span>
        <ol><li>Efficiency and walkability</li><li>Healthcare that doesn't depend on my job</li><li>Being happy day to day</li><li>Things going on</li><li>Affordability</li></ol>
        <p class="meta">Family visits matter too: my home bases are New York and Tampico, Mexico.</p>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center">
      <div class="seg" role="group" aria-label="Whose take"><button id="mAdriano" aria-pressed="true">Adriano's take</button><button id="mYours" aria-pressed="false">Your take</button></div>
      <span class="meta" id="modeNote">You're seeing my weights. Switch to Your take to answer a few questions and re-score the map for yourself.</span>
    </div>
    <div class="steps"><span><b>1</b>Tap a place for its full breakdown</span><span><b>2</b>Filter the map by verdict, score, or must-haves</span><span><b>3</b>Make your own take and share its link</span><span><b>4</b>Compare up to three places</span></div>
  </header>

  <section class="panel" id="yourPanel" hidden>
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:end">
      <div style="display:flex;flex-direction:column;gap:4px"><h2>Your take</h2><p class="meta">Answer these and the map, ranking and verdicts re-score for you. Fine-tune with the weight sliders below.</p></div>
      <div class="toggles"><button id="qApply">Apply my answers</button><button id="shareTake">Copy link to my take</button><button id="resetTake">Start over</button></div>
    </div>
    <div class="toast" id="toast" role="status"></div>
    <div class="quiz" id="quiz"></div>
    <div style="display:flex;flex-wrap:wrap;gap:12px 20px;align-items:end">
      <div class="field"><label for="home1">Your home base</label><select id="home1"></select></div>
      <div class="field"><label for="home2">Second home base (optional)</label><select id="home2"></select></div>
      <span class="meta" style="max-width:52ch">Used for the "close to home" factor: rough flight times from each place to these.</span>
    </div>
    <p class="note">Three factors are tuned to Adriano and may not fit you. Climate rewards mild weather without humid heat. Language assumes you speak English and Spanish. Work permit assumes US and Mexican citizenship. If yours differ, the quiz lets you turn them down, or set their sliders to zero.</p>
  </section>''' + t[b:]

# ---------- neutral voice in method text ----------
rep('or from my judgment.', 'or from an estimate.')
rep('<p>Each breakdown marks', '<p>Scores were drafted with an AI assistant and checked against the sources linked below. Each breakdown marks')
rep('<tr><td>My safety scores</td><td>I had been kinder to US cities and harsher on European tourist cities than the numbers justify.', '<tr><td>Safety scores</td><td>An earlier version was kinder to US cities and harsher on European tourist cities than the numbers justify.')
rep('<tr><td>My freedom scores</td>', '<tr><td>Freedom scores</td>')
rep('<td>Only its 25 published rankings count as data. My own estimates are marked as such,', '<td>Only its 25 published rankings count as data. Other estimates are marked as such,')
rep('<td>I tend to hand out 4s and 5s more freely', '<td>Estimates tend to hand out 4s and 5s more freely')
rep('Jobs, language and work permit are scored for you: a US-trained CS grad who speaks English and Spanish and holds US and Mexican citizenship. Climate reflects your stated preference for mild weather without humidity.</td><td>Left as is. Someone else would need different scores here.',
    'Jobs, language and work permit are scored for Adriano: a US-trained CS grad who speaks English and Spanish and holds US and Mexican citizenship. Climate reflects his preference for mild weather without humidity.</td><td>Left as is. In Your take, the quiz can turn these factors down.')
rep("so a factor I scored generously doesn't quietly count more", "so a generously scored factor doesn't quietly count more")
rep('<p class="meta">How much each factor counts. Everything updates as you drag.</p>', '<p class="meta" id="wNote">How much each factor counts. Moving any slider switches to Your take.</p>')
rep('<option value="mine">Your stated priorities</option>', '<option value="mine">Adriano\'s priorities</option>')

# ---------- JS: home bases ----------
rep("const HOME=[[40.71,-74.01],[22.26,-97.86]];", "let HOMES=[];")
rep("function famScore(lat,lon){const s=HOME.map(h=>{const t=flightH([lat,lon],h);return t<=3.5?5:t<=6?4:t<=8.5?3:t<=12?2:1;});return Math.round((s[0]+s[1])/2);}",
    "function famBand(t){return t<=3.5?5:t<=6?4:t<=8.5?3:t<=12?2:1;}")
rep("function setGeo(e,lat,lon,approx){e.dayH=dayHours(lat);e.sc.day=dayScore(e.dayH);e.flights=HOME.map(h=>flightH([lat,lon],h));e.sc.fam=famScore(lat,lon);e.geoApprox=approx;e.hasGeo=true;}",
    """function setGeo(e,lat,lon,approx){e.lat0=lat;e.lon0=lon;e.dayH=dayHours(lat);e.sc.day=dayScore(e.dayH);e.geoApprox=approx;e.hasGeo=true;famFor(e);}
function famFor(e){if(!e.hasGeo)return;e.flights=HOMES.map(h=>flightH([e.lat0,e.lon0],[h.lat,h.lon]));
  e.sc.fam=HOMES.length?Math.round(d3.mean(e.flights.map(famBand))):null;}""")
rep("{k:'fam',calc:true,label:'Close to family',drag:'Far from family'}", "{k:'fam',calc:true,label:'Close to home base',drag:'Far from home base'}")
rep("about ${Math.round(e.flights[0])}h to NYC, ${Math.round(e.flights[1])}h to Tampico${e.geoApprox?' (from the country center)':''}",
    "${HOMES.map((h,i)=>`about ${Math.round(e.flights[i])}h to ${h.name}`).join(', ')}${e.geoApprox?' (from the country center)':''}")
# HOMES must exist before entities are built; d3.mean is used, d3 is loaded already.
rep("const CONFLICT=new Set(DATA.conflict||[]);", "const CONFLICT=new Set(DATA.conflict||[]);\nconst ADRIANO_HOMES=[{name:'New York City',lat:40.71,lon:-74.01},{name:'Tampico',lat:22.26,lon:-97.86}];\nHOMES=ADRIANO_HOMES.slice();")

# ---------- JS: mode, quiz, share ----------
QUIZ_JS = r"""
const QUIZ=[
 {id:'move',q:'How do you want to get around?',a:[['A car is fine',{move:0.75}],['A mix of transit and driving',{move:1.5}],['No car, everything walkable',{move:2.5}]]},
 {id:'hlth',q:'How much does healthcare and work-life balance matter?',a:[['My job’s plan is enough',{hlth:1}],['It matters a lot',{hlth:2}],['It has to cover me no matter what',{hlth:3}]]},
 {id:'career',q:'Career or lifestyle right now?',a:[['Building my career fast',{jobs:2.5,pay:2}],['Balanced',{jobs:1.25,pay:1.25}],['Lifestyle first',{jobs:0.5,pay:1}]]},
 {id:'clim',q:'Weather?',a:[['Mild, no humid heat',{clim:1.5,day:1}],['I need lots of winter daylight',{clim:1,day:2}],['I don’t care much',{clim:0.25,day:0.25}]]},
 {id:'open',q:'How easily do you make friends in a new place?',a:[['Easily, anywhere',{open:0.5}],['It takes a while',{open:1.5}],['I need a welcoming culture',{open:2.5}]]},
 {id:'cult',q:'How much needs to be going on?',a:[['Quiet is fine',{cult:0.5}],['Some nightlife and culture',{cult:1.25}],['Big-city energy',{cult:2}]]},
 {id:'fam',q:'How important is being close to your home base?',a:[['Not important',{fam:0}],['Somewhat',{fam:0.75}],['Very important',{fam:2}]]},
 {id:'safe',q:'Safety and stability?',a:[['Some risk is fine',{safe:0.5,free:1}],['Normal concern',{safe:1,free:1.5}],['Top priority',{safe:2.5,free:2}]]},
 {id:'lang',q:'Languages?',a:[['I speak English and Spanish',{lang:0.75}],['English only, and I want to get by in it',{lang:1.5}],['I’ll learn whatever is needed',{lang:0.25}]]},
 {id:'perm',q:'Which passport scores apply to you?',a:[['US and Mexican, like Adriano',{perm:1}],['US only (close enough)',{perm:0.75}],['Something else, ignore this factor',{perm:0}]]}];
const QDEF={move:2,hlth:1,career:1,clim:0,open:1,cult:1,fam:1,safe:1,lang:0,perm:2};
let MODE='adriano';
function quizUI(ans){
  $('quiz').innerHTML=QUIZ.map(q=>`<div class="q"><fieldset><legend>${q.q}</legend>${q.a.map((o,i)=>`<label><input type="radio" name="q-${q.id}" value="${i}" ${ (ans[q.id]??QDEF[q.id])===i?'checked':''}><span>${o[0]}</span></label>`).join('')}</fieldset></div>`).join('');
}
function quizAnswers(){const o={};QUIZ.forEach(q=>{const c=document.querySelector(`input[name="q-${q.id}"]:checked`);o[q.id]=c?+c.value:QDEF[q.id];});return o;}
function weightsFromQuiz(ans){const w={...PRESETS.equal,happy:1};QUIZ.forEach(q=>Object.assign(w,q.a[ans[q.id]][1]));return w;}
function homeOptions(){
  const opts=ents.filter(e=>listable(e)&&e.hasGeo).sort((a,b)=>a.name.localeCompare(b.name));
  const html=v=>'<option value="">None</option>'+opts.map(e=>`<option value="${e.type}:${e.name}" ${v===e.type+':'+e.name?'selected':''}>${e.name}${e.type==='city'?' ('+e.country+')':''}</option>`).join('');
  const key=h=>{if(!h)return '';const e=ents.find(x=>x.name===h.name&&x.hasGeo);return e?e.type+':'+e.name:'';};
  $('home1').innerHTML=html(key(HOMES[0]));$('home2').innerHTML=html(key(HOMES[1]));
}
function readHomes(){HOMES=[$('home1').value,$('home2').value].filter(Boolean).map(k=>{const e=find(k);return e&&e.hasGeo?{name:e.name,lat:e.lat0,lon:e.lon0}:null;}).filter(Boolean);}
function applyHomes(){ents.forEach(famFor);}
function takeState(){return {w:W,h:HOMES.map(h=>h.name),g:gate?1:0,o:gateOpen?1:0,n:norm?1:0,q:quizAnswers()};}
function saveTake(){try{localStorage.setItem('atlas.take',JSON.stringify(takeState()));}catch(e){}}
function loadTakeObj(o){
  if(o.w)W={...PRESETS.mine,...o.w};
  if(Array.isArray(o.h)){HOMES=o.h.map(n=>{const e=ents.find(x=>x.name===n&&x.hasGeo);return e?{name:e.name,lat:e.lat0,lon:e.lon0}:null;}).filter(Boolean);}
  gate=o.g!==0;gateOpen=o.o!==0;norm=o.n!==0;return o.q||{};
}
function syncControls(){
  $('gate').checked=gate;$('gateOpen').checked=gateOpen;$('norm').checked=norm;
  $('mAdriano').setAttribute('aria-pressed',MODE==='adriano');$('mYours').setAttribute('aria-pressed',MODE==='yours');
  $('yourPanel').hidden=MODE!=='yours';
  $('modeNote').textContent=MODE==='adriano'?'You’re seeing my weights. Switch to Your take to answer a few questions and re-score the map for yourself.':'You’re seeing your own take. It’s saved in this browser, and you can share it with the link button.';
  $('preset').value=MODE==='adriano'?'mine':'custom';
}
function setMode(m,opts={}){
  MODE=m;
  if(m==='adriano'){W={...PRESETS.mine};HOMES=ADRIANO_HOMES.slice();gate=gateOpen=norm=true;}
  else if(opts.fresh){let ans={};try{const s=JSON.parse(localStorage.getItem('atlas.take')||'null');if(s)ans=loadTakeObj(s);}catch(e){}quizUI(ans);homeOptions();}
  applyHomes();syncControls();weightsUI();refresh();
  if(m==='yours')saveTake();
}
function toast(msg){$('toast').textContent=msg;clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').textContent='',4000);}
function toYours(){if(MODE!=='yours'){MODE='yours';quizUI({});homeOptions();syncControls();toast('Switched to Your take. Your changes are saved in this browser.');}}
"""
rep("function weightsUI(){", QUIZ_JS + "\nfunction weightsUI(){")
rep("FACTORS.forEach(f=>{$('w-'+f.k).oninput=ev=>{W[f.k]=+ev.target.value;$('o-'+f.k).textContent=fmtW(W[f.k]);$('preset').value='custom';refresh();};});",
    "FACTORS.forEach(f=>{$('w-'+f.k).oninput=ev=>{toYours();W[f.k]=+ev.target.value;$('o-'+f.k).textContent=fmtW(W[f.k]);$('preset').value='custom';refresh();saveTake();};});")
rep("$('preset').onchange=e=>{if(PRESETS[e.target.value]){W={...PRESETS[e.target.value]};weightsUI();refresh();}};",
    "$('preset').onchange=e=>{const v=e.target.value;if(v==='mine'&&MODE==='yours'){W={...PRESETS.mine};weightsUI();refresh();saveTake();return;}if(PRESETS[v]){toYours();W={...PRESETS[v]};weightsUI();$('preset').value=v;refresh();saveTake();}};")
rep("$('norm').onchange=e=>{norm=e.target.checked;refresh();};", "$('norm').onchange=e=>{toYours();norm=e.target.checked;refresh();saveTake();};")
rep("$('gate').onchange=e=>{gate=e.target.checked;refresh();};", "$('gate').onchange=e=>{toYours();gate=e.target.checked;refresh();saveTake();};")
rep("$('gateOpen').onchange=e=>{gateOpen=e.target.checked;refresh();};", """$('gateOpen').onchange=e=>{toYours();gateOpen=e.target.checked;refresh();saveTake();};
$('mAdriano').onclick=()=>setMode('adriano');
$('mYours').onclick=()=>setMode('yours',{fresh:true});
$('qApply').onclick=()=>{W=weightsFromQuiz(quizAnswers());readHomes();applyHomes();weightsUI();$('preset').value='custom';refresh();saveTake();toast('Re-scored with your answers. Scroll down to see your map and ranking.');};
$('home1').onchange=$('home2').onchange=()=>{readHomes();applyHomes();refresh();saveTake();};
$('resetTake').onclick=()=>{try{localStorage.removeItem('atlas.take');}catch(e){}W={...PRESETS.mine};HOMES=[];gate=gateOpen=norm=true;quizUI({});homeOptions();applyHomes();syncControls();weightsUI();refresh();toast('Cleared. Answer the questions and press Apply.');};
$('shareTake').onclick=()=>{const url=location.href.split('#')[0]+'#take='+encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(takeState())))));
  const done=()=>toast('Link copied. Anyone who opens it sees your take.');
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,()=>prompt('Copy this link:',url));else prompt('Copy this link:',url);};""")

# ---------- startup: read a shared take from the link, or a saved one ----------
rep("weightsUI();tierFilters();mustUI();detail(null);list();legend();summary();",
    """(function initTake(){
  const m=location.hash.match(/take=([^&]+)/);
  if(m){try{const o=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1])))));MODE='yours';const ans=loadTakeObj(o);quizUI(ans);homeOptions();applyHomes();recompute();syncControls();setTimeout(()=>toast('You’re viewing a shared take. Change anything to make it your own.'),50);return;}catch(e){}}
  quizUI({});homeOptions();syncControls();
})();
weightsUI();tierFilters();mustUI();detail(null);list();legend();summary();""")
# after the map loads, country coordinates exist: refresh home options and distances
rep("  recompute();list();\n  landFC=", "  applyHomes();recompute();list();homeOptions();\n  landFC=")

open(f'{S}/template_standalone.html', 'w', encoding='utf8').write(t)
print('ok')
