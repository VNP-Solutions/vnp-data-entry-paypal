"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  FileSpreadsheet,
  Calendar,
  Building2,
  User2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  PencilIcon,
  CheckCircle,
} from "lucide-react";
import { useGetStripeAccount, useStripeRowData } from "@/lib/hooks/use-api";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCheckInOutDate, formatLongString } from "@/lib/utils";
import { apiClient } from "@/lib/client-api-call";
import { EditDialog } from "@/components/shared/edit-modal";

interface AdminExcelDataItem {
  _id?: string;
  id?: string;
  userId?: string;
  uploadId: string;
  fileName: string;
  uploadStatus: string;
  rowNumber: number;
  "Expedia ID": string;
  Batch: string;
  "Posting Type"?: string;
  OTA?: string;
  Portfolio: string;
  "Hotel Name": string;
  "Reservation ID": string;
  "Hotel Confirmation Code": string;
  Name: string;
  "Check In": string;
  "Check Out": string;
  Curency: string;
  "Amount to charge": string;
  "Charge status": string;
  "Card Number": string;
  "Card Expire": string;
  "Card CVV": string;
  "Soft Descriptor": string;
  "VNP Work ID": string | null;
  Status: string | null;
  "Connected Account"?: string;
  // PayPal fields
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  paypalNetworkTransactionId?: string | null;
  paypalFee?: string | null;
  paypalNetAmount?: string | null;
  paypalCardBrand?: string | null;
  paypalCardType?: string | null;
  paypalAvsCode?: string | null;
  paypalCvvCode?: string | null;
  paypalCreateTime?: string | null;
  paypalUpdateTime?: string | null;
  paypalStatus?: string | null;
  paypalAmount?: string | null;
  paypalCurrency?: string | null;
  paypalCardLastDigits?: string | null;
  // Stripe fields
  stripeOrderId?: string | null;
  stripeCaptureId?: string | null;
  stripeNetworkTransactionId?: string | null;
  stripeFee?: string | null;
  stripeNetAmount?: string | null;
  stripeCardBrand?: string | null;
  stripeCardType?: string | null;
  stripeAvsCode?: string | null;
  stripeCvvCode?: string | null;
  stripeCreateTime?: string | null;
  stripeUpdateTime?: string | null;
  stripeStatus?: string | null;
  stripeAmount?: string | null;
  stripeCurrency?: string | null;
  stripeCardLastDigits?: string | null;
  stripeCaptureStatus?: string | null;
  stripeCustomId?: string | null;
  stripeRefundId?: string | null;
  stripeRefundStatus?: string | null;
  stripeRefundAmount?: string | null;
  stripeRefundCurrency?: string | null;
  stripeRefundGrossAmount?: string | null;
  stripeRefundFee?: string | null;
  stripeRefundNetAmount?: string | null;
  stripeTotalRefunded?: string | null;
  stripeRefundCreateTime?: string | null;
  stripeRefundUpdateTime?: string | null;
  stripeRefundInvoiceId?: string | null;
  stripeRefundCustomId?: string | null;
  stripeRefundNote?: string | null;
  otaId?: any;
  createdAt: string;
}

const StripeTransactionsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  // const { data: selectedAccountData, isLoading: isLoadingAccountData } =
  // useGetStripeAccount(account["Connected Account"] || "");
  // const [showCardDetails, setShowCardDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [limit, setLimit] = useState(10);
  const [selectedRow, setSelectedRow] = useState<AdminExcelDataItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<
    | {
        intentId: string;
        status: string;
        amount: number;
        currency: string;
        applicationFee?: number;
        destination?: string;
      }
    | null
  >(null);

  const { data, isLoading, error, refetch } = useStripeRowData({
    page: currentPage,
    limit,
    status: statusFilter === "all" ? "" : statusFilter,
    search: searchTerm,
    portfolio: portfolioFilter === "all" ? "" : portfolioFilter,
    batch: batchFilter === "all" ? "" : batchFilter,
    hotel: hotelFilter,
    sort: sortBy,
    order: sortOrder,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch stripe transactions");
    }
  }, [error, limit]);

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready to charge":
        return "bg-yellow-100 text-yellow-800";
      case "Charged":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Partially charged":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const excelData = data?.data?.rows || [];
  const pagination = data?.data?.pagination;
  const filters = data?.data?.filters;
  const handleMakePayment = async (account: any) => {
    // TODO: Implement Stripe payment processing
    toast.info(`Processing payment for account: ${account["Connected Account"] || "N/A"}`);
    // console.log(account);
    const amount = account["Amount to charge"];
    const amountInCents = amount * 100;

    try {
      const response = await apiClient.createStripePayment({
        accountId: 'acct_1S0cmd2KaRE3wkVM',
        totalAmount: amountInCents,
        currency: "usd",
        paymentMethod: "pm_card_visa",
      });
      const payment = response?.data?.payment || response?.payment;
      if (payment) {
        setPaymentDetails({
          intentId: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency?.toUpperCase?.() || "USD",
          applicationFee: payment.application_fee_amount,
          destination: payment.transfer_data?.destination,
        });
        setShowSuccessModal(true);
      }
      toast.success("Payment initiated successfully");
    } catch (error: any) {
      console.error("Stripe payment failed:", error);
      const message =
        error?.response?.data?.message || error?.message || "Failed to initiate payment";
      toast.error(message);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setPaymentDetails(null);
    refetch();
  };

  
  return (
    <div className="min-h-[80vh]">
      {/* Header Section */}
      <div className="my-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Stripe Transactions
        </h1>
        <p className="text-gray-600">
          View and manage all Stripe payment transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <div className="text-xl font-bold text-gray-900">
                {pagination?.totalCount || 0}
              </div>
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
              <div className="text-xl font-bold text-gray-900">
                {new Set(excelData.map((row) => row["Hotel Name"])).size}
              </div>
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
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(
                  excelData
                    .reduce(
                      (sum, row) =>
                        sum + parseFloat(row["Amount to charge"] || "0"),
                      0
                    )
                    .toString(),
                  "USD"
                )}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Guests</p>
              <div className="text-xl font-bold text-gray-900">
                {new Set(excelData.map((row) => row["Name"])).size}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
        <div className="space-y-4">
          {/* Search and Basic Filters */}
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
            {/* <div className="flex items-center gap-4 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowCardDetails(!showCardDetails)}
                className="min-w-[140px]"
              >
                {showCardDetails ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {showCardDetails ? "Hide Cards" : "Show Cards"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPortfolioFilter("all");
                  setBatchFilter("all");
                  setHotelFilter("");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                }}
                className="w-10 h-10 p-0"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div> */}
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Ready to charge">Ready to charge</SelectItem>
                <SelectItem value="Charged">Charged</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Partially charged">
                  Partially charged
                </SelectItem>
                <SelectItem value="Payment Processed">
                  Payment Processed
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Portfolio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Portfolio</SelectItem>
                {Array.from(
                  new Set(excelData.map((row) => row["Portfolio"]))
                ).map((portfolio) => (
                  <SelectItem key={portfolio} value={portfolio}>
                    {portfolio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {Array.from(new Set(excelData.map((row) => row["Batch"]))).map(
                  (batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by hotel..."
              value={hotelFilter}
              onChange={(e) => setHotelFilter(e.target.value)}
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="Hotel Name">Hotel Name</SelectItem>
                <SelectItem value="Amount to charge">Amount</SelectItem>
                <SelectItem value="Status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Expedia ID</TableHead>
                {/* <TableHead>Batch</TableHead> */}
                <TableHead>Connected Account</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Reservation ID</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>File Name</TableHead>
                {/* <TableHead>Card Details</TableHead> */}
             
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {Array(12)
                        .fill(0)
                        .map((_, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : excelData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileSpreadsheet className="h-8 w-8 mb-2" />
                      <p className="text-lg font-medium">
                        No stripe transactions found
                      </p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                excelData.map((row: AdminExcelDataItem) => (
                  <TableRow
                    key={row.id || row._id}
                    className="hover:bg-gray-50/50"
                  >
                    <TableCell className="font-mono">
                      {row["Expedia ID"]}
                    </TableCell>
                    <TableCell className="font-mono">
                      {row["Connected Account"] || "Not connected"}
                    </TableCell>
                    {/* <TableCell className="font-mono">{row["Batch"]}</TableCell> */}
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
                        <span>{row["Reservation ID"]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatCheckInOutDate(row["Check In"])}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatCheckInOutDate(row["Check Out"])}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {formatCurrency(
                            row["Amount to charge"],
                            row["Curency"]
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-pointer">
                            {formatLongString(row["fileName"], 15)}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{row["fileName"]}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getStatusColor(row["Status"] || "")}>
                        {row["Status"] || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-2 hover:bg-blue-100"
                          onClick={() => handleMakePayment(row)}
                        >
                          Make Payment
                          <ArrowRight className="h-4 w-4 text-blue-600 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-2 hover:bg-blue-100"
                          onClick={() => {
                            const normalized = { ...row, id: (row as any).id || (row as any)._id } as AdminExcelDataItem;
                            setSelectedRow(normalized);
                            setShowEditDialog(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {excelData.length} of {pagination.totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      {/* Payment Success Modal */}
      {showSuccessModal && paymentDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Your Stripe payment has been processed successfully.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Payment Intent ID:</span>
                  <span className="text-sm font-mono text-gray-900">{paymentDetails.intentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span
                    className={`text-sm font-semibold ${
                      paymentDetails.status === "succeeded" ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {paymentDetails.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Amount:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: paymentDetails.currency,
                    }).format((paymentDetails.amount || 0) / 100)}
                  </span>
                </div>
                {typeof paymentDetails.applicationFee === "number" && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Application Fee:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: paymentDetails.currency,
                      }).format((paymentDetails.applicationFee || 0) / 100)}
                    </span>
                  </div>
                )}
                {paymentDetails.destination && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Destination Account:</span>
                    <span className="text-sm font-mono text-gray-900">{paymentDetails.destination}</span>
                  </div>
                )}
              </div>

              <Button onClick={handleSuccessModalClose} className="w-full bg-green-600 hover:bg-green-700">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      <EditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        rowData={selectedRow ? ({ ...(selectedRow as any), id: (selectedRow as any).id || (selectedRow as any)._id } as any) : null}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default StripeTransactionsTab;
