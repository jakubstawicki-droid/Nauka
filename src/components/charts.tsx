import type { ReactNode } from 'react';

/**
 * Proste wykresy w HTML/SVG. Jedna seria = kolor akcentu (bez legendy — tytuł mówi, co to);
 * serie uporządkowane (opanowane / w nauce / nowe) = jeden odcień w krokach od ciemnego do jasnego.
 * Każda wartość jest też podana liczbą, więc kolor nigdy nie jest jedynym nośnikiem informacji.
 */
export function BarList({ rows, max, format = (v) => String(v) }: {
  rows: { label: ReactNode; value: number | null; title?: string; key: string }[];
  max: number;
  format?: (v: number) => string;
}) {
  return (
    <div className="barlist" role="table">
      {rows.map((r) => (
        <div className="bl-row" role="row" key={r.key} title={r.title}>
          <span className="bl-label" role="rowheader">{r.label}</span>
          <span className="bl-track" role="cell" aria-hidden>
            {r.value !== null && r.value > 0 && <span className="bl-bar" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />}
          </span>
          <span className="bl-value" role="cell">{r.value === null ? '—' : format(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

export interface StackRow { key: string; label: ReactNode; parts: number[]; total: number; hint?: string }

/** Wiersze ze skumulowanym paskiem (kroki jednego odcienia, 2px przerwy między segmentami). */
export function StackList({ rows, legend }: { rows: StackRow[]; legend: string[] }) {
  return (
    <>
      <div className="legend" aria-hidden>
        {legend.map((l, i) => <span key={l}><i className={`sw s${i}`} />{l}</span>)}
      </div>
      <div className="barlist" role="table">
        {rows.map((r) => (
          <div className="bl-row" role="row" key={r.key} title={r.hint ?? r.parts.map((p, i) => `${legend[i]}: ${p}`).join(', ')}>
            <span className="bl-label" role="rowheader">{r.label}</span>
            <span className="bl-track stack" role="cell" aria-label={r.parts.map((p, i) => `${legend[i]}: ${p}`).join(', ')}>
              {r.parts.map((p, i) => p > 0 && <span key={i} className={`sg s${i}`} style={{ width: `${(p / r.total) * 100}%` }} />)}
            </span>
            <span className="bl-value" role="cell">{r.parts[0]}/{r.total}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/** Wykres liniowy (jedna seria, 0–100%) z etykietą ostatniego punktu i podpowiedzią po najechaniu/dotknięciu. */
export function LineChart({ points, label }: { points: { x: string; y: number; tip: string }[]; label: string }) {
  const W = 320, H = 150, P = { l: 34, r: 12, t: 12, b: 24 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const xs = (i: number) => P.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const ys = (v: number) => P.t + ih - (v / 100) * ih;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(p.y).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  return (
    <svg className="linechart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={P.l} x2={W - P.r} y1={ys(v)} y2={ys(v)} className="grid" />
          <text x={P.l - 6} y={ys(v) + 4} className="axis" textAnchor="end">{v}%</text>
        </g>
      ))}
      <path d={path} className="line" />
      {points.map((p, i) => (
        <g key={p.x} className="pt">
          <circle cx={xs(i)} cy={ys(p.y)} r={12} className="hit"><title>{p.tip}</title></circle>
          <circle cx={xs(i)} cy={ys(p.y)} r={4.5} className="dot" />
        </g>
      ))}
      {points.length > 0 && <text x={P.l} y={H - 6} className="axis">{points[0].x}</text>}
      {points.length > 1 && <text x={W - P.r} y={H - 6} className="axis" textAnchor="end">{last.x}</text>}
      {last && (
        // etykieta ostatniego punktu: nad punktem, a przy górnej krawędzi — pod nim
        <text x={Math.min(xs(points.length - 1) - 8, W - P.r - 8)} y={last.y > 85 ? ys(last.y) + 16 : ys(last.y) - 10} className="val" textAnchor="end">
          {Math.round(last.y)}%
        </text>
      )}
    </svg>
  );
}
