import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SortableList } from '../components/SortableList';
import { ArtworkImage, ProgressBar } from '../components/study';
import { Menu, PageHead } from '../components/ui';
import { artworkById } from '../data';
import { useElapsed } from '../hooks/useStudy';
import { generateQuiz, orderScore, QUIZZES, type QuizKind, type QuizQuestion } from '../lib/quiz';
import { useProgress } from '../store/useProgress';

/** Trafność ostatnich odpowiedzi w danym quizie (z historii postępu). */
function useQuizStats() {
  const reviews = useProgress((s) => s.reviews);
  return useMemo(() => {
    const m = new Map<string, { right: number; total: number }>();
    const byKind = new Map<string, number[]>();
    for (const r of reviews) {
      if (r.itemType !== 'quiz') continue;
      const kind = r.itemId.split(':')[0];
      byKind.set(kind, [...(byKind.get(kind) ?? []), r.grade]);
    }
    for (const [k, grades] of byKind) {
      const last = grades.slice(-20);
      m.set(k, { right: last.filter((g) => g >= 3).length, total: last.length });
    }
    return m;
  }, [reviews]);
}

export function QuizMenu() {
  const stats = useQuizStats();
  return (
    <>
      <PageHead eyebrow="Trening" title="Quizy">
        <p>Krótkie serie po 10 pytań (układanie — po 5). Wyniki trafiają do statystyk.</p>
      </PageHead>
      <Menu items={QUIZZES.map((q) => {
        const s = stats.get(q.kind);
        const last = s ? ` · ostatnio ${Math.round((s.right / s.total) * 100)}% (${s.total} odp.)` : '';
        return { to: `/trening/quizy/${q.kind}`, label: q.title, desc: q.desc + last };
      })} />
    </>
  );
}

export function QuizRun() {
  const { kind } = useParams();
  const info = QUIZZES.find((q) => q.kind === kind);
  const navigate = useNavigate();
  const addReview = useProgress((s) => s.addReview);
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState(() => (info ? generateQuiz(info.kind) : []));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  if (!info) return <p>Nie ma takiego quizu.</p>;

  const q = questions[index];

  function answered(right: boolean, partial: number, timeSpent: number) {
    addReview({ itemId: `${info!.kind}:${q.targetId}`, itemType: 'quiz', grade: right ? 3 : 1, timeSpent, mode: 'quiz' });
    setScore((s) => s + partial);
  }

  function again() {
    setQuestions(generateQuiz(info!.kind));
    setIndex(0); setScore(0); setRound((r) => r + 1);
  }

  if (index >= questions.length) {
    const max = questions.length;
    const pct = Math.round((score / max) * 100);
    return (
      <>
        <PageHead eyebrow="Quiz" title={info.title} />
        <div className="card accent">
          <h2>Wynik: {Math.round(score * 10) / 10} / {max} ({pct}%)</h2>
          <p>{pct >= 90 ? 'Świetnie — ten materiał jest opanowany.' : pct >= 60 ? 'Dobrze. Błędne odpowiedzi warto przejrzeć jeszcze raz.' : 'To jest materiał do powtórki — wróć do kart dzieł albo kompendium i spróbuj za kilka dni.'}</p>
        </div>
        <div className="stack">
          <button className="btn primary" onClick={again}>Nowa seria</button>
          <Link className="btn" to="/trening/quizy">Inne quizy</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="session-top">
        <span className="count">{info.title} · {index + 1} / {questions.length}</span>
        <button className="btn close" onClick={() => navigate('/trening/quizy')}>Zakończ</button>
      </div>
      <ProgressBar value={index} max={questions.length} />
      {q.type === 'choice'
        ? <ChoiceQuestion key={`${round}-${index}`} q={q} onAnswered={answered} onNext={() => setIndex((i) => i + 1)} />
        : <OrderQuestion key={`${round}-${index}`} q={q} onAnswered={answered} onNext={() => setIndex((i) => i + 1)} />}
    </>
  );
}

type Answered = (right: boolean, partial: number, timeSpent: number) => void;

function ChoiceQuestion({ q, onAnswered, onNext }: { q: Extract<QuizQuestion, { type: 'choice' }>; onAnswered: Answered; onNext: () => void }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const clock = useElapsed(chosen === null);
  const artwork = q.artworkId ? artworkById.get(q.artworkId) : undefined;
  const done = chosen !== null;

  function choose(i: number) {
    if (done) return;
    setChosen(i);
    onAnswered(i === q.correct, i === q.correct ? 1 : 0, clock.spent());
  }

  return (
    <article>
      <div className="prompt-label">{q.prompt}</div>
      {artwork && <ArtworkImage artwork={artwork} showCredits={done} />}
      {artwork && q.showTitle && <h2 className="question-text">{artwork.title}</h2>}
      {q.text && <p className="quiz-stem">{q.text}</p>}
      <div className="options" role="group" aria-label="Odpowiedzi">
        {q.options.map((o, i) => {
          const cls = !done ? '' : i === q.correct ? ' right' : i === chosen ? ' wrong' : ' dim';
          return <button key={o} className={`option${cls}`} onClick={() => choose(i)} disabled={done}>{o}</button>;
        })}
      </div>
      {done && (
        <>
          <div className={`notice ${chosen === q.correct ? 'ok' : 'error'}`} role="status">
            {chosen === q.correct ? 'Dobrze!' : `Poprawna odpowiedź: ${q.options[q.correct]}`}
          </div>
          <p className="small">{q.explain}</p>
          <button className="btn primary block" onClick={onNext}>Dalej</button>
        </>
      )}
    </article>
  );
}

function OrderQuestion({ q, onAnswered, onNext }: { q: Extract<QuizQuestion, { type: 'order' }>; onAnswered: Answered; onNext: () => void }) {
  const [order, setOrder] = useState(q.start);
  const [checked, setChecked] = useState(false);
  const clock = useElapsed(!checked);
  const right = orderScore(order);

  function check() {
    setChecked(true);
    onAnswered(right === q.items.length, right / q.items.length, clock.spent());
  }

  return (
    <article>
      <div className="prompt-label">{q.prompt}</div>
      <p className="small muted">Przeciągnij za ≡ albo użyj strzałek. Na górze — najstarsze.</p>
      <SortableList items={q.items} order={order} onChange={setOrder} checked={checked} />
      {!checked ? (
        <button className="btn primary block" onClick={check}>Sprawdź</button>
      ) : (
        <>
          <div className={`notice ${right === q.items.length ? 'ok' : 'error'}`} role="status">
            {right === q.items.length ? 'Wszystko na swoim miejscu!' : `Na właściwym miejscu: ${right} z ${q.items.length}.`}
          </div>
          <p className="small"><strong>Poprawna kolejność:</strong> {q.explain}</p>
          <button className="btn primary block" onClick={onNext}>Dalej</button>
        </>
      )}
    </article>
  );
}

export type { QuizKind };
