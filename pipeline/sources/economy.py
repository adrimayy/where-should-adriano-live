"""Helper variables for gap-filling and the wealth-bias check: GDP per person, population, world region.
They are not scored; they only help predict missing values and test whether gaps follow a pattern.
Every number is copied from the source named in its comment."""

# ---------- GDP per person, PPP, current international $ (World Bank column of Wikipedia "List of countries by GDP (PPP) per capita",
# fetched Nov 2026 via wikiwand; latest year per country, mostly 2024; (IMF) marks the few with only an IMF figure) ----------
GDPPC_T = """Luxembourg|143342;Singapore|141500;Macau|113183;Ireland|127623;Qatar|121125;Norway|104460;Switzerland|92980;Brunei|86446;
United States|81695;Denmark|76688;Netherlands|78215;San Marino|65718;Taiwan|79031;Iceland|77567;Guyana|55263;United Arab Emirates|83903;
Hong Kong|71482;Belgium|70456;Austria|73751;Malta|62446;Sweden|70207;Germany|69338;Australia|69115;Andorra|71588;France|61157;Bahrain|63848;
Finland|65061;Saudi Arabia|54992;South Korea|54033;Canada|61582;United Kingdom|58906;Italy|58755;Cyprus|57101;Czech Republic|53817;
Slovenia|54948;Spain|52779;Israel|53434;Lithuania|51877;Japan|50207;New Zealand|54110;Poland|49464;Kuwait|56386;Puerto Rico|47700;
Portugal|48759;Croatia|45910;Estonia|48992;Russia|44104;Romania|47903;Hungary|45942;Slovakia|44650;Latvia|42501;Greece|41187;Oman|44421;
Kazakhstan|39333;Panama|39695;Seychelles|32694;Malaysia|37248;Turkey|44151;Bulgaria|38690;Bahamas|35555;Trinidad and Tobago|31572;
Uruguay|34062;Maldives|24809;Chile|33285;Belarus|30752;Mauritius|29499;Montenegro|31216;Costa Rica|27953;Serbia|27402;
Dominican Republic|25611;Argentina|29363;Georgia|24681;North Macedonia|24873;Turkmenistan|17100;China|24558;Thailand|23423;Mexico|25602;
Azerbaijan|23686;Gabon|21947;Armenia|23055;Brazil|20584;Equatorial Guinea|18724;Bosnia and Herzegovina|22846;Colombia|21548;Suriname|21047;
Albania|21395;Egypt|18817;Botswana|19383;Iran|17922;Ukraine|18008;Mongolia|18108;Moldova|17384;Peru|16717;Algeria|17027;Kosovo|15029;
Bhutan|15022;Paraguay|17466;Indonesia|15613;Ecuador|15870;Vietnam|15194;Fiji|15047;South Africa|15847;Libya|19641;Belize|14195;
Guatemala|14067;Iraq|13969;Tunisia|13682;Sri Lanka|14455;El Salvador|12542;Eswatini|11741;Jamaica|11475;Philippines|10756;Lebanon|12853;
Namibia|12757;Uzbekistan|9725;Bolivia|10727;India|10176;Jordan|10452;Morocco|9743;Bangladesh|9066;Laos|9326;Nicaragua|8044;Djibouti|7204;
Venezuela|17402;Mauritania|6934;Cambodia|5624;Ghana|7466;Angola|8041;Kyrgyzstan|7103;Ivory Coast|7791;Honduras|7211;Kenya|6324;
Pakistan|6212;Nigeria|6318;Congo|6933;Syria|2914;Palestine|5888;Cameroon|5380;Tajikistan|5082;Nepal|5182;Myanmar|5905;Zimbabwe|3900;
Senegal|4833;East Timor|5109;Benin|4248;Guinea|4429;Zambia|4126;Tanzania|3972;Ethiopia|3109;Rwanda|3361;Uganda|3098;
Papua New Guinea|4607;Sierra Leone|1847;Gambia|3163;Togo|3155;Lesotho|2794;Guinea-Bissau|2630;Haiti|3256;Vanuatu|3315;Burkina Faso|2727;
Mali|2726;Chad|1969;Solomon Islands|3035;Sudan|3137;Afghanistan|2093;Yemen|3437;Madagascar|1875;Niger|1817;Liberia|1819;Somalia|1611;
DR Congo|1671;Eritrea|1629;Mozambique|1657;Malawi|1868;Central African Republic|1130;Burundi|951;South Sudan|1146"""
GDPPC_NOTE = {'Taiwan': 'IMF'}

