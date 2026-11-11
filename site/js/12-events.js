/* ---------------- events ---------------- */
$('lEn').onclick=()=>{LANG='en';store.set('lang','en');applyLang();};
$('lEs').onclick=()=>{LANG='es';store.set('lang','es');applyLang();};
$('startQuiz').onclick=()=>startQuiz(false);$('fullQuiz').onclick=()=>startQuiz(true);
function setAdriano(){MODE='adriano';W={...PRESETS.mine};HOMES=homesFromKeys(ADRIANO_HOMES);LANGMODE='both';PERMMODE='usmx';FIELD='tech';CLIMMODE='mild';POLMODE='d';gate=gateOpen=norm=gateFar=gateHot=true;useEst=false;useImp=true;REACH=false;HAPPYMODE='report';LASTS=false;}
$('skipQuiz').onclick=()=>{$('quizPanel').hidden=true;setAdriano();store.set('view','adriano');applyHomes();weightsUI();refreshAll();showMap();};
$('mEqual').onclick=()=>{$('quizPanel').hidden=true;$('vsPanel').hidden=true;startNeutral();};
$('resumeTake').onclick=()=>{try{loadTake(JSON.parse(store.get('take','null')));applyHomes();weightsUI();refreshAll();$('vsPanel').hidden=false;$('vsPanel').scrollIntoView({block:'start'});}catch(e){}};
$('retake').onclick=()=>startQuiz(false);
$('toMap').onclick=showMap;
$('mAdriano').onclick=()=>{$('skipQuiz').onclick();$('vsPanel').hidden=true;};
$('mYours').onclick=()=>{const s=store.get('take',null);if(s){$('resumeTake').onclick();}else startQuiz();};
$('shareTake').onclick=()=>{const url=location.href.split('#')[0]+'#t='+enc(takeState())+(LANG==='es'?'&l=es':'');
  const ok=()=>toast(L('copied'));if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(ok,()=>window.prompt(L('copyPrompt'),url));else window.prompt(L('copyPrompt'),url);};
$('colorBy').onchange=e=>{ui.colorBy=e.target.value;store.set('colorBy',ui.colorBy);paint();};
$('styleSel').onchange=e=>{ui.style=e.target.value;store.set('style',ui.style);drawGeo();paint();};
$('projSel').onchange=e=>{ui.proj=e.target.value;store.set('proj2',ui.proj);rebuild();};
const press=(id,v)=>$(id).setAttribute('aria-pressed',v);
$('tCountries').onclick=()=>{ui.showC=!ui.showC;press('tCountries',ui.showC);press('tDots',!ui.showC);paint();};
$('tCities').onclick=()=>{ui.showD=!ui.showD;press('tCities',ui.showD);paint();};
$('tLabels').onclick=()=>{ui.labels=!ui.labels;press('tLabels',ui.labels);paint();};
$('rCities').onclick=()=>{ui.rankType='city';press('rCities',true);press('rCountries',false);ui.showAll=false;list();legend();};
$('rCountries').onclick=()=>{ui.rankType='country';press('rCountries',true);press('rCities',false);ui.showAll=false;list();legend();};
$('more').onclick=()=>{ui.showAll=true;list();};
$('minScore').oninput=e=>{ui.minScore=+e.target.value;$('minOut').textContent=ui.minScore;filtersChanged();};
$('freset').onclick=()=>{ui.tiers=new Set(TIERS);ui.minScore=0;ui.mins={};$('minScore').value=0;$('minOut').textContent='0';tierFilters();mustUI();filtersChanged();};
$('preset').onchange=e=>{const v=e.target.value;const src=v==='quiz'?QUIZW:PRESETS[v];if(!src)return;if(v!=='mine'||MODE==='yours')becomeYours();W={...src};weightsUI();$('preset').value=MODE==='adriano'?'mine':v;refreshAll();saveTake();};
$('norm').onchange=e=>{becomeYours();norm=e.target.checked;refreshAll();saveTake();};
$('useEst').onchange=e=>{becomeYours();useEst=e.target.checked;refreshAll();saveTake();};
$('useImp').onchange=e=>{becomeYours();useImp=e.target.checked;refreshAll();saveTake();};
$('gate').onchange=e=>{becomeYours();gate=e.target.checked;refreshAll();saveTake();};
$('gateOpen').onchange=e=>{becomeYours();gateOpen=e.target.checked;refreshAll();saveTake();};
$('gateFar').onchange=e=>{becomeYours();gateFar=e.target.checked;refreshAll();saveTake();};
$('gateHot').onchange=e=>{becomeYours();gateHot=e.target.checked;refreshAll();saveTake();};
$('useCont').onchange=e=>{becomeYours();useCont=e.target.checked;refreshAll();saveTake();};
$('useME').onchange=e=>{becomeYours();useME=e.target.checked;refreshAll();saveTake();};
$('reach').onchange=e=>{becomeYours();REACH=e.target.checked;refreshAll();saveTake();};
$('rankBy').onchange=e=>{RANKBY=e.target.value;store.set('rankBy',RANKBY);refreshAll();};
$('aggSel').onchange=e=>{becomeYours();AGG=e.target.value;refreshAll();saveTake();};
$('normM').onchange=e=>{becomeYours();NORMM=e.target.value;refreshAll();saveTake();};
$('happyM').onchange=e=>{becomeYours();HAPPYMODE=e.target.value;refreshAll();saveTake();};
// Gilbert: shift 30% of the weather and daylight weight to the commute and making friends, which people tend to underweight
$('lasts').onchange=e=>{becomeYours();const on=e.target.checked;if(on&&!LASTS){LASTS_D=(W.clim||0)*0.3+(W.day||0)*0.3;W.clim=(W.clim||0)*0.7;W.day=(W.day||0)*0.7;W.commute=(W.commute||0)+LASTS_D/2;W.open=(W.open||0)+LASTS_D/2;}
  else if(!on&&LASTS){W.clim=(W.clim||0)/0.7;W.day=(W.day||0)/0.7;W.commute=Math.max(0,(W.commute||0)-LASTS_D/2);W.open=Math.max(0,(W.open||0)-LASTS_D/2);}
  LASTS=on;weightsUI();refreshAll();saveTake();};
$('tOpac').onclick=()=>{ui.opac=!ui.opac;press('tOpac',ui.opac);paint();};
$('vScore').onclick=()=>{ui.view='score';press('vScore',true);press('vProfile',false);list();};
$('vProfile').onclick=()=>{ui.view='profile';press('vProfile',true);press('vScore',false);list();};
$('animBtn').onclick=animStart;
$('undoBtn').onclick=undo;
$('tDots').onclick=()=>{ui.showC=!ui.showC;press('tCountries',ui.showC);press('tDots',!ui.showC);paint();};
$('cmpClear').onclick=()=>{ui.cmp=[];renderCmp();detail(ui.sel);pcard();};
$('search').oninput=()=>list();
$('search').onchange=e=>{const v=e.target.value.trim().toLowerCase();const hit=ents.find(x=>listable(x)&&(dn(x).toLowerCase()===v||x.name.toLowerCase()===v));if(hit){select(hit,true);}};
$('zin').onclick=()=>zoom&&zsel.transition().duration(300).call(zoom.scaleBy,1.6);
$('zout').onclick=()=>zoom&&zsel.transition().duration(300).call(zoom.scaleBy,1/1.6);
$('zreset').onclick=()=>{if(!zoom)return;regionView(ui.region,true);};
document.querySelectorAll('#regions button').forEach(b=>b.onclick=()=>regionView(b.dataset.r,true));


