import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArtworkCard } from '../components/ArtworkCard';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/study';
import { artworkById, artworks, questionById, questions } from '../data';
import { useCardStates } from '../hooks/useStudy';
import {
  deckTodaySession, mixedSession, orderedSession, todaySession, type SessionContext, type SessionItem,
} from '../lib/sessions';
import { shuffle } from '../lib/srs';
import { GRADE_LABELS, type Grade, type StudyMode } from '../store/model';
import { useProgress } from '../store/useProgress';

/**
 * Parametry sesji w adresie:
 *  typ=dzis | pytania | dziela | dzial (kod=I) | lista (pytania: ids=I-01,I-02) | filtr (dzieła: ids=…) | mieszany | szybki
 */
function buildItems(params: URLSearchParams, ctx: SessionContext): { items: SessionItem[]; title: string; mode: StudyMode; fast: boolean } {
  const typ = params.get('typ') ?? 'dzis';
  const ids = (params.get('ids') ?? '').split(',').filter(Boolean);
  switch (typ) {
    case 'pytania': return { items: deckTodaySession('question', ctx), title: 'Pytania na dziś', mode: 'question', fast: false };
    case 'dziela': return { items: deckTodaySession('artwork', ctx), title: 'Dzieła na dziś', mode: 'flashcard', fast: false };
    case 'dzial': {
      const code = params.get('kod');
      const list = questions.filter((q) => q.section === code).map((q) => q.id);
      return { items: orderedSession('question', list, ctx), title: `Dział ${code}`, mode: 'question', fast: false };
    }
    case 'lista': return { items: ids.filter((id) => questionById.has(id)).map((id) => ({ kind: 'question', id })), title: 'Pytania', mode: 'question', fast: false };
    case 'filtr': {
      const list = ids.length ? ids.filter((id) => artworkById.has(id)) : artworks.map((a) => a.id);
      return { items: shuffle(list).map((id) => ({ kind: 'artwork', id })), title: 'Fiszki dzieł', mode: 'flashcard', fast: false };
    }
    case 'szybki': {
      const list = ids.length ? ids.filter((id) => artworkById.has(id)) : artworks.map((a) => a.id);
      return { items: shuffle(list).map((id) => ({ kind: 'artwork', id })), title: 'Tryb szybki · 5 s', mode: 'flashcard-fast', fast: true };
    }
    case 'mieszany': return { items: mixedSession(Number(params.get('n')) || 12), title: 'Tryb mieszany', mode: 'mixed', fast: false };
    default: return { items: todaySession(ctx), title: 'Na dziś', mode: 'mixed', fast: false };
  }
}

export function StudySession() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const states = useCardStates();
  const addReview = useProgress((s) => s.addReview);
  // kolejka ustalana raz, na starcie — nie zmienia się w trakcie sesji
  const [session] = useState(() => {
    const { reviews, settings } = useProgress.getState();
    return buildItems(params, { states, reviews, settings, now: new Date() });
  });
  const [index, setIndex] = useState(0);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [seconds, setSeconds] = useState(0);

  const item = session.items[index];
  const done = index >= session.items.length;

  function onDone(grade: Grade, timeSpent: number) {
    const itemMode: StudyMode = session.mode === 'mixed' ? 'mixed' : item.kind === 'question' ? 'question' : session.mode;
    addReview({ itemId: item.id, itemType: item.kind, grade, timeSpent, mode: itemMode });
    setGrades((g) => [...g, grade]);
    setSeconds((s) => s + timeSpent);
    setIndex((i) => i + 1);
    window.scrollTo({ top: 0 });
  }

  const summary = useMemo(() => {
    const counts: Record<Grade, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const g of grades) counts[g]++;
    return counts;
  }, [grades]);

  if (session.items.length === 0) {
    return (
      <div className="card">
        <h2>Na dziś wszystko zrobione</h2>
        <p>Nie ma zaległych powtórek, a limit nowych na dziś jest wykorzystany. Możesz zrobić tryb mieszany albo quiz — albo po prostu odpocząć.</p>
        <div className="stack">
          <Link className="btn primary" to="/sesja?typ=mieszany">Tryb mieszany</Link>
          <button className="btn" onClick={() => navigate(-1)}>Wróć</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <>
        <div className="page-head"><div className="eyebrow">{session.title}</div><h1>Sesja zakończona</h1></div>
        <div className="stats">
          <div className="stat"><div className="value">{grades.length}</div><div className="label">pozycji</div></div>
          <div className="stat"><div className="value">{Math.round(seconds / 60)}</div><div className="label">minut</div></div>
          <div className="stat"><div className="value">{summary[3] + summary[4]}</div><div className="label">dobrze lub łatwo</div></div>
        </div>
        <div className="card">
          {([1, 2, 3, 4] as Grade[]).map((g) => <p key={g}>{GRADE_LABELS[g]}: <strong>{summary[g]}</strong></p>)}
          <p className="small muted">Pozycje oznaczone „Nie umiem” i „Trudne” wrócą szybciej — to normalne i tak ma być.</p>
        </div>
        <Link className="btn primary block" to="/">Wróć do „Dziś”</Link>
      </>
    );
  }

  return (
    <>
      <div className="session-top">
        <span className="count">{session.title} · {index + 1} / {session.items.length}</span>
        <button className="btn close" onClick={() => navigate(-1)} aria-label="Zakończ sesję">Zakończ</button>
      </div>
      <ProgressBar value={index} max={session.items.length} />
      {item.kind === 'question' ? (
        <QuestionCard key={`${index}-${item.id}`} question={questionById.get(item.id)!} onDone={onDone} />
      ) : (
        <ArtworkCard key={`${index}-${item.id}`} artwork={artworkById.get(item.id)!} fast={session.fast} onDone={onDone} />
      )}
    </>
  );
}
