import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Briefcase, BarChart2, Bell } from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';

const NAV = [
  { to: '/', label: 'Accueil', icon: LayoutDashboard },
  { to: '/markets', label: 'Marchés', icon: TrendingUp },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/analysis', label: 'Analyse', icon: BarChart2 },
  { to: '/alerts', label: 'Alertes', icon: Bell },
];

export function MobileNav() {
  const unread = useAlertStore((s) => s.history.filter((a) => !a.isRead).length);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex z-40">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors relative ${
              isActive ? 'text-emerald-400' : 'text-gray-500'
            }`
          }
        >
          <div className="relative">
            <Icon size={20} />
            {label === 'Alertes' && unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
