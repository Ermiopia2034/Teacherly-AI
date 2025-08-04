'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { selectCurrentSemester, fetchCurrentSemesterThunk } from '@/lib/features/academic/semestersSlice';
import { selectCurrentAcademicYear, fetchCurrentAcademicYearThunk } from '@/lib/features/academic/academicYearsSlice';
import { useSearchParams } from 'next/navigation';
import StudentsList from '@/components/features/students/StudentsList';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import { Section } from '@/lib/api/sections';
import SectionManager from '@/components/features/academic/SectionManager';
import { selectStudentStats } from '@/lib/features/students/studentsSlice';
import styles from './students.module.css';

function StudentsPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const currentSemester = useSelector(selectCurrentSemester);
  const currentAcademicYear = useSelector(selectCurrentAcademicYear);
  const studentStats = useSelector(selectStudentStats);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showSectionManager, setShowSectionManager] = useState(false);

  // Get section_id from URL if present
  const urlSectionId = searchParams.get('section_id');

  // Ensure academic data is loaded
  useEffect(() => {
    if (!currentAcademicYear) {
      dispatch(fetchCurrentAcademicYearThunk());
    }
    if (!currentSemester) {
      dispatch(fetchCurrentSemesterThunk());
    }
  }, [dispatch, currentAcademicYear, currentSemester]);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Students', href: '/dashboard/students' }
  ];

  const handleSectionChange = (section: Section | null) => {
    setSelectedSection(section);
  };

  return (
    <div className={styles.pageContainer}>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.headerRow}>
        <PageHeader
          title="Student Management"
          subtitle="Comprehensive student enrollment and academic record management"
        />
        {/* Compact total badge in top-right */}
        <div className={styles.totalBadge}>
          Total Students: {studentStats?.total_students ?? 0}
        </div>
      </div>

      <div className={styles.enterpriseLayout}>
        {/* Header Control Panel */}
        <div className={styles.controlPanel}>
          <div className={styles.contextSummary}>
            <div className={styles.contextBadge}>
              <span className={styles.badgeLabel}>Academic Context</span>
              <div className={styles.contextValues}>
                <span className={styles.contextItem}>
                  {currentAcademicYear?.name || 'Setup Required'}
                </span>
                <span className={styles.contextSeparator}>•</span>
                <span className={styles.contextItem}>
                  {currentSemester?.name || 'Setup Required'}
                </span>
                {selectedSection && (
                  <>
                    <span className={styles.contextSeparator}>•</span>
                    <span className={styles.contextItem}>
                      {selectedSection.name} - {selectedSection.subject}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.actionPanel}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSectionManager(!showSectionManager)}
              className={styles.controlButton}
            >
              {showSectionManager ? 'Hide' : 'Manage'} Sections
            </Button>
          </div>
        </div>

        {/* Warning Alert - Only if needed */}
        {(!currentAcademicYear || !currentSemester) && (
          <div className={styles.alertBanner}>
            <div className={styles.alertIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className={styles.alertContent}>
              <strong>Academic Setup Required</strong>
              <span>Configure your academic structure in <a href="/dashboard/academic" className={styles.alertLink}>Academic Structure</a> to unlock full functionality.</span>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Section Manager - Collapsible Side Panel */}
          {showSectionManager && (
            <div className={styles.sidePanel}>
              <Card className={styles.sidePanelCard}>
                <div className={styles.sidePanelHeader}>
                  <h3>Section Management</h3>
                </div>
                <SectionManager
                  semesterId={currentSemester?.id}
                  onSectionChange={handleSectionChange}
                  showCreateForm={true}
                />
              </Card>
            </div>
          )}

          {/* Main Students Area */}
          <div className={`${styles.mainContent} ${showSectionManager ? styles.withSidePanel : styles.fullWidth}`}>
            <div className={styles.studentsContainer}>
              <StudentsList initialSectionId={urlSectionId ? Number(urlSectionId) : undefined} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentsPageContent />
    </Suspense>
  );
}