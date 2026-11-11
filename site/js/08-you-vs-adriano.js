/* ---------------- you vs Adriano ---------------- */
function pearson(a,b){const n=a.length,ma=d3.mean(a),mb=d3.mean(b);let s=0,sa=0,sb=0;for(let i=0;i<n;i++){const x=a[i]-ma,y=b[i]-mb;s+=x*y;sa+=x*x;sb+=y*y;}return sa&&sb?s/Math.sqrt(sa*sb):1;}
function renderVs(){
  if(MODE!=='yours'){$('vsPanel').hidden=true;return;}
  const cs=ents.filter(e=>e.type==='city');
  const r=pearson(cs.map(e=>e.score),cs.map(e=>e.ad.score));
  $('matchPct').textContent=Math.max(0,Math.round(r*100))+'%';
  const yours=[...cs].sort(byRank).slice(0,5),ad=[...cs].sort(byAdRank).slice(0,5);
  const both=new Set(yours.filter(e=>ad.includes(e)));
  const li=(e,s,tag)=>`<li><button class="ghost" data-key="${e.key}" style="min-height:0;padding:0;font-size:inherit">${dn(e)}</button><span class="s">${s}</span>${tag&&both.has(e)?`<span class="shared">${L('bothLists')}</span>`:''}</li>`;
  $('vsLists').innerHTML=`<div class="col"><span class="lab" style="color:var(--you)">${L('yourTop')}</span><ol>${yours.map(e=>li(e,e.score,1)).join('')}</ol></div><div class="col"><span class="lab">${L('adTop')}</span><ol>${ad.map(e=>li(e,e.ad.score)).join('')}</ol></div>`;
  const gaps=cs.map(e=>({e,d:e.score-e.ad.score})).sort((a,b)=>b.d-a.d);
  const up=gaps.filter(g=>g.d>=5).slice(0,3),down=gaps.filter(g=>g.d<=-5).slice(-3).reverse();
  const wd=FACTORS.map(f=>({k:f.k,d:(W[f.k]||0)-PRESETS.mine[f.k]})).sort((a,b)=>b.d-a.d);
  const wUp=wd.filter(x=>x.d>=0.5).slice(0,3),wDown=wd.filter(x=>x.d<=-0.5).slice(-3).reverse();
  const ul=(arr,fn)=>arr.length?`<ul>${arr.map(fn).join('')}</ul>`:`<p class="meta">${L('noneBig')}</p>`;
  $('vsDiffs').innerHTML=`<div class="col"><span class="lab">${L('youMore')}</span>${ul(up,g=>`<li>${dn(g.e)} <span class="mono muted">${g.e.score} vs ${g.e.ad.score}</span></li>`)}</div>
   <div class="col"><span class="lab">${L('adMore')}</span>${ul(down,g=>`<li>${dn(g.e)} <span class="mono muted">${g.e.score} vs ${g.e.ad.score}</span></li>`)}</div>
   <div class="col"><span class="lab">${L('youMoreW')}</span>${ul(wUp,x=>`<li>${FL(x.k)}</li>`)}</div>
   <div class="col"><span class="lab">${L('adMoreW')}</span>${ul(wDown,x=>`<li>${FL(x.k)}</li>`)}</div>`;
  $('vsLists').querySelectorAll('button[data-key]').forEach(b=>b.onclick=()=>{select(byKey[b.dataset.key],true);$('mapSec').scrollIntoView({block:'start'});});
}

