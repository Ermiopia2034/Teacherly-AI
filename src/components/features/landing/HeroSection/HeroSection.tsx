import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSection.module.css";
import Button from "@/components/ui/Button/Button";
import ScrollDownButton from "@/components/ui/ScrollDownButton/ScrollDownButton";

const HeroSection = () => {
  return (
    <section className={styles.heroSection} id="hero">
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Hello, Welcome<br />
          To AI Powered<br />
          Teaching<br />
          Toolkit
        </h1>
        <p className={styles.heroText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibhed euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
        </p>
        <div>
          <Link href="/auth?mode=signup">
            <Button
              iconRight={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              }
            >
              Start
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.heroImage}>
        <Image
          src="/teacher.jpeg"
          alt="Teacher working on computer"
          width={500}
          height={500}
          style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
          priority
        />
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>120</div>
          <div className={styles.statLabel}>courses</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>285</div>
          <div className={styles.statLabel}>happy users</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>24.7</div>
          <div className={styles.statLabel}>hours</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>10</div>
          <div className={styles.statLabel}>countries</div>
        </div>
      </div>

      <ScrollDownButton targetId="services" />
    </section>
  );
};

export default HeroSection;