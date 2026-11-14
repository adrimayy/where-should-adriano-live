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
