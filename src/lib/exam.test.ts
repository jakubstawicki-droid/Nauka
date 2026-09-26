import { describe, expect, it } from 'vitest';
import { examRules } from '../data';
import { drawExamSet, examScore } from './exam';

describe('drawExamSet', () => {
  it('3 pytania z różnych działów, zawsze jedno o artyście „nazwanym” przez szkołę', () => {
    for (let seed = 1; seed <= 200; seed++) {
      let x = seed;
      const rng = () => ((x = (x * 16807) % 2147483647) / 2147483647);
      const set = drawExamSet(rng);
      expect(set).toHaveLength(3);
      expect(new Set(set.map((q) => q.section)).size).toBe(3);
      expect(set.some((q) => q.tags.some((t) => examRules.namedArtists.includes(t)))).toBe(true);
    }
  });
});

describe('examScore', () => {
  it('liczy średni odsetek punktów kluczowych', () => {
    expect(examScore({ date: 'x', prepSeconds: 180, questions: [
      { id: 'a', keyPointsHit: 5, keyPointsTotal: 5, structure: [], seconds: 1 },
      { id: 'b', keyPointsHit: 0, keyPointsTotal: 4, structure: [], seconds: 1 },
    ] })).toBe(50);
  });
});
