import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArtworkDetails } from '../components/ArtworkDetails';
import { ArtworkImage, StatusBadge } from '../components/study';
import { PageHead } from '../components/ui';
import { ARTWORK_PERIODS, artworkById, artworks } from '../data';
import { useCardStates } from '../hooks/useStudy';
import { artworkQueue } from '../lib/sessions';
import { itemKey, itemStatus, nextDueLabel } from '../lib/srs';
import { useProgress } from '../store/useProgress';

const DOMAINS = [...new Set(artworks.map((a) => a.domain))];
const FILTER_KEY = 'gerson:artwork-filters';

interface Filters { period: string; domain: string; polish: boolean }

function loadFilters(): Filters {
  try {
    const raw = sessionStorage.getItem(FILTER_KEY);
    if (raw) return { period: '', domain: '', polish: false, ...JSON.parse(raw) };
  } catch { /* brak dostępu do storage — domyślne filtry */ }
  return { period: '', domain: '', polish: false };
}

export function ArtworksHome() {
  const states = useCardStates();
  const { reviews, settings } = useProgress();
  const [params] = useSearchParams();
  const [f, setF] = useState<Filters>(() => {
    const fromUrl = params.get('epoka');
    return fromUrl ? { period: fromUrl, domain: '', polish: false } : loadFilters();
  });
  const update = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch };
    setF(next);
    try { sessionStorage.setItem(FILTER_KEY, JSON.stringify(next)); } catch { /* ignoruj */ }
  };

  const list = artworks.filter((a) => (!f.period || a.period === f.period) && (!f.domain || a.domain === f.domain) && (!f.polish || a.isPolish));
  const queue = useMemo(() => artworkQueue({ states, reviews, settings, now: new Date() }), [states, reviews, settings]);
  const toDo = queue.due.length + queue.fresh.length;
  const ids = list.length === artworks.length ? '' : list.map((a) => a.id).join(',');
  const now = new Date();

  return (
    <>
      <PageHead title="Karty dzieł"><p>110 dzieł kanonu, ułożonych chronologicznie.</p></PageHead>
      <div className="card accent">
        <h2>Na dziś: {toDo}</h2>
        <p className="small">{queue.due.length} powtórek · {queue.fresh.length} nowych</p>
        {toDo > 0 ? <Link className="btn primary" to="/sesja?typ=dziela">Zacznij fiszki</Link> : <p className="small">Na dziś wszystko zrobione.</p>}
      </div>

      <div className="filters">
        <div className="field">
          <label htmlFor="f-period">Epoka</label>
          <select id="f-period" value={f.period} onChange={(e) => update({ period: e.target.value })}>
            <option value="">Wszystkie</option>
            {ARTWORK_PERIODS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-domain">Dziedzina</label>
          <select id="f-domain" value={f.domain} onChange={(e) => update({ domain: e.target.value })}>
            <option value="">Wszystkie</option>
            {DOMAINS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <label className="toggle"><input type="checkbox" checked={f.polish} onChange={(e) => update({ polish: e.target.checked })} /> Tylko polskie</label>

      <div className="row" style={{ margin: '8px 0 16px', flexWrap: 'nowrap' }}>
        {list.length > 0 ? (
          <>
            <Link className="btn block" to={`/sesja?typ=filtr&ids=${ids}`}>Fiszki ({list.length})</Link>
            <Link className="btn block" to={`/sesja?typ=szybki&ids=${ids}`}>Tryb szybki 5 s</Link>
          </>
        ) : (
          <button className="btn block" disabled>Fiszki (0)</button>
        )}
      </div>

      {list.length === 0 && <p className="muted">Brak dzieł dla wybranych filtrów.</p>}
      {groupBy(list).map(([period, items]) => (
        <section key={period}>
          <h2 className="group-title">{period}</h2>
          <ul className="list">
            {items.map((a) => (
              <li key={a.id}>
                <Link to={`/dziela/${a.id}`}>
                  <div className="l-main">
                    <div className="l-title">{a.title} {a.isPolish && <span className="badge">PL</span>}</div>
                    <div className="l-sub">{a.artist} · {a.date}</div>
                  </div>
                  <StatusBadge status={itemStatus(states.get(itemKey('artwork', a.id)), now)} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function groupBy(list: typeof artworks) {
  const m = new Map<string, typeof artworks>();
  for (const a of list) m.set(a.period, [...(m.get(a.period) ?? []), a]);
  return [...m.entries()];
}

export function ArtworkDetail() {
  const { id } = useParams();
  const a = id ? artworkById.get(id) : undefined;
  const states = useCardStates();
  if (!a) return <p>Nie ma takiego dzieła.</p>;
  const st = states.get(itemKey('artwork', a.id));
  return (
    <>
      <div className="page-head"><div className="eyebrow">{a.period}</div></div>
      <ArtworkImage artwork={a} />
      <ArtworkDetails artwork={a} />
      <div className="challenge"><strong>Pytanie z karty</strong>{a.question}</div>
      <p className="row" style={{ marginBottom: 12 }}>
        <StatusBadge status={itemStatus(st, new Date())} />
        <span className="small muted">{nextDueLabel(st, new Date())}</span>
      </p>
      <Link className="btn primary block" to={`/sesja?typ=filtr&ids=${a.id}`}>Przećwicz jako fiszkę</Link>
    </>
  );
}
