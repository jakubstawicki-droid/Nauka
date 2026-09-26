import { describe, expect, it } from 'vitest';
import { artworks } from '../data';
import { approxYear } from './years';

describe('approxYear', () => {
  it('odczytuje typowe formaty dat z kart', () => {
    expect(approxYear('ok. 17 000-15 000 p.n.e.')).toBe(-17000);
    expect(approxYear('447-432 p.n.e.')).toBe(-447);
    expect(approxYear('ok. 118-128 n.e.')).toBe(118);
    expect(approxYear('1320-1364 (obecna, gotycka; krypta św. Leonarda z ok. 1118)')).toBe(1320);
    expect(approxYear('ok. I w. p.n.e. - I w. n.e.')).toBe(-50);
    expect(approxYear('lata 50.-80. XX w.')).toBe(1950);
    expect(approxYear('XIII w.')).toBe(1250);
    expect(approxYear('bez daty')).toBeNull();
  });

  it('odczytuje datę każdej z 110 kart', () => {
    expect(artworks.filter((a) => approxYear(a.date) === null)).toEqual([]);
  });
});
