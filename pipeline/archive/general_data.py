import json, sys, unicodedata
S = sys.argv[1]
D = json.load(open(f'{S}/data_i18n.json', encoding='utf8'))
IDX = dict(clim=0, jobs=1, hlth=2, free=3, safe=4, move=5, lang=6, cult=7, pay=8, open=9, perm=10, happy=11)
def setd(s, k, v): i = IDX[k]; return s[:i] + str(v) + s[i+1:]
def norm(n): return unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode().lower().replace('.', '').strip()

# ---------- name -> numeric ----------
N2I = {norm(v[0]): int(k) for k, v in D['countries'].items()}
ALIAS = {'czechia':203,'turkiye':792,'turkey':792,'viet nam':704,'vietnam':704,'russian federation':643,'russia':643,'lao pdr':418,'laos':418,
 'syrian arab republic':760,'syria':760,'democratic republic of the congo':180,'congo':178,"cote d'ivoire":384,'bosnia and herzegovina':70,
 'north macedonia':807,'dominican republic':214,'central african republic':140,'equatorial guinea':226,'palestine':275,'eswatini':748,
 'south korea':410,'taiwan':158,'united states':840,'united kingdom':826,'united arab emirates':784,'saudi arabia':682,'kosovo':'Kosovo',
 'trinidad and tobago':780,'papua new guinea':598,'solomon islands':90,'timor-leste':626,'guinea-bissau':624,'sierra leone':694,
 'south africa':710,'south sudan':728,'new zealand':554,'costa rica':188,'el salvador':222,'sri lanka':144,'burkina faso':854,'puerto rico':630,
 'belize':84,'kyrgyzstan':417,'tajikistan':762,'mauritania':478,'comoros':None,'mauritius':None,'malta':None,'bahrain':None,'seychelles':None,
 'barbados':None,'cabo verde':None,'maldives':None,'samoa':None,'tonga':None,'sao tome and principe':None,'grenada':None,'palau':None,
 'marshall islands':None,'kiribati':None,'federated states of micronesia':None,'hong kong':'HK'}
def iso(name):
    n = norm(name)
    if n in ALIAS: return ALIAS[n]
    return N2I.get(n)

# ---------- World Happiness Report 2026 (full ranking) ----------
WHR = "Finland;Iceland;Denmark;Costa Rica;Sweden;Norway;Netherlands;Israel;Luxembourg;Switzerland;New Zealand;Mexico;Ireland;Belgium;Australia;Kosovo;Germany;Slovenia;Austria;Czechia;United Arab Emirates;Saudi Arabia;United States;Poland;Canada;Taiwan;Belize;Lithuania;United Kingdom;Serbia;Uruguay;Brazil;Kazakhstan;Romania;France;Singapore;El Salvador;Italy;Panama;Kuwait;Spain;Guatemala;Malta;Argentina;Vietnam;Estonia;Bosnia and Herzegovina;Latvia;Jamaica;Chile;Nicaragua;Thailand;Uzbekistan;Slovakia;Bahrain;Philippines;Paraguay;Oman;Ecuador;Montenegro;Japan;Cyprus;Honduras;Dominican Republic;China;Kyrgyzstan;South Korea;Colombia;Portugal;Croatia;Malaysia;Peru;Mauritius;Hungary;Mongolia;Trinidad and Tobago;Moldova;Bolivia;Russia;Venezuela;Libya;North Macedonia;Algeria;Bulgaria;Greece;Albania;Indonesia;Tajikistan;Armenia;Hong Kong;Georgia;Laos;Mozambique;Turkey;Iraq;Gabon;Iran;Côte d'Ivoire;Nepal;Cameroon;South Africa;Azerbaijan;Niger;Pakistan;Tunisia;Nigeria;Senegal;Namibia;Palestine;Kenya;Ukraine;Morocco;Guinea;Mali;Ghana;India;Somalia;Uganda;Jordan;Mauritania;Cambodia;Congo;Burkina Faso;Benin;Chad;Lesotho;Bangladesh;Gambia;Myanmar;Liberia;Togo;Madagascar;Zambia;Sri Lanka;Ethiopia;Comoros;Eswatini;Tanzania;Egypt;Democratic Republic of the Congo;Lebanon;Yemen;Botswana;Zimbabwe;Malawi;Sierra Leone;Afghanistan".split(';')
def whr_band(r): return 5 if r <= 10 else 4 if r <= 25 else 3 if r <= 50 else 2 if r <= 100 else 1
HAPPY = {}
for r, n in enumerate(WHR, 1):
    i = iso(n)
    if i is not None: HAPPY[i] = whr_band(r)

