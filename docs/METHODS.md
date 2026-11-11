# Methods

## How a score is made

1. **Published numbers become 1–5 values.** Each factor's figures come from the sources below; the cut-offs are all in
   `pipeline/bands.py`. A figure keeps its exact position inside its band: a value right on the 4/5 cut-off is 4.5, and
   values move in a straight line between cut-offs. The page shows whole bands and uses the exact values (a setting can switch
   back to whole bands). Where several sources exist, their values are averaged.
2. **Gaps are filled, tested, and drawn 20 times** (`pipeline/fill_gaps.py`, details below).
3. **Weights.** The score out of 100 is the weighted average of a place's values. Weights come from Adriano's priorities,
   equal weights (the page's starting view), or the quiz. Factors sit under three goals: growth (jobs, money after rent,
   work permit, language), happiness (life satisfaction, welcoming, things happening, climate, daylight, distance from home,
   women's rights, LGBTQ+, US politics) and efficiency and security (housing availability, commute, car dependence,
   healthcare, safety, freedom). Optional settings: rescale every factor to the same average and spread (z-score, default)
   or the same lowest and highest (min-max); combine with a weighted average (default) or a geometric mean, where a weak
   spot costs more.
4. **Uncertainty.** Each score is recalculated 120 times. Filled-in values take one of their 20 imputed versions per run;
   published values move by an assumed measurement error (about ±0.5 on the 1–5 scale for crowd surveys such as Numbeo and
   expat surveys, ±0.25 for official statistics, in between for mixed sources). From the runs: the likely range (10th to
   90th percentile), the rank range, the chance of being a Strong fit, and the chance of making the top 10. The combined
   uncertainty of each score is also computed with Rubin's rules (within-dataset measurement error plus 1.05 × the spread
   between the 20 completed datasets) and shown in the calculation table.
5. **Verdicts and rules** (all judgment calls, listed on the page under "Choices I made"):
   - Strong fit 70+, Workable 60+, Caution 48+, and below that "Poor match for these priorities".
   - Limited freedoms (2 or lower) or active war cap a place at Poor match. A filled-in freedom value that is more likely
     than not at 2 or below (most of its 20 versions are) gets the same cap, marked "likely".
   - Capped at Caution: the hardest places to make friends, trips home over 18 hours, the highest crime (also applied to a
     filled-in safety value that is more likely than not the lowest), and hot summers (hottest month averaging 27 °C or
     more, unless the person chose hot weather).
   - A place can only be a Strong fit if housing, jobs, healthcare, safety, freedom and money after rent all have published
     figures there and filled-in values make up less than a fifth of its score.
   - Within a verdict, places sort by the low end of their likely range (cautious) or, if chosen, the middle (best guess).
     The low end favors well-measured places; the middle treats every place as its best guess, so uncertain places rise.
   - Screening: minimums can be set per factor. Any place below a minimum is removed, and the rest are ranked by weighted
     score, so a strength elsewhere can't make up for falling short where it matters most.
6. **Display.** Scores show rounded to the nearest 5 in the list and on the map (a 1-point gap is inside the measurement
   error), with the exact value in the calculation table. Ranges show as bars.

## Factors and sources

