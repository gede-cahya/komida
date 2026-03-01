// Payment and Microtransaction Types for Komida

export interface ShopItem {
  id: number;
  item_type: 'badge' | 'decoration' | 'credit_pack';
  item_id: number | null; // reference to badges/decorations id
  name: string;
  description: string;
  price_credits: number;
  price_qris: number; // in IDR
  price_crypto: string; // in wei for Base chain
  is_available: boolean;
  image_url?: string;
  created_at: string;
}

export interface UserCredits {
  id: number;
  user_id: number;
  balance: number;
  base_chain_balance: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  transaction_type: 'qris' | 'crypto' | 'credit_purchase' | 'item_purchase';
  amount: number;
  currency: 'IDR' | 'ETH' | 'CREDITS';
  status: 'pending' | 'completed' | 'failed';
  payment_method: 'qris' | 'base_chain';
  tx_hash: string | null;
  qris_transaction_id: string | null;
  item_purchased_id: number | null;
  item_name: string | null;
  created_at: string;
}

export interface UserInventoryItem {
  id: number;
  user_id: number;
  item_type: 'badge' | 'decoration';
  item_id: number;
  acquired_via: 'quest' | 'purchase' | 'admin';
  transaction_id: number | null;
  is_equipped: boolean;
  name: string;
  image_url: string;
  acquired_at: string;
}

export interface QRISPaymentRequest {
  amount: number;
  item_id?: number;
  credit_amount?: number;
}

export interface QRISPaymentResponse {
  transaction_id: string;
  qr_string: string;
  qr_url: string;
  amount: number;
  expires_at: string;
}

export interface CryptoPaymentRequest {
  amount_wei: string;
  credit_amount?: number;
  item_id?: number;
}

export interface CryptoPaymentResponse {
  transaction_id: string;
  contract_address: string;
  amount_wei: string;
  chain_id: number;
  expires_at: string;
}

export interface PaymentCallback {
  transaction_id: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: 'qris' | 'crypto';
  tx_hash?: string;
}

export interface PurchaseHistory {
  transactions: Transaction[];
  total_spent_credits: number;
  total_spent_idr: number;
  total_items: number;
}

export type PaymentMethod = 'qris' | 'crypto';

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  min_amount: number;
  max_amount: number;
  fee_percentage: number;
}
