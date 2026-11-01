"""Controlla sorgenti/strumenti.json sulla Guida del DM (fonti di luce) e su meteo.json / Tabelle del Tempo Atmosferico (Fiamme).
Uso: python3 sorgenti/controlla_strumenti.py"""
import json, os, re
R = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(R, 'strumenti.json'), encoding='utf8'))
M = json.load(open(os.path.join(R, 'meteo.json'), encoding='utf8'))
G = open(os.path.join(R, 'guida', 'guida_dm.txt'), encoding='utf8').read()
T = open(os.path.join(R, 'guida', 'tempo_atmosferico.txt'), encoding='utf8').read()
n = 0; err = []
def ok(c, msg):
    global n; n += 1
    if not c: err.append(msg)
norm = lambda s: ' '.join(s.split())
i = G.index('Fonti di luce'); j = G.index('Capitolo 1: Riassunti', i)
blocco = G[i:j]
for f in S['luce'] + [S['fiaschetta']]:
    nome = f.get('voce', f['nome'])
    ok(re.search(re.escape(nome) + r'\s{2,}' + re.escape(f['costo']), blocco), f'{nome}: costo {f["costo"]} non nella Guida')
# le descrizioni, con il PDF che manda a capo intorno alla riga del nome: si toglie «Nome   Costo» e si confronta
pulito = norm(re.sub(r'\n\s{6,}\S.*?\s{2,}\d+ m[ro a]\S*', '\n', '\n' + blocco))
for f in S['luce'] + [S['fiaschetta']]:
    for frase in re.split(r'(?<=\.) ', f['testo']): ok(norm(frase) in pulito, f'{f["nome"]}: «{frase[:50]}» non nella Guida')
for f in S['luce']:
    ok(f'raggio di {f["raggio"]} m' in f['testo'] or f['id'] in ('caschetto', 'lanterna_impermeabile', 'lanterna_schermabile', 'lanterna_deluxe'), f'{f["nome"]}: raggio')
    ok(f'Brucia per {f["ore"]} or' in f['testo'] or f['id'] in ('caschetto', 'lanterna_impermeabile', 'lanterna_schermabile', 'lanterna_deluxe'), f'{f["nome"]}: durata')
# Fiamme: ogni voce citata esiste nel meteo; la tabella delle Fiamme nomina le voci del suo livello
F = S['fiamme']; voci = set(M['voci'])
for v in F['livelli']: ok(v in voci, f'{v}: voce del meteo sconosciuta')
tab = {r['fonte']: r['spegne'] for r in M['fiamme']['righe']}
for v, l in F['livelli'].items():
    if v in F['origine']: continue
    riga = {2: tab["Torcia, falò all'aperto"], 3: tab['Lanterna'], 4: tab['Lanterna impermeabile o deluxe']}[l]
    radice = v.replace('Tempesta di ', '')
    ok(v in riga or radice in riga, f'{v}: non nella riga delle Fiamme del livello {l}')
# effetti del meteo che parlano di fiamme: tutti nei livelli; «Si spengono tutte le fiamme» = 4
for nome_e, testo in M['effetti'].items():
    nomi = [x.strip() for x in nome_e.split('/')]
    if re.search(r'[Ff]iamme', testo):
        for x in nomi:
            xx = x if x in voci else 'Tempesta di ' + x if 'Tempesta di ' + x in voci else x
            if xx in ('Aria viziata',): continue
            ok(xx in F['livelli'], f'{xx}: parla di fiamme ma non ha un livello')
            if 'Si spengono tutte le fiamme' in testo: ok(F['livelli'].get(xx) == 4, f'{xx}: spegne tutte le fiamme')
ok(F['aria_viziata']['voce'] in voci and 'metà del tempo' in T, 'Aria viziata: le fiamme durano metà del tempo')
ok('50% di probabilità ogni 10 minuti' in tab['Lanterna impermeabile o deluxe'], 'Vento molto forte: 50% ogni 10 minuti')
for e in err: print('ERRORE', e)
print(f'controllo strumenti: {n} controlli, {len(err)} errori; luce {len(S["luce"])}, fiamme {len(F["livelli"])} voci, bonus {len(S["bonus"]["tipi"])} tipi')
