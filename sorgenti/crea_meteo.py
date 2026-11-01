"""Genera sorgenti/meteo.json dalle «Tabelle del Tempo Atmosferico v1.0» (estratto sorgenti/guida/tempo_atmosferico.txt,
prodotto da estrai_tempo.py). Uso: python3 sorgenti/crea_meteo.py — poi controllare con controlla_meteo.py.
I testi vengono tutti dall'estratto; qui ci sono solo i nomi brevi (id) e le regole che il motore applica,
ognuna con la frase del manuale da cui viene (controllata da controlla_meteo.py)."""
import json, re, os
R = os.path.dirname(os.path.abspath(__file__))
G = open(os.path.join(R, 'guida', 'tempo_atmosferico.txt'), encoding='utf8').read().split('\n')

def idx(t, da=0):
    for i in range(da, len(G)):
        if G[i] == t: return i
    raise SystemExit(f'non trovato: {t}')
def tabella(i):  # righe della tabella che comincia a G[i] == '[TABELLA]'
    assert G[i] == '[TABELLA]', G[i]
    k = G.index('[/TABELLA]', i)
    return [[c.strip() for c in r[1:-1].split(' | ')] for r in G[i + 1:k]], k + 1
def tabella_dopo(t, da=0):
    i = idx(t, da)
    while G[i] != '[TABELLA]': i += 1
    return tabella(i)
def puntate(i):  # voci di elenco da G[i] in poi
    out = []
    while i < len(G) and G[i].startswith('• '): out.append(G[i][2:]); i += 1
    return out, i

CAP2, CAP3, CAP4, APPA = idx('Capitolo 2 – Effetti del tempo atmosferico'), idx('Capitolo 3 – Le zone'), idx('Capitolo 4 – Sopravvivere'), idx('Appendice A – Equipaggiamento')
ID_STAGIONE = {'Primavera': 'primavera', 'Estate': 'estate', 'Autunno': 'autunno', 'Inverno': 'inverno',
    'Primavera-estate': 'primavera-estate', 'Autunno-inverno': 'autunno-inverno', 'Stagione delle piogge': 'piogge',
    'Stagione secca': 'secca', 'Stagione calma': 'calma', 'Stagione delle tempeste': 'tempeste'}
MESI = {'marzo': 3, 'giugno': 6, 'settembre': 9, 'dicembre': 12}
GRUPPI = [('Temperate', range(1, 7)), ('Fredde', range(7, 10)), ('Calde', range(10, 14)), ('Mare', range(14, 16)), ('Speciali', range(16, 18))]
def gruppo(n): return next(g for g, r in GRUPPI if n in r)
def intervallo(s):
    a, _, b = s.partition('-'); a = 100 if a == '00' else int(a); b = a if not b else 100 if b == '00' else int(b)
    return a, b

# ---------------- Capitolo 3: zone, stagioni, tabelle, particolarità
zone, stagioni, tabelle = [], {}, {}
sotterraneo = []
inizi = [i for i in range(CAP3, CAP4) if re.match(r'^(\d+)\. ', G[i]) and not G[i].startswith('• ')]
for k, i in enumerate(inizi):
    fine = inizi[k + 1] if k + 1 < len(inizi) else CAP4
    n, nome = re.match(r'^(\d+)\. (.+)$', G[i]).groups(); n = int(n); zid = str(n)
    z = {'id': zid, 'n': n, 'nome': nome, 'gruppo': gruppo(n), 'descrizione': G[i + 1], 'particolarita': []}
    stagioni[zid], tabelle[zid] = [], {}
    j = i + 2
    while j < fine:
        if G[j] == '[TABELLA]':
            rows, j2 = tabella(j)
            if rows[0][0] == 'd%' and len(rows[0]) == 4:
                for col in (1, 3):
                    m = re.match(r'^(.+?) \((\d+) (\w+) – (\d+) (\w+)\)$', rows[0][col])
                    snome, g1, m1, g2, m2 = m.groups(); sid = ID_STAGIONE[snome]
                    stagioni[zid].append({'id': sid, 'nome': snome, 'da': [int(g1), MESI[m1]], 'a': [int(g2), MESI[m2]]})
                    tabelle[zid][sid] = [{'da': intervallo(r[col - 1])[0], 'a': intervallo(r[col - 1])[1], 'testo': r[col]} for r in rows[1:] if r[col - 1]]
            elif rows[0] == ['d%', 'Condizione', 'Effetti']:
                for r in rows[1:]:
                    a, b = intervallo(r[0]); sotterraneo.append({'da': a, 'a': b, 'nome': r[1], 'testo': r[2]})
            j = j2; continue
        if G[j] == 'Particolarità':
            z['particolarita'], j = puntate(j + 1); continue
        if G[j] == 'Condizioni del sotterraneo': j += 1; continue
        if n == 16 and j == i + 1: j += 1; continue
        raise SystemExit(f'riga inattesa nella zona {n}: {G[j]}')
    zone.append(z)
