export type SectionCode = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';

export interface Question {
  id: string;
  section: SectionCode;
  sectionTitle: string;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
  followUp: string;
  commonMistake: string;
  tags: string[];
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  period: string;
  domain: string;
  technique: string;
  genre: string;
  location: string;
  isPolish: boolean;
  recognizeBy: string;
  features: string[];
  significance: string;
  question: string;
  imageQuery: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  section: SectionCode;
}

export interface Period {
  name: string;
  dates: string;
  motto: string;
  features: string[];
  keyWorks: string[];
  polishExamples: string[];
}

export interface Signal {
  clue: string;
  period: string;
  dates: string;
}

export interface AnalysisStep {
  n: number;
  name: string;
  goal: string;
  duration: string;
  durationSeconds: number;
  selfQuestions: string[];
  phrases: string[];
  commonMistake: string;
}

export interface ModelAnalysis {
  id: string;
  title: string;
  artist: string;
  date: string;
  domain: string;
  style: string;
  techniqueLocation: string;
  note: string;
  steps: { n: number; stepName: string; text: string }[];
}

export interface ScorecardItem {
  n: number;
  text: string;
  /** Kroki analizy, których dotyczy punkt karty (puste = forma wypowiedzi). */
  steps: number[];
}

export interface ExamRules {
  rules: string[];
  rulesSource?: string;
  analysisMistakes: { title: string; text: string }[];
  scorecard: { instructions: string; passThreshold: number; items: ScorecardItem[] };
  feedbackTip: string;
}

export interface Diagnostic {
  maxPoints: number;
  parts: { code: 'A' | 'B' | 'C' | 'D' | 'E'; title: string; points: number; tasks: unknown[] }[];
  interpretation: { min: number; max: number; text: string }[];
}

export interface ScheduleWeek {
  week: number;
  title: string;
  goals: string[];
  questionIds: string[];
  artworkPeriods: string[];
  specialTasks: string[];
}
