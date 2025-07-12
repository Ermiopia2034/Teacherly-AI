'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  updateGradeThunk, 
  deleteGradeThunk, 
  selectGradesUpdating, 
  selectGradesDeleting 
} from '@/lib/features/grades/gradesSlice';
import { Grade, GradeUpdatePayload } from '@/lib/api/grades';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import styles from './GradeCard.module.css';

interface GradeCardProps {
  grade: Grade;
  onUpdate?: (grade: Grade) => void;
  onDelete?: (gradeId: number) => void;
  onEdit?: (grade: Grade) => void;
}

export function GradeCard({ grade, onUpdate, onDelete, onEdit }: GradeCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isUpdating = useSelector(selectGradesUpdating);
  const isDeleting = useSelector(selectGradesDeleting);

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    score: grade.score,
    max_score: grade.max_score || 100,
    feedback: grade.feedback || ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ 
      ...prev, 
      [name]: name === 'score' || name === 'max_score' ? Number(value) : value 
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Only include fields that have changed
      const updatePayload: GradeUpdatePayload = {};
      
      if (editFormData.score !== grade.score) {
        updatePayload.score = editFormData.score;
      }
      if (editFormData.max_score !== (grade.max_score || 100)) {
        updatePayload.max_score = editFormData.max_score;
      }
      if (editFormData.feedback !== (grade.feedback || '')) {
        updatePayload.feedback = editFormData.feedback.trim() || undefined;
      }

      // Only submit if there are changes
      if (Object.keys(updatePayload).length > 0) {
        const updatedGrade = await dispatch(
          updateGradeThunk({ gradeId: grade.id, payload: updatePayload })
        ).unwrap();
        
        if (onUpdate) {
          onUpdate(updatedGrade);
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update grade:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteGradeThunk(grade.id)).unwrap();
      
      if (onDelete) {
        onDelete(grade.id);
      }
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete grade:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      score: grade.score,
      max_score: grade.max_score || 100,
      feedback: grade.feedback || ''
    });
    setIsEditing(false);
  };

  const calculatePercentage = () => {
    if (!grade.max_score || grade.max_score === 0) return 0;
    return Math.round((grade.score / grade.max_score) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return styles.excellent;
    if (percentage >= 80) return styles.good;
    if (percentage >= 70) return styles.average;
    if (percentage >= 60) return styles.belowAverage;
    return styles.poor;
  };

  const percentage = calculatePercentage();

  return (
    <Card className={styles.gradeCard}>
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className={styles.editForm}>
          <div className={styles.editHeader}>
            <h4>Edit Grade</h4>
          </div>
          
          <div className={styles.editFields}>
            <LabeledInput
              label="Score"
              id="edit_score"
              name="score"
              type="number"
              value={editFormData.score}
              onChange={handleInputChange}
              min="0"
              required
            />
            
            <LabeledInput
              label="Max Score"
              id="edit_max_score"
              name="max_score"
              type="number"
              value={editFormData.max_score}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>
          
          <LabeledInput
            label="Feedback"
            id="edit_feedback"
            name="feedback"
            type="text"
            value={editFormData.feedback}
            onChange={handleInputChange}
            placeholder="Enter feedback"
          />
          
          <div className={styles.editActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelEdit}
              disabled={isUpdating || isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || isDeleting}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.gradeInfo}>
          <div className={styles.gradeHeader}>
            <div className={`${styles.percentage} ${getPercentageColor(percentage)}`}>
              {percentage}%
            </div>
            <div className={styles.gradeDetails}>
              <h4 className={styles.studentName}>{grade.student_name || 'Unknown Student'}</h4>
              <p className={styles.contentTitle}>{grade.content_title || 'Unknown Content'}</p>
              <p className={styles.contentType}>{grade.content_type}</p>
            </div>
          </div>
          
          <div className={styles.gradeMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Score:</span>
              <span className={styles.metaValue}>{grade.score} / {grade.max_score}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date:</span>
              <span className={styles.metaValue}>{formatDate(grade.grading_date)}</span>
            </div>
            {grade.feedback && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Feedback:</span>
                <span className={styles.metaValue}>{grade.feedback}</span>
              </div>
            )}
          </div>
          
          <div className={styles.gradeActions}>
            <Button
              variant="secondary"
              onClick={() => onEdit ? onEdit(grade) : setIsEditing(true)}
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
            <h4>Delete Grade</h4>
            <p>Are you sure you want to delete this grade for <strong>{grade.student_name || 'this student'}</strong>? This action cannot be undone.</p>
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

export default GradeCard;