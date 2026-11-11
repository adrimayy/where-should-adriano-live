"use strict";
/* ---------------- scoring ---------------- */
let gateHot=true,gateFar=true,W={...PRESETS.mine},gate=true,gateOpen=true,norm=true,MODE='adriano',QUIZW=null;
let STATS={};
function warp(v){return WARPG===1?v:1+4*Math.pow(Math.max(0,(v-1)/4),WARPG);}
function computeStats(){STATS={};FACTORS.forEach(f=>{const v=ents.filter(e=>listable(e)&&e.v&&e.v[f.k]!=null).map(e=>warp(e.v[f.k]));STATS[f.k]={m:d3.mean(v)||3,sd:d3.deviation(v)||1,mn:d3.min(v)??1,mx:d3.max(v)??5};});}
// rescaling: z-score (same average and spread) or min-max (same lowest and highest); the warp stands in for moving every cut-off together
function nv(k,v){v=warp(v);if(!norm)return v;const s=STATS[k];if(NORMM==='minmax')return s.mx>s.mn?1+4*(v-s.mn)/(s.mx-s.mn):3;return Math.max(1,Math.min(5,3+(v-s.m)/s.sd));}
function aggScore(vals){if(AGG==='geo'){let lw=0,sw=0;for(const [w,x] of vals){lw+=w*Math.log(Math.max(1,x));sw+=w;}return sw?(Math.exp(lw/sw)-1)/4*100:0;}
  let t=0,sw=0;for(const [w,x] of vals){t+=w*(x-1)/4;sw+=w;}return sw?t/sw*100:0;}
function Phi(z){return 0.5*(1+Math.tanh(0.7978845608*(z+0.044715*z*z*z)));}
// chance a filled-in value is at or below a cut-off: share of its 20 draws, or a normal approximation
function pBelow(e,k,cut){const d=e.dr&&e.dr[k];if(d)return d.filter(x=>x<=cut).length/d.length;const m=e.v[k],s=e.sd[k]||1;return m==null?0:Phi((cut+0.5-m)/s);}
function contOf(e,k,raw){
  if(!useCont||CALC.has(k)||RULES.has(k)||(k==='clim'&&CLIMMODE!=='mild')||(k==='pay'&&FIELD==='remote'))return raw;
  const own=CONTV[e.type==='city'?'city:'+e.name:'c:'+e.id];if(own&&own[k]!=null)return own[k];
  if(e.type==='city'){const c=CONTV['c:'+e.iso],ce=e.countryEnt;if(c&&c[k]!=null&&ce&&ce.sc[k]===raw&&!(RAWD['city:'+e.name]||{})[k])return c[k];}
  return raw;}
