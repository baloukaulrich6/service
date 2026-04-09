import { Sun, Moon } from 'lucide-react';
import { StockSearch } from '../shared/StockSearch';
import { useUserStore } from '../../store/useUserStore';
import { isSupabaseEnabled } from '../../services/supabaseClient';

export function Topbar() {
  const { theme, setTheme } = useUserStore();

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">AM</span>
        </div>
        <span className="text-sm font-bold text-primary">AfriMarket</span>
      </div>

      <div className="hidden lg:block">
        <StockSearch />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {isSupabaseEnabled && (
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Données réelles
          </span>
        )}
        <div className="lg:hidden">
          <StockSearch />
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted hover:text-primary hover:bg-elevated rounded-lg transition-colors"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
