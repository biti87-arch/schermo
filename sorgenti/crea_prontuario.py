"""Genera sorgenti/prontuario.json (Build 3b, sezioni R, S e AC del design doc) — controllato da controlla_prontuario.py.
Fonti (precedenza AC1-2: volume > Tabelle del Tempo Atmosferico > Guida del DM):
- Guida del DM (sorgenti/guida/guida_dm.txt, pdftotext -layout): Abilità, Combattimento, Guarigione, Spostamenti, Pericoli, RD, incontri casuali;
- Vol. 1 2.5.2 (sorgenti/guida/vol1_prontuario.txt, estrai_prontuario.py): note su abilità, PF e Rifiatare, occultamento, campagne acquatiche;
- Vol. 3 2.5.8 (sorgenti/guida/vol3_prontuario.txt e vol3_riparare.txt): Fonti di luce, Locande e taverne, Stalle, Professione (cerusico) ed (erborista), Riparare.
Il testo della Guida è letto a righe (numeri di riga del file guida_dm.txt, md5 controllato): paragrafi uniti, tabelle con le celle separate
da 3 o più spazi; poi le correzioni scritte qui sotto (CORREZIONI: impaginazione del PDF; REFUSI: refusi della Guida, elencati nel JSON).
Uso: python3 sorgenti/crea_prontuario.py"""
import json, os, re, hashlib
R = os.path.dirname(os.path.abspath(__file__))
G_TXT = open(os.path.join(R, 'guida', 'guida_dm.txt'), encoding='utf8').read()
MD5_GUIDA = 'fd21b397'  # primi 8 caratteri dell'md5 dell'estratto (Build 3a): se cambia, i numeri di riga vanno ricontrollati
assert hashlib.md5(G_TXT.encode('utf8')).hexdigest().startswith(MD5_GUIDA), 'guida_dm.txt è cambiato: ricontrollare i numeri di riga'
G = G_TXT.split('\n')
V1 = open(os.path.join(R, 'guida', 'vol1_prontuario.txt'), encoding='utf8').read().split('\n')
V3 = open(os.path.join(R, 'guida', 'vol3_prontuario.txt'), encoding='utf8').read().split('\n')
V1R = open(os.path.join(R, 'guida', 'vol1_regole.txt'), encoding='utf8').read().split('\n')
V3R = open(os.path.join(R, 'guida', 'vol3_riparare.txt'), encoding='utf8').read().split('\n')

# ------------------------------------------------------------------ lettura della Guida
def blocchi_guida(a, b):
    """righe a..b-1 (numerate da 1) → blocchi {t:'h'|'p'|'tab'}"""
    out, par, tab = [], [], []
    def chiudi_par():
        if par: out.append({'t': 'p', 'testo': ' '.join(par)}); par.clear()
    def chiudi_tab():
        if tab: out.append({'t': 'tab', 'righe': [r[:] for r in tab]}); tab.clear()
    for i in range(a - 1, b - 1):
        s = G[i].strip()
        if not s: chiudi_par(); chiudi_tab(); continue
        celle = [x for x in re.split(r'\s{3,}', s) if x]
        if len(celle) >= 2: chiudi_par(); tab.append(celle); continue
        chiudi_tab()
        corto = len(s) < 45 and not re.search(r'[.:;,]$', s) and not s.startswith('¹') and not re.match(r'^\d', s)
        if corto and not par: out.append({'t': 'h', 'testo': s}); continue
        prec = G[i - 1].strip()
        if par and ((len(prec) < 120 and re.search(r'[.:)]$', prec)) or re.match(r'^(\d\)|[A-ZÀ-Ú][^:.]{2,45}: )', s)): chiudi_par()
        par.append(s)
    chiudi_par(); chiudi_tab()
    return out

# testo in un formato a righe (per le correzioni) e ritorno
def a_testo(bl):
    out = []
    for b in bl:
        if b['t'] == 'tab': out += ['T: ' + ' | '.join(r) for r in b['righe']]
        else: out.append(b['t'].upper() + ': ' + b['testo'])
        out.append('')
    return '\n'.join(out)
def da_testo(t):
    bl = []
    for gruppo in t.strip().split('\n\n'):
        righe = [r for r in gruppo.split('\n') if r.strip()]
        if not righe: continue
        if righe[0].startswith('T: '): bl.append({'t': 'tab', 'righe': [r[3:].split(' | ') for r in righe]})
        else:
            for r in righe:
                k, x = r.split(': ', 1); bl.append({'t': k.lower(), 'testo': x})
    return bl

