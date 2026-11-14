# Methods

How the atlas turns published numbers into a ranking. Every statistic, source and judgment call is in
[APPENDIX.md](APPENDIX.md).

## The score

Each place gets a 1–5 value on up to 23 factors, grouped under three goals:

- **Growth:** job market, money left after rent, work permit, language.
- **Happiness:** life satisfaction, welcoming to newcomers, things happening, climate, daylight, distance from home,
  women's rights, LGBTQ+ acceptance, time off, and (optional) US politics and cultural familiarity.
- **Efficiency and security:** housing availability, commute, car dependence, healthcare, safety, freedom, clean
  air, honest institutions, low disaster risk.

The values come from published sources: WHO, UN, FBI, Gallup, Transparency International, the Penn World Table, the WorldRiskIndex, EIU, Freedom House, the World Happiness Report, InterNations,
Numbeo and others, each with its year and coverage (city, metro, state or country) shown on the place's page. The cut-offs
that turn a figure into 1–5 are all in `pipeline/bands.py`.

The score out of 100 is the weighted average of those values. The weights come from the quiz, from Adriano's own
priorities, or start equal.

## Rules on top of the average

- **Verdicts:** Strong fit 70+, Workable 60+, Caution 48+, then Poor match.
- **Dealbreakers:** active war or very limited freedoms cap a place at Poor match (the freedom cap is skipped for a country
  whose passport you hold, or if you say freedom barely matters). Very long trips home, the highest crime, hot summers and
  the hardest places to make friends cap a place at Caution. Each can be switched off.
- **No top verdict on thin data:** a Strong fit needs published figures for housing, jobs, healthcare, safety, freedom and
  money after rent, with less than a fifth of the score filled in.

## Missing data

About a quarter of country values and a seventh of city values aren't published. The gaps aren't random: they cluster in
poorer, smaller countries. So they're filled by a model that uses wealth, size and region, drawn 20 times so the
uncertainty carries through, and tested by hiding known values. A factor whose fills are off by more than one point isn't
filled at all. Filled-in values are marked on every page and can be switched off.

## Uncertainty

Each score is recalculated 120 times, moving published values by their likely measurement error and swapping in each of
the 20 fills. That gives every place a likely range, a rank range and a chance of being a Strong fit. Scores show rounded
to 5, because a one-point gap is inside the error. Within a verdict, places sort by the low end of their range, so a
well-measured 68 ranks above an uncertain 68.

## What it can't tell you

National and city averages don't predict how one person will be treated, how long finding a flat takes, or whether you'll
make friends. Richer places score better on most measured factors, so the ranking leans toward wealth. Discrimination by
race is shown where the World Values Survey measures it (24 countries) and never scored or guessed. The appendix lists what
couldn't be measured and why.
