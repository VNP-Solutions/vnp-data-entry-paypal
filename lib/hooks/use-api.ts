import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client-api-call";
import { toast } from "sonner";

// Query keys
export const queryKeys = {
  rowData: "row-data",
  uploadSessions: "upload-sessions",
  singleRowData: (id: string) => ["single-row-data", id],
} as const;

// Row Data Hooks
export function useRowData(params: { limit: number; page: number; chargeStatus: string }) {
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
        toast.success("Registration successful! Please sign in.");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
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

// PayPal Payment Hook
export function useProcessPayPalPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.processPayPalPayment,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success("Payment processed successfully!");
        // Invalidate queries that need to be updated
        queryClient.invalidateQueries({ queryKey: [queryKeys.rowData] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Payment processing failed");
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