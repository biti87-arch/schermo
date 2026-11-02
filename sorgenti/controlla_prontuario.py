"""Controlla sorgenti/prontuario.json (Build 3b) sulle fonti: Guida del DM (guida_dm.txt), Vol. 1 (vol1_prontuario.txt, vol1_regole.txt),
Vol. 3 (vol3_prontuario.txt, vol3_riparare.txt), Tabelle del Tempo Atmosferico (meteo.json). Stampa solo gli errori e i conteggi.
- ogni testo e ogni cella delle voci della Guida si trova nella Guida (spazi normalizzati), salvo i refusi e gli adattamenti elencati
  nel JSON (campo «refusi»: il testo vecchio è nella Guida, quello nuovo nel Prontuario) e le voci scritte dall'app;
- le note dei volumi sono uguali agli estratti; le tabelle del Vol. 3 (locande, stalle, luce, misture, riparare) uguali agli estratti;
- i dati degli strumenti (mezzi, terreni, cadere, aree degli incontri, CD) sono quelli delle tabelle;
- niente regole che nella Collana non esistono (Addestrare animali, morente, PF negativi, «Utilizzare oggetti magici» come titolo).
Uso: python3 sorgenti/controlla_prontuario.py"""
import json, os, re, sys
R = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(R, 'prontuario.json'), encoding='utf8'))
MET = json.load(open(os.path.join(R, 'meteo.json'), encoding='utf8'))
leggi = lambda f: open(os.path.join(R, 'guida', f), encoding='utf8').read()
norm = lambda s: ' '.join(s.replace('’', "'").split())
G = norm(leggi('guida_dm.txt'))
GL = leggi('guida_dm.txt').split('\n')
G_RIGHE = [norm(x) for x in GL]
V1 = norm(leggi('vol1_prontuario.txt') + '\n' + leggi('vol1_regole.txt'))
V3 = leggi('vol3_prontuario.txt').split('\n')
V3R = leggi('vol3_riparare.txt').split('\n')
err, n = [], 0
def ok(cond, msg):
    global n; n += 1
    if not cond: err.append(msg)

# testi scritti dall'app (non nella Guida): voci di Conoscenze, rimandi, refusi corretti
APP = ['Nobiltà: araldica, casate e genealogie, galateo, governanti e linee di successione.',
       'Scientifiche: elettricità, audiografi, pittogrammi, automaton, innovazioni e scoperte tecnologiche.',
       'Storia e leggende: eventi storici, guerre, migrazioni, fondazione delle città, leggende.',
       'Generali: abitanti, clima, costumi, leggi, personalità, popolazione, terreni, territori, tradizioni, umanoidi.',
       'Vedi «Terreni scivolosi» (Pericoli): prova solo oltre metà velocità, CD 15, 20 correndo o caricando.']
CELLE_APP = {'Tipo di azione', 'Storia e leggende', 'Nobiltà', 'CD della Prova di Concentrazione', 'Modificatore', 'Dettaglio', 'Taglia', 'Condizione', '—', 'Danno', 'Media',
             'Attacco/Danni: tagliente o contundente', 'Attacco/Danni: penetrante', 'Senza equilibrio¹', 'Velocità di Movimento', 'Tipo di terreno', 'Tipo di area', 'Qualità della serratura'}
refusi = P['refusi']
for r in refusi:  # il testo vecchio è nella Guida (o nel formato a righe della Guida), quello nuovo nel Prontuario
    vecchio = norm(re.sub(r'^[HP]: ', '', r['guida'].split('\n\n')[-1] if r['guida'].startswith('H:') else r['guida']))
    ok(vecchio in G or all(norm(x[3:]) in G for x in r['guida'].split('\n\n') if x[:3] in ('H: ', 'P: ')), f"refuso: testo vecchio non nella Guida: {r['guida'][:60]}")
    ok(r['nota'], f"refuso senza nota: {r['guida'][:40]}")
nuovi = [norm(re.sub(r'^[HP]: ', '', x)) for r in refusi for x in r['corretto'].split('\n\n')]

SUP = str.maketrans({'¹': '1', '²': '2', '³': '3', '⁴': '4'})
def nella_guida(t):
    t = norm(t)
    if norm(t.translate(SUP)) in G: return True
    if t in G or t in nuovi or t in APP: return True
    # un paragrafo corretto da un refuso: il resto del testo è nella Guida
    for r in refusi:
        a, b = norm(re.sub(r'^[HP]: ', '', r['guida'])), norm(re.sub(r'^[HP]: ', '', r['corretto']))
        if b in t and norm(t.replace(b, a)) in G: return True
    # titoli rifatti con le parentesi (Occultamento (dovuto a…)): ogni parte è nella Guida
    m = re.match(r'^(.+) \((.+)\)$', t)
    if m and m.group(1) in G and m.group(2)[0].upper() + m.group(2)[1:] in G: return True
    if m and m.group(1).replace(' (udito)', '') in G: return True
    return False

