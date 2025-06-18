import styles from "./page.module.css";
import Link from "next/link";
import Button from "@/components/ui/Button";
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
          <Link href="/auth?mode=login">
            <Button variant="link">Sign In</Button>
          </Link>
          <Link href="/auth?mode=signup">
            <Button>Join</Button>
          </Link>
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
