"""Estratto delle «Tabelle del Tempo Atmosferico v1.0» (Collana/Output) per crea_meteo.py e controlla_meteo.py.
Uso: python3 sorgenti/estrai_tempo.py [percorso del .docx]   (predefinito: sorgenti/docx/Tabelle_Tempo_Atmosferico_v1.0.docx)
Scrive sorgenti/guida/tempo_atmosferico.txt: un paragrafo per riga, le tabelle fra [TABELLA] e [/TABELLA]
con una riga per riga di tabella («| cella | cella |», celle vuote comprese). I testi sono quelli del Word,
con gli spazi multipli ridotti a uno."""
import zipfile, re, html, os, sys
R = os.path.dirname(os.path.abspath(__file__))
f = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'docx', 'Tabelle_Tempo_Atmosferico_v1.0.docx')
x = zipfile.ZipFile(f).read('word/document.xml').decode('utf8')
body = x[x.index('<w:body>'):]
def testo(p):
    p = re.sub(r'<w:tab/>', '\t', p)
    t = ''.join(html.unescape(m) if m else '\t' for m in re.findall(r'<w:t[^>]*>([^<]*)</w:t>|<w:tab/>', p))
    t = ''.join(html.unescape(m) for m in re.findall(r'<w:t(?: [^>]*)?>([^<]*)</w:t>', p))
    return re.sub(r'\s+', ' ', t).strip()
out = []
pos = 0
for m in re.finditer(r'<w:tbl>.*?</w:tbl>|<w:p[ >].*?</w:p>', body, re.S):
    b = m.group(0)
    if b.startswith('<w:tbl>'):
        out.append('[TABELLA]')
        for tr in re.findall(r'<w:tr[ >].*?</w:tr>', b, re.S):
            celle = [' '.join(t for t in (testo(p) for p in re.findall(r'<w:p[ >].*?</w:p>', tc, re.S)) if t)
                     for tc in re.findall(r'<w:tc>.*?</w:tc>', tr, re.S)]
            out.append('| ' + ' | '.join(celle) + ' |')
        out.append('[/TABELLA]')
    else:
        t = testo(b)
        if t: out.append(('• ' if '<w:numPr>' in b else '') + t)
os.makedirs(os.path.join(R, 'guida'), exist_ok=True)
open(os.path.join(R, 'guida', 'tempo_atmosferico.txt'), 'w', encoding='utf8').write('\n'.join(out) + '\n')
print('righe', len(out), 'tabelle', out.count('[TABELLA]'))
