# 🔌 Backend API Specification - Komida Frontend

Dokumentasi endpoint yang diperlukan untuk backend Komida agar bisa connect dengan frontend.

**Base URL:** `http://localhost:3002/api`

---

## 🔐 Authentication Endpoints

### POST /auth/login
Login user (admin & user biasa)

**Request:**
```json
{
  "email": "admin@komida.site",
  "password": "admin123"
}
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@komida.site",
    "role": "admin",
    "display_name": "Administrator",
    "avatar_url": "https://...",
    "decoration_url": "css:cyberpunk",
    "wallet_address": "0x...",
    "badges": [
      { "name": "Admin Badge", "icon_url": "/uploads/badges/admin.png" }
    ]
  }
}
```

**Response Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /auth/register
Register user baru

**Request:**
```json
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "password123",
  "display_name": "New User"
}
```

**Response Success (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "new@example.com",
    "role": "user",
    "display_name": "New User",
    "avatar_url": null,
    "decoration_url": null,
    "wallet_address": null
  }
}
```

---

### POST /auth/logout
Logout user

**Request:** (optional body)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /user/profile
Get current user profile (requires auth token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@komida.site",
    "role": "admin",
    "display_name": "Administrator",
    "avatar_url": "https://...",
    "decoration_url": "css:cyberpunk",
    "wallet_address": "0x...",
    "badges": [...]
  }
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## 🛍️ Shop Endpoints

### GET /shop/items
Get all available shop items

**Response Success (200):**
```json
{
  "items": [
    {
      "id": 1,
      "item_type": "decoration",
      "item_id": 1,
      "name": "Pop Art Action",
      "description": "Stand out with vibrant pop art style borders!",
      "price_credits": 200,
      "price_qris": 30000,
      "price_crypto": "200000000000000",
      "image_url": "css:pop-art",
      "is_available": true,
      "created_at": "2026-02-24T00:00:00Z"
    },
    ...
  ]
}
```

---

### POST /shop/purchase
Purchase item with credits (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "item_id": 1
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Purchase successful! Item added to your inventory."
}
```

**Response Error (400):**
```json
{
  "error": "Insufficient credits"
}
```

---

## 💳 Payment Endpoints

### POST /payment/qris
Initiate QRIS payment (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 15000,
  "item_id": 101,
  "credit_amount": 100
}
```

**Response Success (200):**
```json
{
  "transaction_id": "QRIS-1234567890",
  "qr_string": "00020101021126570014ID.CO.QRIS.WWW...",
  "qr_url": "https://api.qrserver.com/v1/create-qr-code/...",
  "amount": 15000,
  "expires_at": "2026-02-24T14:15:00Z"
}
```

---

### POST /payment/crypto
Initiate crypto payment (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount_wei": "100000000000000",
  "item_id": 101,
  "credit_amount": 100
}
```

**Response Success (200):**
```json
{
  "transaction_id": "0x1234567890abcdef...",
  "contract_address": "0x...",
  "amount_wei": "100000000000000",
  "chain_id": 8453,
  "expires_at": "2026-02-24T14:15:00Z"
}
```

---

### GET /payment/verify
Verify payment status

**Query Parameters:**
```
?transaction_id=QRIS-1234567890&method=qris
```

**Response Success (200):**
```json
{
  "status": "completed",
  "payment_method": "qris",
  "tx_hash": null
}
```

**Status Values:**
- `pending` - Payment belum selesai
- `completed` - Payment berhasil
- `failed` - Payment gagal

---

## 👤 User Endpoints

### GET /user/credits
Get user credit balance (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "credits": {
    "id": 1,
    "user_id": 1,
    "balance": 500,
    "base_chain_balance": "0.05",
    "created_at": "2026-02-24T00:00:00Z",
    "updated_at": "2026-02-24T13:00:00Z"
  }
}
```

---

### GET /user/inventory
Get user inventory (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "inventory": [
    {
      "id": 1,
      "user_id": 1,
      "item_type": "decoration",
      "item_id": 3,
      "acquired_via": "purchase",
      "transaction_id": 5,
      "is_equipped": true,
      "name": "Cyberpunk Mecha",
      "image_url": "css:cyberpunk",
      "acquired_at": "2026-02-24T12:00:00Z"
    },
    ...
  ]
}
```

---

### POST /user/inventory/:id/equip
Equip item from inventory (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```
POST /user/inventory/1/equip
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Item equipped successfully"
}
```

---

### GET /user/transactions
Get user transaction history (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "user_id": 1,
      "transaction_type": "credit_purchase",
      "amount": 550,
      "currency": "CREDITS",
      "status": "completed",
      "payment_method": "qris",
      "tx_hash": null,
      "qris_transaction_id": "QRIS-123456",
      "item_purchased_id": null,
      "item_name": "Gamer Pack (550 Credits)",
      "credit_amount": 550,
      "created_at": "2026-02-24T12:00:00Z"
    },
    ...
  ]
}
```

---

## 📊 Admin Endpoints (Optional)

### GET /admin/stats
Get admin statistics (requires admin role)

**Response Success (200):**
```json
{
  "total_users": 150,
  "total_revenue_idr": 5000000,
  "total_revenue_eth": "0.5",
  "total_transactions": 500,
  "popular_items": [...]
}
```

---

## 🔒 Authentication Flow

### 1. Login
```javascript
// Frontend call
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@komida.site',
    password: 'admin123'
  })
});

const { token, user } = await response.json();

// Simpan token
localStorage.setItem('auth_token', token);
```

### 2. Authenticated Request
```javascript
// Get user profile
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

const { user } = await response.json();
```

### 3. Logout
```javascript
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

localStorage.removeItem('auth_token');
```

---

## 🎯 Minimum Viable Backend (MVB)

Untuk frontend bisa jalan, backend minimal perlu endpoint ini:

### Must Have (Critical):
```
✅ POST /auth/login       - Login user
✅ GET  /user/profile     - Get current user
✅ GET  /shop/items       - Get shop items
```

### Should Have (Important):
```
🟡 POST /auth/register    - Register user
🟡 POST /shop/purchase    - Purchase with credits
🟡 GET  /user/credits     - Get credits balance
🟡 GET  /user/inventory   - Get inventory
```

### Nice to Have (Optional):
```
⚪ POST /payment/qris     - QRIS payment
⚪ POST /payment/crypto   - Crypto payment
⚪ GET  /payment/verify   - Verify payment
⚪ POST /user/inventory/:id/equip - Equip item
⚪ GET  /user/transactions - Transaction history
```

---

## 🧪 Testing dengan cURL

### Test Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@komida.site","password":"admin123"}'
```

### Test Get Profile
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3002/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Test Get Shop Items
```bash
curl -X GET http://localhost:3002/api/shop/items
```

---

## 📝 Notes

1. **JWT Token** harus compatible dengan frontend
   - Algorithm: HS256
   - Expiration: 7 days recommended
   - Payload harus include: `id`, `username`, `role`, `email`

2. **CORS Configuration**
   - Allow origin: `http://localhost:3000`
   - Allow methods: GET, POST, PUT, DELETE, OPTIONS
   - Allow headers: Content-Type, Authorization
   - Credentials: true

3. **Password untuk Admin**
   - Default: `admin123`
   - Should be hashed with bcrypt in production

4. **Role-based Access**
   - `admin` - Full access to all endpoints
   - `user` - Limited to user endpoints

---

**Last Updated:** 2026-02-24
**Frontend Version:** Next.js 16.1.6
**Backend Port:** 3002
