import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";
import AnimatedSection from "@/components/common/AnimatedSection/AnimatedSection";
import styles from "./TestimonialsSection.module.css";

const TestimonialsSection = () => {
  return (
    <AnimatedSection className={styles.testimonialSection} animation="fade">
      <div className="container">
        <AnimatedElement animation="up" delay={0.2}>
          <h2 className={styles.sectionTitle}>Testimonials</h2>
        </AnimatedElement>

        <div className={styles.testimonialGrid}>
          <AnimatedElement animation="left" delay={0.4}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.testimonialAvatar}></div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialName}>Josh Broline</div>
                  <div className={styles.testimonialRole}>English Teacher</div>
                </div>
              </div>
              <p className={styles.testimonialContent}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibhed euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="right" delay={0.6}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.testimonialAvatar}></div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialName}>Mike Portnoy</div>
                  <div className={styles.testimonialRole}>Science Teacher</div>
                </div>
              </div>
              <p className={styles.testimonialContent}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibhed euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci.
              </p>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default TestimonialsSection;