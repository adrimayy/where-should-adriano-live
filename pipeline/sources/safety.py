"""Safety: UNODC national homicide rates and FBI 2024 city rates (per 100,000 people).
Every number is copied from the source named in its comment."""

# ---------- homicide: UNODC country rates, FBI 2024 city rates ----------
RATES = {840:5.8,484:24.9,170:24.9,76:20.6,710:43.7,152:6.3,32:4.5,858:11.2,188:17.7,591:12.5,404:4.9,566:15.7,124:2.0,826:1.1,724:0.7,392:0.2,
         376:1.6,608:4.3,218:45.7,604:8.6,388:49.3,340:31.4,222:7.9,320:23.4,214:10.9,643:7.8,356:2.8,792:3.2}

FBI = {'New York City':3.92,'San Francisco':4.36,'Seattle':6.84,'Boston':3.64,'Washington DC':25.49,'Chicago':17.47,'Pittsburgh':11.35,'Denver':9.83,
       'Los Angeles':6.95,'San Diego':2.52,'Austin':6.60,'Atlanta':26.38,'Raleigh':5.12,'Houston':13.80,'Miami':6.08,'Phoenix':8.36,'Philadelphia':16.91,
       'Minneapolis':17.95,'Portland':10.75,'Dallas':13.62,'Nashville':14.59,'Salt Lake City':5.17,'Baltimore':34.77,'Sacramento':8.54,'Charlotte':10.87,'Buffalo':12.42,'Rochester':13.10,'Syracuse':15.15}

# ---------- Gallup Global Safety Report 2025: Law and Order Index, 0-100 (2024 survey data; how safe people feel walking alone at night,
# confidence in local police, and theft and assault experienced). Country level; a second, non-Numbeo, non-homicide view of safety.
# https://www.gallup.com/analytics/356996/gallup-global-safety-report.aspx (fetched 11 Nov 2026) ----------
GALLUP_T = """Liberia 49; Sierra Leone 55; Chad 58; Congo 60; Uganda 60; DR Congo 61; Peru 61; South Africa 61; Botswana 62; Cameroon 62;
Ecuador 62; Kenya 62; Nigeria 62; Bolivia 63; Gabon 63; Zambia 64; Gambia 65; Malawi 65; Eswatini 66; Myanmar 66; Trinidad and Tobago 66;
Lesotho 67; Chile 68; Madagascar 68; Mauritania 68; Mexico 68; Zimbabwe 68; Argentina 69; Dominican Republic 69; Mozambique 69; Togo 69;
Colombia 70; Guinea 71; Honduras 71; Venezuela 71; Ghana 72; Mongolia 72; Namibia 72; Greece 73; Niger 73; Paraguay 73; Palestine 73;
Benin 74; Brazil 74; Guatemala 74; Tunisia 74; Ukraine 74; Lebanon 75; Mali 75; Uruguay 75; Belize 76; Costa Rica 76; Nicaragua 76;
Pakistan 76; Senegal 76; Ivory Coast 77; Cyprus 77; Ethiopia 77; Bangladesh 78; Bosnia and Herzegovina 78; Morocco 78; Panama 78;
Russia 79; Rwanda 79; Turkey 79; Australia 80; Libya 80; Moldova 80; Nepal 80; New Zealand 80; Bulgaria 81; Burkina Faso 81; Laos 81;
Mauritius 81; North Macedonia 81; Romania 81; Sri Lanka 81; Tanzania 81; Thailand 81; Canada 82; Israel 82; Italy 82; Kazakhstan 82;
Latvia 82; Cambodia 83; Hungary 83; Malaysia 83; Malta 83; Poland 83; Armenia 84; India 84; Iran 84; Philippines 84; Serbia 84;
Slovakia 84; United Kingdom 84; United States 84; Albania 85; Croatia 85; France 85; Jordan 85; Kyrgyzstan 85; Belgium 86; Japan 86;
Lithuania 86; South Korea 86; Spain 86; Azerbaijan 87; Czech Republic 87; Egypt 87; Iraq 87; Ireland 87; Netherlands 87; Slovenia 87;
Algeria 88; Estonia 88; Georgia 88; Germany 88; Kuwait 88; Portugal 88; Sweden 88; United Arab Emirates 88; Indonesia 89; Taiwan 89;
Denmark 90; El Salvador 90; Finland 90; Montenegro 90; Austria 91; Oman 91; Saudi Arabia 91; Switzerland 91; Uzbekistan 91; Norway 92;
China 93; Iceland 93; Vietnam 93; Kosovo 94; Singapore 95; Tajikistan 97"""
GALLUP = {k.strip(): float(v) for k, v in (p.strip().rsplit(' ', 1) for p in GALLUP_T.replace('\n', ' ').split(';'))}
GALLUP_CITY = {'Hong Kong': 89.0}   # reported separately from China
