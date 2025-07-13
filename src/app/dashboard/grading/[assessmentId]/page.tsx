'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchAssessmentByIdThunk,
  fetchAssessmentStatsThunk,
  fetchAssessmentSubmissionsThunk,
  fetchUnifiedGradingItemByIdThunk,
  fetchUnifiedItemSubmissionsThunk,
  fetchUnifiedItemStatsThunk,
  selectCurrentAssessment,
  selectSubmissions,
  selectGradingLoading,
  selectGradingError,
  clearError,
  clearCurrentAssessment
} from '@/lib/features/grading/gradingSlice';
import { fetchStudentsThunk } from '@/lib/features/students/studentsSlice';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import Modal from '@/components/ui/Modal/Modal';
import DataTable, { Column } from '@/components/ui/DataTable/DataTable';
import FileUploadZone from '@/components/features/grading/FileUploadZone';
import GradingProgress from '@/components/features/grading/GradingProgress';
import ResultsOverview from '@/components/features/grading/ResultsOverview';
import { Submission } from '@/lib/api/grading';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const assessmentId = parseInt(params.assessmentId as string);
  const currentAssessment = useSelector(selectCurrentAssessment);
  // const assessmentStats = useSelector(selectAssessmentStats);
  const submissions = useSelector(selectSubmissions);
  const isLoading = useSelector(selectGradingLoading);
  const error = useSelector(selectGradingError);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submissionsPagination, setSubmissionsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [itemSourceType, setItemSourceType] = useState<'manual_assessment' | 'ai_exam' | null>(null);

  const breadcrumbItems = useMemo(() => [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'OCR Grading', href: '/dashboard/grading' },
    { label: currentAssessment?.title || 'Assessment', href: `/dashboard/grading/${assessmentId}` }
  ], [currentAssessment?.title, assessmentId]);

  const tabs: TabConfig[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h10" />
          <path d="M7 12h7" />
          <path d="M7 16h4" />
        </svg>
      )
    },
    {
      id: 'upload',
      label: 'Upload Submissions',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,5 17,10" />
          <line x1="12" y1="5" x2="12" y2="15" />
        </svg>
      )
    },
    {
      id: 'progress',
      label: 'Grading Progress',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      ),
      count: submissions.filter(s => s.status === 'processing').length
    },
    {
      id: 'results',
      label: 'Results',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      count: submissions.filter(s => s.grading_result).length
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      ),
      count: submissions.length
    }
  ], [submissions]);

  useEffect(() => {
    if (assessmentId) {
      // First try to fetch as unified grading item
      dispatch(fetchUnifiedGradingItemByIdThunk(assessmentId))
        .unwrap()
        .then((assessment) => {
          // Determine source type from the current assessment data
          // Since we converted it in the thunk, we need another way to get source type
          // For now, let's use the answer_key structure to determine type
          const answerKey = JSON.parse(assessment.answer_key);
          const sourceType = answerKey.source_type || 'manual_assessment';
          setItemSourceType(sourceType);
          
          // Fetch additional data based on source type
          dispatch(fetchUnifiedItemStatsThunk({ itemId: assessmentId, sourceType }));
        })
        .catch(() => {
          // If unified fetch fails, try as manual assessment for backward compatibility
          // Only call manual assessment APIs if the item might actually exist there
          dispatch(fetchAssessmentByIdThunk(assessmentId))
            .unwrap()
            .then(() => {
              // Success - it's a manual assessment
              setItemSourceType('manual_assessment');
              dispatch(fetchAssessmentStatsThunk(assessmentId));
              dispatch(fetchAssessmentSubmissionsThunk({ assessmentId }));
            })
            .catch(() => {
              // Complete failure - item not found in either system
              console.error(`Assessment ${assessmentId} not found in either manual assessments or AI exams`);
            });
        });
      
      dispatch(fetchStudentsThunk({}));
    }

    return () => {
      // Clear current assessment when component unmounts
      dispatch(clearCurrentAssessment());
    };
  }, [dispatch, assessmentId]);

  useEffect(() => {
    // Update pagination total when submissions change
    setSubmissionsPagination(prev => ({
      ...prev,
      total: submissions.length
    }));
  }, [submissions]);

  const handleUploadComplete = useCallback(() => {
    setShowUploadModal(false);
    // Refresh submissions and stats based on source type
    if (itemSourceType) {
      dispatch(fetchUnifiedItemSubmissionsThunk({
        itemId: assessmentId,
        sourceType: itemSourceType
      }));
      dispatch(fetchUnifiedItemStatsThunk({
        itemId: assessmentId,
        sourceType: itemSourceType
      }));
    } else {
      // Fallback to manual assessment APIs
      dispatch(fetchAssessmentSubmissionsThunk({ assessmentId }));
      dispatch(fetchAssessmentStatsThunk(assessmentId));
    }
    
    // Switch to progress tab to show upload results
    setActiveTab('progress');
  }, [itemSourceType, assessmentId, dispatch]);

  const handleUploadStart = useCallback(() => {
    // Switch to progress tab when upload starts
    setActiveTab('progress');
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: styles.statusPending },
      processing: { label: 'Processing', className: styles.statusProcessing },
      completed: { label: 'Completed', className: styles.statusCompleted },
      failed: { label: 'Failed', className: styles.statusFailed }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  }, []);

  const submissionColumns: Column<Submission>[] = useMemo(() => [
    {
      key: 'student_name',
      title: 'Student',
      dataIndex: 'student_name',
      sortable: true,
      render: (value, record) => (
        <div className={styles.studentCell}>
          <div className={styles.studentName}>{(value as string) || `Student ${record.student_id}`}</div>
          <div className={styles.studentId}>ID: {record.student_id}</div>
        </div>
      )
    },
    {
      key: 'original_filename',
      title: 'File',
      dataIndex: 'original_filename',
      render: (value) => (
        <div className={styles.fileCell}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          <span className={styles.fileName}>{String(value)}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      render: (value) => getStatusBadge(String(value)),
      width: 120
    },
    {
      key: 'score',
      title: 'Score',
      render: (_, record) => {
        if (record.grading_result &&
            typeof record.grading_result.percentage === 'number' &&
            !isNaN(record.grading_result.percentage) &&
            typeof record.grading_result.total_score === 'number' &&
            typeof record.grading_result.max_score === 'number') {
          return (
            <div className={styles.scoreCell}>
              <div className={styles.score}>
                {record.grading_result.total_score} / {record.grading_result.max_score}
              </div>
              <div className={styles.percentage}>
                {record.grading_result.percentage.toFixed(1)}%
              </div>
            </div>
          );
        }
        return <span className={styles.noScore}>—</span>;
      },
      width: 100,
      align: 'center'
    },
    {
      key: 'submitted_at',
      title: 'Submitted',
      dataIndex: 'submitted_at',
      sortable: true,
      render: (value) => formatDate(String(value)),
      width: 150
    }
  ], [formatDate, getStatusBadge]);

  const handleSubmissionsPaginationChange = useCallback((page: number, pageSize: number) => {
    setSubmissionsPagination(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
  }, []);

  // Memoize submission IDs to prevent infinite re-renders
  const submissionIds = useMemo(() => submissions.map(s => s.id), [submissions]);

  // Memoize the onAllCompleted callback to prevent infinite re-renders
  const handleAllCompleted = useCallback(() => {
    // Refresh data when all completed based on source type
    if (itemSourceType) {
      dispatch(fetchUnifiedItemSubmissionsThunk({
        itemId: assessmentId,
        sourceType: itemSourceType
      }));
      dispatch(fetchUnifiedItemStatsThunk({
        itemId: assessmentId,
        sourceType: itemSourceType
      }));
    } else {
      // Fallback to manual assessment APIs
      dispatch(fetchAssessmentSubmissionsThunk({ assessmentId }));
      dispatch(fetchAssessmentStatsThunk(assessmentId));
    }
  }, [itemSourceType, assessmentId, dispatch]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ResultsOverview />;
      
      case 'upload':
        return (
          <div className={styles.uploadTab}>
            <FileUploadZone
              assessmentId={assessmentId}
              sourceType={itemSourceType || undefined}
              onUploadComplete={handleUploadComplete}
              onUploadStart={handleUploadStart}
            />
          </div>
        );
      
      case 'progress':
        return (
          <div className={styles.progressTab}>
            <GradingProgress
              submissionIds={submissionIds}
              onAllCompleted={handleAllCompleted}
              showIndividualProgress={true}
              autoRefresh={true}
            />
          </div>
        );
      
      case 'results':
        return <ResultsOverview />;
      
      case 'submissions':
        return (
          <div className={styles.submissionsTab}>
            <Card>
              <div className={styles.submissionsHeader}>
                <h4>All Submissions</h4>
                <div className={styles.submissionsStats}>
                  Total: {submissions.length} |
                  Completed: {submissions.filter(s => s.grading_result).length} |
                  Pending: {submissions.filter(s => !s.grading_result && s.status !== 'failed').length}
                </div>
              </div>
              
              <DataTable<Submission>
                columns={submissionColumns}
                data={submissions}
                loading={isLoading}
                pagination={{
                  current: submissionsPagination.current,
                  pageSize: submissionsPagination.pageSize,
                  total: submissionsPagination.total,
                  onChange: handleSubmissionsPaginationChange
                }}
              />
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isLoading && !currentAssessment) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!currentAssessment) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h3>Assessment Not Found</h3>
          <p>The assessment you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.</p>
          <Button onClick={() => router.push('/dashboard/grading')}>
            Back to Grading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb items={breadcrumbItems} />
      
      <PageHeader
        title={currentAssessment.title}
        subtitle={currentAssessment.description}
      />

      {/* Assessment Info Bar */}
      <Card className={styles.infoBar}>
        <div className={styles.infoContent}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status:</span>
            <span className={`${styles.infoValue} ${styles.status} ${styles[currentAssessment.status]}`}>
              {currentAssessment.status.charAt(0).toUpperCase() + currentAssessment.status.slice(1)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Max Score:</span>
            <span className={styles.infoValue}>{currentAssessment.max_score} points</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Submissions:</span>
            <span className={styles.infoValue}>{submissions.length}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Created:</span>
            <span className={styles.infoValue}>
              {new Date(currentAssessment.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className={styles.infoActions}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,5 17,10" />
              <line x1="12" y1="5" x2="12" y2="15" />
            </svg>
            Upload Files
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p>{error}</p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => dispatch(clearError())}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className={styles.tabIcon}>
                {tab.icon}
              </div>
              <span className={styles.tabLabel}>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={styles.tabBadge}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Student Submissions"
        size="xl"
      >
        <FileUploadZone
          assessmentId={assessmentId}
          sourceType={itemSourceType || undefined}
          onUploadComplete={handleUploadComplete}
          onUploadStart={handleUploadStart}
        />
      </Modal>
    </div>
  );
}