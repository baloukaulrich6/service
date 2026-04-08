import type { Exchange } from './market';

export interface Position {
  symbol: string;
  exchange: Exchange;
  shares: number;
  avgCostBasis: number;
  currency: 'XAF' | 'XOF';
  openedAt: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  date: string;
  note?: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  diversificationScore: number; // 1-10
}
