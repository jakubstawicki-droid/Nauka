import { useState } from 'react';
import type { Question } from '../data/types';
import { formatClock, useElapsed } from '../hooks/useStudy';
import { gradeFromChecklist } from '../lib/srs';
import type { Grade } from '../store/model';
import { Checklist, GradeButtons } from './study';

/**
 * Aktywne przypominanie: najpierw odpowiedź z pamięci (na głos), dopiero potem wzorzec.
 * Samoocena z checklisty „Musi paść” podpowiada ocenę dla algorytmu powtórek.
 */
export function QuestionCard({ question, onDone }: { question: Question; onDone: (grade: Grade, timeSpent: number) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(() => question.keyPoints.map(() => false));
  const clock = useElapsed(!revealed);
  const hits = checked.filter(Boolean).length;
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
          <div className="sticky-actions">
            <button className="btn primary block" onClick={() => setRevealed(true)}>Pokaż modelową odpowiedź</button>
          </div>
        </>
      ) : (
        <>
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
