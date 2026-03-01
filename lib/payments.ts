/**
 * Payment Utilities for Komida Microtransactions
 * Handles QRIS and Crypto (Base Chain) payments
 */

import type {
  ShopItem,
  Transaction,
  UserCredits,
  UserInventoryItem,
  QRISPaymentResponse,
  CryptoPaymentResponse,
  PaymentMethod,
} from '@/types/payments';

// Base Chain Configuration
export const BASE_CHAIN_CONFIG = {
  chainId: 8453, // Base Mainnet
  testnetChainId: 84531, // Base Goerli (deprecated) or 84532 (Base Sepolia)
  rpcUrl: 'https://mainnet.base.org',
  testnetRpcUrl: 'https://sepolia.base.org',
  explorerUrl: 'https://basescan.org',
  testnetExplorerUrl: 'https://sepolia.basescan.org',
};

// Komida Credits Smart Contract Address
export const KOMIDA_CREDITS_CONTRACT = {
  mainnet: '0x0000000000000000000000000000000000000000', // TODO: Deploy and update
  testnet: '0x0000000000000000000000000000000000000000', // TODO: Deploy and update
};

// Credit Pack Configurations
export const CREDIT_PACKS = [
  {
    id: 1,
    name: 'Starter Pack',
    credits: 100,
    price_idr: 15000,
    price_eth: '0.0001',
    bonus: 0,
    popular: false,
  },
  {
    id: 2,
    name: 'Gamer Pack',
    credits: 500,
    price_idr: 70000,
    price_eth: '0.0005',
    bonus: 50,
    popular: true,
  },
  {
    id: 3,
    name: 'Whale Pack',
    credits: 1000,
    price_idr: 135000,
    price_eth: '0.001',
    bonus: 150,
    popular: false,
  },
  {
    id: 4,
    name: 'Legend Pack',
    credits: 5000,
    price_idr: 650000,
    price_eth: '0.005',
    bonus: 1000,
    popular: false,
  },
];

// Default Shop Items (Decorations & Badges)
export const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: 1,
    item_type: 'decoration',
    item_id: 1,
    name: 'Pop Art Action',
    description: 'Stand out with vibrant pop art style borders and action text!',
    price_credits: 200,
    price_qris: 30000,
    price_crypto: '200000000000000',
    is_available: true,
    image_url: 'css:pop-art',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    item_type: 'decoration',
    item_id: 2,
    name: 'Manga Speed Lines',
    description: 'Dynamic speed lines background for that manga protagonist feel.',
    price_credits: 250,
    price_qris: 35000,
    price_crypto: '250000000000000',
    is_available: true,
    image_url: 'css:manga-speed',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    item_type: 'decoration',
    item_id: 3,
    name: 'Cyberpunk Mecha',
    description: 'Futuristic HUD elements with neon glow effects.',
    price_credits: 300,
    price_qris: 45000,
    price_crypto: '300000000000000',
    is_available: true,
    image_url: 'css:cyberpunk',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 4,
    item_type: 'decoration',
    item_id: 4,
    name: 'Webtoon Panels',
    description: 'Colorful webtoon-style panel backgrounds.',
    price_credits: 250,
    price_qris: 35000,
    price_crypto: '250000000000000',
    is_available: true,
    image_url: 'css:webtoon',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 5,
    item_type: 'decoration',
    item_id: 5,
    name: 'Halftone Noir',
    description: 'Classic comic book halftone pattern with noir aesthetics.',
    price_credits: 200,
    price_qris: 30000,
    price_crypto: '200000000000000',
    is_available: true,
    image_url: 'css:halftone',
    created_at: '2026-01-01T00:00:00Z',
  },
  // Credit Packs as Shop Items
  {
    id: 101,
    item_type: 'credit_pack',
    item_id: 1,
    name: 'Starter Pack',
    description: '100 Credits - Perfect for first-time buyers',
    price_credits: 0,
    price_qris: 15000,
    price_crypto: '100000000000000',
    is_available: true,
    image_url: '/shop/credit-pack.svg',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 102,
    item_type: 'credit_pack',
    item_id: 2,
    name: 'Gamer Pack',
    description: '550 Credits (500 + 50 Bonus) - Best Value!',
    price_credits: 0,
    price_qris: 70000,
    price_crypto: '500000000000000',
    is_available: true,
    image_url: '/shop/credit-pack.svg',
    created_at: '2026-01-01T00:00:00Z',
  },
];

