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
    fame: { giorni_senza: 0, penalita: 0 }, sete: { giorni_senza: 0, penalita: 0 } } });
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
  const c = clona(camp), p = trova(c, id), st = p.stato, s = p.scheda;
  let r = n;
  const fe = Math.min(r, Math.max(0, s.ferita_max - st.ferita)); st.ferita += fe; r -= fe;
  const fa = Math.min(r, Math.max(0, s.fatica_max - st.fatica)); st.fatica += fa;
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
  const tot = dadi.reduce((a, b) => a + b, 0);
  const prima = st.fatica; st.fatica = Math.min(s.fatica_max, st.fatica + tot); st.rif_riserva -= n;
  log(c, `${s.nome}: Rifiatare ${n}d${s.rif_tipo} = ${tot} [${dadi.join(', ')}] — Fatica ${prima} → ${st.fatica}`);
  return { camp: c, dadi, totale: tot };
}
function puntoEroe(camp, id, valore) {
  const c = clona(camp), p = trova(c, id); p.stato.eroe = valore ? 1 : 0; return c;
}
// valori mostrati nel riquadro, con i modificatori della Build 1 (Fame N / Sete N: TS e abilità −N)
function valoriPG(camp, p) {
  const s = p.scheda, st = p.stato, mal = [];
  const fame = st.fame ? st.fame.penalita : 0, sete = st.sete ? st.sete.penalita : 0;
  if (sete) mal.push({ nome: `Sete ${sete}`, ts: -sete, abilita: -sete });
  if (fame) mal.push({ nome: `Fame ${fame}`, ts: -fame, abilita: -fame });
  const nl = statoNonLetali(p); if (nl) mal.push({ nome: nl, condizione: true });
  const ts = mal.reduce((a, m) => a + (m.ts || 0), 0), ab = mal.reduce((a, m) => a + (m.abilita || 0), 0);
  const v = (base, mod) => ({ base, valore: base + mod, mod });
  return {
    tempra: v(s.tempra, ts), riflessi: v(s.riflessi, ts), volonta: v(s.volonta, ts),
    percezione: v(s.percezione, ab), intuizione: v(s.intuizione, ab), furtivita: v(s.furtivita, ab),
    libere: s.abilita_libere.filter(a => a.nome).map(a => ({ nome: a.nome, ...v(a.valore, ab) })),
    ca: v(s.ca, 0), ca_contatto: v(s.ca_contatto, 0), ca_sprovvista: v(s.ca_sprovvista, 0), dmc: v(s.dmc, 0),
    iniziativa: v(s.iniziativa, 0), temp: totTemp(st), malus: mal,
  };
}

// ------------------------------------------------------------------ tempo
// Avanza l'orologio di `dR` round: scadenze dei PF temporanei, recupero dei non letali (1 all'ora),
// cambi di giorno (scorte e meteo). Gli avvisi che chiedono un'azione del GM vanno in camp.coda.
function avanza(camp, dR, meteo, rng, motivo) {
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
    const s = p.scheda, st = p.stato;
    st.fatica = s.fatica_max; st.ferita = Math.min(s.ferita_max, st.ferita + s.livello); st.rif_riserva = s.rif_dadi;
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
    attesa: [], inizioR: c.tempo.R, storia: [], timer: c.impostazioni.timer ? nuovoTimer(oraReale) : null };
  log(c, 'Inizio del combattimento: ' + righe.map(r => `${etichetta(r)} ${r.totale}`).join(', '));
  saltaFuori(c.combattimento);
  return c;
}
function righeDa(c, x, rng) {
  if (x.tipo === 'pg') {
    const p = trova(c, x.pgId), s = p.scheda, pen = x.impreparato ? s.imp_pen : 0;
    let totale, nat = null;
    if (x.d20 !== undefined && x.d20 !== null) { nat = x.d20; if (!(nat >= 1 && nat <= 20)) throw new Error('d20 non valido'); totale = tiroIniziativa(nat, s.iniziativa, pen); }
    else { if (!Number.isInteger(x.totale)) throw new Error(`${s.nome}: totale dell'iniziativa mancante`); totale = x.totale - pen; }
    return [{ id: prossimoId(c, 'r'), tipo: 'pg', pgId: p.id, nome: s.nome, bonus: s.iniziativa, nat, totale, n: 1, spareggio: d(20, rng), stato: 'attivo', prepara: null, nascosta: false, nomeTv: '' }];
  }
  const n = x.n || 1, pen = x.impreparato ? (x.imp_pen === undefined ? 6 : x.imp_pen) : 0, out = [];
  if (!String(x.nome || '').trim()) throw new Error('nemico senza nome');
  const riga = (nome, k) => { const nat = d(20, rng); return { id: prossimoId(c, 'r'), tipo: 'nemico', nome, bonus: x.bonus || 0, nat, totale: tiroIniziativa(nat, x.bonus || 0, pen), n: k, spareggio: d(20, rng), stato: 'attivo', prepara: null, nascosta: !!x.nascosto, nomeTv: x.nomeTv || '' }; };
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
  while (comb.ordine.length && attuale(comb) && attuale(comb).stato === 'fuori' && k++ < comb.ordine.length) comb.turno++;
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
    cb.turno++;
    saltaFuori(cb);
    if (cb.turno >= cb.ordine.length) { // giro completo = 1 round
      cb.turno = 0; cb.round++;
      c = avanza(c, 1, meteo, rng);
      saltaFuori(c.combattimento);
    }
    return c;
  },
  ritardare(c, a, meteo, rng, ora) { // esce dall'ordine ed è «in attesa» finché non entra
    const cb = c.combattimento, r = attuale(cb); if (!r) return c;
    timerFineTurno(cb, r, ora);
    cb.ordine.splice(cb.turno, 1); cb.attesa.push(r.id); r.stato = 'attesa';
    log(c, `${etichetta(r)} ritarda`);
    if (cb.turno >= cb.ordine.length) { cb.turno = 0; cb.round++; c = avanza(c, 1, meteo, rng); }
    saltaFuori(c.combattimento);
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

return { FORMATO, ROUND_MIN, ROUND_ORA, ROUND_GIORNO, SCHEDA_VUOTA, IMPOSTAZIONI, clona,
  d, valoreD20, tira, calendarioReale, lunghezzaAnno, controllaCalendario, dataDaGiornoAnno, giornoAnnoDaData, scomponi, tempoAssoluto,
  formatoData, formatoDurata, durataInRound, stagione, esitoMeteo, effettiMeteo, tiraMeteo, impostaMeteo, scegliOpzioneMeteo, cambiaZona,
  meteoCorrente, nomeZona, nomeStagione, creaCampagna, duplicaCampagna, esporta, importa, migra,
  aggiungiPG, modificaPG, rimuoviPG, controllaScheda, danno, dannoNonLetale, statoNonLetali, cura, pfTemporanei, rifiatare, puntoEroe, valoriPG,
  avanza, vaiA, riposo, consumoGiornaliero, bastanoPer, modificaScorta, impostaAccompagnatori, togliDallaCoda,
  risolviRazionamento, razionamentoAperto, puoRiposare,
  tiroIniziativa, avviaCombattimento, comando, indietro, fineCombattimento, attuale, etichetta, attivaTimer, timerLetture, mmss };
})();
if (typeof module !== 'undefined') module.exports = Motore;
