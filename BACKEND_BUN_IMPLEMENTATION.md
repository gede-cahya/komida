# Backend Implementation Guide - Komida Microtransactions (Bun.js + Hono)

Panduan implementasi backend menggunakan **Bun.js** dan **Hono** untuk sistem microtransaksi Komida.

## 📁 Struktur File Backend

```
komida-backend/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── server.ts                # Hono server setup
│   ├── routes/
│   │   ├── payment.routes.ts    # Payment routes
│   │   ├── shop.routes.ts       # Shop routes
│   │   └── inventory.routes.ts  # Inventory routes
│   ├── controllers/
│   │   ├── payment.controller.ts
│   │   ├── shop.controller.ts
│   │   └── inventory.controller.ts
│   ├── services/
│   │   ├── payment.service.ts   # Payment logic (Midtrans, Crypto)
│   │   └── blockchain.service.ts # Blockchain interactions
│   ├── db/
│   │   ├── index.ts             # Database connection
│   │   ├── schema.ts            # Database schema
│   │   └── migrations/
│   │       └── 001_microtransactions.sql
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   └── cors.middleware.ts   # CORS setup
│   └── utils/
│       ├── helpers.ts           # Helper functions
│       └── constants.ts         # Constants
├── contracts/
│   └── KomidaCredits.sol        # Smart contract
├── package.json
├── tsconfig.json
├── bunfig.toml
└── .env
```

## 📦 1. Package.json (Bun.js)

```json
{
  "name": "komida-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "start": "bun run src/index.ts",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:seed": "bun run src/db/seed.ts"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "ethers": "^6.11.0",
    "dotenv": "^16.4.0",
    "better-sqlite3": "^9.4.0"
  },
  "devDependencies": {
    "@types/bun": "^1.0.0",
    "typescript": "^5.3.0"
  }
}
```

## ⚙️ 2. Configuration Files

### bunfig.toml
```toml
[install]
exact = true

[run]
shell = "bash"
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### .env
```env
# Server
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=<YOUR_DATABASE_URL>

# JWT
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

## 🗄️ 3. Database Setup

### src/db/index.ts
```typescript
import { Database } from 'bun:sqlite';
import { env } from 'bun';

const dbPath = env.DATABASE_URL || './komida.db';
export const db = new Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

export default db;
```

