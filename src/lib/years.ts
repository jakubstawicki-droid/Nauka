const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 };

function roman(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]], next = ROMAN[s[i + 1]] ?? 0;
    total += v < next ? -v : v;
  }
  return total;
}

/**
 * Przybliżony rok powstania z pola `date` karty dzieła (początek podanego zakresu).
 * Lata p.n.e. są ujemne. null, gdy daty nie da się odczytać.
 */
export function approxYear(date: string): number | null {
  // tylko część przed nawiasem — w nawiasach są uwagi (kopie, przebudowy)
  const main = date.split('(')[0];
  const bc = /p\.\s?n\.\s?e\./.test(main);
  // „lata 50.–80. XX w.” → 1950
  const decades = main.match(/lata\s+(\d{2})\..*?\b([IVXL]+)\s*w\./);
  if (decades) return (roman(decades[2]) - 1) * 100 + Number(decades[1]);
  const num = main.match(/\d[\d\s]*\d|\d/);
  if (num) {
    const n = Number(num[0].replace(/\s/g, ''));
    return bc ? -n : n;
  }
  const cent = main.match(/\b([IVXL]+)\s*(?:[-–]\s*[IVXL]+\s*)?w\./);
  if (cent) {
    const c = roman(cent[1]);
    return bc ? -(c * 100 - 50) : (c - 1) * 100 + 50;
  }
  return null;
}
