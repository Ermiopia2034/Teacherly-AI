import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";
import AnimatedSection from "@/components/common/AnimatedSection/AnimatedSection";
import styles from "./ServicesSection.module.css";

const ServicesSection = () => {
  return (
    <AnimatedSection id="services" className={styles.servicesSection} animation="up">
      <div className="container">
        <AnimatedElement animation="fade" delay={0.2}>
          <h2 className={styles.sectionTitle}>Our<br />Services</h2>
        </AnimatedElement>

        <div className={styles.servicesGrid}>
          <AnimatedElement animation="left" delay={0.4}>
            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>GENERATION HUB</h3>
                <p className={styles.serviceDescription}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibhed euismod tincidunt ut laoreet.</p>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="right" delay={0.6}>
            <div className={styles.serviceItem}>
              <div className={styles.serviceIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>GRADING SYSTEM</h3>
                <p className={styles.serviceDescription}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibhed euismod tincidunt ut laoreet.</p>
              </div>
            </div>
          </AnimatedElement>
        </div>

        <AnimatedElement animation="up" delay={0.8}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className="stat-value">120</div>
              <div className="stat-label">courses</div>
            </div>
            <div className={styles.statItem}>
              <div className="stat-value">285</div>
              <div className="stat-label">happy users</div>
            </div>
            <div className={styles.statItem}>
              <div className="stat-value">10</div>
              <div className="stat-label">countries</div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AnimatedSection>
  );
};

export default ServicesSection;