"""Prova di fumo dell'app Windows (Electron) sotto Xvfb: finestra TV, stato via IPC, comandi, tv.json, versione.
Uso: avviare electron con --remote-debugging-port=9333 e XDG_CONFIG_HOME, poi python3 prova_electron.py <XDG_CONFIG_HOME>"""
import sys, json, os, time
from playwright.sync_api import sync_playwright
CFG = sys.argv[1]; ok = ko = 0
def t(n, c, info=''):
    global ok, ko
    if c: ok += 1
    else: ko += 1; print('ERRORE', n, info)
with sync_playwright() as p:
    b = p.chromium.connect_over_cdp('http://127.0.0.1:9333')
    pages = [pg for c in b.contexts for pg in c.pages]
    main = next(x for x in pages if x.url.endswith('index.html')); tv = next(x for x in pages if x.url.endswith('tv.html'))
    err = []; main.on('pageerror', lambda e: err.append(str(e))); tv.on('pageerror', lambda e: err.append(str(e)))
    info = lambda: main.evaluate('window.schermoDesktop.tv.info()')
    t('versione dell\'app', main.evaluate('window.schermoDesktop.versione') == '1.0.0')
    i = info(); t('F9 registrato, TV nascosta all\'avvio, uno schermo', i['f9'] and not i['visibile'] and i['schermi'] == 1, i)
    main.click('text=Carica una campagna d\'esempio'); main.wait_for_timeout(400)
    main.locator('.camp', has_text='esempio').locator('[data-az="apri"]').click(); main.wait_for_selector('.pg')
    for k in range(main.locator('.pgini input[type="number"]').count()): main.locator('.pgini input[type="number"]').nth(k).fill(str(20 - k))
    main.locator('[data-bind="nemici.0.nome"]').fill('Lupo'); main.locator('[data-bind="nemici.0.n"]').fill('2'); main.locator('[data-bind="nemici.0.nomeTv"]').fill('Bestie')
    main.click('[data-az="avvia"]'); main.wait_for_timeout(800)
    i = info(); x = tv.inner_text('#tv-corpo')
    t('all\'avvio del combattimento la finestra TV si mostra', i['visibile'], i)
    t('contenuto via IPC: round, nome TV, niente nome vero', 'Round 1' in x and 'Bestie ×2' in x and 'Lupo' not in x, x)
    t('la pagina principale non ha il riquadro', main.locator('#tv-riquadro').count() == 0)
    main.evaluate('mostraNascondiTV()'); main.wait_for_timeout(400); t('Nascondi (come F9)', not info()['visibile'])
    main.evaluate('mostraNascondiTV()'); main.wait_for_timeout(400); t('Mostra (come F9)', info()['visibile'])
    r = main.evaluate("window.schermoDesktop.tv.comando('sposta')"); t('Sposta con un solo schermo: avviso', r.get('errore') == 'Un solo schermo collegato', r)
    main.evaluate("window.schermoDesktop.tv.comando('blocca')"); main.wait_for_timeout(800)
    t('Blocca: classe nella TV', 'bloccata' in (tv.evaluate('document.body.className') or ''))
    tj = json.load(open(os.path.join(CFG, 'Schermo del Narratore', 'tv.json'))); t('tv.json con il blocco', tj['bloccata'] is True, tj)
    main.evaluate("window.schermoDesktop.tv.comando('ripristina')"); main.wait_for_timeout(800)
    tj = json.load(open(os.path.join(CFG, 'Schermo del Narratore', 'tv.json')))
    t('Ripristina: 640 × 360 in alto a destra, sbloccata', tj['bloccata'] is False and tj['bounds']['width'] == 640 and tj['bounds']['height'] == 360 and tj['bounds']['y'] >= 0, tj)
    t('Ripristina: blocco tolto nella TV', 'bloccata' not in (tv.evaluate('document.body.className') or ''))
    main.click('[data-az="menuTV"]'); f = main.locator('.velo').last
    t('menu TV dell\'app: Sposta grigio con uno schermo, niente «Usa il riquadro»', f.locator('[data-tv="sposta"]').is_disabled() and f.locator('[name="riq"]').count() == 0 and 'Un solo schermo' in f.inner_text())
    f.locator('footer button').last.click()
    # F10 acceso: il processo principale lo registra; Avanti via il ponte
    main.click('[data-az="impostazioni"]'); main.locator('.velo').last.locator('[name="f10"]').check(); main.locator('.velo').last.locator('footer button', has_text='Salva').click()
    main.click('[data-az="impostazioni"]'); t('versione nelle Impostazioni', 'Versione win-1.0.0' in main.locator('.velo').last.inner_text()); main.locator('.velo').last.locator('footer button', has_text='Annulla').click()
    main.click('[data-az="fineComb"]'); main.locator('.velo').last.locator('footer button', has_text='Chiudi il combattimento').click(); main.wait_for_timeout(600)
    t('a fine combattimento si nasconde', not info()['visibile'])
    t('nessun errore nelle pagine', not err, err[:3])
print(f'prova Electron: {ok} superati, {ko} falliti')
