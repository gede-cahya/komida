# Backend Implementation Guide - Komida Microtransactions

Panduan implementasi backend untuk sistem microtransaksi Komida.

## 📁 Struktur File Backend

```
komida-backend/
├── src/
│   ├── controllers/
│   │   ├── payment.controller.ts    # QRIS & Crypto payment logic
│   │   ├── shop.controller.ts       # Shop items & purchases
│   │   └── inventory.controller.ts  # User inventory management
│   ├── routes/
│   │   ├── payment.routes.ts
│   │   ├── shop.routes.ts
│   │   └── inventory.routes.ts
│   ├── models/
│   │   ├── Transaction.ts
│   │   ├── ShopItem.ts
│   │   ├── UserCredit.ts
│   │   └── UserInventory.ts
│   └── middleware/
│       └── auth.middleware.ts
├── database/
│   └── schema.sql
└── contracts/
    └── KomidaCredits.sol
```

## 🗄️ 1. Database Schema (SQLite/PostgreSQL)

```sql
-- File: database/schema.sql

-- Extend users table
ALTER TABLE users ADD COLUMN wallet_address TEXT;
ALTER TABLE users ADD COLUMN decoration_url TEXT NULL;

-- User Credits Table
CREATE TABLE IF NOT EXISTS user_credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    balance INTEGER DEFAULT 0,
    base_chain_balance TEXT DEFAULT '0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shop Items Table
CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL CHECK (item_type IN ('badge', 'decoration', 'credit_pack')),
    item_id INTEGER, -- Reference to badges/decorations table
    name TEXT NOT NULL,
    description TEXT,
    price_credits INTEGER NOT NULL,
    price_qris INTEGER NOT NULL, -- in IDR
    price_crypto TEXT NOT NULL, -- in wei
    image_url TEXT,
    is_available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
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
    credit_amount INTEGER, -- Amount of credits purchased/used
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_purchased_id) REFERENCES shop_items(id) ON DELETE SET NULL
);

-- User Inventory Table
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
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_equipped ON user_inventory(user_id, is_equipped);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON shop_items(is_available);
```

## 🔧 2. Database Migrations (Jika menggunakan ORM)

```typescript
// File: src/database/migrations/001_microtransactions.ts

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add wallet_address to users
  await db.schema.alterTable('users')
    .addColumn('walletAddress', 'text')
    .execute();

  await db.schema.alterTable('users')
    .addColumn('decorationUrl', 'text')
    .execute();

  // Create user_credits
  await db.schema.createTable('user_credits')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('userId', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('balance', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('baseChainBalance', 'text', (col) => col.defaultTo('0'))
    .addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create shop_items
  await db.schema.createTable('shop_items')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('itemType', 'text', (col) => col.notNull().check(sql`itemType IN ('badge', 'decoration', 'credit_pack')`))
    .addColumn('itemId', 'integer')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('priceCredits', 'integer', (col) => col.notNull())
    .addColumn('priceQris', 'integer', (col) => col.notNull())
    .addColumn('priceCrypto', 'text', (col) => col.notNull())
    .addColumn('imageUrl', 'text')
    .addColumn('isAvailable', 'boolean', (col) => col.defaultTo(true))
    .addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create transactions
  await db.schema.createTable('transactions')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('userId', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('transactionType', 'text', (col) => col.notNull().check(sql`transactionType IN ('qris', 'crypto', 'credit_purchase', 'item_purchase')`))
    .addColumn('amount', 'integer', (col) => col.notNull())
    .addColumn('currency', 'text', (col) => col.notNull().check(sql`currency IN ('IDR', 'ETH', 'CREDITS')`))
    .addColumn('status', 'text', (col) => col.notNull().check(sql`status IN ('pending', 'completed', 'failed')`))
    .addColumn('paymentMethod', 'text', (col) => col.notNull().check(sql`paymentMethod IN ('qris', 'base_chain', 'credits')`))
    .addColumn('txHash', 'text')
    .addColumn('qrisTransactionId', 'text')
    .addColumn('itemPurchasedId', 'integer').references('shop_items.id').onDelete('set null')
    .addColumn('itemName', 'text')
    .addColumn('creditAmount', 'integer')
    .addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create user_inventory
  await db.schema.createTable('user_inventory')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('userId', 'integer', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('itemType', 'text', (col) => col.notNull().check(sql`itemType IN ('badge', 'decoration')`))
    .addColumn('itemId', 'integer', (col) => col.notNull())
    .addColumn('acquiredVia', 'text', (col) => col.notNull().check(sql`acquiredVia IN ('quest', 'purchase', 'admin')`))
    .addColumn('transactionId', 'integer').references('transactions.id').onDelete('set null')
    .addColumn('isEquipped', 'boolean', (col) => col.defaultTo(false))
    .addColumn('acquiredAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addConstraint('unique_user_item', sql`UNIQUE (userId, itemType, itemId)`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_inventory').ifExists().execute();
  await db.schema.dropTable('transactions').ifExists().execute();
  await db.schema.dropTable('shop_items').ifExists().execute();
  await db.schema.dropTable('user_credits').ifExists().execute();
}
```

