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
  /** Podrozdział: środki wyrazu, kompozycja, perspektywa, barwa, techniki, słownik architektoniczny… */
  topic?: string;
}

export interface Period {
  name: string;
  dates: string;
  motto: string;
  features: string[];
  keyWorks: string[];
  polishExamples: string[];
  /** Nagłówki epok z Aneksu A (pole Artwork.period), które należą do tej epoki. */
  annexPeriods: string[];
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
  /** karta dzieła z Aneksu A */
  artworkId: string;
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
  rulesSource: string;
  answerStructure: { n: number; name: string; text: string }[];
  namedArtists: string[];
  lastWeek: string;
  analysisMistakes: { title: string; text: string }[];
  scorecard: { instructions: string; passThreshold: number; items: ScorecardItem[] };
  feedbackTip: string;
}

export interface DiagnosticTask {
  n: number;
  sub?: string;
  text: string;
  points: number;
}

export interface Diagnostic {
  maxPoints: number;
  when: string;
  purpose: string;
  parts: { code: 'A' | 'B' | 'C' | 'D' | 'E'; title: string; instruction: string; points: number; tasks: DiagnosticTask[] }[];
  interpretation: { min: number; max: number; text: string }[];
  retakeNote: string;
}

export interface ScheduleWeek {
  week: number;
  phase: string;
  title: string;
  material: string;
  goals: string[];
  questionIds: string[];
  /** Nagłówki epok z Aneksu A. */
  artworkPeriods: string[];
  artworkCount: number | null;
  polishAccent: string | null;
  artists: string[];
  specialTasks: string[];
}

export interface Schedule {
  assumption: string;
  reminders: string[];
  weeks: ScheduleWeek[];
}

export interface AnalysisGuide {
  intro: string;
  threeMoves: { summary: string; moves: { name: string; role: string; example: string }[]; conclusion: string };
  timing: string;
  mainAdvice: string;
  unknownArtwork: { intro: string; startSteps: { title: string; text: string }[]; dont: string; signalsTip: string };
  trainingPlan: { intro: string; stages: { weeks: number[]; form: string; how: string }[] };
}

export interface MatchingSet {
  prompt: string;
  categories: { name: string; rule: string }[];
  items: { text: string; category: number }[];
}
