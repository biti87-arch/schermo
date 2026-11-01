"""Genera sorgenti/condizioni.json (Build 3a, sezione AB1 del design doc).
Uso: python3 sorgenti/crea_condizioni.py   — poi controllare con controlla_condizioni.py.
Fonti (estratti in sorgenti/guida/):
- golarion_condizioni.txt: pagina «Condizioni» di golarion.altervista.org (letta il 01/11/2026, SHA-256 504fc714…);
- vol1_condizioni.txt e vol1_regole.txt: Vol. 1 2.5.2 senza immagini;
- vol3_riparare.txt: Vol. 3 2.5.8, «Riparare oggetti rotti» (Scheggiato, Rotto);
- guida_dm.txt: Guida del DM (pdftotext -layout), tabella «Condizioni» (righe di sintesi) e «Cure e recupero».
I testi di golarion restano integrali; gli adattamenti alle regole della Collana (AB1-2) sono sostituzioni esatte scritte qui (ADATTA)."""
import json, os, re
R = os.path.dirname(os.path.abspath(__file__))
G = lambda f: open(os.path.join(R, 'guida', f), encoding='utf8').read()

# --- golarion: sezioni «H2 Nome» / «H3 Nome» separate da una riga vuota
GOL = {}
for b in G('golarion_condizioni.txt').strip().split('\n\n'):
    r = b.split('\n'); liv, nome = r[0].split(' ', 1)
    GOL[nome] = {'liv': liv, 'righe': r[1:]}
assert len(GOL) == 40, len(GOL)

# --- Vol. 1
V1 = {}
for r in G('vol1_condizioni.txt').split('\n'):
    m = re.match(r'•\s+([^:(]+?)(?: \(%\))?: (.*)', r)
    if m: V1[m.group(1)] = r[r.index(m.group(1)):].strip()
REG1 = {}
sez = None
for r in G('vol1_regole.txt').split('\n'):
    if r.startswith('## '): sez = r[3:]; REG1[sez] = []
    elif r.strip(): REG1[sez].append(re.sub(r'^•\s+', '', r.strip()))

# --- Vol. 3: Riparare oggetti rotti (solo la parte di testo, la tabella va nel Prontuario della Build 3b)
V3 = [r for r in G('vol3_riparare.txt').split('\n') if r.strip()]
def v3_dopo(titolo, n):
    i = V3.index(titolo); return V3[i + 1:i + 1 + n]

