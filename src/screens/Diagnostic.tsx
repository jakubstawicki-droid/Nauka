import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarList } from '../components/charts';
import { RecorderPanel } from '../components/Recorder';
import { PageHead } from '../components/ui';
import { diagnostic } from '../data';
import { formatClock, useElapsed } from '../hooks/useStudy';
import { diagnosticRefs } from '../lib/diagnosticRefs';
import type { DiagnosticResult } from '../store/model';
import { useProgress } from '../store/useProgress';

const taskKey = (n: number, sub?: string) => `${n}${sub ?? ''}`;
const interpretation = (total: number) => diagnostic.interpretation.find((i) => total >= i.min && total <= i.max)!;
const partTotal = (d: DiagnosticResult, code: string) => {
  const part = diagnostic.parts.find((p) => p.code === code)!;
  return part.tasks.reduce((s, t) => s + (d.points[taskKey(t.n, t.sub)] ?? 0), 0);
};
const LABELS = ['Start', 'Półmetek', 'Koniec'];

export function DiagnosticHome() {
  const results = useProgress((s) => s.diagnostics);
  return (
    <>
      <PageHead eyebrow="Więcej" title="Test diagnostyczny">
        <p>{diagnostic.when}</p>
        <p>{diagnostic.purpose}</p>
      </PageHead>
      <Link className="btn primary block" to="/wiecej/test/start" style={{ marginBottom: 16 }}>
        {results.length ? 'Zrób test jeszcze raz' : 'Zacznij test'}
      </Link>

      {results.length > 0 && (
        <>
          <section className="card">
            <h2>Twoje wyniki (na 30 pkt)</h2>
            <BarList max={30} format={(v) => `${v} pkt`} rows={results.map((d, i) => ({
              key: d.date, value: d.total,
              label: <>{LABELS[i] ?? `Podejście ${i + 1}`} <span className="muted small">{new Date(d.date).toLocaleDateString('pl-PL')}</span></>,
            }))} />
            <p className="small" style={{ marginTop: 12 }}>{interpretation(results[results.length - 1].total).text}</p>
          </section>
          <section className="card">
            <h2>Według części</h2>
            <div className="c-table">
              <table>
                <thead><tr><th>Część</th>{results.map((d, i) => <th key={d.date}>{LABELS[i] ?? i + 1}</th>)}</tr></thead>
                <tbody>
                  {diagnostic.parts.map((p) => (
                    <tr key={p.code}>
                      <th scope="row">{p.code}. {p.title}</th>
                      {results.map((d) => <td key={d.date}>{partTotal(d, p.code)}/{p.points}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      <p className="small muted">{diagnostic.retakeNote}</p>
    </>
  );
}

export function DiagnosticRun() {
  const addDiagnostic = useProgress((s) => s.addDiagnostic);
  const [points, setPoints] = useState<Record<string, number>>({});
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [date] = useState(() => new Date().toISOString());
  const clock = useElapsed(!result);
  const total = Object.values(points).reduce((s, v) => s + v, 0);
  const allTasks = diagnostic.parts.flatMap((p) => p.tasks.map((t) => taskKey(t.n, t.sub)));
  const answered = allTasks.filter((k) => k in points).length;

  function finish() {
    const full: Record<string, number> = {};
    for (const k of allTasks) full[k] = points[k] ?? 0;
    const r: DiagnosticResult = { date, points: full, total: Object.values(full).reduce((s, v) => s + v, 0) };
    addDiagnostic(r);
    setResult(r);
    window.scrollTo({ top: 0 });
  }

  if (result) {
    return (
      <>
        <PageHead eyebrow="Test diagnostyczny" title={`${result.total} / ${diagnostic.maxPoints} pkt`} />
        <div className="card accent"><p>{interpretation(Math.round(result.total)).text}</p></div>
        <Link className="btn primary block" to="/wiecej/test">Porównaj z poprzednimi</Link>
      </>
    );
  }

  return (
    <>
      <div className="session-top">
        <span className="count">Test · {answered}/{allTasks.length} ocenionych · {total} pkt</span>
        <span className="clock">{formatClock(clock.seconds)} / ok. 30:00</span>
      </div>
      <p className="hint-box small">Bez zaglądania do materiałów. Odpowiedz (na kartce albo na głos), dopiero potem kliknij „Sprawdź” i przyznaj sobie punkty.</p>

      {diagnostic.parts.map((p) => (
        <section key={p.code} className="card">
          <h2>Część {p.code}. {p.title} <span className="muted small">({p.points} pkt)</span></h2>
          {p.instruction && <p className="small">{p.instruction}</p>}
          {p.code === 'E' && <RecorderPanel kind="question" refId={`diagnostic@${date}`} label="Test diagnostyczny — część E" history={1} />}
          <div className="diag-tasks">
            {p.tasks.map((t) => {
              const k = taskKey(t.n, t.sub);
              const refs = p.code === 'E' ? [] : diagnosticRefs(p.code, t);
              const steps = p.code === 'E' ? [0, 1] : [0, 0.5, 1];
              return (
                <div key={k} className="diag-task">
                  <div className="dt-text"><span className="muted">{t.sub ? `(${t.sub})` : `${t.n}.`}</span> {t.text}</div>
                  {refs.length > 0 && !shown[k] && <button className="link-btn small" onClick={() => setShown((s) => ({ ...s, [k]: true }))}>Sprawdź</button>}
                  {shown[k] && refs.map((r) => (
                    <p key={r.title} className="dt-ref small"><strong>{r.title}:</strong> {r.text} {r.link && <Link to={r.link} target="_blank">więcej</Link>}</p>
                  ))}
                  <div className="seg dt-points" role="group" aria-label={`Punkty za zadanie ${k}`}>
                    {steps.map((v) => (
                      <button key={v} aria-pressed={points[k] === v} onClick={() => setPoints((s) => ({ ...s, [k]: v }))}>
                        {v === 0.5 ? '½' : v}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <button className="btn primary block" onClick={finish}>
        Zakończ test ({total} pkt{answered < allTasks.length ? `, ${allTasks.length - answered} bez oceny = 0` : ''})
      </button>
    </>
  );
}
