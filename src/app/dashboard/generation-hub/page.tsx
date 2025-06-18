import React from 'react';
import styles from '@/app/dashboard/dashboard.module.css';
import AnimatedElement from '@/components/AnimatedElement';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import DashboardFeatureCard from '@/components/features/dashboard/DashboardFeatureCard/DashboardFeatureCard';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb';
import FadeInContainer from '@/components/common/FadeInContainer/FadeInContainer';

export default function GenerationHub() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generation Hub', isCurrent: true },
  ];

  const materialIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  );

  const examIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  return (
    <FadeInContainer>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Generation Hub" />

      <div className={styles.cardsGrid}>
        <DashboardFeatureCard
          title="Generate material"
          description="Create new material, update existing materials."
          icon={materialIcon}
          mainContent="Use AI to generate various teaching materials for your classes."
          linkHref="/dashboard/generation-hub/material"
          linkText="Create Material"
          animationDelay={0.1}
          pulseIcon={true}
        />

        <DashboardFeatureCard
          title="Generate Exam"
          description="Quiz exams, mid exams, final exams."
          icon={examIcon}
          mainContent="Generate different types of exams tailored to your needs."
          linkHref="/dashboard/generation-hub/exam"
          linkText="Create Exam"
          animationDelay={0.2}
        />
      </div>

      <AnimatedElement animation="up" delay={0.3}>
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Recent Generations</h2>
            </div>
          </div>
          <div className={styles.cardContent}>
            <p>You haven't generated any content yet. Use the cards above to create your first teaching material or exam.</p>
          </div>
        </div>
      </AnimatedElement>
    </FadeInContainer>
  );
}
