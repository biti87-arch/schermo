// Campagna di prova salvata con la Build 3b (commit c8e3204): marcia in corso fermata da un evento (Orientarsi), area degli incontri casuali
// con tabella, medicinali ed erbe miste accesi, una mistura dell'erborista, un malus «Trattenere il fiato», un promemoria d'incontro casuale.
// Uso: node crea_campagna_build3b.js <cartella con motore.js, meteo.json, strumenti.json e prontuario.json della 3b> > campagna_build3b.json
const M = require(process.argv[2] + '/motore.js'), meteo = require(process.argv[2] + '/meteo.json');
M.usaStrumenti(require(process.argv[2] + '/strumenti.json')); M.usaProntuario(require(process.argv[2] + '/prontuario.json'));
const P3 = require(process.argv[2] + '/prontuario.json');
function semi(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const rng = semi(3302), ORA = 1777500000000;
const pg = [
  { nome: 'Aria', razza: 'Elfa', classe: 'Ladro 7', livello: 7, fatica_max: 42, ferita_max: 40, ca: 19, tempra: 5, riflessi: 9, volonta: 3, percezione: 12, iniziativa: 6, imp_pen: 3, velocita: '9 m' },
  { nome: 'Bruno', razza: 'Nano', classe: 'Guerriero 7', livello: 7, fatica_max: 48, ferita_max: 49, ca: 21, tempra: 9, riflessi: 4, volonta: 4, percezione: 7, iniziativa: 2, imp_pen: 6, velocita: '6 m' }
].map(s => ({ ...M.SCHEDA_VUOTA, ...s }));
let c = M.creaCampagna({ nome: 'Campagna della Build 3b', anno: { numero: 1462, etichetta: 'dopo la Caduta' }, partenza: { mese: 5, giorno: 10, ore: 7, min: 0, sett: 2 },
  zona: '1', pg, accompagnatori: 1, persone: ['Mira'], cibo: 12, acqua: 12, foraggio: 4 }, meteo, rng, ORA);
c = M.impostaMeteo(c, meteo, 'Clima mite', rng);
c = M.iniziaSessione(c);
const [A, B] = c.pg.map(p => p.id);
c.impostazioni.incontri_casuali = true;
c = M.impostaContatore(c, 'medicinali', { attivo: true, n: 4 });
c = M.impostaContatore(c, 'erbe', { attivo: true, n: 6 });
const mist = P3.erborista.misture.find(m => !m.app.una_al_giorno && m.app.tipo !== 'medicinali') || P3.erborista.misture[0];
c = M.preparaMistura(c, meteo, rng, { chi: B, mistura: mist.id, totale: 22, a: [{ pg: A }] }).camp;
c = M.salvaArea(c, { nome: 'Bosco dei briganti', perc: 30, righe: [{ da: 1, a: 60, partecipanti: [{ nome: 'Brigante', dadi: '1d4+1' }], testo: 'appostati sulla strada' },
  { da: 61, a: 100, partecipanti: [{ nome: 'Lupo', dadi: '2d4' }], testo: 'ululati al tramonto' }] });
const area = c.aree.at(-1);
let t = M.tiraIncontro(c, semi(5), { area: area.id }); for (let s = 6; !t.esce; s++) t = M.tiraIncontro(c, semi(s), { area: area.id });
c = t.camp;
c = M.trattieniFiato(c, { pg: A }, { cos: 12 });
c = M.avviaMarcia(c, meteo, rng, { mezzo: 'piedi', terreno: 'pianura', fuori_strada: true, ore: 3, area: area.id });
if (!c.viaggio.attivo) throw new Error('la marcia doveva fermarsi su un evento');
c.modificata = ORA + 5000;
process.stdout.write(M.esporta(c, 'campagna', { mostri: [], generici: [] }));
console.error('mistura', mist.titolo || mist.id, 'evento', c.viaggio.attivo.evento.tipo, 'promemoria', c.promemoria.length, 'aree', c.aree.length,
  'malus A', c.pg[0].stato.malus.map(m => m.nome).join('|'), 'medicinali', c.medicinali.n, 'erbe', c.erbe.n);
