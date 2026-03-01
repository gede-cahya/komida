# 🔐 Auth & Login Setup - Komida

## ✅ Status: Auth Endpoint Ready!

Backend sekarang sudah memiliki endpoint login/register yang berfungsi penuh.

---

## 🛣️ API Endpoints

### Register User Baru

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "<PASSWORD>",
  "display_name": "Test User"
}
```

**Response:**
```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "display_name": "Test User",
    "avatar_url": null,
    "decoration_url": null,
    "wallet_address": null
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "<PASSWORD>"
}
```

**Response:**
```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "display_name": "Test User",
    "avatar_url": null,
    "decoration_url": null,
    "wallet_address": null
  }
}
```

### Get Current User (Profile)

```bash
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "display_name": "Test User",
    "avatar_url": null,
    "decoration_url": null,
    "wallet_address": null,
    "badges": []
  }
}
```

### Logout

```bash
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🧪 Testing

### 1. Register User Test

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@test.com",
    "password": "<PASSWORD>",
    "display_name": "Test User"
  }'
```

### 2. Login Test

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "<PASSWORD>"
  }'
```

### 3. Get Profile Test

```bash
curl -X GET http://localhost:3002/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Konfigurasi Backend

### Port
```
PORT=3002
```

### JWT Secret
```
JWT_SECRET=<YOUR_JWT_SECRET>
```

### Midtrans
```
MIDTRANS_SERVER_KEY=<MIDTRANS_SERVER_KEY>
MIDTRANS_CLIENT_KEY=<MIDTRANS_CLIENT_KEY>
MIDTRANS_MERCHANT_ID=M587306044
```

---

## 🔒 Security Notes

### ⚠️ IMPORTANT - Development Mode

Saat ini password verification **DILEWATKAN** untuk development. 

**File:** `src/routes/auth.routes.ts`

```typescript
// TODO: Verify password dengan bcrypt
// const valid = await bcrypt.compare(password, user.password_hash);
// if (!valid) return c.json({ error: 'Invalid credentials' }, 401);

// For development: accept any password (REMOVE IN PRODUCTION!)
console.warn('⚠️ WARNING: Skipping password verification for development');
```

### Untuk Production:

1. Install bcrypt:
```bash
bun add bcryptjs
bun add -d @types/bcryptjs
```

2. Update auth routes:
```typescript
import bcrypt from 'bcryptjs';

// Di register:
const passwordHash = await bcrypt.hash(password, 10);
// Simpan passwordHash ke database

// Di login:
const valid = await bcrypt.compare(password, user.password_hash);
if (!valid) return c.json({ error: 'Invalid credentials' }, 401);
```

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  avatar_url TEXT,
  decoration_url TEXT,
  wallet_address TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## 🔄 Integrasi dengan Frontend

Frontend sudah configured untuk menggunakan endpoint ini secara otomatis via proxy `/api/[...path]`.

### Frontend Login Flow:

1. User input username & password di `/login`
2. Frontend call `POST /api/auth/login`
3. Proxy forward ke backend `http://localhost:3002/api/auth/login`
4. Backend return token + user data
5. Frontend simpan token di localStorage/cookie
6. User redirect ke home/dashboard

### Frontend Auth State:

File: `lib/auth.tsx`

```typescript
const checkAuth = async () => {
  const res = await fetch('/api/user/profile', {
    credentials: 'include'
  });
  if (res.ok) {
    const data = await res.json();
    setUser(data.user);
  }
};
```

---

## ✅ Testing Checklist

```
✅ Backend running di port 3002
✅ Health check endpoint works
✅ Register endpoint works
✅ Login endpoint works
✅ JWT token generated successfully
✅ User data returned correctly
✅ CORS configured for frontend
```

---

## 🚀 Running Backend

```bash
cd /home/cahya/2026/komida/komida-backend

# Development (hot reload)
bun run dev

# Production
bun run start
```

Server akan running di: **http://localhost:3002**

---

## 🆘 Troubleshooting

### "Backend Unreachable" Error

1. Check backend running:
```bash
curl http://localhost:3002/health
```

2. Jika tidak running:
```bash
cd komida-backend
bun run start
```

3. Check port tidak digunakan:
```bash
lsof -i :3002
pkill -f "bun run"
bun run start
```

### "Invalid Token" Error

1. Check JWT_SECRET sama di .env
2. Generate token baru dengan register/login
3. Check token tidak expired (7 days)

### Database Error

```bash
# Reset database
rm komida.db
bun run db:migrate
bun run db:seed
bun run start
```

---

## 📝 Next Steps

1. ✅ Login/Register - DONE
2. ✅ JWT Token Generation - DONE
3. ✅ User Profile - DONE
4. ⚠️ Password Hashing - TODO (for production)
5. ⚠️ Email Verification - TODO (optional)
6. ⚠️ Password Reset - TODO (optional)

---

**Last Updated:** 2026-02-24
**Status:** ✅ Auth Endpoints Working!