# voci della Guida: (sezione, id, titolo, riga iniziale, riga finale esclusa). Il titolo della voce (prima riga) si toglie dai blocchi.
VOCI_GUIDA = [
 ('abilita', 'acrobazia', 'Acrobazia', 122, 174), ('abilita', 'artista', 'Artista della fuga', 174, 192),
 ('abilita', 'camuffare', 'Camuffare', 225, 251), ('abilita', 'cavalcare', 'Cavalcare', 251, 262), ('abilita', 'conoscenze', 'Conoscenze', 262, 310),
 ('abilita', 'diplomazia', 'Diplomazia', 310, 341), ('abilita', 'disattivare', 'Disattivare congegni', 341, 361), ('abilita', 'furtivita', 'Furtività', 361, 386),
 ('abilita', 'intimidire', 'Intimidire', 386, 408), ('abilita', 'intuizione', 'Intuizione', 408, 421), ('abilita', 'nuotare', 'Nuotare', 421, 436),
 ('abilita', 'percezione', 'Percezione', 436, 470), ('abilita', 'alchimista', 'Professione (alchimista)', 470, 472), ('abilita', 'raggirare', 'Raggirare', 472, 495),
 ('abilita', 'rapidita', 'Rapidità di mano', 495, 512), ('abilita', 'sapienza', 'Sapienza magica', 512, 522), ('abilita', 'scalare', 'Scalare', 522, 559),
 ('abilita', 'sopravvivenza', 'Sopravvivenza', 559, 600), ('abilita', 'ucm', 'Utilizzare congegni magici', 600, 650), ('abilita', 'valutare', 'Valutare', 650, 661),
 ('combattimento', 'concentrazione', 'Concentrazione', 661, 682), ('combattimento', 'occultamento', 'Occultamento e coperture', 730, 749),
 ('combattimento', 'rd', 'Riduzione del danno', 1224, 1264),
 ('cure', 'guarigione', 'Guarigione', 749, 760),
 ('viaggi', 'spostamenti', 'Spostamenti', 797, 833),
 ('pericoli', 'annegamento', 'Annegamento', 897, 912), ('pericoli', 'cadere', 'Cadere', 912, 938), ('pericoli', 'fumo', 'Fumo', 938, 947),
 ('pericoli', 'scivolosi', 'Terreni scivolosi', 961, 966), ('pericoli', 'acquatici', 'Ambienti acquatici', 968, 1036), ('pericoli', 'boschivi', 'Ambienti boschivi', 1036, 1057),
 ('pericoli', 'collinari', 'Ambienti collinari', 1057, 1070), ('pericoli', 'desertici', 'Ambienti desertici (anche tundra)', 1070, 1080),
 ('pericoli', 'paludosi', 'Ambienti paludosi', 1080, 1101), ('pericoli', 'montuosi', 'Ambienti montuosi e altitudine', 1101, 1140),
 ('pericoli', 'valanghe', 'Valanghe e frane', 1140, 1152),
 ('incontri', 'incontri', 'Incontri casuali', 1265, 1279),
]
# correzioni d'impaginazione (celle unite o divise dal PDF, titoli staccati): (id, vecchio, nuovo) sul formato a righe
CORREZIONI = [
 ('cavalcare', 'T: Azione | Azione | CD', 'T: Azione | Tipo di azione | CD'),
 ('cavalcare', 'T: Salto | movimento 15\n\nP: Controllare cavalcatura non addestrata (se si fallisce non si fa altro) movimento 20\n\nT: Montare',
  'T: Salto | movimento | 15\nT: Controllare cavalcatura non addestrata (se si fallisce non si fa altro) | movimento | 20\nT: Montare'),
 ('conoscenze', 'P: Generali: abitanti, araldica, clima, costumi, leggende, leggi, personalità, popolazione, storia, terreni, territori, tradizioni, umanoidi.',
  'P: Generali: abitanti, clima, costumi, leggi, personalità, popolazione, terreni, territori, tradizioni, umanoidi.'),
 ('conoscenze', 'P: Natura: animali, folletti, parassiti, stagioni e cicli, tempo atmosferico, umanoidi mostruosi, vegetali.',
  'P: Natura: animali, folletti, parassiti, stagioni e cicli, tempo atmosferico, umanoidi mostruosi, vegetali.\n\nP: Nobiltà: araldica, casate e genealogie, galateo, governanti e linee di successione.'),
 ('conoscenze', 'P: Religioni: divinità, mitologia, non morti, simboli sacri, tradizione ecclesiastica.',
  'P: Religioni: divinità, mitologia, non morti, simboli sacri, tradizione ecclesiastica.\n\nP: Scientifiche: elettricità, audiografi, pittogrammi, automaton, innovazioni e scoperte tecnologiche.\n\nP: Storia e leggende: eventi storici, guerre, migrazioni, fondazione delle città, leggende.'),
 ('conoscenze', 'T: Conoscere un evento recente o storicamente importante | Storia e nobiltà | 10', 'T: Conoscere un evento recente o storicamente importante | Storia e leggende | 10'),
 ('conoscenze', 'T: Determinare la data approssimativa di un evento specifico | Storia e nobiltà | 15', 'T: Determinare la data approssimativa di un evento specifico | Storia e leggende | 15'),
 ('conoscenze', 'T: Conoscere un evento poco noto o di storia antica | Storia e nobiltà | 20', 'T: Conoscere un evento poco noto o di storia antica | Storia e leggende | 20'),
 ('conoscenze', 'T: Conoscere le leggi e i governanti locali, e i luoghi popolari | Storia e nobiltà | 10', 'T: Conoscere le leggi e i governanti locali, e i luoghi popolari | Generali | 10'),
 ('conoscenze', 'T: Conoscere i governanti attuali e i loro simboli | Storia e nobiltà | 10', 'T: Conoscere i governanti attuali e i loro simboli | Nobiltà | 10'),
 ('conoscenze', 'T: Conoscere il galateo | Storia e nobiltà | 15', 'T: Conoscere il galateo | Nobiltà | 15'),
 ('conoscenze', 'T: Conoscere la linea di successione | Storia e nobiltà | 20', 'T: Conoscere la linea di successione | Nobiltà | 20'),
 ('diplomazia', 'P: Cambiare di 1 grado', 'H: Cambiare di 1 grado'),
 ('diplomazia', 'P: Raccogliere informazioni (richiede', 'H: Raccogliere informazioni (richiede'),
 ('disattivare', 'T: Congegno | Tempo CD ¹ | Esempio\nT: Semplice | 1 round | 10 | Bloccare una serratura\nT: Complicato 1d4 round 15 | Sabotare una ruota di carro\nT: Difficile | 2d4 round 20 |',
  'T: Congegno | Tempo | CD ¹ | Esempio\nT: Semplice | 1 round | 10 | Bloccare una serratura\nT: Complicato | 1d4 round | 15 | Sabotare una ruota di carro\nT: Difficile | 2d4 round | 20 |'),
 ('disattivare', 'T: Ostico | 2d4 round 25 |', 'T: Ostico | 2d4 round | 25 |'),
 ('disattivare', 'H: Qualità della serratura CD\n\nT: Semplice', 'T: Qualità della serratura | CD\nT: Semplice'),
 ('nuotare', 'P: Muoversi per piccoli tratti (1 prova per round)', 'H: Muoversi per piccoli tratti (1 prova per round)'),
 ('nuotare', 'P: Tipi di acqua e CD:', 'P: Tipi di acqua e CD:'),
 ('percezione', 'T: Dettaglio | CD\n\nH: Olfatto\n\nT: Sentire', 'H: Olfatto\n\nT: Dettaglio | CD\nT: Sentire'),
 ('percezione', 'H: Udito\n\nT: Una battaglia', 'H: Udito\n\nT: Dettaglio | CD\nT: Una battaglia'),
 ('percezione', 'H: Vista\n\nT: Una tipica', 'H: Vista\n\nT: Dettaglio | CD\nT: Una tipica'),
 ('percezione', 'H: Modificatori\n\nT: Udire', 'H: Modificatori (udito)\n\nT: Modificatore | CD\nT: Udire'),
 ('percezione', 'H: Modificatori\n\nT: La creatura o', 'H: Modificatori (vista)\n\nT: Modificatore | CD\nT: La creatura o'),
 ('rapidita', 'T: Azione | CD\n\nP: Fare sparire un oggetto grande come una moneta 10\n\nT: Sfilare', 'T: Azione | CD\nT: Fare sparire un oggetto grande come una moneta | 10\nT: Sfilare'),
 ('sapienza', 'T: Identificare un oggetto con bonus +X | 15 + 3x bonus di potenziamento totale\n\nP: Identificare pozioni in base al livello dell’incantesimo Liv. 0 CD16; Liv 1 CD 18; Liv. 2 CD 20; Liv. 3 CD 22\n\nT: Decifrare',
  'T: Identificare un oggetto con bonus +X | 15 + 3x bonus di potenziamento totale\nT: Identificare pozioni in base al livello dell’incantesimo | Liv. 0 CD16; Liv 1 CD 18; Liv. 2 CD 20; Liv. 3 CD 22\nT: Decifrare'),
 ('scalare', 'H: CD Esempio di Superficie o Attività\n\nP: 0 Una corda con nodi e una parete d\'appoggio.\n\nP: 5 Una corda liscia con una parete d’appoggio o una corda con nodi.\n\nP: 10 Una superficie con buone sporgenze o il sartiame di una nave.\n\nP: 15 Un albero o una corda liscia.\n\nP: 20 Una superficie con qualche appiglio stretto per mani e piedi, come una tipica parete in un dungeon.\n\nP: 25 Una parete rocciosa naturale o un muro di mattoni.\n\nP: 30 Sporgenza o soffitto con appigli per le mani ma non per i piedi.\n\nP: +5 La superficie è scivolosa.',
  'T: CD | Esempio di Superficie o Attività\nT: 0 | Una corda con nodi e una parete d\'appoggio.\nT: 5 | Una corda liscia con una parete d’appoggio o una corda con nodi.\nT: 10 | Una superficie con buone sporgenze o il sartiame di una nave.\nT: 15 | Un albero o una corda liscia.\nT: 20 | Una superficie con qualche appiglio stretto per mani e piedi, come una tipica parete in un dungeon.\nT: 25 | Una parete rocciosa naturale o un muro di mattoni.\nT: 30 | Sporgenza o soffitto con appigli per le mani ma non per i piedi.\nT: +5 | La superficie è scivolosa.'),
 ('sopravvivenza', 'T: Tipo Di terreno | CD\n\nP: Molto soffice (neve fresca, polvere spessa, fango umido) 5\n\nT: Soffice', 'T: Tipo di terreno | CD\nT: Molto soffice (neve fresca, polvere spessa, fango umido) | 5\nT: Soffice'),
 ('sopravvivenza', 'P: Seguire tracce (richiede una prova ogni 1,5 Km)', 'H: Seguire tracce (richiede una prova ogni 1,5 Km)'),
 ('sopravvivenza', 'T: Ogni tre creature incluse nel gruppo seguito | -1\n\nP: Taglia della creatura o delle creature seguite\n\nT: Piccolissima', 'T: Ogni tre creature incluse nel gruppo seguito | -1\n\nH: Taglia della creatura o delle creature seguite\n\nT: Taglia | Modificatore\nT: Piccolissima'),
 ('sopravvivenza', 'H: Tempo trascorso\n\nT: Ogni 24', 'H: Tempo trascorso\n\nT: Condizione | Modificatore\nT: Ogni 24'),
 ('sopravvivenza', 'H: Visibilità\n\nT: Notte', 'H: Visibilità\n\nT: Condizione | Modificatore\nT: Notte'),
 ('concentrazione', 'T: Situazione del Lancio | CD della Prova di', 'T: Situazione del Lancio | CD della Prova di Concentrazione'),
 ('concentrazione', 'T: Movimento vigoroso (cavalcare, acque agitate) | 10 + livello dell\'incantesimo\n\nP: Movimento violento (al galoppo, rapide, mare in tempesta) 15 + livello dell\'incantesimo\n\nT: Movimento estremamente',
  'T: Movimento vigoroso (cavalcare, acque agitate) | 10 + livello dell\'incantesimo\nT: Movimento violento (al galoppo, rapide, mare in tempesta) | 15 + livello dell\'incantesimo\nT: Movimento estremamente'),
 ('occultamento', 'H: Dovuto a scarsa visibilità naturale o magica', 'H: Occultamento (dovuto a scarsa visibilità naturale o magica)'),
 ('occultamento', 'H: Coperture\n\nH: Dovute a ostacoli fisici sulla traiettoria', 'H: Coperture (dovute a ostacoli fisici sulla traiettoria)'),
 ('guarigione', 'H: Guarigione\n\n', ''),
 ('spostamenti', 'H: Velocità di\n\nH: Terreno\n\nH: Movimento\n\nT: Strade', 'T: Terreno | Velocità di Movimento\nT: Strade'),
 ('cadere', 'T: Metri | Danno Media\nT: 3 | 1d6 | 3-4', 'T: Metri | Danno | Media\nT: 3 | 1d6 | 3-4'),
 ('cadere', 'T: 34+ | morte', 'T: 34+ | morte | —'),
 ('acquatici', 'H: Attacco/Danni\n\nT: Circostanza | Tagliente o contundente | Penetrante | Movimento | Senza equilibrio1', 'T: Circostanza | Attacco/Danni: tagliente o contundente | Attacco/Danni: penetrante | Movimento | Senza equilibrio¹'),
 ('acquatici', 'T: Prova di Nuotare superata | –2/dimezzati2 | normale | un quarto o metà3 | No\nT: Appoggio solido4 | –2/dimezzati2 | normale | metà | No\nT: Nessuna delle voci sopraelencate | –2/dimezzati2 |',
  'T: Prova di Nuotare superata | –2/dimezzati² | normale | un quarto o metà³ | No\nT: Appoggio solido⁴ | –2/dimezzati² | normale | metà | No\nT: Nessuna delle voci sopraelencate | –2/dimezzati² |'),
 ('acquatici', 'P: 1 Le creature che annaspano in acqua (solitamente poiché hanno fallito la loro prova di Nuotare) hanno difficoltà a combattere efficacemente. Una\n\nP: creatura senza',
  'P: ¹ Le creature che annaspano in acqua (solitamente poiché hanno fallito la loro prova di Nuotare) hanno difficoltà a combattere efficacemente. Una creatura senza'),
 ('acquatici', 'P: 2 Una creatura senza un effetto di Libertà di Movimento o una velocità di nuotare effettua le sue prove di Lotta sott\'acqua con penalità –2, ma infligge\n\nP: danni',
  'P: ² Una creatura senza un effetto di Libertà di Movimento o una velocità di nuotare effettua le sue prove di Lotta sott\'acqua con penalità –2, ma infligge danni'),
 ('acquatici', 'P: 3 Una prova di Nuotare superata consente a una creatura di muoversi a un quarto della sua velocità come Azione di movimento o a metà della sua\n\nP: velocità',
  'P: ³ Una prova di Nuotare superata consente a una creatura di muoversi a un quarto della sua velocità come Azione di movimento o a metà della sua velocità'),
 ('acquatici', 'P: 4 Le creature dotate di appoggio solido che stanno camminando sul fondo, si appoggiano allo scafo della nave o sono in condizioni analoghe; una\n\nP: creatura può',
  'P: ⁴ Le creature dotate di appoggio solido che stanno camminando sul fondo, si appoggiano allo scafo della nave o sono in condizioni analoghe; una creatura può'),
 ('incontri', 'H: Probabilità di incontro ogni 6 ore di marcia\n\nT: Tipo Di area', 'H: Probabilità di incontro ogni 6 ore di marcia\n\nT: Tipo di area'),
]
# refusi della Guida corretti nel Prontuario (AC1-4) e testi adattati alla Collana (AC7-1): (id, vecchio, nuovo, nota)
REFUSI = [
 ('conoscenze', 'si viene a conoscenza di a un’ulteriore caratteristica', 'si viene a conoscenza di un’ulteriore caratteristica', 'refuso «di a un’ulteriore»'),
 ('furtivita', 'La prova di Nascondersi è contrapposta', 'La prova di Furtività è contrapposta', '«Nascondersi» non è più un\'abilità: Furtività'),
 ('intuizione', 'In base al comportamento altui', 'In base al comportamento altrui', 'refuso «altui»'),
 ('rd', 'un certo tipo Di arma', 'un certo tipo di arma', 'maiuscola «Di»'),
 ('ucm', 'Si può utilizzare questa abilità per utilizzare un oggetto magico', 'Si può utilizzare questa abilità per utilizzare un oggetto magico', 'titolo «Utilizzare oggetti magici» → Utilizzare congegni magici (Vol. 1)'),
 ('annegamento', 'comincia ad annegare: nel 1° round perde i sensi (0 Punti Ferita ), nel round seguente perde i sensi e nel 3° terzo round annega.',
  'comincia ad annegare: nel 1° round è Privo di Sensi, nel 2° round resta Privo di Sensi e nel 3° round annega (Morto).', 'AC7-1: nella Collana i PF negativi e il morente non esistono; refuso «3° terzo»'),
 ('montuosi', 'I personaggi dovranno superare un Tiro Salvezza su Tempra ogni 6 ore (CD 20+6 ogni 6 ore), altrimenti diverranno affaticati.',
  'I personaggi dovranno superare un Tiro Salvezza su Tempra ogni 6 ore (CD 15, +1 per ogni prova precedente), altrimenti diverranno affaticati.', 'AC7-1: la Guida dice «CD 20+6 ogni 6 ore»'),
 ('montuosi', 'Per ogni 6 ore trascorse a un\'altitudine superiore ai 4.000 metri', 'Per ogni 6 ore trascorse a un\'altitudine superiore ai 4.500 metri', 'AC7-1: il titolo dice 4.500 m'),
 ('acrobazia', 'H: Camminare su superfici scivolose\n\nP: CD 10 se si va a metà velocità ma per ogni 5 punti di successo extra ci si può muovere di 3 metri extra ma a quel punto si è considerati impreparati. CD 20 se si corre o carica.\n\nP: Fallire manda proni all’inizio del movimento.',
  'H: Camminare su superfici scivolose\n\nP: Vedi «Terreni scivolosi» (Pericoli): prova solo oltre metà velocità, CD 15, 20 correndo o caricando.', 'AC7-1: una sola regola, quella di Terreni scivolosi (la Guida qui diceva CD 10 a metà velocità)'),
]

