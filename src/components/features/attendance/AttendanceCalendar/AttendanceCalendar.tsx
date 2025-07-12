'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchAttendanceByDateThunk,
  selectAttendanceLoading
} from '@/lib/features/attendance/attendanceSlice';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import { Attendance } from '@/lib/api/attendance';
import styles from './AttendanceCalendar.module.css';

interface AttendanceCalendarProps {
  onDateSelect?: (date: string, attendance: Attendance[]) => void;
}

export function AttendanceCalendar({ onDateSelect }: AttendanceCalendarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectAttendanceLoading);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthAttendance, setMonthAttendance] = useState<Record<string, Attendance[]>>({});

  const fetchMonthAttendance = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get all dates in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const attendanceByDate: Record<string, Attendance[]> = {};

    // Fetch attendance for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      try {
        const dailyAttendance = await dispatch(fetchAttendanceByDateThunk(dateString)).unwrap();
        if (dailyAttendance.length > 0) {
          attendanceByDate[dateString] = dailyAttendance;
        }
      } catch {
        // Silent fail for dates with no attendance
        console.warn(`No attendance data for ${dateString}`);
      }
    }

    setMonthAttendance(attendanceByDate);
  }, [currentDate, dispatch]);

  useEffect(() => {
    // Fetch attendance data for the current month when component mounts or month changes
    fetchMonthAttendance();
  }, [fetchMonthAttendance]);

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
    const dateAttendance = monthAttendance[dateString] || [];
    if (onDateSelect) {
      onDateSelect(dateString, dateAttendance);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const getAttendanceStats = (attendance: Attendance[]) => {
    if (attendance.length === 0) return null;

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: attendance.length
    };

    attendance.forEach(record => {
      stats[record.status]++;
    });

    return stats;
  };

  const getDateCellClass = (dateString: string) => {
    const baseClass = styles.dateCell;
    const attendance = monthAttendance[dateString];
    const isSelected = selectedDate === dateString;
    const isToday = dateString === new Date().toISOString().split('T')[0];

    let statusClass = '';
    if (attendance && attendance.length > 0) {
      const stats = getAttendanceStats(attendance);
      if (stats) {
        const presentRate = stats.present / stats.total;
        if (presentRate === 1) {
          statusClass = styles.allPresent;
        } else if (presentRate >= 0.8) {
          statusClass = styles.mostlyPresent;
        } else if (presentRate >= 0.5) {
          statusClass = styles.mixedAttendance;
        } else {
          statusClass = styles.poorAttendance;
        }
      }
    }

    return `${baseClass} ${statusClass} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`;
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyCell}></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const attendance = monthAttendance[dateString];
      const stats = attendance ? getAttendanceStats(attendance) : null;

      days.push(
        <div
          key={day}
          className={getDateCellClass(dateString)}
          onClick={() => handleDateClick(dateString)}
        >
          <div className={styles.dayNumber}>{day}</div>
          {stats && (
            <div className={styles.attendanceIndicator}>
              <div className={styles.attendanceStats}>
                <span className={styles.presentCount}>{stats.present}</span>
                <span className={styles.totalCount}>/{stats.total}</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className={styles.calendarCard}>
      <div className={styles.calendarHeader}>
        <div className={styles.headerContent}>
          <h3>Attendance Calendar</h3>
          <p>Click on any date to view attendance details</p>
        </div>
        
        <div className={styles.navigationControls}>
          <Button
            variant="secondary"
            onClick={() => navigateMonth('prev')}
            disabled={isLoading}
          >
            ←
          </Button>
          
          <div className={styles.monthYear}>
            <span className={styles.monthName}>{monthNames[currentDate.getMonth()]}</span>
            <span className={styles.year}>{currentDate.getFullYear()}</span>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => navigateMonth('next')}
            disabled={isLoading}
          >
            →
          </Button>
          
          <Button
            variant="outline"
            onClick={goToToday}
            disabled={isLoading}
          >
            Today
          </Button>
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.allPresent}`}></div>
          <span>All Present</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.mostlyPresent}`}></div>
          <span>Mostly Present (80%+)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.mixedAttendance}`}></div>
          <span>Mixed (50-79%)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.poorAttendance}`}></div>
          <span>Poor (under 50%)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.noData}`}></div>
          <span>No Data</span>
        </div>
      </div>

      <div className={styles.calendar}>
        <div className={styles.daysHeader}>
          {dayNames.map(day => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
        </div>
        
        <div className={styles.daysGrid}>
          {renderCalendarDays()}
        </div>
      </div>

      {selectedDate && monthAttendance[selectedDate] && (
        <div className={styles.selectedDateInfo}>
          <h4>Attendance for {new Date(selectedDate).toLocaleDateString()}</h4>
          <div className={styles.attendanceDetails}>
            {(() => {
              const stats = getAttendanceStats(monthAttendance[selectedDate]);
              return stats ? (
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.present}</span>
                    <span className={styles.statLabel}>Present</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.absent}</span>
                    <span className={styles.statLabel}>Absent</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.late}</span>
                    <span className={styles.statLabel}>Late</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{stats.excused}</span>
                    <span className={styles.statLabel}>Excused</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {Math.round((stats.present / stats.total) * 100)}%
                    </span>
                    <span className={styles.statLabel}>Attendance Rate</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Loading calendar data...</p>
        </div>
      )}
    </Card>
  );
}

export default AttendanceCalendar;