### src/db/schema.ts
```typescript
import { db } from './index';

export function initializeSchema() {
  // Enable WAL mode for better concurrency
  db.run('PRAGMA journal_mode = WAL');

  // Users table extension
  db.run(`
    ALTER TABLE users ADD COLUMN wallet_address TEXT;
  `);

  db.run(`
    ALTER TABLE users ADD COLUMN decoration_url TEXT NULL;
  `);

  // User Credits Table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      balance INTEGER DEFAULT 0,
      base_chain_balance TEXT DEFAULT '0',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Shop Items Table
  db.run(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT NOT NULL CHECK (item_type IN ('badge', 'decoration', 'credit_pack')),
      item_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price_credits INTEGER NOT NULL,
      price_qris INTEGER NOT NULL,
      price_crypto TEXT NOT NULL,
      image_url TEXT,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions Table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transaction_type TEXT NOT NULL CHECK (transaction_type IN ('qris', 'crypto', 'credit_purchase', 'item_purchase')),
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL CHECK (currency IN ('IDR', 'ETH', 'CREDITS')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
      payment_method TEXT NOT NULL CHECK (payment_method IN ('qris', 'base_chain', 'credits')),
      tx_hash TEXT,
      qris_transaction_id TEXT,
      item_purchased_id INTEGER,
      item_name TEXT,
      credit_amount INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_purchased_id) REFERENCES shop_items(id) ON DELETE SET NULL
    )
  `);

  // User Inventory Table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL CHECK (item_type IN ('badge', 'decoration')),
      item_id INTEGER NOT NULL,
      acquired_via TEXT NOT NULL CHECK (acquired_via IN ('quest', 'purchase', 'admin')),
      transaction_id INTEGER,
      is_equipped BOOLEAN DEFAULT 0,
      acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
      UNIQUE(user_id, item_type, item_id)
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON user_inventory(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_equipped ON user_inventory(user_id, is_equipped)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_shop_items_available ON shop_items(is_available)`);

  console.log('✅ Database schema initialized');
}
```

### src/db/migrate.ts
```typescript
import { initializeSchema } from './schema';

console.log('🚀 Running database migrations...');
initializeSchema();
console.log('✅ Migrations completed');
```

### src/db/seed.ts
```typescript
import { db } from './index';

const shopItems = [
  {
    item_type: 'decoration',
    item_id: 1,
    name: 'Pop Art Action',
    description: 'Stand out with vibrant pop art style borders and action text!',
    price_credits: 200,
    price_qris: 30000,
    price_crypto: '200000000000000',
    image_url: 'css:pop-art',
  },
  {
    item_type: 'decoration',
    item_id: 2,
    name: 'Manga Speed Lines',
    description: 'Dynamic speed lines background for that manga protagonist feel.',
    price_credits: 250,
    price_qris: 35000,
    price_crypto: '250000000000000',
    image_url: 'css:manga-speed',
  },
  {
    item_type: 'decoration',
    item_id: 3,
    name: 'Cyberpunk Mecha',
    description: 'Futuristic HUD elements with neon glow effects.',
    price_credits: 300,
    price_qris: 45000,
    price_crypto: '300000000000000',
    image_url: 'css:cyberpunk',
  },
  {
    item_type: 'decoration',
    item_id: 4,
    name: 'Webtoon Panels',
    description: 'Colorful webtoon-style panel backgrounds.',
    price_credits: 250,
    price_qris: 35000,
    price_crypto: '250000000000000',
    image_url: 'css:webtoon',
  },
  {
    item_type: 'decoration',
    item_id: 5,
    name: 'Halftone Noir',
    description: 'Classic comic book halftone pattern with noir aesthetics.',
    price_credits: 200,
    price_qris: 30000,
    price_crypto: '200000000000000',
    image_url: 'css:halftone',
  },
  {
    item_type: 'credit_pack',
    item_id: 1,
    name: 'Starter Pack',
    description: '100 Credits - Perfect for first-time buyers',
    price_credits: 0,
    price_qris: 15000,
    price_crypto: '100000000000000',
    image_url: '/shop/credit-pack.png',
  },
  {
    item_type: 'credit_pack',
    item_id: 2,
    name: 'Gamer Pack',
    description: '550 Credits (500 + 50 Bonus) - Best Value!',
    price_credits: 0,
    price_qris: 70000,
    price_crypto: '500000000000000',
    image_url: '/shop/credit-pack.png',
  },
  {
    item_type: 'credit_pack',
    item_id: 3,
    name: 'Whale Pack',
    description: '1150 Credits (1000 + 150 Bonus)',
    price_credits: 0,
    price_qris: 135000,
    price_crypto: '1000000000000000',
    image_url: '/shop/credit-pack.png',
  },
  {
    item_type: 'credit_pack',
    item_id: 4,
    name: 'Legend Pack',
    description: '6000 Credits (5000 + 1000 Bonus)',
    price_credits: 0,
    price_qris: 650000,
    price_crypto: '5000000000000000',
    image_url: '/shop/credit-pack.png',
  },
];

console.log('🌱 Seeding database...');

for (const item of shopItems) {
  db.run(
    `INSERT OR IGNORE INTO shop_items 
     (item_type, item_id, name, description, price_credits, price_qris, price_crypto, image_url, is_available) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      item.item_type,
      item.item_id,
      item.name,
      item.description,
      item.price_credits,
      item.price_qris,
      item.price_crypto,
      item.image_url,
    ]
  );
}

console.log('✅ Database seeded with', shopItems.length, 'shop items');
```

## 🖥️ 4. Server Setup

### src/index.ts
```typescript
import { server } from './server';
import { env } from 'bun';

const port = env.PORT || 3002;

console.log(`🚀 Server starting on port ${port}...`);

Bun.serve({
  port,
  fetch: server.fetch,
});

console.log(`✅ Server running at http://localhost:${port}`);
```

### src/server.ts
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import paymentRoutes from './routes/payment.routes';
import shopRoutes from './routes/shop.routes';
import inventoryRoutes from './routes/inventory.routes';
import { initializeSchema } from './db/schema';

export const server = new Hono();

// Initialize database
initializeSchema();

// Middleware
server.use('*', logger());
server.use('*', prettyJSON());
server.use('*', cors({
  origin: ['http://localhost:3000', 'https://komida.site'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
server.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
server.route('/api/payment', paymentRoutes);
server.route('/api/shop', shopRoutes);
server.route('/api/user', inventoryRoutes);

// 404 handler
server.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
server.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

## 🔐 5. Middleware

### src/middleware/auth.middleware.ts
```typescript
import { Context, Next } from 'hono';
import { jwtVerify } from 'hono/jwt';
import { env } from 'bun';

