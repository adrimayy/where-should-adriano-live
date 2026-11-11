"use strict";
/* ---------------- map ---------------- */
const ui={opac:false,view:'score',mins:{},colorBy:store.get('colorBy','tier'),style:store.get('style','cb'),proj:store.get('proj2','winkel'),region:store.get('region','atlantic'),showC:true,showD:true,labels:true,rankType:'city',tiers:new Set(TIERS),minScore:0,must:new Set(),showAll:false,sel:null,cmp:[]};
const narrow=matchMedia('(max-width:640px)').matches, touch=matchMedia('(pointer:coarse)').matches;
const VW=960,VH=narrow?720:500;
// Land is drawn on a canvas from cached shapes (Path2D, projected once): a pan or zoom repaints the cached shapes at a new
// scale instead of recomputing or re-laying-out thousands of SVG nodes (the approach Felt and others moved to for speed).
const svg=d3.select('#map'),cv=svg.node(),ctx=cv.getContext('2d');cv.style.aspectRatio=`${VW} / ${VH}`;
const osvg=d3.select('#overlay').attr('viewBox',`0 0 ${VW} ${VH}`),oroot=osvg.append('g'),gPlaceNames=oroot.append('g').attr('pointer-events','none'),gCities=oroot.append('g'),gLabels=oroot.append('g').attr('pointer-events','none'),gClusters=oroot.append('g').attr('pointer-events','none');
let proj,path,features=[],zoomK=1,landFC=null,zoom,MESH=null,HIRES=false,LAND=null;
const tip=$('tip');
const A3=DATA.a3;
const NAME_ALIAS={'Kosovo':'Kosovo','Republic of Kosovo':'Kosovo','N. Cyprus':'N. Cyprus','Northern Cyprus':'N. Cyprus','Somaliland':'Somaliland'};
function entOfFeature(d){const nm=d.properties&&d.properties.name;return byIso[A3[d.id]]||(isFinite(+d.id)&&byIso[+d.id])||byName[NAME_ALIAS[nm]]||ents.find(x=>x.type==='city'&&x.name===nm&&(nm==='Singapore'||nm==='Hong Kong'))||null;}
const FALLBACK={};function fallbackEnt(d){const nm=(d.properties&&d.properties.name)||'?';if(FALLBACK[nm])return FALLBACK[nm];const e=FALLBACK[nm]={type:'country',id:'est-'+nm,key:'country:est-'+nm,name:nm,sc:factorsOf('2223222202220240'),note:'Not individually scored. Shown with a cautious default estimate.',noteEs:'Sin calificación individual. Se muestra con una estimación prudente.',src:new Set(),est:true};e.base={lang:e.sc.lang,perm:e.sc.perm,jobs:e.sc.jobs,clim:e.sc.clim,pay:e.sc.pay};e.cost=4;ents.push(e);return e;}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
// Winkel tripel, the projection National Geographic uses for world maps: the average of an equirectangular map (standard
// parallel acos(2/pi)) and the Aitoff projection. Written here so the page needs no extra library.
function winkel3Raw(l,p){const cp=Math.cos(p),a=Math.acos(cp*Math.cos(l/2)),si=a?a/Math.sin(a):1;return [(2*cp*Math.sin(l/2)*si+l/(Math.PI/2))/2,(Math.sin(p)*si+p)/2];}
const geoWinkel3=()=>d3.geoProjection(winkel3Raw).scale(158.837);
async function getWorld(){
  // the standard outlines load first so the map appears fast; the detailed ones only when someone zooms in (maybeHires)
  const lo=['https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.world.min.js','https://cdn.jsdelivr.net/npm/datamaps@0.5.10/dist/datamaps.world.min.js','https://unpkg.com/datamaps@0.5.10/dist/datamaps.world.min.js'];
  for(const s of lo){if(window.Datamap&&window.Datamap.prototype.worldTopo)break;try{await loadScript(s);}catch(e){}}
  const t=window.Datamap&&window.Datamap.prototype.worldTopo;if(!t||!t.objects)throw new Error('no map data');
  return topoFeatures(t);
}
function topoFeatures(t){const obj=t.objects.world||Object.values(t.objects)[0];
  MESH=null;if(topojson.mesh){try{MESH={borders:topojson.mesh(t,obj,(a,b)=>a!==b),coast:topojson.mesh(t,obj,(a,b)=>a===b)};}catch(e){}}
  return topojson.feature(t,obj).features.filter(f=>f.geometry).map(fixWinding);}
function bindCountries(fs){features=fs;
  features.forEach(d=>{d._e=entOfFeature(d)||fallbackEnt(d);if(!d._e.hasGeo){const c=d3.geoCentroid(d);setGeo(d._e,c[1],c[0],true);}});
  features.forEach(d=>{d._lab=bigCentroid(d);d._area=d3.geoArea(d);});
  landFC={type:'FeatureCollection',features:features.filter(d=>d.id!=='ATA'&&+d.id!==10)};
  if(proj)cacheLand();}
