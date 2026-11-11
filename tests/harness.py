"""Shared test setup: opens index.html (which loads css/, data/atlas.js and js/) in headless Chrome with every CDN stubbed, so tests run offline.
The world map is replaced by a few boxes; D3 comes from the local npm copy."""
import os, json, pathlib
from playwright.sync_api import sync_playwright  # noqa: F401  (re-exported for the tests)
ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = str(ROOT / 'index.html')
SHOTS = ROOT / 'build' / 'shots'; SHOTS.mkdir(parents=True, exist_ok=True)
CHROME = '/usr/bin/google-chrome'
D3 = open(os.environ.get('D3_PATH', '/opt/npm-tools/node_modules/d3/dist/d3.min.js')).read()
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
