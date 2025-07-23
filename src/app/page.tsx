import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
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
        <Link href="/" className={styles.logoContainer}>
          <Image
            src="/logo.png"
            alt="Teacherly AI"
            width={40}
            height={40}
            className={styles.logoImage}
            priority
          />
          <span className={styles.logoText}>Teacherly AI</span>
        </Link>
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
