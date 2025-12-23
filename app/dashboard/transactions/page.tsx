"use client";

// MARK: Import Dependencies
// Explanation: Imports all required React hooks, UI components, icons, API hooks, and utilities.
// This comprehensive import section includes table components, form elements, tooltip components,
// and the admin data hook for fetching combined PayPal and Stripe transactions.
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Search,
  FileSpreadsheet,
  RefreshCcw,
  Building2,
  CreditCard,
  User2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
} from "lucide-react";
import { useAdminExcelData } from "@/lib/hooks/use-api";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatLongString } from "@/lib/utils";
// Removed PayPal-specific modal due to type mismatch with admin data
import StripeTransactionDetailsModal from "@/components/pages/stripe/stripe-transactions/stripe-transactions-tab/stripe-transaction-details-modal";

// MARK: TypeScript Interface
// Explanation: Defines the complete data structure for admin transaction records.
// Includes fields from both PayPal and Stripe transactions with hotel reservation details,
// payment information, card data, and PayPal-specific metadata (order ID, capture ID, fees, etc.)
interface AdminExcelDataItem {
  id?: string;
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
  "Connected Account"?: string;
}

// MARK: Transactions Page Component
// Explanation: Main component for viewing and managing all transactions across both PayPal and Stripe gateways.
// Provides unified view of all payment transactions with filtering, searching, pagination, and CSV export capabilities.
// Displays comprehensive transaction details including hotel info, payment status, and gateway type.
export default function TransactionsPage() {
  // MARK: State Management - Pagination & Display
  // Explanation: Controls pagination, card visibility, and dialog states.
  // currentPage: Active page number for pagination
  // showCardDetails: Toggle for masking/showing sensitive card information
  // showViewDialog: Controls visibility of transaction details modal
  const [currentPage, setCurrentPage] = useState(1);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"PayPal" | "Stripe" | "all">("all");
  const [selectedRow, setSelectedRow] = useState<AdminExcelDataItem | null>(
    null
  );
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [limit, setLimit] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // MARK: API Data Fetching
  // Explanation: Fetches paginated admin transaction data with filters applied.
  // Supports filtering by gateway (PayPal/Stripe/All) and searching across multiple fields.
  const { data, isLoading, error } = useAdminExcelData({
    page: currentPage,
    limit,
    filter: filter === "all" ? "All" : filter,
    search: searchTerm,
  });

  // MARK: Error Handling Effect
  // Explanation: Displays error toast notification when API data fetch fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch transactions");
    }
  }, [error, limit]);

  // MARK: Currency Formatter
  // Explanation: Formats monetary amounts with proper currency symbols using Intl.NumberFormat.
  // Ensures consistent currency display across all transaction amounts in the table.
  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  // MARK: Status Color Helper
  // Explanation: Returns Tailwind CSS classes for badge styling based on charge status.
  // Maps payment statuses to color schemes: yellow for ready, green for charged, red for failed, blue for partial.
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready to charge":
        return "bg-yellow-100 text-yellow-800";
      case "Ready to Charge":
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

  // MARK: Data Processing & Pagination
  // Explanation: Extracts and normalizes transaction data from API response with flexible parsing.
  // Handles different response structures and extracts pagination metadata.
  // paginationCurrentPage: Current page number from API or fallback to state
  // paginationTotalPages: Total number of pages available
  // paginationTotalRecords: Total count of all transaction records
  const raw: any = data as any;
  const excelData: AdminExcelDataItem[] = Array.isArray(raw?.data)
    ? (raw.data as AdminExcelDataItem[])
    : Array.isArray(raw?.data?.data)
    ? (raw.data.data as AdminExcelDataItem[])
    : [];
  const pagination: any = raw?.pagination || raw?.data?.pagination || undefined;

  const paginationCurrentPage: number = pagination?.currentPage || currentPage;
  const paginationTotalPages: number = pagination?.totalPages || 1;
  const paginationTotalRecords: number = pagination?.totalRecords || 0;
  const paginationHasPrev: boolean =
    (pagination?.hasPrevPage ?? pagination?.hasPrev) || false;
  const paginationHasNext: boolean =
    (pagination?.hasNextPage ?? pagination?.hasNext) || false;

  // MARK: Row ID Helper
  // Explanation: Extracts unique identifier from transaction row, handling both 'id' and '_id' fields
  const getRowId = (row: AdminExcelDataItem): string =>
    (row.id || row._id) as string;

  // MARK: Selection State Helper
  // Explanation: Checks if all visible transactions on current page are selected
  const isAllSelected =
    excelData.length > 0 && selectedRows.size === excelData.length;

  // MARK: Row Selection Handler
  // Explanation: Manages individual row selection for CSV export using checkbox toggles.
  // Maintains Set of selected row IDs for efficient lookup and export operations.
  const handleRowSelection = (rowId: string, checked: boolean) => {
    const next = new Set(selectedRows);
    if (checked) {
      next.add(rowId);
    } else {
      next.delete(rowId);
    }
    setSelectedRows(next);
  };

  // MARK: Select All Handler
  // Explanation: Toggles selection of all visible transactions on current page.
  // Selects all rows when checked, clears all selections when unchecked.
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(excelData.map((r) => getRowId(r))));
    } else {
      setSelectedRows(new Set());
    }
  };

  // MARK: CSV Export Handler
  // Explanation: Exports selected transactions to CSV file with all fields included.
  // Handles null/undefined values with "N/A" placeholder and properly escapes special characters.
  // Manual Flow: Select rows → Click Export CSV → Browser downloads CSV file with selected transactions
  const handleExportCsv = () => {
    const selectedIds = Array.from(selectedRows);
    const rows = excelData.filter((r) => selectedIds.includes(getRowId(r)));
    if (rows.length === 0) return;

    const allKeys = Array.from(
      rows.reduce((set, item) => {
        Object.keys(item as unknown as Record<string, unknown>).forEach((k) =>
          set.add(k)
        );
        return set;
      }, new Set<string>())
    );

    const escapeCsv = (value: unknown) => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      )
        return "N/A";
      const str = String(value);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const header = allKeys.join(",");
    const lines = rows.map((row) =>
      allKeys.map((k) => escapeCsv((row as any)[k])).join(",")
    );
    const csv = [header, ...lines].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${rows.length}_rows_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // MARK: Component Render
  // Explanation: Main render function for the transactions page layout.
  // Displays header with export button, statistics cards, filters, and comprehensive transaction table with pagination.
  return (
    <div className="min-h-[80vh]">
      {/* MARK: Header Section */}
      {/* Explanation: Page header with title, description, and CSV export button.
      Export button shows count of selected rows and is disabled when no rows are selected. */}
      <div className="flex items-center justify-between">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            All Transactions
          </h1>
          <p className="text-gray-600">
            View and manage all payment transactions across all uploads
          </p>
        </div>
        {/* MARK: CSV Export Button */}
        {/* Explanation: Exports selected transactions to CSV file for external analysis.
        Shows selection count and is only enabled when rows are selected. */}
        <Button
          variant="secondary"
          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
          disabled={selectedRows.size === 0}
          onClick={handleExportCsv}
        >
          <DownloadCloud className="h-4 w-4 mr-2" />
          Export CSV ({selectedRows.size})
        </Button>
      </div>

      {/* MARK: Statistics Cards Section */}
      {/* Explanation: Displays key metrics for all transactions - Total Records, Unique Hotels, Total Amount, and Unique Guests.
      Dynamically calculates based on visible data after filters are applied. */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Records Card */}
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <div className="text-xl font-bold text-gray-900">
                {paginationTotalRecords}
              </div>
            </div>
          </div>
        </Card>
        {/* Unique Hotels Card */}
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
        {/* Total Amount Card */}
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
        {/* Unique Guests Card */}
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

      {/* MARK: Filters Section */}
      {/* Explanation: Provides search, gateway filtering, and card visibility controls.
      Search: Filters transactions by guest name, hotel, or confirmation code
      Gateway Filter: Filters by PayPal, Stripe, or shows all transactions
      Card Toggle: Shows/hides sensitive card information
      Reset Button: Clears all applied filters */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* MARK: Search Input */}
            {/* Explanation: Text search across guest name, hotel name, and confirmation code */}
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
              {/* MARK: Gateway Filter Dropdown */}
              {/* Explanation: Filters transactions by payment gateway - All, PayPal, or Stripe */}
              <Select
                value={filter}
                onValueChange={(v) =>
                  setFilter(v as "PayPal" | "Stripe" | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>

              {/* MARK: Toggle Card Details Button */}
              {/* Explanation: Shows/hides sensitive card information in the table for security purposes */}
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

              {/* MARK: Reset Filters Button */}
              {/* Explanation: Clears all active filters and resets to default "all" view */}
              <Button
                disabled={isLoading}
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                  toast.success("Filters are removed");
                }}
                className="w-10 h-10 p-0"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* MARK: Transactions Table */}
      {/* Explanation: Main data table displaying all transactions from both PayPal and Stripe gateways.
      Columns: Checkbox, Connected Account (Stripe only), Expedia ID, Batch, Hotel, Reservation ID, Amount, File Name, Card Details, Gateway, Status, Actions
      Supports row selection for CSV export, conditional column display based on gateway filter, and transaction detail viewing. */}
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
                {(filter === "all" || filter === "Stripe") && (
                  <TableHead>Connected Account</TableHead>
                )}
                <TableHead>Expedia ID</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Reservation ID</TableHead>
                {/* <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead> */}
                <TableHead>Amount</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Card Details</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>PayPal Status</TableHead> */}
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* MARK: Loading State */}
              {/* Explanation: Displays skeleton placeholders while transaction data is being fetched from API */}
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
                // MARK: Empty State
                // Explanation: Displays friendly message when no transactions match the current filters
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center">
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
                // MARK: Transaction Data Rows
                // Explanation: Renders each transaction row with all details from both PayPal and Stripe gateways.
                // Conditionally displays Connected Account column only for Stripe transactions or when "all" filter is active.
                excelData.map((row: AdminExcelDataItem) => (
                  <TableRow key={row._id} className="hover:bg-gray-50/50">
                    {/* Selection Checkbox */}
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(getRowId(row))}
                        onCheckedChange={(checked) =>
                          handleRowSelection(getRowId(row), checked as boolean)
                        }
                      />
                    </TableCell>
                    {/* Connected Account (Stripe only) */}
                    {(filter === "all" || filter === "Stripe") && (
                      <TableCell className="font-mono">
                        {row["Connected Account"] || "N/A"}
                      </TableCell>
                    )}
                    {/* Expedia ID */}
                    <TableCell className="font-mono">
                      {row["Expedia ID"]}
                    </TableCell>
                    {/* Batch Number */}
                    <TableCell className="font-mono">{row["Batch"]}</TableCell>
                    {/* Hotel Information */}
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
                    {/* Reservation ID */}
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

                    {/* Amount */}
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
                    {/* File Name with Tooltip */}
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
                    {/* Card Details (Masked/Visible) */}
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
                    {/* Payment Gateway Badge */}
                    <TableCell className="font-mono">
                      <Badge
                        variant="outline"
                        className={
                          row["Connected Account"]
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {row["Connected Account"] ? "Stripe" : "PayPal"}
                      </Badge>
                    </TableCell>
                    {/* Charge Status Badge */}
                    <TableCell>
                      <Badge className={getStatusColor(row["Charge status"])}>
                        {row["Charge status"]}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
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
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell> */}
                    {/* Action Button - View Details */}
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 hover:bg-blue-100"
                        onClick={() => {
                          setSelectedRow(row);
                          setShowViewDialog(true);
                        }}
                      >
                        Details
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* MARK: Pagination Controls */}
        {/* Explanation: Provides pagination controls for navigating through transaction pages.
        Left side: Shows count summary of visible entries vs total
        Right side: Items per page selector (10, 20, 50, 100) and page navigation buttons
        Previous/Next buttons disabled at boundaries based on API response */}
        {true && (
          <div className="flex items-center justify-between p-4 border-t">
            {/* MARK: Pagination Summary */}
            {/* Explanation: Displays count of currently visible transactions vs total transaction count */}
            <div className="text-sm text-gray-600">
              Showing {excelData.length} of {paginationTotalRecords} entries
            </div>
            <div className="flex items-center gap-2">
              {/* MARK: Items Per Page Selector */}
              {/* Explanation: Dropdown to change number of transactions displayed per page */}
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
              {/* MARK: Page Navigation Buttons */}
              {/* Explanation: Previous/Next buttons for page navigation with disabled states at boundaries.
              Shows current page number and total pages. */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!paginationHasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {paginationCurrentPage} of {paginationTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(paginationTotalPages, p + 1))
                }
                disabled={!paginationHasNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MARK: Transaction Details Modal */}
      {/* Explanation: Modal dialog displaying comprehensive details for selected transaction */}
      <StripeTransactionDetailsModal
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        rowData={selectedRow}
      />
    </div>
  );
}
