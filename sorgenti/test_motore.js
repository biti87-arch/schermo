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

console.log(`test: ${ok} superati, ${ko} falliti`);
process.exit(ko ? 1 : 0);
