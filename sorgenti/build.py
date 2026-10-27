"""Genera l'app a partire da template.html, motore.js e dai dati JSON.
Uso: python3 sorgenti/build.py [percorso_versione_web]
- scrive www/index.html (app Android/Windows, font locali, funziona offline)
- se indicato, scrive anche la versione web (font di Google) da pubblicare come pagina di prova."""
import json, sys, os, re
R = os.path.dirname(os.path.abspath(__file__))
DATI = ['meteo', 'ferite', 'condizioni', 'razze', 'divieti']   # sorgenti/<nome>.json → DATI.<nome>

def carica(f):
    return json.load(open(os.path.join(R, f + '.json'), encoding='utf8'))

dati = {k: carica(k) for k in DATI}
# un "</script" dentro i dati chiuderebbe il blocco: si scrive "<\/"
js = json.dumps(dati, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
t = open(os.path.join(R, 'template.html'), encoding='utf8').read()
for seg in ('__MOTORE__', '__DATI__', '__WEB__'):
    assert t.count(seg) == 1, seg
motore = open(os.path.join(R, 'motore.js'), encoding='utf8').read()
assert '</script' not in motore.lower()
t = t.replace('__MOTORE__', motore).replace('__DATI__', js)
if len(sys.argv) > 1:
    open(sys.argv[1], 'w', encoding='utf8').write(t.replace('__WEB__', 'true'))
t = t.replace('__WEB__', 'false')
fonts = re.compile(r'<link rel="preconnect"[^>]*>\n<link rel="preconnect"[^>]*>\n<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>')
assert fonts.search(t)
body = fonts.sub('<link rel="stylesheet" href="vendor/fonts.css">\n<link rel="icon" href="icona.png">', t)
head = '''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
'''
i = body.index('<div class="wrap"')
out = head + body[:i] + '</head>\n<body>\n' + body[i:] + '\n</body>\n</html>\n'
open(os.path.join(R, '..', 'www', 'index.html'), 'w', encoding='utf8').write(out)
print('ok', len(out))
