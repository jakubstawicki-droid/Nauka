import type { Artwork } from '../data/types';

export function ArtworkDetails({ artwork: a }: { artwork: Artwork }) {
  return (
    <>
      <h2 className="question-text" style={{ marginBottom: 4 }}>{a.title}</h2>
      <p className="muted" style={{ marginBottom: 12 }}>
        {a.artist} · {a.date} {a.isPolish && <span className="badge">PL</span>}
      </p>
      <dl className="meta-list">
        <dt>Epoka</dt><dd>{a.period}</dd>
        <dt>Dziedzina</dt><dd>{a.domain}</dd>
        {a.genre && (<><dt>Gatunek</dt><dd>{a.genre}</dd></>)}
        <dt>Technika</dt><dd>{a.technique}</dd>
        <dt>Miejsce</dt><dd>{a.location}</dd>
      </dl>
      <p><strong>Rozpoznasz po:</strong> {a.recognizeBy}</p>
      <ul className="features">{a.features.map((f) => <li key={f}>{f}</li>)}</ul>
      <p className="reading">{a.significance}</p>
    </>
  );
}
