// MARK: Import Dependencies
// Explanation: Imports the main PayPal payment component that handles all PayPal transaction management functionality.
import PaypalPaymentPageComponent from "@/components/pages/paypal/paypal-payment";

// MARK: PayPal Payment Page
// Explanation: Server-side page wrapper for the PayPal payment management section.
// This page renders the PaypalPaymentPageComponent which provides complete PayPal transaction management,
// including viewing transactions, processing payments, handling refunds, and bulk operations.
export default function PaypalPaymentPage() {
  return <PaypalPaymentPageComponent />;
}
