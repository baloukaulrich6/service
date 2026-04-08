import type { StockMeta, OHLCV, StockQuote } from '../types/market';
import { createSeededRng } from '../utils/seededRandom';
import { getTradingDays, subtractYears, getDayOfYear } from '../utils/dateUtils';

const HISTORY_YEARS = 7;

function generateHistory(meta: StockMeta): OHLCV[] {
  const rng = createSeededRng(meta.id + '_history');
  const today = new Date();
  const startDate = subtractYears(today, HISTORY_YEARS);
  const tradingDays = getTradingDays(startDate, today);

  if (tradingDays.length === 0) return [];

  const dt = 1 / 252;
  const { annualDrift, annualVolatility, basePrice } = meta;

  // Regime phases: bull/bear/sideways cycling
  const regimeLength = Math.floor(tradingDays.length / 4);
  const regimes = [
    { driftMult: 1.5, volMult: 0.9 },  // bull
    { driftMult: -0.5, volMult: 1.4 }, // bear
    { driftMult: 1.2, volMult: 0.8 },  // mild bull
    { driftMult: 0.1, volMult: 0.7 },  // sideways
  ];

  const ohlcv: OHLCV[] = [];
  let prevClose = basePrice;

  for (let i = 0; i < tradingDays.length; i++) {
    const dateStr = tradingDays[i];
    const date = new Date(dateStr);
    const dayOfYear = getDayOfYear(date);
    const regimeIdx = Math.min(Math.floor(i / regimeLength), regimes.length - 1);
    const regime = regimes[regimeIdx];

    const effectiveDrift = annualDrift * regime.driftMult;
    const effectiveVol = annualVolatility * regime.volMult;

    // Seasonal adjustment: year-end rally, Q1 correction
    const seasonal = 0.015 * Math.sin((2 * Math.PI * dayOfYear) / 365);

    const Z = rng.randn();
    const logReturn = (effectiveDrift - 0.5 * effectiveVol ** 2) * dt + effectiveVol * Math.sqrt(dt) * Z + seasonal * dt;
    const close = Math.max(prevClose * Math.exp(logReturn), 1);

    // OHLC derivation
    const gapZ = rng.randn() * 0.002;
    const open = Math.max(prevClose * (1 + gapZ), 1);

    const rangeZ = Math.abs(rng.randn()) * 0.008;
    const high = Math.max(open, close) * (1 + rangeZ);
    const low = Math.min(open, close) * (1 - Math.abs(rng.randn()) * 0.006);

    // Volume: log-normal with occasional spikes
    const baseVol = meta.sharesOutstanding * 0.001;
    const volZ = rng.randn();
    let volume = Math.round(baseVol * Math.exp(0.5 * volZ + Math.log(baseVol)));
    if (rng.random() < 0.05) volume *= 2 + rng.random() * 3; // spike

    ohlcv.push({
      date: dateStr,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(Math.min(low, Math.min(open, close))),
      close: Math.round(close),
      volume: Math.round(volume),
    });

    prevClose = close;
  }

  return ohlcv;
}

const cache: Record<string, OHLCV[]> = {};

export function getHistory(meta: StockMeta): OHLCV[] {
  if (!cache[meta.id]) {
    cache[meta.id] = generateHistory(meta);
  }
  return cache[meta.id];
}

export function getQuote(meta: StockMeta, history: OHLCV[]): StockQuote {
  if (history.length < 2) {
    return { symbol: meta.id, price: meta.basePrice, change: 0, changePercent: 0, volume: 0, timestamp: new Date().toISOString() };
  }
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const change = last.close - prev.close;
  const changePercent = (change / prev.close) * 100;
  return {
    symbol: meta.id,
    price: last.close,
    change,
    changePercent,
    volume: last.volume,
    timestamp: new Date().toISOString(),
  };
}

export function getSlice(history: OHLCV[], period: '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX'): OHLCV[] {
  const counts: Record<string, number> = {
    '1W': 5,
    '1M': 21,
    '3M': 63,
    '6M': 126,
    '1Y': 252,
    '3Y': 756,
    MAX: history.length,
  };
  const n = counts[period] ?? history.length;
  return history.slice(-n);
}

export function computeAllQuotes(metas: StockMeta[]): Record<string, StockQuote> {
  const result: Record<string, StockQuote> = {};
  for (const meta of metas) {
    const history = getHistory(meta);
    result[meta.id] = getQuote(meta, history);
  }
  return result;
}
