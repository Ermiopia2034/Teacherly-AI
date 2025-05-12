import axios from 'axios';

// Define the base URL for your API. Adjust if your backend runs elsewhere.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Define interfaces for expected data structures
// These should align with your backend Pydantic schemas

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'teacher' | 'admin'; // Assuming UserRole enum values
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

// Create an Axios instance for API calls
// We use `withCredentials: true` so that cookies (like HttpOnly auth token) are sent
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

export const signup = async (credentials: SignupCredentials): Promise<User> => {
  const response = await apiClient.post('/auth/register', {
    email: credentials.email,
    password: credentials.password,
    full_name: credentials.full_name,
  });
  return response.data; // Backend returns UserRead schema
};

export const login = async (credentials: LoginCredentials): Promise<User> => {
  // Backend expects form data for OAuth2PasswordRequestForm
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // 'username' is the field OAuth2 expects
  formData.append('password', credentials.password);

  const response = await apiClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data; // Backend returns UserRead schema, token is in HttpOnly cookie
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/auth/users/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
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
  origin?: string;  // Optional origin to determine frontend URL
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

export const requestPasswordReset = async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
  // Add the origin to help backend determine which URL to use
  const data = { 
    email: payload.email,
    origin: typeof window !== 'undefined' ? window.location.origin : undefined
  };
  
  const response = await apiClient.post('/auth/forgot-password', data);
  return response.data; // Returns { "message": "..." }
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
  // Backend expects { "token": "...", "new_password": "..." }
  const response = await apiClient.post('/auth/reset-password', payload);
  return response.data; // Returns { "message": "..." }
};