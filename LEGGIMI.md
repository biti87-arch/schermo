# Schermo del Narratore

Schermo del GM della Collana: campagne, PG, iniziativa, orologio e meteo (Tabelle del Tempo Atmosferico v1.0: 17 zone), scorte e Foraggiare, compagnia (accompagnatori e animali), malus e bonus (con i tipi di bonus e i modelli), veleni e malattie, ferite gravi ed emorragie, condizioni con i testi completi, Fallimenti critici, bestiario e PNG (con «Incolla» degli stat block), incontri, tattiche nella barra del turno, dadi, fonti di luce, promemoria, log per sessione. Pensato soprattutto per il PC (Windows) accanto a Foundry sulla TV; anche Android.

## Scaricare l'app
Nella pagina **Releases** del repository:
- **Android**: il file `Schermo-N.apk` (release `v1.0.N`). Scaricalo dal telefono e aprilo per installarlo.
- **Windows**: release `win-1.0.N`, versione *portatile* (doppio clic, niente installazione) o *installazione*.

Le app si ricompilano da sole a ogni aggiornamento del ramo `main`.

## Comandi
Prima di ogni `node`: `export NODE_PATH=$(npm root -g)`.
1. `python3 sorgenti/estrai_tempo.py [docx]` → `sorgenti/guida/tempo_atmosferico.txt` dalle Tabelle del Tempo Atmosferico v1.0 (`sorgenti/docx/`, copia di `Collana/Output/Tabelle_Tempo_Atmosferico_v1.0.docx`)
   `python3 sorgenti/crea_meteo.py` → `sorgenti/meteo.json` (zone, stagioni, tabelle, effetti, durate, mare, fiamme, regole generali, navigazione, Foraggiare, acqua, Fame e sete)
   `python3 sorgenti/controlla_meteo.py` → controlla `meteo.json` direttamente sul Word con python-docx (tabelle 01–00 senza buchi, ogni voce con il suo effetto, testi uguali al Word)
   `python3 sorgenti/crea_ferite.py` → `sorgenti/ferite.json` (Ferite gravi, Fermare le emorragie, Amputazioni, Fallimenti critici) dall'estratto del Vol. 3 2.5.8, Cap. 3 (`sorgenti/guida/vol3_imprevisti.txt`)
   `python3 sorgenti/controlla_ferite.py` → controlla `ferite.json` sull'estratto
   `python3 sorgenti/estrai_vol1_regole.py [docx del Vol. 1]` → `sorgenti/guida/vol1_regole.txt` (tipi di bonus, condizioni ed effetti, 1 e 20, vantaggio, sanguinamento, impreparati)
   `python3 sorgenti/estrai_vol3_riparare.py [docx del Vol. 3]` → `sorgenti/guida/vol3_riparare.txt` («Riparare oggetti rotti»)
   `python3 sorgenti/crea_condizioni.py` → `sorgenti/condizioni.json` dai testi di golarion.altervista.org (`sorgenti/guida/golarion_condizioni.txt`, letto il 01/11/2026), dal Vol. 1, dal Vol. 3 e dalla Guida del DM (`sorgenti/guida/guida_dm.txt`, `pdftotext -layout`), con gli adattamenti alle regole della Collana scritti nello script
   `python3 sorgenti/controlla_condizioni.py` → controlla `condizioni.json` sulle fonti (testi integrali, adattamenti, sintesi della Guida, niente regole che nella Collana non esistono)
   `python3 sorgenti/crea_strumenti.py` → `sorgenti/strumenti.json` (fonti di luce della Guida, livelli delle Fiamme, tipi di bonus); `python3 sorgenti/controlla_strumenti.py` lo controlla sulla Guida e su `meteo.json`
   `python3 sorgenti/crea_razze.py` → `sorgenti/razze.json` dall'estratto delle razze (`sorgenti/guida/razze.md`, copia di `Razze.md`)
   `python3 sorgenti/controlla_razze.py` → controlla `razze.json` sull'estratto e `divieti.json` sulle fonti (`guida/struttura_scheda_png.md`, `guida/regole_collana.md`)
2. `node sorgenti/test_motore.js` → test del motore (campagne, calendario, meteo con durate e varianti, scorte, Foraggiare, compagnia, PF, iniziativa, timer, malus, veleni, ferite gravi, stat block, scheda guidata, segnalazioni, incontri, tattiche; condizioni, Terrore crescente, Fallimenti critici, tipi di bonus, modelli, dadi, luce, promemoria, log; le campagne di `sorgenti/prove/` controllano la migrazione dalla Build 1, dalla 2a, dalla 2b e dalla 2c, gli stat block di `sorgenti/prove/statblock/` sono quelli dei documenti d'avventura così come stanno)
3. `node sorgenti/test_archivio.js` → test dei salvataggi su file dell'app Windows
4. `python3 sorgenti/build.py [pagina_web.html]` → `www/index.html` (e, se indicata, la versione web di prova)
5. `python3 sorgenti/prova_pagina.py [cartella_screenshot]` → prova della pagina con Playwright a 1366 e 390 px

Le icone si rigenerano con `python3 sorgenti/icone.py` (Build 4).

## Salvataggi
- Windows: un file JSON per campagna nella cartella dati dell'app (`%APPDATA%/Schermo del Narratore/dati/campagne/`) e `dati/bestiario.json` con i mostri condivisi fra le campagne, scritti 1 secondo dopo ogni modifica; copia di sicurezza giornaliera in `dati/backup/` (ultime 10). Una campagna eliminata diventa `<id>.json.eliminato`.
- Android e browser: IndexedDB (archivi `campagne` e `bestiario`).
- Esporta/Importa JSON (una campagna con i mostri dei suoi incontri, tutte con il bestiario, solo il bestiario), log in .txt.

## Decisioni di design
Vedi `Schermo_app_design_v16.md` (nel progetto della Collana; nel repo dal primo rilascio).
