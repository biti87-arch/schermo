// Finestra TV (Electron): il contenuto arriva già impaginato dalla pagina principale (stessa funzione del riquadro e del Picture-in-Picture).
const corpo = document.getElementById('tv-corpo'), css = document.getElementById('css');
let ultimo = '', ultimoCss = '';
window.schermoTV.suContenuto(x => {
  if (x.css !== ultimoCss) { css.textContent = x.css; ultimoCss = x.css; }
  if (x.html !== ultimo) { corpo.innerHTML = x.html; ultimo = x.html; adatta(); }
});
// adattamento del testo: www/adatta_tv.js (lo stesso codice della pagina, scritto da build.py)
function adatta() { adattaTV(document.body); }
window.addEventListener('resize', adatta);
window.schermoTV.suBlocco(b => document.body.classList.toggle('bloccata', !!b));
// AD10: orientamento (0, 90, 180, 270); il giro lo fa CSS_TV con [data-rot]
window.schermoTV.suRotazione(r => { corpo.dataset.rot = String(r || 0); adatta(); });
if (document.fonts) document.fonts.ready.then(adatta); // i caratteri arrivano dopo il primo disegno
