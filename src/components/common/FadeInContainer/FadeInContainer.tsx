'use client';

import { useState, useEffect, ReactNode } from 'react';
import styles from '@/app/dashboard/dashboard.module.css';

interface FadeInContainerProps {
  children: ReactNode;
}

export default function FadeInContainer({ children }: FadeInContainerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return <div className={`${isLoaded ? styles.fadeIn : ''}`}>{children}</div>;
}