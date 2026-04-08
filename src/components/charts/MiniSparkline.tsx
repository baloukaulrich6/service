import { ResponsiveContainer, LineChart, Line } from 'recharts';
import type { OHLCV } from '../../types/market';

interface MiniSparklineProps {
  data: OHLCV[];
  positive?: boolean;
  height?: number;
}

export function MiniSparkline({ data, positive, height = 40 }: MiniSparklineProps) {
  if (data.length < 2) return <div style={{ height }} />;

  const firstClose = data[0].close;
  const lastClose = data[data.length - 1].close;
  const isPositive = positive !== undefined ? positive : lastClose >= firstClose;
  const color = isPositive ? '#10B981' : '#F43F5E';

  const chartData = data.map((d) => ({ v: d.close }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          dot={false}
          strokeWidth={1.5}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
