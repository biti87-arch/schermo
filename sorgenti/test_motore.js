// Test del motore: stampa solo gli errori e i conteggi. Uso: node sorgenti/test_motore.js
'use strict';
const M = require('./motore.js');
const meteo = require('./meteo.json');
let ok = 0, ko = 0;
function t(nome, cond, info) { if (cond) ok++; else { ko++; console.log('ERRORE', nome, info !== undefined ? JSON.stringify(info) : ''); } }
function lancia(nome, f, parola) { try { f(); ko++; console.log('ERRORE (nessuna eccezione)', nome); } catch (e) { if (!parola || e.message.includes(parola)) ok++; else { ko++; console.log('ERRORE', nome, e.message); } } }
function semi(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
// rng che fa uscire esattamente le facce indicate per dadi di n facce: [[facce, n], …] poi semi
function facce(lista, dopo = semi(7)) { const q = lista.slice(); return () => { if (!q.length) return dopo(); const [f, n] = q.shift(); return (f - 0.5) / n; }; }
const rng = semi(42);

// ---------------------------------------------------------------- dadi
t('d20 naturale 20 = 30', M.valoreD20(20) === 30); t('d20 naturale 1 = −10', M.valoreD20(1) === -10); t('d20 naturale 7', M.valoreD20(7) === 7);
{ const r = M.tira('2d6+3', facce([[4, 6], [5, 6]])); t('tira 2d6+3', r.totale === 12, r); }
{ const r = M.tira('4d6kh3', facce([[1, 6], [6, 6], [3, 6], [5, 6]])); t('tira 4d6kh3', r.totale === 14, r); }
{ const r = M.tira('1d20-2', facce([[10, 20]])); t('tira 1d20-2', r.totale === 8); }
lancia('espressione non valida', () => M.tira('2x6', rng), 'non valida');
{ let min = 99, max = 0; const r = semi(1); for (let i = 0; i < 5000; i++) { const x = M.d(100, r); min = Math.min(min, x); max = Math.max(max, x); } t('d100 copre 1–100', min === 1 && max === 100, [min, max]); }

// ---------------------------------------------------------------- calendario reale
const base = { nome: 'Prova', anno: { numero: 1462, etichetta: 'dopo la Caduta' }, partenza: { mese: 2, giorno: 21, ore: 8, min: 0, sett: 0 },
  zona: 'temperata', accompagnatori: 2, cibo: 20, acqua: 20 };
const camp = M.creaCampagna(base, meteo, semi(3), 1000);
t('anno reale di 365 giorni', M.lunghezzaAnno(camp.calendario) === 365);
t('febbraio 28', camp.calendario.mesi[1].giorni === 28);
t('data di partenza', M.formatoData(camp) === 'lunedì 21 marzo 1462 dopo la Caduta, 08:00', M.formatoData(camp));
{ const R = camp.tempo.R + 7 * M.ROUND_GIORNO; t('una settimana dopo è lunedì', M.formatoData(camp, R, false) === 'lunedì 28 marzo 1462 dopo la Caduta', M.formatoData(camp, R, false)); }
{ const R = M.tempoAssoluto(camp, 1463, 0, 1); const s = M.scomponi(camp, R); t('capodanno dell\'anno dopo', s.anno === 1463 && s.mese === 0 && s.giorno === 1, s);
  const g = (365 - (31 + 28 + 20)) % 7; t('giorno della settimana oltre l\'anno', s.sett === g, [s.sett, g]); }
t('giorno dell\'anno ↔ data', M.giornoAnnoDaData(camp.calendario, 11, 31) === 364 && M.dataDaGiornoAnno(camp.calendario, 59).mese === 2);
lancia('data non valida', () => M.giornoAnnoDaData(camp.calendario, 1, 29), 'non valida');
t('durata in round', M.durataInRound(3, 'minuti') === 30 && M.durataInRound(2, 'ore') === 1200 && M.durataInRound(1, 'giorni') === 14400);
t('formato durata', M.formatoDurata(5) === '5 round' && M.formatoDurata(35) === '3 min 5 r' && M.formatoDurata(1500) === '2 h 30 min' && M.formatoDurata(14400 + 600) === '1 g 1 h');

// ---------------------------------------------------------------- stagioni (Guida, estate dal 22 giugno)
function stagioneIl(zona, mese, giorno) { const c = M.clona(camp); c.tempo.R = M.tempoAssoluto(c, 1462, mese - 1, giorno); return M.stagione(c, meteo, c.tempo.R, zona); }
const casi = [['temperata', 3, 20, 'inverno'], ['temperata', 3, 21, 'primavera'], ['temperata', 6, 21, 'primavera'], ['temperata', 6, 22, 'estate'],
  ['temperata', 9, 22, 'estate'], ['temperata', 9, 23, 'autunno'], ['temperata', 12, 21, 'autunno'], ['temperata', 12, 22, 'inverno'], ['temperata', 1, 1, 'inverno'],
  ['desertica', 9, 22, 'primavera-estate'], ['desertica', 9, 23, 'autunno-inverno'], ['artica', 3, 21, 'primavera-estate'], ['artica', 2, 28, 'autunno-inverno']];
for (const [z, m, g, s] of casi) t(`stagione ${z} ${g}/${m}`, stagioneIl(z, m, g) === s, stagioneIl(z, m, g));
{ // ogni giorno dell'anno ha una sola stagione in ogni zona
  let buchi = 0; for (const z of ['temperata', 'desertica', 'artica']) for (let doy = 0; doy < 365; doy++) {
    const { mese, giorno } = M.dataDaGiornoAnno(camp.calendario, doy);
    const n = meteo.stagioni[z].filter(s => { const v = (mese + 1) * 100 + giorno, a = s.da[1] * 100 + s.da[0], b = s.a[1] * 100 + s.a[0]; return a <= b ? v >= a && v <= b : v >= a || v <= b; }).length;
    if (n !== 1) buchi++; }
  t('stagioni senza buchi né sovrapposizioni', buchi === 0, buchi); }

// ---------------------------------------------------------------- calendario personalizzato
const calP = { tipo: 'personalizzato', mesi: [{ nome: 'Brina', giorni: 30, stagione: 'inverno' }, { nome: 'Germoglio', giorni: 40, stagione: 'primavera' },
  { nome: 'Sole', giorni: 35, stagione: 'estate' }, { nome: 'Foglia', giorni: 25, stagione: 'autunno' }], settimana: ['Uno', 'Due', 'Tre', 'Quattro', 'Cinque'] };
const campP = M.creaCampagna({ ...base, calendario: calP, anno: { numero: 7, etichetta: '' }, partenza: { mese: 1, giorno: 40, ore: 23, min: 55, sett: 4 }, zona: 'desertica' }, meteo, semi(5));
t('anno personalizzato', M.lunghezzaAnno(campP.calendario) === 130);
t('data personalizzata', M.formatoData(campP) === 'Cinque 40 Germoglio 7, 23:55', M.formatoData(campP));
t('stagione dal mese (desertica)', M.stagione(campP, meteo, campP.tempo.R) === 'primavera-estate');
{ const c2 = M.avanza(campP, 50, meteo, semi(9)); t('cambio di mese e settimana di 5 giorni', M.formatoData(c2) === 'Uno 1 Sole 7, 00:00', M.formatoData(c2));
  const c3 = M.avanza(campP, 130 * M.ROUND_GIORNO, meteo, semi(9)); t('anno dopo', M.scomponi(c3).anno === 8); }
lancia('mese senza stagione', () => M.creaCampagna({ ...base, calendario: { tipo: 'personalizzato', mesi: [{ nome: 'X', giorni: 10 }] } }, meteo, rng), 'stagione');
lancia('campagna senza nome', () => M.creaCampagna({ ...base, nome: ' ' }, meteo, rng), 'nome');
lancia('zona sconosciuta', () => M.creaCampagna({ ...base, zona: 'polare' }, meteo, rng), 'zona');
{ const senza = { tipo: 'personalizzato', mesi: calP.mesi, settimana: [] }; const c = M.creaCampagna({ ...base, calendario: senza, anno: { numero: 1 } }, meteo, rng);
  t('calendario senza settimana', M.scomponi(c).sett === null && !/^Uno/.test(M.formatoData(c))); }

// ---------------------------------------------------------------- meteo
{ let righe = 0, sbagli = 0;
  for (const z in meteo.tabelle) for (const s in meteo.tabelle[z]) for (let tiro = 1; tiro <= 100; tiro++) {
    const e = M.esitoMeteo(meteo, z, s, tiro); righe++;
    for (const o of e.opzioni) { const ef = M.effettiMeteo(meteo, o); if (ef.length !== o.length && !(o.length === 2 && o.every(v => meteo.voci[v] === meteo.voci[o[0]]))) sbagli++; if (!ef.every(x => x.testo)) sbagli++; } }
  t('ogni tiro di ogni tabella ha i suoi effetti', sbagli === 0 && righe === 800, [righe, sbagli]); }
{ const e = M.esitoMeteo(meteo, 'temperata', 'inverno', 80); t('Pioggia battente / Neve = due alternative', e.opzioni.length === 2 && e.opzioni[1][0] === 'Neve', e); }
{ const e = M.esitoMeteo(meteo, 'artica', 'autunno-inverno', 100); const ef = M.effettiMeteo(meteo, e.opzioni[0]);
  t('Gelo + Tempesta di grandine', ef.map(x => x.nome).join('|') === 'Arsura/gelo|Tempesta di grandine/polvere/sabbia', ef); }
{ const e = M.esitoMeteo(meteo, 'desertica', 'primavera-estate', 100); t('Tempesta di polvere/sabbia non è un\'alternativa', e.opzioni.length === 1 && e.opzioni[0][1] === 'Tempesta di polvere/sabbia', e); }
{ const c = M.tiraMeteo(camp, meteo, rng, 92); const m = M.meteoCorrente(c, meteo); t('tiro fisso primavera 92 = Acquazzone', m.testo === 'Acquazzone' && m.effetti[0].testo.startsWith('Visibilità'), m); }
{ const c = M.scegliOpzioneMeteo(M.tiraMeteo(M.cambiaZona(M.clona(camp), meteo, 'temperata'), meteo, rng, 50), meteo === null ? 0 : 0); t('opzione unica', c.meteo.scelta === 0); }
{ let c = M.clona(camp); c.tempo.R = M.tempoAssoluto(c, 1462, 0, 10); c = M.tiraMeteo(c, meteo, rng, 95); c = M.scegliOpzioneMeteo(c, 1);
  t('scelta della neve fitta', M.meteoCorrente(c, meteo).effetti[0].nome === 'Neve fitta'); lancia('opzione inesistente', () => M.scegliOpzioneMeteo(c, 2)); }
{ const c = M.impostaMeteo(camp, meteo, 'Nebbia'); t('meteo impostato a mano', c.meteo.manuale && c.meteo.testo === 'Nebbia'); lancia('meteo fuori tabella', () => M.impostaMeteo(camp, meteo, 'Monsone'), 'tabella'); }
{ const conta = {}; let c = M.clona(camp); const r = semi(11); for (let i = 0; i < 4000; i++) { c = M.tiraMeteo(c, meteo, r); conta[c.meteo.testo] = (conta[c.meteo.testo] || 0) + 1; c.log = []; }
  t('distribuzione primavera (85% mite)', conta['Clima mite'] / 4000 > 0.82 && conta['Clima mite'] / 4000 < 0.88, conta); }
t('la campagna nasce con il meteo tirato', camp.meteo && camp.meteo.tiro >= 1 && camp.meteo.stagione === 'primavera');

// ---------------------------------------------------------------- PG e PF
const aria = { nome: 'Aria', giocatore: 'Sara', razza: 'Elfo', classe: 'Ladro 7', livello: 7, fatica_max: 42, ferita_max: 40, rif_dadi: 7, rif_tipo: 8,
  ca: 19, ca_contatto: 14, ca_sprovvista: 15, dmc: 21, tempra: 5, riflessi: 9, volonta: 3, ts_note: '+2 vs [PAURA]', percezione: 12, intuizione: 8, furtivita: 14,
  iniziativa: 6, imp_pen: 3 };
const bruno = { nome: 'Bruno', livello: 5, fatica_max: 30, ferita_max: 32, rif_dadi: 5, rif_tipo: 10, rif_ripete: true, iniziativa: 1 };
let c1 = M.aggiungiPG(M.aggiungiPG(camp, aria, rng), bruno, rng);
const A = c1.pg[0].id, B = c1.pg[1].id;
t('PG nuovo a PF pieni e Punto eroe', c1.pg[0].stato.fatica === 42 && c1.pg[0].stato.ferita === 40 && c1.pg[0].stato.eroe === 1 && c1.pg[0].stato.rif_riserva === 7);
lancia('scheda senza nome', () => M.aggiungiPG(camp, { livello: 1 }, rng), 'nome');
lancia('penalità da impreparato non ammessa', () => M.aggiungiPG(camp, { nome: 'X', imp_pen: 4 }, rng), 'impreparato');
{ const r = M.danno(c1, A, 30); const s = r.camp.pg[0].stato; t('danno solo sui Fatica', s.fatica === 12 && s.ferita === 40 && r.feritaGrave === null, s);
  t('originale intatto', c1.pg[0].stato.fatica === 42); }
{ let r = M.danno(c1, A, 89); let s = r.camp.pg[0].stato; t('Fatica 0, Ferita −7 → riga −7', s.fatica === 0 && s.ferita === -7 && r.feritaGrave && r.feritaGrave.riga === -7, [s, r.feritaGrave]);
  r = M.danno(r.camp, A, 3); s = r.camp.pg[0].stato; t('ancora sotto zero: riga −10', r.feritaGrave && r.feritaGrave.riga === -10, r.feritaGrave);
  r = M.danno(r.camp, A, 20); t('−30 → riga −15', r.feritaGrave.riga === -15 && r.camp.pg[0].stato.ferita === -30); }
{ const r = M.danno(c1, A, 82); t('Ferita a 0 esatto: niente ferita grave', r.feritaGrave === null && r.camp.pg[0].stato.ferita === 0); }
{ let c = M.pfTemporanei(c1, A, 'Falsa vita', 10, M.durataInRound(1, 'ore'));
  c = M.pfTemporanei(c, A, 'falsa vita', 6, null); t('stessa fonte: resta il più alto', c.pg[0].stato.temp.length === 1 && c.pg[0].stato.temp[0].valore === 10);
  c = M.pfTemporanei(c, A, 'Falsa vita', 14, M.durataInRound(10, 'minuti')); t('stessa fonte più alta: sostituisce', c.pg[0].stato.temp[0].valore === 14 && c.pg[0].stato.temp[0].scade === c.tempo.R + 100);
  c = M.pfTemporanei(c, A, 'Ispirare eroismo', 5, M.durataInRound(5, 'round')); t('fonti diverse si sommano', M.valoriPG(c, c.pg[0]).temp === 19);
  const r = M.danno(c, A, 8); const tm = r.camp.pg[0].stato.temp;
  t('il danno toglie prima la fonte che scade per prima', tm.length === 1 && tm[0].fonte === 'Falsa vita' && tm[0].valore === 11 && r.camp.pg[0].stato.fatica === 42, tm);
  const c2 = M.avanza(c, 6, meteo, rng); t('scadenza dopo 5 round', c2.pg[0].stato.temp.length === 1 && c2.pg[0].stato.temp[0].fonte === 'Falsa vita');
  const c3 = M.avanza(c, 100, meteo, rng); t('scadenza dopo 10 minuti', c3.pg[0].stato.temp.length === 0); }
{ let c = M.danno(c1, A, 60).camp; c = M.cura(c, A, 15); t('cura: prima i Ferita', c.pg[0].stato.ferita === 37 && c.pg[0].stato.fatica === 0, c.pg[0].stato);
  c = M.cura(c, A, 10); t('cura: Ferita al massimo, poi i Fatica', c.pg[0].stato.ferita === 40 && c.pg[0].stato.fatica === 7, c.pg[0].stato);
  c = M.cura(c, A, 100); t('cura: Fatica al massimo, non oltre', c.pg[0].stato.fatica === 42); }
{ let c = M.dannoNonLetale(c1, A, 39); t('non letali sotto i Ferita: nessuno stato', M.statoNonLetali(c.pg[0]) === null);
  c = M.dannoNonLetale(c, A, 1); t('non letali = Ferita: barcollante', M.statoNonLetali(c.pg[0]) === 'Barcollante');
  c = M.dannoNonLetale(c, A, 1); t('non letali > Ferita: privo di sensi', M.statoNonLetali(c.pg[0]) === 'Privo di Sensi');
  lancia('Rifiatare da privo di sensi', () => M.rifiatare(c, A, 1, rng), 'cosciente');
  const c2 = M.avanza(c, 2 * M.ROUND_ORA, meteo, rng); t('recupero 1 non letale all\'ora', c2.pg[0].stato.nonletali === 39);
  const c3 = M.cura(c, A, 5); t('la cura toglie altrettanti non letali', c3.pg[0].stato.nonletali === 36); }
{ let c = M.danno(c1, B, 25).camp; const r = M.rifiatare(c, B, 3, facce([[1, 10], [2, 10], [7, 10], [2, 10], [1, 10], [10, 10], [4, 10]]));
  t('Rifiatare con ritiro di 1 e 2', r.totale === 21 && r.dadi.join() === '7,10,4', r);
  t('Rifiatare solo sui Fatica', r.camp.pg[1].stato.fatica === 26 && r.camp.pg[1].stato.ferita === 32 && r.camp.pg[1].stato.rif_riserva === 2, r.camp.pg[1].stato);
  const r2 = M.rifiatare(c1, A, 2, facce([[1, 8], [8, 8]])); t('Rifiatare senza ritiro, mai oltre il massimo', r2.dadi.join() === '1,8' && r2.camp.pg[0].stato.fatica === 42);
  lancia('dadi insufficienti', () => M.rifiatare(r.camp, B, 3, rng), 'insufficienti'); }
{ let c = M.danno(c1, A, 50).camp; c = M.rifiatare(c, A, 4, rng).camp; c = M.puntoEroe(c, A, 0); const R0 = c.tempo.R;
  c = M.riposo(c, meteo, semi(4)); const s = c.pg[0].stato;
  t('riposo: Fatica pieni, +livello Ferita, riserva piena', s.fatica === 42 && s.ferita === 39 && s.rif_riserva === 7, s);
  t('riposo: Punto eroe invariato, +8 ore', s.eroe === 0 && c.tempo.R === R0 + 4800);
  lancia('secondo riposo subito dopo', () => M.riposo(c, meteo, semi(4)), 'già riposato');
  const c2 = M.riposo(M.avanza(c, 16 * M.ROUND_ORA, meteo, semi(4)), meteo, semi(4)); t('riposo dopo 24 ore: Ferita non oltre il massimo', c2.pg[0].stato.ferita === 40); }
{ // un riposo nelle 24 ore; a cavallo della mezzanotte il giorno dopo si può, ma 12 ore dopo la fine
  const alle = (c, g, h) => M.vaiA(c, M.tempoAssoluto(c, 1462, 2, g, h), meteo, semi(3));
  let c = alle(M.clona(c1), 21, 22); c = M.riposo(c, meteo, semi(3), [A]);            // 22:00 → 06:00 del 22
  t('riposo a cavallo: finisce alle 6 del giorno dopo', M.formatoData(c) === 'martedì 22 marzo 1462 dopo la Caduta, 06:00', M.formatoData(c));
  t('Bruno non ha riposato', !c.pg[1].stato.ultimo_riposo && c.pg[0].stato.ultimo_riposo);
  let x = alle(c, 22, 17); t('alle 17: ancora no (12 ore dalla fine = 18)', !M.puoRiposare(x, x.pg[0]).ok && M.formatoData(x, M.puoRiposare(x, x.pg[0]).da) === 'martedì 22 marzo 1462 dopo la Caduta, 18:00');
  lancia('riposo troppo presto', () => M.riposo(x, meteo, semi(3), [A]), 'da martedì 22 marzo');
  t('l\'altro PG può riposare', M.puoRiposare(x, x.pg[1]).ok);
  x = alle(c, 22, 18); t('alle 18: sì', M.puoRiposare(x, x.pg[0]).ok);
  let d = alle(M.clona(c1), 21, 8); d = M.riposo(d, meteo, semi(3), [A]);            // 08:00 → 16:00 dello stesso giorno
  let y = alle(d, 22, 7); t('stesso giorno: il 22 alle 7 ancora no', !M.puoRiposare(y, y.pg[0]).ok);
  y = alle(d, 22, 8); t('24 ore dopo l\'inizio: sì', M.puoRiposare(y, y.pg[0]).ok);
  const z = alle(M.clona(c1), 21, 16); const z2 = M.riposo(z, meteo, semi(3), [A]);   // 16:00 → 00:00: non è a cavallo
  t('riposo che finisce a mezzanotte non è a cavallo', !M.puoRiposare(alle(z2, 22, 12), z2.pg[0]).ok && M.puoRiposare(alle(z2, 22, 16), z2.pg[0]).ok);
  lancia('riposo senza PG', () => M.riposo(c1, meteo, semi(3), []), 'nessun PG'); }
{ const c = M.modificaPG(c1, A, { fatica_max: 50, rif_dadi: 8 }); t('modifica: valori pieni seguono il nuovo massimo', c.pg[0].stato.fatica === 50 && c.pg[0].stato.rif_riserva === 7);
  const c2 = M.modificaPG(M.danno(c1, A, 5).camp, A, { fatica_max: 30 }); t('modifica: valore corrente limitato', c2.pg[0].stato.fatica === 30); }

// ---------------------------------------------------------------- scorte (Z1: se non basta, il GM sceglie chi la usa)
{ let c = M.clona(c1); t('consumo = PG + accompagnatori', M.consumoGiornaliero(c) === 4); t('bastano per 5 giorni', M.bastanoPer(c, 'cibo') === 5);
  const g0 = M.scomponi(c).N;
  c = M.avanza(c, M.ROUND_GIORNO, meteo, semi(8)); t('un giorno: −4 e −4', c.scorte.cibo === 16 && c.scorte.acqua === 16, c.scorte);
  t('meteo del giorno nuovo', c.meteo.giorno === g0 + 1);
  c = M.modificaScorta(c, 'acqua', -13); t('scorta ridotta', c.scorte.acqua === 3);
  c = M.avanza(c, M.ROUND_GIORNO, meteo, semi(8));
  const z = M.razionamentoAperto(c);
  t('acqua insufficiente: giorno in sospeso, nulla consumato', z && z.scorta === 'acqua' && c.scorte.acqua === 3 && c.scorte.cibo === 12, [z, c.scorte]);
  t('avviso di razionamento in coda', c.coda.length === 1 && c.coda[0].tipo === 'razionamento' && /3 razioni per 4 persone/.test(c.coda[0].testo), c.coda);
  lancia('il razionamento non si chiude con «Fatto»', () => M.togliDallaCoda(c, 0), 'scegli');
  lancia('più razioni di quelle che ci sono', () => M.risolviRazionamento(c, z.id, [A, B], 2, meteo), 'solo 3');
  c = M.risolviRazionamento(c, z.id, [A], 1, meteo);
  t('beve Aria con un accompagnatore', c.scorte.acqua === 1 && c.pg[0].stato.sete.penalita === 0 && c.pg[1].stato.sete.penalita === 1 && !M.razionamentoAperto(c));
  t('avviso di Sete per chi resta senza', c.coda.length === 1 && /Sete: Bruno 1/.test(c.coda[0].testo), c.coda);
  t('Sete solo sul PG senza acqua', M.valoriPG(c, c.pg[1]).tempra.valore === -1 && M.valoriPG(c, c.pg[0]).tempra.mod === 0, M.valoriPG(c, c.pg[1]).tempra);
  c.coda = [];
  c = M.avanza(c, 2 * M.ROUND_GIORNO, meteo, semi(8));
  t('due giorni in sospeso, una sola scelta alla volta', c.razionamenti.filter(x => x.scorta === 'acqua').length === 2 && c.coda.filter(x => x.tipo === 'razionamento').length === 1, c.razionamenti);
  const [z1, z2] = c.razionamenti.filter(x => x.scorta === 'acqua');
  lancia('prima il giorno precedente', () => M.risolviRazionamento(c, z2.id, [B], 0, meteo), 'precedente');
  c = M.risolviRazionamento(c, z1.id, [], 0, meteo);
  t('nessuno beve: Sete a tutti, resta il giorno dopo', c.pg[0].stato.sete.penalita === 1 && c.pg[1].stato.sete.penalita === 2 && M.razionamentoAperto(c).id === z2.id && c.coda.filter(x => x.tipo === 'razionamento').length === 1);
  c = M.risolviRazionamento(c, z2.id, [B], 0, meteo);
  t('beve Bruno: la sua Sete scende di 1', c.scorte.acqua === 0 && c.pg[1].stato.sete.penalita === 1 && c.pg[1].stato.sete.giorni_senza === 0 && c.pg[0].stato.sete.penalita === 2);
  c.coda = [];
  c = M.avanza(c, 2 * M.ROUND_GIORNO, meteo, semi(8));
  t('acqua a 0: si va avanti da soli', !M.razionamentoAperto(c) && c.pg[0].stato.sete.giorni_senza === 4, c.pg[0].stato.sete);
  t('quarto giorno di Aria: prova di Costituzione', c.coda.some(x => /prova di Costituzione CD 10 per Aria \(giorno 4\)/.test(x.testo)), c.coda.map(x => x.testo));
  c = M.modificaScorta(c, 'acqua', 30); c.coda = []; c = M.avanza(c, M.ROUND_GIORNO, meteo, semi(8));
  t('si beve tutti: la penalità scende di 1', c.pg[0].stato.sete.penalita === 3 && c.pg[0].stato.sete.giorni_senza === 0 && c.scorte.acqua === 26, c.pg[0].stato.sete);
  { const n = c.coda.length; c.coda.push({ R: 0, tipo: 'sete', testo: 'x' }); c = M.togliDallaCoda(c, n); t('coda: tolto un avviso', c.coda.length === n); }
  const salto = M.avanza(c1, 10 * M.ROUND_GIORNO, meteo, semi(8));
  t('salto di 10 giorni: fame dal 6°, nessuna scelta a cibo 0', salto.scorte.cibo === 0 && salto.pg.every(p => p.stato.fame.penalita === 5 && p.stato.fame.giorni_senza === 5) && !M.razionamentoAperto(salto), salto.pg.map(p => p.stato.fame));
  const salto2 = M.avanza(c1, 12 * M.ROUND_GIORNO, meteo, semi(8)); t('fame: prova dal settimo giorno', salto2.coda.some(x => /Fame: prova di Costituzione CD 10 per Aria \(giorno 7\)/.test(x.testo)));
  const vecchia = M.clona(c1); vecchia.scorte.fame = { giorni_senza: 2, penalita: 2 }; vecchia.scorte.sete = { giorni_senza: 0, penalita: 1 }; delete vecchia.razionamenti;
  for (const p of vecchia.pg) { delete p.stato.fame; delete p.stato.sete; }
  const mig = M.migra(vecchia);
  t('migrazione: Fame e Sete del gruppo passano a ogni PG', mig.pg.every(p => p.stato.fame.penalita === 2 && p.stato.sete.penalita === 1) && !mig.scorte.fame && Array.isArray(mig.razionamenti)); }

// ---------------------------------------------------------------- iniziativa
function avvio(c, extra) {
  return M.avviaCombattimento(c, [{ tipo: 'pg', pgId: A, totale: 18 }, { tipo: 'pg', pgId: B, d20: 20 },
    { tipo: 'nemico', nome: 'Lupo', bonus: 2, n: 5, modo: 'tipo' }, { tipo: 'nemico', nome: 'Lupo crudele', bonus: 2, n: 1 }, ...(extra || [])],
  facce([[12, 20], [3, 20], [5, 20], [9, 20], [1, 20], [15, 20]], semi(21)), 0);
}
let cb = avvio(c1);
{ const k = cb.combattimento, nomi = k.ordine.map(id => M.etichetta(k.righe[id]));
  t('Bruno d20 naturale 20 = 31', k.righe[k.ordine[0]].totale === 31 && nomi[0] === 'Bruno', nomi);
  t('lupi per tipo: una riga ×5', nomi.includes('Lupo ×5') && nomi.length === 4, nomi);
  t('lupo crudele con 1 naturale = −8', Object.values(k.righe).find(r => r.nome === 'Lupo crudele').totale === -8); }
{ const x = M.avviaCombattimento(c1, [{ tipo: 'nemico', nome: 'Goblin', bonus: 1, n: 3, modo: 'singolo' }], semi(2));
  t('per singolo: una riga per creatura', x.combattimento.ordine.map(id => x.combattimento.righe[id].nome).join() .split(',').sort().join() === 'Goblin 1,Goblin 2,Goblin 3'); }
{ const x = M.avviaCombattimento(c1, [{ tipo: 'pg', pgId: A, totale: 18, impreparato: true }, { tipo: 'pg', pgId: B, totale: 18, impreparato: true },
  { tipo: 'nemico', nome: 'Orco', bonus: 0, impreparato: true }], facce([[10, 20], [10, 20], [10, 20]]));
  const v = Object.values(x.combattimento.righe); t('impreparati: −3 (Vigili), −6, −6 per i nemici', v.find(r => r.nome === 'Aria').totale === 15 && v.find(r => r.nome === 'Bruno').totale === 12 && v.find(r => r.nome === 'Orco').totale === 4, v.map(r => r.totale)); }
{ const x = M.avviaCombattimento(c1, [{ tipo: 'pg', pgId: B, totale: 15 }, { tipo: 'pg', pgId: A, totale: 15 }], semi(2));
  t('pari merito: prima il bonus più alto', x.combattimento.righe[x.combattimento.ordine[0]].nome === 'Aria'); }
{ const x = M.avviaCombattimento(c1, [{ tipo: 'nemico', nome: 'A', bonus: 2 }, { tipo: 'nemico', nome: 'B', bonus: 2 }], facce([[10, 20], [4, 20], [10, 20], [17, 20]]));
  t('pari merito e stesso bonus: tiro di spareggio', x.combattimento.righe[x.combattimento.ordine[0]].nome === 'B'); }
lancia('PG senza totale', () => M.avviaCombattimento(c1, [{ tipo: 'pg', pgId: A }], rng), 'totale');
lancia('secondo combattimento', () => avvio(cb), 'già');
{ let c = cb; const R0 = c.tempo.R; const ordine = c.combattimento.ordine.slice();
  for (let i = 0; i < 4; i++) c = M.comando(c, 'avanti', {}, meteo, rng, 0);
  t('giro completo = round 2 e +1 round sull\'orologio', c.combattimento.round === 2 && c.combattimento.turno === 0 && c.tempo.R === R0 + 1);
  for (let i = 0; i < 36; i++) c = M.comando(c, 'avanti', {}, meteo, rng, 0);
  t('10 round = 1 minuto', c.combattimento.round === 11 && c.tempo.R === R0 + 10);
  c = M.indietro(c); t('Indietro annulla anche il round', c.combattimento.round === 10 && c.tempo.R === R0 + 9 && c.combattimento.turno === 3);
  t('ordine invariato', c.combattimento.ordine.join() === ordine.join()); }
{ let c = cb; const k0 = c.combattimento; const primo = k0.ordine[0], secondo = k0.ordine[1];
  c = M.comando(c, 'ritardare', {}, meteo, rng, 0); let k = c.combattimento;
  t('Ritardare: esce dall\'ordine, tocca al successivo', k.attesa[0] === primo && k.ordine[k.turno] === secondo && k.ordine.length === 3);
  c = M.comando(c, 'avanti', {}, meteo, rng, 0); const ora = c.combattimento.ordine[c.combattimento.turno];
  c = M.comando(c, 'entraOra', { id: primo }, meteo, rng, 0); k = c.combattimento;
  t('Entra ora: prima di chi sta agendo, e lì resta', k.ordine[k.turno] === primo && k.ordine[k.turno + 1] === ora && k.attesa.length === 0, k.ordine);
  lancia('entra chi non aspetta', () => M.comando(c, 'entraOra', { id: primo }, meteo, rng, 0), 'attesa'); }
{ let c = cb; const k0 = c.combattimento; const lupi = k0.ordine.find(id => k0.righe[id].nome === 'Lupo');
  c = M.comando(c, 'preparare', { id: lupi, azione: 'Mordere', innesco: 'chi si avvicina' }, meteo, rng, 0);
  t('Preparare non cambia l\'ordine', c.combattimento.ordine.join() === k0.ordine.join() && c.combattimento.righe[lupi].prepara.azione === 'Mordere');
  c = M.comando(c, 'scatta', { id: lupi }, meteo, rng, 0); t('Scatta: scritto nel log e chiuso', c.combattimento.righe[lupi].prepara === null && /Scatta l'azione preparata di Lupo ×5: Mordere/.test(c.log[c.log.length - 1].testo)); }
{ let c = cb; let k = c.combattimento; const ariaR = k.ordine.find(id => k.righe[id].nome === 'Aria');
  c = M.comando(c, 'avanti', {}, meteo, rng, 0); c = M.comando(c, 'avanti', {}, meteo, rng, 0); k = c.combattimento; // Aria ha già agito
  const stava = k.ordine[k.turno];
  c = M.comando(c, 'puntoEroe', { id: ariaR }, meteo, rng, 0); k = c.combattimento;
  t('Punto eroe: subito prima di chi stava per agire', k.ordine[k.turno] === ariaR && k.ordine[k.turno + 1] === stava && k.ordine.filter(x => x === ariaR).length === 1, k.ordine);
  t('Punto eroe speso', c.pg[0].stato.eroe === 0);
  lancia('secondo Punto eroe', () => M.comando(M.comando(c, 'avanti', {}, meteo, rng, 0), 'puntoEroe', { id: ariaR }, meteo, rng, 0), 'Punto eroe');
  const u = M.indietro(c); t('Indietro restituisce il Punto eroe', u.pg[0].stato.eroe === 1); }
{ let c = cb; let k = c.combattimento; const lupi = k.ordine.find(id => k.righe[id].nome === 'Lupo');
  c = M.comando(c, 'separa', { id: lupi, nome: 'Lupo capobranco' }, meteo, rng, 0); k = c.combattimento; const i = k.ordine.indexOf(lupi);
  t('Separa: stessa iniziativa, subito dopo il gruppo', k.righe[lupi].n === 4 && k.righe[k.ordine[i + 1]].nome === 'Lupo capobranco' && k.righe[k.ordine[i + 1]].totale === k.righe[lupi].totale); }
{ let c = M.comando(cb, 'avanti', {}, meteo, rng, 0); const corrente = c.combattimento.ordine[c.combattimento.turno];
  c = M.comando(c, 'rinforzi', { partecipanti: [{ tipo: 'nemico', nome: 'Orco', bonus: 50 }] }, meteo, facce([[10, 20]]), 0); const k = c.combattimento;
  t('Rinforzi: inseriti per iniziativa, il turno non cambia', k.righe[k.ordine[0]].nome === 'Orco' && k.ordine[k.turno] === corrente); }
{ let c = cb; let k = c.combattimento; const sec = k.ordine[1];
  c = M.comando(c, 'fuori', { id: sec }, meteo, rng, 0); c = M.comando(c, 'avanti', {}, meteo, rng, 0); k = c.combattimento;
  t('fuori combattimento: si salta', k.turno === 2);
  c = M.comando(c, 'togli', { id: sec }, meteo, rng, 0); t('togli', c.combattimento.ordine.length === 3 && c.combattimento.ordine[c.combattimento.turno] === k.ordine[2]); }
{ let c = cb; const k = c.combattimento; const lc = k.ordine.find(id => k.righe[id].nome === 'Lupo crudele');
  c = M.comando(c, 'correggi', { id: lc, totale: 40 }, meteo, rng, 0); t('correzione a mano: ricollocato, turno invariato', c.combattimento.ordine[0] === lc && c.combattimento.ordine[c.combattimento.turno] === k.ordine[0]); }
lancia('Indietro senza mosse', () => M.indietro(cb), 'annullare');
{ const r = M.fineCombattimento(M.comando(cb, 'avanti', {}, meteo, rng, 0), 0); t('fine combattimento', r.camp.combattimento === null && /Fine del combattimento: 1 round/.test(r.riepilogo.testo), r.riepilogo); }

// ---------------------------------------------------------------- timer reale
{ let c = M.clona(c1); c.impostazioni.timer = true; c = avvio(c); // il timer parte a ora 0
  let L = M.timerLetture(c.combattimento, 5000); t('timer del turno', L.turno === 5000 && L.combattimento === 5000);
  c = M.comando(c, 'avanti', {}, meteo, rng, 30000);   // Bruno 30 s
  c = M.comando(c, 'pausa', {}, meteo, rng, 40000); L = M.timerLetture(c.combattimento, 90000);
  t('pausa ferma il cronometro', L.turno === 10000 && L.inPausa && L.combattimento === 40000, L);
  c = M.comando(c, 'pausa', {}, meteo, rng, 90000); c = M.comando(c, 'avanti', {}, meteo, rng, 100000); // Aria 20 s (50 di pausa esclusi)
  c = M.comando(c, 'avanti', {}, meteo, rng, 110000); c = M.comando(c, 'avanti', {}, meteo, rng, 120000);
  c = M.comando(c, 'avanti', {}, meteo, rng, 130000);    // Bruno 10 s
  const r = M.fineCombattimento(c, 131000).riepilogo;
  const br = r.timer.pg.find(x => x.nome === 'Bruno'), ar = r.timer.pg.find(x => x.nome === 'Aria');
  t('riepilogo: medio e più lungo per PG', br.medio === 20000 && br.massimo === 30000 && ar.massimo === 20000, r.timer);
  t('riepilogo: durata reale senza pause', r.timer.durata === 81000 && /durata reale 1:21/.test(r.testo), r.testo); }
{ const c = M.attivaTimer(cb, 500); t('timer acceso a combattimento iniziato', c.combattimento.timer && M.timerLetture(c.combattimento, 1500).turno === 1000); }

// ---------------------------------------------------------------- esporta / importa / duplica
{ const testo = M.esporta(c1, 'campagna'); const r = M.importa(testo); t('esporta/importa', r.campagne.length === 1 && r.campagne[0].pg.length === 2 && r.campagne[0].id === c1.id);
  const tutto = M.importa(M.esporta({ campagne: [c1, campP] }, 'tutto')); t('importa tutto', tutto.campagne.length === 2);
  lancia('JSON rotto', () => M.importa('{x'), 'JSON'); lancia('formato sbagliato', () => M.importa('{"formato":"altro"}'), 'formato');
  const dup = M.duplicaCampagna(c1, semi(99), 5); t('duplica: id e nome nuovi', dup.id !== c1.id && dup.nome === 'Prova (copia)' && dup.pg.length === 2); }
{ const c = M.rimuoviPG(c1, A); t('rimuovi PG', c.pg.length === 1 && M.consumoGiornaliero(c) === 3); }
t('avanza non tocca l\'originale', (() => { const x = M.clona(c1); M.avanza(x, 99999, meteo, rng); return JSON.stringify(x) === JSON.stringify(c1); })());
lancia('il tempo non torna indietro', () => M.vaiA(c1, c1.tempo.R - 1, meteo, rng), 'indietro');

// ================================================================ Build 2a — G malus e bonus, H veleni e malattie, I ferite ed emorragie
const FER = require('./ferite.json');
const COND = require('./condizioni.json');
const fs = require('fs'), path = require('path');
const ariaB = { ...aria, abilita_libere: [{ nome: 'Acrobazia', valore: 13 }, { nome: 'Professione (cerusico)', valore: 10 }] };
let g0 = M.aggiungiPG(M.aggiungiPG(camp, ariaB, rng), bruno, rng);
const GA = g0.pg[0].id, GB = g0.pg[1].id, PA = { pg: GA }, PB = { pg: GB };
const pgA = c => c.pg.find(p => p.id === GA), vA = c => M.valoriPG(c, pgA(c)), malA = c => pgA(c).stato.malus;
const cond = (nome, durata, extra) => ({ tipo: 'condizione', nome, durata, ...(extra || {}) });

// ---------------------------------------------------------------- G: condizioni sui valori (G2)
{ let c = M.aggiungiMalus(g0, PA, cond('Scosso', { n: 3, unita: 'round' }), rng); const v = vA(c);
  t('G2 Scosso: TS e abilità −2', v.tempra.valore === 3 && v.volonta.valore === 1 && v.percezione.valore === 10 && v.libere[0].valore === 11 && v.ca.valore === 19, v);
  t('G2 valore base conservato', v.tempra.base === 5 && v.tempra.mod === -2);
  c = M.aggiungiMalus(c, PA, cond('Spaventato', { n: 1, unita: 'minuti' }), rng); t('G2 la paura non si somma', vA(c).tempra.valore === 3);
  c = M.aggiungiMalus(c, PA, cond('Infermo', { unita: 'libera' }), rng); t('G2 Infermo si somma alla paura', vA(c).tempra.valore === 1 && vA(c).furtivita.valore === 10);
  c = M.avanza(c, 2, meteo, rng); t('G1 fuori combattimento: 2 round dopo Scosso c\'è ancora', malA(c).some(m => m.nome === 'Scosso'));
  c = M.avanza(c, 1, meteo, rng); t('G1 al terzo round Scosso scade', !malA(c).some(m => m.nome === 'Scosso') && c.log.some(e => /scade Scosso/.test(e.testo)));
  c = M.avanza(c, 7, meteo, rng); t('G1 1 minuto = 10 round', !malA(c).some(m => m.nome === 'Spaventato')); }
{ let c = M.aggiungiMalus(g0, PA, cond('Abbagliato', { n: 1, unita: 'ore' }), rng);
  t('G2 Abbagliato: solo Percezione −1', vA(c).percezione.valore === 11 && vA(c).intuizione.valore === 8);
  c = M.aggiungiMalus(c, PA, cond('Accecato', { n: 1, unita: 'ore' }), rng); t('G2 Accecato: CA −2, Percezione −4 (con Abbagliato −5)', vA(c).ca.valore === 17 && vA(c).percezione.valore === 7);
  c = M.aggiungiMalus(c, PA, cond('Assordato', { n: 1, unita: 'ore' }), rng); t('G2 Assordato: Iniziativa −4', vA(c).iniziativa.valore === 2);
  c = M.aggiungiMalus(c, PA, cond('Impreparato', { unita: 'incontro' }), rng); t('G2 Impreparato: la CA mostrata è quella colto alla sprovvista', vA(c).ca.valore === 13 && vA(c).ca.base === 19, vA(c).ca);
  c = M.aggiungiMalus(c, PA, cond('Livelli negativi', { unita: 'permanente' }, { n: 2 }), rng);
  const v = vA(c); t('G2 livelli negativi 2: TS, abilità e DMC −2, Fatica max −10', v.riflessi.valore === 7 && v.dmc.valore === 19 && v.fatica_max.valore === 32, v.fatica_max);
  t('G2 Prono: solo nota', (() => { const x = M.aggiungiMalus(g0, PA, cond('Prono'), rng); return vA(x).ca.valore === 19 && vA(x).note.some(n => /mischia/.test(n)); })());
  lancia('G condizione senza nome', () => M.aggiungiMalus(g0, PA, { tipo: 'condizione' }, rng), 'condizione');
  lancia('G livelli negativi senza N', () => M.aggiungiMalus(g0, PA, cond('Livelli negativi'), rng), 'livelli negativi'); }
{ let c = M.aggiungiMalus(g0, PA, cond('Scosso', { n: 2, unita: 'round' }), rng);
  c = M.aggiungiMalus(c, PA, cond('Scosso', { n: 1, unita: 'minuti' }), rng);
  t('G stessa condizione: una sola, resta la durata più lunga', malA(c).filter(m => m.nome === 'Scosso').length === 1 && malA(c)[0].durata.fine === c.tempo.R + 10);
  c = M.aggiungiMalus(c, PA, cond('Scosso', { n: 1, unita: 'round' }), rng); t('G durata più corta ignorata', malA(c)[0].durata.fine === c.tempo.R + 10);
  c = M.aggiungiMalus(c, PA, cond('Offuscato', { n: 1, unita: 'ore' }, { perc: 20 }), rng); c = M.aggiungiMalus(c, PA, cond('Offuscato', { n: 1, unita: 'ore' }, { perc: 50 }), rng);
  t('Offuscato: vale la % più alta (Vol. 1)', vA(c).offuscato === 50); }
// G3 bonus e modificatori liberi
{ let c = M.aggiungiMalus(g0, PA, { tipo: 'bonus', nome: 'Benedizione', mods: { ts: 1, altro: '+1 TpC' }, durata: { n: 3, unita: 'minuti' } }, rng);
  t('G3 bonus ai TS sommato', vA(c).tempra.valore === 6 && vA(c).note.some(n => /TpC/.test(n)));
  c = M.aggiungiMalus(c, PA, { tipo: 'altro', nome: 'Veleno di prova', mods: { tempra: -1, ca: -1, abilita: -2, iniziativa: -1, fatica_max: -5 } }, rng);
  const v = vA(c); t('G modificatori singoli', v.tempra.valore === 5 && v.riflessi.valore === 10 && v.ca.valore === 18 && v.ca_contatto.valore === 13 && v.percezione.valore === 10 && v.iniziativa.valore === 5 && v.fatica_max.valore === 37, v);
  c = M.cura(M.danno(c, GA, 20).camp, GA, 30); t('G Fatica max ridotto vale anche per la cura', pgA(c).stato.fatica === 37, pgA(c).stato);
  lancia('G modificatore non intero', () => M.aggiungiMalus(g0, PA, { tipo: 'altro', mods: { ca: 1.5 } }, rng), 'modificatore'); }

// ---------------------------------------------------------------- G nel combattimento: scadenza al turno del bersaglio o di chi l'ha causato
const avviaG = (c, nemici) => M.avviaCombattimento(c, [{ tipo: 'pg', pgId: GA, totale: 30 }, { tipo: 'pg', pgId: GB, totale: 10 }, ...nemici], semi(4), 0);
const av = (c, n = 1) => { for (let i = 0; i < n; i++) c = M.comando(c, 'avanti', {}, meteo, rng, 0); return c; };
const rigaN = (c, nome) => Object.values(c.combattimento.righe).find(r => r.nome === nome).id;
{ let c = avviaG(g0, [{ tipo: 'nemico', nome: 'Lupo', bonus: 0, n: 3 }]); // ordine: Aria 30, Lupo ×3 (d20), Bruno 10
  c = M.comando(c, 'correggi', { id: rigaN(c, 'Lupo'), totale: 20 }, meteo, rng, 0);
  t('ordine: Aria, Lupo, Bruno', c.combattimento.ordine.map(id => c.combattimento.righe[id].nome).join() === 'Aria,Lupo,Bruno');
  c = av(c); // tocca al Lupo
  const lupo = rigaN(c, 'Lupo'), R0 = c.tempo.R;
  c = M.aggiungiMalus(c, PA, cond('Stordito', { n: 1, unita: 'round' }), rng); // Aria ha già agito: un round in più
  c = M.aggiungiMalus(c, PB, cond('Scosso', { n: 1, unita: 'round' }, { scadenza: 'causa', causa: lupo }), rng);
  c = M.aggiungiMalus(c, { riga: lupo }, cond('Prono', null, { etichetta: 'Lupo 3' }), rng);
  t('fine in round: Aria ha già agito (+1)', malA(c)[0].durata.fine === R0 + 2);
  t('etichetta del gruppo', M.descriviMalus(c, c.combattimento.righe[lupo].malus[0]).startsWith('Lupo 3: Prono'));
  c = av(c); t('Bruno agisce ancora Scosso', c.pg[1].stato.malus.length === 1);
  c = av(c); t('round 2: Aria è ancora Stordita nel suo turno', c.combattimento.round === 2 && malA(c).length === 1 && !c.combattimento.avvisi.length);
  c = av(c); t('scade all\'inizio del turno di chi l\'ha causato', c.pg[1].stato.malus.length === 0 && c.combattimento.avvisi.some(a => /Scosso scade ora \(Bruno\)/.test(a)), c.combattimento.avvisi);
  c = av(c, 2); t('round 3: Stordito scade all\'inizio del turno di Aria', malA(c).length === 0 && c.combattimento.avvisi.some(a => /Stordito scade ora/.test(a)));
  // Indietro annulla anche le scadenze
  const prima = c; c = M.indietro(c); t('Indietro: Stordito torna', malA(c).length === 1 && c.combattimento.round === 2); c = prima;
  // malus nel combattimento con storia: Indietro lo toglie
  const c2 = M.conStoria(c, M.aggiungiMalus(c, PA, cond('Confuso', { n: 2, unita: 'round' }), rng));
  t('conStoria: il malus si annulla con Indietro', malA(c2).length === 1 && malA(M.indietro(c2)).length === 0);
  // fine incontro
  let c3 = M.aggiungiMalus(c, PB, cond('Affaticato', { unita: 'incontro' }), rng); c3 = M.fineCombattimento(c3, 0).camp;
  t('«fino a fine incontro» finisce con il combattimento', c3.pg[1].stato.malus.length === 0); }
// TS periodico a ogni round, nel turno del bersaglio
{ let c = avviaG(g0, []); c = av(c); // tocca a Bruno
  c = M.aggiungiMalus(c, PA, { ...cond('Confuso', { unita: 'libera' }), ts: { tipo: 'Volontà', cd: 15, ogni: 1, unita: 'round', finisce: true } }, rng);
  t('TS periodico: niente promemoria prima del turno', !c.coda.some(q => q.tipo === 'ts'));
  c = av(c); const q = c.coda.find(q => q.tipo === 'ts');
  t('TS periodico: promemoria all\'inizio del turno del bersaglio', q && /Volontà CD 15/.test(q.testo), c.coda);
  lancia('il promemoria non si chiude con Fatto', () => M.togliDallaCodaId(c, q.id), 'Superato');
  let c2 = M.esitoPromemoria(c, q.id, false, rng); t('TS fallito: resta, prossimo al round dopo', malA(c2).length === 1 && malA(c2)[0].per.prossimo === c2.tempo.R + 1);
  c2 = av(c2, 2); const q2 = c2.coda.find(q => q.tipo === 'ts'); c2 = M.esitoPromemoria(c2, q2.id, true, rng);
  t('TS superato: finisce', malA(c2).length === 0); }
// TS periodico fuori combattimento: un promemoria alla volta
{ let c = M.aggiungiMalus(g0, PB, { ...cond('Nauseato', { n: 1, unita: 'ore' }), ts: { tipo: 'Tempra', cd: 12, ogni: 1, unita: 'minuti', finisce: true } }, rng);
  c = M.avanza(c, 35, meteo, rng); t('scadenze arretrate: un promemoria per volta', c.coda.filter(q => q.tipo === 'ts').length === 1);
  c = M.esitoPromemoria(c, c.coda.find(q => q.tipo === 'ts').id, false, rng); t('subito il successivo arretrato', c.coda.filter(q => q.tipo === 'ts').length === 1); }

// ---------------------------------------------------------------- H: veleni e malattie
const veleno = (extra) => ({ tipo: 'veleno', nome: 'Veleno di ragno', veleno: { forma: 'ferimento', ts: 'Tempra', cd: 13, insorgenza: null, frequenza: { unita: 'round', volte: 6 }, effetto: '1d2 For', cura: 1, ...(extra || {}) } });
{ let c = M.aggiungiMalus(g0, PA, veleno(), facce([[2, 2]]));
  const m = malA(c)[0];
  t('H primo effetto subito, senza TS', m.vel.totale === 2 && c.coda.some(q => q.tipo === 'avviso' && /primo effetto 2 For/.test(q.testo)), c.coda);
  t('H descrizione', /Tempra CD 13 · 0\/6 · tot\. 2/.test(M.descriviMalus(c, m)), M.descriviMalus(c, m));
  c = M.avanza(c, 1, meteo, rng); let q = c.coda.find(q => q.tipo === 'veleno');
  t('H2 promemoria: TS e successi', q && /Tempra CD 13 — successi consecutivi 0\/1, scadenza 1\/6/.test(q.testo), q);
  c = M.esitoPromemoria(c, q.id, false, facce([[1, 2]]));
  t('H2 fallito: effetto tirato e scritto nel log', malA(c)[0].vel.totale === 3 && malA(c)[0].vel.restanti === 5 && c.log.some(e => /effetto 1 For \(totale 3 For\)/.test(e.testo)));
  c = M.doseAggiuntiva(c, PA, malA(c)[0].id); t('H4 dose aggiuntiva: CD +2, durata +50%', malA(c)[0].per.cd === 15 && malA(c)[0].vel.volte === 9 && malA(c)[0].vel.restanti === 8);
  c = M.avanza(c, 1, meteo, rng); q = c.coda.find(q => q.tipo === 'veleno'); t('H2 la CD nuova nel promemoria', /CD 15/.test(q.testo));
  c = M.esitoPromemoria(c, q.id, true, rng); t('H3 cura (1 TS): chiuso da solo', malA(c).length === 0 && c.log.some(e => /curato/.test(e.testo))); }
{ let c = M.aggiungiMalus(g0, PA, veleno({ insorgenza: { n: 1, unita: 'minuti' }, frequenza: { unita: 'minuti', volte: 2 }, cura: 3 }), rng);
  t('H insorgenza: nessun effetto subito', malA(c)[0].vel.totale === 0 && !c.coda.length);
  c = M.avanza(c, 10, meteo, facce([[2, 2]])); t('H fine insorgenza: primo effetto', malA(c)[0].vel.totale === 2 && c.coda.some(q => q.tipo === 'avviso'));
  c = M.avanza(c, 10, meteo, rng); c = M.esitoPromemoria(c, c.coda.find(q => q.tipo === 'veleno').id, false, rng);
  c = M.avanza(c, 10, meteo, rng); c = M.esitoPromemoria(c, c.coda.find(q => q.tipo === 'veleno').id, true, rng);
  t('H3 frequenza esaurita: chiuso da solo', malA(c).length === 0 && c.log.some(e => /frequenza esaurita/.test(e.testo))); }
{ let c = M.aggiungiMalus(g0, PB, { tipo: 'malattia', nome: 'Febbre lercia', veleno: { forma: 'ferimento', ts: 'Tempra', cd: 12, insorgenza: { n: 1, unita: 'giorni' }, frequenza: { unita: 'giorni', volte: null }, effetto: '1d3 Des', cura: 2 } }, rng);
  c = M.avanza(c, M.ROUND_GIORNO, meteo, rng); c = M.avanza(c, M.ROUND_GIORNO, meteo, rng);
  for (const e of [true, false, true, true]) { const q = c.coda.find(q => q.tipo === 'veleno'); c = M.esitoPromemoria(c, q.id, e, rng); if (c.pg[1].stato.malus.length) c = M.avanza(c, M.ROUND_GIORNO, meteo, rng); }
  t('H malattia senza limite: guarita con 2 TS consecutivi', c.pg[1].stato.malus.length === 0, c.pg[1].stato.malus);
  lancia('H CD mancante', () => M.aggiungiMalus(g0, PA, veleno({ cd: null }), rng), 'CD'); }
t('H tiraEffetto senza dadi', M.tiraEffetto('nauseato 1 round', rng).valore === null && M.tiraEffetto('2 Cos', rng).valore === 2);

// ---------------------------------------------------------------- I: scomposizione delle Ferite gravi (corpus: tutte le righe del Vol. 3)
const imp = fs.readFileSync(path.join(__dirname, 'guida', 'vol3_imprevisti.txt'), 'utf8').split('\n');
const corpus = []; { let tab = null, in_ = false; for (const r of imp) { if (r === '[TABELLA]') { in_ = true; continue; } if (r === '[/TABELLA]') { in_ = false; continue; }
  if (!in_) tab = r; else { const x = r.match(/^\| (-\d+) \| (.*) \|$/); if (x) corpus.push({ tab, riga: +x[1], testo: x[2] }); } } }
t('corpus: 90 righe delle Ferite gravi (−1…−15, Vol. 3 2.5.8)', corpus.length === 90, corpus.length);
const COND_RE = { Prono: /\bpron[oa]\b/i, Infermo: /\binferm[oa]\b/i, Nauseato: /\bnauseat[oa]\b/i, Barcollante: /\bbarcollante\b/i, Frastornato: /\bfrastornat[oa]\b/i, Stordito: /\bstordit[oa]\b/i,
  Azzoppato: /\bazzoppat[oa]\b/i, Offuscato: /\boffuscat[oa]\b/i, 'Privo di Sensi': /\bpriv[oa] di sensi\b/i };
{ let vuote = [], mancano = [];
  for (const r of corpus) {
    const k = M.scomponiFerita(r.testo, semi(r.riga + 30));
    if (!k.some(x => x.k !== 'nota') && !/scivola di mano|impugni un oggetto/.test(r.testo)) vuote.push(`${r.tab} ${r.riga}`);
    for (const [n, re] of Object.entries(COND_RE)) if (re.test(r.testo) && !k.some(x => x.k === 'condizione' && x.nome === n)) mancano.push(`${r.tab} ${r.riga} ${n}`);
    if (/ferita di gravità/.test(r.testo) && !k.some(x => x.k === 'ferita')) mancano.push(`${r.tab} ${r.riga} ferita`);
    if (/emorragia lieve/.test(r.testo) && !k.some(x => x.k === 'emorragia_lieve')) mancano.push(`${r.tab} ${r.riga} emorragia lieve`);
    if (/emorragia grave/.test(r.testo) && !k.some(x => x.k === 'emorragia_grave')) mancano.push(`${r.tab} ${r.riga} emorragia grave`);
    if (/Sei morto/.test(r.testo) !== k.some(x => x.k === 'morte')) mancano.push(`${r.tab} ${r.riga} morte`);
    if (/oggetto/.test(r.testo) && !k.some(x => x.k === 'nota' || x.k === 'oggetto')) mancano.push(`${r.tab} ${r.riga} nota`);
    if (/oggetto indossato/.test(r.testo) && !k.some(x => x.k === 'oggetto' && x.slot && x.tiro)) mancano.push(`${r.tab} ${r.riga} slot`);
    if (/ultimo nell/.test(r.testo) !== k.some(x => x.k === 'ultimo')) mancano.push(`${r.tab} ${r.riga} ultimo`);
    if (k.some(x => x.k === 'condizione' && x.durata.legata) && !k.some(x => x.key && k.find(y => y.k === 'condizione' && y.durata.legata === x.key))) mancano.push(`${r.tab} ${r.riga} legame`);
  }
  t('I1 ogni riga del corpus dà almeno un componente', !vuote.length, vuote);
  t('I1 ogni condizione, ferita, emorragia, morte e nota del testo è riconosciuta', !mancano.length, mancano); }
const riga = (tab, n) => corpus.find(r => r.tab.startsWith(tab) && r.riga === n).testo;
const sc = (tab, n, s = 5) => M.scomponiFerita(riga(tab, n), semi(s));
const del = (k, tipo) => k.filter(x => x.k === tipo);
{ const k = sc('1: Testa', -7); const o = del(k, 'condizione')[0];
  t('Testa −7: offuscato 33% legato all\'emorragia lieve, senza timer', o.nome === 'Offuscato' && o.perc === 33 && o.durata.legata === 'el' && del(k, 'emorragia_lieve')[0].timer === null, k); }
{ const k = sc('1: Testa', -9);
  t('Testa −9: stordito 1 round, barcollante 2 round', del(k, 'condizione').map(x => `${x.nome} ${x.durata.n}`).join() === 'Stordito 1,Barcollante 2', k); }
{ const k = sc('1: Testa', -10); const e = del(k, 'emorragia_lieve')[0], a = del(k, 'amputazione')[0];
  t('Testa −10: ferita 2 (20 PF), barcollante legato, emorragia 1d3+1 minuti', del(k, 'ferita')[0].pf === 20 && del(k, 'condizione')[0].durata.legata === 'f2' && e.timer.n >= 2 && e.timer.n <= 4 && e.timer.unita === 'minuti', k);
  t('Testa −10: parte del volto tirata', ['orecchio', 'mento', 'naso'].includes(a.loc) && a.tiro, a); }
{ const k = sc('1: Testa', -11); const a = del(k, 'amputazione')[0];
  t('Testa −11: occhio con il lato, offuscato 50% legato alla ferita 3', a.loc === 'occhio' && ['sinistro', 'destro'].includes(a.lato) && del(k, 'condizione')[0].perc === 50 && del(k, 'condizione')[0].durata.legata === 'f3', k); }
{ const k = sc('1: Testa', -12); t('Testa −12: punteggio mentale −2', /^(Intelligenza|Saggezza|Carisma) −2 permanente$/.test(del(k, 'penalita')[0].nome), k); }
{ const k = sc('1: Testa', -13); t('Testa −13: punteggio mentale −(1d3+1)', /−[234] permanente/.test(del(k, 'penalita')[0].nome), k); }
{ const k = sc('1: Testa', -14); t('Testa −14: coma permanente', del(k, 'condizione')[0].etichetta === 'Coma' && del(k, 'condizione')[0].durata.tipo === 'permanente', k); }
{ const k = sc('2-4: Busto', -11); const p = del(k, 'penalita')[0];
  t('Busto −11: privo di sensi 1 ora, penalità tirata, emorragia lieve', del(k, 'condizione')[0].durata.unita === 'ore' && Object.keys(p.mods).length === 1 && del(k, 'emorragia_lieve').length === 1, k); }
{ const k = sc('2-4: Busto', -13); t('Busto −13: Fatica e Ferita max −1 per livello, emorragia grave 24 PF', del(k, 'penalita')[0].mods.fatica_max_liv === -1 && del(k, 'emorragia_grave')[0].pf === 24, k); }
{ const k = sc('2-4: Busto', -14); t('Busto −14: arti inferiori paralizzati', del(k, 'altro')[0].nome === 'Arti inferiori paralizzati', k); }
{ const k = sc('2-4: Busto', -10); t('Busto −10: organo compromesso e oggetto con lo slot', del(k, 'organo').length === 1 && del(k, 'oggetto').length === 1 && /^slot (corpo \(armatura\)|torso|spalle|vita)$/.test(del(k, 'oggetto')[0].slot), k); }
{ const k = sc('5: Braccio', -5); t('Braccio −5: braccio inutilizzabile 2 round', del(k, 'altro')[0].nome === 'Braccio inutilizzabile' && del(k, 'altro')[0].durata.n === 2, k); }
{ const k = sc('5: Braccio', -10); t('Braccio −10: 1d2 dita della mano', del(k, 'dita')[0].parte === 'mano' && [1, 2].includes(del(k, 'dita')[0].n), k); }
{ const k = sc('5: Braccio', -13); t('Braccio −13: mano amputata, privo di sensi, emorragia grave', del(k, 'amputazione')[0].loc === 'mano' && del(k, 'emorragia_grave').length === 1 && del(k, 'condizione')[0].nome === 'Privo di Sensi', k); }
{ const k = sc('7: Gamba', -14); t('Gamba −14: gamba amputata', del(k, 'amputazione')[0].loc === 'gamba', k); }
{ const k = sc('Attacchi con area', -11); t('Area −11: 2 dita della mano con il lato', del(k, 'dita')[0].n === 2 && del(k, 'dita')[0].lato !== '', k); }
{ const k = sc('Attacchi con area', -13); t('Area −13: mano con il lato', del(k, 'amputazione')[0].loc === 'mano' && del(k, 'amputazione')[0].lato !== '', k); }
{ const k = sc('Danni a Costituzione', -8); const z = del(k, 'condizione')[0]; t('Cos −8: azzoppato 1d3+1 round', z.nome === 'Azzoppato' && z.durata.unita === 'round' && z.durata.n >= 2 && z.durata.n <= 4 && z.durata.tiro, k); }
{ const k1 = sc('Danni a Costituzione', -13), k2 = sc('Danni a Costituzione', -14);
  t('Cos −13/−14: attacco di panico 1 o 2 azioni', del(k1, 'panico')[0].azioni === 1 && del(k2, 'panico')[0].azioni === 2 && del(k1, 'panico')[0].passo === 5, [k1, k2]); }
{ const k = sc('Danni a Costituzione', -7); t('Cos −7: prono e infermo 1 minuto', del(k, 'condizione').map(x => x.nome + (x.durata.n || '')).join() === 'Prono,Infermo1', k); }
t('I1 testo scritto a mano', (() => { const k = M.scomponiFerita('sei barcollante per 3 round e infermo finché la ferita di gravità 1 (10 PF) non viene curata', rng);
  return k.length === 3 && k[0].durata.n === 3 && k[1].durata.legata === 'f1'; })());
t('I1 testo vuoto', M.scomponiFerita('  ', rng).length === 0);
t('I1 descrizioni', M.descriviComponente(sc('2-4: Busto', -12).find(x => x.k === 'emorragia_grave')).includes('5% cumulabile'));

// ---------------------------------------------------------------- Vol. 3 2.5.8: righe −1 e ferita grave dalla tabella (riga automatica)
{ const k = sc('1: Testa', -1); t('Testa −1: offuscato 20% per 2 round', k.length === 1 && k[0].nome === 'Offuscato' && k[0].perc === 20 && k[0].durata.n === 2 && k[0].durata.unita === 'round', k); }
{ const k = sc('2-4: Busto', -1); t('Busto −1: ultimo nell\'iniziativa', k.length === 1 && k[0].k === 'ultimo', k); }
{ const k = sc('5: Braccio', -1); t('Braccio −1: solo nota', k.length === 1 && k[0].k === 'nota', k); }
{ const k = M.scomponiFerita(riga('1: Testa', -12), facce([[1, 3], [3, 3], [30, 100]])); const o = del(k, 'oggetto')[0];
  t('Testa −12: slot tirato e 50% distrutto', o.slot === 'slot testa' && o.esito === 'è distrutto' && /d% 30/.test(o.tiro), o); }
{ const k = M.scomponiFerita(riga('1: Testa', -12), facce([[1, 3], [1, 3], [80, 100]])); t('Testa −12: oltre il 50% si danneggia due volte', del(k, 'oggetto')[0].esito === 'si danneggia due volte'); }
{ const k = M.scomponiFerita(riga('Attacchi con area', -6), semi(3)); const o = del(k, 'oggetto')[0];
  t('Area −6: lo slot è quello dell\'oggetto, non il braccio', /slot|oggetto impugnato/.test(o.slot), o); }
{ const r = M.feritaDaTabella(FER, 'colpire', -13, rng, 5);
  t('tabella: Braccio sinistro −13, mano sinistra', r.locazione === 'Braccio sinistro' && r.riga === -13 && r.comps.find(x => x.k === 'amputazione').lato === 'sinistro' && /Braccio sinistro/.test(r.titolo), r); }
{ const r = M.feritaDaTabella(FER, 'colpire', -9, facce([[8, 8]])); t('tabella: locazione tirata (1d8 = 8, Gamba destra), dita del piede destro', r.tiroLoc === '1d8 = 8' && r.locazione === 'Gamba destra' && r.comps.find(x => x.k === 'dita').lato === 'destro', r); }
{ const r = M.feritaDaTabella(FER, 'colpire', -2, facce([[3, 8]])); t('tabella: 2–4 = Busto', r.locazione === 'Busto'); }
t('tabella: −20 diventa −15', M.feritaDaTabella(FER, 'area', -20, rng).comps.some(x => x.k === 'morte'));
t('tabella: riga −1', M.feritaDaTabella(FER, 'costituzione', -1, rng).comps[0].k === 'ultimo');
lancia('tabella sconosciuta', () => M.feritaDaTabella(FER, 'xx', -3, rng), 'sconosciuta');
{ let c = avviaG(g0, [{ tipo: 'nemico', nome: 'Lupo', bonus: 0, n: 1 }]); c = M.comando(c, 'correggi', { id: rigaN(c, 'Lupo'), totale: 20 }, meteo, rng, 0);
  c = av(c); // tocca al Lupo; Aria ha già agito
  const r = M.feritaDaTabella(FER, 'colpire', -1, rng, 3); c = M.attaccaFerita(c, GA, r.comps, rng, FER, { titolo: r.titolo });
  const cb = c.combattimento, nomi = () => c.combattimento.ordine.map(id => c.combattimento.righe[id].nome).join();
  t('ultimo: Aria in fondo, il turno resta al Lupo', nomi() === 'Lupo,Bruno,Aria' && M.attuale(cb).nome === 'Lupo' && cb.righe[rigaN(c, 'Aria')].totale < cb.righe[rigaN(c, 'Bruno')].totale, nomi());
  c = av(c); t('ultimo: poi Bruno', M.attuale(c.combattimento).nome === 'Bruno');
  c = av(c); t('ultimo: Aria non agisce di nuovo in questo round', c.combattimento.round === 2 && M.attuale(c.combattimento).nome === 'Lupo', [c.combattimento.round, M.attuale(c.combattimento).nome]);
  c = av(c, 2); t('ultimo: al round dopo Aria agisce per ultima', M.attuale(c.combattimento).nome === 'Aria'); }
{ let c = avviaG(g0, []); const r = M.feritaDaTabella(FER, 'area', -1, rng); c = M.attaccaFerita(c, GB, r.comps, rng, FER, {});
  t('ultimo: chi non ha ancora agito va in fondo e agisce nel round', c.combattimento.ordine.map(id => c.combattimento.righe[id].nome).join() === 'Aria,Bruno' && M.attuale(c.combattimento).nome === 'Aria'); }

// ---------------------------------------------------------------- I: ferite attaccate, cure, Professione (cerusico), morte
const attacca = (c, tab, n, s = 5) => M.attaccaFerita(c, GA, M.scomponiFerita(riga(tab, n), semi(s)), semi(s + 1), FER, { titolo: `Ferita grave ${n}`, testo: riga(tab, n) });
{ let c = attacca(g0, '2-4: Busto', -9); const f = malA(c).find(m => m.tipo === 'ferita');
  t('I ferita di gravità 2 con la condizione legata', f.pf === 20 && malA(c).some(m => m.nome === 'Barcollante' && m.durata.legata === f.id));
  c = M.curaDiretta(c, PA, f.id, 12); t('I2 cure magiche dirette: contatore, PF invariati', malA(c).find(m => m.id === f.id).cure === 12 && pgA(c).stato.fatica === 42);
  c = M.curaDiretta(c, PA, f.id, 8); t('I2 guarita: sparisce anche la condizione legata', malA(c).length === 0 && c.log.some(e => /cure magiche/.test(e.testo))); }
{ let c = attacca(g0, '2-4: Busto', -7); const f = malA(c).find(m => m.tipo === 'ferita');
  c = M.cerusico(c, PA, f.id, 15, false, rng, FER).camp; const g = malA(c).find(m => m.id === f.id);
  t('I2 gravità 1 riuscita: guarisce dopo 1 giorno', g.cer.guarisce === c.tempo.R + M.ROUND_GIORNO && malA(c).some(m => m.nome === 'Infermo'));
  lancia('I2 già in guarigione', () => M.cerusico(c, PA, f.id, 30, false, rng, FER), 'guarisce');
  c = M.avanza(c, M.ROUND_GIORNO, meteo, rng); t('I2 dopo 1 giorno: ferita e Infermo spariscono', malA(c).length === 0); }
{ let c = attacca(g0, '5: Braccio', -9); const f = malA(c).find(m => m.tipo === 'ferita');
  let r = M.cerusico(c, PA, f.id, 21, true, rng, FER); c = r.camp;
  t('I2 senza medicinali −5: 21 → 16 su CD 20 fallita', !r.riuscita && r.totale === 16 && malA(c).find(m => m.id === f.id).cer.cd === 19);
  lancia('I2 si ritenta dopo 2 giorni', () => M.cerusico(c, PA, f.id, 30, false, rng, FER), 'ritentare');
  c = M.avanza(c, 2 * M.ROUND_GIORNO, meteo, rng); c = M.cerusico(c, PA, f.id, 19, false, rng, FER).camp;
  t('I2 CD −1 al secondo tentativo: riuscita', malA(c).find(m => m.id === f.id).cer.guarisce > c.tempo.R); }
{ let c = attacca(g0, '5: Braccio', -9, 8); const e = malA(c).find(m => m.tipo === 'emorragia_lieve');
  t('I emorragia lieve con la morte a tempo (2d4 minuti)', e.morte_R - c.tempo.R >= 20 && e.morte_R - c.tempo.R <= 80 && e.morte_R % 10 === c.tempo.R % 10);
  let r = M.cerusico(c, PA, e.id, 14, false, facce([[3, 4]]), FER); c = r.camp;
  t('I2 emorragia lieve fallita: ritenta dopo 1 round, CD 16', malA(c).find(m => m.id === e.id).cer.prossimo === c.tempo.R + 1 && malA(c).find(m => m.id === e.id).cer.cd === 16);
  c = M.avanza(c, 1, meteo, rng); c = M.cerusico(c, PA, e.id, 16, false, rng, FER).camp;
  t('I2 emorragia lieve fermata subito', !malA(c).some(m => m.tipo === 'emorragia_lieve') && malA(c).some(m => m.tipo === 'ferita')); }
{ let c = attacca(g0, '5: Braccio', -9, 8); const e = malA(c).find(m => m.tipo === 'emorragia_lieve');
  c = M.avanza(c, e.morte_R - c.tempo.R, meteo, rng);
  const q = c.coda.find(q => q.tipo === 'morte'); t('I3 emorragia lieve scaduta: avviso di morte', q && /emorragia lieve/.test(q.testo) && pgA(c).stato.morte);
  lancia('I3 l\'avviso non si chiude con Fatto', () => M.togliDallaCodaId(c, q.id), 'scegli');
  let r = M.risolviMorte(c, q.id, 'morente', facce([[15, 100]]));
  t('I3 20% del Morente riuscito: Morente 1 minuto', r.esito === 'morente' && malA(r.camp).some(m => m.nome === 'Morente'));
  let c2 = M.avanza(r.camp, 10, meteo, rng); t('I3 finito il minuto: Morto', malA(c2).some(m => m.nome === 'Morto') && !malA(c2).some(m => m.nome === 'Morente'));
  r = M.risolviMorte(c, q.id, 'morente', facce([[21, 100]])); t('I3 20% fallito: Morto', r.esito === 'morto' && malA(r.camp).some(m => m.nome === 'Morto'));
  r = M.risolviMorte(c, q.id, 'ignora', rng); t('I3 ignora: la morte si annulla', !pgA(r.camp).stato.morte && !r.camp.coda.some(x => x.tipo === 'morte')); }
{ let c = attacca(g0, '2-4: Busto', -15); t('I «Sei morto» apre l\'avviso', c.coda.some(q => q.tipo === 'morte')); }
{ let c = avviaG(attacca(g0, '2-4: Busto', -15), []); const r = M.risolviMorte(c, c.coda.find(q => q.tipo === 'morte').id, 'morto', rng);
  t('I3 Morto in combattimento: fuori dall\'iniziativa', r.camp.combattimento.righe[rigaN(r.camp, 'Aria')].stato === 'fuori' && M.attuale(r.camp.combattimento).nome === 'Bruno'); }
// emorragia grave: 5%, 10%, 15%… a fine turno; fuori combattimento a ogni round
{ let c = attacca(g0, '2-4: Busto', -12); const e = malA(c).find(m => m.tipo === 'emorragia_grave');
  c = M.avanza(c, 2, meteo, facce([[50, 100], [11, 100]])); t('I emorragia grave fuori combattimento: un tiro a round', !pgA(c).stato.morte && malA(c).find(m => m.id === e.id).p === 10);
  c = M.avanza(c, 1, meteo, facce([[15, 100]])); t('I emorragia grave: 15 su 15% = morte', !!pgA(c).stato.morte && c.coda.some(q => q.tipo === 'morte'));
  c = M.avanza(c, 5, meteo, rng); t('I dopo la morte niente altri tiri', malA(c).find(m => m.id === e.id).p === 15); }
{ let c = attacca(g0, '2-4: Busto', -12); c = avviaG(c, [{ tipo: 'nemico', nome: 'Orco', bonus: 0, n: 1 }]);
  c = M.comando(c, 'correggi', { id: rigaN(c, 'Orco'), totale: 20 }, meteo, rng, 0);
  const e = () => malA(c).find(m => m.tipo === 'emorragia_grave');
  c = M.comando(c, 'avanti', {}, meteo, facce([[80, 100]]), 0); t('I emorragia grave in combattimento: tiro alla fine del turno del PG', e().p === 5 && e().tiri === 1);
  c = av(c, 2); t('I nessun tiro al cambio di round né nei turni degli altri', e().p === 5, e()); }
// attacco di panico
{ let c = attacca(g0, 'Danni a Costituzione', -14); c = avviaG(c, []); const pa = () => malA(c).find(m => m.tipo === 'panico');
  c = M.spendiRoundCompleto(c, PA, pa().id); lancia('una sola volta per round', () => M.spendiRoundCompleto(c, PA, pa().id), 'già');
  c = av(c, 2); c = M.spendiRoundCompleto(c, PA, pa().id); t('I panico: due azioni consecutive lo fermano', !pa()); }
{ let c = attacca(g0, 'Danni a Costituzione', -14); c = avviaG(c, []); const pa = () => malA(c).find(m => m.tipo === 'panico');
  c = M.spendiRoundCompleto(c, PA, pa().id); c = av(c, 4); c = M.spendiRoundCompleto(c, PA, pa().id); t('I panico: non consecutive non bastano', !!pa()); }
// organo compromesso (F8)
{ let c = attacca(g0, 'Danni a Costituzione', -10); c = M.danno(c, GA, 30).camp;
  let r = M.rifiatare(c, GA, 2, facce([[6, 8], [5, 8]])); t('F8 Rifiatare dimezzato (11 → 5)', r.totale === 5 && r.divisore === 2 && pgA(r.camp).stato.fatica === 17);
  c = attacca(c, 'Danni a Costituzione', -10); r = M.rifiatare(c, GA, 2, facce([[6, 8], [6, 8]])); t('F8 la seconda volta a un terzo (12 → 4)', r.totale === 4);
  c = M.riposo(c, meteo, rng, [GA]); t('F8 riposo: recupero a un terzo (30 → 10)', pgA(c).stato.fatica === 22, pgA(c).stato.fatica); }
// amputazioni (tabella del Vol. 3)
{ const amp = (c, loc, lato) => M.attaccaFerita(c, GA, [{ k: 'amputazione', loc, lato }], rng, FER, {});
  let c = amp(g0, 'piede', 'sinistro');
  t('amputazione di un piede: Furtività e Acrobazia −5', vA(c).furtivita.valore === 9 && vA(c).libere[0].valore === 8 && vA(c).ca.valore === 19);
  c = amp(c, 'gamba', 'destro'); const v = vA(c);
  t('piede e gamba: «entrambi» (colto alla sprovvista, prono), niente −5', v.ca.valore === 15 && v.furtivita.valore === 14 && v.note.some(n => /Arti inferiori: entrambi/.test(n)) && v.condizioni.includes('Prono'), v);
  c = amp(g0, 'occhio', 'destro'); t('un occhio: CA −1', vA(c).ca.valore === 18);
  c = amp(c, 'occhio', 'sinistro'); t('due occhi: CA −2, sprovvista, offuscato 50%', vA(c).ca.valore === 13 && vA(c).offuscato === 50);
  c = amp(amp(g0, 'orecchio', 'destro'), 'orecchio', 'sinistro'); t('due orecchie: Iniziativa −4', vA(c).iniziativa.valore === 2);
  c = amp(g0, 'mento', ''); t('mento: Diplomazia −3 solo se c\'è nel riquadro', vA(c).percezione.valore === 12);
  c = M.attaccaFerita(g0, GA, [{ k: 'dita', parte: 'mano', n: 2, lato: 'destro' }], rng, FER, {}); t('2 dita: nessun effetto', vA(c).libere[1].valore === 10);
  c = M.attaccaFerita(c, GA, [{ k: 'dita', parte: 'mano', n: 1, lato: 'destro' }], rng, FER, {}); t('3 dita della stessa mano = mano persa (Professione −5)', vA(c).libere[1].valore === 5, vA(c).libere); }
{ let c = attacca(g0, '2-4: Busto', -13); const v = vA(c);
  t('penalità per livello (7): Fatica e Ferita max −7', v.fatica_max.valore === 35 && v.ferita_max.valore === 33);
  c = M.cura(M.danno(c, GA, 5).camp, GA, 50); t('la cura si ferma ai massimi ridotti', pgA(c).stato.fatica === 35 && pgA(c).stato.ferita <= 33, pgA(c).stato); }
{ let c = avviaG(g0, [{ tipo: 'nemico', nome: 'Orco', bonus: 0, n: 1 }]); const orco = rigaN(c, 'Orco');
  c = M.aggiungiMalus(c, { riga: orco }, cond('Prono'), rng);
  t('malus su un nemico', c.combattimento.righe[orco].malus.length === 1);
  lancia('causa fuori dall\'iniziativa', () => M.aggiungiMalus(c, PA, cond('Scosso', { n: 1, unita: 'round' }, { scadenza: 'causa', causa: 'r999' }), rng), 'iniziativa'); }

// ---------------------------------------------------------------- dati e migrazione delle campagne della Build 1
t('ferite.json: 5 righe per fermare e 8 amputazioni', FER.fermare.length === 5 && FER.amputazioni.length === 8 && M.rigaFermare(FER, { tipo: 'ferita', gravita: 3 }).cd === 25);
{ const g = fs.readFileSync(path.join(__dirname, 'guida', 'vol1_condizioni.txt'), 'utf8').split('\n');
  const v1 = COND.condizioni.filter(x => x.testo_vol1);
  t('condizioni.json: testi del Vol. 1 uguali all\'estratto', v1.length === 5 && v1.every(x => g.includes('•  ' + x.testo_vol1)));
  t('condizioni.json: 37 in rosso, Morente non colorato', COND.condizioni.filter(x => x.rossa).length === 37 && COND.condizioni.find(x => x.nome === 'Morente').rossa === false); }
{ const vecchia = fs.readFileSync(path.join(__dirname, 'prove', 'campagna_build1.json'), 'utf8');
  const c = M.importa(vecchia).campagne[0];
  t('Build 1: la campagna salvata si apre', c.pg.length === 2 && c.pg.every(p => Array.isArray(p.stato.malus)) && Object.values(c.combattimento.righe).every(r => Array.isArray(r.malus)));
  let x = M.aggiungiMalus(c, { pg: c.pg[0].id }, cond('Scosso', { n: 2, unita: 'round' }), rng);
  x = M.aggiungiMalus(x, { riga: Object.values(x.combattimento.righe).find(r => r.tipo === 'nemico').id }, cond('Prono'), rng);
  x = M.comando(x, 'avanti', {}, meteo, rng, 0); x = M.comando(x, 'avanti', {}, meteo, rng, 0); x = M.comando(x, 'avanti', {}, meteo, rng, 0);
  t('Build 1: malus e turni sulla campagna migrata', x.combattimento.round >= 2 && M.valoriPG(x, x.pg[0]).tempra.mod <= -2 || x.pg[0].stato.malus.length === 0);
  t('Build 1: migra non cambia i valori correnti', c.pg[0].stato.ferita === JSON.parse(vecchia).dati.pg[0].stato.ferita && c.coda.length === JSON.parse(vecchia).dati.coda.length); }

console.log(`test: ${ok} superati, ${ko} falliti`);
process.exit(ko ? 1 : 0);
