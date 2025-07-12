'use client';

import { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { createStudentThunk, selectStudentsCreating, selectStudentsError } from '@/lib/features/students/studentsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import Card from '@/components/ui/Card/Card';
import styles from './StudentRegistrationForm.module.css';

interface StudentRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StudentRegistrationForm({ onSuccess, onCancel }: StudentRegistrationFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isCreating = useSelector(selectStudentsCreating);
  const error = useSelector(selectStudentsError);

  const [formData, setFormData] = useState({
    full_name: '',
    grade_level: '',
    parent_email: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Student name is required';
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'Student name must be at least 2 characters long';
    }

    if (formData.parent_email && !formData.parent_email.includes('@')) {
      errors.parent_email = 'Please enter a valid email address';
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
      // Create payload, excluding empty optional fields
      const payload = {
        full_name: formData.full_name.trim(),
        ...(formData.grade_level.trim() && { grade_level: formData.grade_level.trim() }),
        ...(formData.parent_email.trim() && { parent_email: formData.parent_email.trim() })
      };

      await dispatch(createStudentThunk(payload)).unwrap();
      
      // Reset form
      setFormData({
        full_name: '',
        grade_level: '',
        parent_email: ''
      });
      setValidationErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the Redux slice
      console.error('Failed to create student:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: '',
      grade_level: '',
      parent_email: ''
    });
    setValidationErrors({});
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Register New Student</h3>
        <p>Add a new student to your class</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <LabeledInput
          label="Student Name"
          id="full_name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleInputChange}
          placeholder="Enter student's full name"
          required
        />
        {validationErrors.full_name && (
          <div className={styles.fieldError}>{validationErrors.full_name}</div>
        )}

        <LabeledInput
          label="Grade Level"
          id="grade_level"
          name="grade_level"
          type="text"
          value={formData.grade_level}
          onChange={handleInputChange}
          placeholder="e.g., Grade 10, Year 2 (optional)"
        />

        <LabeledInput
          label="Parent Email"
          id="parent_email"
          name="parent_email"
          type="email"
          value={formData.parent_email}
          onChange={handleInputChange}
          placeholder="parent@example.com (optional)"
        />
        {validationErrors.parent_email && (
          <div className={styles.fieldError}>{validationErrors.parent_email}</div>
        )}

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
            {isCreating ? 'Registering...' : 'Register Student'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default StudentRegistrationForm;