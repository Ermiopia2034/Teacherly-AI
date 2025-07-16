'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchSectionsThunk,
  fetchSectionsBySemesterThunk,
  fetchSectionsBySubjectThunk,
  createSectionThunk,
  deleteSectionThunk,
  selectSections,
  selectSectionsLoading,
  selectSectionsError,
  clearError
} from '@/lib/features/academic/sectionsSlice';
import { selectCurrentSemester, selectSemesters } from '@/lib/features/academic/semestersSlice';
import { fetchEnrollmentsBySectionThunk } from '@/lib/features/academic/enrollmentsSlice';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import { Section, SectionCreatePayload } from '@/lib/api/sections';
import styles from './SectionManager.module.css';

interface SectionManagerProps {
  onSectionChange?: (section: Section | null) => void;
  showCreateForm?: boolean;
  semesterId?: number;
  subject?: string;
  className?: string;
}

export function SectionManager({ 
  onSectionChange, 
  showCreateForm = true,
  semesterId,
  subject,
  className = '' 
}: SectionManagerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const sections = useSelector(selectSections);
  const semesters = useSelector(selectSemesters);
  const currentSemester = useSelector(selectCurrentSemester);
  const isLoading = useSelector(selectSectionsLoading);
  const error = useSelector(selectSectionsError);

  const [showForm, setShowForm] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(
    semesterId || currentSemester?.id || 0
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(subject || '');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState<SectionCreatePayload>({
    name: '',
    code: '',
    subject: selectedSubject,
    grade_level: '',
    capacity: 30,
    semester_id: selectedSemesterId
  });

  // Get unique subjects from existing sections
  const availableSubjects = Array.from(new Set(sections.map(s => s.subject))).filter(Boolean);

  useEffect(() => {
    // Fetch sections when component mounts or filters change
    if (selectedSemesterId && selectedSubject) {
      dispatch(fetchSectionsBySemesterThunk(selectedSemesterId));
    } else if (selectedSemesterId) {
      dispatch(fetchSectionsBySemesterThunk(selectedSemesterId));
    } else if (selectedSubject) {
      dispatch(fetchSectionsBySubjectThunk(selectedSubject));
    } else {
      dispatch(fetchSectionsThunk({}));
    }
  }, [dispatch, selectedSemesterId, selectedSubject]);

  useEffect(() => {
    // Update selected semester when prop or current changes
    const newSemesterId = semesterId || currentSemester?.id || 0;
    if (newSemesterId !== selectedSemesterId) {
      setSelectedSemesterId(newSemesterId);
      setFormData(prev => ({ ...prev, semester_id: newSemesterId }));
    }
  }, [semesterId, currentSemester?.id, selectedSemesterId]);

  useEffect(() => {
    // Update selected subject when prop changes
    if (subject !== selectedSubject) {
      setSelectedSubject(subject || '');
      setFormData(prev => ({ ...prev, subject: subject || '' }));
    }
  }, [subject, selectedSubject]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Notify parent component when selected section changes
    if (onSectionChange) {
      onSectionChange(selectedSection);
    }
  }, [selectedSection, onSectionChange]);

  const handleSemesterFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const semesterId = Number(e.target.value);
    setSelectedSemesterId(semesterId);
    setFormData(prev => ({ ...prev, semester_id: semesterId }));
  };

  const handleSubjectFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    setFormData(prev => ({ ...prev, subject }));
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section === selectedSection ? null : section);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'semester_id' || name === 'capacity' ? Number(value) : value 
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createSectionThunk(formData)).unwrap();
      setFormData({ 
        name: '', 
        code: '',
        subject: selectedSubject, 
        grade_level: '',
        capacity: 30,
        semester_id: selectedSemesterId 
      });
      setShowForm(false);
      // Refresh the sections list
      if (selectedSemesterId && selectedSubject) {
        dispatch(fetchSectionsBySemesterThunk(selectedSemesterId));
      } else if (selectedSemesterId) {
        dispatch(fetchSectionsBySemesterThunk(selectedSemesterId));
      } else if (selectedSubject) {
        dispatch(fetchSectionsBySubjectThunk(selectedSubject));
      } else {
        dispatch(fetchSectionsThunk({}));
      }
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (window.confirm('Are you sure you want to delete this section? This will also remove all student enrollments.')) {
      try {
        await dispatch(deleteSectionThunk(sectionId)).unwrap();
        if (selectedSection?.id === sectionId) {
          setSelectedSection(null);
        }
        // Refresh the sections list
        if (selectedSemesterId && selectedSubject) {
          dispatch(fetchSectionsBySemesterThunk(selectedSemesterId));
        } else if (selectedSemesterId) {
          dispatch(fetchSectionsBySemesterThunk(selectedSemesterId));
        } else if (selectedSubject) {
          dispatch(fetchSectionsBySubjectThunk(selectedSubject));
        } else {
          dispatch(fetchSectionsThunk({}));
        }
      } catch (error) {
        console.error('Failed to delete section:', error);
      }
    }
  };

  const handleViewEnrollments = (sectionId: number) => {
    dispatch(fetchEnrollmentsBySectionThunk(sectionId));
  };

  const semesterOptions = [
    { value: '', label: 'All Semesters' },
    ...semesters.map(s => ({
      value: s.id.toString(),
      label: `${s.name}${s.academic_year ? ` (${s.academic_year.name})` : ''}`
    }))
  ];

  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...availableSubjects.map(subj => ({
      value: subj,
      label: subj
    }))
  ];

  const filteredSections = sections.filter(section => {
    if (selectedSemesterId && section.semester_id !== selectedSemesterId) return false;
    if (selectedSubject && section.subject !== selectedSubject) return false;
    return true;
  });

  if (isLoading && sections.length === 0) {
    return (
      <Card className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading sections...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3>Section Management</h3>
          <p>Manage sections, subjects, and student enrollments</p>
        </div>
        
        {showCreateForm && !showForm && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Create Section
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filters}>
          {!semesterId && (
            <LabeledSelect
              label="Filter by Semester"
              id="semester_filter"
              name="semester_filter"
              value={selectedSemesterId?.toString() || ''}
              onChange={handleSemesterFilterChange}
              options={semesterOptions}
              placeholder="All Semesters"
            />
          )}
          
          {!subject && (
            <LabeledSelect
              label="Filter by Subject"
              id="subject_filter"
              name="subject_filter"
              value={selectedSubject}
              onChange={handleSubjectFilterChange}
              options={subjectOptions}
              placeholder="All Subjects"
            />
          )}
        </div>
      </div>

      {/* Sections Grid */}
      {filteredSections.length > 0 && (
        <div className={styles.sectionsSection}>
          <div className={styles.sectionsSummary}>
            <h4>Sections ({filteredSections.length})</h4>
            {selectedSection && (
              <div className={styles.selectedInfo}>
                Selected: {selectedSection.name} ({selectedSection.code}) - {selectedSection.subject} - {selectedSection.grade_level}
              </div>
            )}
          </div>
          
          <div className={styles.sectionsGrid}>
            {filteredSections.map((section) => (
              <div 
                key={section.id} 
                className={`${styles.sectionCard} ${selectedSection?.id === section.id ? styles.selected : ''}`}
                onClick={() => handleSectionSelect(section)}
              >
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionName}>{section.name}</div>
                  <div className={styles.sectionCode}>{section.code}</div>
                </div>
                
                <div className={styles.sectionDetails}>
                  <div className={styles.sectionSubject}>{section.subject}</div>
                  <div className={styles.sectionGrade}>{section.grade_level}</div>
                </div>
                
                <div className={styles.sectionInfo}>
                  {section.semester && (
                    <div className={styles.semesterInfo}>
                      <span className={styles.infoLabel}>Semester:</span>
                      <span>{section.semester.name}</span>
                    </div>
                  )}
                  
                  <div className={styles.capacityInfo}>
                    <span className={styles.infoLabel}>Capacity:</span>
                    <span>{section.capacity}</span>
                  </div>
                  
                  {section.enrollment_count !== undefined && (
                    <div className={styles.enrollmentInfo}>
                      <span className={styles.infoLabel}>Enrolled:</span>
                      <span>{section.enrollment_count}/{section.capacity}</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.sectionActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEnrollments(section.id);
                    }}
                  >
                    View Students
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.id);
                    }}
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
          <h4>Create Section</h4>
          <form onSubmit={handleFormSubmit} className={styles.form}>
            <LabeledSelect
              label="Semester"
              id="semester_id"
              name="semester_id"
              value={formData.semester_id?.toString() || ''}
              onChange={handleFormChange}
              options={semesters.map(s => ({
                value: s.id.toString(),
                label: `${s.name}${s.academic_year ? ` (${s.academic_year.name})` : ''}`
              }))}
              placeholder="Select Semester"
              required
            />
            
            <LabeledInput
              label="Section Name"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., Section A, Morning Class"
              required
            />
            
            <LabeledInput
              label="Section Code"
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleFormChange}
              placeholder="e.g., MATH101A, SCI201B"
              required
            />
            
            <LabeledInput
              label="Subject"
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleFormChange}
              placeholder="e.g., Mathematics, Science, English"
              required
            />
            
            <LabeledInput
              label="Grade Level"
              id="grade_level"
              name="grade_level"
              type="text"
              value={formData.grade_level}
              onChange={handleFormChange}
              placeholder="e.g., Grade 10, Year 12, Level 3"
              required
            />
            
            <LabeledInput
              label="Capacity"
              id="capacity"
              name="capacity"
              type="number"
              value={formData.capacity?.toString() || ''}
              onChange={handleFormChange}
              placeholder="Maximum number of students"
              min="1"
              max="200"
              required
            />
            
            <div className={styles.formActions}>
              <Button type="submit" disabled={isLoading}>
                Create Section
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  setFormData({ 
                    name: '', 
                    code: '',
                    subject: selectedSubject, 
                    grade_level: '',
                    capacity: 30,
                    semester_id: selectedSemesterId 
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
      {!isLoading && filteredSections.length === 0 && (
        <div className={styles.emptyState}>
          <p>
            {selectedSemesterId || selectedSubject 
              ? 'No sections found matching the selected filters.' 
              : 'No sections found.'
            } Create your first section to get started.
          </p>
          {!showForm && showCreateForm && (
            <Button onClick={() => setShowForm(true)}>
              Create First Section
            </Button>
          )}
        </div>
      )}

      {/* Loading overlay for operations */}
      {isLoading && sections.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </Card>
  );
}

export default SectionManager;