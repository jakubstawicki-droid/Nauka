import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui';
import { schedule } from '../data';
import { useCardStates } from '../hooks/useStudy';
import { currentWeek, daysBetween, formatDay, PROGRAM_WEEKS, toDay } from '../lib/dates';
import { artworkQueue, questionQueue } from '../lib/sessions';
import { useProgress } from '../store/useProgress';

export function Dashboard() {
  const { settings, reviews } = useProgress();
  const states = useCardStates();
  const [qq, aq] = useMemo(() => {
    const ctx = { states, reviews, settings, now: new Date() };
    return [questionQueue(ctx), artworkQueue(ctx)];
  }, [states, reviews, settings]);
  const toDo = qq.due.length + qq.fresh.length + aq.due.length + aq.fresh.length;
  const today = toDay(new Date());
  const week = currentWeek(settings.startDate, today);
  const plan = week && week <= PROGRAM_WEEKS ? schedule.weeks[week - 1] : null;
  const daysToExam = settings.examDate ? daysBetween(today, settings.examDate) : null;
  const todayCount = reviews.filter((r) => r.date.slice(0, 10) === today).length;

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
            <p className="small">
              Pytania: {qq.due.length} powtórek, {qq.fresh.length} nowych · Dzieła: {aq.due.length} powtórek, {aq.fresh.length} nowych
            </p>
            <Link className="btn primary" to="/sesja?typ=dzis">Zacznij sesję</Link>
          </>
        ) : (
          <p>Wszystko na dziś zrobione. Jeśli masz ochotę na więcej — <Link to="/sesja?typ=mieszany">tryb mieszany</Link>.</p>
        )}
      </div>

      <div className="stats">
        <div className="stat"><div className="value">{todayCount}</div><div className="label">odpowiedzi dziś</div></div>
        <div className="stat"><div className="value">{reviews.length}</div><div className="label">wszystkich</div></div>
        <div className="stat">
          <div className="value">{daysToExam !== null && daysToExam >= 0 ? daysToExam : '—'}</div>
          <div className="label">dni do egzaminu</div>
        </div>
      </div>

      {week === 0 && settings.startDate && (
        <div className="card">
          <h2>Start {formatDay(settings.startDate)}</h2>
          <p>Zanim zaczniesz, zrób test diagnostyczny — pokaże, gdzie dołożyć czasu.</p>
        </div>
      )}

      {plan && (
        <div className="card">
          <p><span className="badge">Tydzień {plan.week} z {PROGRAM_WEEKS} · {plan.phase}</span></p>
          <h2>{plan.title}</h2>
          <p className="small muted">{plan.material}</p>
          <Link to="/wiecej/harmonogram">Zobacz plan tygodnia</Link>
        </div>
      )}

      {week === PROGRAM_WEEKS + 1 && (
        <div className="card"><h2>Program zakończony</h2><p>Powtarzaj schemat analizy i mów na głos. Powodzenia!</p></div>
      )}

      <p className="small muted">{schedule.assumption}</p>
    </>
  );
}
