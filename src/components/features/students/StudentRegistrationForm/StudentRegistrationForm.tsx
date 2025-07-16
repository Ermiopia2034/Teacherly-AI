'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { createStudentThunk, selectStudentsCreating, selectStudentsError } from '@/lib/features/students/studentsSlice';
import { fetchSectionsThunk, selectSections } from '@/lib/features/academic/sectionsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
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
  const sections = useSelector(selectSections);

  const [formData, setFormData] = useState({
    full_name: '',
    parent_email: '',
    section_id: 0
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch sections when component mounts
  useEffect(() => {
    dispatch(fetchSectionsThunk({}));
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'section_id' ? Number(value) : value 
    }));
    
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

    if (formData.section_id === 0) {
      errors.section_id = 'Please select a section';
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
      // Get the selected section to extract grade_level
      const selectedSection = sections.find(section => section.id === formData.section_id);
      if (!selectedSection) {
        setValidationErrors({ section_id: 'Selected section not found' });
        return;
      }

      // Create payload with grade_level from selected section
      const payload = {
        full_name: formData.full_name.trim(),
        grade_level: selectedSection.grade_level,
        section_id: formData.section_id,
        ...(formData.parent_email.trim() && { parent_email: formData.parent_email.trim() })
      };

      await dispatch(createStudentThunk(payload)).unwrap();
      
      // Reset form
      setFormData({
        full_name: '',
        parent_email: '',
        section_id: 0
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
      parent_email: '',
      section_id: 0
    });
    setValidationErrors({});
    
    if (onCancel) {
      onCancel();
    }
  };

  // Prepare section options for dropdown
  const sectionOptions = [
    { value: 0, label: 'Select a section' },
    ...sections.map(section => ({
      value: section.id,
      label: `${section.name} (${section.subject} - ${section.grade_level})`
    }))
  ];

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Register New Student</h3>
        <p>Add a new student and assign them to a section</p>
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

        <LabeledSelect
          label="Section"
          id="section_id"
          name="section_id"
          value={formData.section_id}
          onChange={handleInputChange}
          options={sectionOptions}
          required
        />
        {validationErrors.section_id && (
          <div className={styles.fieldError}>{validationErrors.section_id}</div>
        )}

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