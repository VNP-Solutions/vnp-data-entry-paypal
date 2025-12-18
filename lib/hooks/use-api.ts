import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminExcelDataParams, apiClient } from "../client-api-call";
import { toast } from "sonner";

// Query keys
export const queryKeys = {
  rowData: "row-data",
  uploadSessions: "upload-sessions",
  singleRowData: (id: string) => ["single-row-data", id],
  invitations: "invitations",
  profile: "profile",
  adminExcelData: "admin-excel-data",
} as const;

// Row Data Hooks
export function useRowData(params: {
  limit: number;
  page: number;
  chargeStatus: string;
}) {
  return useQuery({
    queryKey: [queryKeys.rowData, params],
    queryFn: () => apiClient.getRowData({ ...params, search: "", uploadId: "" }),
  });
}

export function useSingleRowData(documentId: string) {
  return useQuery({
    queryKey: queryKeys.singleRowData(documentId),
    queryFn: () => apiClient.getSingleRowData(documentId),
    enabled: !!documentId,
  });
}

// Upload Session Hooks
export function useUploadSessions(page: number = 1, limit: number = 20, search: string = "") {
  return useQuery({
    queryKey: [queryKeys.uploadSessions, { page, limit, search }],
    queryFn: () => apiClient.getUploadSessions(page, limit, search),
  });
}

// Auth Hooks
export function useLogin() {
  return useMutation({
    mutationFn: apiClient.login,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: apiClient.verifyOtp,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "OTP verification failed");
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: apiClient.register,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(
          "Invitation sent! Please check your email to complete registration."
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    },
  });
}

// File Upload Hooks
export function useFileUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.uploadFile,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message);
        // Invalidate upload sessions query to refresh the list
        queryClient.invalidateQueries({ queryKey: [queryKeys.uploadSessions] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "File upload failed");
    },
  });
}

// Upload Management Hooks
export function useRetryUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.retryUpload,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: [queryKeys.uploadSessions] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to retry upload");
    },
  });
}

export function useDiscardUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.discardUpload,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: [queryKeys.uploadSessions] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to discard upload");
    },
  });
}

// Add new Invitation Hooks
export function useValidateInvitation() {
  return useMutation({
    mutationFn: apiClient.validateInvitation,
    onSuccess: (response) => {
      return response;
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Invalid temporary password"
      );
    },
  });
}

export function useCompleteInvitation() {
  return useMutation({
    mutationFn: apiClient.completeInvitation,
    onSuccess: (response) => {
      // Don't show success message here, let the component handle the success case
      return response;
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to set new password"
      );
    },
  });
}

// Invitation Hooks
export function useMyInvitations(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [queryKeys.invitations, { page, limit }],
    queryFn: () => apiClient.getMyInvitations(page, limit),
  });
}

// Profile Hook
export function useProfile() {
  return useQuery({
    queryKey: [queryKeys.profile],
    queryFn: () => apiClient.getProfile(),
  });
}

// Admin Excel Data Hook
export function useAdminExcelData(params: AdminExcelDataParams) {
  return useQuery({
    queryKey: [queryKeys.adminExcelData, params],
    queryFn: () => apiClient.getAdminExcelData(params),
  });
}

export function useStripeRowData(params: {
  page: number;
  limit: number;
  filter?: string;
  search?: string;
  chargeStatus?: string;
}) {
  return useQuery({
    queryKey: ["stripe-row-data", params],
    queryFn: () => apiClient.getStripeRowData(params),
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: apiClient.downloadReport,
    onSuccess: (data) => {
      window.open(data.url, "blank");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to download report");
    },
  });
}

