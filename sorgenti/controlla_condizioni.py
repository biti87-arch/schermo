"""Controlla sorgenti/condizioni.json sulle fonti (estratti in sorgenti/guida/). Stampa solo errori e conteggi.
Uso: python3 sorgenti/controlla_condizioni.py"""
import json, os, re, hashlib
R = os.path.dirname(os.path.abspath(__file__))
G = lambda f: open(os.path.join(R, 'guida', f), encoding='utf8').read()
D = json.load(open(os.path.join(R, 'condizioni.json'), encoding='utf8'))
n_ok = n_err = 0
def ok(c, msg):
    global n_ok, n_err
    if c: n_ok += 1
    else: n_err += 1; print('ERRORE:', msg)
norm = lambda s: ' '.join(s.split())

gtxt = G('golarion_condizioni.txt')
ok(hashlib.sha256(gtxt.rstrip('\n').encode()).hexdigest().startswith('504fc714'), 'golarion_condizioni.txt diverso dalla pagina letta il 01/11 (SHA-256 504fc714…)')
GOL = {}
for b in gtxt.strip().split('\n\n'):
    r = b.split('\n'); GOL[r[0].split(' ', 1)[1]] = r[1:]
V1 = G('vol1_condizioni.txt') + G('vol1_regole.txt')
V3 = G('vol3_riparare.txt')
GUIDA = norm(G('guida_dm.txt'))

C = {x['nome']: x for x in D['condizioni']}
ELENCO = ['Azzoppato', 'Colto alla sprovvista', 'Offuscato', 'Sempre pronto', 'Affaticato', 'Abbagliato', 'Accecato', 'Accovacciato', 'Affascinato',
          'Assordato', 'Barcollante', 'Confuso', 'Esausto', 'Frastornato', 'Immobilizzato', 'Impreparato', 'In Lotta', 'Inabile', 'Incorporeo', 'Indifeso',
          'Infermo', 'Intralciato', 'Invisibile', 'Morto', 'Nauseato', 'Paralizzato', 'Scosso', 'Spaventato', 'In Preda al Panico', 'Pietrificato',
          'Privo di Sensi', 'Prono', 'Rotto', 'Sanguinante', 'Scheggiato', 'Stabilizzato', 'Stordito']
for n in ELENCO: ok(n in C and C[n]['rossa'], f'{n}: manca o non è in rosso')
ok(len([x for x in D['condizioni'] if x['rossa']]) == 37, 'in rosso solo le 37 condizioni (non Addormentato, Bloccato, Legato, Livelli negativi, Morente)')
ok('Morente' in C and not C['Morente']['rossa'], 'Morente non si colora')
for n in ('Addormentato', 'Bloccato', 'Legato', 'Livelli negativi'): ok(n in C, f'{n} manca')

# testi integrali di golarion (le condizioni non adattate)
INTEGRALI = ['Abbagliato', 'Accecato', 'Accovacciato', 'Affascinato', 'Assordato', 'Barcollante', 'Confuso', 'Frastornato', 'Immobilizzato', 'In Lotta',
             'Incorporeo', 'Indifeso', 'Infermo', 'Intralciato', 'Nauseato', 'Paralizzato', 'Pietrificato', 'Prono', 'Scosso', 'Spaventato', 'In Preda al Panico']
for n in INTEGRALI: ok(C[n]['testo'] == GOL[n] and not C[n]['adattato'], f'{n}: testo diverso da golarion')
ok(C['Indifeso']['sezioni'][0]['testo'] == GOL['Colpo di Grazia'], 'Colpo di grazia diverso da golarion')
for n in ('Affaticato', 'Esausto', 'Impreparato'): ok(C[n]['testo'][:len(GOL[n])] == GOL[n], f'{n}: la parte di golarion è cambiata')
ok(C['Stordito']['testo'] == GOL['Stordito'][:-1], 'Stordito: testo di golarion senza la riga «Fonte»')
LN = [s['testo'] for s in C['Livelli negativi']['sezioni']]
ok(LN == [GOL['Livelli Negativi Temporanei'], GOL['Livelli Negativi Permanenti'], GOL['Ristorare Livelli Negativi']], 'sezioni dei livelli negativi diverse da golarion')
R0 = {r['nome']: r for r in D['regole']}
ok(R0['Paura']['testo'] == GOL['Paura'] and R0['Paura']['sezioni'][0]['testo'] == GOL['Terrore Crescente'], 'Paura e Terrore crescente diversi da golarion')

