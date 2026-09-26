import { ARTWORK_PERIODS, artworkById, artworks, glossary, matching, periods, signals } from '../data';
import type { Artwork, GlossaryTerm } from '../data/types';
import { shuffle } from './srs';
import { approxYear } from './years';

export type QuizKind =
  | 'artwork-author' | 'artwork-period' | 'recognize' | 'term-def' | 'def-term'
  | 'signal-period' | 'chrono-periods' | 'chrono-artworks' | 'graphic-techniques' | 'orders';

export interface QuizInfo { kind: QuizKind; title: string; desc: string; length: number }

export const QUIZZES: QuizInfo[] = [
  { kind: 'artwork-author', title: 'Dzieło → autor', desc: 'Kto jest autorem? Odpowiedzi z tej samej lub sąsiedniej epoki.', length: 10 },
  { kind: 'artwork-period', title: 'Dzieło → epoka', desc: 'Z jakiej epoki pochodzi dzieło?', length: 10 },
  { kind: 'recognize', title: '„Rozpoznasz po” → dzieło', desc: 'Po opisie odgadnij, które to dzieło.', length: 10 },
  { kind: 'signal-period', title: 'Sygnał → epoka', desc: 'Tabela sygnałów rozpoznawczych: co widzisz → na co wskazuje.', length: 10 },
  { kind: 'term-def', title: 'Termin → definicja', desc: 'Glosariusz: środki wyrazu, kompozycja, perspektywa, barwa, techniki, architektura.', length: 10 },
  { kind: 'def-term', title: 'Definicja → termin', desc: 'Odwrotnie: po definicji podaj termin.', length: 10 },
  { kind: 'chrono-periods', title: 'Ułóż epoki chronologicznie', desc: 'Przeciągnij epoki w kolejności od najstarszej.', length: 5 },
  { kind: 'chrono-artworks', title: 'Ułóż dzieła chronologicznie', desc: 'Od najstarszego do najmłodszego.', length: 5 },
  { kind: 'graphic-techniques', title: 'Techniki graficzne', desc: 'Druk wypukły, wklęsły czy płaski?', length: 10 },
  { kind: 'orders', title: 'Porządki architektoniczne', desc: 'Dorycki, joński czy koryncki?', length: 10 },
];

export type QuizQuestion =
  | {
      type: 'choice'; kind: QuizKind; targetId: string; prompt: string;
      artworkId?: string; showTitle?: boolean; text?: string;
      options: string[]; correct: number; explain: string;
    }
  | {
      type: 'order'; kind: QuizKind; targetId: string; prompt: string;
      /** elementy w poprawnej kolejności */
      items: { id: string; label: string; sub?: string; hint: string }[];
      /** kolejność startowa (potasowana) — indeksy do `items` */
      start: number[];
      explain: string;
    };

type Rng = () => number;

const periodIndex = (p: string) => ARTWORK_PERIODS.indexOf(p);

/** Autor nadający się na odpowiedź w quizie: konkretna osoba, bez dopisków i list. */
export function cleanArtist(artist: string): string | null {
  const a = artist.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  if (!a || /^nieznany|^m\.in\.|^przypisywan/i.test(a) || /[,;:]/.test(a)) return null;
  return a;
}

/** Losuje `n` różnych wartości z `pool`, pomijając `exclude`. */
function pickDistinct(pool: string[], n: number, exclude: Set<string>, rng: Rng): string[] {
  const out: string[] = [];
  for (const v of shuffle([...new Set(pool)], rng)) {
    if (out.length >= n) break;
    if (!exclude.has(v)) { out.push(v); exclude.add(v); }
  }
  return out;
}

/** Dystraktory z coraz szerszego otoczenia (ta sama epoka → sąsiednie → dalej). */
function nearby<T>(items: T[], indexOf: (t: T) => number, center: number, value: (t: T) => string | null,
  correct: string, n: number, rng: Rng): string[] {
  const exclude = new Set([correct]);
  const out: string[] = [];
  for (const radius of [0, 1, 2, 3, 5, 100]) {
    const pool = items.filter((t) => Math.abs(indexOf(t) - center) <= radius).map(value).filter((v): v is string => !!v);
    out.push(...pickDistinct(pool, n - out.length, exclude, rng));
    if (out.length >= n) break;
  }
  return out;
}

