import type { StockMeta, TechnicalIndicators, Recommendation, SignalBreakdown } from '../types/market';

interface SectorMedians {
  dividendYield: number;
  peRatio: number;
}

const SECTOR_MEDIANS: Record<string, SectorMedians> = {
  'Telecommunications': { dividendYield: 6.0, peRatio: 15.0 },
  'Banking & Finance': { dividendYield: 5.0, peRatio: 11.0 },
  'Oil & Gas': { dividendYield: 6.5, peRatio: 13.0 },
  'Agriculture & Food': { dividendYield: 6.8, peRatio: 10.0 },
  'Industry': { dividendYield: 4.0, peRatio: 9.0 },
  'Water & Energy': { dividendYield: 7.5, peRatio: 12.0 },
  'Distribution': { dividendYield: 4.5, peRatio: 13.0 },
  'Transport': { dividendYield: 3.5, peRatio: 11.0 },
};

function getRiskLabel(score: number): 'Low' | 'Moderate' | 'High' | 'Very High' {
  if (score <= 3) return 'Low';
  if (score <= 5) return 'Moderate';
  if (score <= 7) return 'High';
  return 'Very High';
}

export function computeRecommendation(meta: StockMeta, indicators: TechnicalIndicators | null): Recommendation {
  const signals: SignalBreakdown[] = [];
  let weightedScore = 0;
  let totalWeight = 0;
  let agreedSignals = 0;

  // --- RSI momentum (weight 20%) ---
  const rsiWeight = 20;
  let rsiSignal: SignalBreakdown['signal'] = 'neutral';
  let rsiDesc = 'RSI en zone neutre.';
  if (indicators?.rsi !== null && indicators?.rsi !== undefined) {
    const rsi = indicators.rsi;
    if (rsi < 30) {
      rsiSignal = 'bullish';
      rsiDesc = `RSI à ${rsi.toFixed(0)} – zone de survente, rebond possible.`;
      weightedScore += rsiWeight;
      agreedSignals++;
    } else if (rsi > 70) {
      rsiSignal = 'bearish';
      rsiDesc = `RSI à ${rsi.toFixed(0)} – zone de surachat, risque de correction.`;
      weightedScore -= rsiWeight;
      agreedSignals++;
    }
  }
  signals.push({ name: 'Momentum RSI', signal: rsiSignal, weight: rsiWeight, description: rsiDesc });
  totalWeight += rsiWeight;

  // --- MACD crossover (weight 20%) ---
  const macdWeight = 20;
  let macdSignal: SignalBreakdown['signal'] = 'neutral';
  let macdDesc = 'MACD sans signal de croisement clair.';
  if (indicators?.macd !== null && indicators?.macd !== undefined && indicators?.macdSignal !== null && indicators?.macdSignal !== undefined) {
    if (indicators.macd > indicators.macdSignal && indicators.macdHistogram !== null && indicators.macdHistogram > 0) {
      macdSignal = 'bullish';
      macdDesc = 'MACD au-dessus de sa ligne de signal – momentum haussier.';
      weightedScore += macdWeight;
      agreedSignals++;
    } else if (indicators.macd < indicators.macdSignal) {
      macdSignal = 'bearish';
      macdDesc = 'MACD sous sa ligne de signal – momentum baissier.';
      weightedScore -= macdWeight;
      agreedSignals++;
    }
  }
  signals.push({ name: 'Croisement MACD', signal: macdSignal, weight: macdWeight, description: macdDesc });
  totalWeight += macdWeight;

  // --- Bollinger Bands %B (weight 15%) ---
  const bbWeight = 15;
  let bbSignal: SignalBreakdown['signal'] = 'neutral';
  let bbDesc = 'Prix dans les bandes de Bollinger.';
  if (indicators?.bbPercentB !== null && indicators?.bbPercentB !== undefined) {
    const pctB = indicators.bbPercentB;
    if (pctB < 0.2) {
      bbSignal = 'bullish';
      bbDesc = `%B à ${(pctB * 100).toFixed(0)}% – prix proche de la bande inférieure, achat potentiel.`;
      weightedScore += bbWeight;
      agreedSignals++;
    } else if (pctB > 0.8) {
      bbSignal = 'bearish';
      bbDesc = `%B à ${(pctB * 100).toFixed(0)}% – prix proche de la bande supérieure, prudence.`;
      weightedScore -= bbWeight;
      agreedSignals++;
    }
  }
  signals.push({ name: 'Bandes de Bollinger', signal: bbSignal, weight: bbWeight, description: bbDesc });
  totalWeight += bbWeight;

  // --- Price vs SMA200 (weight 15%) ---
  const trendWeight = 15;
  let trendSignal: SignalBreakdown['signal'] = 'neutral';
  let trendDesc = 'Prix proche de la MM200.';
  if (indicators?.sma200 !== null && indicators?.sma200 !== undefined) {
    const pctAbove = (indicators.close - indicators.sma200) / indicators.sma200;
    if (pctAbove > 0.03) {
      trendSignal = 'bullish';
      trendDesc = `Prix ${(pctAbove * 100).toFixed(1)}% au-dessus de la MM200 – tendance haussière de fond.`;
      weightedScore += trendWeight;
      agreedSignals++;
    } else if (pctAbove < -0.03) {
      trendSignal = 'bearish';
      trendDesc = `Prix ${Math.abs(pctAbove * 100).toFixed(1)}% sous la MM200 – tendance baissière de fond.`;
      weightedScore -= trendWeight;
      agreedSignals++;
    }
  }
  signals.push({ name: 'Tendance MM200', signal: trendSignal, weight: trendWeight, description: trendDesc });
  totalWeight += trendWeight;

  // --- SMA 20/50 Golden/Death Cross (weight 10%) ---
  const crossWeight = 10;
  let crossSignal: SignalBreakdown['signal'] = 'neutral';
  let crossDesc = 'Pas de croisement doré/fatal récent.';
  if (indicators?.sma20 !== null && indicators?.sma50 !== null && indicators?.sma20 !== undefined && indicators?.sma50 !== undefined) {
    if (indicators.sma20 > indicators.sma50) {
      crossSignal = 'bullish';
      crossDesc = 'Croix dorée (MM20 > MM50) – signal haussier de moyen terme.';
      weightedScore += crossWeight;
      agreedSignals++;
    } else {
      crossSignal = 'bearish';
      crossDesc = 'Croix de la mort (MM20 < MM50) – signal baissier de moyen terme.';
      weightedScore -= crossWeight;
      agreedSignals++;
    }
  }
  signals.push({ name: 'Croisement MM20/MM50', signal: crossSignal, weight: crossWeight, description: crossDesc });
  totalWeight += crossWeight;

  // --- Dividend Yield (weight 10%) ---
  const divWeight = 10;
  const sectorMedian = SECTOR_MEDIANS[meta.sector] ?? { dividendYield: 5.0, peRatio: 12.0 };
  let divSignal: SignalBreakdown['signal'] = 'neutral';
  let divDesc = `Rendement dividende à ${meta.dividendYield.toFixed(1)}%.`;
  if (meta.dividendYield > sectorMedian.dividendYield * 1.1) {
    divSignal = 'bullish';
    divDesc = `Rendement de ${meta.dividendYield.toFixed(1)}% supérieur à la médiane du secteur (${sectorMedian.dividendYield.toFixed(1)}%) – attractif.`;
    weightedScore += divWeight;
  } else if (meta.dividendYield < sectorMedian.dividendYield * 0.7) {
    divSignal = 'bearish';
    divDesc = `Rendement de ${meta.dividendYield.toFixed(1)}% inférieur à la médiane du secteur – moins attractif.`;
    weightedScore -= divWeight;
  }
  signals.push({ name: 'Rendement Dividende', signal: divSignal, weight: divWeight, description: divDesc });
  totalWeight += divWeight;

  // --- P/E Ratio (weight 10%) ---
  const peWeight = 10;
  let peSignal: SignalBreakdown['signal'] = 'neutral';
  let peDesc = `P/E à ${meta.peRatio.toFixed(1)}x.`;
  if (meta.peRatio < sectorMedian.peRatio * 0.85) {
    peSignal = 'bullish';
    peDesc = `P/E de ${meta.peRatio.toFixed(1)}x inférieur à la médiane (${sectorMedian.peRatio.toFixed(1)}x) – sous-évalué.`;
    weightedScore += peWeight;
  } else if (meta.peRatio > sectorMedian.peRatio * 1.2) {
    peSignal = 'bearish';
    peDesc = `P/E de ${meta.peRatio.toFixed(1)}x supérieur à la médiane – potentiellement surévalué.`;
    weightedScore -= peWeight;
  }
  signals.push({ name: 'P/E Ratio', signal: peSignal, weight: peWeight, description: peDesc });
  totalWeight += peWeight;

  // Final score: normalise to -100..+100
  const maxScore = totalWeight;
  const score = Math.round((weightedScore / maxScore) * 100);

  let signal: 'BUY' | 'HOLD' | 'SELL';
  if (score > 25) signal = 'BUY';
  else if (score < -25) signal = 'SELL';
  else signal = 'HOLD';

  const confidence = Math.round(Math.min(100, (Math.abs(score) / 100) * 100 + 30));

  // Risk score
  let riskScore = Math.round(meta.annualVolatility * 30);
  if (indicators?.rsi !== null && indicators?.rsi !== undefined) {
    if (indicators.rsi > 70) riskScore += 1;
    if (indicators.rsi < 30) riskScore -= 1;
  }
  if (indicators?.bbPercentB !== null && indicators?.bbPercentB !== undefined) {
    if (indicators.bbPercentB > 0.9) riskScore += 1;
  }
  riskScore = Math.max(1, Math.min(10, riskScore));

  // Human-readable summary
  const bullishSignals = signals.filter((s) => s.signal === 'bullish').map((s) => s.name);
  const bearishSignals = signals.filter((s) => s.signal === 'bearish').map((s) => s.name);

  let summary = '';
  if (signal === 'BUY') {
    summary = `${meta.name} présente ${bullishSignals.length} signaux haussiers (${bullishSignals.slice(0, 2).join(', ')}). `;
    summary += `Rendement dividende de ${meta.dividendYield.toFixed(1)}% et P/E de ${meta.peRatio.toFixed(1)}x. `;
    summary += `Score de risque : ${riskScore}/10.`;
  } else if (signal === 'SELL') {
    summary = `${meta.name} montre ${bearishSignals.length} signaux baissiers (${bearishSignals.slice(0, 2).join(', ')}). `;
    summary += `Vigilance recommandée. Score de risque : ${riskScore}/10.`;
  } else {
    summary = `${meta.name} est en zone neutre avec des signaux mixtes. `;
    summary += `Attendre une confirmation de tendance avant d'agir. Score de risque : ${riskScore}/10.`;
  }

  return {
    signal,
    score,
    confidence,
    riskScore,
    riskLabel: getRiskLabel(riskScore),
    signals,
    summary,
    updatedAt: new Date().toISOString(),
  };
}