guida_voci = 0
for s in P['sezioni']:
    for v in s['voci']:
        ok(v['blocchi'], f"{v['titolo']}: nessun testo")
        if v['fonte'] != 'Guida del DM': continue
        guida_voci += 1
        for b in v['blocchi']:
            if b['t'] in ('p', 'h'): ok(nella_guida(b['testo']), f"{v['titolo']}: testo non nella Guida: {b['testo'][:70]}")
            elif b['t'] == 'tab':
                for riga in b['righe']:
                    for x in riga: ok(norm(x) in G or norm(x.translate(SUP)) in G or x in CELLE_APP or nella_guida(x), f"{v['titolo']}: cella non nella Guida: {x[:60]}")
            elif b['t'] == 'nota':
                if b['fonte'] == 'Vol. 1': ok(norm(b['testo']) in V1 or norm(b['testo']).startswith(('Senza ', 'Il titolo della Guida')), f"{v['titolo']}: nota del Vol. 1 non nell'estratto: {b['testo'][:60]}")
                else: ok(b['fonte'] in ('app', 'Vol. 3', 'Tabelle del Tempo'), f"{v['titolo']}: fonte della nota sconosciuta")
ok(guida_voci == 36, f'voci della Guida: {guida_voci} (attese 36)')
tutte = json.dumps([[b for b in v['blocchi'] if b['t'] != 'nota'] for s in P['sezioni'] for v in s['voci']], ensure_ascii=False)
for vietato in ['Addestrare animali', 'Punti Ferita negativ', 'morente', 'Morente', '0 Punti Ferita', 'Guarire', 'Linguistica', 'prova di Nascondersi']:
    ok(vietato not in tutte, f'testo vietato nel Prontuario: {vietato}')
ok(not any(v['titolo'] == 'Utilizzare oggetti magici' for s in P['sezioni'] for v in s['voci']), 'titolo «Utilizzare oggetti magici»')
ok([s['id'] for s in P['sezioni']] == ['abilita', 'combattimento', 'cure', 'viaggi', 'pericoli', 'riparare', 'locande'], 'sezioni del Prontuario (AC1-1)')
ok(len([v for v in P['sezioni'][0]['voci']]) == 20, 'Abilità: 19 della Guida (senza Addestrare animali) + Professione (alchimista)')

# ---- Vol. 3: tabelle uguali agli estratti
def tab_v3(inizio, k=0):
    i = V3.index(inizio); t, cur = [], None
    for r in V3[i:]:
        if r.startswith('## ') and r != inizio: break
        if r == '[TABELLA]': cur = []; continue
        if r == '[/TABELLA]': t.append(cur); cur = None; continue
        if cur is not None: cur.append([x.strip() for x in r.strip('|').split(' | ')])
    return t[k]
L = tab_v3('## Locande e taverne')
ok([[x['nome'], x['costo'], x['descrizione'], x['effetto']] for x in P['locanda']] == L[1:], 'Locande: diverse dal Vol. 3')
ok({x['nome']: x['mr'] for x in P['locanda']}['Stanza singola'] == 800 and {x['nome']: x['mr'] for x in P['locanda']}['Dormitorio'] == 40, 'Locande: costi in mr')
ok([[x['nome'], x['costo'], x['descrizione']] for x in P['stalle']['animali']] == tab_v3('## Stalle e negozi di animali', 1)[1:], 'Stalle: animali')
ok(P['stalle']['stallaggio']['costo'] == '5 ma', 'Stallaggio 5 ma')
LU = tab_v3('## Fonti di luce')[1:] + tab_v3('## Caschetto portacandela (Empori)')[1:]
ok([[x['nome'], x['costo'], x['slot'], x['descrizione']] for x in P['luce']] == LU, 'Fonti di luce diverse dal Vol. 3')
ok(next(x for x in P['luce'] if x['nome'] == 'Torcia')['costo'] == '3 ma', 'Torcia 3 ma (Vol. 3)')
MI = tab_v3('## Professione erborista')
righe_m = [r for r in MI[1:] if len(r) > 1]
ok([[str(m['cd']), str(m['dosi']), m['tipo'], m['effetto']] for m in P['erborista']['misture']] == righe_m, 'Misture diverse dal Vol. 3')
ok(len(P['erborista']['misture']) == 28, 'misture: 28')
grp = {}
for m in P['erborista']['misture']: grp[m['gruppo']] = grp.get(m['gruppo'], 0) + 1
ok(grp == {'Clima': 1, 'Caratteristiche': 4, 'Memoria e Concentrazione': 3, 'Creature specifiche': 3, 'Sbronza, Infermità e Nausea': 2, 'Livelli negativi': 2, 'Malattie': 5, 'Paura': 1, 'Riposo e Sonno': 3, 'Unità di medicinali': 1, 'Veleni': 3}, f'gruppi delle misture: {grp}')
for m in P['erborista']['misture']:
    a = m['app'], m['effetto']
    if 'prima di coricarsi' in m['effetto'] and m['id'] not in ('m12',): ok(m['app'].get('durata') == 'riposo', f"{m['id']}: «prima di coricarsi» = fino al riposo")
    if re.search(r'per (\d+) or[ae]', m['effetto']) and not m['app'].get('cibo'):
        h = int(re.search(r'per (\d+) or[ae]', m['effetto']).group(1)); ok(m['app'].get('durata') == {'n': h, 'unita': 'ore'}, f"{m['id']}: durata {h} ore")
    if m['tipo'] == 'Poltiglia': ok(m['app'].get('poltiglia'), f"{m['id']}: poltiglia")
