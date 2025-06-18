'use client';

import React from 'react';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
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
      <PageHeader title="Create Exam" />

      <AnimatedElement animation="up" delay={0.1}>
        <ExamForm />
      </AnimatedElement>
    </div>
  );
}