| Factor | Sources (file in `pipeline/sources/`) | Unit | Year |
|---|---|---|---|
| Healthcare | WHO UHC Service Coverage Index; Numbeo Health Care; share without coverage for the US (Census) and Mexico (CONEVAL) — `health.py`, `numbeo.py` | country; city | 2023; 2026; 2025 / 2022 |
| Money left after rent | Net salary minus one-bedroom rent in the centre, ÷ Numbeo prices (NYC = 100%), in New York dollars. Numbeo item prices for 45 cities (StatRanker, snapshot 25 Apr 2026); other cities rebuilt from Numbeo indices, calibrated on those 45 (index salaries ÷ 1.365, index rents ÷ 0.946). Countries: mean of their cities, else Numbeo purchasing power — `numbeo.py`, `bands.py` | city | Apr 2026 |
| Housing availability | Census rental vacancy by metro, NYC Housing and Vacancy Survey, CMHC (Canada), InterNations housing ranks — `housing.py` | metro / city / country | 2023–2026 |
| Job market | Metro GDP (counted once), ILO youth unemployment, ILO informal-job share; for tech, the StartupBlink city rank — `jobs.py` | metro; country | 2021–24; 2024; 2025 |
| Safety | UNODC homicide rates, FBI city rates, Numbeo Safety — `safety.py`, `numbeo.py` | country; city | 2022–23; 2024; 2026 |
| Freedom | EIU Democracy Index, Freedom House — `freedom.py` | country | 2023; 2026 |
| Climate | Hottest and coldest month mean temperatures (1991–2020 normals, counted twice) plus Numbeo Climate Index — `climate.py`, `numbeo.py` | station; city | 1991–2020; 2026 |
| Commute | Numbeo commute time; LIRR train times for Long Island commuter towns — `numbeo.py`, `getting_around.py` | city; town | 2026 |
| Car dependence | Numbeo traffic CO2, everywhere. Walk Score / Transit Score shown on US and Canadian city pages, not scored — `numbeo.py`, `getting_around.py` | city | 2026 |
| Welcoming | InterNations Expat Insider (countries 2025, cities 2024); Gallup Migrant Acceptance Index only where no rank exists — `people.py` | country; city | 2025; 2024; 2016–17 |
| Life satisfaction | World Happiness Report 2026; optional "beyond income, health and freedom" version (below) — `people.py` | country | 2026 |
| Women's rights | Women, Peace and Security Index 2025/26 — `people.py` | country | 2025 |
| LGBTQ+ acceptance | Equaldex Equality Index (fetched Nov 2026) — `people.py` | country | 2026 |
| Things happening | Metro population, as a stand-in — `jobs.py` | metro | 2021–24 |
| US politics (optional) | 2024 presidential margin by state and by county (Ballotpedia), averaged — `politics.py` | state; county | 2024 |
| Daylight, trip home | Calculated in the page from latitude and distance | — | — |
| Work permit, language | Official rules (below) and official languages, applied in the page | country | checked 11 Nov 2026 |
| Helpers for gap-filling (not scored) | GDP per person, PPP (World Bank via Wikipedia); population (UN); world region — `economy.py` | country | latest (mostly 2024) |

`tests/data_age.py` lists every source whose period ended more than 12 months ago; `.github/workflows/data-age.yml` runs it
monthly on GitHub. On 11 Nov 2026 it flagged 23 of 49 source entries (climate normals are exempt; the oldest is the Gallup acceptance index, 2016–17).

Every figure in a place's calculation table shows what it covers (city, metro, county, state, country, weather station)
and its year. Metro figures are used wherever published (GDP, population, rental vacancy).

### Work-permit rules (checked 11 Nov 2026)

The page shows two parts for each place: the legal right to work (citizenship or free movement), and the route for a
junior hire without that right. No published data measures how often employers sponsor junior hires, so the route is a
rule-based judgment, marked as official rules.

- UK High Potential Individual visa: the 2026 global universities list (published 1 Nov 2026, updated 4 Nov 2026) includes
  Columbia and covers degrees awarded 1 Nov 2026 to 31 Oct 2027. gov.uk HPI list.
- EU Blue Card: Netherlands 2026 thresholds €5,942 a month, €4,754 for recent graduates (Staatscourant via eubluecard.nl).
  Other EU countries' 2026 thresholds were not verified this round.
- Spain: two years of legal residence before applying for citizenship for Ibero-American nationals, Mexicans included,
  keeping dual nationality (Civil Code art. 22).
- USMCA TN: Mexican citizens need a TN visa, a prearranged US job in a listed profession and, for most professions, a
  bachelor's degree (US State Department).
- US citizens abroad still file US taxes every year (IRS); the page notes this on every place outside the US.

## Gap-filling (van Buuren, Little & Rubin, Gelman)

- **Are the gaps random?** No. For each factor, `fill_gaps.py` compares countries with and without a figure on log GDP per
  person, log population and region, and fits a model predicting which countries are missing. Missing car dependence,
  climate, commute and safety figures are very predictable (AUC 0.93–0.96) and concentrated in poorer countries (about
  1.2–1.4 standard deviations poorer) and Sub-Saharan Africa. The table is on the page.
- **Helpers.** Because the gaps follow wealth, size and region, those three are added to the imputation model.
- **Multiple imputation.** 20 completed datasets. In each one, other gaps are drawn from the model's posterior, the factor's
  regression is refit on a bootstrap sample, and predictive mean matching fills the gap with a real published value from
  one of the 5 countries whose prediction is closest, so values stay on the scale they come in.
