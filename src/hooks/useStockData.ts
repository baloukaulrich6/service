import { useEffect } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { STOCKS_BY_ID } from '../data/stocksMetadata';
import { getSlice } from '../services/marketDataService';
import type { OHLCV } from '../types/market';

export function useStockData(symbol: string, period: '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX' = 'MAX') {
  const { historicalData, loadStock } = useMarketStore();

  useEffect(() => {
    loadStock(symbol);
  }, [symbol, loadStock]);

  const meta = STOCKS_BY_ID[symbol];
  const fullHistory: OHLCV[] = historicalData[symbol] ?? [];
  const slicedHistory = getSlice(fullHistory, period);

  return { meta, history: slicedHistory, fullHistory, loading: fullHistory.length === 0 };
}