# ---------- Expat Insider 2025 published ranks ----------
EI = {'Mexico':1,'Panama':2,'Colombia':3,'Indonesia':4,'Philippines':5,'Brazil':6,'Oman':7,'Kenya':8,'Thailand':9,'Cyprus':10,'Spain':13,'Greece':14,
      'Canada':27,'Hungary':30,'Singapore':33,'Czechia':37,'South Korea':38,'Switzerland':39,'Denmark':40,'Austria':41,'Sweden':42,'Germany':43,'Finland':44,'Norway':45,'Kuwait':46}
def ei_band(r): return 5 if r <= 9 else 4 if r <= 18 else 3 if r <= 30 else 2 if r <= 38 else 1
OPEN_DATA = {iso(n): ei_band(r) for n, r in EI.items()}

# ---------- Women, Peace and Security Index 2025/26 ----------
WPS = "Denmark;Iceland;Norway;Sweden;Finland;Luxembourg;Belgium;Netherlands;Austria;New Zealand;Australia;Estonia;Ireland;Slovenia;Lithuania;Canada;Latvia;Singapore;Switzerland;United Arab Emirates;Germany;Japan;France;United Kingdom;Spain;Portugal;Poland;Taiwan;Serbia;Malta;United States;Czechia;Hungary;Costa Rica;Uruguay;Moldova;South Korea;Bulgaria;Italy;Seychelles;Hong Kong;Barbados;Romania;Mongolia;Georgia;Slovakia;Argentina;Croatia;Grenada;North Macedonia;Suriname;Cyprus;Guyana;Paraguay;Bahrain;Armenia;Thailand;Oman;Bosnia and Herzegovina;Greece;Montenegro;Cabo Verde;Belarus;Chile;Palau;Saudi Arabia;Malaysia;Albania;Fiji;Kuwait;Qatar;Kazakhstan;Viet Nam;Turkmenistan;Russian Federation;Puerto Rico;Sri Lanka;Maldives;Jamaica;Bolivia;Peru;Kosovo;Lao PDR;Israel;Kyrgyzstan;Panama;El Salvador;Jordan;China;Samoa;Tajikistan;Tonga;Trinidad and Tobago;Gabon;Mauritius;Indonesia;Dominican Republic;Uzbekistan;Bhutan;Tunisia;Marshall Islands;Morocco;Timor-Leste;Belize;Cambodia;Türkiye;Nicaragua;Botswana;Solomon Islands;Senegal;Azerbaijan;Kiribati;Federated States of Micronesia;South Africa;Vanuatu;Ukraine;Ghana;Venezuela;Brazil;Nepal;Rwanda;Tanzania;Algeria;Sao Tome and Principe;Egypt;Lesotho;Ecuador;Iran;Libya;Namibia;India;Philippines;Angola;Sierra Leone;Comoros;Zimbabwe;Côte d'Ivoire;Benin;Uganda;Congo;Lebanon;Zambia;Togo;Guatemala;Honduras;Djibouti;Mexico;Eswatini;Colombia;Malawi;Mozambique;Kenya;Gambia;Guinea;Bangladesh;Ethiopia;Liberia;Iraq;Guinea-Bissau;Burkina Faso;Papua New Guinea;Nigeria;Niger;Mali;Chad;Mauritania;Palestine;Madagascar;Pakistan;Somalia;Cameroon;Myanmar;South Sudan;Burundi;Democratic Republic of the Congo;Haiti;Sudan;Syrian Arab Republic;Central African Republic;Yemen;Afghanistan".split(';')
def wps_band(r): return 5 if r <= 20 else 4 if r <= 45 else 3 if r <= 90 else 2 if r <= 140 else 1
WOMEN = {}
for r, n in enumerate(WPS, 1):
    i = iso(n)
    if i is not None and i not in WOMEN: WOMEN[i] = wps_band(r)

