import { useEffect, useMemo, useRef, useState } from 'react';
import type { Artwork } from '../data/types';
import { getArtworkImage } from '../lib/imageCache';
import type { ImageResult } from '../lib/images';
import { replayCards } from '../lib/srs';
import { useProgress } from '../store/useProgress';

/** Stan kart FSRS odtworzony z historii odpowiedzi. */
export function useCardStates() {
  const reviews = useProgress((s) => s.reviews);
  return useMemo(() => replayCards(reviews), [reviews]);
}

/** Sekundy od zamontowania (albo od ostatniego reset()). */
export function useElapsed(running = true) {
  const start = useRef(Date.now());
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSec(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [running]);
  return {
    seconds: sec,
    /** czas od startu, z górnym limitem 15 min (np. gdy telefon leżał odłożony) */
    spent: () => Math.min(900, Math.round((Date.now() - start.current) / 1000)),
    reset: () => { start.current = Date.now(); setSec(0); },
  };
}

export function useArtworkImage(a: Artwork) {
  const [result, setResult] = useState<ImageResult | null>(null);
  useEffect(() => {
    let alive = true;
    setResult(null);
    getArtworkImage(a).then((r) => { if (alive) setResult(r); });
    return () => { alive = false; };
  }, [a]);
  return result;
}

export function formatClock(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