export interface UserPayload {
  id: number;
  username: string;
  role: string;
  email?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: UserPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const verified = await jwtVerify(token, env.JWT_SECRET);
    c.set('user', verified.payload as UserPayload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}

// Optional auth (doesn't fail if no token)
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const verified = await jwtVerify(token, env.JWT_SECRET);
      c.set('user', verified.payload as UserPayload);
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }
  
  await next();
}
```

## 🎮 6. Controllers

### src/controllers/payment.controller.ts
```typescript
import { Context } from 'hono';
import { db } from '../db';
import { env } from 'bun';

const MIDTRANS_SERVER_KEY = env.MIDTRANS_SERVER_KEY || '';

export async function initiateQRIS(c: Context) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { amount, item_id, credit_amount } = body;

    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const orderId = `KOMIDA-QRIS-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create QRIS payment via Midtrans API
    const midtransResponse = await fetch('https://api.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        qris: {},
        callbacks: {
          finish: `${env.FRONTEND_URL}/wallet`,
        },
      }),
    });

    const qrisData = await midtransResponse.json();

    // Save transaction to database
    const stmt = db.prepare(`
      INSERT INTO transactions 
      (user_id, transaction_type, amount, currency, status, payment_method, qris_transaction_id, item_purchased_id, credit_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      user.id,
      credit_amount ? 'credit_purchase' : 'item_purchase',
      amount,
      'IDR',
      'pending',
      'qris',
      qrisData.qris_string || orderId,
      item_id || null,
      credit_amount || null
    );

    return c.json({
      transaction_id: qrisData.qris_string || orderId,
      qr_string: qrisData.qris_string || '',
      qr_url: qrisData.actions?.find((a: any) => a.name === 'generate-qr')?.url || 
              `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrisData.qris_string || '')}`,
      amount,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('QRIS payment error:', error);
    return c.json({ error: 'Failed to initiate QRIS payment' }, 500);
  }
}

export async function initiateCrypto(c: Context) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { amount_wei, item_id, credit_amount } = body;

    if (!amount_wei || BigInt(amount_wei) <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const transactionId = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;

    // Save transaction to database
    const stmt = db.prepare(`
      INSERT INTO transactions 
      (user_id, transaction_type, amount, currency, status, payment_method, tx_hash, item_purchased_id, credit_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      user.id,
      credit_amount ? 'credit_purchase' : 'item_purchase',
      Number(amount_wei),
      'ETH',
      'pending',
      'base_chain',
      null,
      item_id || null,
      credit_amount || null
    );

    return c.json({
      transaction_id: transactionId,
      contract_address: env.KOMIDA_CREDITS_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      amount_wei,
      chain_id: Number(env.BASE_CHAIN_ID) || 8453,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Crypto payment error:', error);
    return c.json({ error: 'Failed to initiate crypto payment' }, 500);
  }
}

export async function verifyPayment(c: Context) {
  try {
    const transactionId = c.req.query('transaction_id');
    const method = c.req.query('method');

    if (!transactionId || !method) {
      return c.json({ error: 'Missing transaction_id or method' }, 400);
    }

    let status = 'pending';

    if (method === 'qris') {
      // Check Midtrans API
      const midtransResponse = await fetch(
        `https://api.midtrans.com/v2/${transactionId}/status`,
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64'),
          },
        }
      );

      const midtransData = await midtransResponse.json();
      
      if (midtransData.transaction_status === 'settlement') {
        status = 'completed';
      } else if (midtransData.transaction_status === 'expire' || midtransData.transaction_status === 'cancel') {
        status = 'failed';
      }

      // Update database if completed
      if (status === 'completed') {
        const tx = db.prepare('SELECT * FROM transactions WHERE qris_transaction_id = ?').get(transactionId);
        
        if (tx && (tx as any).status === 'pending') {
          await completeTransaction((tx as any).id, (tx as any).user_id, (tx as any).credit_amount, (tx as any).item_purchased_id);
        }
      }
    } else if (method === 'crypto') {
      // Verify on-chain transaction (simplified for demo)
      status = 'completed';
    }

    return c.json({
      status,
      payment_method: method,
      tx_hash: method === 'crypto' ? transactionId : null,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return c.json({ error: 'Failed to verify payment' }, 500);
  }
}

