'use client';

import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css'; // Keep for .fadeIn and .cardsGrid until those are potentially moved or refactored
import AnimatedElement from '@/components/common/AnimatedElement/AnimatedElement';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import DashboardFeatureCard from '@/components/features/dashboard/DashboardFeatureCard/DashboardFeatureCard';
import QuickActionCard from '@/components/features/dashboard/QuickActionCard/QuickActionCard';

// SVG Icon components (or pass them directly as in the original)
const GenerationHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const StudentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const GradesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);


export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`${isLoaded ? styles.fadeIn : ''}`}>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, Teacher! Here's an overview of your teaching tools and resources."
      />

      {/* Compact top summary bar to move secondary numeric indicators out of the main workspace */}
      <div className={styles.topSummaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Classes</span>
          <span className={styles.summaryItemValue}>—</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Students</span>
          <span className={styles.summaryItemValue}>—</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Pending Grading</span>
          <span className={styles.summaryItemValue}>—</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Reports</span>
          <span className={styles.summaryItemValue}>—</span>
        </div>
      </div>

      {/* Two-pane grid: left (primary features), right (secondary quick actions) */}
      <div className={styles.dashboardGrid}>
        <section className={styles.leftPane} aria-label="Primary features">
          <div className={styles.cardsGrid}>
            <DashboardFeatureCard
              title="Generation Hub"
              description="Create teaching materials and exams"
              icon={<GenerationHubIcon />}
              mainContent="Use AI to generate teaching materials and exams for your classes."
              linkHref="/dashboard/generation-hub"
              linkText="Go to Generation Hub"
              animationDelay={0.1}
              pulseIcon={true}
            />

            <DashboardFeatureCard
              title="Students"
              description="Manage your student roster"
              icon={<StudentsIcon />}
              mainContent="View and manage your students, classes, and groups. This includes detailed profiles and academic records."
              linkHref="/dashboard/students"
              linkText="Manage Students"
              animationDelay={0.2}
            />

            <DashboardFeatureCard
              title="Grades & Attendance"
              description="Track student performance"
              icon={<GradesIcon />}
              mainContent="Record and analyze student grades and attendance."
              linkHref="/dashboard/grades" // Assuming this is the correct link, adjust if needed
              linkText="View Grades"
              animationDelay={0.3}
            />
          </div>
        </section>

        <aside className={styles.rightPane} aria-label="Quick actions and utilities">
          <AnimatedElement animation="fade" delay={0.2}>
            <div className={styles.card} style={{ backgroundColor: 'var(--surface-primary)'}}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Quick Actions</h2>
                  <p className={styles.cardSubtitle}>Frequently used tasks</p>
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardsGrid}>
                  <QuickActionCard
                    title="Create New Material"
                    linkHref="/dashboard/generation-hub/material"
                    linkText="Start Now"
                  />
                  <QuickActionCard
                    title="Generate Exam"
                    linkHref="/dashboard/generation-hub/exam"
                    linkText="Start Now"
                  />
                  <QuickActionCard
                    title="Add New Student"
                    linkHref="/dashboard/students/add"
                    linkText="Start Now"
                  />
                </div>
              </div>
            </div>
          </AnimatedElement>
        </aside>
      </div>
    </div>
  );
}
