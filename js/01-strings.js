'use strict';
/* ---------------- strings ---------------- */
const STR = {
  en: {
    knowDev: 'I know Adriano, who made this',
    knowDevOff: 'Hide Adriano’s picks',
    devNote:
      'Adriano is a computer science student at Columbia who built this to decide where to live after graduating. His picks sit next to yours on the map, and your quiz results compare the two.',
    modeYou1: 'Showing your priorities.',
    resTitle: 'Your best matches',
    yourTopC: 'Your top 5 countries',
    brand: 'Where should you live?',
    eyebrow: 'Livability atlas · November 2026',
    h1: 'Where should you live?',
    intro1:
      'Every country and ' +
      DATA.cities.length +
      ' cities, scored on the same 23 things from published data. Answer six questions and the map ranks them for you.',
    prioTitle: 'My top priorities',
    prio: [
      'Efficiency and walkability',
      'Healthcare that doesn’t depend on my job',
      'Being happy day to day',
      'Things going on',
      'Affordability',
    ],
    startQuiz: 'Take the 1-minute quiz',
    skipQuiz: 'Just show the map',
    resume: 'Continue with my map',
    startNote: 'Nothing is sent anywhere. Your answers stay in this browser unless you share a link.',
    howRead: 'How to read the map',
    qOf: 'Question {n} of {t}',
    heroNow: 'His top three right now: {x}.',
    sharpen: 'Sharpen it: answer the rest',
    doneLab: 'Done',
    doneTitle: 'Your map is ready',
    doneSub:
      'Built from your {n} answers; it’s right below. {m} more quick questions make it more accurate, and you can stop at any point.',
    doneMore: 'Make it more accurate ({m} more)',
    doneMap: 'See my map',
    hpSearch: 'Search cities and countries',
    cancel: 'Cancel',
    noMatch: 'No matches',
    gatedNote:
      'Its score alone ({s}) would be {t}; the dealbreaker for {x} caps it. Dealbreakers can be switched off under Fine-tune the weights.',
    raceInfo:
      '{r}% here would not want neighbours of a different race, and {i}% would not want immigrants (World Values Survey 2017–22; asked in only 24 countries, so shown for context and not scored).',
    kinSrc: 'shares a main language and/or region with {x}',
    kinNone: 'no shared main language or region',
    freeOwn:
      'Freedoms are limited here (scored as such), but not a dealbreaker for you: you hold this country’s passport.',
    freeLow:
      'Freedoms are limited here (scored as such), but not a dealbreaker: you said freedom barely matters to you.',
    latitude: 'latitude',
    howEnglish: 'This section is in English.',
    dataUpdated: 'Data updated',
    citiesWord: 'cities',
    mapErr: 'The map outlines couldn’t load. Filters, scores, compare and the ranking still work.',
    langHint: 'Tap once for fluent, twice for “some”, a third time to remove.',
    langFluent: 'Fluent',
    langSome: 'some',
    langLearn: 'I’ll learn whatever language is needed (language matters little)',
    passHint:
      'Add every passport you hold. Citizenship, free-movement zones like the EU and special routes all count.',
    passAdd: 'Add a passport',
    passIgnore: 'Ignore work permits',
    remove: 'Remove',
    back: 'Back',
    skip: 'Skip the quiz',
    next: 'Next',
    finish: 'See my results',
    tagImp: 'filled in',
    rangeLine: 'Likely {lo}–{hi} · rank {rlo}–{rhi} of {n}',
    rankLine: 'Rank {rlo}–{rhi} of {n}, depending on other places\u2019 filled-in values',
    impShare: '{p}% of this score uses filled-in values',
    impLabel:
      'Fill data gaps with tested estimates (recommended). Without this, places with less published data fall to the bottom.',
    impTitle: 'Filling gaps, and how accurate it is',
    impBody:
      'Published data is missing for {c}% of country values and {y}% of city values, mostly for smaller and poorer places (the test below shows how much). Countries: each gap is filled 20 times (multiple imputation). Each version predicts the value from the country\u2019s other figures plus its wealth, size and region, then fills in a real published value from one of the five most similar countries (predictive mean matching, which keeps values on the 1\u20135 scale). Cities: from the country\u2019s figure and the measured city-vs-country gap, pulled toward the country\u2019s other cities by how many there are (a multilevel model). The 120 recalculations use the 20 versions, and the score\u2019s combined uncertainty follows Rubin\u2019s rules. A factor whose test error is above 1 point is not filled in at all: {skip}.',
    impFactor: 'Factor',
    impCountries: 'Countries: average error, points on the 1–5 scale',
    impCities: 'Cities: average error, points on the 1–5 scale',
    impNote:
      'Errors were measured by hiding known values and predicting them: at random (5-fold for countries, leave-one-out for cities), and, for countries, a second time hiding values the way real gaps happen, more often in poorer and smaller countries. The table shows the worse of the two. An error of 0.5 means a filled-in score is typically half a point off.',
    whyNoData: 'Not enough published data about this place to give a reliable verdict.',
    unsure: 'Not sure, skip',
    estLabel:
      'Also count estimated factors (things happening, jobs by field, and walkability or LGBTQ+ scores where no published figure exists). They have no published data, so they\u2019re off by default.',
    whyGood: 'Good for you: {x}.',
    whyNone: 'No standout strengths for you.',
    whyBad: 'Weakest: {x}.',
    tagEst: 'estimate',
    notCounted: 'not counted',
    natlNote:
      'No city-level data is published for this place, so its city figures are filled in from national data and the measured gap between cities and their countries. See the likely range above.',
    tripTitle: 'Your real door-to-door trip time',
    tripNote: 'The placeholder is a rough estimate. Type your real trip time to replace it.',
    feedback: 'Suggest a city or a correction',
    grpSuggested: 'Suggested',
    grpCities: 'Cities',
    grpCountries: 'Countries',
    homeQ: 'Where is home for you?',
    homeSub: 'Used to estimate flight times back home. Optional.',
    home1: 'Home base',
    home2: 'Second home base (optional)',
    none: 'None',
    vsEyebrow: 'Your results',
    vsTitle: 'You vs Adriano',
    matchLabel: 'how closely your ranking of cities matches Adriano’s',
    yourTop: 'Your top 5 cities',
    adTop: 'Adriano’s top 5 cities',
    bothLists: 'on both lists',
    youMore: 'You rate these much higher',
    adMore: 'Adriano rates these much higher',
    weighDiff: 'Where your priorities differ most',
    youMoreW: 'You care more about',
    adMoreW: 'Adriano cares more about',
    noneBig: 'No big differences.',
    share: 'Copy link to my results',
    retake: 'Retake the quiz',
    toMap: 'Explore your map ↓',
    copied: 'Link copied. Anyone who opens it sees your take.',
    sharedView: 'You’re viewing a shared take. Retake the quiz to make your own.',
    mapTitle: 'The map',
    adTake: 'Adriano’s take',
    yourTake: 'Your take',
    modeAd: 'Showing Adriano’s priorities.',
    modeYou: 'Showing your priorities. Tap any place to compare with Adriano.',
    optsTitle: 'Map options and filters',
    colorBy: 'Color by',
    find: 'Find a place',
    findPh: 'Guadalajara',
    layers: 'Show',
    countries: 'Countries',
    cities: 'Cities',
    cityNames: 'City names',
    verdicts: 'Verdicts shown',
    minScore: 'Minimum score',
    mustHave: 'Minimums: screen out any place below these (then rank the rest)',
    resetFilters: 'Reset filters',
    fsum: '{c} of {ct} countries · {d} of {dt} cities',
    hintTouch: 'Two fingers to move the map',
    hintMouse: 'Ctrl or ⌘ + scroll to zoom',
    ranking: 'Ranking',
    showAll: 'Show all',
    rankmeta: '{n} of {t} match your filters',
    nothing: 'Nothing matches these filters.',
    compare: 'Compare',
    clear: 'Clear',
    cmpEmpty: 'Add up to three places with the Compare button to see them side by side.',
    overall: 'Overall',
    weightsTitle: 'Fine-tune the weights',
    weightsNote: 'How much each factor counts. Moving a slider switches to your take.',
    preset: 'Preset',
    homeBases: 'Home bases',
    normLabel:
      'Balance factor scales: rescale every factor to the same average and spread before weighting, so a generously scored factor doesn’t quietly count more',
    gateLabel:
      'Limited freedoms (2 or lower) or active war are dealbreakers: capped at Poor match. The highest crime (safety 1) is capped at Caution',
    gateOpenLabel: 'The hardest places to make friends (1) are near-dealbreakers: capped at Caution',
    gateFarLabel: 'Trips of more than 18 hours to a home base are near-dealbreakers: capped at Caution',
    gateHotLabel:
      'Hot summers are near-dealbreakers (hottest month averaging 27 °C / 81 °F or more): capped at Caution, unless you chose hot weather',
    presets: {
      mine: 'Adriano’s priorities',
      quiz: 'From your quiz',
      career: 'Career first',
      balance: 'Balance and wellbeing',
      custom: 'Custom',
    },
    colorOpts: {
      tier: 'Overall verdict',
      score: 'Overall score',
      quant: 'Score, quantile breaks',
      limit: 'Main drawback (8 groups)',
      conf: 'Share of published data',
      vs: 'You vs Adriano',
    },
    regions: {
      world: 'World',
      atlantic: 'Atlantic',
      na: 'North America',
      eu: 'Europe',
      la: 'Latin America',
      ap: 'Asia and Pacific',
    },
    tiers: {
      fit: 'Strong fit',
      ok: 'Workable',
      caution: 'Caution',
      avoid: 'Poor match for these priorities',
      nodata: 'Not enough data',
    },
    pick: 'Pick a place',
    pickNote:
      'Tap a country or city on the map, or a row in the ranking, to see its twenty-three scores and the main reason behind its verdict.',
    city: 'City',
    country: 'Country',
    estimated: 'estimated',
    details: 'Details',
    addCmp: 'Compare',
    removeCmp: 'Remove',
    drag: 'Main drawback: {x}',
    noDrag: 'No major drawback for these priorities',
    dealRule: ' (dealbreaker rule)',
    shortest: 'Shortest day {h}h {m}m',
    flightTo: 'about {h}h to {p}',
    fromCenter: ' (from the country center)',
    backed:
      '{b} of {k} factors come from published data, official rules or a calculation; the rest are filled in or estimated, as marked.',
    youScore: 'You',
    adScore: 'Adriano',
    noData: 'no data',
    filteredOut: 'filtered out',
    noMajor: 'No major drawback',
    legendAll: 'all estimate',
    legendData: 'all data',
    legendNoData: 'No data',
    legendFiltered: 'Filtered out',
    poor: '1 poor',
    great: '5 great',
    vsLegendLow: 'Adriano higher',
    vsLegendHigh: 'you higher',
    howTitle: 'How the scores work, sources, and bias check',
    copyPrompt: 'Copy this link:',
    tagData: 'data',
    tagCalc: 'calc',
    capData: 'Held back from Strong fit: no published figure for {x} here, only a filled-in value.',
    capShare: 'Held back from Strong fit: more than a fifth of this score rests on filled-in values.',
    calcTitle: 'How this score was calculated',
    calcFactor: 'Factor',
    calcSrc: 'Published figures (1–5 band)',
    calcUsed: 'Used',
    calcW: 'Weight',
    calcPts: 'Points',
    calcTotal: 'Total',
    calcNatl: 'national figure',
    calcImp: 'filled in by the model (measured error ±{sd})',
    calcRule: 'official rules',
    calcDay: 'shortest day {h}h {m}m',
    calcTrip: 'trip home {h}h',
    calcOff: 'not counted',
    calcNone: 'no data',
    calcNote:
      'Each factor’s 1–5 value is the average of its published figures; the number in parentheses is the exact position within the band, used when exact values are on. Points = weight × (value − 1) ÷ 4, as a share of all your weights, so the points add up to the score. With scale balancing on, values are rescaled first, shown in brackets.',
    calcEst: 'hand estimate',
    verdictFor: 'Verdict for these priorities:',
    tiersShort: {
      fit: 'Strong fit',
      ok: 'Workable',
      caution: 'Caution',
      avoid: 'Poor match',
      nodata: 'Not enough data',
    },
    goalsTitle: 'How much each goal counts',
    goalFactors: 'Fine-tune its {n} factors',
    undo: 'Undo',
    undone: 'Change undone.',
    nowYours: 'Switched from {m} to Your take, starting from the same settings.',
    liveTop: 'Top 5 {t} now',
    seeCalc: 'See how it was calculated ↓',
    notApplicable: 'not applicable',
    wOff: 'weight 0',
    dotsOnly: 'Dots only',
    secRules: 'Dealbreaker rules',
    secAdjust: 'Adjustments',
    secStats: 'Data and statistics (advanced)',
    marTitle:
      'Are the gaps random? For each factor: how many countries lack a figure, how much poorer and smaller they are than countries that have one (in standard deviations of log GDP per person and log population), and how well wealth, size and region predict which ones are missing (AUC: 0.5 = no pattern, 1 = fully predictable). The gaps are clearly not random, which is why those three are used to fill them.',
    marMiss: 'Countries missing',
    marGdp: 'Wealth gap',
    marPop: 'Size gap',
    quantNote: 'Score, in fifths of all places:',
    opacNote: 'Paler countries: more of the score is filled in rather than published.',
    groups: {
      money: 'Money',
      housing: 'Housing',
      jobs: 'Jobs and permits',
      climate: 'Climate and daylight',
      around: 'Getting around',
      rights: 'Rights, safety and healthcare',
      people: 'People and things to do',
      distance: 'Distance from home',
      none: 'No major drawback',
    },
    likelyRange: 'likely',
    pFitShort: 'chance of Strong fit',
    likelyCap:
      'Capped because the filled-in {x} value is more likely than not below the dealbreaker line ({p} of its 20 imputed versions are).',
    probLine: 'Strong fit in {f} of recalculations · top 10 in {t}',
    profileNote:
      'Each factor on its own, 1–5, nothing combined. * = filled in. Columns are your weighted factors, most important first.',

    permRight: 'Legal right to work',
    permRoute: 'Route for a junior hire without that right',
    yes: 'yes',
    no: 'no',
    routeEasy: 'open route (e.g. UK High Potential Individual visa, USMCA TN)',
    routeSome: 'possible with an employer sponsor',
    routeHard: 'hard: depends on an employer sponsoring a junior hire',
    verified: 'rules checked 11 Nov 2026',
    calcDraws: 'its 20 imputed versions: {d}',
    hubNote: 'Hybrid work: uses the job market of {c}, within 120 km.',
    geoNote:
      'Geometric mean is on: the points column shows each factor’s plain-average share, so it won’t add up to the score.',
    rubinLine:
      'Combined uncertainty (Rubin’s rules): ±{t} points · between the 20 filled-in datasets ±{b} · measurement error of published figures ±{w}',
    roundNote:
      'Scores are rounded to the nearest 5 here and on the map; exact values are in the calculation table.',
    nbhdTitle: 'Which part of the city these scores describe',
    nbhd: 'Most figures cover the whole city or metro area (see each figure’s unit in the table). Numbeo answers and the one-bedroom rents lean toward central neighborhoods; crime, vacancy and the job market are city- or metro-wide. Outer neighborhoods are usually cheaper, more car-dependent and quieter than these numbers suggest.',
    walkInfo:
      'Walk Score {w}, Transit Score {t}: city-wide averages, shown for reference but not scored (car dependence uses one measure everywhere). Neighborhoods vary a lot:',
    walkLink: 'look up a neighborhood',
    askTitle: 'Ask someone who lives there',
    askNote:
      'Numbers miss what daily life feels like. Three questions picked from this place’s weakest and least certain factors:',
    taxNote:
      'US citizens must still file US taxes every year while living abroad (with credits and exclusions that often reduce what’s owed).',
    goals: {
      growth: 'Growth: career and money',
      happiness: 'Happiness: people and daily life',
      ease: 'Efficiency and security',
    },
    effTitle: 'What actually moves the ranking',
    effNote:
      'Slider share is how much weight you gave each factor. Real influence is how much of the differences between {t} it accounts for. A factor where every place scores about the same moves little, however heavy its slider. A negative number means the factor runs against the overall order: the places that rank high tend to be weaker on it.',
    effSlider: 'Slider share',
    effReal: 'Real influence',
    anyMin: 'any',
    offerTitle: 'Compare job offers',
    offerIntro:
      'Pick up to three cities and type each offer’s monthly take-home pay (after tax). The table subtracts the city’s one-bedroom rent and converts what’s left into the prices of your home city (New York if you haven’t set one).',
    offerCity: 'City',
    offerPay: 'Take-home pay / month',
    offerRent: '1-bedroom rent, center',
    offerLeft: 'Left after rent',
    offerNY: 'In {h} prices',
    offerVerdict: 'Verdict',
    offerEmpty: 'Add a city and a monthly take-home amount to compare.',
    offerNote:
      'Rent: Numbeo item prices (April 2026 snapshot); ≈ = rebuilt from Numbeo’s rent index, calibrated on 45 cities with item prices. The page has no tax tables, so enter pay after tax. The other columns are the factors that differ most between these offers, by your weights.',
    modeEq: 'Default priorities: every factor counts the same. Take the quiz to make the map yours.',
    fullQuiz: 'Longer quiz (20 questions)',
    qtip: 'A tip from research on predicting happiness: people tend to overrate weather and how a place felt on a short visit, and underrate commutes and friendships.',
    defaultsTitle: '{n} questions used a default',
    defaultsNote:
      'These questions were skipped or not asked. Each one uses the default shown; pick an answer to change it.',
    keepDefault: 'Default',
    defModes: {
      field: 'general job market',
      clim: 'mild climate',
      pol: 'politics left out',
      lang: 'English only',
      perm: 'US passport',
      reach: 'no',
      agg: 'strengths can make up for a weak spot',
      sure: 'well-measured places first',
    },
    contLabel:
      'Use exact values within each 1–5 band (recommended): a figure just above a cut-off isn’t treated as a full band better than one just below',
    meLabel:
      'Also vary published figures by their likely measurement error in the 120 recalculations (about ±0.5 for crowd surveys, ±0.25 for official statistics), so fully measured places get a range too',
    rankByLab: 'Order within a verdict by',
    rankBy: { lo: 'Low end of the likely range (cautious)', mid: 'Middle of the likely range (best guess)' },
    rankByNote:
      'Low end favors places we know well: an uncertain place has to be clearly better to rank above a well-measured one. Middle treats every place as its best guess, so uncertain places rise.',
    aggLab: 'Combine factors with',
    agg: { mean: 'Weighted average', geo: 'Geometric mean (weak spots count more)' },
    normMLab: 'Balance scales by',
    normM: { z: 'Same average and spread (z-score)', minmax: 'Same lowest and highest (min-max)' },
    happyLab: 'Life satisfaction',
    happyM: { report: 'As reported (World Happiness Report)', beyond: 'Beyond income, health and freedom' },
    lastsLabel:
      'Adjust for what lasts: move 30% of the climate and daylight weight to commute and making friends, which research says people underweight when choosing',
    reachLabel: 'Hybrid work: count the job market of a bigger city within 120 km (about 1.5 hours)',
    shadeOpac: 'Fade countries by filled-in share',
    namesRule:
      'The top 10 cities show their rank, and more names appear as you zoom. A numbered bubble is a group of nearby cities: tap it to zoom in. Country names and US state lines appear as you zoom.',
    dotsNote: 'Turn off Countries for a dots-only map, so big countries don’t dominate.',
    viewScore: 'Combined score',
    viewProfile: 'Factors separately',
    rangeKey: 'Bar: likely range from 120 recalculations · tick: the score · dashed line: 70, Strong fit.',
    choicesTitle: 'Judgment calls (you can change them)',
    choicesBody:
      '<ul><li>Verdict lines: Strong fit at 70, Workable at 60, Caution at 48. They are judgment calls, not facts.</li><li>Dealbreakers: limited freedoms or war cap a place at Poor match; the highest crime, the hardest places to make friends, trips home over 18 hours and hot summers cap it at Caution. Each is a switch in the weights panel.</li><li>A Strong fit needs published figures for housing, jobs, healthcare, safety, freedom and money, and less than a fifth of its score filled in.</li><li>My own weights, heaviest first: car dependence, healthcare, job market, climate, commute, money after rent.</li><li>Scores show rounded to 5, because a 1-point gap is inside the measurement error.</li><li>The page opens on equal weights, so my priorities aren’t the default for you.</li></ul>',
  },
  es: {
    knowDev: 'Conozco a Adriano, quien hizo esto',
    knowDevOff: 'Ocultar lo de Adriano',
    devNote:
      'Adriano estudia ciencias de la computación en Columbia y creó esto para decidir dónde vivir al graduarse. Su versión aparece junto a la tuya en el mapa, y tus resultados del cuestionario comparan las dos.',
    modeYou1: 'Con tus prioridades.',
    resTitle: 'Tus mejores opciones',
    yourTopC: 'Tus 5 países principales',
    brand: '¿Dónde deberías vivir?',
    eyebrow: 'Atlas de habitabilidad · noviembre de 2026',
    h1: '¿Dónde deberías vivir?',
    intro1:
      'Todos los países y ' +
      DATA.cities.length +
      ' ciudades, calificados en las mismas 19 cosas con datos publicados. Responde seis preguntas y el mapa los ordena para ti.',
    prioTitle: 'Mis prioridades principales',
    prio: [
      'Eficiencia y poder caminar a todo',
      'Salud que no dependa de mi trabajo',
      'Ser feliz en el día a día',
      'Que pasen cosas',
      'Que sea asequible',
    ],
    startQuiz: 'Hacer el cuestionario de 1 minuto',
    skipQuiz: 'Ver el mapa directamente',
    resume: 'Seguir con mi mapa',
    startNote:
      'No se envía nada. Tus respuestas se quedan en este navegador a menos que compartas un enlace.',
    howRead: 'Cómo leer el mapa',
    qOf: 'Pregunta {n} de {t}',
    heroNow: 'Su top tres ahora mismo: {x}.',
    sharpen: 'Afinarlo: responder el resto',
    doneLab: 'Listo',
    doneTitle: 'Tu mapa está listo',
    doneSub:
      'Hecho con tus {n} respuestas; está justo abajo. {m} preguntas rápidas más lo hacen más preciso, y puedes parar cuando quieras.',
    doneMore: 'Hacerlo más preciso ({m} más)',
    doneMap: 'Ver mi mapa',
    hpSearch: 'Buscar ciudades y países',
    cancel: 'Cancelar',
    noMatch: 'Sin resultados',
    gatedNote:
      'Solo por su puntaje ({s}) sería {t}; el motivo de exclusión por {x} lo limita. Puedes desactivar los motivos de exclusión en Ajusta los pesos.',
    raceInfo:
      'Aquí el {r}% no querría vecinos de otra raza y el {i}% no querría inmigrantes (Encuesta Mundial de Valores 2017–22; solo se preguntó en 24 países, así que se muestra como contexto y no se califica).',
    kinSrc: 'comparte idioma principal y/o región con {x}',
    kinNone: 'sin idioma principal ni región en común',
    freeOwn:
      'Aquí las libertades son limitadas (y así se califica), pero no es motivo de exclusión para ti: tienes el pasaporte de este país.',
    freeLow:
      'Aquí las libertades son limitadas (y así se califica), pero no es motivo de exclusión: dijiste que la libertad te importa poco.',
    latitude: 'latitud',
    howEnglish: 'Esta sección está en inglés.',
    dataUpdated: 'Datos actualizados',
    citiesWord: 'ciudades',
    mapErr:
      'No se pudo cargar el contorno del mapa. Los filtros, puntajes, comparaciones y el ranking siguen funcionando.',
    langHint: 'Toca una vez si lo hablas con fluidez, dos veces si “algo”, una tercera para quitarlo.',
    langFluent: 'Con fluidez',
    langSome: 'algo',
    langLearn: 'Aprendería el idioma que haga falta (el idioma importa poco)',
    passHint:
      'Agrega todos tus pasaportes. Cuentan la ciudadanía, las zonas de libre circulación como la UE y las vías especiales.',
    passAdd: 'Agregar un pasaporte',
    passIgnore: 'Ignorar los permisos de trabajo',
    remove: 'Quitar',
    back: 'Atrás',
    skip: 'Saltar el cuestionario',
    next: 'Siguiente',
    finish: 'Ver mis resultados',
    tagImp: 'estimado',
    rangeLine: 'Probable {lo}–{hi} · puesto {rlo}–{rhi} de {n}',
    rankLine: 'Puesto {rlo}–{rhi} de {n}, según los valores estimados de otros lugares',
    impShare: 'el {p}% de este puntaje usa valores estimados',
    impLabel:
      'Llenar huecos de datos con estimaciones probadas (recomendado). Sin esto, los lugares con menos datos publicados caen al fondo.',
    impTitle: 'Cómo se llenan los huecos y qué tan preciso es',
    impBody:
      'Faltan datos publicados para el {c}% de los valores por país y el {y}% de los valores por ciudad, sobre todo en lugares más pequeños y pobres (la prueba de abajo muestra cuánto). Países: cada hueco se llena 20 veces (imputación múltiple). Cada versión predice el valor con las demás cifras del país más su riqueza, tamaño y región, y luego toma un valor publicado real de uno de los cinco países más parecidos (emparejamiento por media predictiva, que mantiene los valores en la escala de 1 a 5). Ciudades: con la cifra del país y la diferencia medida entre ciudad y país, ajustada hacia las demás ciudades del país según cuántas haya (un modelo multinivel). Los 120 recálculos usan las 20 versiones, y la incertidumbre combinada del puntaje sigue las reglas de Rubin. Un factor cuyo error de prueba pasa de 1 punto no se estima: {skip}.',
    impFactor: 'Factor',
    impCountries: 'Países: error promedio, puntos en la escala 1–5',
    impCities: 'Ciudades: error promedio, puntos en la escala 1–5',
    impNote:
      'Los errores se midieron ocultando valores conocidos y prediciéndolos: al azar (5 partes para países, uno por uno para ciudades) y, para países, una segunda vez ocultando valores como ocurren los huecos reales, más seguido en países más pobres y pequeños. La tabla muestra el peor de los dos. Un error de 0.5 significa que un valor estimado suele desviarse medio punto.',
    whyNoData: 'No hay suficientes datos publicados sobre este lugar para dar un veredicto confiable.',
    unsure: 'No estoy seguro, saltar',
    estLabel:
      'Contar también los factores estimados (que pasen cosas, empleos por campo, y movilidad o puntajes LGBTQ+ donde no hay cifra publicada). No tienen datos publicados, así que están apagados por defecto.',
    whyGood: 'Bueno para ti: {x}.',
    whyNone: 'Nada destaca para ti.',
    whyBad: 'Lo más débil: {x}.',
    tagEst: 'estimado',
    notCounted: 'no cuenta',
    natlNote:
      'No hay datos publicados a nivel de ciudad para este lugar, así que sus cifras se estiman con datos nacionales y la diferencia medida entre ciudades y sus países. Mira el rango probable arriba.',
    tripTitle: 'Tu tiempo real de viaje puerta a puerta',
    tripNote: 'El valor de ejemplo es una estimación. Escribe tu tiempo real para reemplazarlo.',
    feedback: 'Sugiere una ciudad o una corrección',
    grpSuggested: 'Sugeridos',
    grpCities: 'Ciudades',
    grpCountries: 'Países',
    homeQ: '¿Dónde está tu hogar?',
    homeSub: 'Se usa para estimar el tiempo de vuelo a casa. Opcional.',
    home1: 'Hogar',
    home2: 'Segundo hogar (opcional)',
    none: 'Ninguno',
    vsEyebrow: 'Tus resultados',
    vsTitle: 'Tú vs. Adriano',
    matchLabel: 'qué tanto se parece tu ranking de ciudades al de Adriano',
    yourTop: 'Tus 5 ciudades principales',
    adTop: 'Las 5 de Adriano',
    bothLists: 'en ambas listas',
    youMore: 'Tú calificas mucho más alto',
    adMore: 'Adriano califica mucho más alto',
    weighDiff: 'Donde más difieren sus prioridades',
    youMoreW: 'A ti te importa más',
    adMoreW: 'A Adriano le importa más',
    noneBig: 'Sin grandes diferencias.',
    share: 'Copiar enlace a mis resultados',
    retake: 'Repetir el cuestionario',
    toMap: 'Explora tu mapa ↓',
    copied: 'Enlace copiado. Quien lo abra verá tu versión.',
    sharedView: 'Estás viendo una versión compartida. Repite el cuestionario para hacer la tuya.',
    mapTitle: 'El mapa',
    adTake: 'Versión de Adriano',
    yourTake: 'Tu versión',
    modeAd: 'Con las prioridades de Adriano.',
    modeYou: 'Con tus prioridades. Toca cualquier lugar para compararlo con Adriano.',
    optsTitle: 'Opciones del mapa y filtros',
    colorBy: 'Colorear por',
    find: 'Buscar un lugar',
    findPh: 'Guadalajara',
    layers: 'Mostrar',
    countries: 'Países',
    cities: 'Ciudades',
    cityNames: 'Nombres de ciudades',
    verdicts: 'Veredictos visibles',
    minScore: 'Puntaje mínimo',
    mustHave: 'Mínimos: descartar cualquier lugar por debajo (y ordenar el resto)',
    resetFilters: 'Quitar filtros',
    fsum: '{c} de {ct} países · {d} de {dt} ciudades',
    hintTouch: 'Usa dos dedos para mover el mapa',
    hintMouse: 'Ctrl o ⌘ + rueda para hacer zoom',
    ranking: 'Ranking',
    showAll: 'Ver todos',
    rankmeta: '{n} de {t} cumplen tus filtros',
    nothing: 'Nada cumple estos filtros.',
    compare: 'Comparar',
    clear: 'Borrar',
    cmpEmpty: 'Agrega hasta tres lugares con el botón Comparar para verlos lado a lado.',
    overall: 'General',
    weightsTitle: 'Ajustar los pesos',
    weightsNote: 'Cuánto cuenta cada factor. Mover un control cambia a tu versión.',
    preset: 'Plantilla',
    homeBases: 'Hogares',
    normLabel:
      'Equilibrar escalas: reescalar cada factor al mismo promedio y dispersión antes de ponderar, para que un factor calificado con generosidad no cuente más sin que se note',
    gateLabel:
      'Las libertades limitadas (2 o menos) o la guerra activa son inaceptables: se limitan a Poca coincidencia. La delincuencia más alta (seguridad 1) se limita a Con reservas',
    gateOpenLabel:
      'Los lugares donde es más difícil hacer amigos (1) casi descartan: se limitan a Con reservas',
    gateFarLabel: 'Los viajes de más de 18 horas a un hogar casi descartan: se limitan a Con reservas',
    gateHotLabel:
      'Los veranos calurosos casi descartan (mes más cálido con media de 27 °C o más): se limitan a Con reservas, salvo que elijas clima caluroso',
    presets: {
      mine: 'Prioridades de Adriano',
      quiz: 'Según tu cuestionario',
      career: 'Primero la carrera',
      balance: 'Equilibrio y bienestar',
      custom: 'Personalizado',
    },
    colorOpts: {
      tier: 'Veredicto general',
      score: 'Puntaje general',
      quant: 'Puntaje, cortes por cuantiles',
      limit: 'Principal desventaja (8 grupos)',
      conf: 'Cuánto se basa en datos',
      vs: 'Tú vs. Adriano',
    },
    regions: {
      world: 'Mundo',
      atlantic: 'Atlántico',
      na: 'Norteamérica',
      eu: 'Europa',
      la: 'Latinoamérica',
      ap: 'Asia y Pacífico',
    },
    tiers: {
      fit: 'Muy buena opción',
      ok: 'Viable',
      caution: 'Con reservas',
      avoid: 'Poca coincidencia con estas prioridades',
      nodata: 'Datos insuficientes',
    },
    pick: 'Elige un lugar',
    pickNote:
      'Toca un país o una ciudad en el mapa, o una fila del ranking, para ver sus veintitrés puntajes y la razón principal de su veredicto.',
    city: 'Ciudad',
    country: 'País',
    estimated: 'estimado',
    details: 'Detalles',
    addCmp: 'Comparar',
    removeCmp: 'Quitar',
    drag: 'Principal desventaja: {x}',
    noDrag: 'Sin desventajas importantes para estas prioridades',
    dealRule: ' (regla de descarte)',
    shortest: 'Día más corto: {h} h {m} min',
    flightTo: 'unas {h} h a {p}',
    fromCenter: ' (desde el centro del país)',
    backed:
      '{b} de {k} factores vienen de datos publicados, reglas oficiales o un cálculo; el resto se estima, como se indica.',
    youScore: 'Tú',
    adScore: 'Adriano',
    noData: 'sin datos',
    filteredOut: 'filtrado',
    noMajor: 'Sin desventaja importante',
    legendAll: 'todo estimado',
    legendData: 'todo con datos',
    legendNoData: 'Sin datos',
    legendFiltered: 'Filtrado',
    poor: '1 malo',
    great: '5 excelente',
    vsLegendLow: 'Adriano más alto',
    vsLegendHigh: 'tú más alto',
    howTitle: 'Cómo funcionan los puntajes, fuentes y revisión de sesgos',
    copyPrompt: 'Copia este enlace:',
    tagData: 'datos',
    tagCalc: 'cálculo',
    capData: 'No llega a Muy buena opción: no hay una cifra publicada de {x} aquí, solo un valor estimado.',
    capShare:
      'No llega a Muy buena opción: más de una quinta parte de este puntaje se basa en valores estimados.',
    calcTitle: 'Cómo se calculó este puntaje',
    calcFactor: 'Factor',
    calcSrc: 'Cifras publicadas (franja 1–5)',
    calcUsed: 'Usado',
    calcW: 'Peso',
    calcPts: 'Puntos',
    calcTotal: 'Total',
    calcNatl: 'cifra nacional',
    calcImp: 'estimado por el modelo (error medido ±{sd})',
    calcRule: 'reglas oficiales',
    calcDay: 'día más corto {h} h {m} min',
    calcTrip: 'viaje a casa {h} h',
    calcOff: 'no cuenta',
    calcNone: 'sin datos',
    calcNote:
      'El valor de 1 a 5 de cada factor es el promedio de sus cifras publicadas; el número entre paréntesis es la posición exacta dentro de la franja, que se usa si los valores exactos están activados. Puntos = peso × (valor − 1) ÷ 4, como parte de todos tus pesos, así que los puntos suman el puntaje. Con el equilibrio de escalas activado, los valores se reescalan antes; se muestran entre corchetes.',
    calcEst: 'estimación a mano',
    verdictFor: 'Veredicto para estas prioridades:',
    tiersShort: {
      fit: 'Muy buena opción',
      ok: 'Viable',
      caution: 'Con reservas',
      avoid: 'Poca coincidencia',
      nodata: 'Datos insuficientes',
    },
    goalsTitle: 'Cuánto cuenta cada meta',
    goalFactors: 'Ajustar sus {n} factores',
    undo: 'Deshacer',
    undone: 'Cambio deshecho.',
    nowYours: 'Cambiaste de {m} a Tu versión, con los mismos ajustes de inicio.',
    liveTop: 'Top 5 de {t} ahora',
    seeCalc: 'Ver cómo se calculó ↓',
    notApplicable: 'no aplica',
    wOff: 'peso 0',
    dotsOnly: 'Solo puntos',
    secRules: 'Reglas de descarte',
    secAdjust: 'Ajustes',
    secStats: 'Datos y estadística (avanzado)',
    marTitle:
      '¿Los huecos son al azar? Para cada factor: cuántos países no tienen cifra, qué tan más pobres y pequeños son que los que sí la tienen (en desviaciones estándar del logaritmo del PIB por persona y de la población), y qué tan bien la riqueza, el tamaño y la región predicen cuáles faltan (AUC: 0.5 = sin patrón, 1 = totalmente predecible). Los huecos claramente no son al azar; por eso esas tres variables se usan para llenarlos.',
    marMiss: 'Países sin dato',
    marGdp: 'Diferencia de riqueza',
    marPop: 'Diferencia de tamaño',
    quantNote: 'Puntaje, en quintos de todos los lugares:',
    opacNote: 'Países más pálidos: más parte del puntaje es estimada y no publicada.',
    groups: {
      money: 'Dinero',
      housing: 'Vivienda',
      jobs: 'Empleo y permisos',
      climate: 'Clima y luz',
      around: 'Moverse',
      rights: 'Derechos, seguridad y salud',
      people: 'Gente y cosas que hacer',
      distance: 'Distancia a casa',
      none: 'Sin desventaja importante',
    },
    likelyRange: 'probable',
    pFitShort: 'probabilidad de Muy buena opción',
    likelyCap:
      'Limitado porque el valor estimado de {x} probablemente está por debajo de la línea de descarte (lo está en {p} de sus 20 versiones imputadas).',
    probLine: 'Muy buena opción en {f} de los recálculos · top 10 en {t}',
    profileNote:
      'Cada factor por separado, de 1 a 5, sin combinar. * = estimado. Las columnas son tus factores ponderados, del más importante al menos.',

    permRight: 'Derecho legal a trabajar',
    permRoute: 'Vía para un recién egresado sin ese derecho',
    yes: 'sí',
    no: 'no',
    routeEasy: 'vía abierta (p. ej. visa High Potential Individual del Reino Unido, TN del T-MEC)',
    routeSome: 'posible con patrocinio de un empleador',
    routeHard: 'difícil: depende de que un empleador patrocine a alguien junior',
    verified: 'reglas revisadas el 11 de nov. de 2026',
    calcDraws: 'sus 20 versiones imputadas: {d}',
    hubNote: 'Trabajo híbrido: usa el mercado laboral de {c}, a menos de 120 km.',
    geoNote:
      'La media geométrica está activada: la columna de puntos muestra la parte de cada factor en el promedio simple, así que no suma el puntaje.',
    rubinLine:
      'Incertidumbre combinada (reglas de Rubin): ±{t} puntos · entre los 20 conjuntos estimados ±{b} · error de medición de las cifras publicadas ±{w}',
    roundNote:
      'Aquí y en el mapa los puntajes se redondean al 5 más cercano; los valores exactos están en la tabla de cálculo.',
    nbhdTitle: 'Qué parte de la ciudad describen estos puntajes',
    nbhd: 'La mayoría de las cifras cubren toda la ciudad o el área metropolitana (mira la unidad de cada cifra en la tabla). Las respuestas de Numbeo y las rentas de un departamento de una recámara se inclinan hacia las colonias céntricas; la delincuencia, las vacantes y el mercado laboral son de toda la ciudad o el área metropolitana. Las colonias de las afueras suelen ser más baratas, más dependientes del auto y más tranquilas de lo que sugieren estas cifras.',
    walkInfo:
      'Walk Score {w}, Transit Score {t}: promedios de toda la ciudad, se muestran como referencia pero no cuentan (la dependencia del auto usa una sola medida en todos lados). Las colonias varían mucho:',
    walkLink: 'buscar una colonia',
    askTitle: 'Pregúntale a alguien que vive ahí',
    askNote:
      'Las cifras no captan cómo se siente el día a día. Tres preguntas elegidas según los factores más débiles y menos seguros de este lugar:',
    taxNote:
      'Los ciudadanos estadounidenses deben seguir presentando su declaración de impuestos en EE. UU. cada año aunque vivan en el extranjero (con créditos y exclusiones que muchas veces reducen lo que se debe).',
    goals: {
      growth: 'Crecimiento: carrera y dinero',
      happiness: 'Felicidad: gente y vida diaria',
      ease: 'Eficiencia y seguridad',
    },
    effTitle: 'Lo que de verdad mueve el ranking',
    effNote:
      'La parte del control es cuánto peso le diste a cada factor. La influencia real es cuánto explica de las diferencias entre {t}. Un factor en el que todos los lugares califican parecido mueve poco, aunque su control esté alto. Un número negativo significa que el factor va en contra del orden general: los lugares que quedan arriba tienden a ser más débiles en él.',
    effSlider: 'Parte del control',
    effReal: 'Influencia real',
    anyMin: 'cualquiera',
    offerTitle: 'Comparar ofertas de trabajo',
    offerIntro:
      'Elige hasta tres ciudades y escribe el sueldo neto mensual de cada oferta (después de impuestos). La tabla resta la renta de un departamento de una recámara y convierte lo que queda a precios de tu ciudad de origen (Nueva York si no elegiste una).',
    offerCity: 'Ciudad',
    offerPay: 'Sueldo neto al mes',
    offerRent: 'Renta 1 recámara, centro',
    offerLeft: 'Queda después de la renta',
    offerNY: 'En precios de {h}',
    offerVerdict: 'Veredicto',
    offerEmpty: 'Agrega una ciudad y un sueldo neto mensual para comparar.',
    offerNote:
      'Renta: precios por artículo de Numbeo (corte de abril de 2026); ≈ = reconstruida con el índice de renta de Numbeo, calibrado con 45 ciudades que tienen precios por artículo. La página no tiene tablas de impuestos, así que escribe el sueldo después de impuestos. Las demás columnas son los factores que más cambian entre estas ofertas, según tus pesos.',
    modeEq:
      'Prioridades por defecto: todos los factores cuentan igual. Haz el cuestionario para que el mapa sea tuyo.',
    fullQuiz: 'Cuestionario largo (20 preguntas)',
    qtip: 'Un consejo de la investigación sobre cómo predecimos la felicidad: la gente suele sobrevalorar el clima y cómo se sintió un lugar en una visita corta, y subestimar los trayectos y las amistades.',
    defaultsTitle: '{n} preguntas usaron un valor por defecto',
    defaultsNote:
      'Estas preguntas se saltaron o no se hicieron. Cada una usa el valor que se muestra; elige una respuesta para cambiarlo.',
    keepDefault: 'Por defecto',
    defModes: {
      field: 'mercado laboral general',
      clim: 'clima templado',
      pol: 'sin política',
      lang: 'solo inglés',
      perm: 'pasaporte estadounidense',
      reach: 'no',
      agg: 'las ventajas pueden compensar un punto débil',
      sure: 'primero los lugares bien medidos',
    },
    contLabel:
      'Usar valores exactos dentro de cada franja de 1 a 5 (recomendado): una cifra apenas arriba de un corte no cuenta como una franja entera mejor que una apenas abajo',
    meLabel:
      'Variar también las cifras publicadas según su error de medición probable en los 120 recálculos (unos ±0.5 en encuestas abiertas, ±0.25 en estadísticas oficiales), para que los lugares medidos por completo también tengan rango',
    rankByLab: 'Dentro de un veredicto, ordenar por',
    rankBy: {
      lo: 'Extremo bajo del rango probable (prudente)',
      mid: 'Centro del rango probable (mejor estimación)',
    },
    rankByNote:
      'El extremo bajo favorece a los lugares que conocemos bien: un lugar incierto tiene que ser claramente mejor para quedar arriba de uno bien medido. El centro toma a cada lugar por su mejor estimación, así que los lugares inciertos suben.',
    aggLab: 'Combinar factores con',
    agg: { mean: 'Promedio ponderado', geo: 'Media geométrica (los puntos débiles pesan más)' },
    normMLab: 'Equilibrar escalas por',
    normM: { z: 'Mismo promedio y dispersión (puntaje z)', minmax: 'Mismo mínimo y máximo (mín-máx)' },
    happyLab: 'Satisfacción con la vida',
    happyM: {
      report: 'Tal como se reporta (Informe Mundial de la Felicidad)',
      beyond: 'Más allá del ingreso, la salud y la libertad',
    },
    lastsLabel:
      'Ajustar por lo que dura: pasar el 30% del peso del clima y la luz al trayecto y a hacer amigos, que según la investigación la gente subestima al elegir',
    reachLabel:
      'Trabajo híbrido: contar el mercado laboral de una ciudad más grande a menos de 120 km (unas 1.5 horas)',
    shadeOpac: 'Aclarar países según lo estimado',
    namesRule:
      'Las 10 mejores ciudades muestran su puesto y aparecen más nombres al acercarte. Una burbuja con número es un grupo de ciudades cercanas: tócala para acercarte. Los nombres de países y los límites de los estados de EE. UU. aparecen al acercarte.',
    dotsNote: 'Apaga Países para ver solo los puntos de las ciudades, sin que los países grandes dominen.',
    viewScore: 'Puntaje combinado',
    viewProfile: 'Factores por separado',
    rangeKey:
      'Barra: rango probable de 120 recálculos · marca: el puntaje · línea punteada: 70, Muy buena opción.',
    choicesTitle: 'Decisiones que tomé (y que puedes cambiar)',
    choicesBody:
      '<ul><li>Líneas de veredicto: Muy buena opción desde 70, Viable desde 60, Con reservas desde 48. Son decisiones de criterio, no hechos.</li><li>Reglas de descarte: las libertades limitadas o la guerra limitan un lugar a Poca coincidencia; la delincuencia más alta, los lugares donde es más difícil hacer amigos, los viajes a casa de más de 18 horas y los veranos calurosos lo limitan a Con reservas. Cada una se puede apagar en el panel de pesos.</li><li>Una Muy buena opción necesita cifras publicadas de vivienda, empleo, salud, seguridad, libertad y dinero, y menos de una quinta parte de su puntaje estimada.</li><li>Mis propios pesos, del mayor al menor: dependencia del auto, salud, mercado laboral, clima, trayecto, dinero después de la renta.</li><li>Los puntajes se muestran redondeados al 5, porque una diferencia de 1 punto cabe dentro del error de medición.</li><li>La página abre con todo igual, para que mis prioridades no sean las tuyas por defecto.</li></ul>',
  },
};
const FSTR = {
  en: {
    commute: ['Short commutes', 'Long commutes'],
    move: ['Low car dependence', 'Car-dependent'],
    hlth: ['Healthcare access', 'Weaker healthcare access'],
    happy: ['Reported life satisfaction', 'Lower reported life satisfaction'],
    cult: ['Things happening', 'Little going on'],
    open: ['Welcoming to newcomers', 'Less welcoming to newcomers'],
    pay: ['Money left after rent', 'Little left after rent'],
    clim: ['Climate for you', 'Weather you won\u2019t like'],
    jobs: ['Job market', 'Weak job market'],
    home: ['Apartments available to rent', 'Hard to find a place to rent'],
    pol: ['US state politics match yours', 'State politics don’t match yours'],
    day: ['Winter daylight', 'Short winter days'],
    free: ['Freedom', 'Limited freedoms'],
    safe: ['Safety', 'High crime or conflict'],
    women: ['Safety and rights for women', 'Weaker safety and rights for women'],
    lgbt: ['LGBTQ+ acceptance', 'Less LGBTQ+ acceptance'],
    air: ['Clean air', 'Polluted air'],
    honest: ['Honest institutions', 'More corruption'],
    hours: ['Time off', 'Long working hours'],
    risk: ['Low disaster risk', 'Disaster risk'],
    perm: ['Work permit', 'Hard to get permission to work'],
    lang: ['Language', 'Language barrier'],
    fam: ['Close to home', 'Far from home'],
    kin: ['Cultural familiarity', 'Culturally unfamiliar'],
  },
  es: {
    commute: ['Trayectos cortos', 'Trayectos largos'],
    move: ['Poca dependencia del auto', 'Depende del auto'],
    hlth: ['Acceso a la salud', 'Menor acceso a la salud'],
    happy: ['Satisfacción con la vida', 'Menor satisfacción con la vida'],
    cult: ['Que pasen cosas', 'Pasa poco'],
    open: ['Acogedor con recién llegados', 'Menos acogedor con recién llegados'],
    pay: ['Dinero que queda después de la renta', 'Queda poco después de la renta'],
    clim: ['Clima para ti', 'Un clima que no te va'],
    jobs: ['Mercado laboral', 'Mercado laboral débil'],
    home: ['Departamentos disponibles para rentar', 'Difícil encontrar dónde rentar'],
    pol: ['La política del estado coincide contigo', 'La política del estado no coincide contigo'],
    day: ['Luz en invierno', 'Días de invierno cortos'],
    free: ['Libertad', 'Libertades limitadas'],
    safe: ['Seguridad', 'Delincuencia alta o conflicto'],
    women: ['Seguridad y derechos de las mujeres', 'Menos seguridad y derechos para las mujeres'],
    lgbt: ['Aceptación LGBTQ+', 'Menos aceptación LGBTQ+'],
    air: ['Aire limpio', 'Aire contaminado'],
    honest: ['Instituciones honestas', 'Más corrupción'],
    hours: ['Tiempo libre', 'Jornadas largas'],
    risk: ['Poco riesgo de desastres', 'Riesgo de desastres'],
    perm: ['Permiso de trabajo', 'Difícil obtener permiso de trabajo'],
    lang: ['Idioma', 'Barrera del idioma'],
    fam: ['Cerca de casa', 'Lejos de casa'],
    kin: ['Familiaridad cultural', 'Culturalmente desconocido'],
  },
};
const QSTR = {
  en: {
    field: [
      'What’s your field?',
      [
        'Computer science or software',
        'Finance or business',
        'Healthcare',
        'Creative work, media or the arts',
        'Research or academia',
        'Something else, or a mix',
        'Fully remote, for an employer elsewhere',
      ],
    ],
    reach: [
      'Would you commute to a bigger city a few days a week?',
      ['Yes, up to 1.5 hours each way', 'No, I’d work where I live'],
    ],
    horizon: [
      'How far ahead are you planning?',
      ['My first job (2–3 years)', 'About 5 years', 'The long term'],
    ],
    jobs: [
      'How much does a big job market matter? (Think Tampico vs. New York.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    pay: [
      'How much does money left after rent matter? (About $1,700 a month in New York vs. $4,000 in Pittsburgh.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    home: [
      'How much does an easy apartment hunt matter? (In New York, only 1.4% of rentals are empty.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    move: [
      'How do you want to get around?',
      ['Driving is fine', 'Transit, plus some driving', 'No car at all'],
    ],
    commute: [
      'How much does a short commute matter? (20 minutes instead of 45.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    hlth: [
      'How much does healthcare that doesn’t depend on your job matter?',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    clim: [
      'What weather suits you?',
      [
        'Mild all year (San Francisco, Lisbon)',
        'Hot and sunny (Miami, Singapore)',
        'Four seasons, snow is fine (Toronto, Berlin)',
        'Sunny winters (Madrid, Los Angeles)',
        'Weather doesn’t matter much',
      ],
    ],
    open: ['How much does making friends easily matter?', ['Not much', 'Somewhat', 'A lot']],
    cult: ['How much does a big, busy city matter?', ['Not much', 'Somewhat', 'A lot']],
    kin: [
      'Should places that feel culturally familiar count more? (Same language or region as where you’re from.)',
      ['No', 'A little', 'A lot'],
    ],
    fam: [
      'How much does a short trip home matter? (3 hours instead of 12.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    safe: ['How much does low crime matter?', ['Not much', 'Somewhat', 'A lot']],
    happy: [
      'How much does it matter that people who live there are satisfied with their lives? (Denmark instead of the world average.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    air: [
      'How much does clean air matter? (Madrid’s air instead of Mexico City’s: half the fine-particle pollution.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    honest: [
      'How much does it matter that officials and police aren’t corrupt? (Denmark instead of Mexico on Transparency International’s index.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    hours: [
      'How much does time off matter? (Working hours like Germany’s instead of Mexico’s: about 15 fewer hours a week.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    risk: [
      'How much does a low risk of natural disasters matter? (The Netherlands instead of Mexico: floods, quakes and storms hit less, and cause less harm.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    weak: [
      'Can a place’s strengths make up for one serious weak spot? (Great jobs but poor safety, say.)',
      ['Yes, strengths can make up for it', 'No, one serious weak spot spoils a place'],
    ],
    sure: [
      'When the data on a place is thin, how should it rank?',
      ['Lower: I prefer well-measured places', 'By its best guess: I’ll take the chance'],
    ],
    free: [
      'How much do political freedoms matter? (A free press, the right to protest.)',
      ['Not much', 'Somewhat', 'A lot'],
    ],
    women: [
      'How much should women’s safety and rights count?',
      ['Not at all', 'A little', 'Quite a bit', 'A lot: it affects me or people I’d live with'],
    ],
    lgbt: [
      'How much should LGBTQ+ acceptance count?',
      ['Not at all', 'A little', 'Quite a bit', 'A lot: it affects me or people I’d live with'],
    ],
    pol: [
      'If you lived in the US, should local politics count?',
      ['Yes, I prefer Democratic-leaning areas', 'Yes, I prefer Republican-leaning areas', 'No'],
    ],
    lang: [
      'Which languages could you live in day to day?',
      [
        'English and Spanish',
        'English only',
        'Some English',
        'Spanish only',
        'Spanish, plus some English',
        'I’d learn whatever’s needed',
      ],
    ],
    perm: [
      'Which passports do you have?',
      ['US and Mexican, like Adriano', 'US only', 'Mexican only', 'An EU passport', 'Other (ignore this)'],
    ],
  },
  es: {
    field: [
      '¿A qué te dedicas?',
      [
        'Computación o software',
        'Finanzas o negocios',
        'Salud',
        'Trabajo creativo, medios o artes',
        'Investigación o academia',
        'Otra cosa, o una mezcla',
        '100% remoto, para una empresa de otro lugar',
      ],
    ],
    reach: [
      '¿Viajarías a una ciudad más grande algunos días a la semana?',
      ['Sí, hasta 1.5 horas por trayecto', 'No, trabajaría donde vivo'],
    ],
    horizon: [
      '¿A qué plazo estás pensando?',
      ['Mi primer trabajo (2–3 años)', 'Unos 5 años', 'A largo plazo'],
    ],
    jobs: [
      '¿Cuánto te importa un mercado laboral grande? (Piensa en Tampico frente a Nueva York.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    pay: [
      '¿Cuánto te importa el dinero que queda tras la renta? (Unos $1,700 al mes en Nueva York frente a $4,000 en Pittsburgh.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    home: [
      '¿Cuánto te importa encontrar departamento fácilmente? (En Nueva York solo el 1.4% está libre.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    move: ['¿Cómo quieres moverte?', ['Manejar está bien', 'Transporte público y algo de auto', 'Sin auto']],
    commute: ['¿Cuánto te importa un trayecto corto? (20 minutos en vez de 45.)', ['Poco', 'Algo', 'Mucho']],
    hlth: ['¿Cuánto te importa una salud que no dependa de tu trabajo?', ['Poco', 'Algo', 'Mucho']],
    clim: [
      '¿Qué clima te va?',
      [
        'Templado todo el año (San Francisco, Lisboa)',
        'Calor y sol (Miami, Singapur)',
        'Cuatro estaciones, con nieve (Toronto, Berlín)',
        'Inviernos soleados (Madrid, Los Ángeles)',
        'El clima me da casi igual',
      ],
    ],
    open: ['¿Cuánto te importa hacer amigos fácilmente?', ['Poco', 'Algo', 'Mucho']],
    cult: ['¿Cuánto te importa una ciudad grande y con mucha vida?', ['Poco', 'Algo', 'Mucho']],
    kin: [
      '¿Deberían contar más los lugares culturalmente familiares? (Mismo idioma o región que tu origen.)',
      ['No', 'Un poco', 'Mucho'],
    ],
    fam: ['¿Cuánto te importa un viaje corto a casa? (3 horas en vez de 12.)', ['Poco', 'Algo', 'Mucho']],
    safe: ['¿Cuánto te importa que haya poca delincuencia?', ['Poco', 'Algo', 'Mucho']],
    happy: [
      '¿Cuánto importa que la gente que vive ahí esté satisfecha con su vida? (Dinamarca en vez del promedio mundial.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    air: [
      '¿Cuánto importa el aire limpio? (El aire de Madrid en vez del de la Ciudad de México: la mitad de partículas finas.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    honest: [
      '¿Cuánto importa que los funcionarios y la policía no sean corruptos? (Dinamarca en vez de México en el índice de Transparencia Internacional.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    hours: [
      '¿Cuánto importa el tiempo libre? (Jornadas como las de Alemania en vez de las de México: unas 15 horas menos a la semana.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    risk: [
      '¿Cuánto importa un riesgo bajo de desastres naturales? (Países Bajos en vez de México: menos inundaciones, sismos y tormentas, y menos daño cuando ocurren.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    weak: [
      '¿Pueden las ventajas de un lugar compensar un punto débil serio? (Buen empleo pero poca seguridad, por ejemplo.)',
      ['Sí, las ventajas pueden compensarlo', 'No, un punto débil serio arruina un lugar'],
    ],
    sure: [
      'Cuando hay pocos datos sobre un lugar, ¿cómo debe ordenarse?',
      ['Más abajo: prefiero lugares bien medidos', 'Según su mejor estimación: me arriesgo'],
    ],
    free: [
      '¿Cuánto te importan las libertades políticas? (Prensa libre, derecho a protestar.)',
      ['Poco', 'Algo', 'Mucho'],
    ],
    women: [
      '¿Cuánto deben contar la seguridad y los derechos de las mujeres?',
      ['Nada', 'Un poco', 'Bastante', 'Mucho: me afecta a mí o a quienes vivirían conmigo'],
    ],
    lgbt: [
      '¿Cuánto debe contar la aceptación LGBTQ+?',
      ['Nada', 'Un poco', 'Bastante', 'Mucho: me afecta a mí o a quienes vivirían conmigo'],
    ],
    pol: [
      'Si vivieras en EE. UU., ¿debería contar la política local?',
      ['Sí, prefiero zonas demócratas', 'Sí, prefiero zonas republicanas', 'No'],
    ],
    lang: [
      '¿En qué idiomas podrías vivir tu día a día?',
      [
        'Inglés y español',
        'Solo inglés',
        'Algo de inglés',
        'Solo español',
        'Español y algo de inglés',
        'Aprendería lo que haga falta',
      ],
    ],
    perm: [
      '¿Qué pasaportes tienes?',
      [
        'Estadounidense y mexicano, como Adriano',
        'Solo estadounidense',
        'Solo mexicano',
        'Uno de la UE',
        'Otro (ignorar)',
      ],
    ],
  },
};
const SRC = {
  who: 'https://www.who.int/publications/m/item/who-ambient-air-quality-database-(update-jun-2026)',
  wbpm: 'https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3',
  cpi: 'https://www.transparency.org/en/cpi/2025',
  pwt: 'https://ourworldindata.org/grapher/annual-working-hours-per-worker',
  wri: 'https://data.humdata.org/dataset/worldriskindex',
  gallup: 'https://www.gallup.com/analytics/356996/gallup-global-safety-report.aspx',
  items: 'https://statranker.org/cities-urban-life/top-100-cities-by-rent-to-income-ratio-2026/',
  county: 'https://ballotpedia.org/County-level_presidential_election_voting_trends,_2016-2024',
  bluecard: 'https://www.eubluecard.nl/european-blue-card-salary-thresholds-2026/',
  ibero: 'https://www.costaluzlawyers.com/spanish-citizenship-for-latin-americans-2026-2-year-pathway/',
  tn: 'https://adoption.state.gov/content/travel/en/us-visas/employment/visas-canadian-mexican-usmca-professional-workers.html',
  irs: 'https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad',
  gdppc: 'https://wikiwand.com/en/List_of_countries_by_GDP_per_capita_(PPP)',
  unpop: 'https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population_(United_Nations)',
  temps: 'https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature',
  noaacr: 'https://www.currentresults.com/Weather/US/average-city-temperatures-in-july.php',
  bearpp: 'https://www.bea.gov/sites/default/files/2024-12/rpp1224.pdf',
  acs24: 'https://data.census.gov/table/ACSDP1Y2024.DP03',
  ctt: 'https://climatestotravel.com/temperatures/united-states',
  pres24: 'https://wikiwand.com/en/articles/2024_US_Presidential_Election',
  cmhc: 'https://www.central1.com/wp-content/uploads/2025/12/ECON_COMMENTARY_Rent-Dec2025.pdf',
  sblink:
    'https://www.startupsg.gov.sg/public/inline-images/Startup_Blink_Global_Startup_Ecosystem_Index_2025_web.pdf',
  uhc: 'https://data.worldbank.org/indicator/SH.UHC.SRVS.CV.XD',
  uhc2: 'https://statisticsoftheworld.com/indicators?id=WHO.UHC_INDEX',
  ncol: 'https://www.numbeo.com/cost-of-living/rankings.jsp?title=2026',
  ncolc: 'https://www.numbeo.com/cost-of-living/rankings_by_country.jsp?title=2026',
  nqol: 'https://www.numbeo.com/quality-of-life/rankings.jsp',
  nqolc: 'https://www.numbeo.com/quality-of-life/rankings_by_country.jsp',
  eiu: 'https://www.statisticstimes.com/ranking/democracy-index.php',
  fh: 'https://www.mappr.co/freedom-in-the-world-by-country/',
  hom: 'https://www.factsinstitute.com/ranking/countries-by-murder-rate/',
  fbi: 'https://wiki.krisyotam.com/content/wikipedia_en_all_nopic_2026-03/United_States_cities_by_crime_rate',
  whr: 'https://www.happierlivesinstitute.org/2026/03/19/world-happiness-report-2026-full-country-rankings-our-favourite-finding/',
  ei: 'https://assets.in-cdn.net/expat-insider/2025/ease-of-settling-in-2025',
  mai: 'https://files.worldhappiness.report/WHR18_Annex.pdf',
  wps: 'https://giwps.georgetown.edu/wp-content/uploads/2025/10/WPS-Index-2025-Summary.pdf',
  eq: 'https://www.equaldex.com/equality-index',
  ntr: 'https://www.numbeo.com/traffic/rankings.jsp',
  hpi: 'https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list/high-potential-individual-visa-global-universities-list-2026',
};
const RAWU = {
  who: 'https://www.who.int/publications/m/item/who-ambient-air-quality-database-(update-jun-2026)',
  wbpm: 'https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3',
  cpi: 'https://www.transparency.org/en/cpi/2025',
  pwt: 'https://ourworldindata.org/grapher/annual-working-hours-per-worker',
  wri: 'https://data.humdata.org/dataset/worldriskindex',
  wvsrace: 'https://www.kcl.ac.uk/policy-institute/assets/love-thy-neighbour.pdf',
  gallup: 'https://www.gallup.com/analytics/356996/gallup-global-safety-report.aspx',
  items: 'https://statranker.org/cities-urban-life/top-100-cities-by-rent-to-income-ratio-2026/',
  itemsn: 'https://statranker.org/cities-urban-life/top-100-cities-by-rent-to-income-ratio-2026/',
  nidx: 'https://www.numbeo.com/cost-of-living/rankings.jsp?title=2026',
  money: 'https://statranker.org/cities-urban-life/top-100-cities-by-rent-to-income-ratio-2026/',
  county24: 'https://ballotpedia.org/County-level_presidential_election_voting_trends,_2016-2024',
  lirr: 'https://www.rome2rio.com/s/Manhattan/Huntington-Station-LIRR',
  temps: 'https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature',
  pres24: 'https://wikiwand.com/en/articles/2024_US_Presidential_Election',
  cmhc: 'https://www.central1.com/wp-content/uploads/2025/12/ECON_COMMENTARY_Rent-Dec2025.pdf',
  sblink:
    'https://www.startupsg.gov.sg/public/inline-images/Startup_Blink_Global_Startup_Ecosystem_Index_2025_web.pdf',
  walk: 'https://www.walkscore.com/cities-and-neighborhoods/',
  censusins: 'https://www.census.gov/library/publications/2026/demo/p60-291.html',
  coneval:
    'https://www.coneval.org.mx/SalaPrensa/Comunicadosprensa/Documents/2023/Comunicado_07_Medicion_Pobreza_2022.pdf',
  uhc: 'https://data.worldbank.org/indicator/SH.UHC.SRVS.CV.XD',
  nqol: 'https://www.numbeo.com/quality-of-life/rankings.jsp',
  eiu: 'https://www.statisticstimes.com/ranking/democracy-index.php',
  fh: 'https://www.mappr.co/freedom-in-the-world-by-country/',
  hom: 'https://www.factsinstitute.com/ranking/countries-by-murder-rate/',
  fbi: 'https://wiki.krisyotam.com/content/wikipedia_en_all_nopic_2026-03/United_States_cities_by_crime_rate',
  ei25: 'https://assets.in-cdn.net/expat-insider/2025/ease-of-settling-in-2025',
  ei25h:
    'https://www.iamexpat.nl/expat-info/dutch-news/the-netherlands-named-among-best-countries-work-international',
  ei24: 'https://assets.in-cdn.net/expat-insider/2024/expat-essentials-index-40455',
  eic: 'https://assets.in-cdn.net/expat-insider/2024/expat-essentials-index-for-cities-40491',
  eisp: 'https://assets.in-cdn.net/expat-insider/2024/spanish-cities-40507',
  eiams: 'https://assets.in-cdn.net/expat-insider/2024/dutch-cities-40504',
  nl24: 'https://www.iamexpat.nl/expat-info/dutch-news/netherlands-drops-four-places-ranking-expat-destinations-worldwide',
  mai: 'https://files.worldhappiness.report/WHR18_Annex.pdf',
  ncol: 'https://www.numbeo.com/cost-of-living/rankings.jsp?title=2026',
  ncolc: 'https://www.numbeo.com/cost-of-living/rankings_by_country.jsp?title=2026',
  ntr: 'https://www.numbeo.com/traffic/rankings.jsp',
  eq: 'https://www.equaldex.com/equality-index',
  whr: 'https://www.happierlivesinstitute.org/2026/03/19/world-happiness-report-2026-full-country-rankings-our-favourite-finding/',
  wps: 'https://giwps.georgetown.edu/wp-content/uploads/2025/10/WPS-Index-2025-Summary.pdf',
  ilo: 'https://www.destatis.de/EN/Themes/Countries-Regions/International-Statistics/Data-Topic/Tables/BasicData_Unempl_Rate.html',
  iloy: 'https://www.destatis.de/EN/Themes/Countries-Regions/International-Statistics/Data-Topic/Tables/BasicData_YouthUnemployment.html',
  inf: 'https://en.wikipedia.org/wiki/List_of_countries_by_informal_employment_rate',
  gdp: 'https://en.wikipedia.org/wiki/List_of_cities_by_GDP',
  bea: 'https://fred.stlouisfed.org/series/GDPALL36103',
  nychvs:
    'https://www.nyc.gov/site/hpd/news/007-24/hpd-2023-housing-vacancy-survey-selected-initial-findings',
  censusmsa: 'https://www.doorloop.com/blog/rental-vacancy-statistics',
  census: 'https://www.census.gov/housing/hvs/files/qtr425/Q425press.pdf',
  ei26: 'https://www.relocatemagazine.com/where-expats-struggle-where-they-thrive-in-2026-internations-0726',
};
const RAWL = {
  who: ['WHO air quality database 2026: PM2.5, annual mean (ground monitors)', 'Base de calidad del aire de la OMS 2026: PM2.5, media anual (monitores)', 'who'],
  wbpm: ['PM2.5 exposure, population-weighted (World Bank / IHME, 2023)', 'Exposición a PM2.5 ponderada por población (Banco Mundial / IHME, 2023)', 'wbpm'],
  cpi: ['Corruption Perceptions Index 2025 (Transparency International, 0–100)', 'Índice de Percepción de la Corrupción 2025 (Transparencia Internacional, 0–100)', 'cpi'],
  pwt: ['Hours worked a year per worker (Penn World Table 11.0, via Our World in Data)', 'Horas trabajadas al año por trabajador (Penn World Table 11.0, vía Our World in Data)', 'pwt'],
  wri: ['WorldRiskIndex 2026 (0 = lowest risk, highest about 47)', 'WorldRiskIndex 2026 (0 = riesgo mínimo, el máximo ronda 47)', 'wri'],
  gallup: [
    'Gallup Law and Order Index 2025 (feeling safe at night, trust in police, theft and assault)',
    'Índice de Ley y Orden de Gallup 2025 (sentirse seguro de noche, confianza en la policía, robos y agresiones)',
  ],
  items: [
    'Net salary − one-bedroom rent (centre), ÷ prices (NYC = 100%): Numbeo item prices, Apr 2026',
    'Sueldo neto − renta de una recámara (centro), ÷ precios (NY = 100%): precios por artículo de Numbeo, abr. 2026',
    'items',
  ],
  itemsn: [
    'Net salary (national figure) − one-bedroom rent (centre), ÷ prices: Numbeo item prices, Apr 2026',
    'Sueldo neto (cifra nacional) − renta de una recámara (centro), ÷ precios: Numbeo, abr. 2026',
    'items',
  ],
  nidx: [
    'Net salary − one-bedroom rent, ÷ prices, rebuilt from Numbeo indices (calibrated on 45 cities with item prices)',
    'Sueldo neto − renta de una recámara, ÷ precios, reconstruido con índices de Numbeo (calibrado con 45 ciudades)',
    'nidx',
  ],
  money: [
    'Money left after rent, average of the country’s cities',
    'Dinero después de la renta, promedio de las ciudades del país',
    'money',
  ],
  county24: [
    '2024 presidential vote in the county (margin)',
    'Voto presidencial 2024 en el condado (margen)',
    'county24',
  ],
  sblink: [
    'StartupBlink 2025 tech ecosystem, global city rank',
    'StartupBlink 2025 ecosistema tech, lugar mundial de la ciudad',
    'sblink',
  ],
  sblinknyc: [
    'StartupBlink 2025, New York (commuting range)',
    'StartupBlink 2025, Nueva York (a distancia de traslado)',
    'sblink',
  ],
  walk: ['Walk Score / Transit Score (city)', 'Walk Score / Transit Score (ciudad)', 'walk'],
  census_ins: [
    'People with no health coverage all year (US Census, 2025)',
    'Personas sin cobertura médica todo el año (Censo de EE. UU., 2025)',
    'censusins',
  ],
  coneval: [
    'People without access to health services (CONEVAL, 2022)',
    'Personas sin acceso a servicios de salud (CONEVAL, 2022)',
    'coneval',
  ],
  uhc: ['WHO UHC service coverage 2023', 'Cobertura de servicios OMS 2023', 'uhc'],
  nqolh: ['Numbeo health care index', 'Índice de salud de Numbeo', 'nqol'],
  eiu: ['EIU Democracy Index', 'Índice de Democracia EIU', 'eiu'],
  fh: ['Freedom House score', 'Puntaje de Freedom House', 'fh'],
  hom: ['UNODC homicides per 100k', 'Homicidios por 100 mil (UNODC)', 'hom'],
  fbi: ['FBI 2024 homicides per 100k', 'Homicidios por 100 mil, FBI 2024', 'fbi'],
  nqols: ['Numbeo safety index', 'Índice de seguridad de Numbeo', 'nqol'],
  ei25s: ['Expat Insider 2025, ease of settling in', 'Expat Insider 2025, facilidad para adaptarse', 'ei25'],
  ei24f: ['Expat Insider 2024, finding friends', 'Expat Insider 2024, hacer amigos', 'nl24'],
  eicity24s: [
    'Expat City Ranking 2024, ease of settling in',
    'Expat City Ranking 2024, facilidad para adaptarse',
    'eisp',
  ],
  mai: ['Gallup Migrant Acceptance Index', 'Índice de Aceptación de Migrantes de Gallup', 'mai'],
  nlpp: ['Numbeo local purchasing power (NYC = 100)', 'Poder adquisitivo local de Numbeo (NY = 100)', 'ncol'],
  ncol: ['Numbeo cost of living + rent (NYC = 100)', 'Costo de vida + renta de Numbeo (NY = 100)', 'ncol'],
  ncolc: ['Numbeo cost of living (NYC = 100)', 'Costo de vida de Numbeo (NY = 100)', 'ncolc'],
  nqolc: ['Numbeo climate index', 'Índice de clima de Numbeo', 'nqol'],
  nqolt: ['Numbeo commute time index', 'Índice de tiempo de traslado de Numbeo', 'nqol'],
  ntr: ['Numbeo traffic CO2 per commuter', 'CO2 de tráfico por persona, Numbeo', 'ntr'],
  eq: ['Equaldex Equality Index', 'Índice de Igualdad de Equaldex', 'eq'],
  whr: ['World Happiness Report 2026 rank', 'Ranking del Informe Mundial de la Felicidad 2026', 'whr'],
  wps: ['Women, Peace and Security Index rank', 'Ranking del Índice Mujeres, Paz y Seguridad', 'wps'],
  iloy: ['Unemployment ages 15–24 (ILO, 2024)', 'Desempleo de 15 a 24 años (OIT, 2024)', 'iloy'],
  ilo: ['Unemployment (ILO, 2024)', 'Desempleo (OIT, 2024)', 'ilo'],
  inf: ['Informal jobs, share of all work (ILO)', 'Empleo informal, parte del total (OIT)', 'inf'],
  gdp: ['Metro economy, GDP', 'Economía metropolitana, PIB', 'gdp'],
  gdpnyc: [
    'New York metro economy (commuting range)',
    'Economía metropolitana de Nueva York (a distancia de traslado)',
    'gdp',
  ],
  bea: ['Suffolk County economy, GDP 2024 (BEA)', 'Economía del condado de Suffolk, PIB 2024 (BEA)', 'bea'],
  pop: [
    'Metro population (proxy for things going on)',
    'Población metropolitana (aproximación a lo que pasa)',
    'gdp',
  ],
  popnyc: ['New York metro population (commuting range)', 'Población metropolitana de Nueva York', 'gdp'],
  burden: [
    'Rent ÷ local salary level, NYC = 1.00 (Numbeo rent, cost and purchasing-power indices)',
    'Renta ÷ nivel salarial local, NY = 1.00 (índices de Numbeo)',
    'ncol',
  ],
  nychvs: [
    'NYC Housing and Vacancy Survey 2023, rental vacancy rate',
    'Encuesta de Vivienda y Vacantes de NYC 2023, tasa de vacantes de renta',
    'nychvs',
  ],
  censusmsa: [
    'Census rental vacancy rate, metro area 2024',
    'Tasa de vacantes de renta del Censo, área metropolitana 2024',
    'censusmsa',
  ],
  census: [
    'Census rental vacancy rate, national, Q4 2025',
    'Tasa de vacantes de renta del Censo, nacional, 4.º trim. 2025',
    'census',
  ],
  ei25r: ['Expat Insider 2025, housing (rank)', 'Expat Insider 2025, vivienda (lugar)', 'ei25h'],
  ei25h: [
    'Expat Insider 2025: expats who say finding housing is hard, vs the global average',
    'Expat Insider 2025: expatriados que dicen que es difícil encontrar vivienda, frente al promedio global',
    'ei25h',
  ],
  ei24r: ['Expat Insider 2024, housing (rank)', 'Expat Insider 2024, vivienda (lugar)', 'ei24'],
  ei24e: [
    'Expat Insider 2024: expats who say finding housing is easy, vs the global average',
    'Expat Insider 2024: expatriados que dicen que es fácil encontrar vivienda, frente al promedio global',
    'ei24',
  ],
  eicity24r: ['Expat City Ranking 2024, housing (rank)', 'Expat City Ranking 2024, vivienda (lugar)', 'eic'],
  eicity24h: [
    'Expat City Ranking 2024: expats who say finding housing is hard, vs the global average',
    'Expat City Ranking 2024: expatriados que dicen que es difícil encontrar vivienda, frente al promedio global',
    'eic',
  ],
  ei26r: [
    'Expat Insider 2026, finding housing (rank)',
    'Expat Insider 2026, encontrar vivienda (lugar)',
    'ei26',
  ],
  temp: [
    'Hottest / coldest month, mean °C (1991–2020 normals)',
    'Mes más cálido / más frío, media °C (normales 1991–2020)',
    'temps',
  ],
  tempnear: [
    'Hottest / coldest month, mean °C, nearest station with published normals',
    'Mes más cálido / más frío, media °C, estación cercana con normales publicadas',
    'temps',
  ],
  rpp: [
    'BEA regional price parity 2023 (US = 100; rent level in brackets), converted to Numbeo’s cost-of-living scale',
    'Paridad regional de precios del BEA 2023 (EE. UU. = 100; nivel de alquileres entre paréntesis), convertida a la escala de costo de vida de Numbeo',
    'bearpp',
  ],
  acspay: [
    'Census median earnings and median rent (ACS 2024) and BEA prices, each converted to the Numbeo scale: (net salary − rent) ÷ prices',
    'Ingresos y alquiler medianos del Censo (ACS 2024) y precios del BEA, convertidos a la escala de Numbeo: (salario neto − alquiler) ÷ precios',
    'acs24',
  ],
  acscomm: [
    'Census mean travel time to work (ACS 2024), converted to Numbeo’s one-way minutes',
    'Tiempo medio de viaje al trabajo del Censo (ACS 2024), convertido a los minutos por trayecto de Numbeo',
    'acs24',
  ],
  acsvac: [
    'Census rental vacancy rate (ACS 2024), converted to the Housing Vacancy Survey scale',
    'Tasa de vacancia de alquiler del Censo (ACS 2024), convertida a la escala de la Housing Vacancy Survey',
    'acs24',
  ],
  tempjj: [
    'July / January mean °C (NOAA 1991–2020 normals)',
    'Media de julio / enero, °C (normales NOAA 1991–2020)',
    'noaacr',
  ],
  tempjjnear: [
    'July / January mean °C, nearest station (NOAA 1991–2020 normals)',
    'Media de julio / enero, °C, estación cercana (normales NOAA 1991–2020)',
    'noaacr',
  ],
  tempctt: [
    'Hottest / coldest month, mean °C (1991–2020 averages, Climates to Travel)',
    'Mes más cálido / más frío, media °C (promedios 1991–2020, Climates to Travel)',
    'ctt',
  ],
  pres24: [
    '2024 presidential vote in the state (margin)',
    'Voto presidencial 2024 en el estado (margen)',
    'pres24',
  ],
  cmhc: ['CMHC purpose-built rental vacancy, Oct 2025', 'Vacantes de renta de CMHC, oct. 2025', 'cmhc'],
  lirr: [
    'Train to Manhattan plus ~10 min (LIRR timetable)',
    'Tren a Manhattan más ~10 min (horario del LIRR)',
    'lirr',
  ],
};
const A = (k, t) => `<a href="${SRC[k]}" target="_blank" rel="noopener">${t}</a>`;
const ROWS = {
  en: [
    [
      'Cultural familiarity',
      'A rule on facts, not a measurement: 5 in a country of your passports or home bases, 4 if it shares a main language and a World Bank region with one of them, 3 if it shares either, otherwise 1. Off unless you turn it up. Proxies only: it cannot see discrimination or how you personally fit.',
    ],
    [
      'Healthcare access',
      `${A('uhc', 'WHO UHC Service Coverage Index 2023')} (country) averaged with the ${A('nqol', 'Numbeo Health Care Index 2026')} (city). The WHO index measures which services exist, not who is covered, so where many people have no coverage that is averaged in too: the US (7.9% uninsured all year, Census 2025) and Mexico (39.1% without access to health services, CONEVAL 2022).`,
    ],
    [
      'Safety',
      `${A('hom', 'UNODC homicide rates')} (country) or ${A('fbi', 'FBI 2024 rates')} (US cities), averaged with the ${A('nqol', 'Numbeo Safety Index')} and ${A('gallup', 'Gallup’s Law and Order Index 2025')} (country)`,
    ],
    [
      'Freedom',
      `${A('eiu', 'EIU Democracy Index 2023')} averaged with ${A('fh', 'Freedom House 2026')} where its score is published`,
    ],
    [
      'Money left after rent',
      `Average monthly net salary minus a one-bedroom rent in the centre, divided by local prices (${A('ncol', 'Numbeo cost of living')}, New York = 100%), so every city is in New York dollars. ${A('items', 'Numbeo item prices, April 2026 snapshot')} for 45 cities; elsewhere rebuilt from Numbeo’s salary, rent and price indices, calibrated on those 45 cities (the indices alone run about a third higher). Countries use the average of their cities, or ${A('ncolc', 'Numbeo purchasing power')} where none has rent data. This replaces purchasing power, cost of living and the rent half of housing, which counted rent twice.`,
    ],
    [
      'Climate (mild)',
      `The hottest and coldest months’ mean temperatures (${A('temps', '1991–2020 normals')}), counted twice, averaged with the ${A('nqol', 'Numbeo Climate Index')}, which also reflects humidity. Hot summers lose most: a hottest-month mean above 28.5 °C (Dallas, Tampico) scores lowest. Cities without their own normals use the nearest station that has them, and the page names it. Warm and cool preferences use the annual mean temperature.`,
    ],
    ['Short commutes', `${A('nqol', 'Numbeo Traffic Commute Time Index')}`],
    [
      'Apartments available to rent',
      `How easy it is to find a place: official rental vacancy where published (${A('censusmsa', 'Census by metro')}, ${A('nychvs', 'NYC survey')}, ${A('cmhc', 'CMHC for Canada')}), otherwise how hard expats say it is to find housing (InterNations ${A('eic', 'city')} and country surveys). Availability data is patchy outside the US; where a city has none, its country’s figure is used and marked as national. What rent costs is in money left after rent.`,
    ],
    [
      'Job market',
      `The size of the metro economy (${A('gdp', 'GDP by metro area')}, counted once, since metro size also drives things happening), national ${A('iloy', 'unemployment for ages 15–24')} and the ${A('inf', 'share of informal jobs')}. It measures the general market, not your field. Field-specific numbers are hand estimates, off by default.`,
    ],
    [
      'US politics (optional)',
      `How the state and the county voted in the 2024 presidential election (${A('pres24', 'states')}, ${A('county', 'counties')}), averaged: the state sets most laws, the county is daily life. Scored in the direction you choose in the quiz, or left out. US cities only. It describes how neighbors voted, not how any one person will be treated.`,
    ],
    [
      'Things happening',
      'Metro population, as a stand-in: there is no global count of concerts, venues or events, but bigger metros reliably have more. Cities only.',
    ],
    [
      'Welcoming to newcomers',
      `InterNations Expat Insider ranks for ease of settling in and finding friends (${A('ei', '2025 countries')}, ${A('eisp', '2024 cities')}). The ${A('mai', 'Gallup Migrant Acceptance Index')} is used only where no Expat Insider rank exists.`,
    ],
    [
      'Life satisfaction',
      `${A('whr', 'World Happiness Report 2026')}, all 147 ranked countries. It already partly reflects income, health and freedom, so a second version is offered in the weights panel: what is left after those three (life satisfaction regressed on healthcare, freedom and GDP per person, keeping the remainder).`,
    ],
    [
      'Clean air',
      `Fine particles (PM2.5) measured by ground monitors in the ${A('who', 'WHO Ambient Air Quality Database 2026')}, for the 451 cities it lists, averaged over the latest three years from 2019 on. Countries use the ${A('wbpm', 'World Bank’s population-weighted exposure')} (modelled by IHME, 2023), and cities WHO doesn’t list are filled in from it. The cut-offs are WHO’s interim targets: up to 10 µg/m³ = 5, 15 = 4, 25 = 3, 35 = 2, more = 1 (WHO’s guideline is 5).`,
    ],
    [
      'Honest institutions',
      `${A('cpi', 'Transparency International Corruption Perceptions Index 2025')}, 182 countries, 0–100: 75 and up = 5, 60 = 4, 45 = 3, 30 = 2, lower = 1. It measures how experts and business people perceive public-sector corruption.`,
    ],
    [
      'Time off',
      `Hours actually worked a year per person in work, ${A('pwt', 'Penn World Table 11.0, as published by Our World in Data')} (129 countries, mostly 2023). Up to 1,500 hours = 5, 1,650 = 4, 1,800 = 3, 2,000 = 2, more = 1. Filling in other countries tested too inaccurate, so they have no value.`,
    ],
    [
      'Low disaster risk',
      `${A('wri', 'WorldRiskIndex 2026')} (WorldRiskReport, 193 countries): exposure to earthquakes, tsunamis, floods, cyclones, droughts and sea-level rise, combined with how well society copes. Up to 3 = 5, 6 = 4, 12 = 3, 25 = 2, more = 1. A national figure.`,
    ],
    ['Women’s safety and rights', `${A('wps', 'Women, Peace and Security Index 2025/26')}`],
    ['LGBTQ+ acceptance', `${A('eq', 'Equaldex Equality Index')} (167 countries)`],
    [
      'Work permit, language',
      `Two parts, shown separately on each place: the legal right to work (citizenship or free movement), and the route for a junior hire without it. Rules checked 11 November 2026: the ${A('hpi', 'UK High Potential Individual list')} (Columbia is on the 2026 list, for degrees awarded 1 Nov 2026 to 31 Oct 2027); ${A('bluecard', 'EU Blue Card salary thresholds')} (Netherlands 2026: €4,754 a month for recent graduates); ${A('ibero', 'Spain’s two-year residence route to citizenship for Ibero-American nationals, including Mexicans')} (Civil Code art. 22); ${A('tn', 'USMCA TN professional visas')} for Mexican citizens (US job offer and, for most listed professions, a bachelor’s degree). US citizens abroad still file ${A('irs', 'US taxes')}. Languages: official languages.`,
    ],
    [
      'Winter daylight, trip home',
      'Calculated from latitude and distance. Type your real trip time on any place to replace the estimate.',
    ],
    [
      'Low car dependence',
      `${A('ntr', 'Numbeo Traffic CO2 Emission Index')}, which reflects how much people commute by car versus transit, bike or foot. One measure everywhere: Walk Score and Transit Score exist only for US and Canadian cities, so they are shown on the city page but not scored. No global source for transit frequency or jobs reachable by transit was found.`,
    ],
    [
      'Tech job market (when your field is tech or software)',
      `The general job market averaged with the city’s rank in the ${A('sblink', 'StartupBlink Global Startup Ecosystem Index 2025')}, which ranks 1,000 cities on startups, scale-ups, investment and tech business activity. Top 10 = 5, 11–30 = 4, 31–75 = 3, 76–200 = 2, lower or unranked = 1. A country uses its best-ranked city. It measures the tech ecosystem, not job postings, so treat it as a strong signal, not a count of openings.`,
    ],
    [
      'Jobs in other specific fields',
      'No published global data for finance, healthcare, creative work or research. Those fields use the general job market; hand estimates are available but off unless you turn them on.',
    ],
  ],
  es: [
    [
      'Familiaridad cultural',
      'Una regla basada en hechos, no una medición: 5 en un país de tus pasaportes o de tu casa, 4 si comparte idioma principal y región del Banco Mundial con alguno, 3 si comparte uno de los dos, si no 1. Desactivada salvo que la subas. Solo es una aproximación: no ve la discriminación ni cómo encajas tú.',
    ],
    [
      'Acceso a la salud',
      `${A('uhc', 'Índice de Cobertura de Servicios de la OMS 2023')} (país) promediado con el ${A('nqol', 'Índice de Atención Médica de Numbeo 2026')} (ciudad). El índice de la OMS mide qué servicios existen, no quién está cubierto, así que donde mucha gente no tiene cobertura también se promedia: EE. UU. (7.9% sin seguro todo el año, Censo 2025) y México (39.1% sin acceso a servicios de salud, CONEVAL 2022).`,
    ],
    [
      'Seguridad',
      `${A('hom', 'Tasas de homicidio de la UNODC')} (país) o ${A('fbi', 'tasas del FBI 2024')} (ciudades de EE. UU.), promediadas con el ${A('nqol', 'Índice de Seguridad de Numbeo')} y el ${A('gallup', 'Índice de Ley y Orden de Gallup 2025')} (país)`,
    ],
    [
      'Libertad',
      `${A('eiu', 'Índice de Democracia de la EIU 2023')} promediado con ${A('fh', 'Freedom House 2026')} donde se publica su puntaje`,
    ],
    [
      'Dinero después de la renta',
      `Sueldo neto mensual promedio menos la renta de un departamento de una recámara en el centro, dividido entre los precios locales (${A('ncol', 'costo de vida de Numbeo')}, Nueva York = 100%), así que todas las ciudades quedan en dólares de Nueva York. ${A('items', 'Precios por artículo de Numbeo, corte de abril de 2026')} para 45 ciudades; en las demás se reconstruye con los índices de sueldo, renta y precios de Numbeo, calibrados con esas 45 ciudades (los índices solos dan cifras como un tercio más altas). Los países usan el promedio de sus ciudades, o el ${A('ncolc', 'poder adquisitivo de Numbeo')} si ninguna tiene datos de renta. Esto reemplaza al poder adquisitivo, el costo de vida y la mitad de renta de la vivienda, que contaban la renta dos veces.`,
    ],
    [
      'Clima (templado)',
      `La temperatura media del mes más cálido y del más frío (${A('temps', 'normales 1991–2020')}), con doble peso, promediada con el ${A('nqol', 'Índice de Clima de Numbeo')}, que también refleja la humedad. Los veranos calurosos pierden más: un mes más cálido con media de más de 28.5 °C (Dallas, Tampico) obtiene lo más bajo. Las ciudades sin normales propias usan la estación cercana que las tiene, y la página la nombra. Las preferencias de calor o frío usan la temperatura media anual.`,
    ],
    ['Trayectos cortos', `${A('nqol', 'Índice de Tiempo de Traslado de Numbeo')}`],
    [
      'Departamentos disponibles para rentar',
      `Qué tan fácil es encontrar dónde vivir: vacantes oficiales de renta donde se publican (${A('censusmsa', 'Censo por área metropolitana')}, ${A('nychvs', 'encuesta de NYC')}, ${A('cmhc', 'CMHC para Canadá')}), si no, qué tan difícil dicen los expatriados que es encontrar vivienda (encuestas de InterNations por ${A('eic', 'ciudad')} y país). Fuera de EE. UU. los datos son incompletos; si una ciudad no tiene, se usa la cifra de su país y se marca como nacional. Lo que cuesta la renta está en dinero después de la renta.`,
    ],
    [
      'Mercado laboral',
      `El tamaño de la economía metropolitana (${A('gdp', 'PIB por área metropolitana')}, cuenta una vez, porque el tamaño también define que pasen cosas), el ${A('iloy', 'desempleo nacional de 15 a 24 años')} y la ${A('inf', 'proporción de empleo informal')}. Mide el mercado en general, no tu campo. Las cifras por campo son estimaciones a mano, apagadas por defecto.`,
    ],
    [
      'Política en EE. UU. (opcional)',
      `Cómo votaron el estado y el condado en la elección presidencial de 2024 (${A('pres24', 'estados')}, ${A('county', 'condados')}), promediados: el estado define la mayoría de las leyes, el condado es la vida diaria. Se califica en la dirección que elijas en el cuestionario, o queda fuera. Solo ciudades de EE. UU. Describe cómo votaron los vecinos, no cómo te van a tratar.`,
    ],
    [
      'Que pasen cosas',
      'Población metropolitana, como aproximación: no existe un conteo global de conciertos, recintos o eventos, pero las áreas más grandes tienen más. Solo ciudades.',
    ],
    [
      'Acogedor con recién llegados',
      `Lugares de InterNations Expat Insider en facilidad para adaptarse y hacer amigos (${A('ei', 'países 2025')}, ${A('eisp', 'ciudades 2024')}). El ${A('mai', 'Índice de Aceptación de Migrantes de Gallup')} solo se usa donde no hay lugar de Expat Insider.`,
    ],
    [
      'Satisfacción con la vida',
      `${A('whr', 'Informe Mundial de la Felicidad 2026')}, los 147 países del ranking. Ya refleja en parte el ingreso, la salud y la libertad, así que en el panel de pesos hay una segunda versión: lo que queda después de esos tres (la satisfacción se ajusta por salud, libertad y PIB por persona, y se conserva el resto).`,
    ],
    [
      'Aire limpio',
      `Partículas finas (PM2.5) medidas por monitores en tierra en la ${A('who', 'base de calidad del aire de la OMS 2026')}, para las 451 ciudades que registra, promediadas en los últimos tres años desde 2019. Los países usan la ${A('wbpm', 'exposición ponderada por población del Banco Mundial')} (modelada por el IHME, 2023), y las ciudades que la OMS no registra se estiman a partir de ella. Los cortes son las metas intermedias de la OMS: hasta 10 µg/m³ = 5, 15 = 4, 25 = 3, 35 = 2, más = 1 (la guía de la OMS es 5).`,
    ],
    [
      'Instituciones honestas',
      `${A('cpi', 'Índice de Percepción de la Corrupción 2025 de Transparencia Internacional')}, 182 países, 0–100: 75 o más = 5, 60 = 4, 45 = 3, 30 = 2, menos = 1. Mide cómo perciben la corrupción del sector público expertos y gente de negocios.`,
    ],
    [
      'Tiempo libre',
      `Horas trabajadas de verdad al año por persona con empleo, ${A('pwt', 'Penn World Table 11.0, publicada por Our World in Data')} (129 países, casi todos de 2023). Hasta 1,500 horas = 5, 1,650 = 4, 1,800 = 3, 2,000 = 2, más = 1. Estimar los demás países resultó poco preciso, así que quedan sin valor.`,
    ],
    [
      'Poco riesgo de desastres',
      `${A('wri', 'WorldRiskIndex 2026')} (WorldRiskReport, 193 países): exposición a sismos, tsunamis, inundaciones, ciclones, sequías y subida del mar, combinada con la capacidad de la sociedad para afrontarlos. Hasta 3 = 5, 6 = 4, 12 = 3, 25 = 2, más = 1. Cifra nacional.`,
    ],
    ['Seguridad y derechos de las mujeres', `${A('wps', 'Índice de Mujeres, Paz y Seguridad 2025/26')}`],
    ['Aceptación LGBTQ+', `${A('eq', 'Índice de Igualdad de Equaldex')} (167 países)`],
    [
      'Permiso de trabajo, idioma',
      `Dos partes, que se muestran por separado en cada lugar: el derecho legal a trabajar (ciudadanía o libre circulación) y la vía para alguien recién egresado sin ese derecho. Reglas revisadas el 11 de noviembre de 2026: la ${A('hpi', 'lista High Potential Individual del Reino Unido')} (Columbia está en la lista 2026, para títulos del 1 de nov. de 2026 al 31 de oct. de 2027); los ${A('bluecard', 'umbrales de sueldo de la Tarjeta Azul de la UE')} (Países Bajos 2026: €4,754 al mes para recién egresados); la ${A('ibero', 'vía de dos años de residencia a la nacionalidad española para iberoamericanos, incluidos los mexicanos')} (art. 22 del Código Civil); las ${A('tn', 'visas TN del T-MEC')} para ciudadanos mexicanos (oferta de trabajo en EE. UU. y, en la mayoría de las profesiones, licenciatura). Los ciudadanos estadounidenses en el extranjero siguen declarando ${A('irs', 'impuestos en EE. UU.')}. Idiomas: idiomas oficiales.`,
    ],
    [
      'Luz en invierno, viaje a casa',
      'Calculados con la latitud y la distancia. Escribe tu tiempo real de viaje en cualquier lugar para reemplazar la estimación.',
    ],
    [
      'Poca dependencia del auto',
      `${A('ntr', 'Índice de CO2 de tráfico de Numbeo')}, que refleja cuánto se viaja en auto frente a transporte público, bici o a pie. Una sola medida en todos lados: Walk Score y Transit Score solo existen en EE. UU. y Canadá, así que se muestran en la página de la ciudad pero no cuentan. No se encontró una fuente global de frecuencia del transporte ni de empleos alcanzables en transporte público.`,
    ],
    [
      'Mercado laboral tech (si tu campo es tecnología o software)',
      `El mercado laboral general promediado con el lugar de la ciudad en el ${A('sblink', 'Índice Global de Ecosistemas de Startups de StartupBlink 2025')}, que clasifica 1,000 ciudades por startups, empresas en crecimiento, inversión y actividad tech. Top 10 = 5, 11–30 = 4, 31–75 = 3, 76–200 = 2, más abajo o sin lugar = 1. Un país usa su ciudad mejor clasificada. Mide el ecosistema tech, no vacantes publicadas, así que tómalo como una señal fuerte, no como un conteo de empleos.`,
    ],
    [
      'Empleos en otros campos específicos',
      'No hay datos globales publicados para finanzas, salud, trabajo creativo o investigación. Esos campos usan el mercado laboral general; hay estimaciones a mano, apagadas a menos que las actives.',
    ],
  ],
};
const HOW = {
  en: `<p>Each place gets 1 to 5 on twenty-three factors. Published data, official rules and calculations come first. Where published data is missing, the value is filled in by a tested statistical model and marked "filled in" with its measured error (see the last section). Hand-made estimates are shown greyed out and left out of the score unless you turn them on. Where two reputable sources exist, their scores are averaged so no single survey decides a factor. With scale balancing on, every factor is rescaled to the same average and spread before weighting. Verdicts: Strong fit at 70 and up, Workable at 60, Caution at 48, Poor match below that, plus the dealbreaker rules. A place can only be a Strong fit if housing, the job market, healthcare, safety, freedom and purchasing power all have published figures there, and filled-in values make up less than a fifth of its score. Otherwise it is held at Workable, however high it scores. Within each verdict, places are ordered by the low end of their likely range, so a place with many filled-in values doesn’t outrank an equally scored place that is fully measured. Open any place to see every number behind its score. If you switch gap-filling off, a place with published data for less than 75% of your weighted priorities is marked Not enough data instead.</p>
<h3 style="color:var(--fg)">Where each factor comes from</h3>
<div class="biastable"><table><thead><tr><th>Factor</th><th>Sources</th></tr></thead><tbody>${ROWS.en.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div>
<h3 style="color:var(--fg)">Limits to know</h3>
<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px">
<li>Numbeo indices come from user surveys, so they reflect perceptions. That's why they're averaged with official statistics (WHO, UNODC, FBI) where possible.</li>
<li>No city-level data is published for the Long Island towns or Tampico, so their city figures are filled in from national data. They come out like a typical US or Mexican city, which misses local quirks: East Hampton's beach climate or its total car dependence, for example. Their score ranges are wider for that reason.</li>
<li>National homicide rates hide large city differences; only US cities have city rates here.</li>
<li>The EIU index is from 2023 and the Gallup migrant index from 2016–2017 surveys, which covered only the most and least accepting countries.</li>
<li>Housing availability is the thinnest data here. The US has official vacancy rates by metro; most other places only have expat-survey ranks, often for the country rather than the city. Treat availability outside the US as a rough signal and check listings for any city you’re serious about.</li>
<li>Life satisfaction, women’s rights, LGBTQ+ acceptance, freedom, corruption, working hours and disaster risk are national figures, applied to every city in the country.</li>
<li>Clean air comes from ground monitors where WHO lists the city (451 of them), averaged over the latest three years from 2019 on; WHO’s figures for many US metros stop in 2021–22. Cities WHO doesn’t list are filled in from their country’s modelled exposure.</li>
<li>Working hours are published for 129 countries (mostly 2023) and count part-time workers, so they describe how a country works rather than the hours of a particular job. Filling in the rest tested too inaccurate, so other countries are left without a value.</li>
<li>Disaster risk is a national average: within a large country it varies a lot (a Gulf Coast city faces more than a Midwestern one), and the index doesn’t yet score heat waves or wildfires.</li>
<li>The job market is measured in general, not for your field; national unemployment says little about one city.</li>
<li>Wealth explains a lot: across cities, national GDP per person accounts for about 73% of the variation in Adriano’s scores (tests/wealth_bias.py). Richer places really do score better on most factors, but a ranking this tied to wealth also inherits whatever the sources miss about rich places.</li>
<li>Women’s rights, LGBTQ+ acceptance and politics describe laws and national or county averages. They don’t predict how any one person will be treated, and they miss differences between neighborhoods, workplaces and families.</li>
<li>Humidity, snowfall and future warming aren’t scored: no consistent source covering every city was found.</li>
<li>Race and ethnicity, religion, disability, and family needs like schools aren't scored.</li></ul>`,
  es: `<p>Cada lugar recibe de 1 a 5 en veintitrés factores. Primero cuentan los datos publicados, las reglas oficiales y los cálculos. Donde faltan datos publicados, el valor se estima con un modelo estadístico probado y se marca como «estimado» con su error medido (ver la última sección). Las estimaciones hechas a mano se muestran en gris y quedan fuera del puntaje a menos que las actives. Donde existen dos fuentes confiables, se promedian para que ninguna encuesta decida sola un factor. Con el equilibrio de escalas activado, cada factor se reescala al mismo promedio y dispersión antes de ponderar. Veredictos: Muy buena opción desde 70, Viable desde 60, Con reservas desde 48, Poca coincidencia por debajo, más las reglas de descarte. Un lugar solo puede ser Muy buena opción si la vivienda, el mercado laboral, la salud, la seguridad, la libertad y el poder adquisitivo tienen cifras publicadas ahí, y los valores estimados son menos de una quinta parte de su puntaje. Si no, se queda en Viable aunque su puntaje sea alto. Dentro de cada veredicto, los lugares se ordenan por el extremo bajo de su rango probable, así que un lugar con muchos valores estimados no supera a otro con el mismo puntaje y todo medido. Abre cualquier lugar para ver cada número detrás de su puntaje. Si desactivas el llenado de huecos, un lugar con datos publicados para menos del 75% de tus prioridades ponderadas se marca como Datos insuficientes.</p>
<h3 style="color:var(--fg)">De dónde viene cada factor</h3>
<div class="biastable"><table><thead><tr><th>Factor</th><th>Fuentes</th></tr></thead><tbody>${ROWS.es.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div>
<h3 style="color:var(--fg)">Límites que conviene saber</h3>
<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px">
<li>Los índices de Numbeo vienen de encuestas a usuarios, así que reflejan percepciones. Por eso se promedian con estadísticas oficiales (OMS, UNODC, FBI) cuando es posible.</li>
<li>No hay datos publicados a nivel de ciudad para los pueblos de Long Island ni para Tampico, así que sus cifras se estiman con datos nacionales. Salen como una ciudad típica de EE. UU. o México, lo que no capta particularidades locales, como el clima de playa de East Hampton o su total dependencia del auto. Por eso sus rangos de puntaje son más amplios.</li>
<li>Las tasas nacionales de homicidio esconden grandes diferencias entre ciudades; solo las ciudades de EE. UU. tienen tasas propias aquí.</li>
<li>El índice de la EIU es de 2023 y el índice de migrantes de Gallup de encuestas de 2016–2017, que solo cubrieron los países más y menos receptivos.</li>
<li>La disponibilidad de vivienda es el dato más débil aquí. EE. UU. tiene tasas oficiales de vacantes por área metropolitana; la mayoría de los demás lugares solo tienen lugares en encuestas de expatriados, a menudo del país y no de la ciudad. Tómalo como una señal aproximada y revisa anuncios en cualquier ciudad que te interese en serio.</li>
<li>La satisfacción con la vida, los derechos de las mujeres, la aceptación LGBTQ+, la libertad, la corrupción, las horas de trabajo y el riesgo de desastres son cifras nacionales, aplicadas a todas las ciudades del país.</li>
<li>El aire limpio viene de monitores en tierra donde la OMS registra la ciudad (451), promediado en los últimos tres años desde 2019; para muchas áreas metropolitanas de EE. UU. los datos de la OMS terminan en 2021–22. Las ciudades que la OMS no registra se estiman a partir de la exposición modelada de su país.</li>
<li>Las horas de trabajo están publicadas para 129 países (casi todos de 2023) e incluyen a quienes trabajan a tiempo parcial, así que describen cómo trabaja un país, no las horas de un empleo en particular. Estimar el resto resultó poco preciso, así que los demás países quedan sin valor.</li>
<li>El riesgo de desastres es un promedio nacional: dentro de un país grande varía mucho (una ciudad en la costa del Golfo enfrenta más que una del Medio Oeste), y el índice aún no mide olas de calor ni incendios forestales.</li>
<li>El mercado laboral se mide en general, no para tu campo; el desempleo nacional dice poco de una ciudad.</li>
<li>La riqueza explica mucho: entre ciudades, el PIB por persona del país explica cerca del 73% de la variación de los puntajes de Adriano (tests/wealth_bias.py). Los lugares ricos sí califican mejor en la mayoría de los factores, pero un ranking tan ligado a la riqueza también hereda lo que las fuentes no ven de los lugares ricos.</li>
<li>Los derechos de las mujeres, la aceptación LGBTQ+ y la política describen leyes y promedios nacionales o del condado. No predicen cómo van a tratar a una persona en particular, y no captan diferencias entre colonias, trabajos y familias.</li>
<li>No se califican la humedad, la nieve ni el calentamiento futuro: no se encontró una fuente consistente para todas las ciudades.</li>
<li>No se califican la raza y el origen étnico, la religión, la discapacidad ni necesidades familiares como escuelas.</li></ul>`,
};

// Interface languages. English and Spanish are built in (and Spanish has the place notes and methods); the others load
// from js/i18n/<code>.js when chosen, and fall back to English for anything not translated (methods, place notes).
const UI_LANGS = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  hi: 'हिन्दी',
  ar: 'العربية',
};
const RTL = new Set(['ar']);
function I18N(o) {
  for (const k in o.STR)
    if (typeof o.STR[k] === 'string')
      o.STR[k] = o.STR[k].replace('' + DATA.cities.length + '', DATA.cities.length);
  STR[o.code] = o.STR;
  FSTR[o.code] = o.FSTR;
  QSTR[o.code] = o.QSTR;
}
const guessLang = () => {
  for (const t of navigator.languages || [navigator.language || 'en']) {
    const k = (t || '').toLowerCase().slice(0, 2);
    if (UI_LANGS[k]) return k;
  }
  return 'en';
};
let LANG = store.get('lang', guessLang());
if (!UI_LANGS[LANG]) LANG = 'en';
let WANT_LANG = LANG;
if (!STR[LANG]) LANG = 'en'; // a not-yet-loaded language is switched to once the page is up
const L = k => {
  const t = STR[LANG],
    v = t && t[k];
  return v === undefined ? STR.en[k] : v;
};
const BASE_LANG = () => (LANG === 'es' ? 'es' : 'en'); // content written only in English and Spanish (methods, notes)
function loadLang(k, done) {
  if (STR[k]) {
    done();
    return;
  }
  const s = document.createElement('script');
  s.src = 'js/i18n/' + k + '.js';
  s.onload = done;
  s.onerror = done;
  document.head.appendChild(s);
}
function setLang(k) {
  loadLang(k, () => {
    LANG = STR[k] ? k : 'en';
    store.set('lang', LANG);
    applyLang();
  });
}
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => o[k]);
