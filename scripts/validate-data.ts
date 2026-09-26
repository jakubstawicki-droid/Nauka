import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  AnalysisStep, Artwork, Diagnostic, ExamRules, GlossaryTerm, ModelAnalysis,
  Period, Question, ScheduleWeek, Signal,
} from '../src/data/types';

const dataDir = join(import.meta.dirname, '..', 'src', 'data');
const load = <T>(name: string): T => JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as T;

const errors: string[] = [];
const lines: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) errors.push(msg); };
const report = (name: string, actual: number, expected?: number) => {
  const status = expected === undefined ? '' : actual === expected ? ' ✓' : ` ✗ (oczekiwano ${expected})`;
  lines.push(`${name.padEnd(22)} ${String(actual).padStart(4)}${status}`);
  if (expected !== undefined) check(actual === expected, `${name}: ${actual} zamiast ${expected}`);
};

// --- questions.json ---
const questions = load<Question[]>('questions.json');
report('questions.json', questions.length, 150);
const expectedPerSection: Record<string, number> = { I: 32, II: 18, III: 40, IV: 20, V: 18, VI: 8, VII: 8, VIII: 6 };
for (const [sec, n] of Object.entries(expectedPerSection)) {
  const actual = questions.filter((q) => q.section === sec).length;
  report(`  dział ${sec}`, actual, n);
}
check(new Set(questions.map((q) => q.id)).size === questions.length, 'questions.json: zduplikowane id');
for (const q of questions) {
  check(/^[IVX]+-\d{2}$/.test(q.id), `pytanie ${q.id}: niepoprawny format id`);
  check(q.id.startsWith(`${q.section}-`), `pytanie ${q.id}: id nie pasuje do działu ${q.section}`);
  check(q.question.trim() !== '' && q.modelAnswer.trim() !== '', `pytanie ${q.id}: brak treści lub odpowiedzi`);
  check(q.keyPoints.length > 0, `pytanie ${q.id}: brak keyPoints`);
}

// --- artworks.json ---
const artworks = load<Artwork[]>('artworks.json');
report('artworks.json', artworks.length, 110);
check(new Set(artworks.map((a) => a.id)).size === artworks.length, 'artworks.json: zduplikowane id');
for (const a of artworks) {
  check(a.title.trim() !== '' && a.period.trim() !== '', `dzieło ${a.id}: brak tytułu lub epoki`);
  check(a.imageQuery.trim() !== '', `dzieło ${a.id}: brak imageQuery`);
}

// --- analiza dzieła ---
const steps = load<AnalysisStep[]>('analysisSteps.json');
report('analysisSteps.json', steps.length, 9);
steps.forEach((s, i) => {
  check(s.n === i + 1, `krok ${s.n}: zła kolejność`);
  check(s.selfQuestions.length > 0 && s.phrases.length > 0 && s.commonMistake !== '', `krok ${s.n}: niekompletny`);
});

const models = load<ModelAnalysis[]>('modelAnalyses.json');
report('modelAnalyses.json', models.length, 5);
for (const m of models) {
  check(m.steps.length === 9 && m.steps.every((s, i) => s.n === i + 1), `analiza ${m.id}: nie ma 9 kroków`);
}

report('signals.json', load<Signal[]>('signals.json').length, 18);

const rules = load<ExamRules>('examRules.json');
report('examRules: zasady', rules.rules.length, 10);
report('examRules: błędy', rules.analysisMistakes.length, 8);
report('examRules: karta', rules.scorecard.items.length, 12);

// --- pozostałe (z programu przygotowawczego) ---
report('glossary.json', load<GlossaryTerm[]>('glossary.json').length);
check(load<GlossaryTerm[]>('glossary.json').length > 0, 'glossary.json: pusty');
const periods = load<Period[]>('periods.json');
report('periods.json', periods.length);
check(periods.length > 0, 'periods.json: pusty');
const schedule = load<ScheduleWeek[]>('schedule.json');
report('schedule.json', schedule.length, 14);
const questionIds = new Set(questions.map((q) => q.id));
for (const w of schedule) {
  for (const id of w.questionIds) check(questionIds.has(id), `harmonogram tydz. ${w.week}: nieznane pytanie ${id}`);
}
const diagnostic = load<Diagnostic>('diagnostic.json');
report('diagnostic: części', diagnostic.parts.length, 5);
check(diagnostic.parts.reduce((s, p) => s + p.points, 0) === 30, 'diagnostic.json: suma punktów ≠ 30');

console.log(lines.join('\n'));
if (errors.length) {
  console.error(`\n${errors.length} błędów walidacji:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\nDane kompletne ✓');
