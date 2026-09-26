import { describe, expect, it } from 'vitest';
import type { AnalysisResult, ReviewLog } from '../store/model';
import { analysisStepRates, daysInWeek, quizAccuracyByWeek, streak, studyDays, studyMinutes } from './stats';

const r = (date: string, over: Partial<ReviewLog> = {}): ReviewLog =>
  ({ itemId: 'I-01', itemType: 'question', date, grade: 3, timeSpent: 60, mode: 'question', ...over });

describe('seria dni nauki', () => {
  it('dwa dni wolne nie przerywają serii', () => {
    const days = ['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06'];
    expect(streak(days, '2026-10-06')).toBe(4);
    expect(streak(days, '2026-10-09')).toBe(4); // 3 dni od ostatniej nauki: 2 wolne + dziś
  });
  it('trzy dni wolne pod rząd zaczynają serię od nowa', () => {
    expect(streak(['2026-10-01', '2026-10-05', '2026-10-06'], '2026-10-06')).toBe(2);
    expect(streak(['2026-10-01'], '2026-10-06')).toBe(0);
    expect(streak([], '2026-10-06')).toBe(0);
  });
});

describe('dni i minuty', () => {
  it('liczy unikalne dni nauki i dni w tygodniu programu', () => {
    const days = studyDays([r('2026-10-05T08:00:00'), r('2026-10-05T19:00:00'), r('2026-10-07T10:00:00'), r('2026-10-13T10:00:00')]);
    expect(days).toEqual(['2026-10-05', '2026-10-07', '2026-10-13']);
    expect(daysInWeek(days, '2026-10-05')).toBe(2);
  });
  it('sumuje czas odpowiedzi i analiz', () => {
    const a: AnalysisResult = { date: '2026-10-05T10:00:00', artworkId: 'x', unknown: false, checked: [], seconds: 180 };
    expect(studyMinutes([r('2026-10-05T08:00:00'), r('2026-10-05T09:00:00')], [a])).toBe(5);
  });
});

describe('trafność quizów', () => {
  it('grupuje po tygodniach od poniedziałku', () => {
    const q = (date: string, grade: 1 | 3) => r(date, { itemType: 'quiz', mode: 'quiz', grade });
    expect(quizAccuracyByWeek([q('2026-10-05T10:00:00', 3), q('2026-10-11T10:00:00', 1), q('2026-10-12T10:00:00', 3)])).toEqual([
      { week: '2026-10-05', right: 1, total: 2 },
      { week: '2026-10-12', right: 1, total: 1 },
    ]);
  });
});

describe('kroki analizy', () => {
  it('krok 4 wymaga obu punktów karty (przestrzeń i światło)', () => {
    const a = (checked: number[]): AnalysisResult => ({ date: 'x', artworkId: 'x', unknown: false, checked, seconds: 1 });
    const rates = analysisStepRates([a([1, 4, 5]), a([1, 4])]);
    expect(rates.find((s) => s.n === 1)!.rate).toBe(1);
    expect(rates.find((s) => s.n === 4)!.rate).toBe(0.5);
    expect(rates.find((s) => s.n === 6)!.rate).toBe(0);
    expect(analysisStepRates([])[0].rate).toBeNull();
  });
});
