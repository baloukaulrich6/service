import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import type { TechnicalIndicators } from '../../types/market';
import { formatShortDate } from '../../utils/formatting';

interface RSIChartProps {
  data: TechnicalIndicators[];
}

export function RSIChart({ data }: RSIChartProps) {
  const chartData = data.filter((d) => d.rsi !== null).map((d) => ({ date: d.date, rsi: d.rsi }));
  if (chartData.length === 0) return null;

  return (
    <div>
      <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">RSI (14)</div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} ticks={[30, 50, 70]} tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} itemStyle={{ color: '#F9FAFB', fontSize: 11 }} labelStyle={{ color: '#9CA3AF', fontSize: 10 }} formatter={(v: number) => [v.toFixed(1), 'RSI']} labelFormatter={formatShortDate} />
          <ReferenceLine y={70} stroke="#F43F5E" strokeDasharray="3 3" strokeWidth={1} />
          <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" strokeWidth={1} />
          <ReferenceLine y={50} stroke="#6B7280" strokeDasharray="2 2" strokeWidth={0.5} />
          <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
