/**
 * Komida Credits Smart Contract ABI and Utilities
 * For Base Chain (L2 Ethereum) payments
 */

import { ethers } from 'ethers';

// Komida Credits Contract ABI
export const KOMIDA_CREDITS_ABI = [
  // Events
  'event CreditsPurchased(address indexed user, uint256 amount, uint256 ethPaid)',
  'event CreditsSpent(address indexed user, uint256 amount, string indexed itemType, uint256 indexed itemId)',
  'event CreditsWithdrawn(address indexed owner, uint256 amount)',
  
  // Functions
  'function credits(address) view returns (uint256)',
  'function purchaseCredits(uint256 creditAmount) external payable',
  'function spendCredits(uint256 amount, string itemType, uint256 itemId) external',
  'function withdraw() external',
  'function owner() view returns (address)',
  'function getBalance() view returns (uint256)',
];

// Contract Addresses (to be updated after deployment)
export const KOMIDA_CREDITS_ADDRESS: Record<number, string> = {
  8453: '0x0000000000000000000000000000000000000000', // Base Mainnet - TODO: Update after deployment
  84532: '0x0000000000000000000000000000000000000000', // Base Sepolia Testnet - TODO: Update after deployment
};

// Chain IDs
export const BASE_CHAIN_ID = 8453; // Base Mainnet
export const BASE_TESTNET_CHAIN_ID = 84532; // Base Sepolia

/**
 * Get contract instance
 */
export function getContractInstance(provider: ethers.Provider, chainId?: number) {
  const address = KOMIDA_CREDITS_ADDRESS[chainId || BASE_CHAIN_ID];
  
  if (address === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract address not configured. Please deploy the contract first.');
  }
  
  return new ethers.Contract(address, KOMIDA_CREDITS_ABI, provider);
}

/**
 * Get contract instance with signer (for writing)
 */
export function getContractWithSigner(signer: ethers.Signer, chainId?: number) {
  const address = KOMIDA_CREDITS_ADDRESS[chainId || BASE_CHAIN_ID];
  
  if (address === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract address not configured. Please deploy the contract first.');
  }
  
  return new ethers.Contract(address, KOMIDA_CREDITS_ABI, signer);
}

/**
 * Get user's credit balance from contract
 */
export async function getUserCreditBalance(
  provider: ethers.Provider,
  userAddress: string,
  chainId?: number,
): Promise<bigint> {
  const contract = getContractInstance(provider, chainId);
  const balance = await contract.credits(userAddress);
  return BigInt(balance);
}

/**
 * Purchase credits with ETH
 */
export async function purchaseCredits(
  signer: ethers.Signer,
  creditAmount: bigint,
  ethAmount: bigint,
  chainId?: number,
): Promise<ethers.TransactionResponse> {
  const contract = getContractWithSigner(signer, chainId);
  
  const tx = await contract.purchaseCredits(creditAmount, {
    value: ethAmount,
  });
  
  return tx;
}

/**
 * Spend credits to purchase an item
 */
export async function spendCredits(
  signer: ethers.Signer,
  amount: bigint,
  itemType: string,
  itemId: bigint,
  chainId?: number,
): Promise<ethers.TransactionResponse> {
  const contract = getContractWithSigner(signer, chainId);
  
  const tx = await contract.spendCredits(amount, itemType, itemId);
  
  return tx;
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  tx: ethers.TransactionResponse,
  confirmations: number = 1,
): Promise<ethers.TransactionReceipt | null> {
  return tx.wait(confirmations);
}

/**
 * Parse CreditsPurchased event from transaction receipt
 */
export function parseCreditsPurchasedEvent(
  receipt: ethers.TransactionReceipt,
): { user: string; amount: bigint; ethPaid: bigint } | null {
  const iface = new ethers.Interface(KOMIDA_CREDITS_ABI);
  const event = receipt.logs.find((log) => {
    try {
      const parsed = iface.parseLog(log);
      return parsed?.name === 'CreditsPurchased';
    } catch {
      return false;
    }
  });
  
  if (!event) return null;
  
  const parsed = iface.parseLog(event);
  return {
    user: parsed?.args[0],
    amount: parsed?.args[1],
    ethPaid: parsed?.args[2],
  } as { user: string; amount: bigint; ethPaid: bigint };
}

/**
 * Verify payment on-chain
 */
export async function verifyOnChainPayment(
  provider: ethers.Provider,
  txHash: string,
  expectedAmount: bigint,
  expectedUser: string,
  chainId?: number,
): Promise<{ verified: boolean; amount: bigint }> {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { verified: false, amount: BigInt(0) };
    }
    
    const event = parseCreditsPurchasedEvent(receipt);
    
    if (!event) {
      return { verified: false, amount: BigInt(0) };
    }
    
    const isVerified = 
      event.user.toLowerCase() === expectedUser.toLowerCase() &&
      event.amount >= expectedAmount;
    
    return {
      verified: isVerified,
      amount: event.amount,
    };
  } catch (error) {
    console.error('Error verifying on-chain payment:', error);
    return { verified: false, amount: BigInt(0) };
  }
}

/**
 * Get current ETH price in USD (from external API)
 */
export async function getETHPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch {
    // Fallback price
    return 2500;
  }
}

/**
 * Convert USD to ETH amount
 */
export function usdToEth(usdAmount: number, ethPrice: number): string {
  return (usdAmount / ethPrice).toFixed(6);
}

/**
 * Convert ETH to USD amount
 */
export function ethToUsd(ethAmount: string, ethPrice: number): number {
  return parseFloat(ethAmount) * ethPrice;
}

/**
 * Format wei to human-readable ETH
 */
export function formatWei(wei: bigint): string {
  return ethers.formatEther(wei);
}

/**
 * Format ETH to wei
 */
export function parseEthToWei(eth: string): bigint {
  return ethers.parseEther(eth);
}

/**
 * Get Base chain explorer URL for transaction
 */
export function getExplorerTxUrl(txHash: string, isTestnet = false): string {
  const baseUrl = isTestnet 
    ? 'https://sepolia.basescan.org' 
    : 'https://basescan.org';
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get Base chain explorer URL for address
 */
export function getExplorerAddressUrl(address: string, isTestnet = false): string {
  const baseUrl = isTestnet 
    ? 'https://sepolia.basescan.org' 
    : 'https://basescan.org';
  return `${baseUrl}/address/${address}`;
}
