"use client";

// MARK: Import Dependencies
// Explanation: Imports all required React hooks, UI components, icons, API utilities, and custom hooks.
// This comprehensive import section includes table components, form elements, dialog modals, payment processing hooks,
// and utility functions for the PayPal payment management system.
import { useState, useEffect, useCallback, useMemo } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Loader2,
  PencilIcon,
  Check,
  ChevronsUpDown,
  Plus,
  Currency,
  Download,
} from "lucide-react";
import { apiClient } from "@/lib/client-api-call";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutForm } from "@/components/pages/paypal/checkout-form";
import { useMakeBulkPayment } from "@/lib/hooks/use-api";
import { useMakeBulkRefund } from "@/lib/hooks/use-api";
import { useProcessRefund } from "@/lib/hooks/use-api";
import { useExportManualExcelData } from "@/lib/hooks/use-api";
import { formatCheckInOutDate, formatLongString } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditDialog } from "@/components/shared/edit-modal";
import PaypalTransactionDetailsModal from "./paypal-transaction-details-modal";
import CreateSinglePaymentModal from "./create-single-payment-modal";

// MARK: TypeScript Interfaces
// Explanation: Defines data structures for PayPal transactions, API responses, and component props.
// RowData: Complete transaction record with hotel reservation details, payment info, and card data
// ApiResponse: Paginated response structure with rows, pagination metadata, and active filters
export interface RowData {
  id: string;
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
  paypalOrderId: string;
  Curency: string;
  "Amount to charge": string;
  "Charge status": string;
  "Card Number": string;
  "Card Expire": string;
  "Card CVV": string;
  "Soft Descriptor": string;
  createdAt: string;
  otaId?: {
    billingAddress: {
      zipCode: string;
      countryCode: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
    };
    _id: string;
    name: string;
    displayName: string;
    customer: string;
    isActive: boolean;
  };
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

export interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: RowData | null;
}

interface RefundConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: RowData | null;
  onConfirm: () => void;
  isLoading: boolean;
}

// MARK: Form Data Interface
// Explanation: Defines the structure for payment form data including card details, billing info, and reservation details.
// Used for editing transactions and creating manual payments with complete payment and reservation information.
interface FormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: string;
  currency: string;
  name: string;
  hotelName: string;
  expediaId: string;
  reservationId: string;
  batch: string;
  confirmation: string;
  checkIn: string;
  checkOut: string;
  softDescriptor: string;
  postingType: string;
  portfolio: string;
  documentId: string;
  zipCode: string;
  countryCode: string;
  otaDisplayName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
}