# ---------- LGBTQ+ equality: Equaldex index where published, legal-status estimate elsewhere ----------
EQD = {'United States':65,'Canada':78,'Mexico':71,'Costa Rica':69,'Belize':50,'Honduras':46,'Nicaragua':44,'El Salvador':43,'Panama':40,
 'Dominican Republic':37,'Guatemala':36,'Haiti':29,'Trinidad and Tobago':27,'Jamaica':22,'Germany':80,'Belgium':78,'Netherlands':77,'France':74,
 'Austria':74,'Switzerland':70,'Luxembourg':67,'New Zealand':80,'Australia':78,'Fiji':52,'Vanuatu':39,'Papua New Guinea':25,'Solomon Islands':22,
 'Iceland':93,'Norway':89,'Denmark':82,'Sweden':77,'Finland':76,'Israel':62,'Cyprus':51,'Turkey':33,'Armenia':26,'Azerbaijan':19,'Palestine':18,
 'Syria':18,'Jordan':15,'Lebanon':14,'Saudi Arabia':13,'United Arab Emirates':12,'Iraq':12,'Yemen':10,'Qatar':7,'Kuwait':6,'Oman':2,'Nepal':71,
 'India':52,'Bhutan':51,'Tajikistan':40,'Pakistan':34,'Sri Lanka':29,'Bangladesh':26,'Kazakhstan':23,'Kyrgyzstan':22,'Uzbekistan':19,
 'Turkmenistan':17,'Iran':6,'Afghanistan':1,'Bahamas':30}
def eq_band(x): return 5 if x >= 75 else 4 if x >= 60 else 3 if x >= 45 else 2 if x >= 25 else 1
LGBT_DATA = {}
for n, x in EQD.items():
    i = iso(n)
    if i is not None: LGBT_DATA[i] = eq_band(x)
LGBT_EST = {724:5,620:5,826:5,372:5,380:3,300:4,705:4,233:4,203:3,703:2,616:3,348:2,642:2,100:2,191:3,688:3,70:3,499:3,8:3,807:3,428:3,440:3,
 498:2,804:3,112:1,643:1,268:2,858:5,32:5,152:5,170:5,76:4,218:4,604:3,68:3,600:2,862:2,328:2,740:3,392:3,410:2,158:5,156:2,496:3,764:4,704:3,
 608:3,360:2,458:1,702:3,96:1,116:3,418:3,104:1,626:3,710:4,516:3,72:3,508:3,24:3,404:1,800:1,834:1,566:1,288:1,686:1,504:1,12:1,788:1,818:1,
 434:1,231:1,729:1,120:1,646:2,266:2,716:1,894:1,454:1,478:1,706:1,384:2,204:2,854:1,466:1,562:2,148:1,140:2,178:2,180:2,226:2,450:2,426:2,
 748:1,430:1,694:1,324:1,270:1,768:1,232:1,262:2,108:1,728:1,304:5,630:4,238:4,408:1,192:5,44:2,540:4,732:1,10:0,260:0}

