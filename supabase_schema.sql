-- Skema Database Supabase untuk Aplikasi DompetKu AI (Catatan Keuangan)

-- 1. Tabel Profil Pengguna (User Profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Rekening & Dompet (Accounts / Wallets)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bank', -- 'bank', 'ewallet', 'cash', 'investment'
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'Wallet',
  account_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Kategori Transaksi (Categories)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- NULL jika kategori global bawaan
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'expense' atau 'income'
  icon TEXT DEFAULT 'ShoppingBag',
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Transaksi Keuangan (Transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'expense', 'income', 'transfer'
  amount NUMERIC(15, 2) NOT NULL,
  category TEXT NOT NULL,
  category_icon TEXT,
  category_color TEXT,
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  to_account_id TEXT,
  to_account_name TEXT,
  date DATE NOT NULL,
  time TEXT,
  note TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Batas Anggaran (Budgets)
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  limit_amount NUMERIC(15, 2) NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes untuk performa kueri cepat
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);

-- 7. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik / Anonim untuk kemudahan demo & sinkronisasi
DROP POLICY IF EXISTS "Public access to profiles" ON profiles;
CREATE POLICY "Public access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to accounts" ON accounts;
CREATE POLICY "Public access to accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to categories" ON categories;
CREATE POLICY "Public access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to transactions" ON transactions;
CREATE POLICY "Public access to transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to budgets" ON budgets;
CREATE POLICY "Public access to budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
