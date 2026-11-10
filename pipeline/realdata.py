import json, sys, unicodedata, statistics, math, re, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources2 import *
IN, ADD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(IN, encoding='utf8'))
# merge cities added later (data/cities_added.json)
_have = {c[0] for c in D['cities']}
for name, lat, lon, iso_, lang, jobs, cult, fields, en, es, nes in json.load(open(ADD, encoding='utf8')):
    if name in _have: continue
    cv = D['countries'].get(iso_.zfill(3)) or D['countries'].get(iso_)
    cd = cv[1].ljust(17, '0'); csrc = cv[3].split(',')
    s = f"3{jobs}0{cd[3]}33{lang}{cult}{cd[8]}" + cd[9:15] + "00"
    src = ','.join(x for x in ('open', 'happy', 'women', 'lgbt') if x in csrc)
    D['cities'].append([name, lat, lon, iso_, s, en, src, es, nes, fields])
# digit layout: 0 clim 1 jobs 2 hlth 3 free 4 safe 5 move 6 lang 7 cult 8 pay 9 open 10 perm 11 happy 12 women 13 lgbt 14 cost 15 commute 16 home
IDX = dict(clim=0, jobs=1, hlth=2, free=3, safe=4, move=5, lang=6, cult=7, pay=8, open=9, perm=10, happy=11, women=12, lgbt=13, cost=14, commute=15, home=16)
def setd(s, k, v): i = IDX[k]; s = s.ljust(17, '0'); return s[:i] + str(v) + s[i+1:]
# RAW[place][factor] = [[source key, value as published, band], ...] -- shown in the page's "how this score was calculated" table
RAW = {}
def rec(place, f, key, val, band):
    if band: RAW.setdefault(place, {}).setdefault(f, []).append([key, val, int(band)])
def fmtn(x): return ('%.1f' % x).rstrip('0').rstrip('.') if isinstance(x, float) else str(x)
def norm(n): return unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode().lower().replace('.', '').replace('(china)', '').strip()
N2I = {norm(v[0]): int(k) for k, v in D['countries'].items()}
ALIAS = {'czechia':203,'czech republic':203,'turkiye':792,'turkey':792,'viet nam':704,'vietnam':704,'russian federation':643,'russia':643,'lao pdr':418,'laos':418,
 'syrian arab republic':760,'syria':760,'democratic republic of the congo':180,'dr congo':180,'democratic republic of congo':180,'congo':178,'republic of the congo':178,
 'congo (brazzaville)':178,"cote d'ivoire":384,'ivory coast':384,'bosnia and herzegovina':70,'bosnia and hercegovina':70,'north macedonia':807,'macedonia':807,
 'dominican republic':214,'central african republic':140,'equatorial guinea':226,'palestine':275,'west bank and gaza':275,'eswatini':748,'south korea':410,
 'taiwan':158,'united states':840,'united states of america':840,'united kingdom':826,'united arab emirates':784,'saudi arabia':682,'kosovo':'Kosovo',
 'kosovo (disputed territory)':'Kosovo','trinidad and tobago':780,'papua new guinea':598,'solomon islands':90,'timor-leste':626,'guinea-bissau':624,
 'sierra leone':694,'south africa':710,'south sudan':728,'new zealand':554,'costa rica':188,'el salvador':222,'sri lanka':144,'burkina faso':854,
 'puerto rico':630,'belize':84,'kyrgyzstan':417,'kyrgyz republic':417,'the gambia':270,'gambia':270,'north korea':408,'bahamas':44,'western sahara':732}
def iso(name):
    n = norm(name)
    if n in ALIAS: return ALIAS[n]
    return N2I.get(n)
def parse(txt):
    out = {}
    for part in txt.split(';'):
        part = part.strip()
        if not part: continue
        name, *vals = part.rsplit(' ', 1) if ':' not in part else [part.split(':')[0]] + [part.split(':')[1]]
        out[name.strip()] = vals[0].strip()
    return out

# ---------- WHO UHC Service Coverage Index 2023 ----------
UHC_T = "Afghanistan 42; Albania 71; Algeria 70; Angola 44; Argentina 80; Armenia 69; Australia 89; Austria 84; Azerbaijan 67; Bahamas 80; Bangladesh 54; Belarus 80; Belgium 86; Belize 70; Benin 38; Bhutan 69; Bolivia 67; Bosnia and Herzegovina 64; Botswana 60; Brazil 84; Brunei 84; Bulgaria 73; Burkina Faso 47; Burundi 48; Cambodia 62; Cameroon 48; Canada 92; Central African Republic 39; Chad 26; Chile 84; China 85; Colombia 82; Costa Rica 84; Côte d'Ivoire 46; Croatia 76; Cuba 86; Cyprus 76; Czechia 83; Denmark 85; Djibouti 47; Dominican Republic 73; DR Congo 41; Ecuador 78; Egypt 71; El Salvador 79; Equatorial Guinea 49; Eritrea 40; Estonia 79; Eswatini 72; Ethiopia 33; Fiji 69; Finland 86; France 82; Gabon 48; Georgia 71; Germany 87; Ghana 56; Greece 77; Guatemala 58; Guinea 43; Guinea-Bissau 43; Guyana 73; Haiti 44; Honduras 64; Hungary 80; Iceland 90; India 69; Indonesia 67; Iran 81; Iraq 64; Ireland 82; Israel 85; Italy 82; Jamaica 74; Japan 86; Jordan 74; Kazakhstan 83; Kenya 57; Kuwait 84; Kyrgyzstan 74; Laos 64; Latvia 77; Lebanon 67; Lesotho 55; Liberia 49; Libya 71; Lithuania 78; Luxembourg 83; Madagascar 33; Malawi 52; Malaysia 80; Mali 41; Mauritania 40; Mexico 79; Moldova 71; Mongolia 70; Montenegro 70; Morocco 65; Mozambique 50; Myanmar 52; Namibia 66; Nepal 58; Netherlands 85; New Zealand 89; Nicaragua 70; Niger 39; Nigeria 47; North Korea 77; North Macedonia 69; Norway 89; Oman 73; Pakistan 56; Panama 82; Papua New Guinea 32; Paraguay 79; Peru 68; Philippines 69; Poland 82; Portugal 83; Qatar 84; Republic of the Congo 45; Romania 77; Russia 81; Rwanda 59; Saudi Arabia 83; Senegal 48; Serbia 73; Sierra Leone 48; Slovakia 78; Slovenia 84; Solomon Islands 47; Somalia 30; South Africa 74; South Korea 88; South Sudan 41; Spain 84; Sri Lanka 72; Sudan 48; Suriname 74; Sweden 85; Switzerland 87; Syria 70; Tajikistan 72; Tanzania 49; Thailand 82; The Gambia 53; Timor-Leste 48; Togo 42; Trinidad and Tobago 75; Tunisia 76; Türkiye 77; Turkmenistan 81; Uganda 54; Ukraine 80; United Arab Emirates 84; United Kingdom 88; United States 88; Uruguay 85; Uzbekistan 79; Vanuatu 52; Venezuela 75; Vietnam 71; West Bank and Gaza 65; Yemen 43; Zambia 62; Zimbabwe 59"
UHC = {iso(k): float(v) for k, v in parse(UHC_T).items() if iso(k) is not None}
def b_uhc(x): return 5 if x >= 88 else 4 if x >= 83 else 3 if x >= 75 else 2 if x >= 60 else 1

