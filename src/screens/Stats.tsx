import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarList, LineChart, StackList, type StackRow } from '../components/charts';
import { PageHead } from '../components/ui';
import { ARTWORK_PERIODS, artworks, questions, SECTIONS } from '../data';
import { useCardStates } from '../hooks/useStudy';
import { fromDay, toDay } from '../lib/dates';
import { examScore } from '../lib/exam';
import { plural } from '../lib/plural';
import { QUIZZES } from '../lib/quiz';
import { artworkGroup, questionGroup } from '../lib/sessions';
import { analysisStepRates, averageGrade, quizAccuracyByWeek, statusCounts, streak, studyDays, studyMinutes } from '../lib/stats';
import { useProgress } from '../store/useProgress';

const LEGEND = ['opanowane', 'w nauce', 'nowe'];
const SHORT = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' });

export function Stats() {
  const { reviews, analyses, exams, diagnostics } = useProgress();
  const states = useCardStates();
  const now = useMemo(() => new Date(), []);

  const s = useMemo(() => {
    const days = studyDays(reviews, analyses);
    const qRows: StackRow[] = SECTIONS.map((sec) => {
      const ids = questions.filter((q) => q.section === sec.code).map((q) => q.id);
      const c = statusCounts('question', ids, states, now);
      return { key: sec.code, label: `${sec.code}. ${sec.title}`, parts: [c.mastered, c.learning + c.due, c.new], total: ids.length };
    });
    const aRows: StackRow[] = ARTWORK_PERIODS.map((p) => {
      const ids = artworks.filter((a) => a.period === p).map((a) => a.id);
      const c = statusCounts('artwork', ids, states, now);
      return { key: p, label: p, parts: [c.mastered, c.learning + c.due, c.new], total: ids.length };
    });
    const qAvg = averageGrade(reviews, 'question', questionGroup);
    const aAvg = averageGrade(reviews, 'artwork', artworkGroup);
    const weakQ = [...qAvg].filter(([, v]) => v.n >= 3).sort((a, b) => a[1].avg - b[1].avg).slice(0, 3).filter(([, v]) => v.avg < 3);
    const weakA = [...aAvg].filter(([, v]) => v.n >= 3).sort((a, b) => a[1].avg - b[1].avg).slice(0, 3).filter(([, v]) => v.avg < 3);
    const steps = analysisStepRates(analyses);
    const weakSteps = analyses.length >= 2 ? steps.filter((x) => x.rate !== null && x.rate < 0.5) : [];
    const quizWeeks = quizAccuracyByWeek(reviews);
    const quizKinds = QUIZZES.map((q) => {
      const last = reviews.filter((r) => r.itemType === 'quiz' && r.itemId.startsWith(`${q.kind}:`)).slice(-20);
      return { key: q.kind, label: q.title, value: last.length ? Math.round((last.filter((r) => r.grade >= 3).length / last.length) * 100) : null, title: `${last.length} ostatnich odpowiedzi` };
    });
    return {
      days, streak: streak(days, toDay(now)), minutes: studyMinutes(reviews, analyses), qRows, aRows, weakQ, weakA, steps, weakSteps, quizWeeks, quizKinds,
      mastered: qRows.reduce((t, r) => t + r.parts[0], 0) + aRows.reduce((t, r) => t + r.parts[0], 0),
    };
  }, [reviews, analyses, states, now]);

  const empty = reviews.length === 0 && analyses.length === 0;

  return (
    <>
      <PageHead eyebrow="Więcej" title="Statystyki" />
      <div className="stats">
        <div className="stat"><div className="value">{s.days.length}</div><div className="label">dni nauki</div></div>
        <div className="stat"><div className="value">{s.minutes}</div><div className="label">minut</div></div>
        <div className="stat"><div className="value">{s.mastered}</div><div className="label">opanowanych ze 260</div></div>
      </div>
      {empty && <div className="card"><p>Tu pojawi się postęp, gdy zaczniesz odpowiadać na pytania i robić fiszki.</p></div>}

      {!empty && (
        <section className="card">
          <h2>Słabe punkty</h2>
          {s.weakQ.length + s.weakA.length + s.weakSteps.length === 0 ? (
            <p className="small muted">Na razie nic nie odstaje. Słabe punkty pojawią się po kilku odpowiedziach w danym dziale lub epoce.</p>
          ) : (
            <ul className="weak">
              {s.weakQ.map(([code, v]) => <li key={code}>Pytania, dział {code} — średnia ocena {v.avg.toFixed(1)}/4 · <Link to={`/sesja?typ=dzial&kod=${code}`}>Ćwicz</Link></li>)}
              {s.weakA.map(([p, v]) => <li key={p}>Dzieła: {p} — średnia ocena {v.avg.toFixed(1)}/4 · <Link to={`/sesja?typ=filtr&ids=${artworks.filter((a) => a.period === p).map((a) => a.id).join(',')}`}>Ćwicz</Link></li>)}
              {s.weakSteps.map((x) => <li key={x.n}>Analiza, krok {x.n}. {x.name} — pada w {Math.round((x.rate ?? 0) * 100)}% analiz · <Link to="/trening/analiza">Trener</Link></li>)}
            </ul>
          )}
          <p className="small muted">Słabe obszary mają pierwszeństwo w kolejce powtórek.</p>
        </section>
      )}

      <section className="card">
        <h2>Pytania według działów</h2>
        <StackList rows={s.qRows} legend={LEGEND} />
      </section>

      <section className="card">
        <h2>Karty dzieł według epok</h2>
        <StackList rows={s.aRows} legend={LEGEND} />
      </section>

      <section className="card">
        <h2>Trafność quizów w kolejnych tygodniach</h2>
        {s.quizWeeks.length === 0 ? <p className="small muted">Jeszcze nie było quizów. <Link to="/trening/quizy">Quizy →</Link></p> : (
          <LineChart label="Trafność quizów w procentach, tydzień po tygodniu"
            points={s.quizWeeks.map((w) => ({ x: SHORT.format(fromDay(w.week)), y: (w.right / w.total) * 100, tip: `Tydzień od ${w.week}: ${w.right}/${w.total} (${Math.round((w.right / w.total) * 100)}%)` }))} />
        )}
        {s.quizWeeks.length > 0 && (
          <>
            <h3 style={{ marginTop: 16 }}>Według rodzaju (ostatnie 20 odpowiedzi)</h3>
            <BarList max={100} format={(v) => `${v}%`} rows={s.quizKinds} />
          </>
        )}
      </section>

      <section className="card">
        <h2>Kroki analizy dzieła</h2>
        {analyses.length === 0 ? <p className="small muted">Jeszcze nie było analiz. <Link to="/trening/analiza">Trener analizy →</Link></p> : (
          <>
            <p className="small muted">Jak często krok pojawił się w wypowiedzi — na podstawie karty oceny z {plural(analyses.length, 'analizy', 'analiz', 'analiz')}.</p>
            <BarList max={1} format={(v) => `${Math.round(v * 100)}%`} rows={s.steps.map((x) => ({ key: String(x.n), label: `${x.n}. ${x.name}`, value: x.rate }))} />
          </>
        )}
      </section>

      <section className="card">
        <h2>Egzaminy próbne</h2>
        {exams.length === 0 ? <p className="small muted">Jeszcze nie było egzaminu próbnego. <Link to="/trening/egzamin">Egzamin →</Link></p> : (
          <BarList max={100} format={(v) => `${v}%`} rows={exams.map((e) => ({ key: e.date, label: new Date(e.date).toLocaleDateString('pl-PL'), value: examScore(e), title: e.questions.map((q) => q.id).join(', ') }))} />
        )}
      </section>

      <section className="card">
        <h2>Test diagnostyczny</h2>
        {diagnostics.length === 0 ? <p className="small muted">Test jeszcze nie był robiony. <Link to="/wiecej/test">Test →</Link></p> : (
          <>
            <BarList max={30} format={(v) => `${v} pkt`} rows={diagnostics.map((d, i) => ({ key: d.date, label: `${['Start', 'Półmetek', 'Koniec'][i] ?? i + 1} · ${new Date(d.date).toLocaleDateString('pl-PL')}`, value: d.total }))} />
            <p style={{ marginTop: 8 }}><Link to="/wiecej/test">Szczegóły według części →</Link></p>
          </>
        )}
      </section>
    </>
  );
}
