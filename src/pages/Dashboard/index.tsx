import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Bell, Briefcase, Activity } from 'lucide-react';
import { useMarketStore } from '../../store/useMarketStore';
import { useAlertStore } from '../../store/useAlertStore';
import { usePortfolioMetrics } from '../../hooks/usePortfolioMetrics';
import { useUserStore } from '../../store/useUserStore';
import { STOCKS_METADATA, BVMAC_STOCKS, BRVM_STOCKS } from '../../data/stocksMetadata';
import { KPITile } from '../../components/ui/KPITile';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MiniSparkline } from '../../components/charts/MiniSparkline';
import { getHistory, getSlice } from '../../services/marketDataService';
import { formatPrice, formatPercent, formatCurrency } from '../../utils/formatting';
import { getChangeBg, getExchangeBg } from '../../utils/colorScale';

function computeIndexChange(stocks: typeof STOCKS_METADATA) {
  let totalCap = 0, weightedChange = 0;
  for (const s of stocks) {
    const history = getHistory(s);
    if (history.length < 2) continue;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    const chg = ((last.close - prev.close) / prev.close) * 100;
    totalCap += s.marketCap;
    weightedChange += chg * s.marketCap;
  }
  return totalCap > 0 ? weightedChange / totalCap : 0;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { quotes, initializeAllQuotes } = useMarketStore();
  const { history: alertHistory } = useAlertStore();
  const { metrics } = usePortfolioMetrics();
  const profile = useUserStore((s) => s.profile);

  useEffect(() => { initializeAllQuotes(); }, [initializeAllQuotes]);

  const bvmacChange = computeIndexChange(BVMAC_STOCKS);
  const brvmChange = computeIndexChange(BRVM_STOCKS);

  const sortedByChange = STOCKS_METADATA
    .map((s) => ({ ...s, quote: quotes[s.id] }))
    .filter((s) => s.quote)
    .sort((a, b) => Math.abs(b.quote!.changePercent) - Math.abs(a.quote!.changePercent));

  const topGainers = sortedByChange.filter((s) => s.quote!.changePercent > 0).slice(0, 5);
  const topLosers = sortedByChange.filter((s) => s.quote!.changePercent < 0).slice(0, 5);

  const recentAlerts = alertHistory.filter((a) => !a.isRead).slice(0, 5);

  // Preferred market stocks
  const featured = profile.preferredMarket === 'BOTH'
    ? STOCKS_METADATA
    : STOCKS_METADATA.filter((s) => s.exchange === profile.preferredMarket);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary">Tableau de bord</h1>
        <p className="text-muted text-sm mt-1">Bienvenue, {profile.name || 'Investisseur'} · Marchés africains en temps réel</p>
      </div>

      {/* Market Index Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile
          label="BVMAC"
          value="Indice composite"
          delta={bvmacChange}
          icon={<Activity size={16} />}
          className="border-blue-500/20"
        />
        <KPITile
          label="BRVM"
          value="Indice composite"
          delta={brvmChange}
          icon={<Activity size={16} />}
          className="border-amber-500/20"
        />
        <KPITile
          label="Portefeuille"
          value={formatCurrency(metrics.totalValue)}
          delta={metrics.dailyPnLPercent}
          icon={<Briefcase size={16} />}
        />
        <KPITile
          label="Alertes non lues"
          value={recentAlerts.length.toString()}
          icon={<Bell size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Movers */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Meilleurs performeurs
            </h2>
            <div className="space-y-2">
              {topGainers.map((s) => {
                const hist = getSlice(getHistory(s), '1M');
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/markets/${s.id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {s.id.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-medium text-primary">{s.id}</div>
                      <div className="text-xs text-muted truncate">{s.name}</div>
                    </div>
                    <div className="w-16 shrink-0">
                      <MiniSparkline data={hist} positive height={28} />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-primary">{formatPrice(s.quote!.price, s.currency)}</div>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getChangeBg(s.quote!.changePercent)}`}>
                        {formatPercent(s.quote!.changePercent)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
              <TrendingDown size={16} className="text-rose-500" /> Plus fortes baisses
            </h2>
            <div className="space-y-2">
              {topLosers.map((s) => {
                const hist = getSlice(getHistory(s), '1M');
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/markets/${s.id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {s.id.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-medium text-primary">{s.id}</div>
                      <div className="text-xs text-muted truncate">{s.name}</div>
                    </div>
                    <div className="w-16 shrink-0">
                      <MiniSparkline data={hist} positive={false} height={28} />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-primary">{formatPrice(s.quote!.price, s.currency)}</div>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getChangeBg(s.quote!.changePercent)}`}>
                        {formatPercent(s.quote!.changePercent)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Portfolio Summary */}
          <Card>
            <h2 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-500" /> Portefeuille
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted text-sm">Valeur totale</span>
                <span className="text-primary font-semibold text-sm">{formatCurrency(metrics.totalValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted text-sm">P&L total</span>
                <span className={`font-semibold text-sm ${metrics.totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metrics.totalPnL >= 0 ? '+' : ''}{formatCurrency(metrics.totalPnL)} ({formatPercent(metrics.totalPnLPercent)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted text-sm">Score diversification</span>
                <span className="text-primary font-semibold text-sm">{metrics.diversificationScore}/10</span>
              </div>
            </div>
            <button onClick={() => navigate('/portfolio')} className="mt-4 w-full text-sm text-emerald-400 hover:text-emerald-300 font-medium">
              Voir le portefeuille →
            </button>
          </Card>

          {/* Market Overview by Exchange */}
          <Card>
            <h2 className="text-base font-semibold text-primary mb-3">Marchés prioritaires</h2>
            <div className="space-y-2">
              {featured.slice(0, 5).map((s) => {
                const q = quotes[s.id];
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/markets/${s.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getExchangeBg(s.exchange)}`}>{s.exchange}</span>
                      <span className="text-sm text-primary font-medium">{s.id}</span>
                    </div>
                    {q ? (
                      <span className={`text-xs font-medium ${getChangeBg(q.changePercent)} px-1.5 py-0.5 rounded-full`}>
                        {formatPercent(q.changePercent)}
                      </span>
                    ) : <span className="text-xs text-muted">–</span>}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Recent Alerts */}
          {recentAlerts.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                <Bell size={16} className="text-rose-400" /> Alertes récentes
              </h2>
              <div className="space-y-2">
                {recentAlerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 shrink-0">{a.symbol}</Badge>
                    <p className="text-xs text-secondary leading-relaxed">{a.message}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/alerts')} className="mt-3 w-full text-sm text-rose-400 hover:text-rose-300 font-medium">
                Voir toutes les alertes →
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
