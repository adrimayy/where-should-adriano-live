# Validation of the sources added in November 2026

Made by `tests/validate_sources.py`. Every check predicts places whose real value is known and was held out.

## 1. BEA price parities on Numbeo's cost scale

27 US cities have both a BEA regional price parity (2023) and a Numbeo cost-of-living-plus-rent index. Fit: ln(index) = -7.31 + 2.47 ln(RPP), R² = 0.71. Leaving each city out in turn, the predicted band is off by 0.26 on average.

The calibration cities cover RPP 94.7–115.6. Most small metros are cheaper than that, so the fit was also tested in the direction it would be extrapolated: trained on the more expensive cities, used on the cheaper ones.

| Trained on | Tested on | Extrapolating: bias (index points) | band error | Held flat at the edge: bias | band error |
|---|---|---|---|---|---|
| top 18 | bottom 9 | -7.6 | 0.67 | -1.2 | 0.24 |
| top 14 | bottom 13 | -5.9 | 0.56 | +3.0 | 0.28 |
| top 10 | bottom 17 | +1.1 | 0.31 | +10.3 | 0.70 |

Extrapolating downward makes cheap cities look cheaper than they are in the two splits closest to the real use. Holding the conversion flat below the calibration range is closer and nearly unbiased there; it fails only when the calibration set is cut to the ten most expensive cities, which is not the real case.
**Rule used:** the fit inside the range (148 metros); below it, the value at the edge of the range, shown as "or less" (211 metros). That is a ceiling on cost: it can understate how affordable a small metro is, never overstate it.

### BEA income per person as money left after rent: tested, not used

BEA income per person divided by the price parity ("real income") was tried as a measure of money left after rent, on the 27 cities that have both. It explains 5% of it; leaving each city out, the band is off by 0.47, against 0.49 for simply guessing the average. Personal income counts everyone and every kind of income (pensions, dividends, benefits); the atlas measures one worker's take-home pay minus a one-bedroom rent. They are different quantities, so BEA income is not used. Census earnings and rents are the right ingredients; see section 4.

## 2. January and July as the coldest and hottest month

9 US cities have both the January/July normals and full 12-month normals. Hottest month: bias -0.13 °C, mean absolute error 0.62 °C. Coldest month: bias +0.57 °C, mean absolute error 0.57 °C. The climate bands are several degrees wide.
The largest miss is San Francisco (-1.9 °C on the hottest month): on the California coast September is warmer than July, so July understates the peak there. Coastal California metros with only January/July figures (Santa Cruz, Salinas, San Luis Obispo, Santa Barbara, Oxnard, Napa, Santa Rosa, Vallejo) carry that caveat.

## 3. Borrowing the nearest station

For each of 246 US places with their own temperatures and another station within 120 km, the neighbour's figures were used instead. Hottest month off by 1.06 °C and coldest by 1.08 °C on average; the climate band is off by 0.26, and by a full band or more in 2% of cases. The pipeline also refuses to borrow across mountains, deserts and coasts (a fixed list of 33 places), where the error is largest.

## 4. Census ACS figures on the atlas's scales (earnings, rent and how people get to work: 2025; commute time and vacancy: 2024)

Inside one country the gap-filling model predicts close to the national city average for every city, so the benchmark here is "guess the US average". A Census figure is used only if it predicts held-out cities better than that.

| Factor | Census figure | Cities with both | Rank correlation | Band error: conversion | Band error: US average | Decision |
|---|---|---|---|---|---|---|
| Commute | mean travel time to work | 27 | 0.70 | 0.53 | 0.69 | used (363 metros) |
| Housing availability | rental vacancy rate | 28 | 0.66 | 0.52 | 0.86 | used inside the calibrated range (298 metros) |
| Car dependence | share driving alone | 28 | 0.06 | 0.51 | 0.44 | **not used** |
| Money left after rent | earnings, rent, BEA prices, converted one by one | 27 | | 0.35 | 0.49 | used inside the calibrated ranges (95 metros) |

**Money left after rent.** Census earnings track Numbeo's salaries (correlation 0.74) and Census rents track Numbeo's rents (0.80), but a single regression of the final figure on earnings and rent does poorly, because the figure is a difference of two large, correlated amounts and small errors in each dominate it. Converting salary, rent and prices separately and then applying the atlas's formula keeps each conversion where it is strong. Trained on the 14 higher-rent cities and applied to the 13 cheaper ones without limits, it overstates money left by $906 a month on average, so it is applied only to metros whose earnings, rent and price level all lie inside the calibrated ranges. The rest stay filled in.

**Car dependence.** The share of workers who drive alone has no relationship with the Numbeo traffic CO₂ index the atlas scores. Among large US metros the two do not measure the same thing, so the Census figure is not substituted. This is also a caution about the Numbeo measure, which is why it is now averaged with the ITDP Atlas wherever ITDP covers the city.

**ITDP Atlas.** Its score does track how people get to work: across 40 US metros it correlates -0.62 with the share driving alone and 0.61 with the share taking transit (Census ACS 2025), and -0.67 with Numbeo's traffic CO₂ index across the 143 cities both cover.

**Housing availability.** The Census Bureau publishes rental vacancy from two surveys. The atlas used the Housing Vacancy Survey (75 large metros); the ACS covers every metro but reads about a point lower, so it is shifted onto the first survey's scale. Above the calibrated range (very high vacancy, mostly resort areas) the conversion was unreliable and is not used.

