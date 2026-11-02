const { app, BrowserWindow, shell, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { crea } = require('./archivio');
const tvPos = require('./tv_posizione');
let archivio = null, principale = null, tv = null, tvStato = { bounds: null, bloccata: false }, f9ok = true, f10su = false, tvSalvaT = null;

function finestra() {
  principale = new BrowserWindow({
    width: 1440, height: 900, minWidth: 380, minHeight: 500,
    title: 'Schermo del Narratore', icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true, backgroundColor: '#15120E',
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') }
  });
  principale.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  principale.loadFile(path.join(__dirname, 'www', 'index.html'));
  principale.webContents.on('did-finish-load', () => { if (!f9ok) principale.webContents.send('tv:avviso', 'F9 è già usato da un altro programma: usa il pulsante TV'); });
  // AD3: chiudendo la finestra principale si chiude anche la TV e l'app esce
  principale.on('closed', () => { principale = null; app.quit(); });
}

// ---------------------------------------------------------------- finestra TV (sezione L e AD3)
const fileTv = () => path.join(app.getPath('userData'), 'tv.json');
function leggiTv() { try { const x = JSON.parse(fs.readFileSync(fileTv(), 'utf8')); return { bounds: x.bounds || null, bloccata: !!x.bloccata }; } catch (e) { return { bounds: null, bloccata: false }; } }
function scriviTv() {
  clearTimeout(tvSalvaT);
  tvSalvaT = setTimeout(() => { try { const f = fileTv(), tmp = f + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(tvStato, null, 1)); fs.renameSync(tmp, f); } catch (e) { /* facoltativo */ } }, 500);
}
const schermi = () => screen.getAllDisplays().map(d => ({ id: d.id, area: d.workArea }));
function creaTv() {
  tvStato = leggiTv();
  const b = tvPos.iniziale(tvStato.bounds, schermi(), screen.getPrimaryDisplay().workArea);
  tv = new BrowserWindow({
    ...b, minWidth: 240, minHeight: 135, show: false, frame: false, skipTaskbar: true, alwaysOnTop: true,
    resizable: !tvStato.bloccata, movable: !tvStato.bloccata, minimizable: false, maximizable: false, fullscreenable: false,
    title: 'Schermo del Narratore — TV', backgroundColor: '#15120E', icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload_tv.js') }
  });
  tv.setAlwaysOnTop(true, 'screen-saver'); // sopra Foundry a schermo intero
  tv.loadFile(path.join(__dirname, 'tv.html'));
  tv.webContents.on('did-finish-load', () => tv.webContents.send('tv:blocco', tvStato.bloccata));
  const ricorda = () => { if (tv && !tv.isDestroyed()) { tvStato.bounds = tv.getBounds(); scriviTv(); } };
  tv.on('moved', ricorda); tv.on('resized', ricorda);
  tv.on('close', e => { if (principale) { e.preventDefault(); tv.hide(); } }); // niente «X»: si nasconde
}
function bloccaTv(si) {
  tvStato.bloccata = !!si; scriviTv();
  if (tv) { tv.setMovable(!si); tv.setResizable(!si); tv.webContents.send('tv:blocco', !!si); }
}
function f10(acceso) {
  if (acceso === f10su) return;
  if (acceso) {
    const ok = globalShortcut.register('F10', () => { if (principale) principale.webContents.send('tv:tasto', 'F10'); });
    if (!ok) { if (principale) principale.webContents.send('tv:avviso', 'F10 è già usato da un altro programma: usa «Avanti»'); return; }
  } else globalShortcut.unregister('F10');
  f10su = acceso;
}

app.whenReady().then(() => {
  archivio = crea(path.join(app.getPath('userData'), 'dati'));
  ipcMain.handle('archivio:lista', () => archivio.lista());
  ipcMain.handle('archivio:leggi', (e, id) => archivio.leggi(id));
  ipcMain.handle('archivio:scrivi', (e, c) => archivio.scrivi(c));
  ipcMain.handle('archivio:elimina', (e, id) => archivio.elimina(id));
  ipcMain.on('archivio:scriviSubito', (e, c) => { try { e.returnValue = archivio.scrivi(c); } catch (err) { e.returnValue = false; } });
  ipcMain.handle('bestiario:leggi', () => archivio.leggiBestiario());
  ipcMain.handle('bestiario:scrivi', (e, b) => archivio.scriviBestiario(b));
  ipcMain.on('bestiario:scriviSubito', (e, b) => { try { e.returnValue = archivio.scriviBestiario(b); } catch (err) { e.returnValue = false; } });
  ipcMain.on('app:versione', e => { e.returnValue = app.getVersion(); });
  // la TV riceve solo lo stato da mostrare (già impaginato dalla pagina, mai PF o malus)
  ipcMain.on('tv:stato', (e, s) => {
    if (!tv || tv.isDestroyed()) return;
    tv.webContents.send('tv:contenuto', { html: String(s.html || ''), css: String(s.css || '') });
    if (s.visibile && !tv.isVisible()) { tv.showInactive(); tv.setAlwaysOnTop(true, 'screen-saver'); } // Foundry tiene il fuoco
    else if (!s.visibile && tv.isVisible()) tv.hide();
    f10(!!s.f10);
  });
  ipcMain.handle('tv:info', () => ({ schermi: screen.getAllDisplays().length, bloccata: tvStato.bloccata, visibile: !!(tv && tv.isVisible()), f9: f9ok }));
  ipcMain.handle('tv:comando', (e, c) => {
    if (!tv) return { errore: 'finestra TV non disponibile' };
    if (c === 'blocca' || c === 'sblocca') { bloccaTv(c === 'blocca'); return { ok: true }; }
    if (c === 'ripristina') { const d = screen.getDisplayMatching(tv.getBounds()); tv.setBounds(tvPos.predefinita(d.workArea)); bloccaTv(false); tvStato.bounds = tv.getBounds(); scriviTv(); return { ok: true }; }
    if (c === 'sposta') {
      const r = tvPos.sposta(tv.getBounds(), schermi(), screen.getDisplayMatching(tv.getBounds()).id);
      if (!r) return { errore: 'Un solo schermo collegato' };
      const era = tvStato.bloccata; if (era) tv.setMovable(true);
      tv.setBounds(r.bounds); if (era) tv.setMovable(false);
      tvStato.bounds = tv.getBounds(); scriviTv(); return { ok: true, schermo: r.indice + 1 };
    }
    return { errore: 'comando sconosciuto' };
  });
  finestra();
  creaTv();
  f9ok = globalShortcut.register('F9', () => { if (principale) principale.webContents.send('tv:tasto', 'F9'); });
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
