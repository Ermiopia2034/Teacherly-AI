'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchGradingItemsThunk,
  selectGradingItems,
  selectGradingItemsStats,
  selectGradingLoading,
  selectGradingError,
  clearError
} from '@/lib/features/grading/gradingSlice';
import { fetchStudentsThunk } from '@/lib/features/students/studentsSlice';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import DataTable, { Column } from '@/components/ui/DataTable/DataTable';
import Modal from '@/components/ui/Modal/Modal';
import AssessmentCreationForm from '@/components/features/grading/AssessmentCreationForm';
import { UnifiedGradingItem } from '@/lib/api/grading';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const breadcrumbItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'OCR Grading', href: '/dashboard/grading' }
];

export default function GradingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const gradingItems = useSelector(selectGradingItems);
  const gradingItemsStats = useSelector(selectGradingItemsStats);
  const isLoading = useSelector(selectGradingLoading);
  const error = useSelector(selectGradingError);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    // Fetch grading items and students on component mount
    dispatch(fetchGradingItemsThunk({}));
    dispatch(fetchStudentsThunk({}));
  }, [dispatch]);

  useEffect(() => {
    // Update pagination total when grading items change
    setPagination(prev => ({
      ...prev,
      total: gradingItems.length
    }));
  }, [gradingItems]);

  const handleCreateAssessment = () => {
    setShowCreateModal(true);
  };

  const handleAssessmentCreated = () => {
    setShowCreateModal(false);
    // Refresh grading items list
    dispatch(fetchGradingItemsThunk({}));
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    const params = status ? { item_type: status as 'manual_assessment' | 'ai_exam' } : {};
    dispatch(fetchGradingItemsThunk(params));
  };

  const handleRowClick = (item: UnifiedGradingItem) => {
    // Both manual assessments and AI exams use the same route structure
    router.push(`/dashboard/grading/${item.id}`);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
  };

  const getStatusBadge = (status: string, sourceType: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: styles.statusDraft },
      active: { label: 'Active', className: styles.statusActive },
      completed: { label: 'Completed', className: styles.statusCompleted },
      archived: { label: 'Archived', className: styles.statusArchived }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <div className={styles.statusContainer}>
        <span className={`${styles.statusBadge} ${config.className}`}>
          {config.label}
        </span>
        <span className={`${styles.sourceBadge} ${sourceType === 'ai_exam' ? styles.sourceAI : styles.sourceManual}`}>
          {sourceType === 'ai_exam' ? 'AI Exam' : 'Manual'}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns: Column<UnifiedGradingItem>[] = [
    {
      key: 'title',
      title: 'Item Title',
      dataIndex: 'title',
      sortable: true,
      render: (value, record) => (
        <div className={styles.titleCell}>
          <div className={styles.assessmentTitle}>{String(value)}</div>
          {record.description && (
            <div className={styles.assessmentDescription}>{record.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      render: (value, record) => getStatusBadge(String(value), record.source_type),
      width: 160
    },
    {
      key: 'max_score',
      title: 'Max Score',
      dataIndex: 'max_score',
      sortable: true,
      align: 'center',
      width: 100,
      render: (value) => `${value} pts`
    },
    {
      key: 'total_submissions',
      title: 'Submissions',
      dataIndex: 'total_submissions',
      sortable: true,
      align: 'center',
      width: 120,
      render: (value) => String(value || 0)
    },
    {
      key: 'created_at',
      title: 'Created',
      dataIndex: 'created_at',
      sortable: true,
      width: 120,
      render: (value) => formatDate(String(value))
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <div className={styles.actionsCell}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/grading/${record.id}`);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>
        </div>
      )
    }
  ];

  const filteredGradingItems = selectedStatus
    ? gradingItems.filter(item => item.status === selectedStatus)
    : gradingItems;

  if (isLoading && gradingItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb items={breadcrumbItems} />
      
      <PageHeader
        title="OCR Grading"
        subtitle="Create and manage assessments with OCR-based grading."
      />

      {/* Stats Overview */}
      <div className={styles.statsOverview}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{gradingItemsStats?.total || 0}</div>
            <div className={styles.statLabel}>Total Items</div>
          </div>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {gradingItemsStats?.manual_assessments_count || 0}
            </div>
            <div className={styles.statLabel}>Manual Assessments</div>
          </div>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {gradingItemsStats?.ai_exams_count || 0}
            </div>
            <div className={styles.statLabel}>AI Exams</div>
          </div>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {gradingItems.reduce((sum, item) => sum + (item.total_submissions || 0), 0)}
            </div>
            <div className={styles.statLabel}>Total Submissions</div>
          </div>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className={styles.mainCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerActions}>
            {/* Type Filter */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Filter by Type:</label>
              <select
                className={styles.filterSelect}
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="manual_assessment">Manual Assessments</option>
                <option value="ai_exam">AI Exams</option>
              </select>
            </div>

            <Button onClick={handleCreateAssessment}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Assessment
            </Button>
          </div>
        </div>

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

        {gradingItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
            </div>
            <h3>No Grading Items Available</h3>
            <p>Create assessments or AI exams to start using OCR-based automated grading.</p>
            <Button onClick={handleCreateAssessment}>
              Create Your First Assessment
            </Button>
          </div>
        ) : (
          <DataTable<UnifiedGradingItem>
            columns={columns}
            data={filteredGradingItems}
            loading={isLoading}
            onRowClick={(record) => handleRowClick(record as UnifiedGradingItem)}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredGradingItems.length,
              onChange: handlePaginationChange
            }}
          />
        )}
      </Card>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title=""
        size="lg"
        showCloseButton={false}
      >
        <AssessmentCreationForm
          onSuccess={handleAssessmentCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}