export const PROGRAM_WEEKS = 14;
const DAY = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD w lokalnej strefie czasowej. */
export function toDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parsuje YYYY-MM-DD jako lokalną północ (bez przesunięć strefy). */
export function fromDay(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: string, n: number): string {
  const d = fromDay(day);
  d.setDate(d.getDate() + n);
  return toDay(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((fromDay(to).getTime() - fromDay(from).getTime()) / DAY);
}

/** Data startu tak, by 14 tygodni kończyło się dzień przed egzaminem. */
export function startFromExam(examDay: string): string {
  return addDays(examDay, -PROGRAM_WEEKS * 7);
}

/**
 * Numer bieżącego tygodnia programu: 0 = przed startem, 1–14 = tydzień nauki,
 * 15 = po zakończeniu programu. null, gdy brak daty startu.
 */
export function currentWeek(startDay: string | null, today: string): number | null {
  if (!startDay) return null;
  const diff = daysBetween(startDay, today);
  if (diff < 0) return 0;
  return Math.min(Math.floor(diff / 7) + 1, PROGRAM_WEEKS + 1);
}

/** Dzień tygodnia programu (1–7) albo null poza programem. */
export function dayOfWeek(startDay: string | null, today: string): number | null {
  const w = currentWeek(startDay, today);
  if (!w || w > PROGRAM_WEEKS) return null;
  return (daysBetween(startDay!, today) % 7) + 1;
}

const FMT = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
export function formatDay(day: string): string {
  return FMT.format(fromDay(day));
}
