import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Placeholder } from './components/ui';
import { Dashboard } from './screens/Dashboard';
import { MoreMenu, TrainingMenu } from './screens/menus';
import { Settings } from './screens/Settings';
import { flushProgress, useProgress } from './store/useProgress';

function useTheme() {
  const theme = useProgress((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}

export function App() {
  const ready = useProgress((s) => s.ready);
  useTheme();

  useEffect(() => {
    void useProgress.getState().init();
    const onHide = () => { if (document.visibilityState === 'hidden') void flushProgress(); };
    const onPageHide = () => void flushProgress();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  if (!ready) return <div className="loading">Wczytywanie…</div>;

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pytania/*" element={<Placeholder title="Pytania" stage={3} />} />
          <Route path="dziela/*" element={<Placeholder title="Karty dzieł" stage={3} />} />
          <Route path="trening" element={<TrainingMenu />} />
          <Route path="trening/quizy/*" element={<Placeholder title="Quizy" stage={4} />} />
          <Route path="trening/analiza/*" element={<Placeholder title="Trener analizy" stage={5} />} />
          <Route path="trening/egzamin/*" element={<Placeholder title="Egzamin próbny" stage={5} />} />
          <Route path="trening/mieszany" element={<Placeholder title="Tryb mieszany" stage={3} />} />
          <Route path="wiecej" element={<MoreMenu />} />
          <Route path="wiecej/harmonogram" element={<Placeholder title="Harmonogram" stage={6} />} />
          <Route path="wiecej/kompendium/*" element={<Placeholder title="Kompendium" stage={6} />} />
          <Route path="wiecej/statystyki" element={<Placeholder title="Statystyki" stage={6} />} />
          <Route path="wiecej/test" element={<Placeholder title="Test diagnostyczny" stage={6} />} />
          <Route path="wiecej/jak-sie-uczyc" element={<Placeholder title="Jak się uczyć" stage={3} />} />
          <Route path="wiecej/ustawienia" element={<Settings />} />
          <Route path="*" element={<Placeholder title="Nie ma takiej strony" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
