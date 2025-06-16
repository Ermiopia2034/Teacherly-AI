import Image from "next/image";
import styles from "./HeroSection.module.css";
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
          <a href="/auth?mode=signup" className="btn btn-primary hero-btn">
            Start
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
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
          <div className="stat-value">120</div>
          <div className="stat-label">courses</div>
        </div>
        <div className={styles.statItem}>
          <div className="stat-value">285</div>
          <div className="stat-label">happy users</div>
        </div>
        <div className={styles.statItem}>
          <div className="stat-value">24.7</div>
          <div className="stat-label">hours</div>
        </div>
        <div className={styles.statItem}>
          <div className="stat-value">10</div>
          <div className="stat-label">countries</div>
        </div>
      </div>

      <ScrollDownButton targetId="services" />
    </section>
  );
};

export default HeroSection;