/**
 * AfriMarket API Server
 * Express backend connecting the React frontend to local PostgreSQL.
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/quotes?symbols=SONATEL,ORAGROUP,...
 *   GET  /api/history/:symbol?from=YYYY-MM-DD&to=YYYY-MM-DD
 *   GET  /api/announcements
 *   GET  /api/sgi-funds
 *   POST /api/recommendations  (log ML training data)
 *
 * Start: node server/index.mjs
 */

import express from 'express';
import cors from 'cors';
import { pool } from './db.mjs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// ─── Health ──────────────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: err.message });
  }
});

// ─── Latest quotes ────────────────────────────────────────────────────────────
// Returns the most recent close price for each requested symbol.

app.get('/api/quotes', async (req, res) => {
  const raw = String(req.query.symbols || '');
  const symbols = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (symbols.length === 0) return res.json({});

  try {
    // DISTINCT ON: fastest way to get latest row per symbol in PostgreSQL
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (symbol)
         symbol, date, open, high, low, close, volume
       FROM market_data
       WHERE symbol = ANY($1)
       ORDER BY symbol, date DESC`,
      [symbols],
    );

    if (rows.length === 0) return res.json({});

    // For each row, fetch previous day close for change calculation
    const result = {};
    await Promise.all(
      rows.map(async (row) => {
        const { rows: prev } = await pool.query(
          `SELECT close FROM market_data
           WHERE symbol = $1 AND date < $2
           ORDER BY date DESC LIMIT 1`,
          [row.symbol, row.date],
        );
        const prevClose = prev[0] ? parseFloat(prev[0].close) : parseFloat(row.open ?? row.close);
        const close = parseFloat(row.close);
        const change = close - prevClose;
        result[row.symbol] = {
          symbol: row.symbol,
          price: close,
          change: parseFloat(change.toFixed(2)),
          changePercent: prevClose ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0,
          volume: parseInt(row.volume) || 0,
          timestamp: row.date instanceof Date
            ? row.date.toISOString().slice(0, 10)
            : String(row.date),
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error('/api/quotes error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── OHLCV history ────────────────────────────────────────────────────────────

app.get('/api/history/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const from = req.query.from || null;
  const to = req.query.to || null;

  try {
    const { rows } = await pool.query(
      `SELECT date, open, high, low, close, volume
       FROM market_data
       WHERE symbol = $1
         AND ($2::date IS NULL OR date >= $2::date)
         AND ($3::date IS NULL OR date <= $3::date)
       ORDER BY date ASC`,
      [symbol, from, to],
    );

    res.json(
      rows.map((r) => ({
        date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date),
        open: parseFloat(r.open),
        high: parseFloat(r.high),
        low: parseFloat(r.low),
        close: parseFloat(r.close),
        volume: parseInt(r.volume) || 0,
      })),
    );
  } catch (err) {
    console.error('/api/history error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Announcements ────────────────────────────────────────────────────────────

app.get('/api/announcements', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, title, body, exchange, symbol, expected_date, published_at
       FROM announcements
       ORDER BY published_at DESC
       LIMIT 100`,
    );

    res.json(
      rows.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body || '',
        exchange: r.exchange || null,
        symbol: r.symbol || null,
        expectedDate: r.expected_date
          ? (r.expected_date instanceof Date
              ? r.expected_date.toISOString().slice(0, 10)
              : String(r.expected_date))
          : null,
        publishedAt: r.published_at instanceof Date
          ? r.published_at.toISOString()
          : String(r.published_at),
      })),
    );
  } catch (err) {
    console.error('/api/announcements error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── SGI Funds ────────────────────────────────────────────────────────────────

app.get('/api/sgi-funds', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, sgi_name, fund_name, fund_type, exchange,
              nav, nav_date, ytd_return, one_year_return,
              management_fee, min_investment, currency
       FROM sgi_funds
       ORDER BY ytd_return DESC NULLS LAST`,
    );

    res.json(
      rows.map((r) => ({
        id: r.id,
        sgiName: r.sgi_name,
        fundName: r.fund_name,
        fundType: r.fund_type,
        exchange: r.exchange,
        nav: parseFloat(r.nav),
        navDate: r.nav_date
          ? (r.nav_date instanceof Date
              ? r.nav_date.toISOString().slice(0, 10)
              : String(r.nav_date))
          : null,
        ytdReturn: parseFloat(r.ytd_return),
        oneYearReturn: parseFloat(r.one_year_return),
        managementFee: parseFloat(r.management_fee),
        minInvestment: parseFloat(r.min_investment),
        currency: r.currency,
      })),
    );
  } catch (err) {
    console.error('/api/sgi-funds error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── ML training: log recommendation outcome ─────────────────────────────────
// Called after 30 days to record whether a BUY/SELL signal was correct.

app.post('/api/recommendations', async (req, res) => {
  const { symbol, signal, score, priceAtRec, price30d } = req.body;
  if (!symbol || !signal) return res.status(400).json({ error: 'symbol and signal are required' });

  const return30d = priceAtRec && price30d
    ? parseFloat((((price30d - priceAtRec) / priceAtRec) * 100).toFixed(4))
    : null;
  const wasCorrect = return30d !== null
    ? (signal === 'BUY' ? return30d > 0 : signal === 'SELL' ? return30d < 0 : null)
    : null;

  try {
    await pool.query(
      `INSERT INTO recommendation_outcomes (symbol, signal, score, price_at_rec, price_30d, return_30d, was_correct)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [symbol, signal, score ?? null, priceAtRec ?? null, price30d ?? null, return30d, wasCorrect],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('/api/recommendations error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`AfriMarket API → http://localhost:${PORT}`);
  console.log('Endpoints: /api/health  /api/quotes  /api/history/:symbol  /api/announcements  /api/sgi-funds');
});