# --- Guida: righe di sintesi (tabella «Condizioni», pdftotext -layout: alcune righe vanno a capo e il nome sta nella riga di mezzo)
GUIDA = G('guida_dm.txt')
norm = lambda s: ' '.join(s.split())
SINTESI = {  # testo della Guida (spazi normalizzati); controllato da controlla_condizioni.py
 'Abbagliato': '-1 TpC e prove di Percezione',
 'Accecato': '-2 CA, no Des, -4 prove su For, Des e Percezione, prova di Acrobazia CD 10 per andare a più di velocità dimezzata o cade prona, considera gli avversari occultati al 50%',
 'Affascinato': 'Sta tranquilla senza compiere azioni; -4 Percezione; si libera se attaccata',
 'Assordato': '-4 Iniziativa, fallisce prove di percezione basate sull’udito; 20% di fallimento incantesimi vocali',
 'Azzoppato': 'Movimento dimezzato e non si può compiere passi di 1,5 m',
 'Barcollante': 'O azione di movimento o azione standard',
 'Confuso': 'Tira d100: 1-25 agisce normalmente; 26-50: non agisce; 51-75: si infligge 1d8+For; 76-00: attacca il più vicino',
 'Frastornato': 'Non può agire ma non ha penalità alla CA',
 'Immobilizzato': 'No azioni di movimento ed è impreparato. -4 CA, no Des alla CA e alla DMC, no AdO senza Riflessi in combattimento o Schivare prodigioso. No azioni immediate',
 'Impreparato': 'No Des alla CA e alla DMC, non può effettuare AdO senza Riflessi in combattimento. Nessuna azione immediata',
 'Incorporeo': 'Immune a qualsiasi azione fisica non magica, subisce metà danni da armi magiche, incantesimi, etc.',
 'In Lotta': '-4 Des, -2 ai TpC e alle manovre in combattimento e non possono usare azioni con due mani',
 'Indifeso': 'Des 0 (-5); gli avversari hanno +4 ai TpC; può subire un Colpo di grazia',
 'Infermo': '-2 TpC, danni, TS e prove',
 'Intralciato': 'Non può correre o caricare, Velocità dimezzata, -2 TpC e -4 Des; concentrazione per lanciare incantesimi',
 'Invisibile': '+2 TpC contro creature visibili, nega Des, occultamento totale ma individuabile con Percezione CD 20',
 'Morente': 'Una creatura vivente sconfitta durante un combattimento ha il 20% di essere morente per un minuto.',
 'Nauseato': 'Solo un’azione di movimento per turno',
 'Offuscato': 'Probabilità di mancare con ogni singolo attacco, incantesimo, capacità o azione che richieda un bersaglio che sia diverso da sé stessa.',
 'Paralizzato': 'Ha For e Des 0 (-5); gli avversari hanno +4 ai TpC; può subire colpi di grazia',
 'Prono': '-4 TpC e CA in mischia, nessun attacco a distanza (solo balestre), si rialza subendo AdO, +4 CA contro attacchi a distanza',
 'Sempre pronto': 'non subisce la penalità di -6 alle prove di Iniziativa quando viene colta di sorpresa. Subisce comunque le altre consuete penalità nel primo round di combattimento (bonus di Destrezza negato alla CA, possibilità di subire attacchi furtivi, etc.).',
 'Stordito': 'Fa cadere oggetti di mano, non può agire, -2 CA e no Des',
 'Scosso': '-2 TpC, TS e prove',
 'Spaventato': 'Come scosso ma fugge dalla fonte della paura e rifugge se essa si ripresenta per la durata di quell’effetto di paura',
 'In Preda al Panico': 'Come spaventato ma fa cadere al 50% oggetti di mano; se non può fuggire diventa accovacciato',
 'Accovacciato': 'Non può compiere azioni, -2 CA, no Des',
 'Affaticato': 'Non può correre o caricare, -2 For e Des; diventa esausta se compie azione affaticante',
 'Esausto': 'Come affaticato ma velocità dimezzata, -6 For e Des. Dopo 1 ora di riposo diventa affaticata.',
}
for k in ('Addormentato', 'Bloccato', 'Legato', 'Privo di Sensi'): SINTESI[k] = SINTESI['Indifeso']
SINTESI_APP = {  # condizioni senza riga nella Guida: sintesi scritta per l'app dai testi della scheda
 'Colto alla sprovvista': 'Bonus di Destrezza negato alla CA',
 'Inabile': 'O azione di movimento o azione standard; velocità dimezzata',
 'Morto': 'Fuori gioco; solo la magia può riportarlo in vita',
 'Pietrificato': 'Trasformato in pietra; conta come privo di sensi',
 'Rotto': 'Armi −4 TpC e critico 20/×2; armature e scudi 1/3 del bonus, penalità di armatura doppia; oggetti vari senza beneficio',
 'Scheggiato': 'Armi −2 TpC e critico 20/×2; armature e scudi metà bonus, penalità di armatura doppia; oggetti vari senza beneficio',
 'Sanguinante': 'Subisce il danno indicato all’inizio del suo turno; si ferma con Professione (cerusico) CD 10, Sopravvivenza CD 15 o la magia',
 'Stabilizzato': 'Emorragie fermate: non rischia più di morirne',
 'Livelli negativi': '−1 a prove, TpC, TS, BMC e DMC per livello; −5 al totale di Fatica e Ferita per livello',
}

