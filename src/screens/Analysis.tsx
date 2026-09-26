import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnalysisStepsGuide, ThreeMovesHint } from '../components/AnalysisSteps';
import { ArtworkDetails } from '../components/ArtworkDetails';
import { RecorderPanel } from '../components/Recorder';
import { ArtworkImage, Checklist } from '../components/study';
import { PageHead } from '../components/ui';
import { analysisGuide, analysisSteps, artworkById, artworks, examRules, modelAnalyses } from '../data';
import { formatClock, useArtworkImage } from '../hooks/useStudy';
import { currentWeek, toDay } from '../lib/dates';
import { isProtected } from '../lib/images';
import { gradeFromChecklist } from '../lib/srs';
import { useProgress } from '../store/useProgress';

const LOOK_SECONDS = 60;
const PASS = examRules.scorecard.passThreshold;

export function AnalysisHome() {
  const navigate = useNavigate();
  const { analyses, settings } = useProgress();
  const [unknown, setUnknown] = useState(false);
  const [pick, setPick] = useState('');
  const week = currentWeek(settings.startDate, toDay(new Date()));
  const stage = analysisGuide.trainingPlan.stages.find((s) => week && s.weeks.includes(week));

  function randomArtwork() {
    // w trybie „nieznane” tylko dzieła z reprodukcją
    const pool = unknown ? artworks.filter((a) => !isProtected(a)) : artworks;
    const a = pool[Math.floor(Math.random() * pool.length)];
    navigate(`/trening/analiza/sesja?dzielo=${a.id}${unknown ? '&nieznane=1' : ''}`);
  }

  return (
    <>
      <PageHead eyebrow="Trening" title="Trener analizy dzieła">
        <p>{analysisGuide.timing}</p>
      </PageHead>

      {stage && (
        <div className="card accent">
          <p className="prompt-label">Tydzień {week}: {stage.form}</p>
          <p className="small">{stage.how}</p>
        </div>
      )}

      <section className="card">
        <h2>Nowa analiza</h2>
        <label className="toggle">
          <input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} />
          Dzieło nieznane — tytuł i autor ukryte do końca
        </label>
        <div className="stack" style={{ marginTop: 8 }}>
          <button className="btn primary" onClick={randomArtwork}>Losuj dzieło</button>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pick">…albo wybierz z listy</label>
            <select id="pick" value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">— wybierz dzieło —</option>
              {artworks.map((a) => <option key={a.id} value={a.id}>{a.title} ({a.period})</option>)}
            </select>
          </div>
          {pick && <Link className="btn" to={`/trening/analiza/sesja?dzielo=${pick}${unknown ? '&nieznane=1' : ''}`}>Analizuj wybrane</Link>}
        </div>
      </section>

      <section className="card">
        <h2>Dzieła z analizą wzorcową</h2>
        <p className="small muted">Po swojej wypowiedzi zobaczysz, jak brzmi pełna analiza tego samego dzieła.</p>
        <div className="stack">
          {modelAnalyses.map((m) => (
            <Link key={m.id} className="btn" to={`/trening/analiza/sesja?dzielo=${m.artworkId}`}>{m.title}</Link>
          ))}
        </div>
        <p style={{ marginTop: 12 }}><Link to="/trening/analiza/wzorcowe">Przeczytaj analizy wzorcowe →</Link></p>
      </section>

      <details className="card">
        <summary><strong>Dzieło, którego nie znasz — co robić</strong></summary>
        <p style={{ marginTop: 12 }}>{analysisGuide.unknownArtwork.intro}</p>
        <ol>{analysisGuide.unknownArtwork.startSteps.map((s) => <li key={s.title}><strong>{s.title}</strong> {s.text}</li>)}</ol>
        <p className="warn-box small"><strong>Czego nie robić</strong>{analysisGuide.unknownArtwork.dont}</p>
      </details>

      <details className="card">
        <summary><strong>Dziewięć kroków analizy</strong></summary>
        <div style={{ marginTop: 12 }}><ThreeMovesHint /><AnalysisStepsGuide /></div>
      </details>

      {analyses.length > 0 && (
        <>
          <h2 className="group-title">Twoje analizy</h2>
          <ul className="list">
            {[...analyses].reverse().slice(0, 15).map((a) => {
              const art = artworkById.get(a.artworkId);
              return (
                <li key={a.date}>
                  <Link to={`/dziela/${a.artworkId}`}>
                    <div className="l-main">
                      <div className="l-title">{art?.title ?? a.artworkId}</div>
                      <div className="l-sub">{new Date(a.date).toLocaleDateString('pl-PL')} · {formatClock(a.seconds)}{a.unknown ? ' · nieznane' : ''}</div>
                    </div>
                    <span className={`badge ${a.checked.length >= PASS ? 'st-mastered' : 'st-learning'}`}>{a.checked.length}/12</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}

type Phase = 'look' | 'speak' | 'score' | 'result';

export function AnalysisSession() {
  const [params] = useSearchParams();
  const artwork = artworkById.get(params.get('dzielo') ?? '');
  const unknown = params.get('nieznane') === '1';
  const navigate = useNavigate();
  const { addAnalysis, addReview } = useProgress();
  const [phase, setPhase] = useState<Phase>('look');
  const [lookLeft, setLookLeft] = useState(LOOK_SECONDS);
  const [speakStart, setSpeakStart] = useState(0);
  const [speakSec, setSpeakSec] = useState(0);
  const [recording, setRecording] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => examRules.scorecard.items.map(() => false));
  const [sessionId] = useState(() => new Date().toISOString());
  const img = useArtworkImage(artwork ?? artworks[0]);
  const model = useMemo(() => modelAnalyses.find((m) => m.artworkId === artwork?.id), [artwork]);

  useEffect(() => {
    if (phase !== 'look') return;
    if (lookLeft <= 0) { startSpeaking(); return; }
    const t = setTimeout(() => setLookLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, lookLeft]);

  useEffect(() => {
    if (phase !== 'speak') return;
    const t = setInterval(() => setSpeakSec(Math.floor((Date.now() - speakStart) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase, speakStart]);

  if (!artwork) return <p>Nie znaleziono dzieła. <Link to="/trening/analiza">Wróć</Link></p>;

  function startSpeaking() {
    setSpeakStart(Date.now());
    setSpeakSec(0);
    setPhase('speak');
  }

  function finishSpeaking() {
    const secs = Math.floor((Date.now() - speakStart) / 1000);
    setSpeakSec(secs);
    // punkt 12 karty: „zmieściła się w czasie 2–4 minut” — podpowiedź z licznika
    setChecked((c) => c.map((v, i) => (examRules.scorecard.items[i].n === 12 ? secs >= 120 && secs <= 240 : v)));
    setPhase('score');
    window.scrollTo({ top: 0 });
  }

  function save() {
    const nums = examRules.scorecard.items.filter((_, i) => checked[i]).map((it) => it.n);
    addAnalysis({ date: sessionId, artworkId: artwork!.id, unknown, checked: nums, seconds: speakSec });
    addReview({ itemId: artwork!.id, itemType: 'analysis', grade: gradeFromChecklist(nums.length, 12) ?? 1, timeSpent: speakSec, mode: 'analysis' });
    setPhase('result');
    window.scrollTo({ top: 0 });
  }

  const hideIdentity = unknown && phase !== 'result';
  const noImage = img && img.status !== 'ok';
  const timeClass = speakSec < 120 ? '' : speakSec <= 240 ? ' ok' : ' over';

  return (
    <>
      <div className="session-top">
        <span className="count">Analiza{unknown ? ' · dzieło nieznane' : ''}</span>
        <button className="btn close" onClick={() => navigate('/trening/analiza')}>Zakończ</button>
      </div>

      {phase !== 'result' && (
        <>
          <ArtworkImage artwork={artwork} showCredits={!hideIdentity} />
          {noImage && <p className="hint-box"><strong>Opis zamiast reprodukcji:</strong> {artwork.recognizeBy}</p>}
          {!hideIdentity && <h2 className="question-text">{artwork.title}</h2>}
        </>
      )}

      {phase === 'look' && (
        <>
          <p className="prompt-label">Przyjrzyj się dziełu</p>
          <div className="countdown">{formatClock(lookLeft)}</div>
          <p className="small muted" style={{ textAlign: 'center' }}>Za minutę zacznie się czas na wypowiedź (2–4 minuty).</p>
          <button className="btn primary block" onClick={startSpeaking}>Zaczynam mówić</button>
        </>
      )}

      {phase === 'speak' && (
        <>
          <div className={`speak-timer${timeClass}`}>
            <span className="t">{formatClock(speakSec)}</span>
            <span className="small">{speakSec < 120 ? 'cel: 2–4 min' : speakSec <= 240 ? 'w czasie ✓' : 'powyżej 4 minut'}</span>
          </div>
          <RecorderPanel kind="analysis" refId={`${artwork.id}@${sessionId}`} label={unknown ? 'Analiza (dzieło nieznane)' : artwork.title}
            history={0} onRecordingChange={setRecording} />
          <ThreeMovesHint />
          <AnalysisStepsGuide />
          <div className="sticky-actions">
            <button className="btn primary block" onClick={finishSpeaking} disabled={recording}>
              {recording ? 'Najpierw zatrzymaj nagrywanie' : 'Skończyłam — oceń'}
            </button>
          </div>
        </>
      )}

      {phase === 'score' && (
        <>
          <p className="prompt-label">Karta oceny · {checked.filter(Boolean).length}/12</p>
          <p className="small muted">{examRules.scorecard.instructions} Najlepiej oceniaj, słuchając nagrania.</p>
          <RecorderPanel kind="analysis" refId={`${artwork.id}@${sessionId}`} label={artwork.title} history={1} />
          <Checklist
            title="Co padło w wypowiedzi?"
            items={examRules.scorecard.items.map((i) => i.text)}
            checked={checked}
            onToggle={(i) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
          />
          <button className="btn primary block" onClick={save}>Zapisz wynik</button>
        </>
      )}

      {phase === 'result' && <AnalysisResultView artworkId={artwork.id} checked={checked} seconds={speakSec} sessionId={sessionId} hasModel={!!model} />}
    </>
  );
}

function AnalysisResultView({ artworkId, checked, seconds, sessionId, hasModel }: { artworkId: string; checked: boolean[]; seconds: number; sessionId: string; hasModel: boolean }) {
  const artwork = artworkById.get(artworkId)!;
  const model = modelAnalyses.find((m) => m.artworkId === artworkId);
  const score = checked.filter(Boolean).length;
  // informacja zwrotna: jeden brakujący krok, nie wszystkie
  const missing = examRules.scorecard.items.filter((_, i) => !checked[i]);
  const firstMissingStep = missing.find((m) => m.steps.length)?.steps[0];
  const step = analysisSteps.find((s) => s.n === firstMissingStep);

  return (
    <>
      <div className={`card ${score >= PASS ? 'accent' : ''}`}>
        <h2>{score}/12 {score >= PASS ? '— wynik egzaminacyjny' : ''}</h2>
        <p className="small">Czas wypowiedzi: {formatClock(seconds)}. {examRules.scorecard.instructions.split('. ').slice(-1)[0]}</p>
      </div>

      {step && (
        <div className="challenge">
          <strong>Na następny raz — jeden krok: {step.n}. {step.name}</strong>
          {step.goal} Na przykład: „{step.phrases[0]}”
        </div>
      )}

      <ArtworkImage artwork={artwork} />
      <ArtworkDetails artwork={artwork} />

      <RecorderPanel kind="analysis" refId={`${artwork.id}@${sessionId}`} label={artwork.title} history={1} />

      {model && (
        <section className="card">
          <h2>Analiza wzorcowa</h2>
          <p className="small muted">{model.note}</p>
          <ModelSteps steps={model.steps} />
        </section>
      )}
      {!hasModel && <p className="small muted">To dzieło nie ma analizy wzorcowej — porównaj swoją wypowiedź z opisem karty powyżej.</p>}

      <div className="stack">
        <Link className="btn primary" to="/trening/analiza">Następna analiza</Link>
      </div>
    </>
  );
}

function ModelSteps({ steps }: { steps: { n: number; stepName: string; text: string }[] }) {
  return (
    <div className="model-steps">
      {steps.map((s) => (
        <div key={s.n} className="model-step">
          <div className="ms-label"><span className="step-n">{s.n}</span>{s.stepName}</div>
          <p className="reading">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

export function ModelAnalysesList() {
  return (
    <>
      <PageHead eyebrow="Trener analizy" title="Analizy wzorcowe">
        <p>Przeczytaj najpierw z podziałem na kroki, a potem jeszcze raz, ignorując margines — wtedy usłyszysz, że to jedna płynna wypowiedź.</p>
      </PageHead>
      <ul className="list">
        {modelAnalyses.map((m) => (
          <li key={m.id}>
            <Link to={`/trening/analiza/wzorcowe/${m.id}`}>
              <div className="l-main"><div className="l-title">{m.title}</div><div className="l-sub">{m.artist} · {m.date} · {m.domain}, {m.style}</div></div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ModelAnalysisView() {
  const { id } = useParams();
  const m = modelAnalyses.find((x) => x.id === id);
  const [plain, setPlain] = useState(false);
  if (!m) return <p>Nie ma takiej analizy.</p>;
  const artwork = artworkById.get(m.artworkId);
  return (
    <>
      <PageHead eyebrow={`${m.artist} · ${m.date}`} title={m.title}><p>{m.note}</p></PageHead>
      {artwork && <ArtworkImage artwork={artwork} />}
      <p className="small muted">{m.domain} · {m.style} · {m.techniqueLocation}</p>
      <label className="toggle"><input type="checkbox" checked={plain} onChange={(e) => setPlain(e.target.checked)} /> Czytaj jako jedną wypowiedź (bez podziału na kroki)</label>
      {plain
        ? <div className="card"><p className="reading">{m.steps.map((s) => s.text).join(' ')}</p></div>
        : <ModelSteps steps={m.steps} />}
      <Link className="btn primary block" to={`/trening/analiza/sesja?dzielo=${m.artworkId}`}>Przećwicz tę analizę na głos</Link>
    </>
  );
}
