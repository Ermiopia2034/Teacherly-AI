import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";
import AnimatedSection from "@/components/common/AnimatedSection/AnimatedSection";
import styles from "./ServicesSection.module.css";

const ServicesSection = () => {
  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
          <rect x="9" y="7" width="6" height="6"/>
        </svg>
      ),
      title: "AI-Powered Grading",
      description: "Advanced OCR and NLP technology automatically grades handwritten assignments, essays, and multiple-choice tests with 97.3% accuracy.",
      features: ["Handwriting Recognition", "Essay Analysis", "Instant Feedback", "Confidence Scoring"],
      badge: "NEW",
      gradientColor: "var(--gradient-primary)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      title: "Content Generation Hub",
      description: "Generate high-quality exams, quizzes, worksheets, and educational materials tailored to your curriculum using AI.",
      features: ["Custom Exams", "Quiz Creation", "Material Design", "Curriculum Alignment"],
      badge: "POPULAR",
      gradientColor: "var(--gradient-secondary)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      ),
      title: "Smart Grade Management",
      description: "Comprehensive grade tracking with standards-based assessment, rubric integration, and automatic calculations.",
      features: ["Standards Tracking", "Rubric Integration", "Auto Calculations", "Progress Analytics"],
      gradientColor: "linear-gradient(135deg, #00a0ff 0%, #00c896 100%)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      title: "Advanced Attendance",
      description: "Intelligent attendance tracking with pattern recognition, intervention alerts, and automated parent notifications.",
      features: ["Pattern Recognition", "Intervention Alerts", "Parent Notifications", "Trend Analysis"],
      gradientColor: "linear-gradient(135deg, #7928ca 0%, #ff0080 100%)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
        </svg>
      ),
      title: "Analytics & Insights",
      description: "Comprehensive reporting and analytics to track student progress, identify learning gaps, and optimize teaching strategies.",
      features: ["Performance Tracking", "Learning Analytics", "Custom Reports", "Predictive Insights"],
      gradientColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: "Student Management",
      description: "Efficiently manage student information, bulk import capabilities, and comprehensive student profiles with progress tracking.",
      features: ["Bulk Import", "Profile Management", "Progress Tracking", "Communication Tools"],
      gradientColor: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
    }
  ];

  const stats = [
    {
      value: "10,000+",
      label: "Active Teachers",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      value: "2.8M+",
      label: "Assignments Graded",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
          <rect x="9" y="7" width="6" height="6"/>
        </svg>
      )
    },
    {
      value: "70%",
      label: "Time Reduction",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      )
    },
    {
      value: "97.3%",
      label: "Grading Accuracy",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      )
    }
  ];

  return (
    <AnimatedSection id="features" className={styles.featuresSection} animation="up">
      <div className="container">
        <AnimatedElement animation="fade" delay={0.2}>
          <div className={styles.sectionHeader}>
            <div className={styles.badge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Core Features
            </div>
            <h2 className={styles.sectionTitle}>
              Powerful AI Features for
              <span className={styles.gradientText}> Modern Educators</span>
            </h2>
            <p className={styles.sectionDescription}>
              Transform your teaching experience with our comprehensive suite of AI-powered tools 
              designed to streamline grading, enhance student engagement, and provide actionable insights.
            </p>
          </div>
        </AnimatedElement>

        <div className={styles.featuresTimeline}>
          <div className={styles.timelineLine}></div>
          {features.map((feature, index) => (
            <AnimatedElement
              key={index}
              animation={index % 2 === 0 ? "left" : "right"}
              delay={0.4 + (index * 0.15)}
            >
              <div className={`${styles.timelineItem} ${index % 2 === 0 ? styles.timelineLeft : styles.timelineRight}`}>
                <div className={styles.timelineConnector}>
                  <div className={styles.timelineIcon} style={{background: feature.gradientColor}}>
                    {feature.icon}
                  </div>
                </div>
                
                <div className={styles.featureCard}>
                  {feature.badge && (
                    <span className={`${styles.featureBadge} ${styles[feature.badge.toLowerCase()]}`}>
                      {feature.badge}
                    </span>
                  )}
                  
                  <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                    
                    <ul className={styles.featureList}>
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className={styles.featureItem}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.featureFooter}>
                    <button className={styles.learnMoreBtn}>
                      Learn More
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement animation="scale" delay={0.8}>
          <div className={styles.statsContainer}>
            <div className={styles.statsHeader}>
              <h3 className={styles.statsTitle}>Trusted by Educators Worldwide</h3>
              <p className={styles.statsSubtitle}>Join thousands of teachers who have transformed their workflow</p>
            </div>
            
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <div className={styles.statIcon}>
                    {stat.icon}
                  </div>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="up" delay={1.0}>
          <div className={styles.ctaSection}>
            <div className={styles.ctaContent}>
              <h3 className={styles.ctaTitle}>Ready to Transform Your Teaching?</h3>
              <p className={styles.ctaDescription}>
                Join thousands of educators using AI to reduce grading time by 70% while improving student outcomes.
              </p>
              <div className={styles.ctaActions}>
                <button className={styles.ctaPrimary}>
                  Start Free Trial
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
                <button className={styles.ctaSecondary}>
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AnimatedSection>
  );
};

export default ServicesSection;