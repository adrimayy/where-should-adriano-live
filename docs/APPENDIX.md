# Methods: full detail

The short version is in [METHODS.md](METHODS.md). This file has the statistics, every source and every judgment call.

## How a score is made

1. **Published numbers become 1–5 values.** Each factor's figures come from the sources below; the cut-offs are all in
   `pipeline/bands.py`. A figure keeps its exact position inside its band: a value right on the 4/5 cut-off is 4.5, and
   values move in a straight line between cut-offs. The page shows whole bands and uses the exact values (a setting can switch
   back to whole bands). Where several sources exist, their values are averaged.
2. **Gaps are filled, tested, and drawn 20 times** (`pipeline/fill_gaps.py`, details below).
3. **Weights.** The score out of 100 is the weighted average of a place's values. Weights come from the quiz and can be
   changed afterwards; nothing is scored on screen before there is a take. Factors sit under three goals: growth (jobs, money after rent,
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
     filled-in safety value that is more likely than not the lowest), hot summers (hottest month averaging 27 °C or
     more, unless the person chose hot weather), and, only when things happening counts double or more for the person,
     metro areas under 500,000 people. A weight alone can't say "not a village": with things happening at the maximum
     weight, towns of 120,000 to 230,000 people still reached the sample take's top 14 on commutes, rent and housing.
   - A place can only be a Strong fit if housing, jobs, healthcare, safety, freedom and money after rent all have published
     figures there and filled-in values make up less than a fifth of its score.
   - Within a verdict, places with more than a fifth of their score filled in come after the rest. Then places sort by
     the score as it is shown (rounded to 5) and, among places showing the same score, by the low end of their likely
     range (cautious) or, if chosen, the middle (best guess). The low end favors well-measured places; the middle treats
     every place as its best guess, so uncertain places rise. Until v64 the low end came before the shown score, so
     about a dozen of the 744 cities sat above a place showing a higher score (a 60 above a 65) with nothing on screen
     to say why.
   - Screening: minimums can be set per factor. Any place below a minimum is removed, and the rest are ranked by weighted
     score, so a strength elsewhere can't make up for falling short where it matters most.
6. **Display.** Scores show rounded to the nearest 5 in the list and on the map (a 1-point gap is inside the measurement
   error), with the exact value in the calculation table. Ranges show as bars.

## Factors and sources

