'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { createGradeThunk, updateGradeThunk, fetchGradesThunk, selectGradesCreating, selectGradesError } from '@/lib/features/grades/gradesSlice';
import { fetchStudentsThunk, selectStudents } from '@/lib/features/students/studentsSlice';
import {
  fetchSectionsThunk,
  selectSections
} from '@/lib/features/academic/sectionsSlice';
import { fetchMyContent } from '@/lib/api/content';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import Card from '@/components/ui/Card/Card';
import { ContentRead } from '@/lib/api/content';
import { Grade } from '@/lib/api/grades';
import styles from './GradeForm.module.css';

interface GradeFormProps {
  grade?: Grade;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GradeForm({ grade, onSuccess, onCancel }: GradeFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isCreating = useSelector(selectGradesCreating);
  const error = useSelector(selectGradesError);
  const students = useSelector(selectStudents);
  const sections = useSelector(selectSections);

  const [contentItems, setContentItems] = useState<ContentRead[]>([]);
  const [formData, setFormData] = useState({
    student_id: grade?.student_id || '',
    content_id: grade?.content_id || '',
    section_id: grade?.section_id || '',
    score: grade?.score || '',
    max_score: grade?.max_score || '',
    feedback: grade?.feedback || ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch students, sections, and content for dropdowns
    dispatch(fetchStudentsThunk({}));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' || name === 'max_score' || name === 'student_id' || name === 'content_id' || name === 'section_id'
        ? (value === '' ? '' : Number(value))
        : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.student_id || formData.student_id === '' || formData.student_id === 0) {
      errors.student_id = 'Please select a student';
    }

    if (!formData.content_id || formData.content_id === '' || formData.content_id === 0) {
      errors.content_id = 'Please select content';
    }

    if (!formData.section_id || formData.section_id === '' || formData.section_id === 0) {
      errors.section_id = 'Please select a section';
    }

    if (formData.score === '' || formData.score === null || formData.score === undefined) {
      errors.score = 'Please enter a score';
    } else if (Number(formData.score) < 0) {
      errors.score = 'Score cannot be negative';
    }

    if (formData.max_score === '' || formData.max_score === null || formData.max_score === undefined) {
      errors.max_score = 'Please enter a max score';
    } else if (Number(formData.max_score) <= 0) {
      errors.max_score = 'Max score must be greater than 0';
    }

    if (formData.score !== '' && formData.max_score !== '' && Number(formData.score) > Number(formData.max_score)) {
      errors.score = 'Score cannot exceed max score';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare payload with proper numeric values
      const payload = {
        student_id: Number(formData.student_id),
        content_id: Number(formData.content_id),
        section_id: Number(formData.section_id),
        score: Number(formData.score),
        max_score: Number(formData.max_score),
        feedback: formData.feedback
      };

      if (grade) {
        // Update existing grade
        await dispatch(updateGradeThunk({
          gradeId: grade.id,
          payload
        })).unwrap();
      } else {
        // Create new grade
        await dispatch(createGradeThunk(payload)).unwrap();
      }

      // Refresh grades list
      dispatch(fetchGradesThunk({}));
      
      // Reset form if creating new
      if (!grade) {
        setFormData({
          student_id: '',
          content_id: '',
          section_id: '',
          score: '',
          max_score: '',
          feedback: ''
        });
      }
      
      setValidationErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save grade:', error);
    }
  };

  const handleCancel = () => {
    if (grade) {
      // Reset to original values for edit mode
      setFormData({
        student_id: grade.student_id,
        content_id: grade.content_id,
        section_id: grade.section_id || '',
        score: grade.score,
        max_score: grade.max_score || '',
        feedback: grade.feedback || ''
      });
    } else {
      // Reset for create mode
      setFormData({
        student_id: '',
        content_id: '',
        section_id: '',
        score: '',
        max_score: '',
        feedback: ''
      });
    }
    setValidationErrors({});
    
    if (onCancel) {
      onCancel();
    }
  };

  const studentOptions = students.map(student => ({
    value: student.id,
    label: student.full_name
  }));

  const contentOptions = contentItems.map(content => ({
    value: content.id,
    label: `${content.title} (${content.content_type})`
  }));

  const sectionOptions = sections.map(section => ({
    value: section.id,
    label: `${section.name} - ${section.subject}${section.semester ? ` (${section.semester.name})` : ''}`
  }));

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>{grade ? 'Edit Grade' : 'Record New Grade'}</h3>
        <p>{grade ? 'Update student grade information' : 'Record a new grade for a student'}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <LabeledSelect
          label="Student"
          id="student_id"
          name="student_id"
          value={formData.student_id}
          onChange={handleInputChange}
          options={studentOptions}
          placeholder="Select a student"
          required
        />
        {validationErrors.student_id && (
          <div className={styles.fieldError}>{validationErrors.student_id}</div>
        )}

        <LabeledSelect
          label="Content/Assessment"
          id="content_id"
          name="content_id"
          value={formData.content_id}
          onChange={handleInputChange}
          options={contentOptions}
          placeholder="Select content or assessment"
          required
        />
        {validationErrors.content_id && (
          <div className={styles.fieldError}>{validationErrors.content_id}</div>
        )}

        <LabeledSelect
          label="Section"
          id="section_id"
          name="section_id"
          value={formData.section_id}
          onChange={handleInputChange}
          options={sectionOptions}
          placeholder="Select a section"
          required
        />
        {validationErrors.section_id && (
          <div className={styles.fieldError}>{validationErrors.section_id}</div>
        )}

        <div className={styles.scoreGroup}>
          <LabeledInput
            label="Score"
            id="score"
            name="score"
            type="number"
            value={formData.score}
            onChange={handleInputChange}
            min="0"
            required
          />
          
          <LabeledInput
            label="Max Score"
            id="max_score"
            name="max_score"
            type="number"
            value={formData.max_score}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        {validationErrors.score && (
          <div className={styles.fieldError}>{validationErrors.score}</div>
        )}
        {validationErrors.max_score && (
          <div className={styles.fieldError}>{validationErrors.max_score}</div>
        )}

        <LabeledInput
          label="Feedback"
          id="feedback"
          name="feedback"
          type="text"
          value={formData.feedback}
          onChange={handleInputChange}
          placeholder="Enter feedback (optional)"
        />

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? 'Saving...' : grade ? 'Update Grade' : 'Record Grade'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default GradeForm;