import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/study';
import { PageHead } from '../components/ui';
import { questionById, questions, SECTIONS } from '../data';
import { useCardStates } from '../hooks/useStudy';
import { questionQueue } from '../lib/sessions';
import { itemKey, itemStatus, nextDueLabel, type ItemStatus } from '../lib/srs';
import { useProgress } from '../store/useProgress';

function useStatuses() {
  const states = useCardStates();
  return useMemo(() => {
    const now = new Date();
    const m = new Map<string, ItemStatus>();
    for (const q of questions) m.set(q.id, itemStatus(states.get(itemKey('question', q.id)), now));
    return m;
  }, [states]);
}

export function QuestionsHome() {
  const statuses = useStatuses();
  const states = useCardStates();
  const { reviews, settings } = useProgress();
  const queue = useMemo(() => questionQueue({ states, reviews, settings, now: new Date() }), [states, reviews, settings]);
  const toDo = queue.due.length + queue.fresh.length;

  return (
    <>
      <PageHead title="Pytania">
        <p>150 pytań z modelowymi odpowiedziami. Najpierw odpowiadasz na głos, potem sprawdzasz.</p>
      </PageHead>
      <div className="card accent">
        <h2>Na dziś: {toDo}</h2>
        <p className="small">{queue.due.length} powtórek · {queue.fresh.length} nowych{queue.dueTotal > queue.due.length && ` · ${queue.dueTotal - queue.due.length} czeka ponad limit`}</p>
        {toDo > 0
          ? <Link className="btn primary" to="/sesja?typ=pytania">Zacznij</Link>
          : <p className="small">Na dziś wszystko zrobione.</p>}
      </div>
      <h2 className="group-title">Działy</h2>
      <ul className="list">
        {SECTIONS.map((s) => {
          const ids = questions.filter((q) => q.section === s.code).map((q) => q.id);
          const count = (st: ItemStatus) => ids.filter((id) => statuses.get(id) === st).length;
          const m = count('mastered'); const l = count('learning') + count('due');
          return (
            <li key={s.code}>
              <Link to={`/pytania/dzial/${s.code}`}>
                <span className="l-id">{s.code}</span>
                <div className="l-main">
                  <div className="l-title">{s.title}</div>
                  <div className="bar-row">
                    <div className="bar" aria-hidden>
                      <div className="m" style={{ width: `${(m / ids.length) * 100}%` }} />
                      <div className="l" style={{ width: `${(l / ids.length) * 100}%` }} />
                    </div>
                    <span className="muted">{m}/{ids.length}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="small muted" style={{ marginTop: 8 }}>Zielony — opanowane, żółty — w nauce.</p>
    </>
  );
}

export function QuestionSection() {
  const { code } = useParams();
  const statuses = useStatuses();
  const section = SECTIONS.find((s) => s.code === code);
  if (!section) return <p>Nie ma takiego działu.</p>;
  const list = questions.filter((q) => q.section === code);
  return (
    <>
      <PageHead eyebrow={`Dział ${section.code}`} title={section.title} />
      <Link className="btn primary block" to={`/sesja?typ=dzial&kod=${section.code}`} style={{ marginBottom: 16 }}>
        Ćwicz ten dział ({list.length})
      </Link>
      <ul className="list">
        {list.map((q) => (
          <li key={q.id}>
            <Link to={`/pytania/${q.id}`}>
              <span className="l-id">{q.id}</span>
              <div className="l-main"><div>{q.question}</div></div>
              <StatusBadge status={statuses.get(q.id)!} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function QuestionDetail() {
  const { id } = useParams();
  const q = id ? questionById.get(id) : undefined;
  const states = useCardStates();
  const [show, setShow] = useState(false);
  if (!q) return <p>Nie ma takiego pytania.</p>;
  const st = states.get(itemKey('question', q.id));
  return (
    <>
      <PageHead eyebrow={`${q.id} · ${q.sectionTitle}`} title="" />
      <h2 className="question-text">{q.question}</h2>
      <p className="row" style={{ marginBottom: 16 }}>
        <StatusBadge status={itemStatus(st, new Date())} />
        <span className="small muted">{nextDueLabel(st, new Date())}</span>
      </p>
      <Link className="btn primary block" to={`/sesja?typ=lista&ids=${q.id}`} style={{ marginBottom: 12 }}>Odpowiedz na głos i oceń</Link>
      {!show ? (
        <button className="btn block" onClick={() => setShow(true)}>Tylko podejrzyj odpowiedź</button>
      ) : (
        <>
          <div className="card"><p className="reading">{q.modelAnswer}</p></div>
          <h3>Musi paść</h3>
          <ul className="features">{q.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
          <div className="warn-box"><strong>Uwaga</strong>{q.commonMistake}</div>
          <div className="challenge"><strong>Dodatkowo</strong>{q.followUp}</div>
        </>
      )}
      {q.tags.length > 0 && (
        <p className="row small" style={{ marginTop: 16 }}>{q.tags.map((t) => <span key={t} className="badge">{t}</span>)}</p>
      )}
    </>
  );
}
