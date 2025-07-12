'use client';

import { useState } from 'react';
import { ReportResponse } from '@/lib/api/reports';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import styles from './ReportPreview.module.css';

interface ReportPreviewProps {
  report: ReportResponse;
  onEmailReport?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
}

export function ReportPreview({ report, onEmailReport, onDownload, onClose }: ReportPreviewProps) {
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'summary' | 'students'>('summary');

  const toggleStudentExpansion = (studentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className={styles.trendUp}>↗</span>;
      case 'declining':
        return <span className={styles.trendDown}>↘</span>;
      default:
        return <span className={styles.trendStable}>→</span>;
    }
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'excellent', color: '#10b981' };
    if (score >= 80) return { level: 'good', color: '#3b82f6' };
    if (score >= 70) return { level: 'satisfactory', color: '#f59e0b' };
    return { level: 'needs improvement', color: '#ef4444' };
  };

  return (
    <div className={styles.container}>
      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>Report Preview</h2>
            <p className={styles.reportInfo}>
              {report.report_type.replace('_', ' ').toUpperCase()} • 
              {formatDate(report.date_range_start)} - {formatDate(report.date_range_end)} • 
              {report.total_students_included} students
            </p>
            <p className={styles.generatedAt}>
              Generated on {formatDate(report.generated_at)}
            </p>
          </div>
          
          <div className={styles.headerActions}>
            {report.file_path && (
              <Button variant="secondary" onClick={onDownload}>
                Download Excel
              </Button>
            )}
            <Button onClick={onEmailReport}>
              Email Report
            </Button>
            {onClose && (
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'summary' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'students' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Student Details
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className={styles.summarySection}>
          {/* Overall Statistics */}
          <Card className={styles.statsCard}>
            <h3>Overall Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{report.summary.total_students}</span>
                <span className={styles.statLabel}>Total Students</span>
              </div>
              {report.summary.total_grades_recorded > 0 && (
                <>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{report.summary.total_grades_recorded}</span>
                    <span className={styles.statLabel}>Total Grades</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{formatPercentage(report.summary.class_average_score)}</span>
                    <span className={styles.statLabel}>Class Average</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{formatPercentage(report.summary.highest_class_score)}</span>
                    <span className={styles.statLabel}>Highest Score</span>
                  </div>
                </>
              )}
              {report.summary.total_attendance_records > 0 && (
                <>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{formatPercentage(report.summary.overall_attendance_rate)}</span>
                    <span className={styles.statLabel}>Attendance Rate</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{report.summary.total_present}</span>
                    <span className={styles.statLabel}>Present</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{report.summary.total_absent}</span>
                    <span className={styles.statLabel}>Absent</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Top Performers */}
          {report.summary.top_performing_students.length > 0 && (
            <Card className={styles.topPerformersCard}>
              <h3>Top Performing Students</h3>
              <div className={styles.studentList}>
                {report.summary.top_performing_students.map((student, index) => (
                  <div key={index} className={styles.studentItem}>
                    <div className={styles.studentRank}>#{index + 1}</div>
                    <div className={styles.studentInfo}>
                      <span className={styles.studentName}>{student.name}</span>
                      <span className={styles.studentScore}>
                        {formatPercentage(student.average_score)} avg • {student.total_grades} grades
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Students Needing Attention */}
          {report.summary.students_needing_attention.length > 0 && (
            <Card className={styles.attentionCard}>
              <h3>Students Needing Attention</h3>
              <div className={styles.studentList}>
                {report.summary.students_needing_attention.map((student, index) => (
                  <div key={index} className={styles.studentItem}>
                    <div className={styles.attentionIndicator}>⚠</div>
                    <div className={styles.studentInfo}>
                      <span className={styles.studentName}>{student.name}</span>
                      <span className={styles.studentIssues}>
                        {formatPercentage(student.average_score)} avg • 
                        {student.trend === 'declining' && ' Declining trend •'}
                        {formatPercentage(student.attendance_rate)} attendance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className={styles.studentsSection}>
          <div className={styles.studentsList}>
            {report.student_data.map((student) => (
              <Card key={student.student_id} className={styles.studentCard}>
                <div className={styles.studentHeader} onClick={() => toggleStudentExpansion(student.student_id)}>
                  <div className={styles.studentBasicInfo}>
                    <h4>{student.student_name}</h4>
                    <span className={styles.gradeLevel}>{student.grade_level}</span>
                  </div>
                  <div className={styles.studentMetrics}>
                    {student.total_grades > 0 && (
                      <div className={styles.metric}>
                        <span className={styles.metricValue}>{formatPercentage(student.average_score)}</span>
                        <span className={styles.metricLabel}>Avg Grade</span>
                        {getTrendIcon(student.grade_trend)}
                      </div>
                    )}
                    {student.total_attendance_records > 0 && (
                      <div className={styles.metric}>
                        <span className={styles.metricValue}>{formatPercentage(student.attendance_rate)}</span>
                        <span className={styles.metricLabel}>Attendance</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.expandIcon}>
                    {expandedStudents.has(student.student_id) ? '▼' : '▶'}
                  </div>
                </div>

                {expandedStudents.has(student.student_id) && (
                  <div className={styles.studentDetails}>
                    {/* Grades Section */}
                    {student.total_grades > 0 && (
                      <div className={styles.detailSection}>
                        <h5>Grade Performance</h5>
                        <div className={styles.gradeStats}>
                          <div className={styles.gradeStat}>
                            <span>Total Grades:</span>
                            <span>{student.total_grades}</span>
                          </div>
                          <div className={styles.gradeStat}>
                            <span>Highest:</span>
                            <span>{formatPercentage(student.highest_score)}</span>
                          </div>
                          <div className={styles.gradeStat}>
                            <span>Lowest:</span>
                            <span>{formatPercentage(student.lowest_score)}</span>
                          </div>
                          <div className={styles.gradeStat}>
                            <span>Trend:</span>
                            <span className={styles.trendInfo}>
                              {student.grade_trend} {getTrendIcon(student.grade_trend)}
                            </span>
                          </div>
                        </div>

                        {student.grades.length > 0 && (
                          <div className={styles.recentGrades}>
                            <h6>Recent Grades</h6>
                            <div className={styles.gradesList}>
                              {student.grades.slice(0, 5).map((grade) => {
                                const performance = getPerformanceLevel(grade.score);
                                return (
                                  <div key={grade.id} className={styles.gradeItem}>
                                    <div className={styles.gradeInfo}>
                                      <span className={styles.contentTitle}>{grade.content_title}</span>
                                      <span className={styles.gradeDate}>{formatDate(grade.grading_date)}</span>
                                    </div>
                                    <div 
                                      className={styles.gradeScore}
                                      style={{ color: performance.color }}
                                    >
                                      {grade.score}{grade.max_score ? `/${grade.max_score}` : '%'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attendance Section */}
                    {student.total_attendance_records > 0 && (
                      <div className={styles.detailSection}>
                        <h5>Attendance Summary</h5>
                        <div className={styles.attendanceStats}>
                          <div className={styles.attendanceStat}>
                            <span>Present:</span>
                            <span className={styles.presentCount}>{student.present_count}</span>
                          </div>
                          <div className={styles.attendanceStat}>
                            <span>Absent:</span>
                            <span className={styles.absentCount}>{student.absent_count}</span>
                          </div>
                          <div className={styles.attendanceStat}>
                            <span>Late:</span>
                            <span className={styles.lateCount}>{student.late_count}</span>
                          </div>
                          <div className={styles.attendanceStat}>
                            <span>Excused:</span>
                            <span className={styles.excusedCount}>{student.excused_count}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPreview;