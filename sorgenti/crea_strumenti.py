"""Genera sorgenti/strumenti.json (Build 3a, AB4): fonti di luce della Guida del DM, livelli delle Fiamme dalle Tabelle del
Tempo Atmosferico v1.0, tipi di bonus (AB3-3). Uso: python3 sorgenti/crea_strumenti.py — controllato da controlla_strumenti.py."""
import json, os, re
R = os.path.dirname(os.path.abspath(__file__))
G = open(os.path.join(R, 'guida', 'guida_dm.txt'), encoding='utf8').read()
i = G.index('Fonti di luce'); j = G.index('Capitolo 1: Riassunti', i)
blocco = G[i:j].split('\n')[3:]
# righe del PDF: «Nome   Costo   Descrizione», con la descrizione che può andare a capo prima e dopo la riga del nome
voci, cur = [], None
for r in blocco:
    m = re.match(r'\s{6,}(\S.*?)\s{2,}(\d+ m[ro]|\d+ ma)\s*(.*)$', r)
    if m: cur = {'nome': m.group(1).strip(), 'costo': m.group(2), 'righe': [m.group(3).strip()] if m.group(3).strip() else []}; voci.append(cur); continue
    t = r.strip()
    if t and cur is not None: cur['righe'].append(t)
# la descrizione che precede la riga del nome (PDF) appartiene alla voce seguente: ricostruita con le frasi della Guida
TESTI = {
 'Candela x5': 'Illumina in un raggio di 3 m. Brucia per 1 ora. Pioggia e vento la spengono. Si spegne se chi la sorregge si muove a più della propria velocità base o al 25% dopo aver effettuato un’azione di attacco.',
 'Caschetto portacandela': 'Copricapo con anello su cui è inserita una Candela (vedi sopra). Permette di tenere le mani libere per altre attività. Occupa lo slot testa.',
 'Torcia': 'Illumina in un raggio di 9 m. Brucia per 1 ora. Pioggia e vento moderati la spengono. In combattimento, viene considerata un’arma improvvisata ad una mano che infligge 1d3 danni contundenti + 1 danno da fuoco.',
 'Lanterna': 'Illumina in un raggio di 15 m. Brucia per 3 ore usando 1 Fiaschetta d’olio. Pioggia e vento forti la spengono. Spegnerla è un’azione di round completo.',
 'Lanterna impermeabile': 'Conta come una Lanterna ma pioggia e vento forti non la spengono.',
 'Lanterna schermabile': 'Conta come una Lanterna ma come azione veloce si può occultarne temporaneamente la luce.',
 'Lanterna deluxe': 'Conta come una Lanterna ma pioggia e vento forti non la spengono. Inoltre, come azione veloce si può occultarne temporaneamente la luce.',
 'Fiaschetta d’olio': 'Contiene mezzo litro d’olio. Se versato è sufficiente per ricoprire 1,5 m quadrati.',
}
norm = lambda s: ' '.join(s.split())
assert [v['nome'] for v in voci] == list(TESTI), [v['nome'] for v in voci]
COSTO = {v['nome']: v['costo'] for v in voci}
# Fiamme (Tabelle del Tempo Atmosferico v1.0, Cap. 1): «fiamme» = livello della fonte che si spegne
FONTI = [
 {'id': 'candela', 'nome': 'Candela', 'voce': 'Candela x5', 'raggio': 3, 'ore': 1, 'fiamme': 'candela'},
 {'id': 'caschetto', 'nome': 'Caschetto portacandela', 'voce': 'Caschetto portacandela', 'raggio': 3, 'ore': 1, 'fiamme': 'candela'},
 {'id': 'torcia', 'nome': 'Torcia', 'voce': 'Torcia', 'raggio': 9, 'ore': 1, 'fiamme': 'torcia'},
 {'id': 'lanterna', 'nome': 'Lanterna', 'voce': 'Lanterna', 'raggio': 15, 'ore': 3, 'fiamme': 'lanterna', 'olio': True},
 {'id': 'lanterna_impermeabile', 'nome': 'Lanterna impermeabile', 'voce': 'Lanterna impermeabile', 'raggio': 15, 'ore': 3, 'fiamme': 'impermeabile', 'olio': True},
 {'id': 'lanterna_schermabile', 'nome': 'Lanterna schermabile', 'voce': 'Lanterna schermabile', 'raggio': 15, 'ore': 3, 'fiamme': 'lanterna', 'olio': True},
 {'id': 'lanterna_deluxe', 'nome': 'Lanterna deluxe', 'voce': 'Lanterna deluxe', 'raggio': 15, 'ore': 3, 'fiamme': 'impermeabile', 'olio': True},
]
for f in FONTI: f['costo'] = COSTO[f['voce']]; f['testo'] = TESTI[f['voce']]
# livello di ogni voce del meteo: 1 qualsiasi pioggia, neve o vento (candela); 2 Pioggia battente, Neve, Vento forte (torcia);
# 3 Acquazzone, Monsone, Neve fitta, Vento molto forte (lanterna); 4 le tempeste (lanterna impermeabile o deluxe)
LIVELLI = {
 'Pioggia battente': 2, 'Grandine': 2, 'Pioggia gelata': 2, 'Neve': 2, 'Pioggia di cenere': 2, 'Vento forte': 2, "Correnti d'aria": 2,
 'Acquazzone': 3, 'Monsone': 3, 'Neve fitta': 3, 'Vento molto forte': 3, 'Temporale': 3,
 'Tempesta di vento': 4, 'Uragano': 4, 'Tormenta': 4, 'Tempesta di grandine': 4, 'Tempesta di polvere': 4, 'Tempesta di sabbia': 4, 'Tempesta di cenere': 4,
}
SOGLIA = {'candela': 1, 'torcia': 2, 'lanterna': 3, 'impermeabile': 4}
FONTI_VOCI = {  # da dove viene il livello (testo degli effetti, Tabelle del Tempo Atmosferico)
 'Grandine': 'come la Pioggia battente', 'Pioggia gelata': 'come la Pioggia battente', 'Pioggia di cenere': 'come la Neve',
 "Correnti d'aria": 'come con il Vento forte', 'Temporale': 'Acquazzone e Vento forte', 'Uragano': 'Tempesta di vento e Monsone'}
