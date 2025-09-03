"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCheckInOutDate, formatLongString } from "@/lib/utils";

interface OtaBillingAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
}

interface OtaId {
  displayName?: string;
  billingAddress?: OtaBillingAddress;
}

interface AdminExcelDataItem {
  _id?: string;
  id?: string;
  userId?: string;
  uploadId: string;
  fileName: string;
  uploadStatus: string;
  rowNumber: number;
  "Expedia ID": string;
  Batch: string;
  "Posting Type"?: string;
  OTA?: string;
  Portfolio: string;
  "Hotel Name": string;
  "Reservation ID": string;
  "Hotel Confirmation Code": string;
  Name: string;
  "Check In": string;
  "Check Out": string;
  Curency: string;
  "Amount to charge": string;
  "Charge status": string;
  "Card Number": string;
  "Card Expire": string;
  "Card CVV": string;
  "Soft Descriptor": string;
  "VNP Work ID": string | null;
  Status: string | null;
  "Connected Account"?: string;
  // PayPal fields
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  paypalNetworkTransactionId?: string | null;
  paypalFee?: string | null;
  paypalNetAmount?: string | null;
  paypalCardBrand?: string | null;
  paypalCardType?: string | null;
  paypalAvsCode?: string | null;
  paypalCvvCode?: string | null;
  paypalCreateTime?: string | null;
  paypalUpdateTime?: string | null;
  paypalStatus?: string | null;
  paypalAmount?: string | null;
  paypalCurrency?: string | null;
  paypalCardLastDigits?: string | null;
  // Stripe fields
  stripeOrderId?: string | null;
  stripeCaptureId?: string | null;
  stripeNetworkTransactionId?: string | null;
  stripeFee?: string | null;
  stripeNetAmount?: string | null;
  stripeCardBrand?: string | null;
  stripeCardType?: string | null;
  stripeAvsCode?: string | null;
  stripeCvvCode?: string | null;
  stripeCreateTime?: string | null;
  stripeUpdateTime?: string | null;
  stripeStatus?: string | null;
  stripeAmount?: string | null;
  stripeCurrency?: string | null;
  stripeCardLastDigits?: string | null;
  stripeCaptureStatus?: string | null;
  stripeCustomId?: string | null;
  stripeRefundId?: string | null;
  stripeRefundStatus?: string | null;
  stripeRefundAmount?: string | null;
  stripeRefundCurrency?: string | null;
  stripeRefundGrossAmount?: string | null;
  stripeRefundFee?: string | null;
  stripeRefundNetAmount?: string | null;
  stripeTotalRefunded?: string | null;
  stripeRefundCreateTime?: string | null;
  stripeRefundUpdateTime?: string | null;
  stripeRefundInvoiceId?: string | null;
  stripeRefundCustomId?: string | null;
  stripeRefundNote?: string | null;
  otaId?: OtaId;
  createdAt: string;
}

interface StripeTransactionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: AdminExcelDataItem | null;
  title?: string;
}

export const formatKeyName = (key: string): string => {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  console.log(spaced);
  return spaced.toUpperCase();
};

export default function StripeTransactionDetailsModal({
  open,
  onOpenChange,
  rowData,
  title = "Stripe Transaction Details",
}: StripeTransactionDetailsModalProps) {
  if (!rowData) return null;

  // Helper function to check if a field should be displayed
  const shouldDisplayField = (key: string) => {
    const hiddenFields = [
      "_id",
      "userId",
      "uploadId",
      "rowNumber",
      "uploadStatus",
      "createdAt",
      "updatedAt",
      "__v",
      "otaId",
    ];
    return !hiddenFields.includes(key);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {Object.entries(rowData)
            .filter(([key]) => shouldDisplayField(key))
            .map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase">
                  {formatKeyName(key)}
                </p>
                <p className="text-sm break-words break-after-all">
                  {key === "fileName"
                    ? formatLongString(value as string, 25)
                    : key === "Check In"
                    ? formatCheckInOutDate(value as string)
                    : key === "Check Out"
                    ? formatCheckInOutDate(value as string)
                    : key === "stripeAutomaticPaymentMethods"
                    ? Object.keys(value as Record<string, unknown>)
                        .map(
                          (val) =>
                            val
                              ?.split("_")
                              .join(" ")
                              .slice(0, 1)
                              .toUpperCase() +
                            val?.split("_").join(" ").slice(1)
                        )
                        .join(", ")
                    : String(value || "N/A")}
                </p>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
