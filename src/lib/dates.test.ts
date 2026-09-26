import { describe, expect, it } from 'vitest';
import { addDays, currentWeek, dayOfWeek, daysBetween, startFromExam } from './dates';

describe('daty harmonogramu', () => {
  it('liczy dni między datami, także przez zmianę czasu', () => {
    expect(daysBetween('2026-10-20', '2026-11-03')).toBe(14);
    expect(daysBetween('2027-03-20', '2027-04-03')).toBe(14);
  });

  it('wylicza start 14 tygodni przed egzaminem', () => {
    expect(startFromExam('2027-01-14')).toBe('2026-10-08');
    expect(daysBetween(startFromExam('2027-06-10'), '2027-06-10')).toBe(98);
  });

  it('numeruje tygodnie programu', () => {
    const start = '2026-10-05';
    expect(currentWeek(null, start)).toBeNull();
    expect(currentWeek(start, '2026-10-04')).toBe(0);
    expect(currentWeek(start, start)).toBe(1);
    expect(currentWeek(start, addDays(start, 6))).toBe(1);
    expect(currentWeek(start, addDays(start, 7))).toBe(2);
    expect(currentWeek(start, addDays(start, 97))).toBe(14);
    expect(currentWeek(start, addDays(start, 98))).toBe(15);
    expect(currentWeek(start, addDays(start, 400))).toBe(15);
  });

  it('podaje dzień tygodnia programu', () => {
    expect(dayOfWeek('2026-10-05', '2026-10-05')).toBe(1);
    expect(dayOfWeek('2026-10-05', '2026-10-11')).toBe(7);
    expect(dayOfWeek('2026-10-05', '2026-10-04')).toBeNull();
  });
});
