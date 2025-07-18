'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchCurrentSemesterAllocationThunk,
  fetchSemesterAllocationSummaryThunk,
  validateMarkAllocationThunk,
  selectCurrentSemesterAllocation,
  selectSelectedSemesterAllocation,
  selectLastValidationResult,
  selectMarkAllocationLoading,
  selectMarkAllocationError,
  clearError,
  clearValidationResult
} from '@/lib/features/academic/markAllocationSlice';
import { selectCurrentSemester } from '@/lib/features/academic/semestersSlice';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import { MarkValidationPayload } from '@/lib/api/markAllocation';
import styles from './MarkAllocationProgress.module.css';

interface MarkAllocationProgressProps {
  semesterId?: number;
  onValidationChange?: (isValid: boolean, remainingMarks: number) => void;
  showValidation?: boolean;
  validationMarks?: number;
  contentType?: string;
  excludeContentId?: number;
  className?: string;
}

export function MarkAllocationProgress({
  semesterId,
  onValidationChange,
  showValidation = false,
  validationMarks = 0,
  contentType,
  excludeContentId,
  className = ''
}: MarkAllocationProgressProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currentSemesterAllocation = useSelector(selectCurrentSemesterAllocation);
  const selectedSemesterAllocation = useSelector(selectSelectedSemesterAllocation);
  const lastValidationResult = useSelector(selectLastValidationResult);
  const currentSemester = useSelector(selectCurrentSemester);
  const isLoading = useSelector(selectMarkAllocationLoading);
  const error = useSelector(selectMarkAllocationError);

  const [lastValidatedMarks, setLastValidatedMarks] = useState(0);

  // Use the appropriate allocation data
  const allocation = semesterId 
    ? selectedSemesterAllocation 
    : currentSemesterAllocation;

  const effectiveSemesterId = semesterId || currentSemester?.id;

  useEffect(() => {
    // Fetch allocation data when component mounts or semester changes
    if (effectiveSemesterId) {
      if (semesterId) {
        dispatch(fetchSemesterAllocationSummaryThunk(semesterId));
      } else {
        dispatch(fetchCurrentSemesterAllocationThunk());
      }
    }
  }, [dispatch, effectiveSemesterId, semesterId]);

  // Debounced validation effect
  useEffect(() => {
    // Validate marks when validation parameters change
    if (showValidation && effectiveSemesterId && validationMarks > 0 && validationMarks !== lastValidatedMarks) {
      const validationPayload: MarkValidationPayload = {
        marks: validationMarks,
        content_type: contentType,
        exclude_content_id: excludeContentId
      };
      
      // Add a small delay to debounce rapid changes
      const validationTimeoutId = setTimeout(() => {
        // Fire and forget - don't block navigation
        dispatch(validateMarkAllocationThunk({
          semesterId: effectiveSemesterId,
          payload: validationPayload
        }));
        setLastValidatedMarks(validationMarks);
      }, 300); // 300ms debounce
      
      return () => {
        clearTimeout(validationTimeoutId);
      };
    }
  }, [dispatch, effectiveSemesterId, showValidation, validationMarks, contentType, excludeContentId, lastValidatedMarks]);

  useEffect(() => {
    // Notify parent component when validation result changes
    if (onValidationChange && lastValidationResult) {
      onValidationChange(lastValidationResult.is_valid, lastValidationResult.remaining_marks);
    }
  }, [lastValidationResult, onValidationChange]);

  useEffect(() => {
    // Clear validation result when validation marks change to 0
    if (validationMarks === 0 && lastValidationResult) {
      dispatch(clearValidationResult());
      setLastValidatedMarks(0);
    }
  }, [dispatch, validationMarks, lastValidationResult]);

  const getProgressColor = (percentage: number, isValidation = false) => {
    if (isValidation) {
      return lastValidationResult?.would_exceed_limit ? '#dc2626' : '#059669';
    }
    
    if (percentage >= 90) return '#dc2626'; // Red
    if (percentage >= 75) return '#f59e0b'; // Amber
    return '#059669'; // Green
  };

  const getProgressWidth = (allocated: number, total: number, validationMarks = 0) => {
    const percentage = ((allocated + validationMarks) / total) * 100;
    return Math.min(percentage, 100);
  };

  if (isLoading && !allocation) {
    return (
      <Card className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading mark allocation...</p>
        </div>
      </Card>
    );
  }

  if (!allocation) {
    return (
      <Card className={`${styles.container} ${className}`}>
        <div className={styles.emptyState}>
          <p>No mark allocation data available for this semester.</p>
        </div>
      </Card>
    );
  }

  const currentPercentage = (allocation.total_allocated / allocation.total_limit) * 100;
  const projectedPercentage = showValidation && validationMarks > 0 
    ? ((allocation.total_allocated + validationMarks) / allocation.total_limit) * 100 
    : currentPercentage;

  return (
    <Card className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3>Mark Allocation Progress</h3>
        <div className={styles.semesterInfo}>
          {allocation.semester_name}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{
              width: `${getProgressWidth(allocation.total_allocated, allocation.total_limit)}%`,
              backgroundColor: getProgressColor(currentPercentage)
            }}
          />
          {showValidation && validationMarks > 0 && (
            <div 
              className={styles.progressValidation}
              style={{
                left: `${getProgressWidth(allocation.total_allocated, allocation.total_limit)}%`,
                width: `${Math.min((validationMarks / allocation.total_limit) * 100, 100 - getProgressWidth(allocation.total_allocated, allocation.total_limit))}%`,
                backgroundColor: getProgressColor(projectedPercentage, true)
              }}
            />
          )}
        </div>
        
        <div className={styles.progressLabels}>
          <span>0</span>
          <span>{allocation.total_limit}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{allocation.total_allocated}</span>
          <span className={styles.statLabel}>Allocated</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{allocation.remaining_marks}</span>
          <span className={styles.statLabel}>Remaining</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{allocation.total_limit}</span>
          <span className={styles.statLabel}>Total Limit</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{currentPercentage.toFixed(1)}%</span>
          <span className={styles.statLabel}>Used</span>
        </div>
      </div>

      {/* Validation Result */}
      {showValidation && lastValidationResult && validationMarks > 0 && (
        <div className={`${styles.validationResult} ${lastValidationResult.is_valid ? styles.valid : styles.invalid}`}>
          <div className={styles.validationIcon}>
            {lastValidationResult.is_valid ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
          </div>
          <div className={styles.validationMessage}>
            <div className={styles.validationText}>
              {lastValidationResult.message}
            </div>
            {lastValidationResult.would_exceed_limit && (
              <div className={styles.validationDetails}>
                Adding {validationMarks} marks would exceed the semester limit by {validationMarks + allocation.total_allocated - allocation.total_limit} marks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Allocations */}
      {allocation.content_allocations && allocation.content_allocations.length > 0 && (
        <div className={styles.allocationsSection}>
          <h4>Content Allocations</h4>
          <div className={styles.allocationsList}>
            {allocation.content_allocations.map((contentAllocation) => (
              <div key={contentAllocation.content_id} className={styles.allocationItem}>
                <div className={styles.allocationInfo}>
                  <div className={styles.allocationTitle}>
                    {contentAllocation.content_title}
                  </div>
                  <div className={styles.allocationType}>
                    {contentAllocation.content_type}
                  </div>
                </div>
                <div className={styles.allocationMarks}>
                  {contentAllocation.allocated_marks} marks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => dispatch(clearError())}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading overlay for validation - removed to prevent navigation blocking */}
    </Card>
  );
}

export default MarkAllocationProgress;