/**
 * fetchRealData.mjs
 * Fetches real end-of-day market data for BRVM stocks and stores in PostgreSQL.
 *
 * Data source: EODHD Historical Data API (https://eodhd.com)
 *   - Free tier: 20 API calls/day
 *   - BRVM exchange code: BRVM  (e.g. SONATEL.BRVM)
 *
 * Usage:
 *   node scripts/fetchRealData.mjs                      # yesterday only
 *   node scripts/fetchRealData.mjs --from 2024-01-01   # backfill from date
 *   node scripts/fetchRealData.mjs --symbol SONATEL     # single symbol
 *
 * Required in .env.local:
 *   DATABASE_URL=postgresql://user:pass@localhost:5432/afrimarket
 *   EODHD_API_KEY=your_key_here
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Load .env.local ──────────────────────────────────────────────────────────

function loadEnv(file) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      if (key && !process.env[key]) {
        process.env[key] = rest.join('=').replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* ignore */ }
}

loadEnv('.env.local');
loadEnv('.env');

// ─── Config ───────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const EODHD_API_KEY = process.env.EODHD_API_KEY;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set in .env.local');
  process.exit(1);
}
if (!EODHD_API_KEY) {
  console.warn('WARNING: EODHD_API_KEY not set – no data will be fetched from EODHD.');
  console.warn('Get a free key at https://eodhd.com (20 req/day on free tier)');
}

// ─── Symbols ─────────────────────────────────────────────────────────────────
// All actively traded BRVM companies.

const BRVM_SYMBOLS = [
  // Telecoms
  'SONATEL', 'ONATEL',
  // Banking & Finance
  'SGBCI', 'ECOBANK', 'CORIS', 'BOABF', 'SIB', 'NSIA-CI', 'ORAGROUP',
  'ATLANTIC', 'ACCESS-CI', 'BICC', 'BDK', 'BOA-BF', 'BOAN',
  // Oil & Gas
  'TOTALCI', 'VIVO',
  // Agriculture & Food
  'NESTLECI', 'SAPH', 'SOGB', 'PALMC', 'SUCRIVOIRE', 'SIFCA', 'SITAB',
  // Industry
  'SETAO', 'SICABLE', 'FILTISAC',
  // Distribution
  'CFAO', 'TRACTAFRIC', 'PROSUMA',
  // Water & Energy
  'CIE', 'SODECI', 'BERNABE',
];

// BVMAC: no free public API available — data must be entered manually or via a licensed provider.
// See https://www.bvmac.com for official data.

// ─── Args parsing ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { from: null, symbol: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) result.from = args[++i];
    if (args[i] === '--symbol' && args[i + 1]) result.symbol = args[++i];
  }
  return result;
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  // Skip weekend
  if (d.getDay() === 0) d.setDate(d.getDate() - 2); // Sunday → Friday
  if (d.getDay() === 6) d.setDate(d.getDate() - 1); // Saturday → Friday
  return toDateStr(d);
}

// ─── EODHD API ────────────────────────────────────────────────────────────────

async function fetchEODHD(symbol, from, to) {
  if (!EODHD_API_KEY) return [];
  const url = `https://eodhd.com/api/eod/${symbol}.BRVM?api_token=${EODHD_API_KEY}&from=${from}&to=${to}&fmt=json&order=a`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  EODHD HTTP ${res.status} for ${symbol}`);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      symbol,
      exchange: 'BRVM',
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
    }));
  } catch (err) {
    console.warn(`  Fetch error for ${symbol}: ${err.message}`);
    return [];
  }
}

// ─── Database upsert ─────────────────────────────────────────────────────────

async function upsertRows(client, rows) {
  if (rows.length === 0) return 0;
  // Build a batch upsert with unnest for performance
  const symbols = rows.map((r) => r.symbol);
  const exchanges = rows.map((r) => r.exchange);
  const dates = rows.map((r) => r.date);
  const opens = rows.map((r) => r.open);
  const highs = rows.map((r) => r.high);
  const lows = rows.map((r) => r.low);
  const closes = rows.map((r) => r.close);
  const volumes = rows.map((r) => r.volume);

  await client.query(
    `INSERT INTO market_data (symbol, exchange, date, open, high, low, close, volume)
     SELECT * FROM unnest(
       $1::text[], $2::text[], $3::date[],
       $4::numeric[], $5::numeric[], $6::numeric[], $7::numeric[], $8::bigint[]
     )
     ON CONFLICT (symbol, date) DO UPDATE SET
       open = EXCLUDED.open,
       high = EXCLUDED.high,
       low  = EXCLUDED.low,
       close = EXCLUDED.close,
       volume = EXCLUDED.volume`,
    [symbols, exchanges, dates, opens, highs, lows, closes, volumes],
  );
  return rows.length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { from: fromArg, symbol: symbolArg } = parseArgs();
  const fromDate = fromArg || yesterday();
  const toDate = toDateStr(new Date());
  const symbols = symbolArg ? [symbolArg.toUpperCase()] : BRVM_SYMBOLS;

  console.log(`AfriMarket data fetch`);
  console.log(`Period : ${fromDate} → ${toDate}`);
  console.log(`Symbols: ${symbols.length}`);
  console.log('');

  const { Pool } = pg;
  const pool = new Pool({ connectionString: DATABASE_URL });

  let totalInserted = 0;
  let failed = 0;
  const client = await pool.connect();

  try {
    // Note: EODHD free tier = 20 API calls/day
    // Batching all history per symbol in one call counts as 1 call
    for (const symbol of symbols) {
      process.stdout.write(`  Fetching ${symbol}.BRVM ...`);
      const rows = await fetchEODHD(symbol, fromDate, toDate);
      if (rows.length > 0) {
        await upsertRows(client, rows);
        totalInserted += rows.length;
        console.log(` ${rows.length} rows`);
      } else {
        console.log(' no data');
        failed++;
      }
      // Small delay to avoid rate-limiting (EODHD free: 20 req/day, not rate per second)
      await new Promise((r) => setTimeout(r, 300));
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log('');
  console.log(`Done. Upserted: ${totalInserted} rows. No data: ${failed} symbols.`);
  if (!EODHD_API_KEY) {
    console.log('');
    console.log('TIP: Add EODHD_API_KEY to .env.local to fetch real data.');
    console.log('     Free key: https://eodhd.com (20 calls/day, enough for BRVM)');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
