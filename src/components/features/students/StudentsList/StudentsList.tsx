'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchStudentsThunk,
  fetchStudentStatsThunk,
  selectStudents,
  selectStudentStats,
  selectStudentsLoading,
  selectStudentsError,
  clearError
} from '@/lib/features/students/studentsSlice';
import StudentCard from '@/components/features/students/StudentCard';
import StudentRegistrationForm from '@/components/features/students/StudentRegistrationForm';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import styles from './StudentsList.module.css';

export function StudentsList() {
  const dispatch = useDispatch<AppDispatch>();
  const students = useSelector(selectStudents);
  const stats = useSelector(selectStudentStats);
  const isLoading = useSelector(selectStudentsLoading);
  const error = useSelector(selectStudentsError);

  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    // Fetch students and stats when component mounts
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchStudentStatsThunk());
  }, [dispatch]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleStudentRegistered = () => {
    setShowRegistrationForm(false);
    // Refresh the student list and stats
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchStudentStatsThunk());
  };

  const handleStudentUpdated = () => {
    // Refresh stats in case they changed
    dispatch(fetchStudentStatsThunk());
  };

  const handleStudentDeleted = () => {
    // Refresh the student list and stats
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchStudentStatsThunk());
  };

  if (isLoading && students.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>My Students</h1>
          <p>Manage your students and their information</p>
        </div>
        
        {!showRegistrationForm && (
          <Button onClick={() => setShowRegistrationForm(true)}>
            Add Student
          </Button>
        )}
      </div>

      {/* Stats Section */}
      {stats && (
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.total_students}</span>
              <span className={styles.statLabel}>Total Students</span>
            </div>
            {stats.teacher_name && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Teacher: {stats.teacher_name}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Registration Form */}
      {showRegistrationForm && (
        <div className={styles.formSection}>
          <StudentRegistrationForm
            onSuccess={handleStudentRegistered}
            onCancel={() => setShowRegistrationForm(false)}
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

      {/* Students Grid */}
      <div className={styles.studentsSection}>
        {students.length === 0 ? (
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>No students yet</h3>
            <p>Start building your class by registering your first student.</p>
            {!showRegistrationForm && (
              <Button onClick={() => setShowRegistrationForm(true)}>
                Register First Student
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.studentsGrid}>
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onUpdate={handleStudentUpdated}
                onDelete={handleStudentDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Loading overlay for refresh operations */}
      {isLoading && students.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
}

export default StudentsList;