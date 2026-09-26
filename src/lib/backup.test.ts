import { describe, expect, it } from 'vitest';
import { emptyProgress, type ProgressData, type ReviewLog } from '../store/model';
import { BACKUP_APP_ID, createBackup, mergeProgress, normalizeProgress, parseBackup } from './backup';

const review = (itemId: string, date: string, grade: 1 | 2 | 3 | 4 = 3): ReviewLog => ({
  itemId, itemType: 'question', date, grade, timeSpent: 42, mode: 'question',
});

function sample(): ProgressData {
  const p = emptyProgress();
  p.reviews = [review('I-01', '2026-10-01T10:00:00.000Z'), review('III-12', '2026-10-02T10:00:00.000Z', 1)];
  p.settings = { ...p.settings, startDate: '2026-10-01', examDate: '2027-01-07', theme: 'dark' };
  p.scheduleDone = { 'w1:t0': true };
  p.diagnostics = [{ date: '2026-09-30', total: 14, points: { '1': 1, '26a': 1 } }];
  p.analyses = [{ date: '2026-10-02T18:00:00.000Z', artworkId: 'stanczyk', unknown: false, checked: [1, 2, 3, 7], seconds: 185 }];
  p.exams = [{ date: '2026-10-03T18:00:00.000Z', prepSeconds: 180, questions: [{ id: 'IV-01', keyPointsHit: 4, keyPointsTotal: 5, structure: [1, 2, 3], seconds: 140 }] }];
  return p;
}

describe('kopia zapasowa', () => {
  it('eksport → import zwraca identyczne dane', () => {
    const data = sample();
    const text = JSON.stringify(createBackup(data, new Date('2026-10-03T12:00:00Z')));
    const res = parseBackup(text);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.backup.progress).toEqual(data);
    expect(res.backup.exportedAt).toBe('2026-10-03T12:00:00.000Z');
    expect(res.skipped).toBe(0);
  });

  it('odrzuca plik, który nie jest JSON-em', () => {
    const res = parseBackup('to nie json');
    expect(res.ok).toBe(false);
  });

  it('odrzuca JSON z innej aplikacji', () => {
    const res = parseBackup(JSON.stringify({ app: 'cos-innego', version: 1, progress: {} }));
    expect(res).toEqual({ ok: false, error: expect.stringContaining('nie jest kopią') });
  });

  it('odrzuca nieznaną wersję', () => {
    const res = parseBackup(JSON.stringify({ app: BACKUP_APP_ID, version: 2, progress: {} }));
    expect(res.ok).toBe(false);
  });

  it('pomija uszkodzone wpisy, zamiast odrzucać cały plik', () => {
    const data = sample() as unknown as { reviews: unknown[] };
    data.reviews.push({ itemId: 'X', grade: 7 }, 'śmieć', null);
    (data as unknown as { exams: unknown[] }).exams.push({ date: 'x', questions: 'zle' });
    const res = parseBackup(JSON.stringify({ app: BACKUP_APP_ID, version: 1, progress: data }));
    expect(res.ok && res.skipped).toBe(4);
    expect(res.ok && res.backup.progress.exams).toHaveLength(1);
    expect(res.ok && res.backup.progress.reviews).toHaveLength(2);
  });
});

describe('normalizeProgress', () => {
  it('z pustych lub błędnych danych robi pusty postęp z domyślnymi ustawieniami', () => {
    expect(normalizeProgress(undefined).data).toEqual(emptyProgress());
    expect(normalizeProgress('xyz').data).toEqual(emptyProgress());
  });

  it('ignoruje niepoprawne ustawienia i zostawia domyślne', () => {
    const { data } = normalizeProgress({ settings: { startDate: '1 października', dailyNewLimit: -5, theme: 'różowy' } });
    expect(data.settings).toEqual(emptyProgress().settings);
  });
});

describe('mergeProgress', () => {
  it('łączy historię bez duplikatów i sortuje po dacie', () => {
    const phone = sample();
    const laptop = sample();
    laptop.reviews.push(review('II-03', '2026-09-29T08:00:00.000Z'));
    laptop.scheduleDone = { 'w2:t1': true };
    const merged = mergeProgress(phone, laptop);
    expect(merged.reviews.map((r) => r.itemId)).toEqual(['II-03', 'I-01', 'III-12']);
    expect(merged.scheduleDone).toEqual({ 'w1:t0': true, 'w2:t1': true });
    expect(merged.diagnostics).toHaveLength(1);
  });

  it('łączy analizy i egzaminy bez duplikatów', () => {
    const a = sample();
    const b = sample();
    b.analyses.push({ date: '2026-10-05T18:00:00.000Z', artworkId: 'dawid', unknown: true, checked: [], seconds: 60 });
    const merged = mergeProgress(a, b);
    expect(merged.analyses.map((x) => x.artworkId)).toEqual(['stanczyk', 'dawid']);
    expect(merged.exams).toHaveLength(1);
  });

  it('ustawienia bierze z importowanego pliku', () => {
    const a = sample();
    const b = sample();
    b.settings.dailyReviewLimit = 35;
    expect(mergeProgress(a, b).settings.dailyReviewLimit).toBe(35);
  });
});
