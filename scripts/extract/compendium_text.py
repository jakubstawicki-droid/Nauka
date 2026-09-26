"""Kompendium (działy I–VIII) → src/data/compendium.json: bloki tekstu do czytnika.
Typy bloków: h2, h3, p (z **pogrubieniami**), li, box, table, timeline, glossary."""
import json, re, sys
sys.path.insert(0, 'scripts/extract')
from pdf_lines import PROGRAM, find_page
import pdfplumber

start = find_page('Dział I · Środki wyrazu artystycznego i')
end = find_page('Aneks A · Karty dzieł')


def is_bold(font):
    return 'Bold' in font


def page_lines(p):
    """Linie strony (z **pogrubieniami**) oraz tabele. Tabele są „zebrą” (tło co drugi wiersz),
    więc odtwarzamy je same: kolumny z krawędzi komórek, wiersze z poziomych krawędzi tła i odstępów."""
    words = p.extract_words(extra_attrs=['fontname', 'size'], use_text_flow=True)
    lines = []
    for w in sorted(words, key=lambda w: (round(w['top']), w['x0'])):
        if lines and abs(lines[-1]['top'] - w['top']) < 2.5:
            lines[-1]['words'].append(w)
        else:
            lines.append(dict(top=w['top'], words=[w]))
    out = []
    for l in lines:
        ws = sorted(l['words'], key=lambda w: w['x0'])
        first = ws[0]
        plain = ' '.join(w['text'] for w in ws)
        if first['x0'] > 250 and plain.isdigit():  # numer strony
            continue
        out.append(dict(top=l['top'], bottom=max(w['bottom'] for w in ws), x=round(first['x0']), size=round(first['size'], 1),
                        font=first['fontname'].split('+')[-1], words=ws, text=markup(ws), plain=plain))

    cands = p.find_tables()
    if not cands:
        return out, []
    tables, used = [], set()
    for t in cands:
        cols = sorted({round(c[0]) for c in t.cells})
        # obszar tabeli: linie „tabelowe” (mały font, wcięte) przylegające do wykrytych fragmentów
        in_t = lambda l: l['top'] >= t.bbox[1] - 1 and l['bottom'] <= t.bbox[3] + 1
        tablish = lambda l: (l['size'] <= 8.7 and l['x'] >= 55) or (l['font'].startswith('DejaVu-Sans-Bold') and 8.0 <= l['size'] <= 8.4)
        idx = [i for i, l in enumerate(out) if in_t(l)]
        if not idx or idx[0] in used:
            continue
        a, b = idx[0], idx[-1]
        while a - 1 >= 0 and tablish(out[a - 1]) and out[a]['top'] - out[a - 1]['bottom'] < 14: a -= 1
        while b + 1 < len(out) and tablish(out[b + 1]) and out[b + 1]['top'] - out[b]['bottom'] < 14: b += 1
        region = out[a:b + 1]
        # kolejne wykryte fragmenty tej samej tabeli leżą w tym samym obszarze
        for i in range(a, b + 1): used.add(i)
        top, bottom = region[0]['top'] - 1, region[-1]['bottom'] + 1
        edges = sorted({round(r['top']) for r in p.rects if top - 2 <= r['top'] <= bottom + 2} |
                       {round(r['bottom']) for r in p.rects if top - 2 <= r['bottom'] <= bottom + 2})
        rows = []
        for l in region:
            header = l['font'].startswith('DejaVu-Sans-Bold')
            cells = [''] * len(cols)
            for w in l['words']:
                ci = max(i for i, c in enumerate(cols) if w['x0'] >= c - 3) if w['x0'] >= cols[0] - 3 else 0
                cells[ci] = (cells[ci] + ' ' + w['text']).strip()
            band = sum(1 for e in edges if e <= l['top'] + 1)
            new_row = (not rows or header != rows[-1]['header'] or band != rows[-1]['band']
                       or (l['top'] - rows[-1]['bottom'] > 6))
            if new_row:
                rows.append(dict(cells=cells, header=header, band=band, bottom=l['bottom']))
            else:
                rows[-1]['cells'] = [(x + ' ' + y).strip() if y else x for x, y in zip(rows[-1]['cells'], cells)]
                rows[-1]['bottom'] = l['bottom']
        tables.append(dict(top=region[0]['top'], first=a, last=b, header=[c for c in rows[0]['cells']] if rows[0]['header'] else None,
                           rows=[r['cells'] for r in rows if not r['header']], atTop=a == 0))
    # linie należące do tabel wycinamy z tekstu
    skip = set()
    for t in tables: skip |= set(range(t['first'], t['last'] + 1))
    return [l for i, l in enumerate(out) if i not in skip], tables


def markup(ws):
    text, bold_open = '', False
    for w in ws:
        b = is_bold(w['fontname'].split('+')[-1])
        if b and not bold_open: text += (' ' if text else '') + '**' + w['text']; bold_open = True
        elif not b and bold_open: text += '** ' + w['text']; bold_open = False
        else: text += (' ' if text else '') + w['text']
    return text + ('**' if bold_open else '')


def join(a, b):
    if a.endswith('-') and len(a) > 1 and a[-2].isalpha(): return a + b
    return a + ' ' + b


def tidy(s):
    s = re.sub(r'\*\*\s*\*\*', ' ', s)          # sklejone pogrubienia
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s+([,.;:)!?])', r'\1', s)       # spacja przed interpunkcją (z podziału słów na fonty)
    s = re.sub(r'\(\s+', '(', s)
    s = re.sub(r'\*\*\s+([,.;:)])', r'**\1', s)
    return s


