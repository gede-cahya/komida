"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { Coins, Wallet, Zap, ArrowRight, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, formatIDR, formatCredits, getUserCredits } from "@/lib/payments";
import { BASE_CHAIN_ID, BASE_TESTNET_CHAIN_ID, getExplorerAddressUrl } from "@/lib/komida-credits";

type PaymentMethod = "qris" | "crypto";

export default function WalletPage() {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [userCredits, setUserCredits] = useState<number>(0);
  const [selectedPack, setSelectedPack] = useState<typeof CREDIT_PACKS[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isTestnet = chainId === BASE_TESTNET_CHAIN_ID;
  const isCorrectChain = chainId === BASE_CHAIN_ID || chainId === BASE_TESTNET_CHAIN_ID;

  useEffect(() => {
    if (user) {
      loadCredits();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCredits = async () => {
    setLoading(true);
    try {
      const credits = await getUserCredits();
      if (credits) {
        setUserCredits(credits.balance);
      }
    } catch (error) {
      console.error("Failed to load credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: BASE_CHAIN_ID });
  };

  const handleSelectPack = (pack: typeof CREDIT_PACKS[0]) => {
    setSelectedPack(pack);
    setPaymentMethod(null);
    setQrData(null);
    setTxHash(null);
  };

  const handleInitiateQRIS = async () => {
    if (!selectedPack) return;

    setProcessingPayment(true);
    try {
      const res = await fetch("/api/payment/qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: selectedPack.price_idr,
          credit_amount: selectedPack.credits + selectedPack.bonus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to initiate QRIS payment");
      }

      const data = await res.json();
      setQrData(data);
      setPaymentMethod("qris");

      // Start polling for payment status
      startPolling(data.transaction_id, "qris");
    } catch (error: any) {
      alert(error.message || "Failed to initiate payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleInitiateCrypto = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!isCorrectChain) {
      alert("Please switch to Base chain");
      return;
    }

    if (!selectedPack) return;

    setProcessingPayment(true);
    try {
      const res = await fetch("/api/payment/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount_wei: (selectedPack.price_eth.replace("0.", "") + "000000000000000000").slice(0, 19),
          credit_amount: selectedPack.credits + selectedPack.bonus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to initiate crypto payment");
      }

      const data = await res.json();
      setTxHash(data.transaction_id);
      setPaymentMethod("crypto");

      // Start polling for payment status
      startPolling(data.transaction_id, "crypto");

      // In production, you would interact with the smart contract here
      // await contract.purchaseCredits(creditAmount, { value: ethAmount })
    } catch (error: any) {
      alert(error.message || "Failed to initiate payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const startPolling = (transactionId: string, method: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payment/verify?transaction_id=${transactionId}&method=${method}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.status === "completed" || data.status === "success") {
          clearInterval(pollInterval);
          loadCredits();
          alert("Payment successful! Credits have been added to your account.");
          setSelectedPack(null);
          setPaymentMethod(null);
          setQrData(null);
          setTxHash(null);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111] py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-12">
            <Wallet className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-gray-400 mb-6">
              Please log in to access your wallet and purchase credits
            </p>
            <Button
              onClick={() => window.location.href = "/login"}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111] py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl">
              <Coins className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Wallet & Top-Up
          </h1>
          <p className="text-lg text-gray-400">
            Purchase credits to buy avatar decorations and badges
          </p>
        </div>

        {/* Credits Balance Card */}
        <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-500/20 rounded-2xl">
                <Coins className="w-12 h-12 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Available Credits</p>
                <p className="text-4xl font-bold text-purple-400">
                  {loading ? "..." : formatCredits(userCredits)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Ready to use in shop
              </span>
            </div>
          </div>
        </div>

        {/* Connected Wallet Info */}
        {isConnected && address && (
          <div className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-bold text-white">Wallet Connected</p>
                <p className="text-xs text-gray-400 font-mono">
                  {address.substring(0, 10)}...{address.substring(address.length - 8)}
                </p>
              </div>
            </div>
            {!isCorrectChain && (
              <Button onClick={handleSwitchChain} size="sm" className="bg-blue-600 hover:bg-blue-500">
                Switch to Base
              </Button>
            )}
            {isCorrectChain && (
              <a
                href={getExplorerAddressUrl(address, isTestnet)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Credit Packs */}
        {!selectedPack ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Select Credit Pack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CREDIT_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handleSelectPack(pack)}
                  className={`relative bg-[#1a1a1a] border rounded-2xl p-6 text-left transition-all hover:scale-105 ${
                    pack.popular
                      ? "border-amber-500/50 shadow-lg shadow-amber-500/20"
                      : "border-white/10 hover:border-amber-500/30"
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      BEST VALUE
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{pack.name}</h3>
                      <p className="text-sm text-gray-400">
                        {pack.credits} + {pack.bonus} Bonus
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-amber-400">
                      {formatCredits(pack.credits + pack.bonus)}
                      <span className="text-sm text-gray-500 ml-1">credits</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm font-bold text-emerald-400">
                        {formatIDR(pack.price_idr)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ~{pack.price_eth} ETH
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Payment Selection */
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedPack(null)}
              className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to packs
            </button>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 space-y-6">
              {/* Selected Pack Info */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPack.name}</h3>
                  <p className="text-sm text-gray-400">
                    {formatCredits(selectedPack.credits + selectedPack.bonus)} Credits
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{formatIDR(selectedPack.price_idr)}</p>
                  <p className="text-sm text-gray-500">~{selectedPack.price_eth} ETH</p>
                </div>
              </div>

              {!paymentMethod ? (
                <>
                  {/* Payment Method Selection */}
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-4">Select Payment Method</p>
                    <div className="space-y-3">
                      {/* QRIS */}
                      <button
                        onClick={handleInitiateQRIS}
                        disabled={processingPayment}
                        className="w-full p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                              <rect x="10" y="10" width="4" height="4" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-white">QRIS</h4>
                            <p className="text-sm text-gray-400">
                              Pay with GoPay, OVO, DANA, ShopeePay
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      {/* Crypto */}
                      <button
                        onClick={handleInitiateCrypto}
                        disabled={processingPayment || !isConnected}
                        className="w-full p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-white">Crypto (Base Chain)</h4>
                            <p className="text-sm text-gray-400">
                              Pay with ETH on Base L2
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>

                    {!isConnected && (
                      <p className="mt-4 text-sm text-yellow-400">
                        Connect your wallet to pay with crypto
                      </p>
                    )}
                  </div>
                </>
              ) : paymentMethod === "qris" && qrData ? (
                /* QRIS Payment Display */
                <div className="text-center space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Scan QR to Pay</p>
                    <div className="bg-white p-4 rounded-xl inline-block">
                      {qrData.qr_url ? (
                        <img src={qrData.qr_url} alt="QR Code" className="w-48 h-48" />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">QR Code</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">{formatIDR(selectedPack.price_idr)}</p>
                    <p className="text-sm text-gray-400">Waiting for payment...</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Polling for payment status...
                  </div>
                </div>
              ) : paymentMethod === "crypto" ? (
                /* Crypto Payment Display */
                <div className="text-center space-y-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-gray-400 mb-2">Send exactly</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedPack.price_eth} ETH</p>
                    <p className="text-xs text-gray-500 mt-1">
                      to the connected wallet address
                    </p>
                  </div>
                  {txHash && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Transaction</p>
                      <a
                        href={`https://${isTestnet ? "sepolia." : ""}basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300"
                      >
                        <code className="text-sm">
                          {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                        </code>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Waiting for confirmation...
                  </div>
                </div>
              ) : null}

              {/* Cancel Button */}
              {!paymentMethod && (
                <Button
                  onClick={() => setSelectedPack(null)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-6">
            <Zap className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-bold text-white mb-2">Instant Delivery</h3>
            <p className="text-sm text-gray-400">
              Credits are added to your account immediately after payment confirmation
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-6">
            <svg className="w-8 h-8 text-emerald-400 mb-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <h3 className="font-bold text-white mb-2">Multiple Payment Methods</h3>
            <p className="text-sm text-gray-400">
              Pay with QRIS (e-wallets) or crypto (Base chain ETH)
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-6">
            <Wallet className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-bold text-white mb-2">Secure & Transparent</h3>
            <p className="text-sm text-gray-400">
              All transactions are recorded on-chain for full transparency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
