"""Prova della pagina con Playwright (Chromium) a 1366 e 390 px.
Uso: python3 sorgenti/prova_pagina.py [cartella_screenshot]
Serve www/ su un server locale, percorre creazione guidata, PG, tempo, scorte, combattimento,
salvataggio (ricarica della pagina) e campagna d'esempio. Stampa solo errori e conteggi."""
import os, sys, threading, http.server, functools, re
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.abspath(__file__))
WWW = os.path.join(R, '..', 'www')
SHOT = sys.argv[1] if len(sys.argv) > 1 else None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=WWW))
srv.RequestHandlerClass.log_message = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/index.html'
ok = ko = 0
def t(nome, cond, info=''):
    global ok, ko
    if cond: ok += 1
    else: ko += 1; print('ERRORE', nome, info)

def prova(browser, larghezza):
    ctx = browser.new_context(viewport={'width': larghezza, 'height': 900 if larghezza > 500 else 820})
    pg = ctx.new_page(); errori = []
    pg.on('console', lambda m: m.type == 'error' and errori.append(m.text))
    pg.on('pageerror', lambda e: errori.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
    W = f'[{larghezza}]'
    def largo(nome):
        sw = pg.evaluate('document.documentElement.scrollWidth'); t(f'{W} niente scorrimento orizzontale: {nome}', sw <= larghezza, sw)
    def fin(): return pg.locator('.velo').last
    def premi(testo): fin().locator('footer button', has_text=re.compile('^' + testo + '$')).click()
    largo('elenco vuoto')
    # --- procedura guidata
    pg.click('text=Crea Schermo campagna')
    fin().locator('#w-nome').fill('Prova Playwright'); premi('Avanti')
    fin().locator('#w-anno').fill('1462'); fin().locator('#w-etic').fill('dopo la Caduta'); premi('Avanti')
    fin().locator('#w-g').fill('21'); fin().locator('#w-m').select_option('5'); fin().locator('#w-ora').fill('18:30'); premi('Avanti')
    fin().locator('input[value="desertica"]').check(); premi('Avanti')
    fin().locator('[data-w="aggPG"]').click()
    f = fin(); f.locator('[name="nome"]').fill('Aria'); f.locator('[name="fatica_max"]').fill('20'); f.locator('[name="ferita_max"]').fill('18')
    f.locator('[name="rif_dadi"]').fill('3'); f.locator('[name="iniziativa"]').fill('4'); premi('Aggiungi')
    t(f'{W} PG nella procedura', fin().locator('text=Aria').count() == 1)
    premi('Avanti'); fin().locator('#w-acc').fill('1'); premi('Avanti')
    fin().locator('#w-cibo').fill('4'); fin().locator('#w-acqua').fill('2'); premi('Avanti')
    fin().locator('#w-i-timer').check(); premi('Crea')
    pg.wait_for_selector('.orologio')
    t(f'{W} data di partenza', '21 giugno 1462 dopo la Caduta' in pg.inner_text('.orologio'), pg.inner_text('.orologio'))
    t(f'{W} meteo nella testata', pg.locator('.meteo-chip').inner_text().strip() != '')
    largo('campagna')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'campagna_{larghezza}.png'), full_page=False)
    # --- PF
    pg.locator('[data-az="danno"]').first.click(); fin().locator('[name="n"]').fill('40'); premi('Applica')
    t(f'{W} ferita grave riga −2', 'Riga -2' in fin().inner_text())
    premi('Chiudi senza tirare')
    t(f'{W} barra Ferita negativa', pg.locator('.barra.fe.neg').count() == 1)
    pg.locator('[data-az="cura"]').first.click(); fin().locator('[name="n"]').fill('25'); premi('Cura')
    t(f'{W} cura', '18/18' in pg.locator('.pg').first.inner_text() and '5/20' in pg.locator('.pg').first.inner_text(), pg.locator('.pg').first.inner_text())
    pg.locator('[data-az="temp"]').first.click(); fin().locator('[name="f"]').fill('Falsa vita'); fin().locator('[name="v"]').fill('7'); premi('Aggiungi')
    t(f'{W} PF temporanei', 'Temp7' in pg.locator('.pg').first.inner_text().replace(' ', '').replace('\n', ''))
    pg.locator('[data-az="rifiata"]').first.click(); premi('Tira'); t(f'{W} Rifiatare', fin().locator('.risultato').count() == 1); premi('Chiudi')
    # --- tempo e scorte
    pg.click('[data-az="salto"]'); fin().locator('[name="n"]').fill('2'); fin().locator('[name="u"]').select_option('giorni'); premi('Avanza')
    t(f'{W} coda dopo 2 giorni (acqua finita)', pg.locator('.coda').count() == 1 and 'Sete: Aria 1' in pg.inner_text('.coda'), pg.inner_text('.coda'))
    t(f'{W} Sete applicata ai TS', pg.locator('.pg .mod').count() >= 3)
    pg.click('[data-az="codaTutti"]') if pg.locator('[data-az="codaTutti"]').count() else pg.click('[data-az="codaFatto"]')
    t(f'{W} coda vuota', pg.locator('.coda').count() == 0)
    # Z1: acqua per uno solo dei due (Aria + 1 accompagnatore): il GM sceglie chi beve
    pg.locator('[data-az="scortaN"][data-chi="acqua"]').click(); fin().locator('[name="n"]').fill('1'); premi('Applica')
    pg.click('[data-az="tempo"][data-r="600"]') ; pg.click('[data-az="salto"]'); fin().locator('[name="n"]').fill('1'); fin().locator('[name="u"]').select_option('giorni'); premi('Avanza')
    t(f'{W} razionamento in coda', pg.locator('.coda [data-az="razionamento"]').count() == 1, pg.inner_text('.coda') if pg.locator('.coda').count() else '')
    pg.locator('.coda [data-az="razionamento"]').click()
    fin().locator('input[type="checkbox"]').first.check(); fin().locator('[name="acc"]').fill('1')
    t(f'{W} conto delle razioni oltre il disponibile', 'Razioni usate: 2 su 1' in fin().inner_text())
    premi('Conferma'); t(f'{W} troppe razioni: errore e finestra aperta', pg.locator('.velo').count() == 1)
    fin().locator('[name="acc"]').fill('0'); premi('Conferma')
    t(f'{W} Aria beve: Sete scende a 0', pg.locator('.pg .chip', has_text='Sete').count() == 0 and pg.locator('[data-az="razionamento"]').count() == 0, pg.locator('.pg').first.inner_text())
    if pg.locator('.coda').count(): pg.click('[data-az="codaTutti"]') if pg.locator('[data-az="codaTutti"]').count() else pg.click('[data-az="codaFatto"]')
    pg.click('[data-az="riposo"]'); premi('Riposa')
    t(f'{W} riposo: Fatica piena', '20/20' in pg.locator('.pg').first.inner_text())
    pg.click('[data-az="riposo"]')
    t(f'{W} secondo riposo subito dopo: PG non selezionabili', fin().locator('input[type="checkbox"]:disabled').count() == fin().locator('input[type="checkbox"]').count() and 'di nuovo da' in fin().inner_text())
    premi('Riposa'); t(f'{W} riposo senza PG: errore', 'nessun PG' in pg.inner_text('body')); premi('Annulla') if pg.locator('.velo').count() else None
    pg.click('[data-az="scheda"][data-s="log"]'); t(f'{W} log', pg.locator('.log li').count() > 5); pg.click('[data-az="scheda"][data-s="viaggio"]')
    pg.click('[data-az="ritira"]')
    # --- combattimento
    pg.locator('[data-bind^="pg."][type="number"]').first.fill('15')
    pg.locator('[data-bind="nemici.0.nome"]').fill('Lupo'); pg.locator('[data-bind="nemici.0.bonus"]').fill('2'); pg.locator('[data-bind="nemici.0.n"]').fill('3')
    pg.click('[data-az="aggNemico"]'); pg.locator('[data-bind="nemici.1.nome"]').fill('Goblin'); pg.locator('[data-bind="nemici.1.n"]').fill('2'); pg.locator('[data-bind="nemici.1.modo"]').select_option('singolo')
    pg.click('[data-az="avvia"]')
    righe = pg.locator('.ordine li'); t(f'{W} righe dell\'iniziativa', righe.count() == 4, righe.count())
    t(f'{W} lupi per tipo', pg.locator('.ordine', has_text='Lupo ×3').count() == 1)
    t(f'{W} timer visibile', pg.locator('#timer').count() == 1)
    for _ in range(4): pg.click('[data-az="cmd"][data-c="avanti"]')
    t(f'{W} round 2', 'Round 2' in pg.inner_text('.col-testa >> nth=1'))
    pg.click('[data-az="cmd"][data-c="ritardare"]'); t(f'{W} in attesa', pg.locator('[data-az="entraOra"]').count() == 1)
    pg.click('[data-az="entraOra"]'); t(f'{W} rientrata', pg.locator('[data-az="entraOra"]').count() == 0)
    pg.click('[data-az="indietro"]'); t(f'{W} indietro', pg.locator('[data-az="entraOra"]').count() == 1)
    pg.click('[data-az="entraOra"]')
    pg.locator('.ordine li', has_text='Lupo').click(); pg.click('[data-az="separa"]'); premi('Separa')
    t(f'{W} separa', righe.count() == 5)
    if not pg.locator('[data-az="preparare"]').count(): pg.locator('.ordine li', has_text='Lupo ×2').click()
    pg.click('[data-az="preparare"]'); fin().locator('[name="a"]').fill('Mordere'); premi('Prepara')
    t(f'{W} preparare', pg.locator('.ordine .chip', has_text='Prepara').count() == 1)
    # Punto eroe: Aria agisce prima di chi sta agendo
    if 'Aria' not in pg.inner_text('.barra-turno .chi'):
        pg.locator('.ordine li', has_text='Aria').click(); pg.click('[data-az="cmd"][data-c="puntoEroe"]')
        t(f'{W} Punto eroe', 'Aria' in pg.inner_text('.barra-turno .chi') and 'Eroe ○' in pg.locator('.pg').first.inner_text())
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'combattimento_{larghezza}.png'), full_page=False)
    largo('combattimento')
    pg.click('[data-az="fineComb"]'); premi('Chiudi il combattimento'); t(f'{W} riepilogo', fin().locator('text=Fine del combattimento').count() == 1); premi('Chiudi')
    # --- salvataggio: la campagna resta dopo la ricarica
    pg.wait_for_timeout(1300); pg.reload(); pg.wait_for_selector('text=Prova Playwright')
    t(f'{W} campagna salvata', pg.locator('.camp').count() == 1)
    pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300); t(f'{W} esempio', pg.locator('.camp').count() == 2)
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    t(f'{W} esempio: 3 PG', pg.locator('.pg').count() == 3)
    pg.click('[data-az="impostazioni"]'); fin().locator('[name="tema"]').select_option('chiaro'); premi('Salva')
    t(f'{W} tema chiaro', pg.evaluate('document.documentElement.dataset.theme') == 'light')
    if SHOT and larghezza > 500: pg.screenshot(path=os.path.join(SHOT, f'chiaro_{larghezza}.png'))
    pg.click('[data-az="campagne"]'); pg.locator('.camp', has_text='Prova Playwright').locator('[data-az="esportaCamp"]').click()
    t(f'{W} esporta', '"schermo-v1"' in fin().locator('textarea').input_value()); premi('Chiudi')
    pg.locator('.camp', has_text='Prova Playwright').locator('[data-az="elimina"]').click(); premi('Elimina'); pg.wait_for_timeout(300)
    t(f'{W} elimina', pg.locator('.camp').count() == 1)
    t(f'{W} nessun errore in console', not errori, errori[:3])
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (1366, 390):
        try: prova(b, w)
        except Exception as e: ko += 1; print('ERRORE', w, 'interrotta:', ' | '.join(str(e).split('\n')[:3])[:400])
    b.close()
srv.shutdown()
print(f'prova della pagina: {ok} superati, {ko} falliti')
sys.exit(1 if ko else 0)
