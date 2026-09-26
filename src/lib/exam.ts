import { examRules, questions } from '../data';
import type { Question } from '../data/types';
import type { ExamResult } from '../store/model';
import { shuffle } from './srs';

/**
 * Zestaw na egzamin próbny: trzy pytania z trzech różnych działów. Jedno zawsze dotyczy
 * artysty wymienionego przez szkołę z nazwiska (Matejko, Wyspiański, Dalí, Picasso).
 */
export function drawExamSet(rng: () => number = Math.random): Question[] {
  const named = questions.filter((q) => q.tags.some((t) => examRules.namedArtists.includes(t)));
  const first = shuffle(named, rng)[0];
  const used = new Set([first.section]);
  const rest: Question[] = [];
  for (const q of shuffle(questions, rng)) {
    if (rest.length >= 2) break;
    if (!used.has(q.section)) { rest.push(q); used.add(q.section); }
  }
  return shuffle([first, ...rest], rng);
}

export const PREP_SECONDS = 180;

/** Wynik egzaminu w procentach: średnia z trafionych punktów kluczowych. */
export function examScore(e: ExamResult): number {
  if (!e.questions.length) return 0;
  const avg = e.questions.reduce((s, q) => s + (q.keyPointsTotal ? q.keyPointsHit / q.keyPointsTotal : 0), 0) / e.questions.length;
  return Math.round(avg * 100);
}
