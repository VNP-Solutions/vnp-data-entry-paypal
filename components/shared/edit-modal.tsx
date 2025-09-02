"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdateRowData } from "@/lib/hooks/use-api";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: RowData | null;
  onSuccess: () => void;
  paymentGateway?: "stripe" | "paypal";
}

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

interface RowData {
  id: string;
  // Core fields
  "Expedia ID"?: string;
  Batch?: string;
  "Posting Type"?: string;
  Portfolio?: string;
  "Hotel Name": string;
  "Reservation ID": string;
  "Hotel Confirmation Code": string;
  Name: string;
  "Check In"?: string;
  "Check Out"?: string;
  Curency: string;
  "Amount to charge": string;
  "Charge status"?: string;
  // Stripe specific
  "Connected Account"?: string;
  // Card fields
  "Card Number": string;
  "Card Expire": string;
  "Card CVV": string;
  "Soft Descriptor": string;
  // Extra admin fields
  "VNP Work ID"?: string | null;
  Status?: string | null;
  // OTA data
  otaId?: OtaId;
  // Display/aux fields (not persisted by backend update but shown/edited here)
  otaDisplayName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
}

export function EditDialog({
  open,
  onOpenChange,
  rowData,
  onSuccess,
  paymentGateway,
}: EditDialogProps) {
  const [formData, setFormData] = useState<RowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateRowData = useUpdateRowData();
  useEffect(() => {
    if (rowData) {
      // Prefill with rowData and enrich with OTA billing fields when available
      const enriched: RowData = {
        ...rowData,
        otaDisplayName: rowData?.otaId?.displayName || "",
        addressLine1: rowData?.otaId?.billingAddress?.addressLine1 || "",
        addressLine2: rowData?.otaId?.billingAddress?.addressLine2 || "",
        city: rowData?.otaId?.billingAddress?.city || "",
        state: rowData?.otaId?.billingAddress?.state || "",
        zipCode: rowData?.otaId?.billingAddress?.zipCode || "",
        countryCode: rowData?.otaId?.billingAddress?.countryCode || "",
      };
      setFormData(enriched);
    }
  }, [rowData]);

  if (!formData) return null;

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await updateRowData.mutateAsync({
        documentId: formData.id,
        data: formData,
        paymentGateway,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl overflow-scroll max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            Make changes to the record information below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Core booking identifiers */}
          <div className="space-y-2">
            <Label>Expedia ID</Label>
            <Input
              value={formData["Expedia ID"] || ""}
              onChange={(e) =>
                setFormData({ ...formData, "Expedia ID": e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Connected Account</Label>
            <Input
              value={formData["Connected Account"] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  "Connected Account": e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Batch</Label>
            <Input
              value={formData["Batch"] || ""}
              onChange={(e) =>
                setFormData({ ...formData, Batch: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Hotel Name</Label>
            <Input
              value={formData["Hotel Name"]}
              onChange={(e) =>
                setFormData({ ...formData, "Hotel Name": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Reservation ID</Label>
            <Input
              value={formData["Reservation ID"]}
              onChange={(e) =>
                setFormData({ ...formData, "Reservation ID": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Hotel Confirmation Code</Label>
            <Input
              value={formData["Hotel Confirmation Code"]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  "Hotel Confirmation Code": e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Guest Name</Label>
            <Input
              value={formData["Name"]}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Posting Type</Label>
            <Input
              value={formData["Posting Type"] || ""}
              onChange={(e) =>
                setFormData({ ...formData, "Posting Type": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Portfolio</Label>
            <Input
              value={formData["Portfolio"] || ""}
              onChange={(e) =>
                setFormData({ ...formData, Portfolio: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Check In</Label>
            <Input
              value={formData["Check In"] || ""}
              onChange={(e) =>
                setFormData({ ...formData, "Check In": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Check Out</Label>
            <Input
              value={formData["Check Out"] || ""}
              onChange={(e) =>
                setFormData({ ...formData, "Check Out": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Amount to Charge</Label>
            <Input
              type="number"
              value={formData["Amount to charge"]}
              onChange={(e) =>
                setFormData({ ...formData, "Amount to charge": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Input
              value={formData["Curency"]}
              onChange={(e) =>
                setFormData({ ...formData, Curency: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Charge Status</Label>
            <Input
              value={formData["Charge status"] || ""}
              onChange={(e) =>
                setFormData({ ...formData, "Charge status": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>VNP Work ID</Label>
            <Input
              value={(formData["VNP Work ID"] as string) || ""}
              onChange={(e) =>
                setFormData({ ...formData, "VNP Work ID": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Input
              value={(formData["Status"] as string) || ""}
              onChange={(e) =>
                setFormData({ ...formData, Status: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Card Number</Label>
            <Input
              value={formData["Card Number"]}
              onChange={(e) =>
                setFormData({ ...formData, "Card Number": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Card Expiry</Label>
            <Input
              value={formData["Card Expire"]}
              onChange={(e) =>
                setFormData({ ...formData, "Card Expire": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Card CVV</Label>
            <Input
              value={formData["Card CVV"]}
              onChange={(e) =>
                setFormData({ ...formData, "Card CVV": e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Soft Descriptor</Label>
            <Input
              value={formData["Soft Descriptor"]}
              onChange={(e) =>
                setFormData({ ...formData, "Soft Descriptor": e.target.value })
              }
            />
          </div>

          {/* Checkout form extra fields */}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
