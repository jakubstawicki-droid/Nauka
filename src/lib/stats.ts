import { analysisSteps, examRules } from '../data';
import type { AnalysisResult, ReviewLog } from '../store/model';
import { addDays, daysBetween, toDay } from './dates';
import { itemKey, itemStatus, type CardState, type Deck, type ItemStatus } from './srs';

/** Dni (YYYY-MM-DD, czas lokalny), w których była jakakolwiek nauka. */
export function studyDays(reviews: ReviewLog[], analyses: AnalysisResult[] = []): string[] {
  const s = new Set<string>();
  for (const r of reviews) s.add(toDay(new Date(r.date)));
  for (const a of analyses) s.add(toDay(new Date(a.date)));
  return [...s].sort();
}

/** Ile kolejnych dni wolnych nie przerywa serii — plan zakłada 2 dni wolne w tygodniu. */
export const ALLOWED_REST_DAYS = 2;

/**
 * Seria bez karania za przerwy: liczba dni nauki w bieżącym ciągu, w którym między kolejnymi
 * dniami nauki są najwyżej 2 dni przerwy. Seria trwa, dopóki od ostatniej nauki nie minęły więcej niż 2 dni wolne.
 */
export function streak(days: string[], today: string): number {
  if (!days.length) return 0;
  const last = days[days.length - 1];
  if (daysBetween(last, today) > ALLOWED_REST_DAYS + 1) return 0;
  let count = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (daysBetween(days[i - 1], days[i]) > ALLOWED_REST_DAYS + 1) break;
    count++;
  }
  return count;
}

/** Dni nauki w 7-dniowym tygodniu programu, który zaczyna się w `weekStart`. */
export function daysInWeek(days: string[], weekStart: string): number {
  const end = addDays(weekStart, 7);
  return days.filter((d) => d >= weekStart && d < end).length;
}

export function studyMinutes(reviews: ReviewLog[], analyses: AnalysisResult[] = []): number {
  return Math.round((reviews.reduce((s, r) => s + r.timeSpent, 0) + analyses.reduce((s, a) => s + a.seconds, 0)) / 60);
}

export type StatusCounts = Record<ItemStatus, number>;

export function statusCounts(deck: Deck, ids: string[], states: Map<string, CardState>, now: Date): StatusCounts {
  const c: StatusCounts = { new: 0, due: 0, learning: 0, mastered: 0 };
  for (const id of ids) c[itemStatus(states.get(itemKey(deck, id)), now)]++;
  return c;
}

/** Trafność quizów w kolejnych tygodniach kalendarzowych (od poniedziałku). */
export function quizAccuracyByWeek(reviews: ReviewLog[]): { week: string; right: number; total: number }[] {
  const m = new Map<string, { right: number; total: number }>();
  for (const r of reviews) {
    if (r.itemType !== 'quiz') continue;
    const d = new Date(r.date);
    const monday = addDays(toDay(d), -((d.getDay() + 6) % 7));
    const v = m.get(monday) ?? { right: 0, total: 0 };
    v.total++;
    if (r.grade >= 3) v.right++;
    m.set(monday, v);
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([week, v]) => ({ week, ...v }));
}

/**
 * Jak często w analizach padał dany krok (na podstawie karty oceny).
 * Krok liczy się jako zrobiony, gdy odhaczone są wszystkie punkty karty, które go dotyczą.
 */
export function analysisStepRates(analyses: AnalysisResult[]): { n: number; name: string; rate: number | null }[] {
  return analysisSteps.map((s) => {
    const items = examRules.scorecard.items.filter((i) => i.steps.includes(s.n)).map((i) => i.n);
    if (!analyses.length || !items.length) return { n: s.n, name: s.name, rate: null };
    const done = analyses.filter((a) => items.every((i) => a.checked.includes(i))).length;
    return { n: s.n, name: s.name, rate: done / analyses.length };
  });
}

/** Średnia ocena (1–4) w grupie — z odpowiedzi w trybach powtórek. */
export function averageGrade(reviews: ReviewLog[], deck: Deck, groupOf: (id: string) => string | undefined) {
  const m = new Map<string, { sum: number; n: number }>();
  for (const r of reviews) {
    if (r.itemType !== deck || r.mode === 'quiz') continue;
    const g = groupOf(r.itemId);
    if (!g) continue;
    const v = m.get(g) ?? { sum: 0, n: 0 };
    v.sum += r.grade; v.n++;
    m.set(g, v);
  }
  return new Map([...m].map(([g, v]) => [g, { avg: v.sum / v.n, n: v.n }]));
}
