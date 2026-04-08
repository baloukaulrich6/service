import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STOCKS_METADATA } from '../../data/stocksMetadata';
import { getHistory } from '../../services/marketDataService';
import { computeIndicators, getLatestIndicators } from '../../services/technicalAnalysis';
import { computeRecommendation } from '../../services/recommendationEngine';
import { Card } from '../../components/ui/Card';
import { correlationToColor, getSignalBg } from '../../utils/colorScale';
import { formatCurrency } from '../../utils/formatting';
import { useUserStore } from '../../store/useUserStore';

type Tab = 'simulator' | 'profiler' | 'correlation' | 'scanner';

const QUIZ: { q: string; opts: { label: string; score: number }[] }[] = [
  { q: "Quel est votre horizon d'investissement ?", opts: [{ label: 'Moins de 1 an', score: 20 }, { label: '1 à 3 ans', score: 45 }, { label: '3 à 5 ans', score: 65 }, { label: 'Plus de 5 ans', score: 85 }] },
  { q: 'Quelle perte maximale pouvez-vous tolérer ?', opts: [{ label: 'Aucune perte', score: 10 }, { label: "Jusqu'à 10%", score: 30 }, { label: "Jusqu'à 25%", score: 60 }, { label: 'Plus de 25%', score: 90 }] },
  { q: 'Quelle est la stabilité de vos revenus ?', opts: [{ label: 'Très instable', score: 20 }, { label: 'Assez instable', score: 40 }, { label: 'Assez stable', score: 65 }, { label: 'Très stable', score: 85 }] },
  { q: 'Avez-vous une expérience des marchés financiers ?', opts: [{ label: 'Aucune', score: 20 }, { label: 'Débutant', score: 40 }, { label: 'Intermédiaire', score: 65 }, { label: 'Expérimenté', score: 85 }] },
  { q: 'Quel est votre objectif principal ?', opts: [{ label: 'Préserver le capital', score: 15 }, { label: 'Revenus réguliers', score: 35 }, { label: 'Croissance équilibrée', score: 60 }, { label: 'Croissance maximale', score: 90 }] },
  { q: 'Réaction face à une baisse de 20% en 1 mois ?', opts: [{ label: 'Vendre immédiatement', score: 10 }, { label: 'Vendre une partie', score: 30 }, { label: 'Conserver', score: 60 }, { label: 'Acheter davantage', score: 90 }] },
  { q: "Quel % de vos économies investissez-vous ?", opts: [{ label: 'Moins de 10%', score: 25 }, { label: '10–25%', score: 50 }, { label: '25–50%', score: 70 }, { label: 'Plus de 50%', score: 85 }] },
  { q: 'Importance de la liquidité pour vous ?', opts: [{ label: 'Très importante', score: 20 }, { label: 'Importante', score: 40 }, { label: 'Peu importante', score: 65 }, { label: 'Non importante', score: 85 }] },
];

function computeCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return 0;
  const meanA = a.reduce((s, v) => s + v, 0) / a.length;
  const meanB = b.reduce((s, v) => s + v, 0) / b.length;
  let num = 0, dA = 0, dB = 0;
  for (let i = 0; i < a.length; i++) {
    const da = a[i] - meanA, db = b[i] - meanB;
    num += da * db; dA += da * da; dB += db * db;
  }
  return dA === 0 || dB === 0 ? 0 : num / Math.sqrt(dA * dB);
}

function dailyReturns(closes: number[]): number[] {
  const r: number[] = [];
  for (let i = 1; i < closes.length; i++) r.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  return r;
}

