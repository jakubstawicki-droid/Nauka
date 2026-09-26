import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  AnalysisStep, Artwork, Diagnostic, ExamRules, GlossaryTerm, ModelAnalysis,
  Period, Question, Schedule, Signal,
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
  check(artworks.some((a) => a.id === m.artworkId), `analiza ${m.id}: nieznana karta dzieła ${m.artworkId}`);
}

report('signals.json', load<Signal[]>('signals.json').length, 18);

const rules = load<ExamRules>('examRules.json');
report('examRules: zasady', rules.rules.length, 10);
report('examRules: szkielet', rules.answerStructure.length, 4);
report('examRules: błędy', rules.analysisMistakes.length, 8);
report('examRules: karta', rules.scorecard.items.length, 12);

// --- kompendium ---
const glossary = load<GlossaryTerm[]>('glossary.json');
report('glossary.json', glossary.length);
check(glossary.length > 0, 'glossary.json: pusty');
check(new Set(glossary.map((g) => g.term)).size === glossary.length, 'glossary.json: zduplikowane terminy');
for (const g of glossary) check(g.definition.trim() !== '', `termin ${g.term}: brak definicji`);

const periods = load<Period[]>('periods.json');
report('periods.json', periods.length, 25);
const artworkPeriods = new Set(artworks.map((a) => a.period));
const mappedPeriods = new Set(periods.flatMap((p) => p.annexPeriods));
for (const p of mappedPeriods) check(artworkPeriods.has(p), `periods.json: nieznana epoka z Aneksu A „${p}”`);

const schedule = load<Schedule>('schedule.json');
report('schedule.json: tygodnie', schedule.weeks.length, 14);
const questionIds = new Set(questions.map((q) => q.id));
const scheduled = new Set<string>();
schedule.weeks.forEach((w, i) => {
  check(w.week === i + 1, `harmonogram: tydzień ${w.week} na pozycji ${i + 1}`);
  for (const id of w.questionIds) {
    check(questionIds.has(id), `harmonogram tydz. ${w.week}: nieznane pytanie ${id}`);
    scheduled.add(id);
  }
  for (const p of w.artworkPeriods) check(artworkPeriods.has(p), `harmonogram tydz. ${w.week}: nieznana epoka „${p}”`);
});
report('  pytania w planie', scheduled.size, 150);

const diagnostic = load<Diagnostic>('diagnostic.json');
report('diagnostic: części', diagnostic.parts.length, 5);
const diagSum = diagnostic.parts.reduce((s, p) => s + p.tasks.reduce((t, x) => t + x.points, 0), 0);
report('diagnostic: punkty', diagSum, 30);
for (const p of diagnostic.parts) {
  check(p.tasks.reduce((t, x) => t + x.points, 0) === p.points, `diagnostic ${p.code}: suma zadań ≠ ${p.points}`);
}

console.log(lines.join('\n'));
if (errors.length) {
  console.error(`\n${errors.length} błędów walidacji:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\nDane kompletne ✓');