# ---------- EIU Democracy Index 2023 ----------
EIU_T = "Norway 9.81; New Zealand 9.61; Iceland 9.45; Sweden 9.39; Finland 9.30; Denmark 9.28; Ireland 9.19; Switzerland 9.14; Netherlands 9.00; Taiwan 8.92; Luxembourg 8.81; Germany 8.80; Canada 8.69; Australia 8.66; Uruguay 8.66; Japan 8.40; Costa Rica 8.29; Austria 8.28; United Kingdom 8.28; Greece 8.14; South Korea 8.09; France 8.07; Spain 8.07; Chile 7.98; Czech Republic 7.97; Estonia 7.96; United States of America 7.85; Israel 7.80; Portugal 7.75; Slovenia 7.75; Botswana 7.73; Italy 7.69; Belgium 7.64; Cyprus 7.38; Latvia 7.38; Lithuania 7.31; Malaysia 7.29; India 7.18; Poland 7.18; Trinidad and Tobago 7.16; Slovakia 7.07; Jamaica 7.06; Timor-Leste 7.06; South Africa 7.05; Panama 6.91; Suriname 6.88; Hungary 6.72; Brazil 6.68; Montenegro 6.67; Philippines 6.66; Argentina 6.62; Colombia 6.55; Indonesia 6.53; Namibia 6.52; Croatia 6.50; Mongolia 6.48; Romania 6.45; Dominican Republic 6.44; Bulgaria 6.41; Thailand 6.35; Serbia 6.33; Ghana 6.30; Albania 6.28; Guyana 6.26; Moldova 6.23; Singapore 6.18; Sri Lanka 6.17; Lesotho 6.06; North Macedonia 6.03; Papua New Guinea 6.03; Paraguay 6.00; Bangladesh 5.87; Malawi 5.85; Peru 5.81; Zambia 5.80; Liberia 5.57; Fiji 5.55; Bhutan 5.54; Tunisia 5.51; Senegal 5.48; Armenia 5.42; Ecuador 5.41; Tanzania 5.35; Madagascar 5.26; Georgia 5.20; Mexico 5.14; Ukraine 5.06; Kenya 5.05; Morocco 5.04; Bosnia and Hercegovina 5.00; Honduras 4.98; El Salvador 4.71; Benin 4.68; Nepal 4.60; Uganda 4.49; Gambia 4.47; Guatemala 4.47; Turkey 4.33; Sierra Leone 4.32; Nigeria 4.23; Côte d'Ivoire 4.22; Bolivia 4.20; Angola 4.18; Mauritania 4.14; Kyrgyz Republic 3.70; Algeria 3.66; Qatar 3.65; Lebanon 3.56; Mozambique 3.51; Kuwait 3.50; Palestine 3.47; Ethiopia 3.37; Rwanda 3.30; Pakistan 3.25; Oman 3.12; Kazakhstan 3.08; Cambodia 3.05; Jordan 3.04; Zimbabwe 3.04; United Arab Emirates 3.01; Togo 2.99; Egypt 2.93; Iraq 2.88; Haiti 2.81; Azerbaijan 2.80; Congo (Brazzaville) 2.79; Eswatini 2.78; Burkina Faso 2.73; Djibouti 2.70; Cuba 2.65; Vietnam 2.62; Mali 2.58; Cameroon 2.56; Guinea-Bissau 2.45; Niger 2.37; Venezuela 2.31; Nicaragua 2.26; Russia 2.22; Guinea 2.21; Gabon 2.18; Burundi 2.13; China 2.12; Uzbekistan 2.12; Saudi Arabia 2.08; Belarus 1.99; Eritrea 1.97; Iran 1.96; Yemen 1.95; Tajikistan 1.94; Equatorial Guinea 1.92; Libya 1.78; Sudan 1.76; Laos 1.71; Democratic Republic of Congo 1.68; Chad 1.67; Turkmenistan 1.66; Syria 1.43; Central African Republic 1.18; North Korea 1.08; Myanmar 0.85; Afghanistan 0.26"
EIU = {iso(k): float(v) for k, v in parse(EIU_T).items() if iso(k) is not None}
def b_eiu(x): return 5 if x >= 8 else 4 if x >= 7 else 3 if x >= 5 else 2 if x >= 4 else 1
FH = {246:100,554:99,578:99,752:99,372:98,124:97,208:97,442:97,528:97,705:97,858:97,233:96,392:96,620:96,756:96,56:95,152:95,203:95,276:95,840:81,
      643:12,795:1,729:1,156:9,408:3,232:3,104:4,732:4,762:5,226:5,728:0}
FH_FREE = [68,242,454,100,380]
def b_fh(x): return 5 if x >= 90 else 4 if x >= 70 else 3 if x >= 35 else 2 if x >= 15 else 1

# ---------- homicide: UNODC country rates, FBI 2024 city rates ----------
RATES = {840:5.8,484:24.9,170:24.9,76:20.6,710:43.7,152:6.3,32:4.5,858:11.2,188:17.7,591:12.5,404:4.9,566:15.7,124:2.0,826:1.1,724:0.7,392:0.2,
         376:1.6,608:4.3,218:45.7,604:8.6,388:49.3,340:31.4,222:7.9,320:23.4,214:10.9,643:7.8,356:2.8,792:3.2}
FBI = {'New York City':3.92,'San Francisco':4.36,'Seattle':6.84,'Boston':3.64,'Washington DC':25.49,'Chicago':17.47,'Pittsburgh':11.35,'Denver':9.83,
       'Los Angeles':6.95,'San Diego':2.52,'Austin':6.60,'Atlanta':26.38,'Raleigh':5.12,'Houston':13.80,'Miami':6.08,'Phoenix':8.36,'Philadelphia':16.91,
       'Minneapolis':17.95,'Portland':10.75,'Dallas':13.62,'Nashville':14.59,'Salt Lake City':5.17,'Baltimore':34.77,'Sacramento':8.54,'Charlotte':10.87}
def b_hom(r): return 5 if r < 1.5 else 4 if r < 4 else 3 if r < 8 else 2 if r < 20 else 1
def b_nsafe(x): return 5 if x >= 75 else 4 if x >= 65 else 3 if x >= 55 else 2 if x >= 45 else 1

