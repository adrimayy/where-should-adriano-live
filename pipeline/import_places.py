"""Outside links and a photo for every place in the atlas.

    python3 pipeline/import_places.py [--sheets DIR]

For each city and country in data/atlas.js: its Wikidata item (matched by name, then checked against the atlas's own
coordinates), the Wikipedia articles in the page's eight languages, the city's subreddit (Wikidata P3984) and one photo
(Wikidata P18) with its author and licence from Wikimedia Commons. Writes pipeline/input/places.json and
build/places_report.txt, the list of matches a person should look at. With --sheets it also saves contact sheets of
the photos, so they can be looked through in a few minutes. Needs network; Pillow only for --sheets.
Nothing here is scored: these are links out of the page. pipeline/write_places.py turns the result into data/places.js.
"""
import datetime, json, math, pathlib, re, sys, time, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = 'where-should-you-live-atlas/1.0 (https://github.com/adrimayy/where-should-adriano-live; build script)'
BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15'
WD = 'https://www.wikidata.org/w/api.php'
COMMONS = 'https://commons.wikimedia.org/w/api.php'
SPARQL = 'https://query.wikidata.org/sparql'
WIKIS = ['en', 'es', 'fr', 'pt', 'de', 'hi', 'zh', 'ar']
REPORT = []


def say(*a):
    line = ' '.join(str(x) for x in a)
    print(line, flush=True)
    REPORT.append(line)


def get(url, params=None, ua=UA, tries=4, raw=False, timeout=60):
    if params:
        url += ('&' if '?' in url else '?') + urllib.parse.urlencode(params)
    err = None
    for i in range(tries):
        try:
            rq = urllib.request.Request(url, headers={'User-Agent': ua, 'Accept-Language': 'en'})
            with urllib.request.urlopen(rq, timeout=timeout) as r:
                b = r.read()
                return (r.status, r.geturl(), b) if raw else json.loads(b)
        except urllib.error.HTTPError as e:
            err = e
            if raw and e.code in (403, 404, 410):
                return (e.code, url, b'')
            time.sleep(2 + 4 * i)
        except Exception as e:  # noqa
            err = e
            time.sleep(2 + 4 * i)
    if raw:
        return (getattr(err, 'code', 0) or 0, url, b'')
    raise err


def km(a, b, c, d):
    p = math.pi / 180
    x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(x))


def atlas():
    t = (ROOT / 'data' / 'atlas.js').read_text(encoding='utf8')
    return json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))


STATES = {}
for line in (ROOT / 'pipeline' / 'input' / 'us_metros.txt').read_text(encoding='utf8').splitlines():
    if line and not line.startswith('#') and '|' in line:
        p = line.split('|')
        STATES[p[0]] = p[1]
for n in ['East Hampton', 'Southampton', 'Montauk', 'Riverhead', 'Stony Brook', 'Port Jefferson', 'Patchogue',
          'Huntington', 'Long Beach', 'Garden City']:
    STATES[n] = 'NY'
STATE_NAME = dict(AL='Alabama', AK='Alaska', AZ='Arizona', AR='Arkansas', CA='California', CO='Colorado', CT='Connecticut',
                  DE='Delaware', DC='District of Columbia', FL='Florida', GA='Georgia', HI='Hawaii', ID='Idaho', IL='Illinois',
                  IN='Indiana', IA='Iowa', KS='Kansas', KY='Kentucky', LA='Louisiana', ME='Maine', MD='Maryland',
                  MA='Massachusetts', MI='Michigan', MN='Minnesota', MS='Mississippi', MO='Missouri', MT='Montana',
                  NE='Nebraska', NV='Nevada', NH='New Hampshire', NJ='New Jersey', NM='New Mexico', NY='New York',
                  NC='North Carolina', ND='North Dakota', OH='Ohio', OK='Oklahoma', OR='Oregon', PA='Pennsylvania',
                  PR='Puerto Rico', RI='Rhode Island', SC='South Carolina', SD='South Dakota', TN='Tennessee', TX='Texas',
                  UT='Utah', VT='Vermont', VA='Virginia', WA='Washington', WV='West Virginia', WI='Wisconsin', WY='Wyoming')
# the atlas's short name -> the name to look up, where they differ
ALIAS = {'Washington DC': 'Washington, D.C.', 'New York City': 'New York City'}
# items that are a country, a state or a region: not what a city's name should match while a settlement is on offer
BROAD = {'Q6256', 'Q3624078', 'Q35657', 'Q10864048', 'Q107390', 'Q82794', 'Q13220204', 'Q47168', 'Q28575'}