| Factor | Sources (file in `pipeline/sources/`) | Unit | Year |
|---|---|---|---|
| Healthcare | WHO UHC Service Coverage Index; Numbeo Health Care; share without coverage: US metros' own under-65 uninsured share (Census SAHIE via County Health Rankings, 387 metros), else national (US Census) and Mexico (CONEVAL) — `health.py`, `numbeo.py`, `us_local.py` | country; city; metro | 2023; 2026; 2023; 2025 / 2022 |
| Money left after rent | Net salary minus one-bedroom rent in the centre, ÷ Numbeo prices (NYC = 100%), in New York dollars. Numbeo item prices for 45 cities (StatRanker, snapshot 25 Apr 2026); other cities rebuilt from Numbeo indices, calibrated on those 45 (index salaries ÷ 1.365, index rents ÷ 0.946). Countries: mean of their cities, else Numbeo purchasing power — `numbeo.py`, `bands.py` | city | Apr 2026 |
| Housing availability | Census rental vacancy by metro, NYC Housing and Vacancy Survey, CMHC (Canada), InterNations housing ranks — `housing.py` | metro / city / country | 2023–2026 |
| Job market | Metro GDP (counted once); the local unemployment rate (BLS LAUS for 390 US metros, Nov 2025–Sep 2026; Eurostat NUTS 2 regions for 67 European cities, mean of 2024–2025), else the national rate (ILO); ILO youth unemployment; ILO informal-job share; for tech, the StartupBlink city rank — `jobs.py`, `us_local.py`, `regional_jobs.py` | metro; region; country | 2021–24; 2025–26; 2024–25; 2024; 2025 |
| Safety | UNODC homicide rates (each country's latest year from 2015, 129 countries), FBI city rates (28 cities), US metro homicide rates from County Health Rankings (308 more metros), Numbeo Safety, Gallup Law and Order Index (countries, and cities without a local homicide rate) — `safety.py`, `world_updates.py`, `us_local.py`, `numbeo.py` | country; city; metro | mostly 2024; 2024; 2017–2023; 2026; 2024 |
| Freedom | EIU Democracy Index; Freedom House total (civil liberties + political rights, 167 countries plus Hong Kong and Singapore, via Our World in Data) — `freedom.py`, `world_updates.py` | country | 2023; 2026 |
| Climate | Hottest and coldest month mean temperatures (1991–2020 normals, counted twice) plus Numbeo Climate Index — `climate.py`, `numbeo.py` | station; city | 1991–2020; 2026 |
| Commute | Numbeo commute time; LIRR train times for Long Island commuter towns — `numbeo.py`, `getting_around.py` | city; town | 2026 |
| Car dependence | Numbeo traffic CO2, averaged with the ITDP Atlas of Sustainable City Transport for 309 cities (people near rapid transport, near healthcare and schools, near a protected bike lane, near a car-free place, and block density, banded at ≥50/30/15/5%, ≥85/75/60/40%, ≥50/25/10/2%, ≥75/60/40/20% and ≥100/85/70/55 blocks per km², then averaged into one score). Walk Score / Transit Score shown on US and Canadian city pages, not scored — `numbeo.py`, `itdp.py`, `getting_around.py` | city; urban area | 2026; 2025 |
| Welcoming | InterNations Expat Insider (countries: the 2026 ranking of 31, else the 2025 ranking of 46; cities 2024); Gallup Migrant Acceptance Index only where no rank exists — `people.py` | country; city | 2026; 2025; 2024; 2016–17 |
| Life satisfaction | World Happiness Report 2026; optional "beyond income, health and freedom" version (below) — `people.py` | country | 2026 |
| Women's rights | Women, Peace and Security Index 2025/26 — `people.py` | country | 2025 |
| LGBTQ+ acceptance | Equaldex Equality Index (fetched Nov 2026) — `people.py` | country | 2026 |
| Things happening | Metro population, as a stand-in (US metros: Census Vintage 2025 estimates) — `jobs.py`, `more_cities.py` | metro | 2021–25 |
| Clean air | PM2.5 annual mean: for 278 US metros, EPA Air Quality System monitors (FRM/FEM, complete years) within 30 km of the city centre, 2024–2025 with wildfire-smoke days included; elsewhere WHO Ambient Air Quality Database V8.0 (Jun 2026), ground monitors, 222 cities, average of the latest three years from 2019 on; countries: World Bank EN.ATM.PM25.MC.M3, population-weighted, modelled by IHME (2023). Cities WHO doesn't list are filled in from their country (city model, leave-one-out error 0.34 of a band). Bands at WHO interim targets: ≤10 = 5, ≤15 = 4, ≤25 = 3, ≤35 = 2 — `air.py` | city; country | 2019–25; 2023 |
| Honest institutions | Transparency International Corruption Perceptions Index 2025, 182 countries; ≥75 = 5, ≥60 = 4, ≥45 = 3, ≥30 = 2 — `honesty.py` | country | 2025 |
| Time off | Annual hours worked per person in work, Penn World Table 11.0 (avh) as published by Our World in Data (updated Aug 2025), 123 countries; ≤1,500 = 5, ≤1,650 = 4, ≤1,800 = 3, ≤2,000 = 2. Mexico: OECD 2,193 h (2024), because PWT 11's 1,629 h contradicts PWT 10.01 (2,137 h), the OECD and ILOSTAT. 35 countries PWT doesn't cover: ILOSTAT hours actually worked a week, ≤30 = 5, ≤33 = 4, ≤36 = 3, ≤40 = 2 (the annual cut-offs ÷ 49.6, the median ratio where both exist; values outside 20–60 h dropped as errors). The rest are filled in (test error 0.89) — `work_hours.py`, `world_updates.py` | country | mostly 2023; 2024; 2015–2025 |
| Low disaster risk | WorldRiskIndex 2026 (column W: exposure to earthquakes, tsunamis, floods, cyclones, droughts and sea-level rise × vulnerability), 193 countries, from HDX; ≤3 = 5, ≤6 = 4, ≤12 = 3, ≤25 = 2 — `disaster_risk.py` | country | 2026 |
| US politics (optional) | 2024 presidential margin by state and by county (Ballotpedia), averaged — `politics.py` | state; county | 2024 |
| Daylight, trip home | Calculated in the page from latitude and distance | — | — |
| Same hours as home, the sea nearby | Each city's UTC offset (timezonefinder / timezone-boundary-builder) and km to the coast or a great lake (Natural Earth 1:10m coastline, 1:110m lakes) — `import_geo.py`, `geo_extra.py`; scored in the page | city | 2026 |
| Work permit, language | Official rules (below) and official languages, applied in the page | country | checked 11 Nov 2026 |
| Helpers for gap-filling (not scored) | GDP per person, PPP (World Bank via Wikipedia); population (UN); world region — `economy.py` | country | latest (mostly 2024) |

`tests/data_age.py` lists every source whose period ended more than 12 months ago; `.github/workflows/data-age.yml` runs it
monthly on GitHub. On 11 Nov 2026 it flagged 23 of 49 source entries (climate normals are exempt; the oldest is the Gallup acceptance index, 2016–17).

Every figure in a place's calculation table shows what it covers (city, metro, county, state, country, weather station)
and its year. Metro figures are used wherever published (GDP, population, rental vacancy).

### Relying less on one source

Numbeo, a crowd survey, feeds six factors. What changed: safety now also averages Gallup's Law and Order Index (a
representative survey in 140+ countries) for countries and for cities outside the US, next to homicide rates; US cities keep
their own FBI rates instead of a national survey. Still Numbeo-only, and the next sources to add: commute (TomTom Traffic
Index, whose full city table couldn't be read this round), money after rent (official wage and rent statistics such as
Eurostat and OECD exist only for richer countries), car dependence (ITDP's Atlas of Sustainable City Transport), and English
proficiency (EF EPI 2025 was reviewed but not yet used: the older places' English scores are hand estimates, and new cities
take their country's value so the two stay consistent).

### Work-permit rules (checked 11 Nov 2026)

The page shows two parts for each place: the legal right to work (citizenship or free movement), and the route for a
junior hire without that right. No published data measures how often employers sponsor junior hires, so the route is a
rule-based judgment, marked as official rules.

- Every passport goes through the same rules (`pipeline/sources/work_rights.py`): free-movement areas, routes for
  particular nationalities, and how open the ordinary work-visa route is. Until v62, US and Mexican passports used
  hand-made tables instead, which counted routes that depend on age (working-holiday visas for Australia, New Zealand
  and Canada) or on the university (the UK's High Potential Individual visa, open to recent graduates of about 50 listed
  universities). The quiz asks neither, so those routes are not counted for anyone. For a US or Mexican passport that
  moves 19 countries by one level: Canada and the UK 4 → 3 (Australia and New Zealand too, for a US passport); eleven
  places that were 3 by judgment alone (Argentina, Chile, Colombia, Costa Rica, Ecuador, Kosovo, Panama, Peru, Portugal,
  Taiwan, Uruguay) → 2, the ordinary employer-sponsored route; the UAE 2 → 3 and Switzerland 1 → 2; and for a Mexican
  passport alone the US, Ireland and Australia 2 → 3.
- EU Blue Card: Netherlands 2026 thresholds €5,942 a month, €4,754 for recent graduates (Staatscourant via eubluecard.nl).
  Other EU countries' 2026 thresholds were not verified this round.
- Spain: two years of legal residence before applying for citizenship for Ibero-American nationals, Mexicans included,
  keeping dual nationality (Civil Code art. 22).
- USMCA TN: Mexican citizens need a TN visa, a prearranged US job in a listed profession and, for most professions, a
  bachelor's degree (US State Department).
- US citizens abroad still file US taxes every year (IRS); the page notes this on every place outside the US.

### Any languages, any passports

- **Languages.** The quiz lets anyone pick the languages they speak (fluent or "some") from 29. English and Spanish keep
  their detailed tables (how well English works in Spanish-speaking cities, Spanish in US cities). Every other language uses
  `pipeline/sources/languages.py`: 5 where it is official or the majority language, 4 where it is official but shares daily
  life with another, 3 where it is a widely spoken second language or lingua franca, otherwise 1; cities that differ from
  their country (Montreal, Brussels, Geneva, Zurich, Hong Kong, Dubai...) have their own entries. A place's language score
  is the best of the person's languages; a language spoken "some" counts one step lower. These are facts about where a
  language is used, not measurements.
- **Passports.** Anyone can add any passports. `pipeline/sources/work_rights.py` applies, in order: citizenship (5);
  free movement (EU/EEA/Switzerland, UK-Ireland Common Travel Area, Trans-Tasman, GCC, Eurasian Economic Union: 5;
  Mercosur residence: 4; East African Community, ECOWAS: 3); routes for particular nationalities (TN, E-3, H-1B1,
  CUSMA, Spain's two-year route for Ibero-Americans: 3); otherwise the normal route for a recent graduate from anywhere
  (3 where there's a dedicated skilled or job-seeker route, such as Canada's Express Entry or Germany's Opportunity Card;
  2 elsewhere). The best level across a person's passports counts. These are rule-based judgments, marked as official rules.
  The original answers (US, Mexican, both, EU) keep their original tables, so earlier links give the same results.
- **Cultural familiarity (optional, off by default).** A rule on facts, not a measurement of fit: 5 in a country of your
  passports or home bases; 4 where a main language of one of those countries is widely used (city level, so Spanish-speaking
  Miami counts for someone from Mexico) and it's in the same World Bank region; 3 for either; otherwise 1. It cannot see
  discrimination or individual fit, so the quiz asks how much it should count, with "not at all" as an answer.
- **Race and discrimination: shown, not scored.** No source measures discrimination against each racial or ethnic group in
  every country. The best global attitude measure, the World Values Survey question on not wanting neighbours of a
  different race (and immigrants), is reported for only 24 countries (King's College London, 2023), so it appears on those
  places for context and is never scored or filled in: filling in racial attitudes from wealth or region would be a
  stereotype, not data. Welcoming to newcomers (Gallup's Migrant Acceptance Index, InterNations) remains the scored proxy.
  Group-specific data exists only in places (EU Fundamental Rights Agency surveys of Black and North African-origin
  residents in about 13 EU countries; FBI hate-crime counts by bias for US cities, heavily under-reported) and is a next step.
- **Freedom for citizens.** The freedom score always counts as measured. Only the dealbreaker (capping limited-freedom
  countries at Avoid) changes: it skips a country whose passport you hold, since you already have its citizenship and
  protections, and it switches off when you say freedom barely matters. War stays a dealbreaker for everyone. The page says
  so on the place, e.g. "Freedoms are limited here (scored as such), but not a dealbreaker for you: you hold this country's
  passport."

## Gap-filling

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
- **Not filled in:** a factor whose error is above 1.0 point on either test. As of this build: housing availability (1.19 on the
  realistic test, with only 22 countries published), job market (1.10) and welcoming (1.39) for countries. The model never fills them; a country only gets
  one if it can be averaged from its own cities' published figures.
- **Cities: a multilevel model.** City value = a + b × its country's value (+ metro size for jobs), plus a country effect
  estimated from the country's other cities and shrunk toward zero by how many there are (partial pooling). Pooling cut the
  leave-one-out error for jobs from 0.47 to 0.37 and for safety from 0.58 to 0.49; elsewhere the country effect is near zero.
  Imputed city values also come as 20 draws, using the country's draws.
- Share filled in: 27% of country values, 14.5% of city values.

## Do factors overlap?

`tests/overlap.py` writes `docs/reports/OVERLAP.md`. Across countries, life satisfaction, healthcare, women's rights, LGBTQ+
acceptance and freedom correlate at 0.71–0.78: they move together with development. The first principal component carries
47% of country variation. Across cities, only two pairs pass 0.7, both incidental (car dependence vs welcoming, −0.77,
driven by US cities that get the national welcoming score).

Changes made because of overlap:
- Housing, cost and purchasing power were merged into **money left after rent**. Housing now measures only availability.
  The sample take's weights moved with it: money after rent 1.25 → 1.75, housing 1.5 → 1.
- Metro GDP counts once in the job market, not twice, because metro size also drives "things happening".
- Life satisfaction already partly reflects income, health and freedom. Healthcare, freedom and log GDP per person explain
  61% of its variation across countries, so the priorities panel offers a "beyond income, health and freedom" version: the
  remainder, rescaled to 1–5.

The priorities panel also shows each factor's **real influence**: its share of the variance of scores across places
(covariance of its points with the total). A heavy slider on a factor where places hardly differ moves little.

## Speed

The slow part of the page is the likely range of each score: 120 recalculations of every place with its filled-in values
redrawn and its published values moved by their measurement error (`simSteps` in `js/06-scoring.js`). It is written as a
generator. `simulate()` runs it all at once (tests); `simulateSoon()` runs about 10 ms of it at a time between taps, and a
change of weights cancels a run in progress. Both give identical output (checked field by field for all 919 places). Until
a run finishes, a place keeps its last range shifted by its change in score (`carryRanges`): a range's width comes from
how well a place is measured, not from the weights, so the order on screen rarely moves when the new ranges land, and the
list is only redrawn if it did.

## Sensitivity

`tests/robustness.py` varies five groups of choices together, 1,792 runs: weights (×0.5 to ×2, 15% chance of dropping a
factor), cut-offs (all values bent by a power between 1/1.2 and 1.2, equivalent to moving every cut-off by about ±10%;
the cut-offs themselves are fixed at build time), rescaling (z-score vs min-max), combining (average vs geometric mean) and
gap-filling (on/off). Variance-weighted over the sample take's top 15 (run 21 Nov 2026), the share of rank variation each
explains (first-order / total):

| Choice | Alone | With interactions |
|---|---|---|
| Gap-filling on/off | 0.44 | 0.51 |
| Weights | 0.31 | 0.45 |
| Rescaling | 0.02 | 0.07 |
| Combining | 0.00 | 0.10 |
| Cut-offs | 0.00 | 0.01 |

Gap-filling leads because of one city. Reykjavík has no published pay, rent or commute figures, so its rank swings by
hundreds of places when filled-in values are switched off (0.88 of its variation); the page already ranks such places
after well-measured ones with the same verdict. For the other fourteen cities weights decide most of the order (0.3 to
1.0 alone), and the geometric mean moves the Dutch cities (Amsterdam, Rotterdam, Utrecht: 0.4 to 0.5 with interactions).
Share of runs in the top 10: Valencia 78%, Madrid 77%, Amsterdam 74%, Barcelona 56%, Rotterdam 47%, Utrecht 45%.

## Does wealth drive the ranking?

`tests/wealth_bias.py` (21 Nov 2026): across cities, national GDP per person explains 72% of the variation in scores when
every factor counts the same (r = 0.85) and 76% for the sample take (r = 0.87). Each
doubling of GDP per person is worth about 6.3 points. Richer places do score better on most
measured factors, but a ranking this tied to wealth also inherits what the sources miss about rich places: the next section.

## Cheap and high-scoring: what might the data be missing?

Good places tend to get priced into rents and wages, so a place that is both cheap (lots of money left after
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

## Career horizon

Early-career moves into large, dense job markets pay off for years: wages and job-switching options in big tech clusters
compound over a career. (Until Nov 2026 the quiz asked how far ahead you were planning; "the long run" raised the job-market weight by 30%,
"my first job" lowered it by 20%; dropped because the effect was invisible.) For hybrid work, a city can borrow the job market of a bigger city within 120 km.

## Quiz design

The quiz follows four bodies of work, each with a standard text:

- **How people answer questions.** An answer takes four steps: understand the question, recall something relevant, form a
  judgement, fit it to the options (Tourangeau, Rips & Rasinski, *The Psychology of Survey Response*, 2000). Each step
  costs effort, and tired respondents pick the first acceptable answer ("satisficing"; Krosnick 1991; Krosnick & Presser
  in the *Handbook of Survey Research*, 2010). Hence: one idea per question, everyday words, a scene to recall instead
  of an abstraction ("walking home alone at eleven at night", not "how important is safety"), few options, and no
  question that doesn't apply to the person (Dillman, Smyth & Christian, *Internet, Phone, Mail, and Mixed-Mode Surveys*,
  2014).
- **How to turn priorities into weights.** "How important is X?" has no answer until you say how much X differs between
  the options: a weight is importance times range (swing weighting; Keeney & Raiffa, *Decisions with Multiple
  Objectives*, 1976; von Winterfeldt & Edwards, *Decision Analysis and Behavioral Research*, 1986). Rating items one by
  one also makes everything "important"; having people choose between items or bundles separates them (best-worst
  scaling and choice experiments; Louviere, Hensher & Swait, *Stated Choice Methods*, 2000; Louviere, Flynn & Marley,
  *Best-Worst Scaling*, 2015). The index itself follows the OECD/JRC *Handbook on Constructing Composite Indicators* (2008).
- **What people get wrong about their own happiness.** Preferences are partly made up on the spot (Lichtenstein &
  Slovic, *The Construction of Preference*, 2006), and people overweight what is easy to picture, like weather, and
  underweight what they will live with every day, like commutes and loneliness (Schkade & Kahneman 1998; Kahneman,
  *Thinking, Fast and Slow*, 2011; Gilbert, *Stumbling on Happiness*, 2006; Stutzer & Frey 2008 on commuting).
- **What actually predicts life satisfaction.** Health (mental above all), relationships and having work come first;
  income matters less than people expect (Clark, Flèche, Layard, Powdthavee & Ward, *The Origins of Happiness*, 2018;
  Layard & De Neve, *Wellbeing: Science and Policy*, 2023). Across countries the World Happiness Report explains most
  of the differences with six things: income, social support, healthy life expectancy, freedom, generosity and
  corruption.

- **How to draw it.** Position and length are read more accurately than color or area (Cleveland & McGill 1984), so
  the ranking uses bars and the map uses a few clearly different color classes, not a continuous ramp (Brewer,
  *Designing Better Maps*, 2015; Munzner, *Visualization Analysis and Design*, 2014; Wilke, *Fundamentals of Data
  Visualization*, 2019). Maps mislead through what they leave out (Monmonier, *How to Lie with Maps*, 2018), and an
  estimate drawn like a measurement is one such omission, so estimated values are marked and ranges are available
  (Padilla, Kay & Hullman, "Uncertainty Visualization", 2021).

What the quiz does with that:

- **It is a tree.** About you first: home, passports, languages, where your pay will come from (a local job, remote
  work, studying, retired) and who is moving (alone, a partner, kids). Those answers decide what comes next: a remote
  worker is never asked about the job market or commutes and is asked about prices and the clock difference instead;
  a retiree is asked about healthcare; a family with kids is asked about safety and healthcare; a partner who needs a
  job keeps the job market in play. The US-politics question is asked only of people with a US passport or home.
- **Coarse, then fine, then pairwise.** One screen asks which areas of life you would miss most if they were bad (up
  to four) and which you could live without. "Most" sets a high weight (2.5) and puts that area's follow-up in the
  short quiz; "could live without" sets a low weight (0.25) and its follow-up is never asked. A follow-up overrides the
  coarse weight. The trade-off round then compares bundles.
- **Every follow-up shows a real difference** (the swing): two real places and what they measure, in everyday units:
  minutes to work, dollars left after rent, hours of daylight on the shortest day, homicides per 100,000, what time it
  is at home when you call. One place is the person's home (or its country), the other a well-known place near the far
  end: the 15th or 85th percentile of the 40 best-known places with a figure, so a freak value is never the example.
  Only published figures, and only pairs measured the same way (the same source, or sources that report the same
  thing). Where no natural unit exists (making friends, women's rights) the two places' 1-5 scores are shown.
- **"I'm not sure" is an answer.** The factor counts as average. On the results screen the page re-scores the top 40
  places with each unsure factor counting little (0.5) and a lot (2.5) and says whether the top match would change, and
  for which factor. The trade-off round asks about unsure factors first.
- Roughly a dozen questions in the short quiz (9 to 15 depending on the path); "Sharpen it" asks the rest of the 33.
  Until the path is settled the counter shows "Question 6", not "6 of 12", so the total never appears to grow.
- One thing per question, and no two questions for one measure: political freedom and honest officials are one question
  (their scores correlate 0.75 or more). Life satisfaction is largely an outcome of the other factors; it counts at half
  weight by default. City life ("always something on") now has its own question, because people who aren't asked about
  jobs still need it; older saved answers keep their reading (jobs answer × 0.6).
- Weather has six answers, including "cold, snowy winters are a plus" (scored coldest first). Marking weather "most" or
  "could live without" scales the weights that answer sets (×1.6 or ×0.3).
- Answers without a natural order are shuffled, with "other / doesn't matter" kept last.
- Every question that was not asked or not answered shows its default on the results screen (with the calculations on),
  where it can be answered. Unanswered, languages default to the browser's and passports to none (those two, and the
  home bases, are picked from lists, so they are changed by retaking the quiz).
- Nothing is scored on screen before there is a take: the quiz finished, a saved take in this browser, or a shared
  link. Until then the page is one card with the question and the quiz button; there is no map to skip to. "Close"
  inside the quiz changes nothing: it goes back to the results there were, or to the first card.
- The last answer of the quiz opens the results directly. (A card used to stand in between, offering more questions
  before showing anything.) The offer to answer the rest sits under the list, with how many answers the results rest
  on. A saved take opens straight on its results.
- A place's details compare it with the home given in the quiz ("Compared with New York City"), because a 3/5 says
  little on its own: for each factor the person weighs, the place's published figure next to the same figure for their
  home, in the sentences the quiz uses for its examples (minutes each way, dollars left after rent on typical pay for
  their kind of work, murders per 100,000, hours worked a year, and so on). Rules (`homeFigures`, `js/11-panels.js`):
  - Only figures measured the same way in both places: the same source, or sources that report the same thing, and a
    city against a city or a country against a country. Never a filled-in value. Two places in the same country get
    no line for a figure that only exists for the country.
  - Each line is marked better, worse or about the same. "About the same" needs both: the two figures within 10% of
    each other, and closer on the 1–5 scale than the factor's assumed measurement error.
  - Many factors are scored from more than the one figure a sentence can hold (healthcare from three sources, access
    to transit from five figures). Where that figure points one way and the page's score for the two places points
    the other, the line is left out: the WHO coverage index is 88 for the United States and 85 for the Netherlands,
    but with its other two sources the page scores healthcare in the Netherlands well above the United States
    (4.95 against 2.85 out of 5), so nothing is said.
  - Real differences come first, the person's most important factors first; the plain view shows five, the rest come
    with the calculations. With New York City as home a typical place gets 8 lines (2 to 14); with a home that has few
    published figures of its own, such as East Hampton, 4, mostly country against country.
- Every place lookup (home bases, passports) uses the same searchable list.
- After the quiz, the answers live in the "What matters to you" panel next to the results: each factor is off, counts
  (weight 1) or ★ counts double (2), so a change shows up in the ranking straight away. Sliders remain for finer weights.
- By default the page shows only the results: scores, chips, map and ranking. "Show how the scores are calculated"
  brings back the likely ranges, legends, the factor table, the sliders and the method notes.
- Filters ("Only show": region, cost band, big cities of about 1.5 million or more, can work freely) never change a score;
  they hide places. They fold away under their name until wanted, and show how many are on. A search box sits next to
  them (it used to need the calculations switched on).
- The results are laid out in the order people read them (v64): the title and the list first, with the best match as
  the first card; then how to make it more precise; then the map. On wide screens the list and the map sit side by
  side, the way maps of places usually do, and the map stays in view while the list scrolls.
- Rows are numbered 1, 2, 3 in list order. Each gives up to two strengths (+) and the main drawback (−) in words. A
  line in the list marks where the verdict changes and where the well-measured places end ("Less certain: over a fifth
  of the score is filled in"); a place held below the verdict its score would give says why on its own row.
- Tapping a row opens that place's details in the list's own column, with a way back and arrows to the place before
  and after. Closing returns to the same spot in the list. Until v64 a tap jumped to the map and the details sat
  below the whole ranking. The phone's Back button closes the details, and inside the quiz goes to the question
  before, instead of leaving the page (one history entry while either is open).
- A place's details break the score into the page's eight groups of factors (v65): money, housing, jobs and
  permits, climate and daylight, getting around, rights safety and healthcare, people and things to do, distance from
  home. A group's line gives its share of this visitor's score (its weights over all the weights that count for the
  place) and how the place does on it: the weighted mean of its factors on the 1-5 scale, which is the same sum the
  score uses, so the groups add back to the score (`tests/test_place.py` checks this). The group that counts most comes
  first. A tap opens the group's factors, each with its published figure, the source (linked), what the figure covers
  (this city, its metro area, the whole country) and its year; a factor the page works out itself says how. Letter
  grades and decimals of a point are left out: the data is not that exact.
- The verdict colours are explained under the map in the plain view too.
- A note before the first question: people tend to overweight weather and short visits and underweight commutes and
  friendships. An optional setting moves 30% of the climate and daylight weight to commute and making friends.
- Each city page lists three questions to ask a resident, picked from its weakest and least certain factors.
- Trade-offs ("Sharpen with 5 trade-offs", after the quiz): five pairs of made-up cities, each strong on two things and
  average on the rest, ask which sounds better (definitely A … definitely B). The factors are the ones you weigh where
  your current top 15 cities differ most (spread × √weight, top 8; a factor you were unsure about counts triple); each
  appears two or three times, never on both sides of one question. Each answer multiplies the winning side's weights by
  1.15 per step (two steps for "definitely") and divides the losing side's; the total per factor is capped at ×2 or ÷2,
  so the quiz still sets the shape. Personal settings and gates (politics, family, the clock, home, passports,
  language) are left out. The answers are saved with the quiz answers; redoing the round replaces them, and "Undo"
  restores the weights from before.
- Fact lines on a place's page: up to two strengths and one weakness, only from published figures, only for factors you
  weigh, when the place is better (or weaker) than at least 80% of the same kind of place in the atlas with a published
  figure (at least 30 of them). Shown as a share rounded down to 5%, not as "the best", so the line stays true.

### Plain words, stay or go, and kinds of work (v59, v60)

- **Plain words.** Every question and answer was rewritten in short, common words, one idea each, with no idioms and no
  contractions, in all eight languages. Importance questions share one scale: not important, important, very important.
  An example in brackets becomes a quieter second line. The scenes from v56 ("walking home alone at eleven") gave way to
  the plain form ("to feel safe walking alone at night"): a scene helps recall, but it costs reading, and the page is
  meant for anyone, including people reading in a second language.
- **Stay or go.** The second question asks whether the person wants to stay in the country they live in now (asked when
  the atlas has cities there). The answer changes no score. It sets which of three tabs above the results is open: that
  country, other countries, or everywhere. Ranks are counted inside the open tab, the map moves to it, and someone who
  wants to stay can open "Other countries" out of curiosity. Countries with fewer than five cities in the atlas say so
  on the tab.
- **The right to work is asked, never assumed.** The passport question offers the passport of the country the person
  lives in as a one-tap suggestion, and a switch: "I am allowed to work in the country where I live now" (a resident,
  a work permit). That country then counts as open to them; every other country is still judged by their passports.
  Someone who names no passport and does not use the switch gets work permits left out of the score, not guessed.
- **Kinds of work.** The job question lists 18 kinds of work in everyday words, from restaurants and stores to trades,
  driving, care work, offices, software and farm work, in a fixed order. No further question is asked: what that work
  pays next to average pay is looked up for each place, from the closest published figure.
  - **US metro areas (122):** the Bureau of Labor Statistics' Occupational Employment and Wage Statistics, May 2025
    (released 15 May 2026): the annual mean wage of the occupation group in that metro area ÷ the metro's mean for all
    occupations. Food service is 54% of average pay in the New York metro, 48% in San Francisco, 62% in Syracuse.
  - **The rest of the US:** the same table's national figures (food service 53%, retail sales 53%, personal care 59%,
    driving and warehouse work 71%, office work 74%, building trades 92%, teaching 97%, computing and engineering 166%).
  - **110 other countries:** ILOSTAT's mean monthly earnings of employees by ISCO-08 major group, latest year from 2020
    on (58 countries: 2025), ÷ the mean for all occupations. ISCO groups are broad: restaurant, store, hair and care
    work are all "service and sales workers" (Mexico 84% of average pay, Germany 63%, United States 59%); teaching,
    medicine, computing, science and the arts are all "professionals". Figures ILOSTAT flags as unreliable are left out.
  - **64 countries without such a table** (Canada, Australia, Japan, China, South Korea and New Zealand among them): an
    estimate, labelled as one on the place's page, from the nine countries with figures closest in income per person
    (same world region preferred). Left-one-out over the 110 countries with figures, it is off by 16 points of average
    pay on average; using the United States' figures everywhere, as v59 did, would be off by 22.
- **Money left after rent, for that work.** Rent does not shrink with the paycheck. With pay at a share r of average,
  the money left is (r × pay − rent) ÷ prices. It is scored against the same cut-offs scaled by r, which is the same as
  scoring (pay − rent ÷ r) ÷ prices against $3,000 / 2,000 / 1,200 / 500. At r = 1 this reproduces the published scores
  exactly (checked for all 165 cities and 88 countries with pay and rent figures). On food-service pay, a one-bedroom in
  the centre of New York costs more than the whole paycheck (about −$1,000 a month), while Syracuse leaves about $1,900.
- **Places without pay and rent figures of their own** (470 of the 744 cities; their pay value is filled in) move with
  their country: by the amount the country's figure changes when it is re-worked for that work. v59 left them untouched,
  which made every such place look better to lower-paid workers. Predicting each of the 274 cities that do have figures
  from its country alone is off by 0.50 of a point (1 to 5 scale) for food service and 0.13 for computing; leaving them
  untouched would be off by 1.33 and 0.44. The weak spot is the United States: 275 smaller metros share one filled-in
  value, and among US metros with figures the same prediction is off by 0.9 of a point for lower-paid work, because rents
  differ so much from metro to metro. Their place page says the value was moved, and by how much.
- **Removed:** the job-offer comparison (take-home pay in up to three cities). It asked for numbers few visitors have at
  hand, and the pay-by-work adjustment now answers the common version of that question inside the ranking.
- **A fix found on the way:** world regions were looked up by country number, but stored under zero-padded codes
  ("076"), so 20 countries (Brazil, Argentina, Belgium, Austria, Australia and others) never counted as "same region"
  for cultural familiarity, and their country rows dropped out of the region filter. For the sample take 18 of 919 places
  move by one point (San Francisco 60 → 59); its top ten are unchanged.

### Two factors worked out from the map

- **Same hours as home** (off unless asked for): each city's standard-time UTC offset (timezonefinder, which packages
  the timezone-boundary-builder shapes; `pipeline/import_geo.py`), compared with the home bases. Up to 1 hour apart = 5,
  3 = 4, 6 = 3, 9 = 2, more = 1; a country takes its first listed city's clock. Daylight saving can add an hour.
- **The sea nearby** (off unless asked for): km from the city centre to the nearest sea coast (Natural Earth 1:10m
  coastline) or the shore of one of the world's largest lakes. 10 km = 5, 40 = 4, 100 = 3, 250 = 2, more = 1. Cities
  only. Mountains were tried and dropped: Natural Earth's range outlines and named peaks put Kyoto and Los Angeles far
  from any mountain; that needs an elevation grid.

### What the research says matters and the atlas still lacks

- **Social support** (someone to count on; the largest of the World Happiness Report's six). The worldwide figure is
  Gallup's and is not published free of charge; the OECD publishes it for its member regions.
- **Schools** (for families), **internet speed** (for remote work), **noise and green space** (people do not adapt to
  noise). Each needs a source file downloaded by hand: the World Bank's harmonized learning outcomes, Ookla's open
  speed-test tiles and the OECD regional well-being file.

## How the 744 cities were chosen, and what's under-covered

The list started from a few dozen hand-picked places, then added the largest tech hubs, capitals and
large Spanish-speaking cities, the Long Island towns, and the major upstate New York cities. In November
2026, 59 more were added from those with Numbeo city figures (large cities in South Asia, the Gulf, Africa, Central Asia,
Eastern Europe, Latin America and Australia).

Later in November 2026 the atlas grew to 744 cities so it covers where most Americans live and much more of the world:

- **Every US metropolitan area** (387 in the 50 states and DC, 4 in Puerto Rico), from the Census Bureau's 2024 estimates. Together
  they hold about 86% of the US population (340 million in 2024). Each metro shows under its main city.
- **World cities with published temperature normals:** every city in Wikipedia's "List of cities by average temperature"
  that wasn't already here, apart from remote weather stations and six capitals of countries too small for the map
  (Praia, Manama, Malé, Andorra la Vella, Valletta, Bridgetown); plus eight large metros near a listed station (Tianjin,
  Wuhan, Nanjing, Suzhou, Dongguan, Foshan, Surat, Nagoya), which use that station and say so.

What the new cities have measured:

- **Climate:** NOAA 1991–2020 normals for US metros (January and July means, from Current Results' state lists), Wikipedia's
  list elsewhere, or the nearest station within 120 km, except across mountains, deserts and coasts, where a nearby station
  has a different climate. Three (Eagle Pass, Johnstown, Wenatchee) have none and are filled in.
- **Things happening:** metro population (Census 2024).
- **Job market:** metro GDP for the 50 largest US metros (BEA 2024; BEA no longer publishes metro GDP for the rest).
- **Politics:** the 2024 presidential margin of the metro's state, for all 50 states and DC.
- **Cost of living** (used in place of pay for remote workers): BEA's 2024 regional price parity (released 19 Feb 2026), converted to
  Numbeo's scale. Inside the range covered by the 27 cities that have both, a log-log fit; below it, the cheapest
  calibrated level, shown as "or less". Metros are matched by Census code, which covers 386 of the 391 US metros (BEA
  has no figure for Puerto Rico's metros or for one micropolitan area).
- **Everything country-level** (healthcare, freedom, rights, happiness, safety where no city rate is published).

- **Commute, housing availability and money after rent** for US metros: Census Bureau figures (ACS 2025: median earnings
  and median rent; ACS 2024: mean travel time to work and rental vacancy rate, because the 2025 detailed tables give commute
  only in time bands and vacancy without its denominator), each converted to the scale the atlas already uses.
  Commute covers 361 metros and vacancy 297. Money after rent covers 86: only metros whose earnings, rent and price level
  all lie inside the range of the 27 calibration cities.

- **Jobs, safety, healthcare and clean air** for US metros (Nov 2026): BLS metro unemployment (390 metros), County Health
  Rankings homicides 2017–2023 and uninsured under-65s 2023 (counties summed to the metro, only where the counties that
  publish cover at least 80% of its people), and EPA PM2.5 monitors within 30 km of the centre (278 metros). Every metro is
  matched to its Census CBSA code through the ACS file, and counties to metros through the Census CBSA population file
  (`pipeline/import_us.py`).

Car dependence is measured for US metros only where Numbeo or ITDP covers them, and money after rent isn't for the smaller
ones, so those are filled in and marked. World cities outside the US have climate, population, the ITDP Atlas where it
covers them, regional unemployment in Europe, and country-level figures.

Each shortcut above was tested on places whose real value is known and was held out (`tests/validate_sources.py`,
written to `docs/reports/VALIDATION.md`):

| Shortcut | Test | Result |
|---|---|---|
| Price parity → cost scale, inside the calibrated range | leave one city out, 27 cities | band off by 0.26 |
| Same, extrapolated to cheaper metros | train on expensive cities, test on cheaper | cheap cities look 5–7 index points too cheap: **not used** |
| Same, held flat below the range | same split | band off by 0.23–0.27, bias under 2 points: **used**, as a ceiling |
| Price parity → money after rent | 27 cities | explains a third of it, worse than gap-filling: **not used** |
| Census travel time → commute minutes | 27 cities | band off by 0.53, against 0.69 for the US average: **used** |
| Census rental vacancy → vacancy survey scale | 28 cities | 0.52 against 0.86: **used** inside the calibrated range |
| Census earnings, rent and BEA prices → money after rent, converted one by one | 27 cities | 0.36 against 0.49: **used** inside the calibrated ranges; outside them it overstates by about $900 a month |
| Census share driving alone → car dependence | 28 cities | no relationship (rank correlation 0.00): **not used** |
| BEA income per person ÷ price parity → money after rent | 27 cities | explains 5% of it, no better than guessing the average: **not used** |
| January/July as coldest/hottest month | 9 cities with full normals | within 0.6 °C; coastal California understated by up to 1.9 °C |
| Nearest station within 120 km | 246 places with their own data | band off by 0.26; a full band or more in 2% |

The rule for accepting a shortcut: it must predict held-out places better than the alternative it replaces. Inside one
country the gap-filling model predicts close to the national city average for every city, so for US metros the
alternative is "guess the US average".

Two side effects worth knowing. Money after rent is a difference of two large, correlated amounts (salary and rent), so
small errors in either dominate it; city-to-city differences in that factor are less reliable than in the others, in
the existing data as well as the new. And the Census driving figures do not agree at all with the Numbeo traffic index
the atlas scores for car dependence, which is a caution about that index; it is kept because nothing else covers the
world.
Places with more than a fifth of their score filled in can't be a Strong fit, and rank after well-measured places with the
same verdict. Country shading covers everywhere, and a dots-only map mode removes the visual weight of big countries.

## Rights and politics factors

Women's rights, LGBTQ+ acceptance and politics describe laws and national or county averages: how a country's laws treat
people, how its residents answer surveys, how neighbors voted. They don't predict how any one person will be treated, and
they miss differences between neighborhoods, workplaces and families. The politics factor is off unless chosen in the quiz.

## Sources refreshed on 20 Nov 2026 (v61)

- **BEA regional price parities, 2023 → 2024** (released 19 Feb 2026; 2008–2023 revised). All 387 metropolitan areas
  from BEA's MARPP table, now matched by Census code instead of by name: 386 atlas metros, 14 more than before. The mean
  absolute change in the all-items figure is 1.6 index points. Cost of living from it now covers 359 metros (was 345),
  and 95 metros (was 82) fall inside the calibrated range for money left after rent.
- **InterNations Expat Insider, ease of settling in, 2025 → 2026** (published 23 July 2026): the full ranking of the 31
  countries surveyed. The 2025 ranking (46 countries) stays for countries the 2026 edition left out. Only 25 of the 46
  had been found for 2025, so this also fills gaps (the Netherlands, France, Italy, the United Kingdom, the United
  States, Japan, Australia among them).
- **StartupBlink Global Startup Ecosystem Index, 2025 → 2026** (1,556 cities): the rank shown on each city's own page,
  for every atlas city that has one: 483 cities, up from 126. Before, an atlas city that had not been looked up counted
  as unranked; 108 of the newly found cities are in the world's top 300 (Delhi 11, Mumbai 19, Jakarta 33, Hangzhou 37,
  Detroit 60, Boulder 69). For the 126 cities ranked in both years the middle change is 4 places.
- **BLS metro wages** for the 15 metros that gained pay and rent figures from the new price parities (122 in all).
- Effect on the sample take: 400 of 919 places move by a point or more, 20 by three or more. Its top five go from
  Amsterdam, Reykjavík, Madrid, Valencia, Barcelona to Reykjavík, Amsterdam, Madrid, Utrecht, Rotterdam. Utrecht and
  Rotterdam rise because the Netherlands is 23rd of 31 for settling in, which is not in the bottom band, so they are no
  longer held back by the friends dealbreaker that Amsterdam, with its own city figure, never met.

## Outside the page: photos, a real map, links (v65)

None of this is scored. It is there so a person can look at a place the numbers point to.

- **What is shown.** For a city: one photo, a map of the city and roughly an hour around it, and links. For a country:
  a map fitted to its outline with the atlas's cities in it as dots, and links.
- **Where it comes from.** Each city and country was matched to its Wikidata item by name and then checked against the
  atlas's own coordinates (`pipeline/import_places.py`; {MATCHED} of {NCITIES} cities matched, all within 50 km, and the
  report of odd matches was read by hand). From that item come the Wikipedia articles in the page's eight languages,
  the city's subreddit where Wikidata records one, and one photo (Wikidata's "image" for the city, never its flag,
  seal or locator map) with its author and licence from Wikimedia Commons. {PHOTOS} cities have a photo; the others had
  none, or only one that was too small, a tall strip, or set aside when the photos were looked through
  (`pipeline/input/photos_skipped.txt`). Collected {ASOF}.
- **Links are exact or absent.** Google Maps opens on the place's own coordinates. Wikipedia opens the place's article,
  in the page's language where one exists. A subreddit or a housing-listings page is shown only when that site itself
  answered for that exact page when the data was collected; both Reddit and Zillow refuse automated checks from where
  the data is built, so on {ASOF} neither has a button. `pipeline/import_places.py` records what it could and could not
  check, and `pipeline/write_places.py` lets through only what was checked. Other countries' housing sites are not
  covered. There are no search links.
- **The real map** is drawn by MapLibre GL JS (version 5.24.1, the last that loads as a plain script) from OpenFreeMap's
  tiles, which need no key. The world map of scores stays as it is: its job is colour by fit, and streets under it would
  compete with that. The real map loads only when its box is about to scroll into view, does not take over the page's
  scroll (the wheel and one finger scroll the page; two fingers and the buttons zoom), and takes itself away if the
  library or the tiles do not arrive. Its credit is a line under the map, where it does not cover a map this small.
- **Photos** load from Wikimedia Commons at a standard thumbnail width, with the author and licence under each as a
  link to the file's page. A photo that fails to load takes its frame away. They sit below the page's own answer: a
  skyline persuades more than it informs.
- **Privacy.** The answers never leave the browser. Opening a place does ask other sites for things (the map library
  from a CDN, tiles from OpenFreeMap, the photo from Wikimedia), so those sites can see which place was opened. The
  page's first screen used to say "Nothing is sent anywhere"; it now says exactly what holds: the answers are not sent
  anywhere. The block says where its pieces come from.
- **Checked with the real network** by `tests/live_check.py`, which opens five places on a phone and a desktop and
  saves what it sees. The other tests stub these sites.

## What couldn't be done, and why

- **Occupation salaries and tax tables:** no consistent source for software-engineer pay by city, or
  national, state and city income tax for every country, was reachable. Money after rent uses Numbeo's average net salary
  (already after tax), scaled by kind of work with each place's own published ratio (see "Kinds of work" under Quiz design).
- **Bachelor's-degree share, venues per person, 5-year rent growth:** Census, Eurostat and Zillow downloads are
  blocked from this build environment, and no search-reachable table covered the cities.
- **Software developers per metro, office counts and junior postings:** BLS OES tables weren't
  reachable; no published, comparable count of junior postings exists. The tech score still uses StartupBlink.
- **Migrant-specific happiness (WHR 2018) and social trust (World Values Survey):** no fetchable per-country
  table was found.
- **Humidity, snowfall, 2030s projections:** no consistent source covering every city.
- **Numbeo contributor counts:** not published on reachable pages, so measurement error is a fixed assumption by
  source type, not scaled by sample size.
- **Transit frequency and jobs reachable by transit:** no global source; ITDP data wasn't reachable.
- **Columbia graduate destinations:** Columbia's Beyond Columbia survey reports industries (internet and software
  16.4%, investment banking 11.9%) but not locations.
- **Map outlines:** world-atlas 50m outlines can't be fetched at runtime (the claude.ai host allows only scripts from CDNs,
  not JSON), so the page loads Datamaps' high-detail outlines (a script, about 130 KB compressed) when you zoom in, and the
  standard ones otherwise; the outline data dates from about 2015. The projection is Web Mercator, as in most map apps.
  Those outlines come from Natural Earth's country polygons, which count big lakes as land (the Great Lakes, Victoria,
  Baikal...), so the page paints Natural Earth's lakes on top as water: 1:110m (24 lakes, in `data/atlas.js`) with the
  standard outlines and 1:50m (288 lakes over 300 km², in `data/lakes-hires.js`) with the detailed ones. Lake shores are
  outlined from 4× zoom; clicking a lake selects no country (`pipeline/import_lakes.py`).
  Sliders re-score without the 120 recalculations while dragging and run them on release.
