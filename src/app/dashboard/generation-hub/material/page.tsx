'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/app/dashboard/dashboard.module.css';
import AnimatedElement from '@/components/common/AnimatedElement/AnimatedElement';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import MaterialForm from '@/components/features/generation-hub/MaterialForm/MaterialForm';

export default function MaterialGeneration() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generation Hub', href: '/dashboard/generation-hub' },
    { label: 'Create Material' },
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
        <MaterialForm />
      </AnimatedElement>
    </div>
  );
}
