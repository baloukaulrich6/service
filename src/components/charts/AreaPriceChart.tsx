import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { OHLCV } from '../../types/market';
import { formatShortDate, formatPrice } from '../../utils/formatting';

interface AreaPriceChartProps {
  data: OHLCV[];
  currency: 'XAF' | 'XOF';
}

export function AreaPriceChart({ data, currency }: AreaPriceChartProps) {
  if (data.length === 0) return null;

  const firstClose = data[0].close;
  const lastClose = data[data.length - 1].close;
  const isPositive = lastClose >= firstClose;
  const color = isPositive ? '#10B981' : '#F43F5E';

  const chartData = data.map((d) => ({ date: d.date, close: d.close, volume: d.volume }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v: number) => (v / 1000).toFixed(0) + 'K'}
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#9CA3AF', fontSize: 11 }}
          itemStyle={{ color: '#F9FAFB', fontSize: 12 }}
          formatter={(value: number) => [formatPrice(value, currency), 'Cours']}
          labelFormatter={formatShortDate}
        />
        <ReferenceLine y={firstClose} stroke="#6B7280" strokeDasharray="3 3" strokeWidth={1} />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill="url(#priceGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
