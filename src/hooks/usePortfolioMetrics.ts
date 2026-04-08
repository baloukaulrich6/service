import { useMemo } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useMarketStore } from '../store/useMarketStore';
import { computeMetrics, getAllocations } from '../services/portfolioService';

export function usePortfolioMetrics() {
  const { positions, transactions } = usePortfolioStore();
  const { quotes } = useMarketStore();

  const metrics = useMemo(() => computeMetrics(positions, quotes), [positions, quotes]);
  const allocations = useMemo(() => getAllocations(positions, quotes), [positions, quotes]);

  return { positions, transactions, metrics, allocations };
}
