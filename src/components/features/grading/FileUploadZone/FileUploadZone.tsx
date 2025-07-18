'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  uploadBatchSectionSubmissionsThunk,
  selectActiveUpload,
  selectUploadError,
  clearUploadError
} from '@/lib/features/grading/gradingSlice';
import {
  fetchSectionsThunk,
  selectSections,
  selectSectionsLoading
} from '@/lib/features/academic/sectionsSlice';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import Button from '@/components/ui/Button/Button';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import Card from '@/components/ui/Card/Card';
import styles from './FileUploadZone.module.css';

interface FileUploadZoneProps {
  assessmentId: number;
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

interface FileUploadItem {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  submissionId?: number;
  error?: string;
}

export function FileUploadZone({ assessmentId, onUploadComplete, onUploadStart }: FileUploadZoneProps) {
  const dispatch = useDispatch<AppDispatch>();
  const activeUpload = useSelector(selectActiveUpload);
  const uploadError = useSelector(selectUploadError);
  const sections = useSelector(selectSections);
  const sectionsLoading = useSelector(selectSectionsLoading);

  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(0);

  useEffect(() => {
    // Fetch sections when component mounts
    dispatch(fetchSectionsThunk({}));
  }, [dispatch]);

  useEffect(() => {
    // Sync Redux upload state with local file state
    if (activeUpload && activeUpload.assessmentId === assessmentId) {
      setFiles(prev => prev.map((fileItem, index) => {
        const uploadFile = activeUpload.files[index];
        if (uploadFile) {
          return {
            ...fileItem,
            progress: uploadFile.progress,
            status: uploadFile.status,
            submissionId: uploadFile.submissionId,
            error: uploadFile.error
          };
        }
        return fileItem;
      }));
    }
  }, [activeUpload, assessmentId]);

  const sectionOptions = [
    { value: 0, label: 'Select a section...' },
    ...sections.map(section => ({
      value: section.id,
      label: `${section.name} (${section.subject} - ${section.grade_level})`
    }))
  ];

  const handleFileSelect = (newFiles: File[]) => {
    const newFileItems = newFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFileItems]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSectionId(Number(e.target.value));
  };

  const handleStartUpload = async () => {
    if (files.length === 0) return;
    
    if (selectedSectionId === 0) {
      alert('Please select a section before uploading files.');
      return;
    }

    onUploadStart?.();

    try {
      const fileArray = files.map(f => f.file);
      
      await dispatch(uploadBatchSectionSubmissionsThunk({
        assessmentId,
        sectionId: selectedSectionId,
        files: fileArray
      })).unwrap();

      onUploadComplete?.();
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      // Error is already handled by Redux state
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    dispatch(clearUploadError());
  };

  const totalProgress = files.length > 0
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
    : 0;

  const hasFiles = files.length > 0;
  const hasSection = selectedSectionId > 0;
  const canUpload = hasFiles && hasSection && !activeUpload;
  const isUploading = files.some(f => f.status === 'uploading');

  return (
    <div className={styles.container}>
      <Card className={styles.uploadCard}>
        <div className={styles.header}>
          <h3>Upload Student Submissions</h3>
          <p>Select a section and upload multiple student submissions. AI will identify students from the papers.</p>
        </div>

        <div className={styles.content}>
          {/* Section Selection */}
          <div className={styles.sectionSelection}>
            <LabeledSelect
              label="Select Section"
              id="section_select"
              name="section_select"
              value={selectedSectionId}
              onChange={handleSectionChange}
              options={sectionOptions}
              disabled={sectionsLoading}
              required
            />
            {selectedSectionId > 0 && (
              <div className={styles.sectionInfo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>AI will automatically identify students from this section based on their names written on the papers.</span>
              </div>
            )}
          </div>

          {/* File Upload Area */}
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf"
            multiple={true}
            maxSize={10}
            disabled={!!activeUpload}
            className={styles.dropzone}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className={styles.progressSection}>
              <h4>Upload Progress</h4>
              <ProgressBar
                value={totalProgress}
                label="Overall Progress"
                showPercentage={true}
                animated={true}
              />
              
              <div className={styles.fileProgress}>
                {files.map((fileItem, index) => (
                  <div key={index} className={styles.fileProgressItem}>
                    <div className={styles.fileProgressHeader}>
                      <span className={styles.fileName}>{fileItem.file.name}</span>
                      <span className={styles.fileStatus}>
                        {fileItem.status === 'completed' && '✓'}
                        {fileItem.status === 'failed' && '✗'}
                        {fileItem.status === 'uploading' && '⏳'}
                        {fileItem.status === 'pending' && '⌛'}
                      </span>
                    </div>
                    <ProgressBar
                      value={fileItem.progress}
                      size="sm"
                      variant={
                        fileItem.status === 'completed' ? 'success' :
                        fileItem.status === 'failed' ? 'error' :
                        'primary'
                      }
                      showPercentage={false}
                    />
                    {fileItem.error && (
                      <div className={styles.fileError}>{fileItem.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && !activeUpload && (
            <div className={styles.filesSection}>
              <div className={styles.filesSectionHeader}>
                <h4>Files Ready for Upload ({files.length})</h4>
                <div className={styles.fileSectionActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {!hasSection && (
                <div className={styles.warning}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <path d="M12 17h.01" />
                  </svg>
                  <p>Please select a section before uploading files. The AI will identify students from the selected section.</p>
                </div>
              )}

              <div className={styles.filesList}>
                {files.map((fileItem, index) => (
                  <div
                    key={index}
                    className={styles.fileItem}
                  >
                    <div className={styles.fileInfo}>
                      <div className={styles.fileIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                        </svg>
                      </div>
                      <div className={styles.fileDetails}>
                        <div className={styles.fileName}>{fileItem.file.name}</div>
                        <div className={styles.fileSize}>
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <div className={styles.fileStatus}>
                      {fileItem.status === 'completed' && (
                        <span className={styles.statusCompleted}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                          Completed
                        </span>
                      )}
                      {fileItem.status === 'failed' && (
                        <span className={styles.statusFailed}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          Failed
                        </span>
                      )}
                      {fileItem.status === 'pending' && (
                        <span className={styles.statusPending}>Ready</span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className={styles.removeButton}
                      disabled={isUploading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {uploadError && (
            <div className={styles.errorMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p>{uploadError}</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => dispatch(clearUploadError())}
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Upload Button */}
          {canUpload && (
            <div className={styles.uploadActions}>
              <Button
                onClick={handleStartUpload}
                disabled={!canUpload}
                size="lg"
              >
                Upload {files.length} Submissions
              </Button>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}

export default FileUploadZone;