- **Accuracy, two ways.** Hiding random known values (5-fold), and hiding values the way real gaps happen (more often in
  poorer, smaller countries, weighted by the missingness model). The worse of the two counts.
- **Not filled in:** a factor whose error is above 1.0 point on either test. As of this build: climate (1.04 on the
  realistic test), job market (1.08) and welcoming (1.07) for countries. The model never fills them; a country only gets
  one if it can be averaged from its own cities' published figures.
- **Cities: a multilevel model.** City value = a + b × its country's value (+ metro size for jobs), plus a country effect
  estimated from the country's other cities and shrunk toward zero by how many there are (partial pooling). Pooling cut the
  leave-one-out error for jobs from 0.47 to 0.37 and for safety from 0.58 to 0.49; elsewhere the country effect is near zero.
  Imputed city values also come as 20 draws, using the country's draws.
- Share filled in: 27% of country values, 14.5% of city values.

## Do factors overlap? (Saltelli & Saisana)

`tests/overlap.py` writes `docs/OVERLAP.md`. Across countries, life satisfaction, healthcare, women's rights, LGBTQ+
acceptance and freedom correlate at 0.71–0.78: they move together with development. The first principal component carries
47% of country variation. Across cities, only two pairs pass 0.7, both incidental (car dependence vs welcoming, −0.77,
driven by US cities that get the national welcoming score).

Changes made because of overlap:
- Housing, cost and purchasing power were merged into **money left after rent**. Housing now measures only availability.
  Adriano's weights moved with it: money after rent 1.25 → 1.75, housing 1.5 → 1.
- Metro GDP counts once in the job market, not twice, because metro size also drives "things happening".
- Life satisfaction already partly reflects income, health and freedom. Healthcare, freedom and log GDP per person explain
  61% of its variation across countries, so the weights panel offers a "beyond income, health and freedom" version: the
  remainder, rescaled to 1–5.

The weights panel also shows each factor's **real influence**: its share of the variance of scores across places
(covariance of its points with the total). A heavy slider on a factor where places hardly differ moves little.

## Sensitivity (Sobol indices)

`tests/robustness.py` varies five groups of choices together, 1,792 runs: weights (×0.5 to ×2, 15% chance of dropping a
factor), cut-offs (all values bent by a power between 1/1.2 and 1.2, equivalent to moving every cut-off by about ±10%;
the cut-offs themselves are fixed at build time), rescaling (z-score vs min-max), combining (average vs geometric mean) and
gap-filling (on/off). Variance-weighted over Adriano's top 15, the share of rank variation each explains (first-order /
total):

| Choice | Alone | With interactions |
|---|---|---|
| Weights | 0.49 | 0.81 |
| Gap-filling on/off | 0.10 | 0.34 |
| Combining | 0.05 | 0.09 |
| Cut-offs | 0.01 | 0.03 |
| Rescaling | 0.00 | 0.02 |

Weights decide most of the order. Gap-filling matters for places with thin data (Bilbao, the Long Island towns); the
geometric mean moves car-dependent places (Los Angeles, San Francisco). Share of runs in the top 10: Amsterdam 91%,
Madrid 84%, Valencia 82%, Barcelona 63%, New York 61%, London 59%.

## Does wealth drive the ranking? (O'Neil)

`tests/wealth_bias.py`: across cities, national GDP per person explains 57% of the variation in Adriano's scores (r = 0.76)
and 53% with equal weights. Each doubling of GDP per person is worth about 6 points. Richer places do score better on most
measured factors, but a ranking this tied to wealth also inherits what the sources miss about rich places: the next section.

## Cheap and high-scoring: what might the data be missing? (Albouy)

Albouy's point is that good places get priced into rents and wages, so a place that is both cheap (lots of money left after
rent) and high-scoring deserves suspicion. Cities in the top quarter of scores with money-after-rent of 4 or more:

- **Munich, Frankfurt, Berlin, Vienna, Copenhagen, Utrecht, Rotterdam:** high local salaries and listed rents, but these are
  some of the tightest rental markets in Europe; the listed one-bedroom rent says nothing about how long finding one takes.
  Availability is mostly a national expat-survey figure. All are held down by making friends.
- **Baltimore, Buffalo, Philadelphia, Pittsburgh, Sacramento, Seattle, Portland:** money comes from Numbeo indices, not item
  prices, and Numbeo's average salary is for current residents, not a new graduate. Baltimore's drawback is safety; the
  others are car-dependent. Snowfall (Buffalo) isn't scored.
