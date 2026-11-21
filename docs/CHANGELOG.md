# Changelog

How the method changed, and what it did to the top of the list for the sample take (one fixed set of answers, `SAMPLE`
in `js/07-quiz.js`).

## Method

- **First version:** San Francisco, a judgment from 42 answers. A first formula (14 weighted factors) put New York on top.
- **Published data only:** UN homicide rates and Freedom House replaced estimates, and missing data stopped counting as
  average (Madrid). Once New York's strengths, jobs and things happening, were found to be estimates and dropped,
  Utrecht led.
- **Tested gap-filling** with score ranges; a measured job market and housing; real temperatures for climate; optional US
  politics. Dallas and Valencia traded the lead until heat and politics were measured.
- **New weights for the sample take** (roommates fine, climate up): Amsterdam, Valencia close behind.
- **Expert review:** money left after rent replaced two measures that both counted rent; metro GDP counts once; one
  car-dependence measure everywhere; 20-draw multiple imputation; a sensitivity analysis. Amsterdam, Valencia, Madrid.
- **For anyone:** any languages and passports, 59 more cities (196), Gallup's Law and Order Index next to homicide rates,
  optional cultural familiarity, the freedom dealbreaker skipped for your own countries, race data shown but not scored.
  The sample take's top three unchanged.
- **Every US metro and more of the world:** 744 cities. Places that lean on filled-in data rank after well-measured ones
  with the same verdict. The page now opens on the visitor's own map.
- **Measured, and checked, where it was filled:** BEA price levels give cost of living for 345 US metros, all 50 states
  have their 2024 margin, and each new shortcut was tested on held-out places before use. Two were rejected.
- **Census data for US metros:** commute (361 metros), rental vacancy (297) and money after rent (86) are now measured.
  Driving-alone share was rejected as a car-dependence measure. The share of city scores filled in fell from 61% to 49%.

- **Quiz apart from results; calculations hidden by default (v53):** while the quiz is open nothing else is on the
  page. Each answer gets a check on the choice, "Got it" and the progress bar moving before the next question (0.6 s, was
  0.18 s). After the quiz the landing card steps aside and one "Your results" header leads into the panel, filters, map
  and ranking. Ranges, the map legend and options, the "factors separately" table, the
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
- **The sample take, from a run of the quiz (v58):** its weights are now the result of a run of the v56 quiz on
  19 Nov 2026. Up: housing availability 1 → 2.5, safety 1 → 2.5, time off 1 → 2.5, women's safety and rights 1 → 2.5,
  money after rent 1.75 → 2.5, healthcare 2.25 → 3, winter daylight 1 → 2. Down: climate 2.25 → 0.75, reported life
  satisfaction 1 → 0.5, close to home 1.5 → 1. New: the sea nearby 1, same hours as home 1, cultural familiarity
  0.75. Same homes, passports, languages and field. Its top five: Amsterdam, Madrid, Valencia, Barcelona, Edinburgh. Things
  happening then went to 2.5, with a new dealbreaker rule for anyone who weighs it double or more: metro areas under
  500,000 people are capped at Caution (a switch under the dealbreaker rules, saved with a take). For the sample take
  that moves 29 small towns out of the way and New York from 112th to 19th; with default weights nothing changes.
  Region pills also move the map, replacing the separate row of map-view buttons in the plain view.
- **A quiz anyone can fill in (v59):** every question and answer rewritten in short, plain words in all eight
  languages. A new second question asks whether you want to stay in the country you live in; the results then open on
  that country, with tabs for other countries and everywhere (no score changes). The job question lists 18 kinds of work,
  from fast food, stores, trades, driving, cleaning, barbers and care work to offices, software and farm work, and money
  left after rent is re-worked for typical pay in that work (US wage data, May 2025). The job-offer comparison is gone.
  The sample take and old links are unchanged.
- **Nothing assumed (v60):** v59 used US pay ratios for every country and took anyone staying put to be allowed to work
  there. Now what a kind of work pays comes from each place's own figures: BLS metro-area wages for 109 US metros,
  ILOSTAT earnings by occupation for 110 countries, and a labelled estimate from nine similar countries for the 64 without
  a table. The right to work is asked on the passport question (a one-tap suggestion and a switch), not assumed. Places
  with no pay and rent figures of their own now move with their country instead of standing still. Also fixed: 20
  countries with zero-padded codes never counted as "same region".
- **Three sources brought up to date (v61):** BEA price levels 2023 → 2024, Expat Insider ease of settling in 2025 → 2026
  (all 31 countries), StartupBlink city ranks 2025 → 2026 (483 atlas cities ranked, up from 126). For the sample take, the top five
  go from Amsterdam, Reykjavík, Madrid, Valencia, Barcelona to Reykjavík, Amsterdam, Madrid, Utrecht, Rotterdam.
