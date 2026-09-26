import { analysisGuide, artworks, schedule } from '../data';
import type { ScheduleWeek } from '../data/types';

export interface WeekTask {
  key: string;
  label: string;
  detail?: string;
  link?: string;
  /** co liczymy automatycznie z postępu */
  auto?: { kind: 'questions'; ids: string[] } | { kind: 'artworks'; ids: string[] } | { kind: 'analyses'; target: number } | { kind: 'diagnostic' } | { kind: 'exam'; target: number };
}

const range = (ids: string[]) => (ids.length > 1 ? `${ids[0]} – ${ids[ids.length - 1]}` : ids[0]);

/** Zadania tygodnia do odhaczenia (klucze stabilne: w{tydzień}:{rodzaj}). */
export function weekTasks(w: ScheduleWeek): WeekTask[] {
  const tasks: WeekTask[] = [{ key: `w${w.week}:material`, label: 'Materiał tygodnia', detail: w.material }];
  if (w.questionIds.length) {
    const bySection = new Map<string, string[]>();
    for (const id of w.questionIds) bySection.set(id.split('-')[0], [...(bySection.get(id.split('-')[0]) ?? []), id]);
    tasks.push({
      key: `w${w.week}:questions`, label: `Pytania: ${[...bySection.values()].map(range).join(', ')}`,
      link: `/sesja?typ=lista&ids=${w.questionIds.join(',')}`, auto: { kind: 'questions', ids: w.questionIds },
    });
  }
  if (w.artworkPeriods.length) {
    const ids = artworks.filter((a) => w.artworkPeriods.includes(a.period)).map((a) => a.id);
    tasks.push({
      key: `w${w.week}:artworks`, label: `Karty dzieł: ${w.artworkPeriods.join(', ')} (${ids.length})`,
      link: `/sesja?typ=filtr&ids=${ids.join(',')}`, auto: { kind: 'artworks', ids },
    });
  } else if (w.artworkCount) {
    tasks.push({ key: `w${w.week}:artworks`, label: `Karty dzieł: ${w.artworkCount}`, link: '/dziela' });
  }
  const stage = analysisGuide.trainingPlan.stages.find((s) => s.weeks.includes(w.week));
  if (stage) {
    tasks.push({ key: `w${w.week}:analyses`, label: `3 analizy dzieła: ${stage.form.toLowerCase()}`, detail: stage.how, link: '/trening/analiza', auto: { kind: 'analyses', target: 3 } });
  }
  w.specialTasks.forEach((t, i) => {
    const diag = /test diagnostyczny/i.test(t);
    const exams = /egzamin/i.test(t) && !diag ? (t.match(/Dwa pełne/) ? 2 : 1) : 0;
    tasks.push({
      key: `w${w.week}:s${i}`, label: t,
      link: diag ? '/wiecej/test' : exams ? '/trening/egzamin' : undefined,
      auto: diag ? { kind: 'diagnostic' } : exams ? { kind: 'exam', target: exams } : undefined,
    });
  });
  return tasks;
}

export const allWeeks = schedule.weeks;

/** Zadanie z wizytą w muzeum (punkt VI.3) — klucz do przypomnienia na pulpicie. */
export const MUSEUM_TASK = (() => {
  for (const w of schedule.weeks) {
    const t = weekTasks(w).find((x) => /muzeum/i.test(x.label));
    if (t) return { week: w.week, key: t.key };
  }
  return null;
})();