let STATES=null;
async function loadStates(){
  const srcs=['https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.usa.min.js','https://cdn.jsdelivr.net/npm/datamaps@0.5.10/dist/datamaps.usa.min.js','https://unpkg.com/datamaps@0.5.10/dist/datamaps.usa.min.js'];
  for(const s of srcs){try{await loadScript(s);const t=window.Datamap&&window.Datamap.prototype.usaTopo;if(t&&t.objects){const obj=t.objects.usa||Object.values(t.objects)[0];
    const fs=topojson.feature(t,obj).features.filter(f=>f.geometry).map(fixWinding);fs.forEach(f=>{f._lab=bigCentroid(f);});
    STATES={fs,mesh:topojson.mesh?topojson.mesh(t,obj,(a,b)=>a!==b):null};drawGeo();vis();return;}}catch(e){}}}
// label point of a shape: the centre of its largest piece (so France isn't labelled in the Atlantic because of French Guiana)
function bigCentroid(f){const g=f.geometry;if(g.type!=='MultiPolygon')return d3.geoCentroid(f);let best=null,ba=-1;for(const c of g.coordinates){const p={type:'Polygon',coordinates:c},a=d3.geoArea(p);if(a>ba){ba=a;best=p;}}return d3.geoCentroid(best);}
const GRAT=d3.geoGraticule().step([30,30])();
let _hiP=null;
function maybeHires(){if(HIRES||_hiP||!(zoomK>=2.2||(ui.proj==='globe'&&proj&&proj.scale()>proj._base*2)))return;
  const hi=['https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.world.hires.min.js','https://cdn.jsdelivr.net/npm/datamaps@0.5.10/dist/datamaps.world.hires.min.js','https://unpkg.com/datamaps@0.5.10/dist/datamaps.world.hires.min.js'];
  const before=window.Datamap&&window.Datamap.prototype.worldTopo;
  _hiP=(async()=>{for(const s of hi){try{await loadScript(s);const t=window.Datamap&&window.Datamap.prototype.worldTopo;if(t&&t!==before&&t.objects){HIRES=true;bindCountries(topoFeatures(t));drawGeo();paint();return;}}catch(e){}}})();}
// one-tap views; most of the 137 cities sit on the two sides of the Atlantic
const REGIONS={world:null,atlantic:[[-128,14],[32,62]],na:[[-128,17],[-62,56]],eu:[[-11,35],[31,61]],la:[[-118,-42],[-34,30]],ap:[[68,-45],[178,46]]};
function regionView(r,animate){ui.region=r;store.set('region',r);document.querySelectorAll('#regions button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.r===r));
  if(!proj||!zoom)return;const bb=REGIONS[r];
  if(ui.proj==='globe'){const c=bb?[(bb[0][0]+bb[1][0])/2,(bb[0][1]+bb[1][1])/2]:[-74,25];const r0=proj.rotate(),r1=[-c[0],-c[1]];
    if(!animate){proj.rotate(r1);drawGeo();return;}d3.transition().duration(700).tween('r',()=>{const i=d3.interpolate(r0,r1);return t=>{proj.rotate(i(t));t<1?globeSoon():drawGeo();};});return;}
  let tr=d3.zoomIdentity;
  if(bb){const ring=[];for(let i=0;i<=8;i++){const x=bb[0][0]+(bb[1][0]-bb[0][0])*i/8;ring.push(proj([x,bb[0][1]]),proj([x,bb[1][1]]));}const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);
    const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),pad=narrow?0.84:0.94,k=Math.max(1,Math.min(12,pad/Math.max((x1-x0)/VW,(y1-y0)/VH)));
    const cx=VW/2-(narrow?VW*0.05:0);   // keep the view clear of the zoom buttons on the right
    tr=d3.zoomIdentity.translate(cx-k*(x0+x1)/2,VH/2-k*(y0+y1)/2).scale(k);}
  goTo(tr,animate?650:0);}