def clean(name):
    if name in ALIAS:
        return ALIAS[name]
    n = re.sub(r'\s*\(.*?\)\s*$', '', name)
    n = re.sub(r'\s+(UK|[A-Z]{2})$', '', n)
    return n.strip()


def search(q, limit=15):
    try:
        r = get(WD, dict(action='wbsearchentities', search=q, language='en', uselang='en', type='item', limit=limit, format='json'))
        return [x['id'] for x in r.get('search', [])]
    except Exception as e:  # noqa
        say('! search failed', q, e)
        return []


def fulltext(q, limit=10):
    try:
        r = get(WD, dict(action='query', list='search', srsearch=q, srnamespace=0, srlimit=limit, format='json'))
        return [x['title'] for x in r.get('query', {}).get('search', [])]
    except Exception as e:  # noqa
        say('! fulltext failed', q, e)
        return []


def facts(ids):
    """coordinates, number of Wikipedia editions and kinds for a list of items: {id: (lat, lon, links, {types})}"""
    out = {}
    ids = sorted(set(ids))
    for i in range(0, len(ids), 200):
        part = ids[i:i + 200]
        q = ('SELECT ?i (SAMPLE(?c) AS ?coord) (SAMPLE(?sl) AS ?links) '
             '(GROUP_CONCAT(DISTINCT STRAFTER(STR(?t),"entity/");separator=" ") AS ?types) WHERE { VALUES ?i { '
             + ' '.join('wd:' + x for x in part) +
             ' } OPTIONAL{?i wdt:P625 ?c} OPTIONAL{?i wikibase:sitelinks ?sl} OPTIONAL{?i wdt:P31 ?t} } GROUP BY ?i')
        try:
            rq = urllib.request.Request(SPARQL, data=urllib.parse.urlencode({'query': q, 'format': 'json'}).encode(),
                                        headers={'User-Agent': UA, 'Accept': 'application/sparql-results+json'})
            with urllib.request.urlopen(rq, timeout=90) as r:
                rows = json.loads(r.read())['results']['bindings']
        except Exception as e:  # noqa
            say('! sparql failed, falling back to the items themselves:', e)
            rows = []
            for j in range(0, len(part), 40):
                ents = get(WD, dict(action='wbgetentities', ids='|'.join(part[j:j + 40]), props='claims|sitelinks', format='json')).get('entities', {})
                for k, v in ents.items():
                    cl = v.get('claims', {})
                    co = [c['mainsnak']['datavalue']['value'] for c in cl.get('P625', []) if c['mainsnak'].get('datavalue')]
                    ty = [c['mainsnak']['datavalue']['value']['id'] for c in cl.get('P31', []) if c['mainsnak'].get('datavalue')]
                    out[k] = ((co[0]['latitude'], co[0]['longitude']) if co else (None, None)) + (len(v.get('sitelinks', {})), set(ty))
            continue
        for b in rows:
            k = b['i']['value'].rsplit('/', 1)[1]
            lat = lon = None
            m = re.match(r'Point\(([-\d.eE]+) ([-\d.eE]+)\)', b.get('coord', {}).get('value', ''))
            if m:
                lon, lat = float(m.group(1)), float(m.group(2))
            out[k] = (lat, lon, int(b.get('links', {}).get('value', 0) or 0), set(b.get('types', {}).get('value', '').split()))
        time.sleep(1)
    return out


def best_claim(claims, p):
    cs = [c for c in claims.get(p, []) if c.get('rank') != 'deprecated' and c['mainsnak'].get('datavalue')]
    cs.sort(key=lambda c: c.get('rank') != 'preferred')
    return [c['mainsnak']['datavalue']['value'] for c in cs]


def entities(ids):
    out = {}
    ids = sorted(set(ids))
    for i in range(0, len(ids), 40):
        r = get(WD, dict(action='wbgetentities', ids='|'.join(ids[i:i + 40]), props='claims|sitelinks|labels', languages='en',
                         sitefilter='|'.join(w + 'wiki' for w in WIKIS), format='json'), timeout=120)
        out.update(r.get('entities', {}))
        time.sleep(0.3)
    return out


NOT_PHOTO = re.compile(r'\b(maps?|flag|coat of arms|locator|logo|seal|emblem|escudo|bandera|wappen|karte|blason|stemma|location|coa)\b', re.I)


