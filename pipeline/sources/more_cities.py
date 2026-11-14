"""Cities added Nov 2026: every US metropolitan area, and world cities with published temperature normals.
Reads pipeline/input/us_metros.txt, world_cities.txt, temps_wiki.txt and us_jan_jul.txt. Every number comes from the source
named in those files' headers; nothing here is estimated."""
import math, os

INPUT = os.path.join(os.path.dirname(__file__), '..', 'input')


def _rows(name):
    for line in open(os.path.join(INPUT, name), encoding='utf8'):
        line = line.strip()
        if line and not line.startswith('#'):
            yield line.split('|')


# US metros: name -> (state, 2024 population, lat, lon)
US_METROS = {r[0]: (r[1], int(r[2]), float(r[3]), float(r[4])) for r in _rows('us_metros.txt')}

# world cities: name -> (country, lat, lon, nearest station or None)
WORLD = {r[0]: (r[1], float(r[2]), float(r[3]), r[4] if len(r) > 4 else None) for r in _rows('world_cities.txt')}

# monthly means from Wikipedia's list (world, plus US stations): city -> [12 values, °C]
WIKI_TEMPS = {}
CTT = set()
for r in _rows('temps_wiki.txt'):
    WIKI_TEMPS[r[1]] = [float(x) for x in r[2:14]]
    if len(r) > 14 and r[14] == 'ctt':
        CTT.add(r[1])

# NOAA 1991-2020 normals via Current Results: (state, place) -> (coldest-month mean, hottest-month mean), °C
f2c = lambda f: (f - 32) * 5 / 9
JJ = {}
for st, place, jh, jl, uh, ul in _rows('us_jan_jul.txt'):
    JJ[(st, place)] = (round(f2c((float(jh) + float(jl)) / 2), 1), round(f2c((float(uh) + float(ul)) / 2), 1))

# metros whose station has another name in the Current Results lists
JJ_PLACE = {
    'Daphne': 'Fairhope', 'Florence AL': 'Muscle Shoals', 'Cape Coral': 'Ft. Myers', 'Port St. Lucie': 'Ft. Pierce',
    'Sebring': 'Avon Park', 'Palm Bay': 'Melbourne', 'Fort Walton Beach': 'Destin', 'Myrtle Beach': 'North Myrtle Beach',
    'Hilton Head': 'Beaufort', 'Elkhart': 'Goshen', 'Michigan City': 'La Porte', 'Northampton': 'Amherst', 'Barnstable': 'Hyannis',
    'Springfield MA': 'Westfield', 'Manchester NH': 'Nashua', 'Lexington Park': 'Patuxent River', 'Atlantic City': 'Atlantic City Marina',
    'Vineland': 'Millville', 'Panama City FL': 'Panama City', 'Sarasota': 'Sarasota', 'Naples FL': 'Naples', 'Lima OH': 'Lima',
    'Odessa TX': 'Odessa', 'St. Joseph': 'St Joseph', 'St. George': 'St George', 'Bloomington IL': 'Bloomington',
    'Bloomington IN': 'Bloomington', 'Lafayette IN': 'Lafayette', 'Jackson MI': 'Jackson', 'Jackson TN': 'Jackson',
    'Columbus GA': 'Columbus', 'Columbus IN': 'Columbus', 'Albany GA': 'Albany', 'Athens GA': 'Athens', 'Gainesville GA': 'Gainesville',
    'Rome GA': 'Rome', 'Decatur AL': 'Decatur', 'Decatur IL': 'Decatur', 'Monroe LA': 'Monroe', 'Monroe MI': 'Monroe',
    'Midland MI': 'Midland', 'Charleston WV': 'Charleston', 'Huntington WV': 'Huntington', 'Greenville NC': 'Greenville',
    'Fayetteville NC': 'Fayetteville', 'Fayetteville AR': 'Fayetteville', 'Jacksonville NC': 'Jacksonville', 'Wilmington NC': 'Wilmington',
    'Springfield IL': 'Springfield', 'Springfield MO': 'Springfield', 'Springfield OH': 'Springfield', 'Cleveland TN': 'Cleveland',
    'Rochester MN': 'Rochester', 'Columbia MO': 'Columbia', 'Portland ME': 'Portland', 'Lewiston ME': 'Lewiston', 'Albany OR': 'Corvallis',
    'Longview WA': 'Longview', 'Manhattan KS': 'Manhattan', 'Lebanon NH': 'Lebanon', 'Watertown NY': 'Watertown', 'Burlington NC': 'Burlington',
    'Alexandria LA': 'Alexandria', 'Scranton': 'Scranton', 'Davenport': 'Davenport', 'Steubenville': 'Steubenville', 'Victoria TX': 'Victoria',
    'Lake Havasu City': 'Kingman', 'Eagle Pass': 'Del Rio', 'Auburn AL': 'Auburn', 'Kingston NY': 'Poughkeepsie', 'Poughkeepsie': 'Poughkeepsie',
}


def jj_for(name):
    """(coldest, hottest, station label) for a US metro from the Current Results lists, or None."""
    st = US_METROS[name][0]
    place = JJ_PLACE.get(name, name)
    if (st, place) in JJ:
        c, h = JJ[(st, place)]
        return c, h, place
    return None


