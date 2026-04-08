import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { usePortfolioMetrics } from '../../hooks/usePortfolioMetrics';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useMarketStore } from '../../store/useMarketStore';
import { STOCKS_BY_ID, STOCKS_METADATA } from '../../data/stocksMetadata';
import { exportToCSV } from '../../services/portfolioService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { KPITile } from '../../components/ui/KPITile';
import { DonutChart } from '../../components/charts/DonutChart';
import { formatCurrency, formatPrice, formatPercent, formatDate } from '../../utils/formatting';
import toast from 'react-hot-toast';

type AllocView = 'byStock' | 'byMarket' | 'bySector' | 'byCurrency';

export default function Portfolio() {
  const navigate = useNavigate();
  const { positions, transactions, metrics, allocations } = usePortfolioMetrics();
  const { addTransaction } = usePortfolioStore();
  const quotes = useMarketStore((s) => s.quotes);

  const [addOpen, setAddOpen] = useState(false);
  const [allocView, setAllocView] = useState<AllocView>('byStock');
  const [symbol, setSymbol] = useState('SONATEL');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    const sharesNum = parseInt(shares);
    const priceNum = parseFloat(price);
    if (!sharesNum || !priceNum || sharesNum <= 0 || priceNum <= 0) return;
    addTransaction({
      symbol,
      type,
      shares: sharesNum,
      price: priceNum,
      total: sharesNum * priceNum,
      date: new Date().toISOString().split('T')[0],
      note: note || undefined,
    });
    toast.success(`${type === 'BUY' ? 'Achat' : 'Vente'} de ${sharesNum} ${symbol} enregistré`);
    setAddOpen(false);
    setShares('');
    setPrice('');
    setNote('');
  };

  const handleExport = () => {
    const csv = exportToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portefeuille.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const allocLabels: Record<AllocView, string> = {
    byStock: 'Par titre', byMarket: 'Par marché', bySector: 'Par secteur', byCurrency: 'Par devise',
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portefeuille</h1>
          <p className="text-gray-400 text-sm mt-1">{positions.length} position{positions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>Exporter CSV</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} />Nouvelle transaction</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile label="Valeur totale" value={formatCurrency(metrics.totalValue)} />
        <KPITile label="P&L du jour" value={formatCurrency(metrics.dailyPnL)} delta={metrics.dailyPnLPercent} />
        <KPITile label="P&L total" value={formatCurrency(metrics.totalPnL)} delta={metrics.totalPnLPercent} />
        <KPITile label="Diversification" value={`${metrics.diversificationScore}/10`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Allocation Donut */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Allocation</h2>
            <select
              value={allocView}
              onChange={(e) => setAllocView(e.target.value as AllocView)}
              className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 outline-none"
            >
              {(Object.keys(allocLabels) as AllocView[]).map((k) => (
                <option key={k} value={k}>{allocLabels[k]}</option>
              ))}
            </select>
          </div>
          <DonutChart data={allocations[allocView]} />
        </Card>

        {/* Positions Table */}
        <Card padding={false} className="lg:col-span-3">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-base font-semibold text-white">Positions</h2>
          </div>
          {positions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Aucune position. Ajoutez votre première transaction.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    {['Titre', 'Qté', 'Prix moy.', 'Cours', 'Valeur', 'P&L', ''].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs text-gray-400 uppercase font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => {
                    const quote = quotes[pos.symbol];
                    const currentValue = quote ? pos.shares * quote.price : 0;
                    const costBasis = pos.shares * pos.avgCostBasis;
                    const pnl = currentValue - costBasis;
                    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                    return (
                      <tr key={pos.symbol} className="border-b border-gray-800 hover:bg-gray-700/20">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-white">{pos.symbol}</div>
                          <div className="text-xs text-gray-500">{pos.exchange}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{pos.shares.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{formatPrice(pos.avgCostBasis, pos.currency)}</td>
                        <td className="px-4 py-3 text-sm text-white">{quote ? formatPrice(quote.price, pos.currency) : '–'}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{formatCurrency(currentValue, pos.currency)}</td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-medium ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, pos.currency)}
                          </div>
                          <div className={`text-xs ${pnlPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatPercent(pnlPct)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => navigate(`/markets/${pos.symbol}`)} className="text-gray-500 hover:text-white">
                            <ExternalLink size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card>
          <h2 className="text-base font-semibold text-white mb-4">Historique des transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Date', 'Titre', 'Type', 'Quantité', 'Prix', 'Total', 'Note'].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs text-gray-400 uppercase font-medium pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((tx) => {
                  const meta = STOCKS_BY_ID[tx.symbol];
                  return (
                    <tr key={tx.id} className="border-b border-gray-800">
                      <td className="py-2.5 pr-4 text-gray-400">{formatDate(tx.date)}</td>
                      <td className="py-2.5 pr-4 font-medium text-white">{tx.symbol}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type === 'BUY' ? 'Achat' : 'Vente'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-300">{tx.shares.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-gray-300">{formatPrice(tx.price, meta?.currency ?? 'XAF')}</td>
                      <td className="py-2.5 pr-4 text-white font-medium">{formatCurrency(tx.total, meta?.currency ?? 'XAF')}</td>
                      <td className="py-2.5 text-gray-500 text-xs">{tx.note ?? '–'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Transaction Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Nouvelle transaction">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['BUY', 'SELL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${type === t ? (t === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-gray-700 text-gray-300'}`}
              >
                {t === 'BUY' ? 'Achat' : 'Vente'}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Titre</label>
            <select value={symbol} onChange={(e) => { setSymbol(e.target.value); const m = STOCKS_BY_ID[e.target.value]; if (m && quotes[e.target.value]) setPrice(quotes[e.target.value].price.toString()); }} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
              {STOCKS_METADATA.map((s) => <option key={s.id} value={s.id}>{s.id} – {s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre d'actions</label>
              <input type="number" min="1" value={shares} onChange={(e) => setShares(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Prix unitaire</label>
              <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" placeholder="Prix" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" placeholder="Optionnel..." />
          </div>
          <Button onClick={handleAdd} className="w-full justify-center">Confirmer</Button>
        </div>
      </Modal>
    </div>
  );
}
