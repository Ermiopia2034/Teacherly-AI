'use client';

import { useState, useMemo } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import GradeStats from '@/components/features/grades/GradeStats/GradeStats';
import GradesList from '@/components/features/grades/GradesList/GradesList';
import AttendanceStats from '@/components/features/attendance/AttendanceStats/AttendanceStats';
import AttendanceForm from '@/components/features/attendance/AttendanceForm/AttendanceForm';
import AttendanceCalendar from '@/components/features/attendance/AttendanceCalendar/AttendanceCalendar';
import AttendanceList from '@/components/features/attendance/AttendanceList/AttendanceList';
import styles from './grades.module.css';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

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

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Grades & Attendance' },
  ];

  const tabs: TabConfig[] = useMemo(() => [
    {
      id: 'grades',
      label: 'Grades',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h10" />
          <path d="M7 12h7" />
          <path d="M7 16h4" />
        </svg>
      )
    }
  ], []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'grades':
        return <GradesManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Removed PageHeader to avoid duplicate title with breadcrumbs */}

      {/* Top Tabs to match My Contents styling */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id as 'grades' | 'attendance')}
            >
              <div className={styles.tabIcon}>
                {tab.icon}
              </div>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
          <div className={styles.statusInline}>
            <span className={styles.statusDot}></span>
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.contentHeader}>
          <div className={styles.contentTitle}>
            <h2>{activeTab === 'grades' ? 'Grade Management' : 'Attendance Tracking'}</h2>
            <p className={styles.contentSubtitle}>
              {activeTab === 'grades'
                ? 'Monitor and analyze student academic performance'
                : 'Track and manage student attendance patterns'
              }
            </p>
          </div>
        </div>
        
        <div className={styles.moduleContent}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}