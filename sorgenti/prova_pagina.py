"""Prova della pagina con Playwright (Chromium) a 1366 e 390 px.
Uso: python3 sorgenti/prova_pagina.py [cartella_screenshot]
Serve www/ su un server locale, percorre creazione guidata, PG, tempo, scorte, combattimento,
salvataggio (ricarica della pagina), campagna d'esempio e le parti di ogni build (2a, 2b, 2c, 3a, 3b, 4 con la finestra TV come riquadro). Stampa solo errori e conteggi."""
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
    fin().locator('#w-zona').select_option('9'); premi('Avanti')   # Ghiacci artici: niente pioggia né caldo, l'acqua scende sempre
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
    fin().locator('select[name^="v_pg:"]').first.select_option('b'); fin().locator('[name="sb"]').fill('1')
    t(f'{W} conto delle razioni oltre il disponibile', 'Razioni usate: 2 su 1' in fin().inner_text())
    premi('Conferma'); t(f'{W} troppe razioni: errore e finestra aperta', pg.locator('.velo').count() == 1)
    fin().locator('[name="sb"]').fill('0'); premi('Conferma')
    t(f'{W} Aria beve: Sete scende a 0', pg.locator('.pg .chip', has_text='Sete').count() == 0 and pg.locator('[data-az="razionamento"]').count() == 0, pg.locator('.pg').first.inner_text())
    if pg.locator('.coda').count(): pg.click('[data-az="codaTutti"]') if pg.locator('[data-az="codaTutti"]').count() else pg.click('[data-az="codaFatto"]')
    pg.click('[data-az="riposo"]'); premi('Riposa')
    t(f'{W} riposo: Fatica piena', '20/20' in pg.locator('.pg').first.inner_text())
    pg.click('[data-az="riposo"]')
    t(f'{W} secondo riposo subito dopo: PG non selezionabili', fin().locator('input[name^="r_"]:disabled').count() == fin().locator('input[name^="r_"]').count() and 'di nuovo da' in fin().inner_text())
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
    # --- ferita grave dalla tabella: riga dai Punti Ferita, locazione tirata, sotto-tiri dell'app (Vol. 3 2.5.8)
    card('Aria').locator('[data-az="danno"]').click(); fin().locator('[name="n"]').fill('85'); premi('Applica')
    f = fin(); t(f'{W} ferita grave: riga dai Punti Ferita', 'Riga -' in f.inner_text())
    f.locator('[name="tab"][value="colpire"]').check()
    t(f'{W} tabella: locazione tirata', f.locator('#fg-loc').is_visible() and '1d8 =' in f.locator('#fg-tiroloc').inner_text(), f.inner_text()[:300])
    f.locator('[name="loc"]').select_option('6')
    t(f'{W} tabella: riga e testo della locazione scelta', f.locator('#fg-anteprima .effetto', has_text='Braccio destro').count() == 1 and f.locator('#fg-anteprima input[type="checkbox"]').count() >= 1)
    premi('Attacca'); pg.click('[data-az="scheda"][data-s="log"]')
    t(f'{W} tabella: ferita attaccata con il titolo nel log', pg.locator('.log li', has_text='Armi e incantesimi con tiro per colpire · Braccio destro').count() == 1)
    pg.click('[data-az="scheda"][data-s="viaggio"]')
    card('Cira').locator('[data-az="feritaGrave"]').click(); f = fin()
    f.locator('[name="riga"]').select_option('-1'); f.locator('[name="tab"][value="costituzione"]').check()
    t(f'{W} riga −1 del Vol. 3 2.5.8: ultimo nell\'iniziativa', 'Ultimo nell' in f.locator('#fg-anteprima').inner_text())
    premi('Attacca'); t(f'{W} finestra chiusa', pg.locator('.velo').count() == 0)
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