# ---------- Numbeo 2026: cities (col, rent, col+rent, LPP) and quality of life (safety, health, commute, pollution, climate) ----------
NCOL = """New York: 100.0, 100.0, 100.0, 100.0; San Francisco: 97.6, 80.5, 90.0, 151.0; Seattle: 90.3, 60.2, 76.9, 165.0; Boston: 86.2, 77.7, 82.4, 143.9; Washington DC: 87.3, 69.0, 79.1, 152.1; Chicago: 76.0, 55.2, 66.7, 157.6; Pittsburgh: 70.2, 35.2, 54.5, 146.4; Denver: 75.1, 50.2, 64.0, 150.9; Los Angeles: 81.5, 64.6, 74.0, 117.0; San Diego: 82.0, 74.5, 78.7, 131.6; Austin: 66.4, 50.3, 59.2, 158.8; Atlanta: 75.3, 44.2, 61.4, 160.6; Raleigh: 67.8, 41.5, 56.1, 150.4; Houston: 63.9, 42.5, 54.3, 159.8; Miami: 79.5, 69.0, 74.8, 105.5; Phoenix: 71.6, 39.7, 57.3, 139.0; Philadelphia: 78.8, 44.7, 63.6, 134.5; Minneapolis: 71.5, 38.2, 56.7, 153.5; Portland: 75.2, 48.4, 63.3, 149.0; Toronto: 67.5, 40.6, 55.5, 121.2; Vancouver: 67.5, 48.0, 58.8, 111.8; Montreal: 59.9, 28.7, 46.0, 126.7; Ottawa: 61.7, 33.5, 49.1, 156.7; Mexico City: 45.9, 28.1, 37.9, 48.6; Guadalajara: 41.0, 20.1, 31.7, 45.7; Monterrey: 49.3, 23.7, 37.9, 53.2; Merida: 42.2, 15.2, 30.1, 36.0; Queretaro: 44.6, 18.3, 32.9, 57.1; Bogota: 32.8, 12.5, 23.7, 39.5; Medellin: 34.4, 14.5, 25.5, 39.4; Lima: 35.5, 14.3, 26.1, 47.3; Santiago: 41.9, 14.1, 29.5, 57.7; Buenos Aires: 48.8, 16.3, 34.3, 45.4; Montevideo: 57.2, 15.2, 38.5, 58.6; Sao Paulo: 36.8, 16.4, 27.7, 53.4; San Jose (Costa Rica): 53.5, 21.7, 39.3, 45.4; Panama City: 47.0, 27.6, 38.4, 45.8; London: 87.5, 70.1, 79.7, 117.5; Manchester: 70.0, 40.1, 56.7, 114.1; Edinburgh: 73.0, 37.9, 57.3, 118.6; Cambridge UK: 73.9, 45.5, 61.3, 124.0; Dublin: 76.7, 59.7, 69.1, 114.6; Amsterdam: 82.6, 60.0, 72.5, 129.9; Utrecht: 77.3, 44.2, 62.5, 143.7; Rotterdam: 74.6, 41.1, 59.7, 126.3; Berlin: 70.0, 36.2, 54.9, 126.1; Munich: 76.1, 45.4, 62.4, 142.7; Frankfurt: 74.0, 36.1, 57.1, 156.6; Hamburg: 71.9, 32.4, 54.2, 142.3; Paris: 78.6, 43.5, 62.9, 118.0; Zurich: 118.5, 70.6, 97.1, 164.4; Geneva: 116.5, 65.1, 93.6, 158.5; Bern: 110.0, 46.8, 81.8, 174.4; Vienna: 73.9, 29.6, 54.2, 133.5; Copenhagen: 85.7, 46.1, 68.0, 136.9; Stockholm: 78.6, 36.1, 59.7, 116.9; Oslo: 90.2, 39.3, 67.5, 110.8; Helsinki: 74.3, 29.4, 54.3, 123.5; Tallinn: 64.8, 20.0, 44.8, 88.0; Prague: 59.6, 32.0, 47.3, 94.2; Warsaw: 53.5, 28.5, 42.3, 98.9; Krakow: 49.5, 22.4, 37.4, 102.8; Ljubljana: 57.4, 27.2, 44.0, 85.0; Madrid: 60.0, 36.2, 49.4, 104.1; Barcelona: 59.2, 36.0, 48.9, 95.1; Valencia: 50.6, 28.6, 40.8, 111.6; Malaga: 51.4, 30.6, 42.1, 84.0; Lisbon: 54.2, 38.6, 47.2, 60.9; Porto: 49.3, 29.6, 40.5, 68.9; Milan: 73.1, 41.4, 58.9, 83.5; Rome: 63.4, 34.9, 50.7, 84.3; Athens: 57.9, 18.2, 40.2, 66.1; Istanbul: 43.8, 21.8, 34.0, 59.8; Tel Aviv: 91.4, 46.2, 71.2, 109.5; Dubai: 61.8, 56.9, 59.6, 131.3; Taipei: 54.7, 19.6, 39.0, 81.5; Tokyo: 54.2, 25.8, 41.5, 117.8; Seoul: 68.2, 23.0, 48.0, 130.0; Singapore: 87.7, 73.1, 81.2, 105.5; Hong Kong: 75.2, 63.1, 69.8, 91.6; Shanghai: 38.8, 23.2, 31.8, 96.0; Shenzhen: 37.0, 18.9, 28.9, 109.1; Beijing: 38.0, 23.5, 31.5, 93.7; Bengaluru: 21.9, 9.4, 16.4, 116.6; Kuala Lumpur: 37.4, 13.8, 26.9, 103.6; Ho Chi Minh City: 28.2, 12.9, 21.4, 42.5; Sydney: 75.1, 53.8, 65.6, 117.1; Melbourne: 70.8, 39.7, 56.9, 144.0; Brisbane: 64.8, 38.5, 53.1, 145.3; Auckland: 62.5, 31.6, 48.7, 123.7; Wellington: 63.0, 31.0, 48.8, 119.4; Cape Town: 39.6, 21.4, 31.5, 103.3; Nairobi: 32.0, 11.1, 22.7, 35.3; Accra: 36.6, 11.4, 25.4, 12.7; Kigali: 25.9, 15.8, 21.4, 24.7; Moscow: 47.5, 34.1, 41.5, 81.4; Dallas: 72.9, 45.8, 60.8, 149.5; Nashville: 70.3, 51.8, 62.1, 136.2; Salt Lake City: 66.7, 39.9, 54.8, 145.9; Baltimore: 71.8, 36.3, 56.0, 139.3; Sacramento: 79.2, 47.3, 65.0, 133.5; Charlotte: 69.8, 45.2, 58.8, 139.5; Calgary: 64.5, 30.8, 49.5, 121.7; Quebec City: 60.6, 22.2, 43.5, 130.8; Rio de Janeiro: 32.9, 11.9, 23.5, 37.8; Quito: 33.6, 10.7, 23.4, 52.9; Cordoba (Argentina): 43.5, 10.5, 28.7, 40.0; Brussels: 73.5, 33.1, 55.5, 128.0; Lyon: 72.2, 22.8, 50.2, 126.1; Budapest: 51.1, 20.3, 37.3, 84.9; Glasgow: 67.8, 33.8, 52.7, 124.7; Bristol: 71.1, 42.2, 58.2, 113.8; Seville: 49.9, 21.8, 37.4, 98.8; Bilbao: 54.6, 26.5, 42.0, 106.3; Gothenburg: 68.7, 25.4, 49.4, 154.7; Bangkok: 41.4, 19.6, 31.6, 50.9; Osaka: 43.5, 18.1, 32.1, 125.9; Manila: 35.4, 16.8, 27.1, 35.3"""
NQOL = """New York: 49.2, 62.9, 43.3, 58.1, 79.7; San Francisco: 39.5, 64.9, 49.0, 48.4, 97.3; Seattle: 44.7, 66.6, 42.9, 38.8, 91.7; Boston: 59.7, 69.0, 45.0, 32.5, 71.7; Washington DC: 40.3, 71.0, 41.2, 42.1, 81.6; Chicago: 34.8, 64.8, 41.7, 50.3, 66.1; Pittsburgh: 60.6, 69.8, 37.7, 46.9, 72.1; Denver: 51.9, 68.1, 35.5, 44.9, 56.3; Los Angeles: 46.2, 61.9, 57.1, 68.5, 95.5; San Diego: 60.1, 67.1, 34.9, 39.3, 97.1; Austin: 55.9, 64.8, 40.5, 42.8, 82.1; Atlanta: 35.7, 65.9, 41.3, 45.1, 89.7; Raleigh: 51.0, 65.2, 39.8, 39.7, 83.9; Houston: 37.1, 69.4, 41.8, 56.5, 85.5; Miami: 46.7, 63.0, 42.9, 39.5, 85.7; Phoenix: 46.7, 66.0, 32.7, 58.0, 53.8; Philadelphia: 34.6, 71.1, 39.7, 47.7, 78.0; Minneapolis: 43.8, 71.7, 36.5, 28.7, 49.5; Portland: 41.9, 65.4, 37.4, 35.7, 89.6; Toronto: 56.3, 73.9, 43.9, 37.5, 65.3; Vancouver: 57.2, 71.6, 35.9, 25.4, 91.2; Montreal: 67.0, 61.9, 40.1, 33.7, 52.4; Ottawa: 69.1, 68.4, 32.6, 24.3, 44.5; Mexico City: 33.8, 66.0, 52.7, 80.5, 92.4; Guadalajara: 37.6, 78.3, 41.6, 59.3, 92.8; Monterrey: 52.1, 68.8, 31.9, 70.9, 80.4; Queretaro: 62.5, 73.6, 33.3, 39.0, 94.5; Bogota: 33.3, 66.0, 51.4, 69.4, 97.1; Medellin: 45.9, 78.9, 37.8, 62.5, 99.8; Lima: 29.9, 59.1, 51.2, 84.4, 97.7; Santiago: 35.9, 65.7, 36.9, 70.7, 90.2; Buenos Aires: 37.0, 68.0, 49.9, 51.3, 98.3; Montevideo: 43.2, 68.5, 41.0, 46.1, 98.0; Sao Paulo: 30.2, 60.3, 51.2, 78.9, 99.0; San Jose (Costa Rica): 44.1, 62.9, 63.3, 48.5, 99.5; Panama City: 53.5, 60.9, 32.8, 61.9, 67.8; London: 44.7, 69.5, 44.7, 57.6, 88.3; Manchester: 44.1, 74.5, 39.0, 52.3, 86.9; Edinburgh: 69.7, 75.9, 26.2, 28.0, 84.0; Cambridge UK: 59.1, 71.6, 39.5, 36.2, 91.4; Dublin: 45.9, 51.3, 40.4, 41.4, 85.9; Amsterdam: 70.0, 75.4, 22.8, 26.8, 87.5; Utrecht: 73.5, 78.6, 23.7, 28.8, 87.2; Rotterdam: 70.0, 79.2, 21.3, 23.8, 87.9; Berlin: 55.4, 66.0, 33.4, 37.9, 83.3; Munich: 78.3, 77.0, 28.2, 24.7, 76.0; Frankfurt: 54.5, 76.4, 22.8, 32.0, 84.7; Hamburg: 59.3, 74.3, 30.5, 27.3, 82.8; Paris: 42.1, 76.9, 41.1, 63.0, 88.4; Zurich: 75.9, 68.8, 37.0, 26.6, 81.5; Geneva: 70.5, 69.3, 32.6, 26.5, 82.6; Bern: 72.6, 66.9, 38.8, 31.9, 76.0; Vienna: 70.6, 79.9, 22.9, 15.8, 81.8; Copenhagen: 73.7, 75.2, 27.5, 25.1, 83.7; Stockholm: 53.8, 65.7, 34.1, 18.1, 69.7; Oslo: 65.7, 77.4, 27.8, 21.7, 60.0; Helsinki: 74.9, 80.1, 24.1, 12.5, 62.8; Tallinn: 78.3, 73.9, 24.4, 18.2, 64.3; Prague: 75.3, 74.7, 31.8, 33.0, 80.7; Warsaw: 74.7, 58.4, 34.8, 59.8, 74.6; Krakow: 74.9, 58.7, 30.9, 69.6, 73.9; Ljubljana: 78.2, 66.6, 26.3, 24.0, 76.1; Madrid: 71.0, 79.2, 28.2, 38.2, 85.5; Barcelona: 47.9, 76.7, 29.8, 62.8, 95.7; Valencia: 62.5, 77.0, 19.7, 28.8, 93.8; Malaga: 68.2, 70.8, 25.2, 37.2, 97.0; Lisbon: 67.1, 72.4, 34.6, 37.1, 98.6; Porto: 66.2, 78.7, 24.7, 24.5, 96.6; Milan: 46.0, 70.0, 35.9, 68.1, 88.1; Rome: 53.3, 64.9, 35.2, 47.7, 93.7; Athens: 45.0, 58.4, 37.1, 55.6, 95.2; Istanbul: 52.0, 70.1, 50.7, 67.3, 93.0; Tel Aviv: 73.8, 73.9, 36.6, 46.5, 93.9; Dubai: 83.8, 70.0, 36.3, 49.3, 50.3; Taipei: 83.4, 87.2, 34.6, 48.7, 84.4; Tokyo: 75.9, 78.3, 42.7, 42.5, 85.3; Seoul: 74.6, 83.0, 40.4, 47.6, 68.4; Singapore: 77.7, 71.9, 41.0, 32.5, 57.5; Hong Kong: 78.2, 66.5, 41.9, 66.3, 83.6; Shanghai: 73.5, 67.8, 45.1, 68.0, 83.6; Shenzhen: 75.5, 64.2, 33.7, 54.8, 81.8; Beijing: 74.4, 70.3, 43.0, 76.7, 57.6; Bengaluru: 46.3, 65.4, 53.6, 82.5, 89.4; Kuala Lumpur: 40.9, 69.5, 41.6, 64.8, 56.6; Ho Chi Minh City: 50.2, 62.9, 32.1, 92.1, 63.4; Sydney: 66.2, 74.6, 43.5, 28.7, 97.1; Melbourne: 55.7, 72.1, 42.0, 28.1, 94.3; Brisbane: 61.8, 71.2, 42.7, 32.9, 98.1; Auckland: 49.4, 69.1, 37.4, 30.6, 99.9; Wellington: 66.6, 64.1, 39.4, 24.8, 97.7; Cape Town: 26.4, 68.9, 42.4, 38.3, 98.2; Nairobi: 40.9, 63.2, 53.2, 79.8, 99.8; Lagos: 30.9, 46.8, 68.3, 88.7, 60.8; Moscow: 65.0, 67.9, 50.5, 54.6, 55.8; Dallas: 48.3, 66.7, 35.3, 41.1, 81.9; Nashville: 50.4, 64.7, 38.4, 38.2, 83.0; Salt Lake City: 64.4, 66.9, 33.6, 61.7, 66.5; Baltimore: 28.9, 72.2, 31.7, 52.0, 81.2; Sacramento: 50.6, 67.4, 27.1, 46.9, 90.6; Charlotte: 51.0, 67.9, 35.8, 35.9, 84.0; Calgary: 62.1, 73.0, 29.4, 23.6, 33.1; Quebec City: 77.7, 69.0, 33.4, 36.4, 48.0; Rio de Janeiro: 24.6, 46.4, 51.2, 67.7, 88.2; Quito: 36.9, 69.1, 41.0, 64.5, 99.0; Brussels: 44.1, 73.6, 36.4, 62.2, 83.8; Lyon: 40.8, 75.8, 35.8, 51.7, 88.5; Budapest: 66.4, 52.1, 38.7, 52.7, 78.4; Glasgow: 55.1, 78.4, 28.3, 33.4, 84.8; Bristol: 56.7, 73.2, 31.1, 47.4, 88.5; Gothenburg: 54.2, 69.4, 24.3, 22.3, 77.5; Bangkok: 61.6, 77.3, 44.4, 77.7, 58.4; Manila: 35.4, 62.5, 50.7, 89.4, 61.2"""
def nparse(txt):
    out = {}
    for part in txt.split(';'):
        if ':' not in part: continue
        k, v = part.split(':'); out[norm(k.strip())] = [float(x) for x in v.split(',')]
    return out
