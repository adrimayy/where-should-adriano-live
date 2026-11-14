"""Every conversion from a published number to the atlas's 1-5 scale, in one place so thresholds are easy to review.
5 is best for the person scoring; each function says what it takes.

Each function returns a whole-number band (shown on the page) that also carries a continuous value in `.c`:
the cut-offs are the midpoints between bands (a value right on the 4/5 cut-off is 4.5) and the value moves in a
straight line between cut-offs, so 1 unit above a cut-off is never treated as a full band better than 1 unit below it.
WARP (set by tests/sensitivity runs) moves every cut-off by the same fraction to test how much the cut-offs matter."""
WARP = 0.0


class B(int):
    """A 1-5 band that remembers its continuous value."""
    def __new__(cls, band, c=None):
        o = int.__new__(cls, band); o.c = float(band if c is None else c); return o


def lad(x, steps, floor=1, ge=True):
    """steps: [(cut-off, band), ...] checked in order; ge=True means higher is better (x >= cut-off earns the band)."""
    steps = [(t * (1 + WARP) if t else t, b) for t, b in steps]
    band = floor
    for t, b in steps:
        if (x >= t) if ge else (x <= t): band = b; break
    nxt = [b for _, b in steps[1:]] + [floor]
    knots = sorted(((t, (b + n) / 2) for (t, b), n in zip(steps, nxt)), key=lambda k: k[0])
    xs = [k[0] for k in knots]; ys = [k[1] for k in knots]
    if x <= xs[0]: i = 0
    elif x >= xs[-1]: i = len(xs) - 2
    else: i = max(j for j in range(len(xs) - 1) if xs[j] <= x)
    x0, x1, y0, y1 = xs[i], xs[i + 1], ys[i], ys[i + 1]
    c = y0 + (y1 - y0) * (x - x0) / (x1 - x0) if x1 != x0 else y0
    c = max(band - 0.5, min(band + 0.5, c))           # never leave the band the cut-offs put it in
    return B(band, round(max(1.0, min(5.0, c)), 3))


def hi(x, a, b, c, d): return lad(x, [(a, 5), (b, 4), (c, 3), (d, 2)])
def lo(x, a, b, c, d): return lad(x, [(a, 5), (b, 4), (c, 3), (d, 2)], ge=False)

def b_uhc(x): return hi(x, 88, 83, 75, 60)
def b_eiu(x): return hi(x, 8, 7, 5, 4)
def b_fh(x): return hi(x, 90, 70, 35, 15)
def b_hom(r): return lad(r, [(1.5 - 1e-9, 5), (4 - 1e-9, 4), (8 - 1e-9, 3), (20 - 1e-9, 2)], ge=False)
def b_nsafe(x): return hi(x, 75, 65, 55, 45)
def b_lpp(x): return hi(x, 140, 115, 90, 60)
def b_cost(x): return lo(x, 35, 45, 55, 70)
def b_health(x): return hi(x, 75, 70, 65, 60)
def b_clim(x): return hi(x, 95, 88, 80, 65)
def b_comm(x): return lo(x, 25, 32, 38, 45)
def b_mai(x): return lad(x, [(7.75, 5), (7, 4), (3, 2)])
def b_eq(x): return hi(x, 75, 60, 45, 25)
def b_co2(x): return lo(x, 2000, 3500, 5500, 8000)
def b_gdp(x): return hi(x, 700, 300, 120, 40)
def b_pop(x): return hi(x, 10e6, 4e6, 1.5e6, 0.5e6)
def b_inf(x): return lo(x, 5, 20, 40, 60)
def b_youth(x): return lo(x, 7, 10, 14, 20)
def b_unemp(x): return lo(x, 3.5, 5, 7, 10)
def b_av(kind, x, n):
    if kind == 'rank': return lo(x / n, 0.2, 0.4, 0.6, 0.8)
    if kind == 'hard': return lo(x / n, 0.7, 0.9, 1.1, 1.4)
    if kind == 'easy': return hi(x / n, 1.4, 1.1, 0.9, 0.7)
    if kind == 'vac': return hi(x, 8, 6, 4, 2)
def av_text(kind, x, n):
    return {'rank': f'#{x}/{n}', 'hard': f'{x}% vs {n}%', 'easy': f'{x}% vs {n}%', 'vac': f'{x}%'}[kind]
def b_rank(r, n): return lo(r / n, 0.2, 0.4, 0.6, 0.8)
def b_pm25(x): return lo(x, 10, 15, 25, 35)        # µg/m³; the cut-offs are WHO's interim targets 4, 3, 2 and 1
def b_cpi(x): return hi(x, 75, 60, 45, 30)         # Corruption Perceptions Index, 0-100 (world average 42)
def b_hours(x): return lo(x, 1500, 1650, 1800, 2000)   # hours worked a year per person in work (1,650 = about 34 a week)
def b_wri(x): return lo(x, 3, 6, 12, 25)          # WorldRiskIndex W: about the lowest third of countries = 5, top tenth = 1
def b_cover(x): return lo(x, 1, 3, 6, 12)
def b_walk(w, tr): return hi((w + tr) / 2, 80, 65, 50, 35)
def b_sblink(r): return lo(r, 10, 30, 75, 200)
def b_heat(t): return lad(t, [(23, 5), (25, 4), (27, 3), (28.5, 2)], ge=False)
def b_cold(t): return hi(t, 4, 0, -3, -6)
def b_temp(hot, cold):
    h, c = b_heat(hot), b_cold(cold)      # the worse season counts most: half its band, half the average of both
    v = min(h, c) * 0.5 + (h + c) / 4; vc = min(h.c, c.c) * 0.5 + (h.c + c.c) / 4
    return v, vc

# ---------- money left after rent, for one person (replaces purchasing power, cost and the rent half of housing) ----------
# Monthly net salary minus one-bedroom city-centre rent, divided by local prices (Numbeo cost of living without rent, New York = 100),
# so every city is in New York dollars. New York itself: $5,736 - $4,050 = $1,686.
NYC_PAY, NYC_RENT = 5736, 4050    # Numbeo item prices, Apr 2026 snapshot (sources/numbeo.py ITEMS)
def money_left(pay, rent, col): return (pay - rent) / (col / 100)
def money_from_index(lpp, col, rent_idx):
    """Where Numbeo item prices aren't in the snapshot: salary and rent rebuilt from the indices, anchored to New York's item prices.
    Salary relative to New York = LPP x cost of living / 100^2; rent relative to New York = rent index / 100."""
    return money_left(NYC_PAY * lpp * col / 1e4, NYC_RENT * rent_idx / 100, col)
def b_money(x): return hi(x, 3000, 2000, 1200, 500)

# ---------- legacy: rent burden (kept for the overlap test and the old method) ----------
def burden(rent, col, lpp): return rent / (lpp * col / 100)
def b_burden(r): return lo(r, 0.35, 0.5, 0.7, 0.9)
def b_gallup(x): return hi(x, 92, 87, 82, 75)     # Gallup Law and Order Index (world average 83)
