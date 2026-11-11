/* ---------------- language and passport ---------------- */
let LANGMODE='both',PERMMODE='usmx',FIELD='tech',CLIMMODE='mild',POLMODE='d';
const POLM=DATA.pol||{},TMEAN=DATA.tmean||{},THOT=DATA.thot||{};
// US state politics: band from the 2024 margin, in the direction the user prefers ('d' or 'r'); places outside the US have no value
function polBand(x){return x>=20?5:x>=8?4:x>=-3?3:x>=-12?2:1;}
// the state sets most laws, the county is daily life: the two 2024 results count equally
function polFor(e){const m=e.type==='city'?POLM[e.name]:null;if(m==null)return null;const sg=POLMODE==='r'?-1:1,c=POLC[e.name],a=polBand(sg*m);return c==null?a:(a+polBand(sg*c))/2;}
const FIELD_IDX={finance:0,health:1,creative:2,academia:3};
const HIGHLAND=new Set(['city:Mexico City','city:Bogotá','city:Medellín','city:Nairobi','city:Kigali','city:San José (Costa Rica)','city:Guadalajara','city:Querétaro','city:Quito','city:Puebla','country:484','country:170','country:404','country:646','country:188','country:68','country:218']);
function warmth(e){const tm=e.type==='city'?TMEAN[e.name]:null;if(tm!=null)return tm>=24?5:tm>=19?4:tm>=14?3:tm>=9?2:1;if(HIGHLAND.has(e.key))return 3;const a=Math.abs(e.lat0);return a<20?5:a<30?4:a<40?3:a<50?2:1;}
function climFor(e,m){if(e.base.clim==null)return null;if(m==='mild'||!e.hasGeo)return e.base.clim;const w=warmth(e);return m==='warm'?[0,1,2,4,5,5][w]:[0,3,5,4,2,1][w];}
function jobsFor(e,f){return e.base.jobs;}
function fieldJobs(e){const i=FIELD_IDX[FIELD];if(i==null||!e.fields)return null;const v=+e.fields[i];return v>0?v:null;}
function payFor(e,f){if(f==='remote')return e.cost||e.base.pay;return e.base.pay;}
const EU=new Set([40,56,100,191,196,203,208,233,246,250,276,300,348,372,380,428,440,442,528,616,620,642,703,705,724,752]);
const PERM_EU={756:4,578:4,352:4,826:3,840:2,124:3,36:3,554:3,484:3};
const ES_COUNTRIES=new Set([724,484,320,340,222,558,188,591,192,214,630,170,862,218,604,68,600,858,32,152,226]);
const EN_IN_ES={724:3,32:3,188:3,591:3,630:5};
const EN_CITY={'Madrid':3,'Barcelona':3,'Mexico City':3,'Buenos Aires':3,'Santiago':3,'San José (Costa Rica)':3,'Panama City':3,'Tampico':1};
const ES_US_CITY={'Miami':5,'Houston':4,'Los Angeles':4,'New York City':4,'San Diego':4,'Phoenix':3,'Chicago':3,'Austin':3};
const ES_NEAR={620:2,76:2,380:2};
const PERM_US={484:3,724:2,36:4,554:4,372:3,124:4,826:4};
const PERM_MX={840:2,36:2,372:2,554:3,124:4,826:4,484:5,724:3};
const isoOf=e=>e.type==='city'?e.iso:e.id;
function engScore(e){const n=isoOf(e);if(ES_COUNTRIES.has(n))return (e.type==='city'&&EN_CITY[e.name])||EN_IN_ES[n]||2;return e.base.lang;}
function spaScore(e){const n=isoOf(e);if(ES_COUNTRIES.has(n))return n===226?4:5;if(n===840)return e.type==='city'?(ES_US_CITY[e.name]||2):3;return ES_NEAR[n]||1;}
function okayEng(s){return s>=5?4:s>=4?3:Math.max(1,s-1);}
function langFor(e,m){if(e.base.lang==null)return null;switch(m){case 'en':return engScore(e);case 'enok':return okayEng(engScore(e));case 'es':return spaScore(e);case 'esen':return Math.max(spaScore(e),okayEng(engScore(e)));default:return e.base.lang;}}
function permFor(e,m){const b=e.base.perm;if(b==null)return null;const n=isoOf(e);if(m==='us')return PERM_US[n]??b;if(m==='mx')return PERM_MX[n]??b;if(m==='eu')return EU.has(n)?5:(PERM_EU[n]??2);return b;}

