"use strict";
/* ---------------- startup ---------------- */
(function init(){
  const h=location.hash.slice(1),params=new URLSearchParams(h.replace(/^#/,''));
  if(params.get('l')==='es'||params.get('l')==='en')LANG=params.get('l');
  if(store.get('take',null))$('resumeTake').hidden=false;
  RANKBY=store.get('rankBy','lo');
  if(params.get('t')){try{loadTake(dec(params.get('t')));applyHomes();recompute();$('vsPanel').hidden=false;setTimeout(()=>toast(L('sharedView')),60);}catch(e){}}
  else{const view=store.get('view','neutral');if(view==='adriano')setAdriano();else if(view==='yours'&&store.get('take',null)){try{loadTake(JSON.parse(store.get('take','null')));}catch(e){setNeutral();}}else setNeutral();applyHomes();}
  applyLang();refreshAll();offersUI();
})();

getWorld().then(fs=>{
  bindCountries(fs);
  snapshotAdriano();
  setTimeout(loadStates,300);
  const openDot=(d)=>{const n=[...CLUSTER.values()].filter(x=>x===d).length;if(n&&zoomK<8&&ui.proj!=='globe'){const p=proj([d.lon,d.lat]),k=Math.min(12,zoomK*2.5);goTo(d3.zoomIdentity.translate(VW/2-k*p[0],VH/2-k*p[1]).scale(k),500);}else select(d,false);};
  gCities.selectAll('circle').data(cities).join('circle').style('cursor','pointer').attr('tabindex',0).attr('role','button')
    .on('mousemove',(ev,d)=>showTip(ev,d)).on('mouseleave',hideTip)
    .on('click',(ev,d)=>{ev.stopPropagation();openDot(d);})
    .on('keydown',(ev,d)=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(d,true);$('detailSec').scrollIntoView({block:'start'});}});
  gLabels.selectAll('text').data(cities).join('text').attr('font-family',FONT).attr('paint-order','stroke').attr('stroke-linejoin','round');
  selectsUI();rebuild();refreshAll();
}).catch(()=>{$('mapbox').insertAdjacentHTML('beforeend',`<p class="maperr">${LANG==='es'?'No se pudo cargar el contorno del mapa. Los filtros, puntajes, comparaciones y el ranking siguen funcionando.':'The map outlines couldn’t load. Filters, scores, compare and the ranking still work.'}</p>`);});
