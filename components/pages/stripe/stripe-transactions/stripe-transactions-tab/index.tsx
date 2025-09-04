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
  Eye,
  EyeOff,
  RefreshCcw,
  CreditCard,
  Database,
} from "lucide-react";
import { useStripeRowData } from "@/lib/hooks/use-api";
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
import {
  StripePaymentSuccessModal,
  StripePaymentDetails,
} from "@/components/pages/stripe/stripe-transactions/stripe-payment-success-modal";
import StripeTransactionDetailsModal from "./stripe-transaction-details-modal";
import StripeRefundModal from "../stripe-refund-modal";

interface OtaBillingAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
}

interface OtaId {
  displayName?: string;
  billingAddress?: OtaBillingAddress;
}

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
  otaId?: OtaId;
  createdAt: string;
}

const StripeTransactionsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [limit, setLimit] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRow, setSelectedRow] = useState<AdminExcelDataItem | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] =
    useState<StripePaymentDetails | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const { data, isLoading, error, refetch } = useStripeRowData({
    page: currentPage,
    limit,
    chargeStatus: statusFilter === "all" ? "" : statusFilter,
    search: searchTerm,
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch stripe transactions");
    }
  }, [error, limit, refreshKey]);

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

  const handleMakePayment = async (account: AdminExcelDataItem) => {
    // TODO: Implement Stripe payment processing
    toast.info(
      `Processing payment for account: ${account["Connected Account"] || "N/A"}`
    );

    // Convert to integer cents by truncating to two decimals (no rounding)
    const rawAmountStr = String(account["Amount to charge"] || "0").replace(/,/g, "").trim();
    const isNegative = rawAmountStr.startsWith("-");
    const unsigned = isNegative ? rawAmountStr.slice(1) : rawAmountStr;
    const parts = unsigned.split(".");
    const intPart = parts[0] || "0";
    const fracPart = (parts[1] || "").padEnd(2, "0").slice(0, 2);
    const centsUnsigned = Number(intPart) * 100 + Number(fracPart || "0");
    const amountInCents = isNegative ? -centsUnsigned : centsUnsigned;

    if (!account["Connected Account"]) {
      toast.error("No connected account found");
      return;
    }

    try {
      const response = await apiClient.createStripePayment({
        accountId: account["Connected Account"],
        totalAmount: amountInCents,
        currency: "usd",
        paymentMethod: "pm_card_visa",
        documentId: account.id,
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
    } catch (error: unknown) {
      console.error("Stripe payment failed:", error);
      const apiError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Failed to initiate payment";
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Ready to charge">Ready to charge</SelectItem>
                <SelectItem value="Partially charged">
                  Partially charged
                </SelectItem>
                <SelectItem value="Charged">Charged</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
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
              onClick={handleRefresh}
              className="w-10 h-10 p-0"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm ps-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Connected Account</TableHead>
                <TableHead>Expedia ID</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Reservation ID</TableHead>
                {/* <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead> */}
                <TableHead>Amount</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Card Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
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
                  <TableCell colSpan={11} className="h-32 text-center">
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
                excelData
                  .filter(
                    (row) =>
                      searchTerm === "" ||
                      row["Name"]
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      row["Hotel Name"]
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      row["Hotel Confirmation Code"]?.includes(searchTerm)
                  )
                  .map((row: AdminExcelDataItem) => (
                    <TableRow
                      key={row.id || row._id}
                      className="hover:bg-gray-50/50"
                    >
                      <TableCell className="font-mono">
                        {row["Connected Account"]}
                      </TableCell>
                      <TableCell className="font-mono">
                        {row["Expedia ID"]}
                      </TableCell>
                      <TableCell className="font-mono">
                        {row["Batch"]}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <div className="font-medium">
                              {row["Hotel Name"]}
                            </div>
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
                      {/* <TableCell>
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
                      </TableCell> */}
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
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          {showCardDetails ? (
                            <div>
                              <div>{row["Card Number"]}</div>
                              <div className="text-sm text-gray-500">
                                Exp: {row["Card Expire"]}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm ">
                              ************{row["Card Number"]?.slice(-4)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(row["Charge status"] || "")}
                        >
                          {row["Charge status"] || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center flex items-center justify-center gap-2">
                        {row["Charge status"] === "Ready to charge" ||
                        row["Charge status"] === "Partially charged" ||
                        row["Charge status"] === "Refunded" ||
                        row["Charge status"] === "Failed" ||
                        row["Charge status"] === "Declined" ? (
                          <>
                           {
                              row["Charge status"] === "Refunded" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="p-2 hover:bg-blue-100 w-fit flex-1"
                                  onClick={() => {
                                    const normalized = {
                                      ...row,
                                      id: (row.id || row._id) as string,
                                    };
                                    setSelectedRow(normalized);
                                    setShowViewDialog(true);
                                    setShowRefundModal(false);
                                  }}
                                >
                                  <Database className="h-4 w-4 text-blue-600" />
                                </Button>
                              )
                            }
                            <Button
                              variant={"outline"}
                              size="sm"
                              className="p-2 hover:bg-blue-700 w-fit bg-blue-600 text-white hover:text-white flex-1"
                              onClick={() => handleMakePayment(row)}
                            >
                              {row["Charge status"] === "Failed" ||
                              row["Charge status"] === "Declined" || row["Charge status"] === "Refunded"
                                ? "Charge Again"
                                : "Make Payment"}
                              <ArrowRight className="h-4 w-4 text-white" />
                            </Button>
                           
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 hover:bg-blue-100 flex-1"
                              onClick={() => {
                                const normalized = {
                                  ...row,
                                  id: (row.id || row._id) as string,
                                };
                                setSelectedRow(normalized);
                                setShowViewDialog(true);
                              }}
                            >
                              Details
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="p-2 w-fit"
                              onClick={() => {
                                const normalized = {
                                  ...row,
                                  id: (row.id || row._id) as string,
                                };
                                setSelectedRow(normalized);
                                setShowRefundModal(true);
                              }}
                              disabled={
                                !(row as any).stripePaymentIntentId && !row.id
                              }
                            >
                              Refund
                              <RefreshCcw className="h-4 w-4 text-white" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="p-2 hover:bg-blue-100 w-fit"
                          onClick={() => {
                            const normalized = {
                              ...row,
                              id: (row.id || row._id) as string,
                            };
                            setSelectedRow(normalized);
                            setShowEditDialog(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </Button>
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
      <StripePaymentSuccessModal
        open={showSuccessModal}
        details={paymentDetails}
        onClose={handleSuccessModalClose}
      />
      <StripeTransactionDetailsModal
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        rowData={selectedRow}
      />
      <EditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        rowData={
          selectedRow
            ? {
                ...selectedRow,
                id: (selectedRow.id || selectedRow._id) as string,
              }
            : null
        }
        onSuccess={() => refetch()}
        paymentGateway="stripe"
      />
      <StripeRefundModal
        open={showRefundModal}
        onOpenChange={setShowRefundModal}
        documentId={selectedRow?.id as string}
        paymentIntentId={(selectedRow as any)?.stripePaymentIntentId as string}
        currency={(selectedRow?.stripeCurrency as string) || "USD"}
        defaultAmountCents={selectedRow?.stripeAmount as any}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default StripeTransactionsTab;
