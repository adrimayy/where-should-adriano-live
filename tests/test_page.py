"""Smoke test: takes the quiz, opens the comparison and map, switches language. Desktop English and mobile Spanish.
Screenshots go to build/shots/. Run: python3 tests/test_page.py"""
from harness import sync_playwright, route, PAGE, SHOTS, CHROME
OUT = str(SHOTS)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=CHROME)
    for name,vp,mobile,lang in [('desk-en',{'width':1280,'height':900},False,'en-US'),('mob-es',{'width':390,'height':844},True,'es-MX')]:
        ctx=b.new_context(viewport=vp,is_mobile=mobile,has_touch=mobile,locale=lang)
        pg=ctx.new_page(); pg.route('**/*',route)
        pg.on('pageerror',lambda e,n=name: errs.append(f'{n}: {e}'))
        pg.on('console',lambda m,n=name: errs.append(f'{n} console {m.type}: {m.text}') if m.type=='error' else None)
        pg.goto('file://'+PAGE); pg.wait_for_timeout(800)
        pg.screenshot(path=f'{OUT}/{name}-1-start.png',full_page=False)
        pg.click('#startQuiz')
        i=0
        while pg.locator('#qDone').count()==0 and i<20:
            pg.locator('.opt').nth(i%3).click(); pg.wait_for_timeout(260); i+=1
        pg.select_option('#qh1', 'city:Madrid')
        pg.screenshot(path=f'{OUT}/{name}-2-quizlast.png')
        pg.click('#qDone'); pg.wait_for_timeout(400)
        print(name,'match',pg.inner_text('#matchPct'),'| vs hidden',pg.is_hidden('#vsPanel'),'| mode',pg.inner_text('#modeNote')[:60])
        pg.screenshot(path=f'{OUT}/{name}-3-vs.png',full_page=False)
        pg.locator('#list .row').first.click(); pg.wait_for_timeout(800)
        pg.screenshot(path=f'{OUT}/{name}-4-map.png',full_page=False)
        print(name,'pcard:',pg.inner_text('#pcard').replace('\n',' ')[:120])
        pg.click('#lEn' if lang.startswith('es') else '#lEs'); pg.wait_for_timeout(300)
        print(name,'after toggle h1:',pg.inner_text('h1'),'| first row:',pg.locator('#list .row').first.inner_text().replace('\n',' ')[:80])
        pg.click('#shareTake') if not mobile else None
        pg.screenshot(path=f'{OUT}/{name}-5-full.png',full_page=True)
        ctx.close()
    b.close()
print('ERRORS:', errs if errs else 'none')
