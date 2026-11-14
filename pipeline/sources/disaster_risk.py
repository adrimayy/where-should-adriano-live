"""Low disaster risk: WorldRiskIndex 2026 (WorldRiskReport, Bündnis Entwicklung Hilft and IFHV Ruhr University Bochum),
column W: exposure to earthquakes, tsunamis, coastal and river floods, cyclones, droughts and sea-level rise, combined with
how vulnerable society is. 0 = lowest risk; the highest country scores about 47. A national figure.
Made by pipeline/import_tables.py on 2026-11-14 from worldriskindex-trend.csv (HDX), sha256 750cabad9ddbd013.
https://data.humdata.org/dataset/worldriskindex   ISO3 -> W."""
WRI_YEAR = 2026
WRI = {
    'AFG': 4.18, 'AGO': 10.85, 'ALB': 5.79, 'AND': 0.33, 'ARE': 8.53, 'ARG': 15.67, 'ARM': 2.66, 'ATG': 3.3,
    'AUS': 19.92, 'AUT': 1.37, 'AZE': 2.36, 'BDI': 3.07, 'BEL': 4.61, 'BEN': 3.46, 'BFA': 2.06, 'BGD': 25.7,
    'BGR': 2.34, 'BHR': 0.87, 'BHS': 4.04, 'BIH': 2.87, 'BLR': 0.74, 'BLZ': 5.9, 'BOL': 3.17, 'BRA': 12.85,
    'BRB': 3.88, 'BRN': 2.07, 'BTN': 1.14, 'BWA': 1.47, 'CAF': 3.37, 'CAN': 19.48, 'CHE': 1.15, 'CHL': 14.46,
    'CHN': 29.54, 'CIV': 2.98, 'CMR': 10.08, 'COD': 10.76, 'COG': 3.67, 'COL': 39.8, 'COM': 4.66, 'CPV': 1.52,
    'CRI': 12.14, 'CUB': 6.61, 'CYP': 3.15, 'CZE': 1.23, 'DEU': 4.29, 'DJI': 6.14, 'DMA': 3.43, 'DNK': 1.13,
    'DOM': 13.5, 'DZA': 7.96, 'ECU': 20.8, 'EGY': 17.74, 'ERI': 6.2, 'ESP': 9.74, 'EST': 1.99, 'ETH': 4.89,
    'FIN': 1.59, 'FJI': 7.51, 'FRA': 5.92, 'FSM': 8.07, 'GAB': 6.3, 'GBR': 4.95, 'GEO': 4.06, 'GHA': 3.28,
    'GIN': 6.73, 'GMB': 4.09, 'GNB': 3.59, 'GNQ': 2.24, 'GRC': 10.1, 'GRD': 2.88, 'GTM': 22.41, 'GUY': 5.71,
    'HND': 27.68, 'HRV': 4.84, 'HTI': 17.81, 'HUN': 0.82, 'IDN': 44.63, 'IND': 44.97, 'IRL': 3.32, 'IRN': 18.77,
    'IRQ': 9.16, 'ISL': 2.37, 'ISR': 4.43, 'ITA': 10.98, 'JAM': 4.26, 'JOR': 4.21, 'JPN': 22.69, 'KAZ': 2.18,
    'KEN': 13.28, 'KGZ': 2.96, 'KHM': 8.1, 'KIR': 2.41, 'KNA': 2.49, 'KOR': 10.2, 'KWT': 2.29, 'LAO': 2.99,
    'LBN': 5.38, 'LBR': 4.08, 'LBY': 15.15, 'LCA': 2.67, 'LIE': 0.67, 'LKA': 7.57, 'LSO': 1.22, 'LTU': 2.48,
    'LUX': 0.45, 'LVA': 3.19, 'MAR': 12.59, 'MCO': 0.21, 'MDA': 1.19, 'MDG': 24.16, 'MDV': 1.51, 'MEX': 39.18,
    'MHL': 3.89, 'MKD': 1.37, 'MLI': 2.27, 'MLT': 0.98, 'MMR': 37.51, 'MNE': 2.81, 'MNG': 1.68, 'MOZ': 30.92,
    'MRT': 11.06, 'MUS': 3.06, 'MWI': 3.6, 'MYS': 12.9, 'NAM': 7.15, 'NER': 2.16, 'NGA': 9.08, 'NIC': 22.63,
    'NLD': 4.5, 'NOR': 2.66, 'NPL': 2.47, 'NRU': 1.65, 'NZL': 14.74, 'OMN': 8.46, 'PAK': 27.03, 'PAN': 18.18,
    'PER': 21.31, 'PHL': 46.69, 'PLW': 2.19, 'PNG': 27.64, 'POL': 5.77, 'PRK': 10.37, 'PRT': 5.36, 'PRY': 1.89,
    'QAT': 0.94, 'ROU': 3.3, 'RUS': 30.58, 'RWA': 2.48, 'SAU': 9.02, 'SDN': 7.34, 'SEN': 5.86, 'SGP': 0.72,
    'SLB': 15.03, 'SLE': 4.91, 'SLV': 17.44, 'SMR': 0.33, 'SOM': 29.12, 'SRB': 1.92, 'SSD': 4.14, 'STP': 0.85,
    'SUR': 6.26, 'SVK': 1.03, 'SVN': 3.7, 'SWE': 3.3, 'SWZ': 1.9, 'SYC': 1.89, 'SYR': 11.55, 'TCD': 2.88,
    'TGO': 2.65, 'THA': 21.15, 'TJK': 2.85, 'TKM': 1.29, 'TLS': 13.58, 'TON': 5.65, 'TTO': 4.57, 'TUN': 7.74,
    'TUR': 14.56, 'TUV': 1.42, 'TZA': 12.53, 'UGA': 3.57, 'UKR': 4.35, 'URY': 5.1, 'USA': 24.17, 'UZB': 1.55,
    'VCT': 2.64, 'VEN': 17.61, 'VNM': 24.83, 'VUT': 11.54, 'WSM': 4.98, 'YEM': 25.18, 'ZAF': 15.08, 'ZMB': 3.17,
    'ZWE': 2.77}
