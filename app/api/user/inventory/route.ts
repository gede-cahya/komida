/**
 * User Inventory API Route
 * Get and manage user's inventory
 */

import { NextRequest, NextResponse } from "next/server";

// Mock inventory data
const MOCK_INVENTORY = [
  {
    id: 1,
    user_id: 1,
    item_type: "decoration" as const,
    item_id: 1,
    acquired_via: "quest" as const,
    transaction_id: null,
    is_equipped: false,
    name: "Pop Art Action",
    image_url: "css:pop-art",
    acquired_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    item_type: "decoration" as const,
    item_id: 3,
    acquired_via: "purchase" as const,
    transaction_id: 1,
    is_equipped: true,
    name: "Cyberpunk Mecha",
    image_url: "css:cyberpunk",
    acquired_at: new Date().toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    item_type: "badge" as const,
    item_id: 1,
    acquired_via: "quest" as const,
    transaction_id: null,
    is_equipped: false,
    name: "Early Adopter",
    image_url: "/uploads/badges/early-adopter.png",
    acquired_at: new Date().toISOString(),
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
    // const inventory = await db.selectMany('user_inventory', { user_id: user.id });
    
    // Mock response for development
    return NextResponse.json({
      inventory: MOCK_INVENTORY,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json(
      { error: "Failed to get inventory" },
      { status: 500 }
    );
  }
}
