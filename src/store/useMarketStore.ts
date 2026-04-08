import { create } from 'zustand';
import type { OHLCV, StockQuote } from '../types/market';
import { STOCKS_METADATA } from '../data/stocksMetadata';
import { getHistory, computeAllQuotes } from '../services/marketDataService';

interface MarketState {
  historicalData: Record<string, OHLCV[]>;
  quotes: Record<string, StockQuote>;
  initialized: boolean;
  loadStock: (symbol: string) => void;
  initializeAllQuotes: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  historicalData: {},
  quotes: {},
  initialized: false,

  loadStock: (symbol: string) => {
    const { historicalData } = get();
    if (historicalData[symbol]) return;
    const meta = STOCKS_METADATA.find((s) => s.id === symbol);
    if (!meta) return;
    const history = getHistory(meta);
    set((state) => ({
      historicalData: { ...state.historicalData, [symbol]: history },
    }));
  },

  initializeAllQuotes: () => {
    const { initialized } = get();
    if (initialized) return;
    const quotes = computeAllQuotes(STOCKS_METADATA);
    set({ quotes, initialized: true });
  },
}));
