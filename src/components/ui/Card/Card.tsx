import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  headerActions,
  footerContent,
  children,
  className,
}) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      {(title || description || headerActions) && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
      {footerContent && <div className={styles.footer}>{footerContent}</div>}
    </div>
  );
};

export default Card;