import { useState } from 'react';
import type { Question } from '../data/types';
import { formatClock, useElapsed } from '../hooks/useStudy';
import { gradeFromChecklist } from '../lib/srs';
import type { Grade } from '../store/model';
import { useRecordings } from '../lib/recordings';
import { RecorderPanel, RecordingPlayer } from './Recorder';
import { Checklist, GradeButtons } from './study';

/**
 * Aktywne przypominanie: najpierw odpowiedź z pamięci (na głos), dopiero potem wzorzec.
 * Samoocena z checklisty „Musi paść” podpowiada ocenę dla algorytmu powtórek.
 */
export function QuestionCard({ question, onDone }: { question: Question; onDone: (grade: Grade, timeSpent: number) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [checked, setChecked] = useState(() => question.keyPoints.map(() => false));
  const clock = useElapsed(!revealed);
  const hits = checked.filter(Boolean).length;
  const [startedAt] = useState(() => new Date().toISOString());
  const suggested = gradeFromChecklist(hits, question.keyPoints.length);

  return (
    <article>
      <div className="prompt-label">{question.id} · {question.sectionTitle}</div>
      <h2 className="question-text">{question.question}</h2>

      {!revealed ? (
        <>
          <div className="hint-box">
            <p>Odpowiedz na głos, tak jak na egzaminie: teza → rozwinięcie → przykład dzieła z autorem → zamknięcie.</p>
            <p className="clock">Czas: {formatClock(clock.seconds)}</p>
          </div>
          <RecorderPanel kind="question" refId={question.id} label={question.id} history={0} onRecordingChange={setRecording} />
          <div className="sticky-actions">
            <button className="btn primary block" onClick={() => setRevealed(true)} disabled={recording}>
              {recording ? 'Zatrzymaj nagrywanie, żeby odsłonić wzorzec' : 'Pokaż modelową odpowiedź'}
            </button>
          </div>
        </>
      ) : (
        <>
          <RecordedAnswer questionId={question.id} since={startedAt} />
          <div className="card">
            <div className="prompt-label">Modelowa odpowiedź</div>
            <p className="reading">{question.modelAnswer}</p>
          </div>

          <Checklist
            title={`Co padło w Twojej odpowiedzi? (${hits}/${question.keyPoints.length})`}
            items={question.keyPoints}
            checked={checked}
            onToggle={(i) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
          />

          {question.commonMistake && (
            <div className="warn-box"><strong>Uwaga na błąd</strong>{question.commonMistake}</div>
          )}
          {question.followUp && (
            <div className="challenge">
              <strong>Pytanie dodatkowe — odpowiedz na głos</strong>
              {question.followUp}
            </div>
          )}

          <div className="grade-area">
            <p className="small muted" style={{ marginBottom: 8 }}>
              Jak poszło? Podpowiedź z checklisty jest zaznaczona — możesz ją zmienić.
            </p>
            <GradeButtons suggested={suggested} onGrade={(g) => onDone(g, clock.spent())} />
          </div>
        </>
      )}
    </article>
  );
}

/** Odsłuch nagrania zrobionego przy tym podejściu (obok modelowej odpowiedzi). */
function RecordedAnswer({ questionId, since }: { questionId: string; since: string }) {
  const list = useRecordings((s) => s.list);
  const mine = list.find((r) => r.kind === 'question' && r.refId === questionId && r.createdAt >= since);
  if (!mine) return null;
  return (
    <div className="card">
      <div className="prompt-label">Twoja odpowiedź</div>
      <RecordingPlayer meta={mine} />
    </div>
  );
}
