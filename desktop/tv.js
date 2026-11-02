// Finestra TV (Electron): il contenuto arriva già impaginato dalla pagina principale (stessa funzione del riquadro e del Picture-in-Picture).
const corpo = document.getElementById('tv-corpo'), css = document.getElementById('css');
let ultimo = '', ultimoCss = '';
window.schermoTV.suContenuto(x => {
  if (x.css !== ultimoCss) { css.textContent = x.css; ultimoCss = x.css; }
  if (x.html !== ultimo) { corpo.innerHTML = x.html; ultimo = x.html; }
});
window.schermoTV.suBlocco(b => document.body.classList.toggle('bloccata', !!b));
