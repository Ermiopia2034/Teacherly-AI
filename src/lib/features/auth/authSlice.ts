import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  User,
  LoginCredentials,
  SignupCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  OTPVerificationCredentials,
  OTPResponse,
  requestLoginOTP as apiRequestLoginOTP,
  completeLoginWithOTP as apiCompleteLoginWithOTP,
  completeSignupWithOTP as apiCompleteSignupWithOTP,
  resendLoginOTP as apiResendLoginOTP,
  resendSignupOTP as apiResendSignupOTP,
  logout as apiLogout,
  signup as apiSignup,
  fetchCurrentUser as apiFetchCurrentUser,
  requestPasswordReset as apiRequestPasswordReset,
  resetPassword as apiResetPassword,
  MessageResponse,
} from "@/lib/api/auth";
import { RootState } from "@/lib/store";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null | undefined; // Can be string for error messages or undefined from rejectedWithValue
  otpStep: "idle" | "pending" | "sent" | "verifying" | "resending"; // Track OTP flow state
  pendingEmail: string | null; // Store email for OTP verification step
  isSignupFlow: boolean; // Track if we're in signup OTP flow vs login OTP flow
  resendCooldown: number; // Cooldown timer for resend button in seconds
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // Start with true to handle initial user fetch
  error: null,
  otpStep: "idle",
  pendingEmail: null,
  isSignupFlow: false,
  resendCooldown: 0,
};

// Async Thunks
export const requestOTP = createAsyncThunk<
  OTPResponse & { originalCredentials: LoginCredentials },
  LoginCredentials,
  { rejectValue: string }
>("auth/requestOTP", async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiRequestLoginOTP(credentials);
    return {
      ...response,
      email: credentials.email, // Ensure we have the email
      originalCredentials: credentials,
    };
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Failed to send OTP",
    );
  }
});

export const requestSignupOTP = createAsyncThunk<
  OTPResponse,
  SignupCredentials,
  { rejectValue: string }
>("auth/requestSignupOTP", async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiSignup(credentials);
    return {
      ...response,
      email: credentials.email, // Ensure we have the email
    };
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail ||
        error.message ||
        "Failed to send signup OTP",
    );
  }
});

export const verifyOTPAndLogin = createAsyncThunk<
  User,
  OTPVerificationCredentials,
  { rejectValue: string }
>("auth/verifyOTP", async (credentials, { rejectWithValue }) => {
  try {
    const user = await apiCompleteLoginWithOTP(credentials);
    return user;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Invalid OTP code",
    );
  }
});

// Legacy loginUser for backward compatibility (updated to use OTP flow)
export const loginUser = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    // First request OTP
    await apiRequestLoginOTP(credentials);
    // Return a special response indicating OTP was sent
    return rejectWithValue("OTP_REQUIRED");
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Login failed",
    );
  }
});

export const verifySignupOTPAndCompleteRegistration = createAsyncThunk<
  User,
  OTPVerificationCredentials,
  { rejectValue: string }
>("auth/verifySignupOTP", async (credentials, { rejectWithValue }) => {
  try {
    const user = await apiCompleteSignupWithOTP(credentials);
    return user;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Invalid OTP code",
    );
  }
});

// Legacy signup function updated to use OTP flow
export const signupUser = createAsyncThunk<
  OTPResponse,
  SignupCredentials,
  { rejectValue: string }
>("auth/signup", async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiSignup(credentials);
    return response;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Signup failed",
    );
  }
});

export const resendLoginOTP = createAsyncThunk<
  OTPResponse,
  string,
  { rejectValue: string }
>("auth/resendLoginOTP", async (email, { rejectWithValue }) => {
  try {
    const response = await apiResendLoginOTP(email);
    return response;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Failed to resend OTP",
    );
  }
});

export const resendSignupOTP = createAsyncThunk<
  OTPResponse,
  string,
  { rejectValue: string }
>("auth/resendSignupOTP", async (email, { rejectWithValue }) => {
  try {
    const response = await apiResendSignupOTP(email);
    return response;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Failed to resend OTP",
    );
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiLogout();
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(
        error.response?.data?.detail || error.message || "Logout failed",
      );
    }
  },
);

export const fetchUser = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>("auth/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const user = await apiFetchCurrentUser();
    return user;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    // Don't treat 401 as a "rejection" for thunk state, as it's an expected "not logged in" state
    if (error.isAxiosError && error.response?.status === 401) {
      return null;
    }
    return rejectWithValue(
      error.response?.data?.detail || error.message || "Failed to fetch user",
    );
  }
});

export const requestPasswordResetLink = createAsyncThunk<
  MessageResponse,
  ForgotPasswordPayload,
  { rejectValue: string }
>("auth/requestPasswordReset", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiRequestPasswordReset(payload);
    return response;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail ||
        error.message ||
        "Failed to request password reset",
    );
  }
});

