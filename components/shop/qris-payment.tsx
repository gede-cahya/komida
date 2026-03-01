"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Copy, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/payments";

interface QRISPaymentProps {
  amount: number;
  itemId?: number;
  creditAmount?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface QRISData {
  transaction_id: string;
  qr_string: string;
  qr_url: string;
  amount: number;
  expires_at: string;
}

export function QRISPayment({
  amount,
  itemId,
  creditAmount,
  onSuccess,
  onCancel,
}: QRISPaymentProps) {
  const [qrisData, setQrisData] = useState<QRISData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes in seconds
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initiatePayment();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      // Payment expired
      setError("Payment QR code has expired. Please try again.");
    }
  }, [timeLeft]);

  useEffect(() => {
    if (qrisData) {
      // Poll for payment status
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/payment/verify?transaction_id=${qrisData.transaction_id}&method=qris`,
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
  }, [qrisData, onSuccess]);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          item_id: itemId,
          credit_amount: creditAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to initiate QRIS payment");
      }

      const data = await res.json();
      setQrisData(data);

      // Calculate time left
      const expiresAt = new Date(data.expires_at).getTime();
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));
    } catch (err: any) {
      setError(err.message || "Failed to load QRIS payment");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyQRString = () => {
    if (qrisData?.qr_string) {
      navigator.clipboard.writeText(qrisData.qr_string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-400">Generating QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <XCircle className="w-16 h-16 text-red-400" />
        <p className="text-red-400 text-center">{error}</p>
        <Button onClick={initiatePayment} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">Scan QR to Pay</h3>
        <p className="text-sm text-gray-400">
          Use any QRIS-enabled e-wallet (GoPay, OVO, DANA, ShopeePay, etc.)
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <Clock className={`w-4 h-4 ${timeLeft < 60 ? "text-red-400" : "text-gray-400"}`} />
        <span className={timeLeft < 60 ? "text-red-400" : "text-gray-400"}>
          Expires in: {formatTime(timeLeft)}
        </span>
      </div>

      {/* QR Code */}
      {qrisData && (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-xl">
            {qrisData.qr_url ? (
              <img
                src={qrisData.qr_url}
                alt="QRIS QR Code"
                className="w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-sm text-gray-400">Amount to Pay</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatIDR(qrisData.amount)}
            </p>
          </div>

          {/* Copy QR String */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg w-full max-w-xs">
            <code className="flex-1 text-xs text-gray-400 truncate font-mono">
              {qrisData.qr_string?.substring(0, 30)}...
            </code>
            <button
              onClick={handleCopyQRString}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Copy QR string"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-white text-sm">How to pay:</h4>
        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
              1
            </span>
            Open your e-wallet app (GoPay, OVO, DANA, etc.)
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Select "Scan QR" or "Pay with QRIS"
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
              3
            </span>
            Scan the QR code above
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
              4
            </span>
            Confirm the payment amount
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
              5
            </span>
            Your credits/items will be added automatically
          </li>
        </ol>
      </div>

      {/* Cancel Button */}
      <Button
        onClick={onCancel}
        variant="outline"
        className="w-full"
        disabled={timeLeft <= 0}
      >
        Cancel Payment
      </Button>
    </div>
  );
}
