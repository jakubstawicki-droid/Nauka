import { glossary } from '../data';
import type { GlossaryTerm } from '../data/types';

/** Warianty nazwy hasła: „kontrafort (przypora, skarpa)” → kontrafort, przypora, skarpa; „a / b” → a, b. */
function variants(term: string): string[] {
  const out: string[] = [];
  const paren = term.match(/\(([^)]*)\)/);
  const base = term.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  out.push(...base.split(' / ').map((s) => s.trim()));
  if (paren) out.push(...paren[1].split(',').map((s) => s.trim()));
  // „kompozycja statyczna / dynamiczna” → także „kompozycja dynamiczna”
  const slash = base.match(/^(\S+) (\S+) \/ (\S+)$/);
  if (slash) out.push(`${slash[1]} ${slash[3]}`);
  return out.filter((v) => v.length > 2).map((v) => v.toLowerCase());
}

const stem = (w: string) => (w.length <= 5 ? w.slice(0, 4) : w.slice(0, Math.max(4, w.length - 2)));

const INDEX = glossary.flatMap((g) => variants(g.term).map((v) => ({ words: v.split(/\s+/), term: g })));

/**
 * Hasło glosariusza pasujące do (pogrubionego) fragmentu tekstu, z uwzględnieniem odmiany:
 * „luminizmie” → luminizm, „syntetyzmem” → syntetyzm, „kontrast walorowy” → kontrast walorowy.
 */
export function findTerm(text: string): GlossaryTerm | undefined {
  const words = text.toLowerCase().replace(/[.,:;!?„”"()]/g, '').trim().split(/\s+/);
  if (!words[0]) return undefined;
  let best: GlossaryTerm | undefined;
  let bestLen = 0;
  for (const { words: tw, term } of INDEX) {
    if (tw.length !== words.length) continue;
    if (tw.every((w, i) => words[i].startsWith(stem(w)) && words[i].length <= w.length + 4)) {
      const len = tw.join(' ').length;
      if (len > bestLen) { best = term; bestLen = len; }
    }
  }
  return best;
}
