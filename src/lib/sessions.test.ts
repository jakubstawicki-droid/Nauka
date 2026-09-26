import { describe, expect, it } from 'vitest';
import { questions } from '../data';
import { emptyProgress, type ReviewLog } from '../store/model';
import { itemGroup, mixedSession, orderedSession, todaySession, type SessionContext } from './sessions';
import { replayCards } from './srs';

function ctx(reviews: ReviewLog[] = [], now = new Date('2026-10-07T12:00:00'), startDate: string | null = null): SessionContext {
  const p = emptyProgress();
  return { reviews, states: replayCards(reviews), settings: { ...p.settings, startDate }, now };
}

describe('sesja „Na dziś”', () => {
  it('na start: nowe pytania i dzieła w limitach, przeplatane', () => {
    const s = todaySession(ctx());
    expect(s.filter((i) => i.kind === 'question')).toHaveLength(3);
    expect(s.filter((i) => i.kind === 'artwork')).toHaveLength(5);
    expect(s.slice(0, 4).map((i) => i.kind)).toEqual(['question', 'artwork', 'question', 'artwork']);
  });

  it('nowe pytania biorą się z bieżącego tygodnia harmonogramu', () => {
    // start 2026-09-16 → 2026-10-07 to tydzień 4: pytania III-01… i V-01…
    const s = todaySession(ctx([], new Date('2026-10-07T12:00:00'), '2026-09-16'));
    const q = s.filter((i) => i.kind === 'question').map((i) => i.id);
    expect(q).toEqual(['III-01', 'III-02', 'III-03']);
    const a = s.filter((i) => i.kind === 'artwork').map((i) => i.id);
    expect(a[0]).toBe('malowidla-naskalne-w-jaskini-lascaux-m-in-sala-bykow');
  });
});

describe('sesja uporządkowana', () => {
  it('zaległe → nowe → pozostałe', () => {
    const reviews: ReviewLog[] = [
      { itemId: 'I-02', itemType: 'question', date: '2026-09-01T10:00:00Z', grade: 1, timeSpent: 10, mode: 'question' },
      { itemId: 'I-03', itemType: 'question', date: '2026-10-07T10:00:00Z', grade: 4, timeSpent: 10, mode: 'question' },
    ];
    const s = orderedSession('question', ['I-01', 'I-02', 'I-03'], ctx(reviews));
    expect(s.map((i) => i.id)).toEqual(['I-02', 'I-01', 'I-03']);
  });
});

describe('tryb mieszany', () => {
  it('przeplata pytania z dziełami i nie powtarza obszaru pod rząd', () => {
    for (let seed = 1; seed < 30; seed++) {
      let x = seed;
      const rng = () => ((x = (x * 16807) % 2147483647) / 2147483647);
      const s = mixedSession(12, rng);
      expect(s).toHaveLength(12);
      expect(new Set(s.map((i) => `${i.kind}:${i.id}`)).size).toBe(12);
      const qGroups = s.filter((i) => i.kind === 'question').map(itemGroup);
      for (let i = 1; i < qGroups.length; i++) expect(qGroups[i]).not.toBe(qGroups[i - 1]);
    }
    expect(questions.length).toBe(150);
  });
});
