-- AfriMarket – PostgreSQL Schema
-- Compatible with standard PostgreSQL (9.6+).
-- Run once: psql -d afrimarket -f db/schema.sql

-- ─── Market OHLCV Data ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS market_data (
  symbol    TEXT        NOT NULL,
  date      DATE        NOT NULL,
  exchange  TEXT        NOT NULL,  -- 'BRVM' | 'BVMAC'
  open      NUMERIC,
  high      NUMERIC,
  low       NUMERIC,
  close     NUMERIC,
  volume    BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (symbol, date)
);

CREATE INDEX IF NOT EXISTS market_data_symbol_date ON market_data (symbol, date DESC);

-- ─── Companies Registry ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS companies (
  symbol         TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  exchange       TEXT NOT NULL,
  sector         TEXT,
  country        TEXT,
  currency       TEXT,
  market_cap     NUMERIC,       -- millions CFA
  pe_ratio       NUMERIC,
  dividend_yield NUMERIC,
  description    TEXT,
  listed_date    DATE,
  is_active      BOOLEAN DEFAULT TRUE,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Announcements (IPO, actualités, dividendes) ─────────────────────────────

CREATE TABLE IF NOT EXISTS announcements (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('ipo', 'news', 'dividend', 'delisting')),
  title         TEXT NOT NULL,
  body          TEXT,
  exchange      TEXT,
  symbol        TEXT,
  expected_date DATE,
  published_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SGI Funds (OPCVM / FCP) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sgi_funds (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sgi_name        TEXT NOT NULL,
  fund_name       TEXT NOT NULL,
  fund_type       TEXT CHECK (fund_type IN ('FCP', 'SICAV')),
  exchange        TEXT,
  nav             NUMERIC,     -- Valeur liquidative
  nav_date        DATE,
  ytd_return      NUMERIC,     -- Performance YTD %
  one_year_return NUMERIC,     -- Performance 1 an %
  management_fee  NUMERIC,     -- Frais de gestion annuels %
  min_investment  NUMERIC,     -- Investissement minimum (CFA)
  currency        TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ML Training: Recommendation Outcomes ────────────────────────────────────

CREATE TABLE IF NOT EXISTS recommendation_outcomes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol       TEXT NOT NULL,
  signal       TEXT NOT NULL CHECK (signal IN ('BUY', 'HOLD', 'SELL')),
  score        NUMERIC,        -- Score du modèle (-100 à +100)
  price_at_rec NUMERIC,        -- Cours au moment de la recommandation
  price_30d    NUMERIC,        -- Cours 30 jours après
  return_30d   NUMERIC,        -- Rendement réel 30 jours %
  was_correct  BOOLEAN,        -- Signal était-il rentable ?
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rec_outcomes_symbol ON recommendation_outcomes (symbol, recorded_at DESC);
