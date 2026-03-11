"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QPChargeInstance, ViewDialogProps } from "./types";

export default function QpTransactionDetailsModal({
  open,
  onOpenChange,
  rowData,
}: ViewDialogProps & { rowData: QPChargeInstance | null }) {
  if (!rowData) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const displayFields = [
    { label: "Hotel ID", value: rowData.hotel_id },
    { label: "Reservation ID", value: rowData.reservation_id },
    { label: "User ID", value: rowData.user_id },
    {
      label: "Amount",
      value: `${rowData.currency} ${rowData.amount_numeric?.toFixed(2)}`,
    },
    { label: "Card Last 4", value: rowData.card_last4 },
    { label: "Status", value: rowData.status },
    { label: "OTA", value: rowData.ota },
    { label: "VNP Work ID", value: rowData.vnp_work_id },
    { label: "Portfolio", value: rowData.portfolio },
    { label: "File Name", value: rowData.parent_file_name },
    { label: "Row Number", value: rowData.row_number },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information for this QP charge instance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayFields.map((field) => (
              <div key={field.label} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {field.label}
                </p>
                <p className="text-sm text-gray-900 font-mono break-words mt-1">
                  {formatValue(field.value)}
                </p>
              </div>
            ))}
          </div>

          {rowData.billing_address && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Billing Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Address 1
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {rowData.billing_address.address_1 || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Address 2
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {rowData.billing_address.address_2 || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    City
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {rowData.billing_address.city || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    State
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {rowData.billing_address.state || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Postal Code
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {rowData.billing_address.postal_code || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Country Code
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {rowData.billing_address.country_code || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(rowData.status === "SUCCESS" || rowData.status === "DECLINED") && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Response from payment processor
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                Payload returned after charge (status: {rowData.status})
              </p>
              {rowData.last_response_payload != null ? (
                <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(rowData.last_response_payload, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No response payload recorded for this charge.
                </p>
              )}
            </div>
          )}

          <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
            <p>Created: {new Date(rowData.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(rowData.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
