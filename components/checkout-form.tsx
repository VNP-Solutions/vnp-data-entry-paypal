import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  X,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { apiClient } from "@/lib/client-api-call";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface FormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: string;
  currency: string;
  name: string;
  hotelName: string;
  expediaId: string;
  reservationId: string;
  batch: string;
  confirmation: string;
  checkIn: string;
  checkOut: string;
  softDescriptor: string;
  // cardFirst4: string;
  // cardLast12: string;
  postingType: string;
  portfolio: string;
  documentId: string;
  zipCode: string;
  countryCode: string;
  otaDisplayName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
}

interface PaymentDetails {
  orderId: string;
  captureId: string;
  networkTransactionId: string;
  status: string;
  amount: string;
  currency: string;
  paypalFee: string;
  netAmount: string;
  cardLastDigits: string;
  cardBrand: string;
  cardType: string;
  cvvCode: string;
  createTime: string;
  updateTime: string;
  captureStatus: string;
  customId: string;
}

interface CheckoutFormProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  showCardDetails: boolean;
  onSuccess: () => void;
}

export function CheckoutForm({
  open,
  onClose,
  formData: initialFormData,
  showCardDetails,
  onSuccess,
}: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handlePayPalCheckout = async () => {
    try {
      setIsProcessing(true);
      let month = "";
      let year = "";

      if (formData.expiryDate.includes("/")) {
        // MM/YYYY format
        [month, year] = formData.expiryDate.split("/");
      } else if (formData.expiryDate.includes("-")) {
        // YYYY-MM format
        [year, month] = formData.expiryDate.split("-");
      }

      if (!month || !year) {
        toast.error(
          "Invalid expiry date format. Please use MM/YYYY or YYYY-MM."
        );
        setIsProcessing(false);
        return;
      }
      const formattedExpiry = `${year}-${month.padStart(2, "0")}`;
      // console.log(formattedExpiry);

      // return;

      const response = await apiClient.processPayPalPayment({
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        descriptor: formData.softDescriptor,
        documentId: formData.documentId,
        cardNumber: formData.cardNumber,
        cardExpiry: formattedExpiry,
        cardCvv: formData.cvv,
        cardholderName: formData.otaDisplayName,
        zipCode: formData.zipCode,
        countryCode: formData.countryCode,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
      });

      if (response.status === "success") {
        // Set payment details and show success modal
        if (response.data?.paymentDetails) {
          setPaymentDetails(response.data.paymentDetails);
          setShowSuccessModal(true);
        } else {
          toast.success("Payment processed successfully!");
          onClose();
          onSuccess();
        }
      } else if (response.status === "error") {
        // Handle error response from API
        const errorMessage =
          response.error || response.message || "Payment processing failed";
        toast.error(errorMessage);
      } else {
        toast.error("Payment processing failed");
      }
    } catch (error) {
      const apiError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMessage =
        apiError.response?.data?.error ||
        apiError.response?.data?.message ||
        "Payment processing failed";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setPaymentDetails(null);
    onClose();
    onSuccess();
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
                  <Label htmlFor="guestName" className="text-sm">
                    Card Holder Name
                  </Label>
                  <Input
                    id="guestName"
                    value={formData.otaDisplayName}
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
                  <Label htmlFor="softDescriptor" className="text-sm">
                    Soft Descriptor
                  </Label>
                  <Input
                    id="softDescriptor"
                    value={formData.softDescriptor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        softDescriptor: e.target.value,
                      })
                    }
                    className="bg-white"
                    placeholder="Enter soft descriptor"
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
                  <Label htmlFor="amount" className="text-sm mb-1">
                    Amount to Charge
                  </Label>
                  <Input
                    id="amount"
                    value={`$${formData.amount}`}
                    readOnly
                    className="bg-gray-50 text-lg font-bold text-green-600"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-sm mb-1">
                    Currency
                  </Label>
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
                <h3 className="font-semibold text-gray-900">
                  Card Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber" className="text-sm mb-1">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    value={
                      showCardDetails
                        ? `${formData.cardNumber}`
                        : `${formData.cardNumber}`
                    }
                    readOnly
                    className="bg-gray-50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry" className="text-sm mb-1">
                      Expiry
                    </Label>
                    <Input
                      id="expiry"
                      value={formData.expiryDate}
                      readOnly
                      className="bg-gray-50 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-sm mb-1">
                      CVV
                    </Label>
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

            <Separator />

            {/* Billing Address */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Billing Address</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="addressLine1" className="text-sm mb-1">
                    Address Line 1
                  </Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        addressLine1: e.target.value,
                      })
                    }
                    className="bg-white"
                    placeholder="Enter address line 1"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2" className="text-sm mb-1">
                    Address Line 2
                  </Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        addressLine2: e.target.value,
                      })
                    }
                    className="bg-white"
                    placeholder="Enter address line 2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city" className="text-sm mb-1">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          city: e.target.value,
                        })
                      }
                      className="bg-white"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm mb-1">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          state: e.target.value,
                        })
                      }
                      className="bg-white"
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="zipCode" className="text-sm mb-1">
                      Zip Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          zipCode: e.target.value,
                        })
                      }
                      className="bg-white font-mono"
                      placeholder="Enter zip code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="countryCode" className="text-sm mb-1">
                      Country Code
                    </Label>
                    <Input
                      id="countryCode"
                      value={formData.countryCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          countryCode: e.target.value,
                        })
                      }
                      className="bg-white font-mono"
                      placeholder="Enter country code"
                    />
                  </div>
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
                  <Label htmlFor="checkIn" className="text-sm mb-1">
                    Check In
                  </Label>
                  <Input
                    id="checkIn"
                    value={formData.checkIn}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut" className="text-sm mb-1">
                    Check Out
                  </Label>
                  <Input
                    id="checkOut"
                    value={formData.checkOut}
                    readOnly
                    className="bg-gray-50"
                  />
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
        <div className="fixed inset-0 bg-black/20 z-10" onClick={onClose} />
      )}

      {/* Payment Success Modal */}
      {showSuccessModal && paymentDetails && (
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
                Your payment has been processed successfully.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Order ID:</span>
                  <span className="text-sm font-mono text-gray-900">{paymentDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Capture ID:</span>
                  <span className="text-sm font-mono text-gray-900">{paymentDetails.captureId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Capture Status:</span>
                  <span className={`text-sm font-semibold ${
                    paymentDetails.captureStatus === "COMPLETED" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {paymentDetails.captureStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Custom ID:</span>
                  <span className="text-sm font-mono text-gray-900">{paymentDetails.customId}</span>
                </div>
              </div>
              
              <Button
                onClick={handleSuccessModalClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
