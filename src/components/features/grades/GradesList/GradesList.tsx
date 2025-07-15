'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchGradesThunk,
  fetchGradeStatsThunk,
  selectGrades,
  selectGradeStats,
  selectGradesLoading,
  selectGradesError,
  clearError
} from '@/lib/features/grades/gradesSlice';
import { fetchStudentsThunk, selectStudents } from '@/lib/features/students/studentsSlice';
import {
  fetchSemestersThunk,
  selectSemesters
} from '@/lib/features/academic/semestersSlice';
import {
  fetchSectionsThunk,
  selectSections
} from '@/lib/features/academic/sectionsSlice';
import { fetchMyContent } from '@/lib/api/content';
import GradeForm from '@/components/features/grades/GradeForm';
import GradeCard from '@/components/features/grades/GradeCard/GradeCard';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import { ContentRead } from '@/lib/api/content';
import { Grade } from '@/lib/api/grades';
import styles from './GradesList.module.css';

export function GradesList() {
  const dispatch = useDispatch<AppDispatch>();
  const grades = useSelector(selectGrades);
  const stats = useSelector(selectGradeStats);
  const isLoading = useSelector(selectGradesLoading);
  const error = useSelector(selectGradesError);
  const students = useSelector(selectStudents);
  const semesters = useSelector(selectSemesters);
  const sections = useSelector(selectSections);

  const [contentItems, setContentItems] = useState<ContentRead[]>([]);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [filters, setFilters] = useState({
    student_id: 0,
    content_id: 0,
    semester_id: 0,
    section_id: 0
  });

  useEffect(() => {
    // Fetch grades, stats, students, semesters, sections, and content
    dispatch(fetchGradesThunk({}));
    dispatch(fetchGradeStatsThunk());
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchSemestersThunk({}));
    dispatch(fetchSectionsThunk({}));
    fetchContentItems();
  }, [dispatch]);

  const fetchContentItems = async () => {
    try {
      const content = await fetchMyContent();
      setContentItems(content);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const handleGradeRegistered = () => {
    setShowGradeForm(false);
    setEditingGrade(null);
    // Refresh the grades list and stats
    dispatch(fetchGradesThunk({}));
    dispatch(fetchGradeStatsThunk());
  };

  const handleGradeUpdated = () => {
    setEditingGrade(null);
    // Refresh stats in case they changed
    dispatch(fetchGradeStatsThunk());
  };

  const handleGradeDeleted = () => {
    // Refresh the grades list and stats
    dispatch(fetchGradesThunk({}));
    dispatch(fetchGradeStatsThunk());
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setShowGradeForm(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: Number(value) }));
  };

  const filteredGrades = grades.filter(grade => {
    if (filters.student_id && grade.student_id !== filters.student_id) {
      return false;
    }
    if (filters.content_id && grade.content_id !== filters.content_id) {
      return false;
    }
    if (filters.semester_id && grade.semester_id !== filters.semester_id) {
      return false;
    }
    if (filters.section_id && grade.section_id !== filters.section_id) {
      return false;
    }
    return true;
  });

  const studentOptions = [
    { value: 0, label: 'All Students' },
    ...students.map(student => ({
      value: student.id,
      label: student.full_name
    }))
  ];

  const contentOptions = [
    { value: 0, label: 'All Content' },
    ...contentItems.map(content => ({
      value: content.id,
      label: `${content.title} (${content.content_type})`
    }))
  ];

  const semesterOptions = [
    { value: 0, label: 'All Semesters' },
    ...semesters.map(semester => ({
      value: semester.id,
      label: `${semester.name}${semester.academic_year ? ` (${semester.academic_year.name})` : ''}`
    }))
  ];

  const sectionOptions = [
    { value: 0, label: 'All Sections' },
    ...sections.map(section => ({
      value: section.id,
      label: `${section.name} - ${section.subject}${section.semester ? ` (${section.semester.name})` : ''}`
    }))
  ];

  if (isLoading && grades.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>My Grades</h1>
          <p>Manage student grades and performance records</p>
        </div>
        
        {!showGradeForm && (
          <Button onClick={() => setShowGradeForm(true)}>
            Record Grade
          </Button>
        )}
      </div>

      {/* Stats Section */}
      {stats && (
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.total_grades}</span>
              <span className={styles.statLabel}>Total Grades</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.average_score.toFixed(1)}%</span>
              <span className={styles.statLabel}>Average Score</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.highest_score}%</span>
              <span className={styles.statLabel}>Highest</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.lowest_score}%</span>
              <span className={styles.statLabel}>Lowest</span>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className={styles.filtersCard}>
        <div className={styles.filtersContent}>
          <h3>Filter Grades</h3>
          <div className={styles.filters}>
            <LabeledSelect
              label="Filter by Student"
              id="student_filter"
              name="student_id"
              value={filters.student_id}
              onChange={handleFilterChange}
              options={studentOptions}
            />
            <LabeledSelect
              label="Filter by Content"
              id="content_filter"
              name="content_id"
              value={filters.content_id}
              onChange={handleFilterChange}
              options={contentOptions}
            />
            <LabeledSelect
              label="Filter by Semester"
              id="semester_filter"
              name="semester_id"
              value={filters.semester_id}
              onChange={handleFilterChange}
              options={semesterOptions}
            />
            <LabeledSelect
              label="Filter by Section"
              id="section_filter"
              name="section_id"
              value={filters.section_id}
              onChange={handleFilterChange}
              options={sectionOptions}
            />
          </div>
        </div>
      </Card>

      {/* Grade Form */}
      {showGradeForm && (
        <div className={styles.formSection}>
          <GradeForm
            grade={editingGrade || undefined}
            onSuccess={handleGradeRegistered}
            onCancel={() => {
              setShowGradeForm(false);
              setEditingGrade(null);
            }}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <Button 
            variant="secondary" 
            onClick={() => dispatch(clearError())}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Grades Grid */}
      <div className={styles.gradesSection}>
        {filteredGrades.length === 0 ? (
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
                <path d="M9 11H1l4-4"/>
                <path d="M9 11v4c0 1.1-.9 2-2 2H1"/>
                <path d="M19 11H11l4-4"/>
                <path d="M19 11v4c0 1.1-.9 2-2 2H11"/>
              </svg>
            </div>
            <h3>No grades recorded</h3>
            <p>Start recording grades for your students.</p>
            {!showGradeForm && (
              <Button onClick={() => setShowGradeForm(true)}>
                Record First Grade
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.gradesGrid}>
            {filteredGrades.map((grade) => (
              <GradeCard
                key={grade.id}
                grade={grade}
                onUpdate={handleGradeUpdated}
                onDelete={handleGradeDeleted}
                onEdit={handleEditGrade}
              />
            ))}
          </div>
        )}
      </div>

      {/* Loading overlay for refresh operations */}
      {isLoading && grades.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
}

export default GradesList;