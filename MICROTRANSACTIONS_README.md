# 🛒 Komida Microtransactions System

Sistem microtransaksi lengkap untuk platform Komida dengan dukungan pembayaran QRIS (Indonesia) dan Crypto (Base Chain).

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Frontend Implementation](#frontend-implementation)
- [Backend Implementation](#backend-implementation)
- [Smart Contract](#smart-contract)
- [Payment Flow](#payment-flow)
- [Credit Packs](#credit-packs)
- [Shop Items](#shop-items)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

## ✨ Fitur

### 💳 Payment Methods
- **QRIS** - Pembayaran dengan QR Code (GoPay, OVO, DANA, ShopeePay, dll)
- **Crypto** - ETH on Base Chain (L2 Ethereum)
- **Credits** - Sistem credits internal untuk pembelian items

### 🎁 Shop Items
- **Avatar Decorations** - 5 tema komik (Pop Art, Manga Speed, Cyberpunk, Webtoon, Halftone)
- **Badges** - Badge eksklusif untuk profil
- **Credit Packs** - Packages credits dengan bonus

### 🎮 User Features
- Browse shop dengan filter kategori
- Purchase items dengan credits
- Top-up credits via QRIS/Crypto
- Inventory management (equip/unequip items)
- Transaction history
- Real-time payment verification

## 🏗️ Arsitektur

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│   Database  │
│  (Next.js)  │◀────│   (Node.js)  │◀────│ (SQLite/PG) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│  Base Chain │     │ Payment GW   │
│ Smart Contract│    │ (Midtrans)   │
└─────────────┘     └──────────────┘
```

## 📁 Frontend Implementation

### Files Created

```
komida/
├── types/
│   └── payments.ts                 # Type definitions
├── lib/
│   ├── payments.ts                 # Payment utilities
│   └── komida-credits.ts           # Smart contract ABI & utilities
├── components/shop/
│   ├── shop-item-card.tsx          # Item card component
│   ├── shop-grid.tsx               # Shop grid layout
│   ├── payment-modal.tsx           # Payment selection modal
│   ├── qris-payment.tsx            # QRIS payment UI
│   ├── crypto-payment.tsx          # Crypto payment UI
│   └── purchase-history.tsx        # Transaction history
├── app/
│   ├── shop/
│   │   └── page.tsx                # Shop main page
│   ├── wallet/
│   │   └── page.tsx                # Wallet & top-up page
│   └── inventory/
│       └── page.tsx                # Inventory management
└── components/
    └── navbar.tsx                  # Updated with shop links
```

### Key Features

- **Shop Page** (`/shop`)
  - Browse all items with category filters
  - Display prices in Credits, IDR, and ETH
  - Purchase with credits or real money
  - Show user's credit balance

- **Wallet Page** (`/wallet`)
  - View credit packs
  - Top-up via QRIS or Crypto
  - Real-time payment status
  - Connected wallet display

- **Inventory Page** (`/inventory`)
  - View owned decorations & badges
  - Equip/unequip items
  - Preview with current avatar
  - Filter by item type

## 🔧 Backend Implementation

Lihat `BACKEND_IMPLEMENTATION.md` untuk panduan lengkap backend.

### Database Schema

```sql
-- User Credits
CREATE TABLE user_credits (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE,
    balance INTEGER DEFAULT 0,
    base_chain_balance TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

-- Shop Items
CREATE TABLE shop_items (
    id INTEGER PRIMARY KEY,
    item_type TEXT CHECK (item_type IN ('badge', 'decoration', 'credit_pack')),
    item_id INTEGER,
    name TEXT,
    description TEXT,
    price_credits INTEGER,
    price_qris INTEGER,
    price_crypto TEXT,
    is_available BOOLEAN,
    created_at DATETIME
);

-- Transactions
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    transaction_type TEXT,
    amount INTEGER,
    currency TEXT,
    status TEXT,
    payment_method TEXT,
    tx_hash TEXT,
    qris_transaction_id TEXT,
    item_purchased_id INTEGER,
    credit_amount INTEGER,
    created_at DATETIME
);

-- User Inventory
CREATE TABLE user_inventory (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    item_type TEXT,
    item_id INTEGER,
    acquired_via TEXT,
    transaction_id INTEGER,
    is_equipped BOOLEAN,
    acquired_at DATETIME,
    UNIQUE(user_id, item_type, item_id)
);
```

### API Endpoints

```
Payment
├── POST /api/payment/qris          # Initiate QRIS payment
├── POST /api/payment/crypto        # Initiate crypto payment
└── GET  /api/payment/verify        # Verify payment status

Shop
├── GET  /api/shop/items            # Get all shop items
└── POST /api/shop/purchase         # Purchase with credits

User
├── GET  /api/user/credits          # Get user credit balance
├── GET  /api/user/inventory        # Get user inventory
├── POST /api/user/inventory/:id/equip  # Equip item
└── GET  /api/user/transactions     # Transaction history
```

## 🔗 Smart Contract

### KomidaCredits.sol

Smart contract untuk manajemen credits di Base Chain.

**Features:**
- Purchase credits dengan ETH
- Spend credits untuk items
- Credit packs configuration
- Owner withdrawal
- Event tracking

**Deployment:**

```bash
# Deploy to Base Mainnet
npx hardhat run scripts/deploy.ts --network base

# Deploy to Base Sepolia (Testnet)
npx hardhat run scripts/deploy.ts --network baseSepolia
```

**Contract Address:**
- Base Mainnet: `0x0000000000000000000000000000000000000000` (TODO: Update after deployment)
- Base Sepolia: `0x0000000000000000000000000000000000000000` (TODO: Update after deployment)

## 💰 Payment Flow

### QRIS Payment Flow

```
1. User selects credit pack/item
2. Frontend calls POST /api/payment/qris
3. Backend creates Midtrans transaction
4. Backend returns QR code URL
5. User scans QR with e-wallet
6. Midtrans processes payment
7. Frontend polls /api/payment/verify
8. Payment completed → Add credits/items
```

### Crypto Payment Flow

```
1. User connects wallet (Base Chain)
2. User selects credit pack/item
3. Frontend calls POST /api/payment/crypto
4. Backend creates transaction record
5. User sends ETH to contract
6. Smart contract emits CreditsPurchased event
7. Frontend polls /api/payment/verify
8. Backend verifies on-chain → Add credits/items
```

### Credits Purchase Flow

```
1. User selects item in shop
2. Frontend checks user credits
3. User clicks "Use Credits"
4. Frontend calls POST /api/shop/purchase
5. Backend deducts credits
6. Backend adds item to inventory
7. Backend creates transaction record
8. Purchase complete!
```

## 🎁 Credit Packs

| Pack Name | Credits | Bonus | Price (IDR) | Price (ETH) |
|-----------|---------|-------|-------------|-------------|
| Starter Pack | 100 | 0 | Rp 15.000 | 0.0001 ETH |
| Gamer Pack | 500 | 50 | Rp 70.000 | 0.0005 ETH |
| Whale Pack | 1000 | 150 | Rp 135.000 | 0.001 ETH |
| Legend Pack | 5000 | 1000 | Rp 650.000 | 0.005 ETH |

## 🛍️ Shop Items

### Decorations

| Name | Price (Credits) | Price (IDR) | Price (ETH) |
|------|-----------------|-------------|-------------|
| Pop Art Action | 200 | Rp 30.000 | 0.0002 ETH |
| Manga Speed Lines | 250 | Rp 35.000 | 0.00025 ETH |
| Cyberpunk Mecha | 300 | Rp 45.000 | 0.0003 ETH |
| Webtoon Panels | 250 | Rp 35.000 | 0.00025 ETH |
| Halftone Noir | 200 | Rp 30.000 | 0.0002 ETH |

### Badges

Badges dapat diperoleh melalui:
- Quests completion
- Purchase di shop
- Admin giveaway

## 🚀 Deployment

### Frontend (Next.js)

```bash
# Install dependencies
bun install

# Development
bun run dev

# Build
bun run build

# Production
bun run start
```

### Backend (Node.js)

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Development
npm run dev

# Production
npm run start
```

### Smart Contract (Hardhat)

```bash
# Install dependencies
npm install

# Compile contract
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network baseSepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.ts --network base

# Verify on BaseScan
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

## 🔐 Security Considerations

1. **Payment Verification**
   - Always verify payments server-side
   - Use webhooks for payment gateways
   - Implement idempotency for callbacks

2. **Smart Contract**
   - Audit contract before mainnet deployment
   - Use OpenZeppelin libraries
   - Implement access control
   - Add emergency pause mechanism

3. **Database**
   - Use transactions for credit operations
   - Implement proper indexing
   - Regular backups

4. **API**
   - Rate limiting
   - Authentication middleware
   - Input validation
   - CORS configuration

## 📊 Monitoring

### Events to Track

- `CreditsPurchased` - User membeli credits
- `CreditsSpent` - User membelanjakan credits
- `PaymentCompleted` - Payment berhasil
- `PaymentFailed` - Payment gagal
- `ItemPurchased` - Item dibeli

### Metrics

- Daily/Monthly Revenue
- Active Purchasing Users
- Average Transaction Value
- Popular Items
- Payment Method Distribution

## 🛠️ TODO (Production)

- [ ] Deploy smart contract ke Base Mainnet
- [ ] Integrate Midtrans/Xendit untuk QRIS
- [ ] Setup payment webhooks
- [ ] Implement blockchain verification
- [ ] Add admin dashboard untuk manage shop
- [ ] Setup monitoring & alerts
- [ ] Security audit smart contract
- [ ] Load testing
- [ ] Backup & recovery plan

## 📞 Support

Untuk pertanyaan atau issue:
- Frontend: Update issue di repository komida
- Backend: Update issue di repository komida-backend
- Smart Contract: Buat issue baru dengan label "blockchain"

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Komida**
