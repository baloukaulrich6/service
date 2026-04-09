import { useEffect, useState } from 'react';
import { Briefcase, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchSGIFunds } from '../../services/realDataService';
import { Card } from '../../components/ui/Card';
import { getExchangeBg } from '../../utils/colorScale';
import { formatCurrency } from '../../utils/formatting';
import type { SGIFund } from '../../types/market';

type SortKey = 'ytdReturn' | 'oneYearReturn' | 'managementFee' | 'nav';
type ExchangeFilter = 'ALL' | 'BRVM' | 'BVMAC';
type TypeFilter = 'ALL' | 'FCP' | 'SICAV';

function PerfBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-24 h-1.5 bg-elevated rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${value >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function SGI() {
  const [funds, setFunds] = useState<SGIFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('ytdReturn');
  const [sortAsc, setSortAsc] = useState(false);
  const [exchange, setExchange] = useState<ExchangeFilter>('ALL');
  const [fundType, setFundType] = useState<TypeFilter>('ALL');

  useEffect(() => {
    fetchSGIFunds().then((data) => {
      setFunds(data);
      setLoading(false);
    });
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = funds
    .filter((f) => exchange === 'ALL' || f.exchange === exchange)
    .filter((f) => fundType === 'ALL' || f.fundType === fundType)
    .sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortAsc ? diff : -diff;
    });

  const maxYtd = Math.max(...funds.map((f) => Math.abs(f.ytdReturn)), 1);

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-1 group">
      {label}
      <ArrowUpDown size={11} className={`transition-colors ${sortKey === col ? 'text-emerald-400' : 'text-muted group-hover:text-secondary'}`} />
    </button>
  );

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Briefcase size={22} className="text-emerald-500" /> Fonds Communs de Placement
        </h1>
        <p className="text-muted text-sm mt-1">Analyse des SGI et OPCVM sur BRVM & BVMAC</p>
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {(['ALL', 'BRVM', 'BVMAC'] as ExchangeFilter[]).map((ex) => (
            <button key={ex} onClick={() => setExchange(ex)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${exchange === ex ? 'bg-emerald-500 text-white' : 'bg-elevated text-secondary hover:bg-elevated/80'}`}>
              {ex}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['ALL', 'FCP', 'SICAV'] as TypeFilter[]).map((t) => (
            <button key={t} onClick={() => setFundType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${fundType === t ? 'bg-emerald-500 text-white' : 'bg-elevated text-secondary hover:bg-elevated/80'}`}>
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted">{filtered.length} fonds</span>
      </Card>

      {loading ? (
        <div className="text-center py-16 text-muted">Chargement...</div>
      ) : (
        <>
          {/* Top performers KPIs */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filtered.slice(0, 3).map((f, i) => (
                <Card key={f.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : 'text-amber-700'}`}>
                      #{i + 1}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getExchangeBg(f.exchange)}`}>{f.exchange}</span>
                    <span className="text-xs text-muted">{f.fundType}</span>
                  </div>
                  <div className="text-sm font-semibold text-primary truncate">{f.fundName}</div>
                  <div className="text-xs text-muted truncate mb-2">{f.sgiName}</div>
                  <div className="flex items-center gap-2">
                    {f.ytdReturn >= 0 ? (
                      <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={14} className="text-rose-500" />
                    )}
                    <span className={`text-xl font-bold ${f.ytdReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {f.ytdReturn >= 0 ? '+' : ''}{f.ytdReturn.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted">YTD</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Full table */}
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      { col: null, label: 'Fonds / SGI' },
                      { col: null, label: 'Type' },
                      { col: 'nav' as SortKey, label: 'VL' },
                      { col: 'ytdReturn' as SortKey, label: 'YTD %' },
                      { col: 'oneYearReturn' as SortKey, label: '1 an %' },
                      { col: 'managementFee' as SortKey, label: 'Frais' },
                      { col: null, label: 'Min. invest.' },
                      { col: null, label: 'Perf.' },
                    ].map(({ col, label }) => (
                      <th key={label} className="px-4 py-3 text-left text-xs text-muted uppercase font-medium whitespace-nowrap">
                        {col ? <SortBtn col={col} label={label} /> : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id} className="border-b border-border hover:bg-elevated/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-primary text-sm">{f.fundName}</div>
                        <div className="text-xs text-muted">{f.sgiName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getExchangeBg(f.exchange)}`}>{f.exchange}</span>
                          <span className="text-xs text-muted">{f.fundType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary whitespace-nowrap">
                        {formatCurrency(f.nav, f.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${f.ytdReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {f.ytdReturn >= 0 ? '+' : ''}{f.ytdReturn.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${f.oneYearReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {f.oneYearReturn >= 0 ? '+' : ''}{f.oneYearReturn.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary">{f.managementFee.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-secondary whitespace-nowrap">
                        {formatCurrency(f.minInvestment, f.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <PerfBar value={f.ytdReturn} max={maxYtd} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="text-xs text-muted text-center">
            Données indicatives – VL (Valeur Liquidative) mise à jour quotidiennement par les SGI.
            Les performances passées ne préjugent pas des performances futures.
          </p>
        </>
      )}
    </div>
  );
}