# --- adattamenti alle regole della Collana (AB1-2): (vecchio, nuovo) sostituiti una sola volta
INV_GUIDA = 'Ha occultamento totale (50% di probabilità di essere mancata), ma è individuabile con una prova di Percezione CD 20 (Guida del DM).'
ADATTA = {
 'Invisibile': [(' Vedi Invisibilità.', '')],
 'Livelli Negativi': [('Inoltre, la creatura riduce i suoi Punti Ferita totali e correnti per una quantità di 5 PF per ogni livello negativo posseduto.',
                       'Inoltre, la creatura riduce il totale dei suoi Punti Fatica e Punti Ferita, massimi e correnti, di 5 per ogni livello negativo (metà ai Fatica e metà ai Ferita, il punto dispari ai Ferita).')],
 'Morto': [('I punti ferita del personaggio sono ridotti ad una quantità pari alla sua Costituzione in negativo, la sua Costituzione scende a zero, o un incantesimo o un effetto lo uccidono sul colpo.',
            'Il personaggio muore per una Ferita grave (riga «Sei morto», emorragie), quando i danni alla Costituzione ne eguagliano il punteggio, quando i livelli negativi eguagliano i Dadi Vita, o per un incantesimo o un effetto che uccide sul colpo.')],
 'Privo di Sensi': [('La condizione può risultare dall’avere Punti Ferita negativi (ma non superiori al punteggio di Costituzione della creatura), oppure nel caso in cui i Danni Non Letali superino i Punti Ferita attuali.',
                     'La condizione può risultare da una Ferita grave o dai Danni Non Letali che superano i Punti Ferita attuali.')],
 'Sanguinante': [('Il sanguinamento può essere interrotto superando una prova di Guarire con CD 15 o con un incantesimo che cura i Punti Ferita (anche se il sanguinamento è un danno di caratteristica).',
                  'Il sanguinamento può essere interrotto con una prova di Professione (cerusico) CD 10, con una prova di Sopravvivenza CD 15 o con la magia (Vol. 1).')],
 'Stordito': [('\nFonte: http://www.d20pfsrd.com/gamemastering/conditions', '')],
}
NOTE_ADATTA = {
 'Impreparato': 'Aggiunta la regola del Vol. 1 «Essere impreparati».',
 'Inabile': 'Tenuti solo gli effetti: il testo di golarion parla di 0 PF, PF negativi e morente, che nella Collana non esistono.',
 'Invisibile': 'Tolto il rimando all’incantesimo Invisibilità (non esiste); aggiunta la riga della Guida.',
 'Livelli negativi': 'Nella Collana i 5 PF per livello si tolgono dal totale di Punti Fatica e Punti Ferita (Massy, 01/11/2026).',
 'Morto': 'Prima frase riscritta: nella Collana si muore per le Ferite gravi, non per i PF negativi; aggiunta la riga del Vol. 1 sul Morente.',
 'Privo di Sensi': 'Nella Collana i PF negativi non esistono: si perdono i sensi per una Ferita grave o per i danni non letali.',
 'Sanguinante': 'Guarire non è un’abilità del sistema: vale la regola del Vol. 1 «Sanguinamento».',
 'Stabilizzato': 'Il testo di golarion descrive il morente di Pathfinder, che nella Collana non esiste: testo riscritto (Massy, 01/11/2026).',
 'Affaticato': 'Aggiunta la regola del Vol. 1 su fame e sete.', 'Esausto': 'Aggiunta la regola del Vol. 1 su fame e sete.',
}
def gol(nome):
    t = '\n'.join(GOL[nome]['righe'])
    for a, b in ADATTA.get(nome, []):
        assert t.count(a) == 1, (nome, a); t = t.replace(a, b)
    return t.split('\n')
FAME = [x for x in REG1['Condizioni ed effetti'] if x.startswith('Affaticato o esausto')]
ELENCO = ['Azzoppato', 'Colto alla sprovvista', 'Offuscato', 'Sempre pronto', 'Affaticato', 'Abbagliato', 'Accecato', 'Accovacciato', 'Affascinato',
          'Assordato', 'Barcollante', 'Confuso', 'Esausto', 'Frastornato', 'Immobilizzato', 'Impreparato', 'In Lotta', 'Inabile', 'Incorporeo', 'Indifeso',
          'Infermo', 'Intralciato', 'Invisibile', 'Morto', 'Nauseato', 'Paralizzato', 'Scosso', 'Spaventato', 'In Preda al Panico', 'Pietrificato',
          'Privo di Sensi', 'Prono', 'Rotto', 'Sanguinante', 'Scheggiato', 'Stabilizzato', 'Stordito']
assert len(ELENCO) == 37
GRUPPO = {'Scosso': 'Paura', 'Spaventato': 'Paura', 'In Preda al Panico': 'Paura', 'Accovacciato': 'Paura', 'Affaticato': 'Fatica', 'Esausto': 'Fatica',
          'Indifeso': 'Indifeso', 'Addormentato': 'Indifeso', 'Bloccato': 'Indifeso', 'Legato': 'Indifeso', 'Paralizzato': 'Indifeso', 'Privo di Sensi': 'Indifeso',
          'Scheggiato': 'Oggetti', 'Rotto': 'Oggetti', 'Azzoppato': 'Nuove', 'Colto alla sprovvista': 'Nuove', 'Morente': 'Nuove', 'Offuscato': 'Nuove', 'Sempre pronto': 'Nuove'}
