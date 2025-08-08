"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import DataTable, { Column } from "@/components/ui/DataTable/DataTable";
import { AppDispatch } from "@/lib/store";
import {
  fetchMyContentThunk,
  selectMyContents,
  selectContentIsLoading,
  selectContentError,
} from "@/lib/features/content/contentSlice";
import { ContentRead, ContentType } from "@/lib/api/content";
import { usePDFExport } from "@/lib/utils/pdfExport";
import styles from "./MyContentsPage.module.css";

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export default function MyContentsPage() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const contents = useSelector(selectMyContents);
  const isLoading = useSelector(selectContentIsLoading);
  const error = useSelector(selectContentError);
  const {
    exportSingleContent,
    exportMultipleContents,
    exportCombinedContents,
  } = usePDFExport();

  const [activeTab, setActiveTab] = useState<string>("exams");
  const [selectedContents, setSelectedContents] = useState<Set<number>>(
    new Set(),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

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
    { label: "My Contents" },
  ];

  useEffect(() => {
    dispatch(fetchMyContentThunk());
  }, [dispatch]);

  // Filter contents by type
  const examContents = useMemo(
    () =>
      contents.filter(
        (content) =>
          content.content_type === ContentType.EXAM ||
          content.content_type === ContentType.ASSIGNMENT,
      ),
    [contents],
  );

  const materialContents = useMemo(
    () =>
      contents.filter(
        (content) =>
          content.content_type === ContentType.MATERIAL ||
          content.content_type === ContentType.NOTE,
      ),
    [contents],
  );

  const tabs: TabConfig[] = useMemo(
    () => [
      {
        id: "exams",
        label: "Exams & Assignments",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
        ),
        count: examContents.length,
      },
      {
        id: "materials",
        label: "Teaching Materials",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M9 6h6" />
            <path d="M9 10h6" />
            <path d="M9 14h3" />
          </svg>
        ),
        count: materialContents.length,
      },
    ],
    [examContents.length, materialContents.length],
  );

  const getContentTypeDisplay = useCallback((type: ContentType) => {
    const typeConfig = {
      [ContentType.EXAM]: { label: "Exam", className: styles.typeExam },
      [ContentType.ASSIGNMENT]: {
        label: "Assignment",
        className: styles.typeAssignment,
      },
      [ContentType.MATERIAL]: {
        label: "Material",
        className: styles.typeMaterial,
      },
      [ContentType.NOTE]: { label: "Note", className: styles.typeNote },
    };

    const config = typeConfig[type];

    return (
      <span className={`${styles.typeBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  }, []);

  const handleExportSelected = useCallback(async () => {
    if (selectedContents.size === 0) return;

    setIsExporting(true);
    setExportError(null);
    setExportSuccess(null);

    try {
      const contentsToExport = contents.filter((content) =>
        selectedContents.has(content.id),
      );
      await exportMultipleContents(contentsToExport);
      setExportSuccess(
        `Successfully exported ${contentsToExport.length} content(s) as separate PDFs`,
      );
      setSelectedContents(new Set()); // Clear selection after successful export
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(
        error instanceof Error
          ? error.message
          : "Failed to export PDFs. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [selectedContents, contents, exportMultipleContents]);

  const handleExportSingle = useCallback(
    async (content: ContentRead) => {
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
    },
    [exportSingleContent],
  );

  const handleSelectContent = useCallback(
    (contentId: number) => {
      const newSelected = new Set(selectedContents);
      if (newSelected.has(contentId)) {
        newSelected.delete(contentId);
      } else {
        newSelected.add(contentId);
      }
      setSelectedContents(newSelected);
    },
    [selectedContents],
  );

  const handleSelectAll = useCallback(
    (contents: ContentRead[]) => {
      if (selectedContents.size === contents.length) {
        setSelectedContents(new Set());
      } else {
        setSelectedContents(new Set(contents.map((c) => c.id)));
      }
    },
    [selectedContents],
  );

  const handleRowClick = useCallback(
    (record: Record<string, unknown>) => {
      const contentRecord = record as unknown as ContentRead;
      router.push(`/dashboard/my-contents/${contentRecord.id}`);
    },
    [router],
  );

  const contentColumns: Column<Record<string, unknown>>[] = useMemo(
    () => [
      {
        key: "select",
        title: (
          <input
            type="checkbox"
            checked={
              selectedContents.size > 0 &&
              selectedContents.size ===
                (activeTab === "exams"
                  ? examContents.length
                  : materialContents.length)
            }
            onChange={() =>
              handleSelectAll(
                activeTab === "exams" ? examContents : materialContents,
              )
            }
            className={styles.selectCheckbox}
          />
        ),
        render: (_, record) => {
          const contentRecord = record as unknown as ContentRead;
          return (
            <input
              type="checkbox"
              checked={selectedContents.has(contentRecord.id)}
              onChange={() => handleSelectContent(contentRecord.id)}
              onClick={(e) => e.stopPropagation()}
              className={styles.selectCheckbox}
            />
          );
        },
        width: 50,
      },
      {
        key: "title",
        title: "Title",
        dataIndex: "title",
        sortable: true,
        render: (value, record) => {
          const contentRecord = record as unknown as ContentRead;
          return (
            <div className={styles.titleCell}>
              <div className={styles.contentTitle}>{String(value)}</div>
              {contentRecord.description && (
                <div className={styles.contentDescription}>
                  {contentRecord.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "content_type",
        title: "Type",
        dataIndex: "content_type",
        sortable: true,
        render: (value) => getContentTypeDisplay(value as ContentType),
        width: 120,
      },
      {
        key: "subject",
        title: "Subject",
        render: (_, record) => {
          const contentRecord = record as unknown as ContentRead;
          const subject = contentRecord.data?.source_request?.subject;
          return subject ? (
            <div className={styles.subjectCell}>
              <span className={styles.subjectName}>{subject}</span>
              {contentRecord.data?.source_request?.grade && (
                <span className={styles.gradeInfo}>
                  Grade {contentRecord.data.source_request.grade}
                </span>
              )}
            </div>
          ) : (
            <span className={styles.noData}>—</span>
          );
        },
        width: 150,
      },
      {
        key: "topic",
        title: "Topic",
        render: (_, record) => {
          const contentRecord = record as unknown as ContentRead;
          const topic = contentRecord.data?.source_request?.topic;
          const unit = contentRecord.data?.source_request?.unit;
          return (
            <div className={styles.topicCell}>
              {topic && <div className={styles.topicName}>{topic}</div>}
              {unit && <div className={styles.unitInfo}>Unit: {unit}</div>}
              {!topic && !unit && <span className={styles.noData}>—</span>}
            </div>
          );
        },
        width: 180,
      },
      {
        key: "actions",
        title: "Actions",
        render: (_, record) => {
          const contentRecord = record as unknown as ContentRead;
          return (
            <div className={styles.actionsCell}>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportSingle(contentRecord);
                }}
                disabled={isExporting}
                iconLeft={
                  <svg
                    width="14"
                    height="14"
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
                PDF
              </Button>
            </div>
          );
        },
        width: 100,
      },
    ],
    [
      getContentTypeDisplay,
      selectedContents,
      activeTab,
      examContents,
      materialContents,
      isExporting,
      handleSelectAll,
      handleSelectContent,
      handleExportSingle,
    ],
  );

  const renderTabContent = () => {
    const currentData = activeTab === "exams" ? examContents : materialContents;
    const emptyMessage =
      activeTab === "exams"
        ? "You haven't created any exams or assignments yet."
        : "You haven't created any teaching materials yet.";

    if (isLoading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your content...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p>Error fetching content: {error}</p>
        </div>
      );
    }

    return (
      <Card>
        {currentData.length > 0 && (
          <div className={styles.tableActions}>
            <div className={styles.selectionInfo}>
              {selectedContents.size > 0 && (
                <span className={styles.selectionCount}>
                  {selectedContents.size} selected
                </span>
              )}
            </div>
            <div className={styles.exportActions}>
              {selectedContents.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const contentsToExport = contents.filter((content) =>
                        selectedContents.has(content.id),
                      );
                      setIsExporting(true);
                      setExportError(null);
                      setExportSuccess(null);

                      try {
                        await exportCombinedContents(contentsToExport);
                        setExportSuccess(
                          `Successfully exported ${contentsToExport.length} content(s) as combined PDF`,
                        );
                        setSelectedContents(new Set());
                      } catch (error) {
                        console.error("Combined export failed:", error);
                        setExportError(
                          error instanceof Error
                            ? error.message
                            : "Failed to export combined PDF. Please try again.",
                        );
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                    disabled={isExporting}
                    iconLeft={
                      <svg
                        width="14"
                        height="14"
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
                    Combined PDF
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportSelected}
                    disabled={isExporting}
                    isLoading={isExporting}
                    iconLeft={
                      <svg
                        width="14"
                        height="14"
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
                    Separate PDFs ({selectedContents.size})
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

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
        <DataTable
          columns={contentColumns}
          data={currentData as unknown as Record<string, unknown>[]}
          loading={isLoading}
          onRowClick={handleRowClick}
          emptyText={emptyMessage}
        />
      </Card>
    );
  };

  return (
    <div className={styles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Removed PageHeader to avoid duplicate title with breadcrumbs */}

      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className={styles.tabIcon}>{tab.icon}</div>
              <span className={styles.tabLabel}>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={styles.tabBadge}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
}