/**
 * Format wei to ETH
 */
export function weiToEth(wei: string): string {
  return (BigInt(wei) / BigInt(1e18)).toString();
}

/**
 * Format ETH to wei
 */
export function ethToWei(eth: string): string {
  const parts = eth.split('.');
  const whole = BigInt(parts[0] || '0');
  const decimal = (parts[1] || '').padEnd(18, '0').slice(0, 18);
  return (whole * BigInt(1e18) + BigInt(decimal)).toString();
}

/**
 * Format IDR with locale
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format credits with comma separator
 */
export function formatCredits(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

/**
 * Get credit pack by ID
 */
export function getCreditPack(id: number) {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}

/**
 * Get shop item by ID
 */
export function getShopItem(id: number): ShopItem | undefined {
  return DEFAULT_SHOP_ITEMS.find((item) => item.id === id);
}

/**
 * Calculate total credits including bonus
 */
export function calculateTotalCredits(baseCredits: number): number {
  const pack = CREDIT_PACKS.find((p) => p.credits === baseCredits);
  return baseCredits + (pack?.bonus || 0);
}

/**
 * Generate QRIS payment payload
 */
export async function initiateQRISPayment(
  amount: number,
  itemId?: number,
  creditAmount?: number,
): Promise<QRISPaymentResponse> {
  const response = await fetch('/api/payment/qris', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      amount,
      item_id: itemId,
      credit_amount: creditAmount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate QRIS payment');
  }

  return response.json();
}

/**
 * Generate crypto payment payload
 */
export async function initiateCryptoPayment(
  amountWei: string,
  itemId?: number,
  creditAmount?: number,
): Promise<CryptoPaymentResponse> {
  const response = await fetch('/api/payment/crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      amount_wei: amountWei,
      item_id: itemId,
      credit_amount: creditAmount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate crypto payment');
  }

  return response.json();
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  transactionId: string,
  paymentMethod: PaymentMethod,
): Promise<{ status: string; tx_hash?: string }> {
  const response = await fetch(`/api/payment/verify?transaction_id=${transactionId}&method=${paymentMethod}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify payment');
  }

  return response.json();
}

/**
 * Get user credit balance
 */
export async function getUserCredits(): Promise<UserCredits | null> {
  const response = await fetch('/api/user/credits', {
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.credits;
}

/**
 * Get user inventory
 */
export async function getUserInventory(): Promise<UserInventoryItem[]> {
  const response = await fetch('/api/user/inventory', {
    credentials: 'include',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.inventory || [];
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(): Promise<Transaction[]> {
  const response = await fetch('/api/user/transactions', {
    credentials: 'include',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.transactions || [];
}

/**
 * Purchase item with credits
 */
export async function purchaseItemWithCredits(itemId: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/shop/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ item_id: itemId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Purchase failed');
  }

  return { success: true, message: data.message || 'Purchase successful!' };
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(userBalance: number, price: number): boolean {
  return userBalance >= price;
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplay(method: PaymentMethod): string {
  switch (method) {
    case 'qris':
      return 'QRIS (GoPay, OVO, DANA, etc.)';
    case 'crypto':
      return 'Crypto (Base Chain - ETH)';
    default:
      return method;
  }
}

/**
 * Estimate gas fee for Base chain transaction
 */
export function estimateGasFee(): string {
  // Average gas fee on Base is around 0.0001 ETH
  return '100000000000000'; // 0.0001 ETH in wei
}
