'use client';

import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showPercentage = true,
  label,
  animated = false,
  striped = false,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {(label || showPercentage) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && (
            <span className={styles.percentage}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div 
        className={`
          ${styles.progressBar} 
          ${styles[size]} 
          ${styles[variant]}
          ${striped ? styles.striped : ''}
        `}
      >
        <div
          className={`
            ${styles.progressFill}
            ${animated ? styles.animated : ''}
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progress: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;