BUILD2A = os.path.join(R, 'prove', 'campagna_build2a.json')
SB_DOC = os.path.join(R, 'prove', 'statblock', 'UltimaSoglia_Doc2B_AttoII_LaBarriera.txt')
def prova2b(browser, larghezza):
    """Build 2b: bestiario e PNG (M), incontri (N), tattiche (O), PF dei nemici (J9), migrazione delle campagne della 2a."""
    ctx = browser.new_context(viewport={'width': larghezza, 'height': 900 if larghezza > 500 else 820})
    pg = ctx.new_page(); errori = []
    pg.on('console', lambda m: m.type == 'error' and errori.append(m.text))
    pg.on('pageerror', lambda e: errori.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
    W = f'[{larghezza} 2b]'
    def fin(): return pg.locator('.velo').last
    def premi(testo): fin().locator('footer button', has_text=re.compile('^' + testo + '$')).click()
    def largo(nome):
        sw = pg.evaluate('document.documentElement.scrollWidth'); t(f'{W} niente scorrimento orizzontale: {nome}', sw <= larghezza, sw)
    def terza(s): pg.click(f'[data-az="scheda"][data-s="{s}"]')
    pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300)
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    # --- M1: bestiario, PNG e mostri condivisi
    terza('bestiario')
    t(f'{W} M1 PNG della campagna', pg.locator('#best-lista .voce', has_text='Bandito della Strada').count() == 1)
    pg.click('[data-az="bestFonte"][data-f="mostro"]')
    t(f'{W} M1 mostri condivisi', pg.locator('#best-lista .voce', has_text='Lupo').count() == 1)
    pg.locator('[data-best="testo"]').fill('xyz'); t(f'{W} M1 ricerca senza risultati', 'Nessuna scheda' in pg.inner_text('#best-lista'))
    pg.locator('[data-best="testo"]').fill('lup'); t(f'{W} M1 ricerca per nome', pg.locator('#best-lista .voce').count() == 1)
    pg.locator('[data-best="testo"]').fill('')
    pg.locator('#best-lista [data-az="preferito"]').first.click(); pg.locator('[data-best="preferiti"]').check()
    t(f'{W} M1 preferiti', pg.locator('#best-lista .voce').count() == 1 and pg.locator('#best-lista .stella.on').count() == 1)
    pg.locator('[data-best="preferiti"]').uncheck()
    largo('bestiario')
    # --- M3: Incolla di un'intera sezione con più stat block
    pg.click('[data-az="bestFonte"][data-f="png"]'); pg.click('[data-az="incolla"]')
    fin().locator('[name="t"]').fill(open(SB_DOC, encoding='utf8').read()); premi('Leggi')
    t(f'{W} M3 cinque stat block trovati', fin().locator('.voce-inc').count() == 5, fin().inner_text()[:200])
    t(f'{W} M3 destinazione: PNG o mostri', fin().locator('[name="d0"]').input_value() == 'png' and fin().locator('[name="d2"]').input_value() == 'mostro')
    fin().locator('[name="k4"]').uncheck(); premi('Importa')
    terza('bestiario')
    t(f'{W} M3 PNG importati (Merkh e Kaito)', pg.locator('#best-lista .voce', has_text='Merkh').count() == 1 and pg.locator('#best-lista .voce', has_text='Kaito').count() == 1)
    t(f'{W} M6 segnalazioni nell\'elenco', pg.locator('#best-lista .voce', has_text='Merkh').locator('.chip.ver').count() == 1)
    pg.click('[data-az="bestFonte"][data-f="mostro"]')
    t(f'{W} M3 mostri importati (Laboon, Grande Perdirotta; Smania no)', pg.locator('#best-lista .voce', has_text='Laboon').count() == 1 and pg.locator('#best-lista .voce', has_text='Smania').count() == 0)
    # --- O1/M7: scheda di lato e «Copia come testo»
    pg.click('[data-az="bestFonte"][data-f="png"]'); pg.locator('#best-lista [data-az="vediScheda"]', has_text='Merkh').click()
    sb = pg.locator('.sb')
    t(f'{W} M7 stat block nell\'ordine del §10', sb.locator('h4').all_inner_texts()[:4] == ['DIFESA', 'OFFESA', 'STATISTICHE', 'TATTICHE'], sb.locator('h4').all_inner_texts())
    t(f'{W} M7 condizioni in rosso nello stat block', sb.locator('.cond-t').count() >= 1)
    pg.click('[data-az="copiaTesto"]'); txt = fin().locator('textarea').input_value()
    t(f'{W} M7 Copia come testo', txt.startswith('MERKH — Pistolero 7 · GS 6') and '── TATTICHE ──' in txt, txt[:80]); premi('Chiudi')
    pg.click('[data-az="segnScheda"]'); t(f'{W} M6 finestra delle segnalazioni', 'tratto razziale' in fin().inner_text()); premi('Chiudi')
    pg.click('[data-az="copiaAltrove"]')
    t(f'{W} «Copia in…»: le altre due raccolte', fin().locator('[name="d"] option').all_inner_texts() == ['PNG generici', 'Mostri condivisi'], fin().locator('[name="d"] option').all_inner_texts())
    fin().locator('[name="d"]').select_option('mostro'); premi('Copia')
    t(f'{W} la copia si apre di lato', 'Mostro condiviso' in pg.inner_text('#col-terza') and 'Merkh' in pg.inner_text('#col-terza'))
    terza('bestiario'); pg.click('[data-az="bestFonte"][data-f="mostro"]')
    t(f'{W} M1 copia del PNG nei mostri condivisi', pg.locator('#best-lista .voce', has_text='Merkh').count() == 1)
    pg.click('[data-az="bestFonte"][data-f="png"]')
    largo('scheda')
    # --- PNG generici condivisi e «+ Scheda» nella testata
    pg.click('[data-az="bestFonte"][data-f="generico"]'); t(f'{W} PNG generici: scheda vuota', 'Nessun PNG generico' in pg.inner_text('#best-lista'))
    pg.click('[data-az="aggiungiScheda"]'); t(f'{W} «+ Scheda»: tre raccolte e Incolla', fin().locator('[data-agg]').count() == 4)
    fin().locator('[data-agg="generico"]').click(); f = fin()
    t(f'{W} «+ Scheda»: nuova scheda nei PNG generici', 'Nuovo PNG generico' in f.inner_text() and pg.locator('.velo').count() == 1)
    f.locator('[data-k="nome"]').fill('Guardia cittadina'); premi('Salva')
    t(f'{W} PNG generico creato e aperto di lato', 'PNG generico condiviso' in pg.inner_text('#col-terza') and 'Guardia cittadina' in pg.inner_text('#col-terza'))
    t(f'{W} PNG generici nell\'elenco delle schede', 'PNG generici' in pg.evaluate("opzSchede('')") and 'Guardia cittadina' in pg.evaluate("opzSchede('')"))
    pg.click('[data-az="copiaAltrove"]'); f = fin(); f.locator('[name="d"]').select_option('png'); f.locator('[name="n"]').fill('Sergente Ulmo'); premi('Copia')
    terza('bestiario'); pg.click('[data-az="bestFonte"][data-f="png"]')
    t(f'{W} PNG generico copiato nella campagna con un nome', pg.locator('#best-lista .voce', has_text='Sergente Ulmo').count() == 1)
    pg.click('[data-az="bestFonte"][data-f="generico"]'); t(f'{W} il generico resta', pg.locator('#best-lista .voce', has_text='Guardia cittadina').count() == 1)
    pg.click('[data-az="incolla"]'); fin().locator('[name="t"]').fill(open(SB_DOC, encoding='utf8').read()); premi('Leggi')
    t(f'{W} Incolla dai PNG generici: i PNG vanno lì', fin().locator('[name="d0"]').input_value() == 'generico' and fin().locator('[name="d2"]').input_value() == 'mostro' and fin().locator('[name="d0"] option').count() == 3)
    premi('Annulla')
    pg.click('[data-az="aggiungiScheda"]'); fin().locator('[data-agg="incolla"]').click(); fin().locator('[name="t"]').fill(open(SB_DOC, encoding='utf8').read()); premi('Leggi')
    t(f'{W} «+ Scheda» → Incolla: PNG della campagna o mostri', fin().locator('[name="d0"]').input_value() == 'png' and pg.locator('.velo').count() == 1); premi('Annulla')
    pg.click('[data-az="bestFonte"][data-f="png"]')
    largo('PNG generici')
    # --- M4: scheda guidata nuova
    terza('bestiario'); pg.click('[data-az="nuovaScheda"]'); f = fin()
    f.locator('[data-k="nome"]').fill('Guardia del molo')
    f.locator('[data-k="guida.classi.0.classe"]').select_option('Guerriero'); f.locator('[data-k="guida.classi.0.livello"]').fill('9'); f.locator('[data-k="guida.classi.0.livello"]').press('Tab')
    f.locator('[data-k="guida.classi.0.dv"]').select_option('10')
    f.locator('[data-k="guida.razza"]').select_option('Nani')
    t(f'{W} M5 razza: taglia e tratti dal Razze.md', f.locator('[data-k="guida.taglia"]').input_value() == 'media' and 'Stabilità' in f.inner_text())
    for k, v in {'car.For': 18, 'car.Des': 12, 'car.Cos': 14, 'car.Int': 10, 'car.Sag': 12, 'car.Car': 8, 'guida.bab': 9, 'guida.ts_base.tempra': 6, 'guida.ts_base.riflessi': 3, 'guida.ts_base.volonta': 3,
                 'guida.armatura.nome': 'corazza di bande', 'guida.armatura.base': 7, 'guida.armatura.sintonia': 2, 'guida.armatura.des_max': 1, 'guida.scudo.nome': 'scudo pesante', 'guida.scudo.base': 2}.items():
        f.locator(f'[data-k="{k}"]').first.fill(str(v))
    f.locator('[data-sk="aggiungi"][data-p="guida.armi"]').click()
    f.locator('[data-k="guida.armi.0.nome"]').fill('ascia da battaglia'); f.locator('[data-k="guida.armi.0.sintonia"]').fill('2'); f.locator('[data-k="guida.armi.0.critico"]').fill('×3')
    f.locator('[data-sk="aggiungi"][data-p="guida.talenti"]').click(); f.locator('[data-k="guida.talenti.0.nome"]').fill('Colpo vitale')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'guidata_{larghezza}.png'), full_page=False)
    calc = f.locator('#sk-calcolo').inner_text()
    t(f'{W} M4 calcolo: CA, PF, TS, attacco', '22 (contatto 11, sprovvista 21)' in calc and '80 — Fatica 40 / Ferita 40' in calc and 'Tempra +9' in calc and '+15/+10 (1d8+6, ×3)' in calc, calc)
    t(f'{W} M6 talento proibito segnalato subito', 'Colpo vitale' in f.locator('#sk-segn').inner_text())
    f.locator('[data-sk="tab"][data-v="valori"]').click()
    t(f'{W} M4 valori calcolati in sola lettura', f.locator('[data-k="ca"]').input_value() == '22' and f.locator('[data-k="ca"]').get_attribute('readonly') is not None)
    f.locator('[data-sk="tab"][data-v="tattiche"]').click()
    f.locator('[data-k="tattiche.r1"]').fill('Blocca il pontile.'); f.locator('[data-k="tattiche.fuga"]').fill('Mai.'); f.locator('[data-k="tattiche.tratto"]').fill('Stabilità contro le spinte.')
    f.locator('[data-sk="tesoro"]').check(); fin().locator('[data-k="tesoro.livello"]').fill('9')
    premi('Salva')
    sb = pg.locator('.sb')
    t(f'{W} M4 scheda salvata con i calcoli', 'CA 22 (contatto 11, colto alla sprovvista 21)' in sb.inner_text() and 'PF 80 (9d10+18) — Punti Fatica 40 / Punti Ferita 40' in sb.inner_text(), sb.inner_text()[:300])
    t(f'{W} M8 promemoria del tesoro', '💰 TESORO — da generare · Livello di riferimento: 9' in sb.inner_text())
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'scheda_{larghezza}.png'), full_page=False)
    # --- N: incontro nuovo, cartelle, duplica
    terza('incontri')
    t(f'{W} N1 incontro d\'esempio nella cartella', pg.locator('details.cartella summary', has_text='Atto I').count() == 1 and pg.locator('.capitolo', has_text='La strada del mulino').count() == 1)
    pg.click('[data-az="nuovoIncontro"]'); f = fin()
    f.locator('[data-k="titolo"]').fill('Rissa al molo'); f.locator('[data-k="atto"]').fill('Atto II'); f.locator('[data-k="capitolo"]').fill('Cap. 1')
    f.locator('[data-ic="aggP"]').click(); sel = fin().locator('[data-inc="rif"]').first
    sel.select_option(sel.evaluate("s => [...s.options].find(o => o.text.startsWith('Guardia del molo')).value"))
    t(f'{W} N1 partecipante dalla scheda', fin().locator('[data-k="partecipanti.0.nome"]').input_value() == 'Guardia del molo')
    fin().locator('[data-k="partecipanti.0.n"]').fill('2')
    fin().locator('[data-ic="aggR"]').click(); fin().locator('[data-k="promemoria.0.testo"]').fill('si rompe il pontile')
    fin().locator('[data-k="note"]').fill('**Attenzione**\n- primo\n- secondo')
    t(f'{W} N1 note con grassetto ed elenchi', fin().locator('#inc-anteprima b', has_text='Attenzione').count() == 1 and fin().locator('#inc-anteprima li').count() == 2)
    premi('Crea')
    t(f'{W} N1 incontro creato in Atto II · Cap. 1', pg.locator('details.cartella summary', has_text='Atto II').count() == 1 and pg.locator('.voce', has_text='Rissa al molo').count() == 1)
    pg.click('[data-az="duplicaIncontro"]'); t(f'{W} N2 Duplica', pg.locator('.voce', has_text='Rissa al molo (copia)').count() == 1)
    pg.click('[data-az="eliminaIncontro"]'); premi('Elimina'); t(f'{W} elimina incontro', pg.locator('.voce', has_text='(copia)').count() == 0)
    largo('incontri')
    # --- N2/O: Avvia l'incontro d'esempio, tattiche nella barra del turno, stat block di lato
    pg.locator('[data-az="selIncontro"]', has_text='Agguato sulla strada').click(); pg.click('[data-az="avviaIncontro"]')
    t(f'{W} N2 avvio dall\'incontro', pg.locator('#avvio .chip', has_text='Agguato sulla strada').count() == 1 and pg.locator('[data-bind="nemici.0.nome"]').input_value() == 'Lupo' and pg.locator('[data-bind="nemici.0.n"]').input_value() == '4')
    for i, v in enumerate(['1', '2', '3']): pg.locator('.pgini input[type="number"]').nth(i).fill(v)
    pg.click('[data-az="avvia"]')
    t(f'{W} N2 righe numerate o raggruppate', pg.locator('.ordine li', has_text='Lupo ×4').count() == 1 and pg.locator('.ordine li', has_text='Bandito').count() == 1, pg.inner_text('.ordine'))
    pg.click('[data-az="scheda"][data-s="log"]'); t(f'{W} N1 promemoria e titolo nel log', pg.locator('.log li', has_text='Inizio del combattimento (Agguato sulla strada)').count() == 1)
    giri = 0
    while 'Lupo' not in pg.inner_text('.barra-turno .chi') and giri < 6: pg.click('[data-az="cmd"][data-c="avanti"]'); giri += 1
    bt = pg.locator('.barra-turno')
    t(f'{W} O2 tattica «Round 1» nella barra', bt.locator('.tattica', has_text='Round 1').count() == 1, bt.inner_text())
    bt.locator('[data-az="fuga"]').click(); t(f'{W} O2 «Fuga o resa» a un clic', pg.locator('.barra-turno .tattica.fuga', has_text='il branco fugge').count() == 1)
    bt = pg.locator('.barra-turno'); bt.locator('[data-az="cmd"][data-c="faticaFinita"]').click()
    t(f'{W} O2 «Fatica finita» (PF dei nemici spenti)', pg.locator('.barra-turno .tattica', has_text='Finita la Fatica').count() == 1)
    pg.locator('.ordine li', has_text='Bandito').click()
    t(f'{W} O1 stat block di lato cliccando la riga', pg.locator('#col-terza .sb', has_text='BANDITO DELLA STRADA').count() == 1)
    pg.click('[data-az="statBlockRiga"]'); t(f'{W} O1 stat block anche in una finestra', fin().locator('.sb', has_text='Round 2–3').count() == 1); premi('Chiudi')
    pg.click('#col-terza [data-az="schedaRinforzi"]'); t(f'{W} rinforzi dalla scheda', fin().locator('[name="n"]').input_value() == 'Bandito della Strada'); premi('Tira ed entra')
    t(f'{W} rinforzo con la scheda nell\'iniziativa', pg.locator('.ordine li', has_text='Bandito').count() == 2)
    while pg.inner_text('.col-testa >> nth=1').find('Round 3') < 0: pg.click('[data-az="cmd"][data-c="avanti"]')
    t(f'{W} N1 promemoria del round 3 nella barra', pg.locator('.barra-turno .chip.promem', has_text='altri due banditi').count() == 1)
    largo('tattiche')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'tattiche_{larghezza}.png'), full_page=False)
    pg.click('[data-az="fineComb"]'); premi('Chiudi il combattimento')
    t(f'{W} N fine: incontro giocato', 'segnato come giocato' in fin().inner_text()); premi('Chiudi')
    terza('incontri'); t(f'{W} N incontro giocato nella cartella', pg.locator('.voce', has_text='Agguato sulla strada').locator('.chip.ok', has_text='giocato').count() == 1)
    # --- J9 e ferita grave di un nemico; XP (N3, J10)
    pg.click('[data-az="impostazioni"]'); fin().locator('[name="pf_nemici"]').check(); fin().locator('[name="xp"]').check(); premi('Salva')
    terza('incontri'); pg.locator('[data-az="selIncontro"]', has_text='Agguato sulla strada').click()
    t(f'{W} N3 XP dell\'incontro con gli XP accesi', "XP dell'incontro: 2.400" in pg.inner_text('#col-terza'), pg.inner_text('#col-terza')[-300:])
    pg.click('[data-az="avviaIncontro"]')
    for i, v in enumerate(['1', '2', '3']): pg.locator('.pgini input[type="number"]').nth(i).fill(v)
    pg.click('[data-az="avvia"]')
    lupi = pg.locator('.ordine li', has_text='Lupo ×4')
    t(f'{W} J9 PF per creatura nella riga', lupi.locator('.chip.num').count() == 4)
    lupi.click(); pg.click('.azioni-riga [data-az="dannoRiga"]'); fin().locator('[name="k"]').select_option('2'); fin().locator('[name="n"]').fill('20'); premi('Applica')
    f = fin(); t(f'{W} J9 danno sotto 0: ferita grave del nemico separato', 'Lupo 3' in f.inner_text() and 'Riga -7' in f.inner_text(), f.inner_text()[:200])
    f.locator('[name="tab"][value="area"]').check(); premi('Attacca')
    t(f'{W} J9 il lupo ferito ha la sua riga con il malus', pg.locator('.ordine li', has_text='Lupo 3').locator('.chip.fer, .chip.cond, .chip.sv').count() >= 1 and pg.locator('.ordine li', has_text='Lupo ×3').count() == 1, pg.inner_text('.ordine'))
    pg.locator('.ordine li', has_text='Lupo 3').click(); pg.click('.azioni-riga [data-az="cmd"][data-c="fuori"]')
    pg.click('[data-az="fineComb"]'); premi('Chiudi il combattimento')
    t(f'{W} J10 XP dei nemici sconfitti nel riepilogo', 'XP dei nemici sconfitti: 400' in fin().inner_text(), fin().inner_text()); premi('Chiudi')
    # --- salvataggio del bestiario e dei PNG dopo la ricarica
    pg.wait_for_timeout(1300); pg.reload(); pg.wait_for_selector('text=Crea Schermo campagna')
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg'); terza('bestiario')
    t(f'{W} PNG salvati nella campagna', pg.locator('#best-lista .voce', has_text='Guardia del molo').count() == 1)
    pg.click('[data-az="bestFonte"][data-f="mostro"]'); t(f'{W} mostri condivisi salvati', pg.locator('#best-lista .voce', has_text='Laboon').count() == 1)
    pg.click('[data-az="bestFonte"][data-f="generico"]'); t(f'{W} PNG generici salvati', pg.locator('#best-lista .voce', has_text='Guardia cittadina').count() == 1)
    # --- esporta la campagna con i mostri dei suoi incontri; campagna della Build 2a
    pg.click('[data-az="campagne"]'); pg.locator('.camp', has_text='esempio').locator('[data-az="esportaCamp"]').click()
    t(f'{W} esporta con i mostri condivisi usati', '"mostri"' in fin().locator('textarea').input_value() and 'mesempiolupo' in fin().locator('textarea').input_value()); premi('Chiudi')
    pg.click('[data-az="importa"]'); fin().locator('[name="t"]').fill(open(BUILD2A, encoding='utf8').read()); premi('Importa'); pg.wait_for_timeout(400)
    pg.locator('.camp', has_text='Campagna della Build 2a').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    br = pg.locator('.pg', has=pg.locator('.pg-nome', has_text='Bruno'))
    t(f'{W} Build 2a: malus, veleno e ferite gravi', br.locator('.chip.vel').count() == 1 and br.locator('.chip.fer', has_text='Emorragia lieve').count() == 1 and br.locator('.chip', has_text='mano sinistra').count() == 1, br.inner_text())
    t(f'{W} Build 2a: combattimento in corso', pg.locator('.ordine li').count() == 4)
    pg.click('[data-az="cmd"][data-c="avanti"]'); terza('bestiario'); pg.click('[data-az="bestFonte"][data-f="png"]')
    t(f'{W} Build 2a: nessun PNG nella campagna vecchia', 'Nessun PNG' in pg.inner_text('#best-lista'))
    pg.click('[data-az="bestFonte"][data-f="mostro"]'); t(f'{W} Build 2a: i mostri condivisi ci sono anche qui', pg.locator('#best-lista .voce', has_text='Laboon').count() == 1)
    pg.click('[data-az="bestFonte"][data-f="generico"]'); t(f'{W} Build 2a: e i PNG generici', pg.locator('#best-lista .voce', has_text='Guardia cittadina').count() == 1)
    largo('build 2a')
    t(f'{W} nessun errore in console', not errori, errori[:3])
    ctx.close()

