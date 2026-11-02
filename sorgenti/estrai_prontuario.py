"""Estrae dal Vol. 1 2.5.2 senza immagini e dal Vol. 3 2.5.8 (.docx) le parti usate dal Prontuario (Build 3b, sezione AC):
- Vol. 1 → sorgenti/guida/vol1_prontuario.txt: «Abilità» (fino a «Talenti»), «Colpi critici, danni da precisione e occultamento»,
  «Regole delle campagne acquatiche», «Punti Ferita, Punti Fatica, Punti Ferita temporanei e Rifiatare»;
- Vol. 3 → sorgenti/guida/vol3_prontuario.txt: «Fonti di luce», il Caschetto portacandela degli Empori, «Locande e taverne»,
  «Stalle e negozi di animali», «Professione cerusico», «Professione erborista».
Uso: python3 sorgenti/estrai_prontuario.py "Vol. 1 - Regole e Razze 2.5.2 senza immagini.docx" "Vol. 3 - Miscellanea 2.5.8.docx"
Paragrafi uno per riga, titoli con «## »; tabelle fra [TABELLA] e [/TABELLA] con le celle separate da « | » (celle unite una volta sola)."""
import sys, os, docx
from docx.table import Table
from docx.text.paragraph import Paragraph
R = os.path.dirname(os.path.abspath(__file__))

def elementi(d):
    """sequenza di ('p', testo) e ('t', righe) nell'ordine del documento"""
    for el in d.element.body.iterchildren():
        tag = el.tag.split('}')[1]
        if tag == 'p':
            yield ('p', Paragraph(el, d).text.strip())
        elif tag == 'tbl':
            righe = []
            for r in Table(el, d).rows:
                celle, prec = [], None
                for c in r.cells:
                    if c._tc is prec: continue
                    prec = c._tc; celle.append(' '.join(c.text.split()))
                righe.append(celle)
            yield ('t', righe)

def sezione(EL, inizio, fine, n=1):
    """dal paragrafo «inizio» (n-esima occorrenza) al paragrafo «fine» escluso"""
    out, dentro, visti = [], False, 0
    for k, x in EL:
        if k == 'p' and x == inizio:
            visti += 1
            if visti == n: dentro = True
        elif dentro and k == 'p' and x == fine: break
        if not dentro: continue
        if k == 'p':
            if x: out.append(('## ' + x) if x == inizio else x)
        else:
            out.append('[TABELLA]'); out += ['| ' + ' | '.join(r) + ' |' for r in x]; out.append('[/TABELLA]')
    assert dentro and out, inizio
    return out

v1 = list(elementi(docx.Document(sys.argv[1])))
v3 = list(elementi(docx.Document(sys.argv[2])))
o1 = []
o1 += sezione(v1, 'Abilità', 'Talenti')
o1 += sezione(v1, 'Punti Ferita, Punti Fatica, Punti Ferita temporanei e Rifiatare', 'Punti eroe')
o1 += sezione(v1, 'Colpi critici, danni da precisione e occultamento', 'Effetti di paura')
o1 += sezione(v1, 'Regole delle campagne acquatiche', 'Umani')
o3 = []
o3 += sezione(v3, 'Fonti di luce', 'Sartorie e mercerie')
# Caschetto portacandela (Empori): la riga della tabella degli Empori
emp = next(x for k, x in v3 if k == 't' and any(r and r[0] == 'Caschetto portacandela' for r in x))
o3 += ['## Caschetto portacandela (Empori)', '[TABELLA]', '| ' + ' | '.join(emp[0]) + ' |',
       '| ' + ' | '.join(next(r for r in emp if r[0] == 'Caschetto portacandela')) + ' |', '[/TABELLA]']
o3 += sezione(v3, 'Locande e taverne', 'Stalle e negozi di animali')
o3 += sezione(v3, 'Stalle e negozi di animali', 'Cantieri terrestri')
o3 += sezione(v3, 'Professione cerusico', 'Professione erborista')
o3 += sezione(v3, 'Professione erborista', 'Capitolo 3: Imprevisti')
open(os.path.join(R, 'guida', 'vol1_prontuario.txt'), 'w', encoding='utf8').write('\n'.join(o1) + '\n')
open(os.path.join(R, 'guida', 'vol3_prontuario.txt'), 'w', encoding='utf8').write('\n'.join(o3) + '\n')
print('vol1_prontuario.txt:', len(o1), 'righe; vol3_prontuario.txt:', len(o3), 'righe')
