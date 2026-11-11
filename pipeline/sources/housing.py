"""Housing availability: official rental vacancy (Census, NYC HVS, CMHC) and InterNations housing ranks.
Every number is copied from the source named in its comment."""

# ---------- housing availability: how hard it is to get a place at all ----------
# kinds: rank (r of n, lower = easier), hard (% of expats who say finding housing is hard, vs global %), easy (% who say it's easy, vs global %), vac (official rental vacancy %)
AV_CITY = {
 'New York City': ('vac', 1.4, None, 'nychvs'),          # NYC Housing and Vacancy Survey 2023, net rental vacancy
 'Panama City': ('rank', 1, 53, 'eicity24'), 'Mexico City': ('rank', 10, 53, 'eicity24'), 'Bangkok': ('rank', 2, 53, 'eicity24'),
 'Rome': ('rank', 24, 53, 'eicity24'), 'Istanbul': ('rank', 26, 53, 'eicity24'), 'Frankfurt': ('rank', 37, 53, 'eicity24'),
 'Amsterdam': ('rank', 45, 53, 'eicity24'), 'Barcelona': ('rank', 26, 53, 'eicity24'), 'Vancouver': ('rank', 48, 53, 'eicity24'),
 'Hamburg': ('rank', 50, 53, 'eicity24'), 'Berlin': ('hard', 79, 34, 'eicity24'),
}

AV_COUNTRY = {
 'Panama': ('rank', 1, 46, 'ei25'), 'Mexico': ('rank', 10, 46, 'ei25'), 'Colombia': ('rank', 10, 46, 'ei25'), 'Singapore': ('rank', 39, 46, 'ei25'),
 'Germany': ('rank', 43, 46, 'ei25'), 'Netherlands': ('rank', 44, 46, 'ei25'), 'Ireland': ('rank', 46, 46, 'ei25'),
 'Indonesia': ('rank', 7, 46, 'ei25'), 'United Arab Emirates': ('rank', 8, 46, 'ei25'), 'Malaysia': ('rank', 10, 46, 'ei25'), 'China': ('rank', 12, 46, 'ei25'),
 'South Korea': ('rank', 38, 46, 'ei25'), 'Japan': ('rank', 39, 46, 'ei25'), 'Canada': ('hard', 43, 36, 'ei25'), 'Turkey': ('hard', 44, 36, 'ei25'),
 'Vietnam': ('rank', 2, 53, 'ei24'), 'Oman': ('rank', 4, 53, 'ei24'), 'Kenya': ('rank', 11, 53, 'ei24'), 'Finland': ('rank', 31, 53, 'ei24'),
 'South Africa': ('rank', 7, 53, 'ei24'), 'Italy': ('easy', 29, 45, 'ei24'), 'Thailand': ('rank', 2, 31, 'ei26'),
 'United States': ('vac', 7.2, None, 'census'),          # Census Housing Vacancy Survey, Q4 2025, national
}

# Census Housing Vacancy Survey, rental vacancy by metro area, 2024 (table via DoorLoop's Census dashboard)
AV_US_MSA = {'San Francisco': 6.3, 'Seattle': 6.5, 'Boston': 3.0, 'Washington DC': 4.7, 'Chicago': 5.1, 'Pittsburgh': 8.9, 'Denver': 4.7, 'Los Angeles': 4.8, 'San Diego': 5.2, 'Austin': 8.2, 'Atlanta': 9.3, 'Raleigh': 8.8, 'Houston': 9.8, 'Miami': 9.5, 'Phoenix': 7.9, 'Philadelphia': 6.3, 'Minneapolis': 5.2, 'Portland': 5.7, 'Dallas': 8.9, 'Nashville': 8.6, 'Salt Lake City': 6.1, 'Baltimore': 6.1, 'Sacramento': 3.9, 'Charlotte': 6.7, 'Buffalo': 10.8, 'Rochester': 4.9, 'Syracuse': 4.0, 'Albany': 4.5}

for _k, _v in AV_US_MSA.items(): AV_CITY[_k] = ('vac', _v, None, 'censusmsa')

for _k in ['East Hampton', 'Southampton', 'Montauk', 'Riverhead', 'Stony Brook', 'Port Jefferson', 'Patchogue', 'Huntington', 'Long Beach', 'Garden City']: AV_CITY[_k] = ('vac', 4.7, None, 'censusmsa')   # Long Island is part of the New York-Newark-Jersey City metro area

# ---------- more housing availability: CMHC Rental Market Report, purpose-built vacancy, October 2025 ----------
AV_EXTRA = {'Toronto': [('vac', 3.0, None, 'cmhc')], 'Vancouver': [('vac', 3.7, None, 'cmhc')], 'Montreal': [('vac', 2.9, None, 'cmhc')],
            'Calgary': [('vac', 5.0, None, 'cmhc')]}

AV_COUNTRY_EXTRA = {'Canada': [('vac', 3.1, None, 'cmhc')]}
