"""Controlla sorgenti/ferite.json sull'estratto del Vol. 3 2.5.8, Cap. 3 Imprevisti.
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

# --- 3. Ferite gravi: tabelle dell'app (usate anche come corpus della scomposizione I1 in test_motore.js)
fg = [(tit, t) for tit, t in T if t and t[0] == ['', '']]
ok(len(fg) == 6, f'tabelle delle Ferite gravi: {len(fg)} invece di 6')
RIGHE = [str(-k) for k in range(1, 16)]
for tit, t in fg:
    ok([r[0] for r in t[1:]] == RIGHE, f'{tit}: righe diverse da −1…−15')
dal_volume = {tit: {r[0]: r[1] for r in t[1:]} for tit, t in fg}
FG = {x['id']: x for x in F['ferite_gravi']}
ok(list(FG) == ['colpire', 'area', 'costituzione'], 'tre tabelle delle Ferite gravi in ferite.json')
TIT_LOC = {'testa': '1: Testa', 'busto': '2-4: Busto', 'braccio': '5: Braccio sinistro / 6: Braccio destro', 'gamba': '7: Gamba sinistra / 8: Gamba destra'}
for k, tit in TIT_LOC.items(): ok(FG['colpire']['righe_per_locazione'][k] == dal_volume.get(tit), f'colpire/{k}: righe diverse dall\'estratto')
coperti = sorted(v for l in FG['colpire']['locazioni'] for v in range(l['da'], l['a'] + 1))
ok(coperti == list(range(1, 9)), 'locazioni: il 1d8 non è coperto da 1 a 8')
for l in FG['colpire']['locazioni']:
    ok(l['nome'].split()[0] in TIT_LOC[l['righe']] and (l['lato'] == '' or l['lato'][:-1] in l['nome']), f'locazione {l["nome"]}')
ok(FG['area']['righe'] == dal_volume.get('Attacchi con area di effetto o effetti senza tiro per colpire'), 'area: righe diverse dall\'estratto')
ok(FG['costituzione']['righe'] == dal_volume.get('Danni a Costituzione, veleni, sanguinamento o livelli negativi'), 'costituzione: righe diverse dall\'estratto')
i = G.index('Ferite gravi')
ok(G[i + 1] == '1 ' + F['nota_oggetti'], 'nota ¹ degli oggetti')
fc = [t for tit, t in T if t and t[0][1:] == ['Effetto']]
ok(len(fc) == 5 and sum(len(t) - 1 for t in fc) == 45, 'tabelle dei Fallimenti critici')
# Fallimenti critici in ferite.json (Build 3a): righe uguali all'estratto (apici ¹ ² a parte), dado coperto senza buchi, note
FCJ = F['fallimenti']['tabelle']
ok([t['id'] for t in FCJ] == ['mischia', 'contatto', 'tiro', 'spargimento', 'contatto_distanza'], 'cinque tabelle dei Fallimenti critici nel JSON')
for t, tv in zip(FCJ, fc):
    facce = int(t['dado'][1:])
    ok(sorted(v for r in t['righe'] for v in range(r['da'], r['a'] + 1)) == list(range(1, facce + 1)), f"{t['id']}: il {t['dado']} non è coperto")
    testi = [r['testo'].replace('alleato¹', 'alleato1').replace('oggetto²', 'oggetto2') for r in t['righe']]
    ok(testi == [r[1] for r in tv[1:]], f"{t['id']}: righe diverse dall'estratto")
    ok(t['dado'] == tv[0][0], f"{t['id']}: dado")
i = G.index('Fallimenti critici')
ok(G[i + 1] == '1 ' + F['fallimenti']['note']['1'] and G[i + 2] == '2 ' + F['fallimenti']['note']['2'], 'note ¹ e ² dei Fallimenti critici')

for e in err: print('ERRORE', e)
righe_fg = sum(len(t) - 1 for _, t in fg)
print(f'controllo ferite: {n} controlli, {len(err)} errori; fallimenti {len(FCJ)} tabelle / {sum(len(t["righe"]) for t in FCJ)} righe, fermare {len(F["fermare"])} righe, amputazioni {len(F["amputazioni"])} locazioni, ferite gravi {len(fg)} tabelle / {righe_fg} righe')
sys.exit(1 if err else 0)
