import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui';
import { schedule } from '../data';
import type { ScheduleWeek } from '../data/types';
import { useCardStates } from '../hooks/useStudy';
import { addDays, currentWeek, formatDay, fromDay, toDay } from '../lib/dates';
import { weekTasks, type WeekTask } from '../lib/scheduleTasks';
import { itemKey } from '../lib/srs';
import { studyDays } from '../lib/stats';
import { useProgress } from '../store/useProgress';

const SHORT = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' });

export function useTaskProgress() {
  const states = useCardStates();
  const { analyses, exams, diagnostics, settings } = useProgress();
  return useMemo(() => {
    const inWeek = (date: string, week: number) => {
      if (!settings.startDate) return false;
      const start = addDays(settings.startDate, (week - 1) * 7);
      const d = toDay(new Date(date));
      return d >= start && d < addDays(start, 7);
    };
    return (t: WeekTask, week: number): { done: number; target: number } | null => {
      const a = t.auto;
      if (!a) return null;
      switch (a.kind) {
        case 'questions': return { done: a.ids.filter((id) => states.has(itemKey('question', id))).length, target: a.ids.length };
        case 'artworks': return { done: a.ids.filter((id) => states.has(itemKey('artwork', id))).length, target: a.ids.length };
        case 'analyses': return { done: Math.min(a.target, analyses.filter((x) => inWeek(x.date, week)).length), target: a.target };
        case 'exam': return { done: Math.min(a.target, exams.filter((x) => inWeek(x.date, week)).length), target: a.target };
        case 'diagnostic': return { done: diagnostics.some((x) => inWeek(x.date, week) || (week === 1 && settings.startDate && toDay(new Date(x.date)) < settings.startDate)) ? 1 : 0, target: 1 };
      }
    };
  }, [states, analyses, exams, diagnostics, settings.startDate]);
}

export function Schedule() {
  const { settings, scheduleDone, reviews, analyses } = useProgress();
  const today = toDay(new Date());
  const current = currentWeek(settings.startDate, today);
  const days = useMemo(() => studyDays(reviews, analyses), [reviews, analyses]);

  return (
    <>
      <PageHead eyebrow="Więcej" title="Harmonogram 14 tygodni"><p>{schedule.assumption}</p></PageHead>
      {!settings.startDate && (
        <div className="card warn">
          <p>Ustaw datę startu albo egzaminu, żeby zobaczyć daty tygodni i bieżący tydzień.</p>
          <Link className="btn" to="/wiecej/ustawienia">Ustaw daty</Link>
        </div>
      )}
      <details className="card">
        <summary><strong>O czym łatwo zapomnieć</strong></summary>
        <ul style={{ marginTop: 12 }}>{schedule.reminders.map((r) => <li key={r}>{r}</li>)}</ul>
      </details>
      <div className="stack">
        {schedule.weeks.map((w) => (
          <WeekCard key={w.week} w={w} current={current === w.week} done={scheduleDone} startDate={settings.startDate} studyDaysCount={
            settings.startDate ? days.filter((d) => d >= addDays(settings.startDate!, (w.week - 1) * 7) && d < addDays(settings.startDate!, w.week * 7)).length : 0
          } />
        ))}
      </div>
    </>
  );
}

function WeekCard({ w, current, done, startDate, studyDaysCount }: { w: ScheduleWeek; current: boolean; done: Record<string, boolean>; startDate: string | null; studyDaysCount: number }) {
  const tasks = weekTasks(w);
  const checked = tasks.filter((t) => done[t.key]).length;
  const start = startDate ? addDays(startDate, (w.week - 1) * 7) : null;

  return (
    <details className={`card week${current ? ' current' : ''}`} open={current}>
      <summary>
        <div className="week-head">
          <span className="badge">{current ? 'Ten tydzień · ' : ''}Tydzień {w.week} · {w.phase}</span>
          {start && <span className="small muted">{SHORT.format(fromDay(start))} – {SHORT.format(fromDay(addDays(start, 6)))}</span>}
        </div>
        <div className="week-title">{w.title}</div>
        <div className="small muted">{checked}/{tasks.length} zadań{startDate ? ` · ${studyDaysCount} dni nauki` : ''}</div>
      </summary>
      {w.goals.map((g) => <p key={g} className="challenge small"><strong>Cel tygodnia</strong>{g}</p>)}
      {w.polishAccent && <p className="small"><strong>Akcent polski:</strong> {w.polishAccent}</p>}
      {w.artists.length > 0 && <p className="small"><strong>Artyści:</strong> {w.artists.join(', ')}</p>}
      <WeekTaskList w={w} />
      {start && current && <p className="small muted">Dziś: {formatDay(toDay(new Date()))}</p>}
    </details>
  );
}

/** Zadania tygodnia z odhaczaniem i postępem liczonym z nauki (używane też na pulpicie). */
export function WeekTaskList({ w }: { w: ScheduleWeek }) {
  const done = useProgress((s) => s.scheduleDone);
  const toggle = useProgress((s) => s.toggleScheduleTask);
  const progress = useTaskProgress();
  return (
    <ul className="tasks">
      {weekTasks(w).map((t) => {
        const p = progress(t, w.week);
        return (
          <li key={t.key}>
            <label>
              <input type="checkbox" checked={!!done[t.key]} onChange={() => toggle(t.key)} />
              <span>
                <span className="t-label">{t.label}</span>
                {p && <span className="badge" style={{ marginLeft: 6 }}>{p.done}/{p.target}</span>}
                {t.detail && <span className="t-detail">{t.detail}</span>}
              </span>
            </label>
            {t.link && <Link className="t-link" to={t.link}>Otwórz →</Link>}
          </li>
        );
      })}
    </ul>
  );
}
