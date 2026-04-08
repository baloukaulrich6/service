import { getRiskColor } from '../../utils/colorScale';

interface RiskScoreMeterProps {
  score: number; // 1-10
  label: string;
  showBar?: boolean;
}

export function RiskScoreMeter({ score, label, showBar = true }: RiskScoreMeterProps) {
  const color = getRiskColor(score);
  const barColors = ['bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-yellow-500', 'bg-orange-500', 'bg-orange-500', 'bg-rose-500', 'bg-rose-500', 'bg-rose-600'];

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-gray-400 text-sm">/ 10 – {label}</span>
      </div>
      {showBar && (
        <div className="flex gap-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm transition-all ${i < score ? barColors[Math.min(score - 1, 9)] : 'bg-gray-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
