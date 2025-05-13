'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import AppInitializer from './AppInitializer';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      <AppInitializer>
        {children}
      </AppInitializer>
    </Provider>
  );
} 