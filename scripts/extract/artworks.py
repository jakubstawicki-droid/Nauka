"""Aneks A → src/data/artworks.json"""
import json, re, sys, unicodedata
sys.path.insert(0, 'scripts/extract')
from pdf_lines import lines, join, find_page

a = find_page('Aneks A · Karty dzieł')
b = find_page('Aneks B · 150 pytań')
L = lines(first=a, last=b)


def kind(l):
    f, s = l['font'], l['size']
    if 'Bold' in f and s >= 12.5: return 'period'
    if 'Bold' in f and 9.0 <= s <= 9.6: return 'title'
    if 'Italic' in f: return 'recognize'
    if l['text'].startswith('Pytanie:') and 'Bold' in f: return 'question'
    if f.startswith('DejaVu-Sans') and s == 8.6: return 'artist'
    if f.startswith('DejaVu-Sans') and s == 7.9: return 'meta'
    if f.startswith('DejaVu-Sans') and s <= 8.4: return 'question+'
    if f.startswith('DejaVu-Serif') and l['x'] >= 63: return 'feature'
    if f.startswith('DejaVu-Serif'): return 'sig'
    return '?'


def slug(s):
    s = unicodedata.normalize('NFKD', s.replace('ł', 'l').replace('Ł', 'L'))
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:60].strip('-')


def image_query(title, artist):
    t = re.sub(r'\s*\(.*?\)', '', title).strip()
    simple = artist and not artist.startswith('nieznany') and not re.search(r'[(;:]', artist) and len(artist) < 40
    return f'{t} {artist}' if simple else t


cards, cur, period = [], None, None
started = False
for l in L:
    k = kind(l)
    if k == 'period':
        if l['text'].startswith('Aneks A'): continue
        period = l['text']; started = True; continue
    if not started: continue
    if k == 'title':
        if cur and cur['_last'] == 'title':
            cur['title'].append(l['text']); continue
        cur = dict(period=period, title=[l['text']], artist=[], meta=[], recognize=[], features=[], sig=[], question=[], _last='title')
        cards.append(cur); continue
    if k == 'question+': k = 'question'
    if k == 'feature':
        if l['text'].startswith('•'): cur['features'].append([l['text'][1:].strip()])
        else: cur['features'][-1].append(l['text'])
    elif k in cur:
        cur[k].append(l['text'])
    else:
        raise SystemExit(f'nieznana linia s.{l["page"]}: {l}')
    cur['_last'] = k

out = []
for c in cards:
    title = join(c['title'])
    ap = [p.strip() for p in join(c['artist']).split(' · ')]
    pl = ap[-1] == 'PL'
    if pl: ap = ap[:-1]
    artist, date = ' · '.join(ap[:-1]), ap[-1]
    mp = [p.strip() for p in join(c['meta']).split(' · ')]
    gi = next(i for i, p in enumerate(mp) if p.startswith('gatunek:'))
    genre = mp[gi][len('gatunek:'):].strip()
    rec = join(c['recognize']); assert rec.startswith('Rozpoznasz po:'), title
    q = join(c['question']); assert q.startswith('Pytanie:'), title
    out.append(dict(
        id=slug(title), title=title, artist=artist or 'nieznany', date=date, period=c['period'],
        domain=mp[0], technique=' · '.join(mp[1:gi]), genre='' if genre in ('—', '-') else genre,
        location=' · '.join(mp[gi + 1:]), isPolish=pl,
        recognizeBy=rec[len('Rozpoznasz po:'):].strip(),
        features=[join(f) for f in c['features']], significance=join(c['sig']),
        question=q[len('Pytanie:'):].strip(),
        imageQuery=image_query(title, artist),
    ))

ids = [o['id'] for o in out]
dups = {i for i in ids if ids.count(i) > 1}
for o in out:
    if o['id'] in dups: o['id'] = f"{o['id']}-{slug(o['artist'])[:20]}"
json.dump(out, open('src/data/artworks.json', 'w'), ensure_ascii=False, indent=2)
open('src/data/artworks.json', 'a').write('\n')
print(len(out), 'kart;', sum(o['isPolish'] for o in out), 'PL')
from collections import Counter
print(Counter(o['period'] for o in out))
