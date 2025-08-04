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
        subtitle="Welcome back, Teacher! Here's your command center for intelligent teaching."
      />

      {/* Enhanced enterprise dashboard layout */}
      <div className={styles.enterpriseDashboard}>
        {/* Primary Features Section - More prominent */}
        <section className={styles.primarySection} aria-label="Core Features">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Core Features</h2>
            <div className={styles.contextIndicators}>
              <span className={styles.contextDot}></span>
              <span className={styles.contextText}>Active Session</span>
            </div>
          </div>
          
          <div className={styles.primaryGrid}>
            <DashboardFeatureCard
              title="Generation Hub"
              description="AI-powered content creation"
              icon={<GenerationHubIcon />}
              mainContent="Create intelligent teaching materials and comprehensive exams using advanced AI technology."
              linkHref="/dashboard/generation-hub"
              linkText="Launch Hub"
              animationDelay={0.1}
              pulseIcon={true}
            />

            <DashboardFeatureCard
              title="Student Management"
              description="Complete student lifecycle"
              icon={<StudentsIcon />}
              mainContent="Comprehensive student roster management with detailed academic profiles and performance tracking."
              linkHref="/dashboard/students"
              linkText="Manage Students"
              animationDelay={0.2}
            />

            <DashboardFeatureCard
              title="Assessment & Analytics"
              description="Performance insights"
              icon={<GradesIcon />}
              mainContent="Advanced grading system with attendance tracking and detailed performance analytics."
              linkHref="/dashboard/grades"
              linkText="View Analytics"
              animationDelay={0.3}
            />
          </div>
        </section>

        {/* Quick Actions & Workflow Section */}
        <section className={styles.workflowSection} aria-label="Quick Workflow">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick Workflow</h2>
          </div>
          
          <div className={styles.workflowGrid}>
            <AnimatedElement animation="fade" delay={0.4}>
              <div className={styles.workflowCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Instant Actions</h3>
                  <span className={styles.cardBadge}>Popular</span>
                </div>
                <div className={styles.quickActionsList}>
                  <QuickActionCard
                    title="Create Material"
                    linkHref="/dashboard/generation-hub/material"
                    linkText="Start"
                  />
                  <QuickActionCard
                    title="Generate Exam"
                    linkHref="/dashboard/generation-hub/exam"
                    linkText="Start"
                  />
                  <QuickActionCard
                    title="Add Student"
                    linkHref="/dashboard/students/add"
                    linkText="Start"
                  />
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fade" delay={0.5}>
              <div className={styles.workflowCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Recent Activity</h3>
                </div>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>📝</div>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>Ready to create your first content</span>
                      <span className={styles.activityTime}>Welcome</span>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>👥</div>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>Student management available</span>
                      <span className={styles.activityTime}>New</span>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>📊</div>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>Analytics ready for setup</span>
                      <span className={styles.activityTime}>Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </section>

        {/* Compact status bar moved to bottom - less prominent */}
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>System Status</span>
            <span className={styles.statusValue}>Operational</span>
          </div>
          <div className={styles.statusSeparator}></div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Last Activity</span>
            <span className={styles.statusValue}>Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
