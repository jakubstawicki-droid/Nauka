import { describe, expect, it } from 'vitest';
import { diagnostic } from '../data';
import { diagnosticRefs } from './diagnosticRefs';

describe('diagnosticRefs', () => {
  it('każde zadanie z części A–D ma materiał do sprawdzenia', () => {
    for (const p of diagnostic.parts.filter((x) => x.code !== 'E')) {
      for (const t of p.tasks) {
        const refs = diagnosticRefs(p.code, t);
        expect(refs.length, `${p.code} ${t.n} ${t.text}`).toBeGreaterThan(0);
      }
    }
  });
  it('trafia we właściwe hasła', () => {
    const [a] = diagnostic.parts;
    expect(diagnosticRefs('A', a.tasks[1])[0].title).toBe('perspektywa powietrzna (barwna)');
    const c = diagnostic.parts[2];
    expect(diagnosticRefs('C', c.tasks.find((t) => t.text.startsWith('Dawid'))!)[0].text).toContain('Michał Anioł');
  });
});
