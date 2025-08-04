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
import {
  fetchSectionsThunk,
  selectSections
} from '@/lib/features/academic/sectionsSlice';
import {
  fetchEnrollmentsThunk,
  selectEnrollments
} from '@/lib/features/academic/enrollmentsSlice';
import { Student } from '@/lib/api/students';
import StudentCard from '@/components/features/students/StudentCard';
import StudentRegistrationForm from '@/components/features/students/StudentRegistrationForm';
import Button from '@/components/ui/Button/Button';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import DataTable, { Column } from '@/components/ui/DataTable/DataTable';
import styles from './StudentsList.module.css';

interface StudentsListProps {
  initialSectionId?: number;
}

export function StudentsList({ initialSectionId }: StudentsListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const students = useSelector(selectStudents);
  const stats = useSelector(selectStudentStats);
  const sections = useSelector(selectSections);
  const enrollments = useSelector(selectEnrollments);
  const isLoading = useSelector(selectStudentsLoading);
  const error = useSelector(selectStudentsError);

  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filters, setFilters] = useState({
    section_id: initialSectionId || 0,
    enrollment_status: 'all'
  });

  useEffect(() => {
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchStudentStatsThunk());
    dispatch(fetchSectionsThunk({}));
    dispatch(fetchEnrollmentsThunk({}));
  }, [dispatch]);

  useEffect(() => {
    if (initialSectionId && initialSectionId !== filters.section_id) {
      setFilters(prev => ({
        ...prev,
        section_id: initialSectionId,
        enrollment_status: 'enrolled'
      }));
    }
  }, [initialSectionId, filters.section_id]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleStudentRegistered = () => {
    setShowRegistrationForm(false);
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchStudentStatsThunk());
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'section_id' ? Number(value) : value
    }));
  };

  const getStudentEnrollments = (studentId: number) => {
    return enrollments.filter(enrollment => enrollment.student_id === studentId);
  };

  const filteredStudents = students.filter(student => {
    const studentEnrollments = getStudentEnrollments(student.id);
    if (filters.section_id !== 0) {
      const isEnrolledInSection = studentEnrollments.some(
        enrollment => enrollment.section_id === filters.section_id
      );
      if (!isEnrolledInSection) return false;
    }
    if (filters.enrollment_status === 'enrolled') {
      if (studentEnrollments.length === 0) return false;
    } else if (filters.enrollment_status === 'not_enrolled') {
      if (studentEnrollments.length > 0) return false;
    }
    return true;
  });

  const sectionOptions = [
    { value: 0, label: 'All Sections' },
    ...sections.map(section => ({
      value: section.id,
      label: `${section.name} - ${section.subject}${section.semester ? ` (${section.semester.name})` : ''}`
    }))
  ];

  const enrollmentStatusOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'enrolled', label: 'Enrolled in Sections' },
    { value: 'not_enrolled', label: 'Not Enrolled' }
  ];

  const columns: Column<Student>[] = [
    {
      key: 'avatar',
      title: '',
      width: 60,
      align: 'center',
      render: (_, student: Student) => (
        <div className={styles.avatarCell}>
          <div className={styles.avatar}>
            {student.full_name.charAt(0).toUpperCase()}
          </div>
        </div>
      )
    },
    {
      key: 'name',
      title: 'Student Name',
      dataIndex: 'full_name',
      sortable: true,
      render: (value: unknown, student: Student) => (
        <div className={styles.nameCell}>
          <div className={styles.studentName}>{String(value)}</div>
          {student.grade_level && (
            <div className={styles.gradeLevel}>{student.grade_level}</div>
          )}
        </div>
      )
    },
    {
      key: 'email',
      title: 'Parent Email',
      dataIndex: 'parent_email',
      render: (value: unknown) => value ? String(value) : <span className={styles.noData}>—</span>
    },
    {
      key: 'enrollments',
      title: 'Enrolled Sections',
      render: (_, student: Student) => {
        const studentEnrollments = getStudentEnrollments(student.id);
        if (studentEnrollments.length === 0) {
          return <span className={styles.noEnrollments}>No enrollments</span>;
        }
        return (
          <div className={styles.enrollmentsCell}>
            {studentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className={styles.enrollmentTag}>
                <span className={styles.sectionName}>
                  {enrollment.section_name || 'Unknown Section'}
                </span>
                <span className={styles.sectionSubject}>
                  {enrollment.section_subject || 'Unknown Subject'}
                </span>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      key: 'registered',
      title: 'Registered',
      dataIndex: 'created_at',
      sortable: true,
      render: (value: unknown) => new Date(String(value)).toLocaleDateString()
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      align: 'center',
      render: (_, student: Student) => (
        <div className={styles.actionsCell}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingStudent(student)}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  const handleStudentUpdated = () => {
    setEditingStudent(null);
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchStudentStatsThunk());
  };

  const handleEditCancel = () => {
    setEditingStudent(null);
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
      {/* Compact header with title and add button only */}
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

      {/* Registration Form */}
      {showRegistrationForm && (
        <div className={styles.formSection}>
          <StudentRegistrationForm
            onSuccess={handleStudentRegistered}
            onCancel={() => setShowRegistrationForm(false)}
          />
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Student Information</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditCancel}
              >
                ×
              </Button>
            </div>
            <StudentCard
              student={editingStudent}
              enrollments={getStudentEnrollments(editingStudent.id)}
              onUpdate={handleStudentUpdated}
              onDelete={handleStudentUpdated}
            />
          </div>
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

      {/* Students Table with integrated header toolbar */}
      <div className={styles.studentsSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.toolbarRight}>
            <LabeledSelect
              label="Section"
              id="section_filter"
              name="section_id"
              value={filters.section_id}
              onChange={handleFilterChange}
              options={sectionOptions}
            />
            <LabeledSelect
              label="Status"
              id="enrollment_filter"
              name="enrollment_status"
              value={filters.enrollment_status}
              onChange={handleFilterChange}
              options={enrollmentStatusOptions}
            />
          </div>
        </div>

        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={filteredStudents as unknown as Record<string, unknown>[]}
          loading={isLoading}
          emptyText={
            students.length === 0
              ? 'No students yet. Start by registering your first student.'
              : 'No students match the selected filters. Try adjusting your filters.'
          }
          rowKey="id"
          size="md"
        />
      </div>

      {/* Results Summary */}
      {filteredStudents.length > 0 && filteredStudents.length !== students.length && (
        <div className={styles.resultsSummary}>
          <p>Showing {filteredStudents.length} of {students.length} students</p>
        </div>
      )}

      {isLoading && students.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
}

export default StudentsList;