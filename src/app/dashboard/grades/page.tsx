'use client';

import { useState } from 'react';
import GradeStats from '@/components/features/grades/GradeStats/GradeStats';
import GradesList from '@/components/features/grades/GradesList/GradesList';
import AttendanceStats from '@/components/features/attendance/AttendanceStats/AttendanceStats';
import AttendanceForm from '@/components/features/attendance/AttendanceForm/AttendanceForm';
import AttendanceCalendar from '@/components/features/attendance/AttendanceCalendar/AttendanceCalendar';
import AttendanceList from '@/components/features/attendance/AttendanceList/AttendanceList';
import styles from './grades.module.css';

function GradesManagement() {
  return (
    <div className={styles.section}>
      <GradeStats />
      <GradesList />
    </div>
  );
}

function AttendanceManagement() {
  return (
    <div className={styles.section}>
      <AttendanceStats />
      <AttendanceForm />
      <AttendanceCalendar />
      <AttendanceList />
    </div>
  );
}

export default function GradesPage() {
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance'>('grades');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Grades and Attendance</h1>
        <p>Manage student performance and attendance records</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'grades' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          Grades
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'attendance' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'grades' ? <GradesManagement /> : <AttendanceManagement />}
      </div>
    </div>
  );
}