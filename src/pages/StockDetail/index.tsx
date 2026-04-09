import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useStockData } from '../../hooks/useStockData';
import { useTechnicalIndicators } from '../../hooks/useTechnicalIndicators';
import { useRecommendation } from '../../hooks/useRecommendation';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useMarketStore } from '../../store/useMarketStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { RiskScoreMeter } from '../../components/shared/RiskScoreMeter';
import { PriceChange } from '../../components/shared/PriceChange';
import { AreaPriceChart } from '../../components/charts/AreaPriceChart';
import { RSIChart } from '../../components/charts/RSIChart';
import { MACDChart } from '../../components/charts/MACDChart';
import { BollingerChart } from '../../components/charts/BollingerChart';
import { formatPrice, formatCurrency, formatNumber, formatDate } from '../../utils/formatting';
import { getSignalBg, getExchangeBg } from '../../utils/colorScale';
import toast from 'react-hot-toast';

type Period = '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX';
const PERIODS: Period[] = ['1W', '1M', '3M', '6M', '1Y', '3Y', 'MAX'];

export default function StockDetail() {
  const { symbol = '' } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('1Y');
  const [showTechnicals, setShowTechnicals] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeShares, setTradeShares] = useState('');
  const [tradeNote, setTradeNote] = useState('');
  const [expandSignals, setExpandSignals] = useState(false);

  const { meta, history, fullHistory, loading } = useStockData(symbol, period);
  const { indicators, latest } = useTechnicalIndicators(fullHistory);
  const rec = useRecommendation(meta, latest);
  const addTransaction = usePortfolioStore((s) => s.addTransaction);
  const quotes = useMarketStore((s) => s.quotes);
  const quote = quotes[symbol];

  if (loading || !meta) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  const handleBuy = () => {
    const shares = parseInt(tradeShares);
    if (!shares || shares <= 0 || !quote) return;
    addTransaction({
      symbol,
      type: 'BUY',
      shares,
      price: quote.price,
      total: shares * quote.price,
      date: new Date().toISOString().split('T')[0],
      note: tradeNote || undefined,
    });
    toast.success(`${shares} actions ${symbol} achetées`);
    setTradeOpen(false);
    setTradeShares('');
    setTradeNote('');
  };

  const high52 = fullHistory.length > 0 ? Math.max(...fullHistory.slice(-252).map((d) => d.high)) : 0;
  const low52 = fullHistory.length > 0 ? Math.min(...fullHistory.slice(-252).map((d) => d.low)) : 0;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <button onClick={() => navigate('/markets')} className="flex items-center gap-2 text-muted hover:text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Marchés
      </button>

      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-primary">{symbol}</h1>
              <Badge className={getExchangeBg(meta.exchange)}>{meta.exchange}</Badge>
              <Badge className="bg-elevated text-secondary border-border">{meta.sector}</Badge>
            </div>
            <p className="text-muted text-sm">{meta.name} · {meta.country}</p>
          </div>
          <Button onClick={() => setTradeOpen(true)} className="shrink-0">
            <Plus size={16} /> Ajouter au portefeuille
          </Button>
        </div>

        {quote && (
          <div className="mt-4 flex flex-wrap items-baseline gap-4">
            <span className="text-4xl font-bold text-primary">{formatPrice(quote.price, meta.currency)}</span>
            <PriceChange change={quote.change} changePercent={quote.changePercent} currency={meta.currency} />
          </div>
        )}
      </Card>

      {/* Price Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${period === p ? 'bg-emerald-500 text-white' : 'text-muted hover:text-primary hover:bg-elevated'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowTechnicals(!showTechnicals)}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${showTechnicals ? 'bg-purple-500/20 text-purple-400' : 'bg-elevated text-muted hover:text-primary'}`}
          >
            Indicateurs techniques
          </button>
        </div>
        <AreaPriceChart data={history} currency={meta.currency} />

        {showTechnicals && indicators.length > 0 && (
          <div className="mt-6 space-y-4 border-t border-border pt-4">
            <RSIChart data={indicators} />
            <MACDChart data={indicators} />
            <BollingerChart data={indicators} currency={meta.currency} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fundamentals */}
        <Card>
          <h2 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
            <Info size={16} className="text-blue-400" /> Données fondamentales
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Capitalisation', value: formatCurrency(meta.marketCap * 1_000_000, meta.currency) },
              { label: 'P/E Ratio', value: `${meta.peRatio.toFixed(1)}x` },
              { label: 'Rendement Div.', value: `${meta.dividendYield.toFixed(1)}%` },
              { label: 'Actions en circ.', value: formatNumber(meta.sharesOutstanding, 0) },
              { label: 'Plus haut 52s', value: formatPrice(high52, meta.currency) },
              { label: 'Plus bas 52s', value: formatPrice(low52, meta.currency) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-xs text-muted mb-1">{label}</div>
                <div className="text-sm font-semibold text-primary">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
            <div className="text-xs text-muted mb-1">À propos</div>
            <p className="text-sm text-secondary leading-relaxed">{meta.description}</p>
          </div>
        </Card>

        {/* Recommendation */}
        {rec && (
          <Card>
            <h2 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
              {rec.signal === 'BUY' ? <TrendingUp size={16} className="text-emerald-500" /> : rec.signal === 'SELL' ? <TrendingDown size={16} className="text-rose-500" /> : <Info size={16} className="text-yellow-500" />}
              Recommandation
            </h2>

            <div className={`rounded-xl p-4 mb-4 border ${getSignalBg(rec.signal)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{rec.signal}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">Score: {rec.score > 0 ? '+' : ''}{rec.score}</div>
                  <div className="text-xs opacity-70">Confiance: {rec.confidence}%</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed opacity-90">{rec.summary}</p>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-secondary mb-2">Score de risque</div>
              <RiskScoreMeter score={rec.riskScore} label={rec.riskLabel} />
            </div>

            <div>
              <button
                onClick={() => setExpandSignals(!expandSignals)}
                className="text-sm text-muted hover:text-primary flex items-center gap-1 mb-2 transition-colors"
              >
                {expandSignals ? '▾' : '▸'} Détail des signaux ({rec.signals.length})
              </button>
              {expandSignals && (
                <div className="space-y-2">
                  {rec.signals.map((sig) => (
                    <div key={sig.name} className="flex items-start gap-2 text-xs">
                      <span className={`shrink-0 w-2 h-2 rounded-full mt-1 ${sig.signal === 'bullish' ? 'bg-emerald-500' : sig.signal === 'bearish' ? 'bg-rose-500' : 'bg-gray-500'}`} />
                      <div>
                        <div className="font-medium text-secondary">{sig.name} <span className="text-muted">({sig.weight}%)</span></div>
                        <div className="text-muted">{sig.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-muted">
              Mis à jour le {formatDate(rec.updatedAt)}. Données simulées à titre éducatif uniquement.
            </div>
          </Card>
        )}
      </div>

      {/* Trade Modal */}
      <Modal isOpen={tradeOpen} onClose={() => setTradeOpen(false)} title={`Acheter ${symbol}`}>
        <div className="space-y-4">
          {quote && (
            <div className="bg-gray-700/50 rounded-lg p-3 text-sm">
              <span className="text-muted">Cours actuel : </span>
              <span className="text-primary font-semibold">{formatPrice(quote.price, meta.currency)}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Nombre d'actions</label>
            <input
              type="number"
              min="1"
              value={tradeShares}
              onChange={(e) => setTradeShares(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none focus:border-emerald-500"
              placeholder="ex: 10"
            />
          </div>
          {quote && tradeShares && parseInt(tradeShares) > 0 && (
            <div className="bg-gray-700/30 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Total estimé</span>
                <span className="text-primary font-semibold">{formatPrice(parseInt(tradeShares) * quote.price, meta.currency)}</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Note (optionnel)</label>
            <input
              value={tradeNote}
              onChange={(e) => setTradeNote(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-primary text-sm outline-none focus:border-emerald-500"
              placeholder="Raison de l'achat..."
            />
          </div>
          <Button onClick={handleBuy} className="w-full justify-center" disabled={!tradeShares || parseInt(tradeShares) <= 0}>
            Confirmer l'achat
          </Button>
        </div>
      </Modal>
    </div>
  );
}
