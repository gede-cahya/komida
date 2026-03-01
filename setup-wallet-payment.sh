#!/bin/bash

# ============================================================================
# Script untuk setup Direct Wallet Payment - Komida
# Jalankan script ini untuk copy semua file dan setup otomatis
# ============================================================================

echo "🚀 Starting Komida Wallet Payment Setup..."
echo ""

BACKEND_DIR="/home/cahya/2026/komida-backend"
FRONTEND_DIR="/home/cahya/2026/komida"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

echo "✅ Backend directory found: $BACKEND_DIR"
echo ""

# Step 1: Copy blockchain service
echo "📋 Step 1: Copying blockchain service..."
if [ -f "$FRONTEND_DIR/blockchainService.ts" ]; then
    mkdir -p "$BACKEND_DIR/src/service"
    cp "$FRONTEND_DIR/blockchainService.ts" "$BACKEND_DIR/src/service/blockchainService.ts"
    echo "✅ Blockchain service copied"
else
    echo "❌ blockchainService.ts not found in frontend directory"
    exit 1
fi
echo ""

# Step 2: Install viem
echo "📋 Step 2: Installing viem dependency..."
cd "$BACKEND_DIR"
bun add viem
echo "✅ viem installed"
echo ""

# Step 3: Update .env
echo "📋 Step 3: Updating .env..."
if ! grep -q "BASE_RPC_URL" "$BACKEND_DIR/.env"; then
    echo "" >> "$BACKEND_DIR/.env"
    echo "# Blockchain Payment" >> "$BACKEND_DIR/.env"
    echo "BASE_RPC_URL=https://mainnet.base.org" >> "$BACKEND_DIR/.env"
    echo "PAYMENT_WALLET_ADDRESS=0x2645ceE3a2453D1B3d050796193504aD8e402d08" >> "$BACKEND_DIR/.env"
    echo "✅ .env updated"
else
    echo "⚠️  BASE_RPC_URL already exists in .env"
fi
echo ""

# Step 4: Backup and update payment routes
echo "📋 Step 4: Updating payment routes..."
if [ -f "$BACKEND_DIR/src/routes/payment.routes.ts" ]; then
    cp "$BACKEND_DIR/src/routes/payment.routes.ts" "$BACKEND_DIR/src/routes/payment.routes.ts.backup"
    echo "✅ Payment routes backed up"
    
    # Create new payment routes
    cat > "$BACKEND_DIR/src/routes/payment.routes.ts" << 'EOF'
import { Hono } from 'hono';
import { blockchainService } from '../service/blockchainService';
import { db } from '../db';
import { transactions } from '../db/schema';
import { eq } from 'drizzle-orm';

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
EOF
    echo "✅ Payment routes updated"
else
    echo "❌ payment.routes.ts not found"
    exit 1
fi
echo ""

# Step 5: Update index.ts to add monitoring
echo "📋 Step 5: Adding blockchain monitoring to index.ts..."
if [ -f "$BACKEND_DIR/src/index.ts" ]; then
    # Check if monitoring already added
    if grep -q "blockchainService.monitorPayments" "$BACKEND_DIR/src/index.ts"; then
        echo "⚠️  Blockchain monitoring already exists in index.ts"
    else
        # Backup first
        cp "$BACKEND_DIR/src/index.ts" "$BACKEND_DIR/src/index.ts.backup"
        
        # Add import at the top (after first import line)
        sed -i '1a import { blockchainService } from '\''./service/blockchainService'\'';
' "$BACKEND_DIR/src/index.ts"
        
        # Add monitoring before last line (assuming export is last)
        sed -i '$i\
\
// Start blockchain monitoring (every 30 seconds)\
setInterval(() => {\
  blockchainService.monitorPayments();\
}, 30000);\
console.log('\''🔗 Blockchain monitoring started for wallet: 0x2645ceE3a2453D1B3d050796193504aD8e402d08'\'');
' "$BACKEND_DIR/src/index.ts"
        
        echo "✅ Blockchain monitoring added"
    fi
else
    echo "❌ index.ts not found"
    exit 1
fi
echo ""

# Step 6: Restart backend
echo "📋 Step 6: Restarting backend..."
pkill -f "bun.*index.ts" || true
sleep 2

cd "$BACKEND_DIR"
nohup bun run dev > backend.log 2>&1 &
sleep 3

if pgrep -f "bun.*index.ts" > /dev/null; then
    echo "✅ Backend restarted successfully"
else
    echo "❌ Failed to start backend"
    exit 1
fi
echo ""

# Step 7: Show status
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "Wallet Address: 0x2645ceE3a2453D1B3d050796193504aD8e402d08"
echo "Network: Base Mainnet (Chain ID: 8453)"
echo ""
echo "📊 Testing:"
echo "  1. Check backend logs: tail -f $BACKEND_DIR/backend.log"
echo "  2. Generate payment: curl -X POST http://localhost:3002/api/payment/crypto ..."
echo "  3. Monitor blockchain: Check logs for 'Monitoring blockchain' messages"
echo ""
echo "🎉 Done!"
