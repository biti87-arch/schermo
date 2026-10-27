# Struttura della scheda PNG / Mostro — per l'app
*Campagna «Storie di criptorei» · regole della Collana · da `Guida_creazione_schede_PNG_v1.md` v1.2 (§1, §2, §8)*

Legenda: **[IN]** dato inserito · **[CALC]** calcolato dall'app · **[OPZ]** facoltativo

---

## 1. Testata
| Campo | Tipo | Note |
|---|---|---|
| nome | [IN] testo | |
| epiteto | [OPZ] testo | |
| tipo_scheda | [IN] `png` \| `mostro_pf1` | cambia le regole PF e volo (§9) |
| classi | [IN] lista {classe, livello, archetipo?} | multiclasse = somma livelli |
| livello_totale | [CALC] | somma dei livelli |
| allineamento | [IN] LB…CM | |
| divinita_fazione | [OPZ] testo | da `Divinita_Pantheon.md` |
| alleato | [IN] bool | se vero: GS sì, XP no |
| GS | [CALC] | livello − 1; = livello se `capacita_o_trama` |
| XP | [CALC] | tabella PF1e; «—» se alleato |

## 2. Razza
| Campo | Tipo | Note |
|---|---|---|
| razza | [IN] lista da `Razze.md` | mai «umano» di default |
| tiro_razza | [OPZ] testo | es. «d100 = 57 → nano (encarthan)» |
| tipo_sottotipo | [IN] testo | «Umanoide Medio (nano)» |
| taglia | [IN] `piccola` \| `media` \| `grande_speciale` | valori custom, §8 |
| tratto_bonus | [IN] testo | per nome |
| sensi | [IN] lista | scurovisione 18 m, crepuscolare, fiuto |
| tratti_razziali | [IN] lista {nome, effetto, quando_lo_usa} | |
| immunita / RE / RI | [OPZ] lista | |

## 3. Caratteristiche
`For, Des, Cos, Int, Sag, Car` → [IN] punteggio · [CALC] modificatore = ⌊(p−10)/2⌋ · [OPZ] composizione (base ± razza ± età ± avanzamento).

## 4. Difesa
| Campo | Tipo | Formula |
|---|---|---|
| armatura | [IN] {nome, base, sintonia, des_max} | |
| scudo | [IN] {nome, base, sintonia} | |
| naturale, deviazione, schivare, altri_ca | [IN] numeri | |
| bonus_eroico_ca | [CALC] | 0 fino al 9°; dal 10° = livello − 9 |
| CA | [CALC] | 10 + arm + scudo + Des(≤ des_max) + taglia + nat + dev + schiv + eroico + altri |
| CA_contatto | [CALC] | 10 + Des + taglia + dev + schiv + eroico |
| CA_sprovvista | [CALC] | 10 + arm + scudo + taglia + nat + dev + eroico |
| CA_scomposizione | [CALC] testo | «[10 + armatura 9 (corazza 7 + sintonia 2) + …]» |
| dado_vita | [IN] d6/d8/d10/d12 | |
| robustezza | [IN] bool | +1 PF/livello |
| PF_totale | [CALC] | DV pieno + media × (liv−1) + Cos × liv (+ robustezza), per difetto |
| Punti_Fatica | [CALC] | ⌊PF/2⌋ |
| Punti_Ferita | [CALC] | ⌈PF/2⌉ (dispari ai Ferita) |
| TS_base | [IN] da tabella classe | o formula di controllo |
| bonus_eroico_ts | [CALC] | +1 a 8/12/16/20 |
| Tempra / Riflessi / Volontà | [CALC] | base + mod + eroico + extra |
| TS_condizionali | [OPZ] testo | accanto, non dentro: «+2 contro veleni» |

Medie dei DV (ritiro della Collana): d6 **4** · d8 **5,5** · d10 **6,5** · d12 **8**.

