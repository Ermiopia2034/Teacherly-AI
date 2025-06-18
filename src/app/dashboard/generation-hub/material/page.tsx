'use client';

import React from 'react';
import AnimatedElement from '@/components/common/AnimatedElement/AnimatedElement';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import MaterialForm from '@/components/features/generation-hub/MaterialForm/MaterialForm';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';

export default function MaterialGeneration() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generation Hub', href: '/dashboard/generation-hub' },
    { label: 'Create Material', isCurrent: true },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Create Teaching Material" />

      <AnimatedElement animation="up" delay={0.1}>
        <MaterialForm />
      </AnimatedElement>
    </div>
  );
}
