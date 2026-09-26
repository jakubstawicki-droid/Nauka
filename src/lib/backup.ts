import {
  DEFAULT_SETTINGS, emptyProgress, type AnalysisResult, type DiagnosticResult, type ExamResult, type ProgressData,
  type ReviewLog, type Settings,
} from '../store/model';

export const BACKUP_APP_ID = 'gerson-historia-sztuki';

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  version: 1;
  exportedAt: string;
  progress: ProgressData;
}

export function createBackup(progress: ProgressData, now = new Date()): BackupFile {
  return { app: BACKUP_APP_ID, version: 1, exportedAt: now.toISOString(), progress };
}

export function backupFileName(now = new Date()) {
  return `gerson-postep-${now.toISOString().slice(0, 10)}.json`;
}

const GRADES = new Set([1, 2, 3, 4]);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isDay = (v: unknown) => v === null || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v));

function parseReview(r: unknown): ReviewLog | null {
  if (!isObj(r)) return null;
  const { itemId, itemType, date, grade, timeSpent, mode } = r;
  if (typeof itemId !== 'string' || typeof itemType !== 'string' || typeof mode !== 'string') return null;
  if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) return null;
  if (typeof grade !== 'number' || !GRADES.has(grade)) return null;
  if (typeof timeSpent !== 'number' || timeSpent < 0) return null;
  return { itemId, itemType, date, grade, timeSpent, mode } as ReviewLog;
}

function parseSettings(s: unknown): Settings {
  const out = { ...DEFAULT_SETTINGS };
  if (!isObj(s)) return out;
  if (isDay(s.startDate)) out.startDate = s.startDate as string | null;
  if (isDay(s.examDate)) out.examDate = s.examDate as string | null;
  if (typeof s.dailyReviewLimit === 'number' && s.dailyReviewLimit >= 0) out.dailyReviewLimit = Math.round(s.dailyReviewLimit);
  if (typeof s.dailyNewLimit === 'number' && s.dailyNewLimit >= 0) out.dailyNewLimit = Math.round(s.dailyNewLimit);
  if (typeof s.artworkReviewLimit === 'number' && s.artworkReviewLimit >= 0) out.artworkReviewLimit = Math.round(s.artworkReviewLimit);
  if (typeof s.artworkNewLimit === 'number' && s.artworkNewLimit >= 0) out.artworkNewLimit = Math.round(s.artworkNewLimit);
  if (s.theme === 'light' || s.theme === 'dark' || s.theme === 'system') out.theme = s.theme;
  return out;
}

