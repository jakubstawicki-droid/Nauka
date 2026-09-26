import { analysisSteps } from '../data';

/** Dziewięć kroków analizy — rozwijane, z pytaniami pomocniczymi, zwrotami i najczęstszym błędem. */
export function AnalysisStepsGuide({ highlight }: { highlight?: number[] }) {
  return (
    <div className="steps">
      {analysisSteps.map((s) => (
        <details key={s.n} className={highlight?.includes(s.n) ? 'hl' : undefined}>
          <summary>
            <span className="step-n">{s.n}</span>
            <span className="step-name">{s.name}</span>
            <span className="step-dur">{s.duration}</span>
          </summary>
          <div className="step-body">
            <p><strong>{s.goal}</strong></p>
            <p className="prompt-label">Zapytaj siebie</p>
            <ul>{s.selfQuestions.map((q) => <li key={q}>{q}</li>)}</ul>
            <p className="prompt-label">Zwroty do wykorzystania</p>
            <ul className="phrases">{s.phrases.map((p) => <li key={p}>„{p}”</li>)}</ul>
            <p className="warn-box small"><strong>Najczęstszy błąd</strong>{s.commonMistake}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function ThreeMovesHint() {
  return (
    <p className="three-moves">
      Każde zdanie: <b>widzę</b> (obserwacja) → <b>nazywam</b> (termin) → <b>wnioskuję</b> (co z tego wynika).
    </p>
  );
}
