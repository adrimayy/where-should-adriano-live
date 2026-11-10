import sys
S = sys.argv[1]
t = open(f'{S}/v4.html', encoding='utf8').read()
def rep(o, n, cnt=1):
    global t
    assert t.count(o) >= 1, 'MISSING: ' + o[:90]
    t = t.replace(o, n, cnt)

# ---- factors ----
rep("{k:'free',i:3},{k:'safe',i:4},", "{k:'free',i:3},{k:'safe',i:4},{k:'women',i:12},{k:'lgbt',i:13},")
rep("jobs:['Tech jobs','Few tech jobs']", "jobs:['Jobs in your field','Few jobs in your field']")
rep("clim:['Climate fit','Heat, humidity, or harsh cold']", "clim:['Climate for you','Weather you won\\u2019t like']")
rep("safe:['Safety','High crime or conflict'],", "safe:['Safety','High crime or conflict'],women:['Safety and rights for women','Weaker safety and rights for women'],lgbt:['LGBTQ+ acceptance','Less LGBTQ+ acceptance'],")
rep("jobs:['Empleos tech','Pocos empleos tech']", "jobs:['Empleos en tu campo','Pocos empleos en tu campo']")
rep("clim:['Clima','Calor, humedad o frío intenso']", "clim:['Clima para ti','Un clima que no te va']")
rep("safe:['Seguridad','Delincuencia alta o conflicto'],", "safe:['Seguridad','Delincuencia alta o conflicto'],women:['Seguridad y derechos de las mujeres','Menos seguridad y derechos para las mujeres'],lgbt:['Aceptación LGBTQ+','Menos aceptación LGBTQ+'],")
rep("lang:0.75,fam:1.5},\n career:{", "lang:0.75,fam:1.5,women:0,lgbt:0},\n career:{")
rep("lang:1,fam:0.5},\n balance:{", "lang:1,fam:0.5,women:0.5,lgbt:0.5},\n balance:{")
rep("perm:1,lang:1,fam:1},\n equal:", "perm:1,lang:1,fam:1,women:1,lgbt:1},\n equal:")

# ---- personal modes: field, climate, passport ----
rep("let LANGMODE='both',PERMMODE='usmx';", """let LANGMODE='both',PERMMODE='usmx',FIELD='tech',CLIMMODE='mild';
const FIELD_IDX={finance:0,health:1,creative:2,academia:3};
const HIGHLAND=new Set(['city:Mexico City','city:Bogotá','city:Medellín','city:Nairobi','city:Kigali','city:San José (Costa Rica)','city:Guadalajara','city:Querétaro','country:484','country:170','country:404','country:646','country:188','country:68','country:218']);
function warmth(e){if(HIGHLAND.has(e.key))return 3;const a=Math.abs(e.lat0);return a<20?5:a<30?4:a<40?3:a<50?2:1;}
function climFor(e,m){if(e.base.clim==null)return null;if(m==='mild'||!e.hasGeo)return e.base.clim;const w=warmth(e);return m==='warm'?[0,1,2,4,5,5][w]:[0,3,5,4,2,1][w];}
function jobsFor(e,f){const b=e.base.jobs;if(b==null)return null;const i=FIELD_IDX[f];if(i!=null&&e.fields){const v=+e.fields[i];if(v>0)return v;}return b;}
function payFor(e,f){if(f==='remote')return e.cost||e.base.pay;return e.base.pay;}
const EU=new Set([40,56,100,191,196,203,208,233,246,250,276,300,348,372,380,428,440,442,528,616,620,642,703,705,724,752]);
const PERM_EU={756:4,578:4,352:4,826:3,840:2,124:3,36:3,554:3,484:3};""")
rep("function permFor(e,m){const b=e.base.perm;if(b==null)return null;const n=isoOf(e);if(m==='us')return PERM_US[n]??b;if(m==='mx')return PERM_MX[n]??b;return b;}",
    "function permFor(e,m){const b=e.base.perm;if(b==null)return null;const n=isoOf(e);if(m==='us')return PERM_US[n]??b;if(m==='mx')return PERM_MX[n]??b;if(m==='eu')return EU.has(n)?5:(PERM_EU[n]??2);return b;}")