## 📊 3. Seed Data (Shop Items)

```typescript
// File: src/database/seeds/001_shop_items.ts

const shopItems = [
  // Decorations
  {
    itemType: 'decoration',
    itemId: 1,
    name: 'Pop Art Action',
    description: 'Stand out with vibrant pop art style borders and action text!',
    priceCredits: 200,
    priceQris: 30000,
    priceCrypto: '200000000000000', // 0.0002 ETH
    imageUrl: 'css:pop-art',
  },
  {
    itemType: 'decoration',
    itemId: 2,
    name: 'Manga Speed Lines',
    description: 'Dynamic speed lines background for that manga protagonist feel.',
    priceCredits: 250,
    priceQris: 35000,
    priceCrypto: '250000000000000',
    imageUrl: 'css:manga-speed',
  },
  {
    itemType: 'decoration',
    itemId: 3,
    name: 'Cyberpunk Mecha',
    description: 'Futuristic HUD elements with neon glow effects.',
    priceCredits: 300,
    priceQris: 45000,
    priceCrypto: '300000000000000',
    imageUrl: 'css:cyberpunk',
  },
  {
    itemType: 'decoration',
    itemId: 4,
    name: 'Webtoon Panels',
    description: 'Colorful webtoon-style panel backgrounds.',
    priceCredits: 250,
    priceQris: 35000,
    priceCrypto: '250000000000000',
    imageUrl: 'css:webtoon',
  },
  {
    itemType: 'decoration',
    itemId: 5,
    name: 'Halftone Noir',
    description: 'Classic comic book halftone pattern with noir aesthetics.',
    priceCredits: 200,
    priceQris: 30000,
    priceCrypto: '200000000000000',
    imageUrl: 'css:halftone',
  },
  // Credit Packs
  {
    itemType: 'credit_pack',
    itemId: 1,
    name: 'Starter Pack',
    description: '100 Credits - Perfect for first-time buyers',
    priceCredits: 0,
    priceQris: 15000,
    priceCrypto: '100000000000000',
    imageUrl: '/shop/credit-pack.png',
  },
  {
    itemType: 'credit_pack',
    itemId: 2,
    name: 'Gamer Pack',
    description: '550 Credits (500 + 50 Bonus) - Best Value!',
    priceCredits: 0,
    priceQris: 70000,
    priceCrypto: '500000000000000',
    imageUrl: '/shop/credit-pack.png',
  },
  {
    itemType: 'credit_pack',
    itemId: 3,
    name: 'Whale Pack',
    description: '1150 Credits (1000 + 150 Bonus)',
    priceCredits: 0,
    priceQris: 135000,
    priceCrypto: '1000000000000000',
    imageUrl: '/shop/credit-pack.png',
  },
  {
    itemType: 'credit_pack',
    itemId: 4,
    name: 'Legend Pack',
    description: '6000 Credits (5000 + 1000 Bonus)',
    priceCredits: 0,
    priceQris: 650000,
    priceCrypto: '5000000000000000',
    imageUrl: '/shop/credit-pack.png',
  },
];

export async function seed(db: Kysely<any>): Promise<void> {
  for (const item of shopItems) {
    await db.insertInto('shop_items').values(item).execute();
  }
}
```

