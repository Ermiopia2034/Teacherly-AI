'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ExamForm.module.css';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledTextarea from '@/components/ui/LabeledTextarea/LabeledTextarea';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  generateExamThunk,
  selectGenerationIsLoading,
  resetGenerationState,
} from '@/lib/features/generation/generationSlice';
import {
  fetchCurrentSemesterThunk,
  selectCurrentSemester,
  selectSemestersLoading
} from '@/lib/features/academic/semestersSlice';
import {
  fetchSubjects,
  fetchGrades,
  fetchChapters,
  fetchTopics,
} from '@/lib/api/curriculum';
import MarkAllocationProgress from '@/components/features/academic/MarkAllocationProgress/MarkAllocationProgress';

export default function ExamForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const isLoading = useSelector(selectGenerationIsLoading);
  const currentSemester = useSelector(selectCurrentSemester);
  const semestersLoading = useSelector(selectSemestersLoading);
  
  const [formData, setFormData] = useState({
  subject: '',
  grade: '',
  unit: '',
  topics: [] as string[],
  examType: 'quiz',
  difficulty: 'medium',
  questionCount: '',
  marks: '',
  additionalInfo: '',
  });
  
  const [markValidation, setMarkValidation] = useState({
    isValid: true,
    remainingMarks: 0
  });
  
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch current semester when component mounts
    dispatch(fetchCurrentSemesterThunk());
  }, [dispatch]);
  
  useEffect(() => {
  const loadSubjects = async () => {
  try {
  const subjectData = await fetchSubjects();
  setSubjects(subjectData);
  } catch {
  setError('Failed to load subjects.');
  }
  };
  loadSubjects();
  }, []);
  
  useEffect(() => {
  if (formData.subject) {
  const loadGrades = async () => {
  try {
  const gradeData = await fetchGrades(formData.subject);
  setGrades(gradeData);
  } catch {
  setError('Failed to load grades.');
  }
  };
  loadGrades();
  }
  }, [formData.subject]);
  
  useEffect(() => {
  if (formData.subject && formData.grade) {
  const loadChapters = async () => {
  try {
  const chapterData = await fetchChapters(formData.subject, formData.grade);
  setChapters(chapterData);
  } catch {
  setError('Failed to load chapters.');
  }
  };
  loadChapters();
  }
  }, [formData.subject, formData.grade]);
  
  useEffect(() => {
  if (formData.subject && formData.grade && formData.unit) {
  const loadTopics = async () => {
  try {
  const topicData = await fetchTopics(formData.subject, formData.grade, formData.unit);
  setTopics(topicData);
  } catch {
  setError('Failed to load topics.');
  }
  };
  loadTopics();
  }
  }, [formData.subject, formData.grade, formData.unit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => {
  const newState = { ...prev, [name]: value };
  if (name === 'subject') {
  newState.grade = '';
  newState.unit = '';
  newState.topics = [];
  setGrades([]);
  setChapters([]);
  setTopics([]);
  }
  if (name === 'grade') {
  newState.unit = '';
  newState.topics = [];
  setChapters([]);
  setTopics([]);
  }
  if (name === 'unit') {
  newState.topics = [];
  setTopics([]);
  }
  return newState;
  });
  };
  
  const handleTopicChange = (topicValue: string, isChecked: boolean) => {
    setFormData(prev => {
      const newTopics = isChecked
        ? [...prev.topics, topicValue]
        : prev.topics.filter(topic => topic !== topicValue);
      return { ...prev, topics: newTopics };
    });
  };
  
  const handleMarkValidationChange = (isValid: boolean, remainingMarks: number) => {
    setMarkValidation({ isValid, remainingMarks });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  
  // Check if all basic fields are filled
  if (!areBasicFieldsFilled) {
    setError('Please fill in all required fields (subject, grade, unit, topics, exam type, and difficulty).');
    return;
  }
  
  // Check if marks and question count are filled
  if (!formData.questionCount || !formData.marks) {
    setError('Please enter the number of questions and total marks.');
    return;
  }
  
  // Check mark validation before submitting
  if (!markValidation.isValid) {
    setError('The allocated marks exceed the semester limit. Please adjust the marks.');
    return;
  }
  
  // Check if semester is available
  if (!currentSemester) {
    setError('No current semester found. Please set up a semester first.');
    return;
  }
  
  dispatch(resetGenerationState());
  
  try {
    // Include semester context and marks in the form data
    const examPayload = {
      ...formData,
      semester_id: currentSemester.id,
      marks: Number(formData.marks)
    };
    
    await dispatch(generateExamThunk(examPayload)).unwrap();
    router.push('/dashboard/my-contents');
  } catch (rejectedValue) {
    setError(rejectedValue as string);
  }
  };
  
  // Check if all required fields (except marks/questions) are filled
  const areBasicFieldsFilled = formData.subject &&
                               formData.grade &&
                               formData.unit &&
                               formData.topics.length > 0 &&
                               formData.examType &&
                               formData.difficulty;

  const toOptions = (items: string[]) => items.map(item => ({ value: item, label: item }));
  
  const examTypeOptions = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'midterm', label: 'Mid Exam' },
    { value: 'final', label: 'Final Exam' },
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Exam Generator</h2>
          <p className={styles.cardSubtitle}>Fill in the details to generate your exam</p>
        </div>
      </div>
      <div className={styles.cardContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
                    <LabeledSelect label="Subject" id="subject" name="subject" value={formData.subject} onChange={handleChange} options={toOptions(subjects)} placeholder="Select a subject" required />
                    <LabeledSelect label="Grade Level" id="grade" name="grade" value={formData.grade} onChange={handleChange} options={toOptions(grades)} placeholder="Select a grade level" required disabled={!formData.subject} />
                    <LabeledSelect label="Unit" id="unit" name="unit" value={formData.unit} onChange={handleChange} options={toOptions(chapters)} placeholder="Select a unit" required disabled={!formData.grade} />
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Topics *</label>
                      <div className={styles.checkboxGroup}>
                        {topics.length > 0 ? (
                          topics.map(topic => (
                            <label key={topic} className={styles.checkboxItem}>
                              <input
                                type="checkbox"
                                value={topic}
                                checked={formData.topics.includes(topic)}
                                onChange={(e) => handleTopicChange(topic, e.target.checked)}
                                disabled={!formData.unit}
                                className={styles.checkbox}
                              />
                              <span className={styles.checkboxLabel}>{topic}</span>
                            </label>
                          ))
                        ) : (
                          <p className={styles.placeholderText}>
                            {!formData.unit ? 'Select a unit first' : 'No topics available'}
                          </p>
                        )}
                      </div>
                    </div>
        <LabeledSelect
        label="Exam Type"
            id="examType"
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            options={examTypeOptions}
            required
          />

          <LabeledSelect
            label="Difficulty Level"
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            options={difficultyOptions}
            required
          />

          <LabeledInput
            label="Number of Questions"
            id="questionCount"
            name="questionCount"
            type="number"
            value={formData.questionCount}
            onChange={handleChange}
            min="1"
            max="50"
            required
            disabled={!areBasicFieldsFilled}
            placeholder={areBasicFieldsFilled ? "Enter number of questions" : "Fill required fields first"}
          />

          <LabeledInput
            label="Total Marks"
            id="marks"
            name="marks"
            type="number"
            value={formData.marks}
            onChange={handleChange}
            min="1"
            max="100"
            required
            disabled={!areBasicFieldsFilled}
            placeholder={areBasicFieldsFilled ? "Enter total marks" : "Fill required fields first"}
          />

          {/* Mark Allocation Progress */}
          {currentSemester && areBasicFieldsFilled && formData.marks && (
            <div className={styles.markAllocationSection}>
              <MarkAllocationProgress
                showValidation={true}
                validationMarks={Number(formData.marks)}
                contentType={formData.examType}
                onValidationChange={handleMarkValidationChange}
                className={styles.markAllocationProgress}
              />
            </div>
          )}

          {!currentSemester && !semestersLoading && (
            <div className={styles.warningMessage}>
              <p>⚠️ No current semester found. Marks allocation tracking is disabled. Please set up a semester in the academic management section.</p>
            </div>
          )}

          <LabeledTextarea
            label="Additional Information"
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            placeholder="Any specific requirements or details you want to include..."
            rows={4}
          />

          {error && <div className={styles.errorText}>Error: {error}</div>}
          
          <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !areBasicFieldsFilled || !formData.questionCount || !formData.marks}
          >
          {isLoading ? 'Generating...' : 'Generate and Save'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
          </button>
          <Link href="/dashboard/generation-hub" className={styles.cancelButton}>
          Cancel
          </Link>
          </div>
        </form>
      </div>
    </div>
  );
}