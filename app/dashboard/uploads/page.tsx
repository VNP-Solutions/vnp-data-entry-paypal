"use client";

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
} from "@/lib/hooks/use-api";
import { toast } from "sonner";
import TemplateDownload from "@/components/pages/uploads/template-download";

interface UploadSession {
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

export default function UploadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  // React Query hooks
  const { data, isLoading, refetch } = useUploadSessions(currentPage, limit, searchTerm);
  const retryUploadMutation = useRetryUpload();
  // const discardUploadMutation = useDiscardUpload()
  const downloadReportMutation = useDownloadReport();
  const deleteFileMutation = useDeleteFile();

  const handleRetryUpload = async (uploadId: string) => {
    await retryUploadMutation.mutateAsync(uploadId);
  };

  // const handleDiscardUpload = async (uploadId: string) => {
  //   await discardUploadMutation.mutateAsync(uploadId)
  // }

  const handleDeleteFile = async (uploadId: string) => {
    try {
      toast.loading("Deleting file with all entries, please wait..");
      await deleteFileMutation.mutateAsync(uploadId);
    } catch {
      toast.dismiss();
    }
  };

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

  return (
    <div className="min-h-[80vh]">
      {/* Header Section */}
      <TemplateDownload />
      {/* Stats Cards */}
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

      {/* Filters Section */}
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

      {/* Table Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm ps-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>File Name</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Charge Progress</TableHead>
                <TableHead className="text-center">Uploaded At</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                          <span>{session.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium capitalize">
                        {session.paymentGateway}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(session.status)}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            <span>{session.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="">
                        <span>
                          {session.chargedCount} charged out of{" "}
                          {session.processedRows} entries
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
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

        {/* Pagination */}
        {data && pagination && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-4">
              
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
              <div className="text-sm text-gray-600">
                Showing {sessions.length} of {pagination.total} sessions
              </div>
            </div>
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
