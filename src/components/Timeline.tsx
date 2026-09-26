import { useState } from 'react';
import { Link } from 'react-router-dom';
import { artworks, periods } from '../data';

/** Oś czasu epok: kliknięcie rozwija cechy, dzieła kluczowe, przykłady polskie i karty dzieł. */
export function Timeline() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ol className="timeline">
      {periods.map((p) => {
        const cards = artworks.filter((a) => p.annexPeriods.includes(a.period));
        const isOpen = open === p.name;
        return (
          <li key={p.name} className={isOpen ? 'open' : undefined}>
            <button className="tl-head" onClick={() => setOpen(isOpen ? null : p.name)} aria-expanded={isOpen}>
              <span className="tl-dot" aria-hidden />
              <span className="tl-main">
                <span className="tl-name">{p.name}</span>
                <span className="tl-dates">{p.dates}</span>
                <span className="tl-motto">„{p.motto}”</span>
              </span>
            </button>
            {isOpen && (
              <div className="tl-body">
                {p.features.length > 0 && (<><h3>Cechy</h3><ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul></>)}
                {p.keyWorks.length > 0 && (<><h3>Twórcy i dzieła</h3><ul>{p.keyWorks.map((f) => <li key={f}>{f}</li>)}</ul></>)}
                {p.polishExamples.length > 0 && (<><h3>W Polsce</h3><ul>{p.polishExamples.map((f) => <li key={f}>{f}</li>)}</ul></>)}
                {cards.length > 0 && (
                  <p><Link to={`/dziela?epoka=${encodeURIComponent(p.annexPeriods[0])}`}>Karty dzieł z tej epoki ({cards.length}) →</Link></p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
