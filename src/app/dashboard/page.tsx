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

      <AnimatedElement animation="fade" delay={0.4}>
        {/* This outer card acts as a container for quick actions */}
        <div className={styles.card} style={{ backgroundColor: 'var(--card-bg-alt)'}}> {/* Potentially use a different bg or style */}
          <div className={styles.cardHeader}> {/* Re-using .cardHeader style for consistency */}
            <div>
              <h2 className={styles.cardTitle}>Quick Actions</h2> {/* Re-using .cardTitle style */}
            </div>
          </div>
          <div className={styles.cardContent}> {/* Re-using .cardContent style */}
            <div className={styles.cardsGrid}> {/* Nested grid for quick action cards */}
              <QuickActionCard
                title="Create New Material"
                linkHref="/dashboard/generation-hub/material"
                linkText="Start Now"
                // animationDelay={0} // Animation handled by parent AnimatedElement or can be staggered
              />
              <QuickActionCard
                title="Generate Exam"
                linkHref="/dashboard/generation-hub/exam"
                linkText="Start Now"
                // animationDelay={0.1} // Stagger if desired
              />
              <QuickActionCard
                title="Add New Student"
                linkHref="/dashboard/students/add" // Assuming this link, adjust if needed
                linkText="Start Now"
                // animationDelay={0.2} // Stagger if desired
              />
            </div>
          </div>
        </div>
      </AnimatedElement>
    </div>
  );
}
