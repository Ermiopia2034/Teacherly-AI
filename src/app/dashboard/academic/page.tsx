'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentAcademicYear } from '@/lib/features/academic/academicYearsSlice';
import { selectCurrentSemester } from '@/lib/features/academic/semestersSlice';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import Card from '@/components/ui/Card/Card';
import AcademicYearSelector from '@/components/features/academic/AcademicYearSelector';
import SemesterManager from '@/components/features/academic/SemesterManager';
import SectionManager from '@/components/features/academic/SectionManager';
import MarkAllocationProgress from '@/components/features/academic/MarkAllocationProgress';
import { AcademicYear } from '@/lib/api/academicYears';
import { Semester } from '@/lib/api/semesters';
import { Section } from '@/lib/api/sections';
import styles from './academic.module.css';

export default function AcademicStructurePage() {
  const currentAcademicYear = useSelector(selectCurrentAcademicYear);
  const currentSemester = useSelector(selectCurrentSemester);
  
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Academic Structure', href: '/dashboard/academic' }
  ];

  const handleAcademicYearChange = (academicYear: AcademicYear | null) => {
    setSelectedAcademicYear(academicYear);
    // Reset dependent selections when academic year changes
    setSelectedSemester(null);
    setSelectedSection(null);
  };

  const handleSemesterChange = (semester: Semester | null) => {
    setSelectedSemester(semester);
    // Reset dependent selections when semester changes
    setSelectedSection(null);
  };

  const handleSectionChange = (section: Section | null) => {
    setSelectedSection(section);
  };

  return (
    <div className={styles.pageContainer}>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Academic Structure"
        subtitle="Manage academic years, semesters, sections, and mark allocations"
      />

      <div className={styles.contentContainer}>
        {/* Academic Year Setup */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Academic Year Setup</h2>
            <p>Configure academic years and set the current active year</p>
          </div>
          <AcademicYearSelector 
            onAcademicYearChange={handleAcademicYearChange}
            className={styles.component}
          />
        </section>

        {/* Semester Management */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Semester Management</h2>
            <p>Manage semesters within the academic year</p>
          </div>
          <SemesterManager
            academicYearId={selectedAcademicYear?.id || currentAcademicYear?.id}
            onSemesterChange={handleSemesterChange}
            className={styles.component}
          />
        </section>

        {/* Mark Allocation Overview */}
        {(selectedSemester || currentSemester) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Mark Allocation Progress</h2>
              <p>Track mark allocation for the current semester</p>
            </div>
            <MarkAllocationProgress
              semesterId={selectedSemester?.id || currentSemester?.id}
              className={styles.component}
            />
          </section>
        )}

        {/* Section Management */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Section Management</h2>
            <p>Manage sections and student groups within semesters</p>
          </div>
          <SectionManager
            semesterId={selectedSemester?.id || currentSemester?.id}
            onSectionChange={handleSectionChange}
            className={styles.component}
          />
        </section>

        {/* Academic Summary */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Current Academic Context</h2>
            <p>Overview of your current academic setup</p>
          </div>
          
          <Card className={styles.summaryCard}>
            <div className={styles.summaryContent}>
              <div className={styles.summaryItem}>
                <h4>Academic Year</h4>
                <p>
                  {currentAcademicYear ? (
                    <>
                      <strong>{currentAcademicYear.name}</strong>
                      <br />
                      <span className={styles.dates}>
                        {new Date(currentAcademicYear.start_date).toLocaleDateString()} - {new Date(currentAcademicYear.end_date).toLocaleDateString()}
                      </span>
                    </>
                  ) : (
                    <span className={styles.notSet}>No academic year selected</span>
                  )}
                </p>
              </div>

              <div className={styles.summaryItem}>
                <h4>Current Semester</h4>
                <p>
                  {currentSemester ? (
                    <>
                      <strong>{currentSemester.name}</strong>
                      <br />
                      <span className={styles.dates}>
                        {new Date(currentSemester.start_date).toLocaleDateString()} - {new Date(currentSemester.end_date).toLocaleDateString()}
                      </span>
                    </>
                  ) : (
                    <span className={styles.notSet}>No semester selected</span>
                  )}
                </p>
              </div>

              <div className={styles.summaryItem}>
                <h4>Selected Section</h4>
                <p>
                  {selectedSection ? (
                    <>
                      <strong>{selectedSection.name}</strong>
                      <br />
                      <span className={styles.subject}>Subject: {selectedSection.subject}</span>
                    </>
                  ) : (
                    <span className={styles.notSet}>No section selected</span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}