ok(P['erborista']['raccolta'] == {'base': 45, 'per_grado': 1} and '45% +1% per ogni grado' in leggi('vol3_prontuario.txt'), 'raccolta delle erbe 45% +1%')
TXT3 = norm(leggi('vol3_prontuario.txt'))
for frase in ['CD 14 + 1 per paziente assistito', 'Si assiste fino a cinque pazienti', 'prova di Professione (cerusico) con CD 15', 'Trattare sé stessi aumenta di 5 la CD',
              'Come azione standard si effettua quindi una prova di Professione con CD 10', 'vengono inoltre curati 2 degli eventuali danni alle caratteristiche',
              'un party non può trasportare più di 10 unità di medicinali', '+1d4 per ogni 5 punti con cui la prova viene superata', '24 ore di riposo totale con assistenza continua: 4 Punti Ferita per livello']:
    ok(frase in TXT3, f'cerusico: frase non nel Vol. 3: {frase}')
C = P['cerusico']
ok(C['assistenza'] == {'cd_base': 14, 'per_paziente': 1, 'massimo': 5, 'unita': 1} and C['pronto'] == {'cd': 15, 'se_stesso': 5, 'ogni': 5, 'dado': 4, 'unita': 1}, 'dati del cerusico')
ok(C['sanguinamento']['sopravvivenza'] == 15 and 'Sopravvivenza con CD 15' in V1, 'sanguinamento: Sopravvivenza CD 15 (Vol. 1)')
# Riparare: tabella uguale all'estratto del Vol. 3
RT = [[x.strip() for x in r.strip('|').split(' | ')] for r in V3R if r.startswith('| ')][2:]
rip = P['riparare']['tabella']
ok([[x['voce'], str(x['s']), str(x['r'])] for x in rip['armature']] == [r[0:3] for r in RT], 'Riparare: armature')
ok([[x['voce'], str(x['s']), str(x['r'])] for x in rip['armi']] == [r[4:7] for r in RT], 'Riparare: armi')
ok([[x['voce'], str(x['s']), str(x['r'])] for x in rip['vari']] == [r[8:11] for r in RT], 'Riparare: oggetti vari')
ok(rip['armi'][-1]['s'] == 29, 'armi +10: 29 (la Guida dice 39)')
ok([x['fino'] for x in rip['vari']] == sorted(x['fino'] for x in rip['vari']), 'valori crescenti')
ok('Le armi rotte impongono penalità -4' in leggi('vol3_riparare.txt'), 'armi rotte −4 nel Vol. 3')
# ---- strumenti: dati dalle tabelle della Guida
V = P['viaggi']
for m in V['mezzi']:
    ok(any(r.startswith(norm(m['nome'])) and r.endswith(' ' + str(m['miglia'])) for r in G_RIGHE), f"mezzo non nella Guida: {m['nome']}")
    ok(abs(m['kmh'] - m['miglia'] * 1.6) < 1e-9, f"km/h di {m['nome']}")
MOLT = {'-': [1, 1], '1/2': [1, 2], '1/3': [1, 3], '1/4': [1, 4]}
for t in V['terreni']:
    riga = next((r for r in G_RIGHE if r.startswith(t['nome'] + ' ') and r.split(' ')[-1] in MOLT), None)
    ok(riga and MOLT[riga.split(' ')[-1]] == t['molt'], f"terreno: {t['nome']}")
