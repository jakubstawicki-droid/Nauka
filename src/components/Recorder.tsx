import { useEffect, useState } from 'react';
import { formatClock } from '../hooks/useStudy';
import { useRecorder } from '../hooks/useRecorder';
import { formatSize, getRecordingBlob, useRecordings, type RecordingKind, type RecordingMeta } from '../lib/recordings';

/**
 * Przycisk nagrywania z licznikiem. Po zatrzymaniu nagranie zapisuje się lokalnie
 * i pokazuje odtwarzacz (np. obok modelowej odpowiedzi).
 */
export function RecorderPanel({ kind, refId, label, history = 1, onRecordingChange }: {
  kind: RecordingKind; refId: string; label: string;
  /** ile ostatnich nagrań tego pytania/dzieła pokazać */
  history?: number;
  onRecordingChange?: (recording: boolean) => void;
}) {
  const r = useRecorder();
  const { list, load, save, persistent } = useRecordings();
  const [saveError, setSaveError] = useState(false);
  const [lastSaved, setLastSaved] = useState<RecordingMeta | null>(null);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { onRecordingChange?.(r.status === 'recording'); }, [r.status, onRecordingChange]);

  const mine = list.filter((x) => x.refId === refId && x.kind === kind).slice(0, history);

  async function toggle() {
    if (r.status === 'recording') {
      const out = await r.stop();
      if (out) {
        const saved = await save({ kind, refId, label, seconds: out.seconds, mimeType: out.mimeType }, out.blob);
        setSaveError(!saved);
        setLastSaved(saved);
      }
    } else {
      await r.start();
    }
  }

  return (
    <div className="recorder">
      <button className={`btn block rec-btn${r.status === 'recording' ? ' on' : ''}`} onClick={toggle} disabled={r.status === 'requesting'}>
        {r.status === 'recording' ? <>■ Zatrzymaj nagrywanie · {formatClock(r.seconds)}</> : r.status === 'requesting' ? 'Włączam mikrofon…' : '● Nagraj odpowiedź'}
      </button>
      {r.error && <p className="notice error small">{r.error}</p>}
      {saveError && <p className="notice error small">Nie udało się zapisać nagrania.</p>}
      {lastSaved && history === 0 && r.status !== 'recording' && (
        <p className="notice ok small" role="status">✓ Nagranie zapisane ({formatClock(lastSaved.seconds)}) — odsłuchasz je przy ocenie.</p>
      )}
      {!persistent && <p className="small muted">Ta przeglądarka nie pozwala zapisać nagrań na stałe — znikną po zamknięciu karty.</p>}
      {mine.map((m) => <RecordingPlayer key={m.id} meta={m} />)}
    </div>
  );
}

export function RecordingPlayer({ meta, showLabel = false, onDelete }: { meta: RecordingMeta; showLabel?: boolean; onDelete?: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const remove = useRecordings((s) => s.remove);
  useEffect(() => {
    let u: string | null = null;
    let alive = true;
    getRecordingBlob(meta.id).then((b) => {
      if (b && alive) { u = URL.createObjectURL(b); setUrl(u); }
    });
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [meta.id]);

  const when = new Date(meta.createdAt).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="rec-item">
      <div className="rec-meta small">
        {showLabel && <strong>{meta.label} · </strong>}
        <span className="muted">{when} · {formatClock(meta.seconds)} · {formatSize(meta.size)}</span>
      </div>
      {url ? <audio controls src={url} preload="metadata" /> : <span className="small muted">Wczytywanie…</span>}
      <button className="link-btn small" onClick={() => { void remove(meta.id); onDelete?.(); }}>Usuń nagranie</button>
    </div>
  );
}
