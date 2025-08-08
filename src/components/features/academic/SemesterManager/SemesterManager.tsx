'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchSemestersThunk,
  fetchCurrentSemesterThunk,
  fetchSemestersByAcademicYearThunk,
  setCurrentSemesterThunk,
  createSemesterThunk,
  deleteSemesterThunk,
  selectSemesters,
  selectCurrentSemester,
  selectSemestersLoading,
  selectSemestersError,
  clearError
} from '@/lib/features/academic/semestersSlice';
import { selectCurrentAcademicYear, selectAcademicYears } from '@/lib/features/academic/academicYearsSlice';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import { Semester, SemesterCreatePayload, SemesterType } from '@/lib/api/semesters';
import styles from './SemesterManager.module.css';
import { useToast } from '@/providers/ToastProvider';

interface SemesterManagerProps {
  onSemesterChange?: (semester: Semester | null) => void;
  showCreateForm?: boolean;
  academicYearId?: number;
  className?: string;
}

export function SemesterManager({ 
  onSemesterChange, 
  showCreateForm = true,
  academicYearId,
  className = '' 
}: SemesterManagerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const semesters = useSelector(selectSemesters);
  const currentSemester = useSelector(selectCurrentSemester);
  const academicYears = useSelector(selectAcademicYears);
  const currentAcademicYear = useSelector(selectCurrentAcademicYear);
  const isLoading = useSelector(selectSemestersLoading);
  const error = useSelector(selectSemestersError);

  const [showForm, setShowForm] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number>(
    academicYearId || currentAcademicYear?.id || 0
  );
  const [formData, setFormData] = useState<SemesterCreatePayload>({
    name: '',
    semester_type: SemesterType.FIRST,
    start_date: '',
    end_date: '',
    academic_year_id: selectedAcademicYearId
  });

  useEffect(() => {
    // Fetch current semester and initial data when component mounts
    dispatch(fetchCurrentSemesterThunk());
    
    if (selectedAcademicYearId) {
      dispatch(fetchSemestersByAcademicYearThunk(selectedAcademicYearId));
    } else {
      dispatch(fetchSemestersThunk({}));
    }
  }, [dispatch, selectedAcademicYearId]);

  useEffect(() => {
    // Update selected academic year when prop or current changes
    const newAcademicYearId = academicYearId || currentAcademicYear?.id || 0;
    if (newAcademicYearId !== selectedAcademicYearId) {
      setSelectedAcademicYearId(newAcademicYearId);
      setFormData(prev => ({ ...prev, academic_year_id: newAcademicYearId }));
    }
  }, [academicYearId, currentAcademicYear?.id, selectedAcademicYearId]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Notify parent component when current semester changes
    if (onSemesterChange) {
      onSemesterChange(currentSemester);
    }
  }, [currentSemester, onSemesterChange]);

  const handleAcademicYearFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const academicYearId = Number(e.target.value);
    setSelectedAcademicYearId(academicYearId);
    
    if (academicYearId) {
      dispatch(fetchSemestersByAcademicYearThunk(academicYearId));
    } else {
      dispatch(fetchSemestersThunk({}));
    }
  };

  const handleSemesterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const semesterId = Number(e.target.value);
    if (semesterId && semesterId !== currentSemester?.id) {
      try {
        await dispatch(setCurrentSemesterThunk(semesterId)).unwrap();
      } catch (error) {
        console.error('Failed to set current semester:', error);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'academic_year_id' ? Number(value) : value 
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.academic_year_id || !formData.name || !formData.start_date || !formData.end_date) {
      showToast({ variant: 'error', title: 'Missing fields', description: 'Please complete all required semester fields.' });
      return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      showToast({ variant: 'error', title: 'Invalid dates', description: 'End date must be after start date.' });
      return;
    }
    try {
      await dispatch(createSemesterThunk(formData)).unwrap();
      setShowForm(false);
      setFormData(prev => ({ ...prev, name: '', start_date: '', end_date: '' }));
      showToast({ variant: 'success', title: 'Semester created', description: 'The semester was created successfully.' });
      // Refresh the semesters list
      if (selectedAcademicYearId) {
        dispatch(fetchSemestersByAcademicYearThunk(selectedAcademicYearId));
      } else {
        dispatch(fetchSemestersThunk({}));
      }
    } catch (error) {
      console.error('Failed to create semester:', error);
      showToast({ variant: 'error', title: 'Creation failed', description: String(error) });
    }
  };

  const handleDeleteSemester = async (semesterId: number) => {
    if (window.confirm('Are you sure you want to delete this semester? This action cannot be undone.')) {
      try {
        await dispatch(deleteSemesterThunk(semesterId)).unwrap();
        // Refresh the semesters list
        if (selectedAcademicYearId) {
          dispatch(fetchSemestersByAcademicYearThunk(selectedAcademicYearId));
        } else {
          dispatch(fetchSemestersThunk({}));
        }
      } catch (error) {
        console.error('Failed to delete semester:', error);
      }
    }
  };

  const academicYearOptions = [
    { value: '', label: 'All Academic Years' },
    ...academicYears.map(ay => ({
      value: ay.id.toString(),
      label: ay.name
    }))
  ];

  const semesterOptions = [
    { value: '', label: 'Select Semester' },
    ...semesters.map(s => ({
      value: s.id.toString(),
      label: `${s.name} ${s.is_current ? '(Current)' : ''}`
    }))
  ];

  const filteredSemesters = semesters.filter(semester => 
    !selectedAcademicYearId || semester.academic_year_id === selectedAcademicYearId
  );

  if (isLoading && semesters.length === 0) {
    return (
      <Card className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading semesters...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3>Semester Management</h3>
          <p>Manage semesters and set the current active semester</p>
        </div>
        
        {showCreateForm && !showForm && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Create Semester
          </Button>
        )}
      </div>

      {/* Academic Year Filter */}
      {!academicYearId && (
        <div className={styles.filterSection}>
          <LabeledSelect
            label="Filter by Academic Year"
            id="academic_year_filter"
            name="academic_year_filter"
            value={selectedAcademicYearId?.toString() || ''}
            onChange={handleAcademicYearFilterChange}
            options={academicYearOptions}
            placeholder="All Academic Years"
          />
        </div>
      )}

      {/* Current Semester Selector */}
      <div className={styles.selectorSection}>
        <LabeledSelect
          label="Current Semester"
          id="semester_selector"
          name="semester_id"
          value={currentSemester?.id?.toString() || ''}
          onChange={handleSemesterChange}
          options={semesterOptions}
          placeholder="Select Current Semester"
          disabled={isLoading}
        />
        
        {currentSemester && (
          <div className={styles.currentInfo}>
            <span className={styles.currentLabel}>Current:</span>
            <span className={styles.currentName}>{currentSemester.name}</span>
            <span className={styles.currentDates}>
              {new Date(currentSemester.start_date).toLocaleDateString()} - {new Date(currentSemester.end_date).toLocaleDateString()}
            </span>
            {currentSemester.academic_year && (
              <span className={styles.academicYear}>
                ({currentSemester.academic_year.name})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Semesters List */}
      {filteredSemesters.length > 0 && (
        <div className={styles.semestersSection}>
          <h4>All Semesters</h4>
          <div className={styles.semestersList}>
            {filteredSemesters.map((semester) => (
              <div key={semester.id} className={styles.semesterCard}>
                <div className={styles.semesterInfo}>
                  <div className={styles.semesterName}>
                    {semester.name}
                    {semester.is_current && (
                      <span className={styles.currentBadge}>Current</span>
                    )}
                  </div>
                  <div className={styles.semesterDates}>
                    {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
                  </div>
                  {semester.academic_year && (
                    <div className={styles.semesterAcademicYear}>
                      Academic Year: {semester.academic_year.name}
                    </div>
                  )}
                </div>
                <div className={styles.semesterActions}>
                  {!semester.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(setCurrentSemesterThunk(semester.id))}
                    >
                      Set Current
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSemester(semester.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className={styles.formSection}>
          <h4>Create Semester</h4>
          <form onSubmit={handleFormSubmit} className={styles.form}>
            <LabeledSelect
              label="Academic Year"
              id="academic_year_id"
              name="academic_year_id"
              value={formData.academic_year_id?.toString() || ''}
              onChange={handleFormChange}
              options={academicYears.map(ay => ({
                value: ay.id.toString(),
                label: ay.name
              }))}
              placeholder="Select Academic Year"
              required
            />
            
            <LabeledSelect
              label="Semester Type"
              id="semester_type"
              name="semester_type"
              value={formData.semester_type}
              onChange={handleFormChange}
              options={[
                { value: SemesterType.FIRST, label: 'First Semester' },
                { value: SemesterType.SECOND, label: 'Second Semester' },
                { value: SemesterType.THIRD, label: 'Third Semester' },
                { value: SemesterType.FALL, label: 'Fall Semester' },
                { value: SemesterType.SPRING, label: 'Spring Semester' },
                { value: SemesterType.SUMMER, label: 'Summer Semester' }
              ]}
              placeholder="Select Semester Type"
              required
            />
            
            <LabeledInput
              label="Semester Name"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., Fall 2024, Spring 2025"
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
                Create Semester
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: '',
                    semester_type: SemesterType.FIRST,
                    start_date: '',
                    end_date: '',
                    academic_year_id: selectedAcademicYearId
                  });
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
      {!isLoading && filteredSemesters.length === 0 && (
        <div className={styles.emptyState}>
          <p>
            {selectedAcademicYearId 
              ? 'No semesters found for the selected academic year.' 
              : 'No semesters found.'
            } Create your first semester to get started.
          </p>
          {!showForm && showCreateForm && (
            <Button onClick={() => setShowForm(true)}>
              Create First Semester
            </Button>
          )}
        </div>
      )}

      {/* Loading overlay for operations */}
      {isLoading && semesters.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </Card>
  );
}

export default SemesterManager;