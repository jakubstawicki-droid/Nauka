import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import { SortableList } from './SortableList';

afterEach(cleanup);

const items = [
  { id: 'a', label: 'Romanizm', hint: 'XI–XII w.' },
  { id: 'b', label: 'Gotyk', hint: 'XII–XV w.' },
  { id: 'c', label: 'Barok', hint: 'XVII w.' },
];

function Harness({ checked = false }: { checked?: boolean }) {
  const [order, setOrder] = useState([2, 0, 1]);
  return <SortableList items={items} order={order} onChange={setOrder} checked={checked} />;
}

it('strzałki przestawiają elementy', () => {
  render(<Harness />);
  const labels = () => [...document.querySelectorAll('.s-label')].map((e) => e.textContent);
  expect(labels()).toEqual(['Barok', 'Romanizm', 'Gotyk']);
  fireEvent.click(screen.getByLabelText('Przesuń „Barok” niżej'));
  fireEvent.click(screen.getByLabelText('Przesuń „Barok” niżej'));
  expect(labels()).toEqual(['Romanizm', 'Gotyk', 'Barok']);
});

it('po sprawdzeniu oznacza miejsca i pokazuje daty', () => {
  render(<Harness checked />);
  expect(document.querySelectorAll('li.wrong')).toHaveLength(3);
  expect(screen.getByText('XVII w.')).toBeTruthy();
});
