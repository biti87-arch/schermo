// Ponte fra la pagina e il processo principale: salvataggi (campagne e bestiario), finestra TV, tasti globali F9/F10 e versione dell'app.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('schermoDesktop', {
  lista: () => ipcRenderer.invoke('archivio:lista'),
  leggi: id => ipcRenderer.invoke('archivio:leggi', id),
  scrivi: c => ipcRenderer.invoke('archivio:scrivi', c),
  elimina: id => ipcRenderer.invoke('archivio:elimina', id),
  scriviSubito: c => ipcRenderer.sendSync('archivio:scriviSubito', c),
  leggiBestiario: () => ipcRenderer.invoke('bestiario:leggi'),
  scriviBestiario: b => ipcRenderer.invoke('bestiario:scrivi', b),
  scriviBestiarioSubito: b => ipcRenderer.sendSync('bestiario:scriviSubito', b),
  versione: ipcRenderer.sendSync('app:versione'),
  tv: {
    stato: s => ipcRenderer.send('tv:stato', s),
    info: () => ipcRenderer.invoke('tv:info'),
    comando: c => ipcRenderer.invoke('tv:comando', c),
    suTasto: f => ipcRenderer.on('tv:tasto', (e, k) => f(k)),
    suAvviso: f => ipcRenderer.on('tv:avviso', (e, t) => f(t)),
  },
});
