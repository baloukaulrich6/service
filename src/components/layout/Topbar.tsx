import { Sun, Moon } from 'lucide-react';
import { StockSearch } from '../shared/StockSearch';
import { useUserStore } from '../../store/useUserStore';

export function Topbar() {
  const { theme, setTheme } = useUserStore();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">AM</span>
        </div>
        <span className="text-sm font-bold text-white">AfriMarket</span>
      </div>

      <div className="hidden lg:block">
        <StockSearch />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="lg:hidden">
          <StockSearch />
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