rep("function applyPersonal(){ents.forEach(e=>{if(!e.base)e.base={lang:e.sc.lang,perm:e.sc.perm};e.sc.lang=langFor(e,LANGMODE);e.sc.perm=permFor(e,PERMMODE);});}",
    "function applyPersonal(){ents.forEach(e=>{if(!e.base)e.base={lang:e.sc.lang,perm:e.sc.perm,jobs:e.sc.jobs,clim:e.sc.clim,pay:e.sc.pay};e.sc.lang=langFor(e,LANGMODE);e.sc.perm=permFor(e,PERMMODE);e.sc.jobs=jobsFor(e,FIELD);e.sc.clim=climFor(e,CLIMMODE);e.sc.pay=payFor(e,FIELD);});}")
rep("ents.forEach(e=>{e.base={lang:e.sc.lang,perm:e.sc.perm};});", "ents.forEach(e=>{e.base={lang:e.sc.lang,perm:e.sc.perm,jobs:e.sc.jobs,clim:e.sc.clim,pay:e.sc.pay};});")
rep("e.base={lang:e.sc.lang,perm:e.sc.perm};ents.push(e);return e;}", "e.base={lang:e.sc.lang,perm:e.sc.perm,jobs:e.sc.jobs,clim:e.sc.clim,pay:e.sc.pay};e.cost=4;ents.push(e);return e;}")
rep("sc:factorsOf('222322220222')", "sc:factorsOf('222322220222024')")
# entities: cost digit and field digits
rep("const e={type:'country',id:+id,key:'country:'+(+id),name,a2,sc:factorsOf(s),", "const e={type:'country',id:+id,key:'country:'+(+id),name,a2,cost:+s[14]||null,sc:factorsOf(s),")
rep("const e={type:'country',id:k,key:'country:'+k,name,a2,sc:factorsOf(s),", "const e={type:'country',id:k,key:'country:'+k,name,a2,cost:+s[14]||null,sc:factorsOf(s),")
rep("DATA.cities.map(([name,lat,lon,iso,s,note,src,noteEs,nameEs])=>({type:'city',key:'city:'+name,name,nameEs,lat,lon,iso:+iso,sc:factorsOf(s),",
    "DATA.cities.map(([name,lat,lon,iso,s,note,src,noteEs,nameEs,fields])=>({type:'city',key:'city:'+name,name,nameEs,fields,cost:+s[14]||null,lat,lon,iso:+iso,sc:factorsOf(s),")
# snapshot + take
rep("const save={W,HOMES,LANGMODE,PERMMODE,gate,gateOpen,norm,gateFar};", "const save={W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar};")
rep("LANGMODE='both';PERMMODE='usmx';gate=gateOpen=norm=gateFar=true;\n  applyHomes();recompute();ents.forEach", "LANGMODE='both';PERMMODE='usmx';FIELD='tech';CLIMMODE='mild';gate=gateOpen=norm=gateFar=true;\n  applyHomes();recompute();ents.forEach")
rep("({W,HOMES,LANGMODE,PERMMODE,gate,gateOpen,norm,gateFar}=save);", "({W,HOMES,LANGMODE,PERMMODE,FIELD,CLIMMODE,gate,gateOpen,norm,gateFar}=save);")
rep("lm:LANGMODE,pm:PERMMODE,", "lm:LANGMODE,pm:PERMMODE,fd:FIELD,cm:CLIMMODE,")
rep("LANGMODE=o.lm||'en';PERMMODE=o.pm||'us';", "LANGMODE=o.lm||'en';PERMMODE=o.pm||'us';FIELD=o.fd||'general';CLIMMODE=o.cm||'mild';")
rep("LANGMODE='both';PERMMODE='usmx';gate=gateOpen=norm=gateFar=true;applyHomes();weightsUI();refreshAll();showMap();};",
    "LANGMODE='both';PERMMODE='usmx';FIELD='tech';CLIMMODE='mild';gate=gateOpen=norm=gateFar=true;applyHomes();weightsUI();refreshAll();showMap();};")
rep("function becomeYours(){if(MODE==='yours')return;MODE='yours';LANGMODE='both';PERMMODE='usmx';syncMode();}",
    "function becomeYours(){if(MODE==='yours')return;MODE='yours';LANGMODE='both';PERMMODE='usmx';FIELD='tech';CLIMMODE='mild';syncMode();}")

