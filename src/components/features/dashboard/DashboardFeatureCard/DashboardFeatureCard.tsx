import React from 'react';
import Link from 'next/link';
import styles from './DashboardFeatureCard.module.css';
import AnimatedElement from '@/components/AnimatedElement'; // Assuming AnimatedElement is in components root

interface DashboardFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  mainContent: string;
  linkHref: string;
  linkText: string;
  animationDelay?: number;
  pulseIcon?: boolean;
}

const DashboardFeatureCard: React.FC<DashboardFeatureCardProps> = ({
  title,
  description,
  icon,
  mainContent,
  linkHref,
  linkText,
  animationDelay = 0,
  pulseIcon = false,
}) => {
  return (
    <AnimatedElement animation="up" delay={animationDelay}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>{title}</h2>
            <p>{description}</p>
          </div>
          <div className={`${styles.cardIcon} ${pulseIcon ? styles.pulse : ''}`}>
            {icon}
          </div>
        </div>
        <div className={styles.cardContent}>
          <p>{mainContent}</p>
        </div>
        <div className={styles.cardFooter}>
          <Link href={linkHref} className={styles.cardLink}>
            {linkText}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </AnimatedElement>
  );
};

export default DashboardFeatureCard;