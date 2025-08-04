'use client';

import { useState, useMemo } from 'react';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
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
      
      <PageHeader
        title="Performance Analytics"
        subtitle="Comprehensive student performance tracking and attendance management"
      />

      {/* Enhanced Enterprise Layout */}
      <div className={styles.enterpriseContainer}>
        {/* Navigation Switcher */}
        <div className={styles.navigationPanel}>
          <div className={styles.panelHeader}>
            <h3>Analytics Modules</h3>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot}></span>
              <span>Live Data</span>
            </div>
          </div>
          
          <div className={styles.moduleSelector}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.moduleButton} ${activeTab === tab.id ? styles.activeModule : ''}`}
                onClick={() => setActiveTab(tab.id as 'grades' | 'attendance')}
              >
                <div className={styles.moduleIcon}>
                  {tab.icon}
                </div>
                <div className={styles.moduleInfo}>
                  <span className={styles.moduleLabel}>{tab.label}</span>
                  <span className={styles.moduleDescription}>
                    {tab.id === 'grades' ? 'Performance tracking' : 'Attendance monitoring'}
                  </span>
                </div>
                <div className={styles.moduleIndicator}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </button>
            ))}
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
    </div>
  );
}