## 5. Offesa
| Campo | Tipo | Formula |
|---|---|---|
| velocita | [IN] m | |
| volo | [OPZ] {m, motivo} | per i PNG solo con eccezione dichiarata |
| iniziativa | [CALC] | Des + 4 (Iniziativa migliorata) + extra |
| BAB | [IN] da tabella | controllo: veloce L · media ⌊3L/4⌋ · lenta ⌊L/2⌋ |
| attacchi_iterativi | [CALC] | a BAB +6/+11/+16, −5 ciascuno |
| BMC | [CALC] | BAB + For + taglia |
| bonus_eroico_dmc | [CALC] | come CA |
| DMC | [CALC] | 10 + BAB + For + Des + taglia + eroico |
| armi | [IN] lista {nome, tipo mischia/distanza, sintonia, danni, critico, due_mani, incremento?} | |
| colpire | [CALC] per arma | BAB + For/Des + taglia + sintonia |
| danni | [CALC] per arma | dado + For (×1,5 a due mani) + sintonia |
| attacco_poderoso | [OPZ][CALC] | −1/+2 (+50% a due mani); gradino in più a BAB 4/8/12/16/20 |
| attacchi_speciali | [OPZ] lista {nome, azione, CD, effetto} | |
| incantesimi | [OPZ] {LI, caratteristica, tier, slot[], elenco per livello} | CD = 10 + liv + mod |

## 6. Statistiche
| Campo | Tipo | Note |
|---|---|---|
| talenti | [IN] lista {nome, tipo: `liv` \| `C` \| `R`} | conteggio «N di livello + N (C) + N (R)» |
| abilita | [IN] lista {nome, gradi, di_classe, background, razziale, vari} | |
| abilita.totale | [CALC] | gradi + mod + 3 (se di classe e gradi ≥ 1) + razz + vari |
| lingue | [IN] lista | |
| qualita_speciali | [OPZ] testo | |

## 7. Equipaggiamento
| Campo | Tipo | Note |
|---|---|---|
| tetto_sintonia | [CALC] | +1 al 4°, +2 al 9°, +3 al 12°, +4 al 15°, +5 al 17° |
| sintonia_ripartizione | [IN] testo | dichiarata (arma/armatura/scudo) |
| equip_comune | [IN] lista {oggetto, prezzo} | comune e alchemico, niente magico |
| monete | [OPZ] testo | |
| capacita_o_trama | [IN] bool | vero = capacità dall'app o 🗝️ → GS +1 |
| tesoro_💰 | [OPZ] {livello, quantita, dove_chi, note} | lo genera l'app del GM |
| oggetto_trama_🗝️ | [OPZ] {nome, descr_PG, descr_GM, collegamento, impatto, sintonia A/B, stato ❓} | |

## 8. Tattiche (obbligatorie)
`prima_del_combattimento` · `round_1` · `round_2_3` · `finita_la_fatica` · `fuga_o_resa` · `tratto_razziale_usato` — tutti [IN] testo.

## 9. Varianti e vincoli
**Mostro da PF1** (`tipo_scheda = mostro_pf1`): [IN] `pf_bestiario` + `fonte` → Fatica = ⌊pf/2⌋, Ferita = ⌈pf/2⌉; volo standard ammesso; GS/XP del bestiario.

**Taglia custom**
| Taglia | CA | Colpire | BMC | DMC | Furtività |
|---|---|---|---|---|---|
| Piccola | +1 | +1 | −2 | −2 | +2 |
| Media | 0 | 0 | 0 | 0 | 0 |
| Grande speciale | −1 | −1 | +2 | +2 | −2 |

**Validazioni da bloccare o segnalare**
- talenti proibiti (Colpo vitale, Maestria in combattimento, Tiro multiplo, Competenza nelle armi esotiche, Creazione oggetto, mitici…)
- abilità inesistenti: Addestrare animali, Linguistica, Artigianato, Guarire → Professione (cerusico); Conoscenze (locali/geografia) → (generali); (piani) → (proibite)
- incantesimi inesistenti: Invisibilità, Invisibilità superiore, Evoca mostri, Evoca alleato naturale, teletrasporto a lunga distanza
- condizione «Morente»; manovre Disarmare e Spezzare
- sintonia di un oggetto oltre il tetto del livello
- volo oltre 1 m per un PNG senza motivo dichiarato
- tattiche senza `fuga_o_resa` o senza tratto razziale

## 10. Ordine di stampa (stat block in linea)
```
NOME — Classe N (archetipo) · GS N · XP N
Razza: Tipo Taglia (sottotipo) · tratto bonus: … · Allineamento
Iniziativa +X | Sensi: … | Percezione +X
── DIFESA ──  CA · scomposizione · PF (Fatica/Ferita) · TS · RD/RE/RI
── OFFESA ──  Velocità · BaB/BMC/DMC · Mischia · Distanza · Speciali · Incantesimi
── STATISTICHE ──  Caratteristiche · Talenti · Abilità · Lingue · Sintonia · Equip.
── TATTICHE ──  Prima · Round 1 · Round 2–3 · Finita la Fatica · Fuga o resa
💰 TESORO — da generare (se porta tesoro)
```
