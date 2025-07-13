import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  PasswordChangeRequest,
  PasswordChangeResponse,
  UserPreferences,
  UserPreferencesRead,
  UserPreferencesResponse,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  getUserPreferences as apiGetUserPreferences,
  updateUserPreferences as apiUpdateUserPreferences,
  setupTwoFactor as apiSetupTwoFactor,
} from '@/lib/api/settings';
import { RootState } from '@/lib/store';

interface SettingsState {
  preferences: UserPreferencesRead | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SettingsState = {
  preferences: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  successMessage: null,
};

// Async Thunks
export const updateProfileThunk = createAsyncThunk<
  ProfileUpdateResponse,
  ProfileUpdateRequest,
  { rejectValue: string }
>(
  'settings/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await apiUpdateProfile(profileData);
      return response;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update profile');
    }
  }
);

export const changePasswordThunk = createAsyncThunk<
  PasswordChangeResponse,
  PasswordChangeRequest,
  { rejectValue: string }
>(
  'settings/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiChangePassword(passwordData);
      return response;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to change password');
    }
  }
);

export const fetchUserPreferencesThunk = createAsyncThunk<
  UserPreferencesRead,
  void,
  { rejectValue: string }
>(
  'settings/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const preferences = await apiGetUserPreferences();
      return preferences;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch preferences');
    }
  }
);

export const updateUserPreferencesThunk = createAsyncThunk<
  UserPreferencesResponse,
  Partial<UserPreferences>,
  { rejectValue: string }
>(
  'settings/updatePreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const response = await apiUpdateUserPreferences(preferencesData);
      return response;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update preferences');
    }
  }
);

export const setupTwoFactorThunk = createAsyncThunk<
  TwoFactorSetupResponse,
  TwoFactorSetupRequest,
  { rejectValue: string }
>(
  'settings/setupTwoFactor',
  async (setupData, { rejectWithValue }) => {
    try {
      const response = await apiSetupTwoFactor(setupData);
      return response;
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to setup 2FA');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? 'Failed to update profile';
        state.successMessage = null;
      })
      // Change Password
      .addCase(changePasswordThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? 'Failed to change password';
        state.successMessage = null;
      })
      // Fetch Preferences
      .addCase(fetchUserPreferencesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferencesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        state.error = null;
      })
      .addCase(fetchUserPreferencesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch preferences';
      })
      // Update Preferences
      .addCase(updateUserPreferencesThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserPreferencesThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.preferences = action.payload.preferences;
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(updateUserPreferencesThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? 'Failed to update preferences';
        state.successMessage = null;
      })
      // Setup 2FA
      .addCase(setupTwoFactorThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(setupTwoFactorThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage = action.payload.message;
        state.error = null;
        // Update 2FA status in preferences if available
        if (state.preferences) {
          state.preferences.two_factor_enabled = action.payload.enabled;
        }
      })
      .addCase(setupTwoFactorThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload ?? 'Failed to setup 2FA';
        state.successMessage = null;
      });
  },
});

export const { clearSettingsError, clearSuccessMessage, setSuccessMessage } = settingsSlice.actions;

// Selectors
export const selectUserPreferences = (state: RootState) => state.settings.preferences;
export const selectSettingsLoading = (state: RootState) => state.settings.isLoading;
export const selectSettingsUpdating = (state: RootState) => state.settings.isUpdating;
export const selectSettingsError = (state: RootState) => state.settings.error;
export const selectSettingsSuccess = (state: RootState) => state.settings.successMessage;

export default settingsSlice.reducer;