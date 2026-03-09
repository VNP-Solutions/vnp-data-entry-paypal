"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/client-api-call";
import { toast } from "sonner";
import { QPChargeInstance } from "./types";

interface QpEditInstanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: QPChargeInstance | null;
  onSuccess: () => void;
}

export default function QpEditInstanceModal({
  open,
  onOpenChange,
  rowData,
  onSuccess,
}: QpEditInstanceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");

  useEffect(() => {
    if (rowData) {
      setAmount(String(rowData.amount_numeric ?? ""));
      setCurrency(rowData.currency ?? "USD");
      setAddress1(rowData.billing_address?.address_1 ?? "");
      setAddress2(rowData.billing_address?.address_2 ?? "");
      setCity(rowData.billing_address?.city ?? "");
      setState(rowData.billing_address?.state ?? "");
      setPostalCode(rowData.billing_address?.postal_code ?? "");
      setCountryCode(rowData.billing_address?.country_code ?? "US");
      setExpiryMonth(rowData.expiry_month ? String(rowData.expiry_month) : "");
      setExpiryYear(rowData.expiry_year ? String(rowData.expiry_year) : "");
    }
  }, [rowData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rowData) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      toast.error("Currency must be a 3-letter ISO code (e.g. USD)");
      return;
    }
    if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) {
      toast.error("Country code must be 2 letters (e.g. US)");
      return;
    }

    const payload: Record<string, unknown> = {
      amount_numeric: amountNum,
      currency: currency.toUpperCase(),
      billing_address: {
        address_1: address1,
        address_2: address2,
        city,
        state,
        postal_code: postalCode,
        country_code: countryCode.toUpperCase() || "US",
      },
    };

    const month = expiryMonth ? parseInt(expiryMonth, 10) : undefined;
    const year = expiryYear ? parseInt(expiryYear, 10) : undefined;
    if (month !== undefined) {
      if (month < 1 || month > 12) {
        toast.error("Expiry month must be 1–12");
        return;
      }
      payload.expiry_month = month;
    }
    if (year !== undefined) {
      if (year < new Date().getFullYear()) {
        toast.error("Expiry year must be current year or later");
        return;
      }
      payload.expiry_year = year;
    }

    try {
      setIsSubmitting(true);
      await apiClient.updateQPChargeInstance(rowData._id, payload);
      toast.success("Instance updated");
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to update";
      toast.error(String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rowData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit charge instance</DialogTitle>
          <DialogDescription>
            Update amount, billing address, or expiry. Reservation:{" "}
            {rowData.reservation_id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="USD"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                maxLength={3}
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Expiry month (1–12)</Label>
              <Input
                id="expiryMonth"
                type="number"
                min={1}
                max={12}
                placeholder="MM"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Expiry year</Label>
              <Input
                id="expiryYear"
                type="number"
                min={new Date().getFullYear()}
                placeholder="YYYY"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1">Address line 1</Label>
            <Input
              id="address1"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address2">Address line 2</Label>
            <Input
              id="address2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryCode">Country (2-letter)</Label>
              <Input
                id="countryCode"
                placeholder="US"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                maxLength={2}
                className="uppercase"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
