"""pipeline/input/places.json -> data/places.js: the outside links and the photo credit the page shows in a place's details.

    python3 pipeline/write_places.py        (build.py runs it too)

The page loads data/places.js only when someone opens a place. Only what was checked goes out:
  - a Wikipedia article: the article Wikidata lists for the place, in each of the page's languages that has one
  - a subreddit: only when Reddit answered for it, it is public, not 18+ and has at least 200 members. Reddit
    refuses automated checks from servers, so that check is pipeline/check_reddit.py, run from a home connection;
    its result is pipeline/input/reddit_check.json. No result for a subreddit, no link.
  - a housing page (US cities, Zillow): Zillow refuses automated visits altogether, so its pages cannot be opened
    one by one. A city gets the link when it is in Zillow's own published list of cities under the same name and
    state (zlist in places.json), with the address built by Zillow's rule: lower case, hyphens for spaces,
    apostrophes and full stops dropped, "Saint" spelled out, then the state. The rule was checked on 21 Nov 2026
    against Chicago (opened) and Saint Cloud, Washington DC and Coeur d'Alene (Zillow's addresses in search results).
  - a photo: only one that passed the size checks and is not in pipeline/input/photos_skipped.txt
Per city:    [Wikidata id, English article, other-language articles, subreddit, housing page, photo file, author, licence]
Per country: [Wikidata id, English article, other-language articles]
Other-language articles: {language: title}, with 0 where the title is the same as the English one.
"""
import json, pathlib, re, unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
INPUT = ROOT / 'pipeline' / 'input'


def fold(s):
    return re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip()


def articles(v):
    w = v.get('wiki', {})
    en = w.get('en')
    return en, {k: (0 if t == en else t) for k, t in w.items() if k != 'en'}


def main():
    P = json.loads((INPUT / 'places.json').read_text(encoding='utf8'))
    skip = {}
    f = INPUT / 'photos_skipped.txt'
    if f.exists():
        for line in f.read_text(encoding='utf8').splitlines():
            if line.strip() and not line.startswith('#'):
                name, _, why = line.partition('|')
                skip[name.strip()] = why.strip()
    t = (ROOT / 'data' / 'atlas.js').read_text(encoding='utf8')
    A = json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))
    names = [c[0] for c in A['cities']]
    f = INPUT / 'reddit_check.json'
    RC = json.loads(f.read_text(encoding='utf8')).get('subs', {}) if f.exists() else {}
    live = lambda r: bool(r) and r.get('status') == 200 and r.get('type') == 'public' and not r.get('over18') and (r.get('subscribers') or 0) >= 200
    out = dict(asof=P['asof'], c={}, n={})
    n = dict(article=0, sub=0, home=0, photo=0)
    for name in names:
        v = P['cities'].get(name) or {}
        en, alt = articles(v)
        if not v.get('q') or not en:
            continue
        sub = v['sub'] if v.get('sub') and live(RC.get(v['sub'])) else 0
        home = v['zslug'] if v.get('zlist') and v.get('zslug') else 0
        row = [v['q'], en, alt, sub, home]
        if v.get('img') and name not in skip:
            row += [v['img'], v.get('artist', ''), v.get('lic', '')]
            n['photo'] += 1
        while row and row[-1] in (0, '', None):
            row.pop()
        out['c'][name] = row
        n['article'] += 1
        n['sub'] += bool(sub)
        n['home'] += bool(home)
    for iso in A['countries']:
        v = P['countries'].get(iso) or {}
        en, alt = articles(v)
        if v.get('q') and en:
            out['n'][str(int(iso))] = [v['q'], en, alt]   # the page knows countries by number, without leading zeros
    data = json.dumps(out, ensure_ascii=False, separators=(',', ':')).replace('],"', '],\n"')
    (ROOT / 'data' / 'places.js').write_text(
        '// Outside links and photo credits for a place\'s details. Made by pipeline/write_places.py from pipeline/input/places.json\n'
        '// (collected by pipeline/import_places.py): edit those, not this file.\n'
        'window.ATLAS_PLACES=' + data + ';\n', encoding='utf8')
    print(f"places: {n['article']} of {len(names)} cities with an article, {n['photo']} photos ({len(skip)} set aside by hand), "
          f"{n['sub']} subreddits, {n['home']} housing pages; {len(out['n'])} countries; "
          f"data/places.js {(ROOT / 'data' / 'places.js').stat().st_size // 1024} KB")


if __name__ == '__main__':
    main()
