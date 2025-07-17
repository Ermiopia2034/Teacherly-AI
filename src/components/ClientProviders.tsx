'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import AppInitializer from './AppInitializer';
import ErrorBoundary from './common/ErrorBoundary';
import { ThemeProvider } from '@/providers/ThemeProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ThemeProvider>
          <AppInitializer>
            {children}
          </AppInitializer>
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
}