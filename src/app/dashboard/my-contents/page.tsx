'use client';

import React from 'react';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';

export default function MyContentsPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Contents' },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="My Generated Contents"
        subtitle="View and manage all the teaching materials you have created."
      />
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <p>Content list will be displayed here.</p>
        <p>Fetching data from the backend and displaying a list of generated materials is the next step.</p>
      </div>
    </div>
  );
}