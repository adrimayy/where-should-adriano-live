# Where should Adriano live?

An interactive map that scores every country and 137 cities on 19 factors (healthcare, housing, jobs, climate, safety,
freedom and more), using published data from sources like the WHO, the UN, the FBI, Numbeo and the World Happiness Report.
It opens on equal weights, with Adriano's own priorities one tap away; a 5-question quiz (or the full 20) re-weights
everything for anyone else. English and Spanish.

**To use it:** visit the GitHub Pages site, or open `index.html` in any browser (it also works straight from your disk).

## What's in this repository

```
index.html          The page's structure. It loads the three things below, in order.
css/atlas.css       How it looks.
data/atlas.js       Every number the page shows, in one file. Made by build.py; don't edit by hand.
js/                 The page's code, one file per part, run in name order:
                    00 setup, 01 strings (English and Spanish), 02 factors and presets, 03 geography,
                    04 language and passport, 05 places, 06 scoring and the 120 recalculations, 07 quiz,
                    08 you vs Adriano, 09 take/save, 10 map, 11 panels (ranking, details, weights), 12 events, 13 startup.

pipeline/           Where the data comes from (only used to make data/atlas.js):
  sources/          Every published number, one file per topic, each naming its source and year.
  input/            Hand-curated inputs: places, coordinates, notes, hand estimates. See input/README.md.
  bands.py          Every rule that turns a number into a 1-5 score, in one place.
  score_published.py  Step 1: combines the sources into scores for each country and city.
  fill_gaps.py      Step 2: estimates missing values and measures how accurate those estimates are.
build.py            Runs the pipeline and writes data/atlas.js.
bundle.py           Packs everything into one file (dist/) for the claude.ai version. GitHub Pages doesn't need it.

tests/              Automated checks (see below).
docs/               METHODS (how every factor is measured), HISTORY (versions), OVERLAP, SPANISH_REVIEW.
.github/workflows/  A monthly check that lists stale sources (tests/data_age.py).
```

Working files (`build/`, `dist/`) are not part of the repository.

## Making changes

- **Page look or behavior:** edit `index.html`, `css/atlas.css` or a file in `js/`, then refresh. No build step.
- **A statistic:** edit the number in `pipeline/sources/<topic>.py`, then run `python3 build.py` (needs Python 3 with
  `numpy` and `scikit-learn`). This rewrites `data/atlas.js`, re-estimating gaps and uncertainty.
- **Add a city:** add a row to `pipeline/input/cities_added.json` and its numbers to `pipeline/sources/`, then
  `python3 build.py`. Missing numbers are estimated automatically and marked on the page.
- **How strict a score is:** the thresholds in `pipeline/bands.py`, then `python3 build.py`.
- **Adriano's weights:** `mine:` in `PRESETS` in `js/02-factors.js`.
- **Wording (English or Spanish):** `js/01-strings.js`, then `python3 tests/spanish_review.py` to refresh the review sheet.

## Run the tests

```
python3 tests/test_page.py      # clicks through the quiz, map and language switch on desktop and mobile
python3 tests/test_numbers.py   # checks specific numbers (money after rent, bands, rounding, rules)
python3 tests/test_gestures.py  # pinch and pan keep the map under your fingers
python3 tests/profiles.py       # top 10 for Adriano and three very different people
python3 tests/robustness.py     # sensitivity: weights, cut-offs, rescaling, combining and gap-filling varied together (Sobol indices)
python3 tests/overlap.py        # which factors move together; writes docs/OVERLAP.md
python3 tests/wealth_bias.py    # how much of the ranking national wealth explains
python3 tests/data_age.py       # sources older than 12 months
python3 tests/spanish_review.py # writes docs/SPANISH_REVIEW.md
```

The tests need Playwright and Chrome. They don't use the internet: map and library downloads are replaced with stand-ins.
