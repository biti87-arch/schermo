// Salvataggi dell'app Windows (design V3): un file JSON per campagna nella cartella dati dell'app e bestiario.json
// con i mostri condivisi fra le campagne (Build 2b); scrittura atomica (file temporaneo + rinomina),
// copia di sicurezza giornaliera (tenute le ultime 10).
'use strict';
const fs = require('fs');
const path = require('path');

function crea(cartella) {
  const dirCamp = path.join(cartella, 'campagne'), dirBackup = path.join(cartella, 'backup'), fileBest = path.join(cartella, 'bestiario.json');
  fs.mkdirSync(dirCamp, { recursive: true });
  const valido = id => typeof id === 'string' && /^[a-z0-9]{1,40}$/i.test(id);
  const file = id => { if (!valido(id)) throw new Error('identificativo non valido'); return path.join(dirCamp, id + '.json'); };
  const oggi = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function backupGiornaliero(adesso) {
    const giorno = path.join(dirBackup, oggi(adesso));
    if (fs.existsSync(giorno)) return false;
    fs.mkdirSync(giorno, { recursive: true });
    for (const f of fs.readdirSync(dirCamp)) if (f.endsWith('.json')) fs.copyFileSync(path.join(dirCamp, f), path.join(giorno, f));
    if (fs.existsSync(fileBest)) fs.copyFileSync(fileBest, path.join(giorno, 'bestiario.json'));
    const tutti = fs.readdirSync(dirBackup).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
    for (const vecchio of tutti.slice(0, Math.max(0, tutti.length - 10))) fs.rmSync(path.join(dirBackup, vecchio), { recursive: true, force: true });
    return true;
  }
  function scrivi(c, adesso) {
    if (!c || !valido(c.id) || c.formato !== 'schermo-v1') throw new Error('campagna non valida');
    backupGiornaliero(adesso);
    const f = file(c.id), tmp = f + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(c), 'utf8');
    fs.renameSync(tmp, f);
    return true;
  }
  function leggi(id) { const f = file(id); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; }
  function lista() {
    const out = [];
    for (const f of fs.readdirSync(dirCamp)) {
      if (!f.endsWith('.json')) continue;
      try { const c = JSON.parse(fs.readFileSync(path.join(dirCamp, f), 'utf8')); out.push({ id: c.id, nome: c.nome, modificata: c.modificata, R: c.tempo.R, pg: c.pg.length, c }); }
      catch (e) { out.push({ id: f.slice(0, -5), nome: f + ' (file illeggibile)', modificata: 0, R: 0, pg: 0, c: null, errore: e.message }); }
    }
    return out;
  }
  function leggiBestiario() { return fs.existsSync(fileBest) ? JSON.parse(fs.readFileSync(fileBest, 'utf8')) : null; }
  function scriviBestiario(b, adesso) {
    if (!b || b.formato !== 'schermo-v1' || b.tipo !== 'bestiario' || !Array.isArray(b.mostri)) throw new Error('bestiario non valido');
    backupGiornaliero(adesso);
    fs.writeFileSync(fileBest + '.tmp', JSON.stringify(b), 'utf8'); fs.renameSync(fileBest + '.tmp', fileBest);
    return true;
  }
  function elimina(id) { const f = file(id); if (fs.existsSync(f)) fs.renameSync(f, f + '.eliminato'); return true; }
  return { cartella, lista, leggi, scrivi, elimina, backupGiornaliero, leggiBestiario, scriviBestiario };
}
module.exports = { crea };