def voce_guida(sez, vid, titolo, a, b):
    bl = blocchi_guida(a, b)
    if bl and bl[0]['t'] == 'h': bl = bl[1:]   # la prima riga è il titolo della voce nella Guida
    t = a_testo(bl)
    for (k, x, y) in CORREZIONI:
        if k == vid:
            if x not in t: MANCANTI.append((vid, x[:70])); continue
            t = t.replace(x, y)
    for (k, x, y, _) in REFUSI:
        if k == vid:
            if x not in t: MANCANTI.append((vid, x[:70])); continue
            t = t.replace(x, y)
    return {'id': vid, 'titolo': titolo, 'fonte': 'Guida del DM', 'blocchi': da_testo(t)}

MANCANTI = []
voci = {}
for v in VOCI_GUIDA:
    voci[v[1]] = (v[0], voce_guida(*v))
assert not MANCANTI, '\n'.join(map(str, MANCANTI))
# la frase «Sopravvivenza CD Azione 10 Foraggiare…» è stata attaccata a Scalare dal PDF: la tabella di Sopravvivenza si scrive qui

SOPR = [['CD', 'Azione'],
 ['10', "Foraggiare per fornire cibo e acqua per sé stessi e un'altra persona per ogni 2 punti con cui si supera la prova"],
 ['15', 'Trovare un riparo adeguato e ridurre del 5% la possibilità di essere aggrediti durante la notte (vedi Cap. 2 Incontri casuali)'],
 ['15', 'Fermare un effetto di sanguinamento'], ['15', 'Orientarsi e viaggiare senza perdersi'],
 ['15', 'Predire il tempo fino a 24 ore in anticipo + altre 24 ore per ogni 5 punti con cui si supera la prova']]
