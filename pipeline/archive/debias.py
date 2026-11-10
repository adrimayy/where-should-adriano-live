import json, re, sys
src, out = sys.argv[1], sys.argv[2]
h = open(src, encoding='utf8').read()
D = json.loads(re.search(r'<script id="data" type="application/json">([\s\S]*?)</script>', h).group(1))
# digit order: clim jobs hlth free safe move lang cult pay open perm happy  (0 = no data)
IDX = dict(clim=0, jobs=1, hlth=2, free=3, safe=4, move=5, lang=6, cult=7, pay=8, open=9, perm=10, happy=11)
def setd(s, k, v): i = IDX[k]; return s[:i] + str(v) + s[i+1:]

# 1. Freedom aligned to Freedom House 2026 statuses
FREE = {68:4, 454:4, 170:3, 32:4, 214:3, 686:3, 410:4, 191:4}
# 2. Safety from UNODC homicide rates (per 100k) checked directly
RATES = {840:5.8, 484:24.9, 170:24.9, 76:20.6, 710:43.7, 152:6.3, 32:4.5, 858:11.2, 188:17.7, 591:12.5, 404:4.9,
         566:15.7, 124:2.0, 826:1.1, 724:0.7, 392:0.2, 376:1.6, 608:4.3, 218:45.7, 604:8.6, 388:49.3, 340:31.4,
         222:7.9, 320:23.4, 214:10.9, 643:7.8, 356:2.8, 792:3.2}
def band(r): return 5 if r < 1.5 else 4 if r < 4 else 3 if r < 8 else 2 if r < 20 else 1
LOW_HOMICIDE_EST = [276,250,380,528,56,40,752,578,208,246,372,620,616,203,300,348,410,158,702,36,554,756,442,352,705,191,703]
CONFLICT = [804,760,887,434,729,728,706,4,104,466,854,562,148,140,180,332,368,231,275,422,643]
MANUAL_SAFE = {376:2, 643:2}   # security risk / war, overrides homicide band
# 3. Openness: only Expat Insider 2025 values are data; my other estimates stay, everything else is "no data"
EI_DATA = {484:5,591:5,170:5,360:5,608:5,76:4,512:4,404:5,764:4,196:4,300:4,724:4,124:3,348:3,702:3,203:2,410:2,
           756:1,208:1,40:1,752:1,276:1,246:1,578:1,414:1}
OPEN_EST = {840:5,826:3,372:4,528:3,620:4,188:4,32:4,858:4,36:4,554:4,158:4,458:4,704:4,380:3,152:3,376:3,
            784:3,356:3,792:3,604:4,218:4,250:2,56:2,442:2,616:2,233:2,352:2,156:2,682:2,634:2,392:1}
HAPPY_DATA = [246,352,208,188,752,578,528,376,442,756,554,484,372,56,36,276,705,40,203,784,682,840,616,124]
NOTES = {
 404:"Nairobi has a growing tech scene, mild weather, and English. Homicide is lower than most of Latin America, but petty crime and politics are concerns.",
 288:"Stable democracy, English-speaking, with Accra's tech scene growing. Hot and humid, lower pay.",
 686:"Stable, French-speaking, with a growing Dakar startup scene. Few tech jobs, hot.",
 646:"Kigali is very safe and orderly with fast internet, but political freedoms are limited.",
 608:"English-speaking and very welcoming to newcomers. Hot, humid, typhoons, low pay.",
 704:"Fast-growing tech outsourcing, welcoming and cheap. One-party state, hot and humid.",
 458:"Kuala Lumpur is modern, English-friendly, and affordable. Hot and humid all year.",
 504:"Welcoming, cheap, close to Spain, some tech outsourcing. Limited political freedoms.",
 566:"Lagos has Africa's biggest startup scene and huge music culture. Infrastructure and security problems.",
 360:"Expats rate it among the easiest places to settle in. Hot, humid, low pay.",
 76:"Sao Paulo is Latin America's tech capital and very social. High homicide rate nationally, Portuguese.",
 484:"Expats rate it the easiest country in the world to settle in, and Guadalajara is a real tech hub. National homicide rate is high, though it varies a lot by city.",
 170:"Among the easiest countries to settle in, with spring-like Bogota and Medellin. High homicide rate nationally.",
 68:"Rated Free again in 2026. High altitude, few tech jobs.",
 454:"Rated Free in 2026 after strong elections. Poor, few tech jobs.",
}
for k, v in D['countries'].items():
    n = int(k); s = v[1]; srcs = []
    if n in FREE: s = setd(s, 'free', FREE[n])
    if n in RATES: s = setd(s, 'safe', band(RATES[n])); srcs.append('safe')
    elif n in LOW_HOMICIDE_EST: s = setd(s, 'safe', 5)
    if n in MANUAL_SAFE: s = setd(s, 'safe', MANUAL_SAFE[n])
    if n in CONFLICT: s = setd(s, 'safe', 1)
    if n in EI_DATA: s = setd(s, 'open', EI_DATA[n]); srcs.append('open')
    elif n in OPEN_EST: s = setd(s, 'open', OPEN_EST[n])
    else: s = setd(s, 'open', 0)
    if n in HAPPY_DATA: srcs.append('happy')
    v[1] = s
    if n in NOTES: v[2] = NOTES[n]
    while len(v) < 4: v.append('')
    v[3] = ','.join(srcs)
