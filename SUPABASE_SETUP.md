# 🗄️ Supabase Integration Guide - Komida

Panduan integrasi backend Komida dengan Supabase untuk database dan authentication.

---

## 📋 Apa yang Sudah Dikonfigurasi

✅ **Dual Mode Support:**
- Backend bisa menggunakan **Supabase** ATAU **Local SQLite**
- Fallback otomatis jika Supabase tidak tersedia
- Login support untuk admin dan user biasa

✅ **Features:**
- Supabase Authentication (email/password)
- Local database fallback
- JWT token generation
- User data sync antara Supabase & local DB

---

## 🔧 Setup Supabase

### 1. Buat Project Supabase

1. Buka https://supabase.com
2. Sign in / Sign up
3. Create new project
4. Pilih region terdekat (Singapore untuk Indonesia)
5. Set database password (simpan baik-baik!)

### 2. Dapatkan Credentials

Setelah project dibuat:

1. Go to **Settings** → **API**
2. Copy credentials:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (rahasia!)

### 3. Update .env Backend

Edit file: `/home/cahya/2026/komida/komida-backend/.env`

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Setup Database Schema di Supabase

Buka **SQL Editor** di Supabase dashboard, run script ini:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table
create table if not exists users (
  id bigint primary key generated always as identity,
  supabase_user_id uuid references auth.users(id),
  username text unique not null,
  email text unique,
  display_name text,
  avatar_url text,
  decoration_url text,
  wallet_address text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create user_credits table
create table if not exists user_credits (
  id bigint primary key generated always as identity,
  user_id bigint references users(id) on delete cascade,
  balance integer default 0,
  base_chain_balance text default '0',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id)
);

-- Create shop_items table
create table if not exists shop_items (
  id bigint primary key generated always as identity,
  item_type text not null check (item_type in ('badge', 'decoration', 'credit_pack')),
  item_id integer,
  name text not null,
  description text,
  price_credits integer not null,
  price_qris integer not null,
  price_crypto text not null,
  image_url text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create transactions table
create table if not exists transactions (
  id bigint primary key generated always as identity,
  user_id bigint references users(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('qris', 'crypto', 'credit_purchase', 'item_purchase')),
  amount integer not null,
  currency text not null check (currency in ('IDR', 'ETH', 'CREDITS')),
  status text not null check (status in ('pending', 'completed', 'failed')),
  payment_method text not null check (payment_method in ('qris', 'base_chain', 'credits')),
  tx_hash text,
  qris_transaction_id text,
  item_purchased_id bigint references shop_items(id) on delete set null,
  item_name text,
  credit_amount integer,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create user_inventory table
create table if not exists user_inventory (
  id bigint primary key generated always as identity,
  user_id bigint references users(id) on delete cascade,
  item_type text not null check (item_type in ('badge', 'decoration')),
  item_id integer not null,
  acquired_via text not null check (acquired_via in ('quest', 'purchase', 'admin')),
  transaction_id bigint references transactions(id) on delete set null,
  is_equipped boolean default false,
  acquired_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, item_type, item_id)
);

-- Create indexes
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_username on users(username);
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_inventory_user_id on user_inventory(user_id);

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table user_credits enable row level security;
alter table user_inventory enable row level security;
alter table transactions enable row level security;

-- Create policies for users
create policy "Users can view own data"
  on users for select
  using (auth.uid() = supabase_user_id or true);

create policy "Users can update own data"
  on users for update
  using (auth.uid() = supabase_user_id);

-- Create policy for user_credits
create policy "Users can view own credits"
  on user_credits for select
  using (
    user_id in (select id from users where supabase_user_id = auth.uid())
    or true
  );

-- Create policy for user_inventory
create policy "Users can view own inventory"
  on user_inventory for select
  using (
    user_id in (select id from users where supabase_user_id = auth.uid())
    or true
  );

-- Create policy for transactions
create policy "Users can view own transactions"
  on transactions for select
  using (
    user_id in (select id from users where supabase_user_id = auth.uid())
    or true
  );

-- Function to create user after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (supabase_user_id, username, email, display_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username' or split_part(new.email, '@', 1),
    new.email,
    new.raw_user_meta_data->>'display_name' or split_part(new.email, '@', 1),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user after signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert default admin user (PASSWORD: admin123)
-- IMPORTANT: Change password after first login!
insert into auth.users (email, email_confirmed_at, encrypted_password, role)
values (
  'admin@komida.site',
  now(),
  crypt('admin123', gen_salt('bf')),
  'authenticated'
)
on conflict do nothing;

-- Insert shop items
insert into shop_items (item_type, item_id, name, description, price_credits, price_qris, price_crypto, image_url) values
('decoration', 1, 'Pop Art Action', 'Stand out with vibrant pop art style borders!', 200, 30000, '200000000000000', 'css:pop-art'),
('decoration', 2, 'Manga Speed Lines', 'Dynamic speed lines background!', 250, 35000, '250000000000000', 'css:manga-speed'),
('decoration', 3, 'Cyberpunk Mecha', 'Futuristic HUD elements!', 300, 45000, '300000000000000', 'css:cyberpunk'),
('decoration', 4, 'Webtoon Panels', 'Colorful webtoon-style panels!', 250, 35000, '250000000000000', 'css:webtoon'),
('decoration', 5, 'Halftone Noir', 'Classic comic book halftone pattern!', 200, 30000, '200000000000000', 'css:halftone'),
('credit_pack', 1, 'Starter Pack', '100 Credits', 0, 15000, '100000000000000', '/shop/credit-pack.png'),
('credit_pack', 2, 'Gamer Pack', '550 Credits (500 + 50 Bonus)', 0, 70000, '500000000000000', '/shop/credit-pack.png'),
('credit_pack', 3, 'Whale Pack', '1150 Credits (1000 + 150 Bonus)', 0, 135000, '1000000000000000', '/shop/credit-pack.png'),
('credit_pack', 4, 'Legend Pack', '6000 Credits (5000 + 1000 Bonus)', 0, 650000, '5000000000000000', '/shop/credit-pack.png')
on conflict do nothing;
```

---

## 🔐 Login Admin User

### Default Admin Credentials

Setelah run SQL script di atas:

```
Email:    admin@komida.site
Password: admin123
```

**⚠️ PENTING:** Ganti password admin setelah login pertama kali!

### Cara Login di Frontend

1. Buka http://localhost:3000/login
2. Masukkan:
   - Email: `admin@komida.site`
   - Password: `admin123`
3. Click "Sign In"
4. Anda akan redirect ke `/admin/dashboard`

---

## 🧪 Testing

### 1. Restart Backend

```bash
cd /home/cahya/2026/komida/komida-backend
pkill -f "bun run"
bun run dev
```

### 2. Test Login Admin

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@komida.site",
    "password": "admin123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@komida.site",
    "role": "admin",
    ...
  }
}
```

### 3. Test Login User Biasa

Untuk user yang dibuat via local database (tanpa Supabase):

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
```

---

## 🔄 Mode Operasi

### Mode 1: Supabase Enabled (Recommended)

Jika `SUPABASE_URL` dan `SUPABASE_KEYS` configured:

1. Login/register akan menggunakan Supabase Auth
2. User data disimpan di Supabase database
3. Local database sebagai cache/backup
4. JWT token dari Supabase + custom JWT

### Mode 2: Local Only (Fallback)

Jika Supabase credentials TIDAK configured:

1. Login/register menggunakan local SQLite
2. Password validation simplified untuk development
3. Semua data di local database
4. Cocok untuk development/testing

---

## 📊 Database Flow

```
Supabase Auth (Email/Password)
         ↓
   Auth Users Table
         ↓
   Trigger: handle_new_user()
         ↓
   Public Users Table ←→ Local SQLite (sync)
         ↓
   User Credits, Inventory, Transactions
```

---

## 🛠️ Troubleshooting

### "Backend Unreachable"

```bash
# Check backend running
curl http://localhost:3002/health

# Restart if needed
cd komida-backend
bun run start
```

### "Invalid Credentials" untuk Admin

1. Check admin user ada di Supabase:
```sql
select email, role from auth.users where email = 'admin@komida.site';
```

2. Reset password admin:
```sql
update auth.users
set encrypted_password = crypt('admin123', gen_salt('bf'))
where email = 'admin@komida.site';
```

### Supabase Connection Error

1. Check credentials di `.env`
2. Test connection:
```bash
curl https://your-project.supabase.co/rest/v1/users \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

3. Check RLS policies di Supabase

---

## ✅ Checklist Setup

```
□ Buat Supabase project
□ Copy credentials (URL, anon key, service key)
□ Update .env backend
□ Run SQL schema di Supabase
□ Restart backend
□ Test login admin
□ Test login user biasa
□ Ganti password admin
```

---

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Dashboard](https://app.supabase.com)

---

**Last Updated:** 2026-02-24
**Status:** ✅ Supabase Integration Ready!
