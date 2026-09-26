import { create } from 'zustand';
import { normalizeProgress } from '../lib/backup';
import { createStorage } from '../storage/adapters';
import type { StorageAdapter, StorageKind } from '../storage/StorageAdapter';
import { emptyProgress, type AnalysisResult, type DiagnosticResult, type ExamResult, type ProgressData, type ReviewLog, type Settings } from './model';

const KEY = 'progress';

interface ProgressStore extends ProgressData {
  ready: boolean;
  storageKind: StorageKind | null;
  /** czy ostatni zapis się powiódł */
  saveOk: boolean;
  init: (adapter?: StorageAdapter) => Promise<void>;
  addReview: (r: Omit<ReviewLog, 'date'> & { date?: string }) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  toggleScheduleTask: (key: string) => void;
  addAnalysis: (a: AnalysisResult) => void;
  addExam: (e: ExamResult) => void;
  addDiagnostic: (d: DiagnosticResult) => void;
  /** Podmienia cały postęp i od razu zapisuje (bez opóźnienia). */
  replaceAll: (data: ProgressData) => Promise<boolean>;
  reset: () => Promise<boolean>;
  snapshot: () => ProgressData;
}

let adapter: StorageAdapter | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useProgress = create<ProgressStore>((setState, getState) => {
  const persist = () => {
    if (!adapter) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const ok = adapter ? await adapter.set(KEY, getState().snapshot()) : false;
      setState({ saveOk: ok });
    }, 250);
  };
  const change = (patch: Partial<ProgressData>) => { setState(patch); persist(); };

  return {
    ...emptyProgress(),
    ready: false,
    storageKind: null,
    saveOk: true,

    async init(custom) {
      adapter = custom ?? (await createStorage());
      const stored = await adapter.get<unknown>(KEY);
      const { data } = normalizeProgress(stored);
      setState({ ...data, ready: true, storageKind: adapter.kind });
    },

    addReview(r) {
      const log: ReviewLog = { ...r, date: r.date ?? new Date().toISOString() };
      change({ reviews: [...getState().reviews, log] });
    },

    updateSettings(patch) {
      change({ settings: { ...getState().settings, ...patch } });
    },

    toggleScheduleTask(key) {
      const done = { ...getState().scheduleDone };
      if (done[key]) delete done[key]; else done[key] = true;
      change({ scheduleDone: done });
    },

    addAnalysis(a) {
      change({ analyses: [...getState().analyses, a] });
    },

    addExam(e) {
      change({ exams: [...getState().exams, e] });
    },

    addDiagnostic(d) {
      change({ diagnostics: [...getState().diagnostics, d] });
    },

    replaceAll(data) {
      setState({ ...data });
      return flushProgress();
    },

    reset() {
      setState(emptyProgress());
      return flushProgress();
    },

    snapshot() {
      const s = getState();
      return { version: 1, reviews: s.reviews, settings: s.settings, scheduleDone: s.scheduleDone, diagnostics: s.diagnostics, analyses: s.analyses, exams: s.exams };
    },
  };
});

/** Wymusza natychmiastowy zapis (np. przed zamknięciem karty). Zwraca, czy się udał. */
export async function flushProgress(): Promise<boolean> {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  if (!adapter) return false;
  const ok = await adapter.set(KEY, useProgress.getState().snapshot());
  useProgress.setState({ saveOk: ok });
  return ok;
}
