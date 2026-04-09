import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  BarChart2,
  Bell,
  User,
  Megaphone,
  Building2,
} from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/markets', label: 'Marchés', icon: TrendingUp },
  { to: '/portfolio', label: 'Portefeuille', icon: Briefcase },
  { to: '/analysis', label: 'Analyse', icon: BarChart2 },
  { to: '/alerts', label: 'Alertes', icon: Bell },
  { to: '/announcements', label: 'Annonces IPO', icon: Megaphone },
  { to: '/sgi', label: 'Fonds SGI', icon: Building2 },
  { to: '/profile', label: 'Profil', icon: User },
];

export function Sidebar() {
  const unread = useAlertStore((s) => s.history.filter((a) => !a.isRead).length);

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-surface border-r border-border min-h-screen py-6">
      <div className="px-5 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-primary">AfriMarket</div>
            <div className="text-xs text-muted">BVMAC · BRVM</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-secondary hover:text-primary hover:bg-elevated'
              }`
            }
          >
            <Icon size={18} />
            {label}
            {label === 'Alertes' && unread > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 mt-4">
        <div className="text-xs text-muted">AfriMarket v1.1 · BVMAC & BRVM</div>
      </div>
    </aside>
  );
}
