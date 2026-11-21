"""Smoke test: takes the quiz, opens the results and map, switches language. Desktop English and mobile Spanish.
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
        assert not pg.is_visible('#work') and not pg.is_visible('#list'), 'results are on screen before the quiz'
        pg.click('#startQuiz'); ex_seen=[]
        i=0
        # the short quiz: home, passports, languages, work, household, what matters most, then the follow-ups those
        # answers call for; the last answer opens the results
        while not pg.is_hidden('#quizPanel') and i<40:
            if pg.locator('[data-l], #qPass, #qh1, [data-a]').count():      # pickers: add French (fluent), a French passport, Madrid as home
                if pg.locator('[data-a]').count():   # what would you miss most: two that matter most, one to live without
                    for k in ('pay', 'safe', 'sea', 'sea'): pg.click(f'[data-a="{k}"]')
                    assert pg.locator('[data-a].lv2').count() == 2 and pg.locator('[data-a].lv1').count() == 1, 'priority chips did not register'
                elif pg.locator('[data-l]').count(): pg.click('[data-l="fr"]')
                elif pg.locator('#qPass').count():   # the passport list is the same searchable sheet as every other place lookup
                    pg.click('.hpbtn[data-for="qPass"]'); pg.fill('#hpSearch', 'Fran'); pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
                    assert pg.locator('[data-p="250"]').count() == 1, 'France was not added as a passport'
                else:   # the place picker: open it, search, pick the first match
                    pg.click('.hpbtn[data-for="qh1"]'); pg.wait_for_timeout(200); pg.screenshot(path=f'{OUT}/{name}-picker-open.png')
                    pg.fill('#hpSearch', 'madr'); pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/{name}-picker-search.png')
                    pg.press('#hpSearch', 'Enter'); pg.wait_for_timeout(150)
                    assert pg.input_value('#qh1') == 'city:Madrid', pg.input_value('#qh1')
                pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/{name}-picker{i}.png'); pg.click('#qNext')
            else:
                if pg.locator('.qex').count(): ex_seen.append(pg.inner_text('.qex'))
                pg.locator('.opt').nth(i % pg.locator('.opt').count()).click(); pg.wait_for_timeout(500)
            pg.wait_for_timeout(300); i+=1
        assert ex_seen, 'no data comparison was shown under the questions after choosing a home'
        assert pg.is_visible('#resPanel') and pg.is_visible('#work'), 'no results after the quiz'
        print(name,'results:',pg.inner_text('#resHead'),'| rows',pg.locator('#list .row').count())
        pg.screenshot(path=f'{OUT}/{name}-3-results.png',full_page=False)
        assert pg.evaluate('scrollY') == 0, 'the results did not open at the top'
        pg.locator('#list .row').first.click(); pg.wait_for_timeout(800)
        pg.screenshot(path=f'{OUT}/{name}-4-details.png',full_page=False)
        assert pg.is_visible('#detail') and not pg.is_visible('#list'), 'a row did not open its details'
        print(name,'details:',pg.inner_text('#detail h2'),'|',pg.inner_text('#detail .dsteps .meta'))
        pg.click('#dBack'); pg.wait_for_timeout(300)
        assert pg.is_visible('#list') and not pg.is_visible('#detail'), 'Back did not return to the list'
        pg.select_option('#langSel', 'en' if lang.startswith('es') else 'es'); pg.wait_for_timeout(300)
        print(name,'after toggle h1:',pg.inner_text('h1'),'| first row:',pg.locator('#list .row').first.inner_text().replace('\n',' ')[:80])
        pg.click('#shareTake') if not mobile else None
        pg.screenshot(path=f'{OUT}/{name}-5-full.png',full_page=True)
        ctx.close()
    b.close()
print('ERRORS:', errs if errs else 'none')