BUILD2B = os.path.join(R, 'prove', 'campagna_build2b.json')
def prova2c(browser, larghezza):
    """Build 2c: meteo dalle Tabelle del Tempo Atmosferico (AA1), scorte e Foraggiare (AA2), compagnia (AA3), campagna della 2b."""
    ctx = browser.new_context(viewport={'width': larghezza, 'height': 900 if larghezza > 500 else 820})
    pg = ctx.new_page(); errori = []
    pg.on('console', lambda m: m.type == 'error' and errori.append(m.text))
    pg.on('pageerror', lambda e: errori.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
    W = f'[{larghezza} 2c]'
    def fin(): return pg.locator('.velo').last
    def premi(testo): fin().locator('footer button', has_text=re.compile('^' + testo + '$')).click()
    def largo(nome):
        sw = pg.evaluate('document.documentElement.scrollWidth'); t(f'{W} niente scorrimento orizzontale: {nome}', sw <= larghezza, sw)
    def terza(s): pg.click(f'[data-az="scheda"][data-s="{s}"]')
    def imposta(voce):
        pg.click('[data-az="impostaMeteo"]'); fin().locator('[name="r"]').select_option(voce); premi('Imposta')
    def zona(z): pg.locator('#zona').select_option(z)
    def coda_via():
        while pg.locator('.coda [data-az="codaTutti"]').count() or pg.locator('.coda [data-az="codaFatto"]').count():
            pg.locator('.coda [data-az="codaTutti"], .coda [data-az="codaFatto"]').first.click()
    # --- creazione guidata con la compagnia (AA3-7) e la zona dal menu a gruppi
    pg.click('text=Crea Schermo campagna')
    fin().locator('#w-nome').fill('Prova 2c'); premi('Avanti'); fin().locator('#w-anno').fill('1462'); premi('Avanti')
    fin().locator('#w-g').fill('10'); fin().locator('#w-m').select_option('6'); premi('Avanti')
    t(f'{W} AA1 menu delle zone: 17 zone in 5 gruppi', fin().locator('#w-zona option').count() == 17 and fin().locator('#w-zona optgroup').count() == 5)
    fin().locator('#w-zona').select_option('12'); premi('Avanti'); premi('Avanti')
    fin().locator('#w-pers').fill('Hassim, guida\nTobia'); fin().locator('#w-acc').fill('1'); premi('Avanti')
    t(f'{W} AA3-7 consumo con i nomi', '3 accompagnatori' in fin().inner_text()); fin().locator('#w-forag').fill('5'); premi('Avanti'); premi('Crea')
    pg.wait_for_selector('#p-compagnia')
    t(f'{W} AA3-7 compagnia creata', pg.locator('#p-compagnia .membro', has_text='Hassim').count() == 1 and 'guida' in pg.inner_text('#p-compagnia') and pg.inner_text('#n-senza') == '1')
    t(f'{W} AA1 Savana nella testata', '12. Savana e steppa' in pg.inner_text('.meteo-chip'))
    # --- campagna d'esempio
    pg.click('[data-az="campagne"]'); pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300)
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg'); terza('viaggio')
    t(f'{W} AA1 zona 1 e particolarità apribili', '1. Pianure e colline temperate' in pg.inner_text('#p-meteo') and pg.locator('#p-meteo details').count() >= 3)
    pg.locator('#p-meteo summary', has_text='Regole generali').click(); t(f'{W} AA1 regole generali con le tabelle', pg.locator('#p-meteo .tabmeteo').count() >= 2 and 'Acclimatarsi' in pg.inner_text('#p-meteo'))
    imposta('Acquazzone'); t(f'{W} AA1 durata 2d4 ore dall\'alba', pg.locator('#p-meteo .chip.promem', has_text='dalle 06:00').count() == 1, pg.inner_text('#p-meteo')[:300])
    t(f'{W} AA1 alle 17:30 è finita: clima base nella testata', 'Clima fresco' in pg.inner_text('.meteo-chip') and 'Ora (17:30): Clima fresco' in pg.inner_text('#p-meteo'), pg.inner_text('.meteo-chip'))
    pg.click('[data-az="inizioDurata"]'); fin().locator('[name="h"]').select_option('17'); premi('Imposta')
    t(f'{W} AA1 inizio scelto: in vigore adesso (17:30)', pg.locator('#p-meteo .chip.promem', has_text='dalle 17:00').count() == 1 and 'Acquazzone' in pg.inner_text('.meteo-chip'))
    imposta('Nebbia'); t(f'{W} AA1 Nebbia che si dirada', 'Nebbia fino alle' in pg.inner_text('#p-meteo'))
    zona('5'); imposta('Vento forte')
    t(f'{W} AA1 stato del mare: agitato, Nuotare CD 15', 'Mare agitato' in pg.inner_text('#p-meteo') and 'mare agitato' in pg.inner_text('.meteo-chip') and pg.locator('#p-meteo summary', has_text='Navigazione').count() == 1)
    zona('6'); t(f'{W} AA1 variante delle Montagne', pg.locator('[data-az-cambio="variante"][data-v="oltre4500"]').count() == 1)
    pg.click('[data-az="predire"]'); fin().locator('[name="t"]').fill('25'); premi('Prevedi')
    t(f'{W} AA1 Predire il tempo: 3 giorni', pg.locator('#p-meteo .chip', has_text=':').count() >= 3, pg.inner_text('#p-meteo')[:400])
    zona('16'); t(f'{W} AA1 Sotterraneo: niente previsioni, nuova zona di gallerie', pg.locator('[data-az="nuoveGallerie"]').count() == 1 and pg.locator('[data-az="predire"]').count() == 0)
    pg.click('[data-az="nuoveGallerie"]'); t(f'{W} AA1 condizione del sotterraneo', 'Clima fresco +' in pg.inner_text('#p-meteo .risultato'))
    zona('1'); pg.click('[data-az="ritira"]'); coda_via()
    largo('meteo')
    # --- compagnia (AA3)
    t(f'{W} AA3 Mira e Fulmine nella compagnia', pg.locator('#p-compagnia .membro', has_text='Mira').count() == 1 and pg.locator('#p-compagnia .membro', has_text='Fulmine').count() == 1 and 'di Aria' in pg.inner_text('#p-compagnia'))
    pg.click('[data-az="nuovoAcc"]'); fin().locator('[name="n"]').fill('Hassim'); fin().locator('[name="r"]').fill('guida'); fin().locator('[name="s"]').select_option(index=1); premi('Salva')
    h = pg.locator('#p-compagnia .membro', has_text='Hassim')
    t(f'{W} AA3-2 accompagnatore con la scheda', h.locator('[data-az="combComp"]').count() == 1 and h.locator('[data-az="vediSchedaComp"]').count() == 1)
    h.locator('[data-az="combComp"]').click()
    t(f'{W} AA3-2 + Combattimento: riga dell\'avvio come alleato', pg.locator('[data-bind="nemici.0.nome"]').input_value() == 'Hassim' and 'alleato' in (pg.locator('[data-bind="nemici.0.nome"]').get_attribute('title') or ''))
    pg.click('[data-az="nuovoAni"]'); f = fin(); f.locator('[name="n"]').fill('Zanna'); f.locator('[name="t"]').select_option('compagno'); f.locator('[name="m"]').select_option('razioni'); f.locator('[name="ta"]').check(); premi('Salva')
    t(f'{W} AA3-3 animale carnivoro che trova l\'acqua', 'trova da sé l\'acqua' in pg.locator('#p-compagnia .membro', has_text='Zanna').inner_text())
    pg.click('[data-az="accomp"][data-d="1"]'); t(f'{W} AA3-2 senza nome +1', pg.inner_text('#n-senza') == '3')
    terza('viaggio')
    t(f'{W} AA3-4 fabbisogni con la compagnia', 'cibo 9' in pg.inner_text('#p-scorte') and 'foraggio 1' in pg.inner_text('#p-scorte'), pg.inner_text('#p-scorte')[:200])
    # --- Foraggiare (AA2-4)
    pg.click('[data-az="foraggiare"]'); f = fin()
    t(f'{W} AA2-4 CD e acqua inclusa', 'CD 1' in f.inner_text() and 'inclusa' in f.inner_text())
    f.locator('input[name^="f_"]').first.check(); f.locator('input[name^="t_"]').first.fill('18')
    t(f'{W} AA2-4 anteprima della resa', 'cibo 3' in f.locator('#f-esito').inner_text() or 'cibo 2' in f.locator('#f-esito').inner_text(), f.locator('#f-esito').inner_text())
    ora0 = pg.inner_text('.orologio .ora'); premi('Foraggia')
    t(f'{W} AA2-4 +2 ore', pg.inner_text('.orologio .ora')[:5] != ora0[:5])
    pg.click('[data-az="foraggiare"]'); t(f'{W} AA2-4 una prova al giorno', 'ha già foraggiato oggi' in fin().inner_text()); premi('Annulla')
    # --- razionamento con accompagnatori con nome e animali (AA3-4)
    pg.locator('[data-az-cambio="recipienti"]').uncheck()
    pg.locator('[data-az="scortaN"][data-chi="acqua"]').click(); fin().locator('[name="n"]').fill('-50'); premi('Applica')
    pg.locator('[data-az="scortaN"][data-chi="acqua"]').click(); fin().locator('[name="n"]').fill('2'); premi('Applica')
    pg.click('[data-az="salto"]'); fin().locator('[name="n"]').fill('1'); fin().locator('[name="u"]').select_option('giorni'); premi('Avanza')
    pg.locator('[data-az="razionamento"]').first.click(); f = fin()
    t(f'{W} AA3-4 Scegli chi beve: PG, Mira, Hassim, Fulmine', all(f.locator('select', has=pg.locator('option')).filter(has_text='').count() > 0 for _ in [0]) and 'Mira' in f.inner_text() and 'Fulmine' in f.inner_text() and f.locator('[name="sb"]').count() == 1)
    f.locator('select[name^="v_acc:"]').first.select_option('b'); f.locator('select[name^="v_ani:"]').first.select_option('b'); premi('Conferma')
    t(f'{W} AA3 Sete sui membri della compagnia', pg.locator('#p-compagnia .chip.sv', has_text='Sete').count() >= 1 and pg.locator('[data-az="razionamento"]').count() == 0)
    coda_via()
    # --- scorte spente (AA2-7)
    pg.click('[data-az="impostazioni"]'); fin().locator('[name="scorte"]').uncheck(); premi('Salva')
    t(f'{W} AA2-7 scorte spente: niente pannello, la compagnia resta', pg.locator('#p-scorte').count() == 0 and 'Scorte spente' in pg.inner_text('#col-terza') and pg.locator('#p-compagnia').count() == 1)
    largo('compagnia')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'viaggio_{larghezza}.png'), full_page=True)
    # --- schede e PG dalla schermata iniziale (aggiunta del 01/11 sera)
    pg.click('[data-az="campagne"]'); pg.wait_for_selector('.lista-camp')
    es = pg.locator('.camp', has_text='Campagna d\'esempio').first
    t(f'{W} home: «+ PG» e «+ PNG» sulla campagna', es.locator('[data-az="pgHome"]').count() == 1 and es.locator('[data-az="pngHome"]').count() == 1 and '1 PNG' in es.inner_text(), es.inner_text())
    pg.click('[data-az="schedaHome"]'); t(f'{W} home «+ Scheda»: condivise, PNG di una campagna, Incolla', fin().locator('[data-agg]').count() == 4 and fin().locator('[name="c"] option').count() >= 2)
    fin().locator('[data-agg="generico"]').click(); fin().locator('[data-k="nome"]').fill('Doganiere'); premi('Salva'); pg.wait_for_timeout(300)
    t(f'{W} home: PNG generico salvato, si resta nella schermata iniziale', pg.locator('.lista-camp').count() == 1 and pg.locator('.velo').count() == 0)
    es.locator('[data-az="pngHome"]').click(); fin().locator('[data-k="nome"]').fill('Oste del mulino'); premi('Salva'); pg.wait_for_timeout(600)
    es = pg.locator('.camp', has_text='Campagna d\'esempio').first
    t(f'{W} home: PNG aggiunto alla campagna', '2 PNG' in es.inner_text(), es.inner_text())
    es.locator('[data-az="pgHome"]').click(); f = fin(); f.locator('[name="nome"]').fill('Dario'); f.locator('[name="fatica_max"]').fill('20'); f.locator('[name="ferita_max"]').fill('20'); premi('Aggiungi'); pg.wait_for_timeout(600)
    es = pg.locator('.camp', has_text='Campagna d\'esempio').first
    t(f'{W} home: PG aggiunto alla campagna', '4 PG' in es.inner_text(), es.inner_text())
    pg.click('[data-az="schedaHome"]'); fin().locator('[name="c"]').select_option(label='Campagna d\'esempio'); fin().locator('[data-agg="incolla"]').click()
    fin().locator('[name="t"]').fill(open(SB_DOC, encoding='utf8').read()); premi('Leggi')
    t(f'{W} home Incolla con la campagna: PNG della campagna fra le destinazioni', fin().locator('[name="d0"] option').count() == 3 and fin().locator('[name="d0"]').input_value() == 'png')
    for i in range(1, fin().locator('[name^="k"]').count()): fin().locator(f'[name="k{i}"]').uncheck()
    premi('Importa'); pg.wait_for_timeout(600)
    t(f'{W} home Incolla: PNG nella campagna', '3 PNG' in pg.locator('.camp', has_text='Campagna d\'esempio').first.inner_text())
    pg.click('[data-az="schedaHome"]'); fin().locator('[data-agg="incolla"]').click(); pg.wait_for_timeout(200)
    t(f'{W} home Incolla: campagna scelta per difetto (la prima)', pg.locator('.velo').count() == 1); premi('Annulla')
    pg.locator('.camp', has_text='Campagna d\'esempio').first.locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    t(f'{W} home: la campagna aperta ha il PG e i PNG nuovi', pg.locator('.pg', has_text='Dario').count() == 1)
    terza('bestiario'); t(f'{W} home: PNG della campagna nel bestiario', pg.locator('#best-lista .voce', has_text='Oste del Mulino').count() == 1 or pg.locator('#best-lista .voce', has_text='Oste del mulino').count() == 1, pg.inner_text('#best-lista'))
    pg.click('[data-az="bestFonte"][data-f="generico"]'); t(f'{W} home: PNG generico condiviso', pg.locator('#best-lista .voce', has_text='Doganiere').count() == 1)
    # --- campagna salvata con la Build 2b
    pg.click('[data-az="campagne"]'); pg.click('[data-az="importa"]'); fin().locator('[name="t"]').fill(open(BUILD2B, encoding='utf8').read()); premi('Importa'); pg.wait_for_timeout(400)
    pg.locator('.camp', has_text='Campagna della Build 2b').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg'); terza('viaggio')
    t(f'{W} Build 2b: zona 10 e tempesta di sabbia', '10. Deserto sabbioso' in pg.inner_text('.meteo-chip') and 'Tempesta di sabbia' in pg.inner_text('#p-meteo'))
    t(f'{W} Build 2b: 3 accompagnatori senza nome', pg.inner_text('#n-senza') == '3')
    t(f'{W} Build 2b: combattimento in corso', pg.locator('.ordine li').count() == 5, pg.locator('.ordine li').count())
    pg.click('[data-az="cmd"][data-c="avanti"]')
    t(f'{W} nessun errore in console', not errori, errori[:3])
    ctx.close()

