"""Checks every translation in js/i18n/ against English: same keys, same list lengths, same {placeholders} and HTML tags.
Run after editing a translation: python3 tests/i18n_check.py"""
import json, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
JS = r"""
global.DATA={cities:new Array(137)};global.store={get:(k,d)=>d};global.navigator={language:'en',languages:['en']};global.document={};
const fs=require('fs');let s=fs.readFileSync(process.argv[1],'utf8').replace(/^"use strict";/,'');
eval(s+';global.OUT={en:{STR:STR.en,FSTR:FSTR.en,QSTR:QSTR.en}};global.I18N=o=>{OUT[o.code]=o;};');
for(const f of process.argv.slice(2))eval(fs.readFileSync(f,'utf8').replace(/^"use strict";/,''));
process.stdout.write(JSON.stringify(OUT));"""
files = sorted(str(p) for p in (ROOT / 'js' / 'i18n').glob('*.js'))
out = json.loads(subprocess.run(['node', '-e', JS, str(ROOT / 'js/01-strings.js'), *files], capture_output=True, text=True, check=True).stdout)
ph = lambda s: sorted(x for x in re.findall(r'\{\w+\}', s) if x != '{NCITIES}'); tags = lambda s: sorted(re.findall(r'</?\w+', s))
problems = 0
def cmp(path, a, b):
    global problems
    if isinstance(a, str):
        if not isinstance(b, str): print(path, 'not text'); problems += 1
        elif ph(a) != ph(b) or tags(a) != tags(b): print(path, 'placeholders/tags differ:', ph(a), ph(b), tags(a), tags(b)); problems += 1
    elif isinstance(a, list):
        if not isinstance(b, list) or len(a) != len(b): print(path, 'list length differs'); problems += 1
        else: [cmp(f'{path}[{i}]', x, y) for i, (x, y) in enumerate(zip(a, b))]
    elif isinstance(a, dict):
        if not isinstance(b, dict): print(path, 'not an object'); problems += 1; return
        for k in a:
            if k not in b: print(path + '.' + k, 'missing'); problems += 1
            else: cmp(path + '.' + k, a[k], b[k])
        for k in b:
            if k not in a and k != 'techl': print(path + '.' + k, 'extra key'); problems += 1
for code, t in out.items():
    if code == 'en': continue
    for part in ['STR', 'FSTR', 'QSTR']: cmp(f'{code}.{part}', out['en'][part], t[part])
print(f"{len(out) - 1} translations checked, {problems} problems"); sys.exit(1 if problems else 0)
