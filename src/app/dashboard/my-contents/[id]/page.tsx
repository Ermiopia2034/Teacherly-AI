'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { AppDispatch } from '@/lib/store';
import {
  fetchContentByIdThunk,
  selectSelectedContent,
  selectSelectedContentIsLoading,
  selectContentError,
} from '@/lib/features/content/contentSlice';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import styles from './ContentDetailPage.module.css';

export default function ContentDetailPage() {
  const params = useParams();
  const dispatch: AppDispatch = useDispatch();
  const content = useSelector(selectSelectedContent);
  const isLoading = useSelector(selectSelectedContentIsLoading);
  const error = useSelector(selectContentError);

  const contentId = Number(params.id);

  useEffect(() => {
    if (contentId) {
      dispatch(fetchContentByIdThunk(contentId));
    }
  }, [dispatch, contentId]);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Contents', href: '/dashboard/my-contents' },
    { label: content ? content.title : '...' },
  ];

  const renderContentDetail = () => {
    if (isLoading) {
      return <p>Loading content...</p>;
    }

    if (error) {
      return <p className={styles.errorText}>Error: {error}</p>;
    }

    if (!content) {
      return <p>Content not found.</p>;
    }

    // Assuming the main markdown content is stored in a 'data.content' field
    const markdownContent = content.data?.markdown || 'No content available to display.';

    return (
      <div className={styles.contentContainer}>
        <div className={styles.markdownWrapper}>
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title={content ? content.title : 'Loading...'}
        subtitle={`Type: ${content ? content.content_type : '...'}`}
      />
      {renderContentDetail()}
    </div>
  );
}