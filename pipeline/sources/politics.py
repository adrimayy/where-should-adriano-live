"""US state politics: 2024 presidential margin by state, and which state each US city is in.
Every number is copied from the source named in its comment."""

# ---------- US state politics: 2024 presidential vote, Harris minus Trump, percentage points (official results via Wikipedia) ----------
STATE_MARGIN = {'NY': 12.60, 'CA': 20.14, 'WA': 18.22, 'MA': 25.20, 'DC': 83.81, 'IL': 10.90, 'PA': -1.71, 'CO': 10.99, 'TX': -13.68,
                'GA': -2.19, 'NC': -3.21, 'FL': -13.10, 'AZ': -5.53, 'MN': 4.24, 'OR': 14.30, 'TN': -29.72, 'UT': -21.59, 'MD': 28.54}

CITY_STATE = {'New York City': 'NY', 'San Francisco': 'CA', 'Seattle': 'WA', 'Boston': 'MA', 'Washington DC': 'DC', 'Chicago': 'IL',
              'Pittsburgh': 'PA', 'Denver': 'CO', 'Los Angeles': 'CA', 'San Diego': 'CA', 'Austin': 'TX', 'Atlanta': 'GA', 'Raleigh': 'NC',
              'Houston': 'TX', 'Miami': 'FL', 'Phoenix': 'AZ', 'Philadelphia': 'PA', 'Minneapolis': 'MN', 'Portland': 'OR', 'Dallas': 'TX',
              'Nashville': 'TN', 'Salt Lake City': 'UT', 'Baltimore': 'MD', 'Sacramento': 'CA', 'Charlotte': 'NC',
              **{k: 'NY' for k in ['East Hampton', 'Southampton', 'Montauk', 'Riverhead', 'Stony Brook', 'Port Jefferson', 'Patchogue',
                                   'Huntington', 'Long Beach', 'Garden City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany', 'Binghamton']}}

# ---------- county results, 2024 presidential vote, Democratic minus Republican, percentage points
# (Ballotpedia "County-level presidential election voting trends, 2016-2024", fetched Nov 2026). New York City uses
# New York County (Manhattan), because Ballotpedia lists boroughs separately. ----------
COUNTY_MARGIN = {'New York County': 63.6, 'Suffolk County, NY': -9.9, 'Nassau County, NY': -4.1, 'Erie County': 9.5, 'Monroe County': 18.9,
 'Onondaga County': 17.1, 'Albany County': 25.4, 'Broome County': 0.4, 'San Francisco': 64.8, 'Los Angeles County': 32.9, 'San Diego County': 16.8,
 'Sacramento County': 19.7, 'King County': 51.3, 'Suffolk County, MA': 52.1, 'District of Columbia': 83.8, 'Cook County': 41.6,
 'Allegheny County': 20.2, 'Philadelphia': 58.6, 'Denver': 56.1, 'Travis County': 39.1, 'Harris County': 5.5, 'Dallas County': 22.1,
 'Fulton County': 44.5, 'Wake County': 25.4, 'Mecklenburg County': 32.7, 'Hennepin County': 42.4, 'Multnomah County': 61.6,
 'Davidson County': 27.2, 'Salt Lake County': 10.1, 'Baltimore (city)': 72.4, 'Miami-Dade County': -11.4, 'Maricopa County': -3.5}
CITY_COUNTY = {'New York City': 'New York County', 'San Francisco': 'San Francisco', 'Seattle': 'King County', 'Boston': 'Suffolk County, MA',
 'Washington DC': 'District of Columbia', 'Chicago': 'Cook County', 'Pittsburgh': 'Allegheny County', 'Denver': 'Denver',
 'Los Angeles': 'Los Angeles County', 'San Diego': 'San Diego County', 'Austin': 'Travis County', 'Atlanta': 'Fulton County',
 'Raleigh': 'Wake County', 'Houston': 'Harris County', 'Miami': 'Miami-Dade County', 'Phoenix': 'Maricopa County',
 'Philadelphia': 'Philadelphia', 'Minneapolis': 'Hennepin County', 'Portland': 'Multnomah County', 'Dallas': 'Dallas County',
 'Nashville': 'Davidson County', 'Salt Lake City': 'Salt Lake County', 'Baltimore': 'Baltimore (city)', 'Sacramento': 'Sacramento County',
 'Charlotte': 'Mecklenburg County', 'Buffalo': 'Erie County', 'Rochester': 'Monroe County', 'Syracuse': 'Onondaga County',
 'Albany': 'Albany County', 'Binghamton': 'Broome County', 'Long Beach': 'Nassau County, NY', 'Garden City': 'Nassau County, NY',
 **{k: 'Suffolk County, NY' for k in ['East Hampton', 'Southampton', 'Montauk', 'Riverhead', 'Stony Brook', 'Port Jefferson', 'Patchogue', 'Huntington']}}