export function useMakeBulkPayment() {
  return useMutation({
    mutationFn: apiClient.makeBulkPayment,
    onSuccess: (data) => {
      if (data.status === "partial_success") {
        toast.success("Bulk payment partial success!", {
          description: data.message,
        });
      } else if (data.status === "all_success") {
        toast.success("Bulk payment successful!", {
          description: data.message,
        });
      } else if (data.status === "all_failed") {
        toast.error("Bulk payment failed!", {
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to make bulk payment"
      );
    },
  });
}

export function useMakeBulkRefund() {
  return useMutation({
    mutationFn: apiClient.makeBulkRefund,
    onSuccess: (data) => {
      if (data.status === "partial_success") {
        toast.success("Bulk refund partial success!", {
          description: data.message,
        });
      } else if (data.status === "all_success") {
        toast.success("Bulk refund successful!", {
          description: data.message,
        });
      } else if (data.status === "all_failed") {
        toast.error("Bulk refund failed!", {
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to make bulk refund"
      );
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.processRefund,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success("Refund processed successfully!");
        // Invalidate queries that need to be updated
        queryClient.invalidateQueries({ queryKey: [queryKeys.rowData] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to process refund");
    },
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: apiClient.deleteFile,
    onSuccess: () => {
      toast.success("File deleted successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
  });
}

export function useArchiveUnarchiveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uploadId, archive }: { uploadId: string; archive: boolean }) => apiClient.archiveUnarchiveFile(uploadId, archive),
    onSuccess: (data) => {
      console.log(data);
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to archive/unarchive file");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.uploadSessions] });
    },
  });
}

export function useUpdateRowData() {
  return useMutation({
    // Change this line to specify the parameter types correctly
    mutationFn: (params: {
      documentId: string;
      data: any;
      paymentGateway?: string;
    }) =>
      apiClient.updateRowData(
        params.documentId,
        params.data,
        params.paymentGateway
      ),
    onSuccess: () => {
      toast.success("Record updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update record");
    },
  });
}

export function useGetStripeAccount(accountId: string) {
  return useQuery({
    queryKey: ["stripe-account", accountId],
    queryFn: () => apiClient.getStripeAccount(accountId),
    enabled: !!accountId,
  });
}

export function useCreateStripePayment(data: {
  accountId: string;
  totalAmount: number;
  currency?: string;
  paymentMethod?: string;
  applicationFeeAmount?: number;
}) {
  return useMutation({
    mutationFn: () => apiClient.createStripePayment(data),
    onSuccess: () => {
      toast.success("Stripe payment created successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create stripe payment"
      );
    },
  });
}

export function useCreateExcelData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      "Expedia ID"?: string;
      "Batch"?: string;
      "OTA"?: string;
      "Posting Type"?: string;
      "Portfolio"?: string;
      "Hotel Name"?: string;
      "Reservation ID": string;
      "Hotel Confirmation Code"?: string;
      "Name"?: string;
      "Check In"?: string;
      "Check Out"?: string;
      "Curency"?: string;
      "Amount to charge": string;
      "Charge status": string;
      "Card Number": string;
      "Card Expire": string;
      "Card CVV": string;
      "Soft Descriptor": string;
      "VNP Work ID"?: string;
      "Status"?: string;
    }) => apiClient.createExcelData(data),
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success(data.message || "Excel data created successfully!");
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: [queryKeys.rowData] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.adminExcelData] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create excel data"
      );
    },
  });
}

