"use client";

// MARK: Import Dependencies
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
  Loader2,
  PencilIcon,
  Check,
  ChevronsUpDown,
  Zap,
  ArrowRight,
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
import { formatCheckInOutDate, formatLongString } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QpTransactionDetailsModal from "./qp-transaction-details-modal";
import QpEditInstanceModal from "./qp-edit-instance-modal";
import { QPChargeInstance, ViewDialogProps } from "./types";

// MARK: TypeScript Interfaces
interface ApiResponse {
  rows: QPChargeInstance[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  stats?: {
    uniqueHotels: number;
    totalAmount: number;
  };
  filters: {
    status: string;
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

// MARK: QP Payment Page Component
interface QpPaymentPageComponentProps {
  initialChargeFileId?: string;
}

export default function QpPaymentPageComponent({
  initialChargeFileId,
}: QpPaymentPageComponentProps = {}) {
  // MARK: State Management - Data & Loading
  const [data, setData] = useState<ApiResponse>({
    rows: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    },
    stats: undefined,
    filters: {
      status: "All",
      search: null,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkProcessingLoading, setIsBulkProcessingLoading] = useState(false);

  // MARK: State Management - Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pageInputValue, setPageInputValue] = useState("1");
  const [status, setStatus] = useState("All");
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // MARK: State Management - File Upload Selection
  const [selectedChargeFileId, setSelectedChargeFileId] =
    useState<string>("all");
  const [chargeFiles, setChargeFiles] = useState<
    Array<{ _id: string; charge_file_id: string; file_name: string }>
  >([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileComboboxOpen, setFileComboboxOpen] = useState(false);
  const [fileSearchTerm, setFileSearchTerm] = useState("");

  // MARK: State Management - Dialog & Modal States
  const [selectedRow, setSelectedRow] = useState<QPChargeInstance | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [processingRowId, setProcessingRowId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<QPChargeInstance | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // MARK: Fetch Transaction Data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getQPChargeInstances({
        limit,
        page: currentPage,
        status: status === "All" ? undefined : status,
        search: debouncedSearchTerm || undefined,
        chargeFileId:
          selectedChargeFileId === "all" ? undefined : selectedChargeFileId,
      });

      // normalize various response shapes
      let allRows: QPChargeInstance[] = [];
      let paginationInfo = {
        currentPage,
        totalPages: 1,
        totalCount: 0,
        limit,
      };

      let stats: ApiResponse["stats"] = undefined;
      if (response && typeof response === "object") {
        if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray((response.data as any).rows) &&
          (response.data as any).pagination
        ) {
          // backend-supplied pagination
          allRows = (response.data as any).rows;
          paginationInfo = (response.data as any).pagination;
          if ((response.data as any).stats) {
            stats = (response.data as any).stats;
          }
        } else if (Array.isArray(response.data)) {
          // backend returned raw array
          allRows = response.data as QPChargeInstance[];
        } else if (Array.isArray(response)) {
          allRows = response as unknown as QPChargeInstance[];
        }
      } else if (Array.isArray(response)) {
        allRows = response as unknown as QPChargeInstance[];
      }

      // if backend didn't paginate, perform client-side slicing
      if (paginationInfo.totalCount === 0) {
        const total = allRows.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        paginationInfo = {
          currentPage,
          totalPages,
          totalCount: total,
          limit,
        };
        const start = (currentPage - 1) * limit;
        allRows = allRows.slice(start, start + limit);
      }

      const responseData: ApiResponse = {
        rows: allRows,
        pagination: paginationInfo,
        stats,
        filters: {
          status,
          search: searchTerm || null,
        },
      };

      setData(responseData);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // MARK: Refresh Data Handler
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // MARK: Fetch Charge Files
  const fetchChargeFiles = async (search?: string) => {
    try {
      setIsLoadingFiles(true);
      const response = await apiClient.getQPChargeFiles({ search });
      const raw = response.data || [];
      const filesData = raw.map(
        (f: { _id: string; charge_file_id?: string; file_name: string }) => ({
          _id: f._id,
          charge_file_id: f.charge_file_id ?? f._id,
          file_name: f.file_name,
        }),
      );
      setChargeFiles(filesData);
    } catch (error) {
      console.error("Failed to fetch charge files:", error);
      toast.error("Failed to load charge files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // MARK: Debounced File Search
  const debouncedSearchFiles = useCallback(
    useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (searchValue: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchChargeFiles(searchValue);
        }, 300);
      };
    }, []),
    [],
  );

  // Debounce search term so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [status, selectedChargeFileId, debouncedSearchTerm]);

  // MARK: Data Fetch Effect
  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    status,
    refreshKey,
    limit,
    debouncedSearchTerm,
    selectedChargeFileId,
  ]);

