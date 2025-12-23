// MARK: Import Dependencies
// Explanation: Imports dialog components, utility functions, and type definitions.
// Uses custom formatters for displaying dates, long strings, and key names in user-friendly format.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCheckInOutDate, formatLongString } from "@/lib/utils";
import { RowData, ViewDialogProps } from ".";
import { formatKeyName } from "../../stripe/stripe-transactions/stripe-transactions-tab/stripe-transaction-details-modal";

// MARK: PayPal Transaction Details Modal Component
// Explanation: Modal dialog displaying comprehensive details of a PayPal transaction.
// Flattens nested objects and displays all transaction fields in a 3-column grid layout.
// Filters out internal fields (id, createdAt, uploadId, etc.) and formats data for user-friendly display.
const PaypalTransactionDetailsModal = ({
  open,
  onOpenChange,
  rowData,
}: ViewDialogProps) => {
  if (!rowData) return null;

  // MARK: Object Flattening Helper
  // Explanation: Recursively flattens nested objects into a flat array of key-value pairs.
  // Handles null/undefined values with "N/A", arrays by joining, and nested objects by recursion.
  // Used to display complex transaction data structure in simple grid layout.
  const flattenObject = (
    obj: Record<string, unknown> | RowData
  ): Array<{ key: string; value: unknown }> => {
    const result: Array<{ key: string; value: unknown }> = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined || value === "") {
        result.push({ key, value: "N/A" });
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively flatten nested objects without adding prefixes
        result.push(...flattenObject(value as Record<string, unknown>));
      } else if (Array.isArray(value)) {
        // Handle arrays by joining elements
        result.push({ key, value: value.join(", ") });
      } else {
        result.push({ key, value });
      }
    }

    return result;
  };

  // MARK: Data Flattening
  // Explanation: Flattens the nested rowData object into a simple key-value array for easy grid rendering
  const flattenedData = flattenObject(rowData);

  // MARK: Component Render
  // Explanation: Renders modal dialog with transaction details in a responsive 3-column grid.
  // Filters out internal system fields and formats each field appropriately based on its type.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entry Details</DialogTitle>
        </DialogHeader>
        {/* MARK: Transaction Details Grid */}
        {/* Explanation: Displays all transaction fields in 3-column grid layout.
        Filters out internal fields (id, createdAt, uploadId, rowNumber, uploadStatus) for cleaner display.
        Applies special formatting: green for completed status, red for failed, truncates long strings, formats dates. */}
        <div className="grid grid-cols-3 gap-4 py-4">
          {flattenedData
            .filter(
              ({ key }) =>
                key !== "id" &&
                key !== "createdAt" &&
                key !== "uploadId" &&
                key !== "rowNumber" &&
                key !== "uploadStatus"
            )
            .map(({ key, value }) => (
              <div key={key} className="space-y-1">
                {/* Field Label - Formatted and Uppercase */}
                <p className="text-sm font-medium text-gray-500 uppercase">
                  {formatKeyName(key)}
                </p>
                {/* Field Value - Conditionally Formatted */}
                <p
                  className={`text-sm ${
                    key === "paypalCaptureStatus"
                      ? value === "COMPLETED"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                      : ""
                  }`}
                >
                  {key === "fileName"
                    ? formatLongString(value as string, 25)
                    : key === "Check In"
                    ? formatCheckInOutDate(value as string)
                    : key === "Check Out"
                    ? formatCheckInOutDate(value as string)
                    : String(value || "N/A")}
                </p>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaypalTransactionDetailsModal;
