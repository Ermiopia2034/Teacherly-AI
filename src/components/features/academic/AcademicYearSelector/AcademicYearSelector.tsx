'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchAcademicYearsThunk,
  fetchCurrentAcademicYearThunk,
  setCurrentAcademicYearThunk,
  createAcademicYearThunk,
  selectAcademicYears,
  selectCurrentAcademicYear,
  selectAcademicYearsLoading,
  selectAcademicYearsError,
  clearError
} from '@/lib/features/academic/academicYearsSlice';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import { AcademicYear, AcademicYearCreatePayload } from '@/lib/api/academicYears';
import styles from './AcademicYearSelector.module.css';
import { useToast } from '@/providers/ToastProvider';

interface AcademicYearSelectorProps {
  onAcademicYearChange?: (academicYear: AcademicYear | null) => void;
  showCreateForm?: boolean;
  className?: string;
}

export function AcademicYearSelector({ 
  onAcademicYearChange, 
  showCreateForm = true,
  className = '' 
}: AcademicYearSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const academicYears = useSelector(selectAcademicYears);
  const currentAcademicYear = useSelector(selectCurrentAcademicYear);
  const isLoading = useSelector(selectAcademicYearsLoading);
  const error = useSelector(selectAcademicYearsError);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AcademicYearCreatePayload>({
    name: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    // Fetch academic years and current academic year when component mounts
    dispatch(fetchAcademicYearsThunk({}));
    dispatch(fetchCurrentAcademicYearThunk());
  }, [dispatch]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Notify parent component when current academic year changes
    if (onAcademicYearChange) {
      onAcademicYearChange(currentAcademicYear);
    }
  }, [currentAcademicYear, onAcademicYearChange]);

  const handleAcademicYearChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const academicYearId = Number(e.target.value);
    if (academicYearId && academicYearId !== currentAcademicYear?.id) {
      try {
        await dispatch(setCurrentAcademicYearThunk(academicYearId)).unwrap();
      } catch (error) {
        console.error('Failed to set current academic year:', error);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.start_date || !formData.end_date) {
      showToast({ variant: 'error', title: 'Missing fields', description: 'Please complete name, start date, and end date.' });
      return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      showToast({ variant: 'error', title: 'Invalid dates', description: 'End date must be after start date.' });
      return;
    }
    try {
      await dispatch(createAcademicYearThunk(formData)).unwrap();
      setFormData({ name: '', start_date: '', end_date: '' });
      setShowForm(false);
      // Refresh the academic years list
      dispatch(fetchAcademicYearsThunk({}));
      showToast({ variant: 'success', title: 'Academic year created', description: 'The academic year was created successfully.' });
    } catch (error) {
      console.error('Failed to create academic year:', error);
      showToast({ variant: 'error', title: 'Creation failed', description: String(error) });
    }
  };

  const academicYearOptions = [
    { value: '', label: 'Select Academic Year' },
    ...academicYears.map(ay => ({
      value: ay.id.toString(),
      label: `${ay.name} ${ay.is_current ? '(Current)' : ''}`
    }))
  ];

  if (isLoading && academicYears.length === 0) {
    return (
      <Card className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading academic years...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3>Academic Year</h3>
          <p>Select or create an academic year</p>
        </div>
        
        {showCreateForm && !showForm && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Create New
          </Button>
        )}
      </div>

      {/* Academic Year Selector */}
      <div className={styles.selectorSection}>
        <LabeledSelect
          label="Current Academic Year"
          id="academic_year_selector"
          name="academic_year_id"
          value={currentAcademicYear?.id?.toString() || ''}
          onChange={handleAcademicYearChange}
          options={academicYearOptions}
          placeholder="Select Academic Year"
          disabled={isLoading}
        />
        
        {currentAcademicYear && (
          <div className={styles.currentInfo}>
            <span className={styles.currentLabel}>Current:</span>
            <span className={styles.currentName}>{currentAcademicYear.name}</span>
            <span className={styles.currentDates}>
              {new Date(currentAcademicYear.start_date).toLocaleDateString()} - {new Date(currentAcademicYear.end_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className={styles.formSection}>
          <h4>Create Academic Year</h4>
          <form onSubmit={handleFormSubmit} className={styles.form}>
            <LabeledInput
              label="Academic Year Name"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., 2024-2025"
              required
            />
            
            <LabeledInput
              label="Start Date"
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleFormChange}
              required
            />
            
            <LabeledInput
              label="End Date"
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleFormChange}
              required
            />
            
            <div className={styles.formActions}>
              <Button type="submit" disabled={isLoading}>
                Create Academic Year
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', start_date: '', end_date: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => dispatch(clearError())}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && academicYears.length === 0 && (
        <div className={styles.emptyState}>
          <p>No academic years found. Create your first academic year to get started.</p>
          {!showForm && showCreateForm && (
            <Button onClick={() => setShowForm(true)}>
              Create First Academic Year
            </Button>
          )}
        </div>
      )}

      {/* Loading overlay for operations */}
      {isLoading && academicYears.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </Card>
  );
}

export default AcademicYearSelector;