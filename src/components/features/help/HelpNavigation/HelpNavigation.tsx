'use client';

import React, { useState } from 'react';
import styles from './HelpNavigation.module.css';

export interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface HelpNavigationProps {
  categories: HelpCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const HelpNavigation: React.FC<HelpNavigationProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <nav className={styles.navigation}>
      {/* Mobile Toggle Button */}
      <button
        className={styles.mobileToggle}
        onClick={toggleMobileMenu}
        aria-label="Toggle help navigation menu"
      >
        <span className={styles.hamburger}></span>
        <span>Help Categories</span>
      </button>

      {/* Navigation Menu */}
      <div className={`${styles.menu} ${isMobileMenuOpen ? styles.menuOpen : ''}`}>
        <div className={styles.menuHeader}>
          <h3>Help Categories</h3>
          <button
            className={styles.closeButton}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        
        <ul className={styles.categoryList}>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                className={`${styles.categoryButton} ${
                  activeCategory === category.id ? styles.active : ''
                }`}
                onClick={() => handleCategoryClick(category.id)}
                aria-pressed={activeCategory === category.id}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryTitle}>{category.title}</span>
                  <span className={styles.categoryDescription}>
                    {category.description}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default HelpNavigation;