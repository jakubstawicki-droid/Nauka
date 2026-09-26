import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui';
import { artworks, questions, schedule } from '../data';
import { useCardStates } from '../hooks/useStudy';
import { addDays, currentWeek, daysBetween, formatDay, PROGRAM_WEEKS, toDay } from '../lib/dates';
import { plural } from '../lib/plural';
import { MUSEUM_TASK } from '../lib/scheduleTasks';
import { artworkQueue, questionQueue } from '../lib/sessions';
import { daysInWeek, streak, studyDays } from '../lib/stats';
import { itemKey, itemStatus } from '../lib/srs';
import { useProgress } from '../store/useProgress';
import { WeekTaskList } from './Schedule';

/** Plan: 4 dni po ~30 min + dłuższa sesja weekendowa, 2 dni wolne. */
const PLANNED_DAYS = 5;

export function Dashboard() {
  const { settings, reviews, analyses, diagnostics, scheduleDone } = useProgress();
  const states = useCardStates();
  const today = toDay(new Date());

  const d = useMemo(() => {
    const now = new Date();
    const ctx = { states, reviews, settings, now };
    const days = studyDays(reviews, analyses);
    const week = currentWeek(settings.startDate, today);
    const weekStart = week && week >= 1 && week <= PROGRAM_WEEKS ? addDays(settings.startDate!, (week - 1) * 7) : null;
    const count = (deck: 'question' | 'artwork', ids: string[]) => {
      let mastered = 0, started = 0;
      for (const id of ids) {
        const st = itemStatus(states.get(itemKey(deck, id)), now);
        if (st === 'mastered') mastered++;
        if (st !== 'new') started++;
      }
      return { mastered, started };
    };
    const q = count('question', questions.map((x) => x.id));
    const a = count('artwork', artworks.map((x) => x.id));
    return {
      qq: questionQueue(ctx), aq: artworkQueue(ctx), days, week, weekStart,
      streak: streak(days, today), thisWeek: weekStart ? daysInWeek(days, weekStart) : null,
      studiedToday: days.includes(today), mastered: q.mastered + a.mastered, started: q.started + a.started,
    };
  }, [states, reviews, analyses, settings, today]);

  const toDo = d.qq.due.length + d.qq.fresh.length + d.aq.due.length + d.aq.fresh.length;
  const plan = d.week && d.week >= 1 && d.week <= PROGRAM_WEEKS ? schedule.weeks[d.week - 1] : null;
  const daysToExam = settings.examDate ? daysBetween(today, settings.examDate) : null;
  const TOTAL = questions.length + artworks.length;

  // przypomnienia
  const museumPending = MUSEUM_TASK && !scheduleDone[MUSEUM_TASK.key] && d.week !== null && d.week >= 6 && d.week <= MUSEUM_TASK.week;
  const diagDue = (d.week === 0 || d.week === 1) && diagnostics.length === 0 ? 'start'
    : d.week !== null && d.week >= 7 && d.week < 14 && diagnostics.length < 2 ? 'mid'
    : d.week === 14 && diagnostics.length < 3 ? 'end' : null;

  return (
    <>
      <PageHead eyebrow={formatDay(today)} title="Dziś" />

      {!settings.startDate && (
        <div className="card accent">
          <h2>Zacznijmy od kalendarza</h2>
          <p>Podaj datę egzaminu albo początek nauki — wtedy pokażę, co jest do zrobienia w danym tygodniu.</p>
          <Link className="btn primary" to="/wiecej/ustawienia">Ustaw daty</Link>
        </div>
      )}

      <div className="card accent">
        <h2>Na dziś{toDo > 0 ? `: ${toDo}` : ''}</h2>
        {toDo > 0 ? (
          <>
            <p className="small">Pytania: {d.qq.due.length} powtórek, {d.qq.fresh.length} nowych · Dzieła: {d.aq.due.length} powtórek, {d.aq.fresh.length} nowych</p>
            <Link className="btn primary" to="/sesja?typ=dzis">Zacznij sesję</Link>
          </>
        ) : (
          <p>Wszystko na dziś zrobione. Jeśli masz ochotę na więcej — <Link to="/sesja?typ=mieszany">tryb mieszany</Link> albo <Link to="/trening/quizy">quiz</Link>.</p>
        )}
      </div>

      <div className="stats">
        <div className="stat" title="Przerwy do 2 dni nie przerywają serii — dni wolne są częścią planu.">
          <div className="value">{d.streak}</div><div className="label">{d.streak === 1 ? 'dzień' : 'dni'} w serii</div>
        </div>
        <div className="stat">
          <div className="value">{d.thisWeek ?? '—'}{d.thisWeek !== null && <span className="small muted">/{PLANNED_DAYS}</span>}</div>
          <div className="label">dni nauki w tym tygodniu</div>
        </div>
        <div className="stat">
          <div className="value">{daysToExam !== null && daysToExam >= 0 ? daysToExam : '—'}</div>
          <div className="label">dni do egzaminu</div>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: -6 }}>
        Dni wolne są częścią planu — dwa dni przerwy nie przerywają serii.
        {!d.studiedToday && d.thisWeek !== null && d.thisWeek >= PLANNED_DAYS && ' W tym tygodniu plan jest już zrobiony — dziś możesz odpocząć.'}
      </p>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Postęp całości</h2>
          <span className="small muted">{d.mastered} opanowanych · {d.started} rozpoczętych z {TOTAL}</span>
        </div>
        <div className="bl-track stack" style={{ marginTop: 10 }} aria-label={`${d.mastered} opanowanych, ${d.started - d.mastered} w nauce, ${TOTAL - d.started} nowych`}>
          {d.mastered > 0 && <span className="sg s0" style={{ width: `${(d.mastered / TOTAL) * 100}%` }} />}
          {d.started - d.mastered > 0 && <span className="sg s1" style={{ width: `${((d.started - d.mastered) / TOTAL) * 100}%` }} />}
        </div>
        <p style={{ marginTop: 8, marginBottom: 0 }}><Link to="/wiecej/statystyki">Statystyki i słabe punkty →</Link></p>
      </section>

      {museumPending && (
        <div className="card warn">
          <h2>Wizyta w muzeum — punkt VI.3</h2>
          <p className="small">Pytanie o wydarzenie artystyczne, w którym uczestniczyłaś, wymaga własnego przeżycia. Zaplanuj wyjście wcześniej niż w tygodniu {MUSEUM_TASK!.week} (Muzeum Narodowe w Warszawie, Zachęta, MSN, Zamek Królewski).</p>
          <Link to="/pytania/VI-08">Zobacz pytanie VI-08 →</Link>
        </div>
      )}
      {diagDue && (
        <div className="card warn">
          <h2>{diagDue === 'start' ? 'Test diagnostyczny na start' : diagDue === 'mid' ? 'Półmetek — powtórz test' : 'Koniec — powtórz test'}</h2>
          <p className="small">Około 30 minut. Wynik pokaże, gdzie dołożyć czasu{diagDue !== 'start' ? ' i ile się zmieniło od startu' : ''}.</p>
          <Link className="btn" to="/wiecej/test">Test diagnostyczny</Link>
        </div>
      )}

      {d.week === 0 && settings.startDate && (
        <div className="card"><h2>Start {formatDay(settings.startDate)}</h2><p>Za {plural(daysBetween(today, settings.startDate), 'dzień', 'dni', 'dni')} tydzień 1. Na rozgrzewkę: test diagnostyczny i „Jak się uczyć”.</p></div>
      )}

      {plan && (
        <section className="card">
          <p><span className="badge">Tydzień {plan.week} z {PROGRAM_WEEKS} · {plan.phase}</span></p>
          <h2>{plan.title}</h2>
          <WeekTaskList w={plan} />
          <p style={{ marginTop: 10, marginBottom: 0 }}><Link to="/wiecej/harmonogram">Cały harmonogram →</Link></p>
        </section>
      )}

      {d.week === PROGRAM_WEEKS + 1 && (
        <div className="card"><h2>Program zakończony</h2><p>{schedule.weeks[PROGRAM_WEEKS - 1].material}</p></div>
      )}
    </>
  );
}