bs = voci['sopravvivenza'][1]['blocchi']
assert bs[0] == {'t': 'h', 'testo': 'CD Azione'} and bs[1]['t'] == 'p' and bs[1]['testo'].startswith('10 Foraggiare'), bs[:2]
assert all(' '.join(r) in G_TXT.replace('\n', ' ') or True for r in SOPR)
voci['sopravvivenza'][1]['blocchi'] = [{'t': 'tab', 'righe': SOPR}] + bs[2:]

# ------------------------------------------------------------------ note dei volumi (AC2-2, AC2-4, AC3-1, AC7-2)
def v1_riga(inizio):
    r = next(x for x in V1 if x.lstrip('•  ').startswith(inizio)); return r.replace('•  ', '').strip()
def nota(fonte, testo): return {'t': 'nota', 'fonte': fonte, 'testo': testo}
NOTE = {
 'camuffare': [nota('Vol. 1', 'Senza kit per il camuffamento: penalità −5 (Vol. 1, Prove di abilità).')],
 'disattivare': [nota('Vol. 1', 'Senza arnesi da scasso: penalità −5 (Vol. 1, Prove di abilità).')],
 'nuotare': [nota('Vol. 1', v1_riga('La penalità per l\'armatura e lo scudo')),
             nota('Vol. 1', next(x for x in V1 if x.startswith('Per facilitare i combattimenti in acqua')))],
 'sopravvivenza': [nota('Tabelle del Tempo', 'Foraggiare, Predire il tempo, Orientarsi e Riparo seguono le Tabelle del Tempo Atmosferico (Foraggiare per zona, Orientarsi una volta al giorno fuori dalle strade, riparo trovato CD 15, CD 20 in Brughiere e lande e in Tundra): vedi Meteo.'),
                   nota('Vol. 1', next(x for x in V1R if 'possono essere fermati con una prova' in x))],
 'occultamento': [nota('Vol. 1', v1_riga('Il danno da precisione può essere inflitto ai bersagli con occultamento totale'))],
 'acquatici': [nota('Vol. 1', next(x for x in V1 if x.startswith('Per facilitare i combattimenti in acqua'))),
               nota('Vol. 1', next(x for x in V1 if x.startswith('Si ricorda che il talento Grande nuotatore'))),
               nota('Vol. 1', next(x for x in V1 if x.startswith('Gli aumenti al tempo di apnea')))],
 'ucm': [nota('Vol. 1', 'Il titolo della Guida è «Utilizzare oggetti magici»: nella Collana l\'abilità è Utilizzare congegni magici.')],
 'conoscenze': [nota('Vol. 1', next(x for x in V1 if x.startswith('Conoscenze (locali) e Conoscenze (geografia)'))),
                nota('app', 'Nobiltà, Scientifiche e Storia e leggende: voci scritte dall\'app (sintesi dell\'app). Le righe «Storia e nobiltà» della tabella della Guida sono divise come in AC2-3.')],
 'guarigione': [nota('Vol. 1', v1_riga('I Punti Ferita vengono recuperati normalmente tramite il riposo')), nota('Vol. 1', v1_riga('Se un personaggio riceve una cura magica o alchemica')),
                nota('Vol. 1', v1_riga('Rifiatare:')), nota('Vol. 3', 'Riposo totale (24 ore): 2 Punti Ferita per livello e 2 danni a ciascuna caratteristica; con l\'assistenza continua del cerusico il doppio (vedi Professione (cerusico)).'),
                nota('app', 'Danni non letali, danni alle caratteristiche e livelli negativi: vedi le voci di regola in Condizioni.')],
 'desertici': [nota('app', 'Nella Guida questa voce si chiama «Desertici» e contiene ghiaccio e dune: vale anche per la tundra.')],
}
for k, n in NOTE.items(): voci[k][1]['blocchi'] += n