function choice(base: Omit<Extract<QuizQuestion, { type: 'choice' }>, 'options' | 'correct'>, correct: string, wrong: string[], rng: Rng): QuizQuestion {
  const options = shuffle([correct, ...wrong], rng);
  return { ...base, options, correct: options.indexOf(correct) };
}

const artworkLine = (a: Artwork) => `${a.title} — ${a.artist}, ${a.date} (${a.period}).`;

function maskTerm(def: string, term: string): string {
  let out = def;
  for (const w of term.replace(/\(.*?\)/g, '').split(/[\s/]+/).filter((x) => x.length > 3)) {
    const stem = w.length > 5 ? w.slice(0, -2) : w;
    out = out.replace(new RegExp(`${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\p{L}*`, 'giu'), '…');
  }
  return out;
}

function termQuestions(kind: 'term-def' | 'def-term', n: number, rng: Rng): QuizQuestion[] {
  const pool = shuffle(glossary, rng).slice(0, n);
  return pool.map((t) => {
    const sameTopic = glossary.filter((g) => g.topic === t.topic && g.term !== t.term);
    const others = shuffle(sameTopic.length >= 3 ? sameTopic : glossary.filter((g) => g.term !== t.term), rng).slice(0, 3);
    const explain = `${t.term}: ${t.definition}${t.example ? ` Przykład: ${t.example}.` : ''}`;
    if (kind === 'term-def') {
      return choice({ type: 'choice', kind, targetId: t.term, prompt: `Co oznacza termin „${t.term}”?`, explain },
        t.definition, others.map((o: GlossaryTerm) => o.definition), rng);
    }
    return choice({ type: 'choice', kind, targetId: t.term, prompt: 'Jaki termin pasuje do definicji?', text: maskTerm(t.definition, t.term), explain },
      t.term, others.map((o) => o.term), rng);
  });
}

function chronoPeriods(n: number, rng: Rng): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (let round = 0; round < n; round++) {
    // co najmniej jedna epoka odstępu, żeby nie układać epok nakładających się w czasie
    const idx = shuffle(periods.map((_, i) => i), rng);
    const chosen: number[] = [];
    for (const i of idx) {
      if (chosen.length >= 5) break;
      if (chosen.every((c) => Math.abs(c - i) >= 2)) chosen.push(i);
    }
    chosen.sort((a, b) => a - b);
    const items = chosen.map((i) => ({ id: periods[i].name, label: periods[i].name, hint: periods[i].dates }));
    out.push({
      type: 'order', kind: 'chrono-periods', targetId: items.map((i) => i.id).join('|'),
      prompt: 'Ułóż epoki od najstarszej do najmłodszej.', items, start: shuffledStart(items.length, rng),
      explain: items.map((i) => `${i.label}: ${i.hint}`).join(' → '),
    });
  }
  return out;
}

function chronoArtworks(n: number, rng: Rng): QuizQuestion[] {
  const dated = artworks.map((a) => ({ a, y: approxYear(a.date)! }));
  const out: QuizQuestion[] = [];
  for (let round = 0; round < n; round++) {
    const chosen: typeof dated = [];
    for (const d of shuffle(dated, rng)) {
      if (chosen.length >= 5) break;
      // co najmniej 50 lat odstępu i różne epoki — kolejność ma być jednoznaczna
      if (chosen.every((c) => Math.abs(c.y - d.y) >= 50 && c.a.period !== d.a.period)) chosen.push(d);
    }
    chosen.sort((x, y) => x.y - y.y);
    const items = chosen.map(({ a }) => ({ id: a.id, label: a.title, sub: a.artist.startsWith('nieznany') ? undefined : a.artist, hint: `${a.date} · ${a.period}` }));
    out.push({
      type: 'order', kind: 'chrono-artworks', targetId: items.map((i) => i.id).join('|'),
      prompt: 'Ułóż dzieła od najstarszego do najmłodszego.', items, start: shuffledStart(items.length, rng),
      explain: items.map((i) => `${i.label} (${i.hint})`).join(' → '),
    });
  }
  return out;
}

