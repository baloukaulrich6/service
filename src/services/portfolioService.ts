import type { Position, Transaction, PortfolioMetrics } from '../types/portfolio';
import type { StockQuote } from '../types/market';
import { STOCKS_BY_ID } from '../data/stocksMetadata';

export function computeMetrics(
  positions: Position[],
  quotes: Record<string, StockQuote>
): PortfolioMetrics {
  let totalValue = 0;
  let totalCost = 0;
  let dailyPnL = 0;

  for (const pos of positions) {
    const quote = quotes[pos.symbol];
    if (!quote) continue;
    const currentValue = pos.shares * quote.price;
    const costBasis = pos.shares * pos.avgCostBasis;
    totalValue += currentValue;
    totalCost += costBasis;
    dailyPnL += pos.shares * quote.change;
  }

  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const dailyPnLPercent = totalValue > 0 ? (dailyPnL / (totalValue - dailyPnL)) * 100 : 0;
  const diversificationScore = computeDiversification(positions);

  return {
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercent,
    dailyPnL,
    dailyPnLPercent,
    diversificationScore,
  };
}

function computeDiversification(positions: Position[]): number {
  if (positions.length === 0) return 0;
  if (positions.length === 1) return 2;

  const exchanges = new Set(positions.map((p) => p.exchange));
  const sectors = new Set(positions.map((p) => STOCKS_BY_ID[p.symbol]?.sector ?? 'Unknown'));
  const countries = new Set(positions.map((p) => STOCKS_BY_ID[p.symbol]?.country ?? 'Unknown'));

  let score = 0;
  // Number of positions (max 3 points)
  score += Math.min(3, positions.length);
  // Market diversity (max 2 points)
  score += exchanges.size >= 2 ? 2 : 0;
  // Sector diversity (max 3 points)
  score += Math.min(3, sectors.size);
  // Country diversity (max 2 points)
  score += Math.min(2, countries.size);

  return Math.min(10, score);
}

export function getAllocations(positions: Position[], quotes: Record<string, StockQuote>) {
  const totalValue = positions.reduce((sum, pos) => {
    const q = quotes[pos.symbol];
    return sum + (q ? pos.shares * q.price : 0);
  }, 0);

  if (totalValue === 0) return { byStock: [], byMarket: [], bySector: [], byCurrency: [] };

  const byStockMap: Record<string, number> = {};
  const byMarketMap: Record<string, number> = {};
  const bySectorMap: Record<string, number> = {};
  const byCurrencyMap: Record<string, number> = {};

  for (const pos of positions) {
    const q = quotes[pos.symbol];
    if (!q) continue;
    const value = pos.shares * q.price;
    const meta = STOCKS_BY_ID[pos.symbol];

    byStockMap[pos.symbol] = (byStockMap[pos.symbol] ?? 0) + value;
    byMarketMap[pos.exchange] = (byMarketMap[pos.exchange] ?? 0) + value;
    if (meta) {
      bySectorMap[meta.sector] = (bySectorMap[meta.sector] ?? 0) + value;
      byCurrencyMap[pos.currency] = (byCurrencyMap[pos.currency] ?? 0) + value;
    }
  }

  const toSlices = (map: Record<string, number>) =>
    Object.entries(map)
      .map(([name, value]) => ({ name, value, percent: (value / totalValue) * 100 }))
      .sort((a, b) => b.value - a.value);

  return {
    byStock: toSlices(byStockMap),
    byMarket: toSlices(byMarketMap),
    bySector: toSlices(bySectorMap),
    byCurrency: toSlices(byCurrencyMap),
  };
}

export function applyBuy(positions: Position[], tx: Transaction): Position[] {
  const existing = positions.find((p) => p.symbol === tx.symbol);
  if (existing) {
    const totalShares = existing.shares + tx.shares;
    const totalCost = existing.shares * existing.avgCostBasis + tx.shares * tx.price;
    return positions.map((p) =>
      p.symbol === tx.symbol
        ? { ...p, shares: totalShares, avgCostBasis: totalCost / totalShares }
        : p
    );
  }
  const meta = STOCKS_BY_ID[tx.symbol];
  const newPos: Position = {
    symbol: tx.symbol,
    exchange: meta?.exchange ?? 'BVMAC',
    shares: tx.shares,
    avgCostBasis: tx.price,
    currency: meta?.currency ?? 'XAF',
    openedAt: tx.date,
  };
  return [...positions, newPos];
}

export function applySell(positions: Position[], tx: Transaction): Position[] {
  return positions
    .map((p) => {
      if (p.symbol !== tx.symbol) return p;
      const remaining = p.shares - tx.shares;
      if (remaining <= 0) return null;
      return { ...p, shares: remaining };
    })
    .filter(Boolean) as Position[];
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Symbole', 'Type', 'Quantité', 'Prix', 'Total', 'Note'];
  const rows = transactions.map((t) => [
    t.date,
    t.symbol,
    t.type,
    t.shares.toString(),
    t.price.toString(),
    t.total.toString(),
    t.note ?? '',
  ]);
  return [headers, ...rows].map((r) => r.join(',')).join('\n');
}
