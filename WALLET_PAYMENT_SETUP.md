# 🚀 Setup Direct Wallet Payment - Komida

Panduan lengkap setup pembayaran crypto langsung ke wallet `0x2645ceE3a2453D1B3d050796193504aD8e402d08`

---

## 📋 Step 1: Copy File Blockchain Service

**Copy file ini ke backend Anda:**

```bash
cp /home/cahya/2026/komida/blockchainService.ts \
   /home/cahya/2026/komida-backend/src/service/blockchainService.ts
```

Atau manual:
1. Buka file: `/home/cahya/2026/komida/blockchainService.ts`
2. Copy semua isi file
3. Buat file baru: `/home/cahya/2026/komida-backend/src/service/blockchainService.ts`
4. Paste konten tersebut

---

## 📋 Step 2: Install Dependencies

```bash
cd /home/cahya/2026/komida-backend
bun add viem
```

---

## 📋 Step 3: Update .env Backend

Edit file `/home/cahya/2026/komida-backend/.env`:

```env
# Tambahkan ini jika belum ada
BASE_RPC_URL=https://mainnet.base.org

# Pastikan wallet address Anda tercatat
PAYMENT_WALLET_ADDRESS=0x2645ceE3a2453D1B3d050796193504aD8e402d08
```

---

## 📋 Step 4: Update Payment Routes

**Edit file:** `/home/cahya/2026/komida-backend/src/routes/payment.routes.ts`

**Ganti dengan ini:**

```typescript
import { Hono } from 'hono';
import { blockchainService } from '../service/blockchainService';
import { db } from '../db';
import { transactions } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

const routes = new Hono();

routes.post('/crypto', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { amount_wei, credit_amount } = body;

    if (!amount_wei || BigInt(amount_wei) <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    // Generate payment address dengan blockchain service
    const paymentData = await blockchainService.generatePaymentAddress(
      user.id,
      Number(amount_wei),
      credit_amount || 0
    );

    return c.json(paymentData);
  } catch (error: any) {
    console.error('Crypto payment error:', error);
    return c.json({ error: 'Failed to initiate crypto payment' }, 500);
  }
});

routes.get('/verify', async (c) => {
  try {
    const transactionId = c.req.query('transaction_id');
    
    if (!transactionId) {
      return c.json({ error: 'Missing transaction_id' }, 400);
    }

    // Check transaction status in database
    const tx = await db.select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(transactionId)))
      .limit(1);

    if (tx.length === 0) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    return c.json({
      status: tx[0].status,
      payment_method: 'base_chain',
      tx_hash: tx[0].txHash,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return c.json({ error: 'Failed to verify payment' }, 500);
  }
});

export default routes;
```

---

## 📋 Step 5: Start Blockchain Monitoring

**Edit file:** `/home/cahya/2026/komida-backend/src/index.ts`

**Tambahkan di akhir file, sebelum export server:**

```typescript
import { blockchainService } from './service/blockchainService';

// ... existing code ...

// Start blockchain monitoring (run every 30 seconds)
setInterval(() => {
  blockchainService.monitorPayments();
}, 30000); // 30 seconds

console.log('🔗 Blockchain monitoring started for wallet:', '0x2645ceE3a2453D1B3d050796193504aD8e402d08');
```

**Full example di index.ts:**

```typescript
import { Hono } from 'hono';
// ... other imports ...
import { blockchainService } from './service/blockchainService';

export const server = new Hono();

// ... existing setup code ...

// Start blockchain monitoring
setInterval(() => {
  blockchainService.monitorPayments();
}, 30000);

console.log('🔗 Blockchain monitoring started');
```

---

## 📋 Step 6: Restart Backend

```bash
# Stop backend yang sedang jalan
pkill -f "bun.*index.ts"

# Start ulang
cd /home/cahya/2026/komida-backend
bun run dev
```

**Anda harus lihat log seperti ini:**
```
🔗 Blockchain monitoring started for wallet: 0x2645ceE3a2453D1B3d050796193504aD8e402d08
🔍 Monitoring blockchain for payments...
📊 Checking blocks 123456 to 123556
✅ Blockchain check completed at block 123556
```

---

## 🧪 Step 7: Test Payment Flow

### 1. Generate Payment

```bash
# Dapatkan token login dulu
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Request payment
curl -X POST http://localhost:3002/api/payment/crypto \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_wei": "100000000000000",
    "credit_amount": 100
  }'
```