NCOL = nparse(NCOL); NQOL = nparse(NQOL)
NCTRY_COL = "Switzerland 81.5 165.7; Iceland 74.8 113.6; Singapore 80.5 91.3; Israel 64.8 115.0; Norway 59.3 123.2; Luxembourg 64.2 155.1; Denmark 54.8 141.2; Netherlands 56.0 124.3; Australia 53.9 134.8; Ireland 57.4 113.0; Austria 49.3 114.2; United States 54.8 144.5; Finland 46.3 119.8; Belgium 47.2 117.1; United Kingdom 50.8 118.2; Germany 47.0 130.0; France 45.7 113.3; Sweden 44.7 128.6; Puerto Rico 45.8 109.9; Canada 46.6 114.8; Italy 41.9 85.5; New Zealand 43.9 119.4; Estonia 39.2 88.7; Jamaica 40.0 34.6; Cyprus 42.4 81.3; Costa Rica 40.5 49.1; South Korea 37.0 101.7; United Arab Emirates 46.8 113.4; Trinidad And Tobago 36.0 42.7; Uruguay 35.9 56.8; Greece 34.8 62.3; Slovenia 37.2 87.0; Guyana 39.9 47.9; Czech Republic 37.0 89.2; Spain 38.1 96.8; Latvia 32.7 74.1; Croatia 35.2 82.0; Democratic Republic of the Congo 41.2 28.2; Senegal 35.7 22.3; Lithuania 33.5 87.5; Qatar 44.1 168.1; Belize 33.1 65.4; Hungary 33.6 77.3; Lebanon 35.0 35.6; Taiwan 32.6 99.5; Brunei 33.4 128.0; Portugal 37.1 65.3; Slovakia 33.5 73.4; Papua New Guinea 38.7 20.2; Japan 32.1 107.3; Panama 35.2 42.1; Poland 32.6 94.7; Oman 30.2 151.3; Saudi Arabia 30.3 115.7; Guatemala 33.2 32.8; Argentina 30.2 44.8; Albania 29.7 46.9; Ivory Coast 34.7 11.7; Mexico 31.9 46.8; Suriname 28.8 18.4; Kuwait 33.3 175.8; Montenegro 30.4 63.4; Serbia 28.5 63.1; Cuba 28.0 2.4; Bulgaria 27.6 78.6; El Salvador 30.2 26.8; Armenia 29.1 47.4; Ethiopia 29.6 12.5; Turkey 27.4 71.8; Jordan 24.6 55.3; Zambia 27.8 23.5; Romania 26.4 72.7; Dominican Republic 27.5 40.4; Russia 27.1 60.9; Cameroon 28.0 10.8; Venezuela 24.0 16.7; South Africa 27.0 105.5; Chile 25.8 50.4; Bosnia And Herzegovina 24.2 64.3; Ghana 26.0 18.1; Namibia 27.2 69.0; Myanmar 25.1 19.5; Mozambique 26.0 24.3; Honduras 25.3 38.9; Thailand 25.8 41.0; Nicaragua 23.0 24.6; Fiji 28.3 56.4; Moldova 25.3 55.6; Colombia 24.6 40.0; Angola 27.3 259.3; Zimbabwe 22.9 27.8; Cambodia 23.5 22.6; Georgia 24.2 43.2; North Macedonia 21.9 64.6; Mongolia 26.5 40.7; Malaysia 22.4 76.3; Brazil 21.9 44.3; Kazakhstan 22.7 52.1; Peru 22.1 48.4; Belarus 22.0 63.7; Paraguay 22.3 49.1; Botswana 19.9 80.0; Sri Lanka 20.2 19.7; Kosovo (Disputed Territory) 20.4 56.4; Morocco 20.4 43.7; Azerbaijan 21.3 39.8; Ecuador 20.4 47.4; China 21.0 94.2; Philippines 19.1 32.1; Tunisia 18.0 33.6; Ukraine 19.3 48.1; Kenya 19.1 33.4; Bolivia 19.5 43.1; Uzbekistan 20.4 48.6; Iraq 18.6 57.6; Tajikistan 19.8 42.4; Kyrgyzstan 20.5 41.6; Uganda 19.2 18.6; Algeria 16.1 35.3; Vietnam 19.0 40.5; Syria 17.3 6.4; Rwanda 20.9 24.8; Tanzania 17.5 26.1; Indonesia 17.0 28.5; Madagascar 16.5 14.9; Bangladesh 13.4 32.8; Iran 15.1 30.7; Nepal 13.2 29.9; Afghanistan 12.9 38.5; Egypt 13.4 23.9; Pakistan 12.4 27.9; Nigeria 16.6 8.8; Libya 12.7 37.8; India 11.6 69.6"
NCTRY_QOL = "Netherlands 72.3 77.6 22.9 87.0; Luxembourg 66.4 70.7 29.3 82.6; Oman 81.7 62.7 24.8 66.0; Denmark 73.2 74.4 29.3 81.2; Switzerland 71.9 68.8 35.1 80.7; Finland 73.7 77.5 25.0 55.6; Austria 70.8 77.5 23.9 76.6; Iceland 74.5 68.7 20.7 68.8; Germany 61.0 71.3 28.5 83.0; Norway 66.4 75.1 29.9 70.6; Estonia 76.5 75.4 20.6 71.2; Qatar 84.8 73.8 28.9 34.6; Sweden 52.2 68.1 28.8 65.0; Australia 52.6 71.8 39.0 91.9; New Zealand 51.2 68.1 32.4 97.0; United States 50.8 66.9 33.9 76.2; Spain 61.9 76.7 26.4 93.0; Slovenia 75.5 66.2 25.1 80.6; Lithuania 67.2 75.3 22.9 69.9; Japan 77.8 79.9 40.1 84.4; Czech Republic 73.3 75.6 28.7 77.7; Croatia 74.8 65.0 24.7 87.1; United Kingdom 51.8 72.4 34.2 88.0; France 44.2 76.9 34.4 89.0; Belgium 50.5 75.7 32.5 86.5; Ireland 50.9 51.3 37.2 88.8; Canada 54.4 68.6 33.1 53.4; Portugal 66.7 72.0 28.4 97.8; United Arab Emirates 86.3 70.8 35.9 43.4; Latvia 64.0 63.7 27.1 72.6; Israel 68.2 73.5 37.0 93.8; Taiwan 82.9 87.1 32.6 83.9; Slovakia 69.1 58.2 27.2 73.9; Kuwait 67.6 58.6 34.7 20.2; Cyprus 66.4 56.6 25.1 92.3; Italy 52.6 64.8 31.8 90.3; Poland 71.3 58.0 31.9 76.1; Saudi Arabia 76.8 62.2 30.8 38.6; Puerto Rico 38.7 58.7 32.2 71.2; South Africa 25.5 63.9 38.4 96.1; Bulgaria 64.8 58.2 28.8 81.2; Singapore 77.7 71.9 41.0 57.5; Hungary 66.8 54.2 35.4 79.8; South Korea 70.3 83.0 39.0 70.5; Romania 66.9 56.4 33.2 76.1; Turkey 58.5 71.3 43.4 88.1; Uruguay 47.3 69.0 39.2 98.0; Greece 54.0 58.6 32.2 93.1; China 77.0 69.6 38.4 75.9; Bosnia And Herzegovina 59.3 54.9 25.9 82.9; Belarus 52.2 49.8 31.3 68.5; Malaysia 52.0 70.7 37.1 58.4; Ecuador 38.3 78.2 37.5 94.5; Serbia 63.1 52.1 30.6 83.0; Armenia 78.0 60.0 29.3 63.4; Costa Rica 45.8 64.8 60.0 93.1; Jordan 60.4 65.6 40.8 91.2; North Macedonia 58.9 55.7 24.5 79.9; Georgia 73.1 56.5 36.6 88.5; Mexico 47.3 72.3 39.2 84.6; Argentina 37.0 67.8 43.9 95.3; Panama 57.6 61.8 35.2 68.2; India 55.8 65.6 46.5 64.7; Brazil 36.4 59.2 40.3 92.3; Ukraine 53.1 56.0 38.0 71.6; Tunisia 55.5 56.6 32.5 94.3; Russia 61.9 61.7 43.3 38.3; Morocco 52.9 46.8 34.9 90.3; Azerbaijan 68.5 49.0 40.0 91.2; Chile 39.4 63.7 35.7 95.6; Colombia 38.7 68.9 46.3 82.3; Thailand 63.6 77.6 37.8 66.7; Albania 55.7 47.9 36.0 86.3; Kazakhstan 54.8 60.7 35.7 34.8; Kenya 44.8 62.2 51.2 87.1; Lebanon 53.2 63.7 38.5 94.7; Pakistan 57.8 59.4 38.2 70.3; Peru 33.1 57.1 50.0 93.3; Indonesia 53.8 61.8 42.7 66.5; Vietnam 60.2 62.8 29.4 71.1; Iran 49.3 52.8 47.5 69.0; Egypt 54.0 48.1 47.7 86.8; Philippines 56.6 67.0 41.7 68.5; Venezuela 19.5 39.4 32.4 79.9; Bangladesh 39.3 42.1 55.4 72.9; Sri Lanka 57.5 70.8 53.8 64.1; Nigeria 33.4 48.0 63.8 70.7"
def cparse(txt, n):
    out = {}
    for part in txt.split(';'):
        part = part.strip()
        if not part: continue
        toks = part.split(' '); vals = [float(x) for x in toks[-n:]]; name = ' '.join(toks[:-n])
        i = iso(name)
        if i is not None: out[i] = vals
    return out
