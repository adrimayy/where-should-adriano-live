"""data/atlas.js + index.html + js/ -> data/facts.json: the atlas's own counts, for pages elsewhere that describe it.

    python3 pipeline/write_facts.py        (build.py runs it too; run it with each release)

The atlas doesn't read this file. A page that describes the atlas fetches it and shows the counts of the release that
is live, so a new release can't leave that page behind. Every count is read from the file the page itself uses:
  - release:    the number on <html data-v> in index.html
  - updated:    the day that number last changed (kept from the file already there while the number is the same)
  - cities, countries:  data/atlas.js
  - factors, groups:    FACTORS and GROUPS in js/02-factors.js ("none" is not a group)
  - languages:  UI_LANGS in js/01-strings.js
tests/test_place.py compares each count with what the page has once it is loaded, and the release with index.html.
"""
import datetime, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'facts.json'


def read(p):
    return (ROOT / p).read_text(encoding='utf8')


def block(src, opening, closing):
    a = src.index(opening)
    return src[a + len(opening):src.index(closing, a)]


t = read('data/atlas.js')
A = json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))
factors = read('js/02-factors.js')
facts = {
    'release': int(re.search(r'<html[^>]* data-v="(\d+)"', read('index.html')).group(1)),
    'updated': None,
    'cities': len(A['cities']),
    'countries': len(A['countries']),
    'factors': len(re.findall(r"\{ k: '\w+'", block(factors, 'const FACTORS = [', '\n];'))),
    'groups': len([g for g in re.findall(r"'(\w+)'", block(factors, 'const GROUPS = [', '];')) if g != 'none']),
    'languages': len(re.findall(r"^\s+\w+: '", block(read('js/01-strings.js'), 'const UI_LANGS = {', '\n};'), re.M)),
}
assert all(isinstance(v, int) and v > 0 for k, v in facts.items() if k != 'updated'), facts
old = json.loads(OUT.read_text(encoding='utf8')) if OUT.exists() else {}
facts['updated'] = old['updated'] if old.get('release') == facts['release'] else datetime.date.today().isoformat()
OUT.write_text(json.dumps(facts, indent=2) + '\n', encoding='utf8')
print('data/facts.json', facts)