# ---------- cost of living (5 = cheapest), for remote workers ----------
COST1 = [756,578,352,442]
COST2 = [840,826,372,208,752,246,528,56,40,276,250,36,554,124,376,784,634,414,702,304,630,238]
COST3 = [724,620,380,392,410,158,300,705,191,703,233,428,440,203,616,858,682,512,196,540]
COST4 = [484,76,792,156,458,764,32,152,170,604,188,591,348,642,100,688,710,643,398,8,499,70,807,218,214,388,780,44,268,51,31,404,288,646,566,24,72,516,96]
def cost(n): return 1 if n in COST1 else 2 if n in COST2 else 3 if n in COST3 else 4 if n in COST4 else 5
CITY_COST = {'New York City':1,'San Francisco':1,'Zurich':1,'Geneva':1,'Bern':2,'London':1,'Singapore':1,'Hong Kong':1,'Oslo':1,'Copenhagen':2,
 'Dublin':1,'Boston':1,'Los Angeles':1,'Seattle':2,'Washington DC':2,'San Diego':1,'Sydney':2,'Vancouver':2,'Tel Aviv':1,'Dubai':2,'Paris':2,
 'Amsterdam':2,'Munich':2,'Tokyo':3,'Seoul':3,'Stockholm':2,'Helsinki':3,'Toronto':2,'Melbourne':2,'Auckland':2,'East Hampton':1,'Southampton':1,
 'Montauk':1,'Garden City':1,'Huntington':2,'Long Beach':2,'Stony Brook':2,'Port Jefferson':2,'Patchogue':2,'Riverhead':3,'Chicago':3,'Austin':3,
 'Denver':3,'Miami':2,'Atlanta':3,'Raleigh':3,'Houston':3,'Phoenix':3,'Pittsburgh':4,'Philadelphia':3,'Minneapolis':3,'Portland':2,'Montreal':3,
 'Ottawa':3,'Berlin':3,'Madrid':3,'Barcelona':3,'Lisbon':3,'Milan':3,'Rome':3,'Vienna':3,'Prague':4,'Warsaw':4,'Kraków':4,'Tallinn':3,'Edinburgh':3,
 'Manchester':3,'Cambridge UK':2,'Frankfurt':2,'Hamburg':3,'Utrecht':2,'Rotterdam':3,'Valencia':4,'Málaga':4,'Porto':4,'Athens':4,'Istanbul':4,
 'Taipei':3,'Shanghai':3,'Beijing':3,'Shenzhen':3,'Kuala Lumpur':5,'Ho Chi Minh City':5,'Bengaluru':5,'Mexico City':4,'Guadalajara':4,'Querétaro':5,
 'Monterrey':4,'Mérida':5,'Bogotá':5,'Medellín':5,'Lima':4,'Santiago':4,'Buenos Aires':4,'Montevideo':3,'São Paulo':4,'San José (Costa Rica)':3,
 'Panama City':3,'Tampico':5,'Cape Town':4,'Nairobi':4,'Accra':4,'Lagos':4,'Kigali':4,'Moscow':4,'Brisbane':3,'Wellington':3,'Ljubljana':3}