BUILD2C = os.path.join(R, 'prove', 'campagna_build2c.json')
def prova3a(browser, larghezza):
    """Build 3a: condizioni e Prontuario (AB1), Fallimenti critici (AB2), malus e bonus (AB3), dadi, luce, promemoria, log (AB4), campagna della 2c."""
    ctx = browser.new_context(viewport={'width': larghezza, 'height': 900 if larghezza > 500 else 820})
    pg = ctx.new_page(); errori = []
    pg.on('console', lambda m: m.type == 'error' and errori.append(m.text))
    pg.on('pageerror', lambda e: errori.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
    W = f'[{larghezza} 3a]'
    def fin(): return pg.locator('.velo').last
    def premi(testo): fin().locator('footer button', has_text=re.compile('^' + testo + '$')).click()
    def largo(nome):
        sw = pg.evaluate('document.documentElement.scrollWidth'); t(f'{W} niente scorrimento orizzontale: {nome}', sw <= larghezza, sw)
    def terza(s): pg.click(f'[data-az="scheda"][data-s="{s}"]')
    def card(nome): return pg.locator('.pg', has=pg.locator('.pg-nome', has_text=nome))
    def coda_via():
        for _ in range(30):
            b = pg.locator('.coda [data-az="codaTutti"], .coda [data-az="codaFatto"], .coda [data-az="codaFattoId"]')
            if not b.count(): break
            b.first.click()
    pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300)
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    # --- AB1-4 Prontuario: Condizioni
    terza('prontuario'); pg.wait_for_selector('#p-prontuario')
    t(f'{W} AB1-4 Prontuario: 42 condizioni + 3 voci di regola', pg.locator('#p-prontuario .cond-card').count() == 45, pg.locator('#p-prontuario .cond-card').count())
    t(f'{W} AB1-4 37 nomi in rosso', pg.locator('#p-prontuario .cond-card summary .cond-t').count() == 37, pg.locator('#p-prontuario .cond-card summary .cond-t').count())
    pg.click('[data-az="prontGruppo"][data-g="Paura"]')
    t(f'{W} AB1-4 gruppo Paura: 4 condizioni e la voce Paura', pg.locator('#p-prontuario .cond-card').count() == 5)
    pg.click('[data-az="prontGruppo"][data-g=""]')
    pg.locator('#pront-q').fill('stabilizz'); pg.wait_for_timeout(500)
    t(f'{W} AB1-2 Stabilizzato: testo della Collana', 'emorragie sono state fermate' in pg.inner_text('#p-prontuario'))
    pg.locator('#pront-q').fill('Guarire'); pg.wait_for_timeout(500)
    t(f'{W} AB1-2 nessun «Guarire» nei testi', pg.locator('#p-prontuario .cond-card[data-nome]').count() == 0, pg.locator('#p-prontuario .cond-card[data-nome]').count())
    pg.locator('#pront-q').fill('Accecato'); pg.wait_for_timeout(500)
    acc = pg.locator('.cond-card[data-nome="Accecato"]')
    t(f'{W} AB1-1 Accecato: sintesi della Guida e testo di golarion', acc.count() == 1 and 'considera gli avversari occultati al 50%' in acc.inner_text() and 'Occultamento Totale' in acc.inner_text())
    acc.locator('.cond-t[data-az="vediCond"][data-n="Prono"]').first.click(); pg.wait_for_timeout(200)
    t(f'{W} AB1-4 un tocco su una condizione apre la sua scheda', pg.locator('.cond-card[data-nome="Prono"][open]').count() == 1)
    t(f'{W} AB1-4 sintesi al passaggio del mouse', 'Prono:' in (pg.locator('.cond-card[data-nome="Accecato"] .cond-t[data-n="Prono"]').first.get_attribute('title') or 'Prono:') )
    largo('Prontuario')
    pg.locator('.cond-card[data-nome="Prono"] [data-az="applicaCond"]').click()
    fin().locator('[name="chi"]').select_option(label='Aria'); premi('Avanti')
    t(f'{W} AB1-4 Applica a…: finestra Malus già impostata', fin().locator('[name="cond"]').input_value() == 'Prono'); premi('Applica')
    t(f'{W} AB1-4 Prono su Aria', card('Aria').locator('.chip', has_text='Prono').count() == 1)
    # --- AB1-3 Terrore crescente nella finestra Malus
    def malus(nome_pg): card(nome_pg).locator('[data-az="malus"]').click()
    malus('Bruno'); fin().locator('[name="cond"]').select_option('Scosso'); fin().locator('[name="dn"]').fill('3'); premi('Applica')
    malus('Bruno'); fin().locator('[name="cond"]').select_option('Scosso')
    t(f'{W} AB1-3 anteprima: diventa Spaventato', 'diventa Spaventato' in ' '.join(fin().locator('#mb-cresc').inner_text().split()))
    premi('Applica'); t(f'{W} AB1-3 Scosso + Scosso → Spaventato', card('Bruno').locator('.chip', has_text='Spaventato').count() == 1 and card('Bruno').locator('.chip', has_text='Scosso').count() == 0)
    malus('Cira'); fin().locator('[name="cond"]').select_option('Stordito'); premi('Applica')
    t(f'{W} AB1-3 Stordito: CA colto alla sprovvista −2', 'CA' in card('Cira').inner_text())
    # --- AB3 bonus con tipo, × livello, modelli
    malus('Aria'); f = fin(); f.locator('[name="tipo"]').select_option('bonus'); f.locator('[name="nome"]').fill('Scudo'); f.locator('[name="tb"]').select_option('scudo')
    f.locator('[name="m_ca"]').fill('4'); f.locator('[name="du"]').select_option('minuti'); f.locator('[name="livOn"]').check()
    t(f'{W} AB3-1 livello del PG già scritto', f.locator('[name="liv"]').input_value() == '7')
    premi('Salva come modello'); fin().locator('[name="nm"]').fill('Scudo'); premi('Salva')
    premi('Applica')
    t(f'{W} AB3-1 Scudo 1 minuto × 7', card('Aria').locator('.chip', has_text='Scudo').count() == 1 and '7 min' in card('Aria').locator('.chip', has_text='Scudo').inner_text(), card('Aria').locator('.chips').inner_text())
    malus('Aria'); f = fin()
    t(f'{W} AB3-2 menu dei modelli', f.locator('[name="modello"] option', has_text='Scudo').count() == 1)
    f.locator('[name="modello"]').select_option(label='Scudo')
    t(f'{W} AB3-2 il modello riempie i campi', f.locator('[name="nome"]').input_value() == 'Scudo' and f.locator('[name="m_ca"]').input_value() == '4' and f.locator('[name="tb"]').input_value() == 'scudo')
    f.locator('[name="nome"]').fill('Scudo della fede'); f.locator('[name="m_ca"]').fill('2'); premi('Applica')
    t(f'{W} AB3-3 bonus di scudo più basso barrato', card('Aria').locator('.chip.barrato', has_text='Scudo della fede').count() == 1)
    # --- AB2 Fallimento critico dal riquadro
    card('Bruno').locator('[data-az="fallimento"]').click(); f = fin()
    f.locator('[name="t"]').select_option('mischia'); f.locator('[data-fc="tira"]').click()
    t(f'{W} AB2 anteprima con il tiro', 'd12 =' in f.inner_text())
    premi('Applica'); terza('log')
    t(f'{W} AB2 Fallimento critico nel log', 'Fallimento critico (Armi da mischia, d12 =' in pg.inner_text('#col-terza'))
    # --- AB2-3 consultazione degli Imprevisti
    terza('prontuario'); pg.click('[data-az="prontSez"][data-s="imprevisti"]'); pg.locator('#pront-q').fill('')
    t(f'{W} AB2-3 Imprevisti: 5 Fallimenti critici + 6 Ferite gravi + 2 tabelle', pg.locator('#p-prontuario details.cartella').count() == 13, pg.locator('#p-prontuario details.cartella').count())
    pg.locator('#p-prontuario summary', has_text='Amputazioni').click()
    t(f'{W} AB2-3 Amputazioni con gli spazi', 'mancante. -5 Scalare' in pg.inner_text('#p-prontuario') and 'nota mancante nel Vol. 3' in pg.inner_text('#p-prontuario'))
    pg.locator('#p-prontuario summary', has_text='Armi a spargimento').click(); pg.locator('#p-prontuario [data-az="fallimento"][data-t="spargimento"]').click()
    t(f'{W} AB2 Tira… dalla tabella: scelta di chi', fin().locator('[name="chi"]').count() == 1 and fin().locator('[name="t"]').input_value() == 'spargimento'); premi('Annulla')
    largo('Imprevisti')
    # --- AB4-1 dadi
    pg.click('[data-az="dadi"]'); f = fin(); f.locator('[name="e"]').fill('1d20+5'); premi('Tira')
    t(f'{W} AB4-1 tiro con il risultato', f.locator('#dd-ris .risultato').count() == 1 and f.locator('#dd-sto li').count() == 1)
    f.locator('[data-dd="ripeti"]').click()
    t(f'{W} AB4-1 ripeti una volta', f.locator('#dd-sto li').count() == 2 and '(ripetuto)' in f.inner_text() and f.locator('[data-dd="ripeti"]').count() == 0)
    f.locator('[name="va"]').check(); f.locator('[name="lg"]').check(); premi('Tira')
    t(f'{W} AB4-1 vantaggio', 'con vantaggio' in f.locator('#dd-sto').inner_text())
    premi('Chiudi')
    # --- AB4-2 luce
    terza('viaggio')
    pg.click('[data-az="impostaMeteo"]'); fin().locator('[name="r"]').select_option(index=0); premi('Imposta'); coda_via()
    pg.click('[data-az="nuovaLuce"]'); f = fin(); f.locator('[name="t"]').select_option('torcia'); f.locator('[name="c"]').select_option(label='Aria')
    t(f'{W} AB4-2 descrizione della Guida', 'Illumina in un raggio di 9 m' in f.inner_text()); premi('Aggiungi')
    t(f'{W} AB4-2 torcia accesa', pg.locator('#p-luce .chip.ok', has_text='accesa').count() == 1 and '1 h' in pg.inner_text('#p-luce'))
    pg.click('[data-az="tempo"][data-r="600"]')
    t(f'{W} AB4-2 dopo 1 ora: consumata e avviso in coda', 'consumata' in pg.inner_text('#p-luce') and ('si è consumata' in pg.inner_text('.coda') or 'restano 10 minuti' in pg.inner_text('.coda')))
    coda_via(); pg.click('[data-az="ricaricaLuce"]')
    pg.click('[data-az="impostaMeteo"]'); fin().locator('[name="r"]').select_option('Pioggia battente'); premi('Imposta'); coda_via()
    t(f'{W} AB4-2 la Pioggia battente non la lascia accendere', pg.locator('#p-luce [data-az="accendiLuce"][disabled]').count() == 1 and 'Pioggia battente' in pg.inner_text('#p-luce'))
    pg.locator('#p-luce [data-az-cambio="riparoLuce"]').check()
    pg.click('#p-luce [data-az="accendiLuce"]'); t(f'{W} AB4-2 al riparo si accende', pg.locator('#p-luce .chip.ok', has_text='accesa').count() == 1)
    pg.click('[data-az="nuovaLuce"]'); f = fin(); f.locator('[name="t"]').select_option('personalizzata')
    t(f'{W} AB4-2 personalizzata: campi visibili', f.locator('#l-pers').is_visible())
    f.locator('[name="pn"]').fill('Fiamma perenne'); f.locator('[name="pr"]').fill('6'); f.locator('[name="pu"]').select_option('permanente'); premi('Aggiungi')
    fp = pg.locator('#p-luce .membro', has_text='Fiamma perenne')
    t(f'{W} AB4-2 luce permanente accesa, senza Rinnova', fp.count() == 1 and 'permanente' in fp.inner_text() and fp.locator('.chip.ok').count() == 1 and fp.locator('[data-az="ricaricaLuce"]').count() == 0)
    pg.click('[data-az="tempo"][data-r="600"]'); coda_via()
    t(f'{W} AB4-2 dopo 1 ora la permanente è ancora accesa', pg.locator('#p-luce .membro', has_text='Fiamma perenne').locator('.chip.ok').count() == 1)
    # --- AB4-3 promemoria
    pg.click('[data-az="nuovoPromemoria"]'); f = fin(); f.locator('[name="t"]').fill('Arriva la carovana'); f.locator('[name="n"]').fill('10'); premi('Aggiungi')
    t(f'{W} AB4-3 promemoria nel pannello', 'Arriva la carovana' in pg.inner_text('#p-promemoria'))
    pg.click('[data-az="tempo"][data-r="100"]')
    t(f'{W} AB4-3 scatta in coda', 'Promemoria: Arriva la carovana' in (pg.inner_text('.coda') if pg.locator('.coda').count() else '') or pg.locator('.coda').count() > 0, pg.inner_text('.coda') if pg.locator('.coda').count() else '')
    coda_via(); largo('Viaggio con luce e promemoria')
    # --- AB4-4 log
    terza('log'); pg.click('[data-az="iniziaSessione"]')
    t(f'{W} AB4-4 inizio della sessione', pg.locator('#col-terza .log li.sessione').count() == 1)
    pg.click('[data-az="logTipo"][data-k="tiri"]')
    righe = pg.locator('#col-terza .log li:not(.sessione)')
    t(f'{W} AB4-4 filtro Tiri', righe.count() >= 1 and all(x.startswith('Dadi:') for x in [righe.nth(i).locator('span').nth(1).inner_text() for i in range(righe.count())]))
    pg.click('[data-az="esportaLog"]'); t(f'{W} AB4-4 esporta questa sessione', fin().locator('[name="d"][value="sessione"]').count() == 1); premi('Annulla')
    pg.click('[data-az="logTipo"][data-k=""]'); largo('Log')
    # --- campagna salvata con la Build 2c
    pg.click('[data-az="campagne"]'); pg.click('[data-az="importa"]'); fin().locator('[name="t"]').fill(open(BUILD2C, encoding='utf8').read()); premi('Importa'); pg.wait_for_timeout(400)
    pg.locator('.camp', has_text='Campagna della Build 2c').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg'); terza('viaggio')
    t(f'{W} Build 2c: compagnia e meteo con durata', pg.locator('#p-compagnia .membro', has_text='Zanna').count() == 1 and 'Acquazzone' in pg.inner_text('#p-meteo'))
    t(f'{W} Build 2c: Livelli negativi con la regola nuova', '/46' in card('Bruno').inner_text().replace(' ', ''), card('Bruno').inner_text()[:200])
    t(f'{W} Build 2c: combattimento in corso con Fallimento critico nella barra', pg.locator('.barra-turno [data-az="fallimento"]').count() == 1)
    malus('Bruno'); fin().locator('[name="cond"]').select_option('Confuso'); fin().locator('[name="dn"]').fill('5'); premi('Applica')
    visto = False
    for _ in range(5):
        pg.click('[data-az="cmd"][data-c="avanti"]')
        if 'Confuso, d%' in pg.inner_text('.barra-turno'): visto = True; break
    t(f'{W} AB1-3 Confuso: d% nella barra del turno', visto)
    largo('Build 2c')
    t(f'{W} nessun errore in console', not errori, errori[:3])
    ctx.close()

