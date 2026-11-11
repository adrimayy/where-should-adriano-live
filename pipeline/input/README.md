# Pipeline inputs

Hand-curated inputs to `build.py`. The page never reads these; it reads `data/atlas.js`, which `build.py` makes from these and `pipeline/sources/`.

| File | What it holds |
|---|---|
| `base.json` | The original curated data: every country and the first 108 cities, with notes in English and Spanish, coordinates, and hand estimates for fields of work. Published numbers are applied on top of it by `pipeline/score_published.py`. |
| `cities_added.json` | Cities added later, one row each (format below). |
| `a3.json` | Maps three-letter country codes to number codes, so the world map outlines line up with the data. |

## Adding a city

Add a row to `cities_added.json`:

```
["Name", latitude, longitude, "country number code", language score, job estimate, things-happening estimate,
 "field estimates", "note in English", "note in Spanish", "name in Spanish"]
```

- Country number codes are ISO 3166 numeric: `"840"` is the US, `"724"` is Spain, `"484"` is Mexico.
- Language score is 1–5 for how well English works there (5 = English-speaking).
- The two estimates and the four field digits (finance, healthcare, creative, research) are hand estimates; they're
  only used if someone turns estimates on.

Then add whatever published numbers exist for it in `pipeline/sources/` (Numbeo, crime rate, metro GDP, rental vacancy,
temperatures, Walk Score, StartupBlink rank) and run `python3 build.py`. Anything missing is estimated by
`pipeline/fill_gaps.py` and shown on the page as "filled in" with its error.

## How scores are stored in the built data

Each place has a 17-character string of digits, one per factor, 1–5 (0 = no data), in this order:
climate, jobs, healthcare, freedom, safety, car dependence, language, things happening, money left after rent, welcoming,
work permit, life satisfaction, women's rights, LGBTQ+, cost, commute, housing availability.
A separate list says which of those come from published data. The built data also keeps each value's exact position within
its band (`cont`), the 20 imputed versions of every filled-in value, item prices for the offer tool (`money`), and
state and county votes (`pol`, `polc`). Daylight, trip home and US politics are calculated in the page itself.
