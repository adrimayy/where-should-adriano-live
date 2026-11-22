"""A place's details: the score broken into the eight groups, and the block that looks outside the page (photo, real
map, links). The outside world is stubbed: a small data/places.js, a stand-in for the map library, a stand-in photo.
Run: python3 tests/test_place.py"""
import json, re, sys
from harness import sync_playwright, CHROME, route, PAGE, ROOT

fails = []
def check(name, ok, got=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else f'   got: {got}'))
    if not ok: fails.append(name)

STUB = {"asof": "2026-11-21",
        "c": {"Chicago": ["Q1297", "Chicago", {"es": 0, "fr": 0, "zh": "芝加哥"}, "chicago", "chicago-il", "Chicago_skyline.jpg", "A. <b>Walker</b>", "CC BY-SA 4.0"],
              "Amsterdam": ["Q727", "Amsterdam", {"fr": 0}],
              "Boston": ["Q100", "Boston", {}, 0, 0, "Gone.jpg", "Someone", "CC0"]},
        "n": {"840": ["Q30", "United States", {"es": "Estados Unidos", "fr": "États-Unis"}]}}
ML = """window.__ml={made:[],removed:0,markers:[]};window.maplibregl={Map:function(o){var me=this,rec={center:o.center,zoom:o.zoom,coop:o.cooperativeGestures,hint:(o.locale||{})['CooperativeGesturesHandler.MobileHelpText'],style:o.style,full:null};__ml.made.push(rec);me._h={};
me.on=function(e,a,b){(me._h[e]=me._h[e]||[]).push(b||a);return me};me.addControl=function(c){if(c&&c.onAdd)(me._ctl=me._ctl||[]).push(c.onAdd(me))};me.easeTo=function(){rec.eased=1};me.cooperativeGestures={enable:function(){rec.full=false},disable:function(){rec.full=true}};me.fitBounds=function(b){rec.box=b};me.remove=function(){__ml.removed++};me.resize=function(){};
me.addSource=function(id,s){rec.pts=s.data.features.length};me.addLayer=function(){};me.getCanvas=function(){return{style:{}}};me.touchZoomRotate={disableRotation:function(){}};
setTimeout(function(){(me._h.load||[]).forEach(function(f){f()})},30)},NavigationControl:function(){},Marker:function(){var m=this;m.setLngLat=function(l){__ml.markers.push(l);return m};m.addTo=function(){return m}}};"""
PNG = bytes.fromhex('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360606060000000050001a5f645400000000049454e44ae426082')

def routes(maplib=True):
    def rt(r):
        u = r.request.url
        if 'data/places.js' in u: return r.fulfill(body='window.ATLAS_PLACES=' + json.dumps(STUB) + ';', content_type='application/javascript')
        if 'maplibre-gl' in u:
            if not maplib: return r.abort()
            return r.fulfill(body='' if u.endswith('.css') else ML, content_type='text/css' if u.endswith('.css') else 'application/javascript')
        if 'Special:FilePath' in u: return r.abort() if 'Gone' in u else r.fulfill(body=PNG, content_type='image/png')
        return route(r)
    return rt

