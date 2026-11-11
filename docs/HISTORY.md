# How the #1 city changed

Each change to the method moved the top of the list. This is the record of what changed and why.

| Version | #1 for Adriano | What changed |
|---|---|---|
| First answer | San Francisco | Judgment from Adriano's 42 answers; no formula yet |
| Rethink | New York | Weighted places he had lived over places he had only visited |
| v2 | New York | First formula: 14 factors weighted in his ranked order; daylight and family distance calculated |
| v3 | Madrid | UN homicide rates and Freedom House replaced estimates; missing data left out instead of counted as average; scale balancing |
| v4–v5 | New York | Trips home over 18 hours capped at Caution, which removed Sydney and Melbourne |
| v6 | Utrecht | Only published data counted; jobs and things happening (New York's strengths) were estimates, so they stopped counting |
| v7 | Utrecht | Gaps filled by a tested model, with score ranges |
| v13–v14 | Dallas (tied with Valencia) | Housing for one person and a measured job market added; women's and LGBTQ+ weights lowered; healthcare counts the uninsured; Walk Score added; Strong fit requires published data on crucial factors |
| v16 | Valencia | Real temperatures replaced the climate index as the main climate measure; optional US state politics; housing needs rent data to count as published; LIRR commutes |
| v17 | Amsterdam, with Valencia close behind | Adriano's weights: housing lowered (roommates are fine), women's and LGBTQ+ set to neutral, climate raised; hot summers capped at Caution |
| v18 | Amsterdam (Valencia, Madrid next) | The expert review: money left after rent replaced purchasing power and the rent half of housing (both counted rent); metro GDP counts once; one car-dependence measure everywhere (Walk Score no longer scored, which dropped San Francisco from 68 to 63); exact values within bands; 20-draw multiple imputation with wealth, size and region as helpers; factors with error above 1.0 left blank; published figures get measurement error; county votes alongside state votes; the page opens on equal weights |
| v19 | Amsterdam (Valencia, Madrid next) | Interface review: scores round to 5 without crossing a verdict line (Valencia shows 65, not 70, next to Workable); one signal per ranking row; verdict symbols; three goal sliders with factors one level down; settings grouped; undo; live top 5 beside the sliders; list above the map on phones; tests that check numbers; page script split into files. No data or features removed |
| v20 | Amsterdam (Valencia, Madrid next) | Map and icons: Winkel tripel projection framed as an oval, high-detail outlines, coastlines darker than borders, region views (Atlantic by default), grouped dots shown as numbered bubbles, top 10 cities always named; all icons drawn as SVG instead of font characters. No data or method changes |
| v21 | Amsterdam (Valencia, Madrid next) | Speed and iOS look: during a pan or pinch the map moves as one GPU layer and redraws once at the end; no blur filter; detailed outlines load only when zoomed in; iOS system font, colors, grouped cards, segmented controls, switches, Apple Maps–style controls. No data or method changes |
| v22–23 | Amsterdam (Valencia, Madrid next) | Zoom fixed (gestures tracked on the map's frame, not the moving map); US state borders and abbreviations; country names; one rule for city names: in ranking order where there's room, top 10 always named with their rank, four placement spots, real text widths. No data or method changes |
| v24 | Amsterdam (Valencia, Madrid next) | Map cleanup: two layers (land moves as one picture; dots and names stay sharp and the same size on top), sizes in screen pixels (phone names were 5 px), names kept inside the frame and off the buttons, fewer names when zoomed out, wider bubbles, softer country fill, 30° grid, state lines only when zoomed in, gentler dark-mode ocean. No data changes |
| v25 | Amsterdam (Valencia, Madrid next) | Faster map: land is drawn on a canvas from shapes projected once and cached (Path2D), only shapes in view are drawn, a zoom or pan repaints the cached shapes instead of rebuilding thousands of SVG nodes, and the map's width is read once per resize instead of every frame (the approach Felt described moving from SVG to canvas). Country names no longer overlap (each name now checks every other name; before, names of the same kind never checked each other), and they are fewer (at most 12, 6 on phones), fainter and appear only once zoomed in. Canvas repaints when light/dark changes. No data or scoring changes. |
| v26 (current) | Amsterdam (Valencia, Madrid next) | Cleaner layout: the page is `index.html` + `css/atlas.css` + `js/` + one data file, `data/atlas.js`, which `build.py` makes from `pipeline/`. The page no longer has to be rebuilt after a code change, and nothing is stored twice. `bundle.py` packs a one-file copy for claude.ai. No data or scoring changes (data checked identical). |

## What held up

Across every version and the robustness test (`tests/robustness.py`, which shuffles the weights 400 times), the cities
that kept landing near the top are **Amsterdam, Valencia, San Francisco and Madrid**. In v18's sensitivity analysis
(which also varies cut-offs, rescaling, the way factors are combined and gap-filling) the steadiest are Amsterdam (top 10 in
91% of runs), Madrid (84%) and Valencia (82%); San Francisco fell to 27% once car dependence stopped using Walk Score. Cities that led only once were
usually riding a gap in the data: Utrecht before housing and friend-making were measured, Dallas before heat and
politics were.