function parseDiagnostic(d: unknown): DiagnosticResult | null {
  if (!isObj(d) || typeof d.date !== 'string' || typeof d.total !== 'number' || !isObj(d.points)) return null;
  const points: Record<string, number> = {};
  for (const [k, v] of Object.entries(d.points)) if (typeof v === 'number') points[k] = v;
  return { date: d.date, total: d.total, points };
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const numList = (v: unknown) => (Array.isArray(v) ? v.filter(isNum) : null);

function parseAnalysis(a: unknown): AnalysisResult | null {
  if (!isObj(a) || typeof a.date !== 'string' || typeof a.artworkId !== 'string') return null;
  const checked = numList(a.checked);
  if (!checked || !isNum(a.seconds)) return null;
  return { date: a.date, artworkId: a.artworkId, unknown: a.unknown === true, checked, seconds: a.seconds };
}

function parseExam(e: unknown): ExamResult | null {
  if (!isObj(e) || typeof e.date !== 'string' || !Array.isArray(e.questions) || !isNum(e.prepSeconds)) return null;
  const questions: ExamResult['questions'] = [];
  for (const q of e.questions) {
    if (!isObj(q) || typeof q.id !== 'string' || !isNum(q.keyPointsHit) || !isNum(q.keyPointsTotal) || !isNum(q.seconds)) return null;
    questions.push({ id: q.id, keyPointsHit: q.keyPointsHit, keyPointsTotal: q.keyPointsTotal, structure: numList(q.structure) ?? [], seconds: q.seconds });
  }
  return { date: e.date, questions, prepSeconds: e.prepSeconds };
}

/**
 * Normalizuje dowolne dane postępu (z pliku lub ze starszej wersji zapisu):
 * odrzuca uszkodzone wpisy zamiast wywracać całą aplikację.
 */
export function normalizeProgress(raw: unknown): { data: ProgressData; skipped: number } {
  const data = emptyProgress();
  let skipped = 0;
  if (!isObj(raw)) return { data, skipped };
  if (Array.isArray(raw.reviews)) {
    for (const r of raw.reviews) {
      const ok = parseReview(r);
      if (ok) data.reviews.push(ok); else skipped++;
    }
  }
  data.settings = parseSettings(raw.settings);
  if (isObj(raw.scheduleDone)) {
    for (const [k, v] of Object.entries(raw.scheduleDone)) if (v === true) data.scheduleDone[k] = true;
  }
  if (Array.isArray(raw.diagnostics)) {
    for (const d of raw.diagnostics) {
      const ok = parseDiagnostic(d);
      if (ok) data.diagnostics.push(ok); else skipped++;
    }
  }
  if (Array.isArray(raw.analyses)) {
    for (const a of raw.analyses) {
      const ok = parseAnalysis(a);
      if (ok) data.analyses.push(ok); else skipped++;
    }
  }
  if (Array.isArray(raw.exams)) {
    for (const e of raw.exams) {
      const ok = parseExam(e);
      if (ok) data.exams.push(ok); else skipped++;
    }
  }
  return { data, skipped };
}

export type ParseResult =
  | { ok: true; backup: BackupFile; skipped: number }
  | { ok: false; error: string };

export function parseBackup(text: string): ParseResult {
  let json: unknown;
  try { json = JSON.parse(text); } catch { return { ok: false, error: 'To nie jest poprawny plik JSON.' }; }
  if (!isObj(json) || json.app !== BACKUP_APP_ID) {
    return { ok: false, error: 'Ten plik nie jest kopią zapasową tej aplikacji.' };
  }
  if (json.version !== 1) {
    return { ok: false, error: `Nieobsługiwana wersja kopii (${String(json.version)}). Zaktualizuj aplikację.` };
  }
  const { data, skipped } = normalizeProgress(json.progress);
  return {
    ok: true,
    skipped,
    backup: { app: BACKUP_APP_ID, version: 1, exportedAt: String(json.exportedAt ?? ''), progress: data },
  };
}

const reviewKey = (r: ReviewLog) => `${r.itemType}|${r.itemId}|${r.date}|${r.mode}`;

/**
 * Łączy dwa zapisy postępu (np. telefon + komputer): historia odpowiedzi i testów
 * jest sumowana bez duplikatów, ustawienia pochodzą z pliku importowanego.
 */
export function mergeProgress(current: ProgressData, incoming: ProgressData): ProgressData {
  const seen = new Set(current.reviews.map(reviewKey));
  const reviews = [...current.reviews];
  for (const r of incoming.reviews) if (!seen.has(reviewKey(r))) { reviews.push(r); seen.add(reviewKey(r)); }
  reviews.sort((a, b) => a.date.localeCompare(b.date));

  return {
    version: 1,
    reviews,
    settings: { ...incoming.settings },
    scheduleDone: { ...current.scheduleDone, ...incoming.scheduleDone },
    diagnostics: unionByDate(current.diagnostics, incoming.diagnostics),
    analyses: unionByDate(current.analyses, incoming.analyses),
    exams: unionByDate(current.exams, incoming.exams),
  };
}

function unionByDate<T extends { date: string }>(a: T[], b: T[]): T[] {
  const seen = new Set(a.map((x) => x.date));
  return [...a, ...b.filter((x) => !seen.has(x.date))].sort((x, y) => x.date.localeCompare(y.date));
}
