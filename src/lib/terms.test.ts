import { describe, expect, it } from 'vitest';
import { compendium } from '../data';
import { findTerm } from './terms';

describe('findTerm', () => {
  it('rozpoznaje hasła w odmianie', () => {
    expect(findTerm('luminizmie')?.term).toBe('luminizm');
    expect(findTerm('syntetyzmem')?.term).toBe('syntetyzm');
    expect(findTerm('kontrast walorowy')?.term).toBe('kontrast walorowy');
    expect(findTerm('Punkt')?.term).toBe('punkt');
    expect(findTerm('przypory')?.term).toBe('kontrafort (przypora, skarpa)');
    expect(findTerm('kompozycja dynamiczna')?.term).toBe('kompozycja statyczna / dynamiczna');
  });
  it('nie dopasowuje przypadkowych słów', () => {
    expect(findTerm('Co nią rządzi:')).toBeUndefined();
    expect(findTerm('Hierarchia wielkości')).toBeUndefined();
  });
  it('podlinkowuje sporą część pogrubień w dziale I', () => {
    const bold = compendium[0].blocks.flatMap((b) => ('text' in b ? [...b.text.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]) : []));
    const linked = bold.filter((t) => findTerm(t));
    expect(linked.length / bold.length).toBeGreaterThan(0.5);
  });
});
