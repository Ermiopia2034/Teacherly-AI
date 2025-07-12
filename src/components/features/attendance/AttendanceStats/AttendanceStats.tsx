'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  fetchAttendanceStatsThunk, 
  selectAttendanceStats, 
  selectAttendanceLoading 
} from '@/lib/features/attendance/attendanceSlice';
import Card from '@/components/ui/Card/Card';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import Button from '@/components/ui/Button/Button';
import styles from './AttendanceStats.module.css';

export function AttendanceStats() {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector(selectAttendanceStats);
  const isLoading = useSelector(selectAttendanceLoading);

  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    // Load stats for all time on initial mount
    dispatch(fetchAttendanceStatsThunk({}));
  }, [dispatch]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyDateRange = () => {
    dispatch(fetchAttendanceStatsThunk({
      start_date: dateRange.start_date || undefined,
      end_date: dateRange.end_date || undefined
    }));
  };

  const handleClearDateRange = () => {
    setDateRange({ start_date: '', end_date: '' });
    dispatch(fetchAttendanceStatsThunk({}));
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return styles.excellent;
    if (rate >= 90) return styles.good;
    if (rate >= 80) return styles.average;
    if (rate >= 70) return styles.belowAverage;
    return styles.poor;
  };

  const formatDateRange = () => {
    if (!stats?.date_range) return 'All time';
    
    const { start_date, end_date } = stats.date_range;
    if (start_date && end_date) {
      return `${new Date(start_date).toLocaleDateString()} - ${new Date(end_date).toLocaleDateString()}`;
    } else if (start_date) {
      return `From ${new Date(start_date).toLocaleDateString()}`;
    } else if (end_date) {
      return `Until ${new Date(end_date).toLocaleDateString()}`;
    }
    return 'All time';
  };

  if (isLoading && !stats) {
    return (
      <Card className={styles.statsCard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading attendance statistics...</p>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={styles.statsCard}>
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
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <h3>No attendance statistics available</h3>
          <p>Start recording attendance to see statistics.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.statsCard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3>Attendance Statistics</h3>
          <p>Overview of attendance data for {formatDateRange()}</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className={styles.dateRangeSection}>
        <h4>Filter by Date Range</h4>
        <div className={styles.dateRangeControls}>
          <LabeledInput
            label="Start Date"
            id="start_date"
            name="start_date"
            type="date"
            value={dateRange.start_date}
            onChange={handleDateRangeChange}
          />
          
          <LabeledInput
            label="End Date"
            id="end_date"
            name="end_date"
            type="date"
            value={dateRange.end_date}
            onChange={handleDateRangeChange}
          />
          
          <div className={styles.dateRangeActions}>
            <Button
              variant="secondary"
              onClick={handleClearDateRange}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              onClick={handleApplyDateRange}
              disabled={isLoading}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Main Statistics */}
      <div className={styles.mainStats}>
        <div className={styles.attendanceRateCard}>
          <div className={styles.rateHeader}>
            <h4>Overall Attendance Rate</h4>
          </div>
          <div className={`${styles.rateValue} ${getAttendanceRateColor(stats.attendance_rate)}`}>
            {stats.attendance_rate.toFixed(1)}%
          </div>
          <div className={styles.rateDescription}>
            Based on {stats.total_records} total records
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.presentIcon}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.present_count}</div>
              <div className={styles.statLabel}>Present</div>
              <div className={styles.statPercentage}>
                {stats.total_records > 0 ? ((stats.present_count / stats.total_records) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.absentIcon}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.absent_count}</div>
              <div className={styles.statLabel}>Absent</div>
              <div className={styles.statPercentage}>
                {stats.total_records > 0 ? ((stats.absent_count / stats.total_records) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.lateIcon}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.late_count}</div>
              <div className={styles.statLabel}>Late</div>
              <div className={styles.statPercentage}>
                {stats.total_records > 0 ? ((stats.late_count / stats.total_records) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.excusedIcon}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.excused_count}</div>
              <div className={styles.statLabel}>Excused</div>
              <div className={styles.statPercentage}>
                {stats.total_records > 0 ? ((stats.excused_count / stats.total_records) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Information */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Records:</span>
          <span className={styles.summaryValue}>{stats.total_records}</span>
        </div>
        
        {stats.teacher_name && (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Teacher:</span>
            <span className={styles.summaryValue}>{stats.teacher_name}</span>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Updating statistics...</p>
        </div>
      )}
    </Card>
  );
}

export default AttendanceStats;