# adattamenti: il testo nuovo c'è, il vecchio no; il resto del paragrafo è quello di golarion
ADATTATE = {
 'Livelli negativi': ('Livelli Negativi', 'riduce i suoi Punti Ferita totali e correnti', 'riduce il totale dei suoi Punti Fatica e Punti Ferita, massimi e correnti, di 5 per ogni livello negativo (metà ai Fatica e metà ai Ferita, il punto dispari ai Ferita)'),
 'Morto': ('Morto', 'Costituzione in negativo', 'Il personaggio muore per una Ferita grave (riga «Sei morto», emorragie)'),
 'Privo di Sensi': ('Privo di Sensi', 'Punti Ferita negativi', 'La condizione può risultare da una Ferita grave o dai Danni Non Letali che superano i Punti Ferita attuali.'),
 'Sanguinante': ('Sanguinante', 'Guarire', 'Professione (cerusico) CD 10, con una prova di Sopravvivenza CD 15 o con la magia (Vol. 1)'),
 'Invisibile': ('Invisibile', 'Vedi Invisibilità', 'individuabile con una prova di Percezione CD 20'),
}
for n, (g, vecchio, nuovo) in ADATTATE.items():
    t = '\n'.join(C[n]['testo']); ok(nuovo in t and vecchio not in t and C[n]['adattato'], f'{n}: adattamento mancante')
    # le frasi di golarion non toccate dall'adattamento restano
    frasi = [f for f in re.split(r'(?<=\.) ', ' '.join(GOL[g])) if vecchio not in f and 'Fonte:' not in f]
    ok(all(f in t for f in frasi), f'{n}: una frase di golarion è cambiata')
ok(C['Inabile']['testo'][0][len('Un personaggio inabile p'):] in GOL['Inabile'][0] and 'morente' not in ' '.join(C['Inabile']['testo']), 'Inabile: effetti di golarion senza 0 PF e morente')
ok('Stabilizzato' in C and 'emorragie sono state fermate' in C['Stabilizzato']['testo'][0], 'Stabilizzato: testo della Collana')

# Vol. 1 e Vol. 3
for n in ('Azzoppato', 'Colto alla sprovvista', 'Offuscato', 'Sempre pronto', 'Morente'): ok(C[n]['testo'][0] in V1, f'{n}: testo diverso dal Vol. 1')
for n in ('Affaticato', 'Esausto'): ok(C[n]['testo'][-1] in V1 and 'fame o sete' in C[n]['testo'][-1], f'{n}: manca la regola del Vol. 1')
ok(C['Impreparato']['testo'][-1].split(': ', 1)[1] in V1, 'Impreparato: «Essere impreparati» diverso dal Vol. 1')
ok(C['Morto']['testo'][-1].replace(' (Vol. 1)', '') in V1, 'Morto: riga del Morente diversa dal Vol. 1')
for n in ('Scheggiato', 'Rotto'):
    for p in C[n]['testo'] + [x for s in C[n]['sezioni'] for x in s['testo']]: ok(p in V3, f'{n}: «{p[:40]}» non è nel Vol. 3')
ok('−4' in C['Rotto']['sintesi'] and '-4 ai tiri per colpire' in ' '.join(C['Rotto']['testo']), 'Rotto: penalità del Vol. 3')

# Guida
for x in D['condizioni']:
    if x['sintesi_fonte'] == 'Guida del DM':   # nelle righe che vanno a capo il PDF mette il nome a metà della sintesi
        nomi = {'Offuscato': 'Offuscato (xx%)', 'Sempre pronto': 'Sempre pronta'}.get(x['nome'], x['nome'])
        ok(norm(x['sintesi']) in GUIDA or norm(x['sintesi']) in GUIDA.replace(' ' + nomi + ' ', ' '), f"{x['nome']}: sintesi non trovata nella Guida")
    ok(x['sintesi'], f"{x['nome']}: senza sintesi")
for r in D['regole'][1:]:
    for p in r['testo']: ok(norm(p).replace('ma con penalità', 'ma con di penalità') in GUIDA, f"{r['nome']}: testo diverso dalla Guida")

# nessuna regola che nella Collana non esiste
TUTTO = json.dumps([{k: v for k, v in x.items() if k != 'adattato'} for x in D['condizioni']] + D['regole'], ensure_ascii=False)   # le note di adattamento possono citarle
for vietato in ('Guarire', 'd20pfsrd', 'Vedi Invisibilità', 'Artigianato'):
    ok(vietato not in TUTTO, f'«{vietato}» nei testi')
for x in D['condizioni']:
    if x['nome'] not in ('Morente', 'Morto'):
        t = ' '.join(x['testo'] + [y for s in x['sezioni'] for y in s['testo']])
        ok('morente' not in t.lower() and 'punti ferita negativi' not in t.lower(), f"{x['nome']}: parla di morente o PF negativi")

# tabella di Confuso uguale a golarion
righe = [r for r in GOL['Confuso'] if re.match(r'\d', r)]
ok([f"{c['da']:02d}-{c['a']}" if c['a'] < 100 else f"{c['da']}-100" for c in D['confuso']] == [r.split(' | ')[0] for r in righe] and [c['testo'] for c in D['confuso']] == [r.split(' | ')[1] for r in righe], 'tabella di Confuso diversa da golarion')
print(f'controllo condizioni: {n_ok + n_err} controlli, {n_err} errori; condizioni {len(D["condizioni"])}, regole {len(D["regole"])}, adattate {sum(1 for x in D["condizioni"] if x["adattato"])}')
