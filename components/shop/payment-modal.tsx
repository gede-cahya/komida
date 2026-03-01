"use client";

import React, { useState } from "react";
import { X, QrCode, Wallet, Coins, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopItem, PaymentMethod } from "@/types/payments";
import { formatIDR, formatCredits } from "@/lib/payments";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShopItem | null;
  userCredits?: number;
  onConfirmPayment: (method: PaymentMethod | "credits") => Promise<void>;
}

export function PaymentModal({
  isOpen,
  onClose,
  item,
  userCredits = 0,
  onConfirmPayment,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "credits" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const isCreditPack = item.item_type === "credit_pack";
  const canAffordWithCredits = userCredits >= item.price_credits;

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onConfirmPayment(selectedMethod);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setSelectedMethod(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {selectedMethod ? "Payment" : "Select Payment Method"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!selectedMethod ? (
            <>
              {/* Item Summary */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    {isCreditPack ? (
                      <Coins className="w-6 h-6 text-amber-400" />
                    ) : (
                      <Zap className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">
                      {isCreditPack ? "Credit Pack" : "Avatar Decoration"}
                    </p>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  {!isCreditPack && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Price in Credits</span>
                      <span className="font-bold text-purple-400">
                        {formatCredits(item.price_credits)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price in IDR</span>
                    <span className="font-bold text-emerald-400">
                      {formatIDR(item.price_qris)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price in ETH (Base)</span>
                    <span className="font-bold text-blue-400">
                      {(parseInt(item.price_crypto) / 1e18).toFixed(4)} ETH
                    </span>
                  </div>
                </div>

                {userCredits > 0 && (
                  <div className="text-xs text-gray-500">
                    Your balance:{" "}
                    <span className="text-purple-400 font-bold">
                      {formatCredits(userCredits)} credits
                    </span>
                    {canAffordWithCredits && !isCreditPack && (
                      <span className="text-emerald-400 ml-2">✓ Sufficient</span>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-400">Choose Payment Method</p>

                {/* QRIS Option */}
                <button
                  onClick={() => handleMethodSelect("qris")}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                      <QrCode className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-white">QRIS</h4>
                      <p className="text-sm text-gray-400">
                        Scan & pay with GoPay, OVO, DANA, ShopeePay, etc.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{formatIDR(item.price_qris)}</p>
                      <p className="text-xs text-gray-500">Instant</p>
                    </div>
                  </div>
                </button>

                {/* Crypto Option */}
                <button
                  onClick={() => handleMethodSelect("crypto")}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Wallet className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-white">Crypto (Base Chain)</h4>
                      <p className="text-sm text-gray-400">
                        Pay with ETH on Base L2
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-400">
                        {(parseInt(item.price_crypto) / 1e18).toFixed(4)} ETH
                      </p>
                      <p className="text-xs text-gray-500">~1 min</p>
                    </div>
                  </div>
                </button>

                {/* Use Credits Option (only for non-credit-pack items) */}
                {!isCreditPack && canAffordWithCredits && (
                  <button
                    onClick={() => onConfirmPayment("credits")}
                    className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/30 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-white">Use Credits</h4>
                        <p className="text-sm text-gray-400">
                          Pay with your existing credits
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-400">
                          {formatCredits(item.price_credits)} credits
                        </p>
                        <p className="text-xs text-emerald-400">Instant</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Payment Method Selected */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 rotate-45 text-gray-400" />
                  </button>
                  <div className="flex items-center gap-3">
                    {selectedMethod === "qris" ? (
                      <QrCode className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Wallet className="w-5 h-5 text-blue-400" />
                    )}
                    <span className="font-bold text-white">
                      {selectedMethod === "qris" ? "QRIS Payment" : "Crypto Payment (Base)"}
                    </span>
                  </div>
                </div>

                {/* Payment Instructions */}
                {selectedMethod === "qris" ? (
                  <div className="text-center space-y-4">
                    <p className="text-gray-400">
                      You will be redirected to scan the QR code
                    </p>
                    <p className="text-sm text-gray-500">
                      Amount: <span className="font-bold text-emerald-400">{formatIDR(item.price_qris)}</span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-gray-400">
                      Connect your wallet to pay with ETH on Base chain
                    </p>
                    <p className="text-sm text-gray-500">
                      Amount: <span className="font-bold text-blue-400">
                        {(parseInt(item.price_crypto) / 1e18).toFixed(4)} ETH
                      </span>
                    </p>
                  </div>
                )}

                {/* Confirm Button */}
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                    ${selectedMethod === "qris"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-blue-600 hover:bg-blue-500"
                    }
                  `}
                >
                  {isProcessing ? "Processing..." : "Confirm Payment"}
                </Button>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
