"""With the real network: does the real map draw from its tiles, does a photo arrive, what does the block look like?
The other tests stub the outside world; this one is for a look by eye. Run it by hand where the network is open:

    python3 tests/live_check.py [folder for the screenshots]

Needs playwright and Google Chrome."""
import json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'build' / 'live'); OUT.mkdir(parents=True, exist_ok=True)
PLACES = ['city:Chicago', 'city:Lisbon', 'country:724', 'country:840', 'city:East Hampton']
res = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    for name, vp, mob in [('phone', {'width': 390, 'height': 844}, True), ('desktop', {'width': 1280, 'height': 860}, False)]:
        ctx = b.new_context(viewport=vp, is_mobile=mob, has_touch=mob, device_scale_factor=2 if mob else 1)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('requestfailed', lambda r: errs.append('failed ' + r.url[:90]))
        pg.goto('file://' + str(ROOT / 'index.html')); pg.wait_for_timeout(4000)
        pg.evaluate('()=>fillSample()'); pg.wait_for_function("()=>document.documentElement.dataset.sim==='done'", timeout=120000)
        for key in PLACES if mob else PLACES[:2]:
            pg.evaluate("k=>openPlace(byKey[k])", key); pg.wait_for_timeout(300)
            pg.evaluate("()=>document.querySelector('.see').scrollIntoView({block:'start',behavior:'instant'})")
            try: pg.wait_for_selector('.mapfig.on', timeout=25000)
            except Exception: pass
            pg.wait_for_timeout(6000)
            r = pg.evaluate("""()=>{const s=document.querySelector('.see'),m=s.querySelector('.mapfig'),i=s.querySelector('figure img');
              return {map:m.hidden?'hidden':m.className, img:i?[i.naturalWidth,i.naturalHeight,i.currentSrc.slice(0,120)]:null, cap:(s.querySelector('.photo figcaption')||{}).textContent||null,
                      links:[...s.querySelectorAll('.links a')].map(a=>a.href)}}""")
            r.update(place=key, view=name); res.append(r)
            pg.evaluate("()=>window.scrollBy(0,-70)"); pg.wait_for_timeout(300)
            pg.screenshot(path=str(OUT / f"{name}-{key.split(':')[1].replace(' ', '_')}.png"))
        print(name, 'errors:', errs[:6]); ctx.close()
    b.close()
print(json.dumps(res, indent=1, ensure_ascii=False))
(OUT / 'result.json').write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding='utf8')
