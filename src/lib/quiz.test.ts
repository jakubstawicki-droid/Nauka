import { describe, expect, it } from 'vitest';
import { ARTWORK_PERIODS, artworkById, periods } from '../data';
import { cleanArtist, generateQuiz, orderScore, QUIZZES, type QuizQuestion } from './quiz';
import { approxYear } from './years';

const seeded = (seed: number) => { let x = seed; return () => ((x = (x * 16807) % 2147483647) / 2147483647); };

describe('cleanArtist', () => {
  it('zostawia konkretne nazwiska, odrzuca opisy i anonimy', () => {
    expect(cleanArtist('Jan Matejko')).toBe('Jan Matejko');
    expect(cleanArtist('Augustyn Wincenty Locci (dla Jana III Sobieskiego)')).toBe('Augustyn Wincenty Locci');
    expect(cleanArtist('nieznany (fundacja króla Teodoryka)')).toBeNull();
    expect(cleanArtist('Donato Bramante, Michał Anioł (kopuła)')).toBeNull();
  });
});

describe('generateQuiz', () => {
  for (const { kind, length } of QUIZZES) {
    it(`${kind}: poprawne pytania dla 25 losowań`, () => {
      for (let seed = 1; seed <= 25; seed++) {
        const qs = generateQuiz(kind, seeded(seed));
        expect(qs).toHaveLength(length);
        expect(new Set(qs.map((q) => q.targetId)).size).toBe(length);
        for (const q of qs) check(q);
      }
    });
  }
});

function check(q: QuizQuestion) {
  if (q.type === 'choice') {
    const expected = q.kind === 'graphic-techniques' || q.kind === 'orders' ? 3 : 4;
    expect(q.options).toHaveLength(expected);
    expect(new Set(q.options).size).toBe(expected);
    expect(q.correct).toBeGreaterThanOrEqual(0);
    const right = q.options[q.correct];
    if (q.kind === 'artwork-author') expect(right).toBe(cleanArtist(artworkById.get(q.targetId)!.artist));
    if (q.kind === 'artwork-period') expect(right).toBe(artworkById.get(q.targetId)!.period);
    if (q.kind === 'recognize') expect(right).toBe(artworkById.get(q.targetId)!.title);
    if (q.kind === 'artwork-period') for (const o of q.options) expect(ARTWORK_PERIODS).toContain(o);
    return;
  }
  expect(q.items.length).toBeGreaterThanOrEqual(4);
  expect(orderScore(q.start)).toBeLessThan(q.items.length);
  if (q.kind === 'chrono-periods') {
    const idx = q.items.map((i) => periods.findIndex((p) => p.name === i.id));
    expect(idx).toEqual([...idx].sort((a, b) => a - b));
  } else {
    const years = q.items.map((i) => approxYear(artworkById.get(i.id)!.date)!);
    for (let i = 1; i < years.length; i++) expect(years[i] - years[i - 1]).toBeGreaterThanOrEqual(50);
  }
}

describe('orderScore', () => {
  it('liczy elementy na właściwym miejscu', () => {
    expect(orderScore([0, 1, 2])).toBe(3);
    expect(orderScore([1, 0, 2])).toBe(1);
  });
});