sections, cur, blocks = [], None, None
mode = None  # 'glossary' — pomijanie dwukolumnowego słownika, 'timeline' — tabela osi czasu
pending = None  # otwarty blok tekstowy (p / li / box)
prev_bottom = None


def flush():
    global pending
    if pending:
        pending['text'] = tidy(pending['text'])
        if pending['type'] == 'box': pending['title'] = pending['title'].strip()
        blocks.append(pending)
    pending = None


with pdfplumber.open(PROGRAM) as pdf:
    for pn in range(start, end):
        lines, tables = page_lines(pdf.pages[pn])
        # tabele wstawiamy w miejscu ich pozycji na stronie
        items = [('line', l['top'], l) for l in lines] + [('table', t['top'], t) for t in tables]
        items.sort(key=lambda x: x[1])
        prev_bottom = None
        for kind, _, it in items:
            if kind == 'table':
                flush()
                if mode == 'timeline':
                    continue
                last = blocks[-1] if blocks else None
                # tabela przełamana na dwie strony — doklej wiersze
                if it['atTop'] and not it['header'] and last and last['type'] == 'table' and len(last['rows'][0]) == len(it['rows'][0]):
                    last['rows'] += it['rows']
                else:
                    blocks.append(dict(type='table', header=it['header'], rows=it['rows']))
                continue
            l = it
            size, font, text, plain, x = l['size'], l['font'], l['text'], l['plain'], l['x']
            gap = (l['top'] - prev_bottom) if prev_bottom is not None else 99
            prev_bottom = l['bottom']
            if is_bold(font) and size >= 19:  # tytuł działu (może mieć 2 linie)
                m = re.match(r'^Dział ([IVX]+) · (.*)$', plain)
                flush()
                if m:
                    cur = dict(code=m.group(1), title=m.group(2), blocks=[]); sections.append(cur); blocks = cur['blocks']; mode = None
                else:
                    cur['title'] += ' ' + plain
                continue
            if cur is None:
                continue
            if plain.startswith('Słownik terminów architektonicznych'):
                flush(); blocks.append(dict(type='h3', text=plain)); blocks.append(dict(type='glossary', topic='słownik architektoniczny')); mode = 'glossary'; continue
            if is_bold(font) and size >= 12.5:
                flush(); mode = None
                if blocks and blocks[-1]['type'] == 'h2' and gap < 6: blocks[-1]['text'] += ' ' + plain
                else: blocks.append(dict(type='h2', text=plain))
                continue
            if is_bold(font) and 9.5 <= size <= 11.5 and font.startswith('DejaVu-Sans'):
                flush()
                if plain.startswith('Słownik terminów architektonicznych'):
                    blocks.append(dict(type='h3', text=plain)); blocks.append(dict(type='glossary', topic='słownik architektoniczny')); mode = 'glossary'; continue
                if plain.startswith('Oś czasu'):
                    blocks.append(dict(type='h3', text=plain)); blocks.append(dict(type='timeline')); mode = 'timeline'; continue
                if blocks and blocks[-1]['type'] == 'h3' and gap < 6: blocks[-1]['text'] += ' ' + plain
                else: blocks.append(dict(type='h3', text=plain))
                mode = None
                continue
            if mode == 'glossary':
                continue
            if is_bold(font) and size < 8.5 and font.startswith('DejaVu-Sans') and x >= 60 and plain.isupper():
                flush(); pending = dict(type='box', title=plain, text=''); continue
            if pending and pending['type'] == 'box' and x >= 60 and not plain.startswith('•'):
                pending['text'] = join(pending['text'], text) if pending['text'] else text; continue
            if plain.startswith('•') or plain.startswith('☐'):
                if pending and pending['type'] == 'box':
                    pending.setdefault('items', []).append(text.lstrip('•☐ ').strip()); continue
                flush(); pending = dict(type='li', text=text.lstrip('•☐ ').strip()); continue
            if pending and pending['type'] == 'box' and pending.get('items') and x >= 60:
                pending['items'][-1] = join(pending['items'][-1], text); continue
            if pending and pending['type'] == 'li' and x > 60 and gap < 8:
                pending['text'] = join(pending['text'], text); continue
            small = size < 9.5
            if pending and pending['type'] == 'p' and gap < 8 and pending.get('small', False) == small:
                pending['text'] = join(pending['text'], text); continue
            flush(); pending = dict(type='p', text=text)
            if small: pending['small'] = True
        flush()

for s in sections:
    for b in s['blocks']:
        if b['type'] == 'box' and 'items' in b:
            b['items'] = [tidy(i) for i in b['items']]
        if b['type'] == 'table':
            b['rows'] = [[tidy(c) for c in r] for r in b['rows']]
            if b['header'] is None: b.pop('header')
    # tabela osi czasu → interaktywna oś (dane w periods.json)
    s['blocks'] = [dict(type='timeline') if b['type'] == 'table' and (b.get('header') or [''])[0].startswith('Epoka') else b for b in s['blocks']]
json.dump(sections, open('src/data/compendium.json', 'w'), ensure_ascii=False, indent=1)
open('src/data/compendium.json', 'a').write('\n')
from collections import Counter
for s in sections:
    print(s['code'], s['title'], dict(Counter(b['type'] for b in s['blocks'])))
