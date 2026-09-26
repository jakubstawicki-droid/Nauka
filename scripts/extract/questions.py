"""Aneks B → src/data/questions.json (bez tagów — tagi dokłada tags.py)"""
import json, re, sys
sys.path.insert(0, 'scripts/extract')
from pdf_lines import lines, join, find_page

b = find_page('Aneks B · 150 pytań')
L = lines(first=b)
QID = re.compile(r'^([IVX]+)-(\d{2})\.\s*(.*)$')

out, cur, section, stitle, field = [], None, None, None, None
for l in L:
    t, f, s = l['text'], l['font'], l['size']
    bold = 'Bold' in f
    if bold and s >= 12.5:
        if t.startswith('Aneks B') or t == 'odpowiedziami':
            continue
        m = re.match(r'^Dział ([IVX]+) · (.*)$', t)
        if m:
            section, stitle = m.group(1), m.group(2); field = 'sectionTitle'
        elif field == 'sectionTitle':
            stitle += ' ' + t
        continue
    if bold and 9.0 <= s <= 9.6:
        m = QID.match(t)
        if m:
            cur = dict(id=f'{m.group(1)}-{m.group(2)}', section=section, sectionTitle=stitle,
                       question=[m.group(3)], modelAnswer=[], keyPoints=[], followUp=[], commonMistake=[])
            out.append(cur); field = 'question'
        else:
            cur[field].append(t)
        continue
    if cur is None:
        continue
    if bold and t.startswith('Musi paść:'):
        field = 'keyPoints'; cur[field].append(t[len('Musi paść:'):]); continue
    if bold and t.startswith('Dodatkowo:'):
        field = 'followUp'; cur[field].append(t[len('Dodatkowo:'):]); continue
    if bold and t.startswith('Uwaga:'):
        field = 'commonMistake'; cur[field].append(t[len('Uwaga:'):]); continue
    if f.startswith('DejaVu-Serif') and s >= 9.0 and field == 'question':
        field = 'modelAnswer'
    if field in ('sectionTitle', None):
        continue
    cur[field].append(t)

for q in out:
    for k in ('question', 'modelAnswer', 'followUp', 'commonMistake'):
        q[k] = join(q[k])
    q['keyPoints'] = [p.strip() for p in join(q['keyPoints']).split(' · ') if p.strip()]
    q['tags'] = []
json.dump(out, open('src/data/questions.json', 'w'), ensure_ascii=False, indent=2)
open('src/data/questions.json', 'a').write('\n')
from collections import Counter
print(len(out), Counter(q['section'] for q in out))
print({q['section']: q['sectionTitle'] for q in out})
