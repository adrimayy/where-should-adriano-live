# Where should Adriano live?

A single-page livability atlas: every country and 132 cities scored 1–5 on eighteen factors, a short quiz to
re-weight them for anyone, and a comparison with Adriano's own picks. English and Spanish.

`index.html` is self-contained (data inlined; D3, topojson and the world map load from public CDNs), so it can be
hosted anywhere static: Netlify drop, GitHub Pages, etc.

## Layout

```
build.py               one command: data -> index.html + dist/livability-atlas.html
src/page.html          page template (placeholders __A3__, __DATA__, __NCITIES__, __BUILD_DATE__)
data/base.json         curated base: notes (EN/ES), field-of-work digits, estimates
data/cities_added.json cities added later: [name, lat, lon, iso, lang, jobs, cult, fields, note_en, note_es, name_es]
data/a3.json           ISO alpha-3 -> numeric map for the world outlines
pipeline/realdata.py   applies published data (tables inline, with source comments) -> build/published.json
pipeline/impute.py     fills gaps + measures accuracy by cross-validation -> build/final.json
tests/test_page.py     headless Chrome smoke test (quiz, compare, language toggle; desktop EN + mobile ES)
tests/profiles.py      prints the top 10 for Adriano and three very different test profiles
pipeline/archive/      one-off scripts from earlier versions, kept for history
```

## Build and test

```
python3 build.py
python3 tests/test_page.py "$PWD/index.html" /tmp/shots
python3 tests/profiles.py "$PWD/index.html" tests/test_page.py
```

Needs Python 3 with numpy and scikit-learn; the tests need Playwright and Chrome (CDNs are stubbed, no network).

## Data

Digits per place (1–5, 0 = none), 17 per place: clim, jobs, hlth, free, safe, move, lang, cult, pay, open, perm, happy, women, lgbt,
cost, commute, home. Each record's `src` lists which digits come from published data; the rest are estimates (off by
default) or filled in by `impute.py` with a measured error.

| Factor | Sources |
|---|---|
| Healthcare | WHO UHC Service Coverage Index 2023 + Numbeo Health Care 2026; plus the uninsured share for the US (Census 2025) and Mexico (CONEVAL 2022) |
| Safety | UNODC homicide rates, FBI 2024 city rates (US) + Numbeo Safety |
| Freedom | EIU Democracy Index 2023 + Freedom House 2026 |
| Pay, cost | Numbeo Cost of Living 2026 (cities and countries) |
| Climate, commute | Numbeo Quality of Life (Climate, Traffic Commute Time) |
| Car dependence | Numbeo traffic CO2 per commuter; averaged with Walk Score + Transit Score for US/Canadian cities |
| Newcomers | InterNations Expat Insider ranks (2025 countries, 2024 cities); Gallup Migrant Acceptance Index only where no rank exists |
| Life satisfaction | World Happiness Report 2026 |
| Women | Georgetown WPS Index 2025/26 |
| LGBTQ+ | Equaldex Equality Index (full ranked list, 167 countries on the map) |
| Housing, living alone | Rent burden (Numbeo rent index ÷ local salary level) + availability: Census rental vacancy by metro, NYC Housing and Vacancy Survey, InterNations housing ranks (city, else country) |
| Job market | Metro GDP (counted twice), ILO youth unemployment, ILO informal-employment share; countries use overall + youth unemployment + informality |
| Things happening | Metro population (proxy), cities only |
| Tech job market (field = tech) | General job market averaged with the StartupBlink Global Startup Ecosystem Index 2025 city rank (1,000 cities); countries use their best-ranked city |

New datasets live in `pipeline/sources2.py`. Every published number is also stored per place in `raw` and shown in the page's "How this score was calculated" table.

Verdict rule: Strong fit needs published figures for housing, jobs, healthcare, safety, freedom and purchasing power, and under 20% filled-in weight. Within a verdict, places sort by the low end of their likely range.

Special cases handled in `realdata.py`: Hong Kong uses its own EIU score (5.24) rather than China's; Singapore
(not a separate map feature) gets its national EIU, UHC, WHR, WPS and Equaldex values.

## Adding a city

1. Append a row to `data/cities_added.json`.
2. Add its Numbeo cost-of-living / quality-of-life / CO2 figures (and FBI rate for US cities) to the tables in
   `pipeline/realdata.py`. Cities without Numbeo data are marked as using national data and get filled-in values
   with ranges.
3. If it's a high-altitude city in the tropics, add `city:<name>` to `HIGHLAND` in `src/page.html`.
4. `python3 build.py` and run the tests.
