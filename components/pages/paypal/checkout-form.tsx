// MARK: Import Dependencies
// Explanation: Imports all required UI components, icons, API client, and utility functions.
// Provides complete checkout experience with form inputs, payment processing, and success feedback.
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
import { formatCheckInOutDate } from "@/lib/utils";

// MARK: TypeScript Interfaces
// Explanation: Defines data structures for form data, payment details, and component props.
// FormData: Complete payment and reservation information for processing
// PaymentDetails: PayPal response data after successful transaction
// CheckoutFormProps: Component props including callbacks and initial data
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
  // otaDisplayName: string;
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

// MARK: Checkout Form Component
// Explanation: Side-panel checkout form for processing PayPal payments with comprehensive payment details.
// Displays as sliding panel from right with all necessary payment, guest, billing, and booking information.
// Handles PayPal payment processing and displays success modal with transaction details on completion.
export function CheckoutForm({
  open,
  onClose,
  formData: initialFormData,
  showCardDetails,
  onSuccess,
}: CheckoutFormProps) {
  // MARK: State Management
  // Explanation: Manages form state, processing status, and payment success modal.
  // isProcessing: Prevents duplicate submissions during API call
  // formData: Mutable form data (editable fields like card number, billing address)
  // showSuccessModal: Controls visibility of payment success confirmation
  // paymentDetails: Stores PayPal transaction response for success display
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );

  // MARK: Form Data Sync Effect
  // Explanation: Updates local form state when initial form data changes from parent component
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // MARK: PayPal Checkout Handler
  // Explanation: Processes PayPal payment by formatting and submitting card and billing data to API.
  // Handles card expiry date parsing (supports MM/YYYY and YYYY-MM formats), validates input,
  // and displays success modal with transaction details or error toast on failure.
  // Manual Flow: User reviews details → Edits if needed → Click Pay → Processing → Success modal or error toast
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

      const response = await apiClient.processPayPalPayment({
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        descriptor: formData.softDescriptor,
        documentId: formData.documentId,
        cardNumber: formData.cardNumber,
        cardExpiry: formattedExpiry,
        cardCvv: formData.cvv,
        cardholderName: formData.name,
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
      } else if (
        response.status === "error" ||
        response.status === "declined"
      ) {
        const errorMessage =
          response.data.declineReason ||
          response.error ||
          response.message ||
          "Payment processing failed";
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

  // MARK: Success Modal Close Handler
  // Explanation: Closes success modal, clears payment details, closes checkout form, and triggers success callback
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setPaymentDetails(null);
    onClose();
    onSuccess();
  };

  // MARK: Component Render
  // Explanation: Renders sliding side panel with checkout form, overlay, and success modal.
  // Side panel slides in from right when open, includes all payment fields and processing.
  return (
    <>
      {/* MARK: Checkout Side Panel */}
      {/* Explanation: Fixed right-side panel with slide-in animation containing the complete checkout form.
      Width: 384px (w-96), Slides from right using transform translate, z-index 20 for proper layering */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-20 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* MARK: Panel Header */}
          {/* Explanation: Gradient blue header with title, description, and close button */}
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

          {/* MARK: Form Content Area */}
          {/* Explanation: Scrollable content area containing all form sections: Guest Info, Payment, Card, Billing, Booking */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* MARK: Guest Information Section */}
            {/* Explanation: Displays guest name, hotel, and editable soft descriptor for the payment.
            Card holder name and hotel are read-only; soft descriptor can be customized before payment. */}
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

            {/* MARK: Payment Information Section */}
            {/* Explanation: Displays amount to charge and currency (both read-only).
            Amount highlighted in green to emphasize the charge amount being processed. */}
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

            {/* MARK: Card Information Section */}
            {/* Explanation: Card payment details including number, expiry, and CVV.
            Card number is editable; expiry is read-only; CVV is masked unless showCardDetails is true. */}
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
                    value={formData.cardNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cardNumber: e.target.value,
                      })
                    }
                    className="bg-white font-mono"
                    placeholder="Enter card number"
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

            {/* MARK: Billing Address Section */}
            {/* Explanation: Complete billing address form with all editable fields.
            Includes: Address lines, City, State, Zip Code, Country Code - all required for PayPal payment processing. */}
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

            {/* MARK: Booking Details Section */}
            {/* Explanation: Displays hotel reservation check-in and check-out dates (both read-only).
            Dates are formatted using formatCheckInOutDate utility for consistent display. */}
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
                    value={formatCheckInOutDate(formData.checkIn)}
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
                    value={formatCheckInOutDate(formData.checkOut)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MARK: Footer Actions */}
          {/* Explanation: Contains payment and cancel buttons with processing states.
          Pay button shows spinner during processing and displays amount. Both disabled while processing.
          Includes security message for user confidence. */}
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-3">
              {/* Payment Button */}
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
              {/* Cancel Button */}
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

      {/* MARK: Background Overlay */}
      {/* Explanation: Semi-transparent black overlay behind the checkout panel.
      Clicking overlay closes the checkout form. Z-index 10 places it below panel (z-20). */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-10" onClick={onClose} />
      )}

      {/* MARK: Payment Success Modal */}
      {/* Explanation: Centered modal displaying payment confirmation with transaction details.
      Shows: Check icon, success message, Order ID, Capture ID, Status, Custom ID
      Z-index 50 ensures it appears above everything else. */}
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
                  <span className="text-sm font-medium text-gray-500">
                    Order ID:
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    {paymentDetails.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Capture ID:
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    {paymentDetails.captureId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Capture Status:
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      paymentDetails.captureStatus === "COMPLETED"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {paymentDetails.captureStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Custom ID:
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    {paymentDetails.customId}
                  </span>
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
