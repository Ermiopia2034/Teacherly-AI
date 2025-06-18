'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/app/dashboard/dashboard.module.css';
import AnimatedElement from '@/components/common/AnimatedElement/AnimatedElement';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import ExamForm from '@/components/features/generation-hub/ExamForm/ExamForm';

export default function ExamGeneration() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generation Hub', href: '/dashboard/generation-hub' },
    { label: 'Create Exam' },
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
        <ExamForm />
      </AnimatedElement>
    </div>
  );
}