EFFETTO = {  # cosa applica l'app ai valori del riquadro (G2 + AB1-3)
 'Colto alla sprovvista': 'la CA mostrata è quella colto alla sprovvista', 'Offuscato': 'vale solo la % più alta',
 'Abbagliato': 'Percezione −1', 'Accecato': 'CA −2, Percezione −4', 'Affascinato': 'Percezione −4', 'Assordato': 'Iniziativa −4',
 'Impreparato': 'la CA mostrata è quella colto alla sprovvista', 'Infermo': 'TS e abilità −2',
 'Scosso': 'TS e abilità −2', 'Spaventato': 'TS e abilità −2', 'In Preda al Panico': 'TS e abilità −2',
 'Accovacciato': 'CA −2; la CA mostrata è quella colto alla sprovvista', 'Stordito': 'CA −2; la CA mostrata è quella colto alla sprovvista',
 'Immobilizzato': 'la CA mostrata è quella colto alla sprovvista, −4',
 'Indifeso': 'etichetta «Des 0, +4 ai TpC in mischia contro»', 'Paralizzato': 'etichetta «Des 0, +4 ai TpC in mischia contro»', 'Privo di Sensi': 'etichetta «Des 0, +4 ai TpC in mischia contro»',
 'Prono': '−4 CA in mischia / +4 a distanza', 'Confuso': 'all’inizio del suo turno la barra del turno tira il d%',
 'Affaticato': 'su chi è già affaticato diventa Esausto; il Riposo 8 ore lo toglie (non se viene da fame o sete)',
 'Esausto': 'il Riposo 8 ore lo toglie (non se viene da fame o sete)',
 'Morente': 'condizione narrativa degli ultimi istanti',
 'Livelli negativi': 'TS, abilità e DMC −N; Fatica e Ferita (massimi e correnti) −5 per livello, metà e metà, il dispari ai Ferita',
}
for k in ('Scosso', 'Spaventato'): EFFETTO[k] += '; su chi ha già paura vale il Terrore crescente'

def voce(nome, testo, fonte, sezioni=None, rossa=True, gruppo=None):
    s = SINTESI.get(nome) or SINTESI_APP.get(nome, '')
    return {'nome': nome, 'gruppo': gruppo or GRUPPO.get(nome, 'Altre'), 'rossa': rossa, 'effetto': EFFETTO.get(nome, ''),
            'sintesi': s, 'sintesi_fonte': 'Guida del DM' if nome in SINTESI else 'app', 'testo': testo, 'sezioni': sezioni or [],
            'fonte': fonte, 'adattato': NOTE_ADATTA.get(nome, '')}
GOLF = 'golarion.altervista.org, Condizioni'
out = []
for n in ELENCO:
    if n in ('Azzoppato', 'Colto alla sprovvista', 'Offuscato', 'Sempre pronto'):
        out.append(voce(n, [V1[n]], 'Vol. 1 2.5.2, Nuove condizioni'))
    elif n == 'Impreparato':
        out.append(voce(n, gol(n) + ['Essere impreparati (Vol. 1): ' + REG1['Essere impreparati'][0]], GOLF + ' + Vol. 1 2.5.2'))
    elif n == 'Inabile':
        r = GOL[n]['righe'][0]; i = r.index('Può compiere'); j = r.index('Si muove a velocità dimezzata.') + len('Si muove a velocità dimezzata.')
        out.append(voce(n, ['Un personaggio inabile p' + r[i + 1:j]], GOLF + ' (adattato)'))
    elif n == 'Invisibile':
        out.append(voce(n, gol(n) + [INV_GUIDA], GOLF + ' + Guida del DM'))
    elif n == 'Morto':
        morente = V1['Morente']; k = morente.index('Una creatura vivente che muore')
        out.append(voce(n, gol(n) + [morente[k:] + ' (Vol. 1)'], GOLF + ' (adattato) + Vol. 1 2.5.2'))
    elif n == 'Sanguinante':
        out.append(voce(n, gol(n) + ['Le emorragie delle Ferite gravi si fermano invece con la tabella «Fermare le emorragie» (Vol. 3).'], GOLF + ' (adattato) + Vol. 1 2.5.2'))
    elif n == 'Stabilizzato':
        out.append(voce(n, ['Una creatura le cui emorragie sono state fermate (Professione (cerusico) o magia) è stabilizzata: non rischia più di morire per quelle emorragie, ma le ferite gravi restano finché non sono curate.'], 'Collana (Massy, 01/11/2026)'))
    elif n in ('Affaticato', 'Esausto'):
        out.append(voce(n, gol(n) + FAME, GOLF + ' + Vol. 1 2.5.2'))
    elif n == 'Indifeso':
        out.append(voce(n, gol(n), GOLF, [{'titolo': 'Colpo di grazia', 'testo': gol('Colpo di Grazia')}]))
    elif n == 'Scheggiato':
        out.append(voce(n, [V3[1]] + v3_dopo('Penalità degli oggetti scheggiati', 3) + v3_dopo('Riparare gli oggetti scheggiati', 1), 'Vol. 3 2.5.8, Riparare oggetti rotti'))
    elif n == 'Rotto':
        out.append(voce(n, [V3[1]] + v3_dopo('Penalità degli oggetti rotti', 3) + v3_dopo('Riparare gli oggetti rotti', 1), 'Vol. 3 2.5.8, Riparare oggetti rotti',
                        [{'titolo': 'Oggetti distrutti', 'testo': v3_dopo('Oggetti distrutti', 1)}]))
    else:
        f = GOLF + (' (adattato)' if n in ADATTA else '')
        out.append(voce(n, gol(n), f))
