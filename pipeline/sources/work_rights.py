"""Who can work where, for the "passports you hold" setting. Rule-based (official rules), not measured: no published data
says how often employers sponsor a junior hire, so the levels below are judgments built on the rules named here.
Checked Nov 2026. Codes are ISO 3166 numeric.

Level 5: the legal right to live and work there (citizenship, or free movement between the two countries).
Level 4: a near-automatic residence-and-work permit for your nationality (you apply, but there's no employer test).
Level 3: a dedicated route for your nationality or a route open to recent graduates (TN, E-3, H-1B1, Ibero-American
         citizenship after 2 years, Opportunity Card...).
Level 2: the normal route: an employer has to sponsor a work visa.
Level 1: not listed here; used only where the page's own US/Mexico tables say so."""

EU = '040 056 100 191 196 203 208 233 246 250 276 300 348 372 380 428 440 442 470 528 616 620 642 703 705 724 752'
# Free movement and residence agreements: every member can work in every other member at the given level.
ZONES = [
    # EU + EEA + Switzerland: free movement of workers (TFEU art. 45; EEA Agreement; EU-Swiss Agreement on Free Movement)
    ('EU/EEA free movement', 5, EU + ' 352 438 578 756'),
    # UK-Ireland Common Travel Area (gov.uk / gov.ie CTA guidance)
    ('Common Travel Area', 5, '826 372'),
    # Trans-Tasman Travel Arrangement (Australian Special Category Visa; NZ resident visa on arrival)
    ('Trans-Tasman', 5, '036 554'),
    # Gulf Cooperation Council common market: citizens may work in any member state
    ('GCC', 5, '048 414 512 634 682 784'),
    # Eurasian Economic Union: workers need no work permit (EAEU Treaty art. 97)
    ('Eurasian Economic Union', 5, '643 112 398 417 051'),
    # Mercosur Residence Agreement: 2-year temporary residence with the right to work, then permanent (Venezuela suspended)
    ('Mercosur residence', 4, '032 076 600 858 068 152 170 218 604'),
    # East African Community common market: Kenya, Rwanda and Uganda waive work-permit fees/requirements for EAC citizens
    ('East African Community', 3, '404 646 800'),
    # ECOWAS free movement protocol (Burkina Faso, Mali and Niger left in January 2025)
    ('ECOWAS', 3, '204 132 384 270 288 324 624 430 566 686 694 768'),
]

# Routes for particular nationalities: (destination, level, "passports", rule)
ROUTES = [
    (840, 3, '124 484', 'USMCA TN visa for Canadian and Mexican professionals (US State Department)'),
    (840, 3, '036', 'E-3 visa for Australian professionals (US State Department)'),
    (840, 3, '152 702', 'H-1B1 visa for Chilean and Singaporean professionals (US State Department)'),
    (124, 3, '840 484', 'CUSMA professionals work permit (IRCC)'),
    (724, 3, '032 068 076 152 170 188 192 214 218 222 320 340 484 558 591 600 604 858 862 608 226 020',
     'Spanish citizenship after 2 years of legal residence for Ibero-American nationals, Filipinos, Equatorial Guineans and Andorrans (Civil Code art. 22)'),
    (620, 3, '076 024 508 132 624 678 626', 'CPLP mobility agreement residence visa for Portuguese-speaking countries (Law 18/2022, AIMA)'),
]

# Without a right or a special route: how open the normal route is to a recent graduate from anywhere.
ROUTE_ANYONE = {
    124: (3, 'Express Entry points system (IRCC)'),
    36: (3, 'Skills in Demand / skilled independent visas (Home Affairs)'),
    554: (3, 'Skilled Migrant Category and Accredited Employer visa (Immigration NZ)'),
    826: (3, 'Skilled Worker visa; Graduate visa for UK graduates (gov.uk)'),
    276: (3, 'Opportunity Card for job seekers (since June 2024) and EU Blue Card (Make it in Germany)'),
    528: (3, 'Highly skilled migrant scheme, lower salary threshold under 30 (IND)'),
    372: (3, 'Critical Skills Employment Permit (enterprise.gov.ie)'),
    702: (3, 'Employment Pass (Ministry of Manpower)'),
    784: (3, 'Employer-sponsored work visa, routine for skilled hires (u.ae)'),
    392: (3, 'Engineer / Specialist in Humanities visa (Immigration Services Agency)'),
    484: (3, 'Temporary resident visa with work permission on a job offer (INM)'),
    840: (2, 'H-1B is a lottery; most other routes need years of experience (USCIS)'),
}


def tables():
    zones = [[name, lvl, [int(c) for c in cs.split()]] for name, lvl, cs in ZONES]
    routes = [[dest, lvl, [int(c) for c in cs.split()], rule] for dest, lvl, cs, rule in ROUTES]
    anyone = {str(k): list(v) for k, v in ROUTE_ANYONE.items()}
    return {'zones': zones, 'routes': routes, 'anyone': anyone}
