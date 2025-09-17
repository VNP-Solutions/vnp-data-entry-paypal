"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { apiClient } from "@/lib/client-api-call";
import { toast } from "sonner";

interface StripeCheckoutFormProps {
  amount: number;
  currency: string;
  accountId: string;
  documentId: string;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  amount,
  currency,
  accountId,
  documentId,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        backgroundColor: "#ffffff",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: false,
  };

  const formatCurrency = (cents: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(cents / 100);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe has not loaded properly. Please refresh and try again.");
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found. Please refresh and try again.");
      setProcessing(false);
      return;
    }

    try {
      // Create payment method using Stripe Elements
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (pmError) {
        setError(
          pmError.message || "An error occurred while processing your card."
        );
        setProcessing(false);
        return;
      }

      if (!paymentMethod) {
        setError("Failed to create payment method. Please try again.");
        setProcessing(false);
        return;
      }

      // Send the secure payment method ID to backend
      const response = await apiClient.createStripePayment({
        accountId,
        totalAmount: amount,
        currency: currency.toLowerCase(),
        paymentMethodId: paymentMethod.id, // This is the secure token
        documentId,
      });

      const payment = response?.data?.payment || response?.payment;

      if (payment) {
        toast.success("Payment processed successfully!");
        onSuccess({
          intentId: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency?.toUpperCase() || currency.toUpperCase(),
          applicationFee: payment.application_fee_amount,
          destination: payment.transfer_data?.destination,
        });
      } else {
        throw new Error("Invalid payment response from server");
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Payment failed. Please try again.";

      setError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // const cardElement = elements?.getElement(CardElement);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Enter your card details to process payment of{" "}
          {formatCurrency(amount, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label
              htmlFor="card-element"
              className="text-sm font-medium text-gray-700"
            >
              Card Details
            </label>
            <div className="p-3 border border-gray-200 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <CardElement
                id="card-element"
                options={cardElementOptions}
                onChange={(event) => {
                  if (event.error) {
                    setError(event.error.message);
                  } else {
                    setError(null);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <Lock className="h-4 w-4" />
            <span>Your payment information is encrypted and secure</span>
          </div>

          <Button
            type="submit"
            disabled={!stripe || processing}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>Pay {formatCurrency(amount, currency)}</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripeCheckoutForm;
