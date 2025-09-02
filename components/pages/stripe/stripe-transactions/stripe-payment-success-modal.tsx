"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export interface StripePaymentDetails {
  intentId: string;
  status: string;
  amount: number;
  currency: string;
  applicationFee?: number;
  destination?: string;
}

interface StripePaymentSuccessModalProps {
  open: boolean;
  details: StripePaymentDetails | null;
  onClose: () => void;
}

export const StripePaymentSuccessModal = ({ open, details, onClose }: StripePaymentSuccessModalProps) => {
  if (!open || !details) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Your Stripe payment has been processed successfully.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Payment Intent ID:</span>
              <span className="text-sm font-mono text-gray-900">{details.intentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span
                className={`text-sm font-semibold ${
                  details.status === "succeeded" ? "text-green-600" : "text-blue-600"
                }`}
              >
                {details.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Amount:</span>
              <span className="text-sm font-mono text-gray-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: details.currency,
                }).format((details.amount || 0) / 100)}
              </span>
            </div>
            {typeof details.applicationFee === "number" && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Application Fee:</span>
                <span className="text-sm font-mono text-gray-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: details.currency,
                  }).format((details.applicationFee || 0) / 100)}
                </span>
              </div>
            )}
            {details.destination && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Destination Account:</span>
                <span className="text-sm font-mono text-gray-900">{details.destination}</span>
              </div>
            )}
          </div>

          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};