BUILD3A = os.path.join(R, 'prove', 'campagna_build3a.json')
def prova3b(browser, larghezza):
    ctx = browser.new_context(viewport={'width': larghezza, 'height': 900 if larghezza > 500 else 820})
    pg = ctx.new_page(); errori = []
    pg.on('console', lambda m: m.type == 'error' and errori.append(m.text))
    pg.on('pageerror', lambda e: errori.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
    W = f'[{larghezza} 3b]'
    def fin(): return pg.locator('.velo').last
    def premi(testo): fin().locator('footer button', has_text=re.compile('^' + testo + '$')).click()
    def largo(nome):
        sw = pg.evaluate('document.documentElement.scrollWidth'); t(f'{W} niente scorrimento orizzontale: {nome}', sw <= larghezza, sw)
    def terza(s): pg.click(f'[data-az="scheda"][data-s="{s}"]')
    def card(nome): return pg.locator('.pg', has=pg.locator('.pg-nome', has_text=nome))
    def coda_via():
        for _ in range(30):
            b = pg.locator('.coda [data-az="codaTutti"], .coda [data-az="codaFatto"], .coda [data-az="codaFattoId"]')
            if not b.count(): break
            b.first.click()
    def log(): terza('log'); x = pg.inner_text('#col-terza'); return x
    pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300)
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    # --- AC1-1 menu del Prontuario e sezioni
    terza('prontuario'); pg.wait_for_selector('#p-prontuario')
    t(f'{W} AC1-1 dieci sezioni', pg.locator('#p-prontuario [data-az="prontSez"]').count() == 10, pg.locator('#p-prontuario [data-az="prontSez"]').count())
    attese = {'abilita': 20, 'combattimento': 3, 'cure': 3, 'viaggi': 1, 'pericoli': 11, 'riparare': 1, 'locande': 3}
    for k, n in attese.items():
        pg.click(f'[data-az="prontSez"][data-s="{k}"]')
        c = pg.locator('#p-prontuario details[data-voce]').count(); t(f'{W} AC sezione {k}: {n} voci', c == n, c)
    pg.click('[data-az="prontSez"][data-s="abilita"]')
    t(f'{W} AC2-1 Utilizzare congegni magici, niente Addestrare animali', pg.locator('#p-prontuario summary', has_text='Utilizzare congegni magici').count() == 1 and pg.locator('#p-prontuario summary', has_text='Addestrare animali').count() == 0)
    largo('Prontuario: Abilità')
    pg.click('[data-az="prontSez"][data-s="meteo"]')
    t(f'{W} AC8-1 Meteo: tabelle della zona aperte e appendici', pg.locator('#p-prontuario details[open]').count() >= 1 and pg.locator('#p-prontuario summary', has_text='Appendice A').count() == 1 and pg.locator('#p-prontuario summary', has_text='Appendice B').count() == 1)
    pg.locator('#pront-zona').select_option('9'); pg.wait_for_timeout(200)
    t(f'{W} AC8-2 altra zona solo da consultare', 'Ghiacci artici' in pg.inner_text('#p-prontuario') and 'Pianure e colline temperate' in pg.inner_text('#p-meteo') if pg.locator('#p-meteo').count() else 'Ghiacci artici' in pg.inner_text('#p-prontuario'))
    largo('Prontuario: Meteo')
    # --- ricerca su tutto
    pg.locator('#pront-q').fill('Orientarsi'); pg.wait_for_timeout(500)
    t(f'{W} AC1-1 la ricerca vale su tutto', pg.locator('#p-prontuario h3.sez-p').count() >= 2, pg.locator('#p-prontuario h3.sez-p').count())
    pg.locator('#pront-q').fill(''); pg.wait_for_timeout(400)
    # --- AC7-6 dadi cliccabili
    pg.click('[data-az="prontSez"][data-s="pericoli"]')
    v = pg.locator('#p-prontuario details[data-voce]', has=pg.locator('.dado')).first
    v.locator('summary').click(); d = v.locator('.dado').first; e = d.get_attribute('data-e'); d.click()
    pg.click('[data-az="dadi"]'); t(f'{W} AC7-6 il dado va nei Dadi', e.split('+')[0].split('-')[0] in fin().locator('#dd-sto').inner_text(), e); premi('Chiudi')
    # --- AC3 cerusico: contatore, pronto soccorso
    terza('viaggio')
    pg.locator('#p-compagnia [data-az-cambio="contatore"][data-k="medicinali"]').check()
    for _ in range(3): pg.click('#p-compagnia [data-az="contatore"][data-k="medicinali"][data-d="1"]')
    t(f'{W} AC3-4 medicinali 3/10', pg.inner_text('#n-medicinali') == '3/10')
    card('Aria').locator('[data-az="danno"]').click(); fin().locator('[name="n"]').fill('50'); premi('Applica')
    if pg.locator('.velo').count(): premi('Annulla') if fin().locator('footer button', has_text=re.compile('^Annulla$')).count() else premi('Chiudi')
    card('Aria').locator('[data-az="cura"]').click(); premi('Pronto soccorso…'); f = fin()
    f.locator('[name="cu"]').select_option(label='Cira (6 gradi)'); f.locator('[name="t"]').fill('25'); premi('Registra')
    t(f'{W} AC3-5 pronto soccorso: 1 unità di medicinali', pg.inner_text('#n-medicinali') == '2/10')
    card('Aria').locator('[data-az="cura"]').click(); premi('Pronto soccorso…')
    t(f'{W} AC3-5 una volta dopo ogni combattimento', pg.locator('.velo').count() == 0 and 'già avuto il pronto soccorso' in (pg.inner_text('#avviso') if pg.locator('#avviso').count() else ''))
    # --- AC3-6 Sanguinante: fermare il sanguinamento
    card('Bruno').locator('[data-az="malus"]').click(); fin().locator('[name="cond"]').select_option('Sanguinante'); fin().locator('[name="du"]').select_option('libera'); premi('Applica')
    card('Bruno').locator('.chip', has_text='Sanguinante').click(); premi('Fermare il sanguinamento…'); fin().locator('[name="t"]').fill('12'); premi('Registra')
    t(f'{W} AC3-6 sanguinamento fermato', card('Bruno').locator('.chip', has_text='Sanguinante').count() == 0)
    # --- AC7-5 TS periodico «CD +1 a ogni prova»
    card('Bruno').locator('[data-az="malus"]').click()
    t(f'{W} AC7-5 casella CD +1 a ogni prova', fin().locator('[name="tsInc"]').count() == 1); premi('Annulla')
    # --- AC3-2/3 riposo: 24 ore e assistenza
    pg.click('[data-az="riposo"]'); f = fin()
    t(f'{W} AC3-2 riposo totale e assistenza', f.locator('[name="dur"][value="24"]').count() == 1 and f.locator('[name="asOn"]').count() == 1)
    largo('finestra Riposo'); premi('Annulla')
    # --- AC4 erborista: scheda, contatore, raccolta, mistura
    card('Aria').locator('[data-az="modificaPG"]').click(); f = fin(); f.locator('[name="erborista"]').check(); f.locator('[name="erborista_gradi"]').fill('5'); premi('Salva')
    pg.locator('#p-compagnia [data-az-cambio="contatore"][data-k="erbe"]').check()
    pg.click('[data-az="salto"]'); fin().locator('[name="n"]').fill('8'); premi('Avanza')
    raccolta = False
    for _ in range(40):
        if pg.locator('.coda [data-az="raccolta"]').count(): raccolta = True; break
        b = pg.locator('.coda [data-az="codaTutti"], .coda [data-az="codaFatto"], .coda [data-az="codaFattoId"], .coda [data-az="esito"][data-e="1"], .coda [data-az="razionamento"]')
        if not b.count(): break
        if b.first.get_attribute('data-az') == 'razionamento': b.first.click(); premi(fin().locator('footer .btn.prim').inner_text())
        else: b.first.click()
    t(f'{W} AC4-3 la coda propone la raccolta', raccolta)
    if raccolta: pg.locator('.coda [data-az="raccolta"]').first.click()
    coda_via()
    for _ in range(2): pg.click('#p-compagnia [data-az="contatore"][data-k="erbe"][data-d="1"]')
    pg.click('#p-compagnia [data-az="mistura"]'); f = fin()
    t(f'{W} AC4-1 28 misture', f.locator('[name="m"] option').count() == 28, f.locator('[name="m"] option').count())
    f.locator('[name="t"]').fill('30'); premi('Prepara')
    t(f'{W} AC4-4 mistura applicata', 'mistura' in log().lower() or 'Unguento' in log())
    terza('viaggio')
    # --- AC6 aree e AC5 marcia
    pg.click('[data-az="impostazioni"]'); fin().locator('[name="incontri_casuali"]').check(); premi('Aree degli incontri casuali…')
    t(f'{W} AC6-2 le 6 aree della Guida', fin().locator('[data-ar="mod"]').count() == 6)
    fin().locator('[data-ar="mod"]').nth(3).click(); f = fin(); f.locator('[data-agg-riga]').click()
    r = f.locator('.riga-ar').first; r.locator('[data-k="dadi"]').fill('1d4'); r.locator('[data-k="nome"]').fill('Lupo')
    t(f'{W} AC6-3 riga 01-100 senza buchi', f.locator('#ar-msg').inner_text().strip() == '', f.locator('#ar-msg').inner_text())
    largo('finestra Area'); premi('Salva'); premi('Chiudi'); premi('Salva')
    pg.click('#p-marcia [data-az="marcia"]'); f = fin()
    f.locator('[name="tr"]').select_option('foresta'); f.locator('[name="fs"]').check(); f.locator('[name="ore"]').fill('4')
    if f.locator('[name="ar"]').count(): f.locator('[name="ar"]').select_option(index=4)
    largo('finestra Marcia'); premi('Parti')
    visti = set()
    for _ in range(12):
        p_ = pg.locator('#p-marcia')
        if p_.locator('#m-or').count(): visti.add('or'); p_.locator('#m-or').fill('20'); p_.locator('[data-r="orientarsi"]').click(); continue
        if p_.locator('[data-r="avvia"]').count(): visti.add('inc'); p_.locator('[data-r="ignora"]').click(); continue
        if p_.locator('[data-r="riprendi"]').count(): p_.locator('[data-r="termina"]').click(); continue
        if p_.locator('[data-r="forzata"]').count(): p_.locator('[data-r="termina"]').click(); continue
        break
    t(f'{W} AC5-7 Orientarsi chiesto fuori strada', 'or' in visti)
    t(f'{W} AC5-5 marcia finita nel log', 'Marcia finita' in log() or 'Marcia interrotta' in log())
    terza('viaggio')
    t(f'{W} AC5-5 ultima marcia nel pannello', 'Ultima marcia' in pg.inner_text('#p-marcia'))
    largo('pannello Marcia')
    pg.click('#p-marcia [data-az="tiraIncontro"]'); fin().locator('[name="ar"]').select_option(index=4); premi('Tira')
    t(f'{W} AC6-5 Tira incontro nel log', 'Incontri casuali (' in log())
    terza('viaggio')
    # --- AC7 pericoli
    terza('prontuario'); pg.click('[data-az="prontSez"][data-s="pericoli"]')
    v = pg.locator('#p-prontuario details[data-voce]', has=pg.locator('[data-az="cadere"]')); v.locator('summary').click(); v.locator('[data-az="cadere"]').click()
    f = fin(); f.locator('[name="m"]').fill('6'); f.locator('[data-cd="tira"]').click()
    t(f'{W} AC7-3 Cadere: 6 m = 4d6 (Guida)', '4d6' in f.locator('#cd-ris').inner_text(), f.locator('#cd-ris').inner_text())
    f.locator('[name="chi"]').select_option(label='Bruno'); premi('Applica')
    if pg.locator('.velo').count(): premi('Annulla') if fin().locator('footer button', has_text=re.compile('^Annulla$')).count() else premi('Chiudi')
    t(f'{W} AC7-3 Bruno Prono dopo la caduta', card('Bruno').locator('.chip', has_text='Prono').count() >= 1)
    v = pg.locator('#p-prontuario details[data-voce]', has=pg.locator('[data-az="apnea"]')); v.locator('summary').click(); v.locator('[data-az="apnea"]').click()
    f = fin(); f.locator('[name="chi"]').select_option(label='Cira'); f.locator('[name="cos"]').fill('10'); premi('Applica')
    ch = card('Cira').locator('.chip', has_text='Trattenere il fiato')
    t(f'{W} AC7-4 Trattenere il fiato', ch.count() == 1)
    ch.click(); premi('−1 round'); premi('Chiudi')
    t(f'{W} AC7-4 −1 round nel log', '−1 round di fiato' in log())
    terza('prontuario')
    v = pg.locator('#p-prontuario details[data-voce]', has=pg.locator('[data-az="fumo"]')); v.locator('summary').click(); v.locator('[data-az="fumo"]').click()
    fin().locator('[name="chi"]').select_option(label='Aria'); premi('Applica')
    t(f'{W} AC7-5 Fumo su Aria', card('Aria').locator('.chip', has_text='Fumo').count() == 1)
    largo('Pericoli')
    # --- AC9 Riparare
    pg.click('[data-az="prontSez"][data-s="riparare"]'); v = pg.locator('#p-prontuario details[data-voce]').first; v.locator('summary').click(); v.locator('[data-az="riparare"]').click()
    f = fin(); f.locator('[name="b"]').select_option('+1'); f.locator('[name="s"]').select_option('r')
    t(f'{W} AC9-3 CD e tempo', 'CD' in f.locator('#rp-cd').inner_text() and '2 ore' in f.locator('#rp-cd').inner_text(), f.locator('#rp-cd').inner_text())
    f.locator('[name="t"]').select_option('vari'); f.locator('[name="v"]').fill('2000')
    t(f'{W} AC9-2 2.000 mo = 13/14', 'CD 14' in f.locator('#rp-cd').inner_text(), f.locator('#rp-cd').inner_text())
    f.locator('[name="tot"]').fill('20'); f.locator('[name="n"]').fill('Collana'); premi('Registra la prova')
    t(f'{W} AC9-3 riparato nel log', 'Collana (rotto' in log())
    # --- AC10 Locanda
    terza('viaggio'); pg.click('#p-marcia [data-az="locandaF"]'); f = fin()
    f.locator('[data-loc]').first.check()
    t(f'{W} AC10-2 totale', 'Totale' in f.locator('#loc-tot').inner_text())
    f.locator('fieldset', has_text='Aria').locator('label', has_text='Pasto eccellente').locator('input').check()
    f.locator('fieldset', has_text='Aria').locator('label', has_text='Dormitorio').locator('input').check()
    largo('finestra Locanda'); premi('Paga e riposa nella locanda')
    t(f'{W} AC10-3 il Riposo con la stanza', pg.locator('.velo').count() == 1 and 'Dormitorio' in fin().inner_text()); premi('Annulla')
    t(f'{W} AC10-4 Pasto eccellente su Aria', card('Aria').locator('.chip', has_text='Pasto eccellente').count() == 1)
    largo('Viaggio 3b')
    # --- campagna salvata con la Build 3a
    pg.click('[data-az="campagne"]'); pg.click('[data-az="importa"]'); fin().locator('[name="t"]').fill(open(BUILD3A, encoding='utf8').read()); premi('Importa'); pg.wait_for_timeout(400)
    pg.locator('.camp', has_text='Build 3a').first.locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg'); terza('viaggio')
    t(f'{W} Build 3a: marcia e contatori spenti', pg.locator('#p-marcia').count() == 1 and pg.locator('#p-compagnia [data-az-cambio="contatore"]:checked').count() == 0)
    largo('Build 3a')
    t(f'{W} nessun errore in console', not errori, errori[:3])
    ctx.close()

