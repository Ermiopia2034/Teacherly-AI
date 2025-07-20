'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './MaterialForm.module.css';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledTextarea from '@/components/ui/LabeledTextarea/LabeledTextarea';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  submitMaterialGenerationThunk,
  selectGenerationIsSubmitting,
  selectGenerationSubmitError,
  selectShowSuccessMessage,
  selectLastSubmissionResponse,
  resetGenerationState,
  clearSuccessMessage,
} from '@/lib/features/generation/generationSlice';
import {
  fetchSubjects,
  fetchGrades,
  fetchChapters,
  fetchTopics,
} from '@/lib/api/curriculum';

export default function MaterialForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const isSubmitting = useSelector(selectGenerationIsSubmitting);
  const submitError = useSelector(selectGenerationSubmitError);
  const showSuccessMessage = useSelector(selectShowSuccessMessage);
  const submissionResponse = useSelector(selectLastSubmissionResponse);

  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    unit: '',
    topics: [] as string[],
    contentType: 'note',
    additionalInfo: '',
  });

  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRedirectRef = useRef(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectData = await fetchSubjects();
        setSubjects(subjectData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
        setError('Failed to load topics.');
        }
      };
      loadTopics();
    }
  }, [formData.subject, formData.grade, formData.unit]);

  // Handle success message and delayed redirect
  useEffect(() => {
    if (showSuccessMessage && submissionResponse && !hasStartedRedirectRef.current) {
      hasStartedRedirectRef.current = true;
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        router.push('/dashboard/my-contents');
      }, 3000); // Show success message for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage, submissionResponse, dispatch, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    dispatch(resetGenerationState());
    hasStartedRedirectRef.current = false;

    try {
      await dispatch(submitMaterialGenerationThunk(formData)).unwrap();
      // Success message and redirect will be handled by useEffect
    } catch (rejectedValue) {
      setError(rejectedValue as string);
    }
  };

  const toOptions = (items: string[]) => items.map(item => ({ value: item, label: item }));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Material Generator</h2>
          <p className={styles.cardSubtitle}>Fill in the details to generate your teaching material</p>
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
          <LabeledSelect label="Content Type" id="contentType" name="contentType" value={formData.contentType} onChange={handleChange} options={[{ value: 'note', label: 'Teaching Note' }, { value: 'homework', label: 'Homework Assignment' }]} required />
          <LabeledTextarea label="Additional Information" id="additionalInfo" name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} placeholder="Any specific requirements..." rows={4} />
          
          {showSuccessMessage && submissionResponse && (
            <div className={styles.successText}>
              ✅ {submissionResponse.message}
              <br />
              <small>Redirecting to My Contents in 3 seconds...</small>
            </div>
          )}
          
          {(error || submitError) && <div className={styles.errorText}>Error: {error || submitError}</div>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Generate and Save'}
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