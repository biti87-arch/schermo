"""Controlla sorgenti/meteo.json sull'estratto della Guida del DM.
Uso: python3 sorgenti/controlla_meteo.py   (stampa solo errori e conteggi)
L'estratto (sorgenti/guida/guida_meteo_fame_sete.txt) è il testo di pdftotext -layout
delle pagine «Fame e sete» e «Tabelle del tempo atmosferico», righe senza spazi finali."""
import json, os, re, sys
R = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(R, 'meteo.json'), encoding='utf8'))
G = open(os.path.join(R, 'guida', 'guida_meteo_fame_sete.txt'), encoding='utf8').read().split('\n')
err = []

# --- 1. tabelle d% lette dall'estratto ---
COLONNE = {'Zone temperate': ('temperata', ['primavera', 'estate', 'autunno', 'inverno']),
           'Zone desertiche': ('desertica', ['primavera-estate', 'autunno-inverno']),
           'Zone artiche': ('artica', ['primavera-estate', 'autunno-inverno'])}
RNG = re.compile(r'(?:(?<=\s)|^)(\d\d-\d\d|00)(?=\s)')
lette, zona = {}, None
for riga in G:
    t = riga.strip()
    if t in COLONNE:
        zona = COLONNE[t]; continue
    if zona and RNG.match(t):
        pezzi = RNG.split(' ' + t)[1:]
        coppie = [(pezzi[i], pezzi[i + 1].strip()) for i in range(0, len(pezzi), 2)]
        if len(coppie) != len(zona[1]):
            err.append(f'riga non letta: {t}'); continue
        for (rng, testo), st in zip(coppie, zona[1]):
            da, a = (100, 100) if rng == '00' else map(int, rng.split('-'))
            a = 100 if a == 0 else a
            lette.setdefault((zona[0], st), []).append({'da': da, 'a': a, 'testo': re.sub(r'\s+', ' ', testo)})
righe = 0
for (z, st), rows in lette.items():
    j = M['tabelle'].get(z, {}).get(st)
    if j != rows:
        err.append(f'tabella {z}/{st} diversa dalla Guida:\n  guida {rows}\n  json  {j}')
    righe += len(rows)
for z, tab in M['tabelle'].items():
    for st, rows in tab.items():
        if (z, st) not in lette: err.append(f'tabella {z}/{st} non presente nella Guida')
        n = 1
        for r in rows:
            if r['da'] != n or r['a'] < r['da']: err.append(f'{z}/{st}: buco o sovrapposizione a {r}')
            n = r['a'] + 1
            for parte in re.split(r'\s*[+/]\s*(?![a-z])', r['testo']):
                if parte not in M['voci']: err.append(f'{z}/{st}: «{parte}» senza voce')
        if n != 101: err.append(f'{z}/{st}: finisce a {n - 1}')

# --- 2. voci ed effetti ---
for v, e in M['voci'].items():
    if e not in M['effetti']: err.append(f'voce {v} → effetto {e} inesistente')
testo = '\n'.join(G)
i = testo.index('Acquazzone:')
paragrafi = re.split(r'\n\s*\n', testo[i:].strip())
eff_guida = {}
for p in paragrafi:
    nome, _, corpo = ' '.join(x.strip() for x in p.split('\n')).partition(':')
    eff_guida[nome.strip().capitalize() if nome.islower() else nome.strip()] = corpo.strip()
def norm(k): return k[0].upper() + k[1:]
eff_guida = {norm(k): v for k, v in eff_guida.items()}
for k, v in M['effetti'].items():
    g = eff_guida.get(k)
    if g != v: err.append(f'effetto {k} diverso:\n  guida {g}\n  json  {v}')
for k in eff_guida:
    if k not in M['effetti']: err.append(f'effetto della Guida non riportato: {k}')

# --- 3. stagioni (con la correzione 2 → 22 giugno) ---
date = re.findall(r'(\d+) (marzo|giugno|settembre|dicembre) ?[-–] ?(\d+) ?(marzo|giugno|settembre|dicembre)', testo)
MESI = {'marzo': 3, 'giugno': 6, 'settembre': 9, 'dicembre': 12}
attese = [[s['da'], s['a']] for z in ('temperata', 'desertica', 'artica') for s in M['stagioni'][z]]
guida = [[[int(a), MESI[b]], [int(c), MESI[d]]] for a, b, c, d in date]
if guida[1][0] == [2, 6]: guida[1][0] = [22, 6]          # refuso della Guida
else: err.append('refuso «2 giugno» non trovato: controllare la correzione')
if guida != attese: err.append(f'stagioni diverse:\n  guida {guida}\n  json  {attese}')

# --- 4. fame e sete ---
fs = re.split(r'\n\s*\n', testo[testo.index('1)'):testo.index('Tabelle del tempo')].strip())
sete, fame = [' '.join(x.strip() for x in p.split('\n')) for p in fs]
sete = sete.replace('non abbia mangiato', 'non abbia bevuto', 1)   # refuso della Guida
for nome, g in (('sete', sete), ('fame', fame)):
    if M['fame_sete'][nome]['testo'] != g: err.append(f'{nome}: testo diverso\n  guida {g}')
if 'quarto' not in sete or 'settimo' not in fame: err.append('giorni della prova di Costituzione cambiati')

for e in err: print('ERRORE', e)
print(f'tabelle {len(lette)}, righe {righe}, effetti {len(M["effetti"])}, stagioni {len(attese)}, errori {len(err)}')
sys.exit(1 if err else 0)