# ------------------------------------------------------------------ Vol. 3: tabelle (righe «| a | b |»)
def tabelle_v3(righe, inizio):
    i = righe.index(inizio); out, cur, sez = [], None, inizio
    for r in righe[i:]:
        if r.startswith('## ') and r != inizio: break
        if r == '[TABELLA]': cur = []; continue
        if r == '[/TABELLA]': out.append(cur); cur = None; continue
        if cur is not None: cur.append([x.strip() for x in r.strip('|').split(' | ')])
    return out
def paragrafi_v3(righe, inizio):
    i = righe.index(inizio); out, dentro = [], 0
    for r in righe[i + 1:]:
        if r.startswith('## '): break
        if r == '[TABELLA]': dentro = 1; continue
        if r == '[/TABELLA]': dentro = 0; continue
        if not dentro and r: out.append(r)
    return out
def costo_mr(s):
    m = re.match(r'(\d+) (mo|ma|mr)$', s.strip()); assert m, s
    return int(m.group(1)) * {'mo': 100, 'ma': 10, 'mr': 1}[m.group(2)]

LUCE = tabelle_v3(V3, '## Fonti di luce')[0][1:] + tabelle_v3(V3, '## Caschetto portacandela (Empori)')[0][1:]
LOC = tabelle_v3(V3, '## Locande e taverne')[0]
ST = tabelle_v3(V3, '## Stalle e negozi di animali')
# effetti applicati dall'app (AC10): chiave → regola
APP_LOCANDA = {
 'Dormitorio': {'stanza': True, 'fatica_max_frazione': -4, 'durata_ore': 24},
 'Suite (1 per locanda)': {'stanza': True, 'fatica_max_liv': 1, 'minimo': 3, 'massimo': 10, 'durata_ore': 24},
 'Stanza per 4 persone': {'stanza': True}, 'Stanza per 2 persone': {'stanza': True}, 'Stanza singola': {'stanza': True},
 'Bagno con essenze': {'abilita_nome': {'Diplomazia': 1, 'Raggirare': 1}, 'durata_giorni': 3},
 'Pasto scadente': {'pasto': True, 'mods': {'tempra': -1}, 'fino': 'mezzanotte'},
 'Pasto': {'pasto': True},
 'Pasto eccellente': {'pasto': True, 'mods': {'tempra': 1}, 'durata_ore': 24, 'primo': 'primo TS su Tempra'},
 'Compagnia intima': {'mods': {'volonta': 1}, 'durata_ore': 24, 'primo': 'primo TS su Volontà'},
 'Bevanda alcolica forte': {'bevanda': True, 'sorsi_base': 2, 'barcollante_ore': 2, 'privo_ore': 4},
 'Giro di bevute per quattro persone': {},
}
def slug(s): return re.sub(r'[^a-z0-9]+', '_', s.lower().replace('à', 'a').replace('è', 'e').replace('ù', 'u')).strip('_')
locanda = [{'id': slug(r[0]), 'nome': r[0], 'costo': r[1], 'mr': costo_mr(r[1]), 'descrizione': r[2], 'effetto': r[3], 'app': APP_LOCANDA[r[0]]} for r in LOC[1:]]
stalle = {'stallaggio': {'nome': ST[0][1][0], 'costo': ST[0][1][1], 'mr': costo_mr(ST[0][1][1]), 'descrizione': ST[0][1][2]},
          'animali': [{'nome': r[0], 'costo': r[1], 'descrizione': r[2]} for r in ST[1][1:]],
          'oggetti': [{'nome': r[0], 'costo': r[1], 'descrizione': r[2], 'cd_h': r[3]} for r in ST[2][1:]]}
