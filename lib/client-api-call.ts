import axios from "axios";
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface RegisterData {
  name: string;
  email: string;
  password: string;
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
      "Card first 4": string;
      "Card last 12": string;
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
      const response = await axios.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/register`, data);
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
        "Card first 4": string;
        "Card last 12": string;
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
  }) => {
    try {
      const response = await axios.post<ApiResponse<{
        orderId: string;
        status: string;
      }>>(`${API_BASE_URL}/paypal/process-payment`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  retryUpload = async (uploadId: string) => {
    try {
      const response = await axios.post<ApiResponse<unknown>>(
        `${API_BASE_URL}/upload/resume/${uploadId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  discardUpload = async (uploadId: string) => {
    try {
      const response = await axios.delete<ApiResponse<unknown>>(
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

  // Add an axios interceptor to handle 401 errors (unauthorized)
  setupAxiosInterceptors() {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

export const apiClient = new ApiClient();
apiClient.setupAxiosInterceptors();
