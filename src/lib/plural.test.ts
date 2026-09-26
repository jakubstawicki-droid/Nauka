import { expect, it } from 'vitest';
import { plural } from './plural';

it('odmienia liczebniki po polsku', () => {
  const f = (n: number) => plural(n, 'nagranie', 'nagrania', 'nagrań');
  expect([1, 2, 4, 5, 12, 13, 22, 25, 0].map(f)).toEqual([
    '1 nagranie', '2 nagrania', '4 nagrania', '5 nagrań', '12 nagrań', '13 nagrań', '22 nagrania', '25 nagrań', '0 nagrań',
  ]);
});
