"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCheck, Link } from "lucide-react";
import { apiClient } from "@/lib/client-api-call";

const StripeSettingsTab = () => {
  const [vnpRatio, setVnpRatio] = React.useState<number>(15);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const connectedRatio = 100 - vnpRatio;

  const handleVnpChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = Number.isNaN(Number(e.target.value))
      ? 0
      : Number(e.target.value);
    const clamped = Math.max(0, Math.min(100, Math.round(next)));
    setVnpRatio(clamped);
  };

  React.useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getStripeSettings();
        const next = Number(res?.data?.vnpRatio ?? 15);
        const clamped = Math.max(0, Math.min(100, Math.round(next)));
        setVnpRatio(clamped);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load Stripe settings");
      }
    })();
  }, []);

  return (
    <Card className="w-full p-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Payout Percentage</h2>
        <p className="text-sm text-muted-foreground">
          VNP Amount vs Connected Account must total 100%.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="vnpRatioSlider">VNP Amount Percentage (%)</Label>
        <div className="flex items-center gap-3">
          <input
            id="vnpRatioSlider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={vnpRatio}
            onChange={(e) => {
              const next = Number(e.target.value);
              const clamped = Math.max(0, Math.min(100, Math.round(next)));
              setVnpRatio(clamped);
            }}
            className="w-full cursor-pointer"
          />
          <div className="w-24 text-right text-sm">
            {vnpRatio}% / {connectedRatio}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="vnpRatio">VNP Amount Percentage (%)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="vnpRatio"
              type="number"
              min={0}
              max={100}
              value={vnpRatio}
              onChange={handleVnpChange}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">Default 15%.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="connectedRatio">
            Connected Account Percentage (%)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="connectedRatio"
              type="number"
              min={0}
              max={100}
              value={connectedRatio}
              onChange={(e) => {
                const next = Number.isNaN(Number(e.target.value))
                  ? 0
                  : Number(e.target.value);
                const clamped = Math.max(0, Math.min(100, Math.round(next)));
                setVnpRatio(100 - clamped);
              }}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">Default 85%.</p>
        </div>
      </div>

      <div className="rounded-md bg-muted/40 border border-border px-3 py-2 text-sm text-muted-foreground">
        Note: Stripe fee will be deducted from connected account.
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={async () => {
            try {
              setIsSaving(true);
              const res = await apiClient.updateStripeSettings(vnpRatio);
              const saved = Number(res?.data?.vnpRatio ?? vnpRatio);
              setVnpRatio(saved);
              toast.success(
                `Updated payout ratio: VNP ${saved}% / Connected ${100 - saved}%`
              );
            } catch (error: any) {
              toast.error(error?.response?.data?.message || "Failed to save Stripe settings");
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save
          <CheckCheck className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default StripeSettingsTab;
