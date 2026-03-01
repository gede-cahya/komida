# 🚀 Quick Start Guide - Komida Microtransactions

## ✅ Status Implementasi

### Frontend (Next.js)
- ✅ Shop page (`/shop`)
- ✅ Wallet page (`/wallet`)
- ✅ Inventory page (`/inventory`)
- ✅ Payment components (QRIS & Crypto)
- ✅ API routes untuk payment

### Backend (Bun.js + Hono)
- ✅ Server running di port 3003
- ✅ Database SQLite terinisialisasi
- ✅ 9 shop items ter-seed (5 decorations + 4 credit packs)
- ✅ API endpoints siap digunakan

---

## 📋 Cara Menjalankan

### 1. Backend

```bash
# Masuk ke folder backend
cd /home/cahya/2026/komida/komida-backend

# Install dependencies (jika belum)
bun install

# Run migrations (jika database belum ada)
bun run db:migrate

# Seed data initial
bun run db:seed

# Start server (development dengan hot reload)
bun run dev

# ATAU start untuk production
bun run start
```

Backend akan running di: **http://localhost:3003**

### 2. Frontend

```bash
# Di folder frontend utama
cd /home/cahya/2026/komida

# Start development server
bun run dev
```

Frontend akan running di: **http://localhost:3000**

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3003/health

# Get shop items
curl http://localhost:3003/api/shop/items

# Get user credits (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3003/api/user/credits
```

### Test Frontend Pages

Buka browser dan akses:

- **Shop**: http://localhost:3000/shop
- **Wallet**: http://localhost:3000/wallet
- **Inventory**: http://localhost:3000/inventory

---

## 🔧 Konfigurasi

### Backend (.env)

File: `/home/cahya/2026/komida/komida-backend/.env`

```env
# Server
PORT=3003
NODE_ENV=development

# Database
DATABASE_URL=<YOUR_DATABASE_URL>

# JWT Secret (GANTI dengan yang lebih secure!)
JWT_SECRET=<YOUR_JWT_SECRET>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Payment Gateway (Midtrans)
MIDTRANS_SERVER_KEY=SB-<MIDTRANS_SERVER_KEY>
MIDTRANS_CLIENT_KEY=SB-<MIDTRANS_CLIENT_KEY>
MIDTRANS_IS_PRODUCTION=false

# Smart Contract
KOMIDA_CREDITS_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
BASE_CHAIN_ID=8453
BASE_RPC_URL=https://mainnet.base.org

# Ethereum
ETH_PRIVATE_KEY=your-wallet-private-key
```

**PENTING**: Ganti nilai-nilai berikut dengan yang sebenarnya:
- `JWT_SECRET` - Generate random string yang kuat
- `MIDTRANS_SERVER_KEY` - Dari dashboard Midtrans
- `KOMIDA_CREDITS_CONTRACT_ADDRESS` - Setelah deploy smart contract

---

## 📊 Shop Items yang Tersedia

### Decorations (5 items)
| ID | Name | Credits | IDR | ETH |
|----|------|---------|-----|-----|
| 1 | Pop Art Action | 200 | 30K | 0.0002 |
| 2 | Manga Speed Lines | 250 | 35K | 0.00025 |
| 3 | Cyberpunk Mecha | 300 | 45K | 0.0003 |
| 4 | Webtoon Panels | 250 | 35K | 0.00025 |
| 5 | Halftone Noir | 200 | 30K | 0.0002 |

### Credit Packs (4 items)
| ID | Name | Credits | Bonus | IDR | ETH |
|----|------|---------|-------|-----|-----|
| 1 | Starter Pack | 100 | 0 | 15K | 0.0001 |
| 2 | Gamer Pack | 500 | 50 | 70K | 0.0005 |
| 3 | Whale Pack | 1000 | 150 | 135K | 0.001 |
| 4 | Legend Pack | 5000 | 1000 | 650K | 0.005 |

---

## 🔐 Authentication

Backend menggunakan JWT token. Untuk generate token:

```typescript
import { generateToken } from './src/middleware/auth.middleware';

// Contoh generate token untuk user
const token = await generateToken({
  id: 1,
  username: "testuser",
  role: "user",
  email: "test@example.com"
});

console.log("JWT Token:", token);
```

Token harus dikirim via header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🛣️ API Endpoints

### Payment
```
POST /api/payment/qris          # Initiate QRIS payment
POST /api/payment/crypto        # Initiate crypto payment
GET  /api/payment/verify        # Verify payment status
```

### Shop
```
GET  /api/shop/items            # Get all shop items
POST /api/shop/purchase         # Purchase with credits
```

### User
```
GET  /api/user/credits          # Get user credit balance
GET  /api/user/inventory        # Get user inventory
POST /api/user/inventory/:id/equip  # Equip item
GET  /api/user/transactions     # Transaction history
```

---

## 📝 Next Steps

### 1. Setup Midtrans (QRIS Payment)

1. Daftar di https://midtrans.com
2. Dapatkan API keys dari dashboard
3. Update `.env` backend dengan keys tersebut
4. Test QRIS payment flow

### 2. Deploy Smart Contract (Crypto Payment)

1. Install Hardhat di folder terpisah
2. Copy `KomidaCredits.sol` ke project Hardhat
3. Deploy ke Base Sepolia testnet
4. Update contract address di `.env`

### 3. Integrasi dengan Frontend Auth

Backend existing Anda perlu generate JWT token yang compatible:

```typescript
// Di backend existing (login endpoint)
import { generateToken } from 'komida-backend/src/middleware/auth.middleware';

app.post('/api/auth/login', async (req, res) => {
  const user = await validateUser(req.body);
  
  if (user) {
    const token = await generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    });
    
    res.json({ token, user });
  }
});
```

### 4. Update Frontend API Calls

Frontend sudah configured untuk memanggil backend di port 3003. Pastikan:
- CORS configured dengan benar
- Token JWT dikirim di setiap request yang memerlukan auth

---

## 🆘 Troubleshooting

### Backend tidak bisa start

```bash
# Check port yang digunakan
lsof -i :3003

# Kill process jika ada
pkill -f "bun run"

# Delete database dan restart
rm komida.db
bun run db:migrate
bun run db:seed
bun run start
```

### Database error

```bash
# Re-run migrations
bun run db:migrate

# Re-seed data
bun run db:seed
```

### JWT auth error

- Pastikan `JWT_SECRET` sama di backend dan frontend (jika frontend generate token)
- Check token expiration (default 7 hari)

---

## 📞 Support

Jika ada masalah:

1. Check log file: `/tmp/backend.log`
2. Enable debug mode: set `NODE_ENV=development`
3. Lihat error message di console

---

## ✅ Checklist Production

Sebelum deploy ke production:

- [ ] Ganti `JWT_SECRET` dengan yang kuat
- [ ] Setup Midtrans production keys
- [ ] Deploy smart contract ke Base Mainnet
- [ ] Enable HTTPS
- [ ] Setup database backup
- [ ] Configure rate limiting
- [ ] Setup monitoring & logging
- [ ] Security audit

---

**Last Updated**: 2026-02-24
**Status**: ✅ Backend Running Successfully
