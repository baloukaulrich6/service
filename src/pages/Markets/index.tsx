import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Filter } from 'lucide-react';
import { useMarketStore } from '../../store/useMarketStore';
import { STOCKS_METADATA } from '../../data/stocksMetadata';
import { getHistory, getSlice } from '../../services/marketDataService';
import { computeIndicators, getLatestIndicators } from '../../services/technicalAnalysis';
import { computeRecommendation } from '../../services/recommendationEngine';
import { Card } from '../../components/ui/Card';
import { MiniSparkline } from '../../components/charts/MiniSparkline';
import { formatPrice, formatPercent, formatVolume, formatCurrency } from '../../utils/formatting';
import { getChangeBg, getSignalBg, getExchangeBg } from '../../utils/colorScale';
import type { Exchange, Sector } from '../../types/market';

const SECTORS: Sector[] = [
  'Telecommunications', 'Banking & Finance', 'Oil & Gas', 'Agriculture & Food',
  'Industry', 'Water & Energy', 'Distribution', 'Transport',
];

export default function Markets() {
  const navigate = useNavigate();
  const { quotes, initializeAllQuotes } = useMarketStore();
  const [exchange, setExchange] = useState<Exchange | 'ALL'>('ALL');
  const [sector, setSector] = useState<Sector | 'ALL'>('ALL');
  const [perfFilter, setPerfFilter] = useState<'ALL' | '>5' | '>0' | '<0' | '<-5'>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  useEffect(() => { initializeAllQuotes(); }, [initializeAllQuotes]);

  const enriched = STOCKS_METADATA.map((s) => {
    const history = getHistory(s);
    const indicators = computeIndicators(history);
    const latest = getLatestIndicators(indicators);
    const rec = computeRecommendation(s, latest);
    const quote = quotes[s.id];
    return { ...s, quote, rec, history };
  });

  const filtered = enriched.filter((s) => {
    if (exchange !== 'ALL' && s.exchange !== exchange) return false;
    if (sector !== 'ALL' && s.sector !== sector) return false;
    if (search && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (!s.quote) return true;
    const chg = s.quote.changePercent;
    if (perfFilter === '>5' && chg <= 5) return false;
    if (perfFilter === '>0' && chg <= 0) return false;
    if (perfFilter === '<0' && chg >= 0) return false;
    if (perfFilter === '<-5' && chg >= -5) return false;
    return true;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Marchés</h1>
        <p className="text-gray-400 text-sm mt-1">BVMAC & BRVM – {filtered.length} titres</p>
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none w-40"
        />
        {(['ALL', 'BVMAC', 'BRVM'] as const).map((ex) => (
          <button
            key={ex}
            onClick={() => setExchange(ex)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${exchange === ex ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {ex}
          </button>
        ))}
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value as Sector | 'ALL')}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
        >
          <option value="ALL">Tous secteurs</option>
          {SECTORS.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
        </select>
        <select
          value={perfFilter}
          onChange={(e) => setPerfFilter(e.target.value as typeof perfFilter)}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
        >
          <option value="ALL">Toutes performances</option>
          <option value=">5">+5% et plus</option>
          <option value=">0">En hausse</option>
          <option value="<0">En baisse</option>
          <option value="<-5">-5% et moins</option>
        </select>
        <div className="ml-auto flex gap-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}><LayoutGrid size={16} className="text-gray-300" /></button>
          <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}><List size={16} className="text-gray-300" /></button>
        </div>
      </Card>

      {viewMode === 'table' ? (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Titre', 'Bourse', 'Cours', 'Variation', '1M', 'Volume', 'Mkt Cap', 'P/E', 'Div.', 'Signal'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const hist1M = getSlice(s.history, '1M');
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/markets/${s.id}`)}
                      className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white text-sm">{s.id}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{s.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getExchangeBg(s.exchange)}`}>{s.exchange}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">
                        {s.quote ? formatPrice(s.quote.price, s.currency) : '–'}
                      </td>
                      <td className="px-4 py-3">
                        {s.quote ? (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getChangeBg(s.quote.changePercent)}`}>
                            {formatPercent(s.quote.changePercent)}
                          </span>
                        ) : '–'}
                      </td>
                      <td className="px-4 py-3 w-20">
                        <MiniSparkline data={hist1M} positive={(s.quote?.changePercent ?? 0) >= 0} height={32} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {s.quote ? formatVolume(s.quote.volume) : '–'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {formatCurrency(s.marketCap * 1_000_000, s.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{s.peRatio.toFixed(1)}x</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{s.dividendYield.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getSignalBg(s.rec.signal)}`}>
                          {s.rec.signal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => {
            const hist1M = getSlice(s.history, '1M');
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/markets/${s.id}`)}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-left hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-white">{s.id}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[140px]">{s.name}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${getExchangeBg(s.exchange)}`}>{s.exchange}</span>
                </div>
                <MiniSparkline data={hist1M} positive={(s.quote?.changePercent ?? 0) >= 0} height={50} />
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div className="text-sm font-bold text-white">{s.quote ? formatPrice(s.quote.price, s.currency) : '–'}</div>
                    {s.quote && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getChangeBg(s.quote.changePercent)}`}>
                        {formatPercent(s.quote.changePercent)}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getSignalBg(s.rec.signal)}`}>
                    {s.rec.signal}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Filter size={32} className="mx-auto mb-3 opacity-50" />
          <p>Aucun titre ne correspond aux filtres sélectionnés.</p>
        </div>
      )}
    </div>
  );
}