function shuffledStart(len: number, rng: Rng): number[] {
  const identity = [...Array(len).keys()];
  let s = shuffle(identity, rng);
  // nigdy nie zaczynaj od poprawnej kolejności
  for (let tries = 0; tries < 5 && s.every((v, i) => v === i); tries++) s = shuffle(identity, rng);
  if (s.every((v, i) => v === i)) s = [...identity].reverse();
  return s;
}

function categoryQuestions(kind: 'graphic-techniques' | 'orders', n: number, rng: Rng): QuizQuestion[] {
  const set = kind === 'orders' ? matching.architecturalOrders : matching.graphicTechniques;
  return shuffle(set.items, rng).slice(0, n).map((it) => {
    const cat = set.categories[it.category];
    const options = set.categories.map((c) => c.name);
    return {
      type: 'choice', kind, targetId: it.text, prompt: set.prompt, text: it.text,
      options, correct: it.category, explain: `${cat.name}: ${cat.rule}`,
    };
  });
}

export function generateQuiz(kind: QuizKind, rng: Rng = Math.random): QuizQuestion[] {
  const n = QUIZZES.find((q) => q.kind === kind)!.length;
  switch (kind) {
    case 'artwork-author': {
      const pool = artworks.filter((a) => cleanArtist(a.artist));
      return shuffle(pool, rng).slice(0, n).map((a) => {
        const correct = cleanArtist(a.artist)!;
        const wrong = nearby(pool, (x) => periodIndex(x.period), periodIndex(a.period), (x) => cleanArtist(x.artist), correct, 3, rng);
        return choice({ type: 'choice', kind, targetId: a.id, prompt: 'Kto jest autorem tego dzieła?', artworkId: a.id, showTitle: true, explain: artworkLine(a) }, correct, wrong, rng);
      });
    }
    case 'artwork-period': {
      return shuffle(artworks, rng).slice(0, n).map((a) => {
        const idx = periodIndex(a.period);
        const wrong = nearby(ARTWORK_PERIODS, periodIndex, idx, (p) => p, a.period, 3, rng);
        return choice({ type: 'choice', kind, targetId: a.id, prompt: 'Z jakiej epoki pochodzi to dzieło?', artworkId: a.id, showTitle: true, explain: `${artworkLine(a)} Rozpoznasz po: ${a.recognizeBy}` }, a.period, wrong, rng);
      });
    }
    case 'recognize': {
      return shuffle(artworks, rng).slice(0, n).map((a) => {
        const wrong = nearby(artworks, (x) => periodIndex(x.period), periodIndex(a.period), (x) => x.title, a.title, 3, rng);
        return choice({ type: 'choice', kind, targetId: a.id, prompt: 'Które dzieło rozpoznasz po tym opisie?', text: a.recognizeBy, explain: artworkLine(a) }, a.title, wrong, rng);
      });
    }
    case 'signal-period': {
      return shuffle(signals.map((s, i) => ({ s, i })), rng).slice(0, n).map(({ s, i }) => {
        const wrong = nearby(signals.map((x, j) => ({ x, j })), (t) => t.j, i, (t) => t.x.period, s.period, 3, rng);
        return choice({ type: 'choice', kind, targetId: s.period, prompt: 'Na jaką epokę wskazują te sygnały?', text: s.clue, explain: `${s.clue} → ${s.period} (${s.dates}).` }, s.period, wrong, rng);
      });
    }
    case 'term-def':
    case 'def-term':
      return termQuestions(kind, n, rng);
    case 'chrono-periods': return chronoPeriods(n, rng);
    case 'chrono-artworks': return chronoArtworks(n, rng);
    case 'graphic-techniques':
    case 'orders':
      return categoryQuestions(kind, n, rng);
  }
}

/** Liczba elementów na właściwym miejscu (do podsumowania zadania „ułóż”). */
export function orderScore(order: number[]): number {
  return order.filter((v, i) => v === i).length;
}

export { artworkById };
