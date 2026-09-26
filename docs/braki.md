# Braki i decyzje przy ekstrakcji danych

Wszystkie pliki `src/data/*.json` powstają z dwóch PDF-ów w `materialy/` skryptem
`scripts/extract/run_all.sh` (wymaga `pip install pdfplumber`); liczebność sprawdza `npm run validate-data`.

## Pola puste, bo w PDF-ie ich nie ma

- **`artworks.json` → `genre`**: pusty tam, gdzie karta w Aneksie A ma „gatunek: —” (głównie architektura,
  ale też np. Krzyk, Pocałunek, Taniec, Trwałość pamięci).
- **`periods.json` → Prehistoria**: w dziale III jest tylko wiersz osi czasu, bez rozdziału — `features`,
  `keyWorks`, `polishExamples` puste.
- **`periods.json` → Sztuka wczesnochrześcijańska, Akademizm / historyzm**: kompendium nie podaje osobnej listy
  dzieł kluczowych — `keyWorks` puste (dla akademizmu jest tylko przykład polski: Matejko).
- **Mezopotamia** (2 karty w Aneksie A) nie ma wiersza na osi czasu, więc nie jest przypisana do żadnej epoki
  z `periods.json`.

## Decyzje podjęte przy strukturyzowaniu (nie są treścią merytoryczną)

- **Fowizm** (1 karta: Matisse, Taniec) przypisany w `periods.json` do Ekspresjonizmu (pole `annexPeriods`),
  bo oś czasu nie ma osobnego wiersza dla fowizmu.
- **Harmonogram, tygodnie 1–2**: PDF podaje wspólnie „Pytania: I-01 do I-16”; podzielono po połowie
  (I-01…08 i I-09…16).
- **Harmonogram, pytania z działów III i IV**: PDF przypisuje je tematycznie („pytania o Egipcie, Grecji
  i Rzymie”, artyści tygodnia); numery dobrano według treści pytań. V-01…05 są w tygodniu 4 i ponownie w 12
  (tak jak w PDF-ie). Tydzień 6 nie ma stałej listy — to losowanie 25 pytań z działów I–III.
- **`questions.json` → `tags`**: generowane automatycznie (`scripts/extract/tags.py`) z nazw epok, artystów
  i terminów glosariusza występujących w pytaniu i w „Musi paść”. 21 pytań ogólnych (prawo autorskie,
  muzea, forma wypowiedzi) nie ma tagów.
- **`examRules.json` → `scorecard.items[].steps`**: przypisanie punktu karty oceny do kroku analizy — dodane
  na potrzeby statystyk „per krok”. Punkty 11–12 (forma wypowiedzi) nie mają kroku.
- **`glossary.json`**: definicje przepisane z działów I i V; przy „sklepieniu krzyżowo-żebrowym” rozwinięto
  skrót „jw.” do „jak sklepienie krzyżowe”.

## Kompendium i test diagnostyczny (etap 6)

- `compendium.json` — pełny tekst działów I–VIII (`scripts/extract/compendium_text.py`). Tabele w PDF-ie są
  „zebrą” (tło co drugi wiersz), więc wiersze odtwarzane są z krawędzi tła i odstępów — 10 tabel, sprawdzone
  ręcznie. Oś czasu i słownik architektoniczny renderowane są z `periods.json` / `glossary.json`.
- Pogrubienia z PDF-u są zachowane; te, które pasują do haseł glosariusza, są w czytniku klikalne.
- **Test diagnostyczny nie ma w PDF-ie klucza odpowiedzi.** Przycisk „Sprawdź” pokazuje fragment materiałów
  (glosariusz, oś czasu, karta dzieła, zdanie z kompendium lub z odpowiedzi modelowej) — punkty przyznaje się
  samodzielnie (0 / ½ / 1).

## Reprodukcje dzieł (etap 3)

- Obrazy pobierane są w czasie działania: główny obraz artykułu w pl.wikipedii → plik na Wikimedia Commons
  (fallback: wyszukiwanie w Commons). Wyświetlane są tylko pliki PD / CC0 / CC BY / CC BY-SA, z autorem pliku
  i licencją. Wynik trafia do pamięci podręcznej (IndexedDB) na 60 dni.
- Bez reprodukcji (link do Wikipedii + opis „Rozpoznasz po”): lista z instrukcji (Picasso, Dalí, Magritte,
  Warhol, Matisse, Kobro, Strzemiński, Abakanowicz, plakaty) **oraz** Pollock, Duchamp, Le Corbusier, Utzon
  (twórcy zmarli mniej niż 70 lat temu). Razem 14 kart. Lista: `src/lib/images.ts`.
- Jeśli wyszukiwanie trafi w zły plik, wpisz w `src/data/imageOverrides.json` np.
  `"stanczyk": "File:Jan Matejko-Stańczyk.jpg"` (albo `"none"`, żeby nie pokazywać obrazu).
  Poprawności dopasowań nie dało się sprawdzić automatycznie (sieć środowiska blokowała Wikipedię).
