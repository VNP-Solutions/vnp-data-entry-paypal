"use client"

import { useState, useEffect } from "react"
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
import { apiClient } from "@/lib/client-api-call"

interface RowData {
  id: string;
  uploadId: string;
  fileName: string;
  uploadStatus: string;
  rowNumber: number;
  "Expedia ID": string;
  "Batch": string;
  "Posting Type": string;
  "Portfolio": string;
  "Hotel Name": string;
  "Reservation ID": string;
  "Hotel Confirmation Code": string;
  "Name": string;
  "Check In": string;
  "Check Out": string;
  "Curency": string;
  "Amount to charge": string;
  "Charge status": string;
  "Card first 4": string;
  "Card last 12": string;
  "Card Expire": string;
  "Card CVV": string;
  "Soft Descriptor": string;
  createdAt: string;
}

export default function MainPage() {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [currentStatus] = useState("ready to charge");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [allRows, setAllRows] = useState<RowData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: '',
    currency: '',
    name: '',
    hotelName: '',
    otaId: '',
    reservationId: '',
    batch: '',
    confirmation: '',
    checkIn: '',
    checkOut: '',
    softDescriptor: '',
    cardFirst4: '',
    cardLast12: '',
    postingType: '',
    portfolio: '',
  });

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getRowData({
        limit: 100,
        page: 1,
        chargeStatus: "ready to charge"
      });
      
      if (response.data.rows.length > 0) {
        setAllRows(response.data.rows);
        updateFormDataFromRow(response.data.rows[0]);
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormDataFromRow = (row: RowData) => {
    setFormData({
      cardNumber: row["Card first 4"] + row["Card last 12"],
      expiryDate: row["Card Expire"],
      cvv: row["Card CVV"],
      amount: row["Amount to charge"],
      currency: row["Curency"],
      name: row["Name"],
      hotelName: row["Hotel Name"],
      otaId: row["Expedia ID"],
      reservationId: row["Reservation ID"],
      batch: row["Batch"],
      confirmation: row["Hotel Confirmation Code"],
      checkIn: row["Check In"],
      checkOut: row["Check Out"],
      softDescriptor: row["Soft Descriptor"],
      cardFirst4: row["Card first 4"],
      cardLast12: row["Card last 12"],
      postingType: row["Posting Type"],
      portfolio: row["Portfolio"],
    });
  };

  const handleNext = () => {
    if (currentIndex < allRows.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      updateFormDataFromRow(allRows[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      updateFormDataFromRow(allRows[prevIndex]);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleProcessCharge = () => {
    setShowCheckoutForm(true);
  };

  const handlePayPalCheckout = () => {
    toast.success("PayPal checkout initiated!");
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

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
                    <span className="font-mono">{formData.otaId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.otaId)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Batch</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono">{formData.batch}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.batch)}
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
                    <Badge variant="outline">{formData.postingType}</Badge>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Portfolio</label>
                  <div className="mt-1">
                    <span className="text-gray-900">{formData.portfolio}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <label className="font-medium text-gray-500">Hotel Name</label>
                <div className="mt-1 text-gray-900 font-medium">
                  {formData.hotelName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-500">
                  Hotel Confirmation
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono">{formData.confirmation}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formData.confirmation)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-500">
                  Reservation ID
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono">{formData.reservationId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formData.reservationId)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
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
                  {formData.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Check In</label>
                  <div className="mt-1 font-mono">{formData.checkIn}</div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Check Out</label>
                  <div className="mt-1 font-mono">{formData.checkOut}</div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Currency</label>
                  <div className="mt-1">
                    <Badge variant="outline">{formData.currency}</Badge>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Amount</label>
                  <div className="mt-1 text-2xl font-bold text-green-600">
                    ${formData.amount}
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
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready to charge">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Ready to charge
                        </div>
                      </SelectItem>
                      {/* <SelectItem value="charged">
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
                      </SelectItem> */}
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
                  <label className="font-medium text-gray-500">Soft Descriptor</label>
                  <div className="mt-1 font-mono">
                    {showCardDetails ? formData.softDescriptor : "••••••••••"}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">First 4</label>
                  <div className="mt-1 font-mono">{formData.cardFirst4}</div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Last 12</label>
                  <div className="mt-1 font-mono">
                    {showCardDetails ? formData.cardLast12 : "••••••••••••"}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500">CVV</label>
                  <div className="mt-1 font-mono">
                    {showCardDetails ? formData.cvv : "•••"}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-500">Card Expire</label>
                <div className="mt-1 font-mono">{formData.expiryDate}</div>
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
                        ? `${formData.cardFirst4} **** **** ${formData.cardLast12.slice(-4)}`
                        : `•••• •••• •••• ${formData.cardFirst4}`}
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-60 uppercase tracking-wide">
                          Card Holder
                        </div>
                        <div className="font-medium text-sm">{formData.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-60 uppercase tracking-wide">
                          Expires
                        </div>
                        <div className="font-mono text-sm">{formData.expiryDate}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Badge */}
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-2 rounded-tl-2xl font-bold text-sm shadow-lg">
                  ${formData.amount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Modified for navigation */}
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
          <Button 
            variant="outline" 
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <Button 
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === allRows.length - 1}
          >
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
                    value={formData.name}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="hotelName">Hotel</Label>
                  <Input
                    id="hotelName"
                    value={formData.hotelName}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmation">Confirmation</Label>
                  <Input
                    id="confirmation"
                    value={formData.confirmation}
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
                    value={formData.checkIn}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check Out</Label>
                  <Input
                    id="checkOut"
                    value={formData.checkOut}
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
                    value={`$${formData.amount}`}
                    readOnly
                    className="bg-gray-50 text-lg font-bold text-green-600"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
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
                        ? `${formData.cardFirst4} **** **** ${formData.cardLast12.slice(-4)}`
                        : `•••• •••• •••• ${formData.cardFirst4}`
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
                      value={formData.expiryDate}
                      readOnly
                      className="bg-gray-50 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={showCardDetails ? formData.cvv : "•••"}
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
                Pay with PayPal - ${formData.amount}
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