  // MARK: Initial Charge Files Load
  useEffect(() => {
    fetchChargeFiles();
  }, []);

  // MARK: Apply initialChargeFileId from URL (e.g. from File History "Open in QP Payment")
  useEffect(() => {
    if (!initialChargeFileId || chargeFiles.length === 0) return;
    const exists = chargeFiles.some(
      (f) => f._id === initialChargeFileId || f.charge_file_id === initialChargeFileId,
    );
    if (exists) setSelectedChargeFileId(initialChargeFileId);
  }, [initialChargeFileId, chargeFiles]);

  // MARK: File Search Effect
  useEffect(() => {
    if (fileSearchTerm.trim() === "") {
      fetchChargeFiles();
    } else {
      debouncedSearchFiles(fileSearchTerm);
    }
  }, [fileSearchTerm, debouncedSearchFiles]);

  // MARK: Page Input Sync Effect
  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);

  // MARK: Currency Formatter
  const formatCurrency = (amount: number | string, currency?: string) => {
    const safeCurrency = currency || "USD";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (!safeCurrency || safeCurrency.length !== 3) {
      return `${safeCurrency || "USD"} ${numAmount.toFixed(2)}`;
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: safeCurrency,
      }).format(numAmount);
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(numAmount);
    }
  };

  // MARK: Status Color Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "INVALID":
        return "bg-orange-100 text-orange-800";
      case "SKIPPED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // MARK: Row Selection Handler
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
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRowIds = data.rows.map((row) => row._id);
      setSelectedRows(new Set(allRowIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // MARK: Bulk Processing Handler
  const handleBulkProcess = async () => {
    try {
      const selectedRowsArray = Array.from(selectedRows);
      const pendingRows = data.rows.filter(
        (row) =>
          selectedRowsArray.includes(row._id) && row.status === "PENDING",
      );

      if (pendingRows.length === 0) {
        toast.error("No pending rows selected");
        return;
      }

      const finalSelectedRows = pendingRows.map((row) => row._id);
      const loadingToastId = `bulk-process-${Date.now()}`;
      setIsBulkProcessingLoading(true);

      toast.loading(
        `Starting bulk processing for ${pendingRows.length} records...`,
        {
          id: loadingToastId,
          duration: Infinity,
          description: `Please do not refresh the page`,
        },
      );

      await apiClient.processQPBulkCharges(finalSelectedRows);

      toast.dismiss(loadingToastId);
      setIsBulkProcessingLoading(false);
      setSelectedRows(new Set());
      fetchData();
      toast.success(`Successfully processed ${pendingRows.length} charges`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process charges");
      setIsBulkProcessingLoading(false);
    }
  };

  // MARK: Selection State Helpers
  const isAllSelected =
    data.rows.length > 0 && selectedRows.size === data.rows.length;

  const hasSelectedProcessableRows = Array.from(selectedRows).some((rowId) => {
    const row = data.rows.find((r) => r._id === rowId);
    return row && row.status === "PENDING";
  });

  // MARK: Pagination Helpers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= data.pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageInputChange = (value: string) => {
    setPageInputValue(value);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInputValue);
    if (page >= 1 && page <= data.pagination.totalPages) {
      setCurrentPage(page);
    } else {
      setPageInputValue(currentPage.toString());
      toast.error(
        `Please enter a page number between 1 and ${data.pagination.totalPages}`,
      );
    }
  };

  const getRecordRange = () => {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, data.pagination.totalCount);
    return { start, end };
  };

  const isDeclinedOrError = (row: QPChargeInstance) =>
    row.status === "DECLINED" || row.status === "ERROR";

  const handleChargeAgain = async (row: QPChargeInstance) => {
    try {
      setProcessingRowId(row._id);
      await apiClient.processQPBulkCharges([row._id]);
      toast.success("Charge submitted");
      fetchData();
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String((error.response.data as { message?: string }).message)
          : "Failed to process charge";
      toast.error(msg);
    } finally {
      setProcessingRowId(null);
    }
  };

  // MARK: Component Render
  return (
    <div className="min-h-[80vh]">
      {/* MARK: Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              QP Charge Records for{" "}
              <span className="text-blue-600">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>{" "}
            </h1>
            <p className="text-gray-600">
              Manage and process QuantumPay charge transactions
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* MARK: Bulk Process Button */}
            <Button
              onClick={handleBulkProcess}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!hasSelectedProcessableRows || isBulkProcessingLoading}
            >
              Process Charges{" "}
              {hasSelectedProcessableRows &&
                `(${
                  Array.from(selectedRows).filter((rowId) => {
                    const row = data.rows.find((r) => r._id === rowId);
                    return row && row.status === "PENDING";
                  }).length
                })`}
              {isBulkProcessingLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* MARK: Statistics Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building2 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Hotels</p>
              <div className="text-xl font-bold text-gray-900">
                {data.stats?.uniqueHotels ??
                  new Set(data.rows.map((row) => row.hotel_id)).size}
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
                  data.stats?.totalAmount ??
                    data.rows.reduce(
                      (sum, row) => sum + (row.amount_numeric || 0),
                      0,
                    ),
                  "USD",
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* MARK: Filters Section */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* MARK: Search Input */}
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by hotel ID, user, or reservation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* MARK: File Filter Combobox */}
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
                    {selectedChargeFileId === "all"
                      ? "All Files"
                      : chargeFiles.find(
                          (file) =>
                            file.charge_file_id === selectedChargeFileId,
                        )?.file_name || "Select file..."}
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
                          setSelectedChargeFileId("all");
                          setFileComboboxOpen(false);
                        }}
                      >
                        All Files
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedChargeFileId === "all"
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                      {chargeFiles.map((file) => (
                        <CommandItem
                          key={file._id}
                          value={file.charge_file_id}
                          onSelect={() => {
                            setSelectedChargeFileId(file.charge_file_id);
                            setFileComboboxOpen(false);
                          }}
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">
                              {file.file_name}
                            </span>
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 flex-shrink-0",
                              selectedChargeFileId === file.charge_file_id
                                ? "opacity-100"
                                : "opacity-0",
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

          {/* MARK: Status Filter */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="DECLINED">Declined</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="INVALID">Invalid</SelectItem>
                <SelectItem value="SKIPPED">Skipped</SelectItem>
              </SelectContent>
            </Select>

            {/* MARK: Refresh Data Button */}
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
                <TableHead>Hotel ID</TableHead>
                <TableHead>Reservation ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Card Last 4</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-px whitespace-nowrap">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {Array(8)
                        .fill(0)
                        .map((_, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileSpreadsheet className="h-8 w-8 mb-2" />
                      <p className="text-lg font-medium">No records found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((row: QPChargeInstance) => (
                  <TableRow key={row._id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(row._id)}
                        onCheckedChange={(checked) =>
                          handleRowSelection(row._id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono">{row.hotel_id}</TableCell>
                    <TableCell>{row.reservation_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User2 className="h-4 w-4 text-gray-400" />
                        <span>{row.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {formatCurrency(row.amount_numeric, row.currency)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <p className="text-sm">****{row.card_last4}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-pointer">
                            {formatLongString(row.parent_file_name, 15)}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{row.parent_file_name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right w-px whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 h-8 gap-1.5"
                          onClick={() => {
                            setSelectedRow(row);
                            setShowViewDialog(true);
                          }}
                        >
                          Details
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        {isDeclinedOrError(row) && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-8 gap-1.5 px-3"
                            onClick={() => handleChargeAgain(row)}
                            disabled={
                              processingRowId === row._id ||
                              isBulkProcessingLoading
                            }
                          >
                            {processingRowId === row._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Charge Again
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700"
                          onClick={() => {
                            setEditRow(row);
                            setShowEditModal(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {getRecordRange().start}-{getRecordRange().end} of{" "}
            {data.pagination.totalCount} entries
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                const newLimit = parseInt(value);
                setLimit(newLimit);
                setCurrentPage(1); // Reset to first page when limit changes
              }}
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

            {/* First Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="Go to first page"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
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
                onChange={(e) => handlePageInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePageInputSubmit();
                  }
                }}
                onBlur={() => {
                  const page = parseInt(pageInputValue);
                  if (page >= 1 && page <= data.pagination.totalPages) {
                    handlePageChange(page);
                  } else {
                    setPageInputValue(currentPage.toString());
                  }
                }}
                className="w-16 h-8 text-center text-sm"
                placeholder="1"
              />
              <span>of {data.pagination.totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.pagination.totalPages)}
              disabled={currentPage === data.pagination.totalPages}
              title="Go to last page"
            >
              <ChevronRight className="h-4 w-4 -mr-2" />
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <QpTransactionDetailsModal
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        rowData={selectedRow}
      />
      <QpEditInstanceModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        rowData={editRow}
        onSuccess={fetchData}
      />
    </div>
  );
}
