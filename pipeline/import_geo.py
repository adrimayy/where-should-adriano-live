"""Clock time and coast for every city: writes pipeline/sources/geo_extra.py.
Usage: python3 import_geo.py ne_10m_coastline.geojson
       (needs shapely and timezonefinder; reads the cities from build/final.json, so run build.py once first)

Two figures per city, both worked out from its coordinates:
  utc    the city's standard-time offset from UTC, in hours. Time zone from timezonefinder (which packages the
         timezone-boundary-builder shapes made from OpenStreetMap), offset from the tz database. Standard time, so a
         pair of cities can differ by one more hour for part of the year.
  coast  km to the nearest sea coast (Natural Earth 1:10m coastline) or to the shore of one of the world's largest
         lakes (the 1:110m lakes already in pipeline/input: the Great Lakes, Victoria, Baikal and the like).
Mountains were tried and left out: Natural Earth's range outlines and named peaks are drawn for labelling maps and miss
too much (they put Kyoto and Los Angeles far from any mountain). That needs an elevation grid.
Download: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson"""
import datetime, hashlib, json, math, os, sys
from zoneinfo import ZoneInfo
from shapely.geometry import Point, shape
from shapely.ops import nearest_points
from shapely.strtree import STRtree
from timezonefinder import TimezoneFinder

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]


def km(a, b):
    r = math.pi / 180
    s = math.sin((b[0] - a[0]) * r / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin((b[1] - a[1]) * r / 2) ** 2
    return 12742 * math.asin(math.sqrt(s))


def geoms(path, boundary=False):
    out = []
    for ft in json.load(open(path, encoding='utf8'))['features']:
        if ft['geometry']:
            g = shape(ft['geometry'])
            out.append(g.boundary if boundary else g)
    return out


def nearest_km(tree, gs, lat, lon):
    """Great-circle distance to the closest point of any shape within about 12 degrees."""
    p = Point(lon, lat)
    best = None
    for i in tree.query(p.buffer(12)):
        q = nearest_points(gs[i], p)[0]
        d = km((lat, lon), (q.y, q.x))
        best = d if best is None else min(best, d)
    return best


coast_f = sys.argv[1]
coast = geoms(coast_f) + geoms(os.path.join(HERE, 'input', 'lakes_110m.json'), boundary=True)
ct = STRtree(coast)

tf = TimezoneFinder()
def utc_offset(lat, lon):
    z = ZoneInfo(tf.timezone_at(lng=lon, lat=lat))
    offs = [z.utcoffset(datetime.datetime(2026, m, 15, 12)).total_seconds() / 3600 for m in (1, 7)]
    return min(offs)                             # standard time: daylight saving only ever adds

rows = {}
for c in json.load(open(os.path.join(ROOT, 'build', 'final.json'), encoding='utf8'))['cities']:
    name, lat, lon = c[0], c[1], c[2]
    d = nearest_km(ct, coast, lat, lon)
    rows[name] = (utc_offset(lat, lon), None if d is None else round(d))

out = os.path.join(HERE, 'sources', 'geo_extra.py')
with open(out, 'w', encoding='utf8') as f:
    f.write('"""Clock time and coast per city: (UTC offset in standard time, km to the sea or a great lake; None = more\n'
            f'than about 1,300 km). Made by pipeline/import_geo.py from Natural Earth {os.path.basename(coast_f)}\n'
            f'(sha256 {sha(coast_f)}), the 1:110m lakes in pipeline/input, and timezonefinder. Do not edit by hand."""\n'
            'GEO = {\n')
    for k in sorted(rows):
        f.write(f'    {k!r}: {rows[k]!r},\n')
    f.write('}\n')
print(len(rows), 'cities ->', out)
