import apiClient from "./client";
import { isAxiosError } from "axios"; // For error checking in fetchCurrentUser

// Define interfaces for expected data structures
// These should align with your backend Pydantic schemas

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: "teacher" | "admin"; // Assuming UserRole enum values
  is_active: boolean;
  created_at: string; // ISO date string
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  full_name?: string;
}

export interface OTPVerificationCredentials {
  email: string;
  otp_code: string;
}

export interface OTPResponse {
  message: string;
  email: string;
}

export const signup = async (
  credentials: SignupCredentials,
): Promise<OTPResponse> => {
  const response = await apiClient.post("/auth/register", {
    email: credentials.email,
    password: credentials.password,
    full_name: credentials.full_name,
  });
  return response.data; // Backend returns OTPResponse schema
};

// Step 1: Request OTP after credential validation
export const requestLoginOTP = async (
  credentials: LoginCredentials,
): Promise<OTPResponse> => {
  // Backend expects form data for OAuth2PasswordRequestForm
  const formData = new URLSearchParams();
  formData.append("username", credentials.email); // 'username' is the field OAuth2 expects
  formData.append("password", credentials.password);

  const response = await apiClient.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data; // Backend returns OTP response with message and email
};

// Step 2: Complete login with OTP verification
export const completeLoginWithOTP = async (
  credentials: OTPVerificationCredentials,
): Promise<User> => {
  const response = await apiClient.post("/auth/complete-login", {
    email: credentials.email,
    otp_code: credentials.otp_code,
  });
  return response.data; // Backend returns UserRead schema, token is in HttpOnly cookie
};

// Step 2: Complete signup with OTP verification
export const completeSignupWithOTP = async (
  credentials: OTPVerificationCredentials,
): Promise<User> => {
  const response = await apiClient.post("/auth/complete-signup", {
    email: credentials.email,
    otp_code: credentials.otp_code,
  });
  return response.data; // Backend returns UserRead schema, token is in HttpOnly cookie
};

// Resend OTP for login flow
export const resendLoginOTP = async (email: string): Promise<OTPResponse> => {
  const response = await apiClient.post("/auth/resend-login-otp", {
    email: email,
  });
  return response.data; // Backend returns OTP response with message and email
};

// Resend OTP for signup flow
export const resendSignupOTP = async (email: string): Promise<OTPResponse> => {
  const response = await apiClient.post("/auth/resend-signup-otp", {
    email: email,
  });
  return response.data; // Backend returns OTP response with message and email
};

// Legacy login function for backward compatibility (if needed)
export const login = async (): Promise<User> => {
  // For now, this could throw an error or redirect to OTP flow
  throw new Error(
    "Direct login is no longer supported. Please use OTP authentication.",
  );
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get("/auth/users/me");
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      // Not authenticated or token expired
      return null;
    }
    // Other errors
    console.error("Error fetching current user:", error);
    throw error; // Re-throw for further handling if needed
  }
};
// Interfaces for Password Reset
export interface ForgotPasswordPayload {
  email: string;
  origin?: string; // Optional origin to determine frontend URL
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string; // Matches backend Pydantic schema field name
}

// Response type for simple message responses from backend
export interface MessageResponse {
  message: string;
}

// --- Password Reset Functions ---

export const requestPasswordReset = async (
  payload: ForgotPasswordPayload,
): Promise<MessageResponse> => {
  // Add the origin to help backend determine which URL to use
  const data = {
    email: payload.email,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  };

  const response = await apiClient.post("/auth/forgot-password", data);
  return response.data; // Returns { "message": "..." }
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<MessageResponse> => {
  // Backend expects { "token": "...", "new_password": "..." }
  const response = await apiClient.post("/auth/reset-password", payload);
  return response.data; // Returns { "message": "..." }
};
