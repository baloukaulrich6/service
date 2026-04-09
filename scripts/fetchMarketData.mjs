/**
 * fetchMarketData.mjs
 * Daily market data pipeline: fetches EOD prices from EODHD API and stores in Supabase.
 * Run via: node scripts/fetchMarketData.mjs
 *
 * Required env vars:
 *   SUPABASE_URL          - Supabase project URL
 *   SUPABASE_SERVICE_KEY  - Service role key (bypasses RLS)
 *   EODHD_API_KEY         - EODHD API key (free tier: 20 req/day)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const EODHD_API_KEY = process.env.EODHD_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// BRVM symbols mapped to EODHD exchange code
const BRVM_SYMBOLS = [
  'SONATEL', 'SGBCI', 'ECOBANK', 'TOTALCI', 'NESTLECI', 'SAPH', 'CIE',
  'ONATEL', 'CORIS', 'BOABF', 'SIB', 'NSIA-CI', 'ORAGROUP',
  'SODECI', 'PALMC', 'SUCRIVOIRE', 'SOGB', 'VIVO', 'SETAO', 'SICABLE',
];

// BVMAC symbols — limited public data, these use AFX proxy
const BVMAC_SYMBOLS = ['SNH', 'SEMC', 'SAFACAM', 'SOCAPALM', 'SEBC'];

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

async function fetchEODHD(symbol, exchange, date) {
  if (!EODHD_API_KEY) return null;
  const url = `https://eodhd.com/api/eod/${symbol}.${exchange}?api_token=${EODHD_API_KEY}&from=${date}&to=${date}&fmt=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const row = data[0];
    return {
      symbol,
      exchange: exchange === 'BRVM' ? 'BRVM' : 'BVMAC',
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
    };
  } catch {
    return null;
  }
}

async function upsertRows(rows) {
  if (rows.length === 0) return;
  const { error } = await supabase
    .from('market_data')
    .upsert(rows, { onConflict: 'symbol,date' });
  if (error) console.error('Upsert error:', error.message);
}

async function main() {
  const date = yesterday();
  console.log(`Fetching market data for ${date}…`);

  const rows = [];
  let ok = 0;
  let fail = 0;

  // Fetch BRVM data from EODHD
  for (const symbol of BRVM_SYMBOLS) {
    const row = await fetchEODHD(symbol, 'BRVM', date);
    if (row) { rows.push(row); ok++; }
    else { console.warn(`  No data: ${symbol}.BRVM`); fail++; }
    // Rate limit: max 20 req/day on free tier, add small delay
    await new Promise((r) => setTimeout(r, 200));
  }

  // BVMAC: minimal public data – insert placeholder if not available
  // In production, parse BVMAC BOC PDF or use a licensed data provider
  for (const symbol of BVMAC_SYMBOLS) {
    console.info(`  BVMAC ${symbol}: no automated source, skipping`);
    fail++;
  }

  await upsertRows(rows);
  console.log(`Done. Inserted/updated: ${ok}. Failed: ${fail}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
