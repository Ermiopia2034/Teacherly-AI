'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import { AppDispatch } from '@/lib/store';
import {
  fetchMyContentThunk,
  selectMyContents,
  selectContentIsLoading,
  selectContentError,
} from '@/lib/features/content/contentSlice';
import Card from '@/components/ui/Card';
import styles from './MyContentsPage.module.css';

export default function MyContentsPage() {
  const dispatch: AppDispatch = useDispatch();
  const contents = useSelector(selectMyContents);
  const isLoading = useSelector(selectContentIsLoading);
  const error = useSelector(selectContentError);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Contents' },
  ];

  useEffect(() => {
    dispatch(fetchMyContentThunk());
  }, [dispatch]);

  const renderContent = () => {
    if (isLoading) {
      return <p>Please wait, Loading your content...</p>;
    }

    if (error) {
      return <p className={styles.errorText}>Error fetching content: {error}</p>;
    }

    if (!contents || contents.length === 0) {
      return <p>You haven&apos;t generated any content yet.</p>;
    }

    return (
      <div className={styles.contentGrid}>
        {contents.map((content) => (
          <Link key={content.id} href={`/dashboard/my-contents/${content.id}`} passHref className={styles.cardLink}>
            <Card className={styles.contentCard}>
              <h3 className={styles.cardTitle}>{content.title}</h3>
              <p className={styles.cardType}>{content.content_type}</p>
              {content.description && <p className={styles.cardDescription}>{content.description}</p>}
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="My Generated Contents"
        subtitle="View and manage all the teaching materials you have created."
      />
      <div className={styles.contentSection}>
        {renderContent()}
      </div>
    </div>
  );
}