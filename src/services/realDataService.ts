/**
 * realDataService.ts
 * Fetches market data from the local Express API server (/api/*).
 * In development, Vite proxies /api/* → http://localhost:3001.
 * Falls back gracefully: all functions return null/[] so GBM simulation is used.
 */

import type { OHLCV, StockQuote, Announcement, SGIFund } from '../types/market';

// In production you can override with VITE_API_BASE_URL (e.g. https://api.yourserver.com)
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ─── Market data ─────────────────────────────────────────────────────────────

export async function fetchLatestQuotes(
  symbols: string[],
): Promise<Record<string, StockQuote> | null> {
  if (symbols.length === 0) return null;
  const params = new URLSearchParams({ symbols: symbols.join(',') });
  const data = await apiFetch<Record<string, StockQuote>>(`/api/quotes?${params}`);
  if (!data || Object.keys(data).length === 0) return null;
  return data;
}

export async function fetchOHLCVHistory(
  symbol: string,
  from: string,
  to: string,
): Promise<OHLCV[] | null> {
  const params = new URLSearchParams({ from, to });
  const data = await apiFetch<OHLCV[]>(`/api/history/${encodeURIComponent(symbol)}?${params}`);
  if (!data || data.length === 0) return null;
  return data;
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const data = await apiFetch<Announcement[]>('/api/announcements');
  if (!data || data.length === 0) return [];
  return data;
}

// ─── SGI Funds ────────────────────────────────────────────────────────────────

export async function fetchSGIFunds(): Promise<SGIFund[]> {
  const data = await apiFetch<SGIFund[]>('/api/sgi-funds');
  if (!data || data.length === 0) return [];
  return data;
}

// ─── ML: log recommendation outcome ─────────────────────────────────────────

export async function logRecommendationOutcome(payload: {
  symbol: string;
  signal: 'BUY' | 'HOLD' | 'SELL';
  score: number;
  priceAtRec: number;
  price30d?: number;
}): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-critical – ignore
  }
}
