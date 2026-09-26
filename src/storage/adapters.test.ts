import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStorage, IdbAdapter, LocalStorageAdapter, MemoryAdapter } from './adapters';

describe('wybór zapisu', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); });

  it('używa IndexedDB, gdy jest dostępne', async () => {
    const s = await createStorage('test-db-1');
    expect(s).toBeInstanceOf(IdbAdapter);
    expect(await s.set('k', { a: 1 })).toBe(true);
    expect(await s.get('k')).toEqual({ a: 1 });
  });

  it('przechodzi na localStorage, gdy IndexedDB nie ma', async () => {
    vi.stubGlobal('indexedDB', undefined);
    const s = await createStorage('test-db-2');
    expect(s).toBeInstanceOf(LocalStorageAdapter);
    await s.set('k', [1, 2]);
    expect(await s.get('k')).toEqual([1, 2]);
    expect(await s.keys()).toEqual(['k']);
  });

  it('działa w pamięci, gdy żaden zapis nie jest dostępny', async () => {
    vi.stubGlobal('indexedDB', undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceeded'); });
    const s = await createStorage('test-db-3');
    expect(s).toBeInstanceOf(MemoryAdapter);
    expect(await s.set('k', 1)).toBe(true);
  });

  it('adapter localStorage nie rzuca wyjątków przy błędach', async () => {
    const a = new LocalStorageAdapter();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('SecurityError'); });
    expect(await a.get('x')).toBeUndefined();
    expect(await a.set('x', 1)).toBe(false);
  });

  it('pamięć zwraca kopie, nie referencje', async () => {
    const m = new MemoryAdapter();
    const obj = { a: [1] };
    await m.set('k', obj);
    obj.a.push(2);
    expect(await m.get('k')).toEqual({ a: [1] });
  });
});
