import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui';
import { analysisGuide } from '../data';

const TECHNIQUES: { title: string; text: string; where?: { to: string; label: string } }[] = [
  {
    title: 'Najpierw z pamięci, potem sprawdzenie',
    text: 'Wysiłek przypominania sobie jest tym, co utrwala wiedzę — czytanie gotowej odpowiedzi daje złudzenie, że się umie. Dlatego aplikacja nigdy nie pokazuje odpowiedzi od razu: najpierw mówisz, potem odsłaniasz wzorzec.',
    where: { to: '/pytania', label: 'Pytania' },
  },
  {
    title: 'Powtórki rozłożone w czasie',
    text: 'Pytanie, które umiesz, wraca po coraz dłuższej przerwie — po kilku dniach, tygodniu, miesiącu. To, co sprawia kłopot, wraca szybciej. Algorytm (FSRS) sam liczy, kiedy co powtórzyć, a lista „Na dziś” ma limit, żeby sesja mieściła się w około 30 minutach.',
    where: { to: '/', label: 'Dziś' },
  },
  {
    title: 'Uczciwa samoocena z listą',
    text: 'Po odsłonięciu wzorca odhaczasz punkty z listy „Musi paść”, które naprawdę padły. Z procentu trafionych punktów wynika podpowiedź oceny: poniżej 40% „Nie umiem”, 40–70% „Trudne”, 70–90% „Dobrze”, powyżej 90% „Łatwe”.',
  },
  {
    title: 'Mów na głos',
    text: 'Egzamin jest ustny, a odpowiedź przemyślana „w głowie” zawsze wydaje się gładsza niż wypowiedziana. Mów pełnymi zdaniami, jakby słuchał egzaminator. (Nagrywanie się w aplikacji pojawi się razem z egzaminem próbnym.)',
  },
  {
    title: 'Przeplatanie tematów',
    text: 'Gdy pytania z różnych działów i epok przychodzą na zmianę, mózg musi za każdym razem rozpoznać, „z czym ma do czynienia” — dokładnie tak jak na egzaminie, gdzie losuje się pytania z całości.',
    where: { to: '/sesja?typ=mieszany', label: 'Tryb mieszany' },
  },
  {
    title: 'Pytanie „dlaczego?”',
    text: 'Po każdej odpowiedzi jest pytanie dodatkowe, a przy dziełach pytanie „po czym poznasz, że to ta epoka?”. Wyjaśnianie związków zamienia listę faktów w zrozumienie — i przygotowuje na pytania dodatkowe egzaminatora.',
  },
  {
    title: 'Obraz i słowo razem',
    text: 'Dzieło zapamiętuje się najlepiej, gdy patrzysz na reprodukcję i jednocześnie nazywasz: tytuł → autor → epoka → trzy cechy.',
    where: { to: '/dziela', label: 'Karty dzieł' },
  },
  {
    title: 'Zasada trzech ruchów',
    text: `${analysisGuide.threeMoves.moves.map((m) => `${m.name} (${m.role})`).join(' → ')}. ${analysisGuide.threeMoves.conclusion}`,
  },
  {
    title: 'Test diagnostyczny na start, w połowie i na koniec',
    text: 'Ten sam test w tygodniu 0, po tygodniu 7 i na końcu. Różnica w wyniku najlepiej pokazuje, ile już umiesz.',
  },
  {
    title: 'Słabe punkty mają pierwszeństwo',
    text: 'Aplikacja liczy, które działy i epoki idą najsłabiej, i w kolejce powtórek stawia je na początku.',
  },
];

export function HowToLearn() {
  return (
    <>
      <PageHead eyebrow="Więcej" title="Jak się uczyć">
        <p>Lepiej 20–30 minut dziennie przez 14 tygodni niż trzy godziny w niedzielę.</p>
      </PageHead>
      {TECHNIQUES.map((t, i) => (
        <section className="card" key={t.title}>
          <h2>{i + 1}. {t.title}</h2>
          <p>{t.text}</p>
          {t.where && <Link to={t.where.to}>{t.where.label} →</Link>}
        </section>
      ))}
      <div className="card accent">
        <h2>Najważniejsza rada</h2>
        <p>{analysisGuide.mainAdvice}</p>
      </div>
    </>
  );
}