dati = {'fonte': 'Guida del DM (Fonti di luce); Tabelle del Tempo Atmosferico v1.0 (Fiamme)', 'luce': FONTI,
  'fiaschetta': {'nome': 'Fiaschetta d’olio', 'costo': COSTO['Fiaschetta d’olio'], 'testo': TESTI['Fiaschetta d’olio']},
  'fiamme': {'livelli': LIVELLI, 'soglia': SOGLIA, 'vento_impermeabile': {'voce': 'Vento molto forte', 'perc': 50, 'ogni_min': 10},
             'aria_viziata': {'voce': 'Aria viziata', 'consumo': 2}, 'origine': FONTI_VOCI,
             'nota': 'Tormenta: il testo dell’effetto dice «come con il Vento molto forte», la tabella delle Fiamme la mette fra le tempeste che spengono anche la lanterna impermeabile: vale la tabella.'},
  'bonus': {'tipi': ['senza tipo', 'schivare', 'razziale', 'eroico', 'circostanza', 'spiritico', 'alchemico', 'arcano', 'istinto', 'meccanico',
                     'armatura', 'scudo', 'deviazione', 'naturale', 'potenziamento', 'morale', 'cognitivo', 'fortuna', 'sacro', 'profano', 'resistenza', 'competenza', 'dimensione'],
            'sommano': ['senza tipo', 'schivare', 'razziale', 'eroico'], 'stessa_fonte_max': ['circostanza'], 'stessa_fonte_somma': ['spiritico'],
            'istinto': 'Vale per la CA e la CA di contatto, non per quella colto alla sprovvista (Vol. 1).'}}
json.dump(dati, open(os.path.join(R, 'strumenti.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('strumenti.json:', len(FONTI), 'fonti di luce,', len(LIVELLI), 'voci del meteo con le Fiamme,', len(dati['bonus']['tipi']), 'tipi di bonus')