## 🎯 4. Controllers

### Payment Controller

```typescript
// File: src/controllers/payment.controller.ts

import { Request, Response } from 'express';
import { db } from '../database';
import { generateOrderId } from '../utils/helpers';

// Midtrans/Xendit configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';

export class PaymentController {
  /**
   * Initiate QRIS Payment
   * POST /api/payment/qris
   */
  static async initiateQRIS(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // From auth middleware
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount, item_id, credit_amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const orderId = generateOrderId('QRIS');

      // Create QRIS payment via Midtrans
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
            finish: `${process.env.FRONTEND_URL}/wallet`,
          },
        }),
      });

      const qrisData = await midtransResponse.json();

      // Save transaction to database
      const transaction = await db
        .insertInto('transactions')
        .values({
          userId,
          transactionType: credit_amount ? 'credit_purchase' : 'item_purchase',
          amount,
          currency: 'IDR',
          status: 'pending',
          paymentMethod: 'qris',
          qrisTransactionId: qrisData.qris_string || orderId,
          itemPurchasedId: item_id || null,
          itemName: null,
          creditAmount: credit_amount || null,
        })
        .returning(['id', 'qrisTransactionId'])
        .executeTakeFirst();

      res.json({
        transaction_id: transaction?.qrisTransactionId || orderId,
        qr_string: qrisData.qris_string || '',
        qr_url: qrisData.actions?.find((a: any) => a.name === 'generate-qr')?.url || 
                `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrisData.qris_string || '')}`,
        amount,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error('QRIS payment error:', error);
      res.status(500).json({ error: 'Failed to initiate QRIS payment' });
    }
  }

  /**
   * Initiate Crypto Payment
   * POST /api/payment/crypto
   */
  static async initiateCrypto(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount_wei, item_id, credit_amount } = req.body;

      if (!amount_wei || BigInt(amount_wei) <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const transactionId = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;

      // Save transaction to database
      await db
        .insertInto('transactions')
        .values({
          userId,
          transactionType: credit_amount ? 'credit_purchase' : 'item_purchase',
          amount: Number(amount_wei),
          currency: 'ETH',
          status: 'pending',
          paymentMethod: 'base_chain',
          txHash: null,
          itemPurchasedId: item_id || null,
          creditAmount: credit_amount || null,
        })
        .execute();

      res.json({
        transaction_id: transactionId,
        contract_address: process.env.KOMIDA_CREDITS_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
        amount_wei,
        chain_id: 8453, // Base Mainnet
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error('Crypto payment error:', error);
      res.status(500).json({ error: 'Failed to initiate crypto payment' });
    }
  }

  /**
   * Verify Payment Status
   * GET /api/payment/verify
   */
  static async verifyPayment(req: Request, res: Response) {
    try {
      const { transaction_id, method } = req.query;

      if (!transaction_id || !method) {
        return res.status(400).json({ error: 'Missing transaction_id or method' });
      }

      let status: string = 'pending';

      if (method === 'qris') {
        // Check Midtrans API
        const midtransResponse = await fetch(
          `https://api.midtrans.com/v2/${transaction_id}/status`,
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
          const transaction = await db
            .selectFrom('transactions')
            .selectAll()
            .where('qrisTransactionId', '=', transaction_id as string)
            .executeTakeFirst();

          if (transaction && transaction.status === 'pending') {
            await this.completeTransaction(transaction.id, transaction.userId, transaction.creditAmount, transaction.itemPurchasedId);
          }
        }
      } else if (method === 'crypto') {
        // Verify on-chain transaction
        // TODO: Implement blockchain verification
        status = 'completed'; // For demo
      }

      res.json({
        status,
        payment_method: method,
        tx_hash: method === 'crypto' ? transaction_id : null,
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  }

  /**
   * Complete transaction and add credits/items to user
   */
  private static async completeTransaction(
    transactionId: number,
    userId: number,
    creditAmount: number | null,
    itemPurchasedId: number | null
  ) {
    // Update transaction status
    await db
      .updateTable('transactions')
      .set({ status: 'completed', updatedAt: new Date() })
      .where('id', '=', transactionId)
      .execute();

    // Add credits
    if (creditAmount) {
      await db
        .insertInto('user_credits')
        .values({
          userId,
          balance: creditAmount,
          baseChainBalance: '0',
        })
        .onConflict((oc) =>
          oc.column('userId').doUpdateSet({
            balance: (eb) => eb('balance', '+', creditAmount),
            updatedAt: new Date(),
          })
        )
        .execute();
    }

    // Add item to inventory
    if (itemPurchasedId) {
      const shopItem = await db
        .selectFrom('shop_items')
        .selectAll()
        .where('id', '=', itemPurchasedId)
        .executeTakeFirst();

      if (shopItem && shopItem.itemType !== 'credit_pack') {
        await db
          .insertInto('user_inventory')
          .values({
            userId,
            itemType: shopItem.itemType as 'badge' | 'decoration',
            itemId: shopItem.itemId || 0,
            acquiredVia: 'purchase',
            transactionId,
            isEquipped: false,
          })
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
    }
  }
}
```

### Shop Controller

```typescript
// File: src/controllers/shop.controller.ts

import { Request, Response } from 'express';
import { db } from '../database';

export class ShopController {
  /**
   * Get all shop items
   * GET /api/shop/items
   */
  static async getShopItems(req: Request, res: Response) {
    try {
      const items = await db
        .selectFrom('shop_items')
        .selectAll()
        .where('isAvailable', '=', true)
        .orderBy('id', 'asc')
        .execute();

      res.json({ items });
    } catch (error) {
      console.error('Get shop items error:', error);
      res.status(500).json({ error: 'Failed to get shop items' });
    }
  }

  /**
   * Purchase item with credits
   * POST /api/shop/purchase
   */
  static async purchaseItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { item_id } = req.body;

      if (!item_id) {
        return res.status(400).json({ error: 'Item ID required' });
      }

      // Get item details
      const shopItem = await db
        .selectFrom('shop_items')
        .selectAll()
        .where('id', '=', item_id)
        .executeTakeFirst();

      if (!shopItem || !shopItem.isAvailable) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (shopItem.itemType === 'credit_pack') {
        return res.status(400).json({ error: 'Credit packs must be purchased with real money' });
      }

      // Check user credits
      const userCredits = await db
        .selectFrom('user_credits')
        .select('balance')
        .where('userId', '=', userId)
        .executeTakeFirst();

      if (!userCredits || userCredits.balance < shopItem.priceCredits) {
        return res.status(400).json({ error: 'Insufficient credits' });
      }

      // Start transaction
      await db.transaction().execute(async (trx) => {
        // Deduct credits
        await trx
          .updateTable('user_credits')
          .set({
            balance: (eb) => eb('balance', '-', shopItem.priceCredits),
            updatedAt: new Date(),
          })
          .where('userId', '=', userId)
          .execute();

        // Create transaction record
        const transaction = await trx
          .insertInto('transactions')
          .values({
            userId,
            transactionType: 'item_purchase',
            amount: shopItem.priceCredits,
            currency: 'CREDITS',
            status: 'completed',
            paymentMethod: 'credits',
            itemPurchasedId: item_id,
            itemName: shopItem.name,
            creditAmount: -shopItem.priceCredits,
          })
          .returning('id')
          .executeTakeFirst();

        // Add item to inventory
        await trx
          .insertInto('user_inventory')
          .values({
            userId,
            itemType: shopItem.itemType as 'badge' | 'decoration',
            itemId: shopItem.itemId || 0,
            acquiredVia: 'purchase',
            transactionId: transaction?.id,
            isEquipped: false,
          })
          .onConflict((oc) => oc.doNothing())
          .execute();
      });

      res.json({
        success: true,
        message: 'Purchase successful! Item added to your inventory.',
      });
    } catch (error) {
      console.error('Purchase error:', error);
      res.status(500).json({ error: 'Purchase failed' });
    }
  }
}
```

### Inventory Controller

```typescript
// File: src/controllers/inventory.controller.ts

