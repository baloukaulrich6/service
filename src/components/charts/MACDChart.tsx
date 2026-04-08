import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import type { TechnicalIndicators } from '../../types/market';
import { formatShortDate } from '../../utils/formatting';

interface MACDChartProps {
  data: TechnicalIndicators[];
}

export function MACDChart({ data }: MACDChartProps) {
  const chartData = data
    .filter((d) => d.macd !== null)
    .map((d) => ({ date: d.date, macd: d.macd, signal: d.macdSignal, histogram: d.macdHistogram }));

  if (chartData.length === 0) return null;

  return (
    <div>
      <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">MACD (12, 26, 9)</div>
      <ResponsiveContainer width="100%" height={100}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} itemStyle={{ color: '#F9FAFB', fontSize: 11 }} labelStyle={{ color: '#9CA3AF', fontSize: 10 }} labelFormatter={formatShortDate} />
          <ReferenceLine y={0} stroke="#6B7280" strokeWidth={1} />
          <Bar dataKey="histogram" fill="#3B82F6" opacity={0.4} />
          <Line type="monotone" dataKey="macd" stroke="#10B981" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="signal" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
