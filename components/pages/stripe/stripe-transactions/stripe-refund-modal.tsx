"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/client-api-call";

interface StripeRefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId?: string;
  paymentIntentId?: string;
  currency?: string;
  defaultAmountCents?: number; // original charge amount in cents
  onSuccess?: () => void;
}

const StripeRefundModal = ({
  open,
  onOpenChange,
  documentId,
  paymentIntentId,
  currency = "USD",
  defaultAmountCents,
  onSuccess,
}: StripeRefundModalProps) => {
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefund = async () => {
    try {
      setIsSubmitting(true);
      const payload: { documentId?: string; paymentIntentId?: string; reason?: string } = {};
      if (documentId) payload.documentId = documentId;
      if (paymentIntentId) payload.paymentIntentId = paymentIntentId;
      if (reason.trim()) payload.reason = reason.trim();

      const res = await apiClient.createStripeRefund(payload);
      if (res.status === "success") {
        toast.success("Refund created successfully");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to create refund");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Refund failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md !w-full">
        <DialogHeader>
          <DialogTitle>Process Full Refund</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Reason (optional)</p>
            <div className="mt-2">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duplicate">duplicate</SelectItem>
                  <SelectItem value="fraudulent">fraudulent</SelectItem>
                  <SelectItem value="requested_by_customer">requested_by_customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700">
              {isSubmitting ? "Processing..." : "Confirm Full Refund"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StripeRefundModal;