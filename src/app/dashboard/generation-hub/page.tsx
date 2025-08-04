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
      <PageHeader 
        title="Generation Hub" 
        subtitle="AI-powered content creation for intelligent teaching materials and assessments"
      />

      <div className={styles.enterpriseHub}>
        {/* Quick Launch Section */}
        <section className={styles.launchSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Content Creation</h2>
            <div className={styles.aiStatus}>
              <div className={styles.aiIndicator}>
                <span className={styles.aiDot}></span>
                <span>AI Ready</span>
              </div>
            </div>
          </div>
          
          <div className={styles.creationGrid}>
            <DashboardFeatureCard
              title="Teaching Materials"
              description="Comprehensive content generation"
              icon={materialIcon}
              mainContent="Create intelligent lesson plans, worksheets, presentations, and study guides with AI assistance."
              linkHref="/dashboard/generation-hub/material"
              linkText="Create Material"
              animationDelay={0.1}
              pulseIcon={true}
            />

            <DashboardFeatureCard
              title="Assessment Creation"
              description="Smart examination builder"
              icon={examIcon}
              mainContent="Generate adaptive quizzes, comprehensive exams, and assessment rubrics tailored to your curriculum."
              linkHref="/dashboard/generation-hub/exam"
              linkText="Create Assessment"
              animationDelay={0.2}
            />
          </div>
        </section>

        {/* Workflow & History Section */}
        <section className={styles.workflowSection}>
          <div className={styles.dualPane}>
            {/* Quick Templates */}
            <AnimatedElement animation="fade" delay={0.3}>
              <div className={styles.templatePanel}>
                <div className={styles.panelHeader}>
                  <h3>Quick Templates</h3>
                  <span className={styles.templateBadge}>Popular</span>
                </div>
                <div className={styles.templateGrid}>
                  <div className={styles.templateCard}>
                    <div className={styles.templateIcon}>📝</div>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>Lesson Plan</span>
                      <span className={styles.templateDesc}>Structured format</span>
                    </div>
                  </div>
                  <div className={styles.templateCard}>
                    <div className={styles.templateIcon}>📊</div>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>Quiz Template</span>
                      <span className={styles.templateDesc}>Multiple choice</span>
                    </div>
                  </div>
                  <div className={styles.templateCard}>
                    <div className={styles.templateIcon}>📋</div>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>Assignment</span>
                      <span className={styles.templateDesc}>Custom rubric</span>
                    </div>
                  </div>
                  <div className={styles.templateCard}>
                    <div className={styles.templateIcon}>🎯</div>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>Study Guide</span>
                      <span className={styles.templateDesc}>Comprehensive</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>

            {/* Recent Activity */}
            <AnimatedElement animation="fade" delay={0.4}>
              <div className={styles.historyPanel}>
                <div className={styles.panelHeader}>
                  <h3>Generation History</h3>
                  <button className={styles.viewAllBtn}>View All</button>
                </div>
                <div className={styles.historyContent}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🚀</div>
                    <div className={styles.emptyText}>
                      <h4>Ready to Generate</h4>
                      <p>Start creating your first intelligent teaching content. Your generation history will appear here.</p>
                    </div>
                    <div className={styles.emptyActions}>
                      <button className={styles.primaryAction}>Create Material</button>
                      <button className={styles.secondaryAction}>Build Assessment</button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </section>
      </div>
    </FadeInContainer>
  );
}
