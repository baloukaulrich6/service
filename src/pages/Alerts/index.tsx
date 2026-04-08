import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Check } from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';
import { useMarketStore } from '../../store/useMarketStore';
import { STOCKS_METADATA } from '../../data/stocksMetadata';
import { computeIndicators, getLatestIndicators } from '../../services/technicalAnalysis';
import { getHistory } from '../../services/marketDataService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatting';
import type { AlertType } from '../../types/alerts';
import toast from 'react-hot-toast';

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  price_above: 'Prix au-dessus de',
  price_below: 'Prix en-dessous de',
  change_percent: 'Variation % ≥',
  rsi_overbought: 'RSI surachat (>70)',
  rsi_oversold: 'RSI survente (<30)',
  macd_crossover: 'Croisement MACD',
};

export default function Alerts() {
  const { rules, history, addRule, toggleRule, deleteRule, markRead, markAllRead, clearHistory, addTriggered } = useAlertStore();
  const quotes = useMarketStore((s) => s.quotes);
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<'rules' | 'history'>('rules');
  const [newSymbol, setNewSymbol] = useState('SONATEL');
  const [newType, setNewType] = useState<AlertType>('price_above');
  const [newThreshold, setNewThreshold] = useState('');

  // Evaluate alerts against current data
  useEffect(() => {
    for (const rule of rules) {
      if (!rule.isActive) continue;
      const quote = quotes[rule.symbol];
      const stockHistory = getHistory(STOCKS_METADATA.find((s) => s.id === rule.symbol)!);
      const indics = computeIndicators(stockHistory);
      const latest = getLatestIndicators(indics);
      let triggered = false;
      let message = '';

      switch (rule.type) {
        case 'price_above':
          if (quote && quote.price >= rule.threshold) {
            triggered = true;
            message = `${rule.symbol} a dépassé ${rule.threshold.toLocaleString()} (cours: ${quote.price.toLocaleString()})`;
          }
          break;
        case 'price_below':
          if (quote && quote.price <= rule.threshold) {
            triggered = true;
            message = `${rule.symbol} est passé sous ${rule.threshold.toLocaleString()} (cours: ${quote.price.toLocaleString()})`;
          }
          break;
        case 'change_percent':
          if (quote && Math.abs(quote.changePercent) >= rule.threshold) {
            triggered = true;
            message = `${rule.symbol} a varié de ${quote.changePercent.toFixed(2)}%`;
          }
          break;
        case 'rsi_overbought':
          if (latest?.rsi !== null && latest?.rsi !== undefined && latest.rsi > 70) {
            triggered = true;
            message = `${rule.symbol} – RSI en surachat : ${latest.rsi.toFixed(1)}`;
          }
          break;
        case 'rsi_oversold':
          if (latest?.rsi !== null && latest?.rsi !== undefined && latest.rsi < 30) {
            triggered = true;
            message = `${rule.symbol} – RSI en survente : ${latest.rsi.toFixed(1)}`;
          }
          break;
        case 'macd_crossover':
          if (latest?.macd !== null && latest?.macdSignal !== null && latest?.macd !== undefined && latest?.macdSignal !== undefined) {
            if (Math.abs(latest.macd - latest.macdSignal) < 5) {
              triggered = true;
              message = `${rule.symbol} – Croisement MACD en cours`;
            }
          }
          break;
      }

      if (triggered) {
        const alreadyTriggered = history.some((h) => h.ruleId === rule.id && !h.isRead);
        if (!alreadyTriggered) {
          addTriggered({ ruleId: rule.id, symbol: rule.symbol, message, triggeredAt: new Date().toISOString(), isRead: false });
        }
      }
    }
  }, [rules, quotes]);

  const handleAddRule = () => {
    const threshold = parseFloat(newThreshold);
    const needsThreshold = ['price_above', 'price_below', 'change_percent'].includes(newType);
    if (needsThreshold && (!threshold || isNaN(threshold))) return;
    addRule({ symbol: newSymbol, type: newType, threshold: threshold || 0, isActive: true });
    toast.success('Alerte créée');
    setAddOpen(false);
    setNewThreshold('');
  };

  const unread = history.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertes</h1>
          <p className="text-gray-400 text-sm mt-1">{rules.length} règle{rules.length !== 1 ? 's' : ''} · {unread} non lue{unread !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} />Créer une alerte</Button>
      </div>

      <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 w-fit">
        {[{ key: 'rules', label: 'Règles actives' }, { key: 'history', label: `Historique${unread > 0 ? ` (${unread})` : ''}` }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as 'rules' | 'history')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'rules' && (
        <div className="space-y-3">
          {rules.length === 0 && (
            <Card className="text-center py-12">
              <Bell size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">Aucune règle d'alerte. Créez votre première alerte.</p>
            </Card>
          )}
          {rules.map((rule) => (
            <Card key={rule.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{rule.symbol}</Badge>
                  <span className="text-sm text-gray-200 font-medium">{ALERT_TYPE_LABELS[rule.type]}</span>
                  {['price_above', 'price_below', 'change_percent'].includes(rule.type) && (
                    <span className="text-sm text-white font-semibold">{rule.threshold.toLocaleString()}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">Créée le {formatDate(rule.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition-transform ${rule.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <button onClick={() => deleteRule(rule.id)} className="text-gray-500 hover:text-rose-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {history.length > 0 && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={markAllRead}><Check size={14} />Tout marquer lu</Button>
              <Button variant="danger" size="sm" onClick={clearHistory}><Trash2 size={14} />Vider l'historique</Button>
            </div>
          )}
          {history.length === 0 && (
            <Card className="text-center py-12">
              <Bell size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">Aucune alerte déclenchée.</p>
            </Card>
          )}
          {history.map((alert) => (
            <Card key={alert.id} className={`flex items-start gap-3 ${!alert.isRead ? 'border-rose-500/30' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!alert.isRead ? 'bg-rose-500' : 'bg-gray-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{alert.symbol}</Badge>
                  <span className="text-xs text-gray-500">{formatDate(alert.triggeredAt)}</span>
                </div>
                <p className="text-sm text-gray-200">{alert.message}</p>
              </div>
              {!alert.isRead && (
                <button onClick={() => markRead(alert.id)} className="text-gray-500 hover:text-emerald-400 shrink-0">
                  <Check size={14} />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Alert Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Créer une alerte">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Titre</label>
            <select value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
              {STOCKS_METADATA.map((s) => <option key={s.id} value={s.id}>{s.id} – {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Condition</label>
            <select value={newType} onChange={(e) => setNewType(e.target.value as AlertType)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
              {(Object.entries(ALERT_TYPE_LABELS) as [AlertType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          {['price_above', 'price_below', 'change_percent'].includes(newType) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Seuil {newType === 'change_percent' ? '(%)' : '(prix)'}
              </label>
              <input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500"
                placeholder={newType === 'change_percent' ? 'ex: 5' : 'ex: 16000'}
              />
            </div>
          )}
          <Button onClick={handleAddRule} className="w-full justify-center">Créer l'alerte</Button>
        </div>
      </Modal>
    </div>
  );
}
