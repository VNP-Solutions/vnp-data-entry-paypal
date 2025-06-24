import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { X, User, Calendar, DollarSign, CreditCard } from "lucide-react"
import { apiClient } from "@/lib/client-api-call"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface FormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: string;
  currency: string;
  name: string;
  hotelName: string;
  otaId: string;
  reservationId: string;
  batch: string;
  confirmation: string;
  checkIn: string;
  checkOut: string;
  softDescriptor: string;
  cardFirst4: string;
  cardLast12: string;
  postingType: string;
  portfolio: string;
  documentId: string;
}

interface CheckoutFormProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  showCardDetails: boolean;
  onSuccess: () => void;
}

export function CheckoutForm({ open, onClose, formData: initialFormData, showCardDetails, onSuccess }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handlePayPalCheckout = async () => {
    try {
      setIsProcessing(true);
      const [month, year] = formData.expiryDate.split('/');
      const formattedExpiry = `${year}-${month.padStart(2, '0')}`;

      const response = await apiClient.processPayPalPayment({
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        descriptor: formData.softDescriptor,
        documentId: formData.documentId,
        cardNumber: `${formData.cardFirst4}${formData.cardLast12}`,
        cardExpiry: formattedExpiry,
        cardCvv: formData.cvv,
        cardholderName: formData.name
      });

      if (response.status === "success") {
        toast.success("Payment processed successfully!");
        onClose();
        onSuccess();
      } else {
        toast.error("Payment processing failed");
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-20 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">PayPal Checkout</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Complete your payment securely
            </p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Guest Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Guest Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="guestName" className="text-sm">Full Name</Label>
                  <Input
                    id="guestName"
                    value={formData.name}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="hotelName">Hotel</Label>
                  <Input
                    id="hotelName"
                    value={formData.hotelName}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="softDescriptor" className="text-sm">Soft Descriptor</Label>
                  <Input
                    id="softDescriptor"
                    value={formData.softDescriptor}
                    onChange={(e) => setFormData({ ...formData, softDescriptor: e.target.value })}
                    className="bg-white"
                    placeholder="Enter soft descriptor"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Booking Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Booking Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="checkIn" className="text-sm mb-1">Check In</Label>
                  <Input
                    id="checkIn"
                    value={formData.checkIn}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut" className="text-sm mb-1">Check Out</Label>
                  <Input
                    id="checkOut"
                    value={formData.checkOut}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Payment Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="amount" className="text-sm mb-1">Amount to Charge</Label>
                  <Input
                    id="amount"
                    value={`$${formData.amount}`}
                    readOnly
                    className="bg-gray-50 text-lg font-bold text-green-600"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-sm mb-1">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Card Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Card Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber" className="text-sm mb-1">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={
                      showCardDetails
                        ? `${formData.cardFirst4}${formData.cardLast12}`
                        : `${formData.cardFirst4} •••• •••• ••••`
                    }
                    readOnly
                    className="bg-gray-50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry" className="text-sm mb-1">Expiry</Label>
                    <Input
                      id="expiry"
                      value={formData.expiryDate}
                      readOnly
                      className="bg-gray-50 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-sm mb-1">CVV</Label>
                    <Input
                      id="cvv"
                      value={showCardDetails ? formData.cvv : "•••"}
                      readOnly
                      className="bg-gray-50 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-3">
              <Button
                onClick={handlePayPalCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>Pay with PayPal - ${formData.amount}</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Your payment is secured by PayPal&apos;s encryption
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-10"
          onClick={onClose}
        />
      )}
    </>
  );
} 