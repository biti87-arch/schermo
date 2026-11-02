// Posizione della finestra TV (AD3): funzioni pure, provate da sorgenti/test_archivio.js
const LARGH = 640, ALT = 360, MARGINE = 20;
// 640 × 360 nell'angolo in alto a destra dell'area di lavoro
function predefinita(wa) {
  const width = Math.min(LARGH, wa.width), height = Math.min(ALT, wa.height);
  return { x: wa.x + Math.max(0, wa.width - width - MARGINE), y: wa.y + Math.min(MARGINE, wa.height - height), width, height };
}
const dentro = (b, a) => { const cx = b.x + b.width / 2, cy = b.y + b.height / 2; return cx >= a.x && cx < a.x + a.width && cy >= a.y && cy < a.y + a.height; };
// all'avvio: la posizione salvata se il suo schermo c'è ancora, altrimenti la predefinita dello schermo principale
function iniziale(salvata, schermi, primaria) {
  if (salvata && [salvata.x, salvata.y, salvata.width, salvata.height].every(Number.isFinite)) {
    const s = schermi.find(d => dentro(salvata, d.area));
    if (s) return { x: salvata.x, y: salvata.y, width: Math.min(salvata.width, s.area.width), height: Math.min(salvata.height, s.area.height) };
  }
  return predefinita(primaria);
}
// «Sposta sulla TV»: schermo successivo, stessa dimensione (ridotta se non ci sta) e stesso angolo
function sposta(b, schermi, idAttuale) {
  if (schermi.length < 2) return null;
  let i = schermi.findIndex(d => d.id === idAttuale); if (i < 0) i = schermi.findIndex(d => dentro(b, d.area)); if (i < 0) i = 0;
  const a = schermi[i].area, j = (i + 1) % schermi.length, n = schermi[j].area;
  const width = Math.min(b.width, n.width), height = Math.min(b.height, n.height);
  const destra = (b.x + b.width / 2) > (a.x + a.width / 2), basso = (b.y + b.height / 2) > (a.y + a.height / 2);
  const mx = Math.max(0, destra ? a.x + a.width - (b.x + b.width) : b.x - a.x), my = Math.max(0, basso ? a.y + a.height - (b.y + b.height) : b.y - a.y);
  const x = destra ? n.x + n.width - width - Math.min(mx, n.width - width) : n.x + Math.min(mx, n.width - width);
  const y = basso ? n.y + n.height - height - Math.min(my, n.height - height) : n.y + Math.min(my, n.height - height);
  return { bounds: { x, y, width, height }, indice: j };
}
module.exports = { predefinita, iniziale, sposta, LARGH, ALT };
