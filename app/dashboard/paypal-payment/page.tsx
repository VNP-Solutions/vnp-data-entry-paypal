"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Eye, 
  EyeOff,
  Search,
  FileSpreadsheet,
  RefreshCcw,
  Calendar,
  Building2,
  CreditCard,
  User2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Rocket,
} from "lucide-react"
import { apiClient } from "@/lib/client-api-call"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckoutForm } from "@/components/checkout-form"

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

interface ApiResponse {
  rows: RowData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  filters: {
    chargeStatus: string;
    search: string | null;
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: RowData | null;
}

interface FormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: string;
  currency: string;
  name: string;
  hotelName: string;
  otaId: string;
  reservationId: string;
  batch: string;
  confirmation: string;
  checkIn: string;
  checkOut: string;
  softDescriptor: string;
  cardFirst4: string;
  cardLast12: string;
  postingType: string;
  portfolio: string;
  documentId: string;
}

const ViewDialog = ({ open, onOpenChange, rowData }: ViewDialogProps) => {
  if (!rowData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entry Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {Object.entries(rowData)
          .filter(([key]) => key !== "id" && key !== "uploadId" && key !== "rowNumber" && key !== "uploadStatus" && key !== "createdAt" && key !== "VNP Work ID" &&
           key !== "paypalFee" && key !== "paypalNetAmount"  && key !== "paypalAvsCode" && key !== "paypalCvvCode" && key !== "paypalAmount" && key !== "paypalCurrency" && key !== "paypalCardLastDigits")
          .map(([key, value]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium text-gray-500 uppercase">{key}</p>
              <p className="text-sm">{String(value)}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function PaypalPaymentPage() {
  const [data, setData] = useState<ApiResponse>({
    rows: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10
    },
    filters: {
      chargeStatus: "All",
      search: null
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [chargeStatus, setChargeStatus] = useState("All")
  const [limit, setLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  // const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
    documentId: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true)
      console.log(chargeStatus)
      const response = await apiClient.getRowData({
        limit,
        page: currentPage,
        chargeStatus
      })

      // Filter out partially charged records when "charged" filter is selected
      const responseData = response.data as unknown as ApiResponse;
      if (chargeStatus.toLowerCase() === "charged") {
        responseData.rows = responseData.rows.filter(
          (row: RowData) => row["Charge status"].toLowerCase() === "charged"
        )
      }
      setData(responseData)
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, chargeStatus, refreshKey, limit])

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(amount))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready to charge':
        return 'bg-yellow-100 text-yellow-800'
      case 'Charged':
        return 'bg-green-100 text-green-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      case 'Partially charged':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePaymentClick = (row: RowData) => {
    setFormData({
      cardNumber: `${row["Card first 4"]}${row["Card last 12"]}`,
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
      documentId: row.id,
    });
    setShowCheckoutForm(true);
  };

  const handleRowSelection = (rowId: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select rows that are not already charged
      const selectableRowIds = data.rows
        .filter(row => row["Charge status"] !== "Charged")
        .map(row => row.id);
      setSelectedRows(new Set(selectableRowIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleBulkPayment = () => {
    const selectedIds = Array.from(selectedRows);
    console.log('Selected IDs:', selectedIds);
    toast.info(`Processing payment for ${selectedIds.length} selected records`);
    toast.info(`Feature development in progress...`);

  };

  // Only count non-charged rows for select all logic
  const selectableRows = data.rows.filter(row => row["Charge status"] !== "Charged");
  const isAllSelected = selectableRows.length > 0 && selectedRows.size === selectableRows.length;


  return (
    <div className="min-h-[80vh]">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Transaction Records for <span className="text-blue-600">{chargeStatus.charAt(0).toUpperCase() + chargeStatus.slice(1)}</span> </h1>
            <p className="text-gray-600">Manage and monitor payment transactions</p>
          </div>
          {selectedRows.size > 0 && (
            <Button
              onClick={handleBulkPayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Make Bulk Payment ({selectedRows.size})
              <Rocket className="h-4 w-4 mr-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-xl font-bold text-gray-900">{data.pagination.totalCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building2 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hotels</p>
              <p className="text-xl font-bold text-gray-900">
                {new Set(data.rows.map(row => row["Hotel Name"])).size}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(
                  data.rows.reduce((sum, row) => sum + parseFloat(row["Amount to charge"]), 0).toString(),
                  "USD"
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, hotel, or confirmation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={chargeStatus} onValueChange={setChargeStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Ready to charge">Ready to charge</SelectItem>
                <SelectItem value="Partially charged">Partially charged</SelectItem>
                <SelectItem value="Charged">Charged</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="min-w-[140px]"
            >
              {showCardDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showCardDetails ? "Hide Cards" : "Show Cards"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="w-10 h-10 p-0"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Expedia ID</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Card Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array(10).fill(0).map((_, cellIdx) => (
                      <TableCell key={cellIdx}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileSpreadsheet className="h-8 w-8 mb-2" />
                      <p className="text-lg font-medium">No records found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.rows
                  .filter(row => 
                    searchTerm === "" ||
                    row["Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row["Hotel Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row["Hotel Confirmation Code"].includes(searchTerm)
                  )
                  .map((row: RowData) => {
                    const isCharged = row["Charge status"] === "Charged";
                    return (
                      <TableRow key={row.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) => handleRowSelection(row.id, checked as boolean)}
                            disabled={isCharged}
                          />
                        </TableCell>
                        <TableCell className="font-mono">{row["Expedia ID"]}</TableCell>
                        <TableCell className="font-mono">{row["Batch"]}</TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                              <div className="font-medium">{row["Hotel Name"]}</div>
                              <div className="text-sm text-gray-500">
                                Conf: {row["Hotel Confirmation Code"]}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-gray-400" />
                            <span>{row["Name"]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{row["Check In"]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{row["Check Out"]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {formatCurrency(row["Amount to charge"], row["Curency"])}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            {showCardDetails ? (
                              <div>
                                <div>{row["Card first 4"]} **** **** {row["Card last 12"].slice(-4)}</div>
                                <div className="text-sm text-gray-500">
                                  Exp: {row["Card Expire"]}
                                </div>
                              </div>
                            ) : (
                              `**** **** **** ${row["Card last 12"].slice(-4)}`
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(row["Charge status"])}>
                            {row["Charge status"]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {(row["Charge status"] === "Ready to charge" || row["Charge status"] === "Partially charged") ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 hover:bg-blue-100"
                              onClick={() => handlePaymentClick(row)}
                            >
                              Make Payment
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 hover:bg-blue-100"
                              onClick={() => {
                                setSelectedRow(row);
                                setShowViewDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {data.rows.length} of {data.pagination.totalCount} entries
          </div>
          <div className="flex items-center gap-2">
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={currentPage === data.pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <ViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        rowData={selectedRow}
      />

      {/* Replace the old checkout form with the new shared component */}
      <CheckoutForm
        open={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        formData={formData}
        showCardDetails={showCardDetails}
        onSuccess={fetchData}
      />
    </div>
  )
} 