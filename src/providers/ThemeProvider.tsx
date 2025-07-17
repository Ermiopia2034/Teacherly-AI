'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  selectResolvedTheme,
  selectTheme,
  selectSystemTheme,
  setSystemTheme,
  initializeTheme,
  setTheme,
  toggleTheme,
  Theme,
} from '@/lib/features/theme/themeSlice';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector(selectTheme);
  const resolvedTheme = useSelector(selectResolvedTheme);
  const systemTheme = useSelector(selectSystemTheme);

  // Apply theme to HTML document
  const applyTheme = useCallback((currentTheme: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.documentElement.style.colorScheme = currentTheme;
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'light' : 'dark';
      dispatch(setSystemTheme(newSystemTheme));
    };

    // Add listener for system preference changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dispatch]);

  // Apply theme whenever resolvedTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  // Initialize theme on mount
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme: (newTheme: Theme) => dispatch(setTheme(newTheme)),
    toggleTheme: () => dispatch(toggleTheme()),
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme initialization script for preventing flash
export const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('teacherly-theme') || 'system';
    var systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var resolvedTheme = theme === 'system' ? systemTheme : theme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`;