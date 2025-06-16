import styles from "./page.module.css";
import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";
import HeroSection from "@/components/features/landing/HeroSection";
import ServicesSection from "@/components/features/landing/ServicesSection";
import TestimonialsSection from "@/components/features/landing/TestimonialsSection";
import Footer from "@/components/features/landing/Footer";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>Teacherly</div>
        <div className={styles.signIn}>
          <a href="/auth?mode=login" className={styles.signInLink}>Sign in</a> |
          <a href="/auth?mode=signup" className={styles.ctaButton}>Join</a>
        </div>
      </header>

      <HeroSection />

      <AnimatedElement animation="scale" delay={0.3}>
        <div className={styles.instructorsText}>Over 120+ Instructors</div>
      </AnimatedElement>

      <ServicesSection />

      <TestimonialsSection />

      <Footer />
    </div>
  );
}
