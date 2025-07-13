'use client';

import React, { useState, useCallback, useRef } from 'react';
import Button from '../Button/Button';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.jpg,.jpeg,.png,.pdf',
  multiple = true,
  maxSize = 10,
  disabled = false,
  className,
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    Array.from(files).forEach(file => {
      if (file.size > maxSizeBytes) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }
      validFiles.push(file);
    });

    return validFiles;
  }, [maxSize]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  }, [onFileSelect, validateFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className={styles.hiddenInput}
          disabled={disabled}
        />
        
        {children || (
          <div className={styles.defaultContent}>
            <div className={styles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,5 17,10" />
                <line x1="12" y1="5" x2="12" y2="15" />
              </svg>
            </div>
            <div className={styles.uploadText}>
              <p className={styles.primaryText}>
                {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className={styles.secondaryText}>
                or <Button variant="link" disabled={disabled}>browse files</Button>
              </p>
              <p className={styles.supportText}>
                Supports: {accept.split(',').join(', ')} (max {maxSize}MB each)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;