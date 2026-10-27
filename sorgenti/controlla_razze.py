"""Controlla sorgenti/razze.json e sorgenti/divieti.json sugli estratti in sorgenti/guida/.
Uso: python3 sorgenti/controlla_razze.py   (stampa solo errori e conteggi)
- razze.json: ogni razza, dato, tratto e opzione deve stare nell'estratto (razze.md) con lo stesso testo, e viceversa;
- divieti.json: ogni regola cita un passo che c'è davvero nella fonte (struttura o regole) e ogni espressione
  riconosce gli esempi «si» e non gli esempi «no», tenendo conto delle eccezioni «salvo» (le espressioni si provano con Node, come nell'app)."""
import json, os, re, subprocess, sys
R = os.path.dirname(os.path.abspath(__file__))
J = json.load(open(os.path.join(R, 'razze.json'), encoding='utf8'))
D = json.load(open(os.path.join(R, 'divieti.json'), encoding='utf8'))
G = open(os.path.join(R, 'guida', 'razze.md'), encoding='utf8').read()
FONTI = {'struttura': open(os.path.join(R, 'guida', 'struttura_scheda_png.md'), encoding='utf8').read(),
         'regole': open(os.path.join(R, 'guida', 'regole_collana.md'), encoding='utf8').read()}
err, n = [], 0
def ok(cond, msg):
    global n
    n += 1
    if not cond: err.append(msg)

# --- razze: titoli, numeri e testi
titoli = re.findall(r'^## (.+)$', G, re.M)
ok(len(titoli) == 41 and titoli[-1] == 'Tratti razziali generici', f'titoli delle razze: {len(titoli)}')
ok([r['nome'] for r in J['razze']] == titoli[:-1], 'ordine o nomi delle razze diversi dall\'estratto')
pars = set(p.strip() for p in G.split('\n\n'))
TG = {'piccola': 'piccola', 'media': 'media', 'grande_speciale': 'grande speciale'}
for r in J['razze']:
    nome = r['nome']; sez = G.split('## ' + nome + '\n', 1)[1].split('\n## ', 1)[0]
    np = len(re.findall(r'^\*\*[^*]+:', sez, re.M)); ok(np == len(r['dati']) + len(r['tratti']), f'{nome}: {np} voci «**Nome:**», json {len(r["dati"]) + len(r["tratti"])}')
    nv = len(re.findall(r'^\*\*[^*:]+\*\* ', sez, re.M)); ok(nv == len(r['opzioni']['voci']), f'{nome}: {nv} opzioni, json {len(r["opzioni"]["voci"])}')
    ok(f'**{r["opzioni"]["titolo"]}**' in pars, f'{nome}: titolo delle opzioni')
    for k, v in r['dati'].items():
        ok(f'**{k}:** {v}' in pars or (k + ': ') in sez, f'{nome}: dato {k} diverso')
    for t in r['tratti']:
        ok(f'**{t["nome"]}:** {t["testo"]}' in pars or f'**{t["nome"]}: ' in sez and t['testo'].split(' ', 3)[-1] in sez, f'{nome}: tratto {t["nome"]} diverso')
    for v in r['opzioni']['voci']:
        p = f'**{v["nome"]}** ' + (f'*{v["descrizione"]}* ' if v['descrizione'] else '') + v['testo']
        ok(p in pars, f'{nome}: opzione {v["nome"]} diversa')
    ok(r['taglia'] in TG and r['dati']['Taglia'].startswith(TG[r['taglia']]), f'{nome}: taglia')
    ok(r['dati']['Movimento'].startswith(r['movimento']), f'{nome}: movimento')
    ok(r['dati']['Tipo'].startswith(r['tipo']), f'{nome}: tipo')
    for s in r['sensi']:
        ok(s.split(' ')[0] in sez.lower(), f'{nome}: senso {s} non nel testo')
    ok(('Scurovisione:' in sez) == any(s.startswith('scurovisione') for s in r['sensi']), f'{nome}: scurovisione')
gen = G.split('## Tratti razziali generici\n', 1)[1]
ng = len(re.findall(r'^\*\*[^*]+\*\* ', gen, re.M)); ok(ng == len(J['generici']['voci']), f'generici: {ng}, json {len(J["generici"]["voci"])}')
for v in J['generici']['voci']:
    ok(f'**{v["nome"]}** *{v["descrizione"]}* {v["testo"]}' in pars, f'generico {v["nome"]} diverso')

# --- divieti: citazioni nelle fonti e prove delle espressioni
for x in D['divieti']:
    ok(x['cita'] in FONTI[x['fonte']], f'divieto {x["id"]}: citazione non trovata nella fonte {x["fonte"]}')
    ok(x['campi'] in ('talenti', 'abilita', 'tutto'), f'divieto {x["id"]}: campi')
for x in D['regole']:
    ok(x['cita'] in FONTI[x['fonte']], f'regola {x["id"]}: citazione non trovata')
    if 'cita_tetto' in x: ok(x['cita_tetto'] in FONTI['struttura'], 'tetto di Sintonia non trovato nella struttura')
js = ('const D=' + json.dumps(D['divieti'], ensure_ascii=False) + ',SC=' + json.dumps(D.get('salvo_comune', ''), ensure_ascii=False) + ';let e=[];for(const x of D){const r=new RegExp(x.re,x.flag);'
      'const sv=new RegExp([SC,x.salvo].filter(Boolean).join("|"),"i");'
      'for(const s of x.si)if(!r.test(s)||sv.test(s))e.push(x.id+": non riconosce «"+s+"»");for(const s of x.no)if(r.test(s)&&!sv.test(s))e.push(x.id+": riconosce «"+s+"»");}'
      'console.log(JSON.stringify(e));')
out = subprocess.run(['node', '-e', js], capture_output=True, text=True)
ok(out.returncode == 0, 'node: ' + out.stderr[:200])
for e in (json.loads(out.stdout) if out.returncode == 0 else []): ok(False, 'espressione ' + e)
prove = sum(len(x['si']) + len(x['no']) for x in D['divieti'])

for e in err: print('ERRORE', e)
print(f'controllo razze e divieti: {n} controlli, {len(err)} errori; razze {len(J["razze"])}, tratti {sum(len(r["tratti"]) for r in J["razze"])}, '
      f'opzioni {sum(len(r["opzioni"]["voci"]) for r in J["razze"])}, generici {len(J["generici"]["voci"])}; divieti {len(D["divieti"])} ({prove} esempi)')
sys.exit(1 if err else 0)
