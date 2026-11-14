"""Where each language works for daily life, for the "languages you speak" setting.

English and Spanish keep their own, more detailed tables in the page (js/04-language-and-passport.js); this file covers the
other languages a visitor can pick. Levels, by country (ISO 3166 numeric) and, where a country is split, by city:
  5  official or majority language: daily life, work and paperwork all possible in it
  4  official and widely used, but sharing daily life with another language
  3  widely spoken second language or lingua franca: you can get by
Anything not listed counts as 1 (you'd need another language).

Sources: official and national languages per the constitutions as summarised in Wikipedia "List of official languages by
country and territory"; second languages and lingua francas per Ethnologue / Wikipedia country language articles
(checked Nov 2026). These are facts about where a language is used, not measurements, so they carry no year."""

# language code -> (name in English, native name)
NAMES = {
    'pt': ('Portuguese', 'Português'), 'fr': ('French', 'Français'), 'de': ('German', 'Deutsch'),
    'it': ('Italian', 'Italiano'), 'nl': ('Dutch', 'Nederlands'), 'zh': ('Mandarin Chinese', '中文'),
    'ja': ('Japanese', '日本語'), 'ko': ('Korean', '한국어'), 'hi': ('Hindi / Urdu', 'हिन्दी / اردو'),
    'ar': ('Arabic', 'العربية'), 'ru': ('Russian', 'Русский'), 'tr': ('Turkish', 'Türkçe'), 'pl': ('Polish', 'Polski'),
    'uk': ('Ukrainian', 'Українська'), 'fa': ('Persian', 'فارسی'), 'ms': ('Malay / Indonesian', 'Bahasa'),
    'vi': ('Vietnamese', 'Tiếng Việt'), 'th': ('Thai', 'ไทย'), 'bn': ('Bengali', 'বাংলা'), 'sw': ('Swahili', 'Kiswahili'),
    'el': ('Greek', 'Ελληνικά'), 'ro': ('Romanian', 'Română'), 'he': ('Hebrew', 'עברית'), 'tl': ('Filipino', 'Filipino'),
    'sv': ('Swedish', 'Svenska'), 'cs': ('Czech / Slovak', 'Čeština / Slovenčina'), 'hu': ('Hungarian', 'Magyar'),
}

# language -> {level: "space-separated ISO numeric codes"}
BY_COUNTRY = {
    'pt': {5: '076 620 024 508 132 624 678', 3: '626'},
    'fr': {5: '250 442 492 332 686 384 120 180 178 266 204 854 466 562 768 324 148 140 262 174', 4: '056 124 450 108 646 690 480',
           3: '756 504 012 788 422 548 478'},
    'de': {5: '276 040 438', 4: '756', 3: '442'},
    'it': {5: '380 674 336', 3: '756'},
    'nl': {5: '528 740', 4: '056'},
    'zh': {5: '156 158 446', 4: '702 344', 3: '458'},
    'ja': {5: '392'},
    'ko': {5: '410 408'},
    'hi': {5: '586', 4: '356', 3: '524 242'},                 # Hindi and Urdu are one spoken language (Hindustani)
    'ar': {5: '682 414 512 887 368 760 400 422 275 818 434 788 012 504 478 729', 4: '784 634 048', 3: '262 174 706 148 376 232'},
    'ru': {5: '643 112', 4: '398 417', 3: '804 498 428 233 860 762 795 051'},
    'tr': {5: '792', 3: '196 031'},
    'pl': {5: '616'},
    'uk': {5: '804'},
    'fa': {5: '364 004', 4: '762'},
    'ms': {5: '360 458 096', 3: '702'},
    'vi': {5: '704'},
    'th': {5: '764'},
    'bn': {5: '050', 3: '356'},
    'sw': {5: '834 404', 3: '800 646 180 108'},
    'el': {5: '300 196'},
    'ro': {5: '642 498'},
    'he': {5: '376'},
    'tl': {5: '608'},
    'sv': {5: '752', 3: '246'},
    'cs': {5: '203 703'},
    'hu': {5: '348'},
}

# cities where the city's own language differs from the country's mix (city name -> {language: level})
BY_CITY = {
    'Montreal': {'fr': 5}, 'Quebec City': {'fr': 5}, 'Toronto': {'fr': 2}, 'Vancouver': {'fr': 2}, 'Calgary': {'fr': 2},
    'Ottawa': {'fr': 4},
    'Brussels': {'fr': 5, 'nl': 3},
    'Geneva': {'fr': 5, 'de': 2}, 'Zurich': {'de': 5, 'fr': 3}, 'Bern': {'de': 5, 'fr': 3},
    'Bengaluru': {'hi': 3},
    'Hong Kong': {'zh': 4},       # Cantonese is the daily language; Mandarin is widely understood
    'Singapore': {'zh': 4, 'ms': 3},
    'Kuala Lumpur': {'zh': 4},
    'Dubai': {'ar': 3, 'hi': 3},  # expat-majority city: English and Hindi/Urdu are heard more than Arabic
    'Tel Aviv': {'ar': 2, 'ru': 3},
    'Helsinki': {'sv': 3},
}


def tables():
    """What the page needs: {'names': {code: [en, native]}, 'country': {code: {iso: level}}, 'city': {...}}."""
    country = {l: {int(c): lv for lv, cs in d.items() for c in cs.split()} for l, d in BY_COUNTRY.items()}
    return {'names': {k: list(v) for k, v in NAMES.items()}, 'country': country, 'city': BY_CITY}
