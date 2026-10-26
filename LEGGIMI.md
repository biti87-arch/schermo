# Schermo del Narratore

Schermo del GM della Collana: campagne, PG, iniziativa, orologio e meteo, malus e bonus, veleni e malattie, ferite gravi ed emorragie. Pensato soprattutto per il PC (Windows) accanto a Foundry sulla TV; anche Android.

## Scaricare l'app
Nella pagina **Releases** del repository:
- **Android**: il file `Schermo-N.apk` (release `v1.0.N`). Scaricalo dal telefono e aprilo per installarlo.
- **Windows**: release `win-1.0.N`, versione *portatile* (doppio clic, niente installazione) o *installazione*.

Le app si ricompilano da sole a ogni aggiornamento del ramo `main`.

## Comandi
Prima di ogni `node`: `export NODE_PATH=$(npm root -g)`.
1. `python3 sorgenti/controlla_meteo.py` → controlla `sorgenti/meteo.json` sull'estratto della Guida del DM (`sorgenti/guida/`)
   `python3 sorgenti/controlla_ferite.py` → controlla `sorgenti/ferite.json` sull'estratto del Vol. 3 2.5.8, Cap. 3 (`sorgenti/guida/vol3_imprevisti.txt`)
2. `node sorgenti/test_motore.js` → test del motore (campagne, calendario, meteo, scorte, PF, iniziativa, timer, malus, veleni, ferite gravi; la campagna di `sorgenti/prove/` controlla la migrazione dalla Build 1)
3. `node sorgenti/test_archivio.js` → test dei salvataggi su file dell'app Windows
4. `python3 sorgenti/build.py [pagina_web.html]` → `www/index.html` (e, se indicata, la versione web di prova)
5. `python3 sorgenti/prova_pagina.py [cartella_screenshot]` → prova della pagina con Playwright a 1366 e 390 px

Le icone si rigenerano con `python3 sorgenti/icone.py` (Build 4).

## Salvataggi
- Windows: un file JSON per campagna nella cartella dati dell'app (`%APPDATA%/Schermo del Narratore/dati/campagne/`), scritto 1 secondo dopo ogni modifica; copia di sicurezza giornaliera in `dati/backup/` (ultime 10). Una campagna eliminata diventa `<id>.json.eliminato`.
- Android e browser: IndexedDB.
- Esporta/Importa JSON (una campagna o tutte), log in .txt.

## Decisioni di design
Vedi `Schermo_app_design_v7.md` (nel progetto della Collana; nel repo dal primo rilascio).
