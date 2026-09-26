import { useRef, useState } from 'react';
import { Dialog, PageHead } from '../components/ui';
import { backupFileName, createBackup, mergeProgress, parseBackup, type BackupFile } from '../lib/backup';
import { daysBetween, formatDay, startFromExam, toDay } from '../lib/dates';
import { STORAGE_LABELS } from '../storage/StorageAdapter';
import type { Theme } from '../store/model';
import { flushProgress, useProgress } from '../store/useProgress';

type Msg = { kind: 'ok' | 'error'; text: string } | null;

export function Settings() {
  const s = useProgress();
  const { settings } = s;
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState<{ backup: BackupFile; skipped: number } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const today = toDay(new Date());
  const suggestedStart = settings.examDate ? startFromExam(settings.examDate) : null;

  async function exportFile() {
    await flushProgress();
    try {
      const blob = new Blob([JSON.stringify(createBackup(s.snapshot()), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFileName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMsg({ kind: 'ok', text: 'Plik z postępem został zapisany. Trzymaj go w bezpiecznym miejscu.' });
    } catch {
      setMsg({ kind: 'error', text: 'Nie udało się utworzyć pliku.' });
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    let text: string;
    try { text = await file.text(); } catch { setMsg({ kind: 'error', text: 'Nie udało się odczytać pliku.' }); return; }
    const res = parseBackup(text);
    if (!res.ok) { setMsg({ kind: 'error', text: res.error }); return; }
    setPending({ backup: res.backup, skipped: res.skipped });
  }

  async function applyImport(mode: 'merge' | 'replace') {
    if (!pending) return;
    const incoming = pending.backup.progress;
    setPending(null);
    const saved = await s.replaceAll(mode === 'merge' ? mergeProgress(s.snapshot(), incoming) : incoming);
    const skipped = pending.skipped ? ` Pominięto uszkodzone wpisy: ${pending.skipped}.` : '';
    const warn = saved ? '' : ' Uwaga: nie udało się zapisać na tym urządzeniu.';
    setMsg({ kind: saved ? 'ok' : 'error', text: `Wczytano ${incoming.reviews.length} odpowiedzi (${mode === 'merge' ? 'połączono' : 'zastąpiono'}).${skipped}${warn}` });
  }

  return (
    <>
      <PageHead eyebrow="Więcej" title="Ustawienia" />
      {msg && <div className={`notice ${msg.kind}`} role="status">{msg.text}</div>}

      <section className="card">
        <h2>Terminy</h2>
        <div className="field">
          <label htmlFor="exam">Data egzaminu</label>
          <input id="exam" type="date" value={settings.examDate ?? ''}
            onChange={(e) => s.updateSettings({ examDate: e.target.value || null })} />
        </div>
        <div className="field">
          <label htmlFor="start">Początek nauki (tydzień 1)</label>
          <input id="start" type="date" value={settings.startDate ?? ''}
            onChange={(e) => s.updateSettings({ startDate: e.target.value || null })} />
          <span className="hint">Program trwa 14 tygodni. Wystarczy podać jedną z dat — drugą można wyliczyć.</span>
        </div>
        {suggestedStart && suggestedStart !== settings.startDate && (
          <div className="stack">
            <button className="btn" onClick={() => s.updateSettings({ startDate: suggestedStart })}>
              Ustaw start na {formatDay(suggestedStart)}
            </button>
            {daysBetween(suggestedStart, today) > 0 && (
              <p className="small muted">
                Ta data już minęła — do egzaminu zostało mniej niż 14 tygodni. Możesz zacząć od dzisiaj i
                przejść szybciej przez pierwsze tygodnie.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Dzienny limit</h2>
        <p className="small muted">
          Domyślne wartości mieszczą się w około 30 minutach: odpowiedź na pytanie na głos trwa 2–3 minuty,
          rozpoznanie dzieła kilkanaście sekund.
        </p>
        <h3>Pytania</h3>
        <div className="row">
          <LimitField id="q-rev" label="Powtórki" value={settings.dailyReviewLimit} max={100} onChange={(v) => s.updateSettings({ dailyReviewLimit: v })} />
          <LimitField id="q-new" label="Nowe" value={settings.dailyNewLimit} max={30} onChange={(v) => s.updateSettings({ dailyNewLimit: v })} />
        </div>
        <h3>Karty dzieł</h3>
        <div className="row">
          <LimitField id="a-rev" label="Powtórki" value={settings.artworkReviewLimit} max={200} onChange={(v) => s.updateSettings({ artworkReviewLimit: v })} />
          <LimitField id="a-new" label="Nowe" value={settings.artworkNewLimit} max={50} onChange={(v) => s.updateSettings({ artworkNewLimit: v })} />
        </div>
      </section>

      <section className="card">
        <h2>Wygląd</h2>
        <div className="seg" role="group" aria-label="Motyw">
          {(['system', 'light', 'dark'] as Theme[]).map((t) => (
            <button key={t} aria-pressed={settings.theme === t} onClick={() => s.updateSettings({ theme: t })}>
              {{ system: 'Auto', light: 'Jasny', dark: 'Ciemny' }[t]}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Kopia zapasowa</h2>
        <p className="small muted">
          Zapisz postęp do pliku, żeby go nie stracić albo przenieść między telefonem a komputerem.
          Nagrania głosu nie wchodzą do kopii.
        </p>
        <div className="stack">
          <button className="btn primary" onClick={exportFile}>Eksportuj postęp do pliku</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Wczytaj postęp z pliku</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          Zapis: {s.storageKind ? STORAGE_LABELS[s.storageKind] : '…'}
          {!s.saveOk && ' — ostatni zapis się nie powiódł, zrób eksport do pliku.'}
        </p>
      </section>

      <section className="card">
        <h2>Zacznij od nowa</h2>
        <p className="small muted">Usuwa całą historię odpowiedzi, wyniki testów i ustawienia.</p>
        <button className="btn danger" onClick={() => setConfirmReset(true)}>Wyczyść postęp</button>
      </section>

      {pending && (
        <Dialog title="Wczytać postęp?" onClose={() => setPending(null)}>
          <p>
            Plik z {pending.backup.exportedAt ? formatDay(toDay(new Date(pending.backup.exportedAt))) : 'nieznanej daty'} zawiera{' '}
            {pending.backup.progress.reviews.length} odpowiedzi.
          </p>
          <p className="small muted">
            „Połącz” dopisze historię z pliku do tej z tego urządzenia. „Zastąp” usunie obecny postęp.
          </p>
          <div className="stack">
            <button className="btn primary" onClick={() => applyImport('merge')}>Połącz</button>
            <button className="btn danger" onClick={() => applyImport('replace')}>Zastąp</button>
            <button className="btn" onClick={() => setPending(null)}>Anuluj</button>
          </div>
        </Dialog>
      )}

      {confirmReset && (
        <Dialog title="Na pewno wyczyścić?" onClose={() => setConfirmReset(false)}>
          <p>Tej operacji nie da się cofnąć. Jeśli chcesz, najpierw zrób eksport do pliku.</p>
          <div className="stack">
            <button className="btn danger" onClick={async () => { setConfirmReset(false); await s.reset(); setMsg({ kind: 'ok', text: 'Postęp wyczyszczony.' }); }}>
              Tak, wyczyść
            </button>
            <button className="btn" onClick={() => setConfirmReset(false)}>Anuluj</button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function LimitField({ id, label, value, max, onChange }: { id: string; label: string; value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="field" style={{ flex: 1 }}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="numeric" min={0} max={max} value={value}
        onChange={(e) => onChange(clamp(e.target.value, 0, max))} />
    </div>
  );
}

function clamp(v: string, min: number, max: number) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}
