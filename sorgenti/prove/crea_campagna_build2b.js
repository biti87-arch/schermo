// Campagna di prova salvata con la Build 2b (commit 7858b56): zona desertica con la voce vecchia «Tempesta di polvere/sabbia»,
// 3 accompagnatori (numero), PNG della campagna, PNG generico e mostro condivisi, incontri, combattimento in corso con una scheda.
// Uso: node crea_campagna_build2b.js <cartella con motore.js, meteo.json della 2b> > campagna_build2b.json
const M = require(process.argv[2] + '/motore.js'), meteo = require(process.argv[2] + '/meteo.json');
function semi(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const rng = semi(2027), ORA = 1777200000000;
const pg = [
  { nome: 'Aria', razza: 'Elfa', classe: 'Ladro 7', livello: 7, fatica_max: 42, ferita_max: 40, rif_dadi: 7, rif_tipo: 8, ca: 19, ca_contatto: 14, ca_sprovvista: 15, dmc: 21, tempra: 5, riflessi: 9, volonta: 3, percezione: 12, intuizione: 8, furtivita: 14, iniziativa: 6, imp_pen: 3 },
  { nome: 'Bruno', razza: 'Orco', classe: 'Barbaro 7', livello: 7, fatica_max: 48, ferita_max: 49, rif_dadi: 7, rif_tipo: 12, ca: 17, ca_contatto: 11, ca_sprovvista: 15, dmc: 24, tempra: 9, riflessi: 4, volonta: 3, percezione: 9, intuizione: 2, furtivita: 1, iniziativa: 2, imp_pen: 6 },
].map(s => ({ ...M.SCHEDA_VUOTA, ...s }));
let c = M.creaCampagna({ nome: 'Campagna della Build 2b', anno: { numero: 1462, etichetta: 'dopo la Caduta' }, partenza: { mese: 6, giorno: 15, ore: 9, min: 0, sett: 4 },
  zona: 'desertica', pg, accompagnatori: 3, cibo: 6, acqua: 5, impostazioni: { xp: true, pf_nemici: true } }, meteo, rng, ORA);
c = M.tiraMeteo(c, meteo, rng, 100); // Clima caldo + Tempesta di polvere/sabbia (voce della Guida)
const [A, B] = c.pg.map(p => p.id);
// PNG della campagna, PNG generico e mostro condivisi
const guida = M.nuovaScheda({ nome: 'Hassim', tipo_scheda: 'png', gs: '3', iniziativa: 3, fatica: 14, ferita: 15, alleato: true, tattiche: [] }, rng, ORA, 'p');
c = M.salvaPNG(c, guida, ORA);
const predone = M.nuovaScheda({ nome: 'Predone delle dune', tipo_scheda: 'png', gs: '2', xp: 600, iniziativa: 2, fatica: 9, ferita: 10 }, rng, ORA, 'g');
const sciacallo = M.nuovaScheda({ nome: 'Sciacallo', tipo_scheda: 'mostro_pf1', gs: '1/3', xp: 135, iniziativa: 3, fatica: 2, ferita: 3 }, rng, ORA, 'm');
const best = { mostri: [sciacallo], generici: [predone] };
const schedaDi = r => (r.fonte === 'png' ? c.png : r.fonte === 'generico' ? best.generici : best.mostri).find(s => s.id === r.id);
c = M.salvaIncontro(c, { titolo: 'Predoni al pozzo', atto: 'Atto I', capitolo: 'Cap. 2', partecipanti: [
  { nome: 'Predone delle dune', n: 3, modo: 'tipo', rif: { fonte: 'generico', id: predone.id } }, { nome: 'Sciacallo', n: 2, modo: 'singolo', rif: { fonte: 'mostro', id: sciacallo.id } }],
  promemoria: [{ round: 2, testo: 'Il pozzo crolla' }] }, rng);
c = M.salvaIncontro(c, { titolo: 'La guida tradisce', atto: 'Atto I', capitolo: 'Cap. 3', partecipanti: [{ nome: 'Hassim', n: 1, rif: { fonte: 'png', id: guida.id } }] }, rng);
// combattimento in corso dall'incontro
const inc = c.incontri[0];
const nem = inc.partecipanti.map(p => ({ tipo: 'nemico', ...M.nemicoDaPartecipante(p, schedaDi), pf: M.pfDaScheda(schedaDi(p.rif)) }));
c = M.avviaCombattimento(c, [{ tipo: 'pg', pgId: A, totale: 17 }, { tipo: 'pg', pgId: B, totale: 8 }, ...nem], rng, ORA, { incontro: inc.id, titolo: inc.titolo, promemoria: inc.promemoria });
c = M.comando(c, 'avanti', {}, meteo, rng, ORA + 5000);
c.modificata = ORA + 5000;
process.stdout.write(M.esporta(c, 'campagna', M.condiviseUsate(c, best)));
console.error('zona', c.zona, 'meteo', c.meteo.testo, 'acc', c.scorte.accompagnatori, 'png', c.png.length, 'incontri', c.incontri.length, 'righe', Object.values(c.combattimento.righe).map(r => M.etichetta(r)).join(', '));
