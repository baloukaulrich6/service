-- AfriMarket – Initial Database Schema
-- Run in Supabase SQL editor to set up all required tables.

-- ─── Market OHLCV Data ────────────────────────────────────────────────────────
create table if not exists market_data (
  symbol   text        not null,
  date     date        not null,
  exchange text        not null,  -- 'BVMAC' | 'BRVM'
  open     numeric,
  high     numeric,
  low      numeric,
  close    numeric,
  volume   bigint,
  created_at timestamptz default now(),
  primary key (symbol, date)
);

create index if not exists market_data_symbol_date on market_data (symbol, date desc);

-- Enable anon read (frontend)
alter table market_data enable row level security;
create policy "anon read market_data" on market_data for select using (true);

-- ─── Companies Registry ───────────────────────────────────────────────────────
create table if not exists companies (
  symbol          text primary key,
  name            text not null,
  exchange        text not null,
  sector          text,
  country         text,
  currency        text,
  market_cap      numeric,       -- in millions CFA
  pe_ratio        numeric,
  dividend_yield  numeric,
  description     text,
  listed_date     date,
  is_active       boolean default true,
  updated_at      timestamptz default now()
);

alter table companies enable row level security;
create policy "anon read companies" on companies for select using (true);

-- ─── Announcements (IPO, news, dividends) ────────────────────────────────────
create table if not exists announcements (
  id            uuid default gen_random_uuid() primary key,
  type          text not null check (type in ('ipo', 'news', 'dividend', 'delisting')),
  title         text not null,
  body          text,
  exchange      text,
  symbol        text,
  expected_date date,
  published_at  timestamptz default now()
);

alter table announcements enable row level security;
create policy "anon read announcements" on announcements for select using (true);

-- ─── SGI Funds (OPCVM / FCP) ─────────────────────────────────────────────────
create table if not exists sgi_funds (
  id               uuid default gen_random_uuid() primary key,
  sgi_name         text not null,
  fund_name        text not null,
  fund_type        text check (fund_type in ('FCP', 'SICAV')),
  exchange         text,
  nav              numeric,        -- Net Asset Value (Valeur Liquidative)
  nav_date         date,
  ytd_return       numeric,        -- Year-to-date return %
  one_year_return  numeric,
  management_fee   numeric,        -- Annual management fee %
  min_investment   numeric,        -- Minimum investment amount
  currency         text,
  updated_at       timestamptz default now()
);

alter table sgi_funds enable row level security;
create policy "anon read sgi_funds" on sgi_funds for select using (true);

-- ─── ML Training Log (optional) ──────────────────────────────────────────────
-- Stores recommendation outcomes for continuous model improvement
create table if not exists recommendation_outcomes (
  id             uuid default gen_random_uuid() primary key,
  symbol         text not null,
  signal         text not null check (signal in ('BUY', 'HOLD', 'SELL')),
  score          numeric,
  price_at_rec   numeric,
  price_30d      numeric,         -- Price 30 days after recommendation
  return_30d     numeric,         -- Actual 30-day return %
  was_correct    boolean,         -- Signal was profitable
  recorded_at    timestamptz default now()
);

alter table recommendation_outcomes enable row level security;
-- Only service role can write; anon can read aggregates
create policy "anon read outcomes" on recommendation_outcomes for select using (true);
