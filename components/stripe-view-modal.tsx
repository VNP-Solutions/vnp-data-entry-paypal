import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Mail,
  Globe,
  Calendar,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Button } from "./ui/button";

interface StripeViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountData?: any;
  isLoading?: boolean;
}

export function StripeViewModal({
  open,
  onOpenChange,
  accountData,
  isLoading,
}: StripeViewModalProps) {
  if (!accountData && !isLoading) return null;

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), "MMM dd, yyyy");
  };

  const getVerificationStatus = () => {
    if (!accountData) return { icon: null, text: "", color: "" };

    const requirements = accountData.requirements;
    if (!requirements.currently_due.length && !requirements.past_due.length) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        text: "Verified",
        color: "bg-green-100 text-green-800",
      };
    } else if (requirements.past_due.length) {
      return {
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        text: "Past Due",
        color: "bg-red-100 text-red-800",
      };
    } else {
      return {
        icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
        text: "Pending",
        color: "bg-yellow-100 text-yellow-800",
      };
    }
  };

  const status = getVerificationStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stripe Account Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : accountData ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Business Type:</span>
                  <span className="font-medium capitalize">
                    {accountData.business_type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="font-medium">{accountData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Country:</span>
                  <span className="font-medium">{accountData.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="font-medium">
                    {formatDate(accountData.created)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Status Info */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Account Status</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Verification Status:
                    </span>
                    <div className="flex items-center gap-1">
                      {status.icon}
                      <Badge className={status.color}>{status.text}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Charges Enabled:
                    </span>
                    <Badge
                      className={
                        accountData.charges_enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {accountData.charges_enabled ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Payouts Enabled:
                    </span>
                    <Badge
                      className={
                        accountData.payouts_enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {accountData.payouts_enabled ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Default Currency:
                    </span>
                    <span className="font-medium uppercase">
                      {accountData.default_currency}
                    </span>
                  </div>
                </div>

                {/* Action Guidance */}
                {(!accountData.charges_enabled ||
                  !accountData.payouts_enabled) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      How to Enable Account Features
                    </h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>To enable charges and payouts:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>
                          Complete all verification requirements listed above
                        </li>
                        <li>
                          Access your Stripe Dashboard to provide required
                          information
                        </li>
                        <li>
                          Submit any requested documentation for verification
                        </li>
                        <li>
                          Once verified, charges and payouts will be
                          automatically enabled
                        </li>
                      </ol>
                      <p className="mt-2 text-xs">
                        Note: This process is handled directly through Stripe's
                        secure platform. You'll receive email notifications from
                        Stripe about your account status.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Requirements */}
            {(accountData.requirements.currently_due.length > 0 ||
              accountData.requirements.past_due.length > 0) && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold">Required Actions</h3>
                {accountData.requirements.currently_due.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Currently Due:
                    </h4>
                    <ul className="list-disc list-inside">
                      {accountData.requirements.currently_due.map(
                        (item: string) => (
                          <li key={item} className="text-sm text-red-600">
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {accountData.requirements.past_due.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Past Due:
                    </h4>
                    <ul className="list-disc list-inside">
                      {accountData.requirements.past_due.map((item: string) => (
                        <li key={item} className="text-sm text-red-600">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
