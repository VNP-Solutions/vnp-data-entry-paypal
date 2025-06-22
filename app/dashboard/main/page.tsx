"use client"

import { useState } from "react"
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  CreditCard,
  X,
  User,
  Calendar,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function MainPage() {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("ready-to-charge");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [currentEntry] = useState({
    cardDetails: {
      first4: "5567",
      last12: "170839894181",
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleProcessCharge = () => {
    setShowCheckoutForm(true);
  };

  const handlePayPalCheckout = () => {
    console.log("Processing PayPal checkout...");
    toast.success("PayPal checkout initiated!");
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">

      {/* Main Content */}
      <div
        className={`px-6 py-8 transition-all duration-300 ${
          showCheckoutForm ? "mr-96" : ""
        }`}
      >
        {/* First Row - Booking Details and Guest Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Booking Details */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">
                    Expedia ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono">16700171</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("16700171")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Batch</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono">16700171</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("16700171")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">
                    Posting Type
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">OTA Post</Badge>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Portfolio</label>
                  <div className="mt-1">
                    <span className="text-gray-900">Chartwell Hospitality</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <label className="font-medium text-gray-500">Hotel Name</label>
                <div className="mt-1 text-gray-900 font-medium">
                  Black Fox Lodge Pigeon Forge
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-500">
                  Hotel Confirmation
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono">3176067698</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("3176067698")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest & Charge Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Guest & Charge Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium text-gray-500">Guest Name</label>
                <div className="mt-1 text-gray-900 font-medium">
                  Bruce Wayne
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Check In</label>
                  <div className="mt-1 font-mono">11/23/2024</div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Check Out</label>
                  <div className="mt-1 font-mono">12/23/2024</div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Currency</label>
                  <div className="mt-1">
                    <Badge variant="outline">USD</Badge>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Amount</label>
                  <div className="mt-1 text-2xl font-bold text-green-600">
                    $281.47
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="font-medium text-gray-500">
                  Charge Status
                </label>
                <div className="mt-2">
                  <Select
                    value={currentStatus}
                    onValueChange={setCurrentStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready-to-charge">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Ready to charge
                        </div>
                      </SelectItem>
                      <SelectItem value="charged">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Charged
                        </div>
                      </SelectItem>
                      <SelectItem value="failed">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Failed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - VCC Details and Card Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* VCC Card Details */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                VCC Details
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCardDetails(!showCardDetails)}
                >
                  {showCardDetails ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">BT Maid</label>
                  <div className="mt-1 font-mono">
                    {showCardDetails ? "XXXXXX MAID" : "••••••••••"}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">First 4</label>
                  <div className="mt-1 font-mono">5567</div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Last 12</label>
                  <div className="mt-1 font-mono">
                    {showCardDetails ? "170839894181" : "••••••••••••"}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">CVV</label>
                  <div className="mt-1 font-mono">
                    {showCardDetails ? "457" : "•••"}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-500">Card Expire</label>
                <div className="mt-1 font-mono">11/2027</div>
              </div>
            </CardContent>
          </Card>

          {/* Virtual Credit Card Visualization */}
          <div className="flex items-center justify-center">
            <div className="relative scale-125">
              <div className="w-80 h-48 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-12 h-12 border-2 border-white rounded-full"></div>
                  <div className="absolute top-8 right-8 w-8 h-8 border-2 border-white rounded-full"></div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <CreditCard className="h-6 w-6 mb-3" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-80">VCC</div>
                      <div className="text-xs opacity-60">Virtual Card</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-mono tracking-wider mb-3">
                      {showCardDetails
                        ? `${
                            currentEntry.cardDetails.first4
                          } **** **** ${currentEntry.cardDetails.last12.slice(
                            -4
                          )}`
                        : `•••• •••• •••• ${currentEntry.cardDetails.first4}`}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-60 uppercase tracking-wide">
                          Card Holder
                        </div>
                        <div className="font-medium text-sm">Bruce Wayne</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-60 uppercase tracking-wide">
                          Expires
                        </div>
                        <div className="font-mono text-sm">11/2027</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Badge */}
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-2 rounded-tl-2xl font-bold text-sm shadow-lg">
                  $281.47
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleProcessCharge}
          >
            <Check className="h-4 w-4 mr-2" />
            Process Charge
          </Button>

          <Button variant="outline" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Download Sheet
          </Button>
          <Button variant="outline" size="lg">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <Button size="lg">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* PayPal Checkout Form Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-20 ${
          showCheckoutForm ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">PayPal Checkout</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCheckoutForm(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Complete your payment securely
            </p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Guest Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Guest Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="guestName">Full Name</Label>
                  <Input
                    id="guestName"
                    value="Bruce Wayne"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="hotelName">Hotel</Label>
                  <Input
                    id="hotelName"
                    value="Black Fox Lodge Pigeon Forge"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmation">Confirmation</Label>
                  <Input
                    id="confirmation"
                    value="3176067698"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Booking Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Booking Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="checkIn">Check In</Label>
                  <Input
                    id="checkIn"
                    value="11/23/2024"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check Out</Label>
                  <Input
                    id="checkOut"
                    value="12/23/2024"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Payment Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="amount">Amount to Charge</Label>
                  <Input
                    id="amount"
                    value="$281.47"
                    readOnly
                    className="bg-gray-50 text-lg font-bold text-green-600"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value="USD"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Card Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">VCC Information</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={
                      showCardDetails
                        ? `${
                            currentEntry.cardDetails.first4
                          } **** **** ${currentEntry.cardDetails.last12.slice(
                            -4
                          )}`
                        : `•••• •••• •••• ${currentEntry.cardDetails.first4}`
                    }
                    readOnly
                    className="bg-gray-50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      value="11/2027"
                      readOnly
                      className="bg-gray-50 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={showCardDetails ? "457" : "•••"}
                      readOnly
                      className="bg-gray-50 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-3">
              <Button
                onClick={handlePayPalCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold"
              >
                Pay with PayPal - $281.47
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCheckoutForm(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Your payment is secured by PayPal&apos;s encryption
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showCheckoutForm && (
        <div
          className="fixed inset-0 bg-black/20 z-10"
          onClick={() => setShowCheckoutForm(false)}
        />
      )}

     
    </div>      
  )
}