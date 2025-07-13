'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchSubmissionStatusThunk,
  startPollingSubmissionsThunk,
  selectSubmissionTracking,
  selectGradingPolling,
} from '@/lib/features/grading/gradingSlice';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import { SubmissionStatusResponse } from '@/lib/api/grading';
import styles from './GradingProgress.module.css';

interface GradingProgressProps {
  submissionIds: number[];
  onAllCompleted?: (results: Record<number, SubmissionStatusResponse>) => void;
  showIndividualProgress?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ProgressStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export function GradingProgress({ 
  submissionIds, 
  onAllCompleted,
  showIndividualProgress = true,
  autoRefresh = true,
  refreshInterval = 3000
}: GradingProgressProps) {
  const dispatch = useDispatch<AppDispatch>();
  const submissionTracking = useSelector(selectSubmissionTracking);
  const isPolling = useSelector(selectGradingPolling);

  const [stats, setStats] = useState<ProgressStats>({
    total: submissionIds.length,
    pending: submissionIds.length,
    processing: 0,
    completed: 0,
    failed: 0
  });

  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const hasCalledOnAllCompleted = useRef(false);

  // Memoize the stats calculation to prevent unnecessary recalculations
  const calculatedStats = useMemo(() => {
    return submissionIds.reduce((acc, id) => {
      const tracking = submissionTracking[id];
      if (!tracking) {
        acc.pending++;
      } else {
        switch (tracking.status.status) {
          case 'pending':
            acc.pending++;
            break;
          case 'processing':
            acc.processing++;
            break;
          case 'completed':
            acc.completed++;
            break;
          case 'failed':
            acc.failed++;
            break;
        }
      }
      return acc;
    }, {
      total: submissionIds.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    });
  }, [submissionTracking, submissionIds]);

  // Update stats when calculated stats change
  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  // Separate effect for handling completion callback
  useEffect(() => {
    // Check if all submissions are completed
    const isCompleted = calculatedStats.completed + calculatedStats.failed === calculatedStats.total && calculatedStats.total > 0;
    
    if (isCompleted && !hasCalledOnAllCompleted.current && onAllCompleted) {
      hasCalledOnAllCompleted.current = true;
      
      const results = submissionIds.reduce((acc, id) => {
        const tracking = submissionTracking[id];
        if (tracking) {
          acc[id] = tracking.status;
        }
        return acc;
      }, {} as Record<number, SubmissionStatusResponse>);

      onAllCompleted(results);
    } else if (!isCompleted) {
      hasCalledOnAllCompleted.current = false;
    }
  }, [calculatedStats, submissionIds, submissionTracking, onAllCompleted]);

  // Memoize the refresh function to prevent recreating it on every render
  const refreshAll = useCallback(async () => {
    setLastRefresh(new Date());
    
    // Fetch status for all submissions
    const promises = submissionIds.map(id =>
      dispatch(fetchSubmissionStatusThunk(id))
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to refresh submission statuses:', error);
    }
  }, [submissionIds, dispatch]);

  // Auto refresh functionality
  useEffect(() => {
    // Clear existing timer if conditions change
    if (refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }

    if (autoRefresh && !isPolling && stats.completed + stats.failed < stats.total) {
      const timer = setInterval(() => {
        refreshAll();
      }, refreshInterval);

      setRefreshTimer(timer);
      return () => {
        clearInterval(timer);
        setRefreshTimer(null);
      };
    }
  }, [autoRefresh, isPolling, stats, refreshInterval, refreshAll, refreshTimer]);

  // Initial data fetch
  useEffect(() => {
    if (submissionIds.length > 0) {
      refreshAll();
    }
  }, [submissionIds, refreshAll]);

  const handleRefreshAll = useCallback(async () => {
    refreshAll();
  }, [refreshAll]);

  const handleStartPolling = useCallback(() => {
    if (submissionIds.length > 0) {
      dispatch(startPollingSubmissionsThunk(submissionIds));
    }
  }, [submissionIds, dispatch]);

  const getOverallProgress = useCallback((): number => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.completed + stats.failed) / stats.total) * 100);
  }, [stats]);

  const getProcessingProgress = useCallback((): number => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.processing + stats.completed + stats.failed) / stats.total) * 100);
  }, [stats]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        );
      case 'processing':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinning}>
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        );
      case 'completed':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        );
      case 'failed':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return '#a1a1aa';
      case 'processing':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#a1a1aa';
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.progressCard}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3>Grading Progress</h3>
            <p>Real-time tracking of OCR processing and automated grading</p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isPolling}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10" />
                <polyline points="1,20 1,14 7,14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Refresh
            </Button>
            {!isPolling && stats.completed + stats.failed < stats.total && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartPolling}
              >
                Start Auto-Polling
              </Button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {/* Overall Progress */}
          <div className={styles.overallProgress}>
            <div className={styles.progressHeader}>
              <h4>Overall Progress</h4>
              <span className={styles.progressStats}>
                {stats.completed + stats.failed} of {stats.total} completed
              </span>
            </div>
            <ProgressBar
              value={getOverallProgress()}
              label="Completion"
              showPercentage={true}
              size="lg"
              variant="primary"
              animated={stats.processing > 0}
            />
          </div>

          {/* Processing Progress */}
          {stats.processing > 0 && (
            <div className={styles.processingProgress}>
              <div className={styles.progressHeader}>
                <h4>Currently Processing</h4>
                <span className={styles.progressStats}>
                  {stats.processing} submission{stats.processing !== 1 ? 's' : ''}
                </span>
              </div>
              <ProgressBar
                value={getProcessingProgress()}
                label="Processing"
                showPercentage={false}
                size="md"
                variant="primary"
                animated={true}
                striped={true}
              />
            </div>
          )}

          {/* Statistics Grid */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.pending}`}>
              <div className={styles.statIcon}>
                {getStatusIcon('pending')}
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.pending}</div>
                <div className={styles.statLabel}>Pending</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.processing}`}>
              <div className={styles.statIcon}>
                {getStatusIcon('processing')}
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.processing}</div>
                <div className={styles.statLabel}>Processing</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.completed}`}>
              <div className={styles.statIcon}>
                {getStatusIcon('completed')}
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.completed}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.failed}`}>
              <div className={styles.statIcon}>
                {getStatusIcon('failed')}
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.failed}</div>
                <div className={styles.statLabel}>Failed</div>
              </div>
            </div>
          </div>

          {/* Individual Progress */}
          {showIndividualProgress && submissionIds.length > 0 && (
            <div className={styles.individualProgress}>
              <div className={styles.progressHeader}>
                <h4>Individual Submissions</h4>
                <span className={styles.lastRefresh}>
                  Last updated: {formatTime(lastRefresh)}
                </span>
              </div>
              
              <div className={styles.submissionsList}>
                {submissionIds.map(id => {
                  const tracking = submissionTracking[id];
                  const status = tracking?.status.status || 'pending';
                  
                  return (
                    <div key={id} className={styles.submissionItem}>
                      <div className={styles.submissionHeader}>
                        <div className={styles.submissionId}>
                          Submission #{id}
                        </div>
                        <div 
                          className={styles.submissionStatus}
                          style={{ color: getStatusColor(status) }}
                        >
                          {getStatusIcon(status)}
                          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                        </div>
                      </div>
                      
                      {tracking?.status.ocr_confidence && (
                        <div className={styles.submissionDetails}>
                          <div className={styles.ocrConfidence}>
                            OCR Confidence: {Math.round(tracking.status.ocr_confidence * 100)}%
                          </div>
                        </div>
                      )}
                      
                      {tracking?.status.grading_result &&
                       typeof tracking.status.grading_result.percentage === 'number' &&
                       !isNaN(tracking.status.grading_result.percentage) &&
                       typeof tracking.status.grading_result.total_score === 'number' &&
                       typeof tracking.status.grading_result.max_score === 'number' && (
                        <div className={styles.gradingResult}>
                          <div className={styles.score}>
                            Score: {tracking.status.grading_result.total_score} / {tracking.status.grading_result.max_score}
                            <span className={styles.percentage}>
                              ({tracking.status.grading_result.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {tracking?.status.error_message && (
                        <div className={styles.errorMessage}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          {tracking.status.error_message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className={styles.statusIndicators}>
            {isPolling && (
              <div className={styles.pollingIndicator}>
                <div className={styles.pulsingDot}></div>
                <span>Auto-refreshing every {refreshInterval / 1000}s</span>
              </div>
            )}
            
            {stats.completed + stats.failed === stats.total && stats.total > 0 && (
              <div className={styles.completionIndicator}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>All submissions processed</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default GradingProgress;