NC_COL = cparse(NCTRY_COL, 2); NC_QOL = cparse(NCTRY_QOL, 4)
def b_lpp(x): return 5 if x >= 140 else 4 if x >= 115 else 3 if x >= 90 else 2 if x >= 60 else 1
def b_cost(x): return 5 if x <= 35 else 4 if x <= 45 else 3 if x <= 55 else 2 if x <= 70 else 1
def b_health(x): return 5 if x >= 75 else 4 if x >= 70 else 3 if x >= 65 else 2 if x >= 60 else 1
def b_clim(x): return 5 if x >= 95 else 4 if x >= 88 else 3 if x >= 80 else 2 if x >= 65 else 1
def b_comm(x): return 5 if x <= 25 else 4 if x <= 32 else 3 if x <= 38 else 2 if x <= 45 else 1

# ---------- Gallup Migrant Acceptance Index (World Happiness Report 2018 annex) ----------
MAI_T = "Egypt 3.50; Iraq 3.42; Belarus 3.38; Greece 3.34; Poland 3.31; Turkey 3.27; Ukraine 3.15; Georgia 3.05; Mongolia 2.99; Jordan 2.99; Myanmar 2.96; Romania 2.93; Lithuania 2.72; Bosnia and Herzegovina 2.71; Thailand 2.69; Russia 2.60; Afghanistan 2.51; Pakistan 2.47; Bulgaria 2.42; Croatia 2.39; Estonia 2.37; Czech Republic 2.26; Latvia 2.04; Israel 1.87; Slovakia 1.83; Serbia 1.80; Hungary 1.69; Montenegro 1.63; Macedonia 1.47; Iceland 8.26; New Zealand 8.25; Rwanda 8.16; Canada 8.14; Sierra Leone 8.05; Mali 8.03; Australia 7.98; Sweden 7.92; United States 7.86; Nigeria 7.76; Ireland 7.74; Burkina Faso 7.74; Norway 7.73; Ivory Coast 7.71; Benin 7.67; Luxembourg 7.54; Netherlands 7.46; Bangladesh 7.45; Spain 7.44; Chad 7.26; Albania 7.22; Switzerland 7.21; Senegal 7.17"
MAI = {iso(k): float(v) for k, v in parse(MAI_T).items() if iso(k) is not None}
def b_mai(x): return 5 if x >= 7.75 else 4 if x >= 7 else 2 if x >= 3 else 1


