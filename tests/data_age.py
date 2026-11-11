"""Flags every source whose figures describe a period that ended more than 12 months ago (Levels: a scheduled data check).
Reads the per-source years from the page code in js/ (SRCMETA). Run monthly by .github/workflows/data-age.yml, or by hand:
python3 tests/data_age.py"""
import re, datetime, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
t = ''.join(f.read_text(encoding='utf8') for f in sorted((ROOT / 'js').glob('*.js')))
meta = re.search(r'const SRCMETA=\{(.*?)\};', t, re.S).group(1)
EXEMPT = {'temp', 'tempnear'}   # 1991-2020 climate normals are the current WMO standard period, not stale data
today = datetime.date.today(); old = []; ok = 0
for key, unit, year in re.findall(r"(\w+):\['([^']*)','([^']*)'\]", meta):
    ys = re.findall(r'(19|20)(\d\d)', year)
    if not ys or key in EXEMPT: continue
    y = int(ys[-1][0] + ys[-1][1]); end = datetime.date(y, 12, 31)
    age = (today - end).days
    if age > 365: old.append((age, key, year))
    else: ok += 1
old.sort(reverse=True)
print(f"{today}: {ok} sources current; {len(old)} describe a period that ended more than 12 months ago:")
for age, key, year in old: print(f"  {key:<12} {year:<10} ended ~{age // 30} months ago")