def photo_ok(name):
    return bool(re.search(r'\.(jpe?g|png|webp)$', name, re.I)) and not NOT_PHOTO.search(name.replace('_', ' '))


def strip_html(s):
    s = re.sub(r'<(style|script)[^>]*>.*?</\1>', '', s or '', flags=re.S | re.I)
    s = re.sub(r'<[^>]+>', '', s)
    for a, b in (('&amp;', '&'), ('&lt;', '<'), ('&gt;', '>'), ('&quot;', '"'), ('&#039;', "'"), ('&nbsp;', ' ')):
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip()


def images(files):
    out = {}
    files = sorted(set(files))
    for i in range(0, len(files), 40):
        part = files[i:i + 40]
        r = get(COMMONS, dict(action='query', format='json', prop='imageinfo', iiprop='url|size|mime|extmetadata', iiurlwidth=250,
                              iiextmetadatafilter='Artist|LicenseShortName|LicenseUrl|AttributionRequired|Copyrighted',
                              titles='|'.join('File:' + f for f in part)), timeout=120)
        q = r.get('query', {})
        back = {n['to']: n['from'] for n in q.get('normalized', [])}
        for pg in q.get('pages', {}).values():
            ii = (pg.get('imageinfo') or [None])[0]
            if not ii:
                continue
            title = back.get(pg['title'], pg['title'])[5:]
            em = ii.get('extmetadata', {})
            out[title] = dict(w=ii.get('width'), h=ii.get('height'), mime=ii.get('mime'), thumb=ii.get('thumburl'),
                              page=ii.get('descriptionurl'), artist=strip_html(em.get('Artist', {}).get('value', '')),
                              lic=em.get('LicenseShortName', {}).get('value', ''), licurl=em.get('LicenseUrl', {}).get('value', ''))
        time.sleep(0.3)
    return out


def slug(s):
    return re.sub(r'-+', '-', re.sub(r"[^a-z0-9]+", '-', s.lower())).strip('-')