# LGBTQ+: Equaldex Equality Index, full ranked list (equaldex.com/equality-index, fetched Nov 2026)
EQD_T = "Iceland: 93; Norway: 89; Uruguay: 87; Spain: 83; Denmark: 82; Malta: 80; New Zealand: 80; Chile: 80; Andorra: 80; Germany: 80; Cuba: 79; Australia: 78; Canada: 78; Belgium: 78; Portugal: 77; Netherlands: 77; Sweden: 77; Finland: 76; Argentina: 75; France: 74; Brazil: 74; Austria: 74; Czechia: 72; Mexico: 71; Colombia: 71; Nepal: 71; Switzerland: 70; Ireland: 70; Costa Rica: 69; Liechtenstein: 69; Cape Verde: 68; Luxembourg: 67; South Africa: 67; San Marino: 67; Italy: 66; Greece: 66; United States: 65; Thailand: 65; Slovenia: 64; United Kingdom: 64; Ecuador: 64; Bolivia: 63; Israel: 62; Seychelles: 61; Taiwan: 60; Estonia: 58; Croatia: 57; Mauritius: 56; China: 56; Montenegro: 56; Barbados: 55; Monaco: 55; Timor-Leste: 55; Venezuela: 54; Philippines: 54; Japan: 53; Peru: 53; Botswana: 53; Fiji: 52; Hungary: 52; Vietnam: 52; India: 52; Cyprus: 51; Bosnia and Herzegovina: 51; Bhutan: 51; Poland: 51; Serbia: 51; Belize: 50; North Macedonia: 49; Mozambique: 48; Kosovo: 48; Marshall Islands: 48; Albania: 48; Cambodia: 48; Ukraine: 48; Lithuania: 47; Latvia: 47; Romania: 46; Laos: 46; Slovakia: 46; Honduras: 46; Sao Tome and Principe: 45; Lesotho: 44; Bulgaria: 44; Federated States of Micronesia: 44; Singapore: 44; Nicaragua: 44; South Korea: 43; El Salvador: 43; Angola: 42; Namibia: 42; Suriname: 41; Nauru: 40; Panama: 40; Tajikistan: 40; Vanuatu: 39; Equatorial Guinea: 39; Guyana: 39; Antigua and Barbuda: 39; Mongolia: 39; Guinea-Bissau: 38; Dominican Republic: 37; Bahrain: 37; North Korea: 37; Moldova: 36; Guatemala: 36; Rwanda: 35; Paraguay: 35; Saint Lucia: 35; Pakistan: 34; Saint Kitts and Nevis: 34; Vatican City: 33; Turkey: 33; Djibouti: 33; Dominica: 32; Georgia: 31; Bahamas: 30; Madagascar: 29; Central African Republic: 29; Sri Lanka: 29; Haiti: 29; Palau: 29; Benin: 29; Republic of the Congo: 28; Kenya: 28; Russia: 27; Trinidad and Tobago: 27; Kiribati: 26; Myanmar: 26; Belarus: 26; Bangladesh: 26; Armenia: 26; Papua New Guinea: 25; Grenada: 25; Gabon: 24; Côte d'Ivoire: 23; Eswatini: 23; Tuvalu: 23; Kazakhstan: 23; Kyrgyzstan: 22; Solomon Islands: 22; Democratic Republic of the Congo: 22; Jamaica: 22; Azerbaijan: 19; Uzbekistan: 19; Saint Vincent and the Grenadines: 19; Comoros: 19; Palestine: 18; Syria: 18; Chad: 18; Turkmenistan: 17; Samoa: 17; Liberia: 17; Malaysia: 17; Guinea: 17; Sierra Leone: 16; Jordan: 15; Tanzania: 15; Ghana: 15; Lebanon: 14; Tonga: 14; Tunisia: 14; Sudan: 13; Morocco: 13; Libya: 13; Saudi Arabia: 13; Zimbabwe: 13; Algeria: 13; United Arab Emirates: 12; Iraq: 12; Ethiopia: 12; Togo: 12; Indonesia: 12; Cameroon: 11; Eritrea: 11; South Sudan: 11; Nigeria: 11; Burundi: 11; Uganda: 11; Niger: 10; Yemen: 10; Burkina Faso: 10; Mauritania: 10; Egypt: 10; Mali: 10; Malawi: 9; Zambia: 9; Maldives: 8; Qatar: 7; Kuwait: 6; Iran: 6; Senegal: 5; Oman: 4; Gambia: 4; Somalia: 4; Brunei: 4; Afghanistan: 1"
EQD = {}
for part in EQD_T.split(';'):
    nm, x = part.rsplit(':', 1); i = iso(nm.strip().replace('Democratic Republic of the Congo', 'DR Congo').replace('Republic of the Congo', 'Congo (Brazzaville)') if 'Congo' in nm else nm.strip())
    if i is not None: EQD[i] = int(x)
def b_eq(x): return 5 if x >= 75 else 4 if x >= 60 else 3 if x >= 45 else 2 if x >= 25 else 1

def avg(bands):
    b = [x for x in bands if x]
    return int(math.floor(statistics.mean(b) + 0.5)) if b else 0   # half rounds up, consistently

# World Happiness Report 2026 and WPS 2025/26 rank lists (kept in the archived script that built the base data)
_GD = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'archive', 'general_data.py'), encoding='utf8').read()
WHR_L = re.search(r'WHR = "([^"]+)"', _GD).group(1).split(';'); WPS_L = re.search(r'WPS = "([^"]+)"', _GD).group(1).split(';')
WHR_R = {}; WPS_R = {}
for r_, n_ in enumerate(WHR_L, 1):
    i_ = iso(n_)
    if i_ is not None and i_ not in WHR_R: WHR_R[i_] = r_
for r_, n_ in enumerate(WPS_L, 1):
    i_ = iso(n_)
    if i_ is not None and i_ not in WPS_R: WPS_R[i_] = r_
EI25 = {'Mexico':1,'Panama':2,'Colombia':3,'Indonesia':4,'Philippines':5,'Brazil':6,'Oman':7,'Kenya':8,'Thailand':9,'Cyprus':10,'Spain':13,'Greece':14,
        'Canada':27,'Hungary':30,'Singapore':33,'Czechia':37,'South Korea':38,'Switzerland':39,'Denmark':40,'Austria':41,'Sweden':42,'Germany':43,'Finland':44,'Norway':45,'Kuwait':46}
EI25 = {iso(k): v for k, v in EI25.items() if iso(k) is not None}
def nparse2(txt):
    o = {}
    for part in txt.split(';'):
        nm, x = part.rsplit(':', 1); i_ = iso(nm.strip())
        if i_ is not None: o[i_] = float(x)
    return o
UNEMP = nparse2(UNEMP_T); YOUTH = nparse2(YOUTH_T); INFORMAL = nparse2(INFORMAL_T)
AVC = {iso(k): v for k, v in AV_COUNTRY.items() if iso(k) is not None}
UNC = {iso(k): v for k, v in UNCOVERED.items()}
OPEN_X = {iso(k): v for k, v in OPEN_COUNTRY_EXTRA.items()}
def av_key(src, kind): return src + {'rank': 'r', 'hard': 'h', 'easy': 'e', 'vac': ''}[kind]
CITY_BURDEN = {}   # iso -> list of solo rent-burden ratios of its cities with Numbeo data (for the country-level housing figure)

CO2 = {}
for part in """New York City 3229.1; San Francisco 8836.0; Seattle 8050.5; Boston 8652.5; Washington DC 8206.2; Chicago 7447.0; Pittsburgh 7923.0; Denver 8426.0; Los Angeles 14244.0; San Diego 7897.9; Austin 9694.2; Atlanta 9524.8; Raleigh 8949.1; Houston 10353.4; Miami 10566.0; Phoenix 8072.0; Philadelphia 7143.0; Minneapolis 7768.8; Portland 7859.4; Toronto 6579.8; Vancouver 5143.3; Montreal 5460.2; Ottawa 4192.1; Mexico City 9292.9; Guadalajara 7686.6; Monterrey 6213.1; Querétaro 6629.0; Bogotá 5051.1; Medellín 4878.5; Lima 6722.6; Santiago 3437.7; Buenos Aires 4437.6; Montevideo 3843.0; São Paulo 7398.9; San José (Costa Rica) 10764.3; Panama City 6912.0; London 1870.0; Manchester 4750.3; Edinburgh 2991.8; Cambridge UK 5387.9; Dublin 4092.3; Amsterdam 1423.5; Utrecht 1514.8; Rotterdam 2976.7; Berlin 1323.3; Munich 2264.9; Frankfurt 2040.6; Hamburg 2435.1; Paris 2710.6; Zurich 2702.7; Geneva 4500.3; Bern 4870.7; Vienna 1401.6; Copenhagen 1488.1; Stockholm 1935.2; Oslo 2478.8; Helsinki 1254.7; Tallinn 2053.6; Prague 1938.9; Warsaw 2959.4; Kraków 2558.5; Ljubljana 3122.8; Madrid 3387.0; Barcelona 2245.3; Valencia 1640.1; Málaga 2907.9; Lisbon 4082.5; Porto 3602.9; Milan 3203.9; Rome 4104.5; Athens 5125.9; Istanbul 7159.6; Tel Aviv 6207.1; Dubai 8055.6; Taipei 3092.0; Tokyo 1645.7; Seoul 2381.5; Singapore 2403.9; Hong Kong 1693.9; Shanghai 3197.8; Shenzhen 2264.8; Beijing 5012.6; Bengaluru 7502.8; Kuala Lumpur 8350.7; Ho Chi Minh City 3553.8; Sydney 6150.8; Melbourne 6779.1; Brisbane 7194.4; Auckland 6659.6; Wellington 6373.0; Cape Town 10196.5; Nairobi 7568.2; Lagos 8615.2; Moscow 4523.4; Dallas 8817.9; Nashville 9219.6; Salt Lake City 7098.0; Baltimore 4814.2; Sacramento 6456.0; Charlotte 8721.5; Calgary 5603.2; Quebec City 5276.8; Rio de Janeiro 6168.2; Quito 7205.7; Brussels 4552.9; Lyon 4370.4; Budapest 2902.0; Glasgow 3613.1; Bristol 4481.9; Gothenburg 2670.5; Bangkok 7567.1; Manila 7019.5""".split(';'):
    part = part.strip(); nm, v = part.rsplit(' ', 1); CO2[nm] = float(v)
