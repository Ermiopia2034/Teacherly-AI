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
  fetchSubjects,
  fetchGrades,
  fetchChapters,
  fetchTopics,
} from '@/lib/api/curriculum';

export default function ExamForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const isLoading = useSelector(selectGenerationIsLoading);
  
  const [formData, setFormData] = useState({
  subject: '',
  grade: '',
  unit: '',
  topics: [] as string[],
  examType: 'quiz',
  difficulty: 'medium',
  questionCount: '10',
  additionalInfo: '',
  });
  
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { options } = e.target;
  const value: string[] = [];
  for (let i = 0, l = options.length; i < l; i += 1) {
  if (options[i].selected) {
  value.push(options[i].value);
  }
  }
  setFormData(prev => ({ ...prev, topics: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  dispatch(resetGenerationState());
  
  try {
  await dispatch(generateExamThunk(formData)).unwrap();
  router.push('/dashboard/my-contents');
  } catch (rejectedValue) {
  setError(rejectedValue as string);
  }
  };
  
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
                      <label htmlFor="topics" className={styles.label}>Topics (multi-select)</label>
                      <select
                        id="topics"
                        name="topics"
                        multiple
                        value={formData.topics}
                        onChange={handleTopicChange}
                        className={styles.multiSelect}
                        required
                        disabled={!formData.unit}
                      >
                        {topics.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
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
          />

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
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
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