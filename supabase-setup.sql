-- ─────────────────────────────────────────────────────────────────────────────
-- Pro Seller's — Supabase Database Setup
-- Run this entire file in Supabase → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Users (game accounts + balances)
CREATE TABLE IF NOT EXISTS users (
  id        bigserial   PRIMARY KEY,
  uid       text        UNIQUE NOT NULL,
  username  text        DEFAULT '',
  pubg      integer     DEFAULT 0,
  freefire  integer     DEFAULT 0,
  tiktok    integer     DEFAULT 0
);

-- Orders (purchase history)
CREATE TABLE IF NOT EXISTS orders (
  id          text        PRIMARY KEY,
  service     text,
  service_id  text,
  amount      integer,
  unit        text,
  player_id   text,
  username    text,
  date        text,
  new_total   integer,
  created_at  timestamptz DEFAULT now()
);

-- Stock (global inventory)
CREATE TABLE IF NOT EXISTS stock (
  id      text     PRIMARY KEY,
  amount  integer  DEFAULT 0
);

-- Audit log (every admin action)
CREATE TABLE IF NOT EXISTS audit (
  id          bigserial   PRIMARY KEY,
  action      text,
  target_id   text,
  service     text,
  delta       integer,
  before_val  integer,
  after_val   integer,
  count_val   integer,
  new_total   integer,
  timestamp   timestamptz DEFAULT now()
);

-- Seed default stock values (skip if already seeded)
INSERT INTO stock (id, amount) VALUES
  ('pubg',     50000),
  ('freefire', 50000),
  ('tiktok',   50000)
ON CONFLICT (id) DO NOTHING;

-- Disable Row Level Security (demo app — anon key has full access)
ALTER TABLE users   DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders  DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock   DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit   DISABLE ROW LEVEL SECURITY;
