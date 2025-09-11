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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  AlertTriangle,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Upload,
  Eye,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatLongString } from "@/lib/utils";
import { apiClient } from "@/lib/client-api-call";
import type { StripeDispute } from "@/lib/client-api-call";

interface FetchDisputesParams {
  page: number;
  limit: number;
  status?: string;
  reason?: string;
  internalStatus?: string;
  hotelName?: string;
}

const StripeDisputesTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [internalStatusFilter, setInternalStatusFilter] = useState("all");
  const [limit, setLimit] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stripeTotalCount, setStripeTotalCount] = useState(0);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<StripeDispute | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceText, setEvidenceText] = useState("");

  const [stripeDisputes, setStripeDisputes] = useState<StripeDispute[]>([]);
  const [stripeHasMore, setStripeHasMore] = useState(false);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const params: FetchDisputesParams = {
        page: currentPage,
        limit: limit,
      };

      if (statusFilter !== "all") params.status = statusFilter;
      if (reasonFilter !== "all") params.reason = reasonFilter;
      if (internalStatusFilter !== "all")
        params.internalStatus = internalStatusFilter;
      if (searchTerm) params.hotelName = searchTerm;

      const response = await apiClient.getDisputes(params);
      setStripeDisputes(response.data.stripeDisputes.data);
      setStripeTotalCount(
        response.data.stripeDisputes.count ??
          response.data.stripeDisputes.data.length
      );
      setStripeHasMore(response.data.stripeDisputes.has_more);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to fetch disputes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [
    currentPage,
    limit,
    statusFilter,
    reasonFilter,
    internalStatusFilter,
    searchTerm,
    refreshKey,
  ]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "warning_needs_response":
        return "Warning Needs Response";
      case "warning_under_review":
        return "Warning Under Review";
      case "warning_closed":
        return "Warning Closed";
      case "needs_response":
        return "Needs Response";
      case "under_review":
        return "Under Review";
      case "won":
        return "Won";
      case "lost":
        return "Lost";
      case "charge_refunded":
        return "Charge Refunded";
      default:
        return status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "warning_needs_response":
        return "An inquiry that requires your response (pre-dispute phase)";
      case "warning_under_review":
        return "An inquiry where you've submitted evidence and are awaiting the bank's decision";
      case "warning_closed":
        return "An inquiry that was closed without escalating to a formal dispute";
      case "needs_response":
        return "A formal dispute that requires your response";
      case "under_review":
        return "A formal dispute where you've submitted evidence and are awaiting the bank's decision";
      case "won":
        return "A dispute that was decided in your favor";
      case "lost":
        return "A dispute that was decided in the cardholder's favor";
      case "charge_refunded":
        return "The charge has been refunded";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "warning_needs_response":
        return "bg-orange-100 text-orange-800";
      case "warning_under_review":
        return "bg-amber-100 text-amber-800";
      case "warning_closed":
        return "bg-lime-100 text-lime-800";
      case "needs_response":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      case "charge_refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInternalStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-purple-100 text-purple-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "evidence_submitted":
        return "bg-blue-100 text-blue-800";
      case "awaiting_response":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonDisplayName = (reason: string) => {
    switch (reason) {
      case "fraudulent":
        return "Fraudulent";
      case "product_not_received":
        return "Product Not Received";
      case "product_unacceptable":
        return "Product Unacceptable";
      case "credit_not_processed":
        return "Credit Not Processed";
      case "subscription_canceled":
        return "Subscription Canceled";
      case "general":
        return "General";
      case "duplicate":
        return "Duplicate";
      case "unrecognized":
        return "Unrecognized";
      case "noncompliant":
        return "Noncompliant";
      default:
        return reason
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getReasonDescription = (reason: string) => {
    switch (reason) {
      case "fraudulent":
        return "Claims that the transaction was unauthorized, such as counterfeit fraud, non-counterfeit fraud, or other fraud in card-present or card-absent environments.";
      case "product_not_received":
        return "The customer claims they did not receive the merchandise or services.";
      case "product_unacceptable":
        return "The customer claims the product was defective, not as described, counterfeit, or misrepresented.";
      case "credit_not_processed":
        return "The customer claims they are entitled to a refund due to a canceled transaction, but the merchant has not issued a credit.";
      case "subscription_canceled":
        return "The customer claims they canceled a recurring subscription but were still charged.";
      case "general":
        return "Includes reasons like a request for a copy of a signed receipt, a cardholder request due to a dispute, or a legal process request.";
      case "duplicate":
        return "The transaction is a duplicate charge.";
      case "unrecognized":
        return "The cardholder does not recognize the transaction.";
      case "noncompliant":
        return "The transaction violates a network rule, such as a delayed charge, a split transaction, or an improperly assessed surcharge.";
      default:
        return "";
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "fraudulent":
        return "bg-red-100 text-red-800";
      case "product_not_received":
        return "bg-purple-100 text-purple-800";
      case "product_unacceptable":
        return "bg-pink-100 text-pink-800";
      case "credit_not_processed":
        return "bg-blue-100 text-blue-800";
      case "subscription_canceled":
        return "bg-indigo-100 text-indigo-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      case "duplicate":
        return "bg-orange-100 text-orange-800";
      case "unrecognized":
        return "bg-yellow-100 text-yellow-800";
      case "noncompliant":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEvidenceDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  const isEvidenceOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleUploadEvidence = async () => {
    if (!selectedDispute || !evidenceFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("evidence", evidenceFile);
      formData.append("additionalInfo", evidenceText);
      formData.append("disputeId", selectedDispute.id);

      await apiClient.uploadDisputeEvidence(formData);

      toast.success("Evidence uploaded and submitted successfully");
      setShowEvidenceDialog(false);
      setEvidenceFile(null);
      setEvidenceText("");
      handleRefresh();
    } catch (error) {
      console.error("Error uploading evidence:", error);
      toast.error("Failed to upload evidence");
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header Section */}
      <div className="my-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Stripe Disputes Management
        </h1>
        <p className="text-gray-600">
          Monitor and manage all payment disputes and chargebacks
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 text-sm font-medium">
              ℹ️ Status Types:
            </div>
            <div className="text-sm text-blue-700">
              <strong>Inquiry</strong> (warning_*) - Pre-dispute phase where you
              can respond to prevent escalation •
              <strong> Formal Dispute</strong> - Chargeback requiring mandatory
              response within 7-8 days
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Disputes</p>
              <div className="text-xl font-bold text-gray-900">
                {stripeTotalCount || 0}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(
                  stripeDisputes.reduce(
                    (sum, dispute) => sum + dispute.amount,
                    0
                  ),
                  "USD"
                )}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Amount</p>
              <div className="text-xl font-bold text-gray-900">
                {stripeDisputes.length > 0
                  ? formatCurrency(
                      stripeDisputes.reduce(
                        (sum, dispute) => sum + dispute.amount,
                        0
                      ) / stripeDisputes.length,
                      "USD"
                    )
                  : "$0.00"}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Won Disputes</p>
              <div className="text-xl font-bold text-gray-900">
                {
                  stripeDisputes.filter((dispute) => dispute.status === "won")
                    .length
                }
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
                placeholder="Search by hotel name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="warning_needs_response">
                  Inquiry: Needs Response
                </SelectItem>
                <SelectItem value="warning_under_review">
                  Inquiry: Under Review
                </SelectItem>
                <SelectItem value="warning_closed">Inquiry: Closed</SelectItem>
                <SelectItem value="needs_response">
                  Dispute: Needs Response
                </SelectItem>
                <SelectItem value="under_review">
                  Dispute: Under Review
                </SelectItem>
                <SelectItem value="won">Dispute: Won</SelectItem>
                <SelectItem value="lost">Dispute: Lost</SelectItem>
                <SelectItem value="charge_refunded">Charge Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="fraudulent">Fraudulent</SelectItem>
                <SelectItem value="product_not_received">
                  Product Not Received
                </SelectItem>
                <SelectItem value="product_unacceptable">
                  Product Unacceptable
                </SelectItem>
                <SelectItem value="credit_not_processed">
                  Credit Not Processed
                </SelectItem>
                <SelectItem value="subscription_canceled">
                  Subscription Canceled
                </SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="unrecognized">Unrecognized</SelectItem>
                <SelectItem value="noncompliant">Noncompliant</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={internalStatusFilter}
              onValueChange={setInternalStatusFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Internal Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Internal</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="evidence_submitted">
                  Evidence Submitted
                </SelectItem>
                <SelectItem value="awaiting_response">
                  Awaiting Response
                </SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead>Dispute ID</TableHead>
                <TableHead>Hotel & Guest</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Internal Status</TableHead>
                <TableHead>Evidence Due</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow key={idx}>
                      {Array(9)
                        .fill(0)
                        .map((_, cellIdx) => (
                          <TableCell key={cellIdx}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : stripeDisputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <AlertTriangle className="h-8 w-8 mb-2" />
                      <p className="text-lg font-medium">No disputes found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stripeDisputes.map((dispute) => (
                  <TableRow key={dispute.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-mono text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {formatLongString(dispute.id, 12)}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{dispute.id}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <div className="font-medium text-sm">
                            {dispute.evidence?.customer_name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Email:{" "}
                            {dispute.evidence?.customer_email_address || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            IP:{" "}
                            {dispute.evidence?.customer_purchase_ip || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {formatCurrency(dispute.amount, dispute.currency)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className={getStatusColor(dispute.status)}>
                              {getStatusDisplayName(dispute.status)}
                            </Badge>
                          </TooltipTrigger>
                          {getStatusDescription(dispute.status) && (
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                {getStatusDescription(dispute.status)}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className={getReasonColor(dispute.reason)}>
                              {getReasonDisplayName(dispute.reason)}
                            </Badge>
                          </TooltipTrigger>
                          {getReasonDescription(dispute.reason) && (
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                {getReasonDescription(dispute.reason)}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getInternalStatusColor(
                          dispute.evidence_details?.has_evidence
                            ? "evidence_submitted"
                            : "new"
                        )}
                      >
                        {dispute.evidence_details?.has_evidence
                          ? "Evidence Submitted"
                          : "New"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {dispute.evidence_details?.due_by ? (
                        <div className="flex items-center gap-1">
                          {isEvidenceOverdue(
                            new Date(
                              dispute.evidence_details.due_by * 1000
                            ).toISOString()
                          ) ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : isEvidenceDueSoon(
                              new Date(
                                dispute.evidence_details.due_by * 1000
                              ).toISOString()
                            ) ? (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span
                            className={`text-sm ${
                              isEvidenceOverdue(
                                new Date(
                                  dispute.evidence_details.due_by * 1000
                                ).toISOString()
                              )
                                ? "text-red-600 font-medium"
                                : isEvidenceDueSoon(
                                    new Date(
                                      dispute.evidence_details.due_by * 1000
                                    ).toISOString()
                                  )
                                ? "text-orange-600 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {formatDate(
                              new Date(
                                dispute.evidence_details.due_by * 1000
                              ).toISOString()
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(
                          new Date(dispute.created * 1000).toISOString()
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={Boolean(
                            dispute.evidence_details?.has_evidence
                          )}
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowEvidenceDialog(true);
                          }}
                        >
                          <Upload className="h-4 w-4" />
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
              Showing {stripeDisputes.length} of {stripeTotalCount} entries
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
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!stripeHasMore}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Dispute Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Dispute ID
                  </Label>
                  <p className="font-mono text-sm">{selectedDispute.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Amount
                  </Label>
                  <p className="font-medium">
                    {formatCurrency(
                      selectedDispute.amount,
                      selectedDispute.currency
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          className={getStatusColor(selectedDispute.status)}
                        >
                          {getStatusDisplayName(selectedDispute.status)}
                        </Badge>
                      </TooltipTrigger>
                      {getStatusDescription(selectedDispute.status) && (
                        <TooltipContent className="max-w-sm">
                          <p className="text-sm">
                            {getStatusDescription(selectedDispute.status)}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Reason
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          className={getReasonColor(selectedDispute.reason)}
                        >
                          {getReasonDisplayName(selectedDispute.reason)}
                        </Badge>
                      </TooltipTrigger>
                      {getReasonDescription(selectedDispute.reason) && (
                        <TooltipContent className="max-w-sm">
                          <p className="text-sm">
                            {getReasonDescription(selectedDispute.reason)}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Customer & Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Customer Name
                    </Label>
                    <p>{selectedDispute.evidence?.customer_name || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Customer Email
                    </Label>
                    <p>
                      {selectedDispute.evidence?.customer_email_address ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Payment Intent
                    </Label>
                    <p className="font-mono text-sm">
                      {selectedDispute.payment_intent}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Charge
                    </Label>
                    <p className="font-mono text-sm">
                      {selectedDispute.charge}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-500">
                  Evidence Due By
                </Label>
                <p className="mt-1 text-sm">
                  {selectedDispute.evidence_details?.due_by
                    ? formatDate(
                        new Date(
                          selectedDispute.evidence_details.due_by * 1000
                        ).toISOString()
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Evidence Upload Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Dispute Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="evidence-file">Evidence File</Label>
              <Input
                id="evidence-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>
            <div>
              <Label htmlFor="evidence-text">Additional Information</Label>
              <textarea
                id="evidence-text"
                placeholder="Provide additional context or explanation..."
                value={evidenceText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEvidenceText(e.target.value)
                }
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEvidenceDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUploadEvidence} disabled={!evidenceFile}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Evidence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StripeDisputesTab;
