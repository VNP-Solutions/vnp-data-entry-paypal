"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StripeCheckoutForm from "./stripe-checkout-form";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface AdminExcelDataItem {
  _id?: string;
  id?: string;
  "Connected Account"?: string;
  "Amount to charge": string;
  Curency: string;
  "Hotel Name": string;
  "Reservation ID": string;
  Name: string;
}

interface StripePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: AdminExcelDataItem | null;
  onSuccess: (paymentDetails: any) => void;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  open,
  onOpenChange,
  rowData,
  onSuccess,
}) => {
  const [error, setError] = useState<string>("");

  if (!rowData) return null;

  // Convert amount to cents
  const rawAmountStr = String(rowData["Amount to charge"] || "0")
    .replace(/,/g, "")
    .trim();
  const isNegative = rawAmountStr.startsWith("-");
  const unsigned = isNegative ? rawAmountStr.slice(1) : rawAmountStr;
  const parts = unsigned.split(".");
  const intPart = parts[0] || "0";
  const fracPart = (parts[1] || "").padEnd(2, "0").slice(0, 2);
  const centsUnsigned = Number(intPart) * 100 + Number(fracPart || "0");
  const amountInCents = isNegative ? -centsUnsigned : centsUnsigned;

  const currency = rowData["Curency"] || "USD";
  const accountId = rowData["Connected Account"];
  const documentId = rowData.id || rowData._id;

  if (!accountId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Error</DialogTitle>
            <DialogDescription>
              No connected account found for this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center text-red-600 py-4">
            Please ensure a Stripe connected account is set up for this
            transaction.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSuccess = (paymentDetails: any) => {
    onSuccess(paymentDetails);
    onOpenChange(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Process Stripe Payment</DialogTitle>
          <DialogDescription>
            Process payment for {rowData["Hotel Name"]} - Reservation{" "}
            {rowData["Reservation ID"]}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Hotel:</div>
              <div>{rowData["Hotel Name"]}</div>
              <div className="font-medium">Guest:</div>
              <div>{rowData["Name"]}</div>
              <div className="font-medium">Reservation:</div>
              <div>{rowData["Reservation ID"]}</div>
              <div className="font-medium">Amount:</div>
              <div className="font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currency,
                }).format(amountInCents / 100)}
              </div>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <StripeCheckoutForm
              amount={amountInCents}
              currency={currency}
              accountId={accountId}
              documentId={documentId as string}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentModal;