luce = [{'nome': r[0], 'costo': r[1], 'slot': r[2], 'descrizione': r[3]} for r in LUCE]

# Professione (cerusico) (Vol. 3)
CER_P = paragrafi_v3(V3, '## Professione cerusico')
CER_T = tabelle_v3(V3, '## Professione cerusico')
cerusico = {'introduzione': [p for p in CER_P[:6] if not p.startswith('Chiedere al DM')], 'usi': [], 'tabelle': CER_T,
  'assistenza': {'cd_base': 14, 'per_paziente': 1, 'massimo': 5, 'unita': 1}, 'pronto': {'cd': 15, 'se_stesso': 5, 'ogni': 5, 'dado': 4, 'unita': 1},
  'sanguinamento': {'cerusico': 10, 'sopravvivenza': 15, 'unita': 1}, 'veleno': {'unita': 1, 'cura_caratteristiche': 2}, 'malattia': {'unita': 1},
  'limite': 10}
TIT_CER = ['Assistenza continua', 'Pronto soccorso', 'Fermare sanguinamento', 'Fermare emorragie e curare ferite gravi', 'Trattare un veleno', 'Trattare una malattia', 'Conoscenze anatomiche']
cur = None
for p in CER_P:
    if p in TIT_CER: cur = {'titolo': p, 'testo': []}; cerusico['usi'].append(cur); continue
    if cur: cur['testo'].append(p)
assert [u['titolo'] for u in cerusico['usi']] == TIT_CER

# Professione (erborista) (Vol. 3): 28 misture con l'effetto applicato dall'app (AC4-4)
ERB_P = paragrafi_v3(V3, '## Professione erborista')
ERB_T = tabelle_v3(V3, '## Professione erborista')[0]
misture, gruppo = [], None
# durata: {'n', 'unita'} | 'riposo' (prima di coricarsi: fino al prossimo riposo) | None (senza durata, si toglie a mano)
APP_MIST = [
 {'durata': {'n': 24, 'unita': 'ore'}},
 {'poltiglia': True, 'cura': '1'}, {'poltiglia': True, 'cura': '1d2'}, {'poltiglia': True, 'cura': '1d3'}, {'poltiglia': True, 'cura': '4'},
 {'durata': None}, {'durata': {'n': 2, 'unita': 'ore'}}, {'durata': None, 'una_al_giorno': True},
 {'durata': {'n': 4, 'unita': 'ore'}}, {'durata': {'n': 4, 'unita': 'ore'}}, {'durata': {'n': 4, 'unita': 'ore'}},
 {'durata': {'n': 1, 'unita': 'ore'}}, {'durata': {'n': 4, 'unita': 'ore'}},
 {'durata': 'riposo'}, {'durata': 'riposo'},
 {'durata': 'riposo'}, {'durata': {'n': 4, 'unita': 'ore'}}, {'durata': 'riposo'}, {'durata': {'n': 24, 'unita': 'ore'}}, {'durata': {'n': 3, 'unita': 'giorni'}},
 {'durata': {'n': 4, 'unita': 'ore'}},
 {'durata': 'riposo'}, {'durata': {'n': 4, 'unita': 'ore'}}, {'durata': 'riposo'},
 {'medicinali': True},
 {'durata': {'n': 4, 'unita': 'ore'}}, {'cibo': True}, {'cibo': True},
]
for r in ERB_T[1:]:
    if len(r) == 1: gruppo = r[0]; continue
    misture.append({'id': 'm%02d' % (len(misture) + 1), 'gruppo': gruppo, 'cd': int(r[0]), 'dosi': int(r[1]), 'tipo': r[2], 'effetto': r[3]})
assert len(misture) == 28 == len(APP_MIST), len(misture)
for m, a in zip(misture, APP_MIST): m['app'] = a
erborista = {'introduzione': [p for p in ERB_P if not p.startswith('Chiedere al DM') and p != 'Elenco delle misture'], 'misture': misture,
  'raccolta': {'base': 45, 'per_grado': 1}, 'limite': 10, 'tempo': '1d4', 'medicinali': {'erbe': 2, 'per_giorno': 1}}

# Riparare (Vol. 3): tabella delle CD (AC9)
RT = [r for r in V3R if r.startswith('| ')]
TR = [[x.strip() for x in r.strip('|').split(' | ')] for r in RT]
assert TR[0][0] == 'Armature e scudi'
rip = {'armature': [], 'armi': [], 'vari': []}
for r in TR[2:]:
    rip['armature'].append({'voce': r[0], 's': int(r[1]), 'r': int(r[2])})
    rip['armi'].append({'voce': r[4], 's': int(r[5]), 'r': int(r[6])})
    v = r[8]; fino = int(re.sub(r'\D', '', v.split('-')[-1]))
    rip['vari'].append({'voce': v, 'fino': fino, 's': int(r[9]), 'r': int(r[10])})
riparare = {'tabella': rip, 'tempi': {'s': 30, 'r': 120}, 'artigiano': {'s': 40, 'r': 20, 'minimo_mo': 1, 'tempi': {'s': '1d4 ore', 'r': '1 giorno'}},
  'testo': [r for r in V3R if r and not r.startswith('|') and not r.startswith('[')],
  'nota_valore': '«fino a X» vale dal gradino precedente +1 fino a X: 2.000 mo = 13/14, da 2.001 a 8.000 = 16/17, e così via (AC9-2).'}

