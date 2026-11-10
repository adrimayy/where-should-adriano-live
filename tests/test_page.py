import sys, json
from playwright.sync_api import sync_playwright
PAGE = sys.argv[1]; OUT = sys.argv[2]
D3 = open('/opt/npm-tools/node_modules/d3/dist/d3.min.js').read()
TOPO = "window.topojson={feature:function(t,o){return {type:'FeatureCollection',features:o.geometries.map(function(g){return {type:'Feature',id:g.id,properties:g.properties,geometry:{type:'Polygon',coordinates:g.c}};})};}};"
def box(x0,y0,x1,y1): return [[[x0,y0],[x0,y1],[x1,y1],[x1,y0],[x0,y0]]]
geoms=[{'id':'USA','properties':{'name':'United States'},'c':box(-125,25,-67,49)},
       {'id':'MEX','properties':{'name':'Mexico'},'c':box(-117,15,-87,32)},
       {'id':'ESP','properties':{'name':'Spain'},'c':box(-9,36,3,43)},
       {'id':'CHE','properties':{'name':'Switzerland'},'c':box(6,46,10,47.8)},
       {'id':'-99','properties':{'name':'Kosovo'},'c':box(20,42,21,43)},
       {'id':'ZZZ','properties':{'name':'Nowhere'},'c':box(100,-10,110,0)}]
DM = "function Datamap(){};Datamap.prototype.worldTopo={type:'Topology',objects:{world:{type:'GeometryCollection',geometries:%s}}};window.Datamap=Datamap;" % json.dumps(geoms)
def route(r):
    u=r.request.url
    if 'd3/7.8.5' in u: return r.fulfill(body=D3, content_type='application/javascript')
    if 'topojson' in u: return r.fulfill(body=TOPO, content_type='application/javascript')
    if 'datamaps' in u: return r.fulfill(body=DM, content_type='application/javascript')
    if 'fonts.googleapis' in u: return r.fulfill(body='', content_type='text/css')  # offline: system font fallback
    if u.startswith('file:'): return r.continue_()
    return r.abort()
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
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
