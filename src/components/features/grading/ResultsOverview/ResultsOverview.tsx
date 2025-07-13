'use client';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectCurrentAssessment,
  selectFilteredSubmissions
} from '@/lib/features/grading/gradingSlice';
import Card from '@/components/ui/Card/Card';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import styles from './ResultsOverview.module.css';

interface ResultsOverviewProps {
  className?: string;
}

interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
  students: string[];
}

interface AnalyticsData {
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // Assuming 60% is passing
  scoreDistribution: ScoreDistribution[];
  completionRate: number;
}

export function ResultsOverview({ className }: ResultsOverviewProps) {
  const currentAssessment = useSelector(selectCurrentAssessment);
  // const assessmentStats = useSelector(selectAssessmentStats);
  const submissions = useSelector(selectFilteredSubmissions);

  const analytics = useMemo((): AnalyticsData => {
    const gradedSubmissions = submissions.filter(s => s.grading_result);
    const scores = gradedSubmissions.map(s => s.grading_result!.percentage).filter(score => typeof score === 'number' && !isNaN(score));
    
    // Basic statistics
    const totalSubmissions = submissions.length;
    const gradedCount = gradedSubmissions.length;
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const sortedScores = [...scores].sort((a, b) => a - b);
    const medianScore = sortedScores.length > 0 
      ? sortedScores.length % 2 === 0
        ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
        : sortedScores[Math.floor(sortedScores.length / 2)]
      : 0;
    
    // Standard deviation
    const variance = scores.length > 0 
      ? scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
      : 0;
    const standardDeviation = Math.sqrt(variance);
    
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const passRate = scores.length > 0 ? (scores.filter(s => s >= 60).length / scores.length) * 100 : 0;
    const completionRate = totalSubmissions > 0 ? (gradedCount / totalSubmissions) * 100 : 0;

    // Score distribution
    const ranges = [
      { min: 90, max: 100, label: '90-100%' },
      { min: 80, max: 89, label: '80-89%' },
      { min: 70, max: 79, label: '70-79%' },
      { min: 60, max: 69, label: '60-69%' },
      { min: 0, max: 59, label: '0-59%' }
    ];

    const scoreDistribution = ranges.map(range => {
      const submissionsInRange = gradedSubmissions.filter(s => {
        const score = s.grading_result!.percentage;
        return typeof score === 'number' && !isNaN(score) && score >= range.min && score <= range.max;
      });
      
      return {
        range: range.label,
        count: submissionsInRange.length,
        percentage: gradedCount > 0 ? (submissionsInRange.length / gradedCount) * 100 : 0,
        students: submissionsInRange.map(s => s.student_name || `Student ${s.student_id}`).slice(0, 5)
      };
    });

    return {
      totalSubmissions,
      gradedSubmissions: gradedCount,
      averageScore: isNaN(averageScore) ? 0 : averageScore,
      medianScore: isNaN(medianScore) ? 0 : medianScore,
      standardDeviation: isNaN(standardDeviation) ? 0 : standardDeviation,
      highestScore: isNaN(highestScore) ? 0 : highestScore,
      lowestScore: isNaN(lowestScore) ? 0 : lowestScore,
      passRate: isNaN(passRate) ? 0 : passRate,
      scoreDistribution,
      completionRate: isNaN(completionRate) ? 0 : completionRate
    };
  }, [submissions]);

  if (!currentAssessment) {
    return (
      <Card className={`${styles.container} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 8h10" />
              <path d="M7 12h10" />
              <path d="M7 16h6" />
            </svg>
          </div>
          <h3>No Assessment Selected</h3>
          <p>Select an assessment to view grading results and analytics.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Overview Cards */}
      <div className={styles.overviewGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <h4>Total Submissions</h4>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{analytics.totalSubmissions}</div>
          <div className={styles.statSubtext}>
            {analytics.gradedSubmissions} graded • {analytics.totalSubmissions - analytics.gradedSubmissions} pending
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <h4>Average Score</h4>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{(analytics.averageScore || 0).toFixed(1)}%</div>
          <div className={styles.statSubtext}>
            Median: {(analytics.medianScore || 0).toFixed(1)}% • σ: {(analytics.standardDeviation || 0).toFixed(1)}
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <h4>Pass Rate</h4>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{(analytics.passRate || 0).toFixed(1)}%</div>
          <div className={styles.statSubtext}>
            {Math.round(((analytics.passRate || 0) / 100) * analytics.gradedSubmissions)} of {analytics.gradedSubmissions} students
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <h4>Completion</h4>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{(analytics.completionRate || 0).toFixed(1)}%</div>
          <div className={styles.statSubtext}>
            {analytics.gradedSubmissions} of {analytics.totalSubmissions} processed
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <h4>Grading Progress</h4>
          <span className={styles.progressText}>
            {analytics.gradedSubmissions} / {analytics.totalSubmissions} completed
          </span>
        </div>
        <ProgressBar
          value={analytics.completionRate}
          label="Overall Progress"
          showPercentage={true}
          size="lg"
          variant={analytics.completionRate === 100 ? 'success' : 'primary'}
          animated={analytics.completionRate < 100}
        />
      </Card>

      {/* Score Distribution */}
      {analytics.gradedSubmissions > 0 && (
        <Card className={styles.distributionCard}>
          <div className={styles.distributionHeader}>
            <h4>Score Distribution</h4>
            <div className={styles.distributionStats}>
              <span>Highest: {(analytics.highestScore || 0).toFixed(1)}%</span>
              <span>Lowest: {(analytics.lowestScore || 0).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className={styles.distributionChart}>
            {analytics.scoreDistribution.map((range, index) => (
              <div key={index} className={styles.distributionRange}>
                <div className={styles.rangeHeader}>
                  <span className={styles.rangeLabel}>{range.range}</span>
                  <span className={styles.rangeCount}>
                    {range.count} ({(range.percentage || 0).toFixed(1)}%)
                  </span>
                </div>
                
                <div className={styles.rangeBar}>
                  <div 
                    className={styles.rangeProgress}
                    style={{ 
                      width: `${range.percentage}%`,
                      backgroundColor: getScoreColor(range.range)
                    }}
                  />
                </div>
                
                {range.students.length > 0 && (
                  <div className={styles.rangeStudents}>
                    {range.students.slice(0, 3).map((student, idx) => (
                      <span key={idx} className={styles.studentName}>
                        {student}
                      </span>
                    ))}
                    {range.students.length > 3 && (
                      <span className={styles.moreStudents}>
                        +{range.students.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assessment Info */}
      <Card className={styles.assessmentCard}>
        <div className={styles.assessmentHeader}>
          <h4>Assessment Details</h4>
        </div>
        <div className={styles.assessmentInfo}>
          <div className={styles.assessmentField}>
            <span className={styles.fieldLabel}>Title:</span>
            <span className={styles.fieldValue}>{currentAssessment.title}</span>
          </div>
          {currentAssessment.description && (
            <div className={styles.assessmentField}>
              <span className={styles.fieldLabel}>Description:</span>
              <span className={styles.fieldValue}>{currentAssessment.description}</span>
            </div>
          )}
          <div className={styles.assessmentField}>
            <span className={styles.fieldLabel}>Max Score:</span>
            <span className={styles.fieldValue}>{currentAssessment.max_score} points</span>
          </div>
          <div className={styles.assessmentField}>
            <span className={styles.fieldLabel}>Status:</span>
            <span className={`${styles.fieldValue} ${styles.status} ${styles[currentAssessment.status]}`}>
              {currentAssessment.status.charAt(0).toUpperCase() + currentAssessment.status.slice(1)}
            </span>
          </div>
          <div className={styles.assessmentField}>
            <span className={styles.fieldLabel}>Created:</span>
            <span className={styles.fieldValue}>
              {new Date(currentAssessment.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getScoreColor(range: string): string {
  switch (range) {
    case '90-100%':
      return '#10b981'; // Green
    case '80-89%':
      return '#3b82f6'; // Blue
    case '70-79%':
      return '#f59e0b'; // Yellow
    case '60-69%':
      return '#f97316'; // Orange
    case '0-59%':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
}

export default ResultsOverview;