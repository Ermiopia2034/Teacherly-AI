'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import styles from './MaterialForm.module.css';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledTextarea from '@/components/ui/LabeledTextarea/LabeledTextarea';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  generateMaterialThunk,
  selectGenerationIsLoading,
  resetGenerationState,
} from '@/lib/features/generation/generationSlice';

// Data for the curriculum
const curriculum = {
  "Biology": {
    "Grade 12": {
      "Unit 1: Micro-organisms": ["1.1 Bacteria", "1.2 The ecology and uses of bacteria", "1.3 What are viruses?"],
      "Unit 2: Ecology": ["2.1 Cycling matter through ecosystems", "2.2 Ecological succession", "2.3 Biomes", "2.4 Biodiversity", "2.5 Populations"],
      "Unit 3: Genetics": ["3.1 Genetic crosses", "3.2 Molecular genetics", "3.3 Protein synthesis", "3.4 Mutations"],
      "Unit 4: Evolution": ["4.1 The origin of life", "4.2 Theories of evolution", "4.3 The evidence for evolution", "4.4 The processes of evolution", "4.5 The evolution of humans"],
      "Unit 5: Behaviour": ["5.1 An introduction to behaviour", "5.2 Innate behaviour", "5.3 Learned behaviour", "5.4 Examples of behaviour patterns"],
    },
  },
};

export default function MaterialForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const isLoading = useSelector(selectGenerationIsLoading);
  
  // Local state for the form inputs
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    unit: '',
    topic: '',
    contentType: 'note',
    additionalInfo: '',
  });

  // Local state for handling submission error
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'subject' || name === 'grade') {
        newState.unit = '';
        newState.topic = '';
      }
      if (name === 'unit') {
        newState.topic = '';
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error on new submission
    dispatch(resetGenerationState()); // Reset redux state

    try {
      // unwrap() will return the payload on success or throw the error on failure
      await dispatch(generateMaterialThunk(formData)).unwrap();
      
      // On success, navigate to the My Contents page
      router.push('/dashboard/my-contents');

    } catch (rejectedValue) {
      // The `rejectWithValue` from the thunk will be caught here
      setError(rejectedValue as string);
    }
  };

  // Memoized options for the select dropdowns
  const subjectOptions = useMemo(() => Object.keys(curriculum).map(subject => ({ value: subject, label: subject })), []);
  const gradeOptions = [
    { value: 'Grade 9', label: 'Grade 9' },
    { value: 'Grade 10', label: 'Grade 10' },
    { value: 'Grade 11', label: 'Grade 11' },
    { value: 'Grade 12', label: 'Grade 12' },
  ];
  const unitOptions = useMemo(() => {
    if (!formData.subject || !formData.grade) return [];
    const units = curriculum[formData.subject as keyof typeof curriculum]?.[formData.grade as keyof typeof curriculum[keyof typeof curriculum]];
    return Object.keys(units || {}).map(unit => ({ value: unit, label: unit }));
  }, [formData.subject, formData.grade]);

  const topicOptions = useMemo(() => {
    if (!formData.unit) return [];
    const topics = curriculum[formData.subject as keyof typeof curriculum]?.[formData.grade as keyof typeof curriculum[keyof typeof curriculum]]?.[formData.unit as keyof typeof curriculum[keyof typeof curriculum][keyof typeof curriculum[keyof typeof curriculum]]];
    return (topics || []).map(topic => ({ value: topic, label: topic }));
  }, [formData.unit, formData.subject, formData.grade]);
  
  const contentTypeOptions = [
    { value: 'note', label: 'Teaching Note' },
    { value: 'homework', label: 'Homework Assignment' },
  ];

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
          {/* Form Inputs */}
          <LabeledSelect label="Subject" id="subject" name="subject" value={formData.subject} onChange={handleChange} options={subjectOptions} placeholder="Select a subject" required />
          <LabeledSelect label="Grade Level" id="grade" name="grade" value={formData.grade} onChange={handleChange} options={gradeOptions} placeholder="Select a grade level" required disabled={!formData.subject} />
          <LabeledSelect label="Unit" id="unit" name="unit" value={formData.unit} onChange={handleChange} options={unitOptions} placeholder="Select a unit" required disabled={!formData.grade} />
          <LabeledSelect label="Topic" id="topic" name="topic" value={formData.topic} onChange={handleChange} options={topicOptions} placeholder="Select a topic" required disabled={!formData.unit} />
          <LabeledSelect label="Content Type" id="contentType" name="contentType" value={formData.contentType} onChange={handleChange} options={contentTypeOptions} required />
          <LabeledTextarea label="Additional Information" id="additionalInfo" name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} placeholder="Any specific requirements..." rows={4} />
          
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