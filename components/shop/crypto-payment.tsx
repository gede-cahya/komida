"use client";

import React, { useState, useEffect } from "react";
import { Wallet, ExternalLink, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { base } from "wagmi/chains";
import { formatIDR } from "@/lib/payments";
import {
  KOMIDA_CREDITS_ADDRESS,
  BASE_CHAIN_ID,
  BASE_TESTNET_CHAIN_ID,
  getExplorerTxUrl,
} from "@/lib/komida-credits";

interface CryptoPaymentProps {
  amountWei: string;
  itemId?: number;
  creditAmount?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CryptoPayment({
  amountWei,
  itemId,
  creditAmount,
  onSuccess,
  onCancel,
}: CryptoPaymentProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes

  const isTestnet = chainId === BASE_TESTNET_CHAIN_ID;
  const isCorrectChain = chainId === BASE_CHAIN_ID || chainId === BASE_TESTNET_CHAIN_ID;
  const ethAmount = formatEther(BigInt(amountWei));

  useEffect(() => {
    if (waitingForConfirmation && txHash) {
      // Poll for transaction confirmation
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/payment/verify?transaction_id=${txHash}&method=crypto`,
            { credentials: "include" }
          );
          const data = await res.json();

          if (data.status === "completed" || data.status === "success") {
            clearInterval(pollInterval);
            onSuccess();
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    }
  }, [txHash, waitingForConfirmation, onSuccess]);

  useEffect(() => {
    if (timeLeft > 0 && waitingForConfirmation) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, waitingForConfirmation]);

  const handleSwitchChain = () => {
    switchChain({ chainId: BASE_CHAIN_ID });
  };

  const handlePayment = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isCorrectChain) {
      setError("Please switch to Base chain");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Initiate payment on backend
      const res = await fetch("/api/payment/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount_wei: amountWei,
          item_id: itemId,
          credit_amount: creditAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to initiate crypto payment");
      }

      const data = await res.json();
      
      // Here we would interact with the smart contract
      // For now, we'll simulate the transaction flow
      // In production, you'd use ethers.js or viem to call the contract
      
      setTxHash(data.transaction_id);
      setWaitingForConfirmation(true);

      // NOTE: In production, you would:
      // 1. Get contract instance: getContractWithSigner(signer)
      // 2. Call purchaseCredits: await contract.purchaseCredits(creditAmount, { value: ethAmount })
      // 3. Wait for transaction: await tx.wait()
      // 4. Backend will verify via webhook or polling

    } catch (err: any) {
      console.error("Crypto payment error:", err);
      setError(err.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Wallet className="w-16 h-16 text-blue-400" />
        <p className="text-gray-400 text-center">
          Please connect your Web3 wallet to continue
        </p>
      </div>
    );
  }

  // Wrong chain state
  if (!isCorrectChain) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="w-16 h-16 text-yellow-400" />
        <p className="text-gray-400 text-center">
          Please switch to Base chain to continue
        </p>
        <Button onClick={handleSwitchChain} className="bg-blue-600 hover:bg-blue-500">
          Switch to Base
        </Button>
      </div>
    );
  }

  // Waiting for confirmation state
  if (waitingForConfirmation && txHash) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Waiting for Confirmation</h3>
          <p className="text-sm text-gray-400">
            Your transaction is being processed on Base chain
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className="text-gray-400 w-4 h-4" />
          <span className="text-gray-400">
            Time remaining: {formatTime(timeLeft)}
          </span>
        </div>

        {/* Transaction Info */}
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="font-bold text-blue-400">{ethAmount} ETH</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Credits</span>
            <span className="font-bold text-purple-400">{creditAmount || "?"}</span>
          </div>
          
          {/* Transaction Hash */}
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-2">Transaction Hash</p>
            <a
              href={getExplorerTxUrl(txHash, isTestnet)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <code className="flex-1 truncate font-mono">
                {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
              </code>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Status Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Transaction submitted</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-blue-400">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Waiting for confirmation...</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
            <span>Credits will be added automatically</span>
          </div>
        </div>

        {/* View on Explorer */}
        <a
          href={getExplorerTxUrl(txHash, isTestnet)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on BaseScan
          </Button>
        </a>

        {/* Cancel Button */}
        <Button onClick={onCancel} variant="outline" className="w-full">
          Close
        </Button>
      </div>
    );
  }

  // Payment initiation state
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Pay with Crypto</h3>
        <p className="text-sm text-gray-400">
          Complete your payment on Base chain
        </p>
      </div>

      {/* Payment Details */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Network</span>
          <span className="font-bold text-blue-400 flex items-center gap-2">
            Base {isTestnet ? "(Testnet)" : "(Mainnet)"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Amount</span>
          <span className="font-bold text-blue-400">{ethAmount} ETH</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Equivalent</span>
          <span className="font-bold text-emerald-400">{formatIDR(parseInt(ethAmount) * 35000000)}</span>
        </div>
        {creditAmount && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">You will receive</span>
            <span className="font-bold text-purple-400">{creditAmount} Credits</span>
          </div>
        )}
        
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500">
            ⛽ Gas fee not included (estimated ~0.0001 ETH)
          </p>
        </div>
      </div>

      {/* Contract Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
        <p className="text-xs text-blue-300 font-bold">Smart Contract</p>
        <a
          href={isTestnet 
            ? `https://sepolia.basescan.org/address/${KOMIDA_CREDITS_ADDRESS[BASE_TESTNET_CHAIN_ID]}`
            : `https://basescan.org/address/${KOMIDA_CREDITS_ADDRESS[BASE_CHAIN_ID]}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <code className="flex-1 truncate font-mono">
            {KOMIDA_CREDITS_ADDRESS[isTestnet ? BASE_TESTNET_CHAIN_ID : BASE_CHAIN_ID].substring(0, 10)}...
          </code>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Pay {ethAmount} ETH
          </span>
        )}
      </Button>

      {/* Cancel Button */}
      <Button onClick={onCancel} variant="outline" className="w-full">
        Cancel
      </Button>
    </div>
  );
}
