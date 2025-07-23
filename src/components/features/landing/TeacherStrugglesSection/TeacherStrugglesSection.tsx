import Image from "next/image";
import styles from "./TeacherStrugglesSection.module.css";
import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";

const TeacherStrugglesSection = () => {
  return (
    <section className={styles.strugglesSection} id="problems">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <AnimatedElement animation="right" delay={0.2}>
              <div className={styles.imageWrapper}>
                <Image
                  src="/teacher.jpeg"
                  alt="Tired teacher overwhelmed with paperwork"
                  width={600}
                  height={400}
                  className={styles.teacherImage}
                  priority
                />
                <div className={styles.imageOverlay}>
                  <div className={styles.stressIndicator}>
                    <span className={styles.stressIcon}>😰</span>
                    <span className={styles.stressText}>Overwhelmed</span>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          </div>

          <div className={styles.textContent}>
            <AnimatedElement animation="left" delay={0.4}>
              <div className={styles.problemBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                The Reality Every Teacher Faces
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fade" delay={0.6}>
              <h2 className={styles.title}>
                <span className={styles.highlight}>Hours of Manual Grading.</span>
                <br />
                <span className={styles.subtitle}>Endless Paperwork.</span>
                <br />
                <span className={styles.emphasis}>Burnout is Real.</span>
              </h2>
            </AnimatedElement>

            <AnimatedElement animation="up" delay={0.8}>
              <p className={styles.description}>
                Teachers spend an average of <strong>70% of their time</strong> on administrative tasks 
                instead of what they love most - teaching and inspiring students. The endless cycle of 
                grading papers, generating content, and managing student data is burning out our educators.
              </p>
            </AnimatedElement>

            <AnimatedElement animation="scale" delay={1.0}>
              <div className={styles.painPoints}>
                <div className={styles.painPoint}>
                  <div className={styles.painIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className={styles.painContent}>
                    <span className={styles.painNumber}>18+ hrs/week</span>
                    <span className={styles.painText}>Spent on grading alone</span>
                  </div>
                </div>

                <div className={styles.painPoint}>
                  <div className={styles.painIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <div className={styles.painContent}>
                    <span className={styles.painNumber}>85%</span>
                    <span className={styles.painText}>Report feeling overwhelmed</span>
                  </div>
                </div>

                <div className={styles.painPoint}>
                  <div className={styles.painIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className={styles.painContent}>
                    <span className={styles.painNumber}>44%</span>
                    <span className={styles.painText}>Consider leaving the profession</span>
                  </div>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="up" delay={1.2}>
              <div className={styles.callToAction}>
                <p className={styles.ctaText}>
                  <strong>What if there was a better way?</strong>
                </p>
                <p className={styles.ctaSubtext}>
                  Imagine reclaiming those hours to focus on what truly matters - your students.
                </p>
              </div>
            </AnimatedElement>
          </div>
        </div>

        <AnimatedElement animation="fade" delay={1.4}>
          <div className={styles.transitionArrow}>
            <div className={styles.arrowContainer}>
              <span className={styles.arrowText}>Discover the Solution</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.arrowIcon}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default TeacherStrugglesSection;