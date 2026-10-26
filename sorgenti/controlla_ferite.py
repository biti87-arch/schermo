"""Controlla sorgenti/ferite.json sull'estratto del Vol. 3 2.5.7, Cap. 3 Imprevisti.
Uso: python3 sorgenti/controlla_ferite.py   (stampa solo errori e conteggi)
L'estratto (sorgenti/guida/vol3_imprevisti.txt) è il testo del capitolo letto dall'XML del .docx:
paragrafi uno per riga, tabelle fra [TABELLA] e [/TABELLA] con le celle separate da « | »."""
import json, os, re, sys
R = os.path.dirname(os.path.abspath(__file__))
F = json.load(open(os.path.join(R, 'ferite.json'), encoding='utf8'))
G = open(os.path.join(R, 'guida', 'vol3_imprevisti.txt'), encoding='utf8').read().split('\n')
err, n = [], 0
def ok(cond, msg):
    global n
    n += 1
    if not cond: err.append(msg)

def tabelle():
    out, titolo, cur = [], None, None
    for riga in G:
        if riga == '[TABELLA]': cur = []; continue
        if riga == '[/TABELLA]': out.append((titolo, cur)); cur = None; continue
        if cur is not None: cur.append([c.strip() for c in riga.strip().strip('|').split(' | ')])
        else: titolo = riga
    return out
T = tabelle()
def tab(titolo):  # la prima tabella dopo la riga del titolo
    ok(G.count(titolo) == 1, f'titolo «{titolo}» non trovato (o doppio)')
    if titolo not in G: return []
    i = G.index(titolo); j = G.index('[TABELLA]', i); k = G.index('[/TABELLA]', j)
    return [[c.strip() for c in r.strip().strip('|').split(' | ')] for r in G[j + 1:k]]

# --- 1. Fermare le emorragie e curare le ferite gravi
fer = tab('Fermare le emorragie e curare le ferite gravi')
ok(fer and fer[0][0] == 'Ferita' and len(fer) == 6, 'intestazione o righe di «Fermare» inattese')
ok(len(F['fermare']) == len(fer) - 1, 'numero di righe di «fermare» diverso')
for riga, j in zip(fer[1:], F['fermare']):
    nome, med, cdt, rit = riga
    ok(j['ferita'] == nome, f'{nome}: nome')
    ok(j['testo'] == {'medicinali': med, 'cd': cdt, 'ritentare': rit}, f'{nome}: testo diverso dall\'estratto')
    ok(j['medicinali'] == int(med), f'{nome}: medicinali')
    ok(f"CD {j['cd']}," in cdt, f'{nome}: CD')
    if j['guarigione'] is None: ok('cura immediata' in cdt, f'{nome}: guarigione immediata')
    else: ok(f"cura dopo {j['guarigione']['n']} giorn" in cdt, f'{nome}: tempo di guarigione')
    unita = 'round' if j['ritentare']['unita'] == 'round' else 'giorn'
    ok(rit.startswith(f"dopo {j['ritentare']['espr']} {unita}"), f'{nome}: ritentare')
    ok(('aumenta' in rit) == (j['variazione_cd'] == 1) and ('diminuisce' in rit) == (j['variazione_cd'] == -1), f'{nome}: variazione della CD')
i = G.index('Fermare le emorragie e curare le ferite gravi')
ok('penalità di -5' in ' '.join(G[i:i + 5]) and F['senza_medicinali'] == -5, 'penalità senza medicinali')

# --- 2. Amputazioni e arti inutilizzabili
amp = tab('Amputazioni e arti inutilizzabili')
ok(amp and amp[0] == ['Locazione', 'Danno a un solo arto', 'Danno a entrambi gli arti'], 'intestazione delle amputazioni')
ok(len(F['amputazioni']) == len(amp) - 1, 'numero di locazioni diverso')
CERCA = {'iniziativa': r'{v} alle prove di Iniziativa', 'ca': r'(?:^|\* ){v} CA'}
for riga, j in zip(amp[1:], F['amputazioni']):
    loc, uno, due = riga
    ok(j['nome'] == loc, f'{loc}: nome')
    ok(j['singolo']['testo'] == uno, f'{loc}: testo «un solo arto» diverso')
    ok((j['entrambi'] is None) == (due == ''), f'{loc}: colonna «entrambi»')
    if j['entrambi']: ok(j['entrambi']['testo'] == due, f'{loc}: testo «entrambi» diverso')
    for parte, testo in (('singolo', uno), ('entrambi', due)):
        if not j[parte]: continue
        m = j[parte]['mods']
        for abil, v in m.get('abilita_nome', {}).items():
            ok(re.search(rf'{v} {re.escape(abil)}\b', testo), f'{loc} {parte}: «{v} {abil}» non è nel testo')
        for k in ('iniziativa', 'ca'):
            if k in m: ok(re.search(CERCA[k].format(v=m[k]), testo), f'{loc} {parte}: {k} {m[k]} non è nel testo')
        for cnd in m.get('condizioni', []):
            chiave = {'Colto alla sprovvista': 'privo del bonus di Destrezza alla CA', 'Prono': 'come prono', 'Offuscato 50%': 'Offuscato 50%'}[cnd]
            ok(chiave in testo, f'{loc} {parte}: condizione {cnd} non è nel testo')
i = G.index('Amputazioni e arti inutilizzabili')
ok(F['regola_dita'] in G[i + 1] and F['dita_perse'] == 3, 'regola delle dita')

# --- 3. Ferite gravi (corpus per la scomposizione I1, usato da test_motore.js) e Fallimenti critici
fg = [(tit, t) for tit, t in T if t and t[0] == ['', '']]
ok(len(fg) == 6, f'tabelle delle Ferite gravi: {len(fg)} invece di 6')
for tit, t in fg:
    ok([r[0] for r in t[1:]] == [str(-k) for k in range(2, 16)], f'{tit}: righe diverse da −2…−15')
fc = [t for tit, t in T if t and t[0][1:] == ['Effetto']]
ok(len(fc) == 5 and sum(len(t) - 1 for t in fc) == 45, 'tabelle dei Fallimenti critici')

for e in err: print('ERRORE', e)
righe_fg = sum(len(t) - 1 for _, t in fg)
print(f'controllo ferite: {n} controlli, {len(err)} errori; fermare {len(F["fermare"])} righe, amputazioni {len(F["amputazioni"])} locazioni, ferite gravi {len(fg)} tabelle / {righe_fg} righe')
sys.exit(1 if err else 0)