out.append(voce('Morente', [V1['Morente']], 'Vol. 1 2.5.2, Nuove condizioni', rossa=False))
for n in ('Addormentato', 'Bloccato', 'Legato'):   # stati di Indifeso: non sono fra le 37 condizioni in rosso
    out.append(voce(n, ['È uno degli stati che rendono Indifeso: vedi Indifeso.'], GOLF + ', Indifeso', rossa=False))
LN = [{'titolo': t, 'testo': gol(g)} for t, g in (('Livelli negativi temporanei', 'Livelli Negativi Temporanei'), ('Livelli negativi permanenti', 'Livelli Negativi Permanenti'), ('Ristorare livelli negativi', 'Ristorare Livelli Negativi'))]
out.append(voce('Livelli negativi', gol('Livelli Negativi'), GOLF + ' (adattato)', LN, rossa=False, gruppo='Altre'))

# --- voci di regola (in nero): Paura (con Terrore crescente), danni non letali, danni alle caratteristiche (Guida, «Cure e recupero»)
def guida_par(titolo, fine):
    i = GUIDA.index(titolo + '\n'); j = GUIDA.index(fine, i)
    blocco = GUIDA[i + len(titolo):j].strip()
    par = []   # una riga nuova apre un paragrafo solo se la precedente finisce con il punto
    for r in blocco.split('\n'):
        r = r.strip()
        if not r: continue
        if par and not par[-1].endswith('.'): par[-1] += ' ' + r
        else: par.append(r)
    return [norm(p) for p in par]
REFUSI_GUIDA = [('ma con di penalità', 'ma con penalità')]   # refusi della Guida corretti nei testi (§W del design doc)
def guida_corr(lista):
    out = []
    for p in lista:
        for x, y in REFUSI_GUIDA: p = p.replace(x, y)
        out.append(p)
    return out
regole = [
 {'nome': 'Paura', 'gruppo': 'Paura', 'testo': gol('Paura'), 'sezioni': [{'titolo': 'Terrore crescente', 'testo': gol('Terrore Crescente')}], 'fonte': GOLF},
 {'nome': 'Danni non letali', 'gruppo': 'Regole', 'testo': guida_corr(guida_par('Danni non letali', 'Danni alle caratteristiche')), 'sezioni': [], 'fonte': 'Guida del DM, Cure e recupero'},
 {'nome': 'Danni alle caratteristiche', 'gruppo': 'Regole', 'testo': guida_par('Danni alle caratteristiche', 'Livelli negativi'), 'sezioni': [], 'fonte': 'Guida del DM, Cure e recupero'},
]
CONFUSO = [{'da': 1, 'a': 25, 'testo': 'Agisce normalmente'}, {'da': 26, 'a': 50, 'testo': 'Non fa altro che balbettare in modo incoerente'},
           {'da': 51, 'a': 75, 'testo': "Si infligge 1d8 + modificatore di Forza con l'arma che tiene in mano"},
           {'da': 76, 'a': 100, 'testo': 'Attacca la creatura più vicina (a tale scopo, un Famiglio conta come parte del soggetto stesso)'}]
dati = {'fonte': 'golarion.altervista.org (Condizioni, letta il 01/11/2026), Vol. 1 2.5.2, Vol. 3 2.5.8, Guida del DM',
        'gruppi': ['Paura', 'Fatica', 'Indifeso', 'Oggetti', 'Nuove', 'Altre', 'Regole'],
        'condizioni': out, 'regole': regole, 'confuso': CONFUSO,
        'note': ['Guida, Danni non letali: «ma con di penalità» → «ma con penalità».', 'Guida, Indifeso: l’asterisco «*» dopo «Colpo di grazia» non ha una nota nel PDF; tolto nella sintesi.']}
json.dump(dati, open(os.path.join(R, 'condizioni.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('condizioni.json:', len(out), 'condizioni,', len(regole), 'voci di regola,', sum(1 for x in out if x['adattato']), 'adattate')
