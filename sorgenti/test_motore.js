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

// ---------------------------------------------------------------- stagioni (Tabelle del Tempo Atmosferico v1.0, Cap. 1)
function stagioneIl(zona, mese, giorno) { const c = M.clona(camp); c.tempo.R = M.tempoAssoluto(c, 1462, mese - 1, giorno); return M.stagione(c, meteo, c.tempo.R, zona); }
const casi = [['1', 3, 20, 'inverno'], ['1', 3, 21, 'primavera'], ['1', 6, 21, 'primavera'], ['1', 6, 22, 'estate'],
  ['1', 9, 22, 'estate'], ['1', 9, 23, 'autunno'], ['1', 12, 21, 'autunno'], ['1', 12, 22, 'inverno'], ['1', 1, 1, 'inverno'],
  ['10', 9, 22, 'primavera-estate'], ['10', 9, 23, 'autunno-inverno'], ['9', 3, 21, 'primavera-estate'], ['9', 2, 28, 'autunno-inverno'],
  ['12', 7, 1, 'piogge'], ['12', 12, 1, 'secca'], ['15', 4, 1, 'calma'], ['15', 10, 1, 'tempeste'], ['14', 1, 5, 'inverno'], ['16', 7, 1, null]];
for (const [z, m, g, s] of casi) t(`stagione ${z} ${g}/${m}`, stagioneIl(z, m, g) === s, stagioneIl(z, m, g));
{ // ogni giorno dell'anno ha una sola stagione in ogni zona (il Sotterraneo nessuna)
  let buchi = 0; for (const z of meteo.zone.map(x => x.id)) for (let doy = 0; doy < 365; doy++) {
    const { mese, giorno } = M.dataDaGiornoAnno(camp.calendario, doy);
    const n = meteo.stagioni[z].filter(s => { const v = (mese + 1) * 100 + giorno, a = s.da[1] * 100 + s.da[0], b = s.a[1] * 100 + s.a[0]; return a <= b ? v >= a && v <= b : v >= a || v <= b; }).length;
    if (n !== (z === '16' ? 0 : 1)) buchi++; }
  t('stagioni senza buchi né sovrapposizioni (17 zone)', buchi === 0, buchi); }

// ---------------------------------------------------------------- calendario personalizzato
const calP = { tipo: 'personalizzato', mesi: [{ nome: 'Brina', giorni: 30, stagione: 'inverno' }, { nome: 'Germoglio', giorni: 40, stagione: 'primavera' },
  { nome: 'Sole', giorni: 35, stagione: 'estate' }, { nome: 'Foglia', giorni: 25, stagione: 'autunno' }], settimana: ['Uno', 'Due', 'Tre', 'Quattro', 'Cinque'] };
const campP = M.creaCampagna({ ...base, calendario: calP, anno: { numero: 7, etichetta: '' }, partenza: { mese: 1, giorno: 40, ore: 23, min: 55, sett: 4 }, zona: 'desertica' }, meteo, semi(5));
t('anno personalizzato', M.lunghezzaAnno(campP.calendario) === 130);
t('data personalizzata', M.formatoData(campP) === 'Cinque 40 Germoglio 7, 23:55', M.formatoData(campP));
t('zona vecchia «desertica» → 10 Deserto sabbioso', campP.zona === '10');
t('stagione dal mese (zona 10: primavera → Primavera-estate)', M.stagione(campP, meteo, campP.tempo.R) === 'primavera-estate');
{ const c = M.clona(campP); c.tempo.R = M.tempoAssoluto(c, 7, 3, 3); t('stagione dal mese (autunno → Autunno-inverno)', M.stagione(c, meteo, c.tempo.R) === 'autunno-inverno');
  t('stagione dal mese, zona a quattro stagioni', M.stagione(c, meteo, c.tempo.R, '14') === 'autunno' && M.stagione(c, meteo, c.tempo.R, '12') === 'secca'); }
{ const c2 = M.avanza(campP, 50, meteo, semi(9)); t('cambio di mese e settimana di 5 giorni', M.formatoData(c2) === 'Uno 1 Sole 7, 00:00', M.formatoData(c2));
  const c3 = M.avanza(campP, 130 * M.ROUND_GIORNO, meteo, semi(9)); t('anno dopo', M.scomponi(c3).anno === 8); }
lancia('mese senza stagione', () => M.creaCampagna({ ...base, calendario: { tipo: 'personalizzato', mesi: [{ nome: 'X', giorni: 10 }] } }, meteo, rng), 'stagione');
lancia('campagna senza nome', () => M.creaCampagna({ ...base, nome: ' ' }, meteo, rng), 'nome');
lancia('zona sconosciuta', () => M.creaCampagna({ ...base, zona: 'polare' }, meteo, rng), 'zona');
{ const senza = { tipo: 'personalizzato', mesi: calP.mesi, settimana: [] }; const c = M.creaCampagna({ ...base, calendario: senza, anno: { numero: 1 } }, meteo, rng);
  t('calendario senza settimana', M.scomponi(c).sett === null && !/^Uno/.test(M.formatoData(c))); }

// ---------------------------------------------------------------- meteo (AA1)
{ let righe = 0, sbagli = 0;
  for (const z in meteo.tabelle) for (const s in meteo.tabelle[z]) for (let tiro = 1; tiro <= 100; tiro++) {
    const e = M.esitoMeteo(meteo, z, s, tiro); righe++;
    if (e.opzioni.length !== 1) sbagli++;
    for (const o of e.opzioni) { const ef = M.effettiMeteo(meteo, o); if (!ef.every(x => x.testo)) sbagli++; if (ef.length < 1) sbagli++; } }
  t('ogni tiro di ogni tabella ha i suoi effetti (46 tabelle)', sbagli === 0 && righe === 4600, [righe, sbagli]); }
{ const e = M.esitoMeteo(meteo, '9', 'autunno-inverno', 100); const ef = M.effettiMeteo(meteo, e.opzioni[0]);
  t('Gelo + Tempesta di grandine', ef.map(x => x.nome).join('|') === 'Arsura / Gelo|Tempesta di grandine / polvere / sabbia / cenere', ef); }
