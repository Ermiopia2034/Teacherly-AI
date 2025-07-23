import Link from "next/link";
import styles from "./HeroSection.module.css";
import Button from "@/components/ui/Button/Button";
import ScrollDownButton from "@/components/ui/ScrollDownButton/ScrollDownButton";

const HeroSection = () => {
  return (
    <section className={styles.heroSection} id="hero">
      <div className={styles.heroBackground}>
        <div className={styles.gradientOverlay}></div>
        <div className={styles.animatedShapes}>
          <div className={styles.shape1}></div>
          <div className={styles.shape2}></div>
          <div className={styles.shape3}></div>
        </div>
      </div>
      
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <div className={styles.badgeContainer}>
            <span className={styles.badge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              AI-Powered Education Platform
            </span>
          </div>
          
          <h1 className={styles.heroTitle}>
            Transform Teaching with
            <span className={styles.gradientText}> Intelligent AI</span>
            <br />
            <span className={styles.titleEmphasis}>Grading & Analytics</span>
          </h1>
          
          <p className={styles.heroDescription}>
            Empower educators with advanced AI technology for automated grading, content generation, 
            and comprehensive student analytics. Reduce administrative workload by 70% while 
            improving learning outcomes.
          </p>
          
          <div className={styles.heroActions}>
            <Link href="/auth?mode=signup">
              <Button
                size="lg"
                iconRight={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                }
              >
                Start Free Trial
              </Button>
            </Link>
            
            <Link href="#demo">
              <Button variant="outline" size="lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Watch Demo
              </Button>
            </Link>
          </div>
          
          <div className={styles.trustIndicators}>
            <span className={styles.trustText}>Trusted by 10,000+ educators worldwide</span>
            <div className={styles.securityBadges}>
              <span className={styles.securityBadge}>SOC 2 Compliant</span>
              <span className={styles.securityBadge}>FERPA Certified</span>
              <span className={styles.securityBadge}>GDPR Ready</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.dashboardPreview}>
            <div className={styles.previewHeader}>
              <div className={styles.previewControls}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
              <span className={styles.previewTitle}>Teacherly AI Dashboard</span>
            </div>
            
            <div className={styles.previewContent}>
              <div className={styles.previewStats}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
                      <rect x="9" y="7" width="6" height="6"/>
                    </svg>
                  </div>
                  <div className={styles.statValue}>2,847</div>
                  <div className={styles.statLabel}>Assignments Graded</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className={styles.statValue}>97.3%</div>
                  <div className={styles.statLabel}>Grading Accuracy</div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20m8-18H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                    </svg>
                  </div>
                  <div className={styles.statValue}>18hrs</div>
                  <div className={styles.statLabel}>Time Saved Weekly</div>
                </div>
              </div>
              
              <div className={styles.previewChart}>
                <div className={styles.chartBars}>
                  <div className={styles.chartBar} style={{height: '60%'}}></div>
                  <div className={styles.chartBar} style={{height: '80%'}}></div>
                  <div className={styles.chartBar} style={{height: '45%'}}></div>
                  <div className={styles.chartBar} style={{height: '90%'}}></div>
                  <div className={styles.chartBar} style={{height: '75%'}}></div>
                  <div className={styles.chartBar} style={{height: '95%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.floatingElements}>
            <div className={styles.floatingCard}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>AI Processing...</span>
            </div>
            
            <div className={styles.floatingCard}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>Graded Successfully</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.scrollContainer}>
        <ScrollDownButton targetId="features" />
      </div>
    </section>
  );
};

export default HeroSection;