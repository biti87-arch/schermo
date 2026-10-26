// Ponte fra la pagina e il processo principale: solo i salvataggi (la finestra TV e i tasti globali arrivano con la Build 4).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('schermoDesktop', {
  lista: () => ipcRenderer.invoke('archivio:lista'),
  leggi: id => ipcRenderer.invoke('archivio:leggi', id),
  scrivi: c => ipcRenderer.invoke('archivio:scrivi', c),
  elimina: id => ipcRenderer.invoke('archivio:elimina', id),
  scriviSubito: c => ipcRenderer.sendSync('archivio:scriviSubito', c),
});
