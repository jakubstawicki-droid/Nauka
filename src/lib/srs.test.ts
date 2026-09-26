import { describe, expect, it } from 'vitest';
import type { Grade, ReviewLog } from '../store/model';
import {
  buildQueue, gradeFromChecklist, groupWeakness, interleave, itemKey, itemStatus, replayCards, shuffle,
} from './srs';

const log = (itemId: string, date: string, grade: Grade, itemType: 'question' | 'artwork' = 'question', mode: ReviewLog['mode'] = 'question'): ReviewLog =>
  ({ itemId, itemType, date, grade, timeSpent: 30, mode });

describe('gradeFromChecklist', () => {
  it('mapuje procent trafionych punktów na ocenę', () => {
    expect(gradeFromChecklist(0, 5)).toBe(1);
    expect(gradeFromChecklist(1, 5)).toBe(1); // 20%
    expect(gradeFromChecklist(2, 5)).toBe(2); // 40%
    expect(gradeFromChecklist(3, 5)).toBe(2); // 60%
    expect(gradeFromChecklist(7, 10)).toBe(3); // 70%
    expect(gradeFromChecklist(4, 5)).toBe(3); // 80%
    expect(gradeFromChecklist(9, 10)).toBe(4); // 90%
    expect(gradeFromChecklist(5, 5)).toBe(4);
    expect(gradeFromChecklist(0, 0)).toBeNull();
  });
});

describe('replayCards', () => {
  it('odtwarza stan karty z historii niezależnie od kolejności wpisów', () => {
    const a = [log('I-01', '2026-10-01T10:00:00Z', 3), log('I-01', '2026-10-04T10:00:00Z', 3)];
    const s1 = replayCards(a).get(itemKey('question', 'I-01'))!;
    const s2 = replayCards([...a].reverse()).get(itemKey('question', 'I-01'))!;
    expect(s1.reviews).toBe(2);
    expect(s1.card.due.getTime()).toBe(s2.card.due.getTime());
    expect(s1.card.due.getTime()).toBeGreaterThan(new Date('2026-10-10').getTime());
  });

  it('„Nie umiem” skraca odstęp względem „Dobrze”', () => {
    const good = replayCards([log('I-01', '2026-10-01T10:00:00Z', 3)]).get('question:I-01')!;
    const again = replayCards([log('I-01', '2026-10-01T10:00:00Z', 1)]).get('question:I-01')!;
    expect(again.card.due.getTime()).toBeLessThan(good.card.due.getTime());
  });

  it('pomija odpowiedzi z quizów i egzaminów oraz rozdziela talie', () => {
    const s = replayCards([
      log('I-01', '2026-10-01T10:00:00Z', 3, 'question', 'exam'),
      log('stanczyk', '2026-10-01T10:00:00Z', 3, 'artwork', 'flashcard'),
    ]);
    expect(s.has('question:I-01')).toBe(false);
    expect(s.has('artwork:stanczyk')).toBe(true);
  });
});

describe('itemStatus', () => {
  it('rozróżnia nowe, do powtórki i w nauce', () => {
    const s = replayCards([log('I-01', '2026-10-01T10:00:00Z', 3)]).get('question:I-01');
    expect(itemStatus(undefined, new Date())).toBe('new');
    expect(itemStatus(s, new Date('2026-10-02T10:00:00Z'))).toBe('learning');
    expect(itemStatus(s, new Date('2026-12-01T10:00:00Z'))).toBe('due');
  });
});

describe('buildQueue', () => {
  const ids = ['I-01', 'I-02', 'I-03', 'II-01', 'II-02', 'II-03'];
  const groupOf = (id: string) => id.split('-')[0];
  const base = { deck: 'question' as const, ids, groupOf, reviewLimit: 20, newLimit: 2 };

  it('bez historii podaje tylko nowe, w limicie i w kolejności programu', () => {
    const q = buildQueue({ ...base, states: new Map(), reviews: [], now: new Date('2026-10-05T12:00:00') });
    expect(q.due).toEqual([]);
    expect(q.fresh).toEqual(['I-01', 'I-02']);
  });

  it('nowe z bieżącego tygodnia mają pierwszeństwo', () => {
    const q = buildQueue({ ...base, states: new Map(), reviews: [], now: new Date('2026-10-05T12:00:00'), preferredNew: ['II-02'] });
    expect(q.fresh).toEqual(['II-02', 'I-01']);
  });

  it('nowe wprowadzone dziś zmniejszają limit nowych', () => {
    const reviews = [log('I-01', '2026-10-05T09:00:00', 3)];
    const q = buildQueue({ ...base, states: replayCards(reviews), reviews, now: new Date('2026-10-05T12:00:00') });
    expect(q.fresh).toEqual(['I-02']);
    expect(q.doneToday).toBe(1);
  });

  it('słabszy dział trafia do powtórek jako pierwszy', () => {
    const reviews = [
      log('I-01', '2026-10-01T10:00:00', 3), log('I-02', '2026-10-01T10:00:00', 3),
      log('II-01', '2026-10-01T10:00:00', 1), log('II-02', '2026-10-01T10:00:00', 2),
    ];
    const q = buildQueue({ ...base, newLimit: 0, states: replayCards(reviews), reviews, now: new Date('2026-12-01T12:00:00') });
    expect(q.due.slice(0, 2).sort()).toEqual(['II-01', 'II-02']);
    expect(q.dueTotal).toBe(4);
  });

  it('respektuje limit powtórek', () => {
    const reviews = ids.map((id) => log(id, '2026-10-01T10:00:00', 3));
    const q = buildQueue({ ...base, reviewLimit: 3, states: replayCards(reviews), reviews, now: new Date('2026-12-01T12:00:00') });
    expect(q.due).toHaveLength(3);
    expect(q.dueTotal).toBe(6);
  });
});

describe('groupWeakness', () => {
  it('rośnie wraz z odsetkiem słabych ocen', () => {
    const w = groupWeakness([log('I-01', 'x', 4), log('I-02', 'x', 4), log('II-01', 'x', 1), log('II-02', 'x', 1)], 'question', (id) => id.split('-')[0]);
    expect(w.get('II')!).toBeGreaterThan(w.get('I')!);
  });
});

describe('interleave i shuffle', () => {
  it('przeplata listy różnej długości', () => {
    expect(interleave<number | string>([1, 2, 3], ['a'])).toEqual([1, 'a', 2, 3]);
  });
  it('tasuje bez gubienia elementów', () => {
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const out = shuffle([1, 2, 3, 4, 5], rng);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