BUILD3B = os.path.join(R, 'prove', 'campagna_build3b.json')
def prova4(browser, larghezza):
    ctx = browser.new_context(viewport={'width': larghezza, 'height': 900 if larghezza > 500 else 820})
    ctx.add_init_script("try { localStorage.setItem('schermo-tv-usa-riquadro', '1'); } catch (e) {}")
    pg = ctx.new_page(); errori = []
    pg.on('console', lambda m: m.type == 'error' and errori.append(m.text))
    pg.on('pageerror', lambda e: errori.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
    W = f'[{larghezza} 4]'
    def fin(): return pg.locator('.velo').last
    def premi(testo): fin().locator('footer button', has_text=re.compile('^' + testo + '$')).click()
    def largo(nome):
        sw = pg.evaluate('document.documentElement.scrollWidth'); t(f'{W} niente scorrimento orizzontale: {nome}', sw <= larghezza, sw)
    riq = pg.locator('#tv-riquadro')
    def tv_vis(): return riq.count() == 1 and riq.is_visible()
    def tv(): return riq.inner_text() if tv_vis() else ''
    def imposta(**v):
        pg.click('[data-az="impostazioni"]'); f = fin()
        for k, x in v.items():
            el = f.locator(f'[name="{k}"]')
            if isinstance(x, bool): el.set_checked(x)
            else: el.select_option(x)
        premi('Salva')
    pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300)
    pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    t(f'{W} AD3 pulsante TV nella testata', pg.locator('#btn-tv').count() == 1)
    t(f'{W} AD1 fuori combattimento con «Solo durante…» acceso: chiusa', not tv_vis())
    # impostazioni TV
    pg.click('[data-az="impostazioni"]'); f = fin()
    t(f'{W} AD4 Timer sulla TV grigio senza Timer reale', f.locator('[name="timer_tv"]').is_disabled() == (not f.locator('[name="timer"]').is_checked()))
    f.locator('[name="timer"]').set_checked(True); t(f'{W} AD4 col Timer reale si attiva', f.locator('[name="timer_tv"]').is_enabled())
    t(f'{W} AD7 riga della versione (win-1.0.N nell\'app Windows, «di prova» nella pagina web)', f.locator('#versione-app').count() == 1)
    largo('impostazioni TV'); premi('Annulla')
    # F9 fuori dal combattimento
    pg.keyboard.press('F9'); pg.wait_for_timeout(150)
    t(f'{W} AD3 F9 la mostra: «Nessun combattimento»', tv_vis() and 'Nessun combattimento' in tv(), tv())
    bb = riq.bounding_box(); t(f'{W} AD5 riquadro dentro lo schermo', bb and bb['x'] >= 0 and bb['x'] + bb['width'] <= larghezza + 1, bb)
    pg.keyboard.press('F9'); pg.wait_for_timeout(150); t(f'{W} AD3 F9 la nasconde', not tv_vis())
    # avvio con nome TV e nascosto
    for i in range(pg.locator('.pgini input[type="number"]').count()): pg.locator('.pgini input[type="number"]').nth(i).fill(str(25 - i))
    pg.locator('[data-bind="nemici.0.nome"]').fill('Lupo'); pg.locator('[data-bind="nemici.0.n"]').fill('3'); pg.locator('[data-bind="nemici.0.nomeTv"]').fill('Bestie')
    pg.click('[data-az="aggNemico"]'); pg.locator('[data-bind="nemici.1.nome"]').fill('Ombra'); pg.locator('[data-bind="nemici.1.nascosto"]').check()
    pg.click('[data-az="aggNemico"]'); pg.locator('[data-bind="nemici.2.nome"]').fill('Bandito'); pg.locator('[data-bind="nemici.2.n"]').fill('2'); pg.locator('[data-bind="nemici.2.modo"]').select_option('singolo'); pg.locator('[data-bind="nemici.2.nomeTv"]').fill('Figura incappucciata')
    largo('avvio con il nome TV')
    pg.click('[data-az="avvia"]'); pg.wait_for_timeout(200)
    x = tv()
    t(f'{W} AD1 all\'avvio la TV si apre da sola', tv_vis() and 'Round 1' in x and 'ora agisce' in x.lower(), x[:120])
    t(f'{W} AD2 nome per i giocatori e numerati', 'Bestie ×3' in x and 'Figura incappucciata 1' in x and 'Figura incappucciata 2' in x, x)
    t(f'{W} AD1 né nomi veri né nascoste né PF', not re.search(r'Lupo|Bandito|Ombra|Fatica|Ferita|PF', x), x)
    t(f'{W} AD2 «(TV: …)» nell\'iniziativa', pg.locator('.ordine', has_text='(TV: Bestie)').count() == 1)
    # Nome TV… a combattimento iniziato
    pg.locator('.ordine li', has_text='Lupo ×3').click(); pg.click('.azioni-riga [data-az="nomeTv"]'); fin().locator('[name="n"]').fill('Ombre nel bosco'); premi('Salva'); pg.wait_for_timeout(150)
    t(f'{W} AD2 Nome TV… cambia la TV', 'Ombre nel bosco ×3' in tv() and 'Bestie' not in tv())
    # rinforzi nascosti con il nome, poi Rivela
    pg.click('[data-az="rinforzi"]'); f = fin(); f.locator('[name="n"]').fill('Orco'); f.locator('[name="q"]').fill('2'); f.locator('[name="tv"]').fill('Sagome'); f.locator('[name="nasc"]').check()
    largo('rinforzi con il nome TV'); premi('Tira ed entra'); pg.wait_for_timeout(150)
    t(f'{W} AD2 rinforzi nascosti: non sulla TV', 'Sagome' not in tv() and 'Orco' not in tv() and pg.locator('.ordine li', has_text='Orco ×2').count() == 1)
    pg.locator('.ordine li', has_text='Orco ×2').click(); pg.click('.azioni-riga [data-az="cmd"][data-c="nascondi"]'); pg.wait_for_timeout(150)
    t(f'{W} AD2 Rivela: «Sagome ×2» sulla TV', 'Sagome ×2' in tv())
    # timer sulla TV
    imposta(timer=True, timer_tv=True); pg.wait_for_timeout(1200)
    tipo = pg.evaluate("M.statoTV(S.camp, MET, Date.now()).agisce.tipo")
    t(f'{W} AD4 timer solo nei turni dei PG e degli alleati', (riq.locator('.tv-timer').count() == 1) == (tipo != 'nemico'), tipo)
    # F10: spento non fa nulla, acceso = Avanti
    prima = pg.evaluate("[S.camp.combattimento.round, S.camp.combattimento.turno]")
    pg.keyboard.press('F10'); pg.wait_for_timeout(100)
    t(f'{W} AD3 F10 spento: niente', pg.evaluate("[S.camp.combattimento.round, S.camp.combattimento.turno]") == prima)
    imposta(f10=True); pg.keyboard.press('F10'); pg.wait_for_timeout(150)
    t(f'{W} AD3 F10 acceso = Avanti', pg.evaluate("[S.camp.combattimento.round, S.camp.combattimento.turno]") != prima)
    # menu TV: stato, Sposta grigio, Blocca, Ripristina
    pg.click('#btn-tv'); f = fin()
    t(f'{W} AD3 menu: stato e Sposta grigio nella versione web', 'TV visibile' in f.inner_text() and f.locator('[data-tv="sposta"]').is_disabled() and f.locator('[name="riq"]').is_checked())
    largo('menu TV')
    f.locator('[name="blocca"]').check(); t(f'{W} AD3 Blocca posizione', 'bloccata' in (riq.get_attribute('class') or ''))
    premi('Chiudi')
    bb0 = riq.bounding_box(); b = pg.locator('.tv-riq-barra').bounding_box()
    pg.mouse.move(b['x'] + 30, b['y'] + 8); pg.mouse.down(); pg.mouse.move(b['x'] + 10, b['y'] + 60); pg.mouse.up()
    t(f'{W} AD3 bloccata: non si trascina', riq.bounding_box()['y'] == bb0['y'])
    pg.click('#btn-tv'); fin().locator('[name="blocca"]').uncheck(); premi('Chiudi')
    pg.mouse.move(b['x'] + 30, b['y'] + 8); pg.mouse.down(); pg.mouse.move(b['x'] + 10, b['y'] + 60, steps=4); pg.mouse.up()
    spostata = riq.bounding_box()['y']
    t(f'{W} AD5 si trascina e la posizione si salva', spostata != bb0['y'] and pg.evaluate("JSON.parse(localStorage.getItem('schermo-tv-riquadro')).pos !== null"))
    pg.click('#btn-tv'); fin().locator('[data-tv="ripristina"]').click(); pg.wait_for_timeout(100)
    t(f'{W} AD3 Ripristina: posizione predefinita', abs(riq.bounding_box()['y'] - bb0['y']) < 2 if larghezza > 600 else riq.bounding_box()['y'] != spostata, [riq.bounding_box()['y'], bb0['y']])
    largo('combattimento con la TV')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'tv_{larghezza}.png'), full_page=False)
    # AD9 meteo sulla TV dal pannello Meteo
    pg.click('[data-az="scheda"][data-s="viaggio"]')
    pg.click('#btn-meteo-tv'); pg.wait_for_timeout(200)
    x = tv(); m_ora = pg.evaluate("(m => (m.ora.length ? m.ora : m.voci).join(' + '))(M.meteoCorrente(S.camp, MET))")
    t(f'{W} AD9 «Sulla TV»: carta del meteo con il tempo di adesso', 'meteo' in x.lower() and m_ora.lower() in x.lower() and pg.locator('#tv-riquadro .tv-cm-ef').count() >= 1, [m_ora, x[:200]])
    t(f'{W} AD9 in combattimento resta l\'iniziativa', 'ora agisce' in x.lower() and pg.locator('#tv-riquadro .tv-resto').count() == 0)
    t(f'{W} AD8 cornice e ornamenti', pg.locator('#tv-riquadro .tv-ang').count() == 4 and pg.locator('#tv-riquadro .tv-carta').count() == 2)
    t(f'{W} AD9 il pulsante diventa «Togli dalla TV»', pg.inner_text('#btn-meteo-tv') == 'Togli dalla TV')
    if SHOT: pg.screenshot(path=os.path.join(SHOT, f'tv_meteo_{larghezza}.png'), full_page=False)
    pg.click('#btn-meteo-tv'); pg.wait_for_timeout(200)
    t(f'{W} AD9 «Togli dalla TV»: torna il resto dell\'ordine', pg.locator('#tv-riquadro .tv-cm').count() == 0 and pg.locator('#tv-riquadro .tv-resto').count() == 1)
    # fine del combattimento: la TV si chiude
    pg.click('[data-az="fineComb"]'); premi('Chiudi il combattimento'); premi('Chiudi'); pg.wait_for_timeout(150)
    t(f'{W} AD1 a fine combattimento si chiude', not tv_vis())
    imposta(tv_solo_combattimento=False, tv_ora=True, tv_meteo=True); pg.wait_for_timeout(150)
    x = tv(); t(f'{W} AD1 «Solo durante…» spento: data e ora e meteo', tv_vis() and pg.evaluate("M.formatoData(S.camp)") in x, x)
    imposta(tv_ora=False, tv_meteo=False); pg.wait_for_timeout(150)
    t(f'{W} AD1 niente da mostrare: si nasconde da sola', not tv_vis())
    pg.click('[data-az="impostazioni"]'); fin().locator('[name="tv_solo_combattimento"]').set_checked(True); premi('Salva')
    pg.click('[data-az="scheda"][data-s="viaggio"]'); pg.click('#btn-meteo-tv'); pg.wait_for_timeout(200)
    t(f'{W} AD9 fuori combattimento il pulsante apre la TV con il meteo', tv_vis() and pg.locator('#tv-riquadro .tv-cm').count() == 1)
    pg.click('#btn-tv'); fin().locator('[name="meteo"]').uncheck(); pg.wait_for_timeout(150); premi('Chiudi')
    t(f'{W} AD9 dal menu TV si toglie (e la TV resta come l\'ha messa il GM)', pg.locator('#tv-riquadro .tv-cm').count() == 0)
    # campagna salvata con la Build 3b
    pg.click('[data-az="campagne"]'); pg.wait_for_selector('text=Crea Schermo campagna'); pg.wait_for_timeout(300); t(f'{W} AD1 elenco delle campagne: TV chiusa', not tv_vis())
    pg.click('[data-az="importa"]'); fin().locator('[name="t"]').fill(open(BUILD3B, encoding='utf8').read()); premi('Importa'); pg.wait_for_timeout(400)
    pg.locator('.camp', has_text='Build 3b').first.locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
    pg.click('[data-az="scheda"][data-s="viaggio"]')
    t(f'{W} Build 3b: si apre con la marcia ferma su Orientarsi', 'Orientarsi' in pg.inner_text('#col-terza') and pg.locator('.pg').count() == 2)
    t(f'{W} Build 3b: medicinali ed erbe accesi', pg.locator('#p-compagnia [data-az-cambio="contatore"]:checked').count() == 2)
    largo('Build 3b')
    t(f'{W} nessun errore in console', not errori, errori[:3])
    ctx.close()

