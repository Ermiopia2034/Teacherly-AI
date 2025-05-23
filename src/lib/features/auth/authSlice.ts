import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  User,
  LoginCredentials,
  SignupCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  fetchCurrentUser as apiFetchCurrentUser,
  requestPasswordReset as apiRequestPasswordReset,
  resetPassword as apiResetPassword,
  MessageResponse
} from '@/lib/api/auth';
import { RootState } from '@/lib/store';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null | undefined; // Can be string for error messages or undefined from rejectedWithValue
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // Start with true to handle initial user fetch
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk<User, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await apiLogin(credentials);
      return user;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk<User, SignupCredentials, { rejectValue: string }>(
  'auth/signup',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await apiSignup(credentials);
      // Optionally, you could dispatch loginUser or fetchCurrentUser here
      // For now, we assume signup also establishes a session or returns the user context needed
      return user;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Signup failed');
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiLogout();
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Logout failed');
    }
  }
);

export const fetchUser = createAsyncThunk<User | null, void, { rejectValue: string }>(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiFetchCurrentUser();
      return user;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      // Don't treat 401 as a "rejection" for thunk state, as it's an expected "not logged in" state
      if (error.isAxiosError && error.response?.status === 401) {
        return null;
      }
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch user');
    }
  }
);

export const requestPasswordResetLink = createAsyncThunk<MessageResponse, ForgotPasswordPayload, { rejectValue: string }>(
  'auth/requestPasswordReset',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiRequestPasswordReset(payload);
      return response;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to request password reset');
    }
  }
);

export const performPasswordReset = createAsyncThunk<MessageResponse, ResetPasswordPayload, { rejectValue: string }>(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiResetPassword(payload);
      return response;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to reset password');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    // If direct user setting is needed, e.g., after token refresh outside thunks
    setUser: (state, action: PayloadAction<User | null>) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload ?? action.error.message;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload; // Assuming signup logs the user in or returns user data
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload ?? action.error.message;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // User might still be null, but log the error
        state.error = action.payload ?? action.error.message;
      })
      // Fetch Current User
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null; // Crucial on fetch error
        state.error = action.payload ?? action.error.message;
      })
      // Request Password Reset
      .addCase(requestPasswordResetLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPasswordResetLink.fulfilled, (state) => {
        state.isLoading = false;
        // No change to user state, error cleared if successful
        state.error = null;
      })
      .addCase(requestPasswordResetLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message;
      })
      // Perform Password Reset
      .addCase(performPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
         // No change to user state, error cleared if successful
        state.error = null;
      })
      .addCase(performPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;