assert len(zone) == 17, len(zone)

# stagione del mese per il calendario personalizzato: primavera ed estate → prima stagione, autunno e inverno → seconda
stagione_del_mese = {}
for z in zone:
    s = stagioni[z['id']]
    if not s: stagione_del_mese[z['id']] = None
    elif len(s) == 4: stagione_del_mese[z['id']] = {x: x for x in ('primavera', 'estate', 'autunno', 'inverno')}
    else: stagione_del_mese[z['id']] = {'primavera': s[0]['id'], 'estate': s[0]['id'], 'autunno': s[1]['id'], 'inverno': s[1]['id']}

# varianti di zona (particolarità del Cap. 3 che cambiano le voci del giorno)
VARIANTI = {
 '6': [{'id': 'oltre4500', 'nome': 'oltre 4.500 m', 'frase': 'Oltre i 4.500 m il Clima freddo diventa Gelo e il Gelo diventa Gelo polare.',
        'sostituisci': {'Clima freddo': ['Gelo'], 'Gelo': ['Gelo polare']}}],
 '12': [{'id': 'steppa_fredda', 'nome': 'steppa fredda', 'stagione': 'secca', 'frase': "Steppa fredda: nella stagione secca il Clima caldo diventa Clima freddo e l'Arsura diventa Gelo.",
        'sostituisci': {'Clima caldo': ['Clima freddo'], 'Arsura': ['Gelo']}}],
 '13': [{'id': 'lontano_costa', 'nome': 'lontano dalla costa', 'frase': "Lontano dalla costa l'Uragano diventa Tempesta di vento + Monsone.",
        'sostituisci': {'Uragano': ['Tempesta di vento', 'Monsone']}}],
}
SENZA_LEGNA = {'3': 'Brughiere e lande', '8': 'Tundra', '9': 'Ghiacci artici', '10': 'deserti', '11': 'deserti', '15': 'Oceano'}  # «Fuoco» in Ripari e fuoco
NOTTI_FREDDE = {'zone': ['10', '11'], 'frase': 'Notti fredde: dalle 22 alle 6 vale il Clima freddo; dalle 6 alle 10 e dalle 18 alle 22 vale il Clima caldo.',
    'notte': [22, 6], 'tiepido': [[6, 10], [18, 22]]}
for z in zone:
    z['varianti'] = VARIANTI.get(z['id'], [])
    z['mare'] = any('stato del mare' in p.lower() for p in z['particolarita'])
    z['notti_fredde'] = z['id'] in NOTTI_FREDDE['zone']
    z['legna'] = z['id'] not in SENZA_LEGNA

# ---------------- Capitolo 1: tiro, stagioni, durate, previsioni, stato del mare
def par_dopo(t): return G[idx(t) + 1]
durate = {'frase': par_dopo('Quanto dura il tempo'),
    'lunghe': ['Acquazzone', 'Monsone', 'Temporale', 'Grandine', 'Neve fitta', 'Tormenta', 'Tempesta di vento', 'Uragano',
               'Tempesta di grandine', 'Tempesta di polvere', 'Tempesta di sabbia', 'Tempesta di cenere'],
    'dadi': '2d4', 'nebbia': {'voce': 'Nebbia', 'dadi': '1d4'}, 'arsura': {'voce': 'Arsura', 'da': 10, 'a': 18, 'altrimenti': 'Clima caldo'}}
