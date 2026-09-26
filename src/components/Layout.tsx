import { NavLink, Outlet } from 'react-router-dom';
import { IconArtworks, IconMore, IconQuestions, IconToday, IconTraining } from './Icons';
import { PwaStatus } from './PwaStatus';

const TABS = [
  { to: '/', label: 'Dziś', Icon: IconToday, end: true },
  { to: '/pytania', label: 'Pytania', Icon: IconQuestions },
  { to: '/dziela', label: 'Dzieła', Icon: IconArtworks },
  { to: '/trening', label: 'Trening', Icon: IconTraining },
  { to: '/wiecej', label: 'Więcej', Icon: IconMore },
];

export function Layout() {
  return (
    <div className="shell">
      <nav className="tabbar" aria-label="Główna nawigacja">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="main">
        <PwaStatus />
        <Outlet />
      </main>
    </div>
  );
}