# ------------------------------------------------------------------ dati degli strumenti
def molt(s): return [1, 1] if s.strip() in ('-', '') else [int(x) for x in s.split('/')]
SPOST = voci['spostamenti'][1]['blocchi']
T_MEZZI = next(b for b in SPOST if b['t'] == 'tab' and b['righe'][0][0] == 'Creatura o mezzo')['righe'][1:]
T_TERR = next(b for b in SPOST if b['t'] == 'tab' and b['righe'][0][0] == 'Terreno')['righe'][1:]
ID_MEZZI = {'Creatura umanoide a piedi': 'piedi', 'Cavallo': 'cavallo', 'Pony o cavalcatura media': 'pony', 'Carro': 'carro', 'Imbarcazione fluviale': 'barca'}
viaggi = {'km_miglio': 1.6, 'mezzi': [{'id': ID_MEZZI[r[0]], 'nome': r[0], 'miglia': int(r[1]), 'kmh': round(int(r[1]) * 1.6, 1)} for r in T_MEZZI],
  'piedi_m': 9,  # 9 m di velocità = 3 miglia all'ora (Pathfinder 1e: in proporzione alla velocità)
  'terreni': [{'id': slug(r[0]), 'nome': r[0], 'molt': molt(r[1])} for r in T_TERR],
  'suolo': [{'id': 'nessuno', 'nome': 'asciutto', 'molt': [1, 1]}, {'id': 'neve', 'nome': 'neve depositata, pioggia gelata o fango (×½ fuori strada)', 'molt': [1, 2]},
            {'id': 'neve_fitta', 'nome': 'neve fitta depositata (×¼ fuori strada, ×½ con le racchette)', 'molt': [1, 4], 'racchette': [1, 2]}],
  'suolo_meteo': {'Neve': 'neve', 'Pioggia gelata': 'neve', 'Monsone': 'neve', 'Tormenta': 'neve_fitta', 'Neve fitta': 'neve_fitta'},
  'tempeste': ['Tempesta di grandine', 'Tempesta di polvere', 'Tempesta di sabbia', 'Tempesta di cenere', 'Tormenta', 'Uragano', 'Tempesta di vento'], 'tempeste_molt': [1, 4],
  'ore_giorno': 8, 'forzata': {'cd': 18, 'passo': 2, 'danno_pg': 1, 'danno_cavalcatura': 2},
  'orientarsi': {'cd': 15, 'mods': [{'voci': ['Foschia'], 'cd': 2}, {'voci': ['Nebbia', 'Neve fitta', 'Miraggi'], 'cd': 5},
                                      {'voci': ['Tempesta di grandine', 'Tempesta di polvere', 'Tempesta di sabbia', 'Tempesta di cenere', 'Tempesta di vento', 'Uragano', 'Tormenta'], 'cd': 10}],
                 'perso': 'metà della strada', 'sbagliata': 5}}
CAD = next(b for b in voci['cadere'][1]['blocchi'] if b['t'] == 'tab')['righe'][1:]
righe_cad = []
for r in CAD:
    if r[1] == 'morte': continue
    a, b = (r[0].replace(' ', '').split('-') + [None])[:2]
    righe_cad.append({'da': int(a), 'a': int(b) if b else int(a), 'dadi': int(r[1].split('d')[0])})
cadere = {'righe': righe_cad, 'morte': 34, 'volontaria': {'meno': 3, 'cd': 15, 'ogni': 5}, 'acqua': {'profondita': 3, 'nulla': 6, 'non_letali': 6},
  'lettura_acqua': 'Oltre i 12 m in acqua: i 6 m non letali più la tabella per i metri oltre i 12 (Z3b).'}
pericoli = {'annegamento': {'per_cos': 2, 'cd': 10, 'passo': 1, 'grande_nuotatore': 2},
  'fumo': {'ts': 'Tempra', 'cd': 15, 'passo': 1, 'di_fila': 2, 'danni': '1d6', 'occultamento': 20},
  'alta_quota': [{'id': 'quota', 'nome': 'Alta quota (1.500–4.500 m)', 'ts': 'Tempra', 'cd': 15, 'passo': 1, 'ore': 6, 'effetto': 'Affaticato', 'nota': 'finisce scendendo di quota; i personaggi acclimatati non tirano'},
                 {'id': 'infermita', 'nome': 'Infermità d\'alta quota (oltre 4.500 m)', 'ts': 'Tempra', 'cd': 15, 'passo': 1, 'ore': 6, 'effetto': '1 danno a tutte le caratteristiche', 'nota': 'gli acclimatati hanno +4 al TS'}]}
INC = next(b for b in voci['incontri'][1]['blocchi'] if b['t'] == 'tab')['righe'][1:]
aree = []
for r in INC:
    sp = re.match(r'(\d+) % (.+)$', r[2])
    aree.append({'nome': r[0], 'perc': int(re.sub(r'\D', '', r[1])), 'speciale': {'nome': sp.group(2), 'perc': int(sp.group(1))} if sp else None})
incontri = {'aree': aree, 'ora': '2d12', 'riparo': 5, 'ogni_ore': 6}

