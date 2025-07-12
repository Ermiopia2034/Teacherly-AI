'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchReportStatsThunk,
  selectCurrentReport,
  selectReportStats,
  selectReportsError,
  clearError,
  clearCurrentReport
} from '@/lib/features/reports/reportsSlice';
import ReportConfigForm from '@/components/features/reports/ReportConfigForm';
import ReportPreview from '@/components/features/reports/ReportPreview';
import ReportHistory from '@/components/features/reports/ReportHistory';
import EmailReportModal from '@/components/features/reports/EmailReportModal';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import { ReportResponse } from '@/lib/api/reports';
import styles from './reports.module.css';

type ActiveView = 'generate' | 'preview' | 'history';

export default function ReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const currentReport = useSelector(selectCurrentReport);
  const stats = useSelector(selectReportStats);
  const error = useSelector(selectReportsError);

  const [activeView, setActiveView] = useState<ActiveView>('generate');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailReportData, setEmailReportData] = useState<ReportResponse | null>(null);

  useEffect(() => {
    // Fetch report statistics on mount
    dispatch(fetchReportStatsThunk());
  }, [dispatch]);

  useEffect(() => {
    // Switch to preview when a report is generated
    if (currentReport && activeView === 'generate') {
      setActiveView('preview');
    }
  }, [currentReport, activeView]);

  const handleReportGenerated = () => {
    // The report will be available in currentReport via Redux
    // The useEffect above will switch to preview view
    dispatch(fetchReportStatsThunk()); // Refresh stats
  };

  const handleViewReport = (reportId: string) => {
    // In a real implementation, you'd fetch the report by ID
    // For now, we'll just switch to the preview if it's the current report
    if (currentReport?.report_id === reportId) {
      setActiveView('preview');
    }
  };

  const handleEmailReport = (reportId?: string) => {
    if (reportId) {
      // If reportId is provided (from history), we'd need to fetch that report
      // For now, we'll use the current report if IDs match
      if (currentReport?.report_id === reportId) {
        setEmailReportData(currentReport);
        setShowEmailModal(true);
      }
    } else if (currentReport) {
      // Email the current report
      setEmailReportData(currentReport);
      setShowEmailModal(true);
    }
  };

  const handleDownloadReport = () => {
    if (currentReport?.file_path) {
      // In a real implementation, this would trigger a download
      console.log('Download report:', currentReport.file_path);
      // You could implement a download endpoint or open the file URL
    }
  };

  const handleNewReport = () => {
    dispatch(clearCurrentReport());
    setActiveView('generate');
  };

  const renderStatsOverview = () => {
    if (!stats) return null;

    return (
      <Card className={styles.statsCard}>
        <div className={styles.statsHeader}>
          <h3>Reports Overview</h3>
          <p>Your reporting activity summary</p>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.total_reports}</span>
            <span className={styles.statLabel}>Total Reports</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.recent_reports}</span>
            <span className={styles.statLabel}>Recent Reports</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {stats.most_common_type?.replace('_', ' ') || 'N/A'}
            </span>
            <span className={styles.statLabel}>Most Used Type</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {Object.keys(stats.report_types).length}
            </span>
            <span className={styles.statLabel}>Report Types Used</span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Reports</h1>
          <p>Generate comprehensive reports for grades, attendance, and student performance</p>
        </div>
        
        {activeView !== 'generate' && (
          <Button onClick={handleNewReport}>
            Generate New Report
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      {renderStatsOverview()}

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeView === 'generate' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('generate')}
        >
          Generate Report
        </button>
        <button
          className={`${styles.tab} ${activeView === 'preview' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('preview')}
          disabled={!currentReport}
        >
          Current Report
          {currentReport && <span className={styles.tabIndicator}>•</span>}
        </button>
        <button
          className={`${styles.tab} ${activeView === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('history')}
        >
          Report History
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <div className={styles.errorContent}>
            <p><strong>Error:</strong> {error}</p>
            <Button 
              variant="secondary" 
              onClick={() => dispatch(clearError())}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content}>
        {activeView === 'generate' && (
          <div className={styles.generateSection}>
            <ReportConfigForm
              onSuccess={handleReportGenerated}
            />
          </div>
        )}

        {activeView === 'preview' && currentReport && (
          <div className={styles.previewSection}>
            <ReportPreview
              report={currentReport}
              onEmailReport={() => handleEmailReport()}
              onDownload={handleDownloadReport}
            />
          </div>
        )}

        {activeView === 'preview' && !currentReport && (
          <div className={styles.noReportState}>
            <Card className={styles.noReportCard}>
              <div className={styles.noReportContent}>
                <div className={styles.noReportIcon}>
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
                <h3>No Report Available</h3>
                <p>Generate a report to view it here, or check your report history.</p>
                <div className={styles.noReportActions}>
                  <Button onClick={handleNewReport}>
                    Generate Report
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveView('history')}
                  >
                    View History
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeView === 'history' && (
          <div className={styles.historySection}>
            <ReportHistory
              onViewReport={handleViewReport}
              onEmailReport={handleEmailReport}
            />
          </div>
        )}
      </div>

      {/* Email Modal */}
      <EmailReportModal
        isOpen={showEmailModal}
        report={emailReportData}
        onClose={() => {
          setShowEmailModal(false);
          setEmailReportData(null);
        }}
      />
    </div>
  );
}