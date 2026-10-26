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
http.server.SimpleHTTPRequestHandler.log_message = lambda *a: None
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

BUILD1 = os.path.join(R, 'prove', 'campagna_build1.json')
def prova2a(browser, larghezza):
    """Build 2a: malus e bonus (G), veleni (H), ferite ed emorragie (I), migrazione delle campagne della Build 1."""
    ctx = browser.new_context(viewport={'width': larghezza, 'height': 900 if larghezza > 500 else 820})
    pg = ctx.new_page(); errori = []
    pg.on('console', lambda m: m.type == 'error' and errori.append(m.text))
    pg.on('pageerror', lambda e: errori.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
    W = f'[{larghezza} 2a]'
    def fin(): return pg.locator('.velo').last
    def premi(testo): fin().locator('footer button', has_text=re.compile('^' + testo + '$')).click()
    def card(nome): return pg.locator('.pg', has=pg.locator('.pg-nome', has_text=nome))
    def largo(nome):
        sw = pg.evaluate('document.documentElement.scrollWidth'); t(f'{W} niente scorrimento orizzontale: {nome}', sw <= larghezza, sw)
    def malus(nome_pg, **campi):
        card(nome_pg).locator('[data-az="malus"]').click(); f = fin()
        for k, v in campi.items():
            el = f.locator(f'[name="{k}"]')
            if el.evaluate('e => e.tagName') == 'SELECT': el.select_option(v)
            elif el.get_attribute('type') == 'checkbox': el.check() if v else el.uncheck()
            else: el.fill(str(v))
        premi('Applica')
    def coda_testo(): return pg.inner_text('.coda') if pg.locator('.coda').count() else ''
    pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300)
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    # --- G: condizione con durata in round, valore modificato e valore base
    malus('Aria', tipo='condizione', cond='Scosso', dn=3, du='round')
    a = card('Aria')
    t(f'{W} G chip della condizione', a.locator('.chip.cond', has_text='Scosso').count() == 1, a.inner_text())
    tem = a.locator('.mod', has_text='+3').first
    t(f'{W} G2 valore colorato con il base', tem.count() == 1 and tem.get_attribute('title') == 'Base +5')
    tem.click(); t(f'{W} G2 tocco sul valore: base', 'Base +5' in pg.inner_text('#avviso'))
    for _ in range(3): pg.click('[data-az="tempo"][data-r="1"]')
    t(f'{W} G1 dopo 3 round Scosso scade', card('Aria').locator('.chip', has_text='Scosso').count() == 0)
    # --- G3: bonus
    malus('Aria', tipo='bonus', nome='Benedizione', m_ts=1, m_altro='+1 TpC', dn=1, du='minuti')
    t(f'{W} G3 bonus in verde', card('Aria').locator('.mod.su', has_text='+6').count() >= 1 and card('Aria').locator('.chip.ok', has_text='Benedizione').count() == 1)
    malus('Aria', tipo='condizione', cond='Impreparato', du='incontro')
    t(f'{W} G2 Impreparato: CA colto alla sprovvista', card('Aria').locator('.stat .mod', has_text='15').count() >= 1)
    # --- H: veleno
    malus('Bruno', tipo='veleno', nome='Veleno di ragno', vCD=13, vFu='round', vN=6, vE='1d2 For', vC=1)
    t(f'{W} H primo effetto in coda', 'primo effetto' in coda_testo(), coda_testo())
    pg.locator('.coda [data-az="codaFattoId"]').click()
    pg.click('[data-az="tempo"][data-r="1"]')
    t(f'{W} H2 promemoria con Superato e Fallito', 'Tempra CD 13' in coda_testo() and pg.locator('.coda [data-az="esito"]').count() == 2, coda_testo())
    pg.locator('.coda [data-az="esito"][data-e=""]').click()
    pg.click('[data-az="scheda"][data-s="log"]'); t(f'{W} H2 effetto tirato nel log', pg.locator('.log li', has_text='Veleno di ragno, effetto').count() >= 2); pg.click('[data-az="scheda"][data-s="viaggio"]')
    card('Bruno').locator('.chip.vel').click(); premi('Dose aggiuntiva')
    t(f'{W} H4 dose aggiuntiva: CD 15', 'CD 15' in card('Bruno').locator('.chip.vel').inner_text())
    pg.click('[data-az="tempo"][data-r="1"]'); pg.locator('.coda [data-az="esito"][data-e="1"]').click()
    t(f'{W} H3 curato: il veleno si chiude', card('Bruno').locator('.chip.vel').count() == 0)
    # --- I: ferita grave incollata e divisa
    card('Cira').locator('[data-az="feritaGrave"]').click()
    fin().locator('[name="t"]').fill('Il colpo ti incrina alcune costole e a causa del dolore intenso sei barcollante finché la ferita di gravità 2 (20 PF) non viene curata.')
    premi('Scomponi'); t(f'{W} I1 anteprima in due parti', fin().locator('#fg-anteprima input[type="checkbox"]').count() == 2, fin().inner_text())
    premi('Attacca'); c = card('Cira')
    t(f'{W} I1 ferita e condizione legata', c.locator('.chip.fer', has_text='Ferita gravità 2').count() == 1 and c.locator('.chip.cond', has_text='Barcollante').count() == 1, c.inner_text())
    c.locator('.chip.fer', has_text='Ferita gravità 2').click(); premi('Cura…')
    fin().locator('[name="t"]').fill('22'); premi('Registra la prova')
    t(f'{W} I2 prova riuscita: guarisce fra 3 giorni', 'guarisce' in card('Cira').locator('.chip.fer').inner_text())
    card('Cira').locator('[data-az="feritaGrave"]').click()
    fin().locator('[name="t"]').fill('Il colpo ti stacca 1 dito della mano. Inoltre, il dolore rende il braccio inutilizzabile finché la ferita di gravità 2 (20 PF) non viene curata. Morirai per emorragia lieve (8 PF) entro 2d4 minuti.')
    premi('Attacca'); t(f'{W} I1 «Attacca» mostra prima l\'anteprima', fin().locator('#fg-anteprima select').count() == 1); premi('Attacca')
    em = card('Cira').locator('.chip.fer', has_text='Emorragia lieve')
    t(f'{W} I emorragia lieve con l\'ora della morte', em.count() == 1 and 'morte' in em.inner_text(), card('Cira').inner_text())
    card('Cira').locator('[data-az="cura"]').click(); fin().locator('[name="n"]').fill('8')
    opzioni = fin().locator('[name="su"] option').all_inner_texts(); fin().locator('[name="su"]').select_option(index=[i for i, o in enumerate(opzioni) if 'Emorragia lieve' in o][0])
    premi('Cura'); t(f'{W} I2 cura diretta: emorragia fermata', card('Cira').locator('.chip', has_text='Emorragia lieve').count() == 0 and card('Cira').locator('.chip', has_text='Braccio inutilizzabile').count() == 1)
    # emorragia grave e morte
    card('Bruno').locator('[data-az="feritaGrave"]').click()
    fin().locator('[name="t"]').fill('Il colpo ti stacca di netto il piede. Inoltre, per lo shock cadi privo di sensi per 1 ora. Alla fine di ogni tuo turno hai il 5% cumulabile di probabilità di morire per emorragia grave (24 PF).')
    premi('Scomponi'); premi('Attacca')
    t(f'{W} I amputazione del piede: Furtività −5', card('Bruno').locator('.mod', has_text='−4').count() >= 1, card('Bruno').inner_text())
    pg.click('[data-az="tempo"][data-r="600"]')
    t(f'{W} I3 avviso di morte con il 20%', 'muore' in coda_testo() and pg.locator('.coda [data-az="morte"]').count() == 3, coda_testo())
    t(f'{W} I3 banda sul riquadro', card('Bruno').locator('.banda', has_text='Morte in sospeso').count() == 1)
    pg.locator('.coda [data-az="morte"][data-s="morto"]').click()
    t(f'{W} I3 Morto', card('Bruno').locator('.chip.cond', has_text='Morto').count() == 1)
    largo('malus')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'malus_{larghezza}.png'), full_page=False)
    # --- combattimento: malus di un gruppo, TS periodico nel turno, Indietro
    pg.locator('[data-bind="nemici.0.nome"]').fill('Lupo'); pg.locator('[data-bind="nemici.0.n"]').fill('2')
    for i, v in enumerate(['30', '20', '10']): pg.locator('.pgini input[type="number"]').nth(i).fill(v)
    pg.click('[data-az="avvia"]')
    pg.locator('.ordine li', has_text='Lupo').click(); pg.locator('.azioni-riga [data-az="malus"]').click()
    fin().locator('[name="cond"]').select_option('Prono'); fin().locator('[name="du"]').select_option('libera'); fin().locator('[name="etichetta"]').fill('Lupo 2'); premi('Applica')
    t(f'{W} G etichetta del gruppo nella riga', pg.locator('.ordine .chip', has_text='Lupo 2: Prono').count() == 1)
    t(f'{W} G Indietro annulla il malus', (pg.click('[data-az="indietro"]'), pg.locator('.ordine .chip', has_text='Prono').count() == 0)[1])
    while 'Bruno' not in pg.inner_text('.barra-turno .chi') and 'Cira' not in pg.inner_text('.barra-turno .chi'): pg.click('[data-az="cmd"][data-c="avanti"]')
    malus('Aria', tipo='condizione', cond='Confuso', du='libera', tsOn=True, tsT='Volontà', tsCD=15, tsN=1, tsU='round')
    for _ in range(4):
        if 'Aria' in pg.inner_text('.barra-turno .chi'): break
        pg.click('[data-az="cmd"][data-c="avanti"]')
    t(f'{W} G TS periodico nella barra del turno', pg.locator('.barra-turno .pend', has_text='Volontà CD 15').count() == 1, pg.inner_text('.barra-turno'))
    pg.locator('.barra-turno [data-az="esito"][data-e="1"]').click()
    t(f'{W} G TS superato: Confuso finisce', card('Aria').locator('.chip', has_text='Confuso').count() == 0)
    largo('combattimento 2a')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'turno_{larghezza}.png'), full_page=False)
    pg.click('[data-az="fineComb"]'); premi('Chiudi il combattimento'); premi('Chiudi')
    t(f'{W} «fino a fine incontro» finisce', card('Aria').locator('.chip', has_text='Impreparato').count() == 0)
    # --- campagna della Build 1: si apre e accetta i malus
    pg.click('[data-az="campagne"]'); pg.click('[data-az="importa"]')
    fin().locator('[name="t"]').fill(open(BUILD1, encoding='utf8').read()); premi('Importa'); pg.wait_for_timeout(400)
    pg.locator('.camp', has_text='Campagna della Build 1').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    t(f'{W} Build 1: combattimento in corso riaperto', pg.locator('.ordine li').count() == 3)
    malus('Aria', tipo='condizione', cond='Scosso', dn=2, du='round')
    t(f'{W} Build 1: malus su una campagna vecchia', card('Aria').locator('.chip', has_text='Scosso').count() == 1)
    pg.click('[data-az="cmd"][data-c="avanti"]')
    t(f'{W} nessun errore in console', not errori, errori[:3])
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (1366, 390):
        for f in (prova, prova2a):
            try: f(b, w)
            except Exception as e: ko += 1; print('ERRORE', w, f.__name__, 'interrotta:', ' | '.join(str(e).split('\n')[:3])[:400])
    b.close()
srv.shutdown()
print(f'prova della pagina: {ok} superati, {ko} falliti')
sys.exit(1 if ko else 0)
