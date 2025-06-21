import axios from "axios";

const API_BASE_URL = 'http://localhost:3001/api';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    step: string;
    sessionToken: string;
    email: string;
    expiresIn: number;
    message: string;
  }
}

interface OtpVerificationData {
  otp: string;
}

interface AuthResponse {
  message: string;
  status: string;
}

class ApiClient {
  private sessionToken: string = '';

  setSessionToken(token: string) {
    this.sessionToken = token;
  }

  getSessionToken(): string {
    return this.sessionToken;
  }

  register = async (data: RegisterData) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  login = async (data: LoginData) => {
    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, data);
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
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/verify-otp`, {
        sessionToken: this.sessionToken,
        otp: data.otp
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  resendOtp = async () => {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/resend-otp`, {
        sessionToken: this.sessionToken
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
}

export const apiClient = new ApiClient();
