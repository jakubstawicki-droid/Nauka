import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { questionById } from '../data';
import { QuestionCard } from './QuestionCard';

afterEach(cleanup);

describe('QuestionCard — aktywne przypominanie', () => {
  const q = questionById.get('IV-01')!;

  it('nie pokazuje odpowiedzi przed kliknięciem', () => {
    render(<QuestionCard question={q} onDone={() => {}} />);
    expect(screen.getByText(q.question)).toBeTruthy();
    expect(screen.queryByText(q.modelAnswer)).toBeNull();
    expect(screen.queryByText(q.keyPoints[0])).toBeNull();
  });

  it('po odsłonięciu: checklista podpowiada ocenę, a kliknięcie ją zapisuje', () => {
    const onDone = vi.fn();
    render(<QuestionCard question={q} onDone={onDone} />);
    fireEvent.click(screen.getByText('Pokaż modelową odpowiedź'));
    expect(screen.getByText(q.modelAnswer)).toBeTruthy();
    expect(screen.getByText(q.followUp)).toBeTruthy();

    // bez odhaczeń: podpowiedź „Nie umiem”
    expect(document.querySelector('.grade.suggested')?.textContent).toContain('Nie umiem');
    // odhacz wszystkie punkty → „Łatwe”
    for (const k of q.keyPoints) fireEvent.click(screen.getByText(k));
    expect(document.querySelector('.grade.suggested')?.textContent).toContain('Łatwe');

    fireEvent.click(screen.getByText('Dobrze'));
    expect(onDone).toHaveBeenCalledWith(3, expect.any(Number));
  });
});