function backed(e,k){
  if(CALC.has(k)||RULES.has(k))return true;
  if(k==='clim'&&CLIMMODE!=='mild')return !!e.hasGeo;
  if(k==='pay'&&FIELD==='remote')return e.src.has('cost');
  return e.src.has(k);
}
const counts=(e,k)=>useEst||backed(e,k);
function resolve(e){
  e.v={};e.sd={};e.how={};e.me={};e.dr={};
  FACTORS.forEach(f=>{const k=f.k,raw=e.sc[k];
    if(k==='happy'&&HAPPYMODE==='beyond'){const hv=HAPPYR['c:'+(e.type==='city'?e.iso:e.id)];if(hv!=null){e.v[k]=hv;e.sd[k]=0;e.me[k]=0.4;e.how[k]='obs';}else{e.v[k]=null;e.how[k]='none';}return;}
    if(k==='jobs'&&useEst&&fieldJobs(e)!=null){e.v[k]=fieldJobs(e);e.sd[k]=1;e.how[k]='est';return;}
    if(raw!=null&&backed(e,k)){e.v[k]=contOf(e,k,raw);e.sd[k]=0;e.me[k]=ME[k]||0;e.how[k]='obs';return;}
    const ik=(k==='pay'&&FIELD==='remote')?'cost':k,im=e.imp&&e.imp[ik];
    if(useImp&&im&&IMPUTABLE.has(k)&&!(k==='clim'&&CLIMMODE!=='mild')){e.v[k]=im[0];e.sd[k]=im[1]||1;e.dr[k]=im[2]?Array.from(im[2],Number):null;e.how[k]='imp';return;}
    if(useEst&&raw!=null){e.v[k]=raw;e.sd[k]=1;e.how[k]='est';return;}
    e.v[k]=null;e.how[k]='none';});
  // tech/software: the job market is averaged with the city's tech-ecosystem rank
  const tb=FIELD==='tech'?techOf(e):null;
  if(tb!=null&&e.how.jobs!=='est'){const j=e.v.jobs;if(j==null){e.v.jobs=e.sc.jobs=tb;e.how.jobs='obs';e.sd.jobs=0;e.me.jobs=ME.jobs;}else if(e.how.jobs==='obs')e.v.jobs=e.sc.jobs=(j+tb)/2;else{e.v.jobs=(j+tb)/2;e.sd.jobs=(e.sd.jobs||1)/2;if(e.dr.jobs)e.dr.jobs=e.dr.jobs.map(d=>(d+tb)/2);}}
}
function evaluate(e){
  const sc=e.sc,V=e.v;let tot=0,sw=0,swImp=0;const part={},vals=[];
  FACTORS.forEach(f=>{const v=V[f.k];if(v==null||W[f.k]<=0)return;const x=nv(f.k,v),p=W[f.k]*(x-1)/4;vals.push([W[f.k],x]);part[f.k]=p;tot+=p;sw+=W[f.k];if(e.how[f.k]!=='obs')swImp+=W[f.k];});
  const score=Math.round(aggScore(vals));Object.keys(part).forEach(k=>part[k]=part[k]/sw*100);
  let den=0;FACTORS.forEach(f=>{if(W[f.k]>0&&(useEst||!EST_ONLY.has(f.k)))den+=W[f.k];});
  let tier=score>=CUT.fit?'fit':score>=CUT.ok?'ok':score>=CUT.caution?'caution':'avoid';
  if(!useImp&&den&&sw/den<0.75)tier='nodata';
  let gated=false,lim='none',likely=false;const war=CONFLICT.has(isoOf(e));
  if(gate&&((e.how.free==='obs'&&sc.free<=2)||war)){tier='avoid';gated=true;lim=war?'safe':'free';}
  // Little & Rubin: dealbreakers also apply to filled-in values, when they're more likely than not below the cut-off
  else if(gate&&e.how.free==='imp'&&pBelow(e,'free',2)>0.5){tier='avoid';gated=true;lim='free';likely=true;}
  else if(tier==='nodata'){}
  else if(gate&&e.how.safe==='obs'&&sc.safe===1&&W.safe>0&&(tier==='fit'||tier==='ok')){tier='caution';gated=true;lim='safe';}
  else if(gate&&e.how.safe==='imp'&&W.safe>0&&pBelow(e,'safe',1)>0.5&&(tier==='fit'||tier==='ok')){tier='caution';gated=true;lim='safe';likely=true;}
  else if(gateOpen&&e.how.open==='obs'&&sc.open===1&&(tier==='fit'||tier==='ok')){tier='caution';gated=true;lim='open';}
  else if(gateFar&&e.flights&&e.flights.some(h=>h>18)&&(tier==='fit'||tier==='ok')){tier='caution';gated=true;lim='fam';}
  else if(gateHot&&CLIMMODE!=='warm'&&e.type==='city'&&THOT[e.name]>=27&&(tier==='fit'||tier==='ok')){tier='caution';gated=true;lim='clim';}
  else{let worst=-1;FACTORS.forEach(f=>{const v=V[f.k];if(v==null||W[f.k]<=0||v>2.5)return;const pen=(5-v)*W[f.k];if(pen>worst){worst=pen;lim=f.k;}});}
  // a top verdict needs published data on every crucial factor you weight, and on at least 80% of your weighted priorities
  const capMiss=CRUCIAL.filter(k=>W[k]>0&&e.how[k]!=='obs');let dataCap=null;
  if(tier==='fit'&&(capMiss.length||(sw&&swImp/sw>0.2))){tier='ok';dataCap=capMiss.length?capMiss:['share'];}
  const known=FACTORS.filter(f=>sc[f.k]!=null);const nb=known.filter(f=>backed(e,f.k)).length;
  const cap=dataCap?'ok':gated?tier:null;
  return {part,dataCap,score,tier,lim,gated,likely,cap,conf:known.length?nb/known.length:0,known:known.length,backed:nb,impShare:sw?swImp/sw:0};
}
function applyPersonal(){ents.forEach(e=>{if(!e.base)e.base={lang:e.sc.lang,perm:e.sc.perm,jobs:e.sc.jobs,clim:e.sc.clim,pay:e.sc.pay};e.sc.lang=langFor(e,LANGMODE);e.sc.perm=permFor(e,PERMMODE);e.sc.jobs=jobsFor(e,FIELD);e.sc.clim=climFor(e,CLIMMODE);e.sc.pay=payFor(e,FIELD);e.sc.pol=polFor(e);});}
function applyHomes(){ents.forEach(famFor);}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// a run's verdict: its score's band, held under the same caps as the real verdict (dealbreakers, the data rule)
function tierAt(s,e){if(e.tier==='nodata')return 'nodata';let t=s>=CUT.fit?'fit':s>=CUT.ok?'ok':s>=CUT.caution?'caution':'avoid';if(e.cap&&TR[e.cap]>TR[t])t=e.cap;return t;}
function scoreWith(e,pick){const vals=[];for(const f of FACTORS){const k=f.k,w=W[k];if(!(w>0))continue;const x=pick(k);if(x==null)continue;vals.push([w,nv(k,x)]);}return aggScore(vals);}
let SIM={R:0,top:{}};
function simulate(){
  // 120 recalculations. Filled-in values take one of their 20 imputed draws per run (multiple imputation);
  // published values move by their measurement error (Gelman), so fully measured places get a range too.
  const R=120,M=20,rand=mulberry32(20261109),gauss=()=>{const u=1-rand(),v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
  const cl=x=>Math.max(1,Math.min(5,x));
  const list=ents.filter(listable),D=list.map(()=>new Float32Array(R));
  for(let r=0;r<R;r++){list.forEach((e,i)=>{D[i][r]=scoreWith(e,k=>{const v=e.v[k];if(v==null)return null;
    if(e.how[k]==='imp'){const d=e.dr[k];return d?d[r%d.length]:cl(v+(e.sd[k]||0)*gauss());}
    if(useME&&e.how[k]==='obs'&&e.me[k])return cl(v+e.me[k]*gauss());return v;});});}
  const q=(a,p)=>a[Math.min(a.length-1,Math.max(0,Math.round(p*(a.length-1))))];
  list.forEach((e,i)=>{const s=Array.from(D[i]).sort((a,b)=>a-b);e.lo=Math.round(q(s,0.1));e.hi=Math.round(q(s,0.9));e.med=Math.round(q(s,0.5));e.rk=[];
    e.pFit=e.cap&&e.cap!=='fit'?0:D[i].filter(x=>x>=CUT.fit).length/R;
    // Rubin's rules: score each of the 20 completed datasets; total variance = within (measurement error) + (1 + 1/M) x between
    const hasDr=Object.keys(e.dr||{}).some(k=>e.dr[k]&&W[k]>0);let B=0;
    if(hasDr){const Q=[];for(let m=0;m<M;m++)Q.push(scoreWith(e,k=>e.how[k]==='imp'&&e.dr[k]?e.dr[k][m]:e.v[k]));B=d3.variance(Q)||0;}
    let sw=0,U=0;FACTORS.forEach(f=>{if(W[f.k]>0&&e.v[f.k]!=null)sw+=W[f.k];});
    if(useME)FACTORS.forEach(f=>{const k=f.k;if(W[k]>0&&e.v[k]!=null&&e.how[k]==='obs'&&e.me[k]){const sc=norm&&NORMM==='z'?1/(STATS[k].sd||1):1;U+=Math.pow(W[k]/sw*25*e.me[k]*sc,2);}});
    e.rubin={sd:Math.sqrt(U+(1+1/M)*B),between:Math.sqrt(B),within:Math.sqrt(U)};});
  SIM={R,top:{}};
  ['city','country'].forEach(tp=>{const idx=list.map((e,i)=>i).filter(i=>list[i].type===tp),tops=[];
    for(let r=0;r<R;r++){const ord=idx.slice().sort((a,b)=>TR[tierAt(D[a][r],list[a])]-TR[tierAt(D[b][r],list[b])]||D[b][r]-D[a][r]);ord.forEach((i,pos)=>list[i].rk.push(pos+1));tops.push(ord.slice(0,10).map(i=>list[i].key));}
    SIM.top[tp]=tops;
    idx.forEach(i=>{const s=list[i].rk.sort((a,b)=>a-b);list[i].rlo=q(s,0.1);list[i].rhi=q(s,0.9);list[i].rn=idx.length;list[i].pTop=s.filter(x=>x<=10).length/R;delete list[i].rk;});});
}
// recruiter: for hybrid work, a city also gets the job market of the best hub within 120 km (about 1.5 hours)
function applyReach(){if(!REACH)return;const cs=ents.filter(e=>e.type==='city'&&e.hasGeo);cs.forEach(e=>{e.hub=null;let best=e.v.jobs??-1;cs.forEach(o=>{if(o===e||o.how.jobs!=='obs'||o.v.jobs==null)return;if(km([e.lat0,e.lon0],[o.lat0,o.lon0])<=120&&o.v.jobs>best){best=o.v.jobs;e.hub=o;}});if(e.hub){e.v.jobs=best;e.how.jobs='obs';e.sd.jobs=0;e.me.jobs=ME.jobs;e.dr.jobs=null;}});}
function recompute(fast){applyPersonal();ents.forEach(resolve);applyReach();computeStats();ents.forEach(e=>Object.assign(e,evaluate(e)));if(!fast)simulate();}
// test hook: lets tests/robustness.py re-score with other weights without the UI
window.__atlas={ents:()=>ents,listable:e=>listable(e),getW:()=>({...W}),setW:o=>{W={...o};},setNorm:b=>{norm=b;},setImp:b=>{useImp=b;},presets:()=>PRESETS,
 setAgg:v=>{AGG=v;},setNormM:v=>{NORMM=v;},setWarp:v=>{WARPG=v;},setRankBy:v=>{RANKBY=v;},setCont:b=>{useCont=b;},
 quick:()=>{applyPersonal();ents.forEach(resolve);applyReach();computeStats();ents.forEach(e=>Object.assign(e,evaluate(e),{lo:null}));},
 full:()=>recompute(),sim:()=>SIM,strings:()=>({STR,QSTR,FSTR})};
function homesFromKeys(keys){return (keys||[]).map(k=>byKey[k]||ents.find(x=>x.name===k)).filter(e=>e&&e.hasGeo);}
function snapshotAdriano(){
  const save={POLMODE,W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,gateHot,useEst,useImp,REACH,HAPPYMODE,AGG,NORMM};
  W={...PRESETS.mine};HOMES=homesFromKeys(ADRIANO_HOMES);LANGMODE='both';PERMMODE='usmx';FIELD='tech';CLIMMODE='mild';POLMODE='d';gate=gateOpen=norm=gateFar=gateHot=true;useEst=false;useImp=true;REACH=false;HAPPYMODE='report';AGG='mean';NORMM='z';
  applyHomes();recompute();ents.forEach(e=>{e.ad={score:e.score,tier:e.tier,lo:e.lo,hi:e.hi,med:e.med};});
  ({POLMODE,W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar,gateHot,useEst,useImp,REACH,HAPPYMODE,AGG,NORMM}=save);applyHomes();recompute();
}
HOMES=homesFromKeys(ADRIANO_HOMES);applyHomes();recompute();snapshotAdriano();

