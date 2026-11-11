"""Getting around: Walk Score / Transit Score for US and Canadian cities, LIRR train times for Long Island commuter towns.
Every number is copied from the source named in its comment."""

# ---------- getting around without a car, US and Canadian cities: Walk Score city rankings (walk score, transit score) ----------
WALK = {'New York City': (88.0, 88.6), 'San Francisco': (88.7, 77.1), 'Seattle': (74.4, 59.6), 'Boston': (82.8, 72.4), 'Washington DC': (76.7, 68.7),
        'Chicago': (77.2, 65.0), 'Pittsburgh': (62.4, 55.2), 'Denver': (61.2, 44.6), 'Los Angeles': (68.6, 52.9), 'San Diego': (53.3, 37.3),
        'Austin': (41.7, 34.8), 'Atlanta': (47.7, 43.7), 'Raleigh': (31.3, 29.4), 'Houston': (47.5, 36.2), 'Miami': (76.6, 57.0), 'Phoenix': (41.4, 35.6),
        'Philadelphia': (74.8, 67.0), 'Minneapolis': (71.4, 55.0), 'Portland': (67.3, 49.3), 'Dallas': (46.0, 38.9), 'Nashville': (28.8, 21.7),
        'Baltimore': (64.3, 53.2), 'Sacramento': (49.0, 33.9), 'Charlotte': (26.4, 27.4), 'Toronto': (61.0, 78.2), 'Vancouver': (79.8, 74.4),
        'Montreal': (65.4, 67.0), 'Ottawa': (45.1, 49.5), 'Calgary': (39.1, 49.5), 'Quebec City': (44.6, 46.9), 'Buffalo': (66.6, 47.5), 'Rochester': (60.7, 41.3)}

# Long Island Rail Road, typical train time to Penn Station (rome2rio: Huntington 70, Nassau Blvd/Garden City 43-54; Long Beach 55 per
# the LIRR branch guide) plus ~10 minutes to reach an office
LIRR_MIN = {'Garden City': 58, 'Long Beach': 65, 'Huntington': 80}
