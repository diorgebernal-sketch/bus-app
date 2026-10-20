import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export interface Tab {
  to: string;
  label: string;
  icon: string;
  badge?: number;
  end?: boolean;
}

export function Layout({ title, subtitle, tabs }: { title: string; subtitle: string; tabs: Tab[] }) {
  const { signOut } = useStore();
  const navigate = useNavigate();
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>🚌</span>
          <div>
            <div className="brand-title">{title}</div>
            <div className="brand-sub">{subtitle}</div>
          </div>
        </div>
        <button
          className="btn-ghost"
          onClick={() => {
            signOut();
            navigate('/');
          }}
        >
          Sign out
        </button>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <nav className="tabbar">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <span className="tab-icon" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
            {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
