import { useEffect, useState } from 'react';
import { RecordingPlayer } from '../components/Recorder';
import { Dialog, PageHead } from '../components/ui';
import { plural } from '../lib/plural';
import { formatSize, useRecordings } from '../lib/recordings';

export function Recordings() {
  const { list, load, loaded, removeAll, persistent } = useRecordings();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { void load(); }, [load]);
  const total = list.reduce((s, r) => s + r.size, 0);

  return (
    <>
      <PageHead eyebrow="Więcej" title="Nagrania">
        <p>Nagrania są zapisane tylko na tym urządzeniu i nie trafiają do kopii zapasowej.</p>
      </PageHead>
      {!persistent && <div className="notice error">Ta przeglądarka nie pozwala zapisać nagrań na stałe — znikną po zamknięciu karty.</div>}
      {loaded && list.length === 0 && <p className="muted">Nie masz jeszcze nagrań. Nagrywać możesz przy pytaniach, w trenerze analizy i na egzaminie próbnym.</p>}
      {list.length > 0 && (
        <>
          <p className="small muted">{plural(list.length, 'nagranie', 'nagrania', 'nagrań')} · razem {formatSize(total)}</p>
          <div className="stack" style={{ marginBottom: 16 }}>
            {list.map((r) => <RecordingPlayer key={r.id} meta={r} showLabel />)}
          </div>
          <button className="btn danger" onClick={() => setConfirm(true)}>Usuń wszystkie nagrania</button>
        </>
      )}
      {confirm && (
        <Dialog title="Usunąć wszystkie nagrania?" onClose={() => setConfirm(false)}>
          <p>Tego nie da się cofnąć.</p>
          <div className="stack">
            <button className="btn danger" onClick={async () => { await removeAll(); setConfirm(false); }}>Tak, usuń</button>
            <button className="btn" onClick={() => setConfirm(false)}>Anuluj</button>
          </div>
        </Dialog>
      )}
    </>
  );
}
