const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { crea } = require('./archivio');
let archivio = null;
function finestra() {
  const w = new BrowserWindow({
    width: 1440, height: 900, minWidth: 380, minHeight: 500,
    title: 'Schermo del Narratore', icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true, backgroundColor: '#15120E',
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') }
  });
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  w.loadFile(path.join(__dirname, 'www', 'index.html'));
}
app.whenReady().then(() => {
  archivio = crea(path.join(app.getPath('userData'), 'dati'));
  ipcMain.handle('archivio:lista', () => archivio.lista());
  ipcMain.handle('archivio:leggi', (e, id) => archivio.leggi(id));
  ipcMain.handle('archivio:scrivi', (e, c) => archivio.scrivi(c));
  ipcMain.handle('archivio:elimina', (e, id) => archivio.elimina(id));
  ipcMain.on('archivio:scriviSubito', (e, c) => { try { e.returnValue = archivio.scrivi(c); } catch (err) { e.returnValue = false; } });
  finestra();
});
app.on('window-all-closed', () => app.quit());