def b_co2(x): return 5 if x <= 2000 else 4 if x <= 3500 else 3 if x <= 5500 else 2 if x <= 8000 else 1

NAME_N = {'New York City':'new york','Washington DC':'washington dc','Bogotá':'bogota','Medellín':'medellin','São Paulo':'sao paulo','Querétaro':'queretaro',
          'Mérida':'merida','Kraków':'krakow','Málaga':'malaga','Bengaluru':'bengaluru','Cambridge UK':'cambridge uk','Córdoba (Argentina)':'cordoba (argentina)'}
# pre-pass: solo rent burden for every city with Numbeo data
for c in D['cities']:
    col = NCOL.get(NAME_N.get(c[0], norm(c[0])))
    if col: CITY_BURDEN.setdefault(int(c[3]), []).append(burden(col[1], col[0], col[3]))

# ---------- countries ----------
for k, v in D['countries'].items():
    n = int(k); s = v[1].ljust(17, '0'); src = set(filter(None, v[3].split(','))); P = 'c:' + str(n)
    src -= {'safe', 'open', 'jobs', 'home', 'cult'}
    # healthcare: WHO UHC + Numbeo health care
    if n in UHC: rec(P, 'hlth', 'uhc', fmtn(UHC[n]), b_uhc(UHC[n]))
    if n in NC_QOL: rec(P, 'hlth', 'nqolh', fmtn(NC_QOL[n][1]), b_health(NC_QOL[n][1]))
    if n in UNC: rec(P, 'hlth', UNC[n][1], fmtn(UNC[n][0]) + '%', b_cover(UNC[n][0]))
    h = avg([b_uhc(UHC[n]) if n in UHC else 0, b_health(NC_QOL[n][1]) if n in NC_QOL else 0, b_cover(UNC[n][0]) if n in UNC else 0])
    s = setd(s, 'hlth', h); (src.add('hlth') if h else None)
    # freedom: EIU + Freedom House
    if n in EIU: rec(P, 'free', 'eiu', fmtn(EIU[n]), b_eiu(EIU[n]))
    if n in FH: rec(P, 'free', 'fh', str(FH[n]), b_fh(FH[n]))
    elif n in FH_FREE: rec(P, 'free', 'fh', 'Free', 4)
    fb = [b_eiu(EIU[n]) if n in EIU else 0, b_fh(FH[n]) if n in FH else (4 if n in FH_FREE else 0)]
    f = avg(fb)
    if f: s = setd(s, 'free', f); src.add('free')
    # safety: UNODC homicide + Numbeo safety
    if n in RATES: rec(P, 'safe', 'hom', fmtn(RATES[n]), b_hom(RATES[n]))
    if n in NC_QOL: rec(P, 'safe', 'nqols', fmtn(NC_QOL[n][0]), b_nsafe(NC_QOL[n][0]))
    sf = avg([b_hom(RATES[n]) if n in RATES else 0, b_nsafe(NC_QOL[n][0]) if n in NC_QOL else 0])
    if sf: s = setd(s, 'safe', sf); src.add('safe')
    # making friends / welcome: Expat Insider ranks first; Gallup migrant acceptance only where no Expat Insider rank exists
    if n in EI25: op = b_rank(EI25[n], 46); rec(P, 'open', 'ei25s', f'#{EI25[n]}/46', op)
    elif n in OPEN_X: r_, nn = OPEN_X[n]; op = b_rank(r_, nn); rec(P, 'open', 'ei24f', f'#{r_}/{nn}', op)
    elif n in MAI: op = b_mai(MAI[n]); rec(P, 'open', 'mai', fmtn(MAI[n]), op)
    else: op = 0
    s = setd(s, 'open', op)
    if op: src.add('open')
    # purchasing power, cost, climate, commute: Numbeo
    if n in NC_COL:
        s = setd(s, 'pay', b_lpp(NC_COL[n][1])); s = setd(s, 'cost', b_cost(NC_COL[n][0])); src |= {'pay', 'cost'}
        rec(P, 'pay', 'nlpp', fmtn(NC_COL[n][1]), b_lpp(NC_COL[n][1])); rec(P, 'cost', 'ncolc', fmtn(NC_COL[n][0]), b_cost(NC_COL[n][0]))
    if n in NC_QOL:
        s = setd(s, 'clim', b_clim(NC_QOL[n][3])); s = setd(s, 'commute', b_comm(NC_QOL[n][2])); src |= {'clim', 'commute'}
        rec(P, 'clim', 'nqolc', fmtn(NC_QOL[n][3]), b_clim(NC_QOL[n][3])); rec(P, 'commute', 'nqolt', fmtn(NC_QOL[n][2]), b_comm(NC_QOL[n][2]))
    if n in EQD: s = setd(s, 'lgbt', b_eq(EQD[n])); src.add('lgbt'); rec(P, 'lgbt', 'eq', str(EQD[n]), b_eq(EQD[n]))
    else: src.discard('lgbt')
    if 'happy' in src and n in WHR_R: rec(P, 'happy', 'whr', f'#{WHR_R[n]}/147', int(s[11]))
    if 'women' in src and n in WPS_R: rec(P, 'women', 'wps', f'#{WPS_R[n]}/181', int(s[12]))
    # jobs: ILO unemployment, overall and ages 15-24 (the age group of new graduates)
    if n in YOUTH: rec(P, 'jobs', 'iloy', fmtn(YOUTH[n]) + '%', b_youth(YOUTH[n]))
    if n in UNEMP: rec(P, 'jobs', 'ilo', fmtn(UNEMP[n]) + '%', b_unemp(UNEMP[n]))
    if n in INFORMAL: rec(P, 'jobs', 'inf', fmtn(INFORMAL[n]) + '%', b_inf(INFORMAL[n]))
    j = avg([b_youth(YOUTH[n]) if n in YOUTH else 0, b_unemp(UNEMP[n]) if n in UNEMP else 0, b_inf(INFORMAL[n]) if n in INFORMAL else 0])
    s = setd(s, 'jobs', j)
    if j: src.add('jobs')
    # housing for one person: rent burden (mean of its cities) + availability
    hb = []
    if n in CITY_BURDEN:
        m = statistics.mean(CITY_BURDEN[n]); hb.append(b_burden(m)); rec(P, 'home', 'burden', '%.2f' % m, b_burden(m))
    if n in AVC:
        kind, x, nn, sk = AVC[n]; hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind), av_text(kind, x, nn), b_av(kind, x, nn))
    hm = avg(hb); s = setd(s, 'home', hm)
    if hm: src.add('home')
    s = setd(s, 'cult', 0)   # no country-level measure; scored for cities only
    v[1] = s; v[3] = ','.join(sorted(src))
for k, v in D['byName'].items():
    v[1] = v[1].ljust(17, '0')
    if k == 'Kosovo':
        v[1] = setd(v[1], 'lgbt', b_eq(48))
        v[1] = setd(setd(v[1], 'pay', b_lpp(56.4)), 'cost', b_cost(20.4)); v[3] = 'happy,women,pay,cost,lgbt'
    v[1] = setd(setd(v[1], 'cult', 0), 'jobs', 0)

