"""Genera sorgenti/ferite.json dall'estratto del Vol. 3 (sorgenti/guida/vol3_imprevisti.txt).
Uso: python3 sorgenti/crea_ferite.py   — poi controllare con controlla_ferite.py.
I testi vengono dall'estratto; i modificatori delle amputazioni (MODS) sono scritti qui e controllati sul testo."""
import json, re, os
R = os.path.dirname(os.path.abspath(__file__))
G = open(os.path.join(R, 'guida', 'vol3_imprevisti.txt'), encoding='utf8').read().split('\n')
def tabella_dopo(titolo):
    i = G.index(titolo); j = G.index('[TABELLA]', i); k = G.index('[/TABELLA]', j)
    return [[c.strip() for c in r.strip('|').split(' | ')] for r in G[j+1:k]]
fer = tabella_dopo('Fermare le emorragie e curare le ferite gravi')
amp = tabella_dopo('Amputazioni e arti inutilizzabili')
ID = {'Emorragia lieve': 'emorragia_lieve', 'Emorragia grave': 'emorragia_grave', 'Gravità 1': 'gravita_1', 'Gravità 2': 'gravita_2', 'Gravità 3': 'gravita_3'}
fermare = []
for r in fer[1:]:
    nome, med, cdt, rit = r
    cd = int(re.search(r'CD (\d+)', cdt).group(1))
    g = re.search(r'cura dopo (\d+) giorn', cdt)
    rm = re.match(r'dopo (\S+) (round|giorn[oi])', rit)
    fermare.append({'id': ID[nome], 'ferita': nome, 'medicinali': int(med), 'cd': cd,
        'guarigione': {'n': int(g.group(1)), 'unita': 'giorni'} if g else None,
        'ritentare': {'espr': rm.group(1), 'unita': 'round' if rm.group(2) == 'round' else 'giorni'},
        'variazione_cd': 1 if 'aumenta' in rit else -1,
        'testo': {'medicinali': med, 'cd': cdt, 'ritentare': rit}})
MODS = {  # modificatori numerici applicati ai valori del riquadro; il resto resta nel testo (note)
 'Mano': ({'abilita_nome': {'Scalare': -5, 'Professione': -5, 'Disattivare congegni': -5, 'Rapidità di mano': -5}}, {}),
 'Braccio': ({'abilita_nome': {'Scalare': -5, 'Professione': -5, 'Disattivare congegni': -5, 'Rapidità di mano': -5}}, None),
 'Piede': ({'abilita_nome': {'Acrobazia': -5, 'Cavalcare': -5, 'Furtività': -5, 'Scalare': -5}}, {'condizioni': ['Colto alla sprovvista', 'Prono']}),
 'Gamba': ({'abilita_nome': {'Acrobazia': -10, 'Cavalcare': -10, 'Furtività': -10, 'Scalare': -10}}, None),
 'Orecchio': ({'iniziativa': -2}, {'iniziativa': -4}),
 'Occhio': ({'ca': -1}, {'ca': -2, 'condizioni': ['Colto alla sprovvista', 'Offuscato 50%']}),
 'Mento': ({'abilita_nome': {'Diplomazia': -3}}, None),
 'Naso': ({}, None),
}
GRUPPO = {'Mano': 'superiori', 'Braccio': 'superiori', 'Piede': 'inferiori', 'Gamba': 'inferiori', 'Orecchio': 'orecchi', 'Occhio': 'occhi', 'Mento': 'mento', 'Naso': 'naso'}
amputazioni = []
for r in amp[1:]:
    loc, uno, due = r
    s, e = MODS[loc]
    amputazioni.append({'id': loc.lower(), 'nome': loc, 'gruppo': GRUPPO[loc], 'grado': 2 if loc in ('Braccio', 'Gamba') else 1,
        'singolo': {'testo': uno, 'mods': s}, 'entrambi': {'testo': due, 'mods': e} if due else None})
# Ferite gravi: tre tabelle; la prima con la locazione (1d8)
def righe(titolo):
    return {r[0]: r[1] for r in tabella_dopo(titolo)[1:]}
i_fg = G.index('Ferite gravi')
nota1 = re.sub(r'^1 ', '', G[i_fg + 1])
loc = {'testa': righe('1: Testa'), 'busto': righe('2-4: Busto'), 'braccio': righe('5: Braccio sinistro / 6: Braccio destro'), 'gamba': righe('7: Gamba sinistra / 8: Gamba destra')}
ferite_gravi = [
  {'id': 'colpire', 'nome': 'Armi e incantesimi con tiro per colpire', 'dado': '1d8', 'righe_per_locazione': loc,
   'locazioni': [{'da': 1, 'a': 1, 'nome': 'Testa', 'righe': 'testa', 'lato': ''}, {'da': 2, 'a': 4, 'nome': 'Busto', 'righe': 'busto', 'lato': ''},
                 {'da': 5, 'a': 5, 'nome': 'Braccio sinistro', 'righe': 'braccio', 'lato': 'sinistro'}, {'da': 6, 'a': 6, 'nome': 'Braccio destro', 'righe': 'braccio', 'lato': 'destro'},
                 {'da': 7, 'a': 7, 'nome': 'Gamba sinistra', 'righe': 'gamba', 'lato': 'sinistro'}, {'da': 8, 'a': 8, 'nome': 'Gamba destra', 'righe': 'gamba', 'lato': 'destro'}]},
  {'id': 'area', 'nome': 'Attacchi con area di effetto o effetti senza tiro per colpire', 'righe': righe('Attacchi con area di effetto o effetti senza tiro per colpire')},
  {'id': 'costituzione', 'nome': 'Danni a Costituzione, veleni, sanguinamento o livelli negativi', 'righe': righe('Danni a Costituzione, veleni, sanguinamento o livelli negativi')}]
out = {'fonte': 'Vol. 3 - Miscellanea 2.5.8, Cap. 3 Imprevisti (estratto in sorgenti/guida/vol3_imprevisti.txt)',
  'ferite_gravi': ferite_gravi, 'nota_oggetti': nota1,
  'regola_fermare': 'Cure magiche: i punti curati vanno diretti alla ferita o all’emorragia, anche a più riprese. Professione (cerusico): unità di medicinali e prova come da tabella; se riesce, la ferita guarisce dopo il tempo indicato; se fallisce si ritenta dopo il tempo indicato con la CD che cambia. Senza medicinali: penalità −5.',
  'senza_medicinali': -5, 'fermare': fermare,
  'regola_dita': 'Se una mano o un piede non hanno almeno 3 dita contano come persi.', 'dita_perse': 3,
  'amputazioni': amputazioni,
  'note': ['Le combinazioni «entrambi» dei gruppi superiori (mano-mano, mano-braccio) e inferiori (piede-piede, piede-gamba) usano la riga di Mano e di Piede; braccio-braccio e gamba-gamba non sono scritte e si contano allo stesso modo.',
           'Occhio: l’asterisco «*» in entrambe le colonne non ha una nota nel volume.',
           'Nel volume diverse voci della tabella hanno frasi attaccate senza spazio (es. «mancante.-5 Scalare», «mano-5 DMC»): i testi sono riportati come nel volume.',
           ]}
json.dump(out, open(os.path.join(R, 'ferite.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('ferite.json:', len(fermare), 'righe per fermare,', len(amputazioni), 'amputazioni,', sum(len(t.get('righe', {})) for t in ferite_gravi) + sum(len(v) for v in loc.values()), 'righe delle Ferite gravi')
