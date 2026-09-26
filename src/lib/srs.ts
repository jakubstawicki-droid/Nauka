import { createEmptyCard, fsrs, generatorParameters, type Card } from 'ts-fsrs';
import type { Grade, ItemType, ReviewLog, StudyMode } from '../store/model';
import { toDay } from './dates';

/**
 * Powtórki rozłożone w czasie (FSRS). Stan każdej karty nie jest zapisywany osobno —
 * odtwarzamy go z historii odpowiedzi. Dzięki temu eksport/import i łączenie postępu
 * z dwóch urządzeń zawsze dają spójny harmonogram powtórek.
 */
export type Deck = Extract<ItemType, 'question' | 'artwork'>;

/** Tryby, których odpowiedzi wpływają na harmonogram powtórek. */
export const SRS_MODES: ReadonlySet<StudyMode> = new Set<StudyMode>(['question', 'flashcard', 'flashcard-fast', 'mixed']);

// enable_short_term: false → harmonogram w dniach (bez powtórek „za 10 minut”)
const scheduler = fsrs(generatorParameters({ enable_fuzz: false, enable_short_term: false }));

export interface CardState {
  card: Card;
  reviews: number;
  lastGrade: Grade;
  lastDate: string;
}

export const itemKey = (type: ItemType, id: string) => `${type}:${id}`;

const countsForSrs = (r: ReviewLog) => (r.itemType === 'question' || r.itemType === 'artwork') && SRS_MODES.has(r.mode);

export function replayCards(reviews: ReviewLog[]): Map<string, CardState> {
  const states = new Map<string, CardState>();
  const sorted = reviews.filter(countsForSrs).sort((a, b) => a.date.localeCompare(b.date));
  for (const r of sorted) {
    const key = itemKey(r.itemType, r.itemId);
    const date = new Date(r.date);
    const prev = states.get(key);
    const card = scheduler.next(prev?.card ?? createEmptyCard(date), date, r.grade).card;
    states.set(key, { card, reviews: (prev?.reviews ?? 0) + 1, lastGrade: r.grade, lastDate: r.date });
  }
  return states;
}

export type ItemStatus = 'new' | 'due' | 'learning' | 'mastered';
export const STATUS_LABELS: Record<ItemStatus, string> = {
  new: 'Nowe', due: 'Do powtórki', learning: 'W nauce', mastered: 'Opanowane',
};
/** Karta jest „opanowana”, gdy algorytm przewiduje, że pamięć utrzyma się co najmniej 3 tygodnie. */
const MASTERED_STABILITY_DAYS = 21;

function endOfDay(now: Date) {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function itemStatus(state: CardState | undefined, now: Date): ItemStatus {
  if (!state) return 'new';
  if (state.card.due <= endOfDay(now)) return 'due';
  return state.card.stability >= MASTERED_STABILITY_DAYS ? 'mastered' : 'learning';
}

/** Samoocena z checklisty: jaka część punktów kluczowych padła → ocena dla algorytmu. */
export function gradeFromChecklist(checked: number, total: number): Grade | null {
  if (total <= 0) return null;
  const pct = checked / total;
  if (pct < 0.4) return 1;
  if (pct < 0.7) return 2;
  if (pct < 0.9) return 3;
  return 4;
}

/**
 * Słabość obszaru (działu, epoki) 0–1: odsetek odpowiedzi „Nie umiem”/„Trudne”
 * wśród ostatnich odpowiedzi z tego obszaru, wygładzony, żeby 1 odpowiedź nie przesądzała.
 */
export function groupWeakness(reviews: ReviewLog[], deck: Deck, groupOf: (id: string) => string | undefined, lastN = 30) {
  const byGroup = new Map<string, Grade[]>();
  for (const r of reviews) {
    if (r.itemType !== deck || !countsForSrs(r)) continue;
    const g = groupOf(r.itemId);
    if (!g) continue;
    const list = byGroup.get(g) ?? [];
    list.push(r.grade);
    byGroup.set(g, list);
  }
  const out = new Map<string, number>();
  for (const [g, grades] of byGroup) {
    const recent = grades.slice(-lastN);
    const weak = recent.filter((x) => x <= 2).length;
    out.set(g, (weak + 1) / (recent.length + 3)); // wygładzenie Laplace'a (prior ≈ 0,33)
  }
  return out;
}

export interface QueueInput {
  deck: Deck;
  /** wszystkie pozycje talii w kolejności programu */
  ids: string[];
  groupOf: (id: string) => string | undefined;
  states: Map<string, CardState>;
  reviews: ReviewLog[];
  now: Date;
  reviewLimit: number;
  newLimit: number;
  /** nowe pozycje z bieżącego tygodnia harmonogramu — wchodzą jako pierwsze */
  preferredNew?: string[];
}

export interface Queue {
  due: string[];
  fresh: string[];
  /** ile powtórek czeka łącznie (także ponad limit) */
  dueTotal: number;
  doneToday: number;
}

export function buildQueue(q: QueueInput): Queue {
  const today = toDay(q.now);
  const firstSeen = new Map<string, string>();
  let reviewsToday = 0;
  const seenToday = new Set<string>();
  for (const r of [...q.reviews].sort((a, b) => a.date.localeCompare(b.date))) {
    if (r.itemType !== q.deck || !countsForSrs(r)) continue;
    if (!firstSeen.has(r.itemId)) firstSeen.set(r.itemId, toDay(new Date(r.date)));
    if (toDay(new Date(r.date)) === today) { reviewsToday++; seenToday.add(r.itemId); }
  }
  const newToday = [...firstSeen.values()].filter((d) => d === today).length;
  const remainingReview = Math.max(0, q.reviewLimit - (reviewsToday - newToday));
  const remainingNew = Math.max(0, q.newLimit - newToday);

  const weakness = groupWeakness(q.reviews, q.deck, q.groupOf);
  const eod = endOfDay(q.now);
  const due = q.ids
    .map((id) => ({ id, st: q.states.get(itemKey(q.deck, id)) }))
    .filter((x) => x.st && x.st.card.due <= eod && !seenToday.has(x.id))
    .sort((a, b) =>
      (weakness.get(q.groupOf(b.id) ?? '') ?? 0) - (weakness.get(q.groupOf(a.id) ?? '') ?? 0)
      || a.st!.card.due.getTime() - b.st!.card.due.getTime())
    .map((x) => x.id);

  const isNew = (id: string) => !q.states.has(itemKey(q.deck, id));
  const preferred = (q.preferredNew ?? []).filter(isNew);
  const fresh = [...new Set([...preferred, ...q.ids.filter(isNew)])].slice(0, remainingNew);

  return { due: due.slice(0, remainingReview), fresh, dueTotal: due.length, doneToday: reviewsToday };
}

/** Przeplata dwie listy (interleaving): a1, b1, a2, b2, … */
export function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

/** Tasowanie Fishera–Yatesa; rng do testów. */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function nextDueLabel(state: CardState | undefined, now: Date): string {
  if (!state) return 'jeszcze nie ćwiczone';
  const days = Math.round((state.card.due.getTime() - now.getTime()) / 86_400_000);
  if (days <= 0) return 'powtórka dziś';
  if (days === 1) return 'powtórka jutro';
  return `powtórka za ${days} dni`;
}
