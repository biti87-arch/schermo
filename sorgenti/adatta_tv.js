// Adatta il testo della TV alla finestra (stesso codice nella pagina, nel riquadro, nel Picture-in-Picture e nella finestra TV di Windows).
// 1) altezza: tutto si rimpicciolisce insieme (--k) fino al 45%; se non basta cedono, in ordine, il piede, il resto dell'ordine e chi è in attesa, i prossimi;
// 2) larghezza: le righe che non vanno a capo (nome di chi agisce, prossimi) si rimpiccioliscono da sole fino al 30%; solo se non basta vanno a capo.
function adattaTV(radice) {
  const tv = radice && radice.querySelector('.tv'), c = tv && tv.querySelector('.tv-c'); if (!c) return;
  const cedono = [...c.querySelectorAll('[data-cede]')].sort((a, b) => a.dataset.cede - b.dataset.cede);
  for (const x of cedono) x.style.display = '';
  for (const el of c.querySelectorAll('.tv-riga')) { el.style.fontSize = ''; el.style.whiteSpace = ''; el.style.overflowWrap = ''; }
  const trabocca = () => c.scrollHeight > c.clientHeight + 1;
  const prova = () => { let k = 1; tv.style.setProperty('--k', k); while (trabocca() && k > 0.45) { k = Math.round((k - 0.05) * 100) / 100; tv.style.setProperty('--k', k); } return !trabocca(); };
  let ok = prova();
  for (const x of cedono) { if (ok) break; x.style.display = 'none'; ok = prova(); }
  for (const el of c.querySelectorAll('.tv-riga')) {
    const base = parseFloat(getComputedStyle(el).fontSize); let s = 1;
    while (el.scrollWidth > el.clientWidth + 1 && s > 0.3) { s = Math.round((s - 0.05) * 100) / 100; el.style.fontSize = (base * s) + 'px'; }
    if (el.scrollWidth > el.clientWidth + 1) { el.style.whiteSpace = 'normal'; el.style.overflowWrap = 'anywhere'; } // finestra troppo stretta: meglio a capo che tagliato
  }
  if (trabocca()) prova();
}
if (typeof module !== 'undefined') module.exports = { adattaTV };
