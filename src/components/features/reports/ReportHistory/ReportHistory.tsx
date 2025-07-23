'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchReportHistoryThunk,
  selectReportHistory,
  selectFetchingHistory,
  selectReportsError
} from '@/lib/features/reports/reportsSlice';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import { ReportType } from '@/lib/api/reports';
import styles from './ReportHistory.module.css';

interface ReportHistoryProps {
  onViewReport?: (reportId: string) => void;
  onEmailReport?: (reportId: string) => void;
}

export function ReportHistory({ onViewReport, onEmailReport }: ReportHistoryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const reportHistory = useSelector(selectReportHistory);
  const isLoading = useSelector(selectFetchingHistory);
  const error = useSelector(selectReportsError);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('');

  const fetchHistory = useCallback(() => {
    dispatch(fetchReportHistoryThunk({
      page: currentPage,
      page_size: pageSize
    }));
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(e.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleReportTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportTypeFilter(e.target.value);
  };

  const filteredReports = reportHistory?.reports.filter(report => {
    if (reportTypeFilter && report.report_type !== reportTypeFilter) {
      return false;
    }
    return true;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const getReportTypeLabel = (type: ReportType) => {
    switch (type) {
      case ReportType.SINGLE_STUDENT:
        return 'Single Student Report';
      case ReportType.SCHOOL_ADMINISTRATIVE:
        return 'School Administrative Report';
    }
  };

  const getReportTypeColor = (type: ReportType) => {
    switch (type) {
      case ReportType.SINGLE_STUDENT:
        return '#3b82f6';
      case ReportType.SCHOOL_ADMINISTRATIVE:
        return '#10b981';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'generating':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const reportTypeOptions = [
    { value: '', label: 'All Report Types' },
    { value: ReportType.SINGLE_STUDENT, label: 'Single Student Reports' },
    { value: ReportType.SCHOOL_ADMINISTRATIVE, label: 'Administrative Reports' }
  ];

  const pageSizeOptions = [
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' }
  ];

  if (isLoading && !reportHistory) {
    return (
      <Card className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading report history...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3>Report History</h3>
          <p>View and manage your previously generated reports</p>
        </div>
        
        <Button onClick={fetchHistory} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <LabeledSelect
            label="Filter by Type"
            id="reportTypeFilter"
            name="reportTypeFilter"
            value={reportTypeFilter}
            onChange={handleReportTypeFilterChange}
            options={reportTypeOptions}
          />
        </div>
        
        <div className={styles.pagination}>
          <LabeledSelect
            label="Show"
            id="pageSize"
            name="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            options={pageSizeOptions}
          />
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>Error loading report history: {error}</p>
          <Button variant="secondary" onClick={fetchHistory}>
            Try Again
          </Button>
        </div>
      )}

      {filteredReports.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <h4>No reports found</h4>
          <p>Generate your first report to see it here.</p>
        </div>
      ) : (
        <div className={styles.reportsList}>
          {filteredReports.map((report) => (
            <div key={report.report_id} className={styles.reportItem}>
              <div className={styles.reportInfo}>
                <div className={styles.reportHeader}>
                  <div className={styles.reportType}>
                    <span 
                      className={styles.typeIndicator}
                      style={{ backgroundColor: getReportTypeColor(report.report_type) }}
                    >
                      {getReportTypeLabel(report.report_type)}
                    </span>
                    <span 
                      className={styles.statusIndicator}
                      style={{ color: getStatusColor(report.status) }}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className={styles.reportMeta}>
                    <span className={styles.reportDate}>
                      {formatDate(report.generated_at)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.reportDetails}>
                  <div className={styles.reportStat}>
                    <span className={styles.statLabel}>Date Range:</span>
                    <span className={styles.statValue}>
                      {formatDateRange(report.date_range_start, report.date_range_end)}
                    </span>
                  </div>
                  <div className={styles.reportStat}>
                    <span className={styles.statLabel}>Students:</span>
                    <span className={styles.statValue}>{report.total_students}</span>
                  </div>
                  {report.file_path && (
                    <div className={styles.reportStat}>
                      <span className={styles.statLabel}>File:</span>
                      <span className={styles.statValue}>Excel available</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.reportActions}>
                {report.status === 'completed' && (
                  <>
                    <Button 
                      variant="secondary" 
                      onClick={() => onViewReport?.(report.report_id)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => onEmailReport?.(report.report_id)}
                    >
                      Email
                    </Button>
                    {report.file_path && (
                      <Button 
                        variant="secondary"
                        onClick={() => {
                          // In a real app, this would trigger a download
                          console.log('Download report:', report.report_id);
                        }}
                      >
                        Download
                      </Button>
                    )}
                  </>
                )}
                {report.status === 'generating' && (
                  <div className={styles.generatingStatus}>
                    <div className={styles.miniSpinner}></div>
                    <span>Generating...</span>
                  </div>
                )}
                {report.status === 'failed' && (
                  <span className={styles.failedStatus}>Generation failed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {reportHistory && reportHistory.total_count > pageSize && (
        <div className={styles.paginationControls}>
          <div className={styles.paginationInfo}>
            Showing {Math.min((currentPage - 1) * pageSize + 1, reportHistory.total_count)} - {Math.min(currentPage * pageSize, reportHistory.total_count)} of {reportHistory.total_count} reports
          </div>
          
          <div className={styles.paginationButtons}>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            
            <span className={styles.pageIndicator}>
              Page {currentPage} of {Math.ceil(reportHistory.total_count / pageSize)}
            </span>
            
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(reportHistory.total_count / pageSize) || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default ReportHistory;