function fixWinding(f){if(!f.geometry)return f;if(d3.geoArea(f)>2*Math.PI){const g=f.geometry,rev=r=>r.slice().reverse();if(g.type==='Polygon')g.coordinates=g.coordinates.map(rev);else if(g.type==='MultiPolygon')g.coordinates=g.coordinates.map(p=>p.map(rev));}return f;}
// Keeney's screening: a place below any minimum you set is out, whatever else it scores; the rest are ranked by weighted score
function passes(e){if(!ui.tiers.has(e.tier)||e.score<ui.minScore)return false;for(const k in ui.mins){const v=e.v&&e.v[k];if(v==null||v<ui.mins[k]-1e-9)return false;}return true;}
// Cairo's rounding, without crossing a verdict line: 68 shows as 65 (Workable), never 70 next to a Workable chip
const bandOf=x=>x>=CUT.fit?3:x>=CUT.ok?2:x>=CUT.caution?1:0;
const r5=x=>{const r=Math.round(x/5)*5;return bandOf(r)===bandOf(x)?r:Math.floor(x/5)*5;}, pct=x=>Math.round((x||0)*100)+'%';
let QBR=null;function quantBreaks(){const v=ents.filter(e=>listable(e)&&e.type===ui.rankType).map(e=>e.score).sort(d3.ascending);QBR=[.2,.4,.6,.8].map(p=>d3.quantile(v,p));}
function colorFor(e){
  const st=STYLES[ui.style];const ramp=t=>d3.interpolateRgb(st.seq[0],st.seq[1])(Math.max(0,Math.min(1,t)));
  if(ui.colorBy==='tier')return st.tiers[e.tier];
  if(ui.colorBy==='score')return ramp(e.score/100);
  if(ui.colorBy==='conf')return ramp(e.conf);
  if(ui.colorBy==='limit')return GROUPCOL[GROUP[e.lim]||'none'];
  if(ui.colorBy==='quant'){if(!QBR)quantBreaks();const c=QBR.filter(b=>e.score>b).length;return ramp(c/4);}
  if(ui.colorBy==='vs'){const d=Math.max(-15,Math.min(15,e.score-e.ad.score))/15;return d<0?d3.interpolateRgb('#c9d1d7','#cf3f3f')(-d):d3.interpolateRgb('#c9d1d7','#7a5af0')(d);}
  const v=e.sc[ui.colorBy.slice(2)];return v==null?st.off:ramp((v-1)/4);
}
function makeProj(){
    const p={winkel:geoWinkel3(),natural:d3.geoNaturalEarth1(),equal:d3.geoEqualEarth(),mercator:d3.geoMercator(),globe:d3.geoOrthographic()}[ui.proj]||d3.geoNaturalEarth1();
  if(ui.proj==='mercator'&&landFC)p.fitExtent([[10,10],[VW-10,VH-10]],landFC);
  else if(ui.proj==='globe')p.fitExtent([[20,20],[VW-20,VH-20]],{type:'Sphere'}).rotate([74,-25]).clipAngle(90);
  else p.fitExtent([[10,10],[VW-10,VH-10]],{type:'Sphere'});
  proj=p;path=d3.geoPath(p);proj._base=p.scale();
}
function visible(c){if(ui.proj!=='globe')return true;const r=proj.rotate();return d3.geoDistance([c.lon,c.lat],[-r[0],-r[1]])<Math.PI/2-0.02;}
function frameBg(st){return ui.proj==='mercator'||(zoomK>1.25&&ui.proj!=='globe')?st.ocean:'var(--panel)';}
// colors may be CSS variables (light/dark themes); the canvas needs the actual values
const _root=document.documentElement;function cssC(c){if(typeof c==='string'&&c.startsWith('var(')){const v=getComputedStyle(_root).getPropertyValue(c.slice(4,-1).trim()).trim();return v||'#ccc';}return c;}
function cacheLand(){if(!proj)return;const pth=d3.geoPath(proj),P=g=>{const d=g&&pth(g);return d?new Path2D(d):null;};
  LAND={sphere:P({type:'Sphere'}),grat:P(GRAT),borders:MESH?P(MESH.borders):null,coast:MESH?P(MESH.coast):null,states:STATES&&STATES.mesh?P(STATES.mesh):null};
  for(const d of features){const ds=pth(d);d._p=ds?new Path2D(ds):null;d._b=ds?pth.bounds(d):null;}}
// the map's width is read once per resize, not on every frame (each read can force the browser to redo the layout)
let _mw=0,_mh=0;const mapW=()=>{if(!_mw){_mw=cv.clientWidth;_mh=cv.clientHeight;}return _mw||VW;},mapH=()=>{mapW();return _mh||VH;};
if(window.ResizeObserver)new ResizeObserver(()=>{_mw=0;}).observe(cv);
function sizeCanvas(){const w=mapW(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.round(w*dpr),H=Math.round(w*VH/VW*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}return {s:w/VW,dpr};}
let _ld=0;function landSoon(){if(_ld)return;_ld=requestAnimationFrame(()=>{_ld=0;drawLand();});}
function drawLand(){if(_ld){cancelAnimationFrame(_ld);_ld=0;}
  const {s,dpr}=sizeCanvas(),t=ui.proj==='globe'?d3.zoomIdentity:_lastTV,k=t.k,st=STYLES[ui.style];
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);if(!LAND)return;
  ctx.setTransform(dpr*s*k,0,0,dpr*s*k,dpr*s*t.x,dpr*s*t.y);const lw=px=>px/(s*k);ctx.lineJoin='round';
  // only shapes in view are drawn
  const x0=-t.x/k,y0=-t.y/k,x1=(VW-t.x)/k,y1=(VH-t.y)/k,inView=b=>b&&b[1][0]>=x0&&b[0][0]<=x1&&b[1][1]>=y0&&b[0][1]<=y1;
  if(LAND.sphere){ctx.fillStyle=cssC(st.ocean);ctx.fill(LAND.sphere);
    const gl=parseFloat(getComputedStyle(_root).getPropertyValue('--glow'))||0,g=ctx.createRadialGradient(VW*.45,VH*.4,0,VW*.45,VH*.4,VW*.7);
    g.addColorStop(0,`rgba(255,255,255,${gl})`);g.addColorStop(.6,`rgba(255,255,255,${gl/4})`);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fill(LAND.sphere);}
  if(LAND.grat){ctx.globalAlpha=.7;ctx.lineWidth=lw(.5);ctx.strokeStyle=cssC(st.grat);ctx.stroke(LAND.grat);ctx.globalAlpha=1;}
  const off=cssC(st.off);
  for(const d of features){if(!d._p||!inView(d._b))continue;ctx.globalAlpha=d._op??1;ctx.fillStyle=d._fill?cssC(d._fill):off;ctx.fill(d._p);}
  ctx.globalAlpha=1;const stroke=cssC(st.stroke);
  if(!LAND.borders){ctx.lineWidth=lw(.5);ctx.strokeStyle=stroke;for(const d of features)if(d._p&&inView(d._b))ctx.stroke(d._p);}
  if(LAND.states&&k>=1.8){ctx.globalAlpha=.7;ctx.lineWidth=lw(.5);ctx.strokeStyle=stroke;ctx.stroke(LAND.states);ctx.globalAlpha=1;}
  if(LAND.borders){ctx.lineWidth=lw(.6);ctx.strokeStyle=stroke;ctx.stroke(LAND.borders);}
  if(LAND.coast){ctx.lineWidth=lw(.7);ctx.strokeStyle=st.mono?'#5b6b77':'rgba(20,45,65,.55)';ctx.stroke(LAND.coast);}
  const sel=ui.sel&&features.find(d=>d._e===ui.sel);if(sel&&sel._p){ctx.lineWidth=lw(1.8);ctx.strokeStyle=cssC(st.text);ctx.stroke(sel._p);}
  if(LAND.sphere&&ui.proj!=='mercator'){ctx.lineWidth=lw(1.2);ctx.strokeStyle=cssC(st.grat);ctx.stroke(LAND.sphere);}}
