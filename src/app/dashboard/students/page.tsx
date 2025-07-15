'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentSemester } from '@/lib/features/academic/semestersSlice';
import { selectCurrentAcademicYear } from '@/lib/features/academic/academicYearsSlice';
import StudentsList from '@/components/features/students/StudentsList';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import { Section } from '@/lib/api/sections';
import SectionManager from '@/components/features/academic/SectionManager';
import styles from './students.module.css';

export default function StudentsPage() {
  const currentSemester = useSelector(selectCurrentSemester);
  const currentAcademicYear = useSelector(selectCurrentAcademicYear);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showSectionManager, setShowSectionManager] = useState(false);

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
      <PageHeader
        title="Students Management"
        subtitle="Manage student enrollment, sections, and academic records"
      />

      <div className={styles.contentContainer}>
        {/* Academic Context */}
        <Card className={styles.contextCard}>
          <div className={styles.contextHeader}>
            <h3>Current Academic Context</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSectionManager(!showSectionManager)}
            >
              {showSectionManager ? 'Hide' : 'Manage'} Sections
            </Button>
          </div>

          <div className={styles.contextInfo}>
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Academic Year:</span>
              <span className={styles.contextValue}>
                {currentAcademicYear?.name || 'Not selected'}
              </span>
            </div>
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Current Semester:</span>
              <span className={styles.contextValue}>
                {currentSemester?.name || 'Not selected'}
              </span>
            </div>
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Selected Section:</span>
              <span className={styles.contextValue}>
                {selectedSection ? `${selectedSection.name} - ${selectedSection.subject}` : 'All sections'}
              </span>
            </div>
          </div>

          {!currentAcademicYear || !currentSemester && (
            <div className={styles.warningMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>
                Please set up your academic structure in the{' '}
                <a href="/dashboard/academic" className={styles.warningLink}>
                  Academic Structure
                </a>{' '}
                page to enable full functionality.
              </span>
            </div>
          )}
        </Card>

        {/* Section Manager */}
        {showSectionManager && (
          <Card className={styles.sectionManagerCard}>
            <SectionManager
              semesterId={currentSemester?.id}
              onSectionChange={handleSectionChange}
              showCreateForm={true}
            />
          </Card>
        )}

        {/* Students List */}
        <div className={styles.studentsSection}>
          <StudentsList />
        </div>
      </div>
    </div>
  );
}