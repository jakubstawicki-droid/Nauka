# Historia sztuki — egzamin ustny LSP Gersona

Aplikacja do nauki na egzamin ustny z historii sztuki do Liceum Sztuk Plastycznych im. Wojciecha Gersona
w Warszawie. Działa w przeglądarce i offline, da się ją zainstalować na ekranie głównym telefonu.
Nie ma serwera ani kont — cały postęp zostaje na urządzeniu.

Treść merytoryczna pochodzi wyłącznie z dwóch PDF-ów w `materialy/`:
**Program przygotowawczy** (kompendium, 150 pytań, 110 kart dzieł, test, harmonogram)
i **Analiza dzieła sztuki** (9 kroków, 5 analiz wzorcowych, sygnały epok, karta oceny).

## Co jest w środku

| Ekran | Co robi |
|---|---|
| **Dziś** | kolejka powtórek na dziś, seria dni nauki (2 dni wolne jej nie przerywają), zadania tygodnia, przypomnienia (muzeum — pkt VI.3, test diagnostyczny) |
| **Pytania** | 150 pytań: odpowiedź na głos (z nagraniem) → modelowa odpowiedź → checklista „Musi paść” → ocena dla algorytmu powtórek |
| **Dzieła** | 110 fiszek z reprodukcjami: rozpoznaj → autor → epoka → 3 cechy; filtry; tryb szybki 5 s |
| **Trening** | 10 quizów, trener analizy dzieła (9 kroków, 2–4 min, karta oceny, analizy wzorcowe), egzamin próbny (3 pytania, 3 min przygotowania), tryb mieszany |
| **Więcej** | harmonogram 14 tygodni, kompendium z klikalnymi terminami i osią czasu, statystyki i słabe punkty, test diagnostyczny, nagrania, ustawienia (daty, limity, kopia zapasowa) |

Techniki nauki: aktywne przypominanie, powtórki rozłożone w czasie (FSRS, `ts-fsrs`), samoocena
z checklisty, mówienie na głos, przeplatanie tematów, pytania „dlaczego?”, obraz + słowo — opisane
w aplikacji na ekranie „Jak się uczyć”.

## Uruchomienie lokalnie

Wymagany Node.js 20+ (testowane na 22).

```bash
npm install
npm run dev          # serwer deweloperski: http://localhost:5173
npm test             # testy (Vitest)
npm run build        # walidacja danych + typecheck + build do dist/
npm run preview      # podgląd zbudowanej wersji (z service workerem)
```

## Dane

Wszystkie pliki `src/data/*.json` są generowane z PDF-ów — nie edytuj ich ręcznie (poza
`imageOverrides.json`).

```bash
pip install pdfplumber
./scripts/extract/run_all.sh     # PDF-y → src/data/*.json
npm run validate-data            # sprawdza liczebność: 150 pytań (I=32 … VIII=6), 110 kart, 9 kroków…
```

Czego brakuje w PDF-ach i jakie decyzje podjęto przy strukturyzowaniu danych: [`docs/braki.md`](docs/braki.md).

### Reprodukcje dzieł

Obrazy **nie są w repozytorium**. Aplikacja pobiera je w trakcie działania z polskiej Wikipedii /
Wikimedia Commons i pokazuje tylko pliki w domenie publicznej lub na wolnej licencji (CC0, CC BY, CC BY-SA),
zawsze z autorem pliku i licencją. Dzieła wciąż chronione prawem autorskim (m.in. Picasso, Dalí, Magritte,
Warhol, Matisse, Kobro, Strzemiński, Abakanowicz, plakaty) nie mają obrazu — zamiast niego jest link do
Wikipedii i opis „Rozpoznasz po”. Lista: `src/lib/images.ts`.

Jeśli karta pokazuje zły obraz, wpisz poprawny plik w `src/data/imageOverrides.json`:

```json
{ "stanczyk": "File:Jan Matejko, Stańczyk.jpg", "jakies-dzielo": "none" }
```

## Wdrożenie

### GitHub Pages (skonfigurowane)

Workflow `.github/workflows/deploy.yml` przy każdym pushu na `main` (i na gałąź roboczą) instaluje
zależności, uruchamia testy, buduje aplikację i publikuje `dist/`.

Jednorazowo w repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Adres: `https://<użytkownik>.github.io/<repozytorium>/`. Aplikacja używa względnych ścieżek i routingu
przez `#`, więc działa w podkatalogu bez dodatkowej konfiguracji.

### Vercel / Netlify

Import repozytorium i ustawienia:

- Build command: `npm run build`
- Output directory: `dist`
- (bez zmiennych środowiskowych, bez funkcji serwerowych)

## Prywatność i zapis postępu

- Postęp (odpowiedzi, wyniki, ustawienia) — w IndexedDB przeglądarki; gdy jest niedostępne,
  w localStorage, a w ostateczności tylko w pamięci (z ostrzeżeniem).
- Nagrania głosu — tylko lokalnie (IndexedDB), nie trafiają do kopii zapasowej.
- **Kopia zapasowa:** Ustawienia → „Eksportuj postęp do pliku”. Plik można wczytać na innym urządzeniu
  („Połącz” sumuje historię z dwóch urządzeń, „Zastąp” nadpisuje).
- Stan kart powtórek nie jest zapisywany osobno — odtwarza się go z historii odpowiedzi, więc po
  imporcie i połączeniu harmonogram powtórek jest zawsze spójny.
- Warstwa zapisu to interfejs `StorageAdapter` (`src/storage/`) — synchronizację (np. Supabase)
  można dodać jako kolejny adapter.

## Struktura

```
materialy/            PDF-y źródłowe
scripts/extract/      ekstrakcja danych z PDF-ów (Python, pdfplumber)
scripts/validate-data.ts
src/data/             dane JSON + typy
src/lib/              logika: srs (FSRS), sessions, quiz, exam, stats, images, backup, dates…
src/storage/          StorageAdapter: IndexedDB → localStorage → pamięć
src/store/            stan postępu (Zustand)
src/screens/          ekrany
src/components/       komponenty (karty, nagrywanie, wykresy, oś czasu…)
```

Stack: Vite, React, TypeScript, Zustand, idb-keyval, ts-fsrs, vite-plugin-pwa (Workbox), Vitest.
