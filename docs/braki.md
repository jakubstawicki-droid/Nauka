# Braki w danych

Stan: wczytany jest tylko `materialy/Analiza dzieła sztuki.pdf`.
Brakuje pliku **`Program przygotowawczy - egzamin ustny LSP Gersona.pdf`**, więc poniższe dane są puste
(celowo — treści merytorycznych nie uzupełniamy z głowy).

| Plik | Czego brakuje | Źródło w programie |
|---|---|---|
| `questions.json` | 150 pytań z modelowymi odpowiedziami | Aneks B |
| `artworks.json` | 110 kart dzieł | Aneks A |
| `glossary.json` | terminy (środki wyrazu, kompozycja, perspektywa, barwy, techniki) + słownik architektoniczny | działy I i V |
| `periods.json` | oś czasu epok | dział III |
| `diagnostic.json` | test diagnostyczny A–E (30 pkt) + interpretacja | test diagnostyczny |
| `schedule.json` | harmonogram tygodni 1–14 | harmonogram |
| `examRules.json` → `rules` | 10 zasad egzaminu | dział VIII |

## Uzupełnione z „Analizy dzieła sztuki”

- `analysisSteps.json` — 9 kroków (cel, czas, pytania pomocnicze, zwroty, najczęstszy błąd)
- `modelAnalyses.json` — 5 analiz wzorcowych rozbitych na kroki (Caravaggio, Matejko, Michał Anioł, Notre-Dame, Mondrian)
- `signals.json` — 18 sygnałów rozpoznawczych epok
- `examRules.json` — 8 najczęstszych błędów, karta oceny (12 punktów), rada o informacji zwrotnej
- `analysisGuide.json` — zasada trzech ruchów, czas wypowiedzi, postępowanie z dziełem nieznanym, plan treningu analizy

## Uwagi

- Pole `steps` w karcie oceny (`examRules.json`) to przypisanie punktu karty do kroku analizy — dodane na potrzeby
  statystyk „per krok”, nie pochodzi z PDF-u. Punkty 11–12 (forma wypowiedzi) nie mają kroku.
