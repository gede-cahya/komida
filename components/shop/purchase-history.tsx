"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ShoppingBag, ExternalLink, CheckCircle, XCircle, Clock, Coins, Zap, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types/payments";
import { formatIDR, formatCredits, getTransactionHistory } from "@/lib/payments";
import { getExplorerTxUrl } from "@/lib/komida-credits";

interface PurchaseHistoryProps {
  className?: string;
}

export function PurchaseHistory({ className }: PurchaseHistoryProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const history = await getTransactionHistory();
      setTransactions(history);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "failed":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "qris":
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case "base_chain":
        return <Coins className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "credit_purchase":
        return <Coins className="w-4 h-4 text-amber-400" />;
      case "item_purchase":
        return <Zap className="w-4 h-4 text-purple-400" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Please log in to view your transaction history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
          <p className="text-sm text-gray-400">Total Transactions</p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">
            {transactions.filter((tx) => tx.status === "completed").length}
          </p>
          <p className="text-sm text-gray-400">Completed</p>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-400">
            {transactions.filter((tx) => tx.status === "pending").length}
          </p>
          <p className="text-sm text-gray-400">Pending</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-400">
            {transactions.filter((tx) => tx.status === "failed").length}
          </p>
          <p className="text-sm text-gray-400">Failed</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === "all"
              ? "bg-purple-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === "completed"
              ? "bg-emerald-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === "pending"
              ? "bg-yellow-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("failed")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === "failed"
              ? "bg-red-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          Failed
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className="p-3 bg-white/5 rounded-xl">
                    {getTypeIcon(tx.transaction_type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">
                        {tx.item_name || tx.transaction_type.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        {getPaymentMethodIcon(tx.payment_method)}
                        {tx.payment_method === "qris" ? "QRIS" : "Base Chain"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(tx.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">
                        {tx.transaction_type === "credit_purchase"
                          ? `+${formatCredits(tx.amount)} Credits`
                          : tx.transaction_type === "item_purchase"
                          ? `-${formatCredits(tx.amount)} Credits`
                          : `${tx.amount} ${tx.currency}`}
                      </span>
                      {tx.currency === "IDR" && (
                        <span className="text-sm text-gray-500">
                          {formatIDR(tx.amount)}
                        </span>
                      )}
                    </div>

                    {/* Transaction Hash */}
                    {tx.tx_hash && (
                      <a
                        href={getExplorerTxUrl(tx.tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
                      >
                        View on Explorer
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(tx.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
