"""Estrae dal Vol. 1 2.5.2 senza immagini (.docx) le regole usate dalla Build 3: «Nuovi tipi di bonus», «Condizioni ed effetti»,
«1, 20 e re-roll», «Sanguinamento», «Essere impreparati», «Vantaggio e svantaggio» → sorgenti/guida/vol1_regole.txt.
Uso: python3 sorgenti/estrai_vol1_regole.py "Vol. 1 - Regole e Razze 2.5.2 senza immagini.docx" """
import sys, os, docx
R = os.path.dirname(os.path.abspath(__file__))
P = [p.text.strip() for p in docx.Document(sys.argv[1]).paragraphs]
TITOLI = ['Nuovi tipi di bonus', 'Condizioni ed effetti', '1, 20 e re-roll', 'Vantaggio e svantaggio', 'Sanguinamento', 'Essere impreparati']
out = []
for t in TITOLI:   # dopo il titolo: o un elenco puntato (tutte le voci) o un solo paragrafo
    i = P.index(t); out.append('## ' + t); j = i + 1
    while not P[j]: j += 1
    if P[j].startswith('•'):
        while j < len(P) and (P[j].startswith('•') or not P[j]):
            if P[j]: out.append(P[j])
            j += 1
    else: out.append(P[j])
    out.append('')
open(os.path.join(R, 'guida', 'vol1_regole.txt'), 'w', encoding='utf8').write('\n'.join(out))
print('vol1_regole.txt:', sum(1 for x in out if x and not x.startswith('##')), 'paragrafi')
