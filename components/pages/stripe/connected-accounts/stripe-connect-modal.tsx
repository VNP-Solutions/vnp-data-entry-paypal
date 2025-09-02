"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/client-api-call"
import { toast } from "sonner"
import { Loader2, CreditCard } from "lucide-react"

interface StripeConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function StripeConnectModal({ open, onOpenChange, onSuccess }: StripeConnectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error("Please enter an email address")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await apiClient.createStripeAccount({
        email: email.trim(),
        country: "US",
        type: "express"
      })

      if (response.status === "success") {
        toast.success("Stripe account created successfully!")
        setEmail("")
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(response.message || "Failed to create Stripe account")
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } }
      toast.error(apiError.response?.data?.message || "Failed to create Stripe account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Connect Stripe Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              type="text"
              value="United States"
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Currently only supporting US accounts
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Connect Account"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 