export const performPasswordReset = createAsyncThunk<
  MessageResponse,
  ResetPasswordPayload,
  { rejectValue: string }
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiResetPassword(payload);
    return response;
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>;
    return rejectWithValue(
      error.response?.data?.detail ||
        error.message ||
        "Failed to reset password",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearOTPState: (state) => {
      state.otpStep = "idle";
      state.pendingEmail = null;
      state.isSignupFlow = false;
      state.error = null;
      state.resendCooldown = 0;
    },
    // If direct user setting is needed, e.g., after token refresh outside thunks
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    // Update user profile data in auth state
    updateUserProfile: (
      state,
      action: PayloadAction<{ email?: string; full_name?: string }>,
    ) => {
      if (state.user) {
        if (action.payload.email) state.user.email = action.payload.email;
        if (action.payload.full_name !== undefined)
          state.user.full_name = action.payload.full_name;
      }
    },
    // Decrement resend cooldown
    decrementResendCooldown: (state) => {
      if (state.resendCooldown > 0) {
        state.resendCooldown -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Request OTP
      .addCase(requestOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpStep = "pending";
      })
      .addCase(
        requestOTP.fulfilled,
        (
          state,
          action: PayloadAction<
            OTPResponse & { originalCredentials: LoginCredentials }
          >,
        ) => {
          state.isLoading = false;
          state.otpStep = "sent";
          state.pendingEmail = action.payload.email;
          state.error = null;
          state.resendCooldown = 60; // 60 second initial cooldown
        },
      )
      .addCase(requestOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.otpStep = "idle";
        state.pendingEmail = null;
        state.error = action.payload ?? action.error.message;
      })
      // Verify OTP and Login
      .addCase(verifyOTPAndLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpStep = "verifying";
      })
      .addCase(
        verifyOTPAndLogin.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.otpStep = "idle";
          state.pendingEmail = null;
          state.error = null;
        },
      )
      .addCase(verifyOTPAndLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.otpStep = "sent"; // Stay in sent state for retry
        state.error = action.payload ?? action.error.message;
      })
      // Legacy Login (now redirects to OTP flow)
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
        if (action.payload === "OTP_REQUIRED") {
          state.otpStep = "sent";
          state.error = null;
        } else {
          state.error = action.payload ?? action.error.message;
        }
      })
      // Request Signup OTP
      .addCase(requestSignupOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpStep = "pending";
        state.isSignupFlow = true;
      })
      .addCase(
        requestSignupOTP.fulfilled,
        (state, action: PayloadAction<OTPResponse>) => {
          state.isLoading = false;
          state.otpStep = "sent";
          state.pendingEmail = action.payload.email;
          state.isSignupFlow = true;
          state.error = null;
          state.resendCooldown = 60; // 60 second initial cooldown
        },
      )
      .addCase(requestSignupOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.otpStep = "idle";
        state.pendingEmail = null;
        state.isSignupFlow = false;
        state.error = action.payload ?? action.error.message;
      })
      // Verify Signup OTP and Complete Registration
      .addCase(verifySignupOTPAndCompleteRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpStep = "verifying";
      })
      .addCase(
        verifySignupOTPAndCompleteRegistration.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.otpStep = "idle";
          state.pendingEmail = null;
          state.isSignupFlow = false;
          state.error = null;
        },
      )
      .addCase(
        verifySignupOTPAndCompleteRegistration.rejected,
        (state, action) => {
          state.isLoading = false;
          state.user = null;
          state.otpStep = "sent"; // Stay in sent state for retry
          state.error = action.payload ?? action.error.message;
        },
      )
      // Legacy Signup (now redirects to OTP flow)
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpStep = "pending";
        state.isSignupFlow = true;
      })
      .addCase(
        signupUser.fulfilled,
        (state, action: PayloadAction<OTPResponse>) => {
          state.isLoading = false;
          state.otpStep = "sent";
          state.pendingEmail = action.payload.email;
          state.isSignupFlow = true;
          state.error = null;
          state.resendCooldown = 60; // 60 second initial cooldown
        },
      )
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.otpStep = "idle";
        state.isSignupFlow = false;
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
      .addCase(
        fetchUser.fulfilled,
        (state, action: PayloadAction<User | null>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.error = null;
        },
      )
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
      })
      // Resend Login OTP
      .addCase(resendLoginOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpStep = "resending";
      })
      .addCase(resendLoginOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpStep = "sent";
        state.error = null;
        state.resendCooldown = 60; // 60 second cooldown
      })
      .addCase(resendLoginOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.otpStep = "sent"; // Stay in sent state
        state.error = action.payload ?? action.error.message;
      })
      // Resend Signup OTP
      .addCase(resendSignupOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpStep = "resending";
      })
      .addCase(resendSignupOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpStep = "sent";
        state.error = null;
        state.resendCooldown = 60; // 60 second cooldown
      })
      .addCase(resendSignupOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.otpStep = "sent"; // Stay in sent state
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const {
  clearAuthError,
  clearOTPState,
  setUser,
  updateUserProfile,
  decrementResendCooldown,
} = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectOTPStep = (state: RootState) => state.auth.otpStep;
export const selectPendingEmail = (state: RootState) => state.auth.pendingEmail;
export const selectIsSignupFlow = (state: RootState) => state.auth.isSignupFlow;
export const selectResendCooldown = (state: RootState) =>
  state.auth.resendCooldown;

export default authSlice.reducer;
