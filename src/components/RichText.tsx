import { useState } from 'react';
import type { GlossaryTerm } from '../data/types';
import { findTerm } from '../lib/terms';
import { Dialog } from './ui';

/** Tekst z **pogrubieniami**; pogrubione terminy z glosariusza są klikalne (definicja w okienku). */
export function RichText({ text }: { text: string }) {
  const [open, setOpen] = useState<GlossaryTerm | null>(null);
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        const term = findTerm(part);
        return term
          ? <button key={i} className="term-link" onClick={() => setOpen(term)}>{part}</button>
          : <strong key={i}>{part}</strong>;
      })}
      {open && <TermDialog term={open} onClose={() => setOpen(null)} />}
    </>
  );
}

export function TermDialog({ term, onClose }: { term: GlossaryTerm; onClose: () => void }) {
  return (
    <Dialog title={term.term} onClose={onClose}>
      <p>{term.definition}</p>
      {term.example && <p className="small"><strong>Przykład:</strong> {term.example}</p>}
      <p className="small muted">Dział {term.section}{term.topic ? ` · ${term.topic}` : ''}</p>
      <button className="btn block" onClick={onClose}>Zamknij</button>
    </Dialog>
  );
}