// which country is under the pointer: test the cached shapes (bounding box first)
function countryAt(ev){if(!LAND)return null;const r=cv.getBoundingClientRect(),s=r.width/VW,t=ui.proj==='globe'?d3.zoomIdentity:_lastTV;
  const ux=((ev.clientX-r.left)/s-t.x)/t.k,uy=((ev.clientY-r.top)/s-t.y)/t.k;ctx.setTransform(1,0,0,1,0,0);
  for(let i=features.length-1;i>=0;i--){const d=features[i],b=d._b;if(!d._p||!b||ux<b[0][0]||ux>b[1][0]||uy<b[0][1]||uy>b[1][1])continue;if(ctx.isPointInPath(d._p,ux,uy))return d;}return null;}
let _hv=0,_hvEv=null;
cv.addEventListener('mousemove',ev=>{_hvEv=ev;if(_hv)return;_hv=requestAnimationFrame(()=>{_hv=0;if(!ui.showC||cv.style.transform)return hideTip();const d=countryAt(_hvEv);d?showTip(_hvEv,d._e):hideTip();});});
cv.addEventListener('mouseleave',hideTip);
// the canvas does not follow CSS colors by itself: repaint when the system or the viewer switches light/dark
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>landSoon());
new MutationObserver(()=>landSoon()).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
cv.addEventListener('click',ev=>{if(!ui.showC)return;const d=countryAt(ev);if(d)select(d._e,false);});
function drawGeo(){const st=STYLES[ui.style];$('mapbox').style.background=frameBg(st);cacheLand();drawLand();
  placeCities();}
