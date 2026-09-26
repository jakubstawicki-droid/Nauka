/** Polska odmiana liczebnika: plural(3, 'nagranie', 'nagrania', 'nagrań') → „3 nagrania”. */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10, mod100 = n % 100;
  const word = n === 1 ? one : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
  return `${n} ${word}`;
}