def main():
    D = atlas()
    cities = [(c[0], c[1], c[2], str(c[3])) for c in D['cities']]
    countries = {k: v[0] for k, v in D['countries'].items()}
    out = dict(asof=datetime.date.today().isoformat(), cities={}, countries={})

    # ---- countries: by ISO 3166-1 numeric code
    cq = {}
    try:
        rq = urllib.request.Request(SPARQL, data=urllib.parse.urlencode({'format': 'json', 'query':
            'SELECT ?i ?n ?sl WHERE { ?i wdt:P299 ?n; wikibase:sitelinks ?sl }'}).encode(),
            headers={'User-Agent': UA, 'Accept': 'application/sparql-results+json'})
        with urllib.request.urlopen(rq, timeout=90) as r:
            for b in json.loads(r.read())['results']['bindings']:
                n = b['n']['value'].lstrip('0') or '0'
                q, sl = b['i']['value'].rsplit('/', 1)[1], int(b['sl']['value'])
                if n not in cq or sl > cq[n][1]:
                    cq[n] = (q, sl)
    except Exception as e:  # noqa
        say('! country codes by sparql failed:', e)
    for iso, name in countries.items():
        k = str(int(iso))
        if k in cq:
            out['countries'][iso] = dict(q=cq[k][0], name=name)
        else:
            ids = search(name, 5)
            out['countries'][iso] = dict(q=ids[0] if ids else None, name=name, how='by name')
            say('? country matched by name:', iso, name, ids[:1])
    cqids = {v['q'] for v in out['countries'].values() if v['q']}

    # ---- cities: candidates by name, chosen by distance from the atlas's coordinates
    cand = {}
    for name, lat, lon, iso in cities:
        cand[name] = search(clean(name))
        time.sleep(0.12)
    F = facts([q for v in cand.values() for q in v])

    def choose(name, lat, lon, ids):
        ok = []
        for rank, q in enumerate(ids):
            f = F.get(q)
            if not f or f[0] is None:
                continue
            d = km(lat, lon, f[0], f[1])
            if d <= 50:
                ok.append((q, d, f[2], rank, bool(f[3] & BROAD) or q in cqids))
        if not ok:
            return None
        narrow = [x for x in ok if not x[4]] or ok
        return max(narrow, key=lambda x: (x[2], -x[1])), narrow

    for name, lat, lon, iso in cities:
        got = choose(name, lat, lon, cand[name])
        if not got:
            st = STATE_NAME.get(STATES.get(name, ''), '')
            ids = fulltext(clean(name) + ' ' + (st or countries.get(iso, '')))
            F.update(facts([q for q in ids if q not in F]))
            got = choose(name, lat, lon, ids)
            if got:
                say('? matched by full-text search:', name, got[0][0])
        if not got:
            say('!! no match:', name, lat, lon, cand[name][:5])
            out['cities'][name] = dict(q=None)
            continue
        (q, d, sl, rank, broad), narrow = got
        first = min(narrow, key=lambda x: x[3])
        if first[0] != q:
            say('? took', q, f'({sl} editions, {d:.0f} km) over the first hit', first[0], f'({first[2]} editions, {first[1]:.0f} km):', name)
        if d > 20:
            say('? far from the atlas point:', name, q, f'{d:.0f} km')
        if broad:
            say('? only a country or region matched:', name, q)
        out['cities'][name] = dict(q=q, km=round(d, 1), editions=sl)

    # ---- the chosen items: articles, subreddit, photo
    E = entities([v['q'] for v in list(out['cities'].values()) + list(out['countries'].values()) if v.get('q')])
    files = []
    for kind in ('cities', 'countries'):
        for key, v in out[kind].items():
            e = E.get(v.get('q') or '')
            if not e:
                continue
            v['label'] = e.get('labels', {}).get('en', {}).get('value', '')
            v['wiki'] = {w: e['sitelinks'][w + 'wiki']['title'] for w in WIKIS if w + 'wiki' in e.get('sitelinks', {})}
            cl = e.get('claims', {})
            if kind == 'cities':
                subs = best_claim(cl, 'P3984')
                if subs:
                    v['sub'] = subs[0]
                imgs = [f for f in best_claim(cl, 'P18') if photo_ok(f)]
                if imgs:
                    v['img'] = imgs[0].replace(' ', '_')
                    files.append(imgs[0])
                elif best_claim(cl, 'P18'):
                    say('? photo passed over (looks like a map, flag or drawing):', key, best_claim(cl, 'P18')[0])
                iso = next(c[3] for c in cities if c[0] == key)
                cc = [x['id'] for x in best_claim(cl, 'P17')]
                want = out['countries'].get(iso, {}).get('q')
                if want and cc and want not in cc:
                    say('? country differs:', key, v['q'], 'atlas', countries.get(iso), 'wikidata', cc[:2])
                if v['label'] and slug(v['label']) != slug(clean(key)):
                    say('? label differs:', key, '->', v['label'], v['q'])
            if 'en' not in v['wiki']:
                say('? no English article:', key, v.get('q'))
    I = images(files)
    for key, v in out['cities'].items():
        if 'img' not in v:
            continue
        ii = I.get(v['img'].replace('_', ' ')) or I.get(v['img'])
        if not ii or not ii.get('w'):
            say('? photo not found on Commons:', key, v['img'])
            del v['img']
            continue
        if ii['w'] < 800 or ii['h'] < 500 or not (0.55 <= ii['w'] / ii['h'] <= 4):
            say('? photo passed over (small or an odd shape):', key, v['img'], ii['w'], ii['h'])
            del v['img']
            continue
        v.update(w=ii['w'], h=ii['h'], artist=ii['artist'][:90], lic=ii['lic'], licurl=ii['licurl'], thumb=ii['thumb'])

    # ---- subreddits: does each one exist, is it public
    blocked = 0
    for key, v in out['cities'].items():
        if 'sub' not in v or blocked > 6:
            continue
        st, _, b = get('https://www.reddit.com/r/' + urllib.parse.quote(v['sub']) + '/about.json', ua=UA, raw=True, tries=2, timeout=20)
        v['rstat'] = st
        if st == 200:
            try:
                d = json.loads(b).get('data', {})
                v['rsubs'], v['rtype'], v['r18'] = d.get('subscribers'), d.get('subreddit_type'), bool(d.get('over18'))
            except Exception:  # noqa
                v['rstat'] = -1
        elif st in (403, 429, 0):
            blocked += 1
        time.sleep(1.2)
    say('reddit: checked', sum(1 for v in out['cities'].values() if v.get('rstat') == 200), 'of',
        sum(1 for v in out['cities'].values() if 'sub' in v), '(stopped early)' if blocked > 6 else '')

    # ---- US housing: is the city in Zillow's own list of cities, and does its page answer
    zl = set()
    for u in ('https://files.zillowstatic.com/research/public_csvs/zori/City_zori_uc_sfrcondomfr_sm_month.csv',
              'https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv'):
        st, _, b = get(u, raw=True, tries=2, timeout=180)
        say('zillow list', u.rsplit('/', 1)[1], st, len(b))
        if st == 200 and b:
            import csv, io
            for row in csv.DictReader(io.StringIO(b.decode('utf8', 'replace'))):
                zl.add((row.get('RegionName', '').lower(), row.get('State', '')))
    zblocked = 0
    for name, lat, lon, iso in cities:
        st2 = STATES.get(name)
        if iso != '840' or not st2 or name not in out['cities']:
            continue
        v = out['cities'][name]
        city = v.get('label') or clean(name)
        city = {'New York City': 'New York', 'Washington, D.C.': 'Washington'}.get(city, city)
        v['st'], v['zslug'] = st2, slug(city) + '-' + st2.lower()
        v['zlist'] = (city.lower(), st2) in zl
        if zblocked <= 4:
            code, final, b = get('https://www.zillow.com/' + v['zslug'] + '/rentals/', ua=BROWSER, raw=True, tries=1, timeout=20)
            v['zstat'] = code
            if code == 200:
                m = re.search(rb'<title[^>]*>(.*?)</title>', b, re.S)
                v['ztitle'] = (m.group(1).decode('utf8', 'replace').strip()[:80] if m else '')
            else:
                zblocked += 1
            time.sleep(1.5)
    say('zillow: in its list', sum(1 for v in out['cities'].values() if v.get('zlist')), '· pages answered',
        sum(1 for v in out['cities'].values() if v.get('zstat') == 200), '(stopped early)' if zblocked > 4 else '')

    n = len(cities)
    say(f"cities {n}: matched {sum(1 for v in out['cities'].values() if v.get('q'))}, English article "
        f"{sum(1 for v in out['cities'].values() if 'en' in v.get('wiki', {}))}, subreddit "
        f"{sum(1 for v in out['cities'].values() if 'sub' in v)}, photo {sum(1 for v in out['cities'].values() if 'img' in v)}")
    (ROOT / 'pipeline' / 'input' / 'places.json').write_text(json.dumps(out, ensure_ascii=False, indent=0, sort_keys=True), encoding='utf8')
    (ROOT / 'build').mkdir(exist_ok=True)

    if '--sheets' in sys.argv:
        sheets(out, pathlib.Path(sys.argv[sys.argv.index('--sheets') + 1]))
    (ROOT / 'build' / 'places_report.txt').write_text('\n'.join(REPORT) + '\n', encoding='utf8')


