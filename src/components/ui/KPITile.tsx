import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPITileProps {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function KPITile({ label, value, delta, deltaLabel, icon, className = '' }: KPITileProps) {
  const isPositive = delta !== undefined && delta >= 0;
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="text-xl font-bold text-white truncate">{value}</div>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{deltaLabel ?? (isPositive ? `+${delta.toFixed(2)}%` : `${delta.toFixed(2)}%`)}</span>
        </div>
      )}
    </div>
  );
}
