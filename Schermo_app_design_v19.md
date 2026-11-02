# Schermo del Narratore — design dell'app v19

*App per il GM della Collana (GDR basato su Pathfinder 1e, regole della Collana). Repo `biti87-arch/schermo`, pacchetto `it.collana.schermo`, prefisso dei file `Schermo`. Decisioni confermate da Massy in chat il 26/10/2026, passi 1–7.*

*v2 (26/10/2026): Build 1 fatta (motore, test, salvataggi, interfaccia), pagina di prova pubblicata; scelte di applicazione nella sezione Z, da confermare con la prova.*

*v3 (26/10/2026): Z2–Z10 confermate da Massy; Z1 rivista (se una scorta non basta, il GM sceglie chi la usa), con Fame e Sete per singolo PG (D2, D4).*

*v4 (26/10/2026): limite del riposo (F7, Z7): un solo riposo di 8 ore nelle 24 ore, con l'eccezione del riposo a cavallo di due giorni.*

*v5 (26/10/2026): Build 1 confermata da Massy (razionamento e riposo compresi); sorgenti nel ramo `sviluppo` di `biti87-arch/schermo`, senza build.*

*v6 (26/10/2026): Build 2 divisa in 2a (G, H, I) e 2b (M, N, O). Build 2a fatta: fonti del Vol. 3 in `ferite.json`, motore con 290 test, pagina di prova aggiornata; scelte di applicazione nella sezione Z2a, da confermare. Niente push.*

*v7 (26/10/2026): Vol. 3 2.5.8 con le righe −1 (Massy). Su richiesta di Massy la ferita grave arriva dalla tabella: scelta la tabella, riga, locazione e sotto-tiri li fa l'app (Q2–Q3 anticipati dalla Build 3); riga −1 «ultimo nell'iniziativa». Z2a-9, Z2a-15, Z2a-18 e Z2a-19.*

*v8 (26/10/2026): Build 2a confermata da Massy (Z2a-1…Z2a-19, ferite gravi dalla tabella comprese); push sul ramo `sviluppo` (commit `57557c6`), senza build.*

*v9 (27/10/2026): Build 2b fatta (M, N, O; con i PF dei nemici J9 e gli XP di fine combattimento J10): fonti `razze.json` e `divieti.json` con `controlla_razze.py`, motore con 415 test, pagina di prova aggiornata; scelte di applicazione nella sezione Z2b, da confermare. Niente push.*

*v10 (01/11/2026): Build 2b confermata da Massy (Z2b-1…Z2b-20, con le aggiunte del 01/11: PNG generici condivisi, «+ Scheda» nella testata, «Copia in…»); push sul ramo `sviluppo` (commit `40e478a` e `7858b56`). Nuova **Build 2c «Viaggio e compagnia»** (sezione AA), chiesta da Massy il 01/11: meteo dalle «Tabelle del Tempo Atmosferico v1.0» (AA1, confermato), scorte con Foraggiare e opzione per spegnerle (AA2, proposta da confermare), compagnia con accompagnatori con nome, cavalcature e compagni animali (AA3, proposta da confermare).*

*v11 (01/11/2026): AA2 (scorte e Foraggiare) e AA3 (compagnia) confermate da Massy in chat, con le correzioni sul Cap. 4 delle Tabelle: recipienti per la pioggia, Sciogli neve, una prova di Foraggiare al giorno con la CD dal tempo in vigore, seconda prova per l'acqua, cibo avariato e acqua da purificare usati solo se le buone non bastano, Fame e Sete anche per accompagnatori con nome e animali, foraggio a parte e acqua unica, animali in combattimento, passo «Compagnia» nella creazione.*

*v12 (01/11/2026): Build 2c fatta (AA1–AA3): `meteo.json` dalle Tabelle del Tempo Atmosferico v1.0 con `crea_meteo.py` e `controlla_meteo.py` sul Word, motore con 540 test, pagina di prova aggiornata (365 controlli); scelte di applicazione nella sezione Z2c, da confermare. Niente push.*

*v13 (01/11/2026, sera): Build 2c provata da Massy («funziona tutto»: Z2c-1…Z2c-23 confermate). Aggiunta chiesta da Massy: schede e PG dalla schermata iniziale (Z2c-24…Z2c-26), da confermare sulla pagina di prova (versione 10). Commit locale, niente push.*

*v14 (01/11/2026, sera): **Build 2c confermata** da Massy (Z2c-1…Z2c-26, schede e PG dalla schermata iniziale compresi); push sul ramo `sviluppo` (commit `1ac7353`, `8931a8f`, `767bed6`), nessuna build.*

*v15 (01/11/2026, sera): Build 3 divisa in **3a «Al tavolo»** (condizioni, imprevisti, strumenti, ritocchi ai malus) e **3b** (Prontuario e incontri casuali). Decisioni della 3a confermate da Massy in chat (sezione AB): testi delle condizioni da golarion letti con il browser integrato e adattati alla Collana, livelli negativi sul totale di Fatica e Ferita, Terrore crescente, Fallimenti critici con i sotto-tiri, scheda «Prontuario», durata «× livello», modelli e tipi di bonus, dadi, fonti di luce legate alle Fiamme, promemoria, log per sessione.*

*v16 (01/11/2026, sera): Build 3a fatta (AB1–AB4): `condizioni.json` dai testi di golarion con `crea_condizioni.py` e `controlla_condizioni.py`, Fallimenti critici in `ferite.json`, `strumenti.json` (luce, Fiamme, tipi di bonus), motore con 641 test, pagina di prova aggiornata (479 controlli, artifact versione 11); scelte di applicazione nella sezione Z3a, da confermare. Commit locale, niente push.*

*v17 (01/11/2026, sera): **Build 3a confermata** da Massy (Z3a-1…Z3a-15) con due modifiche chieste sulla pagina di prova: i livelli negativi si sommano a ogni applicazione (Z3a-3 rivista) e la luce personalizzata o permanente (Z3a-15); Tormenta: vale la tabella delle Fiamme (Z3a-8). Push sul ramo `sviluppo` (commit `d4e5e02`, `018f06c`), nessuna build.*

*v18 (01/11/2026, notte): decisioni della **Build 3b** (Prontuario e incontri casuali) confermate da Massy in chat, passi 1–5 (sezione AC): fonti in ordine volume > Tabelle del Tempo > Guida, Abilità e Conoscenze come nel Vol. 1, Cure e recupero con il riposo totale e le Professioni cerusico ed erborista (medicinali ed erbe miste), calcolatore di marcia con marcia forzata e Orientarsi, incontri casuali per area ogni 6 ore di marcia, Pericoli con Cadere e Trattenere il fiato, Meteo consultabile, Riparare e Locanda del Vol. 3. Codice, test e pagina di prova confermati da Massy il 02/11 (Z3b).*

*v19 (02/11/2026): decisioni della **Build 4** (finestra TV, icona, primo rilascio) confermate da Massy in chat, passi 1–7 (sezione AD): contenuto della TV anche fuori dal combattimento, turno di una nascosta che non si vede, nome per i giocatori e «nascosti» anche nei rinforzi e negli incontri casuali, comando «Nome TV…», menu TV con F9 e F10 (F10 solo in combattimento), posizione in `tv.json`, timer solo nei turni dei PG e degli alleati, versione web con Picture-in-Picture → finestra → riquadro, icona con lo schermo a tre ante e il d20, primo rilascio `v1.0.1` / `win-1.0.1` dopo il via di Massy. Sezioni L, K5, U, V2, V9, V10 e X aggiornate. Codice, test e pagina di prova fatti: scelte di applicazione nella sezione Z4. Dopo la prima prova di Massy: aspetto nuovo della TV (AD8) e meteo con i suoi effetti sulla TV (AD9).*

## STATO LAVORO

| Parte | Stato |
|---|---|
| Passo 1 — Struttura e nome | ✅ 26/10 |
| Passo 2 — Riquadro del PG (+ PF temporanei) | ✅ 26/10 |
| Passo 3 — Malus, durate, orologio (+ calendario, scorte, timer, campagne) | ✅ 26/10 |
| Passo 4 — Iniziativa e finestra TV (Preparare senza cambio d'ordine, XP facoltativi, meteo automatico) | ✅ 26/10 |
| Passo 5 — Incontri, Mostri e PNG | ✅ 26/10 |
| Passo 6 — Condizioni, Imprevisti, Prontuario (incontri casuali facoltativi) | ✅ 26/10 |
| Passo 7 — Scelte tecniche e fasi | ✅ 26/10 |
| Build 1 — Campagne, calendario, orologio, scorte, PG, iniziativa, timer | ✅ confermata il 26/10 (Z1–Z10 e limite del riposo); sorgenti nel ramo `sviluppo` (commit `627e822`) |
| Build 2a — Malus e bonus, veleni e malattie, ferite gravi ed emorragie (G, H, I) | ✅ confermata il 26/10 (Z2a-1…Z2a-19, ferite gravi dalla tabella del Vol. 3 2.5.8); sorgenti nel ramo `sviluppo` (commit `57557c6`) |
| Build 2b — Bestiario, PNG, incontri, tattiche (M, N, O) | ✅ confermata il 01/11 (Z2b-1…Z2b-20, PNG generici e «+ Scheda» compresi); sorgenti nel ramo `sviluppo` (commit `7858b56`) |
| Passo 8.1 — Meteo dalle Tabelle del Tempo Atmosferico v1.0 (AA1) | ✅ 01/11 |
| Passo 8.2 — Scorte, Foraggiare (Sopravvivenza), scorte spegnibili (AA2) | ✅ 01/11 |
| Passo 8.3 — Compagnia: accompagnatori con nome, cavalcature e compagni animali (AA3) | ✅ 01/11 |
| Build 2c — Viaggio e compagnia (AA) | ✅ confermata il 01/11 (Z2c-1…Z2c-26, schede e PG dalla schermata iniziale compresi); sorgenti nel ramo `sviluppo` (commit `767bed6`) |
| Passo 9.1 — Divisione della Build 3 (3a: P, Q, T, ritocchi G; 3b: R, S) | ✅ 01/11 |
| Passo 9.2 — Condizioni (AB1) | ✅ 01/11 |
| Passo 9.3 — Imprevisti (AB2) | ✅ 01/11 |
| Passo 9.4 — Malus e bonus: × livello, modelli, tipi di bonus (AB3) | ✅ 01/11 |
| Passo 9.5 — Strumenti (AB4) | ✅ 01/11 |
| Build 3a — Al tavolo: condizioni, imprevisti, strumenti (AB) | ✅ confermata il 01/11 (Z3a-1…Z3a-15, livelli negativi che si sommano e luce personalizzata compresi); sorgenti nel ramo `sviluppo` (commit `018f06c`) |
| Passo 10.1 — Struttura e fonti del Prontuario, Abilità, Combattimento (AC1–AC2) | ✅ 01/11 |
| Passo 10.2 — Cure e recupero, Professione (cerusico) ed (erborista) (AC3–AC4) | ✅ 01/11 |
| Passo 10.3 — Viaggi e incontri casuali (AC5–AC6) | ✅ 01/11 |
| Passo 10.4 — Pericoli e Meteo (AC7–AC8) | ✅ 01/11 |
| Passo 10.5 — Riparare, Locande e luce (AC9–AC10) | ✅ 01/11 |
| Build 3b — Prontuario e incontri casuali (R, S, AC) | ✅ pagina di prova confermata il 02/11 (artifact v13), scelte Z3b confermate; sorgenti nel ramo `sviluppo` (commit `c8e3204`) |
| Passo 11.1 — Contenuto della TV, anche fuori dal combattimento (AD1) | ✅ 02/11 |
| Passo 11.2 — Nome per i giocatori e righe nascoste (AD2) | ✅ 02/11 |
| Passo 11.3 — Comandi, F9 e F10 (AD3) | ✅ 02/11 |
| Passo 11.4 — Timer sulla TV (AD4) | ✅ 02/11 |
| Passo 11.5 — Versione web di prova e Android (AD5) | ✅ 02/11 |
| Passo 11.6 — Icona (AD6) | ✅ 02/11 |
| Passo 11.7 — Numeri di versione del primo rilascio (AD7) | ✅ 02/11 |
| Passo 11.8 — Aspetto della TV e meteo sulla TV (AD8, AD9; dopo la prima prova) | ✅ 02/11 |
| Build 4 — Finestra TV in Electron, icona, primo rilascio APK e Windows | ⬜ pagina di prova confermata il 02/11 (artifact v15, Z4-1…Z4-13, AD8, AD9); push su `sviluppo`; da fare: `main` dopo il via di Massy e prova di APK e Windows |

Una chat per fase. Ogni build finisce con la pagina di prova (artifact) confermata da Massy; le versioni native solo dopo la conferma della Build 4.

---

## A. Scopo e piattaforme

- **A1** App dedicata al GM, pensata **soprattutto per il PC** (Windows, Electron) e per il gioco con un televisore su cui gira Foundry con mappe e pedine.
- **A2** Anche APK Android (stessa pipeline, costo minimo): le colonne si impilano, la finestra TV non c'è.
- **A3** Versione web (artifact) solo per le prove.
- **A4** Nome «Schermo del Narratore», senza apostrofi (trappola nota di `strings.xml` e `main.js`).

## B. Campagne — «Crea Schermo campagna»

- **B1** Prima schermata: elenco delle campagne. Ogni campagna è uno schermo a sé: PG, PNG, incontri, calendario, orologio, scorte, meteo, log, tabelle degli incontri casuali, impostazioni. Pulsanti: Apri, Crea, Duplica, Esporta, Importa, Elimina (con conferma).
- **B2** Creazione guidata, in ordine:
  - nome della campagna;
  - calendario (reale o personalizzato, sez. C) e anno;
  - data e ora di partenza;
  - zona climatica di partenza;
  - PG (si possono aggiungere anche dopo);
  - numero di accompagnatori;
  - cibo e acqua iniziali;
  - impostazioni (sez. U).
- **B3** Il **bestiario dei mostri è condiviso** fra tutte le campagne, come i **PNG generici** (Z2b-18). I **PNG della campagna** appartengono alla campagna, con «Copia in un'altra campagna».

## C. Calendario, orologio e meteo

### Calendario
- **C1** **Reale**: mesi gennaio–dicembre con i giorni veri (febbraio 28, senza bisestili), giorni della settimana lunedì–domenica.
- **C2** **Personalizzato**: elenco dei mesi (nome e numero di giorni), facoltativamente i nomi dei giorni della settimana e la loro lunghezza; per ogni mese la stagione (serve al meteo).
- **C3** L'anno è sempre personalizzato: un numero più un'etichetta facoltativa (es. «1462 dopo la Caduta»).

### Orologio
- **C4** Orologio di gioco sempre visibile in alto: giorno della settimana, data, ora, meteo corrente.
- **C5** In combattimento ogni giro completo dell'iniziativa vale 1 round (6 secondi); 10 round = 1 minuto.
- **C6** Pulsanti: +1 round, +1 minuto, +10 minuti, +1 ora, **Riposo 8 ore** (sez. F7), salto libero (minuti, ore, giorni).
- **C7** Avanzare il tempo:
  - scala le durate in minuti, ore e giorni (i round residui contano 10 per minuto);
  - fa scadere i timer delle emorragie;
  - fa scattare le scadenze di veleni e malattie;
  - consuma le fonti di luce;
  - al cambio di giorno: scorte (sez. D) e meteo (C8).
  
  Se nel salto cadono più scadenze, l'app le propone in coda una per una.

### Meteo
*Dalla Build 2c C8–C10 sono sostituite dalla sezione AA1 (Tabelle del Tempo Atmosferico v1.0).*
- **C8** A ogni cambio di giorno l'app tira il d100 sulla tabella della Guida del DM («Tempo atmosferico»), in base alla **zona climatica** e alla **stagione**:
  - zone: temperata, desertica, artica; si cambiano mentre si viaggia;
  - stagioni: con il calendario reale si usano le date della Guida (temperata: primavera 21/3–21/6, estate 22/6–22/9, autunno 23/9–21/12, inverno 22/12–20/3; desertica e artica: primavera-estate 21/3–22/9, autunno-inverno 23/9–20/3); con quello personalizzato la stagione del mese (C2).
- **C9** Si può ritirare o impostare a mano. Gli effetti del meteo (Acquazzone, Arsura/Gelo, Clima caldo/freddo, Monsone, Nebbia, Neve e nevischio, Neve fitta, Pioggia battente, Tempesta di grandine/polvere/sabbia, Vento forte, Vento molto forte) compaiono sotto l'orologio con il testo della Guida.
- **C10** Refuso della Guida: l'estate della zona temperata comincia il «2 giugno» → letto **22 giugno** (la primavera finisce il 21 giugno).

## D. Scorte di cibo e acqua

*Dalla Build 2c: razione d'acqua, Foraggiare, scorte spegnibili e animali nelle sezioni AA2–AA3.*

- **D1** Due scorte, cibo e acqua, in **razioni giornaliere** (1 razione = 1 persona per 1 giorno).
- **D2** Consumo a ogni cambio di giorno, uguale per le due scorte: **numero dei PG + numero degli accompagnatori**. Se una scorta **non basta per tutti**, il GM sceglie chi la usa: quali PG e quanti accompagnatori (Massy, 26/10). A 0 nessuno la usa, senza chiedere. Fame e Sete si contano **per PG**; degli accompagnatori non si tengono penalità. Gli accompagnatori sono solo un numero, impostato nella creazione e modificabile.
- **D3** Pulsanti +/− (rifornimenti, caccia, perdite) e indicatore «Bastano per N giorni».
- **D4** Scorta esaurita o razionata (Guida, «Fame e sete»), malus a ogni PG rimasto senza:
  - **Sete N**: −N ai tiri per colpire, ai TS e alle prove, con il modificatore applicato; dal **4° giorno** senza acqua, ogni giorno, promemoria della prova di Costituzione CD 10. Se fallisce: privo di sensi, morte entro 1d12 ore.
  - **Fame N**: stesso schema, dal **7° giorno**.
  - Mangiare o bere: la penalità scende di 1 al giorno.
  - Vol. 1: affaticato o esausto dovuti a fame o sete si tolgono solo rifocillandosi.
- **D5** Refuso della Guida: il paragrafo della sete dice «non abbia mangiato» → letto «non abbia bevuto».

## E. PG — dati della scheda

| Gruppo | Campi |
|---|---|
| Identità | nome, giocatore, razza, classe e livello (testo libero), livello numerico (per il riposo) |
| PF | Punti Fatica max, Punti Ferita max; Rifiatare: numero di dadi (= DV) e tipo di dado; spunta «ripete 1 e 2» (tratti razziali Recupero rapido, Zangue troll, Linfa curativa, Linfa rigenerante) |
| Difese | CA, CA di contatto, CA colto alla sprovvista, DMC; RD, resistenze, immunità (testo) |
| TS | Tempra, Riflessi, Volontà + note condizionali (es. «+2 vs [PAURA]») |
| Abilità | Percezione, Intuizione, Furtività + 2 abilità libere (nome e valore) |
| Iniziativa | bonus; penalità da impreparato −6 (normale), −3 (Vigili, Paranoico, Paranoiko e simili) o 0 (Sempre pronto) |
| Altro | velocità, sensi, Punto eroe (0/1, mai più di 1), note |

- **E1** I dati della scheda si inseriscono una volta; i valori correnti (PF, malus, Punto eroe, riserva del Rifiatare) si salvano da soli.

### Riquadro sul Tavolo
```
ARIA — Ladro 7          Init +6   Eroe ●
Fatica 31/42 ▓▓▓▓▓░   Ferita 40/40   Temp 0
CA 19 · Ctt 14 · Spr 15 · DMC 21
Tem +5 · Rif +9 · Vol +3   (+2 vs [PAURA])
Perc +12 · Int +8 · Furt +14
Rifiatare 5/7 d8   Non letali 0
[Scosso 3r] [Veleno: For · 2/6r]
[Danno] [Cura] [PF temp] [Rifiata] [Malus/Bonus]
```

## F. PF — danni, cure, temporanei, Rifiatare, riposo (Vol. 1 2.5.2)

- **F1** **Danno**: toglie prima i PF temporanei (prima la fonte che scade per prima), poi i Punti Fatica, poi i Punti Ferita.
- **F2** **Ferita grave**: quando un danno porta i Punti Ferita sotto 0 si apre la ferita grave **sulla riga uguale al valore negativo** (−7 → riga −7; −15 o meno → riga −15; confermato da Massy). Si sceglie la tabella e si tira (sez. Q). L'app la propone **ogni volta** che i Ferita scendono ancora sotto lo zero; si può chiudere senza tirare.
- **F3** **Danno non letale**: contatore a parte. Uguale ai Ferita attuali → promemoria «barcollante»; superiore → «privo di sensi». Recupero 1 all'ora con l'orologio.
- **F4** **Cura** magica o alchemica: prima i Punti Ferita, raggiunto il massimo i Punti Fatica. Si può dirigere la cura su una ferita grave o un'emorragia (sez. I).
- **F5** **PF temporanei**: pulsante con fonte, valore e durata. Fonte uguale: non si somma, resta il valore più alto. Fonti diverse: si sommano. Scadono con la durata.
- **F6** **Rifiatare**: si sceglie quanti dadi della riserva usare; l'app tira (ritirando 1 e 2 se c'è la spunta) e aggiunge il totale **solo ai Punti Fatica**. Il personaggio deve essere cosciente.
- **F7** **Riposo 8 ore**:
  - Punti Fatica al massimo;
  - +1 Punto Ferita per livello;
  - riserva del Rifiatare piena;
  - avanza l'orologio di 8 ore, con le sue scadenze.
  
  Il Punto eroe non cambia.

  **Limite** (Massy, 26/10): un solo riposo nelle 24 ore, per singolo PG.
  - Il riposo successivo si può fare 24 ore dopo l'inizio del precedente.
  - Se il precedente è passato a cavallo di due giorni (finito dopo la mezzanotte), il giorno dopo si può fare anche prima, ma non prima di 12 ore dalla sua fine. Esempio: riposo 22:00 → 06:00, il successivo dalle 18:00.
  - Un riposo che finisce esattamente a mezzanotte non conta come a cavallo.
  - Nella finestra del riposo i PG che non possono riposare non sono selezionabili e mostrano da quando potranno.
