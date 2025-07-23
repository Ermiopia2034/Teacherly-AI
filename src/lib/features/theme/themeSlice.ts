import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

// Helper function to get system theme
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

// Helper function to get stored theme
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('teacherly-theme') as Theme) || 'light';
};

// Helper function to resolve theme
const resolveTheme = (theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' => {
  return theme === 'system' ? systemTheme : theme;
};

const initialSystemTheme = getSystemTheme();
const initialTheme = getStoredTheme();

const initialState: ThemeState = {
  theme: initialTheme,
  systemTheme: initialSystemTheme,
  resolvedTheme: resolveTheme(initialTheme, initialSystemTheme),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.resolvedTheme = resolveTheme(action.payload, state.systemTheme);
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('teacherly-theme', action.payload);
      }
    },
    
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload;
      state.resolvedTheme = resolveTheme(state.theme, action.payload);
    },
    
    toggleTheme: (state) => {
      // Only toggle between light and dark, not system
      const newTheme = state.resolvedTheme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      state.resolvedTheme = newTheme;
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('teacherly-theme', newTheme);
      }
    },
    
    initializeTheme: (state) => {
      // Initialize theme from localStorage and system preference
      const storedTheme = getStoredTheme();
      const systemTheme = getSystemTheme();
      
      state.theme = storedTheme;
      state.systemTheme = systemTheme;
      state.resolvedTheme = resolveTheme(storedTheme, systemTheme);
    },
  },
});

export const { setTheme, setSystemTheme, toggleTheme, initializeTheme } = themeSlice.actions;

// Selectors
export const selectTheme = (state: RootState) => state.theme.theme;
export const selectSystemTheme = (state: RootState) => state.theme.systemTheme;
export const selectResolvedTheme = (state: RootState) => state.theme.resolvedTheme;
export const selectThemeState = (state: RootState) => state.theme;

export default themeSlice.reducer;