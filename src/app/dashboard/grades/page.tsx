'use client';

import { useState } from 'react';
import styles from './grades.module.css';

// Placeholder components - these would be implemented similar to StudentsList
function GradesManagement() {
  return (
    <div className={styles.section}>
      <h2>Grades Management</h2>
      <p>Grade recording and management features coming soon...</p>
      <div className={styles.placeholder}>
        <div className={styles.placeholderCard}>
          <h3>Recent Grades</h3>
          <p>View and manage student grades</p>
        </div>
        <div className={styles.placeholderCard}>
          <h3>Grade Statistics</h3>
          <p>Track class performance</p>
        </div>
      </div>
    </div>
  );
}

function AttendanceManagement() {
  return (
    <div className={styles.section}>
      <h2>Attendance Management</h2>
      <p>Attendance tracking features coming soon...</p>
      <div className={styles.placeholder}>
        <div className={styles.placeholderCard}>
          <h3>Daily Attendance</h3>
          <p>Mark student attendance</p>
        </div>
        <div className={styles.placeholderCard}>
          <h3>Attendance Reports</h3>
          <p>View attendance statistics</p>
        </div>
      </div>
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