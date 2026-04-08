import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { TechnicalIndicators } from '../../types/market';
import { formatShortDate } from '../../utils/formatting';

interface BollingerChartProps {
  data: TechnicalIndicators[];
  currency: 'XAF' | 'XOF';
}

export function BollingerChart({ data, currency }: BollingerChartProps) {
  const chartData = data
    .filter((d) => d.bbUpper !== null)
    .map((d) => ({ date: d.date, price: d.close, upper: d.bbUpper, middle: d.bbMiddle, lower: d.bbLower }));

  if (chartData.length === 0) return null;

  return (
    <div>
      <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Bandes de Bollinger (20, 2)</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={(v: number) => (v / 1000).toFixed(0) + 'K'} tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
            itemStyle={{ color: '#F9FAFB', fontSize: 11 }}
            labelStyle={{ color: '#9CA3AF', fontSize: 10 }}
            formatter={(v: number) => [`${v.toLocaleString('fr-FR')} ${currency}`]}
            labelFormatter={formatShortDate}
          />
          <Line type="monotone" dataKey="upper" stroke="#F43F5E" strokeWidth={1} dot={false} opacity={0.7} />
          <Line type="monotone" dataKey="middle" stroke="#F59E0B" strokeWidth={1} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="lower" stroke="#10B981" strokeWidth={1} dot={false} opacity={0.7} />
          <Line type="monotone" dataKey="price" stroke="#E5E7EB" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
