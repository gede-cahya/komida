/**
 * User Credits API Route
 * Get user's credit balance
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/cookie
    // const user = await getSessionUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // TODO: Fetch from database
    // const credits = await db.select('user_credits', { user_id: user.id });
    
    // Mock response for development
    return NextResponse.json({
      credits: {
        id: 1,
        user_id: 1,
        balance: 500, // Mock balance
        base_chain_balance: "0.05",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "Failed to get credits" },
      { status: 500 }
    );
  }
}
