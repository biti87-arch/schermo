"""Estrae «Riparare oggetti rotti» (Vol. 3, Cap. 2) dal .docx in sorgenti/guida/vol3_riparare.txt.
Uso: python3 sorgenti/estrai_vol3_riparare.py "Vol. 3 - Miscellanea 2.5.8.docx"
Paragrafi uno per riga; tabelle fra [TABELLA] e [/TABELLA] con le celle separate da « | » (celle unite ripetute una volta sola)."""
import sys, os, docx
from docx.table import Table
from docx.text.paragraph import Paragraph
R = os.path.dirname(os.path.abspath(__file__))
d = docx.Document(sys.argv[1])
out, dentro = [], False
for el in d.element.body.iterchildren():
    tag = el.tag.split('}')[1]
    if tag == 'p':
        t = Paragraph(el, d).text.strip()
        if t == 'Riparare oggetti rotti': dentro = True
        elif dentro and t == 'Applicare capacità speciali': break
        if dentro and t: out.append(t)
    elif tag == 'tbl' and dentro:
        out.append('[TABELLA]')
        for r in Table(el, d).rows:
            celle, prec = [], None
            for c in r.cells:
                if c._tc is prec: continue
                prec = c._tc; celle.append(' '.join(c.text.split()))
            out.append('| ' + ' | '.join(celle) + ' |')
        out.append('[/TABELLA]')
open(os.path.join(R, 'guida', 'vol3_riparare.txt'), 'w', encoding='utf8').write('\n'.join(out) + '\n')
print('vol3_riparare.txt:', len(out), 'righe')
