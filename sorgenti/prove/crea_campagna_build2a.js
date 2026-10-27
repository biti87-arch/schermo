// Campagna di prova salvata con la Build 2a (commit 57557c6): malus, veleni, ferite gravi, combattimento in corso.
const M = require(process.argv[2] + '/motore.js'), meteo = require(process.argv[2] + '/meteo.json'), FER = require(process.argv[2] + '/ferite.json');
function semi(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const rng = semi(2026);
const pg = [
  { nome: 'Aria', razza: 'Elfa', classe: 'Ladro 7', livello: 7, fatica_max: 42, ferita_max: 40, rif_dadi: 7, rif_tipo: 8, ca: 19, ca_contatto: 14, ca_sprovvista: 15, dmc: 21, tempra: 5, riflessi: 9, volonta: 3, percezione: 12, intuizione: 8, furtivita: 14, iniziativa: 6, imp_pen: 3 },
  { nome: 'Bruno', razza: 'Orco', classe: 'Barbaro 7', livello: 7, fatica_max: 48, ferita_max: 49, rif_dadi: 7, rif_tipo: 12, ca: 17, ca_contatto: 11, ca_sprovvista: 15, dmc: 24, tempra: 9, riflessi: 4, volonta: 3, percezione: 9, intuizione: 2, furtivita: 1, iniziativa: 2, imp_pen: 6 },
].map(s => ({ ...M.SCHEDA_VUOTA, ...s }));
let c = M.creaCampagna({ nome: 'Campagna della Build 2a', anno: { numero: 1462, etichetta: 'dopo la Caduta' }, partenza: { mese: 9, giorno: 26, ore: 17, min: 30, sett: 0 },
  zona: 'temperata', pg, accompagnatori: 1, cibo: 10, acqua: 10 }, meteo, rng, 1777100000000);
const [A, B] = c.pg.map(p => p.id);
// veleno su Bruno fuori combattimento
c = M.aggiungiMalus(c, { pg: B }, { tipo: 'veleno', nome: 'Veleno di vespa gigante', veleno: { forma: 'ferimento', ts: 'Tempra', cd: 18, frequenza: { unita: 'round', volte: 6 }, effetto: '1d2 Des', cura: 1 } }, rng);
c = M.aggiungiMalus(c, { pg: A }, { tipo: 'condizione', nome: 'Affaticato', durata: { tipo: 'libera' } }, rng);
c = M.aggiungiMalus(c, { pg: A }, { tipo: 'bonus', nome: 'Benedizione', mods: { ts: 1 }, durata: { n: 3, unita: 'minuti' } }, rng);
// combattimento con un gruppo di nemici e un singolo
c = M.avviaCombattimento(c, [{ tipo: 'pg', pgId: A, totale: 18 }, { tipo: 'pg', pgId: B, totale: 9 },
  { tipo: 'nemico', nome: 'Lupo', bonus: 2, n: 3, modo: 'tipo' }, { tipo: 'nemico', nome: 'Capobranco', bonus: 4, n: 1 }], rng, 1777100000000);
const lupo = Object.values(c.combattimento.righe).find(r => r.nome === 'Lupo').id;
c = M.aggiungiMalus(c, { riga: lupo }, { tipo: 'condizione', nome: 'Prono', etichetta: 'Lupo 2', durata: { tipo: 'libera' } }, rng);
c = M.aggiungiMalus(c, { pg: A }, { tipo: 'condizione', nome: 'Scosso', durata: { n: 3, unita: 'round' }, scadenza: 'causa', causa: lupo }, rng);
// ferita grave su Aria: danno sotto 0 e riga dalla tabella (braccio, emorragia lieve)
let r = M.danno(c, A, 89); c = r.camp;
const fg = M.feritaDaTabella(FER, 'colpire', r.feritaGrave.riga, rng, 5);
c = M.attaccaFerita(c, A, fg.comps, rng, FER, { titolo: fg.titolo, testo: fg.testo });
r = M.danno(c, B, 108); c = r.camp;
const fg2 = M.feritaDaTabella(FER, 'area', -11, rng);
c = M.attaccaFerita(c, B, fg2.comps, rng, FER, { titolo: fg2.titolo, testo: fg2.testo });
c = M.comando(c, 'avanti', {}, meteo, rng, 1777100005000);
c = M.comando(c, 'avanti', {}, meteo, rng, 1777100010000);
c.modificata = 1777100010000;
process.stdout.write(M.esporta(c, 'campagna'));
console.error('PG', c.pg.map(p => p.scheda.nome + ' ' + p.stato.fatica + '/' + p.stato.ferita + ' ' + p.stato.malus.map(m => m.nome).join(', ')).join(' | '));
console.error('righe', Object.values(c.combattimento.righe).map(r => M.etichetta(r) + ' ' + r.malus.length).join(', '), 'coda', c.coda.length, 'storia', c.combattimento.storia.length);
