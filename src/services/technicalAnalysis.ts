import type { OHLCV, TechnicalIndicators } from '../types/market';

function sma(values: number[], period: number, index: number): number | null {
  if (index < period - 1) return null;
  let sum = 0;
  for (let i = index - period + 1; i <= index; i++) sum += values[i];
  return sum / period;
}

function stdDev(values: number[], period: number, index: number, mean: number): number {
  let sum = 0;
  for (let i = index - period + 1; i <= index; i++) {
    sum += (values[i] - mean) ** 2;
  }
  return Math.sqrt(sum / period);
}

export function computeIndicators(ohlcv: OHLCV[]): TechnicalIndicators[] {
  const closes = ohlcv.map((d) => d.close);
  const n = closes.length;

  // EMA state
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);
  const k9 = 2 / (9 + 1);

  let ema12: number | null = null;
  let ema26: number | null = null;
  let macdSignalEma: number | null = null;

  let avgGain = 0;
  let avgLoss = 0;
  let rsiInit = false;

  const results: TechnicalIndicators[] = [];

  for (let i = 0; i < n; i++) {
    const close = closes[i];

    // SMA
    const s20 = sma(closes, 20, i);
    const s50 = sma(closes, 50, i);
    const s200 = sma(closes, 200, i);

    // EMA 12
    if (i === 11) {
      let s = 0;
      for (let j = 0; j <= 11; j++) s += closes[j];
      ema12 = s / 12;
    } else if (i > 11 && ema12 !== null) {
      ema12 = close * k12 + ema12 * (1 - k12);
    }

    // EMA 26
    if (i === 25) {
      let s = 0;
      for (let j = 0; j <= 25; j++) s += closes[j];
      ema26 = s / 26;
    } else if (i > 25 && ema26 !== null) {
      ema26 = close * k26 + ema26 * (1 - k26);
    }

    // MACD
    let macdLine: number | null = null;
    let signalLine: number | null = null;
    let histogram: number | null = null;
    if (ema12 !== null && ema26 !== null) {
      macdLine = ema12 - ema26;
      if (macdSignalEma === null) {
        // Need 9 MACD values to init signal EMA - just use MACD as signal for first value
        macdSignalEma = macdLine;
      } else {
        macdSignalEma = macdLine * k9 + macdSignalEma * (1 - k9);
      }
      signalLine = macdSignalEma;
      histogram = macdLine - signalLine;
    }

    // RSI (Wilder's smoothing)
    let rsi: number | null = null;
    if (i > 0) {
      const diff = close - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      if (!rsiInit && i === 14) {
        let gSum = 0, lSum = 0;
        for (let j = 1; j <= 14; j++) {
          const d = closes[j] - closes[j - 1];
          gSum += d > 0 ? d : 0;
          lSum += d < 0 ? -d : 0;
        }
        avgGain = gSum / 14;
        avgLoss = lSum / 14;
        rsiInit = true;
        const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
        rsi = 100 - 100 / (1 + rs);
      } else if (rsiInit) {
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
        const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
        rsi = 100 - 100 / (1 + rs);
      }
    }

    // Bollinger Bands
    let bbUpper: number | null = null;
    let bbMiddle: number | null = null;
    let bbLower: number | null = null;
    let bbPercentB: number | null = null;
    if (s20 !== null) {
      const sd = stdDev(closes, 20, i, s20);
      bbMiddle = s20;
      bbUpper = s20 + 2 * sd;
      bbLower = s20 - 2 * sd;
      bbPercentB = bbUpper !== bbLower ? (close - bbLower) / (bbUpper - bbLower) : 0.5;
    }

    results.push({
      date: ohlcv[i].date,
      close,
      sma20: s20,
      sma50: s50,
      sma200: s200,
      ema12,
      ema26,
      rsi: rsi !== null ? Math.round(rsi * 100) / 100 : null,
      macd: macdLine !== null ? Math.round(macdLine * 100) / 100 : null,
      macdSignal: signalLine !== null ? Math.round(signalLine * 100) / 100 : null,
      macdHistogram: histogram !== null ? Math.round(histogram * 100) / 100 : null,
      bbUpper: bbUpper !== null ? Math.round(bbUpper) : null,
      bbMiddle: bbMiddle !== null ? Math.round(bbMiddle) : null,
      bbLower: bbLower !== null ? Math.round(bbLower) : null,
      bbPercentB: bbPercentB !== null ? Math.round(bbPercentB * 1000) / 1000 : null,
    });
  }

  return results;
}

export function getLatestIndicators(indicators: TechnicalIndicators[]): TechnicalIndicators | null {
  if (indicators.length === 0) return null;
  return indicators[indicators.length - 1];
}