**Response:**
```json
{
  "transaction_id": "123",
  "wallet_address": "0x2645ceE3a2453D1B3d050796193504aD8e402d08",
  "amount_eth": "0.000100",
  "amount_wei": "100000000000000",
  "credit_amount": 100,
  "chain_id": 8453,
  "network": "Base Mainnet",
  "expires_at": "2026-02-24T15:00:00Z",
  "instructions": [
    "Send exactly 0.000100 ETH to the wallet address",
    "Make sure you are on Base Mainnet (Chain ID: 8453)",
    "Wait for blockchain confirmation (usually 1-2 minutes)",
    "Credits will be added automatically after confirmation"
  ]
}
```

### 2. Kirim ETH dari Wallet Anda

1. Buka wallet Anda (MetaMask, Trust Wallet, dll)
2. Switch network ke **Base Mainnet**
3. Send **0.0001 ETH** ke: `0x2645ceE3a2453D1B3d050796193504aD8e402d08`
4. Simpan transaction hash

### 3. Monitor Backend Logs

```bash
tail -f /home/cahya/2026/komida-backend/backend.log
```

**Anda harus lihat:**
```
💰 Detected payment: 0.0001 ETH from 0xYourWallet - Hash: 0xTxHash
🎯 Matched transaction: User 20 - 100 credits
💵 Updated credits for user 20: +100 (new balance: 600)
✅ Payment completed: User 20 received 100 credits
```

### 4. Verify Credits Bertambah

```bash
curl -X GET http://localhost:3002/api/user/credits \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "credits": {
    "id": 1,
    "user_id": 20,
    "balance": 600,
    "base_chain_balance": "0",
    "updated_at": "2026-02-24T14:30:00Z"
  }
}
```

---

## 🔍 Troubleshooting

### Payment Tidak Terdeteksi

1. **Check wallet address benar:**
   ```bash
   grep PAYMENT_WALLET_ADDRESS /home/cahya/2026/komida-backend/src/service/blockchainService.ts
   ```

2. **Check network Base Mainnet:**
   - Pastikan kirim dari Base Mainnet (Chain ID: 8453)
   - Bukan Ethereum Mainnet atau network lain

3. **Check backend logs:**
   ```bash
   tail -100 /home/cahya/2026/komida-backend/backend.log | grep -i "payment\|blockchain"
   ```

### Credits Tidak Bertambah

1. **Check transaction matching:**
   - Amount yang dikirim harus SAMA dengan yang di-request
   - Tolerance hanya 0.0001 ETH

2. **Check pending transaction:**
   ```bash
   curl -X GET "http://localhost:3002/api/payment/verify?transaction_id=123"
   ```

3. **Manual add credits (jika perlu):**
   - Buat endpoint admin untuk manual add
   - Atau update langsung di database

---

## 📊 Monitor Wallet Balance

Buat endpoint untuk check balance wallet:

**Tambahkan di backend:**

```typescript
// Route baru untuk admin
app.get('/api/admin/wallet-balance', async (c) => {
  const balance = await blockchainService.getWalletBalance();
  const ethPrice = await blockchainService.getETHPrice();
  
  return c.json({
    ...balance,
    usd_value: (parseFloat(balance.balance_eth) * ethPrice).toFixed(2),
  });
});
```

**Test:**
```bash
curl http://localhost:3002/api/admin/wallet-balance
```

---

## ⚠️ Security Best Practices

1. **Private Key Security:**
   - JANGAN commit private key ke git
   - Simpan di hardware wallet jika possible
   - Gunakan multi-sig untuk amount besar

2. **Monitoring:**
   - Setup alert untuk incoming transactions
   - Monitor unmatched payments
   - Regular reconciliation

3. **Rate Limiting:**
   - Limit blockchain API calls
   - Cache balance results
   - Use WebSocket untuk real-time updates

---

## ✅ Checklist

```
□ Copy blockchainService.ts ke backend
□ Install viem (bun add viem)
□ Update .env dengan BASE_RPC_URL
□ Update payment.routes.ts
□ Add monitoring interval ke index.ts
□ Restart backend
□ Test generate payment
□ Test kirim ETH
□ Verify credits bertambah
□ Monitor logs
```

---

**Setup selesai! Wallet payment sekarang aktif!** 🎉

Untuk pertanyaan, check log backend untuk detail monitoring.
