import { artworkById, artworks, questionById, questions, schedule } from '../data';
import type { ReviewLog, Settings } from '../store/model';
import { currentWeek, PROGRAM_WEEKS, toDay } from './dates';
import { buildQueue, interleave, itemKey, shuffle, type CardState, type Deck, type Queue } from './srs';

export interface SessionItem { kind: Deck; id: string }

export interface SessionContext {
  states: Map<string, CardState>;
  reviews: ReviewLog[];
  settings: Settings;
  now: Date;
}

export const questionGroup = (id: string) => questionById.get(id)?.section;
export const artworkGroup = (id: string) => artworkById.get(id)?.period;

function weekPlan(ctx: SessionContext) {
  const w = currentWeek(ctx.settings.startDate, toDay(ctx.now));
  return w && w >= 1 && w <= PROGRAM_WEEKS ? schedule.weeks[w - 1] : null;
}

export function questionQueue(ctx: SessionContext): Queue {
  const plan = weekPlan(ctx);
  return buildQueue({
    deck: 'question', ids: questions.map((q) => q.id), groupOf: questionGroup,
    states: ctx.states, reviews: ctx.reviews, now: ctx.now,
    reviewLimit: ctx.settings.dailyReviewLimit, newLimit: ctx.settings.dailyNewLimit,
    preferredNew: plan?.questionIds,
  });
}

export function artworkQueue(ctx: SessionContext): Queue {
  const plan = weekPlan(ctx);
  const periods = new Set(plan?.artworkPeriods ?? []);
  return buildQueue({
    deck: 'artwork', ids: artworks.map((a) => a.id), groupOf: artworkGroup,
    states: ctx.states, reviews: ctx.reviews, now: ctx.now,
    reviewLimit: ctx.settings.artworkReviewLimit, newLimit: ctx.settings.artworkNewLimit,
    preferredNew: artworks.filter((a) => periods.has(a.period)).map((a) => a.id),
  });
}

const asItems = (kind: Deck, ids: string[]): SessionItem[] => ids.map((id) => ({ kind, id }));

/** Sesja „Na dziś”: powtórki i nowe z obu talii, przeplatane. */
export function todaySession(ctx: SessionContext): SessionItem[] {
  const q = questionQueue(ctx);
  const a = artworkQueue(ctx);
  return interleave(asItems('question', [...q.due, ...q.fresh]), asItems('artwork', [...a.due, ...a.fresh]));
}

export function deckTodaySession(deck: Deck, ctx: SessionContext): SessionItem[] {
  const q = deck === 'question' ? questionQueue(ctx) : artworkQueue(ctx);
  return asItems(deck, [...q.due, ...q.fresh]);
}

/** Wszystkie pozycje z listy: najpierw zaległe, potem nowe, potem pozostałe wg terminu powtórki. */
export function orderedSession(deck: Deck, ids: string[], ctx: SessionContext): SessionItem[] {
  const rank = (id: string) => {
    const st = ctx.states.get(itemKey(deck, id));
    if (!st) return [1, 0];
    const due = st.card.due.getTime();
    return due <= ctx.now.getTime() ? [0, due] : [2, due];
  };
  return asItems(deck, [...ids].sort((x, y) => {
    const [a1, a2] = rank(x);
    const [b1, b2] = rank(y);
    return a1 - b1 || a2 - b2;
  }));
}

/**
 * Przeplatanie (interleaving): pozycje z różnych działów i epok na zmianę, pytania na przemian z dziełami,
 * bez dwóch pozycji z tego samego obszaru pod rząd.
 */
export function mixedSession(n: number, rng: () => number = Math.random): SessionItem[] {
  const pick = (kind: Deck, ids: string[], groupOf: (id: string) => string | undefined, count: number) => {
    const groups = new Map<string, string[]>();
    for (const id of shuffle(ids, rng)) {
      const g = groupOf(id) ?? '?';
      groups.set(g, [...(groups.get(g) ?? []), id]);
    }
    const order = shuffle([...groups.keys()], rng);
    const out: SessionItem[] = [];
    for (let round = 0; out.length < count && round < ids.length; round++) {
      for (const g of order) {
        const id = groups.get(g)![round];
        if (id && out.length < count) out.push({ kind, id });
      }
    }
    return out;
  };
  const nq = Math.ceil(n / 2);
  return interleave(
    pick('question', questions.map((q) => q.id), questionGroup, nq),
    pick('artwork', artworks.map((a) => a.id), artworkGroup, n - nq),
  );
}

export const itemGroup = (it: SessionItem) => (it.kind === 'question' ? questionGroup(it.id) : artworkGroup(it.id));