// sizes are set in screen pixels, so dots and names are the same size on a phone and a laptop
const U=()=>VW/mapW();   // map units per screen pixel
const SZ={dot:narrow?6:5,city:narrow?12.5:12,count:narrow?10:9.5,country:10,state:9.5};
const FONT='-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif';
function placeCities(){
  gCities.selectAll('circle').each(function(d){const p=proj([d.lon,d.lat]);this.setAttribute('cx',p[0]);this.setAttribute('cy',p[1]);});
  vis();
}
// Bostock: at low zoom, dots closer than about two bubble-widths are grouped under the best-ranked one, with a count
let CLUSTER=new Map(),CLUSTER_HEADS=new Map();
// real text widths (measured once per name), so names don't overlap because of a guess
const _tw=new Map(),_cv=document.createElement('canvas').getContext('2d');
function textW(t,wt,size){const k=t+'|'+wt+'|'+size;if(_tw.has(k))return _tw.get(k);_cv.font=`${wt} ${size}px ${FONT}`;const w=_cv.measureText(t).width;_tw.set(k,w);return w;}
function vis(){
  const u=U(),R0=SZ.dot*u,RB=R0*1.75,pts=[];CLUSTER=new Map();
  gCities.selectAll('circle').each(function(d){if(!(ui.showD&&passes(d)&&visible(d)))return;const p=proj([d.lon,d.lat]);pts.push({d,x:p[0]*zoomK,y:p[1]*zoomK,n:1});});
  const ord=ents.filter(e=>e.type==='city'&&listable(e)&&passes(e)).sort(byRank),RK=new Map(ord.map((e,i)=>[e,i]));
  pts.sort((a,b)=>(b.d===ui.sel)-(a.d===ui.sel)||(RK.get(a.d)??999)-(RK.get(b.d)??999));const kept=[];
  for(const p of pts){const k=kept.find(q=>Math.hypot(q.x-p.x,q.y-p.y)<RB*2.05);if(k){k.n++;CLUSTER.set(p.d,k.d);}else kept.push(p);}
  const head=new Map(kept.map(p=>[p.d,p.n]));CLUSTER_HEADS=head;
  // a group shows as one bigger dot with its count inside
  gCities.selectAll('circle').attr('r',d=>(head.get(d)>1?RB:ui.sel===d?R0*1.35:R0)/zoomK).attr('stroke-width',d=>(ui.sel===d?2.2:1.5)*u/zoomK)
    .attr('display',d=>head.has(d)?null:'none').attr('aria-label',d=>`${dn(d)}, ${L('tiers')[d.tier]}${head.get(d)>1?', +'+(head.get(d)-1):''}`);
  gClusters.selectAll('text').data(kept.filter(p=>p.n>1),p=>p.d.key).join('text').attr('x',p=>p.x/zoomK).attr('y',p=>p.y/zoomK).attr('text-anchor','middle').attr('dominant-baseline','central')
    .attr('font-size',SZ.count*u/zoomK).attr('font-weight',700).attr('font-family',FONT).attr('fill',p=>inkFor(colorFor(p.d))).attr('stroke','none').text(p=>p.n);
  // names stay inside the frame, clear of the map buttons, and off every dot and other name
  const tv=ui.proj==='globe'?{x:0,y:0}:_lastTV,mb=$('mapbox').getBoundingClientRect(),pad=3*u;
  const boxes=kept.map(p=>{const r=(p.n>1?RB:R0)+u;return {x:p.x-r,y:p.y-r,w:2*r,h:2*r,own:p.d,bub:p.n>1};});
  for(const sel of ['.zoombtns','#maphint']){const el=document.querySelector(sel);if(!el||!el.offsetParent)continue;const r=el.getBoundingClientRect();
    boxes.push({x:(r.left-mb.left)*u-tv.x-pad,y:(r.top-mb.top)*u-tv.y-pad,w:r.width*u+2*pad,h:r.height*u+2*pad,own:'UI'});}
  const ov=(b,o)=>b.x<o.x+o.w&&o.x<b.x+b.w&&b.y<o.y+o.h&&o.y<b.y+b.h;
  const inFrame=b=>b.x+tv.x>=pad&&b.x+b.w+tv.x<=VW-pad&&b.y+tv.y>=pad&&b.y+b.h+tv.y<=VH-pad;
  const hit=b=>!inFrame(b)||boxes.some(o=>o.own!==b.own&&ov(b,o));
  const nameHit=b=>!inFrame(b)||boxes.some(o=>o.own!==b.own&&(o.own==='L'||o.own==='UI'||o.bub)&&ov(b,o));
  const faded=new Set(),showL=new Set(),LP=new Map(),rk=d=>RK.get(d)??999,txt=d=>(rk(d)<10?(rk(d)+1)+' ':'')+dn(d);
  // in ranking order; each name tries right, left, above, below its dot; the top 10 are always named when they fit in the frame;
  // how many others depends on the zoom (a handful zoomed out, all of them close up)
  const cap=(narrow?[6,14,28]:[14,28,55]),maxN=zoomK<1.4?cap[0]:zoomK<2.2?cap[1]:zoomK<3.5?cap[2]:1e9;let nN=0;
  if(ui.labels)for(const p of [...kept].sort((a,b)=>rk(a.d)-rk(b.d))){if(nN>=maxN&&rk(p.d)>=10)continue;
    const w=(textW(txt(p.d),rk(p.d)<10?650:450,SZ.city)+3)*u,h=SZ.city*1.25*u,off=(p.n>1?RB:R0)+3*u;
    const c=[{b:{x:p.x+off,y:p.y-h/2,w,h},dx:off,dy:h*0.3,a:'start'},{b:{x:p.x-off-w,y:p.y-h/2,w,h},dx:-off,dy:h*0.3,a:'end'},
             {b:{x:p.x-w/2,y:p.y-off-h,w,h},dx:0,dy:-off-h*0.22,a:'middle'},{b:{x:p.x-w/2,y:p.y+off,w,h},dx:0,dy:off+h*0.78,a:'middle'}];
    let pick=c.find(o=>!hit({...o.b,own:p.d}));
    if(!pick&&rk(p.d)<10)pick=c.find(o=>!nameHit({...o.b,own:p.d}));
    // still boxed in: a top-10 name may sit over lower-ranked bubbles, which fade behind it (names never cover names)
    if(!pick&&rk(p.d)<10){pick=c.find(o=>inFrame(o.b)&&!boxes.some(q=>(q.own==='L'||q.own==='UI')&&ov(o.b,q)));
      if(pick)boxes.forEach(q=>{if(q.bub&&q.own!==p.d&&ov(pick.b,q))faded.add(q.own);});}
    if(pick){boxes.push({...pick.b,own:'L'});LP.set(p.d,pick);showL.add(p.d);nN++;}}
  gCities.selectAll('circle').attr('opacity',d=>faded.has(d)?.35:1);gClusters.selectAll('text').attr('opacity',q=>faded.has(q.d)?0:1);
  gLabels.raise();
  gLabels.selectAll('text').filter(d=>showL.has(d)).text(txt).attr('text-anchor',d=>LP.get(d).a)
    .attr('x',d=>(proj([d.lon,d.lat])[0]*zoomK+LP.get(d).dx)/zoomK).attr('y',d=>(proj([d.lon,d.lat])[1]*zoomK+LP.get(d).dy)/zoomK);
  gLabels.selectAll('text').attr('display',d=>showL.has(d)?null:'none').attr('font-weight',d=>rk(d)<10?650:450).attr('font-size',SZ.city*u/zoomK).attr('stroke-width',3*u/zoomK);
  // country names (big countries first, more as you zoom in) and US state abbreviations (zoomed in), in the space left
  const st=STYLES[ui.style],names=[];
  const cs=zoomK<1.6?[]:features.filter(d=>d._lab&&d._e&&!d._e.est&&d._area>0.0012*(narrow?1.6:1)/(zoomK*zoomK)).sort((a,b)=>b._area-a._area).slice(0,narrow?6:12);
  for(const d of cs){const p=proj(d._lab);if(!p||!visible({lon:d._lab[0],lat:d._lab[1]}))continue;const t=dn(d._e).toUpperCase(),w=(textW(t,600,SZ.country)+t.length*1.2+10)*u,h=SZ.country*1.6*u,b={x:p[0]*zoomK-w/2,y:p[1]*zoomK-h/2,w,h,own:'C'+d.id};
    if(!hit(b)){boxes.push(b);names.push({k:'c'+d.id,x:p[0],y:p[1],t,cls:'cn'});}}
  if(STATES&&zoomK>=2.4)for(const f of STATES.fs){const p=proj(f._lab);if(!p)continue;const t=String(f.id),w=(textW(t,500,SZ.state)+t.length*0.8+8)*u,h=SZ.state*1.5*u,b={x:p[0]*zoomK-w/2,y:p[1]*zoomK-h/2,w,h,own:'S'+f.id};
    if(!hit(b)){boxes.push(b);names.push({k:'s'+f.id,x:p[0],y:p[1],t,cls:'sn'});}}
  gPlaceNames.selectAll('text').data(names,n=>n.k).join('text').attr('x',n=>n.x).attr('y',n=>n.y).attr('text-anchor','middle').attr('dominant-baseline','central')
    .attr('font-family',FONT).attr('font-size',n=>(n.cls==='cn'?SZ.country:SZ.state)*u/zoomK).attr('font-weight',n=>n.cls==='cn'?600:500)
    .attr('letter-spacing',n=>(n.cls==='cn'?1.2:0.6)*u/zoomK).attr('fill',st.text).attr('opacity',n=>n.cls==='cn'?.32:.42).text(n=>n.t);
}
function paint(){
  const st=STYLES[ui.style],R=narrow?7:4.6;
  QBR=null;
  for(const d of features){const ok=ui.showC&&passes(d._e);d._fill=ok?colorFor(d._e):st.off;d._op=ui.showC&&!ok?0.55:(ui.showC&&ui.opac&&!d._e.est?0.25+0.6*(1-(d._e.impShare||0)):0.62);}
  landSoon();
  gCities.selectAll('circle').attr('fill',d=>colorFor(d)).attr('stroke',d=>ui.sel===d?st.text:st.dot);
  gLabels.selectAll('text').attr('fill',st.text).style('stroke','var(--panel)').attr('stroke-opacity',.9);
  $('mapbox').style.background=frameBg(st);vis();legend();summary();pcard();
}
function legend(){
  const st=STYLES[ui.style];let h='';const pool=ents.filter(e=>listable(e)&&e.type===ui.rankType);
  const cutTxt={fit:CUT.fit+'+',ok:CUT.ok+'–'+(CUT.fit-1),caution:CUT.caution+'–'+(CUT.ok-1),avoid:'<'+CUT.caution,nodata:''};
  if(ui.colorBy==='tier')h=`<span class="lab">${L('verdictFor')}</span>`+TIERS.map(t=>`<span style="display:inline-flex;gap:5px;align-items:center">${sym(t)}${L('tiersShort')[t]} <span class="muted">${cutTxt[t]} (${pool.filter(e=>e.tier===t).length})</span></span>`).join('');
  else if(ui.colorBy==='quant'){if(!QBR)quantBreaks();const b=[0,...QBR.map(Math.round),100];const ramp=t=>d3.interpolateRgb(st.seq[0],st.seq[1])(t);h=`<span class="lab">${L('quantNote')}</span>`+[0,1,2,3,4].map(i=>`<span><span class="sw" style="background:${ramp(i/4)}"></span>${b[i]}–${b[i+1]}</span>`).join('');}
  else if(ui.colorBy==='limit')h=GROUPS.map(g=>`<span><span class="sw" style="background:${GROUPCOL[g]}"></span>${L('groups')[g]}</span>`).join('');
  else if(ui.colorBy==='vs')h=`<span class="ramp">${L('vsLegendLow')}<span class="bar" style="background:linear-gradient(90deg,#cf3f3f,#c9d1d7,#7a5af0)"></span>${L('vsLegendHigh')}</span>`;
  else{const lab=ui.colorBy==='score'?['0','100']:ui.colorBy==='conf'?[L('legendAll'),L('legendData')]:[L('poor'),L('great')];
    h=`<span class="ramp">${lab[0]}<span class="bar" style="background:linear-gradient(90deg,${st.seq[0]},${st.seq[1]})"></span>${lab[1]}</span>`+(ui.colorBy.startsWith('f:')?`<span><span class="sw" style="background:${st.off}"></span>${L('legendNoData')}</span>`:'');}
  $('legend').innerHTML=h+`<span><span class="sw" style="background:${st.off};opacity:.55"></span>${L('legendFiltered')}</span>`+(ui.showC&&ui.opac?`<span class="muted">${L('opacNote')}</span>`:'');
}
function summary(){const c=ents.filter(e=>listable(e)&&e.type==='country'),d=ents.filter(e=>e.type==='city');
  $('fsum').textContent=fmt(L('fsum'),{c:c.filter(passes).length,ct:c.length,d:d.filter(passes).length,dt:d.length});
  $('freset').hidden=!(ui.tiers.size<TIERS.length||ui.minScore>0||Object.keys(ui.mins).length>0);}
