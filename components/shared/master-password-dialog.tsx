"use client";

import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MasterPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionButtonLabel?: string;
  isDestructive?: boolean;
  onSubmit: (password: string) => Promise<void>;
}

export function MasterPasswordDialog({
  open,
  onOpenChange,
  title,
  description,
  actionButtonLabel = "Confirm",
  isDestructive = false,
  onSubmit,
}: MasterPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(password);
      setPassword(""); // Clear password on success
      onOpenChange(false);
    } catch (error) {
       // Handled upstream commonly (Toast error), so we just gracefully stop spinning.
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset password field if modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPassword("");
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className={`h-5 w-5 ${isDestructive ? 'text-red-500' : 'text-blue-500'}`} />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isDestructive ? "destructive" : "default"}
              className={!isDestructive ? "bg-blue-600 hover:bg-blue-700" : ""}
              disabled={isSubmitting || !password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                actionButtonLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
