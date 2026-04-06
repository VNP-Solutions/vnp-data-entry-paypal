"use client";

import { useEffect, useState } from "react";
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
import { apiClient } from "@/lib/client-api-call";
import { Loader2, Eye, EyeOff, CreditCard } from "lucide-react";
import type { QPChargeInstance } from "./types";

type SensitiveInstance = QPChargeInstance & {
  card_number?: string | null;
  cvv?: string | null;
};

interface QpRevealCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: QPChargeInstance | null;
}

export default function QpRevealCardModal({
  open,
  onOpenChange,
  row,
}: QpRevealCardModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sensitive, setSensitive] = useState<SensitiveInstance | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setPassword("");
      setPasswordError("");
      setShowPassword(false);
      setSensitive(null);
      setSubmitting(false);
    }
  }, [open]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row?._id) return;
    setPasswordError("");
    setSubmitting(true);
    try {
      await apiClient.verifyPassword(password);
      const res = await apiClient.getQPChargeInstanceById(row._id, true);
      const body = res as { status?: string; data?: SensitiveInstance };
      if (body.status !== "success" || !body.data) {
        throw new Error("Could not load card details");
      }
      setSensitive(body.data);
      setStep(2);
      setPassword("");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      const msg = apiErr.response?.data?.message;
      if (apiErr.response?.status === 401) {
        setPasswordError(msg || "Invalid password");
      } else {
        setPasswordError(
          msg || apiErr.message || "Verification failed. Try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatExpiry = (data: SensitiveInstance) => {
    const m = data.expiry_month;
    const y = data.expiry_year;
    if (m == null || y == null) return "N/A";
    const yy = y < 100 ? String(y).padStart(2, "0") : String(y % 100).padStart(2, "0");
    return `${String(m).padStart(2, "0")}/${yy}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Card details
          </DialogTitle>
          <DialogDescription>
            {row
              ? `Reservation ${row.reservation_id} · ****${row.card_last4 || "????"}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-sm p-3">
              Enter your account password to decrypt and display the full card
              number and CVV. Do not share this window.
            </div>
            <div className="space-y-2">
              <Label htmlFor="qp-reveal-password">Password</Label>
              <div className="relative">
                <Input
                  id="qp-reveal-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-1"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p className="text-sm text-red-600">{passwordError}</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !password.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && sensitive && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Card number
                </p>
                <p className="font-mono text-sm break-all mt-1 p-2 bg-gray-50 rounded border">
                  {sensitive.card_number || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  CVV
                </p>
                <p className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded border">
                  {sensitive.cvv ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Expiry (MM/YY)
                </p>
                <p className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded border">
                  {formatExpiry(sensitive)}
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
