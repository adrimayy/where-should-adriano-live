"""How robust is Adriano's ranking, and which method choice moves it most? (a variance-based sensitivity audit.)

Five groups of choices vary at once in every run:
  weights      every weight x a random factor between about 0.5x and 2x (log-normal), each factor dropped with 15% probability
  cut-offs     every 1-5 value bent by v' = 1 + 4((v-1)/4)^g, g between 1/1.2 and 1.2: the same effect as moving all band
               cut-offs together by roughly +-10% (the cut-offs themselves are baked in at build time)
  rescaling    z-score (same average and spread) or min-max (same lowest and highest)
  combining    weighted average or geometric mean
  gap-filling  on or off
For each city the output is its rank. First-order Sobol index S = share of the rank's variance explained by that group alone;
total index ST = share it explains including interactions (Saltelli 2010 / Jansen estimators, N base samples, N(k+2) runs).
Run: python3 tests/robustness.py [N]   (default 256). Prints the top-10 share table and the Sobol table."""
import sys
from harness import sync_playwright, route, PAGE, CHROME
N = int(sys.argv[1]) if len(sys.argv) > 1 else 256
JS = r"""(N)=>{
  const A=window.__atlas, base=A.getW(), keys=Object.keys(base); let seed=11;
  const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
  const G=['weights','cut-offs','rescaling','combining','gap-filling'];
  const draw=()=>({weights:keys.map(()=>[rnd(),rnd(),rnd()]),'cut-offs':rnd(),rescaling:rnd(),combining:rnd(),'gap-filling':rnd()});
  const TR={fit:0,ok:1,caution:2,avoid:3,nodata:4};
  const cities=()=>A.ents().filter(e=>e.type==='city'&&A.listable(e));
  function run(p){const w={};keys.forEach((k,i)=>{const [d,u1,u2]=p.weights[i];const g=Math.sqrt(-2*Math.log(1-u1))*Math.cos(2*Math.PI*u2);w[k]=d<0.15?0:base[k]*Math.exp(0.35*g);});
    A.setW(w);A.setWarp(Math.exp(Math.log(1.2)*(2*p['cut-offs']-1)));A.setNormM(p.rescaling<0.5?'z':'minmax');A.setAgg(p.combining<0.5?'mean':'geo');A.setImp(p['gap-filling']<0.5);A.quick();
    const r={};cities().sort((a,b)=>TR[a.tier]-TR[b.tier]||b.score-a.score).forEach((e,i)=>r[e.name]=i+1);return r;}
  const reset=()=>{A.setW(base);A.setWarp(1);A.setNormM('z');A.setAgg('mean');A.setImp(true);A.quick();};
  reset();const baseline=cities().sort((a,b)=>TR[a.tier]-TR[b.tier]||b.score-a.score).map(e=>e.name);
  const watch=baseline.slice(0,15);
  const Am=[],Bm=[];for(let i=0;i<N;i++){Am.push(draw());Bm.push(draw());}
  const YA=Am.map(run),YB=Bm.map(run),YAB={};G.forEach(g=>{YAB[g]=Am.map((a,i)=>run({...a,[g]:Bm[i][g]}));});
  reset();
  const top10={},ranks={};[...YA,...YB].forEach(r=>{for(const n in r){(ranks[n]=ranks[n]||[]).push(r[n]);if(r[n]<=10)top10[n]=(top10[n]||0)+1;}});
  const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
  const sob={};watch.forEach(n=>{const ya=YA.map(r=>r[n]),yb=YB.map(r=>r[n]),all=ya.concat(yb),m=all.reduce((a,b)=>a+b,0)/all.length,v=all.reduce((a,b)=>a+(b-m)**2,0)/(all.length-1)||1e-9;
    sob[n]={v};G.forEach(g=>{const yab=YAB[g].map(r=>r[n]);let s1=0,st=0;for(let i=0;i<N;i++){s1+=yb[i]*(yab[i]-ya[i]);st+=(ya[i]-yab[i])**2;}sob[n][g]=[s1/N/v,st/N/2/v];});});
  return {G,baseline:baseline.slice(0,15),sob,rows:Object.keys(ranks).map(n=>({n,t10:(top10[n]||0)/(2*N),med:med(ranks[n]),base:baseline.indexOf(n)+1})).sort((a,b)=>b.t10-a.t10||a.med-b.med).slice(0,25)};
}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME); pg = b.new_page(); pg.route('**/*', route)
    pg.goto('file://' + PAGE); pg.wait_for_timeout(800); pg.click('#skipQuiz'); pg.wait_for_timeout(300)
    out = pg.evaluate(JS, N)
    print(f"{2*N} runs with every choice varied. City, share of runs in the top 10, typical rank, rank with Adriano's settings")
    for r in out['rows']:
        print(f"{r['n']:<18} {r['t10']*100:5.1f}%  {r['med']:>4}  {r['base']:>4}")
    G = out['G']
    print(f"\nWhat drives each city's rank (Sobol indices from {N*(len(G)+2)} runs). First: that choice alone. Total: including interactions.")
    print(f"{'city':<18} {'rank sd':>7}  " + '  '.join(f"{g:>17}" for g in G))
    avg = {g: [0, 0] for g in G}; tv = 0
    for n in out['baseline']:
        s = out['sob'][n]; tv += s['v']
        for g in G: avg[g][0] += s[g][0] * s['v']; avg[g][1] += s[g][1] * s['v']
        print(f"{n:<18} {s['v']**0.5:7.1f}  " + '  '.join(f"{max(0,s[g][0]):6.2f} / {max(0,s[g][1]):6.2f}  " for g in G))
    print(f"{'variance-weighted':<18} {'':>7}  " + '  '.join(f"{max(0,avg[g][0]/tv):6.2f} / {max(0,avg[g][1]/tv):6.2f}  " for g in G))
    b.close()
