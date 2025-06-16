'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/dashboard/dashboard.module.css'; // Assuming form styles are in dashboard.module.css
import AnimatedElement from '@/components/AnimatedElement';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledTextarea from '@/components/ui/LabeledTextarea/LabeledTextarea';
// import Button from '@/components/ui/Button/Button'; // If a standard button component is available

export default function ExamGeneration() {
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    examType: 'quiz',
    difficulty: 'medium',
    questionCount: '10', // Keep as string if input type="number" handles conversion, or parse explicitly
    additionalInfo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Exam generation request submitted!');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generation Hub', href: '/dashboard/generation-hub' },
    { label: 'Create Exam' },
  ];

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
    <div>
      {/* Manual Breadcrumb implementation */}
      <div className={styles.breadcrumbContainer}>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.label}>
            {item.href ? (
              <Link href={item.href} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.breadcrumbCurrent}>{item.label}</span>
            )}
            {index < breadcrumbItems.length - 1 && (
              <span className={styles.breadcrumbSeparator}>/</span>
            )}
          </React.Fragment>
        ))}
      </div>
      <PageHeader title="Create Exam" />

      <AnimatedElement animation="up" delay={0.1}>
        <div className={styles.card}> {/* Using dashboard.module.css styles.card */}
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Exam Generator</h2>
              <p className={styles.cardSubtitle}>Fill in the details to generate your exam</p>
            </div>
          </div>
          <div className={styles.cardContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <LabeledInput
                label="Subject"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Science, English"
                required
              />

              <LabeledInput
                label="Grade Level"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g., 5th Grade, High School, College"
                required
              />

              <LabeledInput
                label="Topic"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Fractions, Photosynthesis, Shakespeare"
                required
              />

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

              <div className={styles.formActions}>
                {/* Using existing button styles from dashboard.module.css */}
                <button type="submit" className={styles.submitButton}>
                  Generate Exam
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
      </AnimatedElement>
    </div>
  );
}
