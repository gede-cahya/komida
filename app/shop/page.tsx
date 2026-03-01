"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ShopGrid } from "@/components/shop/shop-grid";
import { PaymentModal } from "@/components/shop/payment-modal";
import { QRISPayment } from "@/components/shop/qris-payment";
import { CryptoPayment } from "@/components/shop/crypto-payment";
import { Coins, Zap, ShoppingBag, Wallet, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ShopItem, PaymentMethod } from "@/types/payments";
import { DEFAULT_SHOP_ITEMS, formatCredits, getUserCredits, purchaseItemWithCredits } from "@/lib/payments";

type PaymentStep = "select" | "qris" | "crypto";

export default function ShopPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [userCredits, setUserCredits] = useState<number>(0);
  const [ownedItemIds, setOwnedItemIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<"all" | "decorations" | "badges" | "credit_packs">("all");
  
  // Payment state
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("select");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserCredits();
      loadUserInventory();
    }
  }, [user]);

  const loadUserCredits = async () => {
    try {
      const credits = await getUserCredits();
      if (credits) {
        setUserCredits(credits.balance);
      }
    } catch (error) {
      console.error("Failed to load credits:", error);
    }
  };

  const loadUserInventory = async () => {
    try {
      const res = await fetch("/api/user/inventory", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const ownedIds = data.inventory
          ?.filter((item: any) => item.item_type === "decoration" || item.item_type === "badge")
          .map((item: any) => item.item_id);
        setOwnedItemIds(ownedIds || []);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
    }
  };

  const handlePurchase = (item: ShopItem) => {
    setSelectedItem(item);
    setShowPaymentModal(true);
  };

  const handleTopUp = () => {
    // Navigate to wallet top-up page or open top-up modal
    window.location.href = "/wallet";
  };

  const handleConfirmPayment = async (method: PaymentMethod | "credits") => {
    if (!selectedItem) return;

    if (method === "credits") {
      // Purchase with credits
      try {
        await purchaseItemWithCredits(selectedItem.id);
        setShowPaymentModal(false);
        setSelectedItem(null);
        
        // Refresh data
        loadUserCredits();
        loadUserInventory();
        
        // Show success message with item name
        showToast(
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-600">Pembelian Berhasil!</p>
              <p className="text-sm text-gray-600">{selectedItem.name} telah ditambahkan ke inventori</p>
            </div>
          </div>,
          "success"
        );
      } catch (error: any) {
        showToast(
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-red-600">Pembelian Gagal</p>
              <p className="text-sm text-gray-600">{error.message || "Terjadi kesalahan"}</p>
            </div>
          </div>,
          "error"
        );
      }
    } else if (method === "qris") {
      setPaymentStep("qris");
    } else if (method === "crypto") {
      setPaymentStep("crypto");
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedItem(null);
    setPaymentStep("select");
    
    // Refresh data
    loadUserCredits();
    loadUserInventory();
    
    // Show success message
    showToast(
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-green-600">Pembayaran Berhasil!</p>
          <p className="text-sm text-gray-600">Kredit/item telah ditambahkan ke akun kamu</p>
        </div>
      </div>,
      "success"
    );
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedItem(null);
    setPaymentStep("select");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111] py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <ShoppingBag className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Komida Shop
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Purchase avatar decorations, badges, and credit packs to customize your profile
          </p>
        </div>

        {/* User Credits Banner */}
        {user && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Coins className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Your Credits</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {formatCredits(userCredits)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => window.location.href = "/wallet"}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Top Up
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/inventory"}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  My Inventory
                </Button>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <p className="text-yellow-400">
              Please{" "}
              <a href="/login" className="underline font-bold hover:text-yellow-300">
                log in
              </a>{" "}
              to purchase items and view your credits
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("credit_packs")}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              filter === "credit_packs"
                ? "bg-amber-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Coins className="w-4 h-4" />
            Credit Packs
          </button>
          <button
            onClick={() => setFilter("decorations")}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              filter === "decorations"
                ? "bg-pink-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Zap className="w-4 h-4" />
            Decorations
          </button>
        </div>

        {/* Shop Grid */}
        <ShopGrid
          items={DEFAULT_SHOP_ITEMS}
          userCredits={userCredits}
          ownedItemIds={ownedItemIds}
          onPurchase={handlePurchase}
          onTopUp={handleTopUp}
          filter={filter}
          userAvatar={user?.avatar_url}
        />

        {/* Payment Modal */}
        {showPaymentModal && selectedItem && paymentStep === "select" && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handlePaymentCancel}
            item={selectedItem}
            userCredits={userCredits}
            onConfirmPayment={handleConfirmPayment}
          />
        )}

        {/* QRIS Payment Modal */}
        {showPaymentModal && selectedItem && paymentStep === "qris" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-6">
              <button
                onClick={handlePaymentCancel}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <QRISPayment
                amount={selectedItem.price_qris}
                itemId={selectedItem.id}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        )}

        {/* Crypto Payment Modal */}
        {showPaymentModal && selectedItem && paymentStep === "crypto" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-6">
              <button
                onClick={handlePaymentCancel}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <CryptoPayment
                amountWei={selectedItem.price_crypto}
                itemId={selectedItem.id}
                creditAmount={selectedItem.item_type === "credit_pack" ? selectedItem.price_credits : undefined}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
