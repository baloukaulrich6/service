import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPercent } from '../../utils/formatting';

interface PriceChangeProps {
  change: number;
  changePercent: number;
  showIcon?: boolean;
  currency?: string;
}

export function PriceChange({ change, changePercent, showIcon = true, currency }: PriceChangeProps) {
  const isPositive = changePercent >= 0;
  const color = isPositive ? 'text-emerald-500' : 'text-rose-500';

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${color}`}>
      {showIcon && (isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
      {currency && <span>{isPositive ? '+' : ''}{change.toLocaleString('fr-FR')} {currency}</span>}
      <span className="text-xs opacity-80">({formatPercent(changePercent)})</span>
    </span>
  );
}