# ---------- new cities ----------
NEW = [
 ["Philadelphia",39.95,-75.17,"840","331524544","Walkable, historic, and much cheaper than NYC, an hour away by train. Big hospital and university sector. Higher crime than most US peers.","Caminable, histórica y mucho más barata que NYC, a una hora en tren. Gran sector hospitalario y universitario. Más delincuencia que ciudades similares de EE. UU.","Filadelfia"],
 ["Minneapolis",44.98,-93.27,"840","231523534","Affordable, green, and strong in healthcare and corporate jobs. Very cold winters.","Accesible, verde y fuerte en salud y empleos corporativos. Inviernos muy fríos.","Minneapolis"],
 ["Portland",45.52,-122.68,"840","431523543","Mild, green, bike-friendly, with a big creative scene. Smaller job market than Seattle.","Templada, verde, amigable con la bici y con mucha escena creativa. Mercado laboral más pequeño que Seattle.","Portland"],
 ["Ottawa",45.42,-75.70,"124","234543433","Calm, safe, bilingual capital with government and tech jobs. Long, cold winters.","Capital tranquila, segura y bilingüe, con empleos públicos y tech. Inviernos largos y fríos.","Ottawa"],
 ["Valencia",39.47,-0.38,"724","325555543","Beach, great food, bikeable, and cheaper than Madrid or Barcelona. Humid summers, smaller job market.","Playa, gran comida, ideal para la bici y más barata que Madrid o Barcelona. Veranos húmedos, mercado laboral más pequeño.","Valencia"],
 ["Málaga",36.72,-4.42,"724","335554533","Sunny, mild winters and a fast-growing tech hub. Hot summers, smaller city.","Soleada, inviernos templados y un polo tech en rápido crecimiento. Veranos calurosos, ciudad más pequeña.","Málaga"],
 ["Porto",41.15,-8.61,"620","524554343","Mild, beautiful, and affordable, with a growing tech scene. Low local salaries, Portuguese.","Templada, bella y accesible, con escena tech en crecimiento. Sueldos locales bajos, portugués.","Oporto"],
 ["Utrecht",52.09,5.12,"528","335555432","Compact, bikeable university city 30 minutes from Amsterdam. Tight, expensive housing.","Ciudad universitaria compacta y para la bici, a 30 minutos de Ámsterdam. Vivienda escasa y cara.","Utrecht"],
 ["Rotterdam",51.92,4.48,"528","335545443","Modern, international port city with cheaper housing than Amsterdam. Gray winters.","Ciudad portuaria moderna e internacional, con vivienda más barata que Ámsterdam. Inviernos grises.","Róterdam"],
 ["Manchester",53.48,-2.24,"826","334544553","Huge music scene, big universities, and cheaper than London. Rainy, short winter days.","Enorme escena musical, grandes universidades y más barata que Londres. Lluviosa, días de invierno cortos.","Mánchester"],
 ["Frankfurt",50.11,8.68,"276","345545333","Europe's banking capital and a major airport hub. Smaller and more businesslike than Berlin.","Capital bancaria de Europa y gran centro aéreo. Más pequeña y empresarial que Berlín.","Fráncfort"],
 ["Hamburg",53.55,9.99,"276","345555343","Green, wealthy port city with media and tech jobs. Gray, rainy winters.","Ciudad portuaria verde y rica, con empleos en medios y tech. Inviernos grises y lluviosos.","Hamburgo"],
 ["Kraków",50.06,19.94,"616","233454343","Beautiful, affordable, and full of students, with growing tech offices. Cold winters, Polish.","Bella, accesible y llena de estudiantes, con oficinas tech en crecimiento. Inviernos fríos, polaco.","Cracovia"],
 ["Ljubljana",46.06,14.51,"705","324554333","Small, green, very safe capital near the Alps. Limited job market.","Capital pequeña, verde y muy segura cerca de los Alpes. Mercado laboral limitado.","Liubliana"],
 ["Brisbane",-27.47,153.03,"036","235553533","Sunny, relaxed, and cheaper than Sydney. Humid summers, very far from the Americas.","Soleada, relajada y más barata que Sídney. Veranos húmedos, muy lejos de las Américas.","Brisbane"],
 ["Wellington",-41.29,174.78,"554","424554532","Compact, creative capital with mild weather. Windy, small job market, very far away.","Capital compacta y creativa con clima templado. Ventosa, mercado laboral pequeño, muy lejos.","Wellington"],
 ["Monterrey",25.69,-100.32,"484","133322533","Mexico's industrial and business capital with strong pay. Very hot, car-dependent.","Capital industrial y de negocios de México, con buenos sueldos. Muy calurosa, depende del auto.","Monterrey"],
 ["Mérida",20.97,-89.62,"484","123343534","Mexico's safest big city, colonial and affordable. Hot and humid most of the year.","La gran ciudad más segura de México, colonial y accesible. Caliente y húmeda gran parte del año.","Mérida"],
 ["Lima",-12.05,-77.04,"604","422332542","Mild year-round with a world-class food scene. Gray skies, traffic, few tech jobs.","Templada todo el año, con una escena gastronómica de primer nivel. Cielos grises, tráfico, pocos empleos tech.","Lima"]]
names = {c[0] for c in D['cities']}
for n in NEW:
    if n[0] in names: continue
    name, lat, lon, iso_, s, en, es, nes = n
    D['cities'].append([name, lat, lon, iso_, s + '000', en, '', es, nes])

# ---------- field-specific job markets for cities: finance, health, creative, academia (0 = same as general) ----------
FIELDS = {'New York City':'5555','San Francisco':'4435','Seattle':'3434','Boston':'4535','Washington DC':'3434','Chicago':'4444','Pittsburgh':'3424',
 'Denver':'3333','Los Angeles':'3454','San Diego':'2434','Austin':'3344','Atlanta':'3443','Raleigh':'3424','Houston':'3533','Miami':'4442','Phoenix':'3322',
 'Philadelphia':'3545','Minneapolis':'3533','Portland':'2343','Toronto':'5444','Vancouver':'3344','Montreal':'3355','Ottawa':'2323','Mexico City':'4354',
 'Guadalajara':'3343','Monterrey':'4323','London':'5455','Cambridge UK':'2425','Edinburgh':'4445','Manchester':'3444','Dublin':'4333','Amsterdam':'4444',
 'Utrecht':'3425','Rotterdam':'3433','Berlin':'3454','Munich':'4435','Frankfurt':'5423','Hamburg':'4443','Paris':'5455','Zurich':'5435','Geneva':'4424',
 'Bern':'2323','Vienna':'3444','Copenhagen':'3444','Stockholm':'3444','Madrid':'4443','Barcelona':'3444','Lisbon':'3343','Milan':'4453','Singapore':'5435',
 'Hong Kong':'5334','Tokyo':'4345','Seoul':'3354','Shanghai':'5334','Dubai':'4332','Tel Aviv':'3334','Sydney':'4444','Melbourne':'3445','São Paulo':'4343',
 'Buenos Aires':'3343','Lagos':'3242','Nairobi':'3232','Bengaluru':'3323'}