const TSYM={fit:'check',ok:'dot',caution:'alert',avoid:'x',nodata:'quest'};
function inkFor(c){const m=/^#?([0-9a-f]{6})$/i.exec(c||'');if(!m)return '#fff';const n=parseInt(m[1],16),l=(0.299*(n>>16)+0.587*(n>>8&255)+0.114*(n&255))/255;return l>0.6?'#111':'#fff';}
const sym=t=>`<i class="sym" aria-hidden="true" style="background:${TIERCOL[t]};color:${inkFor(TIERCOL[t])}">${IC(TSYM[t],12,2.8)}</i>`;
const chip=(tier)=>`<span class="chip">${sym(tier)}${L('tiers')[tier]}</span>`;
function pcard(){
  const P=$('pcard'),e=ui.sel;if(!e){P.hidden=true;return;}P.hidden=false;
  const vs=MODE==='yours'?`<span class="sc2">${L('youScore')} ~${r5(e.score)} (${e.lo}–${e.hi}) · ${L('adScore')} ~${r5(e.ad.score)}</span>`:`<span class="sc2">~${r5(e.score)} · ${L('likelyRange')} ${e.lo}–${e.hi} · ${L('pFitShort')} ${pct(e.pFit)}</span>`;
  P.innerHTML=`<span class="nm">${dn(e)}</span>${chip(e.tier)}${vs}<span class="meta" style="flex-basis:100%">${whyLine(e)}</span><div class="acts"><button id="pcDet">${L('details')}</button><button id="pcCmp">${ui.cmp.includes(e)?L('removeCmp'):L('addCmp')}</button><button id="pcX" aria-label="Close">${IC('x',16)}</button></div>`;
  $('pcDet').onclick=()=>$('detailSec').scrollIntoView({block:'start'});
  $('pcCmp').onclick=()=>toggleCmp(e);$('pcX').onclick=()=>{ui.sel=null;paint();detail(null);};
}
function showTip(ev,e){if(touch)return;const box=$('mapbox').getBoundingClientRect();
  tip.innerHTML=`<b>${dn(e)}</b>${e.type==='city'?' · '+countryOf(e):''}<br>${L('tiers')[e.tier]} · ~${r5(e.score)}${e.lo!=null?` <span class="muted">(${e.lo}–${e.hi})</span>`:''}${MODE==='yours'?` · ${L('adScore')} ~${r5(e.ad.score)}`:''}<br><span class="muted">${fmt(L('probLine'),{f:pct(e.pFit),t:pct(e.pTop)})}</span>${passes(e)?'':` · <span class="muted">${L('filteredOut')}</span>`}<br><span class="muted">${e.lim==='none'?L('noMajor'):FD(e.lim)}</span>`;
  let x=ev.clientX-box.left+14,y=ev.clientY-box.top+14;if(x>box.width-260)x=ev.clientX-box.left-260;if(y>box.height-90)y=ev.clientY-box.top-90;tip.style.left=Math.max(6,x)+'px';tip.style.top=Math.max(6,y)+'px';tip.style.opacity=1;}
function hideTip(){tip.style.opacity=0;}
function zoomFilter(ev){if(ev.target&&ev.target.closest&&!ev.target.closest('#map,#overlay'))return false;   // not on the zoom buttons or place card
  if(ev.type==='wheel')return ev.ctrlKey||ev.metaKey;if(ev.type.startsWith('touch'))return ev.touches&&ev.touches.length>1;return !ev.button;}
// Flat maps: the zoom listens on the map's frame (#mapbox), which never moves, and works in screen pixels. During a finger or
// mouse gesture the browser slides and scales the map as one picture (GPU, no redraw); the real redraw happens once at the end.
// (Listening on the map itself while it moves made the pointer maths drift: jitter and jumps.)
let zsel=svg;
const pxScale=()=>mapW()/VW;
const toVB=t=>{const s=pxScale();return d3.zoomIdentity.translate(t.x/s,t.y/s).scale(t.k);};
const fromVB=t=>{const s=pxScale();return d3.zoomIdentity.translate(t.x*s,t.y*s).scale(t.k);};
// move the flat map to a transform given in map units (viewBox), optionally animated
function goTo(tv,ms){if(!zoom)return;(ms?zsel.transition().duration(ms):zsel).call(zoom.transform,ui.proj==='globe'?tv:fromVB(tv));}
function setupZoom(){
  svg.on('.zoom',null).on('.drag',null);d3.select('#mapbox').on('.zoom',null);zoomK=1;_lastTV=d3.zoomIdentity;oroot.attr('transform',null);cv.style.transform='';
  if(ui.proj==='globe'){
    zsel=svg;
    zoom=d3.zoom().filter(zoomFilter).scaleExtent([1,6]).on('zoom',ev=>{proj.scale(proj._base*ev.transform.k);globeSoon();}).on('end',()=>{zoomEnd();});
    svg.call(zoom).on('mousedown.zoom',null);
    svg.call(d3.drag().filter(ev=>!ev.touches||ev.touches.length===1).on('drag',ev=>{const r=proj.rotate(),k=75/proj.scale();proj.rotate([r[0]+ev.dx*k,Math.max(-80,Math.min(80,r[1]-ev.dy*k))]);globeSoon();}).on('end',()=>{zoomEnd();}));
  }else{
    zsel=d3.select('#mapbox');let t0=null;const el=svg.node();
    zoom=d3.zoom().filter(zoomFilter).scaleExtent([1,12]).extent(()=>[[0,0],[mapW(),mapH()]]).translateExtent([[0,0],[mapW(),mapH()]])
      // every move (fingers, mouse, buttons, region views): land slides as one GPU picture; dots and names are repositioned on top
      .on('start',ev=>{t0=ev.transform;_k0=t0.k;el.style.transformOrigin='0 0';el.style.willChange='transform';})
      .on('zoom',ev=>{const t=ev.transform;if(!t0)t0=t;const k=t.k/t0.k;el.style.transform=`translate(${t.x-k*t0.x}px,${t.y-k*t0.y}px) scale(${k})`;
        zoomK=t.k;_lastTV=toVB(t);zoomSoon();})
      .on('end',ev=>{const t=ev.transform;el.style.transform='';el.style.willChange='';t0=null;zoomK=t.k;_lastTV=toVB(t);oroot.attr('transform',_lastTV);zoomEnd();});
    zsel.call(zoom);
  }
  // one finger still scrolls the page; two fingers move the map
  svg.style('touch-action','pan-y');d3.select('#mapbox').style('touch-action','pan-y');
  $('maphint').textContent=touch?L('hintTouch'):L('hintMouse');
}
// during a pan or zoom only the map moves and the dots and names keep their size (one update per frame);
// grouping, labels and colors are worked out once, when the gesture ends
let _zf=0,_gf=0,_k0=1;
function zoomSoon(){if(_zf)return;_zf=requestAnimationFrame(()=>{_zf=0;zoomFrame();});}
function zoomFrame(){const u=U(),R0=SZ.dot*u;if(ui.proj!=='globe')oroot.attr('transform',_lastTV);
  if(zoomK<_k0*0.9)gLabels.selectAll('text').filter(function(){return this.getAttribute('display')!=='none'&&!/^\d+ /.test(this.textContent);}).attr('display','none');
  gCities.selectAll('circle').attr('r',d=>(CLUSTER_HEADS.get(d)>1?R0*1.75:ui.sel===d?R0*1.35:R0)/zoomK).attr('stroke-width',d=>(ui.sel===d?2.2:1.5)*u/zoomK);
  gLabels.selectAll('text').attr('font-size',SZ.city*u/zoomK).attr('stroke-width',3*u/zoomK);
  gPlaceNames.selectAll('text').attr('font-size',n=>(n.cls==='cn'?SZ.country:SZ.state)*u/zoomK).attr('letter-spacing',n=>(n.cls==='cn'?1.2:0.6)*u/zoomK);
  gClusters.selectAll('text').attr('font-size',SZ.count*u/zoomK);
  $('mapbox').style.background=frameBg(STYLES[ui.style]);}
function globeSoon(){if(_gf)return;_gf=requestAnimationFrame(()=>{_gf=0;drawGeoFast();});}
function drawGeoFast(){cacheLand();drawLand();
  gCities.selectAll('circle').each(function(d){const p=proj([d.lon,d.lat]);this.setAttribute('cx',p[0]);this.setAttribute('cy',p[1]);});}
function zoomEnd(){if(_zf){cancelAnimationFrame(_zf);_zf=0;}_k0=zoomK;   // a frame queued during the move must not run after the final redraw
if(ui.proj==='globe')drawGeo();else{zoomFrame();drawLand();placeCities();}
  maybeHires();}
let _lastTV=d3.zoomIdentity;
addEventListener('resize',()=>{if(!zoom)return;if(ui.proj==='globe'){drawLand();return;}_mw=0;zoom.translateExtent([[0,0],[mapW(),mapH()]]);zsel.call(zoom.transform,fromVB(_lastTV));});
function rebuild(){makeProj();setupZoom();drawGeo();paint();regionView(ui.region,false);}
function focusOn(e){if(!proj||!zoom)return;let ll;if(e.type==='city')ll=[e.lon,e.lat];else{const f=features.find(d=>d._e===e);if(!f)return;ll=d3.geoCentroid(f);}
  if(ui.proj==='globe'){const r0=proj.rotate(),r1=[-ll[0],-ll[1]];d3.transition().duration(700).tween('r',()=>{const i=d3.interpolate(r0,r1);return t=>{proj.rotate(i(t));t<1?globeSoon():drawGeo();};});return;}
  const p=proj(ll),k=Math.max(zoomK,e.type==='city'?4:2.5);goTo(d3.zoomIdentity.translate(VW/2-k*p[0],VH/2-k*p[1]).scale(k),650);}