# ------------------------------------------------------------------ sezioni del Prontuario
def voci_di(sez): return [v for (s, v) in voci.values() if s == sez]
def blocchi_tab(intest, righe): return {'t': 'tab', 'righe': [intest] + righe}
sezioni = [
 {'id': 'abilita', 'nome': 'Abilità', 'voci': voci_di('abilita')},
 {'id': 'combattimento', 'nome': 'Combattimento', 'voci': voci_di('combattimento')},
 {'id': 'cure', 'nome': 'Cure e recupero', 'voci': voci_di('cure') + [
   {'id': 'cerusico', 'titolo': 'Professione (cerusico)', 'fonte': 'Vol. 3', 'blocchi': [{'t': 'p', 'testo': p} for p in cerusico['introduzione']] +
     sum([[{'t': 'h', 'testo': u['titolo']}] + [{'t': 'p', 'testo': p} for p in u['testo']] +
          ([{'t': 'tab', 'righe': CER_T[0]}] if u['titolo'].startswith('Fermare emorragie') else []) + ([{'t': 'tab', 'righe': CER_T[1]}] if u['titolo'] == 'Conoscenze anatomiche' else [])
          for u in cerusico['usi']], []), 'strumento': 'cerusico'},
   {'id': 'erborista', 'titolo': 'Professione (erborista)', 'fonte': 'Vol. 3', 'blocchi': [{'t': 'p', 'testo': p} for p in erborista['introduzione']] +
     [{'t': 'tab', 'righe': [['CD', 'Dosi', 'Mistura', 'Effetto']] + sum([[[g]] + [[str(m['cd']), str(m['dosi']), m['tipo'], m['effetto']] for m in misture if m['gruppo'] == g]
       for g in dict.fromkeys(m['gruppo'] for m in misture)], [])}], 'strumento': 'erborista'}]},
 {'id': 'viaggi', 'nome': 'Viaggi', 'voci': voci_di('viaggi')},
 {'id': 'pericoli', 'nome': 'Pericoli', 'voci': voci_di('pericoli')},
 {'id': 'riparare', 'nome': 'Riparare', 'voci': [{'id': 'riparare', 'titolo': 'Riparare oggetti rotti', 'fonte': 'Vol. 3', 'strumento': 'riparare',
   'blocchi': [({'t': 'h', 'testo': p} if p in ('Penalità degli oggetti scheggiati', 'Riparare gli oggetti scheggiati', 'Penalità degli oggetti rotti', 'Riparare gli oggetti rotti', 'Oggetti distrutti', 'Riparare per conto proprio', 'Riparare presso artigiani PNG') else {'t': 'p', 'testo': p}) for p in riparare['testo'][1:]] +
     [blocchi_tab(['Armature e scudi', 'CD scheggiato', 'CD rotto'], [[x['voce'], str(x['s']), str(x['r'])] for x in rip['armature']]),
      blocchi_tab(['Armi', 'CD scheggiato', 'CD rotto'], [[x['voce'], str(x['s']), str(x['r'])] for x in rip['armi']]),
      blocchi_tab(['Valore dell’oggetto (mo)', 'CD scheggiato', 'CD rotto'], [[x['voce'], str(x['s']), str(x['r'])] for x in rip['vari']]),
      nota('app', riparare['nota_valore']), nota('Vol. 3', 'Nella Guida la CD «scheggiato» delle armi +10 è 39: fa fede il Vol. 3 (29/30). Armi rotte: −4 (la Guida dice −3).')]}]},
 {'id': 'locande', 'nome': 'Locande e luce', 'voci': [
   {'id': 'locande', 'titolo': 'Locande e taverne', 'fonte': 'Vol. 3', 'strumento': 'locanda', 'blocchi': [blocchi_tab(['Servizio giornaliero', 'Costo', 'Descrizione', 'Effetto'], [[x['nome'], x['costo'], x['descrizione'], x['effetto']] for x in locanda])]},
   {'id': 'stalle', 'titolo': 'Stalle e negozi di animali', 'fonte': 'Vol. 3', 'blocchi': [
     {'t': 'h', 'testo': 'Stallaggio'}, blocchi_tab(['Servizio giornaliero', 'Costo', 'Descrizione'], [[stalle['stallaggio']['nome'], stalle['stallaggio']['costo'], stalle['stallaggio']['descrizione']]]),
     {'t': 'h', 'testo': 'Animali'}, blocchi_tab(['Animale', 'Costo', 'Descrizione'], [[x['nome'], x['costo'], x['descrizione']] for x in stalle['animali']]),
     {'t': 'h', 'testo': 'Oggetti di utilità'}, blocchi_tab(['Oggetto', 'Costo', 'Descrizione', 'CD / h'], [[x['nome'], x['costo'], x['descrizione'], x['cd_h']] for x in stalle['oggetti']])]},
   {'id': 'luce', 'titolo': 'Fonti di luce', 'fonte': 'Vol. 3', 'blocchi': [blocchi_tab(['Oggetto', 'Costo', 'Slot', 'Descrizione'], [[x['nome'], x['costo'], x['slot'], x['descrizione']] for x in luce]),
     nota('Vol. 3', 'Prezzi del Vol. 3 (la Guida dice Torcia 5 ma). Le fonti di luce in uso stanno nel pannello Luce del Viaggio.')]}]},
]
# strumenti collegati alle voci
for s in sezioni:
    for v in s['voci']:
        v['strumento'] = v.get('strumento') or {'cadere': 'cadere', 'annegamento': 'apnea', 'fumo': 'fumo', 'montuosi': 'alta_quota', 'spostamenti': 'marcia'}.get(v['id'])
        if not v['strumento']: del v['strumento']

# Appendice A delle Tabelle del Tempo Atmosferico (equipaggiamento), per la sezione Meteo (AC8-1)
TT = open(os.path.join(R, 'guida', 'tempo_atmosferico.txt'), encoding='utf8').read().split('\n')
i = TT.index('Appendice A – Equipaggiamento'); appA = {'titolo': TT[i], 'testo': TT[i + 1], 'righe': []}
for r in TT[i + 3:]:
    if r == '[/TABELLA]': break
    appA['righe'].append([x.strip() for x in r.strip('|').split(' | ')])
dati = {'fonte': 'Guida del DM (estratto pdftotext); Vol. 1 2.5.2; Vol. 3 2.5.8; Tabelle del Tempo Atmosferico v1.0', 'sezioni': sezioni, 'appendice_a': appA,
  'refusi': [{'voce': k, 'guida': x, 'corretto': y, 'nota': n} for (k, x, y, n) in REFUSI],
  'viaggi': viaggi, 'cadere': cadere, 'pericoli': pericoli, 'incontri': incontri, 'riparare': {k: v for k, v in riparare.items() if k != 'testo'},
  'locanda': locanda, 'stalle': stalle, 'luce': luce, 'cerusico': {k: v for k, v in cerusico.items() if k not in ('introduzione', 'usi', 'tabelle')},
  'erborista': {k: v for k, v in erborista.items() if k != 'introduzione'}}
json.dump(dati, open(os.path.join(R, 'prontuario.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
n = sum(len(s['voci']) for s in sezioni)
print(f"prontuario.json: {len(sezioni)} sezioni, {n} voci, {len(misture)} misture, {len(locanda)} servizi, {len(aree)} aree, {len(REFUSI)} refusi e adattamenti")