# ---------- city LGBTQ+ adjustments (estimates) ----------
CITY_LGBT = {'New York City':5,'San Francisco':5,'Seattle':5,'Boston':5,'Washington DC':5,'Chicago':5,'Los Angeles':5,'San Diego':5,'Denver':5,
 'Philadelphia':5,'Minneapolis':5,'Portland':5,'Pittsburgh':4,'Austin':4,'Atlanta':4,'Raleigh':3,'Houston':3,'Miami':3,'Phoenix':3,'Mexico City':5,
 'Guadalajara':4,'Hong Kong':3,'Tel Aviv':5,'São Paulo':4,'Buenos Aires':5}

# ---------- apply to countries ----------
def ext(s, n, women, lgbt, cst): return s[:12] + f"{women}{lgbt}{cst}"
for k, v in D['countries'].items():
    n = int(k); s = v[1]; src = set(filter(None, v[3].split(',')))
    s = setd(s, 'happy', HAPPY.get(n, 0)); src.discard('happy')
    if n in HAPPY: src.add('happy')
    if n in OPEN_DATA: s = setd(s, 'open', OPEN_DATA[n]); src.add('open')
    wv = WOMEN.get(n, 0)
    if wv: src.add('women')
    lv = LGBT_DATA.get(n)
    if lv is not None: src.add('lgbt')
    else: lv = LGBT_EST.get(n, 2)
    v[1] = ext(s, n, wv, lv, cost(n)); v[3] = ','.join(sorted(src))
for k, v in D['byName'].items():
    s = v[1]
    if k == 'Kosovo': v[1] = ext(setd(s, 'happy', 4), 0, 3, 3, 4); v[3] = 'happy,women'
    elif k == 'N. Cyprus': v[1] = ext(s, 0, 0, 2, 3)
    else: v[1] = ext(s, 0, 0, 1, 5)
cs = D['countries']
for c in D['cities']:
    n = int(c[3]); cv = cs.get(str(n).zfill(3)) or cs.get(str(n))
    s = c[4][:12]
    if cv:
        s = setd(s, 'happy', cv[1][11]); s = setd(s, 'perm', cv[1][10])
        if not (n == 840) and c[0] != 'Hong Kong': s = setd(s, 'open', cv[1][9])
        women, lgbt = cv[1][12], cv[1][13]
        src = [x for x in ('open', 'happy', 'women', 'lgbt') if x in cv[3].split(',')]
    else:
        women, lgbt, src = '0', '3', []
    if n == 840: s = setd(s, 'open', 5)
    if c[0] == 'Hong Kong': s = setd(s, 'happy', 2); s = setd(s, 'open', 0); women = '4'; src = ['happy', 'women']
    if c[0] in CITY_LGBT: lgbt = str(CITY_LGBT[c[0]]); src = [x for x in src if x != 'lgbt']
    c[4] = s + f"{women}{lgbt}{CITY_COST.get(c[0], cost(n) if cv else 4)}"
    c[6] = ','.join(src)
    while len(c) < 10: c.append('')
    c[9] = FIELDS.get(c[0], '0000')
missing = [c[0] for c in D['cities'] if c[0] not in CITY_COST]
print('cities', len(D['cities']), 'missing cost', missing)
print('women data', len(WOMEN), 'lgbt data', len(LGBT_DATA), 'happy data', len(HAPPY), 'open data', len(OPEN_DATA))
unmapped = [n for n in WHR + WPS if iso(n) is None and norm(n) not in ALIAS]
print('unmapped names', unmapped)
js = json.dumps(D, ensure_ascii=False, separators=(',', ':')).replace('],"', '],\n"').replace('],[', '],\n[')
open(f'{S}/data_v5.json', 'w', encoding='utf8').write(js)