# ---------- metro GDP, 2024, for the 50 largest US metros (BEA via Wikipedia "List of United States metropolitan areas by GDP",
# fetched 12 Nov 2026), US$ bn; BEA has stopped publishing metro GDP, so smaller metros have none ----------
US_GDP = {'Philadelphia': 582.1, 'San Jose': 441.8, 'Minneapolis': 369.3, 'Detroit': 348.0, 'Charlotte': 277.1, 'Baltimore': 275.4,
          'Riverside': 272.7, 'Tampa': 261.6, 'St. Louis': 236.8, 'Orlando': 233.2, 'Portland': 225.3, 'Nashville': 223.0,
          'Cincinnati': 210.4, 'Indianapolis': 209.8, 'Sacramento': 201.9, 'San Antonio': 198.4, 'Las Vegas': 195.9, 'Columbus': 193.5,
          'Kansas City': 188.2, 'Cleveland': 187.6, 'Salt Lake City': 157.1, 'Jacksonville': 139.2, 'Milwaukee': 137.1,
          'Virginia Beach': 134.3, 'Richmond': 123.9, 'Providence': 116.4, 'Hartford': 110.9, 'Memphis': 108.4, 'Louisville': 107.9,
          'Oklahoma City': 103.0, 'Omaha': 99.2, 'Buffalo': 94.7, 'Birmingham': 92.4}

# ---------- 2024 presidential margin is only stored for some states (see politics.py); metros in those states get it ----------


def dist(a, b):
    R = 6371
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


# ---------- BEA Regional Price Parities, 2023 (input/bea_rpp_2023.txt): metro -> (all items, housing rents), US = 100 ----------
_RPP = {r[0]: (float(r[1]), float(r[2])) for r in _rows('bea_rpp_2023.txt')}
_BEA_ALIAS = {'New York City': 'New York-Newark', 'Washington DC': 'Washington-Arlington', 'Honolulu': 'Urban Honolulu',
              'Boise': 'Boise City', 'Sarasota': 'North Port-Sarasota', 'Daytona Beach': 'Deltona-Daytona',
              'Fort Walton Beach': 'Crestview-Fort Walton', 'Steubenville': 'Weirton-Steubenville', 'New London': 'Norwich-New London',
              'Lexington Park': 'California-Lexington', 'Vero Beach': 'Sebastian-Vero', 'Barnstable': 'Barnstable Town',
              'Louisville': 'Louisville/Jefferson', 'Prescott': 'Prescott Valley', 'Santa Barbara': 'Santa Maria-Santa Barbara',
              'Macon': 'Macon-Bibb', 'Athens GA': 'Athens-Clarke', 'Augusta': 'Augusta-Richmond', 'Nashville': 'Nashville-Davidson',
              'Scranton': 'Scranton--Wilkes', 'Poughkeepsie': 'Poughkeepsie-Newburgh', 'Kingston NY': 'Kingston, NY',
              'Hilton Head': 'Hilton Head Island'}


def _bea_name(name):
    """The BEA metro a US metro in the atlas corresponds to (same main city, same state), or None.
    BEA's 2023 figures use the 2020 metro boundaries, so metros created in the 2023 revision have no match."""
    import re
    st = US_METROS[name][0]
    base = _BEA_ALIAS.get(name) or re.sub(r' [A-Z]{2}$', '', name)
    hits = [k for k in _RPP if k.startswith(base) and st in k.split(', ')[-1].split('-')
            and (name in _BEA_ALIAS or k.split(',')[0].split('-')[0].strip() == base)]
    return hits[0] if len(hits) == 1 else None


BEA_RPP = {n: _RPP[b] for n in US_METROS for b in [_bea_name(n)] if b}


# ---------- Census ACS 2024 1-year, by metro (input/acs_2024_metros.txt) ----------
# metro -> dict(rent $/month, earn $/year, hh $/year, commute minutes, drove % alone, transit %, vac rental vacancy %); None = not published
_ACS = {}
for r in _rows('acs_2024_metros.txt'):
    r += [''] * (8 - len(r))
    _ACS[r[0]] = dict(zip(('rent', 'earn', 'hh', 'commute', 'drove', 'transit', 'vac'), [float(x) if x else None for x in r[1:8]]))
# the ACS uses the 2023 metro boundaries, so a few names differ from BEA's
_ACS_ALIAS = dict(_BEA_ALIAS, **{'Sarasota': 'North Port-Bradenton-Sarasota', 'Lexington Park': 'Lexington Park', 'Poughkeepsie': 'Kiryas Joel-Poughkeepsie',
                                 'Northampton': 'Amherst Town-Northampton', 'Pinehurst': 'Pinehurst-Southern Pines', 'Slidell': 'Slidell-Mandeville',
                                 'Kenosha': 'Kenosha, WI', 'Daphne': 'Daphne-Fairhope', 'Myrtle Beach': 'Myrtle Beach-Conway', 'Waterbury': 'Waterbury-Shelton'})


def _acs_name(name):
    import re
    st = US_METROS[name][0]
    base = _ACS_ALIAS.get(name) or re.sub(r' [A-Z]{2}$', '', name)
    hits = [k for k in _ACS if k.startswith(base) and st in k.split(', ')[-1].split('-')
            and (name in _ACS_ALIAS or k.split(',')[0].split('-')[0].strip() == base)]
    return hits[0] if len(hits) == 1 else None


ACS = {n: _ACS[a] for n in US_METROS for a in [_acs_name(n)] if a}
