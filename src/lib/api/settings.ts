import apiClient from './client';

// Profile Update Types
export interface ProfileUpdateRequest {
  full_name?: string;
  email?: string;
}

export interface ProfileUpdateResponse {
  id: number;
  email: string;
  full_name?: string;
  message: string;
}

// Password Change Types
export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangeResponse {
  message: string;
}

// User Preferences Types
export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM';
export type LanguagePreference = 'ENGLISH' | 'SPANISH' | 'FRENCH' | 'GERMAN' | 'AMHARIC';

export interface UserPreferences {
  theme: ThemePreference;
  language: LanguagePreference;
  email_notifications: boolean;
  grade_notifications: boolean;
  report_notifications: boolean;
  system_notifications: boolean;
  timezone: string;
  date_format: string;
  time_format: string;
}

export interface UserPreferencesRead extends UserPreferences {
  id: number;
  user_id: number;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserPreferencesResponse {
  preferences: UserPreferencesRead;
  message: string;
}

// 2FA Types
export interface TwoFactorSetupRequest {
  enable: boolean;
}

export interface TwoFactorSetupResponse {
  enabled: boolean;
  qr_code_url?: string;
  backup_codes?: string[];
  message: string;
}

// API Functions
export const updateProfile = async (data: ProfileUpdateRequest): Promise<ProfileUpdateResponse> => {
  const response = await apiClient.put('/settings/profile', data);
  return response.data;
};

export const changePassword = async (data: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
  const response = await apiClient.put('/settings/change-password', data);
  return response.data;
};

export const getUserPreferences = async (): Promise<UserPreferencesRead> => {
  const response = await apiClient.get('/settings/preferences');
  return response.data;
};

export const updateUserPreferences = async (data: Partial<UserPreferences>): Promise<UserPreferencesResponse> => {
  const response = await apiClient.put('/settings/preferences', data);
  return response.data;
};

export const setupTwoFactor = async (data: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> => {
  const response = await apiClient.post('/settings/setup-2fa', data);
  return response.data;
};

// Helper functions for UI
export const getThemeDisplayName = (theme: ThemePreference): string => {
  const themes = {
    LIGHT: 'Light',
    DARK: 'Dark',
    SYSTEM: 'System'
  };
  return themes[theme];
};

export const getLanguageDisplayName = (language: LanguagePreference): string => {
  const languages = {
    ENGLISH: 'English',
    SPANISH: 'Spanish',
    FRENCH: 'French',
    GERMAN: 'German',
    AMHARIC: 'Amharic'
  };
  return languages[language];
};

export const getThemeOptions = () => [
  { value: 'LIGHT' as ThemePreference, label: 'Light' },
  { value: 'DARK' as ThemePreference, label: 'Dark' },
  { value: 'SYSTEM' as ThemePreference, label: 'System' },
];

export const getLanguageOptions = () => [
  { value: 'ENGLISH' as LanguagePreference, label: 'English' },
  { value: 'SPANISH' as LanguagePreference, label: 'Spanish' },
  { value: 'FRENCH' as LanguagePreference, label: 'French' },
  { value: 'GERMAN' as LanguagePreference, label: 'German' },
  { value: 'AMHARIC' as LanguagePreference, label: 'Amharic' },
];

export const getTimezoneOptions = () => [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa' },
];