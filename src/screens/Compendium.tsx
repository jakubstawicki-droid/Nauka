import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RichText, TermDialog } from '../components/RichText';
import { Timeline } from '../components/Timeline';
import { Menu, PageHead } from '../components/ui';
import { compendium, glossary } from '../data';
import type { CompendiumBlock, GlossaryTerm } from '../data/types';

export function CompendiumHome() {
  return (
    <>
      <PageHead eyebrow="Więcej" title="Kompendium"><p>Cała teoria z zagadnień egzaminacyjnych, uporządkowana tak jak lista od szkoły.</p></PageHead>
      <div className="stack">
        <Menu items={[
          { to: '/wiecej/kompendium/os-czasu', label: 'Oś czasu', desc: '25 epok — kliknij, żeby rozwinąć' },
          { to: '/wiecej/kompendium/slownik', label: 'Słownik terminów', desc: `${glossary.length} haseł z wyszukiwarką` },
        ]} />
        <Menu items={compendium.map((s) => ({ to: `/wiecej/kompendium/${s.code}`, label: `${s.code}. ${s.title}` }))} />
      </div>
    </>
  );
}

export function CompendiumSectionView() {
  const { code } = useParams();
  const idx = compendium.findIndex((s) => s.code === code);
  const section = compendium[idx];
  if (!section) return <p>Nie ma takiego działu.</p>;
  const prev = compendium[idx - 1];
  const next = compendium[idx + 1];
  return (
    <>
      <PageHead eyebrow={`Kompendium · dział ${section.code}`} title={section.title} />
      <p className="small muted">Podkreślone terminy są klikalne — pokażą definicję.</p>
      <div className="compendium">
        {section.blocks.map((b, i) => <Block key={i} b={b} />)}
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 24 }}>
        {prev ? <Link className="btn" to={`/wiecej/kompendium/${prev.code}`}>← Dział {prev.code}</Link> : <span />}
        {next && <Link className="btn" to={`/wiecej/kompendium/${next.code}`}>Dział {next.code} →</Link>}
      </div>
      <p style={{ marginTop: 16 }}><Link to={`/pytania/dzial/${section.code}`}>Pytania z działu {section.code} →</Link></p>
    </>
  );
}

function Block({ b }: { b: CompendiumBlock }) {
  switch (b.type) {
    case 'h2': return <h2 className="c-h2">{b.text}</h2>;
    case 'h3': return <h3 className="c-h3">{b.text}</h3>;
    case 'p': return <p className={`reading${b.small ? ' c-small' : ''}`}><RichText text={b.text} /></p>;
    case 'li': return <ul className="c-list reading"><li><RichText text={b.text} /></li></ul>;
    case 'box':
      return (
        <aside className="c-box">
          <div className="prompt-label">{b.title}</div>
          {b.text && <p><RichText text={b.text} /></p>}
          {b.items && <ul>{b.items.map((t) => <li key={t}><RichText text={t} /></li>)}</ul>}
        </aside>
      );
    case 'table':
      return (
        <div className="c-table" role="region" aria-label="Tabela" tabIndex={0}>
          <table>
            {b.header && <thead><tr>{b.header.map((h) => <th key={h}>{h}</th>)}</tr></thead>}
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'timeline': return <Timeline />;
    case 'glossary': return <GlossaryList topic={b.topic} />;
  }
}

export function TimelineScreen() {
  return (
    <>
      <PageHead eyebrow="Kompendium" title="Oś czasu"><p>Do zapamiętania jako całość. Kliknij epokę, żeby zobaczyć cechy, dzieła i przykłady polskie.</p></PageHead>
      <Timeline />
    </>
  );
}

export function GlossaryScreen() {
  return (
    <>
      <PageHead eyebrow="Kompendium" title="Słownik terminów" />
      <GlossaryList />
    </>
  );
}

function GlossaryList({ topic }: { topic?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<GlossaryTerm | null>(null);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return glossary.filter((g) => (!topic || g.topic === topic) && (!needle || g.term.toLowerCase().includes(needle) || g.definition.toLowerCase().includes(needle)));
  }, [q, topic]);
  const groups = useMemo(() => {
    const m = new Map<string, GlossaryTerm[]>();
    for (const g of list) m.set(g.topic ?? '', [...(m.get(g.topic ?? '') ?? []), g]);
    return [...m.entries()];
  }, [list]);

  return (
    <div>
      {!topic && (
        <div className="field">
          <label htmlFor="gq">Szukaj terminu</label>
          <input id="gq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="np. sfumato, rozeta, laserunek" />
        </div>
      )}
      {groups.map(([t, items]) => (
        <section key={t}>
          {!topic && <h2 className="group-title">{t}</h2>}
          <dl className="glossary">
            {items.map((g) => (
              <div key={g.term} onClick={() => setOpen(g)}>
                <dt>{g.term}</dt>
                <dd>{g.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {list.length === 0 && <p className="muted">Nic nie znaleziono.</p>}
      {open && <TermDialog term={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
