"use client";

// MARK: Import Dependencies
// Explanation: Imports all required UI components, icons, hooks, and utilities for the uploads management page.
// This includes table components, form elements, icons from lucide-react, API hooks, and date formatting utilities.
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  FileSpreadsheet,
  RefreshCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  MoreVertical,
  RefreshCw,
  Trash2,
  DownloadCloud,
  Archive,
  X,
  BadgeCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  useUploadSessions,
  useRetryUpload,
  useDownloadReport,
  useDeleteFile,
  useArchiveUnarchiveFile,
} from "@/lib/hooks/use-api";
import { toast } from "sonner";
import TemplateDownload from "@/components/pages/uploads/template-download";

// MARK: TypeScript Interfaces
// Explanation: Defines the data structure for upload sessions and API responses.
// UploadSession represents a single file upload with its metadata, status, and progress information.
// UploadSessionsResponse wraps the sessions array with pagination metadata for efficient data loading.
interface UploadSession {
  archive: boolean;
  uploadId: string;
  fileName: string;
  status: string;
  totalRows: number;
  processedRows: number;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  vnpWorkId: string | null;
  chargedCount: number;
  paymentGateway: "stripe" | "paypal";
}

interface UploadSessionsResponse {
  sessions: UploadSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// MARK: Uploads Page Component
// Explanation: Main component for managing file uploads and viewing upload sessions.
// Displays a paginated table of upload sessions with filtering, search, and action capabilities.
// Provides statistics cards showing upload status distribution (completed, processing, failed).
export default function UploadsPage() {
  // MARK: State Management
  // Explanation: Manages pagination, filtering, and search functionality for the uploads table.
  // currentPage: Current page number for pagination
  // limit: Number of records to display per page
  // searchTerm: Filter text for searching uploads by filename
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  // MARK: API Hooks Integration
  // Explanation: React Query hooks for data fetching and mutations.
  // useUploadSessions: Fetches paginated upload sessions with search filtering
  // Mutation hooks: Handle upload retry, report download, file deletion, and archive operations
  const { data, isLoading, refetch } = useUploadSessions(
    currentPage,
    limit,
    searchTerm
  );
  const retryUploadMutation = useRetryUpload();
  // const discardUploadMutation = useDiscardUpload()
  const downloadReportMutation = useDownloadReport();
  const deleteFileMutation = useDeleteFile();
  const archiveUnarchiveFileMutation = useArchiveUnarchiveFile();

  // MARK: Retry Upload Handler
  // Explanation: Retries a failed upload session by re-triggering the upload processing.
  // This is useful when an upload fails due to temporary issues or network problems.
  const handleRetryUpload = async (uploadId: string) => {
    await retryUploadMutation.mutateAsync(uploadId);
  };

  // const handleDiscardUpload = async (uploadId: string) => {
  //   await discardUploadMutation.mutateAsync(uploadId)
  // }

  // MARK: Delete File Handler
  // Explanation: Permanently deletes an upload file along with all its associated entries from the database.
  // Shows loading toast during deletion and dismisses on completion or error.
  // Manual Flow: User clicks Delete File → Confirmation → File and all entries removed from database
  const handleDeleteFile = async (uploadId: string) => {
    try {
      toast.loading("Deleting file with all entries, please wait..");
      await deleteFileMutation.mutateAsync(uploadId);
    } catch {
      toast.dismiss();
    }
  };

  // MARK: Download Report Handler
  // Explanation: Downloads a detailed report for a completed upload session.
  // Report includes processing results, charged entries, and any errors encountered.
  // Manual Flow: User clicks Download Report → Browser downloads CSV/Excel file with upload details
  const handleDownloadReport = async (uploadId: string) => {
    try {
      toast.loading(
        "Downloading report, Make sure popup is not blocked by browser"
      );
      await downloadReportMutation.mutateAsync(uploadId);
    } finally {
      toast.dismiss();
    }
  };

  // MARK: Archive/Unarchive File Handler
  // Explanation: Toggles the archive status of an upload file.
  // Archived files are hidden from main view but can be restored later.
  // Manual Flow: User clicks Archive/Unarchive → File status updated → Success message shown
  const handleArchiveUnarchiveFile = async (
    uploadId: string,
    archive: boolean
  ) => {
    try {
      toast.loading(
        archive
          ? "Unarchiving file, please wait.."
          : "Archiving file, please wait.."
      );
      const response = await archiveUnarchiveFileMutation.mutateAsync({
        uploadId,
        archive,
      });
      toast.success(response.message);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to archive/unarchive file"
      );
    } finally {
      toast.dismiss();
    }
  };

