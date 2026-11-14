"""Lakes for the map: writes pipeline/input/lakes_110m.json and lakes_50m.json.
Usage: python3 import_lakes.py ne_110m_lakes.geojson ne_50m_lakes.geojson   (needs shapely)

The map's country outlines (Datamaps, from Natural Earth's admin-0 countries) include big lakes as land: the Great Lakes,
Victoria, Baikal and the rest are part of the countries around them. Natural Earth publishes the lakes separately, at the
same scales, so the page paints them back as water. 1:110m goes with the standard outlines, 1:50m with the detailed ones.
Download: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson (ne_110m_lakes.geojson, ne_50m_lakes.geojson)."""
import json, math, os, sys, hashlib
from shapely.geometry import shape, mapping

HERE = os.path.dirname(os.path.abspath(__file__))
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]


def prep(path, min_km2, tol):
    out = []
    for ft in json.load(open(path, encoding='utf8'))['features']:
        g = shape(ft['geometry'])
        km2 = g.area * 111.32 ** 2 * math.cos(math.radians(g.centroid.y))   # rough, only to drop lakes too small to see
        if km2 < min_km2: continue
        if tol: g = g.simplify(tol, preserve_topology=True)
        m = mapping(g)
        rnd = lambda c: [rnd(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 2), round(c[1], 2)]
        out.append({'type': 'Feature', 'properties': {'name': ft['properties'].get('name')}, 'geometry': {'type': m['type'], 'coordinates': rnd(m['coordinates'])}})
    return out


for src, name, min_km2, tol in ((sys.argv[1], 'lakes_110m.json', 0, 0), (sys.argv[2], 'lakes_50m.json', 300, 0.01)):
    fs = prep(src, min_km2, tol)
    fc = {'type': 'FeatureCollection', 'source': f'Natural Earth {os.path.basename(src)} sha256 {sha(src)}'
          + (f'; lakes over {min_km2} km², simplified to {tol}°' if min_km2 else ''), 'features': fs}
    p = os.path.join(HERE, 'input', name)
    json.dump(fc, open(p, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{name}: {len(fs)} lakes, {os.path.getsize(p) // 1024} KB')
