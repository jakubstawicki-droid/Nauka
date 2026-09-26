"""Dokłada do questions.json tagi: epoki, artystów i pojęcia z glosariusza występujące w pytaniu i punktach kluczowych."""
import json, re

Q = json.load(open('src/data/questions.json'))
glossary = json.load(open('src/data/glossary.json'))

PERIODS = {
    'Prehistoria': [r'prehistor', r'paleoli', r'jaskin'],
    'Starożytny Egipt': [r'egip'],
    'Starożytna Grecja': [r'grec', r'greck', r'helleni'],
    'Starożytny Rzym': [r'rzym'],
    'Sztuka wczesnochrześcijańska': [r'wczesnochrześcija'],
    'Bizancjum': [r'bizan'],
    'Romanizm': [r'romańsk', r'romanizm'],
    'Gotyk': [r'gotyk', r'gotyc'],
    'Renesans': [r'renesans'],
    'Manieryzm': [r'manieryzm', r'manierys'],
    'Barok': [r'barok'],
    'Rokoko': [r'rokok'],
    'Klasycyzm': [r'klasycyzm', r'klasycys'],
    'Romantyzm': [r'romantyzm', r'romantycz'],
    'Realizm': [r'realizm', r'realist'],
    'Akademizm / historyzm': [r'akademizm', r'akademick', r'historyzm'],
    'Impresjonizm': [r'impresjoni'],
    'Postimpresjonizm': [r'postimpresjoni', r'pointyli'],
    'Symbolizm': [r'symbolizm', r'symbolist'],
    'Secesja': [r'secesj', r'młod\w* polsk'],
    'Ekspresjonizm': [r'ekspresjoni'],
    'Kubizm': [r'kubi[zs]'],
    'Abstrakcjonizm': [r'abstrak'],
    'Surrealizm': [r'surreali'],
    'Pop-art, minimalizm, konceptualizm': [r'pop-art', r'minimali', r'konceptual'],
}
ARTISTS = {
    'Jan Matejko': r'matejk', 'Stanisław Wyspiański': r'wyspiańsk', 'Salvador Dalí': r'dal(í|i)(ego|m)?\b',
    'Pablo Picasso': r'picass', 'Leonardo da Vinci': r'leonard', 'Michał Anioł': r'michał\w* anio',
    'Rembrandt': r'rembrandt', 'Vincent van Gogh': r'gogh', 'Claude Monet': r'monet', 'Auguste Rodin': r'rodin',
    'Józef Chełmoński': r'chełmońsk', 'Jacek Malczewski': r'malczewsk', 'Olga Boznańska': r'boznańsk',
    'Magdalena Abakanowicz': r'abakanowicz', 'Władysław Strzemiński': r'strzemińsk', 'Katarzyna Kobro': r'kobro',
    'Caravaggio': r'caravaggi', 'Wit Stwosz': r'stwosz', 'Georges Seurat': r'seurat', 'Edvard Munch': r'munch',
    'Piet Mondrian': r'mondrian', 'Wassily Kandinsky': r'kandinsk', 'Kazimierz Malewicz': r'malewicz',
    'Andy Warhol': r'warhol', 'Gustav Klimt': r'klimt', 'Antoni Gaudí': r'gaud(í|i)', 'Jan Vermeer': r'vermeer',
    'Diego Velázquez': r'vel[aá]zquez', 'Peter Paul Rubens': r'rubens', 'Gian Lorenzo Bernini': r'bernini',
    'Sandro Botticelli': r'botticell', 'Rafael Santi': r'\brafael', 'Eugène Delacroix': r'delacroix',
    'Gustave Courbet': r'courbet', 'Francisco Goya': r'\bgoy', 'Paul Cézanne': r'c[ée]zanne', 'Paul Gauguin': r'gauguin',
    'Marcel Duchamp': r'duchamp', 'René Magritte': r'magritte', 'Jackson Pollock': r'pollock',
    'Stanisław Witkiewicz': r'witkiewicz', 'Józef Mehoffer': r'mehoffer', 'Władysław Podkowiński': r'podkowińsk',
    'Aleksander Gierymski': r'gierymsk', 'Filippo Brunelleschi': r'brunelleschi', 'Andrea Palladio': r'palladi',
    'Canaletto': r'canalett', 'Fidiasz': r'fidiasz', 'Poliklet': r'poliklet', 'Jacques-Louis David': r'jacques-louis david',
    'Tadeusz Kantor': r'kantor', 'Henri de Toulouse-Lautrec': r'toulouse', 'Edgar Degas': r'degas', 'El Greco': r'el greco',
    'Caspar David Friedrich': r'friedrich', 'Jan van Eyck': r'van eyck', 'Albrecht Dürer': r'd[üu]rer',
}


def stem(w):
    # rdzeń wyrazu: bez końcowej samogłoski (odmiana), a przy -ń/-ć bez ostatniej litery
    if len(w) > 4 and w[-1] in 'aąeęioóuy':
        return re.escape(w[:-1])
    if len(w) > 4 and w[-1] in 'ńć':
        return re.escape(w[:-1])
    return re.escape(w) + (r'\w*' if len(w) > 4 else r'\b')


TERMS = {}
for t in glossary:
    term = t['term']
    base = re.sub(r'\s*\(.*?\)', '', term).split(' / ')[0].strip()
    words = base.lower().split()
    if len(words) > 3:
        continue
    TERMS[base] = r'\b' + r'\w*\s+'.join(stem(w) for w in words)

for q in Q:
    text = ' '.join([q['question']] + q['keyPoints']).lower()
    tags = []
    for name, pats in PERIODS.items():
        if any(re.search(p, text) for p in pats):
            tags.append(name)
    for name, p in ARTISTS.items():
        if re.search(p, text):
            tags.append(name)
    for name, p in TERMS.items():
        if re.search(p, text) and name not in tags:
            tags.append(name)
    if 'Postimpresjonizm' in tags and not re.search(r'(?<!post)impresjoni', text):
        tags.remove('Impresjonizm') if 'Impresjonizm' in tags else None
    q['tags'] = tags

json.dump(Q, open('src/data/questions.json', 'w'), ensure_ascii=False, indent=2)
open('src/data/questions.json', 'a').write('\n')
print(sum(1 for q in Q if not q['tags']), 'pytań bez tagów')
for q in Q[::15]:
    print(q['id'], q['tags'])
