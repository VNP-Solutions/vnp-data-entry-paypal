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
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/client-api-call"
import { toast } from "sonner"
import { format } from "date-fns"

interface UploadSession {
  uploadId: string;
  fileName: string;
  status: string;
  totalRows: number;
  processedRows: number;
  progress: number;
  startedAt: string;
  completedAt: string;
  vnpWorkId: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function UploadsPage() {
  const [data, setData] = useState<{
    sessions: UploadSession[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>({
    sessions: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 1
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getUploadSessions(currentPage)
      setData(response.data)
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to fetch upload sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, refreshKey])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleRetryUpload = async (uploadId: string) => {
    try {
      await apiClient.retryUpload(uploadId);
      toast.success("Upload retry initiated");
      // Refresh the list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to retry upload");
    }
  };

  const handleDiscardUpload = async (uploadId: string) => {
    try {
      await apiClient.discardUpload(uploadId);
      toast.success("Upload discarded successfully");
      // Refresh the list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Failed to discard upload");
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Sessions</h1>
        <p className="text-gray-600">Monitor and manage file upload sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-xl font-bold text-gray-900">{data.pagination.total}</p>
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
              <p className="text-xl font-bold text-gray-900">
                {data.sessions.filter(session => session.status === "completed").length}
              </p>
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
              <p className="text-xl font-bold text-gray-900">
                {data.sessions.filter(session => session.status === "processing").length}
              </p>
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
              <p className="text-xl font-bold text-gray-900">
                {data.sessions.filter(session => session.status === "failed").length}
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
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
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
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-center">Uploaded At</TableHead>
                <TableHead className="text-center">Processed Rows</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array(8).fill(0).map((_, cellIdx) => (
                      <TableCell key={cellIdx}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="text-lg font-medium">No upload sessions found</p>
                      <p className="text-sm">Try uploading a new file</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.sessions
                  .filter(session => 
                    searchTerm === "" ||
                    session.fileName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((session) => (
                    <TableRow key={session.uploadId} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                          <span>{session.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(session.status)}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            <span>{session.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${session.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 min-w-[40px] text-right">
                            {session.progress}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {session.completedAt ? (
                          <div className="text-sm">
                            {format(new Date(session.completedAt), "MMM d, yyyy")}
                            <div className="text-xs text-gray-500">
                              {format(new Date(session.completedAt), "HH:mm:ss")}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span>{session.processedRows} Rows</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2 outline-none border-none">
                              <MoreVertical className="h-4 w-4 text-blue-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                if(session.status === "failed") {
                                  handleRetryUpload(session.uploadId)
                                } else {
                                  toast.error("Action only work for failed uploads")
                                }
                              }}
                              className="flex items-center gap-2 text-blue-600 cursor-pointer p-2 hover:bg-blue-100"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Retry Upload</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if(session.status === "failed") {
                                  handleDiscardUpload(session.uploadId)
                                } else {
                                  toast.error("Action only work for failed uploads")
                                }
                              }}
                              className="flex items-center gap-2 text-red-600 cursor-pointer p-2 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Discard Upload</span>
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

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {data.sessions.length} of {data.pagination.total} sessions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {data.pagination.page} of {data.pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={currentPage === data.pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 