t('la campagna nasce con il meteo tirato (zona 1, primavera)', camp.zona === '1' && camp.meteo && camp.meteo.tiro >= 1 && camp.meteo.stagione === 'primavera');
const alle = (c, h, m = 0) => { const x = M.clona(c); x.tempo.R = Math.floor(x.tempo.R / M.ROUND_GIORNO) * M.ROUND_GIORNO + h * M.ROUND_ORA + m * M.ROUND_MIN; return x; };
const aZona = (c, z, mese, giorno) => { let x = M.cambiaZona(M.clona(c), meteo, z); x.tempo.R = M.tempoAssoluto(x, 1462, mese - 1, giorno, 8); x.log = []; return x; };
{ const c = M.tiraMeteo(camp, meteo, facce([[2, 4], [3, 4]]), 92); const m = M.meteoCorrente(c, meteo);
  t('tiro fisso primavera 92 = Acquazzone, 2d4 = 5 ore dalle 06:00', m.testo === 'Acquazzone' && m.durata.ore === 5 && m.durate === 'Acquazzone 5 ore, dalle 06:00 alle 11:00', m.durate);
  t('alle 08:00 vale l\'Acquazzone', M.vociAllOra(alle(c, 8), meteo).join() === 'Acquazzone');
  t('alle 12:00 il clima base (prima riga: Clima mite)', M.vociAllOra(alle(c, 12), meteo).join() === 'Clima mite');
  t('prima dell\'alba il clima base', M.vociAllOra(alle(c, 3), meteo).join() === 'Clima mite');
  const c2 = M.avanza(alle(c, 9), 3 * M.ROUND_ORA, meteo, rng); t('la fine della durata va nel log', c2.log.some(l => l.testo === 'Finisce Acquazzone: ora Clima mite'), c2.log.slice(-3));
  const c3 = M.impostaInizioDurata(c, 14); t('inizio della durata scelto dal GM', M.vociAllOra(alle(c3, 15), meteo).join() === 'Acquazzone' && M.vociAllOra(alle(c3, 8), meteo).join() === 'Clima mite');
  const c4 = M.impostaInizioDurata(c, 21); t('la durata non va oltre la mezzanotte', c4.meteo.durata.a === (c4.meteo.giorno + 1) * M.ROUND_GIORNO);
  lancia('inizio della durata senza durata', () => M.impostaInizioDurata(M.tiraMeteo(camp, meteo, rng, 10), 8), 'durata'); }
{ const c = M.tiraMeteo(camp, meteo, facce([[2, 4]]), 100);
  t('Nebbia: si dirada 1d4 ore dopo l\'alba', c.meteo.nebbia.ore === 2 && M.vociAllOra(alle(c, 7), meteo).join() === 'Nebbia' && M.vociAllOra(alle(c, 8), meteo).join() === 'Clima mite');
  t('Nebbia: riga nel log', M.avanza(alle(c, 7), M.ROUND_ORA * 2, meteo, rng).log.some(l => /La Nebbia si dirada/.test(l.testo))); }
{ const c = M.tiraMeteo(aZona(camp, '1', 7, 10), meteo, rng, 90);
  t('Arsura dalle 10 alle 18, prima e dopo Clima caldo', c.meteo.testo === 'Arsura' && M.vociAllOra(alle(c, 12), meteo).join() === 'Arsura' && M.vociAllOra(alle(c, 9), meteo).join() === 'Clima caldo' && M.vociAllOra(alle(c, 18), meteo).join() === 'Clima caldo'); }
{ const c = M.tiraMeteo(aZona(camp, '10', 7, 10), meteo, rng, 65);
  t('notti fredde: 23:00 Clima freddo, 08:00 Clima caldo, 12:00 Canicola', M.vociAllOra(alle(c, 23), meteo).join() === 'Clima freddo' && M.vociAllOra(alle(c, 8), meteo).join() === 'Clima caldo' && M.vociAllOra(alle(c, 12), meteo).join() === 'Canicola');
  const d2 = M.tiraMeteo(aZona(camp, '10', 7, 10), meteo, rng, 72); t('notti fredde: le altre voci restano', M.vociAllOra(alle(d2, 2), meteo).join() === 'Clima freddo,Miraggi'); }
{ let c = M.tiraMeteo(aZona(camp, '6', 1, 10), meteo, rng, 10); t('Montagne in inverno: Gelo', M.meteoCorrente(c, meteo).voci.join() === 'Gelo');
  c = M.impostaVariante(c, meteo, 'oltre4500', true); t('oltre 4.500 m: Gelo → Gelo polare', M.meteoCorrente(c, meteo).voci.join() === 'Gelo polare' && M.vociAllOra(c, meteo).join() === 'Gelo polare');
  lancia('variante di un\'altra zona', () => M.impostaVariante(c, meteo, 'steppa_fredda', true), 'variante'); }
{ let c = M.tiraMeteo(aZona(camp, '12', 12, 1), meteo, rng, 60); c = M.impostaVariante(c, meteo, 'steppa_fredda', true);
  t('steppa fredda nella stagione secca: Arsura → Gelo', M.meteoCorrente(c, meteo).voci.join() === 'Gelo');
  let p = M.tiraMeteo(aZona(M.impostaVariante(aZona(camp, '12', 7, 1), meteo, 'steppa_fredda', true), '12', 7, 1), meteo, rng, 1); t('steppa fredda: niente nella stagione delle piogge', p.meteo.stagione === 'piogge' && !M.meteoCorrente(p, meteo).voci.includes('Clima freddo')); }
{ let c = M.tiraMeteo(aZona(camp, '13', 7, 1), meteo, facce([[1, 4], [1, 4]]), 100); c = M.impostaVariante(c, meteo, 'lontano_costa', true);
  t('lontano dalla costa: Uragano → Tempesta di vento + Monsone', M.meteoCorrente(c, meteo).voci.join() === 'Tempesta di vento,Monsone'); }
{ const c = M.tiraMeteo(aZona(camp, '5', 4, 1), meteo, rng, 92); const m = M.meteoCorrente(c, meteo);
  t('stato del mare: Vento forte → agitato, Nuotare CD 15', m.mare && m.mare.stato === 'Agitato' && m.mare.nuotare === 15, m.mare);
  t('stato del mare: calmo', M.statoMare(M.tiraMeteo(aZona(camp, '5', 4, 1), meteo, rng, 1), meteo).stato === 'Calmo');
  t('stato del mare: tempestoso', M.statoMare(M.tiraMeteo(aZona(camp, '5', 4, 1), meteo, facce([[4, 4], [4, 4]]), 100), meteo, ['Tempesta di vento']).stato === 'Tempestoso');
  t('stato del mare solo sulle coste e in mare', M.statoMare(camp, meteo) === null); }
{ let c = aZona(camp, '16', 7, 1); c = M.tiraMeteo(c, meteo, rng, 75);
  t('Sotterraneo: Clima fresco + Stillicidio', c.meteo.stagione === null && M.vociAllOra(c, meteo).join() === 'Clima fresco,Stillicidio' && M.meteoCorrente(c, meteo).effetti[1].testo.includes('senza prova'));
  c = M.nuovaZonaGallerie(c, meteo, rng, 100); t('Nuova zona di gallerie: Grotte gelate', M.vociAllOra(c, meteo).join() === 'Clima fresco,Grotte gelate');
  const d2 = M.impostaMeteo(c, meteo, 'Aria viziata', rng); t('Sotterraneo: condizione a mano', d2.meteo.sotterraneo.nome === 'Aria viziata' && d2.meteo.manuale);
  t('Sotterraneo: il cambio di giorno tira la condizione', M.avanza(c, M.ROUND_GIORNO, meteo, rng).meteo.sotterraneo.tiro >= 1);
  lancia('Nuova zona di gallerie fuori dal Sotterraneo', () => M.nuovaZonaGallerie(camp, meteo, rng), 'Sotterraneo');
  lancia('Predire il tempo nel Sotterraneo', () => M.prediciTempo(c, meteo, rng, 30), 'Sotterraneo'); }
{ let c = M.prediciTempo(camp, meteo, rng, 14); t('Predire il tempo fallito', !c.previsioni && /fallito/.test(c.log[c.log.length - 1].testo));
  c = M.prediciTempo(camp, meteo, semi(4), 25); t('Predire il tempo 25: 3 giorni', c.previsioni.giorni.length === 3 && c.previsioni.giorni[0].giorno === M.scomponi(c).N + 1, c.previsioni);
  const p = c.previsioni.giorni[0], c2 = M.avanza(c, M.ROUND_GIORNO, meteo, semi(99));
  t('il giorno previsto usa il tiro già fatto', c2.meteo.tiro === p.tiro && c2.previsioni.giorni.length === 2 && c2.log.some(l => /previsto/.test(l.testo)));
  const c3 = M.cambiaZona(c2, meteo, '2'); t('cambiando zona le previsioni si cancellano', c3.previsioni === null && c3.log.some(l => /Previsioni del tempo cancellate/.test(l.testo))); }
{ const c = M.impostaMeteo(camp, meteo, 'Nebbia', rng); t('meteo impostato a mano', c.meteo.manuale && c.meteo.testo === 'Nebbia' && c.meteo.nebbia); lancia('meteo fuori tabella', () => M.impostaMeteo(camp, meteo, 'Monsone', rng), 'tabella'); }
{ const conta = {}; let c = M.clona(camp); const r = semi(11); for (let i = 0; i < 4000; i++) { c = M.tiraMeteo(c, meteo, r); conta[c.meteo.testo] = (conta[c.meteo.testo] || 0) + 1; c.log = []; }
  t('distribuzione primavera della zona 1 (85% mite)', conta['Clima mite'] / 4000 > 0.82 && conta['Clima mite'] / 4000 < 0.88, conta); }
{ const v = M.clona(camp); v.zona = 'temperata'; v.meteo = { giorno: v.meteo.giorno, zona: 'desertica', stagione: 'primavera-estate', tiro: 100, testo: 'Clima caldo + Tempesta di polvere/sabbia', opzioni: [['Clima caldo', 'Tempesta di polvere/sabbia']], scelta: 0, manuale: false };
  const m = M.migra(v); t('migrazione del meteo: zone e voce vecchia', m.zona === '1' && m.meteo.zona === '10' && m.meteo.opzioni[0][1] === 'Tempesta di sabbia' && m.meteo.testo === 'Clima caldo + Tempesta di sabbia');
  const w = M.clona(m); w.meteo = { ...w.meteo, zona: '1', stagione: 'inverno', opzioni: [['Pioggia battente'], ['Neve']], testo: 'Pioggia battente / Neve' };
  const x = M.scegliOpzioneMeteo(w, 1); t('alternative delle campagne vecchie: si sceglie ancora', M.meteoCorrente(x, meteo).voci.join() === 'Neve'); lancia('opzione inesistente', () => M.scegliOpzioneMeteo(w, 2)); }

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
{ let c = M.clona(c1); c.scorte.recipienti = false; t('consumo = PG + accompagnatori', M.consumoGiornaliero(c) === 4); t('bastano per 5 giorni', M.bastanoPer(c, 'cibo') === 5);
  const g0 = M.scomponi(c).N;
  c = M.avanza(c, M.ROUND_GIORNO, meteo, semi(8)); t('un giorno: −4 e −4', c.scorte.cibo === 16 && c.scorte.acqua === 16, c.scorte);
  t('meteo del giorno nuovo', c.meteo.giorno === g0 + 1);
  c = M.modificaScorta(c, 'acqua', -13); t('scorta ridotta', c.scorte.acqua === 3);
  c = M.avanza(c, M.ROUND_GIORNO, meteo, semi(8));
  const z = M.razionamentoAperto(c);
  t('acqua insufficiente: giorno in sospeso, nulla consumato', z && z.scorta === 'acqua' && c.scorte.acqua === 3 && c.scorte.cibo === 12, [z, c.scorte]);
  t('avviso di razionamento in coda', c.coda.length === 1 && c.coda[0].tipo === 'razionamento' && /3 razioni per un fabbisogno di 4/.test(c.coda[0].testo), c.coda);
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

// ---------------------------------------------------------------- dati e migrazione delle campagne della Build 1 (e, più sotto, della 2a)
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

// ================================================================ Build 2b: bestiario e PNG (M), incontri (N), tattiche (O)
const RAZZE = require('./razze.json'), DIV = require('./divieti.json');
const SB = path.join(__dirname, 'prove', 'statblock');
const leggi = f => M.leggiStatBlock(fs.readFileSync(path.join(SB, f), 'utf8'));
const tuttiBlocchi = fs.readdirSync(SB).filter(f => f.startsWith('UltimaSoglia_')).flatMap(f => leggi(f).map(b => ({ f, ...b })));
const conGS = fs.readdirSync(SB).filter(f => f.startsWith('UltimaSoglia_')).reduce((a, f) => a + fs.readFileSync(path.join(SB, f), 'utf8').split('\n').filter(r => /·\s*(vale\s+)?GS\s*\d/.test(r) && /^[A-ZÀ-Ý]/.test(r)).length, 0);
t('Incolla: un blocco per ogni testata «NOME … · GS N» dei documenti (43)', tuttiBlocchi.length === conGS && conGS === 43, [tuttiBlocchi.length, conGS]);
t('Incolla: ogni blocco ha nome, GS, CA e PF', tuttiBlocchi.every(b => b.scheda.nome && b.scheda.gs && b.scheda.ca !== null && b.scheda.pf !== null), tuttiBlocchi.filter(b => !(b.scheda.ca !== null && b.scheda.pf !== null)).map(b => b.scheda.nome));
t('Incolla: Fatica + Ferita = PF in tutti i blocchi', tuttiBlocchi.every(b => b.scheda.fatica + b.scheda.ferita === b.scheda.pf));
t('Incolla: niente righe perse nei blocchi tranne le note «❓» (Guscio nero)', tuttiBlocchi.filter(b => b.scheda.altro).every(b => /❓|^[\d.]+ /.test(b.scheda.altro)), tuttiBlocchi.filter(b => b.scheda.altro).map(b => b.scheda.nome + ': ' + b.scheda.altro.slice(0, 40)));
{ const s = leggi('UltimaSoglia_Doc2B_AttoII_LaBarriera.txt')[0].scheda;
  t('Merkh: testata (PNG alleato, Pistolero 7, GS 6, XP 2.400)', s.nome === 'Merkh' && s.tipo_scheda === 'png' && s.alleato && s.livello === 7 && s.gs === '6' && s.xp === 2400 && s.classi_testo === 'Pistolero 7', s);
  t('Merkh: iniziativa, sensi e Percezione', s.iniziativa === 7 && s.sensi === 'visione crepuscolare' && s.percezione === 13);
  t('Merkh: CA, scomposizione e PF', s.ca === 18 && s.ca_contatto === 15 && s.ca_sprovvista === 13 && /^\[10 \+ 3 armatura/.test(s.ca_scomp) && s.pf === 63 && s.fatica === 31 && s.ferita === 32);
  t('Merkh: TS, BaB, BMC, DMC', s.tempra === 7 && s.riflessi === 8 && s.volonta === 5 && s.bab === '+7/+2' && s.bmc === '+9' && s.dmc === '22');
  t('Merkh: attacchi a distanza e in mischia', /^fucile \+1 \(sintonia\) \+12\/\+7/.test(s.distanza) && /^morso \+4/.test(s.mischia) && /Bocca da fuoco/.test(s.speciali));
  t('Merkh: caratteristiche, talenti, abilità, lingue, tratti, sintonia', s.car.For === 14 && s.car.Car === 8 && /Iniziativa migliorata/.test(s.talenti) && /^Acrobazia \+13/.test(s.abilita) && /^comune, felino/.test(s.lingue) && /^Sensi acuti/.test(s.tratti) && /^fucile \+1/.test(s.sintonia) && /^fucile \(arma/.test(s.equip));
  t('Merkh: le cinque tattiche', ['prima', 'r1', 'r23', 'fatica', 'fuga'].every(k => s.tattiche[k]) && /^mai dal battello/.test(s.tattiche.fuga));
  t('Merkh: senza tratto razziale nelle tattiche → da verificare', M.segnalazioni(s, DIV).some(x => x.livello === 'verifica' && /tratto razziale/.test(x.testo)));
  const piatto = fs.readFileSync(path.join(SB, 'UltimaSoglia_Doc2B_AttoII_LaBarriera.txt'), 'utf8').split('\n').map(r => r.trim()).join('\n');
  const p = M.leggiStatBlock(piatto)[0].scheda;
  t('Incolla senza rientri: stessi valori', p.ca === s.ca && p.pf === s.pf && p.tempra === s.tempra && p.bab === s.bab && Object.keys(s.tattiche).every(k => !!p.tattiche[k] === !!s.tattiche[k]), [p.tattiche, s.tattiche]); }
{ const b = leggi('UltimaSoglia_Doc3B_AttoIII_XinGrafar.txt'), v = b[0].scheda, sl = b[1].scheda, g = b[2].scheda;
  t('Vash: nome, classe con archetipo, livello', v.nome === 'Vash Stampide' && v.classi_testo === 'Pistolero (Pistolero agile) 13' && v.livello === 13 && v.note_testata === 'Risvegliato di Mortimer ★');
  t('Vash: scomposizione della CA = 28, nessun errore', M.sommaScomposizione(v.ca_scomp) === 28 && !M.segnalazioni(v, DIV).some(x => x.livello === 'errore'), M.segnalazioni(v, DIV));
  t('Vash: nota di PF e nota dei TS', /^\[10 \+ 12 × 6,5/.test(v.pf_nota) && /bonus eroico \+2 compreso/.test(v.ts_note) && /contro illusioni/.test(v.ts_note));
  t('Sleppen: CA 15 con la nota «fuori dal guscio», PF 61', sl.ca === 15 && /fuori dal guscio/.test(sl.ca_scomp) && M.sommaScomposizione(sl.ca_scomp) === 15 && sl.pf === 61);
  t('Sleppen: «Prima:» e «Finita la Fatica (o fuori dal guscio):»', /^è dentro il guscio/.test(sl.tattiche.prima) && /^\(o fuori dal guscio\) Droni/.test(sl.tattiche.fatica));
  t('Guscio nero: «vale GS 11» è un blocco a sé', g.nome === 'Il Guscio Nero' && g.gs === '11' && g.tipo_scheda === 'mostro_pf1'); }
{ const b = leggi('UltimaSoglia_Doc4B_AttoV_LImbalsamatore.txt'), mo = b[4].scheda;
  t('Mortimer: nome in minuscolo con le particelle', mo.nome === 'Mortimer von Crist, «l\'Imbalsamatore»', mo.nome);
  t('Mortimer: GS 16 con livello 13 → da verificare (modello ★)', M.segnalazioni(mo, DIV).some(x => x.livello === 'verifica' && /GS 16 con livello 13/.test(x.testo)));
  t('Squadra del presidio: truppa ★, una voce sola', b[0].scheda.nome === 'Squadra del Presidio ★' && b[0].scheda.pf === 120); }
{ const s = leggi('UltimaSoglia_Doc2A_AttoII_Traversata.txt')[3].scheda;
  t('Leccapece: CA 24 ma la scomposizione fa 22 (errore del documento)', s.nome === 'Leccapece' && M.segnalazioni(s, DIV).some(x => x.livello === 'errore' && x.testo === 'CA 24, ma la scomposizione fa 22'));
  t('Leccapece: sezione «RIDUZIONE ONTOLOGICA (Sop)» dopo la DIFESA, capacità magiche', s.extra.length === 1 && s.extra[0].dopo === 'difesa' && /^Colpo pulito/.test(s.extra[0].testo) && /^CAPACITÀ MAGICHE \(Mag\)/.test(s.incantesimi)); }
{ const b = leggi('sezione_Doc1_Bevek_docx2txt.txt'), bv = b[0].scheda, sc = b[1].scheda;
  t('Sezione del Doc 1 (righe vuote, formato vecchio): Bevek e gli sciacalli', b.length === 2 && bv.nome === 'Bevek' && bv.epiteto === 'sergente disertore' && bv.classi_testo === 'Guerriero 8' && bv.livello === 8);
  t('Bevek: «tocco» e «colto in fallo», «CA = 10 + …», CMB/CMD', bv.ca === 23 && bv.ca_contatto === 10 && M.sommaScomposizione(bv.ca_scomp) === 23 && bv.bmc === '+12' && bv.dmc === '23');
  t('Bevek: PF senza divisione → divisi dall\'app', bv.pf === 68 && bv.fatica === 34 && bv.ferita === 34 && b[0].avvisi.some(a => /divisi/.test(a)));
  t('Bevek: Competenza nelle armi esotiche → talento proibito', M.segnalazioni(bv, DIV).some(x => x.livello === 'errore' && /talento proibito: «Competenza nelle Armi Esotiche»/.test(x.testo)));
  t('Sciacallo (x4): quantità suggerita, GS 3 ciascuno', sc.n_suggerito === 4 && sc.gs === '3' && sc.xp === 800 && sc.nome === 'Sciacallo');
  t('Bevek: la sezione «💰 RICOMPENSE» chiude il blocco', !/RICOMPENSE|TESORO CASUALE/.test(M.testoStatBlock(sc))); }
{ const b = leggi('sezione_Doc4B_6-2_6-3_docx2txt.txt');
  t('Sezione 6.2–6.3 del Doc 4B: Mohrg, Imbalsamato e Golem; il testo fra i blocchi resta fuori', b.length === 3 && b.map(x => x.scheda.nome).join(',') === 'Mohrg,Imbalsamato,Golem di Carne Imbalsamato ★' && !/golem/i.test(b[1].scheda.tattiche.generale), b.map(x => x.scheda.nome));
  t('Mohrg: «solo Punti Ferita» (non morto della Collana)', b[0].scheda.fatica === 0 && b[0].scheda.ferita === 98 && b[0].scheda.solo_ferita && !M.segnalazioni(b[0].scheda, DIV).some(x => /divisione/.test(x.testo))); }
// «Copia come testo» e di nuovo «Incolla»: gli stessi valori (ordine del §10)
{ const CHIAVI = ['nome', 'gs', 'xp', 'livello', 'iniziativa', 'percezione', 'ca', 'ca_contatto', 'ca_sprovvista', 'pf', 'fatica', 'ferita', 'tempra', 'riflessi', 'volonta', 'bab', 'bmc', 'dmc', 'alleato', 'tipo_scheda'];
  const diversi = [];
  for (const b of tuttiBlocchi) { const s = b.scheda, txt = M.testoStatBlock(s), r = M.leggiStatBlock(txt);
    if (r.length !== 1) { diversi.push(s.nome + ': blocchi ' + r.length); continue; }
    const x = r[0].scheda; for (const k of CHIAVI) if (JSON.stringify(x[k]) !== JSON.stringify(s[k])) diversi.push(`${s.nome}: ${k} ${JSON.stringify(s[k])} → ${JSON.stringify(x[k])}`);
    for (const k of Object.keys(s.tattiche)) if (!!x.tattiche[k] !== !!s.tattiche[k]) diversi.push(`${s.nome}: tattica ${k}`); }
  t('Copia come testo → Incolla: stessi valori in tutti i 43 blocchi', !diversi.length, diversi.slice(0, 8));
  const txt = M.testoStatBlock(tuttiBlocchi.find(b => b.scheda.nome === 'Merkh').scheda).split('\n');
  t('Copia come testo: ordine del §10', /^MERKH — Pistolero 7 · GS 6 · XP 2\.400 \(alleato: non si assegna\)/.test(txt[0]) && /^Razza: /.test(txt[1]) && /^Iniziativa \+7 \| Sensi/.test(txt[2]) &&
    txt.indexOf('── DIFESA ──') < txt.indexOf('── OFFESA ──') && txt.indexOf('── OFFESA ──') < txt.indexOf('── STATISTICHE ──') && txt.indexOf('── STATISTICHE ──') < txt.indexOf('── TATTICHE ──'), txt.slice(0, 3));
  const xp = M.testoStatBlock({ ...tuttiBlocchi[0].scheda, gs: '9', xp: null });
  const ts = { ...tuttiBlocchi[0].scheda, tesoro: { livello: '12', quantita: '1 primario', dove: 'addosso a Inuviel', note: 'arma e armatura' } }, rt = M.leggiStatBlock(M.testoStatBlock(ts))[0].scheda.tesoro;
  t('Promemoria del tesoro (💰): Copia come testo e di nuovo Incolla', JSON.stringify(rt) === JSON.stringify(ts.tesoro), rt);
  t('Copia come testo: XP dalla tabella con il punto delle migliaia', /· GS 9 · XP 6\.400/.test(xp), xp.split('\n')[0]); }
// segnalazioni (M6)
{ const s = M.schedaVuota('png'); s.nome = 'Prova'; s.livello = 5; s.gs = '4'; s.xp = 1200;
  s.talenti = 'Colpo vitale, Arma focalizzata, Spezzare le difese'; s.abilita = 'Guarire +6, Linguistica +3, Conoscenze (locali) +4, Conoscenze (piani) +2';
  s.speciali = 'Evoca mostri II · Invisibilità 1/giorno · Disarmare migliorato (tolto: proibito)'; s.velocita = '9 m, volare 9 m'; s.sintonia = 'spada +2';
  s.tattiche = { r1: 'Attacca', prima: '', r23: '', fatica: 'Resta morente a terra', fuga: '', tratto: '', generale: '' };
  const sg = M.segnalazioni(s, DIV), ha = re => sg.some(x => re.test(x.testo));
  t('Segnalazioni: talento proibito', ha(/talento proibito: «Colpo vitale»/) && !ha(/Spezzare/));
  t('Segnalazioni: abilità inesistenti con il sostituto', ha(/«Guarire» → Professione \(cerusico\)/) && ha(/«Linguistica»/) && ha(/«Conoscenze \(locali\)» → Conoscenze \(generali\)/) && ha(/«Conoscenze \(piani\)» → Conoscenze \(proibite\)/));
  t('Segnalazioni: incantesimi inesistenti; la manovra tolta non si segnala', ha(/«Evoca mostri»/) && ha(/«Invisibilità» → Svanire/) && !ha(/Disarmare/));
  t('Segnalazioni: Morente, volo del PNG, Sintonia oltre il tetto (+1 al 5°)', ha(/«morente»/) && ha(/volo oltre 1 m/) && ha(/Sintonia \+2 oltre il tetto \+1 al 5°/));
  t('Segnalazioni: tattiche senza fuga e senza tratto razziale', ha(/senza fuga o resa/) && ha(/senza tratto razziale/));
  s.velocita = '9 m, volare 9 m (eccezione: ali del modello)'; t('Segnalazioni: volo con motivo dichiarato', !M.segnalazioni(s, DIV).some(x => /volo/.test(x.testo)));
  const mo = { ...s, tipo_scheda: 'mostro_pf1', velocita: '9 m, volare 18 m' }; t('Segnalazioni: i mostri hanno il volo standard', !M.segnalazioni(mo, DIV).some(x => /volo/.test(x.testo)));
  t('Segnalazioni: XP diversi dalla tabella', M.segnalazioni({ ...s, xp: 999 }, DIV).some(x => /XP 999: per GS 4 sono 1\.200/.test(x.testo)));
  t('Segnalazioni: GS diverso da livello − 1 o livello', M.segnalazioni({ ...s, gs: '7', velocita: '9 m' }, DIV).some(x => x.livello === 'errore' && /GS 7 con livello 5/.test(x.testo)));
  t('Segnalazioni: scheda senza tattiche', M.segnalazioni(M.schedaVuota('png'), DIV).some(x => /mancano le tattiche/.test(x.testo))); }
// scheda guidata (M4): stessi numeri dello statblock.py della campagna (Guardia del molo)
const guidata = (dati, car, extra) => { const s = M.schedaVuota('png'); s.nome = 'Prova'; Object.assign(s.car, car || {}); Object.assign(s.guida, dati); Object.assign(s, extra || {}); return s; };
{ const s = guidata({ classi: [{ classe: 'Guerriero', livello: 9, dv: 10 }], bab: 9, ts_base: { tempra: 6, riflessi: 3, volonta: 3 }, razza: 'Nani', taglia: 'media',
    armatura: { nome: 'corazza di bande', base: 7, sintonia: 2, des_max: 1 }, scudo: { nome: 'scudo pesante', base: 2, sintonia: 0 },
    armi: [{ nome: 'ascia da battaglia', sintonia: 2, danni: '1d8', critico: '×3' }] }, { For: 18, Des: 12, Cos: 14, Int: 10, Sag: 12, Car: 8 }, { allineamento: 'LN' });
  const r = M.calcolaGuida(s, RAZZE), c = r.campi;
  t('Guidata: CA 22 (contatto 11, sprovvista 21) con la scomposizione', c.ca === 22 && c.ca_contatto === 11 && c.ca_sprovvista === 21 && c.ca_scomp === '[10 + armatura 9 (corazza di bande 7 + sintonia 2) + scudo 2 (scudo pesante 2) + Des 1]', c);
  t('Guidata: PF 80 (primo DV pieno + 6,5 × 8 + Cos), Fatica 40 / Ferita 40', c.pf === 80 && c.fatica === 40 && c.ferita === 40 && c.pf_dadi === '9d10+18');
  t('Guidata: TS con il bonus eroico +1 al 9°', c.tempra === 9 && c.riflessi === 5 && c.volonta === 5 && c.ts_note === '(bonus eroico +1 compreso)');
  t('Guidata: BaB iterativo, BMC, DMC, attacco', c.bab === '+9/+4' && c.bmc === '+13' && c.dmc === '24' && c.mischia === 'ascia da battaglia +2 (sintonia) +15/+10 (1d8+6, ×3)', c.mischia);
  t('Guidata: GS 8, XP 4.800, razza dal Razze.md', c.gs === '8' && c.xp === 4800 && c.razza_riga === 'Umanoide Medio (nano) · LN' && M.applicaGuida(s, RAZZE).sensi === 'scurovisione 18 m' && M.applicaGuida(s, RAZZE).velocita === '6 m', c.razza_riga);
  t('Guidata: nessun avviso; controllo del BAB', !r.avvisi.length && /veloce 9/.test(r.det.bab)); }
{ const s = guidata({ classi: [{ classe: 'Guerriero', livello: 12, dv: 10 }], bab: 12, ts_base: { tempra: 8, riflessi: 4, volonta: 4 }, taglia: 'piccola',
    armi: [{ nome: 'spadone', sintonia: 3, danni: '2d6', critico: '19–20', due_mani: true }], attacco_poderoso: true, talenti: [{ nome: 'Iniziativa migliorata', tipo: 'liv' }, { nome: 'Attacco poderoso', tipo: 'C' }],
    abilita: [{ nome: 'Furtività', gradi: 5, di_classe: true }, { nome: 'Percezione', gradi: 0, di_classe: true }] }, { For: 16, Des: 14, Cos: 12, Sag: 10 });
  const c = M.calcolaGuida(s, RAZZE).campi;
  t('Guidata 12° piccola: CA con taglia +1 e bonus eroico +3', c.ca === 10 + 2 + 1 + 3 && c.ca_contatto === 16 && /taglia 1 \+ bonus eroico 3/.test(c.ca_scomp), c);
  t('Guidata 12°: TS con il bonus eroico +2, DMC con +3 e taglia −2', c.tempra === 8 + 1 + 2 && c.dmc === String(10 + 12 + 3 + 2 - 2 + 3) && c.bmc === '+13');
  t('Guidata: Iniziativa migliorata +4', c.iniziativa === 6);
  t('Guidata: Attacco poderoso a BAB 12 (4 gradini, +50% a due mani)', /\n  con Attacco poderoso: \+15\/\+10\/\+5 \(2d6\+19\)/.test(c.mischia), c.mischia);
  t('Guidata: Furtività con la taglia, +3 di classe solo con gradi', /Furtività \+12/.test(c.abilita) && /Percezione \+0/.test(c.abilita) && c.percezione === 0, c.abilita);
  t('Guidata: talenti con (C) e il conteggio', c.talenti === 'Iniziativa migliorata, Attacco poderoso (C)' && M.calcolaGuida(s, RAZZE).det.talenti === '1 di livello + 1 (C) + 0 (R)'); }
{ const s = guidata({ classi: [{ classe: 'Bardo', livello: 6, dv: 8 }, { classe: 'Intrepido', livello: 5, dv: 10 }], bab: 9, robustezza: true }, { Cos: 12 });
  t('Guidata multiclasse: PF 8 + 5 × 5,5 + 5 × 6,5 + Cos + Robustezza', M.calcolaGuida(s, RAZZE).campi.pf === Math.floor(8 + 27.5 + 32.5 + 11 + 11) && M.calcolaGuida(s, RAZZE).campi.classi_testo === 'Bardo 6 / Intrepido 5'); }
{ const s = guidata({ classi: [{ classe: 'Ladro', livello: 1, dv: 8 }], bab: 1 }); t('Guidata: GS 1/2 al 1° livello, 1 con capacità o trama', M.calcolaGuida(s, RAZZE).campi.gs === '1/2' && M.calcolaGuida({ ...s, capacita_trama: true }, RAZZE).campi.gs === '1');
  const a = M.calcolaGuida(guidata({ classi: [{ classe: 'Ladro', livello: 8, dv: 8 }], bab: 5, armatura: { base: 2, sintonia: 2 } }), RAZZE).avvisi;
  t('Guidata: BAB fuori progressione e Sintonia oltre il tetto', a.some(x => /BAB \+5 non corrisponde/.test(x)) && a.some(x => /armatura \+2 oltre il tetto \+1/.test(x)), a);
  const al = M.calcolaGuida(guidata({ classi: [{ classe: 'Ladro', livello: 6, dv: 8 }], bab: 4 }, {}, { alleato: true }), RAZZE).campi; t('Guidata: alleato senza XP', al.gs === '5' && al.xp === null); }
{ const s = M.schedaVuota('mostro_pf1'); s.guida.pf_bestiario = 75; s.guida.gs_bestiario = '1/2'; const c = M.calcolaGuida(s, RAZZE).campi;
  t('Mostro da PF1: PF del bestiario divisi (dispari ai Ferita), GS e XP del bestiario', c.fatica === 37 && c.ferita === 38 && c.xp === 200 && s.guida.attiva === false); }
t('Razze: 40 razze e 18 tratti generici, taglie della struttura', RAZZE.razze.length === 40 && RAZZE.generici.voci.length === 18 && RAZZE.razze.every(r => M.TAGLIE_PNG[r.taglia]));
// schede: elenchi, ricerca, unione dei mostri importati
{ let L = []; const a = M.nuovaScheda({ nome: 'Lupo', gs: '1', preferito: false, etichette: ['bosco'] }, rng, 5, 'm'), b = M.nuovaScheda({ nome: 'Orco', gs: '3', preferito: true, razza_riga: 'Umanoide Medio (orco)' }, rng, 5, 'm');
  L = M.salvaScheda(M.salvaScheda(L, a, 6), b, 6);
  t('Schede: id diversi, salvate in ordine', a.id !== b.id && L.length === 2 && /^m/.test(a.id));
  lancia('Schede: senza nome', () => M.salvaScheda(L, { ...a, nome: ' ' }), 'nome');
  t('Schede: ricerca per nome, tipo, GS, etichetta, preferiti (preferiti in testa)', M.cercaSchede(L, {})[0].nome === 'Orco' && M.cercaSchede(L, { testo: 'lup' }).length === 1 && M.cercaSchede(L, { tipo: 'umanoide' })[0].nome === 'Orco'
    && M.cercaSchede(L, { gs_min: 2 }).length === 1 && M.cercaSchede(L, { etichetta: 'bos' })[0].nome === 'Lupo' && M.cercaSchede(L, { preferiti: true }).length === 1);
  const u = M.unisciMostri(L, [a, { ...b, gs: '4' }, M.nuovaScheda({ nome: 'Troll' }, rng, 7, 'm')], rng, 8);
  t('Mostri importati: aggiunti i nuovi, copia di quelli cambiati', u.aggiunti === 1 && u.copie === 1 && u.lista.length === 4 && u.lista.some(x => x.nome === 'Orco (importato)'));
  t('Mostri importati da una campagna: solo quelli che mancano', M.unisciMostri(L, [{ ...b, gs: '4' }], rng, 8, true).lista.length === 2); }
// incontri (N), avvio, tattiche nella barra (O), PF dei nemici (J9), ferite gravi dei nemici
{ const best = [M.nuovaScheda(tuttiBlocchi.find(b => b.scheda.nome === 'Sciacallo' || b.scheda.nome === 'Imbalsamato').scheda, rng, 1, 'm')];
  const sch = { ...tuttiBlocchi.find(b => b.scheda.nome === 'Merkh').scheda };
  let c = M.creaCampagna({ ...base, nome: 'Incontri', pg: [{ ...M.SCHEDA_VUOTA, nome: 'Aria', fatica_max: 20, ferita_max: 20, iniziativa: 3 }, { ...M.SCHEDA_VUOTA, nome: 'Bruno', fatica_max: 20, ferita_max: 20 }] }, meteo, semi(9), 1);
  const png = M.nuovaScheda({ ...sch, alleato: false, nome: 'Capitano' }, rng, 2, 'p'); c = M.salvaPNG(c, png, 3);
  const schedaDi = rif => rif.fonte === 'mostro' ? best.find(m => m.id === rif.id) : c.png.find(p => p.id === rif.id);
  const inc = { titolo: 'Agguato al molo', atto: 'Atto II', capitolo: 'Cap. 2', luogo: 'molo', note: '**Attenti** al ponte\n- uno\n- due',
    partecipanti: [{ rif: { fonte: 'mostro', id: best[0].id }, nome: best[0].nome, n: 3, modo: 'tipo', nascosto: false, nomeTv: 'Figure bendate' },
      { rif: { fonte: 'png', id: png.id }, nome: 'Capitano', n: 1, modo: 'singolo' }], promemoria: [{ round: 2, testo: 'crolla il ponte' }, { round: 1, testo: 'nebbia' }] };
  lancia('Incontro senza titolo', () => M.salvaIncontro(c, { ...inc, titolo: '' }), 'titolo');
  lancia('Incontro: quantità non valida', () => M.salvaIncontro(c, { ...inc, partecipanti: [{ nome: 'x', n: 0 }] }), 'quantità');
  c = M.salvaIncontro(c, inc); const id = c.incontri[0].id;
  t('Incontro salvato, promemoria in ordine di round', c.incontri.length === 1 && c.incontri[0].promemoria[0].round === 1 && c.incontri[0].stato === 'da giocare');
  let d2 = M.duplicaIncontro(c, id); c = M.salvaIncontro(d2.camp, { ...d2.camp.incontri.find(x => x.id === d2.id), atto: 'Atto I', capitolo: '' });
  c = M.salvaIncontro(c, { ...inc, titolo: 'Il ritorno', atto: 'Atto II', capitolo: 'Cap. 10' });
  const k = M.cartelle(c);
  t('Cartelle per atto e capitolo, in ordine naturale', k.length === 2 && k[0].atto === 'Atto I' && k[1].capitoli.map(x => x.capitolo).join(',') === 'Cap. 2,Cap. 10' && k[0].capitoli[0].incontri[0].titolo === 'Agguato al molo (copia)');
  const xp = M.xpIncontro(c.incontri[0], schedaDi);
  t('XP dell\'incontro: somma dei partecipanti × quantità', xp.totale === M.xpDi(best[0]) * 3 + M.xpDi(png) && !xp.mancanti.length, xp);
  t('XP dell\'incontro: alleati esclusi, schede mancanti segnalate', M.xpIncontro({ partecipanti: [{ rif: { fonte: 'png', id: png.id }, nome: 'x', n: 1 }, { rif: { fonte: 'mostro', id: 'zz' }, nome: 'Fantasma', n: 1 }] }, r => r.id === png.id ? { ...png, alleato: true } : null).mancanti[0] === 'Fantasma');
  const nem = c.incontri[0].partecipanti.map(p => M.nemicoDaPartecipante(p, schedaDi));
  t('Avvia: il bonus d\'iniziativa viene dalla scheda', nem[0].bonus === best[0].iniziativa && nem[1].bonus === 7 && nem[0].nomeTv === 'Figure bendate' && nem[0].rif.id === best[0].id);
  // combattimento dall'incontro, PF dei nemici spenti
  const part = [{ tipo: 'pg', pgId: c.pg[0].id, totale: 30 }, { tipo: 'pg', pgId: c.pg[1].id, totale: 1 }, ...nem.map(x => ({ tipo: 'nemico', ...x, pf: M.pfDaScheda(schedaDi(x.rif)) }))];
  let x = M.avviaCombattimento(c, part, semi(4), 0, { incontro: id, promemoria: c.incontri[0].promemoria, titolo: inc.titolo });
  const righe = Object.values(x.combattimento.righe), lupi = righe.find(r => r.n === 3), cap = righe.find(r => r.nome === 'Capitano');
  t('Avvio dall\'incontro: righe con la scheda, gruppo ×3, senza PF (J9 spenta)', lupi && cap && lupi.rif.id === best[0].id && lupi.pf === null && x.combattimento.incontro === id);
  t('Promemoria del round 1 nel log', x.log.some(e => e.testo === 'Round 1: nebbia'));
  const tCap = M.tatticheTurno(x, schedaDi, cap.id);
  t('Tattiche round 1: Prima del combattimento e Round 1; Fuga o resa a parte', tCap.voci.map(v => v.k).join(',') === 'prima,r1' && /^mai dal battello/.test(tCap.fuga));
  x = M.comando(x, 'faticaFinita', { id: cap.id }, meteo, rng, 0);
  t('«Fatica finita» (J9 spenta): compare la tattica', M.tatticheTurno(x, schedaDi, cap.id).voci.some(v => v.k === 'fatica'));
  x = M.indietro(x); t('Indietro annulla «Fatica finita»', !M.tatticheTurno(x, schedaDi, cap.id).voci.some(v => v.k === 'fatica'));
  while (x.combattimento.round === 1) x = M.comando(x, 'avanti', {}, meteo, rng, 0);
  t('Round 2: tattica «Round 2–3» e promemoria del round', M.tatticheTurno(x, schedaDi, cap.id).voci.map(v => v.k).join(',') === 'r23' && M.promemoriaRound(x)[0] === 'crolla il ponte' && x.log.some(e => e.testo === 'Round 2: crolla il ponte'));
  while (x.combattimento.round < 4) x = M.comando(x, 'avanti', {}, meteo, rng, 0);
  t('Round 4: nessuna tattica automatica', M.tatticheTurno(x, schedaDi, cap.id).voci.length === 0);
  t('Istantanee di «Indietro» senza PNG e incontri', x.combattimento.storia.every(st => !/"png":|"incontri":/.test(st)));
  x = M.salvaPNG(x, { ...png, nome: 'Capitano Rossi' }, 9); x = M.indietro(x);
  t('Indietro non cancella le modifiche ai PNG', x.png[0].nome === 'Capitano Rossi' && x.incontri.length === 3);
  x = M.comando(x, 'fuori', { id: lupi.id }, meteo, rng, 0);
  const f = M.fineCombattimento({ ...x, impostazioni: { ...x.impostazioni, xp: true } }, 0, schedaDi);
  t('Fine del combattimento: incontro giocato con la data', f.camp.incontri.find(i => i.id === id).stato === 'giocato' && f.camp.incontri.find(i => i.id === id).giocato_R === x.tempo.R);
  t('Fine: XP dei nemici sconfitti divisi per i PG (J10)', f.riepilogo.xp.sconfitti === M.xpDi(best[0]) * 3 && f.riepilogo.xp.perPG === Math.floor(M.xpDi(best[0]) * 3 / 2), f.riepilogo.xp);
  t('Fine senza XP nella campagna: niente XP', M.fineCombattimento(x, 0, schedaDi).riepilogo.xp === undefined);
  // J9 accesa: PF per creatura, danno, separazione e ferita grave del nemico
  let y = M.avviaCombattimento({ ...c, impostazioni: { ...c.impostazioni, pf_nemici: true } }, part, semi(4), 0, { incontro: id });
  const g3 = Object.values(y.combattimento.righe).find(r => r.n === 3), pf0 = M.pfDaScheda(best[0]);
  t('J9: tre creature con i loro PF', g3.pf.length === 3 && g3.pf[1].fatica === pf0.fatica && g3.pf[1].ferita_max === pf0.ferita);
  let r1 = M.dannoRiga(y, g3.id, 1, pf0.fatica); y = r1.camp;
  t('J9: danno prima ai Fatica; Fatica finita → tattica', y.combattimento.righe[g3.id].pf[1].fatica === 0 && r1.feritaGrave === null && M.faticaFinita(y.combattimento.righe[g3.id]));
  y = M.curaRiga(y, g3.id, 1, 3); t('J9: la cura va prima ai Ferita (pieni) poi ai Fatica', y.combattimento.righe[g3.id].pf[1].fatica === 3);
  r1 = M.dannoRiga(y, g3.id, 1, 3 + pf0.ferita + 4); y = r1.camp;
  const sep = y.combattimento.righe[r1.feritaGrave.id];
  t('J9: Ferita sotto 0 in un gruppo → la creatura si separa, riga della ferita −4', r1.feritaGrave.riga === -4 && sep.n === 1 && sep.nome === `${best[0].nome} 2` && y.combattimento.righe[g3.id].n === 2 && y.combattimento.righe[g3.id].pf.length === 2 && sep.pf[0].ferita === -4);
  const fg = M.feritaDaTabella(FER, 'costituzione', -1, rng);
  y = M.attaccaFerita(y, { riga: sep.id }, fg.comps, rng, FER, { titolo: fg.titolo });
  t('Ferita grave sul nemico: riga −1 «ultimo nell\'iniziativa» sulla riga separata', y.combattimento.ordine[y.combattimento.ordine.length - 1] === sep.id);
  const fg2 = M.feritaDaTabella(FER, 'area', -11, rng); y = M.attaccaFerita(y, { riga: sep.id }, fg2.comps, rng, FER, { titolo: fg2.titolo });
  t('Ferita grave sul nemico: ferita ed emorragia sulla riga', y.combattimento.righe[sep.id].malus.some(m => m.tipo === 'ferita') && y.combattimento.righe[sep.id].malus.some(m => m.tipo === 'emorragia_lieve'));
  const fg3 = M.feritaDaTabella(FER, 'area', -15, rng); y = M.attaccaFerita(y, { riga: sep.id }, fg3.comps, rng, FER, { titolo: fg3.titolo });
  const qm = y.coda.find(q => q.tipo === 'morte' && q.chi.riga === sep.id);
  t('Morte del nemico: avviso; «Morto» lo mette fuori combattimento', qm && M.risolviMorte(y, qm.id, 'morto', rng).camp.combattimento.righe[sep.id].stato === 'fuori');
  const s2 = M.separaPerFerita(y, g3.id, 0); t('Ferita grave dal pulsante su un gruppo: prima si separa una creatura', s2.camp.combattimento.righe[s2.id].n === 1 && s2.camp.combattimento.righe[g3.id].n === 1);
  y = M.comando(y, 'separa', { id: g3.id, nome: 'Ultimo' }, meteo, rng, 0);
  t('Separa con i PF: la creatura separata porta i suoi', Object.values(y.combattimento.righe).find(r => r.nome === 'Ultimo').pf.length === 1 && y.combattimento.righe[g3.id].pf.length === 1);
  // esporta e importa con i mostri condivisi
  const e = M.esporta(c, 'campagna', M.mostriUsati(c, best)), im = M.importa(e);
  t('Esporta una campagna con i mostri dei suoi incontri', im.mostri.length === 1 && im.mostri[0].id === best[0].id && im.campagne[0].incontri.length === 3 && im.campagne[0].png.length === 1);
  const tutto = M.importa(M.esporta({ campagne: [c], bestiario: { mostri: best } }, 'tutto'));
  const solo = M.importa(M.esporta({ mostri: best }, 'bestiario'));
  t('Esporta tutto e solo il bestiario', tutto.campagne.length === 1 && tutto.mostri.length === 1 && solo.campagne.length === 0 && solo.mostri[0].nome === best[0].nome);
  // PNG generici condivisi (fonte 'generico'): esportati con la campagna che li usa
  const gen = [M.nuovaScheda({ nome: 'Guardia cittadina', tipo_scheda: 'png', gs: '1' }, rng, 3, 'g'), M.nuovaScheda({ nome: 'Mendicante' }, rng, 3, 'g')];
  const cg = M.salvaIncontro(c, { titolo: 'Ronda', partecipanti: [{ rif: { fonte: 'generico', id: gen[0].id }, nome: 'Guardia cittadina', n: 3 }] });
  const u2 = M.condiviseUsate(cg, { mostri: best, generici: gen });
  t('PNG generici: solo quelli usati dagli incontri', u2.generici.length === 1 && u2.generici[0].nome === 'Guardia cittadina' && u2.mostri.length === 1 && /^g/.test(gen[0].id));
  const ig = M.importa(M.esporta(cg, 'campagna', u2));
  t('PNG generici: esportati e importati con la campagna', ig.generici.length === 1 && ig.mostri.length === 1);
  const tg = M.importa(M.esporta({ campagne: [cg], bestiario: { mostri: best, generici: gen } }, 'tutto'));
  t('PNG generici: «Esporta tutto» e unione', tg.generici.length === 2 && M.unisciMostri([gen[0]], tg.generici, rng, 4, false, 'g').lista.length === 2);
  t('Esporta con un elenco di soli mostri (Build 2b)', M.importa(M.esporta(c, 'campagna', best)).mostri.length === 1);
  lancia('Importa: mostri non validi', () => M.importa(JSON.stringify({ formato: M.FORMATO, tipo: 'bestiario', dati: { mostri: [{ x: 1 }] } })), 'mostri'); }
// migrazione: le campagne della Build 1 e della Build 2a si aprono e si usano
for (const f of ['campagna_build1.json', 'campagna_build2a.json']) {
  const vecchia = fs.readFileSync(path.join(__dirname, 'prove', f), 'utf8'), c = M.importa(vecchia).campagne[0], j = JSON.parse(vecchia).dati;
  t(`${f}: PNG e incontri vuoti, righe senza scheda`, Array.isArray(c.png) && Array.isArray(c.incontri) && Object.values(c.combattimento.righe).every(r => r.rif === null && r.pf === null));
  t(`${f}: malus, PF e coda invariati`, c.pg.every((p, i) => p.stato.ferita === j.pg[i].stato.ferita && p.stato.malus.length === (j.pg[i].stato.malus || []).length) && c.coda.length === j.coda.length);
  let x = M.salvaPNG(c, M.nuovaScheda({ nome: 'Oste' }, rng, 1, 'p'), 1); x = M.salvaIncontro(x, { titolo: 'Rissa', partecipanti: [{ nome: 'Oste', n: 1, rif: { fonte: 'png', id: x.png[0].id } }] });
  x = M.comando(x, 'avanti', {}, meteo, rng, 0); x = M.comando(x, 'avanti', {}, meteo, rng, 0); x = M.indietro(x);
  t(`${f}: turni, Indietro, PNG e incontri sulla campagna migrata`, x.png.length === 1 && x.incontri.length === 1 && M.tatticheTurno(x, () => null) === null);
  if (f === 'campagna_build2a.json') {
    const br = x.pg.find(p => p.scheda.nome === 'Bruno');
    t('Build 2a: veleno, ferita gravità 3, emorragia e dita (mano sinistra) restano', ['veleno', 'ferita', 'emorragia_lieve', 'dita'].every(k => br.stato.malus.some(m => m.tipo === k)) && M.amputazioniAttive(br).length === 0 && br.stato.malus.some(m => m.nome === 'Dita perse: 2 (mano sinistra)'));
    const r = M.fineCombattimento(x, 0, () => null); t('Build 2a: fine del combattimento sulla campagna migrata', !r.camp.combattimento && r.riepilogo.xp === undefined);
  }
}

// ================================================================ Build 2c: scorte e Foraggiare (AA2), compagnia (AA3)
{ // campagna di base: Aria e Bruno + 2 accompagnatori senza nome, zona 1 primavera
  const meteoA = (c, z, mese, giorno, tiro, h = 8) => { let x = M.cambiaZona(M.clona(c), meteo, z); x.tempo.R = M.tempoAssoluto(x, 1462, mese - 1, giorno, h); x = M.tiraMeteo(x, meteo, facce([[2, 4], [2, 4]]), tiro); x.log = []; x.coda = []; return x; };
  t('compagnia nuova: gli accompagnatori sono «senza nome»', c1.compagnia.senza_nome === 2 && c1.scorte.accompagnatori === undefined && c1.scorte.foraggio === 0 && c1.scorte.recipienti === true);
  t('impostazioni: «Usa le scorte» accesa', c1.impostazioni.scorte === true);
  // AA2-1: acqua ×2 con l'Arsura, ×3 con la Canicola
  let c = meteoA(c1, '1', 7, 10, 90); c.scorte.recipienti = false;
  t('moltiplicatore: Arsura ×2', M.moltiplicatoreAcqua(c, meteo) === 2 && M.fabbisogno(c, 'acqua', 2) === 8);
  let x = M.avanza(c, M.ROUND_GIORNO, meteo, rng); t('Arsura: −8 d\'acqua, −4 di cibo', x.scorte.acqua === 12 && x.scorte.cibo === 16 && x.log.some(l => /acqua ×2/.test(l.testo)), x.scorte);
  c = meteoA(c1, '10', 7, 10, 65); c.scorte.recipienti = false; x = M.avanza(c, M.ROUND_GIORNO, meteo, rng); t('Canicola: ×3', x.scorte.acqua === 8, x.scorte);
  // razionamento con l'acqua ×2: ogni persona scelta beve 2 razioni
  c = meteoA(c1, '1', 7, 10, 90); c.scorte.recipienti = false; c.scorte.acqua = 5; x = M.avanza(c, M.ROUND_GIORNO, meteo, rng);
  const z = M.razionamentoAperto(x); t('acqua ×2 insufficiente: in sospeso con k = 2', z && z.k === 2 && /fabbisogno di 8/.test(x.coda.find(q => q.tipo === 'razionamento').testo));
  lancia('acqua ×2: 3 persone = 6 razioni, ce ne sono 5', () => M.risolviRazionamento(x, z.id, { buone: ['pg:' + A, 'pg:' + B], senza_buone: 1 }, meteo), 'solo 5');
  x = M.risolviRazionamento(x, z.id, { buone: ['pg:' + A], senza_buone: 1 }, meteo);
  t('acqua ×2: bevono Aria e un accompagnatore (−4)', x.scorte.acqua === 1 && x.pg[1].stato.sete.penalita === 1 && x.pg[0].stato.sete.penalita === 0);
  // AA2-2: pioggia con i recipienti
  c = meteoA(c1, '1', 4, 10, 88); x = M.avanza(c, M.ROUND_GIORNO, meteo, rng);
  t('Pioggia battente con i recipienti: l\'acqua non scende', x.scorte.acqua === 20 && x.scorte.cibo === 16 && x.log.some(l => /Pioggia battente: acqua raccolta con i recipienti/.test(l.testo)));
  c = M.impostaRecipienti(c, false); x = M.avanza(c, M.ROUND_GIORNO, meteo, rng); t('senza recipienti l\'acqua scende', x.scorte.acqua === 16);
  c = meteoA(c1, '1', 4, 10, 92); x = M.avanza(c, M.ROUND_GIORNO, meteo, rng); t('Acquazzone di 4 ore: acqua raccolta lo stesso', x.scorte.acqua === 20);
  c = meteoA(c1, '16', 4, 10, 75); x = M.avanza(c, M.ROUND_GIORNO, meteo, rng); t('Stillicidio: acqua senza prova', x.scorte.acqua === 20 && x.log.some(l => /Stillicidio/.test(l.testo)));
  // AA2-7: scorte spente
  c = M.clona(c1); c.impostazioni.scorte = false; x = M.avanza(c, 3 * M.ROUND_GIORNO, meteo, rng);
  t('scorte spente: niente consumo né Fame e Sete', x.scorte.cibo === 20 && x.scorte.acqua === 20 && !x.razionamenti.length && x.pg.every(p => !p.stato.fame.penalita));
  lancia('Foraggiare con le scorte spente', () => M.foraggia(c, meteo, rng, [{ pg: A, totale: 20 }]), 'spente');

  // AA3: compagnia
  let k = M.aggiungiAccompagnatore(c1, { nome: 'Hassim', ruolo: 'guida', rif: { fonte: 'png', id: 'p1' } });
  const H = k.compagnia.persone[0].id;
  k = M.aggiungiAnimale(k, { nome: 'Fulmine', tipo: 'cavalcatura', padrone: 'pg:' + A, mangia: 'foraggio', cibo: 2, acqua: 2 });
  k = M.aggiungiAnimale(k, { nome: 'Zanna', tipo: 'compagno', padrone: 'acc:' + H, mangia: 'razioni', rif: { fonte: 'mostro', id: 'm1' } });
  const [F, Zn] = k.compagnia.animali.map(a => a.id);
  lancia('accompagnatore senza nome', () => M.aggiungiAccompagnatore(k, { nome: ' ' }), 'nome');
  lancia('animale con padrone inesistente', () => M.aggiungiAnimale(k, { nome: 'X', padrone: 'pg:zz' }), 'padrone');
  lancia('animale senza scelta del cibo', () => M.aggiungiAnimale(k, { nome: 'X', mangia: 'erba' }), 'foraggio o razioni');
  t('persone: PG + accompagnatori con e senza nome', M.consumoGiornaliero(k) === 5 && M.numeroAccompagnatori(k) === 3 && M.nomePadrone(k, 'acc:' + H) === 'Hassim');
  t('fabbisogni: cibo 6 (5 + lupo), acqua 8 (5 + 2 + 1), foraggio 2', M.fabbisogno(k, 'cibo') === 6 && M.fabbisogno(k, 'acqua') === 8 && M.fabbisogno(k, 'foraggio') === 2);
  k = M.modificaScorta(k, 'foraggio', 5); k.scorte.recipienti = false;
  x = M.avanza(k, M.ROUND_GIORNO, meteo, rng);
  t('un giorno con la compagnia: cibo −6, acqua −8, foraggio −2', x.scorte.cibo === 14 && x.scorte.acqua === 12 && x.scorte.foraggio === 3, x.scorte);
  let k2 = M.modificaAnimale(k, F, { trova_cibo: true }); k2 = M.modificaAnimale(k2, Zn, { trova_acqua: true });
  t('«trova da sé»: Fulmine non mangia foraggio, Zanna non beve', M.fabbisogno(k2, 'foraggio') === 0 && M.fabbisogno(k2, 'acqua') === 7);
  // foraggio insufficiente: si sceglie fra gli animali, Fame sull'animale
  let k3 = M.modificaScorta(k, 'foraggio', -4); x = M.avanza(k3, M.ROUND_GIORNO, meteo, rng);
  const zf = M.razionamentoAperto(x); t('foraggio insufficiente: scelta del GM', zf && zf.scorta === 'foraggio');
  lancia('foraggio: 1 razione, Fulmine ne vuole 2', () => M.risolviRazionamento(x, zf.id, { buone: ['ani:' + F] }, meteo), 'solo 1');
  x = M.risolviRazionamento(x, zf.id, { buone: [] }, meteo);
  t('Fame sull\'animale rimasto senza', x.compagnia.animali[0].stato.fame.penalita === 1 && x.coda.some(q => /Fame: Fulmine 1/.test(q.testo)));
  // Sete degli accompagnatori con nome; i senza nome restano senza penalità
  let k4 = M.clona(k); k4.scorte.acqua = 3; x = M.avanza(k4, M.ROUND_GIORNO, meteo, rng);
  const za = M.razionamentoAperto(x), d0 = M.datiRazionamento(x, za.id);
  t('Scegli chi beve: PG, Hassim, senza nome e animali', d0.consumatori.map(v => v.tipo).join() === 'pg,pg,acc,senza,animale,animale' && d0.buone === 3);
  x = M.risolviRazionamento(x, za.id, { buone: ['pg:' + A, 'pg:' + B, 'ani:' + Zn], senza_buone: 0 }, meteo);
  t('Sete su Hassim e Fulmine, non sui senza nome', x.compagnia.persone[0].stato.sete.penalita === 1 && x.compagnia.animali[0].stato.sete.penalita === 1 && x.compagnia.animali[1].stato.sete.penalita === 0 && x.coda.some(q => /2 accompagnatori senza razione|Sete: Hassim 1, Fulmine 1/.test(q.testo)));
  // giorni senza acqua: prova di Costituzione anche per gli accompagnatori con nome
  let k5 = M.clona(k); k5.scorte.acqua = 0; k5.scorte.cibo = 100; k5.scorte.foraggio = 100; x = M.avanza(k5, 4 * M.ROUND_GIORNO, meteo, rng);
  t('quarto giorno senz\'acqua: prova di Costituzione per Hassim', x.coda.some(q => /Costituzione CD 10 per .*Hassim \(giorno 4\)/.test(q.testo)));
  // AA2-5: cibo avariato solo se le buone non bastano
  let v = M.clona(c1); v.scorte.cibo = 10; v.scorte.cibo_avariato = 3; x = M.avanza(v, M.ROUND_GIORNO, meteo, rng);
  t('avariato non usato se le buone bastano', x.scorte.cibo === 6 && x.scorte.cibo_avariato === 3 && !M.razionamentoAperto(x));
  v.scorte.cibo = 0; v.scorte.cibo_avariato = 0; x = M.avanza(v, M.ROUND_GIORNO, meteo, rng); t('niente cibo né avariato: si va avanti da soli', !x.razionamenti.some(r => r.scorta === 'cibo') && x.pg[0].stato.fame.penalita === 1);
  v.scorte.cibo = 1; v.scorte.cibo_avariato = 3; v.scorte.acqua = 100; x = M.avanza(v, M.ROUND_GIORNO, meteo, rng);
  const zc = M.razionamentoAperto(x); t('buone 1 + avariate 3: scelta del GM', zc && zc.scorta === 'cibo' && /\+3 cibo avariato/.test(x.coda.find(q => q.tipo === 'razionamento').testo));
  lancia('avariato oltre la scorta', () => M.risolviRazionamento(x, zc.id, { buone: ['pg:' + A], cattive: ['pg:' + B], senza_cattive: 2, senza_buone: 1 }, meteo), 'accompagnatori');
  x = M.risolviRazionamento(x, zc.id, { buone: ['pg:' + A], cattive: ['pg:' + B], senza_cattive: 2 }, meteo);
  const qa = x.coda.find(q => q.avariato);
  t('Bruno mangia avariato: TS Tempra CD 12 in coda', x.scorte.cibo === 0 && x.scorte.cibo_avariato === 0 && qa && qa.tipo === 'ts' && /Tempra CD 12/.test(qa.testo) && x.pg[1].stato.fame.penalita === 0);
  t('accompagnatori senza nome con l\'avariato: solo una nota', x.coda.some(q => /2 accompagnatori senza nome: cibo avariato/.test(q.testo)));
  const xs = M.esitoPromemoria(x, qa.id, true, rng); t('TS superato: nulla', xs.pg[1].stato.fame.penalita === 0 && !xs.pg[1].stato.malus.length);
  const xf = M.esitoPromemoria(x, qa.id, false, facce([[3, 4]]));
  t('TS fallito: Nauseato 3 ore e il giorno conta senza', xf.pg[1].stato.fame.penalita === 1 && xf.pg[1].stato.fame.giorni_senza === 1 && xf.pg[1].stato.malus.some(m => m.nome === 'Nauseato' && m.durata.fine === xf.tempo.R + 3 * M.ROUND_ORA));
  t('forma della Build 1 di risolviRazionamento ancora valida', typeof M.risolviRazionamento === 'function');

  // AA2-4: Foraggiare
  let f = meteoA(c1, '1', 4, 10, 10);
  let inf = M.infoForaggiare(f, meteo); t('Foraggiare zona 1 in primavera, Clima mite: CD 12, +1 ogni 3', inf.cd === 12 && inf.ogni === 3 && inf.acqua.tipo === 'inclusa' && !inf.impossibile && !inf.pesca);
  let e = M.esitoForaggiare(f, meteo, [{ pg: A, totale: 18 }, { pg: B, totale: 5 }]);
  t('resa: Aria 18 → 3 persone, acqua inclusa 3; Bruno 5 → niente', e.righe[0].cibo === 3 && e.righe[0].acqua === 3 && e.righe[1].cibo === 0 && e.cibo === 3 && e.acqua === 3);
  t('resa esatta alla CD = 1', M.esitoForaggiare(f, meteo, [{ pg: A, totale: 12 }]).cibo === 1 && M.esitoForaggiare(f, meteo, [{ pg: A, totale: 11 }]).cibo === 0);
  x = M.foraggia(f, meteo, rng, [{ pg: A, totale: 18 }]);
  t('Foraggiare: scorte e +2 ore', x.scorte.cibo === 23 && x.scorte.acqua === 23 && x.tempo.R === f.tempo.R + 2 * M.ROUND_ORA && M.haForaggiato(x, A) && !M.haForaggiato(x, B));
  lancia('una sola prova al giorno', () => M.foraggia(x, meteo, rng, [{ pg: A, totale: 18 }]), 'già foraggiato');
  t('il giorno dopo si può di nuovo', !M.haForaggiato(M.avanza(x, M.ROUND_GIORNO, meteo, rng), A));
  t('senza +2 ore', M.foraggia(f, meteo, rng, [{ pg: A, totale: 18 }], { ore: false }).tempo.R === f.tempo.R);
  // quota del foraggio
  let fk = meteoA(k, '1', 4, 10, 10); e = M.esitoForaggiare(fk, meteo, [{ pg: A, totale: 18 }]);
  t('divisione: al foraggio la quota di Fulmine (2)', M.quotaForaggio(fk) === 2 && e.alForaggio === 2);
  x = M.foraggia(fk, meteo, rng, [{ pg: A, totale: 18 }], { foraggio: 1, ore: false }); t('divisione scelta dal GM', x.scorte.foraggio === fk.scorte.foraggio + 1 && x.scorte.cibo === fk.scorte.cibo + 2);
  // modificatori della CD
  f = meteoA(c1, '1', 1, 10, 85); inf = M.infoForaggiare(f, meteo);
  t('inverno + Neve: CD 12 + 5 + 2 = 19', inf.cd === 19 && inf.mods.length === 2, inf.mods);
  f = meteoA(c1, '1', 4, 10, 92); inf = M.infoForaggiare(alle(f, 7), meteo); t('Acquazzone in corso: +5', inf.cd === 17);
  t('Acquazzone finito: CD normale', M.infoForaggiare(alle(f, 12), meteo).cd === 12);
  f = meteoA(c1, '5', 4, 10, 100); t('Tempesta di vento in corso: impossibile', /Tempesta di vento/.test(M.infoForaggiare(alle(f, 7), meteo).impossibile));
  lancia('Foraggiare impossibile', () => M.foraggia(alle(f, 7), meteo, rng, [{ pg: A, totale: 30 }]), 'impossibile');
  t('finita la tempesta si può', !M.infoForaggiare(alle(f, 15), meteo).impossibile);
  // acqua con seconda prova, pesca, stagione secca, neve, Stillicidio
  f = meteoA(c1, '5', 4, 10, 1); inf = M.infoForaggiare(f, meteo); e = M.esitoForaggiare(f, meteo, [{ pg: A, totale: 14, totale_acqua: 17 }, { pg: B, abilita: 'pescatore', totale: 12 }]);
  t('Coste: acqua CD 15 con seconda prova (17 → 2), pesca solo cibo', inf.pesca && inf.acqua.tipo === 'cd' && e.righe[0].cibo === 3 && e.righe[0].acqua === 2 && e.righe[1].cibo === 2 && e.righe[1].acqua === 0);
  lancia('pescare dove non si può', () => M.esitoForaggiare(meteoA(c1, '1', 4, 10, 1), meteo, [{ pg: A, abilita: 'pescatore', totale: 20 }]), 'pescare');
  f = M.impostaVariante(meteoA(c1, '1', 4, 10, 1), meteo, 'acqua_dolce', true); e = M.esitoForaggiare(f, meteo, [{ pg: A, abilita: 'pescatore', totale: 15 }]);
  t('acqua dolce per pescare: pesca senz\'acqua', e.cibo === 2 && e.acqua === 0);
  inf = M.infoForaggiare(meteoA(c1, '12', 12, 1, 1), meteo); t('Savana nella stagione secca: CD 13 + 5, acqua CD 20', inf.cd === 18 && inf.acqua.tipo === 'cd' && inf.acqua.cd === 20);
  f = meteoA(c1, '9', 4, 10, 1); inf = M.infoForaggiare(f, meteo); t('Ghiacci: solo neve, CD 22', inf.acqua.tipo === 'neve' && inf.cd === 22 && M.motivoNeve(f, meteo));
  t('Tundra in autunno-inverno: neve (nota ²)', M.infoForaggiare(meteoA(c1, '8', 11, 10, 1), meteo).acqua.tipo === 'neve' && M.infoForaggiare(meteoA(c1, '8', 5, 10, 1), meteo).acqua.tipo === 'inclusa');
  t('Montagne oltre 4.500 m: neve (nota ¹)', M.infoForaggiare(M.impostaVariante(meteoA(c1, '6', 5, 10, 1), meteo, 'oltre4500', true), meteo).acqua.tipo === 'neve');
  t('Stillicidio: acqua senza prova', M.infoForaggiare(meteoA(c1, '16', 5, 10, 75), meteo).acqua.tipo === 'libera');
  x = M.sciogliNeve(f, meteo, rng, 3); t('Sciogli neve: +3 acqua e +3 ore', x.scorte.acqua === 23 && x.tempo.R === f.tempo.R + 3 * M.ROUND_ORA);
  lancia('Sciogli neve senza neve', () => M.sciogliNeve(meteoA(c1, '1', 4, 10, 1), meteo, rng, 1), 'neve');
  t('neve nel giorno: si può sciogliere', !!M.motivoNeve(meteoA(c1, '1', 1, 10, 85), meteo));
  // AA2-5 e AA2-6: avariato e acqua da purificare
  f = meteoA(c1, '4', 4, 10, 1); e = M.esitoForaggiare(f, meteo, [{ pg: A, totale: 7 }, { pg: B, totale: 8 }]);
  t('palude ☠: fallito di 5 → 1 avariato; di 4 → niente', e.righe[0].avariato === 1 && e.righe[1].avariato === 0 && e.impura);
  x = M.foraggia(f, meteo, rng, [{ pg: A, totale: 18 }, { pg: B, totale: 6 }], { ore: false });
  t('palude: acqua da purificare e cibo avariato in scorta', x.scorte.acqua_impura === 3 && x.scorte.acqua === 20 && x.scorte.cibo_avariato === 1 && x.scorte.cibo === 23);
  let b = M.bolliAcqua(x, meteo, rng, 2); t('Bolli: 2 razioni, 20 minuti', b.scorte.acqua === 22 && b.scorte.acqua_impura === 1 && b.tempo.R === x.tempo.R + 20 * M.ROUND_MIN);
  lancia('bollire più di quella che c\'è', () => M.bolliAcqua(x, meteo, rng, 5), 'solo 3');
  let vul = M.clona(x); vul = M.cambiaZona(vul, meteo, '17'); lancia('acqua sulfurea: la bollitura non basta', () => M.bolliAcqua(vul, meteo, rng, 1), 'bollitura');
  b = M.purificaAcqua(vul, meteo, 'tavoletta', 1); t('Tavoletta purificante: 3 razioni', b.scorte.acqua_impura === 0 && b.scorte.acqua === 23);
  b = M.purificaAcqua(vul, meteo, 'incantesimo', 2); t('Purificare cibo e bevande: le razioni scelte', b.scorte.acqua_impura === 1);
  let iw = M.clona(c1); iw.scorte.acqua = 1; iw.scorte.acqua_impura = 5; iw.scorte.recipienti = false; x = M.avanza(iw, M.ROUND_GIORNO, meteo, rng);
  const zw = M.razionamentoAperto(x); x = M.risolviRazionamento(x, zw.id, { buone: ['pg:' + A], cattive: ['pg:' + B], senza_cattive: 2 }, meteo);
  t('acqua non purificata: TS come il cibo avariato', x.coda.some(q => q.avariato && /acqua non purificata/.test(q.testo)) && x.scorte.acqua_impura === 2);

  // AA3: compagnia in combattimento e XP
  const schede = { p1: { id: 'p1', nome: 'Hassim', iniziativa: 4, fatica: 10, ferita: 11, gs: '3', xp: 800 }, m1: { id: 'm1', nome: 'Lupo', iniziativa: 2, fatica: 6, ferita: 7, gs: '1', xp: 400 } };
  const sd = r => schede[r.id];
  const ph = M.partecipanteCompagnia(k, 'acc:' + H, sd, M.pfDaScheda);
  t('Hassim al combattimento come alleato', ph.alleato && ph.bonus === 4 && ph.rif.id === 'p1' && ph.nome === 'Hassim');
  let cb = M.clona(k); cb.impostazioni.xp = true;
  cb = M.avviaCombattimento(cb, [{ tipo: 'pg', pgId: A, totale: 15 }, ph, M.partecipanteCompagnia(k, 'ani:' + Zn, sd, M.pfDaScheda), { tipo: 'nemico', nome: 'Orco', bonus: 0, n: 2, rif: { fonte: 'mostro', id: 'm1' } }], rng, 0);
  for (const r of Object.values(cb.combattimento.righe)) if (r.tipo === 'nemico') cb = M.comando(cb, 'fuori', { id: r.id }, meteo, rng, 0);
  const fine = M.fineCombattimento(cb, 0, sd);
  t('XP: gli alleati della compagnia non contano, accompagnatori con e senza nome sì', fine.riepilogo.xp.sconfitti === 800 && fine.riepilogo.xp.perPG === 400 && fine.riepilogo.xp.perPGconAcc === 160, fine.riepilogo.xp);
  // togliere
  let kt = M.togliAccompagnatore(k, H, 'congedato'); t('togli Hassim: Zanna resta senza padrone', kt.compagnia.persone.length === 0 && kt.compagnia.animali[1].padrone === '' && kt.log.some(l => /Hassim lascia il gruppo \(congedato\)/.test(l.testo)));
  kt = M.togliAnimale(kt, F); t('togli Fulmine', kt.compagnia.animali.length === 1);
  // AA3-7: creazione con i nomi
  const cn = M.creaCampagna({ ...base, zona: '2', persone: ['Mira', { nome: 'Tobia', ruolo: 'portatore' }], foraggio: 4 }, meteo, semi(3), 1000);
  t('creazione: senza nome, persone e foraggio', cn.compagnia.senza_nome === 2 && cn.compagnia.persone.map(p => p.nome).join() === 'Mira,Tobia' && cn.compagnia.persone[1].ruolo === 'portatore' && cn.scorte.foraggio === 4);
}
// migrazione: la campagna salvata con la Build 2b (PNG generici, incontri, accompagnatori) si apre e si usa
{ const vecchia = fs.readFileSync(path.join(__dirname, 'prove', 'campagna_build2b.json'), 'utf8'), imp = M.importa(vecchia), c = imp.campagne[0], j = JSON.parse(vecchia).dati;
  t('Build 2b: zona desertica → 10, voce della tempesta rinominata', c.zona === '10' && c.meteo.zona === '10' && c.meteo.opzioni[0].includes('Tempesta di sabbia'));
  t('Build 2b: 3 accompagnatori → senza nome', c.compagnia.senza_nome === 3 && !c.compagnia.persone.length && c.scorte.accompagnatori === undefined && c.scorte.foraggio === 0);
  t('Build 2b: PNG, incontri, generici e mostri condivisi', c.png.length === 1 && c.incontri.length === 2 && imp.generici.length === 1 && imp.mostri.length === 1);
  t('Build 2b: combattimento in corso, righe senza alleati', Object.values(c.combattimento.righe).every(r => r.alleato === false) && c.combattimento.round === j.combattimento.round);
  const me = M.meteoCorrente(c, meteo); t('Build 2b: effetti del meteo migrato', me.effetti.map(x => x.nome).join('|') === 'Clima caldo / Clima freddo|Tempesta di grandine / polvere / sabbia / cenere');
  const best = { mostri: imp.mostri, generici: imp.generici }, sd = r => (r.fonte === 'png' ? c.png : r.fonte === 'generico' ? best.generici : best.mostri).find(s => s.id === r.id);
  let x = M.comando(c, 'avanti', {}, meteo, rng, 0); x = M.fineCombattimento(x, 0, sd).camp;
  x = M.avanza(x, M.ROUND_GIORNO, meteo, rng);
  t('Build 2b: giorno nuovo con le zone nuove e la compagnia', x.meteo.zona === '10' && meteo.tabelle['10'][x.meteo.stagione] && (x.scorte.cibo < c.scorte.cibo || M.razionamentoAperto(x)));
  x = M.aggiungiAccompagnatore(x, { nome: 'Hassim', rif: { fonte: 'png', id: c.png[0].id } }); t('Build 2b: accompagnatore con la scheda del PNG', x.compagnia.persone[0].rif.fonte === 'png'); }

console.log(`test: ${ok} superati, ${ko} falliti`);
process.exit(ko ? 1 : 0);
