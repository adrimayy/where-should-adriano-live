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

- **Quiz apart from results; calculations hidden by default (v53):** while the quiz is open nothing else is on the
  page. Each answer gets a check on the choice, "Got it" and the progress bar moving before the next question (0.6 s, was
  0.18 s). After the quiz the landing card steps aside and one "Your results" header leads into the panel, filters, map
  and ranking. Ranges, the map legend and options, the "factors separately" table, the comparison with Adriano, the
  defaults list, the sliders and the method boxes sit behind "Show how the scores are calculated" (remembered per browser).
- **Plain place details; start-over (v54):** a place's details now show only the verdict, notes and factor bars until
  calculations are on: the score range, probabilities, "see the calculation" link, the source tags on each bar and the ±
  on estimated bars moved behind the switch. For testing as a first-time visitor, the last line of the method notes (with
  calculations on) clears everything the site saved in this browser after a second tap; opening the page with `#reset`
  does the same.
- **Trade-offs and fact lines (v55):** after the quiz, "Sharpen with 5 trade-offs" asks which of two made-up cities sounds
  better, each strong on two things you care about, and nudges the weights (at most ×2 or ÷2 per factor), then shows what
  counts more, what counts less and whether the top match changed, with Undo. A place's page opens with up to three plain
  lines from published figures, such as "Low car dependence: better than 85% of the cities in the atlas".
- **The quiz is a tree (v56):** every question reworded as a scene from daily life, with a line under it showing what two
  real places measure (minutes to work, dollars left after rent, hours of December daylight). New roots: where your pay
  will come from and who is moving; they decide what is asked next (remote workers get prices and the clock, not
  commutes). One screen asks what you would miss most and what you could live without, and only the follow-ups to the
  "most" areas are asked. "I'm not sure" counts as average, and the results say whether those answers could change the
  top match. Two new factors worked out from the map, off unless asked for: same hours as home (time zones) and the sea
  nearby (distance to the coast). 33 questions in all, about a dozen in the short quiz. Method and reading list in
  docs/APPENDIX.md, "Quiz design".
- **Instant taps, a loading wheel, tidier phones (v57):** the likely ranges (120 recalculations of every place) used to run
  inside every tap and seven times at startup. They now run in the background a few milliseconds at a time, with the
  same results to the digit; until they arrive each place keeps its last range, moved by its score change. On a
  phone-speed processor: page ready in 2.0 s (was 12.6), a priority tap answers in 0.02 s (was 3.1), quiz to results in
  0.3 s (was 3.1). Buttons show pressed the moment a finger lands; a quiz answer moves on after 0.24 s (was 0.6). A
  loading wheel covers the page until it is drawn, and the map until its outlines arrive. On phones: the four results
  actions sit in a 2 x 2 grid, ranking rows are one line of name, one swipeable line of reasons and the drawback, and the
  priorities button stays off the first screen.
- **Adriano's priorities, from his own quiz (v58):** his saved weights are now the result of his run of the v56 quiz on
  19 Nov 2026. Up: housing availability 1 → 2.5, safety 1 → 2.5, time off 1 → 2.5, women's safety and rights 1 → 2.5,
  money after rent 1.75 → 2.5, healthcare 2.25 → 3, winter daylight 1 → 2. Down: climate 2.25 → 0.75, reported life
  satisfaction 1 → 0.5, close to home 1.5 → 1. New for him: the sea nearby 1, same hours as home 1, cultural familiarity
  0.75. Same homes, passports, languages and field. His top five: Amsterdam, Madrid, Valencia, Barcelona, Edinburgh. The
  "My top priorities" box is now read off his weights (2.5 and up), not a hand-written list. Things happening then went
  to 2.5 at his request, with a new dealbreaker rule for anyone who weighs it double or more: metro areas under 500,000
  people are capped at Caution (a switch under the dealbreaker rules, saved with a take). For him that moves 29 small
  towns out of the way and New York from 112th to 19th; with default weights nothing changes.
  Region pills also move the map, replacing the separate row of map-view buttons in the plain view.
- **A quiz anyone can fill in (v59):** every question and answer rewritten in short, plain words in all eight
  languages. A new second question asks whether you want to stay in the country you live in; the results then open on
  that country, with tabs for other countries and everywhere (no score changes). The job question lists 18 kinds of work,
  from fast food, stores, trades, driving, cleaning, barbers and care work to offices, software and farm work, and money
  left after rent is re-worked for typical pay in that work (US wage data, May 2025). The job-offer comparison is gone.
  Adriano's take and old links are unchanged.
- **Layout after the NYT "Where should you live" quiz (v52):** what matters to you sits beside the map and ranking (a
  sticky panel on wide screens, a bottom sheet behind a "Priorities" button on phones), one tap per factor: off, counts
  (weight 1), ★ counts double (2), read from and written to the same weights as the sliders, which stay under "Fine-tune".
  "Only show" pills (region, cost $–$$$$, big cities, can work freely) narrow the map and ranking without changing scores.
  The best match is a card; every result shows chips for your top priorities on the 1–5 scale; places with the same
  displayed score share a rank ("=2"); a heart on each result adds it to Compare.
- **Quiz rework; one place lookup (v51):** about-you questions first, home as a regular step, how-to-judge questions last.
  Merged questions that measured the same thing (job market + big city; freedom + honest officials), dropped planning
  horizon and life satisfaction (now half weight by default): 29 questions became 25. Examples under questions are built
  from the visitor's own home instead of New York and Mexico; US politics is asked only of people tied to the US; a
  "cold winters" weather answer. Passports, home bases and job offers all use the searchable place list. Fixed: visitors
  who gave no passport were treated as having Adriano's US and Mexican ones, and unanswered languages defaulted to English.
- **Lakes on the map (v50):** the country outlines count big lakes as land, so the Great Lakes were missing and Michigan,
  Wisconsin and Ontario ran together, as did Lake Victoria, Baikal, Titicaca and others. Natural Earth's lakes are now
  painted on top as water, at the scale matching each outline level, and clicking a lake no longer selects a country.
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