ok(len(V['terreni']) == 9 and len(V['mezzi']) == 5, 'mezzi e terreni: 5 e 9')
ok('CD 18, +2 per ogni ora aggiuntiva' in G and V['forzata'] == {'cd': 18, 'passo': 2, 'danno_pg': 1, 'danno_cavalcatura': 2}, 'marcia forzata (Guida)')
ok('si subisce 1 danno a Costituzione' in G and 'si subisce 2 danni a Costituzione' in G, 'danni della marcia forzata')
TT = norm(leggi('tempo_atmosferico.txt'))
ok('Modificatori: Foschia +2; Nebbia, Neve fitta e Miraggi +5; tempeste e Tormenta +10.' in TT, 'Orientarsi: modificatori delle Tabelle')
ok([m['cd'] for m in V['orientarsi']['mods']] == [2, 5, 10] and V['orientarsi']['cd'] == 15, 'Orientarsi: CD')
ok('Tempeste, Tormenta, Uragano | ×¼' in TT and 'Neve fitta depositata | ×¼ (×½ con le racchette da neve)' in TT, 'moltiplicatori di viaggio delle Tabelle')
voci_meteo = set(MET['voci'])
for v in V['tempeste'] + list(V['suolo_meteo']) + [x for m in V['orientarsi']['mods'] for x in m['voci']]:
    ok(v in voci_meteo, f'voce del meteo sconosciuta: {v}')
CAD = P['cadere']
for r in CAD['righe']:
    lab = str(r['da']) if r['da'] == r['a'] else f"{r['da']}-{r['a']}"
    ok(any(re.sub(r' - ', '-', x).startswith(lab + ' ') and f" {r['dadi']}d6 " in x + ' ' for x in G_RIGHE), f'cadere: riga {lab}')
ok([(r['da'], r['a']) for r in CAD['righe']][0] == (3, 3) and all(CAD['righe'][i]['a'] + 1 == CAD['righe'][i + 1]['da'] for i in range(len(CAD['righe']) - 1)) and CAD['righe'][-1]['a'] + 1 == CAD['morte'], 'cadere: righe contigue fino alla morte (34)')
PE = P['pericoli']
ok('per un numero di round pari al doppio del punteggio di Costituzione' in G and PE['annegamento']['cd'] == 10 and 'CD 10 ad ogni round per continuare a trattenere il fiato. Ogni round, la CD aumenta di 1' in G, 'annegamento')
ok('(CD 15, +1 per ogni prova precedente) oppure passa il round a tossire' in G and 'per 2 round consecutivi subisce 1d6 Danni Non Letali' in G, 'fumo')
ok([x['ore'] for x in PE['alta_quota']] == [6, 6] and 'Per ogni 6 ore trascorse' in G, 'alta quota ogni 6 ore')
A = P['incontri']['aree']
ok([(a['nome'], a['perc']) for a in A] == [('Terre selvagge', 20), ('Caverne e sotterranei', 15), ('Montagna', 10), ('Bosco', 10), ('Campagna e colline; strade di collegamento', 5), ('Deserto o desolazione', 5)], 'aree della Guida')
ok(A[2]['speciale'] == {'nome': 'nelle grotte', 'perc': 20} and A[5]['speciale'] == {'nome': 'in oasi e rovine', 'perc': 30}, 'aree speciali')
ok('l’ora del giorno tirando 2d12' in leggi('guida_dm.txt') and 'ridurre del 5% la possibilità di essere aggrediti durante la notte' in G, 'ora 2d12 e riparo −5%')
for a in A: ok(norm(a['nome']) in G, f"area non nella Guida: {a['nome']}")
AA = P['appendice_a']
ok(len(AA['righe']) == 5 and AA['righe'][1][0] == 'Abiti estivi' and all(' | '.join(r) in leggi('tempo_atmosferico.txt') for r in AA['righe']), 'Appendice A delle Tabelle del Tempo')
if err:
    print('\n'.join(err)); print(f'controllo prontuario: {n} controlli, {len(err)} errori'); sys.exit(1)
print(f"controllo prontuario: {n} controlli, 0 errori; sezioni {len(P['sezioni'])}, voci {sum(len(s['voci']) for s in P['sezioni'])} (Guida {guida_voci}), misture {len(P['erborista']['misture'])}, servizi {len(P['locanda'])}, aree {len(A)}, refusi e adattamenti {len(refusi)}")