- **Nothing on screen before your answers (v62):** the page used to open on a map scored with every factor equal, and
  carried a second, built-in take to compare with. Now nothing is scored on screen until there is a take: the quiz
  finished, a saved take, or a shared link. The first screen is the question and one button; "Just show the map" is
  gone. The built-in take, the comparison panel, the "My top priorities" box and its switch are removed in all eight
  languages, and six place notes were reworded. One filled-in set of answers stays as the tests' fixed case (`SAMPLE` in
  `js/07-quiz.js`). Work permits: US and Mexican passports had
  hand-made tables that counted routes depending on age (working-holiday visas) or on the university (the UK's High
  Potential Individual visa). Every passport now goes through the same published rules, which moves 19 countries by one
  level for those passports (Canada, the UK, Australia and New Zealand 4 → 3; Ireland, the UAE and Switzerland up for
  some). The quiz's "Skip" is now "Close" and changes nothing. The sample take is now ranked like any visitor's, so
  Reykjavík (no published pay, rent or commute figures) comes after well-measured places with the same verdict, and its
  kind of work (tech) counts in pay: Amsterdam and Madrid lead, then Rotterdam, Valencia and Utrecht level.
- **Compared with where you live now (v63):** a place's details now set its published figures next to the same
  figures for the home given in the quiz, in plain sentences: "The trip to work takes about 43 minutes in New York City
  and 23 in Amsterdam. In a year, that is about 155 hours of difference." Only like-for-like published figures; a gap
  inside the measurement error is called about the same; and a figure that points the other way from the page's own
  score for that factor is left out. No score changes.
- **The answer first (v64):** a walk through every screen on a phone and a desktop turned up 34 problems; this fixes
  30 of them and reorders the results around how people read them. The list now leads, with the best match as its first
  card, and on wide screens the map sits beside it. A tap on a row opens the place's details where the list is, with
  a way back to the same spot and arrows to the next place; before, it jumped to the map and the details sat under
  the whole ranking. The card between the last quiz answer and the results is gone. The list is ordered by the score
  it shows, and says where the verdict changes or the well-measured places end, so a 65 no longer sits under a 60
  unexplained. Rows give reasons in words (+ strengths, − the drawback). Filters fold away; search no longer needs
  the calculations on; the verdict colours are explained under the map. The phone's Back button now steps back inside
  the quiz and out of a place's details instead of leaving the page. Also fixed: Compare showed unrounded scores (66
  beside 65); German sentences lower-cased their nouns; the method note said 23 factors; touch targets under 44 px.
  The sample take's top seven are unchanged but for Málaga moving up to seventh.
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
  who gave no passport were treated as having US and Mexican ones, and unanswered languages defaulted to English.
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
  filled in fell from 48% to 35%. The sample take's top three: Amsterdam, Reykjavík, London; Valencia is fifth, behind Madrid,
  mostly because its region's unemployment (12.1%) now counts.
- **Low disaster risk; newer working hours (v48):** WorldRiskIndex 2026 for 193 countries, with its own quiz question.
  Working hours moved to Penn World Table 11.0 (129 countries, mostly 2023, from the Our World in Data file); the
  model can't fill the rest within a point, so those countries are left without a value. Checked the uploaded WHO file
  (identical to the one used) and Our World in Data's PM2.5 file (matches for all 168 countries).
- **Clean air, honest institutions, time off (v47):** three factors from the WHO air quality database (451 cities) and the
  World Bank, Transparency International's 2025 index, and the Penn World Table. Each has its own quiz question. The sample take's
  top three became Amsterdam, Reykjavík, Valencia (Madrid fourth): Iceland is clean, honest and works short hours.

## Page

- Map: canvas land layer, Web Mercator, one automatic look (light, dark, color-blind safe, print), labels that never
  overlap, zoom limited by how close the nearest cities are.
- Interface in 8 languages; a 6-question quiz with "Sharpen it" for the rest; a searchable place picker.
- Code split into `index.html`, `css/`, `js/` and one data file made by `build.py`.
- **What the score is made of, and a look at the place (v65):** a place's details listed all 26 factors in one run;
  they now sit under eight groups, the group that counts most for the visitor first, each with how much of the score
  rests on it. A group opens to its factors and, new on the plain page, the published figure behind each with its
  source and year. Below that, a block that looks outside the page: a photo of the city (Wikimedia Commons, credited),
  a real map of the place and its surroundings (OpenStreetMap data through OpenFreeMap) and links that go to that
  place's own page elsewhere (Google Maps on its coordinates, its Wikipedia article in the page's language). Nothing in
  the block is scored and none of it loads until a place is opened. No score changes.
- **One place for every control (v66):** filters were spread over five spots and the map sat below the list. Now one
  panel holds what to show, where, the "only show" filters and what matters (left column on a wide screen; a sheet
  behind a Filters button on a phone, which counts the filters that are on). On a phone a bar stays in reach with the
  find box, Filters, list or map, and cities or countries; the list and the map are two views behind that switch. The
  find box is on the map (above it on a phone), suggests places as you type and goes to the one picked; it no longer
  empties the list while typing. A place's details open over the page on a phone and close back to the same spot.
  The real map in a place's details now moves with two fingers like the page's own map, has a way back to the place
  and a full-screen view; the photo opens the Wikipedia article and credits author, licence and source. Fixed along
  the way: Enter in the find box opened a place and closed it again; a shortest day of 9 hours 59.6 minutes showed as
  "9:60". No score changes.

## What held up

Across every version and the sensitivity tests, the steadiest at the top are Valencia (top 10 in 78% of runs on
21 Nov 2026), Madrid (77%) and Amsterdam (74%). Cities that led only once were usually riding a gap in the data.
