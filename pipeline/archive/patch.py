import json, re, sys
p = sys.argv[1]
h = open(p, encoding='utf8').read()
m = re.search(r'(<script id="data" type="application/json">)([\s\S]*?)(</script>)', h)
D = json.loads(m.group(2))

def iso(n): return str(n).zfill(3)

PAY = {840:4,124:3,484:2,826:3,372:3,756:4,276:3,528:3,208:3,752:3,578:3,246:3,40:3,56:3,442:4,250:3,724:2,620:2,380:2,
       203:3,616:3,233:3,376:3,784:4,702:4,392:3,410:3,158:3,156:3,356:2,36:3,554:2,152:2,32:2,858:2,76:2,170:2,188:2,
       348:2,300:2,352:2,191:2,705:2,440:2,428:2,642:2,100:2,458:2,634:4,682:4,414:3,703:2,196:2,792:2,688:2,604:2}
OPEN = {484:5,591:5,170:5,360:5,608:5,404:5,512:4,76:4,764:4,196:4,300:4,724:4,620:4,188:4,32:4,858:4,36:4,554:4,
        158:4,458:4,704:4,372:4,840:5,124:3,826:3,528:3,348:3,702:3,380:3,152:3,376:3,784:3,356:3,792:3,604:4,218:4,
        203:2,410:2,250:2,56:2,442:2,616:2,233:2,352:2,156:2,682:2,634:2,
        756:1,208:1,40:1,752:1,276:1,246:1,578:1,414:1,392:1}
PERM = {840:5,484:5,124:4,826:4,36:4,554:4,372:3,724:3,528:3,276:3,620:3,392:3,158:3,702:3,170:3,152:3,32:3,858:3,
        604:3,218:3,188:3,591:3,756:1}
HAPPY5 = [246,352,208,188,752,578,528,376,442,756]
HAPPY4 = [554,484,372,56,36,276,705,40,203,784,682,840,616,124]
HAPPY3 = [826,440,158,702,858,250,724,380,76,152,32,414,642,222,320,591,558,398,688,233,703,428,860]
HAPPY1 = [4,694,454,716,422,180,72,887,426,748,356,834,894,231,430,332,50,144,586,804,768,450,800]
def happy(n):
    if n in HAPPY5: return 5
    if n in HAPPY4: return 4
    if n in HAPPY3: return 3
    if n in HAPPY1: return 1
    return 2

def ext(n):
    return f"{PAY.get(n,1)}{OPEN.get(n,3)}{PERM.get(n,2)}{happy(n)}"

for k,v in D['countries'].items():
    n = int(k); s = v[1]
    if n == 840: s = s[:2] + '1' + s[3:]
    v[1] = s[:8] + ext(n)
D['byName']['Kosovo'][1] = D['byName']['Kosovo'][1][:8] + '2334'
D['byName']['N. Cyprus'][1] = D['byName']['N. Cyprus'][1][:8] + '2422'
D['byName']['Somaliland'][1] = D['byName']['Somaliland'][1][:8] + '1321'

CPAY = {'New York City':3,'San Francisco':3,'Seattle':4,'Boston':3,'Washington DC':3,'Chicago':4,'Pittsburgh':4,'Denver':4,
 'Los Angeles':2,'San Diego':3,'Austin':4,'Atlanta':4,'Raleigh':4,'Houston':4,'Miami':3,'Phoenix':4,'Toronto':2,'Vancouver':1,
 'Montreal':3,'Mexico City':2,'Tampico':1,'Bogotá':2,'São Paulo':2,'Buenos Aires':2,'Santiago':2,'Montevideo':2,'London':2,
 'Cambridge UK':2,'Edinburgh':3,'Dublin':2,'Amsterdam':2,'Berlin':3,'Munich':3,'Paris':2,'Zurich':4,'Bern':4,'Geneva':3,
 'Vienna':3,'Copenhagen':3,'Stockholm':3,'Oslo':3,'Helsinki':3,'Tallinn':3,'Prague':3,'Warsaw':3,'Madrid':2,'Barcelona':2,
 'Lisbon':2,'Milan':2,'Rome':2,'Athens':2,'Istanbul':2,'Tel Aviv':3,'Dubai':4,'Taipei':3,'Tokyo':3,'Seoul':3,'Singapore':4,
 'Hong Kong':3,'Shanghai':3,'Shenzhen':3,'Beijing':3,'Bengaluru':3,'Sydney':2,'Melbourne':3,'Auckland':2,'Cape Town':2,
 'Nairobi':2,'Medellín':2,'Moscow':2}
missing = []
for c in D['cities']:
    n = int(c[3]); s = c[4]
    if n == 840: s = s[:2] + ('2' if c[0]=='Boston' else '1') + s[3:]
    if c[0] not in CPAY: missing.append(c[0])
    if c[0] == 'Hong Kong': e = f"{CPAY[c[0]]}322"   # its own openness, permit, happiness
    else: e = f"{CPAY.get(c[0],2)}{OPEN.get(n,3)}{PERM.get(n,2)}{happy(n)}"
    c[4] = s[:8] + e
print('cities missing pay:', missing)
js = json.dumps(D, ensure_ascii=False, separators=(',',':'))
js = js.replace('],"', '],\n"')
h = h[:m.start(2)] + '\n' + js + '\n' + h[m.end(2):]
open(p,'w',encoding='utf8').write(h)
print('ok', len(D['countries']), len(D['cities']))