async function completeTransaction(
  transactionId: number,
  userId: number,
  creditAmount: number | null,
  itemPurchasedId: number | null
) {
  // Update transaction status
  db.prepare(`UPDATE transactions SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(transactionId);

  // Add credits
  if (creditAmount) {
    db.prepare(`
      INSERT INTO user_credits (user_id, balance) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP
    `).run(userId, creditAmount, creditAmount);
  }

  // Add item to inventory
  if (itemPurchasedId) {
    const shopItem = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(itemPurchasedId) as any;
    
    if (shopItem && shopItem.item_type !== 'credit_pack') {
      db.prepare(`
        INSERT OR IGNORE INTO user_inventory 
        (user_id, item_type, item_id, acquired_via, transaction_id, is_equipped)
        VALUES (?, ?, ?, 'purchase', ?, 0)
      `).run(userId, shopItem.item_type, shopItem.item_id, transactionId);
    }
  }
}
```

### src/controllers/shop.controller.ts
```typescript
import { Context } from 'hono';
import { db } from '../db';

export async function getShopItems(c: Context) {
  try {
    const items = db.prepare(`
      SELECT * FROM shop_items WHERE is_available = 1 ORDER BY id ASC
    `).all();

    return c.json({ items });
  } catch (error) {
    console.error('Get shop items error:', error);
    return c.json({ error: 'Failed to get shop items' }, 500);
  }
}

export async function purchaseItem(c: Context) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { item_id } = body;

    if (!item_id) {
      return c.json({ error: 'Item ID required' }, 400);
    }

    const shopItem = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(item_id) as any;

    if (!shopItem || !shopItem.is_available) {
      return c.json({ error: 'Item not found' }, 404);
    }

    if (shopItem.item_type === 'credit_pack') {
      return c.json({ error: 'Credit packs must be purchased with real money' }, 400);
    }

    // Check user credits
    const userCredits = db.prepare('SELECT balance FROM user_credits WHERE user_id = ?').get(user.id) as any;

    if (!userCredits || userCredits.balance < shopItem.price_credits) {
      return c.json({ error: 'Insufficient credits' }, 400);
    }

    // Start transaction (using database transaction)
    const dbTransaction = db.transaction(() => {
      // Deduct credits
      db.prepare(`
        UPDATE user_credits SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ?
      `).run(shopItem.price_credits, user.id);

      // Create transaction record
      const result = db.prepare(`
        INSERT INTO transactions 
        (user_id, transaction_type, amount, currency, status, payment_method, item_purchased_id, item_name, credit_amount)
        VALUES (?, 'item_purchase', ?, 'CREDITS', 'completed', 'credits', ?, ?, ?)
      `).run(user.id, shopItem.price_credits, item_id, shopItem.name, -shopItem.price_credits);

      // Add item to inventory
      db.prepare(`
        INSERT OR IGNORE INTO user_inventory 
        (user_id, item_type, item_id, acquired_via, transaction_id, is_equipped)
        VALUES (?, ?, ?, 'purchase', ?, 0)
      `).run(user.id, shopItem.item_type, shopItem.item_id, result.lastInsertRowid);
    });

    dbTransaction();

    return c.json({
      success: true,
      message: 'Purchase successful! Item added to your inventory.',
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return c.json({ error: 'Purchase failed' }, 500);
  }
}
```

### src/controllers/inventory.controller.ts
```typescript
import { Context } from 'hono';
import { db } from '../db';

export async function getInventory(c: Context) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const inventory = db.prepare(`
      SELECT ui.*, si.name, si.image_url
      FROM user_inventory ui
      LEFT JOIN shop_items si ON ui.item_type = si.item_type AND ui.item_id = si.item_id
      WHERE ui.user_id = ?
      ORDER BY ui.acquired_at DESC
    `).all(user.id);

    return c.json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    return c.json({ error: 'Failed to get inventory' }, 500);
  }
}

export async function equipItem(c: Context) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const itemId = parseInt(c.req.param('id'));

    const item = db.prepare(`
      SELECT item_type, item_id FROM user_inventory WHERE id = ? AND user_id = ?
    `).get(itemId, user.id) as any;

    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    const dbTransaction = db.transaction(() => {
      // Unequip all items of the same type
      db.prepare(`
        UPDATE user_inventory SET is_equipped = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND item_type = ?
      `).run(user.id, item.item_type);

      // Equip selected item
      db.prepare(`
        UPDATE user_inventory SET is_equipped = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(itemId);

      // Update user's decoration_url if it's a decoration
      if (item.item_type === 'decoration') {
        const shopItem = db.prepare(`
          SELECT image_url FROM shop_items WHERE item_type = ? AND item_id = ?
        `).get(item.item_type, item.item_id) as any;

        if (shopItem?.image_url) {
          db.prepare(`
            UPDATE users SET decoration_url = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `).run(shopItem.image_url, user.id);
        }
      }
    });

    dbTransaction();

    return c.json({ success: true, message: 'Item equipped successfully' });
  } catch (error) {
    console.error('Equip item error:', error);
    return c.json({ error: 'Failed to equip item' }, 500);
  }
}

