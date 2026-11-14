"""Honest institutions: Transparency International Corruption Perceptions Index 2025 (published 10 Feb 2026).
0 = highly corrupt, 100 = very clean; perceptions of public-sector corruption by experts and business people.
Made by pipeline/import_tables.py on 2026-11-14 from CPI2025_Results.xlsx, sheet CPI2025, sha256 35f17f8a806325aa.
https://www.transparency.org/en/cpi/2025   ISO3 -> score."""
CPI = {
    'AFG': 16, 'AGO': 32, 'ALB': 39, 'ARE': 69, 'ARG': 36, 'ARM': 46, 'AUS': 76, 'AUT': 69, 'AZE': 30, 'BDI': 17,
    'BEL': 69, 'BEN': 45, 'BFA': 40, 'BGD': 24, 'BGR': 40, 'BHR': 50, 'BHS': 64, 'BIH': 34, 'BLR': 31, 'BLZ': 36,
    'BOL': 28, 'BRA': 35, 'BRB': 68, 'BRN': 63, 'BTN': 71, 'BWA': 58, 'CAF': 24, 'CAN': 75, 'CHE': 80, 'CHL': 63,
    'CHN': 43, 'CIV': 43, 'CMR': 26, 'COD': 20, 'COG': 23, 'COL': 37, 'COM': 20, 'CPV': 62, 'CRI': 56, 'CUB': 40,
    'CYP': 55, 'CZE': 59, 'DEU': 77, 'DJI': 31, 'DMA': 60, 'DNK': 89, 'DOM': 37, 'DZA': 34, 'ECU': 33, 'EGY': 30,
    'ERI': 13, 'ESP': 55, 'EST': 76, 'ETH': 38, 'FIN': 88, 'FJI': 55, 'FRA': 66, 'GAB': 29, 'GBR': 70, 'GEO': 50,
    'GHA': 43, 'GIN': 26, 'GMB': 37, 'GNB': 21, 'GNQ': 15, 'GRC': 50, 'GRD': 56, 'GTM': 26, 'GUY': 40, 'HKG': 76,
    'HND': 22, 'HRV': 47, 'HTI': 16, 'HUN': 40, 'IDN': 34, 'IND': 39, 'IRL': 76, 'IRN': 23, 'IRQ': 28, 'ISL': 77,
    'ISR': 62, 'ITA': 53, 'JAM': 44, 'JOR': 50, 'JPN': 71, 'KAZ': 38, 'KEN': 30, 'KGZ': 26, 'KHM': 20, 'KOR': 63,
    'KSV': 43, 'KWT': 46, 'LAO': 34, 'LBN': 23, 'LBR': 28, 'LBY': 13, 'LCA': 59, 'LKA': 35, 'LSO': 37, 'LTU': 65,
    'LUX': 78, 'LVA': 60, 'MAR': 39, 'MDA': 42, 'MDG': 25, 'MDV': 39, 'MEX': 27, 'MKD': 40, 'MLI': 28, 'MLT': 49,
    'MMR': 16, 'MNE': 46, 'MNG': 31, 'MOZ': 21, 'MRT': 30, 'MUS': 48, 'MWI': 34, 'MYS': 52, 'NAM': 46, 'NER': 31,
    'NGA': 26, 'NIC': 14, 'NLD': 78, 'NOR': 81, 'NPL': 34, 'NZL': 81, 'OMN': 52, 'PAK': 28, 'PAN': 33, 'PER': 30,
    'PHL': 32, 'PNG': 26, 'POL': 53, 'PRK': 15, 'PRT': 56, 'PRY': 24, 'QAT': 58, 'ROU': 45, 'RUS': 22, 'RWA': 58,
    'SAU': 57, 'SDN': 14, 'SEN': 46, 'SGP': 84, 'SLB': 44, 'SLE': 34, 'SLV': 32, 'SOM': 9, 'SRB': 33, 'SSD': 9,
    'STP': 45, 'SUR': 38, 'SVK': 48, 'SVN': 58, 'SWE': 80, 'SWZ': 23, 'SYC': 68, 'SYR': 15, 'TCD': 22, 'TGO': 32,
    'THA': 33, 'TJK': 19, 'TKM': 17, 'TLS': 44, 'TTO': 41, 'TUN': 39, 'TUR': 31, 'TWN': 68, 'TZA': 40, 'UGA': 25,
    'UKR': 36, 'URY': 73, 'USA': 64, 'UZB': 31, 'VCT': 63, 'VEN': 10, 'VNM': 41, 'VUT': 47, 'YEM': 13, 'ZAF': 41,
    'ZMB': 37, 'ZWE': 22}
