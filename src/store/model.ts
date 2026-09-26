/** Ocena odpowiedzi — ta sama skala co w algorytmie powtórek (FSRS). */
export type Grade = 1 | 2 | 3 | 4;
export const GRADE_LABELS: Record<Grade, string> = { 1: 'Nie umiem', 2: 'Trudne', 3: 'Dobrze', 4: 'Łatwe' };

export type ItemType = 'question' | 'artwork' | 'term' | 'analysis' | 'exam' | 'quiz';
export type StudyMode = 'question' | 'flashcard' | 'flashcard-fast' | 'quiz' | 'analysis' | 'exam' | 'mixed';

/** Jeden zapis odpowiedzi lub fiszki. */
export interface ReviewLog {
  itemId: string;
  itemType: ItemType;
  /** ISO 8601 */
  date: string;
  grade: Grade;
  /** sekundy */
  timeSpent: number;
  mode: StudyMode;
}

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  /** YYYY-MM-DD — pierwszy dzień tygodnia 1 */
  startDate: string | null;
  /** YYYY-MM-DD */
  examDate: string | null;
  /** pytania: limit powtórek i nowych dziennie */
  dailyReviewLimit: number;
  dailyNewLimit: number;
  /** karty dzieł: limit powtórek i nowych dziennie */
  artworkReviewLimit: number;
  artworkNewLimit: number;
  theme: Theme;
}

export interface DiagnosticResult {
  date: string;
  /** klucz zadania (np. "12" albo "26b") → punkty */
  points: Record<string, number>;
  total: number;
}

/** Jedna analiza dzieła w trenerze. */
export interface AnalysisResult {
  date: string;
  artworkId: string;
  /** tryb „dzieło nieznane” (tytuł i autor ukryte do końca) */
  unknown: boolean;
  /** numery odhaczonych punktów karty oceny (1–12) */
  checked: number[];
  seconds: number;
}

/** Jeden egzamin próbny: zestaw trzech pytań. */
export interface ExamResult {
  date: string;
  questions: {
    id: string;
    /** ile punktów „Musi paść” padło */
    keyPointsHit: number;
    keyPointsTotal: number;
    /** które elementy szkieletu wypowiedzi (1–4: teza, rozwinięcie, przykład, zamknięcie) się pojawiły */
    structure: number[];
    seconds: number;
  }[];
  prepSeconds: number;
}

export interface ProgressData {
  version: 1;
  reviews: ReviewLog[];
  settings: Settings;
  /** odhaczone zadania harmonogramu, klucz np. "w3:t1" */
  scheduleDone: Record<string, boolean>;
  diagnostics: DiagnosticResult[];
  analyses: AnalysisResult[];
  exams: ExamResult[];
}

export const DEFAULT_SETTINGS: Settings = {
  startDate: null,
  examDate: null,
  // ok. 30 min: pytanie z odpowiedzią na głos to 2–3 min, rozpoznanie dzieła kilkanaście sekund
  dailyReviewLimit: 8,
  dailyNewLimit: 3,
  artworkReviewLimit: 15,
  artworkNewLimit: 5,
  theme: 'system',
};

export function emptyProgress(): ProgressData {
  return { version: 1, reviews: [], settings: { ...DEFAULT_SETTINGS }, scheduleDone: {}, diagnostics: [], analyses: [], exams: [] };
}
