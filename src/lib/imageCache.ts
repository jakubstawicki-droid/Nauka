import { imageOverrides } from '../data';
import type { Artwork } from '../data/types';
import { createStorage } from '../storage/adapters';
import type { StorageAdapter } from '../storage/StorageAdapter';
import { resolveImage, type ImageResult } from './images';

const DAY = 86_400_000;
const TTL: Record<ImageResult['status'], number> = { ok: 60 * DAY, none: 14 * DAY, protected: 0, offline: 0 };

interface Cached { result: ImageResult; at: number; override: string | undefined }

let store: Promise<StorageAdapter> | null = null;
const memory = new Map<string, Promise<ImageResult>>();

function cacheStore() {
  store ??= createStorage('gerson-images', 'kv');
  return store;
}

async function load(a: Artwork): Promise<ImageResult> {
  const override = imageOverrides[a.id];
  const s = await cacheStore();
  const cached = await s.get<Cached>(`img:${a.id}`);
  if (cached && cached.override === override && Date.now() - cached.at < TTL[cached.result.status]) return cached.result;

  const result = await resolveImage(a, override, (url) => fetch(url));
  if (TTL[result.status] > 0) await s.set(`img:${a.id}`, { result, at: Date.now(), override } satisfies Cached);
  // brak sieci — spróbuj ponownie przy następnym wyświetleniu
  if (result.status === 'offline') memory.delete(a.id);
  return result;
}

/** Reprodukcja dzieła (z pamięci podręcznej, jeśli już była pobrana). */
export function getArtworkImage(a: Artwork): Promise<ImageResult> {
  let p = memory.get(a.id);
  if (!p) {
    p = load(a);
    memory.set(a.id, p);
  }
  return p;
}