for k, v in D['byName'].items():
    v[1] = setd(v[1], 'open', 0)
    while len(v) < 4: v.append('')
    v[3] = 'happy' if k == 'Kosovo' else ''

# 4. City safety aligned to typical homicide rates (estimates); fixes a pro-US, anti-European-tourist-city skew
CITY_SAFE = {'Chicago':2,'Seattle':3,'Washington DC':2,'Houston':2,'Atlanta':2,'Austin':3,'Denver':2,'Pittsburgh':2,
 'Phoenix':2,'Miami':3,'Raleigh':3,'London':5,'Paris':5,'Berlin':5,'Madrid':5,'Barcelona':5,'Amsterdam':5,'Dublin':5,
 'Lisbon':5,'Rome':5,'Milan':5,'Athens':5,'Istanbul':4,'Bengaluru':4,'Santiago':3,'Montevideo':2,'São Paulo':3,
 'Riverhead':5,'Long Beach':5,'Patchogue':5,'Cambridge UK':5,'Edinburgh':5,'Munich':5,'Vienna':5,'Prague':5,'Warsaw':5}
NEW = [
 ["Guadalajara",20.67,-103.35,"484","533323543554","Mexico's main tech hub with mild, dry winters, lower costs, and a big music scene. Safety varies by neighborhood."],
 ["Querétaro",20.59,-100.39,"484","523332533554","Fast-growing, safer than most Mexican cities, mild climate. Smaller and quieter."],
 ["San José (Costa Rica)",9.93,-84.08,"188","424522532435","Mild highland weather, very happy country, Spanish-speaking. Few tech jobs, car-dependent."],
 ["Panama City",8.98,-79.52,"591","123423533533","Easy to settle in, uses the US dollar, good flights. Hot and humid all year."],
 ["Kuala Lumpur",3.14,101.69,"458","134344443422","Modern, English-friendly, affordable, good transit. Hot and humid all year."],
 ["Accra",5.60,-0.19,"288","122432542022","English-speaking, stable, growing tech and music scene. Hot and humid, low pay."],
 ["Kigali",-1.94,30.06,"646","423152322021","Mild, very safe and clean. Political freedoms are limited."],
 ["Lagos",6.52,3.38,"566","131321552022","Africa's biggest startup and music scene. Traffic, infrastructure, and security problems."],
 ["Ho Chi Minh City",10.82,106.63,"704","132142143422","Energetic, cheap, growing tech. One-party state, hot and humid."]]
names = {c[0] for c in D['cities']}
D['cities'] += [c for c in NEW if c[0] not in names]
cs = D['countries']
for c in D['cities']:
    n = int(c[3]); s = c[4]
    if c[0] in CITY_SAFE: s = setd(s, 'safe', CITY_SAFE[c[0]])
    cv = cs.get(str(n).zfill(3)) or cs.get(str(n))
    if n == 840: s = setd(s, 'open', 5)
    elif c[0] == 'Hong Kong': s = setd(s, 'open', 0)
    elif cv: s = setd(s, 'open', int(cv[1][9]))
    c[4] = s
    srcs = []
    if cv:
        if 'open' in cv[3]: srcs.append('open')
        if 'happy' in cv[3]: srcs.append('happy')
    while len(c) < 7: c.append('')
    c[6] = ','.join(srcs)
D['conflict'] = CONFLICT
js = json.dumps(D, ensure_ascii=False, separators=(',', ':')).replace('],"', '],\n"').replace('],[', '],\n[')
open(out, 'w', encoding='utf8').write(js)
print('countries', len(D['countries']), 'cities', len(D['cities']))
