import sys, json, base64
exec(open(sys.argv[2]).read().split("errs=[]")[0].replace("PAGE = sys.argv[1]; OUT = sys.argv[2]","PAGE=sys.argv[1]"))
base={'move':1.5,'hlth':2,'happy':1,'cult':1.25,'open':1.5,'pay':1.25,'clim':1.5,'jobs':1.25,'day':1,'free':1.5,'safe':1,'perm':1,'lang':1.25,'fam':0.75,'women':0,'lgbt':0}
P={'woman-lgbt-health-warm-EU':dict(w={**base,'women':2.5,'lgbt':2.5},lm='en',pm='eu',fd='health',cm='warm',h=['city:London']),
   'remote-cool-US':dict(w={**base,'jobs':0},lm='en',pm='us',fd='remote',cm='cool',h=['city:Chicago']),
   'finance-mild-MXonly-es':dict(w=base,lm='es',pm='mx',fd='finance',cm='mild',h=['city:Mexico City'])}
def enc(o): return base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip('=')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for name,pr in [('adriano',None)]+list(P.items()):
        pg=b.new_context(viewport={'width':1280,'height':900}).new_page(); pg.route('**/*',route)
        url='file://'+PAGE+('' if pr is None else '#t='+enc({**pr,'g':1,'o':1,'n':1,'f':1,'a':{}}))
        pg.goto(url); pg.wait_for_timeout(700)
        if pr is None: pg.click('#skipQuiz')
        rows=[r.inner_text().split('\n') for r in pg.locator('#list .row').all()][:10]
        print(name+':', ' | '.join(f"{r[1]} {[x for x in r if x.strip().isdigit()][-1]}" for r in rows))
    b.close()