# ---------- population (Wikipedia "List of countries and dependencies by population (United Nations)", UN World Population Prospects, fetched Nov 2026) ----------
POPN_T = """India|1438069596;China|1422584933;United States|343477335;Indonesia|281190067;Pakistan|247504495;Nigeria|227882945;Brazil|211140729;
Bangladesh|171466990;Russia|145440500;Mexico|129739759;Ethiopia|128691692;Japan|124370947;Philippines|114891199;Egypt|114535772;DR Congo|105789731;
Vietnam|100352192;Iran|90608707;Turkey|87270501;Germany|84548231;Thailand|71702435;United Kingdom|68682962;Tanzania|66617606;France|66438822;
South Africa|63212384;Italy|59499453;Kenya|55339003;Myanmar|54133798;Colombia|52321152;South Korea|51748739;Sudan|50042791;Uganda|48656601;
Spain|47911579;Algeria|46164219;Argentina|45538401;Iraq|45074049;Afghanistan|41454761;Yemen|39390799;Canada|39299105;Poland|38762844;
Ukraine|37732836;Morocco|37712505;Angola|36749906;Uzbekistan|35652307;Malaysia|35126298;Peru|33845617;Ghana|33787914;Mozambique|33635160;
Saudi Arabia|32264292;Madagascar|31195932;Ivory Coast|31165654;Nepal|29964614;Cameroon|28372687;Venezuela|28300854;Australia|26451124;
North Korea|26418204;Niger|26159867;Mali|23769127;Syria|23594623;Taiwan|23317145;Burkina Faso|23025776;Sri Lanka|22971617;Malawi|21104482;
Zambia|20723965;Kazakhstan|20330104;Chile|19658835;Chad|19319064;Romania|19118479;Somalia|18358615;Guatemala|18124838;Senegal|18077573;
Netherlands|18092524;Ecuador|17980083;Cambodia|17423880;Zimbabwe|16340822;Guinea|14405465;Benin|14111034;Rwanda|13954471;Burundi|13689450;
Bolivia|12244159;Tunisia|12200431;Belgium|11712893;Haiti|11637398;South Sudan|11483374;Jordan|11439213;Dominican Republic|11331265;
Cuba|11019931;Czechia|10809716;Honduras|10644851;United Arab Emirates|10642081;Sweden|10551494;Portugal|10430738;Tajikistan|10389799;
Papua New Guinea|10389635;Azerbaijan|10318207;Greece|10242908;Hungary|9686463;Togo|9304337;Israel|9256314;Austria|9130429;Belarus|9115680;
Switzerland|8870561;Sierra Leone|8460512;Laos|7664993;Hong Kong|7442734;Turkmenistan|7364438;Libya|7305659;Kyrgyzstan|7073516;
Paraguay|6844146;Nicaragua|6823613;Bulgaria|6795803;Serbia|6773201;El Salvador|6309624;Congo|6182885;Denmark|5948136;Singapore|5789090;
Lebanon|5733493;Finland|5601185;Norway|5519167;Slovakia|5518055;Liberia|5493031;Palestine|5409202;Ireland|5196630;New Zealand|5172836;
Central African Republic|5152421;Costa Rica|5105525;Oman|5049269;Mauritania|5022441;Kuwait|4838782;Panama|4458759;Croatia|3896023;
Georgia|3807492;Eritrea|3470390;Mongolia|3431932;Uruguay|3388081;Puerto Rico|3242023;Bosnia and Herzegovina|3185073;Moldova|3067070;
Qatar|2979082;Namibia|2963095;Armenia|2943393;Lithuania|2854099;Jamaica|2839786;Albania|2811655;Gambia|2697845;Gabon|2484789;
Botswana|2480244;Lesotho|2311472;Guinea-Bissau|2153339;Slovenia|2118396;Latvia|1882396;Equatorial Guinea|1847549;North Macedonia|1831802;
Kosovo|1700031;Bahrain|1569666;Trinidad and Tobago|1502932;Timor-Leste|1384286;Estonia|1367196;Cyprus|1344976;Mauritius|1273588;
Eswatini|1230506;Djibouti|1152944;Fiji|924145;Guyana|826353;Solomon Islands|800005;Bhutan|786385;Luxembourg|665098;Montenegro|633552;
Suriname|628886;Western Sahara|579729;Malta|532956;Belize|411106;Bahamas|399440;Iceland|387558;Vanuatu|320409;New Caledonia|289870;
Greenland|55922;Falkland Islands|3477"""

# ---------- world region, by two-letter country code (World Bank regions, North America split from Latin America) ----------
REGION_T = {
 'Europe': 'AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LT LU LV MD ME MK NL NO PL PT RO RS RU SE SI SK UA XK',
 'Central Asia & Caucasus': 'AM AZ GE KG KZ TJ TM TR UZ',
 'North America': 'US CA GL',
 'Latin America & Caribbean': 'AR BO BR BS BZ CL CO CR CU DO EC FK GT GY HN HT JM MX NI PA PE PR PY SR SV TT UY VE',
 'Middle East & North Africa': 'AE BH DJ DZ EG EH IL IQ IR JO KW LB LY MA OM PS QA SA SY TN YE',
 'Sub-Saharan Africa': 'AO BF BI BJ BW CD CF CG CI CM ER ET GA GH GM GN GQ GW KE LR LS MG ML MR MW MZ NA NE NG RW SD SL SN SO SS SZ TD TG TZ UG ZA ZM ZW',
 'South Asia': 'AF BD BT IN LK NP PK',
 'East Asia & Pacific': 'AU BN CN FJ ID JP KH KP KR LA MM MN MY NC NZ PG PH SB SG TH TL TW VN VU',
}
REGION = {a2: r for r, codes in REGION_T.items() for a2 in codes.split()}
