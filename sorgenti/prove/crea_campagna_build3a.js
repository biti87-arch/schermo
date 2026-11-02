// Campagna di prova salvata con la Build 3a (commit 018f06c): fonti di luce della Guida (torcia accesa, lanterna spenta al riparo),
// luce personalizzata con durata e luce permanente, promemoria a tempo, modelli, bonus con il tipo (anche uno che non si somma),
// livelli negativi in più malus (si sommano), storico dei dadi, log con una sessione, combattimento in corso.
// Uso: node crea_campagna_build3a.js <cartella con motore.js, meteo.json e strumenti.json della 3a> > campagna_build3a.json
const M = require(process.argv[2] + '/motore.js'), meteo = require(process.argv[2] + '/meteo.json'), STR = require(process.argv[2] + '/strumenti.json');
M.usaStrumenti(STR);
function semi(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const rng = semi(2031), ORA = 1777400000000;
const pg = [
  { nome: 'Aria', razza: 'Elfa', classe: 'Ladro 7', livello: 7, fatica_max: 42, ferita_max: 40, rif_dadi: 7, rif_tipo: 8, ca: 19, ca_contatto: 14, ca_sprovvista: 15, dmc: 21, tempra: 5, riflessi: 9, volonta: 3, percezione: 12, intuizione: 8, furtivita: 14, iniziativa: 6, imp_pen: 3, velocita: '9 m' },
  { nome: 'Bruno', razza: 'Nano', classe: 'Guerriero 7', livello: 7, fatica_max: 48, ferita_max: 49, rif_dadi: 7, rif_tipo: 10, ca: 21, ca_contatto: 11, ca_sprovvista: 19, dmc: 24, tempra: 9, riflessi: 4, volonta: 4, percezione: 7, intuizione: 2, furtivita: 1, iniziativa: 2, imp_pen: 6, velocita: '6 m' },
].map(s => ({ ...M.SCHEDA_VUOTA, ...s }));
let c = M.creaCampagna({ nome: 'Campagna della Build 3a', anno: { numero: 1462, etichetta: 'dopo la Caduta' }, partenza: { mese: 4, giorno: 2, ore: 18, min: 0, sett: 1 },
  zona: '1', pg, accompagnatori: 1, persone: ['Mira'], cibo: 10, acqua: 10, foraggio: 4 }, meteo, rng, ORA);
c = M.impostaMeteo(c, meteo, 'Clima mite', rng);
c = M.iniziaSessione(c);
const [A, B] = c.pg.map(p => p.id);
const acc = c.compagnia.persone[0].id;
c = M.aggiungiLuce(c, STR, { tipo: 'torcia', chi: 'pg:' + A });
c = M.aggiungiLuce(c, STR, { tipo: 'lanterna', chi: 'acc:' + acc, riparo: true });
c = M.aggiungiLuce(c, STR, { tipo: 'personalizzata', nome: 'Luce', raggio: 6, fiamme: 'nessuna', durata: { n: 70, unita: 'minuti' }, chi: 'pg:' + B });
c = M.aggiungiLuce(c, STR, { tipo: 'personalizzata', nome: 'Fiamma perenne', raggio: 6, fiamme: 'nessuna', durata: { tipo: 'permanente' }, chi: 'gruppo' });
for (const l of c.luci.filter(l => l.tipo !== 'lanterna')) c = M.accendiLuce(c, meteo, STR, l.id);
c = M.aggiungiPromemoria(c, { testo: 'Arriva la carovana', tra: { n: 2, unita: 'ore' } });
c = M.salvaModello(c, 'Scudo', { tipo: 'bonus', nome: 'Scudo', tb: 'scudo', mods: { ca: 4 }, durata: { n: 7, unita: 'minuti' } });
c = M.aggiungiMalus(c, { pg: A }, { tipo: 'bonus', nome: 'Scudo', tb: 'scudo', mods: { ca: 4 }, durata: { n: 1, unita: 'ore' } }, rng);
c = M.aggiungiMalus(c, { pg: A }, { tipo: 'bonus', nome: 'Scudo della fede', tb: 'deviazione', mods: { ca: 2 }, durata: { n: 30, unita: 'minuti' } }, rng);
c = M.aggiungiMalus(c, { pg: A }, { tipo: 'bonus', nome: 'Anello', tb: 'deviazione', mods: { ca: 1 }, durata: { tipo: 'permanente' } }, rng);
c = M.aggiungiMalus(c, { pg: B }, { tipo: 'condizione', nome: 'Livelli negativi', n: 1, durata: { tipo: 'permanente' } }, rng);
c = M.aggiungiMalus(c, { pg: B }, { tipo: 'condizione', nome: 'Livelli negativi', n: 2, durata: { n: 1, unita: 'giorni' } }, rng);
c = M.tiraDadi(c, '1d20+5', 'prova', { log: true }, rng).camp;
c = M.tiraDadi(c, '2d6+3', 'libero', {}, rng).camp;
c = M.avanza(c, 10 * M.ROUND_MIN, meteo, rng, '+10 minuti');
c = M.avviaCombattimento(c, [{ tipo: 'pg', pgId: A, totale: 18 }, { tipo: 'pg', pgId: B, totale: 9 }, { tipo: 'nemico', nome: 'Bandito', n: 2, modo: 'tipo', bonus: 1 }], rng, ORA, { titolo: 'Agguato' });
c = M.aggiungiPromemoria(c, { testo: 'Crolla il ponte', round: 3 });
c = M.comando(c, 'avanti', {}, meteo, rng, ORA + 4000);
c.modificata = ORA + 4000;
process.stdout.write(M.esporta(c, 'campagna', { mostri: [], generici: [] }));
console.error('luci', c.luci.map(l => `${l.tipo}:${l.accesa}:${l.resta}`).join(' '), 'promemoria', c.promemoria.length, 'modelli', c.modelli.length,
  'malus', c.pg.map(p => p.stato.malus.length).join('/'), 'tiri', c.tiri.length, 'log', c.log.length);
