"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";
import Button from "@/components/ui/Button/Button";
import { usePDFExport } from "@/lib/utils/pdfExport";
import {
  fetchContentByIdThunk,
  selectSelectedContent,
  selectSelectedContentIsLoading,
  selectContentError,
} from "@/lib/features/content/contentSlice";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import MarkdownRenderer from "@/components/common/MarkdownRenderer";
import styles from "./ContentDetailPage.module.css";

export default function ContentDetailPage() {
  const params = useParams();
  const dispatch: AppDispatch = useDispatch();
  const content = useSelector(selectSelectedContent);
  const isLoading = useSelector(selectSelectedContentIsLoading);
  const error = useSelector(selectContentError);
  const { exportSingleContent } = usePDFExport();

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const contentId = Number(params.id);

  useEffect(() => {
    if (contentId) {
      dispatch(fetchContentByIdThunk(contentId));
    }
  }, [dispatch, contentId]);

  // Auto-dismiss feedback messages
  useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => setExportSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [exportSuccess]);

  useEffect(() => {
    if (exportError) {
      const timer = setTimeout(() => setExportError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [exportError]);

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Contents", href: "/dashboard/my-contents" },
    { label: content ? content.title : "..." },
  ];

  const handleExportToPDF = async () => {
    if (!content) return;

    setIsExporting(true);
    setExportError(null);
    setExportSuccess(null);

    try {
      await exportSingleContent(content);
      setExportSuccess(`Successfully exported "${content.title}" as PDF`);
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(
        error instanceof Error
          ? error.message
          : "Failed to export PDF. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

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
    const markdownContent =
      content.data?.markdown || "No content available to display.";

    return (
      <div className={styles.contentContainer}>
        <div className={styles.contentHeader}>
          <div className={styles.contentInfo}>
            <h1 className={styles.contentTitle}>{content.title}</h1>
            {content.description && (
              <p className={styles.contentDescription}>{content.description}</p>
            )}
          </div>
          <div className={styles.contentActions}>
            <Button
              variant="primary"
              size="md"
              onClick={handleExportToPDF}
              disabled={isExporting}
              isLoading={isExporting}
              iconLeft={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              Export as PDF
            </Button>
          </div>
        </div>
        <div className={`${styles.contentBody} ${styles.prose}`}>
          <MarkdownRenderer markdownContent={markdownContent} />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Breadcrumb items={breadcrumbItems} />
      {/* Removed PageHeader to avoid duplicate title with breadcrumbs */}

      {/* Export feedback messages */}
      {exportSuccess && (
        <div className={styles.successMessage}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
          {exportSuccess}
        </div>
      )}

      {exportError && (
        <div className={styles.errorMessage}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {exportError}
        </div>
      )}

      {renderContentDetail()}
    </div>
  );
}
