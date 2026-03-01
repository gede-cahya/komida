# 🔐 Konfigurasi Payment - Komida

## ✅ Konfigurasi Sudah Diset!

### Midtrans Credentials (Sandbox Mode)
```
Merchant ID: M587306044
Client Key:  <MIDTRANS_CLIENT_KEY>
Server Key:  <MIDTRANS_SERVER_KEY>
Mode:        SANDBOX (test mode)
```

### JWT Secret
```
JWT_SECRET=<YOUR_JWT_SECRET>
```

---

## 💳 Opsi Payment Methods

### Opsi 1: QRIS via Midtrans (✅ RECOMMENDED - Sudah Siap!)

**Keuntungan:**
- ✅ Mudah implementasi
- ✅ Support semua e-wallet Indonesia (GoPay, OVO, DANA, ShopeePay, dll)
- ✅ QR code otomatis generate
- ✅ Callback otomatis
- ✅ Tidak perlu smart contract
- ✅ Transaksi instan terverifikasi

**Cara Kerja:**
```
1. User pilih item/credit pack
2. Backend request ke Midtrans API
3. Midtrans return QR code
4. User scan QR dengan e-wallet
5. Midtrans proses payment
6. Midtrans notify backend (callback)
7. Backend add credits/items ke user
```

**Status:** ✅ SIAP DIGUNAKAN!

---

### Opsi 2: Crypto via Smart Contract (Optional)

**Pertanyaan Anda:** *"Apakah tidak bisa menggunakan smart contract wallet aja?"*

**Jawaban:** **BISA!** Ada 2 pendekatan:

#### A. Direct Wallet Transfer (Tanpa Smart Contract) - SIMPLE

User langsung kirim ETH ke wallet Anda.

**Keuntungan:**
- ✅ Tidak perlu deploy smart contract
- ✅ Lebih simple
- ✅ Gas fee lebih murah

**Kekurangan:**
- ❌ Harus monitor wallet manual/otomatis
- ❌ Tidak ada event tracking terstruktur
- ❌ Risk human error (user salah kirim amount)

**Implementasi:**
```typescript
// Backend generate payment address
const paymentAddress = "0xYourWalletAddress";
const expectedAmount = "0.0001"; // ETH

// User kirim ETH ke address tersebut
// Backend monitor incoming transactions
// Ketika ada tx masuk dengan amount yang sesuai → add credits
```

**Status:** ⚠️ Perlu implementasi manual monitoring

#### B. Smart Contract (KomidaCredits.sol) - ADVANCED

Deploy contract untuk manage credits secara terprogram.

**Keuntungan:**
- ✅ Otomatis track purchase via events
- ✅ Transparent dan trustless
- ✅ Bisa add fitur lain (refund, bulk purchase, dll)
- ✅ Professional approach

**Kekurangan:**
- ❌ Perlu deploy contract (cost gas fee)
- ❌ Lebih complex
- ❌ Gas fee untuk setiap transaction

**Status:** ⚠️ Perlu deploy ke Base Chain

---

## 🎯 Rekomendasi Saya

### Untuk Launching (Phase 1):
**Gunakan QRIS Midtrans SAJA** ✅

Alasan:
1. ✅ Sudah siap digunakan
2. ✅ User friendly untuk market Indonesia
3. ✅ Tidak perlu crypto knowledge
4. ✅ Payment instan terverifikasi
5. ✅ Support semua e-wallet populer

### Untuk Future (Phase 2):
**Tambahkan Crypto Payment**

Jika target market juga crypto users, bisa tambah:
- Direct wallet transfer (simple monitoring)
- ATAU Smart contract (lebih professional)

---

## 🚀 Implementasi QRIS Midtrans (Aktif Sekarang)

### 1. Test QRIS Payment

```bash
# Restart backend untuk load .env baru
cd /home/cahya/2026/komida/komida-backend
pkill -f "bun run" && bun run dev
```

### 2. Generate JWT Token untuk Testing

Buat file test token:

```typescript
// test-token.ts
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode('<YOUR_PASSWORD>');

async function generateTestToken() {
  const token = await new SignJWT({
    id: 1,
    username: 'testuser',
    role: 'user',
    email: 'test@example.com'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  console.log('Test Token:', token);
}

generateTestToken();
```

Run:
```bash
bun run test-token.ts
```

### 3. Test QRIS Payment Flow

```bash
# Get token dulu
TOKEN="your-token-here"

# Initiate QRIS payment
curl -X POST http://localhost:3003/api/payment/qris \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "credit_amount": 100
  }'
```

Response akan berisi QR code yang bisa discan dengan e-wallet!

---

## 📝 Jika Ingin Tambah Crypto Payment Nanti

### Opsi A: Direct Wallet Transfer (Simple)

1. Generate wallet address untuk payment
2. User kirim ETH ke address tersebut
3. Backend monitor incoming transactions
4. Ketika detect payment → add credits

**File yang perlu dibuat:**
- `src/services/blockchain.service.ts` - Monitor blockchain
- `src/controllers/crypto-payment.controller.ts` - Handle crypto payment

### Opsi B: Smart Contract (Advanced)

1. Deploy `KomidaCredits.sol` ke Base Chain
2. Update contract address di `.env`
3. Frontend connect wallet user
4. User call `purchaseCredits()` di contract
5. Backend listen events → add credits

**Deploy Smart Contract:**

```bash
# Install Hardhat
mkdir komida-contracts && cd komida-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init

# Copy contract
cp ../komida/KomidaCredits.sol contracts/

# Deploy
npx hardhat run scripts/deploy.ts --network base
```

---

## ✅ Status Saat Ini

| Payment Method | Status | Notes |
|----------------|--------|-------|
| **QRIS (Midtrans)** | ✅ READY | Credentials sudah dikonfigurasi |
| Crypto (Direct Wallet) | ⚠️ TODO | Perlu implementasi monitoring |
| Crypto (Smart Contract) | ⚠️ TODO | Perlu deploy contract |

---

## 🧪 Testing QRIS Midtrans

### 1. Midtrans Sandbox

Untuk test QRIS di sandbox mode:

1. Akses: https://dashboard.sandbox.midtrans.com
2. Login dengan credentials Anda
3. Lihat transactions yang masuk
4. Test QR code dengan e-wallet test

### 2. Test Flow Lengkap

```bash
# 1. Get shop items
curl http://localhost:3003/api/shop/items

# 2. Generate token (run test-token.ts)
bun run test-token.ts

# 3. Initiate QRIS payment
curl -X POST http://localhost:3003/api/payment/qris \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 15000, "credit_amount": 100}'

# 4. Scan QR code dengan e-wallet
# 5. Verify payment status
curl "http://localhost:3003/api/payment/verify?transaction_id=<tx_id>&method=qris"
```

---

## 🔗 Resources

- [Midtrans API Docs](https://docs.midtrans.com/)
- [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com)
- [Base Chain Docs](https://docs.base.org/)
- [Ethers.js Docs](https://docs.ethers.org/)

---

**Last Updated:** 2026-02-24
**Status:** ✅ QRIS Midtrans Ready to Use!
