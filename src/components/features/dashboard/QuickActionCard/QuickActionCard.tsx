import React from 'react';
import Link from 'next/link';
import styles from './QuickActionCard.module.css';
import AnimatedElement from '@/components/common/AnimatedElement/AnimatedElement';

interface QuickActionCardProps {
  title: string;
  linkHref: string;
  linkText: string;
  animationDelay?: number;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  linkHref,
  linkText,
  animationDelay = 0,
}) => {
  return (
    <AnimatedElement animation="up" delay={animationDelay}> {/* Or "fade" if preferred based on original page */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
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

export default QuickActionCard;