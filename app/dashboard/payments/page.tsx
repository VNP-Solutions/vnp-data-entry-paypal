"use client";

import { useState } from "react";
import {
  Loader2,
  Search,
  MoreHorizontal,
  RotateCcw,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  CreditCard,
  Building2,
  Receipt,
  Hash,
  CircleDot,
  Copy,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePaymentAttempts } from "@/lib/hooks/use-api";
import { apiClient } from "@/lib/client-api-call";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = usePaymentAttempts({
    page,
    limit,
    search: searchTerm,
    result: resultFilter === "all" ? undefined : resultFilter,
  });

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setResultFilter("all");
    setPage(1);
  };

  const viewDetails = (attempt: any) => {
    setSelectedAttempt(attempt);
    setShowDetailsModal(true);
  };

  const copyJsonToClipboard = async (data: unknown, successMessage: string) => {
    try {
      const text = JSON.stringify(data ?? null, null, 2);
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const { blob, filename } = await apiClient.exportPaymentAttemptsExcel({
        search: searchTerm || undefined,
        result: resultFilter === "all" ? undefined : resultFilter,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Payment attempts exported");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Export failed";
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const attempts = data?.data?.attempts || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">QP Payment Attempts</h1>
          <p className="text-gray-500">History of all payment transaction attempts and technical traces</p>
        </div>
      </div>

      <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Reservation ID, Request ID, Run ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-10 w-full"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Payment Result</label>
              <Select
                value={resultFilter}
                onValueChange={(val) => {
                  setResultFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 bg-white">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Filter by result" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-2 min-h-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleExportExcel()}
                disabled={isExporting}
                className="h-10 border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 md:mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 md:mr-2" />
                )}
                <span className="hidden sm:inline">Export Excel</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-10 border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              >
                <RotateCcw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Reset</span>
              </Button>
              <Button onClick={handleSearch} className="h-10 bg-slate-800 hover:bg-slate-900">
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border border-gray-100 overflow-hidden bg-white">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Date / Time</th>
                    <th className="px-6 py-4">Reservation / Hotel</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4 hidden md:table-cell">Technical IDs</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <p>Loading payment attempts...</p>
                        </div>
                      </td>
                    </tr>
                  ) : attempts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Receipt className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                        <p>No payment attempts found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    attempts.map((attempt: any) => (
                      <tr key={attempt._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {format(new Date(attempt.createdAt), "MMM d, yyyy")}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5">
                            {format(new Date(attempt.createdAt), "HH:mm:ss")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {attempt.charge_instance_id?.reservation_id || "N/A"}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5 max-w-[200px] truncate">
                            {attempt.charge_instance_id?.hotel_name || "Unknown Hotel"}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-900">
                          {attempt.charge_instance_id?.amount_numeric?.toFixed(2)}{" "}
                          {attempt.charge_instance_id?.currency}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              attempt.result === 'SUCCESS'
                                ? 'bg-green-50 text-green-700 border border-green-200/50'
                                : attempt.result === 'DECLINED'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                : 'bg-red-50 text-red-700 border border-red-200/50'
                            }`}
                          >
                            {attempt.result === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {attempt.result === 'DECLINED' && <Clock className="w-3 h-3 mr-1" />}
                            {attempt.result === 'ERROR' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {attempt.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Req:</span> {attempt.request_id}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            <span className="font-semibold text-gray-700">Run:</span> {attempt.run_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onSelect={() => {
                                  window.setTimeout(() => viewDetails(attempt), 0);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  void navigator.clipboard.writeText(
                                    attempt.request_id,
                                  );
                                }}
                              >
                                Copy Request ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50">
                <div className="text-sm text-gray-500">
                  Page <span className="font-medium text-gray-900">{page}</span> of{" "}
                  <span className="font-medium text-gray-900">{pagination.pages}</span> ({pagination.total} attempts)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent
          className="max-w-4xl max-h-[80vh] overflow-y-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 border-b pb-4">
              <Receipt className="h-5 w-5 text-blue-600" />
              Technical Details for Payment Attempt
            </DialogTitle>
            <DialogDescription className="pt-2">
              Deep dive into the request payload and provider response bucket.
            </DialogDescription>
          </DialogHeader>

          {selectedAttempt && (
            <div className="space-y-6 pt-4">
              {/* Summary Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                    <CircleDot className="h-3 w-3" /> Result
                  </div>
                  <div className={`text-sm font-semibold ${
                    selectedAttempt.result === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedAttempt.result}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" /> Date
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {format(new Date(selectedAttempt.createdAt), "MMM d, HH:mm:ss")}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                    <Hash className="h-3 w-3" /> Status Code
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedAttempt.response_status_code || "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                    <CreditCard className="h-3 w-3" /> Reservation
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedAttempt.charge_instance_id?.reservation_id || "N/A"}
                  </div>
                </div>
              </div>

              {/* Payload Tabs/JSON */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded text-blue-600">
                        <AlertCircle className="h-3 w-3" />
                      </div>
                      Request Payload (Redacted)
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 h-8"
                      onClick={() =>
                        copyJsonToClipboard(
                          selectedAttempt.request_payload_redacted,
                          "Request payload copied",
                        )
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs overflow-x-auto border border-slate-800 shadow-inner">
                    {JSON.stringify(selectedAttempt.request_payload_redacted, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      Response Body
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 h-8"
                      onClick={() =>
                        copyJsonToClipboard(
                          selectedAttempt.response_body,
                          "Response body copied",
                        )
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs overflow-x-auto border border-slate-800 shadow-inner">
                    {JSON.stringify(selectedAttempt.response_body, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