export default function Analysis() {
  const [tab, setTab] = useState<Tab>('simulator');
  const setRisk = useUserStore((s) => s.setRiskProfileScore);
  const updatePrefs = useUserStore((s) => s.updatePreferences);

  // Simulator state
  const [simSymbol, setSimSymbol] = useState('SONATEL');
  const [simMonthly, setSimMonthly] = useState(100000);
  const [simYears, setSimYears] = useState(5);

  // Profiler state
  const [answers, setAnswers] = useState<number[]>([]);
  const [profileResult, setProfileResult] = useState<null | { score: number; label: string; stocks: number; bonds: number; bvmac: number; brvm: number }>(null);

  // Simulator calculation
  const simData = useMemo(() => {
    const meta = STOCKS_METADATA.find((s) => s.id === simSymbol)!;
    const baseReturn = meta.annualDrift;
    const optReturn = baseReturn + meta.annualVolatility * 0.5;
    const pesReturn = baseReturn - meta.annualVolatility * 0.5;
    const months = simYears * 12;
    const data = [];
    for (let m = 0; m <= months; m++) {
      const grow = (r: number) => simMonthly * ((Math.pow(1 + r / 12, m) - 1) / (r / 12));
      data.push({
        mois: m,
        optimiste: Math.round(grow(optReturn)),
        base: Math.round(grow(baseReturn)),
        pessimiste: Math.round(grow(pesReturn)),
      });
    }
    return data;
  }, [simSymbol, simMonthly, simYears]);

  // Correlation matrix
  const corrData = useMemo(() => {
    const returns: Record<string, number[]> = {};
    const N = 252;
    for (const s of STOCKS_METADATA) {
      const h = getHistory(s);
      const closes = h.slice(-N).map((d) => d.close);
      returns[s.id] = dailyReturns(closes);
    }
    return returns;
  }, []);

  // Opportunity scanner
  const opportunities = useMemo(() => {
    return STOCKS_METADATA.map((s) => {
      const h = getHistory(s);
      const indics = computeIndicators(h);
      const latest = getLatestIndicators(indics);
      const rec = computeRecommendation(s, latest);
      const reasons: string[] = [];
      if (latest?.rsi !== null && latest?.rsi !== undefined && latest.rsi < 30) reasons.push('RSI survendu');
      if (latest?.bbPercentB !== null && latest?.bbPercentB !== undefined && latest.bbPercentB < 0.2) reasons.push('Proche BB inférieure');
      if (latest?.sma20 !== null && latest?.sma50 !== null && latest?.sma20 !== undefined && latest?.sma50 !== undefined && latest.sma20 > latest.sma50 * 0.98 && latest.sma20 < latest.sma50 * 1.02) reasons.push('Croisement doré en formation');
      if (s.dividendYield > 7) reasons.push(`Rendement ${s.dividendYield.toFixed(1)}%`);
      return { ...s, rec, reasons, latest };
    }).filter((s) => s.reasons.length > 0);
  }, []);

  const handleQuiz = (qIdx: number, score: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = score;
    setAnswers(newAnswers);
    if (newAnswers.filter(Boolean).length === QUIZ.length) {
      const avg = newAnswers.reduce((s, v) => s + v, 0) / QUIZ.length;
      let label = 'Conservateur', stocks = 30, bonds = 70, bvmac = 20, brvm = 10;
      if (avg >= 70) { label = 'Agressif'; stocks = 80; bonds = 20; bvmac = 40; brvm = 40; }
      else if (avg >= 45) { label = 'Modéré'; stocks = 55; bonds = 45; bvmac = 30; brvm = 25; }
      setProfileResult({ score: Math.round(avg), label, stocks, bonds, bvmac, brvm });
      setRisk(Math.round(avg));
      updatePrefs({ riskTolerance: avg >= 70 ? 'aggressive' : avg >= 45 ? 'moderate' : 'conservative' });
    }
  };

  const TABS = [
    { key: 'simulator', label: 'Simulateur' },
    { key: 'profiler', label: 'Profil de risque' },
    { key: 'correlation', label: 'Corrélations' },
    { key: 'scanner', label: 'Opportunités' },
  ] as const;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Analyse</h1>
        <p className="text-gray-400 text-sm mt-1">Outils d'aide à la décision d'investissement</p>
      </div>

      <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Simulator */}
      {tab === 'simulator' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-white mb-4">Simulateur d'investissement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Titre</label>
                <select value={simSymbol} onChange={(e) => setSimSymbol(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
                  {STOCKS_METADATA.map((s) => <option key={s.id} value={s.id}>{s.id} – {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Investissement mensuel (XAF)</label>
                <input type="number" value={simMonthly} onChange={(e) => setSimMonthly(Number(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Horizon ({simYears} ans)</label>
                <input type="range" min="1" max="20" value={simYears} onChange={(e) => setSimYears(Number(e.target.value))} className="w-full mt-2" />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Scénario optimiste', value: simData[simData.length - 1]?.optimiste ?? 0, color: 'text-emerald-500' },
                { label: 'Scénario de base', value: simData[simData.length - 1]?.base ?? 0, color: 'text-blue-400' },
                { label: 'Scénario pessimiste', value: simData[simData.length - 1]?.pessimiste ?? 0, color: 'text-rose-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={simData}>
                <defs>
                  <linearGradient id="gOpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mois" tickFormatter={(v: number) => `M${v}`} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v: number) => (v / 1_000_000).toFixed(1) + 'M'} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v: number, name: string) => [formatCurrency(v), name]} />
                <Legend formatter={(v: string) => <span style={{ color: '#9CA3AF', fontSize: 11 }}>{v}</span>} />
                <Area type="monotone" dataKey="optimiste" name="Optimiste" stroke="#10B981" fill="url(#gOpt)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="base" name="Base" stroke="#3B82F6" fill="url(#gBase)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="pessimiste" name="Pessimiste" stroke="#F43F5E" fill="url(#gPes)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">Simulation basée sur la volatilité et la tendance historique de {simSymbol}. À titre éducatif uniquement.</p>
          </Card>
        </div>
      )}

      {/* Risk Profiler */}
      {tab === 'profiler' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <h2 className="text-base font-semibold text-white mb-4">Questionnaire de profil investisseur</h2>
            <div className="space-y-5">
              {QUIZ.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-medium text-gray-200 mb-2">{qi + 1}. {q.q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.opts.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleQuiz(qi, opt.score)}
                        className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${answers[qi] === opt.score ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-700'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {profileResult && (
            <Card>
              <h2 className="text-base font-semibold text-white mb-4">Votre profil : <span className="text-emerald-400">{profileResult.label}</span></h2>
              <div className="text-5xl font-bold text-white mb-1">{profileResult.score}<span className="text-2xl text-gray-500">/100</span></div>
              <p className="text-gray-400 text-sm mb-6">Score de tolérance au risque</p>
              <div className="space-y-3">
                {[
                  { label: 'Actions', value: profileResult.stocks, color: 'bg-emerald-500' },
                  { label: 'Obligations', value: profileResult.bonds, color: 'bg-blue-500' },
                  { label: 'BVMAC (Afrique Centrale)', value: profileResult.bvmac, color: 'bg-blue-400' },
                  { label: "BRVM (Afrique de l'Ouest)", value: profileResult.brvm, color: 'bg-amber-500' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>{label}</span><span className="font-semibold text-white">{value}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-700/30 rounded-lg text-xs text-gray-400">
                Profil sauvegardé dans vos préférences. Consultez la page Marchés pour voir les titres recommandés.
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Correlation Matrix */}
      {tab === 'correlation' && (
        <Card>
          <h2 className="text-base font-semibold text-white mb-2">Matrice de corrélation</h2>
          <p className="text-xs text-gray-400 mb-4">Corrélations des rendements journaliers sur 252 jours. Bleu = anticorrélé, Rouge = corrélé.</p>
          <div className="overflow-x-auto">
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="w-20 pr-2" />
                  {STOCKS_METADATA.map((s) => (
                    <th key={s.id} className="px-1 py-1 text-gray-400 font-medium w-12 text-center writing-vertical">{s.id}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STOCKS_METADATA.map((sA) => (
                  <tr key={sA.id}>
                    <td className="pr-2 text-gray-400 font-medium text-right py-1">{sA.id}</td>
                    {STOCKS_METADATA.map((sB) => {
                      const corr = computeCorrelation(corrData[sA.id] ?? [], corrData[sB.id] ?? []);
                      return (
                        <td key={sB.id} title={`${sA.id}/${sB.id}: ${corr.toFixed(2)}`} className={`w-8 h-8 text-center ${correlationToColor(corr)} ${sA.id === sB.id ? 'opacity-100' : 'opacity-80'}`}>
                          <span className="text-[10px] font-medium text-white/80">{sA.id === sB.id ? '1' : corr.toFixed(1)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Scanner */}
      {tab === 'scanner' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-white mb-1">Scanner d'opportunités</h2>
            <p className="text-xs text-gray-400 mb-4">Titres qui répondent à au moins un critère technique ou fondamental favorable.</p>
          </Card>
          {opportunities.length === 0 ? (
            <Card className="text-center py-12 text-gray-500">Aucune opportunité détectée actuellement.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((s) => (
                <Card key={s.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-white">{s.id}</div>
                      <div className="text-xs text-gray-400">{s.name}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getSignalBg(s.rec.signal)}`}>{s.rec.signal}</span>
                  </div>
                  <div className="space-y-1">
                    {s.reasons.map((r) => (
                      <div key={r} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                  {s.latest?.rsi !== null && s.latest?.rsi !== undefined && (
                    <div className="mt-2 text-xs text-gray-500">RSI: {s.latest.rsi.toFixed(1)} · Div: {s.dividendYield.toFixed(1)}%</div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
