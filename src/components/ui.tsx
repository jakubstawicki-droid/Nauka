import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconChevron } from './Icons';

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {children}
    </header>
  );
}

export interface MenuItem { to: string; label: string; desc?: string }

export function Menu({ items }: { items: MenuItem[] }) {
  return (
    <ul className="menu">
      {items.map((i) => (
        <li key={i.to}>
          <Link to={i.to}>
            <div>
              <div className="label">{i.label}</div>
              {i.desc && <div className="desc">{i.desc}</div>}
            </div>
            <IconChevron className="chev" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Ekran, który powstanie w późniejszym etapie. */
export function Placeholder({ title, stage, children }: { title: string; stage?: number; children?: ReactNode }) {
  return (
    <>
      <PageHead title={title} />
      <div className="card">
        {stage ? (
          <>
            <p><span className="badge">Etap {stage}</span></p>
            <p className="muted">Ten ekran jest w przygotowaniu.</p>
          </>
        ) : (
          <p className="muted">Wróć do ekranu „Dziś”.</p>
        )}
        {children}
      </div>
    </>
  );
}

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
