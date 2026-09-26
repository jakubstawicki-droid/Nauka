import { useCallback, useEffect, useRef, useState } from 'react';
import { pickMimeType } from '../lib/recordings';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'error';

export interface Recording { blob: Blob; seconds: number; mimeType: string }

/** Nagrywanie mikrofonu przez MediaRecorder. Wszystkie błędy zamieniane na komunikat, bez wyjątków. */
export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  // opuszczenie ekranu w trakcie nagrywania — zatrzymaj mikrofon, nagranie przepada
  useEffect(() => () => {
    try { if (rec.current?.state === 'recording') rec.current.stop(); } catch { /* ignoruj */ }
    cleanup();
  }, [cleanup]);

  const supported = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

  async function start() {
    if (!supported) {
      setStatus('error');
      setError('Ta przeglądarka nie obsługuje nagrywania. Możesz nagrywać się dyktafonem w telefonie.');
      return;
    }
    setError(null);
    setStatus('requesting');
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      r.start(1000);
      rec.current = r;
      started.current = Date.now();
      setSeconds(0);
      timer.current = setInterval(() => setSeconds(Math.floor((Date.now() - started.current) / 1000)), 500);
      setStatus('recording');
    } catch (e) {
      cleanup();
      setStatus('error');
      const name = (e as DOMException)?.name;
      setError(name === 'NotAllowedError' || name === 'SecurityError'
        ? 'Brak zgody na użycie mikrofonu. Zezwól na mikrofon dla tej strony w ustawieniach przeglądarki.'
        : name === 'NotFoundError' ? 'Nie znaleziono mikrofonu.' : 'Nie udało się włączyć nagrywania.');
    }
  }

  function stop(): Promise<Recording | null> {
    const r = rec.current;
    if (!r || r.state !== 'recording') return Promise.resolve(null);
    return new Promise((resolve) => {
      r.onstop = () => {
        const secs = Math.round((Date.now() - started.current) / 1000);
        const type = r.mimeType || chunks.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunks.current, { type });
        cleanup();
        rec.current = null;
        setStatus('idle');
        resolve(blob.size ? { blob, seconds: secs, mimeType: type } : null);
      };
      try { r.stop(); } catch { cleanup(); setStatus('idle'); resolve(null); }
    });
  }

  return { status, error, seconds, start, stop, supported };
}
