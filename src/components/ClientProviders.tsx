'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import AppInitializer from './AppInitializer';
import ErrorBoundary from './common/ErrorBoundary';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppInitializer>
          {children}
        </AppInitializer>
      </ErrorBoundary>
    </Provider>
  );
}