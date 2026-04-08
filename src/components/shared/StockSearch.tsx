import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STOCKS_METADATA } from '../../data/stocksMetadata';
import { getExchangeBg } from '../../utils/colorScale';

export function StockSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = query.trim().length > 0
    ? STOCKS_METADATA.filter(
        (s) =>
          s.id.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 w-64">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Rechercher un titre..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map((s) => (
            <button
              key={s.id}
              onClick={() => { navigate(`/markets/${s.id}`); setQuery(''); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors"
            >
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{s.id}</div>
                <div className="text-xs text-gray-400 truncate">{s.name}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getExchangeBg(s.exchange)}`}>
                {s.exchange}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
