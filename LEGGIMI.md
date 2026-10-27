# Schermo del Narratore

Schermo del GM della Collana: campagne, PG, iniziativa, orologio e meteo, malus e bonus, veleni e malattie, ferite gravi ed emorragie, bestiario e PNG (con «Incolla» degli stat block), incontri, tattiche nella barra del turno. Pensato soprattutto per il PC (Windows) accanto a Foundry sulla TV; anche Android.

## Scaricare l'app
Nella pagina **Releases** del repository:
- **Android**: il file `Schermo-N.apk` (release `v1.0.N`). Scaricalo dal telefono e aprilo per installarlo.
- **Windows**: release `win-1.0.N`, versione *portatile* (doppio clic, niente installazione) o *installazione*.

Le app si ricompilano da sole a ogni aggiornamento del ramo `main`.

## Comandi
Prima di ogni `node`: `export NODE_PATH=$(npm root -g)`.
1. `python3 sorgenti/controlla_meteo.py` → controlla `sorgenti/meteo.json` sull'estratto della Guida del DM (`sorgenti/guida/`)
   `python3 sorgenti/controlla_ferite.py` → controlla `sorgenti/ferite.json` sull'estratto del Vol. 3 2.5.8, Cap. 3 (`sorgenti/guida/vol3_imprevisti.txt`)
   `python3 sorgenti/crea_razze.py` → `sorgenti/razze.json` dall'estratto delle razze (`sorgenti/guida/razze.md`, copia di `Razze.md`)
   `python3 sorgenti/controlla_razze.py` → controlla `razze.json` sull'estratto e `divieti.json` sulle fonti (`guida/struttura_scheda_png.md`, `guida/regole_collana.md`)
2. `node sorgenti/test_motore.js` → test del motore (campagne, calendario, meteo, scorte, PF, iniziativa, timer, malus, veleni, ferite gravi, stat block, scheda guidata, segnalazioni, incontri, tattiche; le campagne di `sorgenti/prove/` controllano la migrazione dalla Build 1 e dalla 2a, gli stat block di `sorgenti/prove/statblock/` sono quelli dei documenti d'avventura così come stanno)
3. `node sorgenti/test_archivio.js` → test dei salvataggi su file dell'app Windows
4. `python3 sorgenti/build.py [pagina_web.html]` → `www/index.html` (e, se indicata, la versione web di prova)
5. `python3 sorgenti/prova_pagina.py [cartella_screenshot]` → prova della pagina con Playwright a 1366 e 390 px

Le icone si rigenerano con `python3 sorgenti/icone.py` (Build 4).

## Salvataggi
- Windows: un file JSON per campagna nella cartella dati dell'app (`%APPDATA%/Schermo del Narratore/dati/campagne/`) e `dati/bestiario.json` con i mostri condivisi fra le campagne, scritti 1 secondo dopo ogni modifica; copia di sicurezza giornaliera in `dati/backup/` (ultime 10). Una campagna eliminata diventa `<id>.json.eliminato`.
- Android e browser: IndexedDB (archivi `campagne` e `bestiario`).
- Esporta/Importa JSON (una campagna con i mostri dei suoi incontri, tutte con il bestiario, solo il bestiario), log in .txt.

## Decisioni di design
Vedi `Schermo_app_design_v9.md` (nel progetto della Collana; nel repo dal primo rilascio).
