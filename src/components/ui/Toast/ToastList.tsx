import React from 'react';
import styles from './ToastList.module.css';
import type { ToastItem } from '@/providers/ToastProvider';

interface ToastListProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastList({ toasts, onDismiss }: ToastListProps) {
  return (
    <div className={styles.container} aria-live="assertive" aria-atomic="true" role="status">
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.variant]}`} role="alert" aria-live="assertive">
          <div className={styles.content}>
            {t.title && <div className={styles.title}>{t.title}</div>}
            {t.description && <div className={styles.description}>{t.description}</div>}
          </div>
          <button className={styles.close} aria-label="Close" onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
} 