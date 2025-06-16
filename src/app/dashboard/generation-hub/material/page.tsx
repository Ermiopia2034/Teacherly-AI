'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/dashboard/dashboard.module.css'; // Assuming form styles are in dashboard.module.css or will be moved
import AnimatedElement from '@/components/AnimatedElement';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledTextarea from '@/components/ui/LabeledTextarea/LabeledTextarea';
// Assuming a generic Button component exists or will be created as per guidelines
// import Button from '@/components/ui/Button/Button';

export default function MaterialGeneration() {
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    contentType: 'lesson',
    additionalInfo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Material generation request submitted!');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generation Hub', href: '/dashboard/generation-hub' },
    { label: 'Create Material' },
  ];

  const contentTypeOptions = [
    { value: 'lesson', label: 'Lesson Plan' },
    { value: 'worksheet', label: 'Worksheet' },
    { value: 'presentation', label: 'Presentation Slides' },
    { value: 'activity', label: 'Classroom Activity' },
    { value: 'homework', label: 'Homework Assignment' },
  ];

  return (
    <div>
      {/* Manual Breadcrumb implementation - same as generation-hub main page */}
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
      <PageHeader title="Create Teaching Material" />

      <AnimatedElement animation="up" delay={0.1}>
        <div className={styles.card}> {/* Using dashboard.module.css styles.card */}
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Material Generator</h2>
              <p className={styles.cardSubtitle}>Fill in the details to generate your teaching material</p> {/* Added cardSubtitle class */}
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
                label="Content Type"
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                options={contentTypeOptions}
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
                {/* Replace with standard Button component if available */}
                <button type="submit" className={styles.submitButton}>
                  Generate Material
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
                {/* Replace with standard Button component (variant='outline' or similar) if available */}
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