def prova4web(browser):
    """AD5: catena Picture-in-Picture → finestra del browser → riquadro, e app Android senza TV."""
    W = '[web 4]'
    for caso in ('auto', 'bloccati', 'android'):
        ctx = browser.new_context(viewport={'width': 1366, 'height': 900})
        if caso == 'bloccati': ctx.add_init_script("delete window.documentPictureInPicture; window.open = () => null;")
        if caso == 'android': ctx.add_init_script("window.Capacitor = { isNativePlatform: () => true };")
        pg = ctx.new_page(); errori = []
        pg.on('pageerror', lambda e: errori.append(str(e)))
        pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna')
        pg.click('text=Carica una campagna d\'esempio'); pg.wait_for_timeout(300)
        pg.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); pg.wait_for_selector('.pg')
        if caso == 'android':
            t(f'{W} AD5 Android: niente pulsante TV', pg.locator('#btn-tv').count() == 0)
            pg.keyboard.press('F9'); pg.wait_for_timeout(150); t(f'{W} AD5 Android: F9 non fa nulla', pg.locator('#tv-riquadro').count() == 0)
            pg.click('[data-az="impostazioni"]'); t(f'{W} AD5 Android: nota «solo nell\'app Windows»', "Solo nell'app Windows" in pg.locator('.velo').last.inner_text()); pg.locator('.velo').last.locator('footer button', has_text='Annulla').click()
        else:
            for i in range(pg.locator('.pgini input[type="number"]').count()): pg.locator('.pgini input[type="number"]').nth(i).fill(str(20 - i))
            pg.locator('[data-bind="nemici.0.nome"]').fill('Lupo'); pg.click('[data-az="avvia"]'); pg.wait_for_timeout(800)
            modo = pg.evaluate('TV.modo')
            if caso == 'bloccati':
                t(f'{W} AD5 PiP e finestra bloccati: riquadro con l\'avviso', modo == 'riquadro' and pg.locator('#tv-riquadro').is_visible() and 'nel riquadro' in pg.inner_text('#avviso'), modo)
            else:
                t(f'{W} AD5 la TV si apre in uno dei tre modi', modo in ('pip', 'popup', 'riquadro'), modo)
                if modo in ('pip', 'popup'):
                    t(f'{W} AD5 {modo}: stesso contenuto', 'Round 1' in pg.evaluate("TV.win.document.body.innerText"))
                    pg.keyboard.press('F9'); pg.wait_for_timeout(300); t(f'{W} AD3 F9 chiude la finestra {modo}', pg.evaluate('TV.modo') is None)
        t(f'{W} {caso}: nessun errore', not errori, errori[:3])
        ctx.close()

