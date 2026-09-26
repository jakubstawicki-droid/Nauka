import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecorderPanel, RecordingPlayer } from '../components/Recorder';
import { Checklist } from '../components/study';
import { PageHead } from '../components/ui';
import { examRules, questionById } from '../data';
import type { Question } from '../data/types';
import { formatClock } from '../hooks/useStudy';
import { drawExamSet, examScore, PREP_SECONDS } from '../lib/exam';
import { useRecordings } from '../lib/recordings';
import { gradeFromChecklist } from '../lib/srs';
import type { ExamResult } from '../store/model';
import { useProgress } from '../store/useProgress';

export function ExamHome() {
  const exams = useProgress((s) => s.exams);
  const { list, load } = useRecordings();
  useEffect(() => { void load(); }, [load]);
  return (
    <>
      <PageHead eyebrow="Trening" title="Egzamin próbny">
        <p>Losujesz zestaw trzech pytań, masz 3 minuty na przygotowanie, potem odpowiadasz na głos. Najlepiej z kimś w roli egzaminatora.</p>
      </PageHead>
      <Link className="btn primary block" to="/trening/egzamin/start" style={{ marginBottom: 16 }}>Losuj zestaw</Link>

      <section className="card">
        <h2>Budowa dobrej wypowiedzi</h2>
        <ol>{examRules.answerStructure.map((s) => <li key={s.n}><strong>{s.name}</strong> — {s.text}</li>)}</ol>
      </section>
      <details className="card">
        <summary><strong>Dziesięć zasad, które robią różnicę</strong></summary>
        <ol style={{ marginTop: 12 }}>{examRules.rules.map((r) => <li key={r}>{r}</li>)}</ol>
      </details>

      {exams.length > 0 && (
        <>
          <h2 className="group-title">Historia egzaminów</h2>
          <div className="stack">
            {[...exams].reverse().map((e) => {
              const recs = list.filter((r) => r.kind === 'exam' && r.refId.startsWith(`${e.date}:`));
              return (
                <details key={e.date} className="card">
                  <summary>
                    <strong>{new Date(e.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</strong>
                    {' · '}{examScore(e)}% punktów kluczowych
                  </summary>
                  <ul style={{ marginTop: 12 }}>
                    {e.questions.map((q) => (
                      <li key={q.id}>
                        <Link to={`/pytania/${q.id}`}>{q.id}</Link> {questionById.get(q.id)?.question} — {q.keyPointsHit}/{q.keyPointsTotal}, {formatClock(q.seconds)}
                      </li>
                    ))}
                  </ul>
                  {recs.map((r) => <RecordingPlayer key={r.id} meta={r} showLabel />)}
                </details>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

type Phase = { name: 'prep' } | { name: 'answer'; i: number } | { name: 'assess'; i: number } | { name: 'done' };

interface Assessment { hit: boolean[]; structure: boolean[] }

export function ExamSession() {
  const navigate = useNavigate();
  const { addExam, addReview } = useProgress();
  const [examId] = useState(() => new Date().toISOString());
  const [set] = useState<Question[]>(() => drawExamSet());
  const [phase, setPhase] = useState<Phase>({ name: 'prep' });
  const [prepLeft, setPrepLeft] = useState(PREP_SECONDS);
  const [answerStart, setAnswerStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [seconds, setSeconds] = useState<number[]>([]);
  const [recording, setRecording] = useState(false);
  const [assess, setAssess] = useState<Assessment[]>(() => set.map((q) => ({ hit: q.keyPoints.map(() => false), structure: examRules.answerStructure.map(() => false) })));
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    if (phase.name !== 'prep') return;
    if (prepLeft <= 0) { startAnswer(0); return; }
    const t = setTimeout(() => setPrepLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, prepLeft]);

  useEffect(() => {
    if (phase.name !== 'answer') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - answerStart) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase, answerStart]);

  function startAnswer(i: number) {
    setAnswerStart(Date.now());
    setElapsed(0);
    setPhase({ name: 'answer', i });
    window.scrollTo({ top: 0 });
  }

  function finishAnswer(i: number) {
    setSeconds((s) => { const n = [...s]; n[i] = Math.floor((Date.now() - answerStart) / 1000); return n; });
    if (i + 1 < set.length) startAnswer(i + 1);
    else { setPhase({ name: 'assess', i: 0 }); window.scrollTo({ top: 0 }); }
  }

  function finishAssess(i: number) {
    if (i + 1 < set.length) { setPhase({ name: 'assess', i: i + 1 }); window.scrollTo({ top: 0 }); return; }
    const r: ExamResult = {
      date: examId,
      prepSeconds: PREP_SECONDS - Math.max(0, prepLeft),
      questions: set.map((q, j) => ({
        id: q.id,
        keyPointsHit: assess[j].hit.filter(Boolean).length,
        keyPointsTotal: q.keyPoints.length,
        structure: examRules.answerStructure.filter((_, k) => assess[j].structure[k]).map((s) => s.n),
        seconds: seconds[j] ?? 0,
      })),
    };
    addExam(r);
    r.questions.forEach((q) => addReview({
      itemId: q.id, itemType: 'question', grade: gradeFromChecklist(q.keyPointsHit, q.keyPointsTotal) ?? 1, timeSpent: q.seconds, mode: 'exam',
    }));
    setResult(r);
    setPhase({ name: 'done' });
    window.scrollTo({ top: 0 });
  }

  const toggle = (i: number, field: keyof Assessment, k: number) =>
    setAssess((a) => a.map((x, j) => (j === i ? { ...x, [field]: x[field].map((v, m) => (m === k ? !v : v)) } : x)));

  return (
    <>
      <div className="session-top">
        <span className="count">Egzamin próbny</span>
        <button className="btn close" onClick={() => navigate('/trening/egzamin')}>Przerwij</button>
      </div>

      {phase.name === 'prep' && (
        <>
          <p className="prompt-label">Wylosowany zestaw</p>
          <ol className="exam-set">{set.map((q) => <li key={q.id}><span className="muted small">{q.id} · {q.sectionTitle}</span><br />{q.question}</li>)}</ol>
          <p className="prompt-label">Czas na przygotowanie</p>
          <div className="countdown">{formatClock(Math.max(0, prepLeft))}</div>
          <p className="small muted" style={{ textAlign: 'center' }}>Zanotuj na kartce hasła: tezę, 2–3 cechy, przykład dzieła z autorem.</p>
          <button className="btn primary block" onClick={() => startAnswer(0)}>Jestem gotowa — zaczynam</button>
        </>
      )}

      {phase.name === 'answer' && (
        <>
          <p className="prompt-label">Pytanie {phase.i + 1} z {set.length}</p>
          <h2 className="question-text">{set[phase.i].question}</h2>
          <div className="speak-timer"><span className="t">{formatClock(elapsed)}</span></div>
          <RecorderPanel key={phase.i} kind="exam" refId={`${examId}:${set[phase.i].id}`} label={`Egzamin · ${set[phase.i].id}`}
            history={0} onRecordingChange={setRecording} />
          <p className="hint-box small">{examRules.answerStructure.map((s) => s.name).join(' → ')}</p>
          <button className="btn primary block" onClick={() => finishAnswer(phase.i)} disabled={recording}>
            {recording ? 'Najpierw zatrzymaj nagrywanie' : phase.i + 1 < set.length ? 'Następne pytanie' : 'Koniec odpowiedzi — samoocena'}
          </button>
        </>
      )}

      {phase.name === 'assess' && (() => {
        const q = set[phase.i];
        const a = assess[phase.i];
        return (
          <>
            <p className="prompt-label">Samoocena · pytanie {phase.i + 1} z {set.length} · {formatClock(seconds[phase.i] ?? 0)}</p>
            <h2 className="question-text">{q.question}</h2>
            <RecorderPanel key={`a${phase.i}`} kind="exam" refId={`${examId}:${q.id}`} label={`Egzamin · ${q.id}`} history={1} />
            <details className="card"><summary><strong>Modelowa odpowiedź</strong></summary><p className="reading" style={{ marginTop: 12 }}>{q.modelAnswer}</p></details>
            <Checklist title={`Musi paść (${a.hit.filter(Boolean).length}/${q.keyPoints.length})`} items={q.keyPoints} checked={a.hit} onToggle={(k) => toggle(phase.i, 'hit', k)} />
            <Checklist title="Budowa wypowiedzi" items={examRules.answerStructure.map((s) => s.name)} checked={a.structure} onToggle={(k) => toggle(phase.i, 'structure', k)} />
            <div className="challenge"><strong>Pytanie dodatkowe egzaminatora</strong>{q.followUp}</div>
            <button className="btn primary block" onClick={() => finishAssess(phase.i)}>
              {phase.i + 1 < set.length ? 'Następne pytanie' : 'Zapisz egzamin'}
            </button>
          </>
        );
      })()}

      {phase.name === 'done' && result && (
        <>
          <div className="card accent">
            <h2>{examScore(result)}% punktów kluczowych</h2>
            <p className="small">Przygotowanie: {formatClock(result.prepSeconds)}. Wynik zapisany w historii.</p>
          </div>
          <ul className="list" style={{ marginBottom: 16 }}>
            {result.questions.map((q) => (
              <li key={q.id}>
                <Link to={`/pytania/${q.id}`}>
                  <span className="l-id">{q.id}</span>
                  <div className="l-main">
                    <div>{questionById.get(q.id)?.question}</div>
                    <div className="l-sub">{q.keyPointsHit}/{q.keyPointsTotal} punktów · szkielet {q.structure.length}/4 · {formatClock(q.seconds)}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="stack">
            <Link className="btn primary" to="/trening/egzamin/start" onClick={() => window.scrollTo({ top: 0 })}>Kolejny zestaw</Link>
            <Link className="btn" to="/trening/egzamin">Historia egzaminów</Link>
          </div>
        </>
      )}
    </>
  );
}
