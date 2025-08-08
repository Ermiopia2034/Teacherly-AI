'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import AppInitializer from './AppInitializer';
import ErrorBoundary from './common/ErrorBoundary';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <AppInitializer>
              {children}
            </AppInitializer>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
}