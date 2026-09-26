import { Menu, PageHead } from '../components/ui';

export function TrainingMenu() {
  return (
    <>
      <PageHead title="Trening" />
      <Menu items={[
        { to: '/trening/quizy', label: 'Quizy', desc: 'Autor, epoka, chronologia, terminy' },
        { to: '/trening/analiza', label: 'Trener analizy dzieła', desc: '9 kroków, 3 minuty, nagrywanie' },
        { to: '/trening/egzamin', label: 'Egzamin próbny', desc: 'Losowanie 3 pytań, 3 minuty przygotowania' },
        { to: '/trening/mieszany', label: 'Tryb mieszany', desc: 'Pytania i dzieła z różnych działów naraz' },
      ]} />
    </>
  );
}

export function MoreMenu() {
  return (
    <>
      <PageHead title="Więcej" />
      <div className="stack">
        <Menu items={[
          { to: '/wiecej/harmonogram', label: 'Harmonogram 14 tygodni' },
          { to: '/wiecej/kompendium', label: 'Kompendium', desc: 'Działy I–VIII, oś czasu, słownik' },
          { to: '/wiecej/statystyki', label: 'Statystyki', desc: 'Postęp i słabe punkty' },
          { to: '/wiecej/test', label: 'Test diagnostyczny' },
        ]} />
        <Menu items={[
          { to: '/wiecej/jak-sie-uczyc', label: 'Jak się uczyć' },
          { to: '/wiecej/nagrania', label: 'Nagrania', desc: 'Odsłuchaj i usuń swoje nagrania' },
          { to: '/wiecej/ustawienia', label: 'Ustawienia', desc: 'Daty, limity, kopia zapasowa' },
        ]} />
      </div>
    </>
  );
}
