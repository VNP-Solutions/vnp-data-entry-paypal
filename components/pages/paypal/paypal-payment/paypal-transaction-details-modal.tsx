import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCheckInOutDate, formatLongString } from "@/lib/utils";
import { RowData, ViewDialogProps } from ".";
import { formatKeyName } from "../../stripe/stripe-transactions/stripe-transactions-tab/stripe-transaction-details-modal";

const PaypalTransactionDetailsModal = ({
  open,
  onOpenChange,
  rowData,
}: ViewDialogProps) => {
  if (!rowData) return null;

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

  // Flatten the rowData object to handle nested objects
  const flattenedData = flattenObject(rowData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entry Details</DialogTitle>
        </DialogHeader>
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
                <p className="text-sm font-medium text-gray-500 uppercase">
                  {formatKeyName(key)}
                </p>
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
