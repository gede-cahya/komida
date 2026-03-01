# 🔧 Cara Connect Backend ke Supabase

## ✅ Status:
- ✅ Supabase credentials ada di `.env`
- ✅ Admin user sudah dibuat di Supabase
- ❌ Backend belum connect ke Supabase

## 📝 Yang Perlu Dilakukan:

### 1. Install Supabase Client di Backend

```bash
cd /home/cahya/2026/komida-backend
bun add @supabase/supabase-js
```

### 2. Buat File Supabase Client

Buat file: `/home/cahya/2026/komida-backend/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { env } from 'bun';

const supabaseUrl = env.SUPABASE_URL || '';
const supabaseKey = env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. Update Auth Routes untuk Gunakan Supabase

Edit file auth routes di backend Anda (lokasi tergantung framework Anda):

**Jika pakai Express:**
```typescript
import { supabase } from './lib/supabase';

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = generateToken({
    id: data.user.id,
    username: data.user.user_metadata?.username || data.user.email,
    role: data.user.user_metadata?.role || 'user',
    email: data.user.email
  });
  
  res.json({
    token,
    user: {
      id: data.user.id,
      username: data.user.user_metadata?.username || data.user.email,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'user',
      display_name: data.user.user_metadata?.display_name,
      avatar_url: data.user.user_metadata?.avatar_url,
      decoration_url: data.user.user_metadata?.decoration_url,
      wallet_address: data.user.user_metadata?.wallet_address
    }
  });
});
```

### 4. Restart Backend

```bash
# Stop backend yang sedang jalan
pkill -f "node\|bun"

# Start ulang
cd /home/cahya/2026/komida-backend
bun run dev  # atau npm run dev
```

### 5. Test Login

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adminc","password":"azsxdc147258"}'
```

---

## 🎯 Admin Credentials:

```
Email/Username: adminc
Password: azsxdc147258
```

---

## 📚 File yang Perlu Dibuat di Backend:

1. `src/lib/supabase.ts` - Supabase client
2. Update auth routes untuk gunakan Supabase

---

**Last Updated:** 2026-02-24
**Admin User:** ✅ Created in Supabase