# ---- quiz ----
a = t.index("const QUIZ=["); b = t.index("let ANS={}")
t = t[:a] + """const QUIZ=[
 {id:'move',w:[{move:0.75},{move:1.5},{move:2.5}]},
 {id:'hlth',w:[{hlth:1},{hlth:2},{hlth:3}]},
 {id:'career',w:[{jobs:2.5,pay:2},{jobs:1.25,pay:1.25},{jobs:0.5,pay:1}]},
 {id:'field',w:[{},{},{},{},{},{},{jobs:0}],mk:'field',m:['tech','finance','health','creative','academia','general','remote']},
 {id:'clim',w:[{clim:1.5,day:1},{clim:1.5,day:0.75},{clim:1.25,day:0.5},{clim:0.75,day:2},{clim:0.25,day:0.25}],mk:'clim',m:['mild','warm','cool','mild','mild']},
 {id:'open',w:[{open:0.5},{open:1.5},{open:2.5}]},
 {id:'cult',w:[{cult:0.5},{cult:1.25},{cult:2}]},
 {id:'fam',w:[{fam:0},{fam:0.75},{fam:2}]},
 {id:'safe',w:[{safe:0.5,free:1},{safe:1,free:1.5},{safe:2.5,free:2}]},
 {id:'women',w:[{women:2.5},{women:1},{women:0}]},
 {id:'lgbt',w:[{lgbt:2.5},{lgbt:1},{lgbt:0}]},
 {id:'lang',w:[{lang:0.75},{lang:1.25},{lang:1.5},{lang:1.5},{lang:1.25},{lang:0.25}],mk:'lang',m:['both','en','enok','es','esen','both']},
 {id:'perm',w:[{perm:1},{perm:1},{perm:1},{perm:1},{perm:0}],mk:'perm',m:['usmx','us','mx','eu','usmx']}];
""" + t[b:]
rep("function weightsFromQuiz(a){const w={...PRESETS.equal,happy:1};", "function weightsFromQuiz(a){const w={...PRESETS.equal,happy:1,women:0,lgbt:0};")
rep("function modesFromQuiz(a){const q8=QUIZ.find(q=>q.id==='lang'),q9=QUIZ.find(q=>q.id==='perm');return {lang:a.lang!=null?q8.m[a.lang]:'en',perm:a.perm!=null?q9.m[a.perm]:'us'};}",
    "function modesFromQuiz(a){const o={lang:'en',perm:'us',field:'general',clim:'mild'};QUIZ.forEach(q=>{if(q.mk&&a[q.id]!=null)o[q.mk]=q.m[a[q.id]];});return o;}")
rep("const md=modesFromQuiz(ANS);LANGMODE=md.lang;PERMMODE=md.perm;", "const md=modesFromQuiz(ANS);LANGMODE=md.lang;PERMMODE=md.perm;FIELD=md.field;CLIMMODE=md.clim;")

