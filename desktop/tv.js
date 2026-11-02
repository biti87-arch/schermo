// Finestra TV (Electron): il contenuto arriva già impaginato dalla pagina principale (stessa funzione del riquadro e del Picture-in-Picture).
const corpo = document.getElementById('tv-corpo'), css = document.getElementById('css');
let ultimo = '', ultimoCss = '';
window.schermoTV.suContenuto(x => {
  if (x.css !== ultimoCss) { css.textContent = x.css; ultimoCss = x.css; }
  if (x.html !== ultimo) { corpo.innerHTML = x.html; ultimo = x.html; adatta(); }
});
// se il testo non ci sta (carta del meteo lunga, finestra piccola) si rimpicciolisce fino al 60% (come adattaTV della pagina)
function adatta() {
  const tv = corpo.querySelector('.tv'), c = tv && tv.querySelector('.tv-c'); if (!c) return;
  let k = 1; tv.style.setProperty('--k', k);
  while (c.scrollHeight > c.clientHeight + 1 && k > 0.6) { k = Math.round((k - 0.05) * 100) / 100; tv.style.setProperty('--k', k); }
}
window.addEventListener('resize', adatta);
window.schermoTV.suBlocco(b => document.body.classList.toggle('bloccata', !!b));
