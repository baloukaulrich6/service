import { useMemo } from 'react';
import type { OHLCV } from '../types/market';
import { computeIndicators, getLatestIndicators } from '../services/technicalAnalysis';

export function useTechnicalIndicators(history: OHLCV[]) {
  const indicators = useMemo(() => {
    if (history.length < 26) return [];
    return computeIndicators(history);
  }, [history]);

  const latest = useMemo(() => getLatestIndicators(indicators), [indicators]);

  return { indicators, latest };
}
