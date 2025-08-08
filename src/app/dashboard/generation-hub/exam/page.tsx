'use client';

import React from 'react';
import ExamForm from '@/components/features/generation-hub/ExamForm/ExamForm';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import AnimatedElement from '@/components/common/AnimatedElement/AnimatedElement';

export default function ExamGeneration() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generation Hub', href: '/dashboard/generation-hub' },
    { label: 'Create Exam', isCurrent: true },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      {/* Removed PageHeader to avoid duplicate title with breadcrumbs */}

      <AnimatedElement animation="up" delay={0.1}>
        <ExamForm />
      </AnimatedElement>
    </div>
  );
}
