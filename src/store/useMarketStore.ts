import { create } from 'zustand';
import type { OHLCV, StockQuote } from '../types/market';
import { STOCKS_METADATA } from '../data/stocksMetadata';
import { getHistory, computeAllQuotes } from '../services/marketDataService';
import { fetchLatestQuotes, fetchOHLCVHistory } from '../services/realDataService';
import { subtractYears } from '../utils/dateUtils';

interface MarketState {
  historicalData: Record<string, OHLCV[]>;
  quotes: Record<string, StockQuote>;
  initialized: boolean;
  dataSource: 'real' | 'simulated' | 'mixed';
  loadStock: (symbol: string) => void;
  initializeAllQuotes: () => void;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const useMarketStore = create<MarketState>((set, get) => ({
  historicalData: {},
  quotes: {},
  initialized: false,
  dataSource: 'simulated',

  loadStock: async (symbol: string) => {
    const { historicalData } = get();
    if (historicalData[symbol]) return;

    const meta = STOCKS_METADATA.find((s) => s.id === symbol);
    if (!meta) return;

    // Try Supabase first
    const from = toDateStr(subtractYears(new Date(), 7));
    const to = toDateStr(new Date());
    const realHistory = await fetchOHLCVHistory(symbol, from, to);

    if (realHistory && realHistory.length > 0) {
      // Supabase has data — use it, prepend GBM simulation for older dates if needed
      const simHistory = getHistory(meta);
      const realFrom = realHistory[0].date;
      const olderSim = simHistory.filter((bar) => bar.date < realFrom);
      const merged = [...olderSim, ...realHistory];
      set((state) => ({
        historicalData: { ...state.historicalData, [symbol]: merged },
        dataSource: state.dataSource === 'simulated' ? 'mixed' : state.dataSource,
      }));
    } else {
      // No Supabase data — use GBM simulation
      const history = getHistory(meta);
      set((state) => ({
        historicalData: { ...state.historicalData, [symbol]: history },
      }));
    }
  },

  initializeAllQuotes: async () => {
    const { initialized } = get();
    if (initialized) return;

    // Always compute simulation as baseline (instant, no network)
    const simQuotes = computeAllQuotes(STOCKS_METADATA);
    set({ quotes: simQuotes, initialized: true, dataSource: 'simulated' });

    // Then try to overlay with real quotes from Supabase
    const symbols = STOCKS_METADATA.map((s) => s.id);
    const realQuotes = await fetchLatestQuotes(symbols);

    if (realQuotes && Object.keys(realQuotes).length > 0) {
      // Merge: real data takes precedence over simulation
      set((state) => ({
        quotes: { ...state.quotes, ...realQuotes },
        dataSource: Object.keys(realQuotes).length === symbols.length ? 'real' : 'mixed',
      }));
    }
  },
}));