predire = {'frase': G[idx('Quanto dura il tempo') + 2], 'cd': 15, 'ogni': 5}
rows, _ = tabella_dopo('Stato del mare')
mare = [{'stato': r[0], 'quando': [] if r[1] == 'In tutti gli altri casi' else r[1].split(', '), 'testo_quando': r[1], 'nuotare': int(r[2][3:])} for r in rows[1:]]
tiro_frasi = [G[idx('Il tiro del giorno') + 1], G[idx('Il tiro del giorno') + 2]]

# ---------------- Capitolo 2: fiamme, scala, effetti, regole generali, navigazione
rows, _ = tabella_dopo('Fiamme', CAP2)
fiamme = {'frase': G[idx('Fiamme', CAP2) + 1], 'righe': [{'fonte': r[0], 'spegne': r[1]} for r in rows[1:]]}
i = idx('Scala del clima'); scala = {'frase': G[i + 1], 'righe': puntate(i + 2)[0]}
effetti = {}
i = idx('Effetti', CAP2) + 1
fine_eff = next(j for j in range(i, CAP3) if G[j].startswith('Le condizioni del Sotterraneo'))
while i < fine_eff:
    nome = G[i]; corpo = [G[i + 1]]; i += 2
    b, i = puntate(i); corpo += b
    effetti[nome] = '\n'.join(corpo)
nota_sotterraneo = G[fine_eff]
for s in sotterraneo:
    if s['testo'] != 'Vedi Capitolo 2.': effetti[s['nome']] = s['testo']
# voci delle tabelle → effetto
voci = {}
for nome in effetti:
    if ' / ' in nome:
        if nome.startswith('Tempesta di grandine'):
            for x in ('grandine', 'polvere', 'sabbia', 'cenere'): voci['Tempesta di ' + x] = nome
        else:
            for x in nome.split(' / '): voci[x] = nome
    else: voci[nome] = nome
alias = {'Tempesta di polvere/sabbia': 'Tempesta di sabbia'}  # voce della Guida del DM (campagne vecchie)

def sezione_regole(titolo, fine):
    i = idx(titolo, CAP2) + 1; out = []
    while i < fine:
        if G[i] == '[TABELLA]':
            rows, i = tabella(i); out.append({'tabella': rows}); continue
        if G[i].startswith('• '):
            b, i = puntate(i); out.append({'elenco': b}); continue
        out.append({'testo': G[i]}); i += 1
    return out
iP, iB, iR, iV, iN = (idx(t, CAP2) for t in ('Protezioni', 'Bagnati', 'Ripari e fuoco', 'Viaggi', 'Navigazione'))
regole = [{'titolo': 'Protezioni', 'parti': sezione_regole('Protezioni', iB)}, {'titolo': 'Bagnati', 'parti': sezione_regole('Bagnati', iR)},
          {'titolo': 'Ripari e fuoco', 'parti': sezione_regole('Ripari e fuoco', iV)}, {'titolo': 'Viaggi', 'parti': sezione_regole('Viaggi', iN)}]
navigazione = sezione_regole('Navigazione', CAP3)

# ---------------- Capitolo 4: Foraggiare, acqua, Fame e sete
iF = idx('Foraggiare', CAP4)
foraggiare = {'frase': G[iF + 1], 'avariato_frase': G[iF + 2], 'avariato': {'cd': 12, 'ts': 'Tempra', 'fallimento': 5, 'condizione': 'Nauseato', 'durata': '1d4 ore'}}
rows, j = tabella(iF + 3)
note_raw = G[j]; foraggiare['note_frase'] = note_raw; foraggiare['acqua_frase'] = G[j + 1]
NOTE = dict(re.findall(r'([¹²³⁴⁵]) ([^¹²³⁴⁵]+?)(?= [¹²³⁴⁵]|$)', note_raw))
SUP = '¹²³⁴⁵'
for r in rows[1:]:
    n = int(r[0].split('.')[0]); z = zone[n - 1]; assert r[0] == f"{n}. {z['nome']}", r[0]
    acqua_t = r[3]; note = [c for c in acqua_t if c in SUP]; base = acqua_t.rstrip(SUP)
    if base.startswith('Inclusa'): a = {'tipo': 'inclusa'}
    elif base.startswith('CD '): a = {'tipo': 'cd', 'cd': int(base[3:])}
    elif base == 'No': a = {'tipo': 'no'}
    elif base == 'Solo neve': a = {'tipo': 'neve'}
    else: raise SystemExit('acqua non letta: ' + acqua_t)
    if base.endswith('da bollire'): a['purificare'] = 'bollire'
    a['testo'] = acqua_t; a['note'] = [{'segno': c, 'testo': NOTE[c].strip()} for c in note]
    for c in note:  # regole delle note, applicate dal motore
        if c == '¹': a['neve_variante'] = 'oltre4500'
        if c == '²': a['neve_stagione'] = 'autunno-inverno'
        if c == '³': a['stagione_cd'] = {'secca': 20}
        if c == '⁴': a['senza_prova'] = 'Stillicidio'
        if c == '⁵': a['purificare'] = 'sulfurea'
    z['foraggiare'] = {'cd': int(r[1]), 'ogni': int(r[2]), 'acqua': a, 'avariato': r[4] == '☠'}
