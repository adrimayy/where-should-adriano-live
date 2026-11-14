"""Pack the site into one file for claude.ai, which needs everything inline:

    python3 bundle.py     # index.html + css/ + data/atlas.js + js/ (+ js/i18n/)  ->  dist/livability-atlas.html

GitHub Pages doesn't need this; it serves index.html and the files it points to."""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
page = (ROOT / 'index.html').read_text(encoding='utf8')
safe = lambda s: re.sub(r'</(script)', r'<\\/\1', s, flags=re.I)   # an inlined script must not close its own tag

page = page.replace('<link rel="stylesheet" href="css/atlas.css">',
                    '<style>\n' + (ROOT / 'css/atlas.css').read_text(encoding='utf8') + '</style>')
def inline(m):
    src = m.group(1)
    if src.startswith('http'): return f'<script src="{src}"></script>'          # inline code runs at once, so libraries load first
    return '<script>\n' + safe((ROOT / src).read_text(encoding='utf8')) + '</script>'
page = re.sub(r'<script defer src="([^"]+)"></script>', inline, page)
assert 'defer src=' not in page and 'href="css/' not in page
# the extra interface languages normally load on demand from js/i18n/; in the one-file copy they ride along
i18n = ''.join('<script>\n' + safe(f.read_text(encoding='utf8')) + '</script>\n' for f in sorted((ROOT / 'js' / 'i18n').glob('*.js')))
page = page.replace('</body>', i18n + '</body>', 1)

# the claude.ai viewer supplies its own doctype/html/head/body skeleton
art = re.sub(r'^<!doctype html>\s*<html lang="en">\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', '', page)
art = art.replace('</head>\n<body>\n', '').replace('\n</body>\n</html>\n', '\n')
(ROOT / 'dist').mkdir(exist_ok=True)
(ROOT / 'dist/livability-atlas.html').write_text(art, encoding='utf8')
print(f'dist/livability-atlas.html {len(art.encode()) // 1024} KB')
