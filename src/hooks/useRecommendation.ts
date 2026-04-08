import { useMemo } from 'react';
import type { StockMeta, TechnicalIndicators } from '../types/market';
import { computeRecommendation } from '../services/recommendationEngine';

export function useRecommendation(meta: StockMeta | undefined, latest: TechnicalIndicators | null) {
  return useMemo(() => {
    if (!meta) return null;
    return computeRecommendation(meta, latest);
  }, [meta, latest]);
}