# ---------- cities ----------
cs = D['countries']
for c in D['cities']:
    name = c[0]; n = int(c[3]); cv = cs.get(str(n).zfill(3)) or cs.get(str(n)); P = 'city:' + name
    s = c[4].ljust(17, '0'); src = set(filter(None, c[6].split(','))) - {'safe', 'open', 'jobs', 'home', 'cult'}
    key = NAME_N.get(name, norm(name))
    col, qol = NCOL.get(key), NQOL.get(key)
    cdig = cv[1] if cv else '0' * 17; csrc = set(cv[3].split(',')) if cv else set()
    # healthcare: country WHO UHC + city Numbeo health care
    uhc = UHC.get(n, 88 if name == 'Singapore' else None)
    if uhc: rec(P, 'hlth', 'uhc', fmtn(uhc), b_uhc(uhc))
    if qol: rec(P, 'hlth', 'nqolh', fmtn(qol[1]), b_health(qol[1]))
    if n in UNC: rec(P, 'hlth', UNC[n][1], fmtn(UNC[n][0]) + '%', b_cover(UNC[n][0]))
    h = avg([b_uhc(uhc) if uhc else 0, b_health(qol[1]) if qol else 0, b_cover(UNC[n][0]) if n in UNC else 0])
    s = setd(s, 'hlth', h); (src.add('hlth') if h else None)
    if name == 'Hong Kong': s = setd(s, 'free', b_eiu(5.24)); src.add('free'); rec(P, 'free', 'eiu', '5.24', b_eiu(5.24))
    elif 'free' in csrc: s = setd(s, 'free', cdig[3]); src.add('free')
    if name == 'Singapore':
        s = setd(s, 'free', b_eiu(6.18)); s = setd(s, 'happy', 3); s = setd(s, 'women', 5); s = setd(s, 'lgbt', b_eq(44))
        src |= {'free', 'happy', 'women', 'lgbt'}
        rec(P, 'free', 'eiu', '6.18', b_eiu(6.18)); rec(P, 'happy', 'whr', '#36/147', 3); rec(P, 'women', 'wps', '#17/181', 5); rec(P, 'lgbt', 'eq', '44', b_eq(44))
    hom = FBI.get(name)
    if hom is not None: rec(P, 'safe', 'fbi', fmtn(hom), b_hom(hom))
    elif (col or qol) and n in RATES: hom = RATES.get(n); rec(P, 'safe', 'hom', fmtn(hom), b_hom(hom))
    if qol: rec(P, 'safe', 'nqols', fmtn(qol[0]), b_nsafe(qol[0]))
    sf = avg([b_hom(hom) if hom is not None else 0, b_nsafe(qol[0]) if qol else 0])
    s = setd(s, 'safe', sf if sf else int(s[4]))
    if sf: src.add('safe')
    # making friends: the city's own Expat Insider rank, else the country's
    if name in OPEN_CITY:
        r_, nn = OPEN_CITY[name]; s = setd(s, 'open', b_rank(r_, nn)); src.add('open'); rec(P, 'open', 'eicity24s', f'#{r_}/{nn}', b_rank(r_, nn))
    elif 'open' in csrc and name != 'Hong Kong': s = setd(s, 'open', cdig[9]); src.add('open')
    else: s = setd(s, 'open', 0)
    if 'lgbt' in csrc and name != 'Hong Kong': s = setd(s, 'lgbt', cdig[13]); src.add('lgbt')
    if col:
        s = setd(s, 'pay', b_lpp(col[3])); s = setd(s, 'cost', b_cost(col[2])); src |= {'pay', 'cost'}
        rec(P, 'pay', 'nlpp', fmtn(col[3]), b_lpp(col[3])); rec(P, 'cost', 'ncol', fmtn(col[2]), b_cost(col[2]))
    if qol:
        s = setd(s, 'clim', b_clim(qol[4])); s = setd(s, 'commute', b_comm(qol[2])); src |= {'clim', 'commute'}
        rec(P, 'clim', 'nqolc', fmtn(qol[4]), b_clim(qol[4])); rec(P, 'commute', 'nqolt', fmtn(qol[2]), b_comm(qol[2]))
    else:
        s = setd(s, 'commute', 0)
    mv = []
    if name in CO2: mv.append(b_co2(CO2[name])); rec(P, 'move', 'ntr', fmtn(CO2[name]), b_co2(CO2[name]))
    if name in WALK: w_, tr_ = WALK[name]; mv.append(b_walk(w_, tr_)); rec(P, 'move', 'walk', f'{fmtn(w_)} / {fmtn(tr_)}', b_walk(w_, tr_))
    if mv: s = setd(s, 'move', avg(mv)); src.add('move')
    # jobs: size of the metro economy the city belongs to + national youth unemployment
    gdp = METRO.get(name, (None,))[0]; gk = 'gdp'
    if name in NYC_COMMUTER: gdp = METRO['New York City'][0]; gk = 'gdpnyc'
    elif name in SUFFOLK: gdp = SUFFOLK_GDP; gk = 'bea'
    if gdp:
        rec(P, 'jobs', gk, '$' + fmtn(gdp) + 'bn', b_gdp(gdp))
        if n in YOUTH: rec(P, 'jobs', 'iloy', fmtn(YOUTH[n]) + '%', b_youth(YOUTH[n]))
        if n in INFORMAL: rec(P, 'jobs', 'inf', fmtn(INFORMAL[n]) + '%', b_inf(INFORMAL[n]))
        # the local economy counts twice: national rates say little about one city's job market
        j = avg([b_gdp(gdp), b_gdp(gdp), b_youth(YOUTH[n]) if n in YOUTH else 0, b_inf(INFORMAL[n]) if n in INFORMAL else 0]); s = setd(s, 'jobs', j); src.add('jobs')
    else: s = setd(s, 'jobs', 0)
    # tech ecosystem (only counted when the field is tech): StartupBlink city rank, outside the top 1,000 = lowest band
    sb = SBLINK.get('New York City') if name in NYC_COMMUTER else SBLINK.get(name)
    if sb: rec(P, 'tech', 'sblinknyc' if name in NYC_COMMUTER else 'sblink', f'#{sb}/1000', b_sblink(sb))
    else: rec(P, 'tech', 'sblink', '>1000', 1)
    # things happening: metro population (a proxy: bigger metros have more concerts, venues and events)
    pop = METRO.get(name, (None, None))[1] or POP_EXTRA.get(name)
    pk = 'pop'
    if name in NYC_COMMUTER: pop = METRO['New York City'][1]; pk = 'popnyc'
    if pop:
        s = setd(s, 'cult', b_pop(pop)); src.add('cult'); rec(P, 'cult', pk, ('%.1fM' % (pop / 1e6)) if pop >= 1e6 else ('<0.1M' if pop < 1e5 else '%.2fM' % (pop / 1e6)), b_pop(pop))
    # housing for one person: own rent burden + availability (city figure, else national)
    hb = []
    if col:
        r_ = burden(col[1], col[0], col[3]); hb.append(b_burden(r_)); rec(P, 'home', 'burden', '%.2f' % r_, b_burden(r_))
    if name in AV_CITY:
        kind, x, nn, sk = AV_CITY[name]; hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind), av_text(kind, x, nn), b_av(kind, x, nn))
    elif n in AVC:
        kind, x, nn, sk = AVC[n]; hb.append(b_av(kind, x, nn)); rec(P, 'home', av_key(sk, kind) + '*', av_text(kind, x, nn), b_av(kind, x, nn))
    hm = avg(hb); s = setd(s, 'home', hm)
    if hm: src.add('home')
    c[4] = s; c[6] = ','.join(sorted(src))
    c.append('own' if (col or qol) else 'country')
# a country's tech figure: its best-ranked city in the atlas
for c in D['cities']:
    tb = RAW.get('city:' + c[0], {}).get('tech')
    if tb:
        P = 'c:' + str(int(c[3])); cur = RAW.get(P, {}).get('tech')
        if not cur or tb[0][2] > cur[0][2] or (tb[0][2] == cur[0][2] and tb[0][1] < cur[0][1]):
            RAW.setdefault(P, {})['tech'] = [[tb[0][0] if tb[0][0] != 'sblinknyc' else 'sblink', tb[0][1] + ' (' + c[0] + ')', tb[0][2]]]
D['raw'] = RAW
json.dump(D, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
nod = [c[0] for c in D['cities'] if c[-1] == 'country']
print('cities using country data:', nod)
print('UHC', len(UHC), 'EIU', len(EIU), 'MAI', len(MAI), 'NC_COL', len(NC_COL), 'NC_QOL', len(NC_QOL))
