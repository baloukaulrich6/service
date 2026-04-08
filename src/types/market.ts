export type Exchange = 'BVMAC' | 'BRVM';
export type AssetType = 'stock' | 'bond' | 'index';
export type Sector =
  | 'Telecommunications'
  | 'Banking & Finance'
  | 'Oil & Gas'
  | 'Agriculture & Food'
  | 'Industry'
  | 'Distribution'
  | 'Transport'
  | 'Water & Energy';

export interface StockMeta {
  id: string;
  name: string;
  exchange: Exchange;
  sector: Sector;
  assetType: AssetType;
  currency: 'XAF' | 'XOF';
  basePrice: number;
  marketCap: number; // millions CFA
  sharesOutstanding: number;
  dividendYield: number; // annual %
  peRatio: number;
  country: string;
  description: string;
  annualDrift: number; // e.g. 0.08
  annualVolatility: number; // e.g. 0.22
}

export interface OHLCV {
  date: string; // ISO "2024-01-15"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface TechnicalIndicators {
  date: string;
  close: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  bbUpper: number | null;
  bbMiddle: number | null;
  bbLower: number | null;
  bbPercentB: number | null;
}

export interface SignalBreakdown {
  name: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  description: string;
}

export interface Recommendation {
  signal: 'BUY' | 'HOLD' | 'SELL';
  score: number; // -100 to +100
  confidence: number; // 0-100
  riskScore: number; // 1-10
  riskLabel: 'Low' | 'Moderate' | 'High' | 'Very High';
  signals: SignalBreakdown[];
  summary: string;
  updatedAt: string;
}
