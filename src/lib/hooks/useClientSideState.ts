'use client';

import { useState, useEffect } from 'react';

export function useClientSideState<T>(serverState: T, clientState: T): T {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? clientState : serverState;
}