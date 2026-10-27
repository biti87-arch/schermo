"""Crea sorgenti/razze.json dall'estratto delle razze (sorgenti/guida/razze.md, copia di
_Documenti_avventura_per_Claude/Razze.md: Vol. 1 «Regole e Razze», Capitolo 2), senza cambiare i testi.
Uso: python3 sorgenti/crea_razze.py   (poi python3 sorgenti/controlla_razze.py)"""
import json, os, re
R = os.path.dirname(os.path.abspath(__file__))
TESTO = open(os.path.join(R, 'guida', 'razze.md'), encoding='utf8').read()
DATI = {'Tipo', 'Taglia', 'Movimento', 'Caratteristiche', 'Linguaggi iniziali', 'Altezza, peso ed età'}
SENSI = [('Scurovisione', r'entro (\d+ m)'), ('Visione crepuscolare', None), ('Fiuto', None), ('Percezione cieca', r'entro (\d+ m)'),
         ('Percezione tellurica', r'entro (\d+ m)'), ('Vista acuta', None)]

def taglia(t):
    t = t.lower()
    if t.startswith('piccola'): return 'piccola'
    if t.startswith('grande speciale'): return 'grande_speciale'
    if t.startswith('media'): return 'media'
    raise ValueError('taglia sconosciuta: ' + t)

def tipo_scheda(tipo, tg):
    """«umanoide con sottotipo nano.» + media → «Umanoide Medio (nano)» (formato della riga «Razza:» dello stat block)"""
    t = tipo.rstrip('.')
    base = re.split(r' con sottotipo ', t)[0]
    sotto = re.findall(r'sottotipo (\w[\w-]*)', t)
    tl = {'piccola': 'Piccolo', 'media': 'Medio', 'grande_speciale': 'Grande'}[tg]
    return f'{base[0].upper()}{base[1:]} {tl}' + (f' ({", ".join(sotto)})' if sotto else '')

def voce(par):
    """**Nome** *descrizione* testo  ·  **01 – Nome (Sop)** testo"""
    m = re.match(r'^\*\*([^*]+)\*\*\s*(.*)$', par, re.S)
    nome, resto = m.group(1).strip(), m.group(2).strip()
    d = re.match(r'^\*([^*]+)\*\s*(.*)$', resto, re.S)
    return {'nome': nome, 'descrizione': d.group(1).strip() if d else '', 'testo': (d.group(2) if d else resto).strip()}

razze, generici = [], None
for blocco in re.split(r'^## ', TESTO, flags=re.M)[1:]:
    righe = blocco.split('\n')
    nome = righe[0].strip()
    pars = [p.strip() for p in '\n'.join(righe[1:]).split('\n\n') if p.strip()]
    if nome == 'Tratti razziali generici':
        generici = {'intro': pars[0], 'voci': [voce(p) for p in pars[1:] if p.startswith('**')]}
        continue
    r = {'nome': nome, 'descrizione': pars[0].strip('*') if pars[0].startswith('*') else '', 'dati': {}, 'tratti': [], 'opzioni': None}
    for p in pars[1:]:
        solo = re.match(r'^\*\*([^*]+)\*\*$', p)
        if solo:                                     # inizio dei tratti bonus (o poteri vampirici, retaggi…)
            r['opzioni'] = {'titolo': solo.group(1), 'intro': '', 'voci': []}; continue
        if r['opzioni'] is not None:
            if p.startswith('**'): r['opzioni']['voci'].append(voce(p))
            else: r['opzioni']['intro'] = (r['opzioni']['intro'] + '\n\n' + p).strip()
            continue
        m = re.match(r'^\*\*([^*:]+):\s*([^*]*)\*\*\s*(.*)$', p, re.S)
        if not m: raise ValueError(f'{nome}: paragrafo non riconosciuto: {p[:60]}')
        k, v = m.group(1).strip(), (m.group(2) + ' ' + m.group(3)).strip() if m.group(2) else m.group(3).strip()
        if k in DATI: r['dati'][k] = v
        else: r['tratti'].append({'nome': k, 'testo': v})
    d = r['dati']
    r['tipo'] = d['Tipo'].rstrip('.')
    r['taglia'] = taglia(d['Taglia'])
    r['tipo_scheda'] = tipo_scheda(d['Tipo'], r['taglia'])
    r['movimento'] = re.match(r'([\d,]+ m)', d['Movimento']).group(1)
    sensi = []
    for s, rx in SENSI:
        t = next((x for x in r['tratti'] if x['nome'] == s), None)
        if t:
            m = re.search(rx, t['testo']) if rx else None
            sensi.append(s.lower() + (' ' + m.group(1) if m else '') if s != 'Scurovisione' else 'scurovisione ' + (m.group(1) if m else ''))
    r['sensi'] = [x.strip() for x in sensi]
    razze.append(r)

out = {'fonte': 'Razze.md (Vol. 1 «Regole e Razze» v2.5.1, Capitolo 2), copia in sorgenti/guida/razze.md',
       'razze': razze, 'generici': generici}
open(os.path.join(R, 'razze.json'), 'w', encoding='utf8').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
print(f'razze {len(razze)}, tratti {sum(len(r["tratti"]) for r in razze)}, opzioni {sum(len(r["opzioni"]["voci"]) for r in razze)}, generici {len(generici["voci"])}')