rows, j = tabella_dopo('Modificatori alla CD', CAP4)
mod = {'righe': [{'condizione': r[0], 'cd': r[1]} for r in rows[1:]],
       'povera': {'quattro_stagioni': 'inverno', '7': 'autunno-inverno', '8': 'autunno-inverno', '12': 'secca'}, 'povera_cd': 5,
       'piu2': rows[2][0].split(', '), 'piu5': rows[3][0].split(', '), 'impossibile': ['Tempesta', 'Tormenta', 'Uragano'], 'nota': G[j]}
foraggiare['modificatori'] = mod
foraggiare['pesca'] = {'zone': ['5', '14', '15'], 'abilita': 'Professione (pescatore)'}
iA = idx('Acqua', CAP4); acqua_righe, _ = puntate(iA + 1)
acqua = {'righe': acqua_righe, 'litri': 4, 'moltiplicatori': {'Arsura': 2, 'Afa': 2, 'Canicola': 3},
         'pioggia': ['Pioggia battente', 'Acquazzone', 'Monsone', 'Temporale'], 'bollire_min': 10, 'tavoletta': 3, 'sciogliere_ore': 1}
iS, iFa = idx('Sete', CAP4), idx('Fame', CAP4)
fame_sete = {'sete': {'nome': 'Sete', 'scorta': 'acqua', 'giorno_prova': 4, 'cd': 10, 'testo': G[iS + 1] + '\n' + G[iS + 2]},
             'fame': {'nome': 'Fame', 'scorta': 'cibo', 'giorno_prova': 7, 'cd': 10, 'testo': G[iFa + 1] + '\n' + G[iFa + 2]},
             'nota_vol1': 'Affaticato o esausto dovuti a fame o sete si tolgono solo rifocillandosi (Vol. 1).'}
rows, _ = tabella_dopo('Appendice B – Tabella riassuntiva degli effetti')
riassunto = rows

M = {'fonte': 'Tabelle del Tempo Atmosferico v1.0 (Collana/Output/Tabelle_Tempo_Atmosferico_v1.0.docx; estratto in sorgenti/guida/tempo_atmosferico.txt)',
     'versione': 2, 'gruppi': [g for g, _ in GRUPPI], 'zone': zone, 'stagioni': stagioni, 'stagione_del_mese': stagione_del_mese, 'tabelle': tabelle,
     'sotterraneo': {'zona': '16', 'clima': 'Clima fresco', 'righe': sotterraneo, 'nota': nota_sotterraneo},
     'voci': voci, 'alias': alias, 'effetti': effetti, 'tiro': tiro_frasi, 'durate': durate, 'predire': predire, 'mare': mare,
     'notti_fredde': NOTTI_FREDDE, 'senza_legna': SENZA_LEGNA, 'fiamme': fiamme, 'scala': scala, 'regole': regole, 'navigazione': navigazione,
     'foraggiare': foraggiare, 'acqua': acqua, 'fame_sete': fame_sete, 'riassunto': riassunto,
     'migrazione': {'temperata': '1', 'desertica': '10', 'artica': '9'}}
json.dump(M, open(os.path.join(R, 'meteo.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f"zone {len(zone)}, tabelle {sum(len(t) for t in tabelle.values())}, righe {sum(len(r) for t in tabelle.values() for r in t.values())}, effetti {len(effetti)}, voci {len(voci)}, sotterraneo {len(sotterraneo)}")
