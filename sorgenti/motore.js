// Schermo del Narratore — motore di calcolo (funzioni pure), testato da test_motore.js.
// Usabile da Node (module.exports) e dalla pagina. Ogni funzione che "cambia" una campagna
// ne restituisce una copia: l'originale non viene toccato. Il caso arriva sempre da `rng`
// (funzione che restituisce un numero in [0,1)), così i test sono ripetibili.
// Tempo: tutto in round assoluti dall'inizio dell'anno di partenza (1 round = 6 s,
// 10 round = 1 minuto, 600 = 1 ora, 14400 = 1 giorno).
'use strict';
const Motore = (() => {
const FORMATO = 'schermo-v1';
const ROUND_MIN = 10, ROUND_ORA = 600, ROUND_GIORNO = 14400;
const clona = o => JSON.parse(JSON.stringify(o));
const nuovoId = rng => Math.floor(rng() * 36 ** 8).toString(36).padStart(8, '0');
// id interni (PG, righe dell'iniziativa): contatore della campagna, sempre univoci
const prossimoId = (c, pre) => { c.contatore = (c.contatore || 0) + 1; return pre + c.contatore; };

// ------------------------------------------------------------------ dadi
function d(n, rng) { return 1 + Math.floor(rng() * n); }
// d20 della Collana: 20 naturale = 30, 1 naturale = −10 (Vol. 1)
function valoreD20(nat) { return nat === 20 ? 30 : nat === 1 ? -10 : nat; }
// Espressioni semplici: "2d6+3", "1d20-1", "4d6kh3", "d100", "5". Restituisce {totale, dadi, testo}
function tira(espr, rng) {
  const s = String(espr).replace(/\s+/g, '').toLowerCase();
  if (!/^[+-]?(\d*d\d+(k[hl]\d+)?|\d+)([+-](\d*d\d+(k[hl]\d+)?|\d+))*$/.test(s)) throw new Error('Espressione non valida: ' + espr);
  let totale = 0; const dadi = [];
  for (const m of s.matchAll(/([+-]?)(?:(\d*)d(\d+)(?:k([hl])(\d+))?|(\d+))/g)) {
    const segno = m[1] === '-' ? -1 : 1;
    if (m[6] !== undefined) { totale += segno * +m[6]; continue; }
    const n = m[2] ? +m[2] : 1, f = +m[3];
    let r = Array.from({ length: n }, () => d(f, rng));
    let tenuti = r;
    if (m[4]) { const k = +m[5]; tenuti = [...r].sort((a, b) => m[4] === 'h' ? b - a : a - b).slice(0, k); }
    dadi.push({ facce: f, risultati: r, tenuti });
    totale += segno * tenuti.reduce((a, b) => a + b, 0);
  }
  return { totale, dadi, testo: espr };
}

// ------------------------------------------------------------------ calendario
const MESI_REALI = [['gennaio', 31], ['febbraio', 28], ['marzo', 31], ['aprile', 30], ['maggio', 31], ['giugno', 30],
  ['luglio', 31], ['agosto', 31], ['settembre', 30], ['ottobre', 31], ['novembre', 30], ['dicembre', 31]];
const SETTIMANA_REALE = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
function calendarioReale() {
  return { tipo: 'reale', mesi: MESI_REALI.map(([nome, giorni]) => ({ nome, giorni })), settimana: SETTIMANA_REALE.slice() };
}
function lunghezzaAnno(cal) { return cal.mesi.reduce((a, m) => a + m.giorni, 0); }
function controllaCalendario(cal) {
  const err = [];
  if (!cal || !Array.isArray(cal.mesi) || !cal.mesi.length) err.push('servono dei mesi');
  else cal.mesi.forEach((m, i) => {
    if (!m.nome || !String(m.nome).trim()) err.push(`mese ${i + 1} senza nome`);
    if (!Number.isInteger(m.giorni) || m.giorni < 1 || m.giorni > 400) err.push(`mese ${m.nome || i + 1}: giorni non validi`);
    if (cal.tipo === 'personalizzato' && !['primavera', 'estate', 'autunno', 'inverno'].includes(m.stagione)) err.push(`mese ${m.nome || i + 1}: stagione mancante`);
  });
  if (cal && cal.settimana && cal.settimana.some(g => !String(g).trim())) err.push('giorno della settimana senza nome');
  return err;
}
// giorno dell'anno (0-based) → {mese (0-based), giorno (1-based)}
function dataDaGiornoAnno(cal, doy) {
  let r = doy;
  for (let i = 0; i < cal.mesi.length; i++) { if (r < cal.mesi[i].giorni) return { mese: i, giorno: r + 1 }; r -= cal.mesi[i].giorni; }
  throw new Error('giorno fuori dall\'anno');
}
function giornoAnnoDaData(cal, mese, giorno) {
  if (mese < 0 || mese >= cal.mesi.length || giorno < 1 || giorno > cal.mesi[mese].giorni) throw new Error('data non valida');
  let n = 0; for (let i = 0; i < mese; i++) n += cal.mesi[i].giorni; return n + giorno - 1;
}
// scompone il tempo assoluto (round) della campagna
function scomponi(camp, R) {
  if (R === undefined) R = camp.tempo.R;
  const cal = camp.calendario, Y = lunghezzaAnno(cal);
  const N = Math.floor(R / ROUND_GIORNO), resto = R - N * ROUND_GIORNO;
  const anno = camp.anno.base + Math.floor(N / Y), doy = ((N % Y) + Y) % Y;
  const { mese, giorno } = dataDaGiornoAnno(cal, doy);
  const minuti = Math.floor(resto / ROUND_MIN);
  const L = cal.settimana && cal.settimana.length ? cal.settimana.length : 0;
  const sett = L ? ((((cal.settimana0 || 0) + N) % L) + L) % L : null;
  return { N, anno, doy, mese, giorno, ore: Math.floor(minuti / 60), min: minuti % 60, round: resto % ROUND_MIN, sett };
}
function tempoAssoluto(camp, anno, mese, giorno, ore = 0, min = 0) {
  const Y = lunghezzaAnno(camp.calendario);
  return ((anno - camp.anno.base) * Y + giornoAnnoDaData(camp.calendario, mese, giorno)) * ROUND_GIORNO + (ore * 60 + min) * ROUND_MIN;
}
const due = n => String(n).padStart(2, '0');
function formatoData(camp, R, conOra = true) {
  const t = scomponi(camp, R), cal = camp.calendario;
  const g = t.sett !== null ? cal.settimana[t.sett] + ' ' : '';
  const anno = t.anno + (camp.anno.etichetta ? ' ' + camp.anno.etichetta : '');
  return `${g}${t.giorno} ${cal.mesi[t.mese].nome} ${anno}` + (conOra ? `, ${due(t.ore)}:${due(t.min)}` : '');
}
function formatoDurata(round) {
  if (round < ROUND_MIN) return `${round} round`;
  if (round < ROUND_ORA) return `${Math.floor(round / ROUND_MIN)} min` + (round % ROUND_MIN ? ` ${round % ROUND_MIN} r` : '');
  if (round < ROUND_GIORNO) { const m = Math.floor(round / ROUND_MIN); return `${Math.floor(m / 60)} h` + (m % 60 ? ` ${m % 60} min` : ''); }
  const g = Math.floor(round / ROUND_GIORNO), h = Math.floor((round % ROUND_GIORNO) / ROUND_ORA);
  return `${g} g` + (h ? ` ${h} h` : '');
}
// durata {n, unita: round|minuti|ore|giorni} → round
function durataInRound(n, unita) {
  const k = { round: 1, minuti: ROUND_MIN, ore: ROUND_ORA, giorni: ROUND_GIORNO }[unita];
  if (!k || !(n >= 0)) throw new Error('durata non valida');
  return Math.round(n * k);
}

// ------------------------------------------------------------------ stagioni e meteo
function cadeIn(g, m, da, a) { // date [giorno, mese]; l'intervallo può scavalcare l'anno
  const v = m * 100 + g, vda = da[1] * 100 + da[0], va = a[1] * 100 + a[0];
  return vda <= va ? v >= vda && v <= va : v >= vda || v <= va;
}
function stagione(camp, meteo, R, zona) {
  zona = zona || camp.zona;
  const t = scomponi(camp, R);
  if (camp.calendario.tipo === 'reale') {
    const s = meteo.stagioni[zona].find(s => cadeIn(t.giorno, t.mese + 1, s.da, s.a));
    return s.id;
  }
  return meteo.stagione_del_mese[zona][camp.calendario.mesi[t.mese].stagione];
}
// risultato della tabella per un d100 (1–100): {testo, opzioni:[[voce…]…]}
function esitoMeteo(meteo, zona, staz, tiro) {
  const riga = meteo.tabelle[zona][staz].find(r => tiro >= r.da && tiro <= r.a);
  // "A / B" (spazi intorno alla barra) = alternative a scelta; "A + B" = effetti insieme
  const opzioni = riga.testo.split(' / ').map(alt => alt.split(' + '));
  // nelle alternative "Pioggia battente / Neve" l'eventuale parte comune resta in ogni opzione
  return { testo: riga.testo, opzioni };
}
function effettiMeteo(meteo, voci) {
  const visti = new Set(), out = [];
  for (const v of voci) { const e = meteo.voci[v]; if (e && !visti.has(e)) { visti.add(e); out.push({ nome: e, voce: v, testo: meteo.effetti[e] }); } }
  return out;
}
function tiraMeteo(camp, meteo, rng, tiro) {
  const c = clona(camp);
  const staz = stagione(c, meteo, c.tempo.R);
  if (tiro === undefined) tiro = d(100, rng);
  const e = esitoMeteo(meteo, c.zona, staz, tiro);
  c.meteo = { giorno: Math.floor(c.tempo.R / ROUND_GIORNO), zona: c.zona, stagione: staz, tiro, testo: e.testo, opzioni: e.opzioni, scelta: 0, manuale: false };
  log(c, `Meteo: ${e.testo} (d% ${tiro}, ${nomeZona(meteo, c.zona)}, ${nomeStagione(meteo, c.zona, staz)})`);
  return c;
}
function impostaMeteo(camp, meteo, testoRiga) { // scelta a mano di una riga della tabella corrente
  const c = clona(camp);
  const staz = stagione(c, meteo, c.tempo.R);
  const riga = meteo.tabelle[c.zona][staz].find(r => r.testo === testoRiga);
  if (!riga) throw new Error('voce del meteo non presente nella tabella');
  const e = esitoMeteo(meteo, c.zona, staz, riga.da);
  c.meteo = { giorno: Math.floor(c.tempo.R / ROUND_GIORNO), zona: c.zona, stagione: staz, tiro: null, testo: e.testo, opzioni: e.opzioni, scelta: 0, manuale: true };
  log(c, `Meteo impostato: ${e.testo}`);
  return c;
}
function scegliOpzioneMeteo(camp, i) {
  const c = clona(camp);
  if (!c.meteo || i < 0 || i >= c.meteo.opzioni.length) throw new Error('opzione del meteo non valida');
  c.meteo.scelta = i; return c;
}
function cambiaZona(camp, meteo, zona) {
  if (!meteo.tabelle[zona]) throw new Error('zona sconosciuta');
  const c = clona(camp); c.zona = zona; log(c, `Zona climatica: ${nomeZona(meteo, zona)}`); return c;
}
const nomeZona = (meteo, z) => (meteo.zone.find(x => x.id === z) || { nome: z }).nome;
const nomeStagione = (meteo, z, s) => (meteo.stagioni[z].find(x => x.id === s) || { nome: s }).nome;
function meteoCorrente(camp, meteo) {
  if (!camp.meteo) return null;
  const voci = camp.meteo.opzioni[camp.meteo.scelta] || camp.meteo.opzioni[0];
  return { ...camp.meteo, voci, effetti: effettiMeteo(meteo, voci) };
}

// ------------------------------------------------------------------ campagne
const IMPOSTAZIONI = { xp: false, pf_nemici: false, timer: false, timer_tv: false, soglia_timer: 0, incontri_casuali: false,
  tv_xn: true, tv_fuori: 'barrate', tv_ora: false, tv_meteo: false, tv_solo_combattimento: true, f10: false, tema: 'scuro' };
// dati: {nome, calendario, anno:{numero, etichetta}, partenza:{mese, giorno, ore, min, sett}, zona, pg:[schede], accompagnatori, cibo, acqua, impostazioni}
function creaCampagna(dati, meteo, rng, oraReale) {
  const err = [];
  if (!dati.nome || !String(dati.nome).trim()) err.push('nome della campagna mancante');
  const cal = dati.calendario && dati.calendario.tipo === 'personalizzato' ? clona(dati.calendario) : calendarioReale();
  err.push(...controllaCalendario(cal));
  if (!Number.isInteger(dati.anno && dati.anno.numero)) err.push('anno non valido');
  if (!meteo.tabelle[dati.zona]) err.push('zona climatica non valida');
  for (const k of ['accompagnatori', 'cibo', 'acqua']) if (!(Number.isInteger(dati[k]) && dati[k] >= 0)) err.push(`${k}: numero non valido`);
  if (err.length) throw new Error(err.join('; '));
  const p = dati.partenza || {};
  const camp = {
    formato: FORMATO, id: (oraReale || 0).toString(36) + nuovoId(rng), nome: String(dati.nome).trim(), creata: oraReale || 0, modificata: oraReale || 0,
    calendario: cal, anno: { base: dati.anno.numero, etichetta: (dati.anno.etichetta || '').trim() },
    tempo: { R: 0 }, zona: dati.zona, meteo: null,
    scorte: { cibo: dati.cibo, acqua: dati.acqua, accompagnatori: dati.accompagnatori }, razionamenti: [],
    pg: [], combattimento: null, coda: [], log: [], impostazioni: { ...IMPOSTAZIONI, ...(dati.impostazioni || {}) },
  };
  camp.tempo.R = tempoAssoluto(camp, dati.anno.numero, p.mese || 0, p.giorno || 1, p.ore || 0, p.min || 0);
  const L = cal.settimana ? cal.settimana.length : 0;
  if (L) { const N = Math.floor(camp.tempo.R / ROUND_GIORNO); camp.calendario.settimana0 = ((((p.sett || 0) - N) % L) + L) % L; }
  let c = camp;
  for (const s of dati.pg || []) c = aggiungiPG(c, s, rng);
  log(c, `Campagna creata: ${c.nome}, ${formatoData(c)}`);
  return tiraMeteo(c, meteo, rng);
}
function duplicaCampagna(camp, rng, oraReale) {
  const c = clona(camp); c.id = (oraReale || 0).toString(36) + nuovoId(rng); c.nome = camp.nome + ' (copia)'; c.creata = c.modificata = oraReale || 0; return c;
}
function esporta(oggetto, tipo) { return JSON.stringify({ formato: FORMATO, tipo, dati: oggetto }, null, 1); }
function importa(testo) {
  let j; try { j = JSON.parse(testo); } catch (e) { throw new Error('il file non è un JSON valido'); }
  if (!j || j.formato !== FORMATO) throw new Error('formato non riconosciuto (atteso ' + FORMATO + ')');
  const lista = j.tipo === 'tutto' ? j.dati.campagne : j.tipo === 'campagna' ? [j.dati] : null;
  if (!lista) throw new Error('contenuto non riconosciuto');
  for (const c of lista) if (!c || c.formato !== FORMATO || !c.id || !c.calendario || !c.tempo) throw new Error('campagna non valida nel file');
  return { tipo: j.tipo, campagne: lista.map(migra) };
}
function migra(c) { // formato versionato: qui le migrazioni future (schermo-v1 → v2…)
  const x = clona(c);
  x.impostazioni = { ...IMPOSTAZIONI, ...(x.impostazioni || {}) };
  x.coda = x.coda || []; x.log = x.log || []; x.razionamenti = x.razionamenti || [];
  // prima versione della Build 1: Fame e Sete del gruppo → a ogni PG (Z1 rivista il 26/10)
  for (const mal of ['fame', 'sete']) {
    const g = x.scorte[mal] || { giorni_senza: 0, penalita: 0 };
    for (const p of x.pg) if (!p.stato[mal]) p.stato[mal] = { ...g };
    delete x.scorte[mal];
  }
  // Build 2a: malus su PG e righe dell'iniziativa, avvisi del turno
  for (const p of x.pg) p.stato.malus = p.stato.malus || [];
  if (x.combattimento) { x.combattimento.avvisi = x.combattimento.avvisi || []; for (const r of Object.values(x.combattimento.righe)) r.malus = r.malus || []; }
  return x;
}
function log(c, testo) { c.log.push({ R: c.tempo.R, testo }); if (c.log.length > 5000) c.log.splice(0, c.log.length - 5000); }

// ------------------------------------------------------------------ PG
const SCHEDA_VUOTA = { nome: '', giocatore: '', razza: '', classe: '', livello: 1, fatica_max: 0, ferita_max: 0,
  rif_dadi: 1, rif_tipo: 8, rif_ripete: false, ca: 10, ca_contatto: 10, ca_sprovvista: 10, dmc: 10, rd: '', resistenze: '', immunita: '',
  tempra: 0, riflessi: 0, volonta: 0, ts_note: '', percezione: 0, intuizione: 0, furtivita: 0,
  abilita_libere: [{ nome: '', valore: 0 }, { nome: '', valore: 0 }], iniziativa: 0, imp_pen: 6, velocita: '', sensi: '', note: '' };
function controllaScheda(s) {
  const err = [];
  if (!s.nome || !String(s.nome).trim()) err.push('nome mancante');
  for (const k of ['livello', 'fatica_max', 'ferita_max', 'rif_dadi']) if (!(Number.isInteger(s[k]) && s[k] >= (k === 'livello' ? 1 : 0))) err.push(`${k} non valido`);
  if (![4, 6, 8, 10, 12].includes(s.rif_tipo)) err.push('dado del Rifiatare non valido');
  if (![6, 3, 0].includes(s.imp_pen)) err.push('penalità da impreparato: 6, 3 o 0');
  return err;
}
function aggiungiPG(camp, scheda, rng) {
  const s = { ...clona(SCHEDA_VUOTA), ...clona(scheda) };
  const err = controllaScheda(s); if (err.length) throw new Error(err.join('; '));
  const c = clona(camp);
  c.pg.push({ id: prossimoId(c, 'p'), scheda: s, stato: { fatica: s.fatica_max, ferita: s.ferita_max, temp: [], nonletali: 0, eroe: 1, rif_riserva: s.rif_dadi,
    fame: { giorni_senza: 0, penalita: 0 }, sete: { giorni_senza: 0, penalita: 0 }, malus: [] } });
  log(c, `PG aggiunto: ${s.nome}`);
  return c;
}
// modifica della scheda: i valori correnti restano, limitati ai nuovi massimi
function modificaPG(camp, id, scheda) {
  const c = clona(camp), p = trova(c, id);
  const s = { ...p.scheda, ...clona(scheda) };
  const err = controllaScheda(s); if (err.length) throw new Error(err.join('; '));
  const st = p.stato;
  if (st.fatica === p.scheda.fatica_max) st.fatica = s.fatica_max;
  if (st.ferita === p.scheda.ferita_max) st.ferita = s.ferita_max;
  st.fatica = Math.min(st.fatica, s.fatica_max); st.ferita = Math.min(st.ferita, s.ferita_max);
  st.rif_riserva = Math.min(st.rif_riserva, s.rif_dadi);
  p.scheda = s; return c;
}
function rimuoviPG(camp, id) {
  const c = clona(camp); const p = trova(c, id); c.pg = c.pg.filter(x => x.id !== id); log(c, `PG rimosso: ${p.scheda.nome}`); return c;
}
function trova(c, id) { const p = c.pg.find(x => x.id === id); if (!p) throw new Error('PG non trovato'); return p; }
const totTemp = st => st.temp.reduce((a, t) => a + t.valore, 0);

// Danno: prima i PF temporanei (prima la fonte che scade per prima), poi i Fatica, poi i Ferita.
// Restituisce {camp, feritaGrave: {riga} | null}: la ferita grave si apre ogni volta che i Ferita scendono sotto 0.
function danno(camp, id, n) {
  if (!(Number.isInteger(n) && n > 0)) throw new Error('danno non valido');
  const c = clona(camp), p = trova(c, id), st = p.stato;
  let r = n;
  st.temp.sort((a, b) => (a.scade === null ? Infinity : a.scade) - (b.scade === null ? Infinity : b.scade));
  for (const t of st.temp) { const x = Math.min(t.valore, r); t.valore -= x; r -= x; }
  st.temp = st.temp.filter(t => t.valore > 0);
  const f = Math.min(Math.max(st.fatica, 0), r); st.fatica -= f; r -= f;
  const prima = st.ferita; st.ferita -= r;
  let fg = null;
  if (r > 0 && st.ferita < 0) fg = { riga: Math.max(-15, st.ferita) };
  log(c, `${p.scheda.nome}: ${n} danni` + (fg ? ` — Ferite ${prima} → ${st.ferita}, ferita grave riga ${fg.riga}` : ''));
  return { camp: c, feritaGrave: fg };
}
function dannoNonLetale(camp, id, n) {
  if (!(Number.isInteger(n) && n > 0)) throw new Error('danno non valido');
  const c = clona(camp), p = trova(c, id); p.stato.nonletali += n;
  log(c, `${p.scheda.nome}: ${n} danni non letali (totale ${p.stato.nonletali})`); return c;
}
// stato dei danni non letali rispetto ai Ferita attuali
function statoNonLetali(p) {
  const nl = p.stato.nonletali, fe = p.stato.ferita;
  if (nl <= 0) return null;
  if (nl > fe) return 'Privo di Sensi';
  if (nl === fe) return 'Barcollante';
  return null;
}
// Cura magica o alchemica: prima i Ferita fino al massimo, poi i Fatica. Cura anche altrettanti danni non letali (PF1e).
function cura(camp, id, n) {
  if (!(Number.isInteger(n) && n > 0)) throw new Error('cura non valida');
  const c = clona(camp), p = trova(c, id), st = p.stato, s = p.scheda, mx = massimi(c, p);
  let r = n;
  const fe = Math.min(r, Math.max(0, mx.ferita - st.ferita)); st.ferita += fe; r -= fe;
  const fa = Math.min(r, Math.max(0, mx.fatica - st.fatica)); st.fatica += fa;
  st.nonletali = Math.max(0, st.nonletali - n);
  log(c, `${s.nome}: cura ${n} (Ferite +${fe}, Fatica +${fa})`);
  return c;
}
// PF temporanei: stessa fonte → resta il valore più alto; fonti diverse si sommano. durata in round (null = finché non si usano)
function pfTemporanei(camp, id, fonte, valore, durata) {
  if (!(Number.isInteger(valore) && valore > 0)) throw new Error('valore non valido');
  fonte = String(fonte || '').trim() || 'senza fonte';
  const c = clona(camp), p = trova(c, id), st = p.stato;
  const scade = durata === null || durata === undefined ? null : c.tempo.R + durata;
  const es = st.temp.find(t => t.fonte.toLowerCase() === fonte.toLowerCase());
  if (es) { if (valore > es.valore) { es.valore = valore; es.scade = scade; } }
  else st.temp.push({ fonte, valore, scade });
  log(c, `${p.scheda.nome}: PF temporanei ${valore} (${fonte})` + (es && valore <= es.valore && es.valore !== valore ? ' — resta il valore più alto della stessa fonte' : ''));
  return c;
}
// Rifiatare: n dadi della riserva, solo ai Fatica; con la spunta ripete 1 e 2 quante volte serve (Vol. 1).
function rifiatare(camp, id, n, rng) {
  const c = clona(camp), p = trova(c, id), st = p.stato, s = p.scheda;
  if (!(Number.isInteger(n) && n > 0)) throw new Error('numero di dadi non valido');
  if (n > st.rif_riserva) throw new Error('dadi insufficienti nella riserva');
  if (statoNonLetali(p) === 'Privo di Sensi') throw new Error('per Rifiatare il personaggio deve essere cosciente');
  const dadi = [];
  for (let i = 0; i < n; i++) { let x = d(s.rif_tipo, rng); if (s.rif_ripete && s.rif_tipo > 2) while (x <= 2) x = d(s.rif_tipo, rng); dadi.push(x); }
  const tirati = dadi.reduce((a, b) => a + b, 0), div = divisoreOrgano(p), tot = Math.floor(tirati / div);
  const prima = st.fatica; st.fatica = Math.min(massimi(c, p).fatica, st.fatica + tot); st.rif_riserva -= n;
  log(c, `${s.nome}: Rifiatare ${n}d${s.rif_tipo} = ${tirati} [${dadi.join(', ')}]` + (div > 1 ? ` ÷ ${div} (organo compromesso) = ${tot}` : '') + ` — Fatica ${prima} → ${st.fatica}`);
  return { camp: c, dadi, totale: tot, tirati, divisore: div };
}
function puntoEroe(camp, id, valore) {
  const c = clona(camp), p = trova(c, id); p.stato.eroe = valore ? 1 : 0; return c;
}
// ------------------------------------------------------------------ tempo
// Avanza l'orologio di `dR` round: scadenze dei PF temporanei, recupero dei non letali (1 all'ora),
// cambi di giorno (scorte e meteo). Gli avvisi che chiedono un'azione del GM vanno in camp.coda.
function avanza(camp, dR, meteo, rng, motivo, opz) {
  if (!(Number.isInteger(dR) && dR >= 0)) throw new Error('avanzamento non valido');
  let c = clona(camp);
  const R0 = c.tempo.R, R1 = R0 + dR;
  // cambi di giorno nell'ordine, ognuno con il suo istante
  const g0 = Math.floor(R0 / ROUND_GIORNO), g1 = Math.floor(R1 / ROUND_GIORNO);
  const istanti = [];
  for (let g = g0 + 1; g <= g1; g++) istanti.push(g * ROUND_GIORNO);
  istanti.push(R1);
  let prec = R0;
  for (const t of istanti) {
    c.tempo.R = t;
    scadenzeTemp(c, prec, t);
    recuperoNonLetali(c, prec, t);
    tempoMalus(c, prec, t, rng, !!(opz && opz.daTurno));
    if (t % ROUND_GIORNO === 0 && t > prec) { c = cambioGiorno(c, meteo, rng); }
    prec = t;
  }
  if (motivo) log(c, `${motivo}: +${formatoDurata(dR)} → ${formatoData(c)}`);
  return c;
}
function scadenzeTemp(c, da, a) {
  for (const p of c.pg) {
    const scaduti = p.stato.temp.filter(t => t.scade !== null && t.scade <= a);
    for (const t of scaduti) log(c, `${p.scheda.nome}: scadono i PF temporanei (${t.fonte}, ${t.valore})`);
    p.stato.temp = p.stato.temp.filter(t => !(t.scade !== null && t.scade <= a));
  }
}
function recuperoNonLetali(c, da, a) {
  const ore = Math.floor(a / ROUND_ORA) - Math.floor(da / ROUND_ORA);
  if (ore > 0) for (const p of c.pg) p.stato.nonletali = Math.max(0, p.stato.nonletali - ore);
}
function vaiA(camp, R, meteo, rng, motivo) {
  if (R < camp.tempo.R) throw new Error('il tempo non torna indietro');
  return avanza(camp, R - camp.tempo.R, meteo, rng, motivo);
}
// Riposo 8 ore: avanza l'orologio, poi Fatica al massimo, +1 Ferita per livello, riserva del Rifiatare piena. Il Punto eroe non cambia.
// Un solo riposo nelle 24 ore (Massy, 26/10): il successivo si può fare 24 ore dopo l'inizio del precedente;
// se il precedente è passato a cavallo di due giorni, il giorno dopo anche prima, ma non prima di 12 ore dalla sua fine.
const DURATA_RIPOSO = 8 * ROUND_ORA;
function riposoPossibileDa(p) {
  const u = p.stato.ultimo_riposo; if (!u) return null;
  const aCavallo = Math.floor(u.inizio / ROUND_GIORNO) !== Math.floor((u.fine - 1) / ROUND_GIORNO);
  return aCavallo ? Math.min(u.inizio + ROUND_GIORNO, u.fine + 12 * ROUND_ORA) : u.inizio + ROUND_GIORNO;
}
function puoRiposare(camp, p, R) {
  const da = riposoPossibileDa(p); if (R === undefined) R = camp.tempo.R;
  return { ok: da === null || R >= da, da };
}
function riposo(camp, meteo, rng, ids) {
  const scelti = camp.pg.filter(p => !ids || ids.includes(p.id));
  if (!scelti.length) throw new Error('nessun PG scelto per il riposo');
  for (const p of scelti) { const r = puoRiposare(camp, p);
    if (!r.ok) throw new Error(`${p.scheda.nome} ha già riposato: di nuovo da ${formatoData(camp, r.da)}`); }
  const inizio = camp.tempo.R;
  let c = avanza(camp, DURATA_RIPOSO, meteo, rng, 'Riposo 8 ore');
  for (const p of c.pg) {
    if (!scelti.some(x => x.id === p.id)) continue;
    const s = p.scheda, st = p.stato, mx = massimi(c, p), div = divisoreOrgano(p);
    st.fatica = div > 1 ? Math.min(mx.fatica, st.fatica + Math.floor(Math.max(0, mx.fatica - st.fatica) / div)) : mx.fatica;
    st.ferita = Math.min(mx.ferita, st.ferita + s.livello); st.rif_riserva = s.rif_dadi;
    if (div > 1) log(c, `${s.nome}: organo compromesso, Punti Fatica recuperati ÷ ${div}`);
    st.ultimo_riposo = { inizio, fine: inizio + DURATA_RIPOSO };
  }
  log(c, `Riposo (${scelti.map(p => p.scheda.nome).join(', ')}): Fatica al massimo, +1 Ferita per livello, riserva del Rifiatare piena`);
  return c;
}

// ------------------------------------------------------------------ scorte (Guida: Fame e sete)
function consumoGiornaliero(camp) { return camp.pg.length + camp.scorte.accompagnatori; }
function bastanoPer(camp, chi) {
  const k = consumoGiornaliero(camp); return k ? Math.floor(camp.scorte[chi] / k) : Infinity;
}
function modificaScorta(camp, chi, delta) {
  if (!['cibo', 'acqua'].includes(chi) || !Number.isInteger(delta)) throw new Error('scorta non valida');
  const c = clona(camp); c.scorte[chi] = Math.max(0, c.scorte[chi] + delta);
  log(c, `Scorta di ${chi}: ${delta > 0 ? '+' : ''}${delta} → ${c.scorte[chi]}`); return c;
}
function impostaAccompagnatori(camp, n) {
  if (!(Number.isInteger(n) && n >= 0)) throw new Error('numero non valido');
  const c = clona(camp); c.scorte.accompagnatori = n; return c;
}
// Al cambio di giorno ognuno consuma 1 razione di cibo e 1 d'acqua (PG + accompagnatori).
// Se una scorta basta per tutti si consuma da sola; se è a 0 nessuno mangia (o beve).
// Se ce n'è un po' ma non per tutti, il GM sceglie chi la usa (Z1): il giorno resta in sospeso
// in camp.razionamenti (con un avviso in coda) finché non si chiama risolviRazionamento.
const SCORTE = [['acqua', 'sete'], ['cibo', 'fame']];
function cambioGiorno(camp, meteo, rng) {
  const c = camp; // già clonata da avanza
  const N = Math.floor(c.tempo.R / ROUND_GIORNO);
  for (const [chi, mal] of SCORTE) {
    if (consumoGiornaliero(c) === 0) continue;
    const r = { id: prossimoId(c, 'z'), R: c.tempo.R, giorno: N, scorta: chi, mal };
    c.razionamenti.push(r);
    risolviAutomatici(c, chi, meteo);
  }
  return tiraMeteo(c, meteo, rng);
}
// risolve in ordine i giorni in sospeso di una scorta finché non serve una scelta del GM
function risolviAutomatici(c, chi, meteo) {
  for (;;) {
    const r = c.razionamenti.find(x => x.scorta === chi);
    if (!r) return;
    const k = consumoGiornaliero(c), q = c.scorte[chi];
    if (q >= k) applicaRazionamento(c, r, c.pg.map(p => p.id), c.scorte.accompagnatori, meteo);
    else if (q === 0) applicaRazionamento(c, r, [], 0, meteo);
    else {
      if (!c.coda.some(x => x.razionamento === r.id))
        c.coda.push({ R: r.R, tipo: 'razionamento', razionamento: r.id,
          testo: `${chi === 'acqua' ? 'Acqua' : 'Cibo'} insufficiente: ${q} razioni per ${k} persone (${formatoData(c, r.R, false)}). Scegli chi ${chi === 'acqua' ? 'beve' : 'mangia'}.` });
      return;
    }
  }
}
function applicaRazionamento(c, r, ids, accompagnatori, meteo) {
  const regola = meteo.fame_sete[r.mal], verbo = r.scorta === 'acqua' ? 'beve' : 'mangia';
  c.scorte[r.scorta] -= ids.length + accompagnatori;
  const senza = [], prove = [];
  for (const p of c.pg) {
    const m = p.stato[r.mal];
    if (ids.includes(p.id)) {
      if (m.penalita > 0) { m.penalita -= 1; log(c, `${p.scheda.nome} ${verbo}: ${regola.nome} ${m.penalita + 1} → ${m.penalita}`); }
      m.giorni_senza = 0;
    } else {
      m.giorni_senza += 1; m.penalita += 1; senza.push(`${p.scheda.nome} ${m.penalita}`);
      if (m.giorni_senza >= regola.giorno_prova) prove.push(`${p.scheda.nome} (giorno ${m.giorni_senza})`);
    }
  }
  const restano = c.scorte.accompagnatori - accompagnatori;
  if (ids.length + accompagnatori) log(c, `Scorta di ${r.scorta}: −${ids.length + accompagnatori} → ${c.scorte[r.scorta]}` + (restano > 0 ? `; ${restano} accompagnatori senza` : ''));
  if (senza.length) {
    log(c, `${regola.nome}: ${senza.join(', ')}`);
    c.coda.push({ R: r.R, tipo: r.mal, testo: `${regola.nome}: ${senza.join(', ')} (−N ai tiri per colpire, ai TS e alle prove).` });
  }
  if (prove.length) c.coda.push({ R: r.R, tipo: r.mal, testo: `${regola.nome}: prova di Costituzione CD ${regola.cd} per ${prove.join(', ')}. Se fallisce: privo di sensi, morte entro 1d12 ore.` });
  if (!senza.length && restano > 0) c.coda.push({ R: r.R, tipo: r.mal, testo: `${regola.nome}: ${restano} accompagnatori senza razione.` });
  c.razionamenti = c.razionamenti.filter(x => x.id !== r.id);
  c.coda = c.coda.filter(x => x.razionamento !== r.id);
}
// scelta del GM per un giorno in sospeso: i PG (id) e quanti accompagnatori usano la scorta
function risolviRazionamento(camp, id, ids, accompagnatori, meteo) {
  const c = clona(camp), r = c.razionamenti.find(x => x.id === id);
  if (!r) throw new Error('razionamento non trovato');
  if (c.razionamenti.find(x => x.scorta === r.scorta).id !== id) throw new Error('prima va deciso il giorno precedente');
  ids = [...new Set(ids)];
  if (ids.some(x => !c.pg.some(p => p.id === x))) throw new Error('PG non trovato');
  if (!(Number.isInteger(accompagnatori) && accompagnatori >= 0 && accompagnatori <= c.scorte.accompagnatori)) throw new Error('numero di accompagnatori non valido');
  if (ids.length + accompagnatori > c.scorte[r.scorta]) throw new Error(`ci sono solo ${c.scorte[r.scorta]} razioni`);
  applicaRazionamento(c, r, ids, accompagnatori, meteo);
  risolviAutomatici(c, r.scorta, meteo);
  return c;
}
function razionamentoAperto(camp) {
  const z = camp.razionamenti || [];
  return z.length ? z.slice().sort((a, b) => a.R - b.R)[0] : null;
}
function togliDallaCoda(camp, i) {
  if (camp.coda[i] && camp.coda[i].tipo === 'razionamento') throw new Error('prima scegli chi usa la scorta');
  if (camp.coda[i] && ['ts', 'veleno'].includes(camp.coda[i].tipo)) throw new Error('rispondi Superato o Fallito');
  if (camp.coda[i] && camp.coda[i].tipo === 'morte') throw new Error('scegli cosa succede');
  const c = clona(camp); c.coda.splice(i, 1); return c;
}

// ------------------------------------------------------------------ iniziativa
// partecipanti: [{tipo:'pg', pgId, totale | d20, impreparato} | {tipo:'nemico', nome, bonus, n, modo:'tipo'|'singolo', impreparato, imp_pen, nomeTv, nascosto}]
function tiroIniziativa(nat, bonus, pen) { return valoreD20(nat) + bonus - pen; }
function avviaCombattimento(camp, partecipanti, rng, oraReale) {
  const c = clona(camp);
  if (c.combattimento) throw new Error('c\'è già un combattimento in corso');
  const righe = [];
  for (const x of partecipanti) righe.push(...righeDa(c, x, rng));
  if (!righe.length) throw new Error('nessun partecipante');
  ordina(righe);
  c.combattimento = { round: 1, ordine: righe.map(r => r.id), righe: Object.fromEntries(righe.map(r => [r.id, r])), turno: 0,
    attesa: [], avvisi: [], inizioR: c.tempo.R, storia: [], timer: c.impostazioni.timer ? nuovoTimer(oraReale) : null };
  log(c, 'Inizio del combattimento: ' + righe.map(r => `${etichetta(r)} ${r.totale}`).join(', '));
  saltaFuori(c.combattimento);
  return c;
}
function righeDa(c, x, rng) {
  if (x.tipo === 'pg') {
    const p = trova(c, x.pgId), s = p.scheda, pen = x.impreparato ? s.imp_pen : 0, ini = valoriPG(c, p).iniziativa.valore;
    let totale, nat = null;
    if (x.d20 !== undefined && x.d20 !== null) { nat = x.d20; if (!(nat >= 1 && nat <= 20)) throw new Error('d20 non valido'); totale = tiroIniziativa(nat, ini, pen); }
    else { if (!Number.isInteger(x.totale)) throw new Error(`${s.nome}: totale dell'iniziativa mancante`); totale = x.totale - pen; }
    return [{ id: prossimoId(c, 'r'), tipo: 'pg', pgId: p.id, nome: s.nome, bonus: ini, nat, totale, n: 1, spareggio: d(20, rng), stato: 'attivo', prepara: null, nascosta: false, nomeTv: '', malus: [] }];
  }
  const n = x.n || 1, pen = x.impreparato ? (x.imp_pen === undefined ? 6 : x.imp_pen) : 0, out = [];
  if (!String(x.nome || '').trim()) throw new Error('nemico senza nome');
  const riga = (nome, k) => { const nat = d(20, rng); return { id: prossimoId(c, 'r'), tipo: 'nemico', nome, bonus: x.bonus || 0, nat, totale: tiroIniziativa(nat, x.bonus || 0, pen), n: k, spareggio: d(20, rng), stato: 'attivo', prepara: null, nascosta: !!x.nascosto, nomeTv: x.nomeTv || '', malus: [] }; };
  if (n === 1) out.push(riga(x.nome, 1));
  else if (x.modo === 'singolo') for (let i = 1; i <= n; i++) out.push(riga(`${x.nome} ${i}`, 1));
  else out.push(riga(x.nome, n));
  return out;
}
// ordine: totale, poi bonus più alto, poi tiro di spareggio
function confronta(a, b) { return b.totale - a.totale || b.bonus - a.bonus || b.spareggio - a.spareggio; }
function ordina(righe) { righe.sort(confronta); }
const etichetta = r => r.n > 1 ? `${r.nome} ×${r.n}` : r.nome;
function attuale(comb) { return comb.righe[comb.ordine[comb.turno]] || null; }
function saltaFuori(comb) { // se tocca a una creatura fuori combattimento si passa oltre (senza girare il round)
  let k = 0;
  const salta = r => r.stato === 'fuori' || r.salta === comb.round;
  while (comb.ordine.length && attuale(comb) && salta(attuale(comb)) && k++ < comb.ordine.length) comb.turno++;
}
function istantanea(c) { const x = clona(c); if (x.combattimento) x.combattimento.storia = []; return JSON.stringify(x); }
// esegue un comando del combattimento salvando lo stato per «Indietro»
function comando(camp, nome, args, meteo, rng, oraReale) {
  if (!camp.combattimento) throw new Error('nessun combattimento in corso');
  const prima = istantanea(camp);
  let c = clona(camp);
  c = COMANDI[nome](c, args || {}, meteo, rng, oraReale);
  if (c.combattimento) { c.combattimento.storia.push(prima); if (c.combattimento.storia.length > 200) c.combattimento.storia.shift(); }
  return c;
}
function indietro(camp) {
  const st = camp.combattimento && camp.combattimento.storia;
  if (!st || !st.length) throw new Error('niente da annullare');
  const c = JSON.parse(st[st.length - 1]);
  c.combattimento.storia = st.slice(0, -1);
  return c;
}
const COMANDI = {
  avanti(c, a, meteo, rng, ora) {
    const cb = c.combattimento; if (!cb.ordine.length) return c;
    const uscente = attuale(cb);
    timerFineTurno(cb, uscente, ora);
    if (uscente) fineTurno(c, uscente.id, rng);
    cb.turno++;
    saltaFuori(cb);
    if (cb.turno >= cb.ordine.length) { // giro completo = 1 round
      cb.turno = 0; cb.round++;
      c = avanza(c, 1, meteo, rng, undefined, { daTurno: true });
      saltaFuori(c.combattimento);
    }
    const nuovo = attuale(c.combattimento);
    c.combattimento.avvisi = nuovo ? inizioTurno(c, nuovo.id, rng) : [];
    return c;
  },
  ritardare(c, a, meteo, rng, ora) { // esce dall'ordine ed è «in attesa» finché non entra
    const cb = c.combattimento, r = attuale(cb); if (!r) return c;
    timerFineTurno(cb, r, ora);
    cb.ordine.splice(cb.turno, 1); cb.attesa.push(r.id); r.stato = 'attesa';
    log(c, `${etichetta(r)} ritarda`);
    if (cb.turno >= cb.ordine.length) { cb.turno = 0; cb.round++; c = avanza(c, 1, meteo, rng, undefined, { daTurno: true }); }
    saltaFuori(c.combattimento);
    const nuovo = attuale(c.combattimento);
    c.combattimento.avvisi = nuovo ? inizioTurno(c, nuovo.id, rng) : [];
    return c;
  },
  entraOra(c, a) { // chi ritardava si inserisce prima di chi sta agendo e agisce ora
    const cb = c.combattimento, i = cb.attesa.indexOf(a.id); if (i < 0) throw new Error('la creatura non è in attesa');
    cb.attesa.splice(i, 1); cb.ordine.splice(cb.turno, 0, a.id); cb.righe[a.id].stato = 'attivo';
    log(c, `${etichetta(cb.righe[a.id])} entra nell'iniziativa`); return c;
  },
  preparare(c, a) {
    const r = c.combattimento.righe[a.id]; r.prepara = { azione: a.azione || '', innesco: a.innesco || '' };
    log(c, `${etichetta(r)} prepara: ${r.prepara.azione}` + (r.prepara.innesco ? ` (se ${r.prepara.innesco})` : '')); return c;
  },
  scatta(c, a) {
    const r = c.combattimento.righe[a.id]; if (!r.prepara) throw new Error('nessuna azione preparata');
    log(c, `Scatta l'azione preparata di ${etichetta(r)}: ${r.prepara.azione}`); r.prepara = null; return c;
  },
  puntoEroe(c, a) { // il PG agisce subito prima di chi stava per agire; il Punto eroe è speso
    const cb = c.combattimento, r = cb.righe[a.id];
    if (r.tipo !== 'pg') throw new Error('solo i PG hanno il Punto eroe');
    const p = trova(c, r.pgId); if (!p.stato.eroe) throw new Error(`${p.scheda.nome} non ha il Punto eroe`);
    if (cb.ordine[cb.turno] === r.id) throw new Error('sta già agendo');
    const iA = cb.attesa.indexOf(r.id);
    if (iA >= 0) { cb.attesa.splice(iA, 1); r.stato = 'attivo'; }
    else { const i = cb.ordine.indexOf(r.id); cb.ordine.splice(i, 1); if (i < cb.turno) cb.turno--; }
    cb.ordine.splice(cb.turno, 0, r.id); p.stato.eroe = 0;
    log(c, `${p.scheda.nome} spende il Punto eroe e agisce prima di ${etichetta(cb.righe[cb.ordine[cb.turno + 1]] || r)}`);
    return c;
  },
  separa(c, a, meteo, rng) { // stacca una creatura dal gruppo, con la stessa iniziativa, subito dopo il gruppo
    const cb = c.combattimento, r = cb.righe[a.id]; if (!(r.n > 1)) throw new Error('non è un gruppo');
    r.n--; const nuova = { ...clona(r), id: prossimoId(c, 'r'), n: 1, nome: a.nome || `${r.nome} (separato)`, prepara: null };
    nuova.malus = (nuova.malus || []).map(m => ({ ...m, id: prossimoId(c, 'm') }));
    cb.righe[nuova.id] = nuova;
    const i = cb.ordine.indexOf(r.id);
    if (i >= 0) cb.ordine.splice(i + 1, 0, nuova.id); else cb.attesa.push(nuova.id);
    log(c, `${nuova.nome} si separa da ${r.nome}`); return c;
  },
  rinforzi(c, a, meteo, rng) {
    const cb = c.combattimento, nuove = [];
    for (const x of a.partecipanti) nuove.push(...righeDa(c, x, rng));
    for (const r of nuove) {
      cb.righe[r.id] = r;
      let i = cb.ordine.findIndex(id => confronta(r, cb.righe[id]) < 0);
      if (i < 0) i = cb.ordine.length;
      cb.ordine.splice(i, 0, r.id); if (i <= cb.turno && cb.ordine.length > 1) cb.turno++;
    }
    log(c, 'Rinforzi: ' + nuove.map(r => `${etichetta(r)} ${r.totale}`).join(', ')); return c;
  },
  fuori(c, a) { const r = c.combattimento.righe[a.id]; r.stato = a.ritorna ? 'attivo' : 'fuori'; log(c, `${etichetta(r)} ${a.ritorna ? 'torna in combattimento' : 'è fuori combattimento'}`); if (!a.ritorna) saltaFuori(c.combattimento); return c; },
  togli(c, a) {
    const cb = c.combattimento, i = cb.ordine.indexOf(a.id);
    if (i >= 0) { cb.ordine.splice(i, 1); if (i < cb.turno) cb.turno--; if (cb.turno >= cb.ordine.length) cb.turno = 0; }
    cb.attesa = cb.attesa.filter(x => x !== a.id); log(c, `${etichetta(cb.righe[a.id])} tolto dall'iniziativa`); delete cb.righe[a.id]; return c;
  },
  nascondi(c, a) { const r = c.combattimento.righe[a.id]; r.nascosta = !!a.nascosta; return c; },
  correggi(c, a) { // correzione a mano del totale: la creatura viene ricollocata
    const cb = c.combattimento, r = cb.righe[a.id]; if (!Number.isInteger(a.totale)) throw new Error('totale non valido');
    const corrente = cb.ordine[cb.turno]; r.totale = a.totale;
    const i = cb.ordine.indexOf(r.id);
    if (i >= 0) { cb.ordine.splice(i, 1); let j = cb.ordine.findIndex(id => confronta(r, cb.righe[id]) < 0); if (j < 0) j = cb.ordine.length; cb.ordine.splice(j, 0, r.id); cb.turno = Math.max(0, cb.ordine.indexOf(corrente)); }
    log(c, `${etichetta(r)}: iniziativa corretta a ${a.totale}`); return c;
  },
  pausa(c, a, m, r, ora) { timerPausa(c.combattimento, ora); return c; },
};
function fineCombattimento(camp, oraReale) {
  const c = clona(camp), cb = c.combattimento; if (!cb) throw new Error('nessun combattimento in corso');
  if (cb.timer) timerFineTurno(cb, attuale(cb), oraReale);
  const rie = riepilogo(c, cb, oraReale);
  log(c, rie.testo);
  c.combattimento = null;
  for (const p of c.pg) { const via = p.stato.malus.filter(m => m.durata.tipo === 'incontro');
    for (const m of via) togliDaElenco(c, p.stato.malus, m, `${p.scheda.nome}: finisce ${m.nome} (fine dell'incontro)`); }
  return { camp: c, riepilogo: rie };
}

// ------------------------------------------------------------------ timer reale
function nuovoTimer(ora) { return { inizio: ora || 0, inizioTurno: ora || 0, pausa: null, inPausa: 0, inPausaTurno: 0, turni: {} }; }
function attivaTimer(camp, ora) { const c = clona(camp); if (c.combattimento && !c.combattimento.timer) c.combattimento.timer = nuovoTimer(ora); return c; }
function timerPausa(cb, ora) {
  const t = cb.timer; if (!t) return;
  if (t.pausa === null) t.pausa = ora;
  else { const x = ora - t.pausa; t.inPausa += x; t.inPausaTurno += x; t.pausa = null; }
}
function timerLetture(cb, ora) {
  const t = cb.timer; if (!t) return null;
  const adesso = t.pausa === null ? ora : t.pausa;
  return { turno: Math.max(0, adesso - t.inizioTurno - t.inPausaTurno), combattimento: Math.max(0, adesso - t.inizio - t.inPausa), inPausa: t.pausa !== null, round: cb.round };
}
function timerFineTurno(cb, uscente, ora) {
  const t = cb.timer; if (!t || !uscente) return;
  const l = timerLetture(cb, ora);
  (t.turni[uscente.id] = t.turni[uscente.id] || { nome: etichetta(uscente), tipo: uscente.tipo, durate: [] }).durate.push(l.turno);
  if (t.pausa !== null) { t.inPausa += ora - t.pausa; t.pausa = null; }
  t.inizioTurno = ora; t.inPausaTurno = 0;
}
const mmss = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${due(s % 60)}`; };
function riepilogo(c, cb, ora) {
  const round = cb.round, durataGioco = c.tempo.R - cb.inizioR;
  const r = { round, durataGioco, timer: null, testo: '' };
  let testo = `Fine del combattimento: ${round} round (${formatoDurata(Math.max(durataGioco, 0))} di gioco)`;
  if (cb.timer) {
    const l = timerLetture(cb, ora), pg = [];
    for (const v of Object.values(cb.timer.turni)) if (v.tipo === 'pg' && v.durate.length)
      pg.push({ nome: v.nome, medio: v.durate.reduce((a, b) => a + b, 0) / v.durate.length, massimo: Math.max(...v.durate), turni: v.durate.length });
    r.timer = { durata: l.combattimento, pg };
    testo += `; durata reale ${mmss(l.combattimento)}` + (pg.length ? '; ' + pg.map(x => `${x.nome}: medio ${mmss(x.medio)}, più lungo ${mmss(x.massimo)}`).join('; ') : '');
  }
  r.testo = testo; return r;
}

// ------------------------------------------------------------------ malus e bonus (G)
// Un malus sta in p.stato.malus (PG) o in combattimento.righe[id].malus (nemici e gruppi). «chi» = {pg: id} | {riga: id}.
// durata: {tipo:'round'|'tempo', fine: R} · {tipo:'incontro'|'permanente'|'libera'} · {tipo:'curata', legata: id del malus}
// Durate in round: in combattimento scadono all'inizio del turno della creatura di riferimento (il bersaglio, o chi
// l'ha causato) quando il round assoluto ha raggiunto `fine`; fuori combattimento con l'orologio (G1: 10 round al minuto).
const UNITA_ROUND = { round: 1, minuti: ROUND_MIN, ore: ROUND_ORA, giorni: ROUND_GIORNO };
const PAURA = ['Scosso', 'Spaventato', 'In Preda al Panico', 'Accovacciato'];
const EFFETTI_COND = { // G2: condizioni applicate ai valori del riquadro
  'Scosso': { ts: -2, abilita: -2 }, 'Spaventato': { ts: -2, abilita: -2 }, 'In Preda al Panico': { ts: -2, abilita: -2 }, 'Infermo': { ts: -2, abilita: -2 },
  'Abbagliato': { abilita_nome: { 'Percezione': -1 } }, 'Accecato': { ca: -2, abilita_nome: { 'Percezione': -4 } }, 'Assordato': { iniziativa: -4 },
  'Impreparato': { sprovvista: true }, 'Colto alla sprovvista': { sprovvista: true }, 'Prono': { nota: '−4 CA in mischia / +4 a distanza' } };
const CHIAVI_MOD = ['ts', 'tempra', 'riflessi', 'volonta', 'ca', 'dmc', 'abilita', 'iniziativa', 'fatica_max', 'ferita_max'];
function pulisciMods(mo) {
  const out = {};
  for (const k of [...CHIAVI_MOD, 'fatica_max_liv', 'ferita_max_liv']) { const v = mo && mo[k]; if (v) { if (!Number.isInteger(v)) throw new Error('modificatore non valido: ' + k); out[k] = v; } }
  if (mo && mo.abilita_nome) for (const [n, v] of Object.entries(mo.abilita_nome)) if (v) (out.abilita_nome = out.abilita_nome || {})[n] = v;
  if (mo && mo.altro) out.altro = String(mo.altro).trim();
  return out;
}
function elencoDi(c, chi) {
  if (chi.pg) return trova(c, chi.pg).stato.malus;
  const r = c.combattimento && c.combattimento.righe[chi.riga]; if (!r) throw new Error('creatura non trovata');
  return r.malus || (r.malus = []);
}
function nomeDi(c, chi) { return chi.pg ? trova(c, chi.pg).scheda.nome : etichetta(c.combattimento.righe[chi.riga]); }
function tutti(c) { // tutte le creature con malus: PG e righe dei nemici
  const out = c.pg.map(p => ({ chi: { pg: p.id }, nome: p.scheda.nome, elenco: p.stato.malus, p }));
  if (c.combattimento) for (const r of Object.values(c.combattimento.righe)) if (r.tipo !== 'pg') out.push({ chi: { riga: r.id }, nome: etichetta(r), elenco: r.malus || (r.malus = []), r });
  return out;
}
function creaturaDi(c, chi) { return tutti(c).find(x => chi.pg ? x.chi.pg === chi.pg : x.chi.riga === chi.riga); }
function trovaMalus(c, chi, id) {
  const el = elencoDi(c, chi), m = el.find(x => x.id === id); if (!m) throw new Error('malus non trovato');
  return { x: creaturaDi(c, chi), m };
}
function rigaDiPG(cb, pgId) { const r = Object.values(cb.righe).find(x => x.pgId === pgId); return r ? r.id : null; }
// riga dell'iniziativa che fa da riferimento per le scadenze in round
function ancora(c, chi, m) {
  const cb = c.combattimento; if (!cb) return null;
  if (m.scadenza === 'causa' && m.causa && cb.righe[m.causa]) return m.causa;
  return chi.riga || rigaDiPG(cb, chi.pg);
}
// il malus scala nei turni se c'è un combattimento e il riferimento è nell'ordine
function inTurno(c, chi, m) { const a = ancora(c, chi, m); return a && c.combattimento.ordine.includes(a) ? a : null; }
// round assoluto di fine per N round da adesso: se il riferimento ha già agito in questo round, un round in più
function fineRound(c, chi, m, n) {
  const cb = c.combattimento; let f = c.tempo.R + n;
  const a = cb && ancora(c, chi, m);
  if (a) { const i = cb.ordine.indexOf(a); if (i >= 0 && i < cb.turno) f += 1; }
  return f;
}
function durataMalus(c, chi, m, dd) {
  if (!dd || !dd.unita && !dd.tipo) return { tipo: 'libera' };
  if (dd.tipo) { if (!['incontro', 'permanente', 'libera', 'curata'].includes(dd.tipo)) throw new Error('durata non valida'); return { ...dd }; }
  if (['incontro', 'permanente', 'libera'].includes(dd.unita)) return { tipo: dd.unita };
  const k = UNITA_ROUND[dd.unita]; if (!k || !(Number.isInteger(dd.n) && dd.n > 0)) throw new Error('durata non valida');
  return dd.unita === 'round' ? { tipo: 'round', fine: fineRound(c, chi, m, dd.n), n: dd.n } : { tipo: 'tempo', fine: c.tempo.R + dd.n * k, n: dd.n, unita: dd.unita };
}
const PESO_DURATA = d => d.tipo === 'permanente' || d.tipo === 'libera' || d.tipo === 'curata' ? Infinity : d.tipo === 'incontro' ? 1e15 : d.fine;
// aggiunge un malus a c (già clonata) e lo restituisce
function nuovoMalus(c, chi, d, rng) {
  const el = elencoDi(c, chi), chiNome = nomeDi(c, chi);
  const tipo = d.tipo || 'altro';
  let nome = String(d.nome || '').trim();
  if (tipo === 'condizione' && !nome) throw new Error('scegli la condizione');
  if (!nome) nome = { bonus: 'Bonus', veleno: 'Veleno', malattia: 'Malattia' }[tipo] || 'Malus';
  const m = { id: prossimoId(c, 'm'), tipo, nome, R: c.tempo.R, scadenza: d.scadenza === 'causa' && d.causa ? 'causa' : 'bersaglio',
    causa: d.scadenza === 'causa' && d.causa ? d.causa : null, mods: pulisciMods(d.mods), etichetta: String(d.etichetta || '').trim(), fonte: d.fonte || '' };
  if (m.causa && !(c.combattimento && c.combattimento.righe[m.causa])) throw new Error('chi l\'ha causato non è nell\'iniziativa');
  if (d.perc) { if (!(Number.isInteger(d.perc) && d.perc > 0 && d.perc <= 100)) throw new Error('percentuale non valida'); m.perc = d.perc; }
  if (nome === 'Livelli negativi') { if (!(Number.isInteger(d.n) && d.n > 0)) throw new Error('numero dei livelli negativi non valido'); m.n = d.n; }
  m.durata = durataMalus(c, chi, m, d.durata);
  if (d.ts) { // TS periodico (facoltativo per qualsiasi malus)
    const t = d.ts, k = UNITA_ROUND[t.unita];
    if (!t.tipo || !Number.isInteger(t.cd) || !k || !(Number.isInteger(t.ogni) && t.ogni > 0)) throw new Error('TS periodico incompleto');
    m.per = { kind: 'ts', ts: t.tipo, cd: t.cd, unita: t.unita, ogni: t.ogni * k, finisce: t.finisce !== false, attesa: false };
    // il primo TS: al prossimo turno della creatura di riferimento (in combattimento), altrimenti dopo l'intervallo
    m.per.prossimo = t.unita === 'round' && c.combattimento ? fineRound(c, chi, m, t.ogni - 1) : c.tempo.R + m.per.ogni;
  }
  if (tipo === 'veleno' || tipo === 'malattia') impostaVeleno(c, chi, m, d.veleno || {});
  for (const k of ['pf', 'gravita', 'passo', 'azioni', 'amp', 'dita']) if (d[k] !== undefined) m[k] = clona(d[k]);
  if (['ferita', 'emorragia_lieve', 'emorragia_grave'].includes(tipo)) { m.cure = 0; m.cer = { tentativi: 0, cd: null, prossimo: null, guarisce: null }; }
  if (['emorragia_grave', 'panico'].includes(tipo)) { m.p = 0; m.tiri = 0; }
  if (tipo === 'panico') m.spese = [];
  if (d.morteTra) m.morte_R = c.tempo.R + d.morteTra;
  if (d.dopoMorto) m.dopoMorto = true;
  // la stessa condizione non si somma: resta la durata più lunga
  if (tipo === 'condizione' && m.durata.tipo !== 'curata') {
    const es = el.find(x => x.tipo === 'condizione' && x.nome === nome && x.durata.tipo !== 'curata' && (x.perc || 0) === (m.perc || 0) && (x.n || 0) === (m.n || 0));
    if (es) {
      if (PESO_DURATA(m.durata) > PESO_DURATA(es.durata)) { es.durata = m.durata; es.scadenza = m.scadenza; es.causa = m.causa; log(c, `${chiNome}: ${nome} rinnovato (${descriviDurata(c, es)})`); }
      else log(c, `${chiNome}: ${nome} già presente, resta la durata più lunga`);
      return es;
    }
  }
  el.push(m);
  log(c, `${chiNome}: ${tipo === 'bonus' ? 'bonus' : 'malus'} ${nomeEsteso(m)}` + (m.etichetta ? ` [${m.etichetta}]` : '') + (descriviDurata(c, m) ? ` (${descriviDurata(c, m)})` : ''));
  if (chi.pg) { const p = trova(c, chi.pg), mx = massimi(c, p); // massimi ridotti: i valori correnti non li superano
    p.stato.fatica = Math.min(p.stato.fatica, mx.fatica); p.stato.ferita = Math.min(p.stato.ferita, mx.ferita); }
  if (m.vel && m.vel.primo && m.per.prossimo <= c.tempo.R) dovuto(c, creaturaDi(c, chi), m, rng);
  return m;
}
function aggiungiMalus(camp, chi, dati, rng) { const c = clona(camp); nuovoMalus(c, chi, dati, rng); return c; }
function nomeEsteso(m) { return m.nome + (m.perc ? ` ${m.perc}%` : '') + (m.n ? ` ${m.n}` : ''); }
function descriviDurata(c, m) {
  const d = m.durata;
  if (d.tipo === 'round') return `${Math.max(0, d.fine - c.tempo.R)} r`;
  if (d.tipo === 'tempo') return formatoDurata(Math.max(0, d.fine - c.tempo.R));
  return { incontro: 'fino a fine incontro', permanente: 'permanente', curata: 'finché curata', libera: '' }[d.tipo];
}
// rimuove m e quello che è legato a m (condizioni «finché la ferita… non viene curata»)
function togliDaElenco(c, el, m, testo) {
  const i = el.indexOf(m); if (i < 0) return;
  el.splice(i, 1);
  if (testo) log(c, testo);
  for (const x of el.filter(x => x.durata.tipo === 'curata' && x.durata.legata === m.id)) togliDaElenco(c, el, x, null);
  c.coda = c.coda.filter(q => q.malus !== m.id || q.tipo === 'morte');
}
function togliMalus(camp, chi, id) {
  const c = clona(camp), { x, m } = trovaMalus(c, chi, id);
  togliDaElenco(c, x.elenco, m, `${x.nome}: tolto ${nomeEsteso(m)}`); return c;
}
function scadeMalus(c, x, m) {
  togliDaElenco(c, x.elenco, m, `${x.nome}: scade ${nomeEsteso(m)}`);
  if (m.dopoMorto && x.p) { nuovoMalus(c, x.chi, { tipo: 'condizione', nome: 'Morto', durata: { tipo: 'permanente' } }); }
}
function guarisci(c, x, m, come) { togliDaElenco(c, x.elenco, m, `${x.nome}: ${nomeEsteso(m)} ${come}`); }
// Il tempo che passa: scadenze, guarigioni, emorragie, promemoria. daTurno = avanzamento di 1 round dal cambio di round
// del combattimento (le cose «in turno» le gestiscono inizioTurno e fineTurno).
function tempoMalus(c, prec, t, rng, daTurno) {
  for (const x of tutti(c)) {
    for (const m of x.elenco.slice()) {
      if (!x.elenco.includes(m)) continue;
      const fermo = !!(x.p && x.p.stato.morte); // morte in sospeso: niente altri tiri né promemoria, le durate scadono
      const turni = daTurno && inTurno(c, x.chi, m);
      if (!fermo && m.tipo === 'emorragia_lieve' && m.morte_R != null && m.morte_R <= t) { muore(c, x, 'emorragia lieve'); continue; }
      if (!fermo && (m.tipo === 'emorragia_grave' || m.tipo === 'panico') && !turni) {
        let morto = false;
        for (let k = Math.max(prec, m.R); k < t && !morto; k++) morto = tiroCumulativo(c, x, m, rng);
        if (morto) continue;
      }
      if (m.cer && m.cer.guarisce != null && m.cer.guarisce <= t) { guarisci(c, x, m, 'è guarita (Professione (cerusico))'); continue; }
      if ((m.durata.tipo === 'tempo' || (m.durata.tipo === 'round' && !turni)) && m.durata.fine <= t) { scadeMalus(c, x, m); continue; }
      if (!fermo && m.per && !m.per.attesa && !(m.per.unita === 'round' && turni) && m.per.prossimo <= t) dovuto(c, x, m, rng);
    }
  }
}
// inizio del turno di una riga: scadono i malus in round che la hanno come riferimento; promemoria dei TS a ogni round
function inizioTurno(c, rigaId, rng) {
  const avv = [];
  for (const x of tutti(c)) for (const m of x.elenco.slice()) {
    if (!x.elenco.includes(m) || ancora(c, x.chi, m) !== rigaId) continue;
    const fermo = !!(x.p && x.p.stato.morte);
    const proprio = x.chi.riga === rigaId || (x.p && rigaDiPG(c.combattimento, x.p.id) === rigaId);
    if (m.durata.tipo === 'round' && c.tempo.R >= m.durata.fine) { scadeMalus(c, x, m); avv.push(`${nomeEsteso(m)} scade ora` + (proprio ? '' : ` (${x.nome})`)); continue; }
    if (!fermo && m.per && m.per.unita === 'round' && !m.per.attesa && c.tempo.R >= m.per.prossimo) dovuto(c, x, m, rng);
  }
  return avv;
}
// fine del turno: emorragie gravi e attacchi di panico della creatura che ha agito
function fineTurno(c, rigaId, rng) {
  for (const x of tutti(c)) for (const m of x.elenco.slice()) {
    if (!['emorragia_grave', 'panico'].includes(m.tipo) || !x.elenco.includes(m) || ancora(c, x.chi, m) !== rigaId) continue;
    if (x.p && x.p.stato.morte) continue;
    tiroCumulativo(c, x, m, rng);
  }
}
// 5% cumulabile: il primo tiro a 5, poi 10, 15…; d100 uguale o sotto = morte
function tiroCumulativo(c, x, m, rng) {
  m.p += m.passo || 5; m.tiri = (m.tiri || 0) + 1;
  const tiro = d(100, rng), causa = m.tipo === 'panico' ? 'arresto cardiaco (attacco di panico)' : 'emorragia grave';
  log(c, `${x.nome}: ${m.nome}, d% ${tiro} (muore con ${m.p} o meno)`);
  if (tiro <= m.p) { muore(c, x, `${causa}, d% ${tiro} su ${m.p}%`); return true; }
  return false;
}
// I3: la morte apre un avviso con il 20% del Morente; l'app non decide da sola
function muore(c, x, causa) {
  if (x.p) { if (x.p.stato.morte) return; x.p.stato.morte = { R: c.tempo.R, causa }; }
  log(c, `${x.nome} muore: ${causa}`);
  c.coda.push({ id: prossimoId(c, 'q'), R: c.tempo.R, tipo: 'morte', chi: x.chi, testo: `${x.nome} muore: ${causa}. Creatura vivente in combattimento: 20% di restare morente per 1 minuto (Vol. 1).` });
}
function risolviMorte(camp, qid, scelta, rng) {
  const c = clona(camp), i = c.coda.findIndex(q => q.id === qid);
  if (i < 0 || c.coda[i].tipo !== 'morte') throw new Error('avviso non trovato');
  const q = c.coda[i], x = creaturaDi(c, q.chi); c.coda.splice(i, 1);
  if (!x) return { camp: c };
  let esito = scelta, tiro = null;
  if (scelta === 'morente') { tiro = d(100, rng); esito = tiro <= 20 ? 'morente' : 'morto'; log(c, `${x.nome}: 20% del Morente, d% ${tiro} → ${esito === 'morente' ? 'resta morente per 1 minuto' : 'muore'}`); }
  if (esito === 'morente') nuovoMalus(c, x.chi, { tipo: 'condizione', nome: 'Morente', durata: { n: 1, unita: 'minuti' }, dopoMorto: true });
  else if (esito === 'morto') { nuovoMalus(c, x.chi, { tipo: 'condizione', nome: 'Morto', durata: { tipo: 'permanente' } });
    const r = x.r || (c.combattimento && x.p && c.combattimento.righe[rigaDiPG(c.combattimento, x.p.id)]); // nell'iniziativa: fuori combattimento
    if (r) { r.stato = 'fuori'; saltaFuori(c.combattimento); } }
  else if (scelta === 'ignora') { if (x.p) delete x.p.stato.morte; log(c, `${x.nome}: la morte è annullata dal GM`); }
  else throw new Error('scelta non valida');
  return { camp: c, esito, tiro };
}

// ------------------------------------------------------------------ TS periodici, veleni e malattie (H)
// Applicare un veleno vale come TS iniziale fallito: il primo effetto arriva subito (o alla fine dell'insorgenza)
// senza TS; poi a ogni scadenza della frequenza si tira il TS, N volte. La cura = N TS consecutivi superati.
function impostaVeleno(c, chi, m, v) {
  const fr = v.frequenza || {}, k = UNITA_ROUND[fr.unita];
  if (!k) throw new Error('frequenza non valida');
  if (!Number.isInteger(v.cd)) throw new Error('CD del TS mancante');
  if (fr.volte !== null && fr.volte !== undefined && !(Number.isInteger(fr.volte) && fr.volte > 0)) throw new Error('numero di volte non valido');
  if (!(Number.isInteger(v.cura) && v.cura > 0)) throw new Error('cura: numero di TS consecutivi non valido');
  m.per = { kind: 'veleno', ts: v.ts || 'Tempra', cd: v.cd, unita: fr.unita, ogni: k, finisce: true, attesa: false };
  const ins = v.insorgenza && v.insorgenza.n ? v.insorgenza : null;
  m.per.prossimo = !ins ? c.tempo.R : ins.unita === 'round' ? fineRound(c, chi, m, ins.n) : c.tempo.R + ins.n * UNITA_ROUND[ins.unita];
  m.vel = { forma: v.forma || '', effetto: String(v.effetto || '').trim(), volte: fr.volte || null, restanti: fr.volte || null, cura: v.cura, successi: 0, totale: 0, primo: true,
    insorgenza: ins };
  m.durata = { tipo: 'libera' };
}
// "1d2 For" → tira 1d2, etichetta "For"; senza dadi resta solo il testo
function tiraEffetto(testo, rng) {
  const t = String(testo || '').trim(), x = t.match(/^(\d*d\d+(?:[+-]\d+)?|\d+)\s*(.*)$/i);
  if (!x) return { valore: null, testo: t || 'effetto' };
  const r = tira(x[1], rng); return { valore: r.totale, testo: `${r.totale} ${x[2]}`.trim(), espr: x[1], resto: x[2] };
}
function prossimaScadenza(c, x, m, da) { m.per.ultimo = da; m.per.prossimo = da + m.per.ogni; }
// una scadenza arrivata: primo effetto del veleno (automatico) oppure promemoria del TS in coda
function dovuto(c, x, m, rng) {
  const quando = Math.min(m.per.prossimo, c.tempo.R);
  if (m.vel && m.vel.primo) {
    m.vel.primo = false;
    const e = effettoVeleno(c, x, m, rng);
    c.coda.push({ id: prossimoId(c, 'q'), R: c.tempo.R, tipo: 'avviso', chi: x.chi, malus: m.id, testo: `${x.nome}: ${m.nome}, primo effetto ${e}.` });
    prossimaScadenza(c, x, m, inTurno(c, x.chi, m) && m.per.unita === 'round' ? c.tempo.R : m.per.prossimo);
    if (!(m.per.unita === 'round' && inTurno(c, x.chi, m)) && m.per.prossimo <= c.tempo.R) dovuto(c, x, m, rng);
    return;
  }
  m.per.attesa = true; m.per.ultimo = quando;
  const v = m.vel;
  c.coda.push({ id: prossimoId(c, 'q'), R: c.tempo.R, tipo: m.per.kind, chi: x.chi, malus: m.id,
    testo: `${x.nome}: ${m.nome}, tira ${m.per.ts} CD ${m.per.cd}` + (v ? ` — successi consecutivi ${v.successi}/${v.cura}` + (v.volte ? `, scadenza ${v.volte - v.restanti + 1}/${v.volte}` : '') : '') + '.' });
}
function effettoVeleno(c, x, m, rng) {
  const e = tiraEffetto(m.vel.effetto, rng);
  if (e.valore !== null) m.vel.totale += e.valore;
  log(c, `${x.nome}: ${m.nome}, effetto ${e.testo}` + (e.valore !== null && m.vel.totale !== e.valore ? ` (totale ${m.vel.totale}${e.resto ? ' ' + e.resto : ''})` : ''));
  return e.testo;
}
// risposta a un promemoria di TS (periodico o di veleno/malattia)
function esitoPromemoria(camp, qid, superato, rng) {
  const c = clona(camp), i = c.coda.findIndex(q => q.id === qid);
  if (i < 0 || !['ts', 'veleno'].includes(c.coda[i].tipo)) throw new Error('promemoria non trovato');
  const q = c.coda[i]; c.coda.splice(i, 1);
  const x = creaturaDi(c, q.chi), m = x && x.elenco.find(y => y.id === q.malus);
  if (!m) return c;
  m.per.attesa = false;
  const da = m.per.ultimo !== undefined ? m.per.ultimo : c.tempo.R;
  if (m.per.kind === 'ts') {
    log(c, `${x.nome}: ${m.nome}, ${m.per.ts} CD ${m.per.cd} ${superato ? 'superato' : 'fallito'}`);
    if (superato && m.per.finisce) { togliDaElenco(c, x.elenco, m, `${x.nome}: ${nomeEsteso(m)} finisce (TS superato)`); return c; }
  } else {
    const v = m.vel;
    if (superato) { v.successi++; log(c, `${x.nome}: ${m.nome}, ${m.per.ts} CD ${m.per.cd} superato (${v.successi}/${v.cura} consecutivi)`); }
    else { v.successi = 0; log(c, `${x.nome}: ${m.nome}, ${m.per.ts} CD ${m.per.cd} fallito`); effettoVeleno(c, x, m, rng); }
    if (v.successi >= v.cura) { togliDaElenco(c, x.elenco, m, `${x.nome}: ${m.nome} curato (${v.cura} TS consecutivi)`); return c; }
    if (v.restanti !== null) { v.restanti--; if (v.restanti <= 0) { togliDaElenco(c, x.elenco, m, `${x.nome}: ${m.nome} finisce (frequenza esaurita)`); return c; } }
  }
  prossimaScadenza(c, x, m, da);
  if (!(m.per.unita === 'round' && inTurno(c, x.chi, m)) && m.per.prossimo <= c.tempo.R) dovuto(c, x, m, rng);
  return c;
}
// H4: dose aggiuntiva = CD +2 e durata +50% (della frequenza di base, per eccesso)
function doseAggiuntiva(camp, chi, id) {
  const c = clona(camp), { x, m } = trovaMalus(c, chi, id);
  if (!m.vel) throw new Error('solo veleni e malattie');
  m.per.cd += 2;
  let piu = 0;
  if (m.vel.volte) { m.vel.base = m.vel.base || m.vel.volte; piu = Math.ceil(m.vel.base / 2); m.vel.volte += piu; m.vel.restanti += piu; }
  for (const q of c.coda) if (q.malus === m.id && q.tipo === 'veleno') q.testo = q.testo.replace(/CD \d+/, `CD ${m.per.cd}`);
  log(c, `${x.nome}: ${m.nome}, dose aggiuntiva — CD ${m.per.cd}` + (piu ? `, ${piu} scadenze in più` : ''));
  return c;
}
function togliDallaCodaId(camp, qid) {
  const c = clona(camp), i = c.coda.findIndex(q => q.id === qid);
  if (i < 0) throw new Error('avviso non trovato');
  if (['ts', 'veleno'].includes(c.coda[i].tipo)) throw new Error('rispondi Superato o Fallito');
  if (c.coda[i].tipo === 'morte') throw new Error('scegli cosa succede');
  if (c.coda[i].tipo === 'razionamento') throw new Error('prima scegli chi usa la scorta');
  c.coda.splice(i, 1); return c;
}

// ------------------------------------------------------------------ valori del riquadro con malus e bonus (G2, G3)
function divisoreOrgano(p) { const n = p.stato.malus.filter(m => m.tipo === 'organo').length; return n >= 2 ? 3 : n === 1 ? 2 : 1; }
function massimi(c, p) { const v = valoriPG(c, p); return { fatica: v.fatica_max.valore, ferita: v.ferita_max.valore }; }
// amputazioni attive: dita (3 su una mano o un piede = persa), un lato o entrambi (I1, tabella del Vol. 3)
function amputazioniAttive(p) {
  const voci = p.stato.malus.filter(m => m.tipo === 'amputazione').map(m => ({ amp: m.amp, lato: m.amp.lato || '' }));
  const dita = {};
  for (const m of p.stato.malus.filter(m => m.tipo === 'dita')) { const k = m.dita.parte + '|' + (m.dita.lato || m.id); (dita[k] = dita[k] || { n: 0, m }).n += m.dita.n; }
  for (const v of Object.values(dita)) if (v.n >= (v.m.amp.dita_perse || 3)) voci.push({ amp: v.m.amp, lato: v.m.dita.lato || '' });
  const gruppi = {};
  for (const v of voci) { const g = gruppi[v.amp.gruppo] = gruppi[v.amp.gruppo] || {}; const k = v.lato || 'x' + Object.keys(g).length;
    if (!g[k] || v.amp.grado > g[k].amp.grado) g[k] = v; }
  const out = [];
  for (const g of Object.values(gruppi)) {
    const lati = Object.values(g);
    const peggiore = lati.reduce((a, b) => b.amp.grado > a.amp.grado ? b : a);
    if (g.sinistro && g.destro && peggiore.amp.entrambi) out.push({ nome: `${peggiore.amp.nome_entrambi || peggiore.amp.nome}: entrambi`, ...peggiore.amp.entrambi });
    else out.push({ nome: peggiore.amp.nome + (peggiore.lato ? ' ' + peggiore.lato : ''), ...peggiore.amp.singolo });
  }
  return out;
}
// valori mostrati nel riquadro: Fame/Sete (Build 1), condizioni (G2), modificatori dei malus e dei bonus, amputazioni
function valoriPG(camp, p) {
  const s = p.scheda, st = p.stato, mal = [], note = [];
  const tot = { nomi: {} }; for (const k of CHIAVI_MOD) tot[k] = 0;
  const somma = mo => { if (!mo) return;
    for (const k of CHIAVI_MOD) if (mo[k]) tot[k] += mo[k];
    if (mo.fatica_max_liv) tot.fatica_max += mo.fatica_max_liv * s.livello;
    if (mo.ferita_max_liv) tot.ferita_max += mo.ferita_max_liv * s.livello;
    for (const [n, v] of Object.entries(mo.abilita_nome || {})) tot.nomi[n] = (tot.nomi[n] || 0) + v; };
  const fame = st.fame ? st.fame.penalita : 0, sete = st.sete ? st.sete.penalita : 0;
  if (sete) { mal.push({ nome: `Sete ${sete}`, ts: -sete, abilita: -sete }); somma({ ts: -sete, abilita: -sete }); }
  if (fame) { mal.push({ nome: `Fame ${fame}`, ts: -fame, abilita: -fame }); somma({ ts: -fame, abilita: -fame }); }
  const nl = statoNonLetali(p); if (nl) mal.push({ nome: nl, condizione: true });
  const cond = new Set(nl ? [nl] : []); let paura = 0, offuscato = 0, sprovvista = false;
  for (const m of st.malus || []) {
    if (m.tipo === 'condizione') {
      cond.add(m.nome);
      if (m.nome === 'Offuscato') offuscato = Math.max(offuscato, m.perc || 0);
      if (m.nome === 'Livelli negativi') somma({ ts: -m.n, abilita: -m.n, dmc: -m.n, fatica_max: -5 * m.n });
    }
    somma(m.mods);
    if (m.mods && m.mods.altro) note.push(`${m.nome}: ${m.mods.altro}`);
  }
  for (const a of amputazioniAttive(p)) {
    somma(a.mods); note.push(`${a.nome}: ${a.testo}`);
    for (const k of (a.mods && a.mods.condizioni) || []) { if (k === 'Colto alla sprovvista') sprovvista = true; else if (k === 'Offuscato 50%') offuscato = Math.max(offuscato, 50); else cond.add(k); }
  }
  for (const n of cond) {
    const e = EFFETTI_COND[n]; if (!e) continue;
    if (PAURA.includes(n)) { paura = Math.min(paura, e.ts || 0); continue; } // la paura non si somma con sé stessa
    if (e.sprovvista) sprovvista = true;
    if (e.nota) note.push(`${n}: ${e.nota}`);
    somma(e);
  }
  if (paura) somma({ ts: paura, abilita: paura });
  const v = (base, mod) => ({ base, valore: base + mod, mod });
  const abil = (nome, base) => v(base, tot.abilita + Object.entries(tot.nomi).filter(([k]) => nome.toLowerCase().startsWith(k.toLowerCase())).reduce((a, [, x]) => a + x, 0));
  const caMostrata = sprovvista ? s.ca_sprovvista : s.ca;
  return {
    tempra: v(s.tempra, tot.ts + tot.tempra), riflessi: v(s.riflessi, tot.ts + tot.riflessi), volonta: v(s.volonta, tot.ts + tot.volonta),
    percezione: abil('Percezione', s.percezione), intuizione: abil('Intuizione', s.intuizione), furtivita: abil('Furtività', s.furtivita),
    libere: s.abilita_libere.filter(a => a.nome).map(a => ({ nome: a.nome, ...abil(a.nome, a.valore) })),
    ca: v(s.ca, caMostrata - s.ca + tot.ca), ca_contatto: v(s.ca_contatto, tot.ca), ca_sprovvista: v(s.ca_sprovvista, tot.ca), dmc: v(s.dmc, tot.dmc),
    iniziativa: v(s.iniziativa, tot.iniziativa), fatica_max: v(s.fatica_max, Math.max(-s.fatica_max, tot.fatica_max)), ferita_max: v(s.ferita_max, Math.max(-s.ferita_max, tot.ferita_max)),
    temp: totTemp(st), malus: mal, condizioni: [...cond], offuscato, sprovvista, note,
  };
}

// ------------------------------------------------------------------ ferite gravi ed emorragie (I)
// I1: il risultato di una Ferita grave (scritto o incollato) diventa una lista di componenti da attaccare al PG.
const COND_FERITE = [['Prono', 'pron[oa]'], ['Infermo', 'inferm[oa]'], ['Nauseato', 'nauseat[oa]'], ['Barcollante', 'barcollant[ei]'], ['Frastornato', 'frastornat[oa]'],
  ['Stordito', 'stordit[oa]'], ['Azzoppato', 'azzoppat[oa]'], ['Offuscato', 'offuscat[oa]'], ['Privo di Sensi', 'priv[oa] di sensi'], ['Confuso', 'confus[oa]'],
  ['Scosso', 'scoss[oa]'], ['Spaventato', 'spaventat[oa]'], ['Affaticato', 'affaticat[oa]'], ['Esausto', 'esaust[oa]'], ['Accecato', 'accecat[oa]'],
  ['Assordato', 'assordat[oa]'], ['Abbagliato', 'abbagliat[oa]'], ['Affascinato', 'affascinat[oa]'], ['Paralizzato', 'paralizzat[oa]'], ['Intralciato', 'intralciat[oa]']];
const UNITA_TESTO = u => /^round/.test(u) ? 'round' : /^minut/.test(u) ? 'minuti' : /^or/.test(u) ? 'ore' : 'giorni';
function normalizza(t) { return String(t || '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').replace(/\.(?=[A-ZÀ-Ú])/g, '. ').trim(); }
function frasi(t) { const out = []; const re = /[^.]+(?:\.(?!\d)|$)/g; let m; while ((m = re.exec(t))) out.push({ i: m.index, f: m[0] }); return out; }
// durata scritta dopo una condizione: «per 2 round», «per 1d3+1 minuti», «finché la ferita di gravità 2 (20 PF)…», «in quello seguente»
function durataNelTesto(coda, rng) {
  let x = coda.match(/^\s*(?:\(?(\d+)%\)?)?[^.]*?\bper (\d+d\d+(?:[+-]\d+)?|\d+) (round|minut[oi]|or[ae]|giorn[oi])\b/);
  const f = coda.match(/finché (?:la ferita di gravità (\d) \((\d+) PF\)|l'emorragia lieve \((\d+) PF\)) non viene curata/);
  if (f && (!x || f.index < x.index)) return { legata: f[1] ? 'f' + f[1] : 'el' };
  if (x) { const r = /d/.test(x[2]) ? tira(x[2], rng) : null; return { n: r ? r.totale : +x[2], unita: UNITA_TESTO(x[3]), tiro: r ? `${x[2]} = ${r.totale}` : null }; }
  if (/^\s*in quello seguente/.test(coda)) return { n: 2, unita: 'round', seguente: true };
  if (/per sempre|in modo permanente/.test(coda)) return { tipo: 'permanente' };
  return { tipo: 'libera' };
}
const percDi = coda => { const x = coda.match(/^\s*\(?(\d+)%\)?/); return x ? +x[1] : null; };
// sotto-tiro scritto nel testo: «(1d4 = 1-2: sinistro, 3-4: destro)» → valore scelto
// tutti i «(1d8 = 1-4: slot corpo (armatura), 5-6: slot torso, …)» del testo, con le parentesi annidate
function sottoTiri(testo) {
  const out = [], re = /\((\d*d\d+) = /g; let m;
  while ((m = re.exec(testo))) {
    let i = m.index + m[0].length, prof = 1, j = i;
    for (; j < testo.length && prof; j++) { if (testo[j] === '(') prof++; else if (testo[j] === ')') prof--; }
    out.push({ dado: m[1], corpo: testo.slice(i, j - 1), i: m.index });
  }
  return out;
}
function tiraSottoTiro(st, rng) {
  const r = tira(st.dado, rng).totale, voci = st.corpo.split(/,\s*(?=\d)/).map(v => v.match(/^(\d+)(?:-(\d+))?: ?(.*)$/)).filter(Boolean);
  const v = voci.find(v => r >= +v[1] && r <= +(v[2] || v[1]));
  return v ? { valore: v[3].trim(), tiro: `${st.dado} = ${r}`, opzioni: voci.map(v => v[3].trim()) } : null;
}
function sottoTiro(testo, rng) { const st = sottoTiri(testo)[0]; return st ? tiraSottoTiro(st, rng) : null; }
const latoDi = s => /sinistr/.test(s) ? 'sinistro' : /destr/.test(s) ? 'destro' : '';
function scomponiFerita(testo, rng) {
  const t = normalizza(testo), out = [], usate = new Set();
  if (!t) return out;
  const fr = frasi(t);
  const fraseDi = i => fr.find(f => i >= f.i && i < f.i + f.f.length) || { i: 0, f: t };
  // condizioni
  const trovate = [];
  for (const [nome, re] of COND_FERITE) {
    const r = new RegExp(`\\b${re}\\b`, 'gi'); let m;
    while ((m = r.exec(t))) { if (/già\s*$/i.test(t.slice(Math.max(0, m.index - 6), m.index))) continue; trovate.push({ nome, i: m.index, fine: m.index + m[0].length }); }
  }
  trovate.sort((a, b) => a.i - b.i);
  trovate.forEach((c, j) => {
    const f = fraseDi(c.i), limite = Math.min(f.i + f.f.length, j + 1 < trovate.length ? trovate[j + 1].i : Infinity);
    const coda = t.slice(c.fine, limite), dd = durataNelTesto(coda, rng);
    out.push({ k: 'condizione', nome: c.nome, perc: c.nome === 'Offuscato' ? percDi(coda) : null, durata: dd });
  });
  // arto inutilizzabile
  { const r = /\b(il braccio|la gamba)\b[^.]*?\binutilizzabile\b/gi; let m;
    while ((m = r.exec(t))) { const f = fraseDi(m.index); out.push({ k: 'altro', nome: (m[1].toLowerCase() === 'il braccio' ? 'Braccio' : 'Gamba') + ' inutilizzabile', durata: durataNelTesto(t.slice(m.index + m[0].length, f.i + f.f.length), rng) }); } }
  // ferite di gravità N
  { const r = /ferita di gravità (\d) \((\d+) PF\)/g; let m; const viste = new Set();
    while ((m = r.exec(t))) if (!viste.has(m[1])) { viste.add(m[1]); out.push({ k: 'ferita', key: 'f' + m[1], gravita: +m[1], pf: +m[2] }); } }
  // emorragie
  { const m = t.match(/Morirai per emorragia lieve \((\d+) PF\) entro (\d+d\d+(?:[+-]\d+)?|\d+) (minut[oi]|round)/i);
    const l = t.match(/emorragia lieve \((\d+) PF\) non viene curata/i);
    if (m) { const r = tira(m[2], rng), un = UNITA_TESTO(m[3]); out.push({ k: 'emorragia_lieve', key: 'el', pf: +m[1], timer: { n: r.totale, unita: un, tiro: `${m[2]} = ${r.totale}` } }); }
    else if (l) out.push({ k: 'emorragia_lieve', key: 'el', pf: +l[1], timer: null }); }
  { const m = t.match(/(\d+)% cumulabile di probabilità di morire per emorragia grave \((\d+) PF\)/i);
    if (m) out.push({ k: 'emorragia_grave', passo: +m[1], pf: +m[2] }); }
  { const m = t.match(/attacco di panico[^]*?(\d+)% cumulabile[^]*?arresto cardiaco/i);
    if (m) out.push({ k: 'panico', passo: +m[1], azioni: /due azioni di round completo/i.test(t) ? 2 : 1 }); }
  // penalità permanenti
  { const m = t.match(/penalità permanente \(tira 1d3: ([^)]*)\)/i);
    if (m) { const st = sottoTiro(`(1d3 = ${m[1]})`, rng), v = st.valore, n = +(v.match(/-(\d+)/) || [0, 0])[1];
      const mods = /Riflessi/.test(v) ? { riflessi: -n } : /Tempra/.test(v) ? { tempra: -n } : /Volontà/.test(v) ? { volonta: -n } : /Iniziativa/.test(v) ? { iniziativa: -n } : {};
      out.push({ k: 'penalita', nome: `Penalità permanente: ${v}`, mods, tiro: st.tiro }); } }
  { const m = t.match(/punteggio mentale è ridotto di (\d+d\d+(?:[+-]\d+)?|\d+) punt[oi] in modo permanente \(tira 1d3: ([^)]*)\)/i);
    if (m) { const q = /d/.test(m[1]) ? tira(m[1], rng) : null, n = q ? q.totale : +m[1], st = sottoTiro(`(1d3 = ${m[2]})`, rng);
      out.push({ k: 'penalita', nome: `${st.valore} −${n} permanente`, mods: { altro: `${st.valore} −${n} (punteggio)` }, tiro: [q ? `${m[1]} = ${n}` : '', st.tiro].filter(Boolean).join(', ') }); } }
  { const m = t.match(/Punti Ferita che i tuoi Punti Fatica sono ridotti in modo permanente di (\d+) punt[oi] per livello/i);
    if (m) out.push({ k: 'penalita', nome: `Punti Fatica e Ferita max −${m[1]} per livello`, mods: { fatica_max_liv: -m[1], ferita_max_liv: -m[1] } }); }
  if (/Un organo interno è compromesso/i.test(t)) out.push({ k: 'organo' });
  // amputazioni e dita
  const lato = (i) => { const f = fraseDi(i).f, st = /\(1d4 = 1-2: (sinistr[oa]), 3-4: (destr[oa])\)/.test(f) ? sottoTiro(f.match(/\(1d4 = 1-2: sinistr[oa], 3-4: destr[oa]\)/)[0], rng) : null;
    return st ? { lato: latoDi(st.valore), tiro: st.tiro } : { lato: '', tiro: null }; };
  { const casi = [['mano', /stacca di netto la mano|la mano e l'attacco te la stacca di netto/i], ['braccio', /stacca il braccio/i], ['piede', /stacca di netto il piede/i],
      ['gamba', /la gamba all'altezza del ginocchio/i], ['occhio', /ti cava un occhio/i]];
    for (const [loc, re] of casi) { const m = t.match(re); if (m) out.push({ k: 'amputazione', loc, ...lato(m.index) }); }
    const v = t.match(/recide una parte del volto (\(1d4 = [^)]*\))/i);
    if (v) { const st = sottoTiro(v[1], rng), x = st.valore;
      out.push({ k: 'amputazione', loc: /orecchio/.test(x) ? 'orecchio' : /mento/.test(x) ? 'mento' : 'naso', lato: latoDi(x), tiro: st.tiro, parte: x }); }
    const r = /(?:stacca|) ?(\d+d\d+|\d+) dit[oa] (della mano|del piede)/gi; let m;
    while ((m = r.exec(t))) { const q = /d/.test(m[1]) ? tira(m[1], rng) : null; const l = lato(m.index);
      out.push({ k: 'dita', parte: /mano/.test(m[2]) ? 'mano' : 'piede', n: q ? q.totale : +m[1], lato: l.lato, tiro: [q ? `${m[1]} = ${q.totale}` : '', l.tiro].filter(Boolean).join(', ') || null }); } }
  if (/\bcoma\b/i.test(t)) out.push({ k: 'condizione', nome: 'Privo di Sensi', etichetta: 'Coma', durata: { tipo: 'permanente' }, nota: (t.match(/[^.]*\bcoma\b[^.]*\./i) || [''])[0].trim() });
  if (/arti inferiori sono paralizzati/i.test(t)) out.push({ k: 'altro', nome: 'Arti inferiori paralizzati', durata: { tipo: 'permanente' }, nota: 'Niente cariche, corse o ritirate, anche se torna a camminare.' });
  if (/\bSei morto\b/i.test(t)) out.push({ k: 'morte' });
  if (/ti posizioni ultimo nell'ordine di Iniziativa/i.test(t)) out.push({ k: 'ultimo' });
  // oggetto indossato: slot tirato (nota ¹ del Vol. 3) e 50% distrutto; gli altri oggetti restano come nota
  for (const f of fr) {
    if (/oggetto indossato/i.test(f.f)) {
      const st = sottoTiri(f.f).find(x => /slot|oggetto impugnato/.test(x.corpo)), sl = st ? tiraSottoTiro(st, rng) : null;
      let esito = /distrutto|si distrugge/.test(f.f) ? 'è distrutto' : /due volte/.test(f.f) ? 'si danneggia due volte' : 'si danneggia', d50 = null;
      if (/al 50% si distrugge/.test(f.f)) { d50 = d(100, rng); esito = d50 <= 50 ? 'è distrutto' : /altrimenti si danneggia due volte/.test(f.f) ? 'si danneggia due volte' : 'si danneggia'; }
      out.push({ k: 'oggetto', slot: sl ? sl.valore : '', tiro: [sl ? sl.tiro : '', d50 !== null ? `d% ${d50}` : ''].filter(Boolean).join(', '), esito, testo: f.f.trim() });
    } else if (/oggett[oi]|slot|recuperat[oi] da terra/i.test(f.f) && !/\bdit[oa]\b/.test(f.f)) out.push({ k: 'nota', testo: f.f.trim() });
  }
  return out;
}
function descriviComponente(cp) {
  const dur = dd => !dd ? '' : dd.legata ? (dd.legata === 'el' ? ' finché l\'emorragia lieve non viene curata' : ` finché la ferita di gravità ${dd.legata.slice(1)} non viene curata`)
    : dd.tipo === 'permanente' ? ' permanente' : dd.tipo === 'libera' ? '' : ` per ${dd.n} ${dd.unita}` + (dd.seguente ? ' (stordito e poi barcollante: barcollante per 2 round)' : '') + (dd.tiro ? ` (${dd.tiro})` : '');
  switch (cp.k) {
    case 'condizione': return `${cp.etichetta ? cp.etichetta + ': ' : ''}${cp.nome}${cp.perc ? ' ' + cp.perc + '%' : ''}${dur(cp.durata)}`;
    case 'altro': return `${cp.nome}${dur(cp.durata)}`;
    case 'ferita': return `Ferita di gravità ${cp.gravita}: contatore delle cure 0/${cp.pf} PF`;
    case 'emorragia_lieve': return `Emorragia lieve (${cp.pf} PF)` + (cp.timer ? `: morte tra ${cp.timer.n} ${cp.timer.unita} se non è fermata (${cp.timer.tiro})` : ', senza morte a tempo');
    case 'emorragia_grave': return `Emorragia grave (${cp.pf} PF): a fine turno ${cp.passo}% cumulabile di morire`;
    case 'panico': return `Attacco di panico: a fine turno ${cp.passo}% cumulabile di morire; finisce con ${cp.azioni === 2 ? 'due azioni di round completo consecutive' : 'un\'azione di round completo'}`;
    case 'penalita': return cp.nome + (cp.tiro ? ` (${cp.tiro})` : '');
    case 'organo': return 'Organo compromesso: Punti Fatica dal Rifiatare e dal riposo dimezzati (la seconda volta a un terzo)';
    case 'amputazione': return `Amputazione: ${cp.parte || cp.loc}${cp.lato && !cp.parte ? ' ' + cp.lato : ''}` + (cp.tiro ? ` (${cp.tiro})` : '');
    case 'dita': return `Dita perse: ${cp.n} (${cp.parte}${cp.lato ? ' ' + cp.lato : ''})` + (cp.tiro ? ` (${cp.tiro})` : '');
    case 'morte': return 'Morte (avviso con il 20% del Morente)';
    case 'ultimo': return 'Ultimo nell\'ordine di iniziativa (se ha già agito in questo round, non agisce di nuovo)';
    case 'oggetto': return `Oggetto ${cp.slot ? 'nello ' + cp.slot : 'indossato'}: ${cp.esito}` + (cp.tiro ? ` (${cp.tiro})` : '') + '; slot vuoto: l\'oggetto successivo della nota ¹';
    default: return 'Nota: ' + cp.testo;
  }
}
// attacca i componenti scelti al PG; FER = dati di ferite.json
function attaccaFerita(camp, pgId, comps, rng, FER, meta) {
  const c = clona(camp), chi = { pg: pgId }, p = trova(c, pgId), chiavi = {}, fonte = (meta && meta.titolo) || 'Ferita grave';
  log(c, `${p.scheda.nome}: ${fonte}` + (meta && meta.testo ? ` — ${normalizza(meta.testo)}` : ''));
  const base = { fonte };
  const ampDa = (loc, lato) => {
    const a = FER.amputazioni.find(x => x.id === loc); if (!a) throw new Error('locazione sconosciuta: ' + loc);
    const ent = a.entrambi || (FER.amputazioni.find(x => x.gruppo === a.gruppo && x.entrambi) || {}).entrambi || null;
    const nomeEnt = { superiori: 'Arti superiori', inferiori: 'Arti inferiori', orecchi: 'Orecchie', occhi: 'Occhi' }[a.gruppo] || a.nome;
    return { id: a.id, nome: a.nome, gruppo: a.gruppo, grado: a.grado, lato: lato || '', singolo: clona(a.singolo), entrambi: clona(ent), nome_entrambi: nomeEnt, dita_perse: FER.dita_perse };
  };
  for (const cp of comps.filter(x => x.k === 'ferita' || x.k === 'emorragia_lieve')) {
    const m = cp.k === 'ferita' ? nuovoMalus(c, chi, { ...base, tipo: 'ferita', nome: `Ferita gravità ${cp.gravita}`, gravita: cp.gravita, pf: cp.pf, durata: { tipo: 'libera' } }, rng)
      : nuovoMalus(c, chi, { ...base, tipo: 'emorragia_lieve', nome: 'Emorragia lieve', pf: cp.pf, durata: { tipo: 'libera' }, morteTra: cp.timer ? cp.timer.n * UNITA_ROUND[cp.timer.unita] : undefined }, rng);
    chiavi[cp.key] = m.id;
  }
  const durata = dd => dd && dd.legata ? (chiavi[dd.legata] ? { tipo: 'curata', legata: chiavi[dd.legata] } : { tipo: 'libera' }) : dd;
  for (const cp of comps) {
    switch (cp.k) {
      case 'condizione': nuovoMalus(c, chi, { ...base, tipo: 'condizione', nome: cp.nome, perc: cp.perc || undefined, etichetta: cp.etichetta, durata: durata(cp.durata) }, rng); if (cp.nota) log(c, `${p.scheda.nome}: ${cp.nota}`); break;
      case 'altro': nuovoMalus(c, chi, { ...base, tipo: 'altro', nome: cp.nome, durata: durata(cp.durata) }, rng); if (cp.nota) log(c, `${p.scheda.nome}: ${cp.nota}`); break;
      case 'emorragia_grave': nuovoMalus(c, chi, { ...base, tipo: 'emorragia_grave', nome: 'Emorragia grave', pf: cp.pf, passo: cp.passo, durata: { tipo: 'libera' } }, rng); break;
      case 'panico': nuovoMalus(c, chi, { ...base, tipo: 'panico', nome: 'Attacco di panico', passo: cp.passo, azioni: cp.azioni, durata: { tipo: 'libera' } }, rng); break;
      case 'penalita': nuovoMalus(c, chi, { ...base, tipo: 'penalita', nome: cp.nome, mods: cp.mods, durata: { tipo: 'permanente' } }, rng); break;
      case 'organo': nuovoMalus(c, chi, { ...base, tipo: 'organo', nome: 'Organo compromesso', durata: { tipo: 'permanente' } }, rng); break;
      case 'amputazione': { const a = ampDa(cp.loc, cp.lato); nuovoMalus(c, chi, { ...base, tipo: 'amputazione', nome: `Amputazione: ${(cp.parte || a.nome).replace(/^./, x => x.toUpperCase())}${cp.lato && !cp.parte ? ' ' + cp.lato : ''}`, amp: a, durata: { tipo: 'permanente' } }, rng); break; }
      case 'dita': nuovoMalus(c, chi, { ...base, tipo: 'dita', nome: `Dita perse: ${cp.n} (${cp.parte}${cp.lato ? ' ' + cp.lato : ''})`, dita: { parte: cp.parte, n: cp.n, lato: cp.lato || '' }, amp: ampDa(cp.parte, cp.lato), durata: { tipo: 'permanente' } }, rng); break;
      case 'morte': muore(c, creaturaDi(c, chi), fonte + ': «Sei morto»'); break;
      case 'nota': log(c, `${p.scheda.nome}: ${cp.testo}`); break;
      case 'oggetto': log(c, `${p.scheda.nome}: ${descriviComponente(cp)}`); break;
      case 'ultimo': mettiUltimo(c, pgId); break;
    }
  }
  return c;
}
// «ti posizioni ultimo nell'ordine di Iniziativa (non agisci nuovamente se hai già agito durante questo turno)»
function mettiUltimo(c, pgId) {
  const cb = c.combattimento, p = trova(c, pgId);
  if (!cb) { log(c, `${p.scheda.nome}: ultimo nell'ordine di iniziativa (vale al prossimo combattimento solo se il GM lo decide)`); return; }
  const id = rigaDiPG(cb, pgId), i = cb.ordine.indexOf(id); if (i < 0) return;
  const r = cb.righe[id], corrente = cb.ordine[cb.turno], giaAgito = i <= cb.turno;
  const altri = cb.ordine.filter(x => x !== id).map(x => cb.righe[x].totale);
  if (altri.length) r.totale = Math.min(r.totale, Math.min(...altri) - 1);
  cb.ordine.splice(i, 1); cb.ordine.push(id);
  if (giaAgito) r.salta = cb.round; // in questo round non agisce di nuovo
  if (corrente === id) { cb.turno = Math.max(0, i); if (cb.turno >= cb.ordine.length - 1) cb.turno = cb.ordine.length - 1; }
  else cb.turno = cb.ordine.indexOf(corrente);
  if (corrente === id) saltaFuori(cb);
  log(c, `${p.scheda.nome} passa ultimo nell'ordine di iniziativa (${r.totale})` + (giaAgito ? ', non agisce di nuovo in questo round' : ''));
}
// Ferite gravi (Q1–Q3, anticipate): la riga si sceglie dal valore dei Punti Ferita; per la tabella del tiro per colpire
// la locazione esce dal 1d8 (o la sceglie il GM). Restituisce il testo della riga e i componenti già scomposti.
function feritaDaTabella(FER, tab, riga, rng, locN) {
  const T = FER.ferite_gravi.find(x => x.id === tab); if (!T) throw new Error('tabella delle Ferite gravi sconosciuta');
  const r = String(Math.max(-15, Math.min(-1, Math.trunc(riga))));
  let righe = T.righe, loc = null, tiroLoc = null;
  if (T.locazioni) {
    if (!locN) { locN = d(8, rng); tiroLoc = `1d8 = ${locN}`; }
    loc = T.locazioni.find(l => locN >= l.da && locN <= l.a); if (!loc) throw new Error('locazione non valida');
    righe = T.righe_per_locazione[loc.righe];
  }
  const testo = righe[r], comps = scomponiFerita(testo, rng);
  if (loc && loc.lato) for (const k of comps) if ((k.k === 'amputazione' && !k.parte || k.k === 'dita') && !k.lato) k.lato = loc.lato;
  return { tabella: T.nome, riga: +r, locazione: loc ? loc.nome : null, locN, tiroLoc, testo,
    titolo: `Ferita grave ${r} · ${T.nome}` + (loc ? ` · ${loc.nome}` : ''), comps };
}
function rigaFermare(FER, m) { return FER.fermare.find(r => r.id === (m.tipo === 'ferita' ? 'gravita_' + m.gravita : m.tipo)); }
// cure magiche dirette alla ferita o all'emorragia (anche a più riprese): non toccano i PF
function curaDiretta(camp, chi, id, n) {
  if (!(Number.isInteger(n) && n > 0)) throw new Error('cura non valida');
  const c = clona(camp), { x, m } = trovaMalus(c, chi, id);
  if (m.pf === undefined) throw new Error('questo malus non si cura con i PF');
  m.cure += n; log(c, `${x.nome}: ${n} PF di cura diretti a ${m.nome} (${Math.min(m.cure, m.pf)}/${m.pf})`);
  if (m.cure >= m.pf) guarisci(c, x, m, 'è guarita (cure magiche)');
  return c;
}
// I2: prova di Professione (cerusico) con la tabella «Fermare le emorragie e curare le ferite gravi»
function cerusico(camp, chi, id, totale, senzaMedicinali, rng, FER) {
  if (!Number.isInteger(totale)) throw new Error('risultato della prova non valido');
  const c = clona(camp), { x, m } = trovaMalus(c, chi, id), riga = rigaFermare(FER, m);
  if (!riga) throw new Error('questo malus non si cura con Professione (cerusico)');
  if (m.cer.guarisce != null) throw new Error(`guarisce già: ${formatoData(c, m.cer.guarisce)}`);
  if (m.cer.prossimo != null && c.tempo.R < m.cer.prossimo) throw new Error(`si può ritentare da ${formatoData(c, m.cer.prossimo)}`);
  const cd = m.cer.cd !== null ? m.cer.cd : riga.cd, eff = totale + (senzaMedicinali ? FER.senza_medicinali : 0);
  m.cer.tentativi++;
  const med = senzaMedicinali ? `senza medicinali (${FER.senza_medicinali})` : `${riga.medicinali} unità di medicinali`;
  const riuscita = eff >= cd;
  if (riuscita) {
    if (!riga.guarigione) { guarisci(c, x, m, `fermata con Professione (cerusico) ${eff} su CD ${cd}, ${med}`); return { camp: c, riuscita, cd, totale: eff }; }
    m.cer.guarisce = c.tempo.R + riga.guarigione.n * ROUND_GIORNO;
    log(c, `${x.nome}: ${m.nome}, Professione (cerusico) ${eff} su CD ${cd} riuscita (${med}): guarisce il ${formatoData(c, m.cer.guarisce)}`);
  } else {
    const att = riga.ritentare.unita === 'round' ? tira(riga.ritentare.espr, rng).totale : +riga.ritentare.espr * ROUND_GIORNO;
    m.cer.prossimo = c.tempo.R + att; m.cer.cd = cd + riga.variazione_cd;
    log(c, `${x.nome}: ${m.nome}, Professione (cerusico) ${eff} su CD ${cd} fallita (${med}); si ritenta tra ${formatoDurata(att)} con CD ${m.cer.cd}`);
  }
  return { camp: c, riuscita, cd, totale: eff };
}
// attacco di panico: «Puoi mettere fine al panico spendendo un'azione (o due azioni consecutive) di round completo»
function spendiRoundCompleto(camp, chi, id) {
  const c = clona(camp), { x, m } = trovaMalus(c, chi, id);
  if (m.tipo !== 'panico') throw new Error('solo per l\'attacco di panico');
  const q = c.combattimento ? c.combattimento.round : c.tempo.R;
  if (m.spese.length && m.spese[m.spese.length - 1] === q) throw new Error('già spesa in questo round');
  m.spese.push(q);
  const ult = m.spese.slice(-m.azioni), consecutive = ult.length === m.azioni && ult.every((v, i) => i === 0 || v === ult[i - 1] + 1);
  if (consecutive) guarisci(c, x, m, `finisce (${m.azioni === 2 ? 'due azioni' : 'un\'azione'} di round completo)`);
  else log(c, `${x.nome}: ${m.nome}, azione di round completo ${ult.length}/${m.azioni}`);
  return c;
}
// G nel combattimento: le azioni sui malus si possono annullare con «Indietro»
function conStoria(prima, dopo) {
  if (dopo.combattimento && prima.combattimento) { dopo.combattimento.storia = prima.combattimento.storia.concat([istantanea(prima)]).slice(-200); }
  return dopo;
}
function dataBreve(c, R) { const t = scomponi(c, R); return `${t.giorno} ${c.calendario.mesi[t.mese].nome}`; }
// testo breve per le etichette (chip) del riquadro e delle righe
function descriviMalus(c, m) {
  let t = nomeEsteso(m);
  if (m.etichetta) t = `${m.etichetta}: ${t}`;
  const extra = [];
  if (m.pf !== undefined) extra.push(`${Math.min(m.cure, m.pf)}/${m.pf} PF`);
  if (m.morte_R != null) extra.push(`morte ${formatoData(c, m.morte_R).slice(-5)}`);
  if (m.cer && m.cer.guarisce != null) extra.push(`guarisce ${dataBreve(c, m.cer.guarisce)}`);
  if (m.tipo === 'emorragia_grave' || m.tipo === 'panico') extra.push(`${m.p}%`);
  if (m.vel) extra.push(`${m.per.ts} CD ${m.per.cd}` + (m.vel.volte ? ` · ${m.vel.volte - m.vel.restanti}/${m.vel.volte}` : '') + (m.vel.totale ? ` · tot. ${m.vel.totale}` : ''));
  else if (m.per) extra.push(`${m.per.ts} CD ${m.per.cd}`);
  const dd = descriviDurata(c, m); if (dd && m.durata.tipo !== 'permanente') extra.push(dd);
  return t + (extra.length ? ' · ' + extra.join(' · ') : '');
}

return { FORMATO, ROUND_MIN, ROUND_ORA, ROUND_GIORNO, SCHEDA_VUOTA, IMPOSTAZIONI, clona,
  d, valoreD20, tira, calendarioReale, lunghezzaAnno, controllaCalendario, dataDaGiornoAnno, giornoAnnoDaData, scomponi, tempoAssoluto,
  formatoData, formatoDurata, durataInRound, stagione, esitoMeteo, effettiMeteo, tiraMeteo, impostaMeteo, scegliOpzioneMeteo, cambiaZona,
  meteoCorrente, nomeZona, nomeStagione, creaCampagna, duplicaCampagna, esporta, importa, migra,
  aggiungiPG, modificaPG, rimuoviPG, controllaScheda, danno, dannoNonLetale, statoNonLetali, cura, pfTemporanei, rifiatare, puntoEroe, valoriPG,
  avanza, vaiA, riposo, consumoGiornaliero, bastanoPer, modificaScorta, impostaAccompagnatori, togliDallaCoda,
  risolviRazionamento, razionamentoAperto, puoRiposare,
  tiroIniziativa, avviaCombattimento, comando, indietro, fineCombattimento, attuale, etichetta, attivaTimer, timerLetture, mmss,
  UNITA_ROUND, EFFETTI_COND, aggiungiMalus, togliMalus, descriviMalus, descriviDurata, nomeEsteso, esitoPromemoria, doseAggiuntiva, togliDallaCodaId, risolviMorte,
  scomponiFerita, descriviComponente, attaccaFerita, feritaDaTabella, mettiUltimo, curaDiretta, cerusico, spendiRoundCompleto, rigaFermare, conStoria, massimi, divisoreOrgano, amputazioniAttive, tiraEffetto, normalizza };
})();
if (typeof module !== 'undefined') module.exports = Motore;
