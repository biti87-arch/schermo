// Ponte della finestra TV: riceve solo il contenuto da mostrare, lo stato del blocco e l'orientamento (AD10).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('schermoTV', {
  suContenuto: f => ipcRenderer.on('tv:contenuto', (e, x) => f(x)),
  suBlocco: f => ipcRenderer.on('tv:blocco', (e, b) => f(b)),
  suRotazione: f => ipcRenderer.on('tv:rotazione', (e, r) => f(r)),
});
