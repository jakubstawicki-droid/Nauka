/**
 * Warstwa zapisu. Aplikacja zna tylko ten interfejs, więc później można dodać
 * np. synchronizację przez Supabase bez zmian w reszcie kodu.
 * Każda metoda musi być odporna na błędy — nigdy nie rzuca wyjątku.
 */
export interface StorageAdapter {
  readonly kind: StorageKind;
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<boolean>;
  del(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
}

export type StorageKind = 'indexeddb' | 'localstorage' | 'memory';

export const STORAGE_LABELS: Record<StorageKind, string> = {
  indexeddb: 'IndexedDB (trwały zapis w przeglądarce)',
  localstorage: 'localStorage (zapis zapasowy)',
  memory: 'tylko w pamięci — postęp zniknie po zamknięciu karty',
};
