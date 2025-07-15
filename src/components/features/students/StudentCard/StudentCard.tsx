'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  updateStudentThunk, 
  deleteStudentThunk, 
  selectStudentsUpdating, 
  selectStudentsDeleting 
} from '@/lib/features/students/studentsSlice';
import { Student, StudentUpdatePayload } from '@/lib/api/students';
import { StudentEnrollment } from '@/lib/api/enrollments';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import styles from './StudentCard.module.css';

interface StudentCardProps {
  student: Student;
  enrollments?: StudentEnrollment[];
  onUpdate?: (student: Student) => void;
  onDelete?: (studentId: number) => void;
}

export function StudentCard({ student, enrollments = [], onUpdate, onDelete }: StudentCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isUpdating = useSelector(selectStudentsUpdating);
  const isDeleting = useSelector(selectStudentsDeleting);

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: student.full_name,
    grade_level: student.grade_level || '',
    parent_email: student.parent_email || ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Only include fields that have changed
      const updatePayload: StudentUpdatePayload = {};
      
      if (editFormData.full_name !== student.full_name) {
        updatePayload.full_name = editFormData.full_name.trim();
      }
      if (editFormData.grade_level !== (student.grade_level || '')) {
        updatePayload.grade_level = editFormData.grade_level.trim() || undefined;
      }
      if (editFormData.parent_email !== (student.parent_email || '')) {
        updatePayload.parent_email = editFormData.parent_email.trim() || undefined;
      }

      // Only submit if there are changes
      if (Object.keys(updatePayload).length > 0) {
        const updatedStudent = await dispatch(
          updateStudentThunk({ studentId: student.id, payload: updatePayload })
        ).unwrap();
        
        if (onUpdate) {
          onUpdate(updatedStudent);
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteStudentThunk(student.id)).unwrap();
      
      if (onDelete) {
        onDelete(student.id);
      }
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      full_name: student.full_name,
      grade_level: student.grade_level || '',
      parent_email: student.parent_email || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className={styles.studentCard}>
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className={styles.editForm}>
          <div className={styles.editHeader}>
            <h4>Edit Student Information</h4>
          </div>
          
          <LabeledInput
            label="Student Name"
            id="edit_full_name"
            name="full_name"
            type="text"
            value={editFormData.full_name}
            onChange={handleInputChange}
            required
          />
          
          <LabeledInput
            label="Grade Level"
            id="edit_grade_level"
            name="grade_level"
            type="text"
            value={editFormData.grade_level}
            onChange={handleInputChange}
            placeholder="e.g., Grade 10, Year 2"
          />
          
          <LabeledInput
            label="Parent Email"
            id="edit_parent_email"
            name="parent_email"
            type="email"
            value={editFormData.parent_email}
            onChange={handleInputChange}
            placeholder="parent@example.com"
          />
          
          <div className={styles.editActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.studentInfo}>
          <div className={styles.studentHeader}>
            <div className={styles.studentAvatar}>
              {student.full_name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.studentDetails}>
              <h3 className={styles.studentName}>{student.full_name}</h3>
              {student.grade_level && (
                <p className={styles.gradeLevel}>{student.grade_level}</p>
              )}
            </div>
          </div>
          
          <div className={styles.studentMeta}>
            {student.parent_email && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Parent Email:</span>
                <span className={styles.metaValue}>{student.parent_email}</span>
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Registered:</span>
              <span className={styles.metaValue}>{formatDate(student.created_at)}</span>
            </div>
          </div>
          
          {/* Enrollment Information */}
          {enrollments.length > 0 && (
            <div className={styles.enrollmentSection}>
              <div className={styles.enrollmentHeader}>
                <span className={styles.enrollmentLabel}>Enrolled Sections ({enrollments.length})</span>
              </div>
              <div className={styles.enrollmentList}>
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className={styles.enrollmentItem}>
                    <div className={styles.enrollmentInfo}>
                      <span className={styles.sectionName}>
                        {enrollment.section?.name || 'Unknown Section'}
                      </span>
                      <span className={styles.sectionSubject}>
                        {enrollment.section?.subject || 'Unknown Subject'}
                      </span>
                    </div>
                    {enrollment.section?.semester && (
                      <div className={styles.semesterInfo}>
                        {enrollment.section.semester.name}
                        {enrollment.section.semester.academic_year && (
                          <span className={styles.academicYear}>
                            ({enrollment.section.semester.academic_year.name})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.studentActions}>
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className={styles.deleteButton}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className={styles.deleteConfirm}>
          <div className={styles.confirmContent}>
            <h4>Delete Student</h4>
            <p>Are you sure you want to delete <strong>{student.full_name}</strong>? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className={styles.confirmDeleteButton}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default StudentCard;