OPEN = """async k=>{openPlace(byKey[k]);await new Promise(r=>setTimeout(r,60));const s=document.querySelector('.see');s.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>setTimeout(r,500));}"""
SEE = """()=>{const s=document.querySelector('.see'),r=s.querySelector('.mapfig'),f=s.querySelector('figure.photo');return {links:[...s.querySelectorAll('.links a')].map(a=>[a.href,a.target,a.rel,a.textContent]),map:r&&!r.hidden,fig:f?f.querySelector('figcaption').innerHTML:null,art:f&&f.querySelector('a.pimg')?f.querySelector('a.pimg').href:null,img:f?f.querySelector('img').src:null,ml:window.__ml||null}}"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    pg = b.new_page(viewport={'width': 390, 'height': 844}); pg.route('**/*', routes())
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + PAGE); pg.wait_for_timeout(800)
    pg.evaluate("()=>fillSample()"); pg.wait_for_function("()=>document.documentElement.dataset.sim==='done'")
    # the page's own counts, for the facts file checked at the end
    live = pg.evaluate("()=>({cities:DATA.cities.length,countries:Object.keys(DATA.countries).length,factors:FACTORS.length,groups:GROUPS.filter(g=>g!=='none').length,languages:Object.keys(UI_LANGS).length})")
    # ---- what the score is made of
    bd = pg.evaluate("""()=>{const out={n:0,bad:[],order:true,rows:true};
      const some=ents.filter(listable).sort(byRank).filter((e,i)=>i%9===0).slice(0,60);
      for(const e of some){ui.open=true;ui.sel=e;detail(e);const gs=[...document.querySelectorAll('details.grp')];let sum=0,pts=0,last=1e9;
        const rows=document.querySelectorAll('details.grp .brow').length; if(rows!==FACTORS.length) out.rows=false;
        for(const g of gs){const ks=FACTORS.map(f=>f.k).filter(k=>GROUP[k]===g.dataset.g&&e.v[k]!=null&&W[k]>0);
          const w=ks.reduce((a,k)=>a+W[k],0), wx=ks.reduce((a,k)=>a+W[k]*nv(k,e.v[k]),0), shown=parseFloat(g.querySelector('summary .v').textContent)||null;
          const m=(g.querySelector('.gname small').textContent.match(/(<?\\d+)/)||[])[1]; const pc=m?(m[0]==='<'?0:+m):0;
          sum+=pc; if(w){pts+=w*(wx/w-1)/4; if(Math.abs(shown-Math.round(wx/w*10)/10)>0.11) out.bad.push([e.key,g.dataset.g,shown,wx/w]);}
          if(pc>last+1) out.order=false; last=pc;}
        const sw=FACTORS.reduce((a,f)=>a+(e.v[f.k]!=null&&W[f.k]>0?W[f.k]:0),0);
        if(Math.abs(sum-100)>4) out.bad.push([e.key,'shares',sum]); if(Math.abs(pts/sw*100-e.score)>1) out.bad.push([e.key,'score',pts/sw*100,e.score]); out.n++;}
      closePlace(); return out;}""")
    check('breakdown: each group shows the weighted mean of its factors; shares add to 100; the groups add back to the score', bd['n'] >= 40 and not bd['bad'], (bd['n'], bd['bad'][:4]))
    check('breakdown: every factor sits under exactly one group; the group that counts most comes first', bd['rows'] and bd['order'], bd)
    pg.evaluate(OPEN, 'city:New York City')
    fg = pg.evaluate("""()=>{const g=document.querySelector('details.grp[data-g=rights]');g.querySelector('summary').click();return new Promise(r=>setTimeout(()=>{
      const f=[...g.querySelectorAll('.gfig')].map(x=>x.textContent);const a=g.querySelectorAll('.gfig a[href^=http]').length;
      document.querySelector('.dstep[data-go]:last-of-type').click();setTimeout(()=>r({open:g.open,figs:f,links:a,next:document.querySelector('details.grp[data-g=rights]').open,name:document.querySelector('#detail h2').textContent}),300)},200))}""")
    check('breakdown: an opened group lists published figures with a linked source and a year', fg['open'] and fg['links'] >= 4 and sum(bool(re.search(r'20\d\d', x)) for x in fg['figs']) >= 4, fg['figs'][:3])
    check('breakdown: a group left open stays open on the next place', fg['next'] and fg['name'] != 'New York City', fg['name'])
    # ---- see the place
    pg.evaluate("()=>{closePlace();window.__ml.made.length=0;window.__ml.markers.length=0;window.__ml.removed=0}")
    pg.evaluate(OPEN, 'city:Chicago'); chi = pg.evaluate(SEE); e = pg.evaluate("()=>({lat:byKey['city:Chicago'].lat,lon:byKey['city:Chicago'].lon})")
    hrefs = [l[0] for l in chi['links']]
    check('links: Google Maps opens on the city\'s own coordinates', hrefs and f"center={e['lat']:.4f},{e['lon']:.4f}" in hrefs[0] and 'api=1' in hrefs[0], hrefs[:1])
    check('links: Google Maps, the article, a Reddit search for the place, the housing page; all open in a new tab',
          hrefs[1:] == ['https://en.wikipedia.org/wiki/Chicago', 'https://www.reddit.com/search/?q=moving%20to%20Chicago', 'https://www.zillow.com/chicago-il/rentals/'] and all(l[1] == '_blank' and 'noopener' in l[2] for l in chi['links']), hrefs)
    rs = pg.evaluate("['city:Portland ME','city:Cambridge UK','city:San José (Costa Rica)','city:Washington DC','country:620'].map(k=>decodeURIComponent(redditSearch(byKey[k]).split('q=')[1]))")
    check('Reddit: the search names the place in English, with the state spelled out where two cities share a name', rs == ['moving to Portland Maine', 'moving to Cambridge UK', 'moving to San José Costa Rica', 'moving to Washington DC', 'moving to Portugal'], rs)
    check('photo: credited with its author, its licence (linked) and its page on Commons; the author\'s name cannot carry markup', chi['fig'] and 'A. &lt;b&gt;Walker' in chi['fig'] and 'href="https://creativecommons.org/licenses/by-sa/4.0/"' in chi['fig'] and 'commons.wikimedia.org/wiki/File:Chicago_skyline.jpg' in chi['fig'], chi['fig'])
    check('photo: tapping it opens the place\'s Wikipedia article', chi['art'] == 'https://en.wikipedia.org/wiki/Chicago', chi['art'])
    fs = pg.evaluate("""()=>{const f=document.querySelector('.mapfig'),b=[...f.parentNode.querySelectorAll('button')];const out={};
      const btns=_rmap._ctl[0].querySelectorAll('button'); out.labels=[...btns].map(x=>x.getAttribute('aria-label'));
      btns[1].click(); out.on=[f.classList.contains('full'),document.body.classList.contains('map-full'),__ml.made[0].full];
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); out.off=[f.classList.contains('full'),document.body.classList.contains('map-full'),__ml.made[0].full,ui.open];
      btns[0].click(); out.eased=__ml.made[0].eased; return out}""")
    check('real map: full screen gives it the whole screen and one-finger moves; Escape leaves full screen, not the place', fs['labels'] == ['Back to Chicago', 'Full screen'] and fs['on'] == [True, True, True] and fs['off'] == [False, False, False, True] and fs['eased'] == 1, fs)
    check('real map: drawn on the city with a pin; the same two-finger rule and hint as the page\'s own map', chi['map'] and len(chi['ml']['made']) == 1 and chi['ml']['made'][0]['center'] == [e['lon'], e['lat']] and chi['ml']['made'][0]['zoom'] == 8 and chi['ml']['made'][0]['coop'] is True and chi['ml']['made'][0]['hint'] == 'Two fingers to move the map' and chi['ml']['markers'] == [[e['lon'], e['lat']]], chi['ml'])
    again = pg.evaluate("()=>{const s=document.querySelector('.see');refreshAll();return new Promise(r=>setTimeout(()=>r({same:document.querySelector('.see')===s,made:__ml.made.length,removed:__ml.removed}),500))}")
    check('the block is kept while the page redraws around it: no second map, no second download', again == {'same': True, 'made': 1, 'removed': 0}, again)
    pg.evaluate(OPEN, 'city:Amsterdam'); ams = pg.evaluate(SEE)
    check('links: a place with no housing page gets no button for it; no photo, no empty frame', [l[0].split('/')[2] for l in ams['links']] == ['www.google.com', 'en.wikipedia.org', 'www.reddit.com'] and ams['fig'] is None and ams['ml']['removed'] == 1, ams)
    pg.evaluate(OPEN, 'city:Boston'); pg.wait_for_timeout(400); bos = pg.evaluate(SEE)
    check('photo: one that does not load takes its frame away', bos['fig'] is None, bos['fig'])
    pg.evaluate("()=>closePlace()"); pg.wait_for_timeout(100)
    check('real map: closing the details gives the map back', pg.evaluate("__ml.removed") == 3 and pg.evaluate("document.querySelector('.see')") is None, pg.evaluate("__ml.removed"))
    # a country: fitted to its outline, the atlas's cities in it as dots
    pg.evaluate("()=>{$('rCountries').click()}"); pg.wait_for_timeout(200)
    pg.evaluate(OPEN, 'country:840'); us = pg.evaluate(SEE)
    m = us['ml']['made'][-1]
    check('real map: a country is fitted to its outline and shows the atlas\'s cities in it', bool(m.get('box')) and m.get('pts', 0) > 300 and us['map'], m)
    pg.select_option('#langSel', 'fr'); pg.wait_for_timeout(900); pg.evaluate(OPEN, 'country:840'); fr = pg.evaluate(SEE)
    check('links: the article in the page\'s language where there is one', any('fr.wikipedia.org/wiki/%C3%89tats-Unis' in l[0] for l in fr['links']), [l[0] for l in fr['links']])
    pg.evaluate(OPEN, 'city:Chicago'); frc = pg.evaluate(SEE)
    check('links: the same title in another language still goes to that language\'s article', any(l[0] == 'https://fr.wikipedia.org/wiki/Chicago' for l in frc['links']), [l[0] for l in frc['links']])
    check('no script errors', not errs, errs[:3])
    # the map library does not arrive: the box goes, the rest stays
    pg2 = b.new_page(viewport={'width': 390, 'height': 844}); pg2.route('**/*', routes(maplib=False))
    pg2.goto('file://' + PAGE); pg2.wait_for_timeout(800); pg2.evaluate("()=>fillSample()"); pg2.wait_for_function("()=>document.documentElement.dataset.sim==='done'")
    pg2.evaluate(OPEN, 'city:Chicago'); pg2.wait_for_timeout(600); off = pg2.evaluate(SEE)
    check('real map: when the map library does not load the box goes and the links stay', off['map'] is False and len(off['links']) == 4, off)
    b.close()

# ---- the data file itself
t = (ROOT / 'data' / 'atlas.js').read_text(encoding='utf8'); A = json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))
t = (ROOT / 'data' / 'places.js').read_text(encoding='utf8'); P = json.loads(t[t.index('=', t.index('window.')) + 1:].rstrip().rstrip(';'))
RAW = json.loads((ROOT / 'pipeline' / 'input' / 'places.json').read_text(encoding='utf8'))
names = {c[0] for c in A['cities']}
check('places: every entry is a place in the atlas, with a Wikidata id and an English article', set(P['c']) <= names and set(P['n']) <= {str(int(k)) for k in A['countries']} and all(re.fullmatch(r'Q\d+', v[0]) and v[1] for v in list(P['c'].values()) + list(P['n'].values())))
check('places: nearly every city and country has its article', len(P['c']) >= len(names) - 5 and len(P['n']) >= len(A['countries']) - 3, (len(P['c']), len(P['n'])))
check('places: no subreddit is listed (none could be confirmed; the page searches Reddit instead)', all(len(v) < 4 or not v[3] for v in P['c'].values()))
homes = {k: v[4] for k, v in P['c'].items() if len(v) > 4 and v[4]}
check('places: a housing page is listed only for a city in Zillow\'s own list, at an address in Zillow\'s form',
      all(RAW['cities'][k].get('zlist') and re.fullmatch(r'[a-z]+(-[a-z]+)*-[a-z]{2}', s) for k, s in homes.items()) and homes.get("Coeur d'Alene") == 'coeur-dalene-id' and homes.get('St. Louis') == 'saint-louis-mo' and homes.get('Chicago') == 'chicago-il' and homes.get('Washington DC') == 'washington-dc', (len(homes), homes.get("Coeur d'Alene")))
ph = [v for v in P['c'].values() if len(v) > 5 and v[5]]
check('places: every photo has a licence, and a file that is a picture', len(ph) > 400 and all(len(v) > 7 and v[7] and re.search(r'\.(jpe?g|png|webp)$', v[5], re.I) for v in ph), len(ph))
# ---- every file of the page's own asks for the same release, and it is the newest one in the changelog
html = (ROOT / 'index.html').read_text(encoding='utf8')
ver = re.search(r'<html[^>]* data-v="(\d+)"', html).group(1)
own = re.findall(r'(?:src|href)="((?:js|css|data)/[^"]+)"', html)
log = max(int(v) for v in re.findall(r'\(v(\d+)\)', (ROOT / 'docs' / 'CHANGELOG.md').read_text(encoding='utf8')))
check('release number: every file of the page\'s own carries it, and it is the newest release in the changelog',
      len(own) >= 16 and all(u.endswith('?v=' + ver) for u in own) and int(ver) == log, (ver, log, [u for u in own if not u.endswith('?v=' + ver)][:3]))
# ---- the counts the project publishes for pages elsewhere are the page's own, for this release
facts = json.loads((ROOT / 'data' / 'facts.json').read_text(encoding='utf8'))
check('facts file: its counts are the loaded page\'s own and its release is this one (run pipeline/write_facts.py)',
      {k: facts.get(k) for k in live} == live and facts.get('release') == int(ver) and re.fullmatch(r'20\d\d-\d\d-\d\d', facts.get('updated') or '')
      and set(facts) == set(live) | {'release', 'updated'}, (facts, live, ver))
print(f"\n{len(fails)} failed" if fails else "\nall passed"); sys.exit(1 if fails else 0)
