import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client-api-call";
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
    queryFn: () => apiClient.getRowData(params),
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
export function useUploadSessions(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [queryKeys.uploadSessions, { page, limit }],
    queryFn: () => apiClient.getUploadSessions(page, limit),
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
      console.log(response);
      // Don't show success message here, let the component handle the success case
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
export function useAdminExcelData(params: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  portfolio?: string;
  batch?: string;
  hotel?: string;
  sort?: string;
  order?: string;
}) {
  return useQuery({
    queryKey: [queryKeys.adminExcelData, params],
    queryFn: () => apiClient.getAdminExcelData(params),
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: apiClient.downloadReport,
    onSuccess: (data) => {
      console.log(data.url);
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
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (data.status === "all_success") {
        toast.success("Bulk payment successful!", {
          description: data.message,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (data.status === "all_success") {
        toast.success("Bulk refund successful!", {
          description: data.message,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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
    onSuccess: (data) => {
      toast.success("File deleted successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
  });
}

export function useUpdateRowData() {
  return useMutation({
    // Change this line to specify the parameter types correctly
    mutationFn: (params: { documentId: string; data: any }) =>
      apiClient.updateRowData(params.documentId, params.data),
    onSuccess: (data) => {
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