def prova4adatta(browser):
    """AD8 rivista (prova di Massy sul secondo schermo, 02/11): nome di chi agisce e carta del meteo dentro la cornice a ogni dimensione."""
    ctx = browser.new_context(viewport={'width': 1920, 'height': 1100}); pg = ctx.new_page()
    pg.goto(URL); pg.wait_for_selector('text=Crea Schermo campagna'); pg.evaluate("document.fonts.ready")
    DIM = [(240, 135), (320, 180), (480, 270), (640, 360), (960, 540), (1920, 1080), (900, 260), (1600, 400), (360, 640), (500, 500)]
    NOMI = ['Aria', 'Mortimer von Crist, «L\'Imbalsamatore»', 'Figura incappucciata con la lanterna 12', 'Lupo crudele ×5']
    cattivi = 0
    for meteo in (False, True):
        for nome in NOMI:
            for w, h in DIM:
                st = {'campagna': 'X', 'combattimento': True, 'round': 3, 'data': 'mercoledì 28 ottobre 1462 dopo la Caduta, 17:30', 'meteo': 'Pioggia battente + Vento molto forte', 'vuota': False,
                      'agisce': {'nome': nome, 'tipo': 'nemico', 'fuori': False, 'livello': 'agisce'},
                      'ordine': [{'nome': nome, 'tipo': 'nemico', 'fuori': False, 'livello': 'agisce'}, {'nome': 'Bartolomeo il Grande Cerusico di Valmora', 'tipo': 'pg', 'fuori': False, 'livello': 'prossimo'},
                                 {'nome': 'Cira', 'tipo': 'pg', 'fuori': False, 'livello': 'prossimo'}, {'separatore': True, 'round': 4}, {'nome': 'Bestie ×3', 'tipo': 'nemico', 'fuori': False, 'livello': 'resto'}],
                      'attesa': [], 'timer': {'testo': '1:23', 'oltre': False, 'pausa': False},
                      'cartaMeteo': {'titolo': 'Pioggia battente + Vento molto forte', 'effetti': [{'nome': 'Pioggia battente', 'testo': 'Penalità −2 alle prove di Percezione. Fiamme: vedi la tabella. Seguire tracce: +1 alla CD per ogni ora di pioggia. Chi resta all\'aperto si bagna. Chi ha recipienti raccoglie la razione d\'acqua del giorno.'},
                                     {'nome': 'Vento molto forte', 'testo': 'Penalità −4 ai tiri per colpire a distanza e −4 alle prove di Percezione basate sull\'udito. Le creature Minuscole o più piccole sono spazzate via; le Piccole sono atterrate. Fiamme: vedi la tabella. Volare: prova di Volare CD 20.'}], 'mare': None} if meteo else None}
                r = pg.evaluate("""([st, w, h]) => { let d = document.getElementById('prova-tv'); if (!d) { d = document.createElement('div'); d.id = 'prova-tv'; d.style.cssText = 'position:fixed;left:0;top:0;z-index:99'; document.body.appendChild(d); }
                  d.style.width = w + 'px'; d.style.height = h + 'px'; d.innerHTML = htmlTV(st); adattaTV(d);
                  const c = d.querySelector('.tv-c'), cr = c.getBoundingClientRect(), out = [];
                  const nome = d.querySelector('.tv-agisce .tv-riga') || d.querySelector('.tv-agisce > span');
                  const nr = nome.getBoundingClientRect(), fs = parseFloat(getComputedStyle(nome).fontSize);
                  if (nome.scrollWidth > nome.clientWidth + 1 || nr.right > cr.right + 1) out.push('nome fuori in larghezza');
                  if (nr.height > fs * 1.6 && (nome.style.whiteSpace !== 'normal' || parseFloat(nome.style.fontSize) > fs + 0.5)) out.push('nome su più righe');
                  if (nome.style.whiteSpace === 'normal' && w >= 480 && w > h * 1.2) out.push('a capo in una finestra larga');
                  for (const x of d.querySelectorAll('.tv-pross .tv-riga')) if (x.scrollWidth > x.clientWidth + 1) out.push('prossimo fuori');
                  for (const k of d.querySelectorAll('.tv-carta')) { const kr = k.getBoundingClientRect(); for (const e of k.children) { const er = e.getBoundingClientRect(); if (er.bottom > kr.bottom + 1 || er.right > kr.right + 1) { out.push('testo fuori dal riquadro ' + (k.classList.contains('tv-cm') ? 'meteo' : 'agisce')); break; } }
                    if (kr.bottom > cr.bottom + 1) out.push('riquadro fuori dalla cornice'); }
                  return out; }""", [st, w, h])
                if r: cattivi += 1; print('ERRORE adatta', f"{'meteo ' if meteo else ''}{w}×{h} «{nome[:20]}»: {', '.join(sorted(set(r)))}")
    t('[adatta] AD8 nome e meteo dentro la cornice a 10 dimensioni × 4 nomi × con e senza meteo', cattivi == 0, cattivi)
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (1366, 390):
        for f in (prova, prova2a, prova2b, prova2c, prova3a, prova3b, prova4):
            try: f(b, w)
            except Exception as e: ko += 1; print('ERRORE', w, f.__name__, 'interrotta:', ' | '.join(str(e).split('\n')[:3])[:400])
    try: prova4web(b); prova4adatta(b)
    except Exception as e: ko += 1; print('ERRORE prova4web interrotta:', ' | '.join(str(e).split('\n')[:3])[:400])
    b.close()
srv.shutdown()
print(f'prova della pagina: {ok} superati, {ko} falliti')
sys.exit(1 if ko else 0)
