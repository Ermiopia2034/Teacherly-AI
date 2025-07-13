'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  uploadBatchSubmissionsThunk,
  uploadBatchUnifiedSubmissionsThunk,
  selectActiveUpload,
  selectUploadError,
  clearUploadError
} from '@/lib/features/grading/gradingSlice';
import { selectStudents } from '@/lib/features/students/studentsSlice';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import Button from '@/components/ui/Button/Button';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import Card from '@/components/ui/Card/Card';
import Modal from '@/components/ui/Modal/Modal';
import styles from './FileUploadZone.module.css';

interface FileUploadZoneProps {
  assessmentId: number;
  sourceType?: 'manual_assessment' | 'ai_exam';
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

interface FileWithStudent {
  file: File;
  studentId: number;
  studentName: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  submissionId?: number;
  error?: string;
}

export function FileUploadZone({ assessmentId, sourceType, onUploadComplete, onUploadStart }: FileUploadZoneProps) {
  const dispatch = useDispatch<AppDispatch>();
  const activeUpload = useSelector(selectActiveUpload);
  const uploadError = useSelector(selectUploadError);
  const students = useSelector(selectStudents);

  const [files, setFiles] = useState<FileWithStudent[]>([]);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [autoMapping, setAutoMapping] = useState(true);
  const [unmappedFiles, setUnmappedFiles] = useState<File[]>([]);

  const studentOptions = [
    { value: 0, label: 'Select a student...' },
    ...students.map(student => ({
      value: student.id,
      label: student.full_name
    }))
  ];

  // Auto-map files to students based on filename patterns
  const tryAutoMapFiles = (newFiles: File[]): FileWithStudent[] => {
    return newFiles.map(file => {
      const fileName = file.name.toLowerCase();
      
      // Try to find student by name in filename
      const matchedStudent = students.find(student => {
        const studentName = student.full_name.toLowerCase();
        const nameParts = studentName.split(' ');
        
        // Check if filename contains full name or parts of name
        return fileName.includes(studentName) || 
               nameParts.some(part => part.length > 2 && fileName.includes(part));
      });

      return {
        file,
        studentId: matchedStudent?.id || 0,
        studentName: matchedStudent?.full_name || '',
        status: 'pending' as const,
        progress: 0
      };
    });
  };

  const handleFileSelect = (newFiles: File[]) => {
    if (autoMapping) {
      const mappedFiles = tryAutoMapFiles(newFiles);
      const unmapped = mappedFiles.filter(f => f.studentId === 0);
      
      if (unmapped.length > 0) {
        setUnmappedFiles(unmapped.map(f => f.file));
        setFiles(mappedFiles);
        setShowMappingModal(true);
      } else {
        setFiles(prev => [...prev, ...mappedFiles]);
      }
    } else {
      setUnmappedFiles(newFiles);
      setShowMappingModal(true);
    }
  };

  const handleStudentMapping = (fileIndex: number, studentId: number) => {
    const student = students.find(s => s.id === studentId);
    setFiles(prev => prev.map((f, index) => 
      index === fileIndex 
        ? { ...f, studentId, studentName: student?.full_name || '' }
        : f
    ));
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (files.length === 0) return;
    
    const validFiles = files.filter(f => f.studentId > 0);
    if (validFiles.length === 0) {
      alert('Please assign students to all files before uploading.');
      return;
    }

    onUploadStart?.();

    try {
      const submissions = validFiles.map(f => ({
        studentId: f.studentId,
        file: f.file,
        fileName: f.file.name
      }));

      if (sourceType) {
        // Use unified upload for both manual assessments and AI exams
        await dispatch(uploadBatchUnifiedSubmissionsThunk({
          itemId: assessmentId,
          sourceType,
          submissions
        })).unwrap();
      } else {
        // Fallback to old manual assessment upload for backward compatibility
        await dispatch(uploadBatchSubmissionsThunk({
          assessmentId,
          submissions
        })).unwrap();
      }

      onUploadComplete?.();
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setUnmappedFiles([]);
    dispatch(clearUploadError());
  };

  const completeMappingModal = () => {
    setShowMappingModal(false);
    setUnmappedFiles([]);
  };

  const addUnmappedFiles = () => {
    const newMappedFiles = unmappedFiles.map(file => ({
      file,
      studentId: 0,
      studentName: '',
      status: 'pending' as const,
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newMappedFiles]);
    completeMappingModal();
  };

  const totalProgress = files.length > 0 
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length 
    : 0;

  const hasValidFiles = files.some(f => f.studentId > 0);
  const hasInvalidFiles = files.some(f => f.studentId === 0);

  return (
    <div className={styles.container}>
      <Card className={styles.uploadCard}>
        <div className={styles.header}>
          <h3>Upload Student Submissions</h3>
          <p>Drag and drop files or browse to upload multiple submissions at once</p>
        </div>

        <div className={styles.content}>
          {/* Auto-mapping toggle */}
          <div className={styles.options}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={autoMapping}
                onChange={(e) => setAutoMapping(e.target.checked)}
              />
              Auto-map files to students by filename
            </label>
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
          {activeUpload && (
            <div className={styles.progressSection}>
              <h4>Upload Progress</h4>
              <ProgressBar
                value={totalProgress}
                label="Overall Progress"
                showPercentage={true}
                animated={true}
              />
              
              <div className={styles.fileProgress}>
                {activeUpload.files.map((file, index) => (
                  <div key={index} className={styles.fileProgressItem}>
                    <div className={styles.fileProgressHeader}>
                      <span className={styles.fileName}>{file.fileName}</span>
                      <span className={styles.fileStatus}>
                        {file.status === 'completed' && '✓'}
                        {file.status === 'failed' && '✗'}
                        {file.status === 'uploading' && '⏳'}
                        {file.status === 'pending' && '⌛'}
                      </span>
                    </div>
                    <ProgressBar
                      value={file.progress}
                      size="sm"
                      variant={
                        file.status === 'completed' ? 'success' :
                        file.status === 'failed' ? 'error' :
                        'primary'
                      }
                      showPercentage={false}
                    />
                    {file.error && (
                      <div className={styles.fileError}>{file.error}</div>
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

              {hasInvalidFiles && (
                <div className={styles.warning}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <path d="M12 17h.01" />
                  </svg>
                  <p>Some files are not assigned to students. Please assign students before uploading.</p>
                </div>
              )}

              <div className={styles.filesList}>
                {files.map((fileItem, index) => (
                  <div 
                    key={index} 
                    className={`${styles.fileItem} ${fileItem.studentId === 0 ? styles.unassigned : ''}`}
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

                    <div className={styles.studentMapping}>
                      <LabeledSelect
                        label=""
                        id={`student_${index}`}
                        name={`student_${index}`}
                        value={fileItem.studentId}
                        onChange={(e) => handleStudentMapping(index, Number(e.target.value))}
                        options={studentOptions}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className={styles.removeButton}
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
          {hasValidFiles && !activeUpload && (
            <div className={styles.uploadActions}>
              <Button
                onClick={handleStartUpload}
                disabled={!hasValidFiles}
                size="lg"
              >
                Upload {files.filter(f => f.studentId > 0).length} Submissions
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Student Mapping Modal */}
      <Modal
        isOpen={showMappingModal}
        onClose={completeMappingModal}
        title="Student Mapping"
        size="md"
      >
        <div className={styles.mappingModal}>
          <p>Some files could not be automatically mapped to students. You can:</p>
          
          <div className={styles.mappingActions}>
            <Button
              variant="outline"
              onClick={addUnmappedFiles}
            >
              Add Files & Assign Manually
            </Button>
            <Button
              variant="secondary"
              onClick={completeMappingModal}
            >
              Skip These Files
            </Button>
          </div>
          
          <div className={styles.unmappedFiles}>
            <h4>Unmapped Files:</h4>
            <ul>
              {unmappedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FileUploadZone;