def sheets(out, dest):
    """the photos, 48 to a sheet with each city's number and name, to look through"""
    import io
    from PIL import Image, ImageDraw
    dest.mkdir(parents=True, exist_ok=True)
    todo = [(k, v) for k, v in sorted(out['cities'].items()) if v.get('thumb')]
    W, H, COLS, ROWS = 200, 150, 8, 6
    sheet, draw, at, page, bad = None, None, 0, 0, 0
    for idx, (k, v) in enumerate(todo):
        if at == 0:
            sheet = Image.new('RGB', (W * COLS, (H + 16) * ROWS), 'white')
            draw = ImageDraw.Draw(sheet)
        try:
            st, _, b = get(v['thumb'], raw=True, tries=3, timeout=40)
            im = Image.open(io.BytesIO(b)).convert('RGB')
            im.thumbnail((W - 4, H - 4))
            x, y = (at % COLS) * W, (at // COLS) * (H + 16)
            sheet.paste(im, (x + 2, y + 2))
        except Exception as e:  # noqa
            bad += 1
            x, y = (at % COLS) * W, (at // COLS) * (H + 16)
            draw.text((x + 4, y + 60), 'no image', fill='red')
        draw.text((x + 3, y + H), f'{idx} {k}'[:32], fill='black')
        at += 1
        time.sleep(0.25)
        if at == COLS * ROWS or idx == len(todo) - 1:
            sheet.save(dest / f'sheet{page:02d}.jpg', quality=72)
            at, page = 0, page + 1
    (dest / 'index.txt').write_text('\n'.join(f'{i} {k} | {v["img"]}' for i, (k, v) in enumerate(todo)), encoding='utf8')
    say('contact sheets:', page, 'thumbnails that failed:', bad)


if __name__ == '__main__':
    main()