  // MARK: Status Color Helper
  // Explanation: Returns Tailwind CSS classes for badge styling based on upload status.
  // Maps status strings to appropriate color schemes: green for completed, yellow for processing, red for failed.
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // MARK: Status Icon Helper
  // Explanation: Returns appropriate icon component based on upload status.
  // Visual indicators: CheckCircle for completed, Clock for processing, XCircle for failed.
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // MARK: Data Processing & Statistics
  // Explanation: Extracts and processes upload session data from API response.
  // Calculates statistics for completed, processing, and failed uploads to display in stats cards.
  // responseData: Parsed API response with sessions and pagination metadata
  const responseData = data?.data as UploadSessionsResponse | undefined;
  const sessions = responseData?.sessions || [];
  const completedCount = sessions.filter(
    (session: UploadSession) => session.status.toLowerCase() === "completed"
  ).length;
  const processingCount = sessions.filter(
    (session: UploadSession) => session.status.toLowerCase() === "processing"
  ).length;
  const failedCount = sessions.filter(
    (session: UploadSession) => session.status.toLowerCase() === "failed"
  ).length;
  const pagination = responseData?.pagination;

  // MARK: Component Render
  // Explanation: Main render function for the uploads page layout.
  // Displays template download section, statistics cards, filters, and upload sessions table with pagination.
  return (
    <div className="min-h-[80vh]">
      {/* MARK: Template Download Section */}
      {/* Explanation: Component allowing users to download CSV template for bulk uploads */}
      <TemplateDownload />
      
      {/* MARK: Statistics Cards Section */}
      {/* Explanation: Displays overview metrics for uploads - Total Files, Completed, Processing, and Failed counts.
      Each card shows an icon, label, and dynamic count with skeleton loading state. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <div className="text-xl font-bold text-gray-900">
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  sessions.length
                )}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <div className="text-xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-16" /> : completedCount}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <div className="text-xl font-bold text-gray-900">
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  processingCount
                )}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <div className="text-xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-16" /> : failedCount}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* MARK: Filters Section */}
      {/* Explanation: Provides search and refresh functionality for the uploads table.
      Users can search by filename and manually refresh data using the refresh button. */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="w-10 h-10 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* MARK: Upload Sessions Table */}
      {/* Explanation: Main data table displaying all upload sessions with their details.
      Columns: File Name, Payment Gateway, Status, Charge Progress, Archive Status, Upload Time, Actions.
      Includes loading skeletons, empty state, and row actions dropdown menu. */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm ps-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>File Name</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Charge Progress</TableHead>
                <TableHead>Archive Status</TableHead>
                <TableHead className="text-start">Uploaded At</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* MARK: Loading State */}
              {/* Explanation: Displays skeleton placeholders while data is being fetched from the API.
              Shows 5 rows with 6 skeleton cells each to maintain table structure during loading. */}
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {Array(6)
                        .fill(0)
                        .map((_, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : sessions.length === 0 ? (
                // MARK: Empty State
                // Explanation: Displays a friendly message when no upload sessions are found.
                // Shows upload icon and prompts user to upload a new file.
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="text-lg font-medium">
                        No upload sessions found
                      </p>
                      <p className="text-sm">Try uploading a new file</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // MARK: Upload Sessions Data Rows
                // Explanation: Renders each upload session as a table row with all relevant information.
                // Includes client-side search filtering by filename before displaying.
                // Each row shows file details, status, progress, and action menu.
                sessions
                  .filter((session: UploadSession) =>
                    session.fileName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((session: UploadSession) => (
                    <TableRow
                      key={session.uploadId}
                      className="hover:bg-gray-50/50"
                    >
                      {/* MARK: File Name Cell */}
                      {/* Explanation: Displays the uploaded filename with a spreadsheet icon */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                          <span>{session.fileName}</span>
                        </div>
                      </TableCell>

                      {/* MARK: Payment Gateway Cell */}
                      {/* Explanation: Shows which payment gateway (Stripe/PayPal) is used for this upload */}
                      <TableCell className="font-medium capitalize">
                        {session.paymentGateway}
                      </TableCell>

                      {/* MARK: Status Badge Cell */}
                      {/* Explanation: Visual status indicator with color-coded badge and icon.
                      Shows current processing state: Completed, Processing, or Failed */}
                      <TableCell>
                        <Badge className={getStatusColor(session.status)}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            <span>{session.status}</span>
                          </div>
                        </Badge>
                      </TableCell>

                      {/* MARK: Charge Progress Cell */}
                      {/* Explanation: Displays charging progress showing how many entries were successfully charged
                      out of total processed entries. Format: "X charged out of Y entries" */}
                      <TableCell className="">
                        <span>
                          {session.chargedCount} charged out of{" "}
                          {session.processedRows} entries
                        </span>
                      </TableCell>

                      {/* MARK: Archive Status Cell */}
                      {/* Explanation: Shows whether the file is archived or active.
                      Archived files are hidden from main view but can be restored. */}
                      <TableCell className="text-start">
                        <Badge
                          className={getStatusColor(
                            session.archive ? "archived" : "unarchived"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <p>
                              {session.archive ? (
                                <span className="flex items-center gap-2">
                                  <Archive className="h-4 w-4 text-red-600" />
                                  Archived
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <BadgeCheck className="h-4 w-4 text-green-600" />
                                  Unarchived
                                </span>
                              )}
                            </p>
                          </div>
                        </Badge>
                      </TableCell>

                      {/* MARK: Upload Date Cell */}
                      {/* Explanation: Displays formatted upload date and time.
                      Shows date in "MMM d, yyyy" format and time in 24-hour format below. */}
                      <TableCell className="text-start">
                        {session.startedAt ? (
                          <div className="text-sm">
                            {format(new Date(session.startedAt), "MMM d, yyyy")}
                            <div className="text-xs text-gray-500">
                              {format(new Date(session.startedAt), "HH:mm:ss")}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* MARK: Actions Dropdown Menu */}
                      {/* Explanation: Provides action menu for each upload session with multiple operations.
                      Actions: Download Report, Retry Upload, Archive/Unarchive, Delete File.
                      Each action has conditional logic based on upload status. */}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 outline-none border-none"
                            >
                              <MoreVertical className="h-4 w-4 text-blue-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* MARK: Download Report Action */}
                            {/* Explanation: Downloads detailed report for completed uploads.
                            Only available for completed uploads - shows error for failed uploads.
                            Manual Flow: Click Download Report → Browser downloads CSV/Excel with upload details */}
                            <DropdownMenuItem
                              onClick={() => {
                                if (session.status.toLowerCase() === "failed") {
                                  toast.error(
                                    "This action only works for completed uploads"
                                  );
                                } else {
                                  handleDownloadReport(session.uploadId);
                                }
                              }}
                              className="flex items-center gap-2 text-gray-600 cursor-pointer p-2 hover:bg-blue-100"
                            >
                              <DownloadCloud className="h-4 w-4" />
                              <span>Download Report</span>
                            </DropdownMenuItem>

                            {/* MARK: Retry Upload Action */}
                            {/* Explanation: Retries processing for failed uploads.
                            Only available for failed uploads - shows error for completed/processing uploads.
                            Manual Flow: Click Retry Upload → System reprocesses the file → Status updated */}
                            <DropdownMenuItem
                              onClick={() => {
                                if (session.status.toLowerCase() === "failed") {
                                  handleRetryUpload(session.uploadId);
                                } else {
                                  toast.error(
                                    "This action only works for failed uploads"
                                  );
                                }
                              }}
                              className="flex items-center gap-2 text-gray-600 cursor-pointer p-2 hover:bg-blue-100"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Retry Upload</span>
                            </DropdownMenuItem>

                            {/* MARK: Archive/Unarchive File Action */}
                            {/* Explanation: Toggles archive status to hide/show files from main view.
                            Dynamically shows "Archive" or "Unarchive" based on current status.
                            Manual Flow: Click Archive/Unarchive → File status toggled → Success message shown */}
                            <DropdownMenuItem
                              onClick={() => {
                                handleArchiveUnarchiveFile(
                                  session.uploadId,
                                  session.archive
                                );
                              }}
                              className="flex items-center gap-2 hover:text-white text-gray-600 cursor-pointer p-2 hover:bg-black"
                            >
                              {session.archive ? (
                                <BadgeCheck className="h-4 w-4 " />
                              ) : (
                                <Archive className="h-4 w-4 " />
                              )}
                              <span className="capitalize">
                                {session.archive
                                  ? "Unarchive File"
                                  : "Archive File"}
                              </span>
                            </DropdownMenuItem>

                            {/* MARK: Delete File Action */}
                            {/* Explanation: Permanently deletes the upload file and all associated entries.
                            Destructive action styled in red - cannot be undone.
                            Manual Flow: Click Delete File → Confirmation → File removed from database permanently */}
                            <DropdownMenuItem
                              onClick={() => {
                                handleDeleteFile(session.uploadId);
                                // handleDiscardUpload(session.uploadId);
                              }}
                              className="flex items-center gap-2 text-red-600 cursor-pointer p-2 hover:bg-red-700! hover:text-white!"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete File</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* MARK: Pagination Controls */}
        {/* Explanation: Provides pagination controls for navigating through upload sessions.
        Left side: Items per page selector (10, 20, 50, 100) and showing count summary
        Right side: Previous/Next page buttons with current page indicator
        Pagination resets to page 1 when changing items per page limit */}
        {data && pagination && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-4">
              {/* MARK: Items Per Page Selector */}
              {/* Explanation: Dropdown to change number of items displayed per page.
              Automatically resets to page 1 when limit is changed. */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* MARK: Pagination Summary */}
              {/* Explanation: Displays count of currently visible sessions vs total sessions */}
              <div className="text-sm text-gray-600">
                Showing {sessions.length} of {pagination.total} sessions
              </div>
            </div>
            {/* MARK: Page Navigation Buttons */}
            {/* Explanation: Previous/Next buttons for page navigation with disabled states.
            Shows current page number and total pages. Buttons disabled at boundaries. */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={currentPage === pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
