import { createStore, del, get, keys, set, type UseStore } from 'idb-keyval';
import type { StorageAdapter, StorageKind } from './StorageAdapter';

const PREFIX = 'gerson:';

export class IdbAdapter implements StorageAdapter {
  readonly kind: StorageKind = 'indexeddb';
  constructor(private store: UseStore) {}
  async get<T>(key: string) {
    try { return (await get(key, this.store)) as T | undefined; } catch { return undefined; }
  }
  async set(key: string, value: unknown) {
    try { await set(key, value, this.store); return true; } catch { return false; }
  }
  async del(key: string) {
    try { await del(key, this.store); return true; } catch { return false; }
  }
  async keys() {
    try { return (await keys(this.store)).map(String); } catch { return []; }
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  readonly kind: StorageKind = 'localstorage';
  async get<T>(key: string) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? undefined : (JSON.parse(raw) as T);
    } catch { return undefined; }
  }
  async set(key: string, value: unknown) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch { return false; }
  }
  async del(key: string) {
    try { localStorage.removeItem(PREFIX + key); return true; } catch { return false; }
  }
  async keys() {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length));
    } catch { return []; }
  }
}

export class MemoryAdapter implements StorageAdapter {
  readonly kind: StorageKind = 'memory';
  private data = new Map<string, unknown>();
  async get<T>(key: string) { return structuredClone(this.data.get(key)) as T | undefined; }
  async set(key: string, value: unknown) { this.data.set(key, structuredClone(value)); return true; }
  async del(key: string) { this.data.delete(key); return true; }
  async keys() { return [...this.data.keys()]; }
}

/** Sprawdza, czy adapter faktycznie zapisuje i odczytuje dane. */
async function works(a: StorageAdapter) {
  const probe = `__probe_${Math.random().toString(36).slice(2)}`;
  try {
    if (!(await a.set(probe, 1))) return false;
    const ok = (await a.get<number>(probe)) === 1;
    await a.del(probe);
    return ok;
  } catch { return false; }
}

/** Wybiera najlepszy dostępny zapis: IndexedDB → localStorage → pamięć. */
export async function createStorage(dbName = 'gerson', storeName = 'kv'): Promise<StorageAdapter> {
  try {
    if (typeof indexedDB !== 'undefined') {
      const idb = new IdbAdapter(createStore(dbName, storeName));
      if (await works(idb)) return idb;
    }
  } catch { /* przechodzimy do fallbacku */ }
  const ls = new LocalStorageAdapter();
  if (await works(ls)) return ls;
  return new MemoryAdapter();
}
