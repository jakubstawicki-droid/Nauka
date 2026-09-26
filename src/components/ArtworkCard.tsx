import { useEffect, useState } from 'react';
import type { Artwork } from '../data/types';
import { useArtworkImage, useElapsed } from '../hooks/useStudy';
import { gradeFromChecklist } from '../lib/srs';
import type { Grade } from '../store/model';
import { ArtworkDetails } from './ArtworkDetails';
import { ArtworkImage, Checklist, GradeButtons } from './study';

const RECALL_STEPS = ['Tytuł', 'Autor (albo „nieznany”)', 'Epoka / kierunek', 'Trzy cechy formalne'];
const FAST_SECONDS = 5;

/**
 * Fiszka dzieła (obraz + słowo): rozpoznaj → autor → epoka → 3 cechy.
 * Tryb szybki (tydzień 13): 5 sekund na rozpoznanie, potem karta sama się odwraca.
 */
export function ArtworkCard({ artwork, fast = false, onDone }: {
  artwork: Artwork; fast?: boolean; onDone: (grade: Grade, timeSpent: number) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [checked, setChecked] = useState(() => RECALL_STEPS.map(() => false));
  const [left, setLeft] = useState(FAST_SECONDS);
  const clock = useElapsed(!flipped);

  useEffect(() => {
    if (!fast || flipped) return;
    if (left <= 0) { setFlipped(true); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [fast, flipped, left]);

  const suggested = gradeFromChecklist(checked.filter(Boolean).length, RECALL_STEPS.length);

  if (!flipped) {
    return (
      <article>
        <div className="prompt-label">{fast ? 'Tryb szybki — rozpoznaj' : 'Rozpoznaj dzieło'}</div>
        <ArtworkImage artwork={artwork} showCredits={false} />
        <ArtworkFrontCue artwork={artwork} />
        {fast ? (
          <div className="countdown" aria-live="polite">{left}</div>
        ) : (
          <p className="hint-box">Powiedz na głos: tytuł → autor → epoka → trzy cechy, po których to poznajesz.</p>
        )}
        <div className="sticky-actions">
          <button className="btn primary block" onClick={() => setFlipped(true)}>Odwróć kartę</button>
        </div>
      </article>
    );
  }

  return (
    <article>
      <ArtworkImage artwork={artwork} />
      <ArtworkDetails artwork={artwork} />
      <div className="challenge">
        <strong>Po czym poznasz, że to {artwork.period.toLowerCase()}?</strong>
        {artwork.question && <>Pytanie z karty: {artwork.question}</>}
      </div>
      <div className="grade-area">
        {fast ? (
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <button className="btn block" onClick={() => onDone(1, clock.spent())}>Nie wiedziałam</button>
            <button className="btn primary block" onClick={() => onDone(3, clock.spent())}>Wiedziałam</button>
          </div>
        ) : (
          <>
            <Checklist
              title="Co udało się powiedzieć?"
              items={RECALL_STEPS}
              checked={checked}
              onToggle={(i) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
            />
            <GradeButtons suggested={suggested} onGrade={(g) => onDone(g, clock.spent())} />
          </>
        )}
      </div>
    </article>
  );
}

/** Gdy nie ma reprodukcji (dzieło chronione, brak pliku, brak sieci), podpowiedzią na awersie jest opis „Rozpoznasz po”. */
function ArtworkFrontCue({ artwork }: { artwork: Artwork }) {
  const img = useArtworkImage(artwork);
  const [show, setShow] = useState(false);
  if (!img || img.status === 'ok') return null;
  return show || img.status !== 'offline' ? (
    <p className="hint-box"><strong>Opis:</strong> {artwork.recognizeBy}</p>
  ) : (
    <button className="btn block" style={{ marginBottom: 14 }} onClick={() => setShow(true)}>
      Pokaż opis dzieła zamiast obrazu
    </button>
  );
}