export function useExportManualExcelData() {
  return useMutation({
    mutationFn: apiClient.exportManualExcelData,
    onSuccess: (response) => {
      // Show the API message
      if (response.message) {
        toast.success(response.message);
      }
      
      // Check if there's data to export
      if (!response.data || response.data.length === 0) {
        toast.info("No data to export");
        return;
      }

      // Dynamically import xlsx to avoid SSR issues
      import('xlsx').then((XLSX) => {
        // Prepare data for Excel
        const excelData = response.data.map((item: any) => ({
          'ID': item.id || '',
          'Upload ID': item.uploadId || '',
          'File Name': item.fileName || '',
          'Upload Status': item.uploadStatus || '',
          'Row Number': item.rowNumber || '',
          'Expedia ID': item['Expedia ID'] || '',
          'Batch': item.Batch || '',
          'OTA': item.OTA || '',
          'Posting Type': item['Posting Type'] || '',
          'Portfolio': item.Portfolio || '',
          'Hotel Name': item['Hotel Name'] || '',
          'Reservation ID': item['Reservation ID'] || '',
          'Hotel Confirmation Code': item['Hotel Confirmation Code'] || '',
          'Guest Name': item.Name || '',
          'Check In': item['Check In'] || '',
          'Check Out': item['Check Out'] || '',
          'Currency': item.Curency || '',
          'Amount to Charge': item['Amount to charge'] || '',
          'Charge Status': item['Charge status'] || '',
          'Card Number': item['Card Number'] || '',
          'Card Expire': item['Card Expire'] || '',
          'Card CVV': item['Card CVV'] || '',
          'Soft Descriptor': item['Soft Descriptor'] || '',
          'VNP Work ID': item['VNP Work ID'] || '',
          'Status': item.Status || '',
          
          // PayPal Payment Fields
          'PayPal Order ID': item.paypalOrderId || '',
          'PayPal Capture ID': item.paypalCaptureId || '',
          'PayPal Network Transaction ID': item.paypalNetworkTransactionId || '',
          'PayPal Fee': item.paypalFee || '',
          'PayPal Net Amount': item.paypalNetAmount || '',
          'PayPal Card Brand': item.paypalCardBrand || '',
          'PayPal Card Type': item.paypalCardType || '',
          'PayPal Card Last Digits': item.paypalCardLastDigits || '',
          'PayPal AVS Code': item.paypalAvsCode || '',
          'PayPal CVV Code': item.paypalCvvCode || '',
          'PayPal Create Time': item.paypalCreateTime || '',
          'PayPal Update Time': item.paypalUpdateTime || '',
          'PayPal Status': item.paypalStatus || '',
          'PayPal Amount': item.paypalAmount || '',
          'PayPal Currency': item.paypalCurrency || '',
          'PayPal Capture Status': item.paypalCaptureStatus || '',
          'PayPal Custom ID': item.paypalCustomId || '',
          
          // PayPal Refund Fields
          'PayPal Refund ID': item.paypalRefundId || '',
          'PayPal Refund Status': item.paypalRefundStatus || '',
          'PayPal Refund Amount': item.paypalRefundAmount || '',
          'PayPal Refund Currency': item.paypalRefundCurrency || '',
          'PayPal Refund Gross Amount': item.paypalRefundGrossAmount || '',
          'PayPal Refund Fee': item.paypalRefundFee || '',
          'PayPal Refund Net Amount': item.paypalRefundNetAmount || '',
          'PayPal Total Refunded': item.paypalTotalRefunded || '',
          'PayPal Refund Create Time': item.paypalRefundCreateTime || '',
          'PayPal Refund Update Time': item.paypalRefundUpdateTime || '',
          'PayPal Refund Invoice ID': item.paypalRefundInvoiceId || '',
          'PayPal Refund Custom ID': item.paypalRefundCustomId || '',
          'PayPal Refund Note': item.paypalRefundNote || '',
          
          // OTA/Billing Address Fields
          'OTA Name': item.otaId?.name || '',
          'OTA Display Name': item.otaId?.displayName || '',
          'OTA Customer': item.otaId?.customer || '',
          'OTA Is Active': item.otaId?.isActive ? 'Yes' : 'No',
          'Billing Zip Code': item.otaId?.billingAddress?.zipCode || '',
          'Billing Country Code': item.otaId?.billingAddress?.countryCode || '',
          'Billing Address Line 1': item.otaId?.billingAddress?.addressLine1 || '',
          'Billing Address Line 2': item.otaId?.billingAddress?.addressLine2 || '',
          'Billing City': item.otaId?.billingAddress?.city || '',
          'Billing State': item.otaId?.billingAddress?.state || '',
          
          // Other Fields
          'Archive': item.archive ? 'Yes' : 'No',
          'Created At': item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths for better readability
        const colWidths = [
          { wch: 25 }, // ID
          { wch: 30 }, // Upload ID
          { wch: 30 }, // File Name
          { wch: 15 }, // Upload Status
          { wch: 12 }, // Row Number
          { wch: 12 }, // Expedia ID
          { wch: 10 }, // Batch
          { wch: 12 }, // OTA
          { wch: 15 }, // Posting Type
          { wch: 20 }, // Portfolio
          { wch: 30 }, // Hotel Name
          { wch: 15 }, // Reservation ID
          { wch: 25 }, // Hotel Confirmation Code
          { wch: 25 }, // Guest Name
          { wch: 12 }, // Check In
          { wch: 12 }, // Check Out
          { wch: 10 }, // Currency
          { wch: 15 }, // Amount to Charge
          { wch: 15 }, // Charge Status
          { wch: 18 }, // Card Number
          { wch: 12 }, // Card Expire
          { wch: 10 }, // Card CVV
          { wch: 25 }, // Soft Descriptor
          { wch: 15 }, // VNP Work ID
          { wch: 12 }, // Status
          { wch: 25 }, // PayPal Order ID
          { wch: 25 }, // PayPal Capture ID
          { wch: 30 }, // PayPal Network Transaction ID
          { wch: 12 }, // PayPal Fee
          { wch: 15 }, // PayPal Net Amount
          { wch: 15 }, // PayPal Card Brand
          { wch: 15 }, // PayPal Card Type
          { wch: 15 }, // PayPal Card Last Digits
          { wch: 12 }, // PayPal AVS Code
          { wch: 12 }, // PayPal CVV Code
          { wch: 20 }, // PayPal Create Time
          { wch: 20 }, // PayPal Update Time
          { wch: 15 }, // PayPal Status
          { wch: 15 }, // PayPal Amount
          { wch: 12 }, // PayPal Currency
          { wch: 18 }, // PayPal Capture Status
          { wch: 20 }, // PayPal Custom ID
          { wch: 25 }, // PayPal Refund ID
          { wch: 15 }, // PayPal Refund Status
          { wch: 15 }, // PayPal Refund Amount
          { wch: 12 }, // PayPal Refund Currency
          { wch: 18 }, // PayPal Refund Gross Amount
          { wch: 15 }, // PayPal Refund Fee
          { wch: 18 }, // PayPal Refund Net Amount
          { wch: 18 }, // PayPal Total Refunded
          { wch: 20 }, // PayPal Refund Create Time
          { wch: 20 }, // PayPal Refund Update Time
          { wch: 25 }, // PayPal Refund Invoice ID
          { wch: 25 }, // PayPal Refund Custom ID
          { wch: 30 }, // PayPal Refund Note
          { wch: 20 }, // OTA Name
          { wch: 20 }, // OTA Display Name
          { wch: 20 }, // OTA Customer
          { wch: 12 }, // OTA Is Active
          { wch: 15 }, // Billing Zip Code
          { wch: 12 }, // Billing Country Code
          { wch: 30 }, // Billing Address Line 1
          { wch: 30 }, // Billing Address Line 2
          { wch: 20 }, // Billing City
          { wch: 15 }, // Billing State
          { wch: 10 }, // Archive
          { wch: 20 }, // Created At
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Single Payments');

        // Generate file name with timestamp
        const fileName = `single-payments-${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write and download the file
        XLSX.writeFile(wb, fileName);
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to export data"
      );
    },
  });
}
