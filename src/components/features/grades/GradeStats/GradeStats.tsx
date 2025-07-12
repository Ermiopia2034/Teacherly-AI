'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { fetchGradeStatsThunk, selectGradeStats, selectGradesLoading } from '@/lib/features/grades/gradesSlice';
import Card from '@/components/ui/Card/Card';
import styles from './GradeStats.module.css';

export function GradeStats() {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector(selectGradeStats);
  const isLoading = useSelector(selectGradesLoading);

  useEffect(() => {
    dispatch(fetchGradeStatsThunk());
  }, [dispatch]);

  if (isLoading && !stats) {
    return (
      <Card className={styles.statsCard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading statistics...</p>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={styles.statsCard}>
        <div className={styles.emptyState}>
          <p>No grade statistics available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.statsCard} title="Grade Statistics">
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total_grades}</div>
          <div className={styles.statLabel}>Total Grades</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.average_score.toFixed(1)}%</div>
          <div className={styles.statLabel}>Average Score</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.highest_score}%</div>
          <div className={styles.statLabel}>Highest Score</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.lowest_score}%</div>
          <div className={styles.statLabel}>Lowest Score</div>
        </div>
      </div>
      
      {stats.teacher_name && (
        <div className={styles.teacherInfo}>
          <span>Teacher: {stats.teacher_name}</span>
        </div>
      )}
    </Card>
  );
}

export default GradeStats;