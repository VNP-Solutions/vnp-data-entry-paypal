import axios from "axios";
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface RegisterData {
  name?: string;
  email: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  profile?: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  step: string;
  sessionToken: string;
  email: string;
  expiresIn: number;
  message: string;
}

interface OtpVerificationResponse {
  user: User;
  token: string;
  tokenExpiresIn: string;
}

interface OtpVerificationData {
  otp: string;
}

interface AuthResponse {
  message: string;
  status: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

interface UploadResponse {
  status: string;
  message: string;
  data: Record<string, unknown>;
}

interface RowDataParams {
  limit: number;
  page: number;
  chargeStatus: string;
}

interface RowDataResponse {
  status: string;
  data: {
    rows: Array<{
      id: string;
      uploadId: string;
      fileName: string;
      uploadStatus: string;
      rowNumber: number;
      "Expedia ID": string;
      "Batch": string;
      "Posting Type": string;
      "Portfolio": string;
      "Hotel Name": string;
      "Reservation ID": string;
      "Hotel Confirmation Code": string;
      "Name": string;
      "Check In": string;
      "Check Out": string;
      "Curency": string;
      "Amount to charge": string;
      "Charge status": string;
      // "Card first 4": string;
      // "Card last 12": string;
      "Card Number": string;
      "Card Expire": string;
      "Card CVV": string;
      "Soft Descriptor": string;
      createdAt: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
    filters: {
      chargeStatus: string;
      search: string | null;
    };
  };
}

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

interface UploadSessionsResponse {
  status: string;
  data: {
    sessions: UploadSession[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data: T;
}

interface ValidateInvitationData {
  email: string;
  tempPassword: string;
  token: string;
}

interface CompleteInvitationData {
  email: string;
  tempPassword: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface StripeCreateAccountData {
  email: string;
  country: string;
  type: string;
}

interface AdminExcelDataParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  portfolio?: string;
  batch?: string;
  hotel?: string;
  sort?: string;
  order?: string;
}

interface AdminExcelDataItem {
  _id: string;
  userId: string;
  uploadId: string;
  fileName: string;
  uploadStatus: string;
  rowNumber: number;
  "Expedia ID": string;
  "Batch": string;
  "Posting Type": string;
  "Portfolio": string;
  "Hotel Name": string;
  "Reservation ID": string;
  "Hotel Confirmation Code": string;
  "Name": string;
  "Check In": string;
  "Check Out": string;
  "Curency": string;
  "Amount to charge": string;
  "Charge status": string;
  // "Card first 4": string;
  // "Card last 12": string;
  "Card Number": string;
  "Card Expire": string;
  "Card CVV": string;
  "Soft Descriptor": string;
  "VNP Work ID": string | null;
  "Status": string | null;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  paypalNetworkTransactionId: string | null;
  paypalFee: string | null;
  paypalNetAmount: string | null;
  paypalCardBrand: string | null;
  paypalCardType: string | null;
  paypalAvsCode: string | null;
  paypalCvvCode: string | null;
  paypalCreateTime: string | null;
  paypalUpdateTime: string | null;
  paypalStatus: string | null;
  paypalAmount: string | null;
  paypalCurrency: string | null;
  paypalCardLastDigits: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminExcelDataResponse {
  data: AdminExcelDataItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    applied: {
      search: string;
      status: string;
      portfolio: string;
      batch: string;
      hotel: string;
      sort: string;
      order: string;
    };
    available: {
      statusOptions: string[];
      portfolioOptions: string[];
      batchOptions: string[];
    };
  };
  requestedBy: string;
  timestamp: string;
}


class ApiClient {
  private sessionToken: string = '';
  private authToken: string = '';

  constructor() {
    // Initialize auth token from cookie
    if (typeof window !== 'undefined') {
      const storedToken = Cookies.get('auth_token');
      if (storedToken) {
        this.setAuthToken(storedToken);
      }
    }
  }

  setSessionToken(token: string) {
    this.sessionToken = token;
  }

  getSessionToken(): string {
    return this.sessionToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      // Set cookie with httpOnly and secure flags
      Cookies.set('auth_token', token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
    // Set the default authorization header for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getAuthToken(): string {
    return this.authToken;
  }

  clearAuthToken() {
    this.authToken = '';
    if (typeof window !== 'undefined') {
      Cookies.remove('auth_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  register = async (data: RegisterData) => {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${API_BASE_URL}/invitations/send`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  login = async (data: LoginData) => {
    try {
      const response = await axios.post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/auth/login`, data);
      if (response.data.status === 'success') {
        this.setSessionToken(response.data.data.sessionToken);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  verifyOtp = async (data: OtpVerificationData) => {
    try {
      const response = await axios.post<ApiResponse<OtpVerificationResponse>>(`${API_BASE_URL}/auth/verify-otp`, {
        sessionToken: this.sessionToken,
        otp: data.otp
      });
      
      if (response.data.status === 'success') {
        // Save the auth token after successful OTP verification
        this.setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  resendOtp = async () => {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/resend-otp`, {
        sessionToken: this.sessionToken
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  forgotPassword = async (data: ForgotPasswordData) => {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/forgot-password`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  resetPassword = async (resetToken: string, data: ResetPasswordData) => {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${API_BASE_URL}/auth/reset-password/${resetToken}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<ApiResponse<UploadResponse>>(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getRowData = async (params: RowDataParams) => {
    try {
      const response = await axios.get<ApiResponse<RowDataResponse>>(`${API_BASE_URL}/get-row-data`, {
        params: {
          limit: params.limit,
          page: params.page,
          chargeStatus: params.chargeStatus
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getSingleRowData = async (documentId: string) => {
    try {
      const response = await axios.get<ApiResponse<{
        id: string;
        uploadId: string;
        fileName: string;
        uploadStatus: string;
        rowNumber: number;
        "Expedia ID": string;
        "Batch": string;
        "Posting Type": string;
        "Portfolio": string;
        "Hotel Name": string;
        "Reservation ID": string;
        "Hotel Confirmation Code": string;
        "Name": string;
        "Check In": string;
        "Check Out": string;
        "Curency": string;
        "Amount to charge": string;
        "Charge status": string;
        // "Card first 4": string;
        // "Card last 12": string;
        "Card Number": string;
        "Card Expire": string;
        "Card CVV": string;
        "Soft Descriptor": string;
        "VNP Work ID": string | null;
        "Status": string | null;
        paypalOrderId: string | null;
        paypalCaptureId: string | null;
        paypalNetworkTransactionId: string | null;
        paypalFee: string | null;
        paypalNetAmount: string | null;
        paypalCardBrand: string | null;
        paypalCardType: string | null;
        paypalAvsCode: string | null;
        paypalCvvCode: string | null;
        paypalCreateTime: string | null;
        paypalUpdateTime: string | null;
        paypalStatus: string | null;
        paypalAmount: string | null;
        paypalCurrency: string | null;
        paypalCardLastDigits: string | null;
        createdAt: string;
      }>>(`${API_BASE_URL}/get-single-row-data/${documentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getUploadSessions = async (page: number = 1, limit: number = 20) => {
    try {
      const response = await axios.get<ApiResponse<UploadSessionsResponse>>(`${API_BASE_URL}/upload/sessions`, {
        params: {
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  processPayPalPayment = async (data: {
    amount: number;
    currency: string;
    descriptor: string;
    documentId: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    cardholderName: string;
    zipCode: string;
    countryCode: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
  }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paypal/process-payment`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  retryUpload = async (uploadId: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/resume/${uploadId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  discardUpload = async (uploadId: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/upload/cleanup`,
        {
          params: { uploadId }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  logout = async () => {
    try {
      this.clearAuthToken();
      window.location.href = '/auth/login';
    } catch (error) {
      throw error;
    }
  };

  validateInvitation = async (data: ValidateInvitationData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invitations/validate`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  completeInvitation = async (data: CompleteInvitationData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invitations/complete`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getMyInvitations = async (page: number = 1, limit: number = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/invitations/my-invitations`,
        {
          params: {
            page,
            limit
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getProfile = async () => {
    try {
      const response = await axios.get<ApiResponse<{ user: User }>>(`${API_BASE_URL}/auth/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getAdminExcelData = async (params: AdminExcelDataParams) => {
    try {
      const response = await axios.get<ApiResponse<AdminExcelDataResponse>>(`${API_BASE_URL}/admin/excel-data`, {
        params: params
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  createStripeAccount = async (data: StripeCreateAccountData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/stripe/create-account`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getStripeAccounts = async (page: number = 1, limit: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stripe/accounts`, {
        params: {
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  downloadReport = async (uploadId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files/${uploadId}/download`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  makeBulkPayment = async (documentIds: string[]) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paypal/process-bulk-payments`, { 
        documentIds
       });
      return response.data;
    } catch (error) { 
      throw error;
    }
  };

  makeBulkRefund = async (documentIds: string[]) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paypal/process-bulk-refunds`, { 
        documentIds
       });
      return response.data;
    } catch (error) { 
      throw error;
    }
  };

  processRefund = async (documentId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paypal/process-refund`, { 
        documentId,
        refundType: "full"
       });
      return response.data;
    } catch (error) { 
      throw error;
    }
  };

  deleteFile = async (uploadId: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/upload/delete/${uploadId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Add an axios interceptor to handle 401 errors (unauthorized)
  setupAxiosInterceptors() {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

export const apiClient = new ApiClient();
apiClient.setupAxiosInterceptors();
