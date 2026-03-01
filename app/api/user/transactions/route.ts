/**
 * User Transactions API Route
 * Get user's transaction history
 */

import { NextRequest, NextResponse } from "next/server";

// Mock transactions data
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    user_id: 1,
    transaction_type: "credit_purchase" as const,
    amount: 550,
    currency: "CREDITS" as const,
    status: "completed" as const,
    payment_method: "qris" as const,
    tx_hash: null,
    qris_transaction_id: "QRIS-123456",
    item_purchased_id: null,
    item_name: "Gamer Pack (550 Credits)",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 2,
    user_id: 1,
    transaction_type: "item_purchase" as const,
    amount: 300,
    currency: "CREDITS" as const,
    status: "completed" as const,
    payment_method: "credits" as any,
    tx_hash: null,
    qris_transaction_id: null,
    item_purchased_id: 3,
    item_name: "Cyberpunk Mecha",
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 3,
    user_id: 1,
    transaction_type: "credit_purchase" as const,
    amount: 100,
    currency: "CREDITS" as const,
    status: "pending" as const,
    payment_method: "base_chain" as const,
    tx_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    qris_transaction_id: null,
    item_purchased_id: null,
    item_name: "Starter Pack (100 Credits)",
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/cookie
    // const user = await getSessionUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // TODO: Fetch from database
    // const transactions = await db.selectMany('transactions', { user_id: user.id });
    
    // Mock response for development
    return NextResponse.json({
      transactions: MOCK_TRANSACTIONS,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Failed to get transactions" },
      { status: 500 }
    );
  }
}
