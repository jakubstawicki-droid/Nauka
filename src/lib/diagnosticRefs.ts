import { artworks, compendium, glossary, periods, questions } from '../data';
import type { DiagnosticTask } from '../data/types';
import { findTerm } from './terms';

export interface Ref { title: string; text: string; link?: string }

const plain = (s: string) => s.replace(/\*\*/g, '');

/** Zdanie z materiałów (kompendium, potem odpowiedzi modelowe) zawierające dane słowo. */
function findSentence(word: string): Ref | null {
  const stem = word.toLowerCase().slice(0, Math.max(4, word.length - 2));
  const re = new RegExp(`[^.!?]*\\b${stem}[^.!?]*[.!?]?`, 'i');
  for (const s of compendium) {
    for (const b of s.blocks) {
      const texts = b.type === 'table' ? b.rows.map((r) => r.join(' — ')) : 'text' in b ? [b.text, ...('items' in b && b.items ? b.items : [])] : [];
      for (const t of texts) {
        const m = plain(t).match(re);
        if (m) return { title: `Kompendium, dział ${s.code}`, text: m[0].trim(), link: `/wiecej/kompendium/${s.code}` };
      }
    }
  }
  for (const q of questions) {
    const m = q.modelAnswer.match(re);
    if (m) return { title: `Odpowiedź modelowa ${q.id}`, text: m[0].trim(), link: `/pytania/${q.id}` };
  }
  return null;
}

const byTerm = (name: string): Ref | null => {
  const g = glossary.find((x) => x.term === name) ?? findTerm(name);
  return g ? { title: g.term, text: g.definition + (g.example ? ` Przykład: ${g.example}.` : '') } : null;
};

const byPeriod = (name: string, what: 'features' | 'polish'): Ref | null => {
  const p = periods.find((x) => x.name.toLowerCase().startsWith(name.toLowerCase()));
  if (!p) return null;
  const text = what === 'polish' ? p.polishExamples.join(' · ') : p.features.slice(0, 3).join(' ');
  return { title: `${p.name} (${p.dates})`, text, link: '/wiecej/kompendium/os-czasu' };
};

/** Materiał do sprawdzenia własnej odpowiedzi w teście diagnostycznym (z PDF-ów — test nie ma klucza). */
export function diagnosticRefs(part: string, t: DiagnosticTask): Ref[] {
  const out: (Ref | null)[] = [];
  switch (part) {
    case 'A':
      out.push(byTerm(t.text) ?? findSentence(t.text));
      break;
    case 'B':
      out.push(byPeriod(t.text, 'features'));
      break;
    case 'C': {
      const title = t.text.replace(/\s*\(.*\)$/, '');
      const a = artworks.find((x) => x.title.toLowerCase().startsWith(title.toLowerCase()));
      if (a) out.push({ title: a.title, text: `${a.artist} · ${a.date} · ${a.period}. Rozpoznasz po: ${a.recognizeBy}`, link: `/dziela/${a.id}` });
      break;
    }
    case 'D':
      if (t.n === 23) out.push(byTerm('kolebka'), byTerm('sklepienie krzyżowo-żebrowe'));
      if (t.n === 24) out.push(byTerm('porządek dorycki'), byTerm('porządek joński'), byTerm('porządek koryncki'));
      if (t.n === 25) out.push(byPeriod('Romanizm', 'polish'), byPeriod('Gotyk', 'polish'));
      break;
  }
  return out.filter((r): r is Ref => !!r);
}