import { Request, Response } from 'express';
import { db } from '../database';

export class InventoryController {
  /**
   * Get user inventory
   * GET /api/user/inventory
   */
  static async getInventory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const inventory = await db
        .selectFrom('user_inventory')
        .innerJoin('shop_items', (join) =>
          join
            .onRef('user_inventory.itemType', '=', 'shop_items.itemType')
            .onRef('user_inventory.itemId', '=', 'shop_items.itemId')
        )
        .select([
          'user_inventory.id',
          'user_inventory.userId',
          'user_inventory.itemType',
          'user_inventory.itemId',
          'user_inventory.acquiredVia',
          'user_inventory.transactionId',
          'user_inventory.isEquipped',
          'user_inventory.acquiredAt',
          'shop_items.name',
          'shop_items.imageUrl',
        ])
        .where('user_inventory.userId', '=', userId)
        .orderBy('user_inventory.acquiredAt', 'desc')
        .execute();

      res.json({ inventory });
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({ error: 'Failed to get inventory' });
    }
  }

  /**
   * Equip item
   * POST /api/user/inventory/:id/equip
   */
  static async equipItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const itemId = parseInt(req.params.id);

      // Get item details
      const item = await db
        .selectFrom('user_inventory')
        .select(['itemType', 'itemId'])
        .where('id', '=', itemId)
        .where('userId', '=', userId)
        .executeTakeFirst();

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      await db.transaction().execute(async (trx) => {
        // Unequip all items of the same type
        await trx
          .updateTable('user_inventory')
          .set({ isEquipped: false, updatedAt: new Date() })
          .where('userId', '=', userId)
          .where('itemType', '=', item.itemType)
          .execute();

        // Equip selected item
        await trx
          .updateTable('user_inventory')
          .set({ isEquipped: true, updatedAt: new Date() })
          .where('id', '=', itemId)
          .execute();

        // Update user's decoration_url if it's a decoration
        if (item.itemType === 'decoration') {
          const shopItem = await trx
            .selectFrom('shop_items')
            .select('imageUrl')
            .where('itemType', '=', item.itemType)
            .where('itemId', '=', item.itemId)
            .executeTakeFirst();

          if (shopItem?.imageUrl) {
            await trx
              .updateTable('users')
              .set({ decorationUrl: shopItem.imageUrl, updatedAt: new Date() })
              .where('id', '=', userId)
              .execute();
          }
        }
      });

      res.json({ success: true, message: 'Item equipped successfully' });
    } catch (error) {
      console.error('Equip item error:', error);
      res.status(500).json({ error: 'Failed to equip item' });
    }
  }

  /**
   * Get user credits
   * GET /api/user/credits
   */
  static async getCredits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const credits = await db
        .selectFrom('user_credits')
        .selectAll()
        .where('userId', '=', userId)
        .executeTakeFirst();

      if (!credits) {
        // Create default credits entry
        const newCredits = await db
          .insertInto('user_credits')
          .values({
            userId,
            balance: 0,
            baseChainBalance: '0',
          })
          .returningAll()
          .executeTakeFirst();

        res.json({ credits: newCredits });
      } else {
        res.json({ credits });
      }
    } catch (error) {
      console.error('Get credits error:', error);
      res.status(500).json({ error: 'Failed to get credits' });
    }
  }

  /**
   * Get transaction history
   * GET /api/user/transactions
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const transactions = await db
        .selectFrom('transactions')
        .selectAll()
        .where('userId', '=', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .execute();

      res.json({ transactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }
}
```

## 🛣️ 5. Routes

```typescript
// File: src/routes/payment.routes.ts

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/qris', authenticate, PaymentController.initiateQRIS);
router.post('/crypto', authenticate, PaymentController.initiateCrypto);
router.get('/verify', PaymentController.verifyPayment);

export default router;
```

```typescript
// File: src/routes/shop.routes.ts

import { Router } from 'express';
import { ShopController } from '../controllers/shop.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/items', ShopController.getShopItems);
router.post('/purchase', authenticate, ShopController.purchaseItem);

export default router;
```

```typescript
// File: src/routes/inventory.routes.ts

import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/inventory', authenticate, InventoryController.getInventory);
router.get('/credits', authenticate, InventoryController.getCredits);
router.get('/transactions', authenticate, InventoryController.getTransactions);
router.post('/inventory/:id/equip', authenticate, InventoryController.equipItem);

export default router;
```

## 📜 6. Smart Contract (Solidity)

```solidity
// File: contracts/KomidaCredits.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KomidaCredits {
    address public owner;
    mapping(address => uint256) public credits;
    
    event CreditsPurchased(address indexed user, uint256 amount, uint256 ethPaid);
    event CreditsSpent(address indexed user, uint256 amount, string itemType, uint256 itemId);
    event CreditsWithdrawn(address indexed owner, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * Purchase credits with ETH
     * @param creditAmount Amount of credits to purchase
     */
    function purchaseCredits(uint256 creditAmount) external payable {
        require(msg.value > 0, "Must send ETH");
        require(credits[msg.sender] + creditAmount > credits[msg.sender], "Overflow");
        
        credits[msg.sender] += creditAmount;
        
        emit CreditsPurchased(msg.sender, creditAmount, msg.value);
    }
    
    /**
     * Spend credits on an item
     * @param amount Amount of credits to spend
     * @param itemType Type of item (badge/decoration)
     * @param itemId ID of the item
     */
    function spendCredits(uint256 amount, string calldata itemType, uint256 itemId) external {
        require(credits[msg.sender] >= amount, "Insufficient credits");
        
        credits[msg.sender] -= amount;
        
        emit CreditsSpent(msg.sender, amount, itemType, itemId);
    }
    
    /**
     * Withdraw ETH (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
        
        emit CreditsWithdrawn(owner, balance);
    }
    
    /**
     * Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

## 🔑 7. Environment Variables

```bash
# File: .env

# Database
DATABASE_URL=<YOUR_DATABASE_URL>

# Payment Gateways
MIDTRANS_SERVER_KEY=SB-<MIDTRANS_SERVER_KEY>
MIDTRANS_CLIENT_KEY=SB-<MIDTRANS_CLIENT_KEY>
XENDIT_SECRET_KEY=xnd_development_xxx

# Smart Contract
KOMIDA_CREDITS_CONTRACT_ADDRESS=0x...

# Frontend
FRONTEND_URL=https://komida.site

# JWT
JWT_SECRET=<YOUR_JWT_SECRET>
```

## 🚀 Deployment Steps

1. **Run Migrations:**
```bash
npm run db:migrate
```

2. **Seed Shop Items:**
```bash
npm run db:seed
```

3. **Deploy Smart Contract:**
```bash
npx hardhat run scripts/deploy.ts --network base
```

4. **Update Contract Address:**
```bash
# Update .env with deployed contract address
KOMIDA_CREDITS_CONTRACT_ADDRESS=0x...
```

5. **Start Backend:**
```bash
npm run start
```
