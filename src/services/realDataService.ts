// Real data service – fetches from Supabase when configured.
// Returns null when Supabase is not available; callers fall back to simulation.

import { isSupabaseEnabled, supabase } from './supabaseClient';
import type { OHLCV, StockQuote, Announcement, SGIFund } from '../types/market';

// ─── Market data ─────────────────────────────────────────────────────────────

export async function fetchLatestQuotes(symbols: string[]): Promise<Record<string, StockQuote> | null> {
  if (!isSupabaseEnabled) return null;
  const sb = supabase;
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('market_data')
      .select('symbol, date, open, high, low, close, volume')
      .in('symbol', symbols)
      .order('date', { ascending: false });

    if (error || !data) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = data as any[];
    // Pick the latest row per symbol
    const latestBySymbol: Record<string, StockQuote> = {};
    const seen = new Set<string>();
    for (const row of rows) {
      if (seen.has(row.symbol)) continue;
      seen.add(row.symbol);
      // Find previous day for change calculation
      const prev = rows.find((r) => r.symbol === row.symbol && r.date < row.date);
      const prevClose = prev?.close ?? row.open ?? row.close;
      const change = row.close - prevClose;
      latestBySymbol[row.symbol] = {
        symbol: row.symbol,
        price: row.close,
        change,
        changePercent: prevClose ? (change / prevClose) * 100 : 0,
        volume: row.volume ?? 0,
        timestamp: row.date,
      };
    }
    return Object.keys(latestBySymbol).length > 0 ? latestBySymbol : null;
  } catch {
    return null;
  }
}

export async function fetchOHLCVHistory(
  symbol: string,
  from: string,
  to: string,
): Promise<OHLCV[] | null> {
  if (!isSupabaseEnabled) return null;
  const sb = supabase;
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('market_data')
      .select('date, open, high, low, close, volume')
      .eq('symbol', symbol)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) return null;
    return data as OHLCV[];
  } catch {
    return null;
  }
}

// ─── Announcements ────────────────────────────────────────────────────────────

const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    type: 'ipo',
    title: 'Orange Côte d\'Ivoire – Introduction en bourse prévue (BRVM)',
    body: 'Orange CI, filiale du groupe Orange en Côte d\'Ivoire, envisage une introduction sur la BRVM pour renforcer ses fonds propres et financer son expansion 5G. La fourchette indicative sera communiquée lors du Bulletin d\'Offre.',
    exchange: 'BRVM',
    symbol: null,
    expectedDate: '2025-09-30',
    publishedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: '2',
    type: 'ipo',
    title: 'CimBénin – Projet d\'introduction sur la BRVM',
    body: 'Cimenterie du Bénin (CimBénin) a mandaté CGF Bourse pour accompagner son introduction. L\'opération vise à lever 30 milliards FCFA pour financer une nouvelle ligne de production.',
    exchange: 'BRVM',
    symbol: null,
    expectedDate: '2025-12-15',
    publishedAt: '2025-03-20T09:00:00Z',
  },
  {
    id: '3',
    type: 'news',
    title: 'BRVM : Nouvelle plateforme de trading électronique T+3 opérationnelle',
    body: 'La BRVM annonce le déploiement complet de sa plateforme de règlement-livraison en T+3, améliorant la liquidité et alignant l\'infrastructure sur les standards internationaux.',
    exchange: 'BRVM',
    symbol: null,
    expectedDate: null,
    publishedAt: '2025-04-05T08:30:00Z',
  },
  {
    id: '4',
    type: 'dividend',
    title: 'SONATEL – Dividende de 1 500 FCFA par action',
    body: 'L\'Assemblée Générale de Sonatel a approuvé la distribution d\'un dividende de 1 500 FCFA par action, pour un rendement de 9,6% au cours actuel.',
    exchange: 'BRVM',
    symbol: 'SONATEL',
    expectedDate: '2025-05-15',
    publishedAt: '2025-03-28T14:00:00Z',
  },
  {
    id: '5',
    type: 'ipo',
    title: 'BVMAC : Emission obligataire de l\'État du Gabon',
    body: 'La République Gabonaise prévoit une émission obligataire de 150 milliards FCFA sur la BVMAC pour financer des projets d\'infrastructure. Taux coupon indicatif : 7,5% sur 7 ans.',
    exchange: 'BVMAC',
    symbol: null,
    expectedDate: '2025-06-30',
    publishedAt: '2025-04-02T11:00:00Z',
  },
];

export async function fetchAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseEnabled) return FALLBACK_ANNOUNCEMENTS;
  const sb = supabase;
  if (!sb) return FALLBACK_ANNOUNCEMENTS;

  try {
    const { data, error } = await sb
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) return FALLBACK_ANNOUNCEMENTS;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body ?? '',
      exchange: row.exchange ?? null,
      symbol: row.symbol ?? null,
      expectedDate: row.expected_date ?? null,
      publishedAt: row.published_at,
    }));
  } catch {
    return FALLBACK_ANNOUNCEMENTS;
  }
}

