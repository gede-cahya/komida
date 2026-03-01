/**
 * Payment Verification API Route
 * Verifies payment status for QRIS and Crypto payments
 */

import { NextRequest, NextResponse } from "next/server";

// Mock payment verification - In production, check with payment gateway/blockchain
async function verifyQRISPayment(transactionId: string) {
  // TODO: Replace with actual Midtrans/Xendit API call
  // Example Midtrans:
  // const res = await fetch(`https://api.midtrans.com/v2/${transactionId}/status`, {
  //   headers: {
  //     'Authorization': 'Basic ' + Buffer.from(serverKey + ':').toString('base64'),
  //   },
  // });

  // Mock: Randomly return success for demo purposes
  // In production, this should check actual payment status
  const isPaid = Math.random() > 0.7; // 30% chance for demo

  return {
    status: isPaid ? "completed" : "pending",
    payment_method: "qris" as const,
  };
}

async function verifyCryptoPayment(txHash: string) {
  // TODO: Replace with actual blockchain verification
  // In production:
  // 1. Get transaction receipt from Base chain
  // 2. Verify transaction succeeded
  // 3. Check event logs for CreditsPurchased event
  // 4. Verify amount and user address

  // Mock: Randomly return success for demo purposes
  const isConfirmed = Math.random() > 0.5; // 50% chance for demo

  return {
    status: isConfirmed ? "completed" : "pending",
    payment_method: "crypto" as const,
    tx_hash: txHash,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transaction_id = searchParams.get("transaction_id");
    const method = searchParams.get("method");

    if (!transaction_id || !method) {
      return NextResponse.json(
        { error: "Missing transaction_id or method" },
        { status: 400 }
      );
    }

    let result;
    if (method === "qris") {
      result = await verifyQRISPayment(transaction_id);
    } else if (method === "crypto") {
      result = await verifyCryptoPayment(transaction_id);
    } else {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // TODO: Update database if payment is completed
    // if (result.status === "completed") {
    //   await db.update('transactions', { status: "completed" }, { transaction_id });
    //   
    //   // Add credits/items to user
    //   const tx = await db.select('transactions', { transaction_id });
    //   if (tx.credit_amount) {
    //     await db.update('user_credits', { balance: db.inc(tx.credit_amount) }, { user_id: tx.user_id });
    //   }
    //   if (tx.item_id) {
    //     await db.insert('user_inventory', { user_id: tx.user_id, item_id: tx.item_id, ... });
    //   }
    // }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
