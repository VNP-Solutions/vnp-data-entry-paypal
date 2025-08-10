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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Link,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Mail,
  Calendar,
  Eye,
} from "lucide-react";
import { apiClient } from "@/lib/client-api-call";
import { toast } from "sonner";
import { StripeConnectModal } from "@/components/stripe-connect-modal";
import { StripeViewModal } from "@/components/stripe-view-modal";
import { useGetStripeAccount } from "@/lib/hooks/use-api";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function StripePaymentPage() {
  const [stripeAccounts, setStripeAccounts] = useState<any | null>(null);
  const [isLoadingStripeAccounts, setIsLoadingStripeAccounts] = useState(false);
  const [stripeAccountsPage, setStripeAccountsPage] = useState(1);
  const [showStripeConnectModal, setShowStripeConnectModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);

  const { data: selectedAccountData, isLoading: isLoadingAccountData } =
    useGetStripeAccount(selectedAccountId || "");

  const fetchStripeAccounts = async () => {
    try {
      setIsLoadingStripeAccounts(true);
      const response = await apiClient.getStripeAccounts(
        stripeAccountsPage,
        10
      );
      setStripeAccounts(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message || "Failed to fetch Stripe accounts"
      );
    } finally {
      setIsLoadingStripeAccounts(false);
    }
  };

  const handleStripeConnectSuccess = () => {
    fetchStripeAccounts();
  };

  const handleMakePayment = (account: any) => {
    // TODO: Implement Stripe payment processing
    toast.info(`Processing payment for account: ${account.email}`);
  };
  const handleViewAccount = (account: any) => {
    setSelectedAccountId(account.id);
    setShowViewModal(true);
  };

  useEffect(() => {
    fetchStripeAccounts();
  }, [stripeAccountsPage]);

  const isAccountSetupComplete = (account: any) => {
    return (
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled &&
      account.requirements.currently_due.length === 0 &&
      account.requirements.past_due.length === 0 &&
      account.external_accounts.data.length > 0
    );
  };

  const getAccountStatusIcon = (account: any) => {
    if (isAccountSetupComplete(account)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (
      account.requirements.currently_due.length > 0 ||
      account.requirements.past_due.length > 0
    ) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getAccountStatusText = (account: any) => {
    if (isAccountSetupComplete(account)) {
      return "Complete";
    } else if (
      account.requirements.currently_due.length > 0 ||
      account.requirements.past_due.length > 0
    ) {
      return "Pending";
    } else {
      return "Incomplete";
    }
  };

  const getAccountStatusColor = (account: any) => {
    if (isAccountSetupComplete(account)) {
      return "bg-green-100 text-green-800";
    } else if (
      account.requirements.currently_due.length > 0 ||
      account.requirements.past_due.length > 0
    ) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Stripe Account Management
            </h1>
            <p className="text-gray-600">
              Connect and manage your Stripe accounts for payment processing
            </p>
          </div>
          <Button
            onClick={() => setShowStripeConnectModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Link className="h-4 w-4 mr-2" />
            Connect Stripe Account
          </Button>
        </div>
      </div>

      {/* Stripe Accounts Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm pe-0 ps-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Account ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Charges</TableHead>
                <TableHead>Payouts</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStripeAccounts ? (
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
              ) : stripeAccounts?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <CreditCard className="h-8 w-8 mb-2" />
                      <p className="text-lg font-medium">
                        No Stripe accounts connected
                      </p>
                      <p className="text-sm mb-4">
                        Connect your first Stripe account to start processing
                        payments
                      </p>
                      <Button
                        onClick={() => setShowStripeConnectModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Connect Account
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stripeAccounts?.data?.map((account: any) => (
                  <TableRow key={account.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        {account.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{account.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {account.country.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(account.created)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAccountStatusIcon(account)}
                        <Badge className={getAccountStatusColor(account)}>
                          {getAccountStatusText(account)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          account.charges_enabled ? "default" : "outline"
                        }
                        className={
                          account.charges_enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {account.charges_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          account.payouts_enabled ? "default" : "outline"
                        }
                        className={
                          account.payouts_enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {account.payouts_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 hover:bg-blue-100"
                        onClick={() => handleViewAccount(account)}
                      >
                        <Eye className="h-4 w-4 text-blue-600 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 hover:bg-blue-100"
                        onClick={() => handleMakePayment(account)}
                        disabled={!isAccountSetupComplete(account)}
                      >
                        Make Payment
                        <ArrowRight className="h-4 w-4 text-blue-600 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {stripeAccounts && stripeAccounts?.data?.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {stripeAccounts?.data?.length} of{" "}
              {stripeAccounts?.pagination?.total_count} accounts
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStripeAccountsPage((p) => Math.max(1, p - 1))}
                disabled={stripeAccountsPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {stripeAccounts?.pagination?.current_page} of{" "}
                {stripeAccounts?.pagination?.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setStripeAccountsPage((p) =>
                    Math.min(stripeAccounts?.pagination?.total_pages, p + 1)
                  )
                }
                disabled={
                  stripeAccountsPage === stripeAccounts?.pagination?.total_pages
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Stripe Connect Modal */}
      <StripeConnectModal
        open={showStripeConnectModal}
        onOpenChange={setShowStripeConnectModal}
        onSuccess={handleStripeConnectSuccess}
      />

      <StripeViewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        accountData={selectedAccountData?.data?.account}
        isLoading={isLoadingAccountData}
      />
    </div>
  );
}