// ─── SGI Funds ────────────────────────────────────────────────────────────────

const FALLBACK_SGI_FUNDS: SGIFund[] = [
  { id: '1', sgiName: 'Hudson & Co', fundName: 'Fonds Hudson Actions BRVM', fundType: 'FCP', exchange: 'BRVM', nav: 12450, navDate: '2025-04-04', ytdReturn: 8.2, oneYearReturn: 14.5, managementFee: 1.5, minInvestment: 100000, currency: 'XOF' },
  { id: '2', sgiName: 'BICI Bourse', fundName: 'BICI Prévoyance', fundType: 'FCP', exchange: 'BRVM', nav: 8900, navDate: '2025-04-04', ytdReturn: 5.1, oneYearReturn: 9.8, managementFee: 1.2, minInvestment: 50000, currency: 'XOF' },
  { id: '3', sgiName: 'Atlantique Asset Management', fundName: 'Atlantique Croissance', fundType: 'SICAV', exchange: 'BRVM', nav: 15200, navDate: '2025-04-04', ytdReturn: 9.4, oneYearReturn: 17.2, managementFee: 1.8, minInvestment: 250000, currency: 'XOF' },
  { id: '4', sgiName: 'NSIA Finance', fundName: 'NSIA Dynamique', fundType: 'FCP', exchange: 'BRVM', nav: 11000, navDate: '2025-04-04', ytdReturn: 6.7, oneYearReturn: 12.3, managementFee: 1.4, minInvestment: 100000, currency: 'XOF' },
  { id: '5', sgiName: 'Coris Bourse', fundName: 'Coris Croissance Afrique', fundType: 'FCP', exchange: 'BRVM', nav: 9600, navDate: '2025-04-04', ytdReturn: 7.3, oneYearReturn: 13.1, managementFee: 1.6, minInvestment: 75000, currency: 'XOF' },
  { id: '6', sgiName: 'EDC Asset Management', fundName: 'EDC Actions West Africa', fundType: 'SICAV', exchange: 'BRVM', nav: 18500, navDate: '2025-04-04', ytdReturn: 11.2, oneYearReturn: 19.8, managementFee: 2.0, minInvestment: 500000, currency: 'XOF' },
  { id: '7', sgiName: 'CGF Bourse', fundName: 'CGF Premium', fundType: 'FCP', exchange: 'BRVM', nav: 7800, navDate: '2025-04-04', ytdReturn: 4.8, oneYearReturn: 8.5, managementFee: 1.1, minInvestment: 50000, currency: 'XOF' },
  { id: '8', sgiName: 'SIB Bourse', fundName: 'SIB Rendement Mixte', fundType: 'FCP', exchange: 'BRVM', nav: 10200, navDate: '2025-04-04', ytdReturn: 5.9, oneYearReturn: 10.4, managementFee: 1.3, minInvestment: 100000, currency: 'XOF' },
  { id: '9', sgiName: 'Datta Finances', fundName: 'Datta Horizon', fundType: 'FCP', exchange: 'BRVM', nav: 6500, navDate: '2025-04-04', ytdReturn: 3.4, oneYearReturn: 7.1, managementFee: 1.0, minInvestment: 25000, currency: 'XOF' },
  { id: '10', sgiName: 'Hudson & Co', fundName: 'Hudson Obligations CEMAC', fundType: 'FCP', exchange: 'BVMAC', nav: 55000, navDate: '2025-04-04', ytdReturn: 4.2, oneYearReturn: 6.8, managementFee: 1.2, minInvestment: 500000, currency: 'XAF' },
];

export async function fetchSGIFunds(): Promise<SGIFund[]> {
  if (!isSupabaseEnabled) return FALLBACK_SGI_FUNDS;
  const sb = supabase;
  if (!sb) return FALLBACK_SGI_FUNDS;

  try {
    const { data, error } = await sb
      .from('sgi_funds')
      .select('*')
      .order('ytd_return', { ascending: false });

    if (error || !data || data.length === 0) return FALLBACK_SGI_FUNDS;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row) => ({
      id: row.id,
      sgiName: row.sgi_name,
      fundName: row.fund_name,
      fundType: row.fund_type,
      exchange: row.exchange,
      nav: row.nav,
      navDate: row.nav_date,
      ytdReturn: row.ytd_return,
      oneYearReturn: row.one_year_return,
      managementFee: row.management_fee,
      minInvestment: row.min_investment,
      currency: row.currency,
    }));
  } catch {
    return FALLBACK_SGI_FUNDS;
  }
}
