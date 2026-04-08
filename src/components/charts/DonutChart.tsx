import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#F43F5E', '#06B6D4', '#84CC16', '#EC4899'];

interface DonutChartProps {
  data: { name: string; value: number; percent: number }[];
  height?: number;
}

export function DonutChart({ data, height = 220 }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height }}>
        Aucune position
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
          itemStyle={{ color: '#F9FAFB', fontSize: 12 }}
          formatter={(_value: number, _: string, entry: { payload?: { percent: number } }) => [
            `${entry.payload?.percent?.toFixed(1)}%`,
            '',
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#9CA3AF', fontSize: 11 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
