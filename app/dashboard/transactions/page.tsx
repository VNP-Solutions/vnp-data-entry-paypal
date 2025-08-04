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
} from "lucide-react";
import { useAdminExcelData } from "@/lib/hooks/use-api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCheckInOutDate, formatLongString } from "@/lib/utils";

interface AdminExcelDataItem {
  _id: string;
  userId: string;
  uploadId: string;
  fileName: string;
  uploadStatus: string;
  rowNumber: number;
  "Expedia ID": string;
  Batch: string;
  "Posting Type": string;
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
  // "Card first 4": string;
  // "Card last 12": string;
  "Card Number": string;
  "Card Expire": string;
  "Card CVV": string;
  "Soft Descriptor": string;
  "VNP Work ID": string | null;
  Status: string | null;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  paypalNetworkTransactionId: string | null;
  paypalFee: string | null;
  paypalNetAmount: string | null;
  paypalCardBrand: string | null;
  paypalCardType: string | null;
  paypalAvsCode: string | null;
  paypalCvvCode: string | null;
  paypalCreateTime: string | null;
  paypalUpdateTime: string | null;
  paypalStatus: string | null;
  paypalAmount: string | null;
  paypalCurrency: string | null;
  paypalCardLastDigits: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: AdminExcelDataItem | null;
}

const ViewDialog = ({ open, onOpenChange, rowData }: ViewDialogProps) => {
  if (!rowData) return null;

  // Helper function to check if a field should be displayed
  const shouldDisplayField = (key: string) => {
    const hiddenFields = [
      "_id",
      "userId",
      "uploadId",
      "rowNumber",
      "uploadStatus",
      "createdAt",
      "updatedAt",
      "__v",
      "otaId",
    ];
    return !hiddenFields.includes(key);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {Object.entries(rowData)
            .filter(([key]) => shouldDisplayField(key))
            .map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-sm font-medium text-gray-500 uppercase">
                  {key}
                </p>
                <p className="text-sm">
                  {key === "fileName"
                    ? formatLongString(value, 25)
                    : key === "Check In"
                      ? formatCheckInOutDate(value)
                      : key === "Check Out"
                        ? formatCheckInOutDate(value)
                        : String(value || "N/A")}
                </p>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedRow, setSelectedRow] = useState<AdminExcelDataItem | null>(
    null
  );
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error } = useAdminExcelData({
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
      toast.error("Failed to fetch transactions");
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

  const excelData = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const filters = data?.data?.filters;

  return (
    <div className="min-h-[80vh]">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          All Transactions
        </h1>
        <p className="text-gray-600">
          View and manage all payment transactions across all uploads
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
            <div className="flex items-center gap-4 w-full md:w-auto">
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
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {filters?.available?.statusOptions?.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Portfolio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Portfolios</SelectItem>
                {filters?.available?.portfolioOptions?.map((portfolio) => (
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
                {filters?.available?.batchOptions?.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="Name">Guest Name</SelectItem>
                <SelectItem value="Hotel Name">Hotel Name</SelectItem>
                <SelectItem value="Amount to charge">Amount</SelectItem>
                <SelectItem value="Charge status">Status</SelectItem>
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
                <TableHead>Batch</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Reservation ID</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Card Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PayPal Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {Array(11)
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
                        No transactions found
                      </p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                excelData.map((row: AdminExcelDataItem) => (
                  <TableRow key={row._id} className="hover:bg-gray-50/50">
                    <TableCell className="font-mono">
                      {row["Expedia ID"]}
                    </TableCell>
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
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        {showCardDetails ? (
                          <div>
                            <div>{row["Card Number"]}</div>
                            <div className="text-sm text-gray-500">
                              Exp: {row["Card Expire"] || "MM/YY"}
                            </div>
                          </div>
                        ) : (
                          `************${row["Card Number"]?.slice(-4)}`
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(row["Charge status"])}>
                        {row["Charge status"]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.paypalStatus ? (
                        <Badge
                          className={
                            row.paypalStatus === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {row.paypalStatus}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
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
                disabled={!pagination.hasPrevPage}
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
                disabled={!pagination.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        rowData={selectedRow}
      />
    </div>
  );
}