export async function getCredits(c: Context) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    let credits = db.prepare('SELECT * FROM user_credits WHERE user_id = ?').get(user.id) as any;

    if (!credits) {
      // Create default credits entry
      db.prepare(`
        INSERT INTO user_credits (user_id, balance, base_chain_balance) VALUES (?, 0, '0')
      `).run(user.id);

      credits = db.prepare('SELECT * FROM user_credits WHERE user_id = ?').get(user.id);
    }

    return c.json({ credits });
  } catch (error) {
    console.error('Get credits error:', error);
    return c.json({ error: 'Failed to get credits' }, 500);
  }
}

export async function getTransactions(c: Context) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(user.id);

    return c.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return c.json({ error: 'Failed to get transactions' }, 500);
  }
}
```

## 🛣️ 7. Routes

### src/routes/payment.routes.ts
```typescript
import { Hono } from 'hono';
import { initiateQRIS, initiateCrypto, verifyPayment } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const routes = new Hono();

routes.post('/qris', authMiddleware, initiateQRIS);
routes.post('/crypto', authMiddleware, initiateCrypto);
routes.get('/verify', verifyPayment);

export default routes;
```

### src/routes/shop.routes.ts
```typescript
import { Hono } from 'hono';
import { getShopItems, purchaseItem } from '../controllers/shop.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const routes = new Hono();

routes.get('/items', getShopItems);
routes.post('/purchase', authMiddleware, purchaseItem);

export default routes;
```

### src/routes/inventory.routes.ts
```typescript
import { Hono } from 'hono';
import { getInventory, equipItem, getCredits, getTransactions } from '../controllers/inventory.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const routes = new Hono();

routes.get('/inventory', authMiddleware, getInventory);
routes.get('/credits', authMiddleware, getCredits);
routes.get('/transactions', authMiddleware, getTransactions);
routes.post('/inventory/:id/equip', authMiddleware, equipItem);

export default routes;
```

## 🚀 8. Running the Backend

```bash
# Install dependencies
bun install

# Run migrations
bun run db:migrate

# Seed database
bun run db:seed

# Development (with hot reload)
bun run dev

# Production
bun run start
```

## 📊 API Endpoints

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

## 🔑 9. JWT Token Generation (For Frontend Integration)

Tambahkan endpoint login di backend yang existing:

```typescript
import { SignJWT } from 'jose';

async function generateToken(user: any) {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  
  return await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}
```

## ✅ Keuntungan Menggunakan Bun.js + Hono

1. **Performa Lebih Cepat** - Bun 4x lebih cepat dari Node.js
2. **Native TypeScript** - Tidak perlu konfigurasi Babel/Webpack
3. **Built-in SQLite** - Menggunakan `bun:sqlite` yang sangat cepat
4. **Hot Reload** - `bun run --hot` untuk development
5. **Bundle Size Kecil** - Hono sangat lightweight
6. **Simple Deployment** - Single binary, mudah deploy

## 📝 Notes

- Pastikan untuk mengganti semua nilai di `.env` dengan yang sebenarnya
- Untuk production, gunakan Midtrans production keys
- Deploy smart contract ke Base Mainnet dan update address di `.env`
- Setup HTTPS untuk production deployment
