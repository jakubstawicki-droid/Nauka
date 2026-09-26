import { useEffect, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Placeholder } from './components/ui';
import { AnalysisHome, AnalysisSession, ModelAnalysesList, ModelAnalysisView } from './screens/Analysis';
import { ArtworkDetail, ArtworksHome } from './screens/Artworks';
import { Dashboard } from './screens/Dashboard';
import { ExamHome, ExamSession } from './screens/Exam';
import { HowToLearn } from './screens/HowToLearn';
import { QuestionDetail, QuestionSection, QuestionsHome } from './screens/Questions';
import { QuizMenu, QuizRun } from './screens/Quizzes';
import { Recordings } from './screens/Recordings';
import { StudySession } from './screens/StudySession';
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
          <Route path="pytania" element={<QuestionsHome />} />
          <Route path="pytania/dzial/:code" element={<QuestionSection />} />
          <Route path="pytania/:id" element={<QuestionDetail />} />
          <Route path="dziela" element={<ArtworksHome />} />
          <Route path="dziela/:id" element={<ArtworkDetail />} />
          <Route path="sesja" element={<StudySessionRoute />} />
          <Route path="trening" element={<TrainingMenu />} />
          <Route path="trening/quizy" element={<QuizMenu />} />
          <Route path="trening/quizy/:kind" element={<QuizRunRoute />} />
          <Route path="trening/analiza" element={<AnalysisHome />} />
          <Route path="trening/analiza/sesja" element={<KeyedByLocation><AnalysisSession /></KeyedByLocation>} />
          <Route path="trening/analiza/wzorcowe" element={<ModelAnalysesList />} />
          <Route path="trening/analiza/wzorcowe/:id" element={<ModelAnalysisView />} />
          <Route path="trening/egzamin" element={<ExamHome />} />
          <Route path="trening/egzamin/start" element={<KeyedByLocation><ExamSession /></KeyedByLocation>} />
          <Route path="wiecej/nagrania" element={<Recordings />} />
          <Route path="trening/mieszany" element={<Navigate to="/sesja?typ=mieszany" replace />} />
          <Route path="wiecej" element={<MoreMenu />} />
          <Route path="wiecej/harmonogram" element={<Placeholder title="Harmonogram" stage={6} />} />
          <Route path="wiecej/kompendium/*" element={<Placeholder title="Kompendium" stage={6} />} />
          <Route path="wiecej/statystyki" element={<Placeholder title="Statystyki" stage={6} />} />
          <Route path="wiecej/test" element={<Placeholder title="Test diagnostyczny" stage={6} />} />
          <Route path="wiecej/jak-sie-uczyc" element={<HowToLearn />} />
          <Route path="wiecej/ustawienia" element={<Settings />} />
          <Route path="*" element={<Placeholder title="Nie ma takiej strony" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

/** Nowa sesja przy każdej zmianie parametrów (np. dwa różne linki do sesji pod rząd). */
function StudySessionRoute() {
  const { search } = useLocation();
  return <StudySession key={search} />;
}

/** Świeży quiz przy przejściu z jednego quizu do innego. */
function QuizRunRoute() {
  const { kind } = useParams();
  return <QuizRun key={kind} />;
}

/** Każde wejście pod ten adres (także ponowne kliknięcie „Kolejny zestaw”) to nowa sesja. */
function KeyedByLocation({ children }: { children: ReactNode }) {
  const { key, search } = useLocation();
  return <div key={`${search}|${key}`}>{children}</div>;
}