// MARK: Refund Confirmation Dialog Component
// Explanation: Modal dialog for confirming PayPal refund transactions before processing.
// Displays transaction details (guest name, hotel, amount, order ID) and requires user confirmation.
// Manual Flow: User clicks Refund → Dialog shows transaction details → User confirms → Refund processed
const RefundConfirmationDialog = ({
  open,
  onOpenChange,
  rowData,
  onConfirm,
  isLoading,
}: RefundConfirmationDialogProps) => {
  if (!rowData) return null;

  // MARK: Currency Formatter Helper
  // Explanation: Formats monetary amounts according to currency standards using Intl.NumberFormat.
  // Falls back to USD formatting if invalid currency code provided. Ensures consistent currency display.
  const formatCurrency = (
    amount: string,
    currency: string | null | undefined
  ) => {
    const safeCurrency = currency || "USD";
    if (!safeCurrency || safeCurrency.length !== 3) {
      return `${safeCurrency || "USD"} ${parseFloat(amount).toFixed(2)}`;
    }
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: safeCurrency,
      }).format(parseFloat(amount));
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(parseFloat(amount));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md !w-full">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            Confirm Refund
          </DialogTitle>
          <DialogDescription>
            This action will process a full refund for this transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="bg-gray-100 p-2 rounded-sm">
                <p className="text-sm font-medium text-gray-700">Guest Name</p>
                <p className="text-sm text-gray-900">{rowData.Name}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-sm">
                <p className="text-sm font-medium text-gray-700">Hotel</p>
                <p className="text-sm text-gray-900">{rowData["Hotel Name"]}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-sm ">
                <p className="text-sm font-medium text-gray-700">Amount</p>
                <p className="text-sm text-gray-900">
                  {formatCurrency(rowData["Amount to charge"], rowData.Curency)}
                </p>
              </div>
              <div className="bg-gray-100 p-2 rounded-sm">
                <p className="text-sm font-medium text-gray-700"> Order ID</p>
                <p className="text-sm text-gray-900 font-mono">
                  {rowData.paypalOrderId || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Confirm Refund
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// MARK: PayPal Payment Page Component
// Explanation: Main component for PayPal transaction management system.
// Provides comprehensive PayPal payment operations including viewing transactions, processing payments/refunds,
// bulk operations, filtering, searching, and manual payment creation. Integrates with PayPal API for payment processing.
export default function PaypalPaymentPageComponent() {
  // MARK: State Management - Data & Loading
  // Explanation: Manages transaction data, pagination, filters, and loading states.
  // data: Main API response containing rows, pagination metadata, and active filters
  // Loading states: Track different async operations (initial load, bulk payment, bulk refund)
  const [data, setData] = useState<ApiResponse>({
    rows: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    },
    filters: {
      chargeStatus: "All",
      search: null,
    },
  });
  const [showSinglePaymentDialog, setShowSinglePaymentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkPaymentLoading, setIsBulkPaymentLoading] = useState(false);
  const [isBulkRefundLoading, setIsBulkRefundLoading] = useState(false);

  // MARK: State Management - Pagination & Filters
  // Explanation: Controls pagination, search, and filtering functionality for transactions.
  // currentPage: Active page number for pagination
  // limit: Number of records per page
  // chargeStatus: Filter by payment status (All, Charged, Pending, Failed, Refunded)
  // searchTerm: Text search across transaction fields
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [chargeStatus, setChargeStatus] = useState("All");
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // MARK: State Management - File Upload Selection
  // Explanation: Manages upload file filtering with combobox for selecting specific upload batches.
  // selectedUploadId: Filter transactions by specific upload file or "all" for all files
  // uploadFiles: List of available upload files with metadata
  const [selectedUploadId, setSelectedUploadId] = useState<string>("all");
  const [uploadFiles, setUploadFiles] = useState<Array<{_id: string; uploadId: string; fileName: string; user?: {name: string; email: string} | null}>>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileComboboxOpen, setFileComboboxOpen] = useState(false);
  const [fileSearchTerm, setFileSearchTerm] = useState("");

  // MARK: State Management - Dialog & Modal States
  // Explanation: Controls visibility of various modal dialogs for viewing, editing, and processing transactions.
  // selectedRow: Currently selected transaction row for operations
  // Dialog states: View details, edit transaction, checkout form, refund confirmation
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // MARK: API Hooks Integration
  // Explanation: React Query mutation hooks for PayPal payment operations.
  // Handles bulk payments, bulk refunds, single refunds, and Excel data export functionality
  const makeBulkPayment = useMakeBulkPayment();
  const makeBulkRefund = useMakeBulkRefund();
  const processRefund = useProcessRefund();
  const exportManualExcelData = useExportManualExcelData();
  // const [isProcessing, setIsProcessing] = useState(false);

  // MARK: State Management - Refund Operations
  // Explanation: Manages refund dialog state and selected row data for refund processing.
  // refundRowData: Transaction selected for refund operation
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundRowData, setRefundRowData] = useState<RowData | null>(null);
  const [isRefundLoading, setIsRefundLoading] = useState(false);

  // MARK: State Management - Form Data
  // Explanation: Stores form data for editing transactions and creating manual payments.
  // Includes card details, billing information, reservation details, and OTA billing address
  const [formData, setFormData] = useState<FormData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: "",
    currency: "",
    name: "",
    hotelName: "",
    expediaId: "",
    reservationId: "",
    batch: "",
    confirmation: "",
    checkIn: "",
    checkOut: "",
    softDescriptor: "",
    postingType: "",
    portfolio: "",
    documentId: "",
    zipCode: "",
    countryCode: "",
    otaDisplayName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
  });

  // MARK: Fetch Transaction Data
  // Explanation: Fetches paginated PayPal transaction data from API with filters applied.
  // Retrieves transactions based on current page, charge status, search term, and selected upload file.
  // Filters out partially charged records when "charged" filter is active for accurate reporting.
  // Manual Flow: Component loads → fetchData called → API request → Data displayed in table
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getRowData({
        limit,
        page: currentPage,
        chargeStatus,
        search:searchTerm,
        uploadId: selectedUploadId === "all" ? "" : selectedUploadId
      });

      // Filter out partially charged records when "charged" filter is selected
      const responseData = response.data as unknown as ApiResponse;
      if (chargeStatus.toLowerCase() === "charged") {
        responseData.rows = responseData.rows.filter(
          (row: RowData) => row["Charge status"].toLowerCase() === "charged"
        );
      }
      setData(responseData);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // MARK: Refresh Data Handler
  // Explanation: Triggers data refresh by incrementing refresh key, causing useEffect to re-run fetchData.
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // MARK: Fetch Upload Files
  // Explanation: Retrieves list of available upload files for the file filter dropdown.
  // Supports search functionality to filter files by name. Used for filtering transactions by upload batch.
  const fetchUploadFiles = async (search?: string) => {
    try {
      setIsLoadingFiles(true);
      const response = await apiClient.getUploadFiles({ search });
      setUploadFiles(response.data);
    } catch (error) {
      console.error("Failed to fetch upload files:", error);
      toast.error("Failed to load upload files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // MARK: Debounced File Search
  // Explanation: Debounces file search input to reduce API calls. Waits 300ms after user stops typing
  // before triggering the search API request. Improves performance and reduces server load.
  const debouncedSearchFiles = useCallback(
    useMemo(
      () => {
        let timeoutId: NodeJS.Timeout;
        return (searchValue: string) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            fetchUploadFiles(searchValue);
          }, 300); // 300ms delay
        };
      },
      []
    ),
    []
  );

  // MARK: Data Fetch Effect
  // Explanation: Automatically fetches transaction data when filters or pagination changes.
  // Triggers on: page change, charge status filter, refresh key, limit change, search term, or upload file selection
  useEffect(() => {
    fetchData();
  }, [currentPage, chargeStatus, refreshKey, limit, searchTerm, selectedUploadId]);

  // MARK: Initial Upload Files Load
  // Explanation: Loads upload files list on component mount for the file filter dropdown
  useEffect(() => {
    fetchUploadFiles();
  }, []);

  // MARK: File Search Effect
  // Explanation: Handles file search with debouncing. Clears search if empty, otherwise debounces the search.
  useEffect(() => {
    if (fileSearchTerm.trim() === "") {
      fetchUploadFiles();
    } else {
      debouncedSearchFiles(fileSearchTerm);
    }
  }, [fileSearchTerm, debouncedSearchFiles]);

  // MARK: Page Input Sync Effect
  // Explanation: Keeps page input value synchronized with current page when page changes programmatically
  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);


  // MARK: Currency Formatter
  // Explanation: Formats monetary amounts with proper currency symbols using Intl.NumberFormat.
  // Validates currency codes and falls back to USD for invalid codes. Ensures consistent currency display.
  const formatCurrency = (
    amount: string,
    currency: string | null | undefined
  ) => {
    // Provide fallback currency if null/undefined
    const safeCurrency = currency || "USD";

    // Validate currency code
    if (!safeCurrency || safeCurrency.length !== 3) {
      return `${safeCurrency || "USD"} ${parseFloat(amount).toFixed(2)}`;
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: safeCurrency,
      }).format(parseFloat(amount));
    } catch {
      // Fallback to USD if currency code is invalid
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(parseFloat(amount));
    }
  };

  // MARK: Status Color Helper
  // Explanation: Returns Tailwind CSS classes for badge styling based on charge status.
  // Maps payment statuses to color schemes: yellow for ready, green for charged, red for failed, blue for partial.
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

  // MARK: Payment Click Handler
  // Explanation: Prepares payment form with row data and opens PayPal checkout dialog.
  // Extracts card details, reservation info, and billing address from selected row.
  // Manual Flow: User clicks Pay → Form populated with row data → Checkout dialog opens → Payment processed
  const handlePaymentClick = (row: RowData) => {
    setFormData({
      cardNumber: row["Card Number"],
      expiryDate: row["Card Expire"],
      cvv: row["Card CVV"],
      amount: row["Amount to charge"],
      currency: row["Curency"],
      name: row["Name"],
      hotelName: row["Hotel Name"],
      expediaId: row["Expedia ID"],
      reservationId: row["Reservation ID"],
      batch: row["Batch"],
      confirmation: row["Hotel Confirmation Code"],
      checkIn: row["Check In"],
      checkOut: row["Check Out"],
      softDescriptor: row["Soft Descriptor"],
      postingType: row["Posting Type"],
      portfolio: row["Portfolio"],
      documentId: row.id,
      zipCode: row.otaId?.billingAddress?.zipCode || "",
      countryCode: row.otaId?.billingAddress?.countryCode || "",
      otaDisplayName: row.otaId?.displayName || "",
      addressLine1: row.otaId?.billingAddress?.addressLine1 || "",
      addressLine2: row.otaId?.billingAddress?.addressLine2 || "",
      city: row.otaId?.billingAddress?.city || "",
      state: row.otaId?.billingAddress?.state || "",
    });
    setShowCheckoutForm(true);
  };

  // MARK: Row Selection Handler
  // Explanation: Manages individual row selection for bulk operations using checkbox toggles.
  // Maintains Set of selected row IDs for bulk payment/refund operations.
  const handleRowSelection = (rowId: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }
    setSelectedRows(newSelectedRows);
  };

  // MARK: Select All Handler
  // Explanation: Toggles selection of all visible rows in current page for bulk operations.
  // Selects all rows when checked, clears all selections when unchecked.
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all rows (both chargeable and refundable)
      const allRowIds = data.rows.map((row) => row.id);
      setSelectedRows(new Set(allRowIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // MARK: Bulk Payment Handler
  // Explanation: Processes PayPal payments for multiple selected transactions simultaneously.
  // Filters selected rows to include only chargeable (non-charged) transactions before processing.
  // Shows loading toast during processing and refreshes data on completion.
  // Manual Flow: Select rows → Click Bulk Pay → System filters chargeable rows → API processes payments → Table refreshes
  const handleBulkPayment = async () => {
    try {
      const selectedRowsArray = Array.from(selectedRows);
      // filter the selectedIds to only include chargeable rows
      const chargeableRows = data.rows.filter(
        (row) =>
          selectedRowsArray.includes(row.id) &&
          row["Charge status"] !== "Charged"
      );

      if (chargeableRows.length === 0) {
        toast.error("No chargeable rows selected");
        return;
      }

      const finalSelectedRows = chargeableRows.map((row) => row.id);
      const loadingToastId = `bulk-payment-${Date.now()}`;
      setIsBulkPaymentLoading(true);

      toast.loading(
        `Starting bulk payment for ${chargeableRows.length} records...`,
        {
          id: loadingToastId,
          duration: Infinity,
          description: `Please do not refresh the page`,
        }
      );

      makeBulkPayment.mutate(finalSelectedRows, {
        onSuccess: () => {
          toast.dismiss(loadingToastId);
          setIsBulkPaymentLoading(false);
          setSelectedRows(new Set()); // Clear selected rows
          fetchData(); // Refresh data while maintaining pagination state
        },
        onError: () => {
          toast.dismiss(loadingToastId);
          setIsBulkPaymentLoading(false);
        },
      });
    } catch {
      toast.error("Failed to make bulk payment");
      setIsBulkPaymentLoading(false);
    }
  };

  // MARK: Bulk Refund Handler
  // Explanation: Processes PayPal refunds for multiple selected transactions simultaneously.
  // Filters selected rows to include only charged (refundable) transactions before processing.
  // Shows loading toast with warning not to refresh during processing, updates table on completion.
  // Manual Flow: Select charged rows → Click Bulk Refund → System filters refundable rows → API processes refunds → Table refreshes
  const handleBulkRefund = async () => {
    try {
      setIsBulkRefundLoading(true);

      const selectedRowsArray = Array.from(selectedRows);
      // filter the selectedIds to only include charged rows
      const chargeableRows = data.rows.filter(
        (row) =>
          selectedRowsArray.includes(row.id) &&
          row["Charge status"] === "Charged"
      );

      if (chargeableRows.length === 0) {
        toast.error("No refundable rows selected");
        setIsBulkRefundLoading(false);
        return;
      }

      const finalSelectedRows = chargeableRows.map((row) => row.id);
      const loadingToastId = `bulk-refund-${Date.now()}`;

      toast.loading(
        `Starting bulk refund for ${chargeableRows.length} records...`,
        {
          id: loadingToastId,
          duration: Infinity,
          description: `Please do not refresh the page`,
        }
      );

      makeBulkRefund.mutate(finalSelectedRows, {
        onSuccess: () => {
          toast.dismiss(loadingToastId);
          setIsBulkRefundLoading(false);
          setSelectedRows(new Set()); // Clear selected rows
          fetchData(); // Refresh data while maintaining pagination state
        },
        onError: () => {
          toast.dismiss(loadingToastId);
          setIsBulkRefundLoading(false);
        },
      });
    } catch {
      toast.error("Failed to make bulk refund");
      setIsBulkRefundLoading(false);
    }
  };

  // MARK: Refund Click Handler
  // Explanation: Opens refund confirmation dialog for a single transaction.
  // Sets the selected row data and displays confirmation dialog before processing refund.
  const handleRefundClick = (row: RowData) => {
    setRefundRowData(row);
    setShowRefundDialog(true);
  };

  // MARK: Refund Confirmation Handler
  // Explanation: Processes single PayPal refund after user confirmation.
  // Calls API to process refund, closes dialog on success, and refreshes transaction data.
  // Manual Flow: User clicks Refund → Confirmation dialog → User confirms → API processes refund → Dialog closes → Table refreshes
  const handleRefundConfirm = async () => {
    if (refundRowData) {
      try {
        setIsRefundLoading(true);
        await processRefund.mutateAsync(refundRowData.id);
        setShowRefundDialog(false);
        setRefundRowData(null);
        fetchData(); // Refresh the data
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to process refund"
        );
      } finally {
        setIsRefundLoading(false);
      }
    }
  };

  // MARK: Selection State Helpers
  // Explanation: Computed values to determine button states and selection status.
  // isAllSelected: Checks if all visible rows are selected
  // hasSelectedRefundableRows: Checks if any selected rows can be refunded (Charged status)
  // hasSelectedChargeableRows: Checks if any selected rows can be charged (non-Charged status)
  const isAllSelected =
    data.rows.length > 0 && selectedRows.size === data.rows.length;

  // Check if any selected rows are charged (refundable)
  // const hasSelectedChargedRows = Array.from(selectedRows).some((rowId) => {
  //   const row = data.rows.find((r) => r.id === rowId);
  //   return row && row["Charge status"] === "Charged";
  // });

  // Check if any selected rows are refundable (charged)
  const hasSelectedRefundableRows = Array.from(selectedRows).some((rowId) => {
    const row = data.rows.find((r) => r.id === rowId);
    return row && row["Charge status"] === "Charged";
  });

  // Check if any selected rows are chargeable (non-charged)
  const hasSelectedChargeableRows = Array.from(selectedRows).some((rowId) => {
    const row = data.rows.find((r) => r.id === rowId);
    return row && row["Charge status"] !== "Charged";
  });

  // MARK: Component Render
  // Explanation: Main render function for PayPal transaction management interface.
  // Displays header with action buttons, filters, file selector, and transaction table with pagination.
  return (
    <div className="min-h-[80vh]">
      {/* MARK: Header Section */}
      {/* Explanation: Page header with title showing active filter and description.
      Contains action buttons for creating single payments, exporting data, and bulk operations. */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Transaction Records for{" "}
              <span className="text-blue-600">
                {chargeStatus.charAt(0).toUpperCase() + chargeStatus.slice(1)}
              </span>{" "}
            </h1>
            <p className="text-gray-600">
              Manage and monitor payment transactions
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* MARK: Create Single Payment Button */}
            {/* Explanation: Opens modal for manually creating a single PayPal payment transaction */}
            <Button
              onClick={() => setShowSinglePaymentDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Single Payment
              <DollarSign className="h-4 w-4 mr-2" />
            </Button>

            {/* MARK: Export Single Payments Button */}
            {/* Explanation: Exports manually created single payment transactions to Excel file */}
            <Button
              onClick={() => exportManualExcelData.mutate()}
              className="bg-green-600 hover:bg-green-700"
              disabled={exportManualExcelData.isPending}
            >
              {exportManualExcelData.isPending ? (
                <>
                  Exporting...
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                </>
              ) : (
                <>
                  Export Single Payments
                  <Download className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {/* MARK: Bulk Payment Button */}
            {/* Explanation: Processes PayPal payments for all selected chargeable transactions.
            Shows count of chargeable rows in selection. Disabled if no chargeable rows selected. */}
            <Button
              onClick={handleBulkPayment}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!hasSelectedChargeableRows || isBulkPaymentLoading}
            >
              Make Bulk Payment{" "}
              {hasSelectedChargeableRows &&
                `(${
                  Array.from(selectedRows).filter((rowId) => {
                    const row = data.rows.find((r) => r.id === rowId);
                    return row && row["Charge status"] !== "Charged";
                  }).length
                })`}
              {isBulkPaymentLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4 ml-2" />
              )}
            </Button>

            {/* MARK: Bulk Refund Button */}
            {/* Explanation: Processes PayPal refunds for all selected charged transactions.
            Shows count of refundable rows in selection. Disabled if no refundable rows selected. */}
            <Button
              onClick={handleBulkRefund}
              className="bg-red-600 hover:bg-red-700"
              disabled={!hasSelectedRefundableRows || isBulkRefundLoading}
            >
              Make Bulk Refund{" "}
              {hasSelectedRefundableRows &&
                `(${
                  Array.from(selectedRows).filter((rowId) => {
                    const row = data.rows.find((r) => r.id === rowId);
                    return row && row["Charge status"] === "Charged";
                  }).length
                })`}
              {isBulkRefundLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* MARK: Statistics Cards Section */}
      {/* Explanation: Displays key metrics for current transaction view - Total Records, Unique Hotels, and Total Amount.
      Dynamically calculates based on visible rows after filters are applied. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Records Card */}
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <div className="text-xl font-bold text-gray-900">
                {data.pagination.totalCount}
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
                {new Set(data.rows.map((row) => row["Hotel Name"])).size}
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
                  data.rows
                    .reduce(
                      (sum, row) => sum + parseFloat(row["Amount to charge"]),
                      0
                    )
                    .toString(),
                  "USD"
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* MARK: Filters Section */}
      {/* Explanation: Provides search, file filtering, and charge status filtering functionality.
      Search: Filters transactions by guest name, hotel, or confirmation code
      File Filter: Dropdown to filter by specific upload file with search capability
      Status Filter: Dropdown to filter by charge status (All, Ready, Partially, Charged, Failed, Refunded) */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
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
            {/* MARK: File Filter Combobox */}
            {/* Explanation: Searchable dropdown to filter transactions by specific upload file.
            Shows "All Files" or selected file name. Supports search with debouncing for performance. */}
            <div className="flex items-center gap-4 w-full md:w-auto">
            <Popover open={fileComboboxOpen} onOpenChange={setFileComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={fileComboboxOpen}
                  className="w-[280px] justify-between"
                >
                  <span className="truncate">
                    {selectedUploadId === "all" 
                      ? "All Files"
                      : uploadFiles.find((file) => file.uploadId === selectedUploadId)?.fileName || "Select file..."
                    }
                  </span>
                  <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search files..." 
                    className="h-9"
                    value={fileSearchTerm}
                    onValueChange={setFileSearchTerm}
                  />
                  <CommandList className="max-h-[200px] overflow-y-auto">
                    <CommandEmpty>
                      {isLoadingFiles ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading files...
                        </div>
                      ) : (
                        "No files found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedUploadId("all");
                          setFileComboboxOpen(false);
                        }}
                      >
                        All Files
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedUploadId === "all" ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                      {uploadFiles.map((file) => (
                        <CommandItem
                          key={file._id}
                          value={file.uploadId}
                          onSelect={() => {
                            setSelectedUploadId(file.uploadId);
                            setFileComboboxOpen(false);
                          }}
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">{file.fileName}</span>
                            {file.user?.name && (
                              <span className="text-xs text-gray-500 truncate">
                                by {file.user.name}
                              </span>
                            )}
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 flex-shrink-0",
                              selectedUploadId === file.uploadId ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {/* MARK: Status and View Controls */}
          {/* Explanation: Control buttons for filtering by charge status, toggling card visibility, and refreshing data */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* MARK: Charge Status Filter */}
            {/* Explanation: Dropdown to filter transactions by payment status
            Options: All, Ready to charge, Partially charged, Charged, Refunded, Failed, Declined */}
            <Select value={chargeStatus} onValueChange={setChargeStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Ready to charge">Ready to charge</SelectItem>
                <SelectItem value="Partially charged">
                  Partially charged
                </SelectItem>
                <SelectItem value="Charged">Charged</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
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

            {/* MARK: Refresh Data Button */}
            {/* Explanation: Manually refreshes transaction data from the API */}
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

      {/* MARK: Transactions Table */}
      {/* Explanation: Main data table displaying PayPal transactions with all details.
      Columns: Checkbox, Expedia ID, Batch, Hotel, Reservation ID, Check In/Out, Amount, File Name, Card Details, Status, Actions
      Supports row selection for bulk operations, card detail masking, and individual transaction actions. */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm ps-4">
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
                <TableHead>Reservation ID</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Card Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* MARK: Loading State */}
              {/* Explanation: Displays skeleton placeholders while transaction data is being fetched */}
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {Array(10)
                        .fill(0)
                        .map((_, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : data.rows.length === 0 ? (
                // MARK: Empty State
                // Explanation: Displays friendly message when no transactions match the current filters
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
                // MARK: Transaction Data Rows
                // Explanation: Renders each transaction row with all details and action buttons.
                // Includes client-side filtering by guest name, hotel name, or confirmation code.
                data.rows
                  .filter(
                    (row) =>
                      searchTerm === "" ||
                      row["Name"]
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      row["Hotel Name"]
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      row["Hotel Confirmation Code"].includes(searchTerm)
                  )
                  .map((row: RowData) => {
                    return (
                      <TableRow key={row.id} className="hover:bg-gray-50/50">
                        {/* Selection Checkbox */}
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) =>
                              handleRowSelection(row.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        {/* Expedia ID */}
                        <TableCell className="font-mono">
                          {row["Expedia ID"]}
                        </TableCell>
                        {/* Batch Number */}
                        <TableCell className="font-mono">
                          {row["Batch"]}
                        </TableCell>
                        {/* Hotel Information */}
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
                        {/* Reservation ID */}
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
                            <span>
                              {formatCheckInOutDate(row["Check Out"])}
                            </span>
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
                            className={getStatusColor(row["Charge status"])}
                          >
                            {row["Charge status"]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center flex items-center justify-center gap-2">
                          {[
                            "ready to charge",
                            "partially charged",
                            "refunded",
                            "failed",
                            "declined",
                          ].includes(
                            row["Charge status"]?.toLowerCase().trim()
                          ) ? (
                            <>
                              <Button
                                variant={"outline"}
                                size="sm"
                                className="p-2 hover:bg-blue-700 w-fit bg-blue-600 text-white hover:text-white flex-1"
                                onClick={() => handlePaymentClick(row)}
                              >
                                {["failed", "declined"].includes(
                                  row["Charge status"]?.toLowerCase().trim()
                                )
                                  ? "Charge Again"
                                  : "Make Payment"}
                                <ArrowRight className="h-4 w-4 text-white" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-end justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="p-2 hover:bg-blue-100 w-1/2"
                                onClick={() => {
                                  setSelectedRow(row);
                                  setShowViewDialog(true);
                                }}
                              >
                                Details
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="p-2 w-1/2"
                                onClick={() => handleRefundClick(row)}
                              >
                                Refund
                                <RefreshCcw className="h-4 w-4 " />
                              </Button>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-2 hover:bg-blue-100 w-fit"
                            onClick={() => {
                              setSelectedRow(row);
                              setShowEditDialog(true);
                              // setShowViewDialog(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4 text-blue-600" />
                          </Button>
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
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <span>Page</span>
              <Input
                type="number"
                min="1"
                max={data.pagination.totalPages}
                value={pageInputValue}
                onChange={(e) => {
                  setPageInputValue(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(e.currentTarget.value);
                    if (page >= 1 && page <= data.pagination.totalPages) {
                      setCurrentPage(page);
                    } else {
                      // Reset to current page if invalid
                      setPageInputValue(currentPage.toString());
                    }
                  }
                }}
                onBlur={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= data.pagination.totalPages) {
                    setCurrentPage(page);
                  } else {
                    // Reset to current page if invalid
                    setPageInputValue(currentPage.toString());
                  }
                }}
                className="w-16 h-8 text-center text-sm"
              />
              <span>of {data.pagination.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(data.pagination.totalPages, p + 1)
                )
              }
              disabled={currentPage === data.pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <PaypalTransactionDetailsModal
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        rowData={selectedRow}
      />
      <EditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        rowData={selectedRow}
        onSuccess={fetchData}
        paymentGateway="paypal"
      />

      <RefundConfirmationDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        rowData={refundRowData}
        onConfirm={handleRefundConfirm}
        isLoading={isRefundLoading}
      />

      {/* Replace the old checkout form with the new shared component */}
      <CheckoutForm
        open={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        formData={formData}
        showCardDetails={showCardDetails}
        onSuccess={fetchData}
      />
      
      {/* create single payment modal */}
      <CreateSinglePaymentModal
        open={showSinglePaymentDialog}
        onOpenChange={setShowSinglePaymentDialog}
        onSuccess={fetchData}
      />
    </div>
  );
}
