"""Map gestures: a two-finger pinch that also drifts sideways must keep the map under the fingers (no jitter, no jumps),
both during the gesture and after release. Run after changing data or code: python3 tests/test_gestures.py"""
import sys
from harness import sync_playwright, route, CHROME, PAGE
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=CHROME); pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); pg.route('**/*',route)
    pg.goto('file://'+PAGE); pg.wait_for_timeout(900); pg.click('#skipQuiz'); pg.wait_for_timeout(500); pg.locator('#mapbox').scroll_into_view_if_needed()
    r=pg.evaluate("""async()=>{const svg=document.querySelector('#overlay'),box=svg.getBoundingClientRect();let cx=box.x+box.width/2,cy=box.y+box.height/2;
      const c=[...svg.querySelectorAll('circle')].filter(x=>x.getAttribute('display')!=='none').map(x=>{const b=x.getBoundingClientRect();return {x,d:Math.hypot(b.x+b.width/2-cx,b.y+b.height/2-cy)};}).sort((a,b)=>a.d-b.d)[0].x;
      const pos=()=>{const b=c.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2];};
      const mk=(id,x,y)=>new Touch({identifier:id,target:c,clientX:x,clientY:y});
      const fire=(type,d,ox,oy)=>{const t=[mk(1,cx+ox-d,cy+oy),mk(2,cx+ox+d,cy+oy)];c.dispatchEvent(new TouchEvent(type,{touches:type==='touchend'?[]:t,targetTouches:type==='touchend'?[]:t,changedTouches:t,bubbles:true,cancelable:true}));};
      // a realistic pinch: fingers spread AND drift sideways together; the dot should follow the fingers' midpoint
      const p0=pos();const off0=[p0[0]-cx,p0[1]-cy];fire('touchstart',20,0,0);const err=[];
      for(let i=1;i<=15;i++){const d=20+i*3,ox=i*2,oy=-i;fire('touchmove',d,ox,oy);await new Promise(r=>requestAnimationFrame(()=>r()));
        const k=d/20,exp=[cx+ox+off0[0]*k,cy+oy+off0[1]*k],q=pos();err.push(Math.round(Math.hypot(q[0]-exp[0],q[1]-exp[1])));}
      fire('touchend',65,30,-15);await new Promise(r=>setTimeout(r,300));const q=pos(),k=65/20,exp=[cx+30+off0[0]*k,cy-15+off0[1]*k];
      return {errorDuringPx:err,errorAfterReleasePx:Math.round(Math.hypot(q[0]-exp[0],q[1]-exp[1]))};}""")
    worst=max(r['errorDuringPx']+[r['errorAfterReleasePx']]);print(('PASS' if worst<=3 else 'FAIL')+f' pinch stays under the fingers (worst {worst}px)');sys.exit(0 if worst<=3 else 1)
    b.close()
