# Changelog

How the method changed, and what it did to the top of Adriano's list.

## Method

- **First version:** San Francisco, a judgment from 42 answers. A first formula (14 weighted factors) put New York on top.
- **Published data only:** UN homicide rates and Freedom House replaced estimates, and missing data stopped counting as
  average (Madrid). Once New York's strengths, jobs and things happening, were found to be estimates and dropped,
  Utrecht led.
- **Tested gap-filling** with score ranges; a measured job market and housing; real temperatures for climate; optional US
  politics. Dallas and Valencia traded the lead until heat and politics were measured.
- **Adriano's own weights** (roommates fine, climate up): Amsterdam, Valencia close behind.
- **Expert review:** money left after rent replaced two measures that both counted rent; metro GDP counts once; one
  car-dependence measure everywhere; 20-draw multiple imputation; a sensitivity analysis. Amsterdam, Valencia, Madrid.
- **For anyone:** any languages and passports, 59 more cities (196), Gallup's Law and Order Index next to homicide rates,
  optional cultural familiarity, the freedom dealbreaker skipped for your own countries, race data shown but not scored.
  Adriano's top three unchanged.
- **Every US metro and more of the world:** 744 cities. Places that lean on filled-in data rank after well-measured ones
  with the same verdict. The page now opens on the visitor's own map; Adriano's picks show only for people who know him.
- **Measured, and checked, where it was filled:** BEA price levels give cost of living for 345 US metros, all 50 states
  have their 2024 margin, and each new shortcut was tested on held-out places before use. Two were rejected.
- **Census data for US metros:** commute (361 metros), rental vacancy (297) and money after rent (86) are now measured.
  Driving-alone share was rejected as a car-dependence measure. The share of city scores filled in fell from 61% to 49%.

- **Local data where it was national or filled in (v49):** US metros get their own unemployment (BLS, 390), homicide
  rate (County Health Rankings, 308 more beyond the FBI's 28), share without health insurance (Census SAHIE, 387) and EPA
  air monitors (278), plus Census 2025 earnings, rents and populations. European cities get their region's unemployment
  (Eurostat, 67); every other city now uses its country's rate instead of none. Getting around averages Numbeo with the
  ITDP Atlas (309 cities), which tracks Census commuting where Numbeo doesn't. Freedom House now covers 167 countries (was
  31 copied by hand), UNODC homicides 129 countries at their latest year (was 28), and working hours 159 countries: ILO
  weekly hours fill 35 that PWT lacks, and Mexico uses the OECD's 2,193 h because PWT 11's 1,629 h contradicts every
  other source. Links for Freedom House and UNODC now go to the publishers, not aggregator sites. The share of city scores
  filled in fell from 48% to 35%. Adriano's top three: Amsterdam, Reykjavík, London; Valencia is fifth, behind Madrid,
  mostly because its region's unemployment (12.1%) now counts.
- **Low disaster risk; newer working hours (v48):** WorldRiskIndex 2026 for 193 countries, with its own quiz question.
  Working hours moved to Penn World Table 11.0 (129 countries, mostly 2023, from the Our World in Data file); the
  model can't fill the rest within a point, so those countries are left without a value. Checked the uploaded WHO file
  (identical to the one used) and Our World in Data's PM2.5 file (matches for all 168 countries).
- **Clean air, honest institutions, time off (v47):** three factors from the WHO air quality database (451 cities) and the
  World Bank, Transparency International's 2025 index, and the Penn World Table. Each has its own quiz question. Adriano's
  top three became Amsterdam, Reykjavík, Valencia (Madrid fourth): Iceland is clean, honest and works short hours.

## Page

- Map: canvas land layer, Web Mercator, one automatic look (light, dark, color-blind safe, print), labels that never
  overlap, zoom limited by how close the nearest cities are.
- Interface in 8 languages; a 6-question quiz with "Sharpen it" for the rest; a searchable place picker.
- Code split into `index.html`, `css/`, `js/` and one data file made by `build.py`.

## What held up

Across every version and the sensitivity tests, the steadiest at the top are Amsterdam (top 10 in 91% of runs), Madrid
(84%) and Valencia (82%). Cities that led only once were usually riding a gap in the data.