- **San Francisco, Los Angeles, Toronto:** salaries are high for people already established; the entry-level gap, the cost
  of a car and long commutes are only partly captured.
- **Singapore:** item-price rent ($4,150) is for the centre; work permits for a junior foreign hire are the real hurdle.

## Career horizon (Moretti)

Early-career moves into large, dense job markets pay off for years: wages and job-switching options in big tech clusters
compound over a career. The quiz asks how far ahead you're planning; "the long run" raises the job-market weight by 30%,
"my first job" lowers it by 20%. For hybrid work, a city can borrow the job market of a bigger city within 120 km.

## Quiz design (Krosnick, Keeney, Gilbert, Levels)

- One thing per question: healthcare no longer includes work-life balance; safety and freedom, jobs and money, car
  dependence and commute are separate questions.
- Importance questions are swing questions naming a real change (e.g. "from about $1,700 a month left after a one-bedroom,
  New York, to about $4,000, Pittsburgh in New York prices"), all answered on the same 3-point scale, low to high.
- Answers without a natural order are shuffled, with "other / doesn't matter" kept last.
- A 5-question version is the default; the full quiz has 20. Every question that was skipped or not asked shows its default
  on the results screen, where it can be answered.
- A note before the first question: people tend to overweight weather and short visits and underweight commutes and
  friendships. An optional setting moves 30% of the climate and daylight weight to commute and making friends.
- Each city page lists three questions to ask a resident, picked from its weakest and least certain factors.

## How the 137 cities were chosen, and what's under-covered (Monmonier)

The list started from places Adriano has lived, visited or considered, then added the largest tech hubs, capitals and
large Spanish-speaking cities, the Long Island towns near his family, and at his request the major upstate New York
cities. That makes it lopsided: North America 46 cities (40 in the US), Europe 44, Latin America 20, East Asia and Pacific
17, Sub-Saharan Africa 5, Middle East and North Africa 2, South Asia 1, Central Asia and the Caucasus 1. Country shading
covers everywhere, and a dots-only map mode removes the visual weight of big countries.

## Rights and politics factors (O'Neil)

Women's rights, LGBTQ+ acceptance and politics describe laws and national or county averages: how a country's laws treat
people, how its residents answer surveys, how neighbors voted. They don't predict how any one person will be treated, and
they miss differences between neighborhoods, workplaces and families. The politics factor is off unless chosen in the quiz.

## What couldn't be done, and why

- **Occupation salaries and tax tables (Albouy, Tamkivi):** no consistent source for software-engineer pay by city, or
  national, state and city income tax for every country, was reachable. Money after rent uses Numbeo's average net salary
  (already after tax); the offer tool asks for take-home pay.
- **Bachelor's-degree share, venues per person, 5-year rent growth (Glaeser):** Census, Eurostat and Zillow downloads are
  blocked from this build environment, and no search-reachable table covered the cities.
- **Software developers per metro (Moretti), office counts and junior postings (tech recruiter):** BLS OES tables weren't
  reachable; no published, comparable count of junior postings exists. The tech score still uses StartupBlink.
- **Migrant-specific happiness (WHR 2018) and social trust (World Values Survey) (Helliwell):** no fetchable per-country
  table was found.
- **Humidity, snowfall, 2030s projections (climate scientist):** no consistent source covering all 137 cities.
- **Numbeo contributor counts (Adamović):** not published on reachable pages, so measurement error is a fixed assumption by
  source type, not scaled by sample size.
- **Transit frequency and jobs reachable by transit (Walk Score):** no global source; ITDP data wasn't reachable.
- **Columbia graduate destinations (Davis):** Columbia's Beyond Columbia survey reports industries (internet and software
  16.4%, investment banking 11.9%) but not locations.
- **Map (Bostock):** world-atlas 50m outlines can't be bundled offline here and can't be fetched at runtime (the artifact
  host allows only scripts from CDNs, not JSON). The page now loads Datamaps' high-detail outlines (a script, about 130 KB
  compressed) and falls back to the standard ones; the outline data dates from about 2015. The default projection is
  Winkel tripel, written into the page. Scoring stays on the main thread:
  sliders re-score without the 120 recalculations while dragging and run them on release.
- **Residents' ratings (Levels):** built, but they only work in the claude.ai artifact, which has a shared database. On
  GitHub Pages the section doesn't appear.