- **F8** Gli effetti delle ferite gravi sul recupero dei Fatica (organo compromesso: Fatica recuperati dimezzati, poi a un terzo) si applicano al Rifiatare e al riposo quando il malus è presente.

## G. Malus e bonus

*Dalla Build 3a: × livello, modelli e tipi di bonus in AB3; livelli negativi sul totale di Fatica e Ferita in AB1-2.*


| Campo | Valori |
|---|---|
| Tipo | Condizione (dall'elenco, con % per Offuscato e N per i livelli negativi), Veleno, Malattia, Ferita grave, Emorragia, Bonus, Altro |
| Durata | N round · minuti · ore · giorni · fino a fine incontro · finché curata · permanente |
| Scadenza dei round | all'inizio del turno del **bersaglio** (predefinita) o del turno di **chi l'ha causato** (scelto dall'iniziativa) |
| Modificatori | facoltativi: TS (singoli o tutti), CA, abilità, Iniziativa, Fatica max |
| Etichetta | per i gruppi («Lupo 3: prono») |
| TS periodico | facoltativo per qualsiasi malus: tipo di TS, CD, frequenza, «superato = finisce» |

- **G1** Fuori combattimento i round si consumano con l'orologio (10 per minuto).
- **G2** **Condizioni applicate ai valori del riquadro**: il valore modificato è colorato, quello base compare passandoci sopra.

| Condizione | Effetto applicato |
|---|---|
| Scosso, Spaventato, In preda al panico, Infermo | TS e abilità −2 |
| Abbagliato | Percezione −1 |
| Accecato | CA −2, Percezione −4 |
| Assordato | Iniziativa −4 |
| Impreparato, Colto alla sprovvista | la CA mostrata diventa quella colto alla sprovvista |
| Livelli negativi (N) | TS, abilità e DMC −N; Fatica max −5 per livello negativo |
| Prono | nota «−4 CA in mischia / +4 a distanza» |
| Sete N, Fame N | TS e abilità −N |

  Le condizioni che passano da For o Des (Affaticato, Esausto, Intralciato, In lotta…) restano solo come etichetta.
- **G3** **Bonus temporanei**: stesso pulsante («Benedizione: +1 TpC, 3 minuti»). I bonus a TS, CA e abilità si sommano ai valori mostrati; gli altri restano come etichetta.

## H. Veleni e malattie

- **H1** Campi come nella scheda di Pathfinder:
  - tipo (ferimento, contatto, ingestione, inalazione);
  - TS e CD;
  - insorgenza;
  - frequenza (1/round, 1/minuto, 1/ora, 1/giorno) per N volte;
  - effetto (es. «1d2 For»);
  - cura (N TS consecutivi).
- **H2** A ogni scadenza: «Tira Tempra CD 13 — successi consecutivi 0/1», con i pulsanti Superato e Fallito. Se fallisce, l'app tira i dadi dell'effetto e lo scrive nel log.
- **H3** Il malus si chiude da solo quando arriva la cura o finisce la frequenza.
- **H4** «Dose aggiuntiva»: CD +2 e durata +50% (regola di Pathfinder 1e, non scritta nella Collana; tenuta, Massy non ha obiettato).

## I. Ferite gravi ed emorragie (Vol. 3 2.5.7, Cap. 3)

- **I1** Quando si attacca un risultato delle Ferite gravi, l'app lo divide nelle sue parti e le mostra prima della conferma:

| Testo | Diventa |
|---|---|
| «barcollante per 2 round», «infermo per 1 minuto» | Condizione con durata |
| «finché la ferita di gravità N (X PF) non viene curata» | **Ferita gravità N** con contatore delle cure (0/10, 0/20, 0/30 PF) e condizione legata: guarita la ferita, sparisce la condizione |
| «Morirai per emorragia lieve (8 PF) entro 1d3+1 minuti» (o 2d4 minuti) | **Emorragia lieve**: tira subito la durata e fa partire il timer sull'orologio |
| «5% cumulabile di probabilità di morire per emorragia grave (24 PF)» | **Emorragia grave**: a fine turno l'app tira il d100 (5%, poi 10%, 15%…) |
| attacco di panico con 5% cumulabile | come l'emorragia grave, con «azione di round completo» (o due) per fermarlo |
| penalità permanenti (TS, Iniziativa, caratteristiche, Fatica e Ferita max) | Malus permanente con modificatori |
| privo di sensi per 1 ora, coma | Condizione con durata / permanente |
| amputazioni | Malus permanente dalla tabella «Amputazioni e arti inutilizzabili» |

- **I2** Per ogni emorragia e ferita c'è un pulsante con la tabella «Fermare le emorragie e curare le ferite gravi» del Vol. 3:

| Ferita | Unità di medicinali | CD e tempo | Ritentare |
|---|---|---|---|
| Emorragia lieve | 1 | CD 15, cura immediata | dopo 1 round, CD +1 a ogni tentativo |
| Emorragia grave | 2 | CD 25, cura immediata | dopo 1d4 round, CD +1 |
| Gravità 1 | 1 | CD 15, cura dopo 1 giorno | dopo 1 giorno, CD −1 |
| Gravità 2 | 2 | CD 20, cura dopo 3 giorni | dopo 2 giorni, CD −1 |
| Gravità 3 | 3 | CD 25, cura dopo 7 giorni | dopo 3 giorni, CD −1 |

  Prova di Professione (cerusico): l'app registra il tentativo e il tempo di guarigione sull'orologio. Cure magiche: dirette al contatore di quella ferita, anche a più riprese.
- **I3** Alla morte: avviso, con il pulsante «Tira il 20% del Morente» (Vol. 1: creatura vivente che muore in combattimento, 20% di restare morente per 1 minuto; ultime parole). Morente è narrativo e non si colora.

## J. Iniziativa

### Avvio del combattimento (da un incontro o vuoto)
- **J1** **PG**: si inserisce il **totale** detto dal giocatore. Con l'opzione «inserisco il d20» l'app aggiunge il bonus.
- **J2** **Impreparati**: casella per creatura; l'app toglie −6, −3 o 0 secondo la scheda.
- **J3** **Nemici**: tirati dall'app. Ogni volta si sceglie:
  - **per tipo** (predefinito): 5 lupi tirano una volta e diventano una riga «Lupi ×5»; il lupo crudele ha la sua riga;
  - **per singolo**: una riga per creatura.
  
  Si possono correggere a mano.
- **J4** Vol. 1: **20 naturale = 30, 1 naturale = −10**, anche per il d20 dei PG nell'opzione J1.
- **J5** Pari merito: prima il bonus più alto; se è uguale anche il bonus, un tiro di spareggio.

### Durante il combattimento

| Comando | Effetto |
|---|---|
| Avanti / Indietro | turno successivo; Indietro annulla l'ultimo passo, durate e tiri automatici compresi |
| Ritardare | la creatura esce dall'ordine («in attesa»); con «Entra ora» si inserisce prima di chi sta agendo e lì resta |
| **Preparare** | **non cambia l'ordine** (decisione di Massy): la creatura è segnata con l'azione e l'innesco; «Scatta» la scrive nel log e la chiude |
| Punto eroe | il PG si sposta subito prima di chi stava per agire (Vol. 1) e il Punto eroe viene speso |
| Separa | stacca una creatura dal suo gruppo, con la stessa iniziativa (poi modificabile) |
| Rinforzi | aggiunge creature a combattimento iniziato, con il loro tiro |
| Fuori combattimento | la creatura si salta ed è barrata (o tolta) |
| Nascosta / Rivela | la fa sparire o comparire sulla finestra TV |
| Fallimento critico | apre la tabella per la creatura che agisce (sez. Q) |

- **J6** Niente round di sorpresa: con le regole della Collana gli impreparati tirano a −6 ma agiscono.
- **J7** **Barra del turno** in cima: chi agisce, cosa scade, cosa tirare. Esempio: «Tocca ad Aria: Veleno, Tempra CD 13 · Scosso scade ora · Torcia: 10 minuti». Mostra anche le tattiche dei nemici (sez. O) e i promemoria di round. A fine turno l'app tira le emorragie al 5%.
- **J8** I malus dei gruppi scalano nel turno del gruppo.
- **J9** **PF dei nemici**: impostazione «Scala i PF dei nemici», **spenta di default** (Massy scala i PF sulle pedine di Foundry). Da spenta i nemici hanno solo iniziativa, malus e tattiche. Da accesa ogni creatura ha i suoi Fatica e Ferita (anche dentro una riga di gruppo, aprendola), con le stesse regole dei PG (sez. F). Attiva dalla Build 2b (Z2b-3).
- **J10** **Fine combattimento**: riepilogo con round e durata (se il timer è acceso). XP dell'incontro solo se la campagna li usa: somma degli XP dei nemici sconfitti divisa per il numero dei PG, con la scelta se contare anche gli accompagnatori.

## K. Timer reale (facoltativo)

- **K1** Interruttore nelle impostazioni della campagna.
- **K2** Cronometro del turno corrente, del combattimento e conteggio dei round giocati. Il cronometro si ferma con Pausa.
- **K3** Soglia di avviso facoltativa: il timer del turno cambia colore dopo N secondi.
- **K4** A fine combattimento il riepilogo va anche nel log: durata, round, tempo medio e turno più lungo per ogni PG.
- **K5** Sulla finestra TV il timer è facoltativo, spento di default; dettagli in AD4.

## L. Finestra TV

*Rivista con la Build 4: decisioni in AD1–AD5.*

### Contenuto
- «Round N», chi agisce ora (in grande), i 2 prossimi, poi il resto dell'ordine che riparte dopo una riga «Round N+1»; «In attesa: …» per chi ritarda (AD1).
- Gruppi come «Lupi», con o senza «×N» (opzione).
- Le creature nascoste non compaiono, nemmeno nel loro turno: in grande c'è già il prossimo visibile. Quelle fuori combattimento sono barrate o tolte (opzione).
- Ogni nemico o alleato può avere un **nome per i giocatori** («Figura incappucciata»), anche nei rinforzi, negli incontri casuali e a combattimento iniziato (AD2).
- Facoltativi: timer del turno (AD4), data e ora, meteo dell'ora.
- Fuori combattimento: data e ora e meteo, se accesi; senza nulla da mostrare la finestra si nasconde da sola (AD1).
- **Mai i PF**, né malus, condizioni, ferite gravi, tattiche, promemoria, tiri, Preparare, nomi veri delle creature con il nome per i giocatori.

### Aspetto
Fondo scuro ad alto contrasto; il testo si ingrandisce con la finestra.

### Comandi dalla schermata principale (AD3)
- Pulsante **TV** nella testata con il menu: **Mostra/Nascondi** (anche **F9** da qualsiasi programma, Foundry compreso), **Sposta sulla TV** (schermo successivo), **Blocca posizione**, **Ripristina**.
- «**Solo durante il combattimento**» (acceso di default): la finestra si apre all'avvio del combattimento e si chiude alla fine; F9 vale fino all'evento automatico successivo.
- **F10** = Avanti da qualsiasi programma: impostazione spenta di default, attivo solo durante un combattimento.

### Tecnica (Windows)
- Seconda finestra Electron senza bordi, `alwaysOnTop` al livello `screen-saver` (sopra Foundry a schermo intero), fuori dalla barra delle applicazioni, trascinabile e ridimensionabile.
- Posizione, dimensione, schermo e blocco salvati in `tv.json` nei dati dell'app (per PC, non per campagna).
- Riceve via IPC solo lo stato da mostrare.

### Versione web di prova (AD5)
Picture-in-Picture (Chrome/Edge, solo da una pagina di primo livello) → finestra normale del browser → riquadro dentro la pagina; «Usa il riquadro» per provarlo di proposito. Android: niente finestra TV.

## M. Bestiario — Mostri e PNG

- **M1** Due sezioni (tre dal 01/11: PNG della campagna, PNG generici condivisi, Mostri condivisi, Z2b-18) con le stesse funzioni (iniziativa, malus, PF, tattiche, scheda di lato):
  - **Mostri**: condivisi fra le campagne;
  - **PNG**: per campagna, copiabili.
  
  Ricerca per nome, GS, tipo, etichette; preferiti.
- **M2** **Struttura della scheda**: quella di `Struttura_Scheda_PNG.md` (Massy, 26/10, da `Guida_creazione_schede_PNG_v1.md` v1.2 della campagna Storie di Criptorei). Tipi `png` e `mostro_pf1`. Sezioni: testata, razza, caratteristiche, difesa, offesa, statistiche, equipaggiamento, tattiche, varianti e vincoli, ordine di stampa.
- **M3** **Incolla**: lo stat block copiato da un documento d'avventura (formato «NOME — Classe N · GS N · XP N», «── DIFESA ──», …) viene letto campo per campo: Iniziativa, Sensi, Percezione, CA (contatto, sprovvista), PF (Fatica/Ferita), TS, RD/immunità, velocità, attacchi, tattiche. Ciò che l'app non riconosce resta come testo. Si può incollare un'intera sezione: l'app trova tutti i blocchi «NOME — … · GS» e li importa uno per uno. Le truppe ★ e i modelli ★ restano voci uniche.
- **M4** **Scheda guidata**, con i calcoli della struttura:
  - CA, contatto e sprovvista con la scomposizione «[10 + …]»;
  - PF: primo DV pieno + medie col ritiro (d6 4 · d8 5,5 · d10 6,5 · d12 8) + Cos × livello (+ Robustezza), per difetto; Fatica ⌊PF/2⌋, Ferita ⌈PF/2⌉;
  - bonus eroici (TS +1 a 8/12/16/20; CA, contatto, sprovvista e DMC +1 per livello dal 10°: 10° = +1);
  - TS (base dalla tabella di classe, inserita) + mod + eroico; BMC, DMC;
  - attacchi iterativi a BAB +6/+11/+16; colpire e danni per arma; Attacco poderoso (−1/+2, +50% a due mani, gradino in più a BAB 4/8/12/16/20);
  - totali delle abilità (gradi + mod + 3 se di classe + razziale + vari);
  - tetto di Sintonia (+1 al 4°, +2 al 9°, +3 al 12°, +4 al 15°, +5 al 17°);
  - GS = livello − 1, = livello con capacità o oggetto di trama; XP dalla tabella PF1e (nascosti se la campagna non usa gli XP); alleato: GS sì, XP no;
  - taglia custom (Piccola, Media, Grande speciale) con la tabella della struttura;
  - mostro_pf1: PF del bestiario divisi (dispari ai Ferita), fonte, volo standard, GS/XP del bestiario.
- **M5** Razze dal file `Razze.md` della campagna (tipo e sottotipo, taglia, sensi, tratti); il tiro della razza è un campo di testo facoltativo. `Razze.md` è l'estratto del Vol. 1 v2.5.1 (Cap. 2): la 2.5.2 cambia solo il Cap. 1.
- **M6** **Segnalazioni** (§9 della struttura):
  - talenti proibiti (Colpo vitale, Maestria in combattimento, Tiro multiplo, Competenza nelle armi esotiche, Creazione oggetto, mitici…);
  - abilità inesistenti (Addestrare animali, Linguistica, Artigianato; Guarire → Professione (cerusico); Conoscenze (locali/geografia) → (generali); (piani) → (proibite));
  - incantesimi inesistenti (Invisibilità, Invisibilità superiore, Evoca mostri, Evoca alleato naturale, teletrasporto a lunga distanza);
  - Morente come condizione; manovre Disarmare e Spezzare;
  - Sintonia oltre il tetto; volo oltre 1 m per un PNG senza motivo;
  - tattiche senza fuga o resa o senza tratto razziale.
- **M7** **Copia come testo**: lo stat block nell'ordine del §10 della struttura, pronto da incollare in un documento.
- **M8** **💰 Tesoro**: campo promemoria (livello, quantità, chi lo porta, note). Il tesoro si genera con l'app dei Tesori (una sola fonte). Integrabile in futuro riusando il motore dei Tesori, con il costo di un secondo riallineamento a ogni modifica del Manuale dei Tesori.

## N. Incontri

- **N1** Per campagna, in cartelle (atto, capitolo). Campi:
  - titolo, luogo, stato (da giocare / giocato, con la data di gioco);
  - note con grassetto ed elenchi;
  - tesoro (testo);
  - **partecipanti**: mostri e PNG con quantità, iniziativa per tipo o per singolo, «nascosto all'inizio», «nome per i giocatori»;
  - **promemoria per round** («round 4: crolla il ponte»).
- **N2** Pulsanti Duplica e **Avvia**: i partecipanti entrano nell'iniziativa numerati (Goblin 1, 2…) o raggruppati.
- **N3** Se la campagna usa gli XP, l'incontro mostra il totale.

## O. Tattiche in combattimento

- **O1** Cliccando una riga dell'iniziativa si apre di lato lo stat block intero.
- **O2** Le tattiche compaiono da sole nella barra del turno:
  - «Round 1» al primo turno;
  - «Round 2–3» al secondo e al terzo;
  - «Finita la Fatica» quando i Fatica arrivano a 0 (con J9 spenta: pulsante «Fatica finita»).
  
  «Fuga o resa» è sempre a un clic.

## P. Condizioni

*Dalla Build 3a: decisioni in AB1 (fonti, testi adattati, comportamento, interfaccia).*


- **P1** Elenco: le 37 condizioni del progetto (Azzoppato, Colto alla sprovvista, Offuscato, Sempre pronto, Affaticato, Abbagliato, Accecato, Accovacciato, Affascinato, Assordato, Barcollante, Confuso, Esausto, Frastornato, Immobilizzato, Impreparato, In Lotta, Inabile, Incorporeo, Indifeso, Infermo, Intralciato, Invisibile, Morto, Nauseato, Paralizzato, Scosso, Spaventato, In Preda al Panico, Pietrificato, Privo di Sensi, Prono, Rotto, Sanguinante, Scheggiato, Stabilizzato, Stordito), più Morente (narrativa, non colorata) e gli stati di Indifeso (Addormentato, Bloccato, Legato).
- **P2** Nomi in rosso #C00000. Gruppi: Paura (Scosso → Spaventato → In preda al panico → Accovacciato), Fatica (Affaticato → Esausto), Oggetti (Scheggiato → Rotto, penalità dal Vol. 3).
- **P3** Ogni scheda: riga di sintesi (tabella della Guida), testo completo, pulsante **Applica a…** (creatura e durata).
- **P4** Fonti del testo:
  - Vol. 1 2.5.2 per Azzoppato, Colto alla sprovvista, Morente, Offuscato e Sempre pronto;
  - golarion.altervista.org per le altre;
  - Guida («Cure e recupero») per danni non letali, danni alle caratteristiche e livelli negativi.
- **P5** Tooltip: passando sopra un'etichetta di condizione in qualunque punto dell'app compare l'effetto in breve. Ricerca per nome e per gruppo.

## Q. Imprevisti (Vol. 3 2.5.7, Cap. 3)

*Dalla Build 3a: Fallimenti critici e consultazione in AB2.*


### Ferite gravi
- **Q1** Tre tabelle, righe da −1 a −15:
  1. Armi e incantesimi con tiro per colpire: locazione con 1d8 (1 Testa, 2–4 Busto, 5 Braccio sinistro, 6 Braccio destro, 7 Gamba sinistra, 8 Gamba destra);
  2. Attacchi con area di effetto o effetti senza tiro per colpire;
  3. Danni a Costituzione, veleni, sanguinamento o livelli negativi.
- **Q2** **Tira**: tabella e riga (già impostata se arrivi da un Danno). L'app fa anche i sotto-tiri:
  - slot dell'oggetto (1d3, 1d4, 1d6, 1d8 secondo la riga) e 1d12 della nota ¹;
  - lato 1d4, 50% distrutto, 1d3 della caratteristica, 1d2 dita;
  - durate (1d3+1 minuti, 2d4 minuti).
  
  Per lo slot vuoto mostra l'ordine della nota ¹ (volto → gola → testa → torso → armatura → spalle → vita → braccia → mani → anello → cintura → piedi): l'app non sa cosa indossa il PG.
- **Q3** **Attacca a…** divide il risultato come nella sez. I.
- **Q2–Q3 anticipati nella Build 2a** (Massy, 26/10): quando un danno porta i Punti Ferita sotto 0 si sceglie solo la tabella; riga, locazione (1d8, modificabile), sotto-tiri e scomposizione li fa l'app (Z2a-15).

### Fallimenti critici
- **Q4** Cinque tabelle (Vol. 1: l'1 naturale al tiro per colpire è un Fallimento critico):
  1. Armi da mischia (d12);
  2. Attacchi senz'armi o di contatto in mischia, compresi gli incantesimi (d12);
  3. Armi da tiro, da fuoco o da lancio (d12);
  4. Armi a spargimento (d6);
  5. Incantesimi di contatto a distanza, comprese pergamene, bacchette e bastoni (d6).
- **Q5** Sotto-tiri automatici:
  - oggetto ² (1d12 della nota);
  - «1-2 scudo, 3-4 armatura, 5-6 oggetto» (1d6, o 1d4);
  - «1d3+1 caselle» (o 1d4+1) con la direzione su 8 punti cardinali.
  
  «Alleato ¹» compare come promemoria (l'alleato più vicino al bersaglio, entro portata o gittata).
- **Q6** «Se sei già prono conta questo risultato come 9 (o 6)»: se la creatura ha già Prono, l'app lo applica da sola.
- **Q7** Le condizioni ottenute si attaccano alla creatura con la durata.

### Consultazione
- **Q8** «Fermare le emorragie e curare le ferite gravi» e «Amputazioni e arti inutilizzabili» come tabelle consultabili, collegate ai malus.

## R. Prontuario (dalla Guida del DM, solo ciò che i volumi non hanno)

*Dalla Build 3b: decisioni in AC1–AC5 e AC7–AC10 (fonti, sezioni, strumenti).*


| Sezione | Contenuto e strumenti |
|---|---|
| Abilità | Riassunti con le tabelle delle CD, **senza Addestrare animali** (non è un'abilità del sistema); titolo «Utilizzare oggetti magici» → **Utilizzare congegni magici** |
| Combattimento | Concentrazione (tabella delle CD), occultamento e coperture, Riduzione del danno (tabella dei potenziamenti equivalenti) |
| Cure e recupero | Guarigione, danni non letali, danni alle caratteristiche, livelli negativi |
| Viaggi | Marcia giornaliera e forzata, cavalcare veloci, tabella delle velocità per mezzo e terreno. **Calcolatore**: mezzo + terreno + ore → km percorsi; avanza anche l'orologio |
| Pericoli | Annegamento (e issare a riva), cadere (tabella, cadere in acqua, tuffi), fumo, fame e sete, terreni scivolosi, ambienti (acquatici, boschi, colline, deserti, paludi e sabbie mobili, montagne e altitudine, valanghe e frane) |
| Meteo | Tabelle ed effetti (usate dall'orologio, sez. C) |
| Riparare | Dal **Vol. 3** («Riparare oggetti rotti»), che fa fede sulla Guida. Refuso della Guida: CD «scheggiato» delle armi +10 = 39 → 29 |
| Locande e luce | Tabelle con i prezzi. **Applica al gruppo** per gli effetti fino al giorno dopo (Dormitorio: Fatica max −¼; Suite: +1 Fatica max per livello, minimo +3; Pasto scadente: −1 al primo TS su Tempra entro 24 ore…). Fonti di luce collegate all'orologio (sez. T) |

## S. Incontri casuali (facoltativi)

*Dalla Build 3b: S2 sostituita da AC6 (aree della campagna, tiro ogni 6 ore di marcia dal calcolatore, tiro a mano).*


- **S1** Opzione della campagna, **spenta di default**: Massy li tira di solito dal suo documento e le percentuali cambiano spesso.
- **S2** Se accesa:
  - probabilità per area ogni 6 ore di marcia, valori iniziali della Guida (terre selvagge 20%, caverne e sotterranei 15%, montagna 10%, bosco 10%, campagna e colline/strade 5%, deserto o desolazione 5%; speciali 20% nelle grotte, 30% in oasi e rovine), **modificabili sempre**;
  - tabelle d% della campagna, scritte dal GM: mostri o PNG dal bestiario con quantità (es. «2d4 Lupi») o un evento testuale;
  - a ogni 6 ore di marcia l'app tira; se esce un incontro tira l'ora (2d12) e la composizione e propone **Avvia**.
- **S3** La Guida non ha le tabelle di composizione («a pagina seguente» manca nel PDF).

## T. Strumenti

*Dalla Build 3a: AB4 (dadi, fonti di luce con le Fiamme, promemoria, log).*


- **T1** **Dadi**: espressioni (`2d6+3`, `1d20+5`, `4d6kh3`) con storico; 20 naturale = 30 e 1 naturale = −10 indicati nei tiri di d20.
- **T2** **Fonti di luce** (Guida): candela 1 ora (3 m), torcia 1 ora (9 m), lanterna 3 ore per fiaschetta (15 m). Si attaccano a un PG o al gruppo, si consumano con l'orologio, avvisano 10 minuti prima.
- **T3** **Promemoria**: legati a un round o a un'ora del calendario; scattano da soli; si possono salvare in un incontro.
- **T4** **Log della sessione**: danni, cure, ferite gravi, fallimenti critici, morti, scadenze, tiri dell'app, riepiloghi dei combattimenti, cambi di giorno e meteo. Esportabile in .txt per il Diario della campagna.

## U. Impostazioni della campagna

| Impostazione | Predefinita |
|---|---|
| Usa gli XP | **spenta** (Massy usa le milestone) |
| Scala i PF dei nemici | **spenta** |
| Timer reale | spenta |
| Timer sulla TV | spenta (serve il Timer reale; AD4) |
| Soglia di avviso del timer | nessuna |
| Incontri casuali | **spenta** |
| TV: «×N» nei gruppi | accesa |
| TV: creature fuori combattimento | barrate |
| TV: data e ora / meteo | spente |
| TV: solo durante il combattimento | accesa |
| Tasto F10 turno successivo | spento (solo durante un combattimento; AD3) |
| Tema | scuro (chiaro a scelta) |

Le impostazioni TV valgono nell'app Windows e nella versione web; nell'app Android restano nella campagna con la nota «solo nell'app Windows» (AD5). Posizione e blocco della finestra TV non sono della campagna ma del PC (`tv.json`, AD3).

## V. Tecnica

- **V1** Repo creato da `nuova_app.py --da repos/alchimista --a schermo --slug schermo --nome "Schermo del Narratore" --prefisso Schermo` (skill collana-app §7). Capacitor 6 (`it.collana.schermo`), Electron 31, workflow `apk.yml` e `windows.yml`, keystore nuovo.
- **V2** **Electron**:
  - `desktop/main.js` con la finestra principale e la finestra TV (`tv.html`);
  - `preload.js` con `contextBridge` per salvataggi, finestra TV e tasti globali (`globalShortcut` F9 sempre, F10 solo durante un combattimento con l'impostazione accesa; avviso se un altro programma li tiene);
  - `screen.getAllDisplays()` per «Sposta sulla TV»; `tv.json` in `userData` con posizione, dimensione, schermo e blocco; schermo assente all'avvio → posizione predefinita sullo schermo principale;
  - il contenuto della TV è disegnato dalla stessa funzione in Electron, Picture-in-Picture, finestra del browser e riquadro (AD5); lo stato da mostrare lo calcola il motore (`statoTV`);
  - chiudendo la finestra principale si chiude anche la TV e l'app esce.
- **V3** **Salvataggi**:
  - Windows: file JSON nella cartella dati dell'app (`app.getPath('userData')`), uno per campagna più `bestiario.json`, scritti 1 secondo dopo ogni modifica; copia di sicurezza giornaliera, tenute le ultime 10;
  - Android e browser: IndexedDB.
  
  Non `localStorage`: bestiario, incontri e log ne superano il limite. Formato versionato (`schermo-v1`) con migrazioni.
- **V4** **Backup**: Esporta/Importa JSON (campagna, bestiario o tutto); log in .txt. Su Android Filesystem + Share.
- **V5** **Dati** (`sorgenti/`):
  - `estrai_testo.py` + parser dal **Vol. 1 2.5.2 senza immagini** (condizioni nuove, regole dei PF, 1 e 20) e dal **Vol. 3 2.5.7** (Fallimenti critici, Ferite gravi, Fermare le emorragie, Amputazioni, Riparare oggetti rotti), con i flag di formattazione come nelle altre app;
  - `prontuario.json` e `meteo.json` dalla **Guida del DM** (PDF): tabelle ricostruite a mano e controllate da uno script;
  - `condizioni.json` con il testo di golarion.altervista.org;
  - `razze.json` da `Razze.md` (campagna);
  - `divieti.json` da `Struttura_Scheda_PNG.md` §9 e `Regole_Collana.md`;
  - tabella degli XP per GS di PF1e.
- **V6** **Motore** `motore.js` a funzioni pure (Node + pagina), con `test_motore.js` che stampa solo errori e conteggi:
  - danni, cure, PF temporanei, Rifiatare, riposo;
  - durate, orologio e calendario;
  - meteo e scorte;
  - iniziativa (gruppi, ritardare, punto eroe, annulla);
  - dadi;
  - lettura degli stat block;
  - divisione delle ferite gravi in componenti;
  - calcoli della scheda PNG, GS/XP e segnalazioni.
- **V7** **Template** `template.html` e `build.py` (con `<\/` nei dati, come i Tesori); `www/index.html` rigenerato e committato con i sorgenti.
- **V8** **Aspetto**:
  - colori della Collana (titoli #C45911, oro #8B6914 e #D4A84B, condizioni #C00000, Vantaggio #1E7A1E, Svantaggio #C00000) e font in `vendor/` come le altre app;
  - impaginazione da PC in 3 colonne (PG, iniziativa, scheda/log); sotto i 900 px colonne impilate.
- **V9** Controlli prima di ogni push: `controlla_app.py` a 0 errori; pagina provata con Playwright a 1366 e 390 px, nessun errore in console, finestra TV provata anche come riquadro nella pagina.
- **V10** Al primo rilascio: riga in `app.tsv`, scheda in `app.md`, tabella della skill collana-app e stato dei lavori. Manuali letti: Vol. 1 2.5.2, Vol. 3 2.5.8, Tabelle del Tempo Atmosferico v1.0, Guida del DM (PDF), `Razze.md`, `Struttura_Scheda_PNG.md`, `Regole_Collana.md`, pagina «Condizioni» di golarion (01/11/2026).

## W. Fonti e divergenze

| Fonte | Uso |
|---|---|
| Vol. 1 2.5.2 senza immagini | Condizioni nuove, Morente, PF/Fatica/temporanei, Rifiatare, Punti eroe, 1 e 20, impreparati −6 |
| Vol. 3 2.5.8, Cap. 2–3 | Riparare, Fallimenti critici, Ferite gravi (righe −1…−15), emorragie, amputazioni |
| `Volumi/Guida del DM.pdf` | Prontuario (ciò che i volumi e le Tabelle non hanno), incontri casuali (meteo e scorte fino alla Build 2b) |
| Vol. 3 2.5.8, Cap. 1–2 | Locande e taverne, Stalle, Fonti di luce (prezzi), Riparare, Professione (cerusico) ed (erborista) (dalla Build 3b) |
| `Output/Tabelle_Tempo_Atmosferico_v1.0.docx` | Meteo (17 zone), effetti, fiamme, regole generali, navigazione, Foraggiare, acqua, Fame e sete (dalla Build 2c) |
| `Struttura_Scheda_PNG.md` (allegato di Massy, 26/10) | Scheda dei PNG e dei mostri |
| `_Documenti_avventura_per_Claude/Razze.md`, `Regole_Collana.md` | Razze, divieti |
| golarion.altervista.org, pagina «Condizioni» (letta il 01/11/2026 con il browser integrato) | Testi delle condizioni, estratto `sorgenti/guida/golarion_condizioni.txt` |

- **Escluse per decisione di Massy**: `Volumi/Colpi_Critici_Pathfinder.pdf` (sarà tolto dalla cartella) e il PDF «Ferite gravi4» del progetto (superato dal Vol. 3).
- **Refusi della Guida, gestiti nell'app**: estate temperata «2 giugno» → 22 giugno; sete «non abbia mangiato» → bevuto; CD riparazione armi +10 «39» → 29 (fa fede il Vol. 3); «Addestrare animali» tolto; «Utilizzare oggetti magici» → Utilizzare congegni magici.

## X. Fasi di build

| Fase | Contenuto | Fine fase |
|---|---|---|
| Build 1 | Repo (V1), campagne e creazione guidata (B), calendario, orologio e meteo (C), scorte (D), PG e PF (E, F), iniziativa (J), timer (K), salvataggi (V3–V4) | pagina di prova confermata |
| Build 2a | Malus e bonus (G), veleni e malattie (H), ferite e emorragie come malus (I) | pagina di prova confermata |
| Build 2b | Bestiario e PNG (M), incontri (N), tattiche (O) | pagina di prova confermata |
| Build 2c | Viaggio e compagnia (AA): meteo dal manuale nuovo, scorte e Foraggiare, compagnia e animali | pagina di prova confermata |
| Build 3a | Condizioni (P), Imprevisti con i tiri (Q), strumenti (T), ritocchi ai malus (sezione AB) | pagina di prova confermata |
| Build 3b | Prontuario (R), incontri casuali (S) | ✅ pagina di prova confermata (02/11) |
| Build 4 | Finestra TV in Electron (L, AD1–AD5), tasti globali, icona (`icone.py`, AD6), `controlla_app.py`, primo push su `main` dopo il via di Massy, prova di APK e Windows (AD7) | release `v1.0.1` / `win-1.0.1` (poi un numero nuovo a ogni correzione) |

## Y. Punti aperti

- Nessuno sulle regole. Da confermare a ogni build sulla pagina di prova.
- Build 1: confermata il 26/10. I sorgenti stanno nel ramo `sviluppo` (i workflow partono solo da `main`, quindi nessuna build); le versioni native si fanno portando il lavoro su `main` quando Massy lo chiede.
- Build 2a: confermata il 26/10 (Z2a-1…Z2a-19); sorgenti nel ramo `sviluppo` (commit `57557c6`), nessuna build.
- Vol. 3 2.5.8, Cap. 3 (segnalazioni, nessuna correzione fatta): le righe −1 ci sono (2.5.8); nella tabella delle Amputazioni l'asterisco «*» dell'Occhio non ha una nota, braccio-braccio e gamba-gamba non sono scritti fra le combinazioni di «entrambi», alcune frasi sono attaccate senza spazio («mancante.-5 Scalare», «mano-5 DMC»).
- Build 2b: confermata il 01/11 (Z2b-1…Z2b-20); sorgenti nel ramo `sviluppo` (commit `7858b56`), nessuna build.
- Build 2c: confermata il 01/11 (Z2c-1…Z2c-26); sorgenti nel ramo `sviluppo` (commit `767bed6`), nessuna build.
- Build 3a: confermata il 01/11 (Z3a-1…Z3a-15); sorgenti nel ramo `sviluppo` (commit `018f06c`), nessuna build.
- Build 3b: chiusa il 02/11 (AC1–AC10, Z3b confermate). Prossima: Build 4 (finestra TV in Electron, icona, primo rilascio).
- Build 4: decisioni AD1–AD9 e scelte Z4-1…Z4-13 confermate il 02/11 sulla pagina di prova (artifact v15); push sul ramo `sviluppo`. Da fare: `main` (release `v1.0.1` / `win-1.0.1`) dopo il via di Massy e la sua prova di APK e Windows.
- Guida del DM, divergenze con il Vol. 3 e refusi (AC1-3, AC1-4, AC7-1): da correggere nella Guida se si aggiorna.
- Tabelle del Tempo Atmosferico v1.0, effetto «Tormenta»: il testo dice «Fiamme: come con il Vento molto forte», ma vale la tabella delle Fiamme (spegne anche la lanterna impermeabile; Massy, 01/11): da correggere nella prossima versione delle Tabelle.
- Stat block dei documenti d'avventura (segnalazioni dell'app, nessuna correzione fatta: i documenti della campagna non si toccano da qui): 7 da correggere e 25 da verificare, elenco in `Schermo_build2b_segnalazioni_documenti.txt` (es. Leccapece e Sirena con la CA diversa dalla scomposizione, Bevek con Competenza nelle armi esotiche, cinque non morti senza tattiche).

## AA. Build 2c — Viaggio e compagnia (richiesta di Massy del 01/11/2026)

Richiesta di Massy (01/11): usare il sistema nuovo del tempo atmosferico (`Tabelle_Tempo_Atmosferico_v1.0`, design `TempoAtmosferico_v1.0_design_v1.md`) al posto della Guida del DM; accompagnatori con nome e collegabili a una scheda; cavalcature e compagni animali con cibo e acqua dedicati (o «si foraggiano da soli»); Sopravvivenza per le scorte (un PG tira, il GM scrive il risultato, l'app calcola per quante persone si trovano cibo e acqua, con la CD per zona e periodo); opzione per escludere le scorte, con gli accompagnatori in un punto diverso.

### AA1. Meteo dalle Tabelle del Tempo Atmosferico v1.0 (✅ confermato da Massy il 01/11)

**Fonte e dati**
- Fonte: `Collana/Output/Tabelle_Tempo_Atmosferico_v1.0.docx`, letto con docx2txt e dalle tabelle del .docx; `crea_meteo.py` nuovo scrive `meteo.json` (zone, stagioni, tabelle, effetti, fiamme, regole generali, navigazione, Foraggiare, acqua, Fame e sete).
- `controlla_meteo.py`: ogni tabella copre 01–00 senza buchi; ogni voce di una riga ha il suo effetto; testi uguali al Word.
- Effetti con il testo integrale, condizioni in rosso, tag in maiuscolo.

**Zone e stagioni**
- 17 zone in 5 gruppi nel menu: Temperate 1–6 · Fredde 7–9 · Calde 10–13 · Mare 14–15 · Speciali 16–17.
- Migrazione: Temperata → 1 Pianure e colline · Desertica → 10 Deserto sabbioso · Artica → 9 Ghiacci artici. Il meteo già tirato resta; le voci vecchie prendono il nome nuovo («Neve e nevischio» → Neve, «Tempesta di polvere/sabbia» → la voce nuova).
- Calendario reale: date del Cap. 1 (4 stagioni, oppure 2 con il nome della zona). Calendario personalizzato: primavera ed estate del mese → prima stagione della zona; autunno e inverno → seconda.
- Sotterraneo (16): senza stagione, clima base sempre Clima fresco; la tabella delle condizioni si tira ogni giorno o con «Nuova zona di gallerie».

**Durate e ore del giorno**
- Tempeste e piogge forti da 2d4 ore: insieme al meteo l'app tira la durata e mostra «dalle 06:00 alle 11:00»; inizio all'alba per difetto, modificabile nella finestra Meteo. Finita la durata la testata passa da sola al clima base della stagione (prima riga della tabella) e lo scrive nel log.
- Nebbia: si dirada da sola 1d4 ore dopo l'alba.
- Arsura: vale dalle 10 alle 18; nelle altre ore Clima caldo.
- Notti fredde (zone 10–11): dalle 22 alle 6 Clima freddo; dalle 6 alle 10 e dalle 18 alle 22 Clima caldo.
- La testata mostra l'effetto in vigore a quell'ora; la finestra Meteo tutto il giorno.
- Il tiro resta al cambio di giorno (mezzanotte), come oggi.

**Varianti di zona** (caselle nel pannello Viaggio, accanto alla zona)
- 6 Montagne, «oltre 4.500 m»: Clima freddo → Gelo, Gelo → Gelo polare.
- 12 Savana, «steppa fredda»: nella stagione secca Clima caldo → Clima freddo, Arsura → Gelo.
- 13 Foresta tropicale, «lontano dalla costa»: Uragano → Tempesta di vento + Monsone.

**Strumenti nella finestra Meteo**
- Stato del mare (zone 5, 14, 15): etichetta calmo / agitato / tempestoso con la CD di Nuotare, ricavata dal tempo del giorno.
- Predire il tempo: il GM scrive il risultato di Sopravvivenza; con 15 o più l'app tira subito i giorni previsti (+1 giorno ogni 5 punti oltre 15) e li mostra; ai cambi di giorno usa quelli. Cambiando zona le previsioni si cancellano (lo dice il log).
- Sezioni apribili: tabella delle Fiamme, Regole generali (protezioni, bagnati, ripari, viaggi, orientarsi), Navigazione (solo coste, mare e oceano).
- Particolarità della zona (Cap. 3) sotto la tabella.

### AA2. Scorte e Foraggiare (✅ confermato da Massy il 01/11)

Fonte: Cap. 4 delle Tabelle del Tempo Atmosferico v1.0 (Foraggiare, Acqua, Fame e sete).

- **AA2-1 Razione d'acqua** = 4 litri. Al cambio di giorno ogni persona consuma 1 razione di cibo e 1 d'acqua; l'acqua è ×2 con Arsura o Afa e ×3 con Canicola, secondo il meteo del giorno che finisce. Chi beve meno razioni di quelle richieste conta come se non avesse bevuto: nella scelta di chi beve (Z1) ogni persona scelta consuma 2 o 3 razioni.
- **AA2-2 Pioggia**: casella «Recipienti per la pioggia» nelle Scorte, accesa di default. Con Pioggia battente, Acquazzone, Monsone o Temporale nel giorno che finisce (anche se è durata 2d4 ore) l'acqua di quel giorno non si consuma, con la riga nel log. Casella spenta: si consuma normalmente.
- **AA2-3 Sciogli neve**: pulsante nelle Scorte quando c'è neve da sciogliere: zona 9 (solo neve); zona 6 con «oltre 4.500 m» (nota ¹); zona 8 in autunno-inverno (nota ²); meteo del giorno con Neve, Neve fitta o Tormenta (effetto Neve); Grotte gelate nel Sotterraneo. Si scelgono le razioni: 1 all'ora, l'orologio avanza. Promemoria: serve un fuoco (nelle zone senza legna il combustibile va portato).
- **AA2-4 Foraggiare** (pulsante nelle Scorte): finestra con i PG; per ognuno «foraggia», Sopravvivenza o Professione (pescatore), e il totale.
  - Pesca: solo cibo; zone 5, 14, 15 o con la casella «acqua dolce per pescare».
  - CD = CD della zona + stagione povera (+5: Inverno nelle zone a quattro stagioni, Autunno-inverno nelle zone 7 e 8, Stagione secca nella zona 12) + tempo **in vigore a quell'ora** (+2: Pioggia battente, Neve, Nebbia, Grandine, Pioggia gelata, Arsura, Canicola; +5: Acquazzone, Monsone, Neve fitta, Temporale, Vento molto forte).
  - Impossibile con tempeste, Tormenta o Uragano in corso: PG spenti con il motivo; finita la durata si può.
  - Resa: totale ≥ CD → 1 persona + 1 ogni N punti oltre la CD.
  - Acqua: «inclusa» = stessa resa; «CD X» = secondo totale con la stessa resa; «No» = niente. Zona 12: acqua CD 20 nella stagione secca (nota ³). Zona 16: con lo Stillicidio acqua senza prova (nota ⁴).
  - Una prova al giorno per PG: chi ha già foraggiato oggi non è selezionabile. Promemoria «non nei giorni di marcia forzata».
  - Casella «+2 ore all'orologio» spuntata. Prendere 10, aiuto e bonus razziali: li mette il GM nel totale.
- **AA2-5 Cibo avariato (zone ☠)**: chi fallisce di 5 o più porta 1 razione avariata, tenuta a parte nelle scorte. Si usa **solo se le buone non bastano**: la finestra «Scegli chi mangia» mostra buone e avariate e il GM sceglie chi mangia cosa. Per ogni PG che mangia avariato la coda chiede il TS su Tempra CD 12 (Superato/Fallito); fallito: Nauseato 1d4 ore e quel giorno conta senza cibo. Per accompagnatori e animali solo una nota.
- **AA2-6 Acqua da purificare**: l'acqua trovata nelle zone 4 (paludi) e 17 (sulfurea) entra come «acqua da purificare». «Bolli» (solo zona 4): 10 minuti per razione, l'orologio avanza. «Purifica»: Tavoletta purificante = 3 razioni, *Purificare cibo e bevande* = quante ne scrive il GM. Bevuta senza purificarla: regola di AA2-5 (TS Tempra CD 12).
- **AA2-7 Scorte spegnibili**: impostazione della campagna «Usa le scorte», accesa di default (anche nelle campagne salvate prima). Spenta: niente consumo, razionamento né Fame e Sete automatiche; pannello Scorte e Foraggiare nascosti. Restano la Compagnia e i malus Fame e Sete messi a mano.

### AA3. Compagnia (✅ confermato da Massy il 01/11)

- **AA3-1 Pannello «Compagnia»** nella colonna Viaggio, sopra le scorte; resta anche con le scorte spente.
- **AA3-2 Accompagnatori con nome**: nome, ruolo o nota, scheda facoltativa (PNG della campagna o generico). Con la scheda: stat block a un clic e «+ Al combattimento» come alleato (senza XP). **Fame e Sete per ciascuno**, come per i PG (etichetta sulla voce, promemoria della prova di Costituzione). Gli accompagnatori **senza nome** restano un numero, senza penalità. «Togli» (morto, congedato) con la riga nel log. Migrazione: il numero di oggi diventa «senza nome».
- **AA3-3 Animali** (cavalcature e compagni animali): nome, tipo (cavalcatura / compagno animale), padrone (PG o accompagnatore), scheda facoltativa (mostro condiviso); **mangia foraggio o razioni** (carnivori); cibo e acqua al giorno 1 e 1 per difetto, modificabili (le fonti non danno razioni diverse per taglia); acqua ×2/×3 con il caldo; caselle «trova da sé il cibo» e «trova da sé l'acqua» (per quella parte non consuma). Con la scheda: stat block e «+ Al combattimento» come alleato. Fame e Sete come gli accompagnatori con nome.
- **AA3-4 Scorte**: **Foraggio** scorta nuova (con +/− e «Bastano per N giorni»); **acqua unica** per tutti (l'indicatore conta persone + animali); i carnivori usano le razioni delle persone. Se una scorta non basta, nella finestra «Scegli chi» si spuntano PG, accompagnatori con nome e animali uno per uno, più il numero dei senza nome (Z1 esteso).
- **AA3-5 Foraggiare per la compagnia**: il cibo trovato si divide fra razioni e foraggio; per difetto al foraggio la quota degli erbivori che non trovano da sé il cibo, il resto alle razioni; il GM sposta la divisione. L'acqua tutta nella scorta unica.
- **AA3-6 XP** (con «Usa gli XP»): «contando anche gli accompagnatori» conta quelli con nome e senza nome; gli animali no.
- **AA3-7 Creazione della campagna**: il passo «numero di accompagnatori» di B2 diventa «Compagnia» (numero dei senza nome + elenco facoltativo di nomi); animali e schede si aggiungono dal pannello Compagnia. Il passo delle scorte ha anche il Foraggio (0 per difetto).

## AB. Build 3a — Al tavolo: condizioni, imprevisti, strumenti (decisioni confermate da Massy il 01/11/2026)

Build 3 divisa in **3a** (P, Q, T e i ritocchi ai malus G-a…G-c) e **3b** (R Prontuario, S incontri casuali), confermato da Massy il 01/11: il Prontuario è la parte più grande (riassunti e tabelle della Guida) e gli incontri casuali si tirano dalle 6 ore di marcia del calcolatore di viaggio. Queste decisioni completano e, dove diverse, sostituiscono le sezioni P, Q e T.

### AB1. Condizioni (P)

**Testi di golarion.altervista.org**: letti il 01/11 con il browser integrato dell'app desktop (WebFetch dà solo riassunti, il download diretto è bloccato dal proxy); estratto `sorgenti/guida/golarion_condizioni.txt` (40 sezioni, 23.626 caratteri, SHA-256 `504fc714…` uguale alla pagina).

- **AB1-1 Fonti per condizione**

| Fonte | Condizioni |
|---|---|
| golarion, testo integrale | Abbagliato, Accecato, Affascinato, Assordato, Barcollante, Confuso, Frastornato, Immobilizzato, In Lotta, Incorporeo, Indifeso (con Colpo di grazia), Infermo, Intralciato, Nauseato, Paralizzato, Pietrificato, Prono, Stordito; Paura con Scosso, Spaventato, In Preda al Panico, Accovacciato e Terrore crescente; Affaticato ed Esausto (con la riga del Vol. 1 su fame e sete) |
| golarion adattato (AB1-2) | Impreparato, Inabile, Invisibile, Livelli negativi, Morto, Privo di Sensi, Sanguinante, Stabilizzato |
| Vol. 1 2.5.2 | Azzoppato, Colto alla sprovvista, Morente, Offuscato, Sempre pronto |
| Vol. 3 2.5.8 («Riparare oggetti rotti») | Scheggiato, Rotto (il «Rotto» di golarion usa le regole di Pathfinder e non vale) |
| Guida del DM | riga di sintesi di ogni condizione; Addormentato, Bloccato e Legato rimandano a Indifeso |

  Tolti dal testo di golarion «Fonte: d20pfsrd…» e «Vedi Invisibilità».

- **AB1-2 Testi adattati alle regole della Collana**
  - **Impreparato**: testo di golarion + «Essere impreparati» del Vol. 1 (−6 alla prova di Iniziativa invece di non poter agire nel primo round).
  - **Inabile**: solo gli effetti: «Può compiere solo un'Azione di Movimento o un'Azione Standard per round (ma non entrambe, e non può effettuare Azioni di Round Completo, ma può sempre compiere Azioni Veloci, Immediate e Gratuite). Si muove a velocità dimezzata.» (via 0 PF, PF negativi, morente, prove di Costituzione).
  - **Invisibile**: testo di golarion senza «Vedi Invisibilità» + la Guida: occultamento totale (50%), individuabile con Percezione CD 20.
  - **Livelli negativi** (correzione di Massy): ogni livello negativo toglie 5 dal **totale di Punti Fatica + Punti Ferita**, massimi e correnti, metà ai Fatica e metà ai Ferita con il punto dispari ai Ferita (regola del Vol. 1 sui PF aggiunti, al contrario): 1 livello −2/−3, 2 livelli −5/−5, 3 livelli −7/−8. I Ferita correnti non scendono sotto 0 (nessuna ferita grave automatica); finiti i livelli negativi tornano i massimi, i correnti restano (come Z2a-4). Testo: «…riduce il totale dei suoi Punti Fatica e Punti Ferita, massimi e correnti, di 5 per ogni livello negativo (metà ai Fatica e metà ai Ferita, il punto dispari ai Ferita).» Sostituisce «Fatica max −5 per livello negativo» della tabella G2.
  - **Morto**: «Muore per una Ferita grave (riga «Sei morto», emorragie), quando i danni alla Costituzione ne eguagliano il punteggio, quando i livelli negativi eguagliano i Dadi Vita, o per un incantesimo o un effetto che uccide sul colpo.» + il resto di golarion («L'anima…») + la riga del Vol. 1 sul 20% di restare Morente.
  - **Privo di Sensi**: «…può risultare da una Ferita grave o dai Danni Non Letali che superano i Punti Ferita attuali.»
  - **Sanguinante**: «…può essere interrotto con una prova di Professione (cerusico) CD 10, con una prova di Sopravvivenza CD 15 o con la magia (Vol. 1).» + nota: le emorragie delle Ferite gravi si fermano con la tabella «Fermare le emorragie» del Vol. 3.
  - **Stabilizzato**: «Una creatura le cui emorragie sono state fermate (Professione (cerusico) o magia) è stabilizzata: non rischia più di morire per quelle emorragie, ma le ferite gravi restano finché non sono curate.»

- **AB1-3 Comportamento**
  - **Terrore crescente**: Scosso o Spaventato applicati a chi è già Scosso o Spaventato → l'anteprima dice «diventa Spaventato / In Preda al Panico (Terrore crescente)», con la durata più lunga delle due. Sostituisce, per la Paura, «non si sommano» di Z2a-2.
  - **Fatica**: Affaticato su chi è già Affaticato → Esausto. Il Riposo 8 ore toglie Affaticato ed Esausto, tranne quelli dovuti a fame o sete (Vol. 1).
  - **Confuso**: all'inizio del turno della creatura la barra del turno tira il d% e scrive il comportamento (anche nel log).
  - **Valori del riquadro** (in più rispetto a G2): Affascinato Percezione −4; Stordito e Accovacciato CA −2 e CA colto alla sprovvista; Immobilizzato CA colto alla sprovvista −4; Indifeso, Paralizzato e Privo di Sensi etichetta «Des 0, +4 ai TpC in mischia contro».

- **AB1-4 Interfaccia**: scheda **«Prontuario»** nella terza colonna (AB2-4) con la sezione Condizioni: ricerca per nome, filtri per gruppo (Paura, Fatica, Indifeso, Oggetti, Nuove (Vol. 1), Altre) e tre voci di regola in nero (danni non letali, danni alle caratteristiche, livelli negativi; Guida, «Cure e recupero»). Ogni scheda: nome in rosso, riga di sintesi, «Applicato dall'app: …», testo completo apribile, fonte, **Applica a…** (finestra Malus già impostata, PG o riga dell'iniziativa, con la durata). Sul PC il passaggio del mouse su un'etichetta o su un nome di condizione in rosso (stat block, ferite gravi) mostra la sintesi; sul telefono un tocco apre la scheda.

### AB2. Imprevisti (Q)

- **AB2-1 Dove**: pulsante «Fallimento critico» nelle azioni del riquadro del PG e di ogni riga dell'iniziativa e nella barra del turno per chi agisce; nei Dadi (AB4-1) in modo «Tiro per colpire» con l'1 naturale (Vol. 1).
- **AB2-2 Finestra**: si sceglie una delle 5 tabelle; l'app tira il d12 o il d6 e i sotto-tiri e mostra l'anteprima prima di «Applica».

| Nel testo | L'app fa |
|---|---|
| 1d3+1 / 1d4+1 caselle in una direzione casuale | tira caselle e direzione su 8 punti |
| 1-2 scudo, 3-4 armatura, 5-6 oggetto² | 1d6; per l'oggetto lo slot 1d12 con l'ordine della nota ² |
| 1-2 scudo o 3-4 armatura | 1d4 |
| smette di funzionare per 1d4+1 giorni | tira i giorni |
| «Se sei già prono conta come 9 (o 6)» | con Prono passa da sola alla riga 9 o 6 e lo dice |
| infermo 5 round, prono, barcollante 1 round, nauseato 1 round | condizioni con la durata sulla creatura giusta |
| «Colpisci accidentalmente un alleato¹» | menu «Chi viene colpito» con le creature dell'iniziativa e il promemoria della nota ¹; per difetto «nessun alleato: ti colpisci da solo»; le condizioni «di chi viene colpito» vanno a quella creatura |
| danneggia l'arma / l'oggetto / lo scudo (due volte nella riga 6 delle armi a spargimento) | riga nel log «+1 livello di danneggiamento (scheggiato → rotto → distrutto)»; l'app non tiene l'equipaggiamento |
| «Il tuo turno termina» | pulsante «Termina il turno» nell'anteprima (in combattimento), non automatico |
| danni, contrattacco +4, serie di attacchi che termina, doppio degli slot | testo e log |

- **AB2-3 Consultazione**: le 5 tabelle dei Fallimenti critici, le 6 delle Ferite gravi, «Fermare le emorragie» e «Amputazioni» con le note ¹ ². Nelle Amputazioni solo gli spazi mancanti aggiunti («mancante. −5 Scalare»); l'asterisco dell'Occhio resta con la nota «nota mancante nel Vol. 3» (punto aperto della revisione del Vol. 3).
- **AB2-4 Scheda «Prontuario»**: una sola scheda nella terza colonna con un menu interno (3a: Condizioni, Imprevisti; 3b: le sezioni di R); la ricerca vale su tutto il Prontuario.

### AB3. Malus e bonus: ritocchi (G)

- **AB3-1 (G-a) «× livello dell'incantatore»** accanto alla quantità della durata: si scrive il livello e la durata si moltiplica; per un PG bersaglio il livello è già scritto, modificabile.
- **AB3-2 (G-b) Modelli**: «Salva come modello» nella finestra Malus/Bonus; i modelli della campagna (Scudo, Benedizione, Armatura magica…) sono un menu in cima che riempie i campi.
- **AB3-3 (G-c) Tipo di bonus** (menu, «senza tipo» per difetto; i bonus delle campagne salvate restano senza tipo):

| Tipo | Regola |
|---|---|
| senza tipo, schivare, razziale, eroico | si sommano sempre |
| circostanza | si sommano, tranne due dalla stessa fonte (stesso nome): vale il più alto |
| spiritico (Vol. 1) | si sommano solo se dalla stessa fonte; da fonti diverse vale il più alto |
| alchemico, arcano, istinto, meccanico (Vol. 1) | vale il più alto |
| tutti gli altri (armatura, scudo, deviazione, naturale, potenziamento, morale, cognitivo, fortuna, sacro, profano, resistenza, competenza…) | vale il più alto |
| malus | si sommano, tranne la stessa condizione (Z2a-2, AB1-3) |

  L'etichetta del bonus che non conta resta visibile ma barrata («non si somma con …»). Nessun controllo contro i bonus già dentro la CA del PG (l'app conosce solo il totale): lo dice una nota. Il bonus d'istinto vale per la CA e la CA di contatto, non per quella colto alla sprovvista (Vol. 1).

### AB4. Strumenti (T)

- **AB4-1 Dadi**: pulsante 🎲 nella testata, riquadro con espressioni (`2d6+3`, `4d6kh3`, `1d8+2d6+4`), Vantaggio e Svantaggio (Vol. 1), tre modi del d20: «Prova/TS» (1 = −10, 20 = 30), «Tiro per colpire» (20 = 30, l'1 apre «Fallimento critico»), «Libero». «Ripeti» una sola volta per tiro (Vol. 1). Storico degli ultimi 50, casella «anche nel log».
- **AB4-2 Fonti di luce** (Guida): candela e caschetto portacandela (3 m, 1 ora), torcia (9 m, 1 ora), lanterna (15 m, 3 ore per fiaschetta), lanterna impermeabile, schermabile e deluxe. Pannello «Luce» nella colonna Viaggio; «+ Luce» a un PG, a un accompagnatore con nome o al gruppo. Si consumano con l'orologio (anche i round), avviso 10 minuti prima; Accendi e Spegni conservano il tempo che resta; la lanterna si ricarica con una fiaschetta. **Fiamme**: a ogni avanzamento dell'orologio e a ogni cambio del tempo in vigore l'app controlla la tabella delle Fiamme (Tabelle del Tempo Atmosferico): se il meteo la spegne, avviso in coda e fonte spenta (il consumo si ferma); con il Vento molto forte la lanterna impermeabile o deluxe ha il 50% ogni 10 minuti (l'app tira). Casella **«Al riparo»** per fonte (sempre vera nel Sotterraneo). La regola della candela (corsa, 25% dopo un attacco) resta una nota.
- **AB4-3 Promemoria**: testo con scadenza al round N, fra X minuti o ore, o a una data e ora del calendario; scattano in coda e nel log; pannello «Promemoria» nella colonna Viaggio; quelli dei round si salvano anche in un incontro (N1).
- **AB4-4 Log**: «Inizia sessione» segna l'inizio; «Esporta .txt» propone «questa sessione» o «tutto»; filtri per tipo (combattimento, tempo e meteo, ferite e cure, scorte, tiri).

## AC. Build 3b — Prontuario e incontri casuali (decisioni confermate da Massy il 01/11/2026)

Decisioni confermate in chat il 01/11 sera, passi 1–5. Completano e, dove diverse, sostituiscono le sezioni R e S. Fonti lette per intero: Guida del DM (`sorgenti/guida/guida_dm.txt`), Vol. 1 2.5.2 senza immagini (Cap. 1), Vol. 3 2.5.8 (Cap. 1 «Fonti di luce», «Locande e taverne», «Stalle e negozi di animali»; Cap. 2 «Riparare oggetti rotti», «Professione cerusico», «Professione erborista»), Tabelle del Tempo Atmosferico v1.0.

### AC1. Struttura e fonti (passo 1)

- **AC1-1 Menu del Prontuario** (scheda della terza colonna, AB2-4): Condizioni · Imprevisti · Abilità · Combattimento · Cure e recupero · Viaggi · Pericoli · Meteo · Riparare · Locande e luce. La ricerca vale su tutto.
- **AC1-2 Precedenza delle fonti**: volume (Vol. 1 2.5.2, Vol. 3 2.5.8) > Tabelle del Tempo Atmosferico v1.0 > Guida del DM (solo ciò che manca altrove). Ogni scheda mostra la fonte; dove un volume corregge la Guida c'è la nota «Vol. X: …».
- **AC1-3 Divergenze Guida → Vol. 3** (fa fede il Vol. 3): Stanza singola 5 → 8 mo; Suite «minimo +3» → «minimo +3 e massimo +10»; Pasto scadente «−1 al primo TS su Tempra entro 24 ore» → «−1 ai TS su Tempra per quel giorno»; Bagno caldo → Bagno con essenze (+1 Diplomazia e +1 Raggirare per 3 giorni); Bevuta → Giro di bevute per quattro persone; in più Bevanda alcolica forte e Stalle; Torcia 5 → 3 ma; armi rotte −3 → −4; Riparare, armi +10 «39» → 29/30.
- **AC1-4 Refusi della Guida** corretti nel Prontuario ed elencati in `prontuario.json` (campo `refusi`): «uan CD», «a un'ulteriore» («di a un'ulteriore»), «altui» → altrui, «La prova di Nascondersi» → Furtività, «nel 3° terzo round», «Tipo Di», «ma con di penalità» (già Z3a-2), «Utilizzare oggetti magici» → Utilizzare congegni magici (titolo).

### AC2. Abilità e Combattimento (passo 1)

- **AC2-1 Abilità**: le 19 della Guida (20 con Addestrare animali, tolta: Vol. 1), titolo Utilizzare congegni magici; Professione (alchimista) dalla Guida; Professione (cerusico) rimanda a Cure e recupero.
- **AC2-2 Note del Vol. 1**: Camuffare −5 senza kit per il camuffamento; Disattivare congegni −5 senza arnesi da scasso; Nuotare: penalità di armatura doppia, e nelle campagne acquatiche si prende 10 in acque calme e agitate (senza armatura pesante); Sopravvivenza: Foraggiare, Predire il tempo, Orientarsi e Riparo rimandano alle Tabelle del Tempo (riparo CD 15, CD 20 in Brughiere e lande e in Tundra), fermare il sanguinamento CD 15.
- **AC2-3 Conoscenze come nel Vol. 1**: Generali = locali + geografia (senza araldica, storia e leggende); Nobiltà e Storia e leggende separate, con voci scritte dall'app («sintesi dell'app»); le righe «Storia e nobiltà» della tabella della Guida diventano: evento recente o storicamente importante, data di un evento, evento poco noto o storia antica → **Storia e leggende**; governanti attuali e simboli, galateo, linea di successione → **Nobiltà**; leggi e governanti locali e luoghi popolari → **Generali**.
- **AC2-4 Combattimento**: Concentrazione, Occultamento e coperture, Riduzione del danno (Guida), con la nota del Vol. 1 sotto Occultamento (il danno da precisione si infligge anche all'occultamento totale superata la prova percentuale). Solo consultazione.

### AC3. Cure e recupero (passo 2)

- **AC3-1 Consultazione**: Guarigione (Guida + Vol. 1):

| | Riposo 8 ore | Riposo totale 24 ore |
|---|---|---|
| Punti Fatica | tutti | tutti |
| Punti Ferita | 1 × livello | 2 × livello |
| Danni alle caratteristiche | 1 | 2 |

  Rifiatare durante la giornata, danni non letali 1 all'ora, cura magica prima i Ferita. Danni non letali, danni alle caratteristiche e livelli negativi: rimandi alle voci di regola delle Condizioni (non ripetute). Professione (cerusico) (Vol. 3) in tabella: usi, unità, CD, effetto; regole comuni (niente prendere 10 o 20, il 20 naturale non vale 30, massimo 10 unità per gruppo, borsa medica).
- **AC3-2 Riposo totale**: nella finestra del riposo «8 ore» o «Riposo totale (24 ore)»; il totale avanza l'orologio di 24 ore e dà 2 Punti Ferita per livello; vale come riposo per il limite di F7.
- **AC3-3 Assistenza continua** (nella finestra del riposo): chi assiste (non sé stesso) e fino a 5 pazienti; CD 14 + numero dei pazienti; il GM scrive il risultato per paziente; riuscita = recupero doppio (2 o 4 PF per livello, 2 o 4 danni alle caratteristiche); 1 unità di medicinali per paziente anche se fallisce.
- **AC3-4 Medicinali**: contatore del gruppo 0–10 nel pannello Compagnia. Ogni prova del cerusico toglie le sue unità; a 0 il −5 della tabella «Fermare le emorragie» si applica da solo (prima era una casella), negli altri usi solo l'avviso. Nelle campagne salvate prima il contatore è spento finché il GM non lo accende.
- **AC3-5 Pronto soccorso** (finestra «Curare» del PG): gradi in Professione (cerusico) di chi cura (salvati sul PG) e risultato; CD 15 (20 su sé stessi); cura metà dei gradi + 1d4 ogni 5 punti oltre la CD, solo ai Punti Ferita; una volta per paziente dopo ogni combattimento (bloccato fino al combattimento successivo).
- **AC3-6 Fermare il sanguinamento**: pulsante sull'etichetta Sanguinante; Professione (cerusico) CD 10 o Sopravvivenza CD 15; riuscita = condizione tolta.
- **AC3-7 Trattare un veleno**: pulsante sull'etichetta del veleno; risultato ≥ CD del veleno = effetto chiuso, log «cura 2 danni alle caratteristiche».
- **AC3-8 Trattare una malattia**: casella «trattata stanotte» sull'etichetta; alla scadenza giornaliera successiva la coda chiede anche la prova del cerusico; riuscita = un successo in più verso la cura.
- **AC3-9 Danni alle caratteristiche**: l'app non tiene i punteggi; a fine riposo il log scrive quanto si recupera (1, 2 o 4).

### AC4. Professione (erborista) (passo 2b, aggiunta di Massy)

- **AC4-1 Consultazione** in Cure e recupero: scheda Professione (erborista) del Vol. 3 (raccolta, conservazione, limite di 10 unità per gruppo, preparazione, dosi multiple, unguenti, poltiglie) ed elenco delle **28 misture** per gruppo (Clima 1, Caratteristiche 4, Memoria e Concentrazione 3, Creature specifiche 3, Sbronza, Infermità e Nausea 2, Livelli negativi 2, Malattie 5, Paura 1, Riposo e Sonno 3, Unità di medicinali 1, Veleni 3) con CD, dosi, tipo ed effetto.
- **AC4-2 Erbe miste**: contatore del gruppo 0–10 accanto ai Medicinali (spento nelle campagne vecchie).
- **AC4-3 Raccolta**: casella «erborista» e gradi sul PG; a ogni cambio di giorno la coda propone la raccolta per ogni erborista, con la casella «impossibilitato»; l'app tira il d% su 45% + 1% per grado: 1 unità, 2 se il tiro è pari o inferiore alla metà della percentuale; mai oltre 10.
- **AC4-4 Prepara mistura**: chi prepara, mistura, risultato; si consuma 1 unità e l'orologio avanza di 1d4 minuti; riuscita = la mistura si applica subito a chi la riceve come bonus alchemico già impostato con la durata del Vol. 3; quelle senza un valore da applicare sono un'etichetta con il testo (Unguento del clima: «conta come abiti adatti, 24 ore»); le misture «prima di coricarsi» sono un'etichetta fino al prossimo riposo, che le ricorda nel log.
- **AC4-5 «Unità di medicinali»** (CD 18, una volta al giorno): 2 erbe miste → 1 medicinale, con il promemoria «da usare entro 1 ora».
- **AC4-6 Poltiglie**: una sola al giorno per creatura; la seconda è bloccata con il motivo.

### AC5. Viaggi (passo 3)

- **AC5-1 Consultazione**: marcia giornaliera, marcia forzata, cavalcare veloci (Guida); mezzi e terreni (Guida) con i moltiplicatori di viaggio e Orientarsi delle Tabelle del Tempo; la Navigazione rimanda al Meteo.
- **AC5-2 Velocità in km**: 1 miglio = 1,6 km (come nel Pathfinder italiano: 9 m = 4,8 km all'ora). Cavallo 9,6 km/h, pony o cavalcatura media 6,4, carro 4,8, imbarcazione fluviale 1,6. **A piedi** (regola di Pathfinder 1e, come H4): dalla velocità più bassa dei PG in marcia, letta dalla scheda (9 m = 4,8 km/h, 6 m = 3,2 km/h, in proporzione), modificabile.
- **AC5-3 Calcolatore «Marcia»** (pannello Viaggio): mezzo o velocità libera in km/h; terreno (i 9 della Guida); caselle «fuori strada» e «racchette da neve»; ore da camminare oppure km da percorrere (l'app calcola le ore).
- **AC5-4 Ora per ora**: si applica il meteo in vigore in quell'ora (Tempeste, Tormenta, Uragano ×¼); la condizione del suolo («neve depositata», «neve fitta depositata», «fango») è proposta dal meteo di oggi e si cambia; fuori strada ×½ o ×¼, con le racchette la neve fitta ×½.
- **AC5-5 Fine della marcia**: l'orologio avanza (meteo, luci, scadenze, scorte) e il log scrive km e ora d'arrivo; l'app tiene le ore di marcia di oggi.
- **AC5-6 Marcia forzata**: dalla 9ª ora di oggi, a ogni ora la coda chiede per ogni PG la prova di Costituzione (CD 18, +2 per ogni ora in più); fallita = 1 danno a Costituzione (etichetta); le cavalcature del gruppo fanno la stessa prova con 2 danni. Un fallimento ferma la marcia a quell'ora (km fino lì); «Continua» lascia indietro chi ha fallito (log). Quel giorno Foraggiare è bloccato con il motivo.
- **AC5-7 Orientarsi** (con «fuori strada», una volta al giorno): la coda chiede il risultato e mostra la CD (15 + il meteo in vigore: Foschia +2; Nebbia, Neve fitta e Miraggi +5; tempeste e Tormenta +10); fallita = metà della strada; fallita di 5 o più = direzione sbagliata (log).

### AC6. Incontri casuali (passo 3; sostituisce S2)

- **AC6-1** Solo con l'impostazione «Incontri casuali» accesa (S1, spenta di default).
- **AC6-2 Aree della campagna** (Impostazioni → Incontri casuali): nome, probabilità, «speciale» con la sua probabilità, tabella d%. Le 6 aree della Guida già scritte con le tabelle vuote (Terre selvagge 20%; Caverne e sotterranei 15%; Montagna 10%, nelle grotte 20%; Bosco 10%; Campagna e colline, strade di collegamento 5%; Deserto o desolazione 5%, in oasi e rovine 30%); tutto modificabile, aree aggiungibili ed eliminabili, «Copia la tabella da…».
- **AC6-3 Tabella d%**: righe con intervallo, mostri o PNG dal bestiario con la quantità in dadi («2d4 Lupo») ed eventuale testo, oppure solo un evento scritto; avviso per buchi e sovrapposizioni in 01–00; senza tabella «incontro: scegli tu».
- **AC6-4 Nel calcolatore**: area (resta l'ultima) e casella «speciale»; le ore di marcia si sommano da un viaggio all'altro e a ogni 6 ore l'app tira il d%. Se esce un incontro l'ora è tirata dentro le 6 ore (1d6) e la marcia si ferma lì: meteo in vigore, composizione già tirata, «Avvia» (Avvio del combattimento, come N2), «Ignora», «Riprendi la marcia (N ore)».
- **AC6-5 «Tira incontro» a mano** (pannello Viaggio): area, casella «notte al riparo: −5%» (Guida, Sopravvivenza CD 15); l'ora è il 2d12 della Guida, come promemoria a quell'ora (AB4-3) con «Avvia» quando scatta.
- **AC6-6** Ogni tiro nel log, anche «nessun incontro (57 su 10%)».

### AC7. Pericoli (passo 4)

- **AC7-1 Testi adattati e letture**:
  - Annegamento: «1° round: Privo di Sensi; 2° round: resta Privo di Sensi; 3° round: annega (Morto)» (la Guida: «0 Punti Ferita», «3° terzo round»).
  - Alta quota fra 1.500 e 4.500 m: TS su Tempra ogni 6 ore, **CD 15, +1 per ogni prova precedente** (la Guida: «CD 20+6 ogni 6 ore»).
  - Infermità d'alta quota: oltre **4.500 m** (il testo della Guida diceva 4.000).
  - Terreni scivolosi: una sola regola, quella di «Terreni scivolosi» (prova solo oltre metà velocità, CD 15, 20 correndo o caricando); in Acrobazia un rimando al posto di «Camminare su superfici scivolose».
- **AC7-2 Consultazione**: tutte le voci della Guida; Fame e sete con il testo delle Tabelle del Tempo (Cap. 4); ambienti acquatici con le regole delle campagne acquatiche del Vol. 1; i «Desertici» comprendono anche la tundra (ghiaccio e dune).
- **AC7-3 Cadere**: metri; «volontaria» (−3 m; Acrobazia CD 15: il primo d6 non letale, +1d6 ogni 5 punti oltre); «in acqua profonda almeno 3 m» (i primi 6 m nulla, i 6 successivi non letali); l'app tira i dadi della tabella; «Applica a…» = Danno al PG o alla riga, Prono se i danni sono letali.
- **AC7-4 Trattenere il fiato** («Applica a…» su un PG o una riga): round = 2 × Costituzione (scritta dal GM), ×2 con Grande nuotatore; «−1 round» per le azioni standard o di round completo; finiti i round, a ogni round la coda chiede la prova di Costituzione (CD 10, +1 a ogni round); fallita = la sequenza di AC7-1; «Fuori dall'acqua» chiude.
- **AC7-5 Fumo e Alta quota** come malus pronti dal Prontuario, con il TS periodico: Fumo Tempra CD 15 ogni round, due fallimenti di fila = 1d6 danni non letali tirati dall'app; Alta quota Tempra ogni 6 ore, fallito = Affaticato o etichetta «1 danno a tutte le caratteristiche». Opzione nuova del TS periodico, valida per ogni malus: **«CD +1 a ogni prova»**.
- **AC7-6 Dadi cliccabili**: in tutto il Prontuario ogni espressione di dadi si tira con un tocco e va nei Dadi (AB4-1).

### AC8. Meteo (passo 4)

- **AC8-1** Il Prontuario mostra le Tabelle del Tempo per intero, solo da consultare: le 17 zone con le tabelle per stagione (la zona attuale aperta), i 33 effetti, Fiamme, Regole generali, Navigazione, Foraggiare e acqua, Appendice A (equipaggiamento) e Appendice B (tabella riassuntiva).
- **AC8-2** La finestra Meteo resta lo strumento del giorno: il Prontuario non tira e non cambia nulla, si consultano anche le altre zone.

### AC9. Riparare (passo 5)

- **AC9-1 Consultazione**: «Riparare oggetti rotti» del Vol. 3 per intero (livelli di danneggiamento, penalità, riparare per conto proprio, artigiani PNG).
- **AC9-2 Lettura della colonna del valore**: «fino a X» vale dal gradino precedente +1 fino a X (2.000 mo = 13/14; da 2.001 a 8.000 = 16/17…); nota della tabella.
- **AC9-3 Strumento «Riparare»**: tipo (armatura o scudo / arma / oggetto vario), bonus o valore, stato (scheggiato o rotto) → CD e tempo (30 minuti / 2 ore), con il promemoria «niente bonus di Intelligenza, il 20 naturale non vale 30»; il GM scrive il risultato e l'orologio avanza; riuscita «riparato», fallita «peggiora di un grado»; tutto nel log (l'app non tiene l'equipaggiamento).
- **AC9-4 Artigiano PNG**: commissione 1/40 (scheggiato) o 1/20 (rotto) del valore, minimo 1 mo; tempi 1d4 ore o 1 giorno, con il promemoria a tempo «oggetto pronto» (AB4-3).

### AC10. Locande e luce (passo 5)

- **AC10-1 Consultazione**: tabelle del Vol. 3: Locande e taverne (11 servizi), Stalle e negozi di animali (stallaggio, animali, oggetti), Fonti di luce con i prezzi del Vol. 3 e il caschetto portacandela. Abiti, otre e racchette nell'Appendice A del Meteo.
- **AC10-2 Strumento «Locanda»** (dal Prontuario e dal pannello Viaggio): servizi spuntati per PG, costo totale nel log.
- **AC10-3 Stanze**: «Riposa nella locanda» apre il Riposo con quei PG; alla fine del riposo l'effetto dura **24 ore**: Dormitorio Fatica massimi −¼ (per difetto); Suite +1 per livello (minimo +3, massimo +10) su massimi e correnti, finito l'effetto i correnti oltre il massimo scendono.
- **AC10-4 Pasti**: Pasto scadente −1 ai TS su Tempra fino a mezzanotte; Pasto eccellente +1 ai TS su Tempra per 24 ore con «Usato» (vale il primo TS); Compagnia intima uguale su Volontà. **Un pasto in locanda sostituisce la razione di cibo del giorno** (e quella d'acqua con «anche da bere», spuntata): al cambio di giorno quel PG non consuma.
- **AC10-5 Bagno con essenze**: +1 Diplomazia e Raggirare per 3 giorni (bonus se il PG ha quelle abilità fra le due libere, altrimenti etichetta).
- **AC10-6 Bevanda alcolica forte**: sorsi e bonus di Costituzione base; sorsi = 2 + il doppio del bonus → Barcollante 2 ore; oltre → Privo di Sensi 4 ore. Il giro di bevute resta testo.
- **AC10-7 Stallaggio**: gli animali scelti quel giorno non consumano foraggio né acqua.

## AD. Build 4 — Finestra TV, icona e primo rilascio (decisioni confermate da Massy il 02/11/2026)

*Passi 1–7 confermati in chat il 02/11. Le sezioni L, K5, U, V2, V9, V10 e X sono state aggiornate di conseguenza.*

### AD1. Cosa mostra la TV (passo 1)

| Momento | Sulla TV |
|---|---|
| In combattimento | «Round N»; **Ora agisce** in grande (oro); **Prossimi**: i 2 seguenti in medio; poi il resto dell'ordine in piccolo, che riparte dopo una riga «Round N+1» |
| Chi ritarda | riga «In attesa: …» in fondo (solo creature visibili) |
| Turno di una nascosta | non si vede: in grande c'è già il prossimo visibile |
| Alleati (accompagnatori, animali) | come i PG, con il loro nome |
| In fondo, se accesi | data e ora · meteo dell'ora · timer del turno (AD4) |
| Fuori combattimento, «Solo durante…» acceso | finestra chiusa (F9 la apre e mostra la riga sotto) |
| Fuori combattimento, «Solo durante…» spento | data e ora in grande e meteo, se accesi |
| Fuori combattimento, ora e meteo spenti | la finestra si nasconde da sola (vuota coprirebbe Foundry); con F9 mostra «Nessun combattimento» |

- **Mai sulla TV**: PF (Fatica e Ferita), malus e bonus, condizioni, ferite gravi, tattiche, promemoria, tiri, Preparare, il nome vero delle creature con il nome per i giocatori.
- Il testo cresce con la finestra; fondo scuro come l'app.

### AD2. Nome per i giocatori e righe nascoste (passo 2)

| Dove | Cosa c'è |
|---|---|
| Avvio del combattimento | campo «Nome TV» per ogni nemico e alleato (compilato se viene dall'incontro), più la casella «nascosto» |
| + Rinforzi e + Al combattimento | campo «Nome per i giocatori» e casella «nascosti» (spenta di default) |
| Incontro casuale | passa dall'avvio come gli altri: nome e «nascosto» si mettono lì |
| Durante il combattimento | comando **Nome TV…** su ogni riga di nemico o alleato (vuoto = nome vero), accanto a Nascondi/Rivela; nel log «Rivela» e il cambio di nome |
| Separa | la nuova riga eredita nome TV e «nascosta» |
| Per singolo con nome TV | numerati come i nomi veri: «Figura incappucciata 1», «… 2» |
| PG | niente nome TV: compare il nome del PG |

Una nascosta fuori combattimento resta nascosta; una rivelata compare al suo posto nell'ordine. Nella schermata principale le nascoste tengono il segno «Nascosta» e «(TV: …)» accanto al nome.

### AD3. Comandi e tasti (passo 3)

| Comando | Cosa fa |
|---|---|
| Pulsante **TV** nella testata | apre un piccolo menu con i quattro comandi sotto e lo stato («TV visibile» / «nascosta») |
| **Mostra/Nascondi** · F9 | mostra o nasconde la finestra; F9 da qualsiasi programma finché l'app è aperta |
| Automatico (AD1) | con «Solo durante…» acceso si apre all'avvio e si chiude alla fine del combattimento; F9 vale fino all'evento automatico successivo |
| **Sposta sulla TV** | porta la finestra sullo schermo successivo (con due schermi, l'altro), con la stessa dimensione e nello stesso angolo; con un solo schermo è grigio («Un solo schermo collegato») |
| **Blocca posizione** (casella) | la finestra non si trascina né si ridimensiona finché non la sblocchi |
| **Ripristina** | dimensione e posizione predefinite (640 × 360 nell'angolo in alto a destra dello schermo attuale) e finestra sbloccata |
| Trascinare / ridimensionare | da qualsiasi punto / dai bordi |
| **F10** (impostazione della campagna, spenta) | = **Avanti**, tiri automatici compresi; attivo solo durante un combattimento con l'impostazione accesa; senza combattimento non fa nulla |

- **Indietro** resta solo nell'app (un tasto globale per annullare si preme troppo facilmente per sbaglio).
- Posizione, dimensione, schermo e blocco in `tv.json` nei dati dell'app: valgono per il PC, non per la campagna. Se all'avvio quello schermo non c'è (TV spenta), posizione predefinita sullo schermo principale.
- Tasto occupato da un altro programma: avviso nell'app («F9 è già usato da un altro programma: usa il pulsante TV»).
- Chiudendo la finestra principale si chiude anche la TV e l'app esce; la TV non ha una «X» (si nasconde con F9 o dal menu).

### AD4. Timer sulla TV (passo 4)

| Punto | Scelta |
|---|---|
| Quando c'è | con **Timer reale** e **Timer sulla TV** accesi; senza Timer reale la casella è grigia con la nota «serve il Timer reale» |
| Quale | solo il **turno corrente**, «m:ss», accanto a «Ora agisce»; niente durata del combattimento |
| In quali turni | turni dei **PG e degli alleati**; nei turni dei nemici visibili lo spazio è vuoto |
| Turno di una nascosta | se il prossimo visibile è un PG: «0:00» fermo; se è un nemico: vuoto |
| Oltre la soglia | cifre in rosso (#C00000) |
| In pausa | cifre ferme con «⏸ in pausa» |
| Aggiornamento | ogni secondo, dallo stesso cronometro dell'app |

### AD5. Versione web di prova e Android (passo 5)

| Dove | La TV è… |
|---|---|
| App Windows | la finestra vera (AD1–AD4) |
| Browser, Picture-in-Picture disponibile | finestra Picture-in-Picture, sempre in primo piano |
| PiP non disponibile o rifiutato (pagina dentro claude.ai: il PiP si apre solo da una pagina di primo livello; Firefox, Safari, telefono) | finestra normale del browser (non sta in primo piano) |
| Anche la finestra bloccata | **riquadro dentro la pagina**: si trascina dalla barra, si ridimensiona dall'angolo, Blocca e Ripristina valgono, «Sposta sulla TV» grigio; a 390 px parte in basso, largo quasi tutto lo schermo; posizione salvata nella pagina |
| App Android | niente TV: pulsante TV nascosto; impostazioni TV nella campagna con la nota «solo nell'app Windows» |

- Menu TV della versione web: in più **«Usa il riquadro»** (casella), per provarlo di proposito.
- Avviso breve su dove è finita la TV («Picture-in-Picture non disponibile qui: TV nel riquadro»).
- F9 e F10 nel browser: solo con il fuoco sulla pagina o sulla finestra PiP.
- Il contenuto è disegnato dalla stessa funzione in tutti i casi.

### AD6. Icona (passo 6)

Stile delle altre app (simbolo piatto d'ottone #CCA860 su fondo scuro sfumato dal centro, un colore di fondo per app): **schermo del GM a tre ante** d'ottone (anta centrale chiara, laterali più scure in prospettiva, con le cornici) e **d20 arancione** #C45911 davanti in basso a destra, su fondo marrone brace scuro (vicino al fondo dell'app #15120E). Splash su fondo chiaro e scuro. `icone.py` riscrive `assets/`, `android/…/res` (quadrata, rotonda, adattiva), `desktop/icon.png`, `www/icona.png`. Bozza approvata il 02/11; nella versione finale il simbolo è un po' più grande e centrato, il d20 con tutti gli spigoli.

### AD8. Aspetto della TV (richiesta di Massy dopo la prima prova, confermato il 02/11 sull'anteprima)

| Elemento | Aspetto |
|---|---|
| Fondo | marrone brace sfumato dal centro, come l'icona |
| Cornice | doppio filetto oro (#8B6914 pieno, #D4A84B sottile) con un rombo d'oro in ogni angolo |
| «Round N» | in alto al centro, fra due filetti che sfumano |
| Ora agisce | riquadro bordato d'oro con l'etichetta sul bordo; nome grande in oro con un leggero alone; timer in una capsula a destra (rossa oltre la soglia) |
| Prossimi | numerati 2 e 3, con un rombo davanti a ogni nome: chiaro per i PG, verde per gli alleati, arancio per i nemici |
| Resto dell'ordine | sotto un filetto, più piccolo; «ROUND N+1» in una capsula dove ricomincia l'ordine |
| Piede | sotto un filetto: data e ora a sinistra, meteo a destra |
| Fuori dal combattimento | data e ora in grande al centro e il meteo sotto, fra due righe di rombi |

### AD9. Il meteo e i suoi effetti sulla TV (richiesta di Massy, 02/11)

| Punto | Scelta |
|---|---|
| Comando | pulsante **Sulla TV** nel pannello Meteo (diventa **Togli dalla TV**) e casella «Meteo sulla TV» nel menu TV |
| Cosa mostra | riquadro **Meteo** con il tempo in vigore adesso e il testo di ogni effetto (Tabelle del Tempo Atmosferico); con il mare, stato e CD di Nuotare |
| In combattimento | round, ora agisce e prossimi restano; il meteo prende il posto del resto dell'ordine |
| Fuori dal combattimento | data e ora in alto e il meteo sotto, anche con «Solo durante il combattimento» acceso (il pulsante apre la TV se è nascosta) |
| Quanto resta | finché il GM non lo toglie o cambia campagna; se il tempo cambia si aggiorna da solo |
| Testo lungo | si rimpicciolisce da solo fino al 60% |
| Piede | col meteo aperto solo data e ora |
| Più effetti | ognuno con il suo nome in oro; con un solo effetto uguale al tempo il nome non si ripete |

### AD7. Numeri di versione del primo rilascio (passo 7)

| Punto | Scelta |
|---|---|
| Primo rilascio | `main` creato dal ramo `sviluppo` (stesso commit) solo dopo il via esplicito di Massy; release **`v1.0.1`** (`Schermo-1.apk`) e **`win-1.0.1`** (`Schermo-1.0.1-portatile.exe` e `-installazione.exe`) |
| Run fallito | consuma un numero (la release buona può essere `v1.0.2` o `win-1.0.2`) |
| Correzioni dopo la prova | commit su `sviluppo`, controlli, poi `main`: numero nuovo; se la correzione tocca solo `desktop/` cambia solo il numero di Windows (e viceversa) |
| Ramo predefinito | `main`, se l'accesso lo permette (altrimenti lo cambia Massy); `sviluppo` resta per le build future |
| Design doc nel repo | `Schermo_app_design_v19.md` (o la versione corrente) entra nel repo con il primo rilascio |
| Versione visibile | app Windows: in fondo alle Impostazioni «Versione win-1.0.N»; Android: Impostazioni › App |
| Copie sul PC | `Applicazioni/APK/Schermo-N.apk`; in `Applicazioni/Windows/` portatile e installazione; le vecchie in `_da_eliminare/` |
| Salvataggi | portatile e installata usano la stessa cartella (`%APPDATA%\Schermo del Narratore`) |


## Z4. Build 4 — come è stata applicata (02/11/2026)

### Fatto
- **Motore** (`motore.js`): `statoTV` (tutto ciò che la TV mostra, mai PF, malus, condizioni, tattiche o nomi veri), `cartaMeteoTV` (AD9), `tvVisibile` (automatico e manuale), `f10Attivo`, `nomeTvDi`; comando `nomeTv`; «Nascondi/Rivela» nel log; nome TV numerato per singolo. 826 test (46 nuovi), con la campagna salvata con la 3b (`sorgenti/prove/campagna_build3b.json`, creata con il codice del commit `c8e3204`).
- **Interfaccia** (`template.html`): pulsante **TV** e menu, riquadro, Picture-in-Picture e finestra del browser, F9/F10 nella pagina, campo «Nome TV» nell'avvio, nome e «nascosti» nei rinforzi, comando «Nome TV…» sulle righe, impostazioni TV rifatte, riga della versione.
- **Electron** (`desktop/`): `main.js` con la finestra TV, `tv_posizione.js` (posizione predefinita, all'avvio, «Sposta sulla TV»; 8 test in `test_archivio.js`, che ora ne ha 21), `preload.js` e `preload_tv.js`, `tv.html` e `tv.js`, `tv.json` nei dati dell'app. Prova di fumo sotto Xvfb (`sorgenti/prova_electron.py`): 18 controlli, 0 errori (con la carta del meteo).
- **Icona** (`icone.py`): schermo a tre ante e d20, simbolo all'80% come nelle altre app; `assets/`, `android/…/res`, `desktop/icon.png`, `www/icona.png`.
- **Prove**: pagina a 1366 e 390 px, 684 controlli (98 nuovi: carta del meteo e cornice, riquadro, F9, F10, nome TV, rinforzi nascosti, timer, menu, blocco, trascinamento, Ripristina, fine del combattimento, «Solo durante…» spento, campagna della 3b; catena PiP → finestra → riquadro; Android simulato). Pagina di prova sullo stesso artifact (versione 14, poi 15 con AD8 e AD9).

### Scelte di applicazione (confermate da Massy il 02/11)
- **Z4-1** La pagina impagina il contenuto della TV (testi già protetti) e lo manda alla finestra Electron, che lo mostra e basta: una sola funzione di disegno per tutti i casi (AD5). Nella TV non arriva nient'altro.
- **Z4-2** Aspetto della TV: vedi AD8 (tutte le misure in proporzione al lato più corto della finestra, così il testo cresce con la finestra).
- **Z4-3** Riquadro della versione web: 480 × 270 in basso a destra (in alto copriva le schede della terza colonna); sotto i 600 px in basso, largo quanto lo schermo e alto 220 px; minimo 200 × 120; sta sotto le finestre di dialogo. Posizione, dimensione e blocco si salvano nella pagina (come le preferenze del tema).
- **Z4-4** Finestra TV di Windows: compare **senza prendere il fuoco** (Foundry resta attivo), minimo 240 × 135, si trascina da qualsiasi punto; con Alt+F4 si nasconde (come F9), non si chiude. `tv.json` si scrive mezzo secondo dopo lo spostamento o il ridimensionamento.
- **Z4-5** F9 e F10 funzionano anche come tasti della pagina: nell'app Windows è la riserva se il tasto globale non si registra (un altro programma lo tiene, con l'avviso di AD3).
- **Z4-6** Finestra del browser o Picture-in-Picture chiusa a mano = «Nascondi» fino al prossimo evento automatico (inizio o fine del combattimento, altra campagna).
- **Z4-7** Menu TV: Mostra/Nascondi, Sposta e Ripristina chiudono il menu; Blocca posizione e «Usa il riquadro» valgono subito.
- **Z4-8** Log: «… nascosta sulla TV», «… rivelata sulla TV», «…: sulla TV «nome»» / «con il nome vero».
- **Z4-9** Separa: il membro separato tiene il nome TV del gruppo così com'è (es. «Bestie»); si cambia con «Nome TV…».
- **Z4-10** Impostazioni: «Data e ora» al posto di «Ora del giorno»; accanto al Timer sulla TV la nota «solo nei turni dei PG e degli alleati» (o «serve il Timer reale», con la casella grigia); F10 «solo durante il combattimento». Nell'app Android i campi dei rinforzi per la TV non ci sono; il campo «Nome TV» dell'avvio resta (gli incontri sono gli stessi).
- **Z4-11** Riga della versione in fondo alle Impostazioni: «Versione win-1.0.N» nell'app Windows, «Versione di prova (pagina web)» nella pagina di prova, niente altrove.
- **Z4-12** Elenco delle campagne aperto: la TV si nasconde; con F9 mostra «Nessuna campagna aperta».
- **Z4-13** Splash dell'APK: lo stesso simbolo su fondo crema chiaro e su fondo scuro come l'app (#15120E).

### Non ancora attivo
Rilascio su `main` (APK `v1.0.1`, Windows `win-1.0.1`) dopo il via di Massy; prova sul PC con la TV come secondo schermo sopra Foundry.

## Z3b. Build 3b — come è stata applicata (02/11/2026)

### Fatto
- Fonti: `estrai_prontuario.py` estrae dal Vol. 1 2.5.2 (Abilità, Punti Ferita e riposo, Combattimento, campagne acquatiche) e dal Vol. 3 2.5.8 (Fonti di luce, Locande e taverne, Stalle, Professione cerusico ed erborista) in `sorgenti/guida/vol1_prontuario.txt` e `vol3_prontuario.txt`; la Guida resta `guida_dm.txt`, le Tabelle del Tempo `tempo_atmosferico.txt`.
- `crea_prontuario.py` → `prontuario.json`: 7 sezioni, 42 voci (36 della Guida), 9 refusi e adattamenti, 28 misture, 12 servizi della locanda, stalle, luce, cerusico, viaggi, cadere, pericoli, 6 aree, Appendice A. `controlla_prontuario.py`: 962 controlli, 0 errori (testi della Guida presenti, refusi corretti, niente termini vietati fuori dalle note, tabelle del Vol. 3 uguali agli estratti).
- Motore: 780 test (131 nuovi, con la campagna salvata con la 3a in `sorgenti/prove/`; si aprono ancora quelle di 1, 2a, 2b, 2c e 3a), archivio 13. Pagina: Prontuario a 10 sezioni con ricerca su tutto e dadi cliccabili, pannello Marcia, finestre Tira incontro, Aree, Cadere, Trattenere il fiato, Fumo e Alta quota, Riparare, Locanda, Bevanda, Riposo (8 o 24 ore, assistenza), Pronto soccorso, Prepara mistura; contatori Medicinali ed Erbe miste. Playwright a 1366 e 390 px: 587 controlli (102 nuovi), 0 errori, nessun errore in console, nessuno scorrimento orizzontale. Artifact versione 13.

### Scelte di applicazione (confermate da Massy il 02/11)
- **Z3b-1 Prontuario**: dieci pulsanti in alto (AC1-1). La ricerca guarda in tutte le sezioni e mostra i risultati raggruppati sotto il nome della sezione; con 3 risultati o meno in una sezione le schede si aprono (come Z3a-14).
- **Z3b-2 Schede delle voci**: titoli, paragrafi e tabelle (le righe di gruppo, es. «Generali», su una riga dorata); le note con l'etichetta della fonte («Vol. 1», «Vol. 3», «nota dell'app»); la fonte in fondo. Sotto le voci con uno strumento il pulsante: Marcia…, Cadere…, Trattenere il fiato…, Fumo: applica a…, Alta quota: applica a…, Riparare…, Locanda…, Prepara mistura…, Medicinali… (porta al pannello Compagnia).
- **Z3b-3 Dadi cliccabili** (AC7-6): ogni «NdX» o «NdX+Y» nei testi del Prontuario è un pulsante; il tiro è «libero» (il 20 non vale 30), va nello storico dei Dadi e nel log solo se nei Dadi è spuntato «anche nel log».
- **Z3b-4 Meteo nel Prontuario**: menu «Zona» che parte dalla zona della campagna; le tabelle per stagione con gli intervalli come nelle Tabelle (01-85, 86-90…); per il Sotterraneo la tabella delle condizioni. Il pannello Meteo del Viaggio non cambia (AC8-2).
- **Z3b-5 Riposo**: il pulsante della testata diventa «Riposo…»; nella finestra «8 ore» o «Riposo totale (24 ore)», e la casella «Assistenza continua» con chi assiste (i suoi gradi accanto al nome) e un campo per paziente: vuoto = non assistito.
- **Z3b-6 Pronto soccorso**: pulsante «Pronto soccorso…» nella finestra «Cura» del PG; chi cura dal menu dei PG (gradi dalla scheda) o «altro» con i gradi a mano. Fuori combattimento l'orologio avanza di 5 minuti. Il secondo tentativo dopo lo stesso combattimento non apre la finestra: avviso con il motivo.
- **Z3b-7 Scheda del PG**: riquadro nuovo «Professioni (Vol. 3)»: gradi in Professione (cerusico), gradi in Professione (erborista), casella «Erborista: raccoglie le erbe ogni giorno». Nella campagna d'esempio Cira ha 6 gradi da cerusico.
- **Z3b-8 Contatori** (AC3-4, AC4-2): in fondo al pannello Compagnia, «Unità di medicinali» ed «Erbe miste» con la casella acceso/spento, − e + (0–10); «Prepara mistura…» accanto alle erbe.
- **Z3b-9 Coda**: la raccolta delle erbe ha «Raccoglie» e «Impossibilitato» e va risposta (non sparisce con «Tutti fatti»); la scadenza di una malattia «trattata stanotte» ha la casella «il cerusico riesce» accanto a Superato e Fallito; il promemoria di un incontro casuale tirato a mano ha «Avvia» e «Ignora».
- **Z3b-10 Etichette** (dettaglio del malus): Sanguinante → «Fermare il sanguinamento…» (Professione (cerusico) CD 10 o Sopravvivenza CD 15 nel menu della finestra); veleno → «Trattare il veleno…»; malattia → «Trattata stanotte» (e «Togli…», una sola malattia trattata alla volta); Trattenere il fiato → «−1 round» (la finestra resta aperta per toglierne altri) e «Fuori dall'acqua», che c'è anche su «Senza fiato» e «Annega». Nel TS periodico il dettaglio scrive «CD +1 a ogni prova».
- **Z3b-11 Pannello Marcia** (Viaggio, fra Meteo e Luce): «Marcia…», «Tira incontro…» (solo con gli incontri casuali accesi), «Locanda…»; una riga con le ore di marcia di oggi (e «marcia forzata») e le ore accumulate per gli incontri. Durante la marcia il pannello ha il bordo dorato e mostra l'evento: Orientarsi con il campo del risultato; marcia forzata con una casella per PG e per cavalcatura e due pulsanti, «Registra e continua se tutti superano» (se qualcuno fallisce la marcia si ferma a quell'ora) e «Continua lasciando indietro chi fallisce»; incontro con «Avvia» e «Ignora»; dopo «Avvia» la marcia resta sospesa con «Riprendi la marcia (resto)» e «Termina qui». «Termina qui» c'è sempre. Alla fine «Ultima marcia: km in ore».
- **Z3b-12 Finestra Marcia**: ricorda mezzo, terreno e «fuori strada» dell'ultima volta; 8 ore per difetto, oppure i km; il suolo proposto dal meteo di oggi; la velocità a piedi dal PG più lento (nome e metri scritti sotto), modificabile; l'area e «speciale» solo con gli incontri accesi.
- **Z3b-13 Avvia** (incontro casuale): riempie l'Avvio del combattimento con i partecipanti tirati (con la scheda del bestiario, bonus d'iniziativa dalla scheda, per tipo), poi il GM scrive l'iniziativa dei PG e preme «Tira e avvia».
- **Z3b-14 Aree** (AC6-2/3): pulsante «Aree degli incontri casuali…» nelle Impostazioni; per area nome, probabilità, speciale con la sua probabilità e la tabella: per ogni riga da–a, quantità in dadi, scheda del bestiario (facoltativa), nome ed evento (un partecipante per riga); buchi e sovrapposizioni segnalati mentre si scrive; «+ Riga» parte dal numero dopo l'ultima; «Copia la tabella da…».
- **Z3b-15 Tira incontro**: area, «speciale», «notte al riparo»; esito in un avviso e nel log; se l'ora del 2d12 è già passata oggi, il promemoria va al giorno dopo.
- **Z3b-16 Cadere**: «Tira i danni» mostra l'anteprima (dadi e risultati), «Applica» la usa (o tira se non c'è); i danni letali passano dal Danno (con la finestra delle ferite gravi se servono), i non letali dal danno non letale; Prono senza durata; alla «morte» la coda della morte. Per la caduta in acqua oltre i 12 m: i 6 m non letali più la tabella per i metri oltre i 12 (nota nel Prontuario).
- **Z3b-17 Trattenere il fiato**: Costituzione 12 per difetto (la scrive il GM); il malus dura i round di fiato e scade con l'orologio o con il turno; poi «Senza fiato» con il TS periodico di Costituzione (CD +1 a ogni prova), poi «Annega» con Privo di Sensi.
- **Z3b-18 Fumo e Alta quota**: finestra «applica a…» con la scelta della creatura (per l'alta quota anche la quota); i danni non letali del fumo sui nemici vanno solo nel log.
- **Z3b-19 Danni alle caratteristiche** (marcia forzata, alta quota oltre 4.500 m): etichette senza durata da togliere a mano, perché l'app non tiene i punteggi.
- **Z3b-20 Riparare**: CD, tempo e riga della tabella aggiornati mentre si sceglie; «Registra la prova» (per conto proprio, con il risultato) o «Dall'artigiano» (con il valore per la commissione: promemoria «riconsegna» dopo 1d4 ore o 24 ore).
- **Z3b-21 Locanda**: servizi per PG con i prezzi; la bevanda alcolica forte in una finestra a parte (chi, sorsi, bonus di Costituzione base); lo stallaggio con una casella per animale; totale mentre si sceglie; «Paga» o «Paga e riposa nella locanda», che apre il Riposo con i PG che hanno preso servizi e la loro stanza accanto al nome. Una stanza sola per PG.
- **Z3b-22 Misture**: le misture senza un valore da applicare sono etichette con il testo del Vol. 3 come «altro»; uno solo unguento alla volta (il nuovo toglie il vecchio); la poltiglia diventa un promemoria fra 1 ora con i danni curati già tirati; l'«Unità di medicinali» preparata ha il promemoria «non più utilizzabile» dopo 1 ora (il contatore non scende da solo).
- **Z3b-23 Prezzi della luce**: nella finestra «Nuova fonte di luce» i prezzi sono quelli del Vol. 3 (Torcia 3 ma, Candela 5 mr ogni 5); raggio e durata restano quelli della Build 3a.
- **Z3b-24 TS periodico**: casella «CD +1 a ogni prova» nella finestra Malus/Bonus, salvata anche nei modelli.

### Non ancora attivo
Finestra TV, icona e primo rilascio (Build 4).

## Z3a. Build 3a — come è stata applicata (01/11/2026)

### Fatto
- Fonti (in `sorgenti/guida/`): `golarion_condizioni.txt` (pagina «Condizioni» di golarion.altervista.org letta con il browser integrato dell'app desktop, 40 sezioni, SHA-256 `504fc714…` uguale alla pagina), `vol1_regole.txt` (`estrai_vol1_regole.py`: tipi di bonus, condizioni ed effetti, 1 e 20, vantaggio, sanguinamento, impreparati), `vol3_riparare.txt` (`estrai_vol3_riparare.py`, Vol. 3 2.5.8 «Riparare oggetti rotti», con la tabella), `guida_dm.txt` (Guida del DM, `pdftotext -layout`, anche per la Build 3b).
- `crea_condizioni.py` → `condizioni.json`: 42 voci (le 37 in rosso, Morente, Addormentato, Bloccato, Legato, Livelli negativi) con sintesi, testo, sezioni, fonte e nota d'adattamento, 3 voci di regola (Paura con Terrore crescente, Danni non letali, Danni alle caratteristiche), tabella di Confuso. `controlla_condizioni.py`: 228 controlli, 0 errori (testi integrali uguali a golarion, adattamenti presenti e resto invariato, Vol. 1 e Vol. 3 uguali agli estratti, sintesi trovate nella Guida, niente Guarire, morente o PF negativi fuori da Morente e Morto).
- `crea_ferite.py`: i 5 Fallimenti critici (45 righe) con le note ¹ ² in `ferite.json`; `controlla_ferite.py` 136 controlli, 0 errori.
- `crea_strumenti.py` → `strumenti.json`: 7 fonti di luce della Guida, livelli delle Fiamme per 19 voci del meteo, 23 tipi di bonus; `controlla_strumenti.py` 99 controlli, 0 errori.
- Motore: 649 test (109 nuovi, con la campagna salvata con la 2c in `sorgenti/prove/`), archivio 13. Pagina: scheda «Prontuario» (Condizioni, Imprevisti), finestra «Fallimento critico», Malus/Bonus con modelli, tipo di bonus, × livello e Terrore crescente, 🎲 Dadi, pannelli Luce e Promemoria, Log con sessioni e filtri. Playwright a 1366 e 390 px: 485 controlli (98 nuovi), 0 errori, nessun errore in console, nessuno scorrimento orizzontale. Artifact versione 12. Commit `d4e5e02` e `018f06c` sul ramo `sviluppo`.

### Scelte di applicazione (confermate da Massy il 01/11)
- **Z3a-1 Rosso**: in rosso solo le 37 condizioni; Morente, Addormentato, Bloccato, Legato e Livelli negativi restano neri (come nella Build 2a).
- **Z3a-2 Sintesi**: dove la Guida non ha la riga (Colto alla sprovvista, Inabile, Morto, Pietrificato, Rotto, Scheggiato, Sanguinante, Stabilizzato, Livelli negativi) la sintesi l'ha scritta l'app dal testo della scheda, ed è segnata «sintesi dell'app». Nella sintesi di Indifeso tolto l'asterisco «*» della Guida (nessuna nota); nei Danni non letali corretto «ma con di penalità» → «ma con penalità».
- **Z3a-3 Livelli negativi** (rivista da Massy il 01/11): ogni applicazione di «Livelli negativi» è un risucchio a sé e si somma ai precedenti, anche con lo stesso numero; il riquadro mostra il totale; togliendo un malus (es. TS riuscito su un livello temporaneo) tornano i massimi di quella parte, i valori correnti restano. Sui nemici con i PF (J9) calano solo i valori correnti, non i massimi della riga.
- **Z3a-4 Terrore crescente**: vale per Scosso e Spaventato applicati a chi è Scosso o Spaventato; su chi è In Preda al Panico lo Scosso si aggiunge accanto (e non si somma nei valori, come prima). Nella finestra Malus la casella «diventa …» si può togliere. Vale anche per le condizioni che arrivano dalle Ferite gravi e dai Fallimenti critici.
- **Z3a-5 Fatica e riposo**: il Riposo 8 ore toglie Affaticato ed Esausto ai PG che riposano, tranne quelli con «fame» o «sete» nella fonte o nell'etichetta.
- **Z3a-6 Confuso**: il d% si tira all'inizio del turno di ogni riga confusa, anche dei nemici (un tiro per riga di gruppo); il risultato va nella barra del turno e nel log.
- **Z3a-7 Fallimenti critici**: «Applica e termina il turno» è Applica + Avanti; i danneggiamenti (scheggiato → rotto → distrutto) vanno solo nel log, perché l'app non tiene l'equipaggiamento; Prono senza durata (si toglie a mano); le condizioni hanno la fonte «Fallimento critico». Dai Dadi, con l'1 al tiro per colpire, la finestra si apre per chi sta agendo (fuori combattimento si sceglie).
- **Z3a-8 Fiamme**: livelli dalla tabella delle Fiamme e dai testi degli effetti: Grandine e Pioggia gelata come la Pioggia battente, Pioggia di cenere come la Neve, Temporale come Acquazzone e Vento forte; candela e torcia si spengono con le stesse voci (ogni pioggia, neve o vento delle Tabelle è almeno al livello della torcia). **Divergenza nelle Tabelle**: il testo della Tormenta dice «Fiamme: come con il Vento molto forte» (lanterna impermeabile al 50%), la tabella delle Fiamme la mette fra le tempeste che spengono anche la lanterna impermeabile: **vale la tabella** (Massy, 01/11): la Tormenta spegne anche la lanterna impermeabile; il testo dell'effetto nelle Tabelle è da correggere (punto aperto).
- **Z3a-9 Luce nel Sotterraneo**: il tempo atmosferico non conta, ma le Correnti d'aria spengono come il Vento forte anche le fonti «al riparo» e con l'Aria viziata le fiamme si consumano il doppio. Una fonte che il tempo di adesso spegnerebbe non si accende (pulsante spento con il motivo). Il controllo delle luci si fa anche dopo i cambi del meteo fatti dal GM (Ritira, Imposta, Inizio…). Le fiaschette d'olio non si contano: «Fiaschetta» ricarica la lanterna, «Sostituisci» rimette una candela o una torcia nuova.
- **Z3a-10 Promemoria**: quelli a tempo scattano in coda e nel log; quelli dei round stanno nel combattimento come i promemoria degli incontri (barra del turno per tutto il round e log, non in coda) e finiscono con il combattimento; «Salva nell'incontro» c'è solo se il combattimento viene da un incontro.
- **Z3a-11 Dadi**: storico degli ultimi 50 tiri nella campagna (si salva con lei); vantaggio e svantaggio solo per un tiro con un d20, e insieme si annullano; «Ripeti» solo sull'ultimo tiro e una volta.
- **Z3a-12 Log**: il tipo di ogni riga (combattimento, tempo e meteo, ferite e cure, scorte, tiri, altro) si ricava dal testo; «Inizia sessione» scrive una riga di separazione; l'esportazione usa i filtri attivi.
- **Z3a-13 Bonus**: i tipi valgono solo per le voci «Bonus»; i malus e i bonus negativi si sommano sempre; il bonus d'istinto vale per CA e contatto (non per la CA colto alla sprovvista, né quando la CA mostrata è quella colto alla sprovvista). Il campo «× livello» è una casella con il livello già scritto (del PG bersaglio) e non vale per le durate «fino a fine incontro», «permanente» e «senza durata». I modelli sono della campagna; lo stesso nome aggiorna il modello.
- **Z3a-14 Prontuario**: la ricerca guarda anche nei testi; con 3 risultati o meno le schede si aprono; un tocco su una condizione in rosso fuori dalle finestre (stat block, meteo, Prontuario) apre la sua scheda, dentro le finestre resta la sintesi al passaggio del mouse. «Applica a…» vale per i PG e le righe dell'iniziativa (accompagnatori e animali non hanno malus).
- **Z3a-15 Luce personalizzata o permanente** (richiesta di Massy, 01/11): in «+ Luce» la voce «Personalizzata (incantesimo o altra fonte)…» con nome, raggio in metri, durata (round, minuti, ore, giorni o permanente) e come la spegne il meteo (non la spegne: luce magica, per difetto; come una candela, una torcia, una lanterna o una lanterna impermeabile, con la tabella delle Fiamme). La permanente non si consuma e non si rinnova; quella con durata, finita, si rinnova con «Rinnova».

### Non ancora attivo
Prontuario della Guida (Abilità, Combattimento, Cure e recupero, Viaggi con il calcolatore, Pericoli, Meteo, Riparare, Locande e luce) e incontri casuali (Build 3b); finestra TV (Build 4).

## Z. Build 1 — come è stata applicata (26/10/2026)

### Fatto
- Repo: scheletro con `nuova_app.py` da `alchimista` (skill collana-app v1.0.2), pacchetto `it.collana.schermo`, keystore nuovo `android/app/schermo.keystore`. Nessun push (si fa dopo la conferma).
- `sorgenti/meteo.json` ricostruito dalla Guida (estratto `sorgenti/guida/guida_meteo_fame_sete.txt`) e controllato da `controlla_meteo.py`: 8 tabelle, 48 righe, 12 effetti, 8 stagioni, 0 errori; refusi «2 giugno» e «non abbia mangiato» corretti nel JSON con la nota.
- Motore (`motore.js`): 142 test. Salvataggi su file di Electron (`desktop/archivio.js`): 9 test. Pagina provata con Playwright a 1366 e 390 px: 67 controlli, nessun errore in console, nessuno scorrimento orizzontale.
- Interfaccia: elenco delle campagne (Crea, Apri, Duplica, Esporta, Importa, Elimina con conferma, campagna d'esempio), procedura guidata in 8 passi (B2), testata con orologio, meteo e tasti del tempo (C6), coda degli avvisi (C7), tre colonne Tavolo · Iniziativa · Viaggio/Log, tema scuro (chiaro nelle impostazioni).

### Scelte di applicazione (Z2–Z10 confermate da Massy il 26/10; Z1 rivista)
- **Z1 Scorta insufficiente** (rivista da Massy il 26/10): se una scorta non basta per tutti, il giorno resta in sospeso con l'avviso «Scegli chi»; il GM spunta i PG e indica quanti accompagnatori la usano (non oltre le razioni). Chi la usa scende di 1, chi no prende Sete/Fame +1 e conta il giorno senza; dal 4° (sete) o 7° (fame) giorno senza, prova di Costituzione per quel PG. Più giorni in sospeso si decidono in ordine; a scorta 0 o sufficiente l'app va avanti da sola. Le campagne salvate prima passano Fame e Sete del gruppo a ogni PG.
- **Z2 Fame e sete nel riquadro**: già in Build 1, Sete N e Fame N tolgono N a TS e abilità (tabella G2) e si sommano fra loro.
- **Z3 Alternative del meteo** («Pioggia battente / Neve», «Acquazzone / Neve fitta»): vale la prima; il GM sceglie l'altra con un pulsante.
- **Z4 Cambio di zona**: il meteo del giorno resta; «Ritira» lo tira nella zona nuova. Il meteo del giorno dopo usa la zona nuova.
- **Z5 Rifiatare**: fuori combattimento la finestra propone «Avanza l'orologio di 30 minuti» (Vol. 1: almeno mezz'ora d'inattività), spuntato di default.
- **Z6 Cura**: toglie anche altrettanti danni non letali (regola di PF1e, non scritta nella Collana).
- **Z7 Riposo 8 ore**: l'orologio avanza (con scorte e meteo dei giorni attraversati), poi il recupero; si scelgono i PG che riposano; limite di un riposo nelle 24 ore come in F7.
- **Z8 Ferita grave**: in Build 1 compare l'avviso con la riga (−1…−15) e «Chiudi senza tirare»; tabelle e tiro arrivano con la Build 3 (sez. Q).
- **Z9 Indietro** vale solo in combattimento (fino a 200 passi, durate, orologio e Punto eroe compresi).
- **Z10 Eliminare una campagna** in Windows rinomina il file in `<id>.json.eliminato` invece di cancellarlo.

### Non ancora attivo (impostazioni già salvate)
XP, PF dei nemici, incontri casuali (Build 2–3), finestra TV, F9/F10 (Build 4). Nella pagina di prova «Scarica» non c'è (il visore non permette i download): si usa «Copia».

## Z2a. Build 2a — come è stata applicata (26/10/2026)

### Fatto
- Fonti: `sorgenti/guida/vol3_imprevisti.txt` (Cap. 3 del Vol. 3 2.5.7 letto dall'XML del .docx, tabelle con « | »; md5 `a937957c…`, uguale sul PC) e `sorgenti/guida/vol1_condizioni.txt` («Nuove condizioni» del Vol. 1 2.5.2 senza immagini). `sorgenti/ferite.json` (Fermare le emorragie: 5 righe; Amputazioni: 8 locazioni con i modificatori) controllato da `controlla_ferite.py`: 104 controlli, 0 errori, più il conteggio delle 6 tabelle delle Ferite gravi (84 righe) e dei Fallimenti critici. `sorgenti/condizioni.json`: le 37 condizioni in rosso, Morente (non colorato), Addormentato, Bloccato, Legato, Livelli negativi; testi del Vol. 1 per le 5 condizioni nuove.
- Motore: malus e bonus su PG e righe dell'iniziativa (G), TS periodici, veleni e malattie (H), scomposizione delle Ferite gravi, ferite, emorragie, panico, cerusico, cure dirette, amputazioni, avviso di morte (I), migrazione delle campagne della Build 1. Test: 290 (162 della Build 1 + 128 nuovi; le 84 righe del Vol. 3 fanno da corpus della scomposizione).
- Pagina: «Malus/Bonus» e «Ferita grave» nel riquadro e nelle righe dell'iniziativa, etichette cliccabili con il dettaglio, finestra «Curare» (I2), coda con Superato/Fallito e con le scelte della morte, barra del turno con ciò che scade e ciò che va tirato. Playwright a 1366 e 390 px: 140–142 controlli (alcuni dipendono dai tiri), 0 errori, nessun errore in console.

### Scelte di applicazione (confermate da Massy il 26/10)
- **Z2a-1 Round in combattimento**: un malus di N round dura N turni del bersaglio: se il bersaglio ha già agito in quel round, conta dal round dopo (Stordito 1 round = perde il prossimo turno); scade all'inizio del suo turno. Con «chi l'ha causato» scade all'inizio dell'N-esimo turno successivo di quella creatura. Se la creatura di riferimento non è nell'iniziativa, i round scorrono con l'orologio.
- **Z2a-2 Somme**: la stessa condizione non si somma (resta la durata più lunga); Scosso, Spaventato e In preda al panico non si sommano fra loro, Infermo sì; Offuscato: vale la % più alta (Vol. 1). I bonus si sommano tutti, senza i tipi di bonus di Pathfinder.
- **Z2a-3 Durate**: oltre a quelle di G c'è «senza durata (si toglie a mano)», usata per Prono e per i malus aperti; ogni etichetta si toglie con «Togli».
- **Z2a-4 Massimi ridotti** (livelli negativi, Fatica e Ferita max): i valori correnti scendono al nuovo massimo e non risalgono quando il malus finisce.
- **Z2a-5 TS periodico**: in combattimento il primo TS è al prossimo turno del bersaglio, poi ogni N round; fuori combattimento dopo l'intervallo. Le scadenze arretrate (salti di tempo) arrivano una alla volta in coda.
- **Z2a-6 Indietro**: nel combattimento annulla anche malus, esiti dei TS, cure dirette, prove del cerusico e ferite attaccate. Danno e Cura dei PF restano come nella Build 1.
- **Z2a-7 Nemici**: i malus stanno sulla riga dell'iniziativa (anche di gruppo, con l'etichetta) e finiscono con il combattimento; le ferite gravi in questa build solo sui PG.
- **Z2a-8 Veleni e malattie**: applicarli vale come TS iniziale fallito: il primo effetto arriva subito (o alla fine dell'insorgenza), senza TS, con un avviso in coda; poi una scadenza con TS ogni frequenza, per N volte (vuoto = senza limite, per le malattie). L'effetto si tira e il totale resta sull'etichetta (l'app non tiene i punteggi di caratteristica). Dose aggiuntiva: CD +2 e metà delle scadenze di base in più, per eccesso.
- **Z2a-9 Scomposizione (I1)**: i sotto-tiri che decidono il malus (lato, parte del volto, penalità 1d3, caratteristica, punti 1d3+1, dita 1d2, durate a dadi) li tira già l'app e li mostra nell'anteprima; il lato si può cambiare. «Stordito per 1 round e poi barcollante in quello seguente» → Stordito 1 round + Barcollante 2 round. «Braccio inutilizzabile» e «arti inferiori paralizzati» sono etichette (non condizioni); i punteggi mentali ridotti sono etichette permanenti; il coma è Privo di Sensi permanente con l'etichetta «Coma» (l'1% ogni 30 giorni lo tira il GM). Oggetto indossato: l'app tira lo slot (e il 50% «distrutto») e lo scrive nel log con l'ordine della nota ¹ per lo slot vuoto; gli altri oggetti (impugnati, da raccogliere) restano una nota.
- **Z2a-10 Emorragie**: l'emorragia lieve con «Morirai… entro» mostra l'ora della morte; quella senza (Testa −7) non uccide. Emorragia grave e attacco di panico: in combattimento un tiro alla fine del turno del PG; fuori combattimento un tiro per ogni round dell'orologio (un salto di un'ora con un'emorragia grave aperta è quasi sempre mortale). Dopo l'avviso di morte non si tira più.
- **Z2a-11 Morte (I3)**: avviso in coda con tre scelte: «Tira il 20% del Morente» (riuscito: Morente 1 minuto, poi Morto; fallito: Morto), «Morto», «Ignora». Morto in combattimento esce dall'iniziativa.
- **Z2a-12 Cerusico (I2)**: il GM scrive il risultato della prova; senza medicinali l'app toglie 5. Le emorragie si fermano subito; una ferita riuscita guarisce dopo il tempo della tabella e la condizione legata resta fino ad allora. Fallita: si ritenta dopo il tempo indicato con la CD cambiata.
- **Z2a-13 Organo compromesso (F8)**: Punti Fatica recuperati con Rifiatare e riposo ÷2 (÷3 dalla seconda volta), per difetto.
- **Z2a-14 Amputazioni**: si applicano solo i numeri che valgono sempre (abilità del riquadro, Iniziativa, CA); quelli legati a una situazione (udito, vista, olfatto, DMC contro Lottare, % di fallimento degli incantesimi) restano nel testo. «Entrambi» vale anche per braccio-braccio e gamba-gamba; mano e braccio dallo stesso lato contano come braccio; un lato non indicato non fa scattare «entrambi»; 3 dita della stessa mano o dello stesso piede = mano o piede persi.
- **Z2a-15 Ferita grave dalla tabella** (richiesta di Massy, 26/10): sotto 0 si apre la finestra con la riga già scelta (−1…−15, sotto −15 vale −15, modificabile); si sceglie la tabella; con «Armi e incantesimi con tiro per colpire» l'app tira il 1d8 della locazione e lo mostra (la locazione si può cambiare e resta se si cambia la riga). L'anteprima mostra il testo della riga e i componenti già tirati; con il braccio o la gamba il lato passa ad amputazioni e dita. Un tocco su «Attacca». Resta «Oppure scrivi o incolla il risultato». Il pulsante «Ferita grave» del riquadro apre la stessa finestra (riga −1 se i Punti Ferita non sono negativi).
- **Z2a-16 Testi delle condizioni**: in questa build nei suggerimenti ci sono l'effetto applicato e i testi del Vol. 1 (Azzoppato, Colto alla sprovvista, Morente, Offuscato, Sempre pronto); quelli di golarion.altervista.org arrivano con la sezione P (Build 3): il sito non è raggiungibile dagli strumenti di questa sessione.
- **Z2a-17 Finestre**: il cursore va subito nel primo campo (prima con un ritardo di 30 ms: chi scriveva in fretta finiva nel campo sbagliato).
- **Z2a-18 «Ultimo nell'ordine di Iniziativa»** (righe −1 di Busto, Gamba, Area e Costituzione): in combattimento la riga del PG va in fondo con un totale sotto l'ultimo; se ha già agito nel round (o sta agendo) quel round non agisce di nuovo; fuori combattimento solo una nota nel log.
- **Z2a-19 Righe −1 di Testa e Braccio**: Offuscato 20% per 2 round; «colpito alla mano» (oggetto che cade o scudo slacciato) resta una nota.

### Non ancora attivo
Bestiario, PNG, incontri e tattiche (Build 2b); Fallimenti critici con i tiri, consultazione delle tabelle, testi completi delle condizioni (Build 3); finestra TV (Build 4).

### Aggiornamento del 26/10 sera (Vol. 3 2.5.8)
- Estratto rifatto dal Vol. 3 2.5.8 (`sorgenti/guida/vol3_imprevisti.txt`, md5 `79466c41…`, uguale sul PC): rispetto alla 2.5.7 il Cap. 3 cambia solo per le sei righe −1. `sorgenti/crea_ferite.py` genera `ferite.json` con le tre tabelle delle Ferite gravi (locazioni del 1d8 comprese) e la nota ¹; `controlla_ferite.py`: 119 controlli, 0 errori, 6 tabelle da −1 a −15 (90 righe).
- Motore: 307 test (17 nuovi: righe −1, slot e 50%, tabella con locazione e lato, «ultimo» nel combattimento). Pagina: 152–153 controlli a 1366 e 390 px, 0 errori.

## Z2b. Build 2b — come è stata applicata (27/10/2026)

### Fatto
- Fonti: `sorgenti/guida/razze.md` (copia di `_Documenti_avventura_per_Claude/Razze.md`, estratto del Vol. 1 v2.5.1, Cap. 2), `guida/regole_collana.md` (`Regole_Collana.md`) e `guida/struttura_scheda_png.md` (`Struttura_Scheda_PNG.md`), identiche alle copie del PC. `crea_razze.py` → `razze.json`: 40 razze (tipo, taglia della struttura, movimento, sensi, 241 tratti, 324 tratti bonus o poteri e retaggi) e 18 tratti generici, con i testi del file. `divieti.json`: 21 divieti dal §9 della struttura e dalle Regole (§3–§6), ognuno con la citazione della fonte e gli esempi. `controlla_razze.py`: 1186 controlli, 0 errori (testi delle razze uguali all'estratto, citazioni presenti nelle fonti, espressioni provate con Node sugli esempi).
- Prove: `sorgenti/prove/statblock/` con i 43 stat block dei documenti d'avventura (Doc 2A, 2B, 3A, 3B, 4A, 4B) così come stanno, letti dalle tabelle dei .docx, più due sezioni intere (Doc 1 con Bevek e gli sciacalli, Doc 4B §6.2–6.3) come le dà la copia del testo; `prove/campagna_build2a.json`, salvata con il codice della Build 2a (malus, veleno, ferite gravi con emorragia e dita, combattimento in corso).
- Motore: lettura degli stat block (M3), scheda guidata (M4), segnalazioni (M6), «Copia come testo» (M7), elenchi e ricerca (M1), incontri (N), PF dei nemici (J9), ferite gravi dei nemici, tattiche (O), XP di fine combattimento (J10), esporta e importa con i mostri condivisi, migrazione. Test: 415 (307 + 108 nuovi); i 43 stat block fanno da corpus: «Copia come testo» e di nuovo «Incolla» danno gli stessi valori in tutti. Salvataggi Windows: `bestiario.json` (13 test dell'archivio).
- Pagina: schede «Bestiario», «Incontri» e «Scheda» nella terza colonna; finestre della scheda (Valori, Calcolo guidato, Tattiche e tesoro), di «Incolla», dell'incontro; avvio del combattimento da un incontro o dal bestiario; tattiche e promemoria nella barra del turno. Playwright a 1366 e 390 px: 270 controlli, 0 errori, nessun errore in console, nessuno scorrimento orizzontale.
- Sugli stat block dei documenti l'app trova 7 punti da correggere e 25 da verificare (elenco in `Schermo_build2b_segnalazioni_documenti.txt`): per esempio Leccapece (Doc 2A) CA 24 con la scomposizione che fa 22, Sirena CA 25 con 22, Bevek (Doc 1) con Competenza nelle armi esotiche.

### Scelte di applicazione (confermate da Massy il 01/11)
- **Z2b-1 Dove stanno i mostri condivisi**: in Windows `dati/bestiario.json`, accanto alle campagne, con la stessa scrittura sicura e nella copia giornaliera; nel browser e su Android l'archivio `bestiario` di IndexedDB. I PNG stanno dentro la campagna. Una campagna esportata porta con sé i mostri condivisi usati dai suoi incontri e combattimenti: importandola entrano solo quelli che mancano. «Esporta tutto» contiene anche il bestiario; il bestiario si esporta anche da solo (Bestiario → Mostri condivisi → Esporta). Importando un bestiario, un mostro con lo stesso identificativo ma cambiato entra come copia «(importato)».
- **Z2b-2 Ferite gravi anche per i nemici** (rivede Z2a-7): pulsante «Ferita grave» nelle azioni della riga; con «Scala i PF dei nemici» accesa la finestra si apre da sola quando i Punti Ferita di una creatura scendono sotto 0, con la riga già scelta. In un gruppo la creatura ferita diventa prima una riga a sé («Lupo 3»). Ferite, emorragie (tiri alla fine del turno della riga), attacco di panico, «ultimo nell'iniziativa» e morte (avviso con il 20% del Morente; «Morto» la mette fuori combattimento) funzionano come per i PG; amputazioni, dita, penalità e organo compromesso restano etichette, perché le righe dei nemici non hanno il riquadro dei valori. Finiscono con il combattimento.
- **Z2b-3 PF dei nemici (J9)**: valgono dal combattimento che parte dopo averli accesi; Fatica e Ferita vengono dalla scheda, uno per ogni creatura del gruppo; nella riga «Fatica/Ferita» per creatura; Danno e Cura nelle azioni della riga (prima i Fatica, poi i Ferita; la cura prima i Ferita). Le righe senza scheda non hanno PF.
- **Z2b-4 Due livelli nella scheda**: i valori «in linea» (quelli dello stat block, usati in gioco e da «Copia come testo») e il calcolo guidato (i dati della struttura). Con il calcolo acceso i valori calcolati riempiono la scheda e sono in sola lettura; è acceso per un PNG nuovo, spento per le schede incollate e per i mostri (si accende quando serve).
- **Z2b-5 Calcoli non scritti nella struttura**: un DV per classe (multiclasse: il primo DV pieno è quello della prima classe); GS 1/2 al 1° livello (1 con capacità o oggetto di trama); XP dalla tabella di PF1e da GS 1/8 a 25; Attacco poderoso con 1 + ⌊BAB/4⌋ gradini e il +50% a due mani per difetto, in una riga «con Attacco poderoso» sotto l'arma; Iniziativa migliorata riconosciuta dal nome del talento; la caratteristica di un'abilità dal suo nome, il +3 di classe solo con almeno un grado, la taglia su Furtività; nei TS la nota «(bonus eroico +N compreso)».
- **Z2b-6 Razza (M5)**: menu con le 40 razze di Razze.md; taglia, sensi e movimento dalla razza (modificabili); tratto bonus fra quelli della razza e i tratti generici; «Copia i tratti nella scheda». Riga «Razza:» come «Umanoide Medio (nano) · tratto bonus: … · Neutrale»; il nome della razza si aggiunge quando il sottotipo non la dice («Esterno Medio (nativo) — Aasimar»).
- **Z2b-7 Incolla**: titoli «NOME — … · GS N», «NOME · GS N» e «… · vale GS N»; il nome in maiuscolo diventa «Mortimer von Crist»; «(×N)» diventa la quantità suggerita; una classe della Collana nel titolo (o nella seconda riga) fa un PNG, altrimenti un mostro; si leggono anche i formati vecchi (DIFESE, tocco, colto in fallo, CMB/CMD, «CA = 10 + …»). Le sezioni con titoli diversi (RIDUZIONE ONTOLOGICA…) restano con il loro titolo, nello stesso punto. Le tattiche si riconoscono anche a metà riga. Un blocco finisce al blocco successivo o a un paragrafo nuovo (numeri come «6.3 —», «PROFILO», 📖 📌 🎲 ⚔ 💰 RICOMPENSE): il testo fra un blocco e l'altro non entra. La riga «💰 TESORO — da generare · …» diventa il promemoria del tesoro. Ciò che non si riconosce resta nel campo «Non riconosciuto» (esce in fondo, in «Note»). PF senza Fatica/Ferita: divisi dall'app, con l'avviso. Per ogni blocco si sceglie dove va (PNG della campagna o mostri condivisi).
- **Z2b-8 Segnalazioni (M6)**: due livelli, «da correggere» (divieti e conti sbagliati) e «da verificare» (tattiche incomplete, GS con un modello ★, BAB fuori progressione, teletrasporto, bonus eroico non indicato); non bloccano il salvataggio. Una frase che spiega la conversione («Spezzare migliorato tolto: proibito», «Morente non esiste», «il libro dice «morente»») non si segnala; «Spezzare le difese» è un talento, non la manovra. I talenti proibiti si cercano solo fra i talenti, Linguistica e Artigianato solo fra le abilità. Conti: CA = scomposizione, Fatica + Ferita = PF a metà (salvo «solo Punti Ferita»), XP della tabella, GS = livello − 1 o livello (PNG). Volo: un PNG sotto il 17° con un volo oltre 1 m e senza «eccezione» o «motivo» nella velocità.
- **Z2b-9 Copia come testo (M7)**: ordine del §10; gli XP ci sono sempre, anche per gli alleati con «(alleato: non si assegna)», come nei documenti (nell'app si vedono solo con «Usa gli XP»); le sezioni non standard escono dopo la sezione da cui venivano; il promemoria del tesoro nel formato dei documenti.
- **Z2b-10 Incontri (N)**: le cartelle sono i campi Atto e Capitolo (in ordine naturale: Cap. 2 prima di Cap. 10); partecipanti dal bestiario o liberi (nome e bonus); «Avvia» riempie il pannello «Avvio del combattimento» (i PG mettono il loro totale) invece di partire subito; il bonus d'iniziativa viene dalla scheda. I promemoria del round vanno nel log all'inizio del round e restano nella barra del turno per tutto il round. A fine combattimento l'incontro diventa «giocato» con la data del calendario (si rimette «da giocare» nella sua finestra). «Duplica» crea «(copia)», da giocare. Con gli XP: il totale dell'incontro, senza gli alleati.
- **Z2b-11 Tattiche (O)**: al round 1 «Prima del combattimento», «Round 1» e «Tratto razziale»; al 2° e al 3° «Round 2–3»; dal 4° niente di automatico; le tattiche senza un momento escono al round 1. «Finita la Fatica» dal pulsante (PF dei nemici spenti) o da sola (accesi; in un gruppo basta una creatura), e Indietro la annulla. «Fuga o resa» e «Stat block» a un clic. Cliccando una riga con scheda lo stat block va nella terza colonna (scheda «Scheda»); nelle azioni della riga c'è anche «Stat block» in una finestra, comodo sul telefono.
- **Z2b-12 XP a fine combattimento (J10, con «Usa gli XP»)**: XP delle righe con scheda messe fuori combattimento (tutto il gruppo), divisi per i PG e, a parte, contando anche gli accompagnatori; nel riepilogo e nel log.
- **Z2b-13 Indietro** non tocca PNG, mostri e incontri: le modifiche alle schede durante un combattimento restano.
- **Z2b-14 Schede**: eliminando una scheda usata in un incontro il partecipante resta con il nome, senza scheda (la conferma lo dice); «Copia in un'altra campagna» e «Copia nei Mostri/PNG» fanno copie indipendenti; «In un incontro» e «+ Al combattimento» (rinforzi) partono dalla scheda.
- **Z2b-15 Accordo del lato**: «Dita perse: 2 (mano sinistra)», «Amputazione: Gamba destra» (prima «sinistro», anche nelle campagne salvate con la 2a, corrette all'apertura).
- **Z2b-16 Condizioni in rosso nello stat block**: tutte le 37, con plurali e femminili; Morente no; «colto alla sprovvista» nella riga della CA no (è il nome del valore).
- **Z2b-17 Campagna d'esempio**: un PNG (Bandito della strada), un mostro condiviso (Lupo, PF1e) e l'incontro «Agguato sulla strada» con un promemoria al round 3, per provare.
- **Z2b-18 PNG generici condivisi** (aggiunta del 01/11): terza raccolta del bestiario, accanto ai PNG della campagna e ai mostri condivisi: PNG senza nome adatti a ogni campagna, salvati come i mostri (`bestiario.json` in Windows, IndexedDB nel browser e su Android, nella copia giornaliera). Si usano come le altre schede (incontri, avvio, rinforzi, stat block di lato); una campagna esportata porta con sé anche i PNG generici dei suoi incontri e combattimenti, «Esporta» del bestiario li comprende. Nell'«Incolla» aperto dalla scheda «PNG generici» i blocchi da PNG vanno lì per difetto.
- **Z2b-19 «+ Scheda» nella testata**: accanto a ⚙, apre «Aggiungi una scheda» con «PNG della campagna», «PNG generico condiviso», «Mostro condiviso» e «Incolla stat block…» (destinazione per blocco); dopo il salvataggio la scheda si apre di lato, nella terza colonna, senza passare dal Bestiario.
- **Z2b-20 «Copia in…»** (sostituisce «Copia nei PNG/Mostri»): copia indipendente in una delle altre due raccolte, con il nome modificabile; da un PNG generico ai PNG della campagna gli si dà il nome, il generico resta com'è. La copia si apre di lato.
- **Aggiunte del 01/11 (fatte)**: motore 419 test, archivio 13, pagina 297 controlli a 1366 e 390 px, 0 errori; artifact versione 8; commit `7858b56`.

### Non ancora attivo
Condizioni con i testi di golarion.altervista.org, Fallimenti critici, Prontuario, incontri casuali, strumenti (Build 3); finestra TV (Build 4).

## Z2c. Build 2c — come è stata applicata (01/11/2026)

### Fatto
- Fonti: `sorgenti/docx/Tabelle_Tempo_Atmosferico_v1.0.docx` (copia di `Collana/Output/`), estratto `sorgenti/guida/tempo_atmosferico.txt` (`estrai_tempo.py`: paragrafi e tabelle del Word, celle vuote comprese). `crea_meteo.py` → `meteo.json`: 17 zone in 5 gruppi (descrizione, particolarità, varianti, mare, notti fredde, legna, Foraggiare), 46 tabelle con 406 righe, Sotterraneo (8 condizioni), 33 effetti, 39 voci, durate, Predire il tempo, stato del mare, fiamme, scala del clima, regole generali, navigazione, Foraggiare, acqua, Fame e sete, Appendice B. `controlla_meteo.py` rifatto: legge il Word con python-docx (non l'estratto), 1358 controlli, 0 errori (tabelle 01–00 senza buchi e uguali al Word, ogni voce con il suo effetto, testi uguali al Word, frasi delle regole applicate dal motore); trova i guasti provocati.
- Motore: meteo AA1 (stagioni delle 17 zone, durate, ore del giorno, varianti, Sotterraneo, previsioni, stato del mare), scorte AA2 (acqua ×2/×3, pioggia, Stillicidio, neve, Foraggiare, avariato, acqua da purificare, scorte spegnibili), compagnia AA3 (accompagnatori con nome, animali, foraggio, Scegli chi esteso, alleati, XP), migrazione. Test: 540 (419 + 121 nuovi), compresa `prove/campagna_build2b.json` salvata con il codice della 2b (`crea_campagna_build2b.js`: zona desertica con la voce vecchia della tempesta, 3 accompagnatori, PNG, PNG generico e mostro condivisi, due incontri, combattimento in corso).
- Pagina: pannelli Meteo, Compagnia e Scorte nella colonna Viaggio; finestre Foraggiare, Scegli chi, Accompagnatore, Animale, Predire il tempo, Inizio della durata, Sciogli neve, Bolli, Purifica; procedura guidata con il menu delle zone, il passo «Compagnia» e il foraggio; «Usa le scorte» nelle impostazioni. Playwright a 1366 e 390 px: 365 controlli (68 nuovi), 0 errori, nessun errore in console, nessuno scorrimento orizzontale.

### Scelte di applicazione (Z2c-1…Z2c-23 confermate da Massy il 01/11)
- **Z2c-1 Alba e mezzanotte**: le durate (tempeste e piogge forti 2d4 ore, Nebbia 1d4 ore) partono dalle 06:00; «Inizio…» sposta l'ora d'inizio; una durata non va oltre la mezzanotte (il giorno dopo si tira di nuovo).
- **Z2c-2 Clima base**: prima dell'inizio e dopo la fine della durata spariscono le voci con durata; se non resta un clima entra il clima base (prima riga della tabella). «Gelo + Tempesta di grandine» → dopo la tempesta resta il Gelo; «Tempesta di vento» → Clima base.
- **Z2c-3 Canicola come l'Arsura**: vale dalle 10 alle 18, nelle altre ore Clima caldo (il Word: «Valgono gli effetti dell'Arsura», TS solo fra le 10 e le 18).
- **Z2c-4 Notti fredde** (zone 10–11): dalle 22 alle 6 sempre Clima freddo; dalle 6 alle 10 e dalle 18 alle 22 Clima caldo solo se il clima del giorno è caldo o la riga non ne indica uno (un giorno di Clima freddo resta freddo); le altre voci (Miraggi, Vento…) restano.
- **Z2c-5 Varianti**: valgono subito, anche sul meteo già tirato e sul clima base; restano salvate per zona. «Acqua dolce per pescare» è una casella della finestra di Foraggiare, salvata nella campagna.
- **Z2c-6 Testata e pannello**: la testata mostra il tempo in vigore adesso (e lo stato del mare); il pannello Meteo la riga del giorno, la riga «Ora (hh:mm)» quando è diversa e gli effetti di entrambe. Lo stato del mare segue il tempo in vigore a quell'ora.
- **Z2c-7 Sotterraneo**: scelta la zona 16 compaiono «Ritira la condizione» e «Nuova zona di gallerie» (Predire il tempo no); il meteo del giorno resta fino a «Ritira» (come Z4); «Imposta» sceglie la condizione; la condizione si tira al cambio di giorno.
- **Z2c-8 Predire il tempo**: i giorni previsti restano tirati anche se si ripete la prova (si aggiungono solo i giorni nuovi); il giorno previsto usa il tiro alla mezzanotte; «Ritira» durante il giorno tira di nuovo.
- **Z2c-9 Stillicidio**: anche al cambio di giorno l'acqua non scende (come la pioggia, senza bisogno di recipienti); in Foraggiare l'acqua «si trova senza prova».
- **Z2c-10 Modificatori di Foraggiare**: del tempo vale il più alto (+5 o +2), non si sommano fra loro; si sommano alla stagione povera. Valgono per la CD del cibo; la seconda prova dell'acqua («CD X») usa la CD della tabella.
- **Z2c-11 Pesca** dove l'acqua è «inclusa»: solo cibo, l'acqua no (serve Sopravvivenza).
- **Z2c-12 Tundra in autunno-inverno** (nota ²): acqua «solo neve», come i Ghiacci; «Sciogli neve» anche con Grotte gelate; la finestra propone il fabbisogno d'acqua del giorno.
- **Z2c-13 Cibo avariato**: 1 razione a chi fallisce di 5 o più e non trova nulla. L'acqua da purificare è una scorta sola: «Bolli» solo nella zona 4, «Purifica» ovunque.
- **Z2c-14 TS fallito per il cibo avariato o l'acqua non purificata**: l'app tira l'1d4 della Nauseato (ore) e il giorno conta senza (Fame o Sete +1 rispetto a prima del pasto), con il promemoria della prova di Costituzione dal 4°/7° giorno.
- **Z2c-15 Acqua ×2/×3**: dalla riga del giorno che finisce, anche se l'Arsura vale solo dalle 10 alle 18. L'Afa della Bonaccia «se la stagione è calda» non è automatica (la mette il GM).
- **Z2c-16 Scegli chi**: per ogni voce «niente / buona / avariata» (o «acqua da purificare»); una persona prende tutta la sua razione da una sola scorta; per i senza nome due numeri.
- **Z2c-17 Fame e Sete di accompagnatori con nome e animali**: etichette sulla voce della compagnia (non hanno il riquadro dei valori); le prove di Costituzione sono promemoria in coda.
- **Z2c-18 «+ Combattimento»**: fuori combattimento aggiunge la riga all'avvio (bordo verde, «alleato»); in combattimento entra come rinforzo. Bonus d'iniziativa e PF dalla scheda; le righe alleate non contano per gli XP.
- **Z2c-19 Togliere**: un accompagnatore o un animale si toglie con un motivo facoltativo nel log; l'animale di un accompagnatore tolto resta senza padrone.
- **Z2c-20 Scheda dell'animale**: fra mostri condivisi, PNG generici e PNG della campagna; scegliendo la scheda il nome si riempie se è vuoto.
- **Z2c-21 Foraggiare**: «+2 ore» spuntato; per difetto al foraggio la quota degli animali che mangiano foraggio e non lo trovano da sé, il resto alle razioni; con tempeste, Tormenta o Uragano in corso il pulsante è spento con il motivo.
- **Z2c-22 Campagne vecchie**: zone → 1, 10, 9; «Tempesta di polvere/sabbia» → «Tempesta di sabbia»; le alternative «A / B» del meteo vecchio restano sceglibili; gli accompagnatori diventano «senza nome»; recipienti e «Usa le scorte» accesi.
- **Z2c-23 Procedura guidata e campagna d'esempio**: zona dal menu a gruppi; passo «Compagnia» con i nomi («Nome, ruolo» uno per riga) e il numero dei senza nome; passo «Scorte» con il foraggio; «Usa le scorte» fra le impostazioni. Nella campagna d'esempio Mira (guida) e Fulmine (cavalcatura di Aria), foraggio 6.

### Aggiunta del 01/11 sera: schede e PG dalla schermata iniziale (richiesta di Massy, confermata il 01/11)
- **Z2c-24 «+ Scheda» nella schermata iniziale**: accanto a «Crea Schermo campagna»; apre «Aggiungi una scheda» con «PNG generico condiviso» e «Mostro condiviso» (valgono per tutte le campagne), «Nuovo PNG della campagna» con la campagna scelta da un menu e «Incolla stat block…» (destinazione per blocco: PNG generici, mostri condivisi o PNG della campagna scelta). Salvata la scheda si resta nella schermata iniziale.
- **Z2c-25 «+ PG» e «+ PNG» su ogni campagna dell'elenco**: aggiungono un PG (la stessa scheda di «+ PG» del Tavolo) o un PNG della campagna senza aprirla; la campagna si salva subito e la sua scheda nell'elenco mostra i conteggi aggiornati («N PG · N PNG»).
- **Z2c-26 Dove si salvano**: le schede condivise vanno nel bestiario (`bestiario.json` / IndexedDB) come dal «+ Scheda» della testata; PG e PNG della campagna nel file della campagna. Aprendo la campagna si trovano al loro posto (Tavolo e Bestiario).
- Prova: pagina 387 controlli a 1366 e 390 px (22 nuovi), 0 errori; motore 540 test invariati. Artifact versione 10.

### Non ancora attivo
Condizioni con i testi di golarion.altervista.org, Fallimenti critici, Prontuario, incontri casuali, strumenti e fonti di luce (Build 3); finestra TV (Build 4).
