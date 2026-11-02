// Ponte della finestra TV: riceve solo il contenuto da mostrare e lo stato del blocco.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('schermoTV', {
  suContenuto: f => ipcRenderer.on('tv:contenuto', (e, x) => f(x)),
  suBlocco: f => ipcRenderer.on('tv:blocco', (e, b) => f(b)),
});
