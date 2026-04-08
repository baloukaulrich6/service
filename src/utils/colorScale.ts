export function getChangeColor(value: number): string {
  if (value > 0) return 'text-emerald-500';
  if (value < 0) return 'text-rose-500';
  return 'text-gray-400';
}

export function getChangeBg(value: number): string {
  if (value > 0) return 'bg-emerald-500/10 text-emerald-500';
  if (value < 0) return 'bg-rose-500/10 text-rose-500';
  return 'bg-gray-500/10 text-gray-400';
}

export function getRiskColor(score: number): string {
  if (score <= 3) return 'text-emerald-500';
  if (score <= 5) return 'text-yellow-500';
  if (score <= 7) return 'text-orange-500';
  return 'text-rose-500';
}

export function getSignalColor(signal: 'BUY' | 'HOLD' | 'SELL'): string {
  if (signal === 'BUY') return 'text-emerald-500';
  if (signal === 'SELL') return 'text-rose-500';
  return 'text-yellow-500';
}

export function getSignalBg(signal: 'BUY' | 'HOLD' | 'SELL'): string {
  if (signal === 'BUY') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (signal === 'SELL') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
}

export function getExchangeColor(exchange: 'BVMAC' | 'BRVM'): string {
  return exchange === 'BVMAC' ? 'text-blue-500' : 'text-amber-500';
}

export function getExchangeBg(exchange: 'BVMAC' | 'BRVM'): string {
  return exchange === 'BVMAC'
    ? 'bg-blue-500/10 text-blue-500'
    : 'bg-amber-500/10 text-amber-500';
}

export function correlationToColor(value: number): string {
  // -1 = blue, 0 = white, +1 = red
  if (value > 0.7) return 'bg-rose-600';
  if (value > 0.4) return 'bg-rose-400';
  if (value > 0.1) return 'bg-rose-200';
  if (value > -0.1) return 'bg-gray-100 dark:bg-gray-700';
  if (value > -0.4) return 'bg-blue-200';
  if (value > -0.7) return 'bg-blue-400';
  return 'bg-blue-600';
}
