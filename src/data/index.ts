import analysisGuideJson from './analysisGuide.json';
import analysisStepsJson from './analysisSteps.json';
import artworksJson from './artworks.json';
import diagnosticJson from './diagnostic.json';
import examRulesJson from './examRules.json';
import glossaryJson from './glossary.json';
import imageOverridesJson from './imageOverrides.json';
import modelAnalysesJson from './modelAnalyses.json';
import periodsJson from './periods.json';
import questionsJson from './questions.json';
import scheduleJson from './schedule.json';
import signalsJson from './signals.json';
import type {
  AnalysisGuide, AnalysisStep, Artwork, Diagnostic, ExamRules, GlossaryTerm, ModelAnalysis,
  Period, Question, Schedule, SectionCode, Signal,
} from './types';

export const questions = questionsJson as Question[];
export const artworks = artworksJson as Artwork[];
export const glossary = glossaryJson as GlossaryTerm[];
export const periods = periodsJson as Period[];
export const signals = signalsJson as Signal[];
export const analysisSteps = analysisStepsJson as AnalysisStep[];
export const analysisGuide = analysisGuideJson as AnalysisGuide;
export const modelAnalyses = modelAnalysesJson as ModelAnalysis[];
export const diagnostic = diagnosticJson as Diagnostic;
export const schedule = scheduleJson as Schedule;
export const examRules = examRulesJson as ExamRules;
export const imageOverrides = imageOverridesJson as Record<string, string>;

export const SECTIONS: { code: SectionCode; title: string }[] = [
  ...new Map(questions.map((q) => [q.section, { code: q.section, title: q.sectionTitle }])).values(),
];

/** Epoki z Aneksu A w kolejności chronologicznej (tak jak ułożone są karty). */
export const ARTWORK_PERIODS: string[] = [...new Set(artworks.map((a) => a.period))];

export const questionById = new Map(questions.map((q) => [q.id, q]));
export const artworkById = new Map(artworks.map((a) => [a.id, a]));

export type { AnalysisStep, Artwork, GlossaryTerm, ModelAnalysis, Period, Question, SectionCode, Signal };
