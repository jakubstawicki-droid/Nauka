import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryAdapter } from '../storage/adapters';
import { flushProgress, useProgress } from './useProgress';

describe('store postępu', () => {
  let storage: MemoryAdapter;
  beforeEach(async () => {
    storage = new MemoryAdapter();
    await useProgress.getState().init(storage);
    await useProgress.getState().reset();
  });

  it('import (replaceAll) zapisuje od razu, bez czekania na opóźniony zapis', async () => {
    const data = useProgress.getState().snapshot();
    data.settings = { ...data.settings, startDate: '2027-03-04' };
    expect(await useProgress.getState().replaceAll(data)).toBe(true);
    const saved = await storage.get<{ settings: { startDate: string } }>('progress');
    expect(saved?.settings.startDate).toBe('2027-03-04');
  });

  it('zapisuje odpowiedź ze wszystkimi polami i utrwala ją', async () => {
    useProgress.getState().addReview({ itemId: 'I-01', itemType: 'question', grade: 3, timeSpent: 55, mode: 'question' });
    await flushProgress();
    const saved = await storage.get<{ reviews: unknown[] }>('progress');
    expect(saved?.reviews).toEqual([
      expect.objectContaining({ itemId: 'I-01', grade: 3, timeSpent: 55, mode: 'question', date: expect.any(String) }),
    ]);
  });

  it('po ponownym uruchomieniu wczytuje zapisany postęp', async () => {
    useProgress.getState().updateSettings({ startDate: '2026-10-05' });
    useProgress.getState().toggleScheduleTask('w1:t0');
    await flushProgress();
    await useProgress.getState().init(storage);
    const s = useProgress.getState();
    expect(s.settings.startDate).toBe('2026-10-05');
    expect(s.scheduleDone).toEqual({ 'w1:t0': true });
  });

  it('odhaczenie zadania drugi raz je cofa', () => {
    useProgress.getState().toggleScheduleTask('w3:t1');
    useProgress.getState().toggleScheduleTask('w3:t1');
    expect(useProgress.getState().scheduleDone).toEqual({});
  });
});
