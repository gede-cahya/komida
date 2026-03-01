/**
 * QRIS Payment API Route
 * Initiates QRIS payment via Midtrans/Xendit
 */

import { NextRequest, NextResponse } from "next/server";

// Mock QRIS generation - In production, integrate with Midtrans/Xendit
async function createQRISPayment(amount: number, orderId: string) {
  // TODO: Replace with actual Midtrans/Xendit API call
  // Example Midtrans:
  // const res = await fetch('https://api.midtrans.com/v2/charge', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Basic ' + Buffer.from(serverKey + ':').toString('base64'),
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     transaction_details: { order_id: orderId, gross_amount: amount },
  //     qris: {},
  //   }),
  // });

  // Mock response for development
  return {
    transaction_id: `QRIS-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    qr_string: `00020101021126570014ID.CO.QRIS.WWW010412340215ID123456789012303030102758020300029590403000305802ID5913KOMIDA SHOP6007JAKARTA6105123455204581253033605405100005802ID6304ABCD`,
    qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021126570014ID.CO.QRIS.WWW01041234`,
    amount,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, item_id, credit_amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `KOMIDA-QRIS-${Date.now()}`;

    // Create QRIS payment
    const qrisData = await createQRISPayment(amount, orderId);

    // TODO: Save transaction to database with status 'pending'
    // await db.insert('transactions', {
    //   transaction_id: qrisData.transaction_id,
    //   order_id: orderId,
    //   user_id: userId,
    //   amount,
    //   payment_method: 'qris',
    //   status: 'pending',
    //   item_id,
    //   credit_amount,
    // });

    return NextResponse.json(qrisData);
  } catch (error) {
    console.error("QRIS payment error:", error);
    return NextResponse.json(
      { error: "Failed to initiate QRIS payment" },
      { status: 500 }
    );
  }
}