# ---- quiz strings (replace whole block) ----
a = t.index("const QSTR={"); b = t.index("const HOW={")
t = t[:a] + r"""const QSTR={
 en:{move:['How do you want to get around?',['A car is fine','A mix of transit and driving','No car, everything walkable']],
  hlth:['How much do healthcare and work-life balance matter?',['My job’s plan is enough','They matter a lot','It has to cover me no matter what']],
  career:['Career or lifestyle right now?',['Building my career fast','Balanced','Lifestyle first']],
  field:['What kind of work do you do, or want to do?',['Tech or software','Finance or business','Healthcare','Creative, media or arts','Research or academia','Something else','I work remotely']],
  clim:['What weather do you want?',['Mild, no humid heat','Warm and sunny, heat is fine','Real seasons, cold is fine','Lots of winter daylight','I don’t care much']],
  open:['How easily do you make friends in a new place?',['Easily, anywhere','It takes a while','I need a welcoming culture']],
  cult:['How much needs to be going on?',['Quiet is fine','Some nightlife and culture','Big-city energy']],
  fam:['How important is being close to home?',['Not important','Somewhat','Very important']],
  safe:['Safety and stability?',['Some risk is fine','Normal concern','Top priority']],
  women:['Should safety and equal rights for women count?',['A lot, it affects me directly','Somewhat','Not for my choice']],
  lgbt:['Should LGBTQ+ acceptance count?',['A lot, it affects me directly','Somewhat','Not for my choice']],
  lang:['Which languages can you live in?',['English and Spanish','English only','Okay English, not fluent','Spanish only','Spanish, plus okay English','I’ll learn whatever is needed']],
  perm:['Which passport do you hold?',['US and Mexican, like Adriano','US only','Mexican only','A European Union passport','Something else (ignore this)']]},
 es:{move:['¿Cómo quieres moverte?',['El auto está bien','Una mezcla de transporte público y auto','Sin auto, todo a pie']],
  hlth:['¿Qué tanto importan la salud y el equilibrio vida-trabajo?',['El seguro de mi trabajo basta','Importan mucho','Tiene que cubrirme pase lo que pase']],
  career:['¿Carrera o estilo de vida por ahora?',['Crecer rápido en mi carrera','Equilibrado','Primero el estilo de vida']],
  field:['¿En qué trabajas o quieres trabajar?',['Tecnología o software','Finanzas o negocios','Salud','Creativo, medios o artes','Investigación o academia','Otra cosa','Trabajo a distancia']],
  clim:['¿Qué clima quieres?',['Templado, sin calor húmedo','Cálido y soleado, el calor está bien','Estaciones marcadas, el frío está bien','Mucha luz en invierno','No me importa mucho']],
  open:['¿Qué tan fácil haces amigos en un lugar nuevo?',['Fácil, en cualquier lado','Me toma tiempo','Necesito una cultura acogedora']],
  cult:['¿Cuánto tiene que estar pasando?',['Lo tranquilo está bien','Algo de vida nocturna y cultura','Energía de gran ciudad']],
  fam:['¿Qué tan importante es estar cerca de casa?',['No es importante','Algo','Muy importante']],
  safe:['¿Seguridad y estabilidad?',['Un poco de riesgo está bien','Preocupación normal','Prioridad máxima']],
  women:['¿Deben contar la seguridad y la igualdad de derechos para las mujeres?',['Mucho, me afecta directamente','Algo','No para mi elección']],
  lgbt:['¿Debe contar la aceptación LGBTQ+?',['Mucho, me afecta directamente','Algo','No para mi elección']],
  lang:['¿En qué idiomas puedes vivir?',['Inglés y español','Solo inglés','Inglés regular, sin fluidez','Solo español','Español, con algo de inglés','Aprendo lo que haga falta']],
  perm:['¿Qué pasaporte tienes?',['Estadounidense y mexicano, como Adriano','Solo estadounidense','Solo mexicano','De la Unión Europea','Otro (ignorar esto)']]}};
""" + t[b:]

# ---- intro and methods text ----
rep("intro2:'Take the one-minute quiz to get <b>your own map</b> and see how your picks compare with mine, or skip straight to my results.',",
    "intro2:'Take the quiz to get <b>your own map</b>. It adapts to your field of work, the weather you like, your passport and languages, and whether women\\u2019s safety or LGBTQ+ acceptance should count. Then see how your picks compare with mine, or skip straight to my results.',")
rep("intro2:'Haz el cuestionario de un minuto para obtener <b>tu propio mapa</b> y ver cómo se comparan tus elecciones con las mías, o salta directamente a mis resultados.',",
    "intro2:'Haz el cuestionario para obtener <b>tu propio mapa</b>. Se adapta a tu campo de trabajo, el clima que te gusta, tu pasaporte e idiomas, y a si deben contar la seguridad de las mujeres o la aceptación LGBTQ+. Luego compara tus elecciones con las mías, o salta directamente a mis resultados.',")
rep("startQuiz:'Take the 1-minute quiz'", "startQuiz:'Take the 2-minute quiz'")
rep("startQuiz:'Hacer el cuestionario (1 minuto)'", "startQuiz:'Hacer el cuestionario (2 minutos)'")
a = t.index("const HOW={"); b = t.index("let LANG=store.get")
t = t[:a] + open(f'{S}/how_v5.js', encoding='utf8').read() + "\n" + t[b:]
open(f'{S}/v5.html', 'w', encoding='utf8').write(t)
print('stage1 ok')
