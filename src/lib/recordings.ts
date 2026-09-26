import { createStore, del, get, set } from 'idb-keyval';
import { create } from 'zustand';

/**
 * Nagrania głosu — tylko lokalnie, w IndexedDB (osobna baza). Blobów nie da się sensownie
 * trzymać w localStorage, więc bez IndexedDB nagrania żyją tylko do zamknięcia karty.
 */
export type RecordingKind = 'question' | 'analysis' | 'exam';

export interface RecordingMeta {
  id: string;
  createdAt: string;
  kind: RecordingKind;
  /** id pytania / dzieła / egzaminu */
  refId: string;
  label: string;
  seconds: number;
  mimeType: string;
  size: number;
}

interface BlobStore {
  persistent: boolean;
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, v: unknown): Promise<boolean>;
  del(key: string): Promise<boolean>;
}

function memoryStore(): BlobStore {
  const m = new Map<string, unknown>();
  return {
    persistent: false,
    get: async <T,>(k: string) => m.get(k) as T | undefined,
    set: async (k, v) => { m.set(k, v); return true; },
    del: async (k) => { m.delete(k); return true; },
  };
}

async function openStore(): Promise<BlobStore> {
  try {
    if (typeof indexedDB === 'undefined') return memoryStore();
    const s = createStore('gerson-recordings', 'kv');
    const probe = new Blob(['x'], { type: 'text/plain' });
    await set('__probe', probe, s);
    const back = await get('__probe', s);
    await del('__probe', s);
    if (!back) return memoryStore();
    return {
      persistent: true,
      get: async <T,>(k: string) => { try { return (await get(k, s)) as T | undefined; } catch { return undefined; } },
      set: async (k, v) => { try { await set(k, v, s); return true; } catch { return false; } },
      del: async (k) => { try { await del(k, s); return true; } catch { return false; } },
    };
  } catch {
    return memoryStore();
  }
}

let storeP: Promise<BlobStore> | null = null;
const store = () => (storeP ??= openStore());
const INDEX = 'index';

interface RecordingsState {
  list: RecordingMeta[];
  loaded: boolean;
  persistent: boolean;
  load: () => Promise<void>;
  save: (meta: Omit<RecordingMeta, 'id' | 'createdAt' | 'size'>, blob: Blob) => Promise<RecordingMeta | null>;
  remove: (id: string) => Promise<void>;
  removeAll: () => Promise<void>;
}

export const useRecordings = create<RecordingsState>((setState, getState) => ({
  list: [],
  loaded: false,
  persistent: true,

  async load() {
    if (getState().loaded) return;
    const s = await store();
    const list = (await s.get<RecordingMeta[]>(INDEX)) ?? [];
    setState({ list, loaded: true, persistent: s.persistent });
  },

  async save(meta, blob) {
    await getState().load();
    const s = await store();
    const full: RecordingMeta = {
      ...meta, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), size: blob.size,
    };
    if (!(await s.set(`rec:${full.id}`, blob))) return null;
    const list = [full, ...getState().list];
    await s.set(INDEX, list);
    setState({ list });
    return full;
  },

  async remove(id) {
    const s = await store();
    await s.del(`rec:${id}`);
    const list = getState().list.filter((r) => r.id !== id);
    await s.set(INDEX, list);
    setState({ list });
  },

  async removeAll() {
    const s = await store();
    for (const r of getState().list) await s.del(`rec:${r.id}`);
    await s.set(INDEX, []);
    setState({ list: [] });
  },
}));

export async function getRecordingBlob(id: string): Promise<Blob | undefined> {
  return (await store()).get<Blob>(`rec:${id}`);
}

/** Format nagrania obsługiwany przez przeglądarkę (Chrome/Firefox: webm/ogg, Safari: mp4). */
export function pickMimeType(isSupported: (t: string) => boolean): string {
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg']) {
    if (isSupported(t)) return t;
  }
  return '';
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}
