// Campagna di prova salvata con la Build 2c (commit 767bed6): compagnia con accompagnatori con nome e animali, scorte con foraggio
// e cibo avariato, meteo con durata (Acquazzone dalle 13), previsioni, malus e bonus (Livelli negativi con la regola vecchia), combattimento in corso.
// Uso: node crea_campagna_build2c.js <cartella con motore.js, meteo.json della 2c> > campagna_build2c.json
const M = require(process.argv[2] + '/motore.js'), meteo = require(process.argv[2] + '/meteo.json');
function semi(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const rng = semi(2028), ORA = 1777300000000;
const pg = [
  { nome: 'Aria', razza: 'Elfa', classe: 'Ladro 7', livello: 7, fatica_max: 42, ferita_max: 40, rif_dadi: 7, rif_tipo: 8, ca: 19, ca_contatto: 14, ca_sprovvista: 15, dmc: 21, tempra: 5, riflessi: 9, volonta: 3, percezione: 12, intuizione: 8, furtivita: 14, iniziativa: 6, imp_pen: 3 },
  { nome: 'Bruno', razza: 'Orco', classe: 'Barbaro 7', livello: 7, fatica_max: 48, ferita_max: 49, rif_dadi: 7, rif_tipo: 12, ca: 17, ca_contatto: 11, ca_sprovvista: 15, dmc: 24, tempra: 9, riflessi: 4, volonta: 3, percezione: 9, intuizione: 2, furtivita: 1, iniziativa: 2, imp_pen: 6 },
].map(s => ({ ...M.SCHEDA_VUOTA, ...s }));
let c = M.creaCampagna({ nome: 'Campagna della Build 2c', anno: { numero: 1462, etichetta: 'dopo la Caduta' }, partenza: { mese: 3, giorno: 25, ore: 9, min: 0, sett: 4 },
  zona: '1', pg, accompagnatori: 2, persone: ['Mira', { nome: 'Tobia', ruolo: 'portatore' }], cibo: 8, acqua: 9, foraggio: 5 }, meteo, rng, ORA);
c = M.impostaMeteo(c, meteo, 'Acquazzone', rng);
c = M.impostaInizioDurata(c, 13);
c = M.prediciTempo(c, meteo, rng, 22);
const [A, B] = c.pg.map(p => p.id);
const lupo = M.nuovaScheda({ nome: 'Lupo', tipo_scheda: 'mostro_pf1', gs: '1', xp: 400, iniziativa: 2, fatica: 6, ferita: 7 }, rng, ORA, 'm');
const best = { mostri: [lupo], generici: [] };
c = M.aggiungiAnimale(c, { nome: 'Fulmine', tipo: 'cavalcatura', padrone: 'pg:' + A, mangia: 'foraggio', cibo: 1, acqua: 1 });
c = M.aggiungiAnimale(c, { nome: 'Zanna', tipo: 'compagno', padrone: 'pg:' + B, mangia: 'razioni', cibo: 1, acqua: 1, trova_acqua: true, rif: { fonte: 'mostro', id: lupo.id } });
c = M.modificaScorta(c, 'cibo_avariato', 2);
c = M.aggiungiMalus(c, { pg: A }, { tipo: 'bonus', nome: 'Scudo', mods: { ca: 4 }, durata: { n: 7, unita: 'minuti' } }, rng);
c = M.aggiungiMalus(c, { pg: B }, { tipo: 'condizione', nome: 'Livelli negativi', n: 1, durata: { tipo: 'permanente' } }, rng);
c = M.aggiungiMalus(c, { pg: B }, { tipo: 'condizione', nome: 'Scosso', durata: { n: 3, unita: 'round' } }, rng);
const nem = [{ tipo: 'nemico', ...M.nemicoDaPartecipante({ nome: 'Lupo', n: 2, modo: 'tipo', rif: { fonte: 'mostro', id: lupo.id } }, r => best.mostri.find(s => s.id === r.id)), pf: M.pfDaScheda(lupo) }];
c = M.avviaCombattimento(c, [{ tipo: 'pg', pgId: A, totale: 18 }, { tipo: 'pg', pgId: B, totale: 9 }, ...nem], rng, ORA, { titolo: 'Lupi sulla strada' });
c = M.comando(c, 'avanti', {}, meteo, rng, ORA + 4000);
c.modificata = ORA + 4000;
process.stdout.write(M.esporta(c, 'campagna', M.condiviseUsate(c, best)));
console.error('zona', c.zona, 'meteo', c.meteo.testo, 'durata', JSON.stringify(c.meteo.durata), 'previsioni', c.previsioni && c.previsioni.giorni.length,
  'persone', c.compagnia.persone.map(p => p.nome).join(), 'animali', c.compagnia.animali.map(a => a.nome).join(), 'scorte', JSON.stringify(c.scorte));
