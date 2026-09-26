import { useRef, useState } from 'react';

export interface SortItem { id: string; label: string; sub?: string; hint: string }

/**
 * Lista do układania: przeciąganie palcem/myszą za uchwyt ≡ oraz przyciski ↑↓
 * (dla czytników ekranu i gdy przeciąganie jest niewygodne).
 */
export function SortableList({ items, order, onChange, checked }: {
  items: SortItem[];
  order: number[];
  onChange: (order: number[]) => void;
  /** po sprawdzeniu: podświetlenie poprawnych/błędnych miejsc i odsłonięte daty */
  checked: boolean;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  }

  function onPointerDown(e: React.PointerEvent, pos: number) {
    if (checked) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(pos);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragging === null || !listRef.current) return;
    const rows = [...listRef.current.children] as HTMLElement[];
    const target = rows.findIndex((r) => {
      const b = r.getBoundingClientRect();
      return e.clientY >= b.top && e.clientY <= b.bottom;
    });
    if (target !== -1 && target !== dragging) {
      move(dragging, target);
      setDragging(target);
    }
  }

  return (
    <ol className="sortable" ref={listRef} onPointerMove={onPointerMove}
      onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)}>
      {order.map((itemIdx, pos) => {
        const it = items[itemIdx];
        const state = checked ? (itemIdx === pos ? 'right' : 'wrong') : '';
        return (
          <li key={it.id} className={`${state}${dragging === pos ? ' dragging' : ''}`}>
            <span className="handle" onPointerDown={(e) => onPointerDown(e, pos)} aria-hidden>≡</span>
            <div className="s-main">
              <div className="s-label">{it.label}</div>
              {it.sub && <div className="s-sub">{it.sub}</div>}
              {checked && <div className="s-hint">{it.hint}</div>}
            </div>
            {!checked && (
              <span className="s-arrows">
                <button onClick={() => move(pos, pos - 1)} disabled={pos === 0} aria-label={`Przesuń „${it.label}” wyżej`}>↑</button>
                <button onClick={() => move(pos, pos + 1)} disabled={pos === order.length - 1} aria-label={`Przesuń „${it.label}” niżej`}>↓</button>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
