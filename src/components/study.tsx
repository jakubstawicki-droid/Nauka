import { useState } from 'react';
import type { Artwork } from '../data/types';
import { useArtworkImage } from '../hooks/useStudy';
import { STATUS_LABELS, type ItemStatus } from '../lib/srs';
import { GRADE_LABELS, type Grade } from '../store/model';

export function Checklist({ items, checked, onToggle, title }: {
  items: string[]; checked: boolean[]; onToggle: (i: number) => void; title: string;
}) {
  return (
    <fieldset className="checklist">
      <legend>{title}</legend>
      {items.map((text, i) => (
        <label key={i} className={checked[i] ? 'on' : undefined}>
          <input type="checkbox" checked={checked[i]} onChange={() => onToggle(i)} />
          <span>{text}</span>
        </label>
      ))}
    </fieldset>
  );
}

const GRADE_HINT: Record<Grade, string> = { 1: '0–40%', 2: '40–70%', 3: '70–90%', 4: '90%+' };

export function GradeButtons({ suggested, onGrade }: { suggested: Grade | null; onGrade: (g: Grade) => void }) {
  return (
    <div className="grades" role="group" aria-label="Ocena">
      {([1, 2, 3, 4] as Grade[]).map((g) => (
        <button key={g} className={`grade g${g}${suggested === g ? ' suggested' : ''}`} onClick={() => onGrade(g)}>
          <span className="g-label">{GRADE_LABELS[g]}</span>
          <span className="g-hint">{GRADE_HINT[g]}</span>
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  return <span className={`badge st-${status}`}>{STATUS_LABELS[status]}</span>;
}

/**
 * Reprodukcja z Wikimedia Commons. `showCredits=false` ukrywa podpis (np. na awersie fiszki,
 * żeby nazwisko autora nie zdradziło odpowiedzi) — pokazuje się po odwróceniu karty.
 */
export function ArtworkImage({ artwork, showCredits = true }: { artwork: Artwork; showCredits?: boolean }) {
  const img = useArtworkImage(artwork);
  const [zoom, setZoom] = useState(false);

  if (!img) return <div className="art-frame loading-frame" aria-label="Wczytywanie reprodukcji" />;

  if (img.status !== 'ok') {
    const text = {
      protected: 'To dzieło jest wciąż chronione prawem autorskim, więc nie wyświetlamy tu reprodukcji.',
      none: 'Nie znaleziono reprodukcji na wolnej licencji.',
      offline: 'Brak połączenia — reprodukcja pojawi się, gdy wrócisz do sieci.',
    }[img.status];
    return (
      <div className="art-frame art-missing">
        <p>{text}</p>
        {showCredits && <a href={img.articleUrl} target="_blank" rel="noreferrer">Zobacz w Wikipedii ↗</a>}
      </div>
    );
  }

  return (
    <figure className="art">
      <button className="art-frame" onClick={() => setZoom(true)} aria-label="Powiększ reprodukcję">
        <img src={img.src} alt={showCredits ? `${artwork.title} — reprodukcja` : 'Reprodukcja dzieła do rozpoznania'} />
      </button>
      <figcaption>
        {showCredits ? (
          <>
            Plik: <a href={img.filePage} target="_blank" rel="noreferrer">{img.author}</a> · {img.license} · Wikimedia Commons
          </>
        ) : 'Źródło: Wikimedia Commons (autor i licencja po odwróceniu karty)'}
      </figcaption>
      {zoom && (
        <div className="lightbox" onClick={() => setZoom(false)} role="dialog" aria-label="Powiększenie">
          <img src={img.src} alt="" />
        </div>
      )}
    </figure>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}
