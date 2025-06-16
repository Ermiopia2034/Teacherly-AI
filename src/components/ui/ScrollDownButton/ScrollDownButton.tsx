'use client';

import React from 'react';
import styles from './ScrollDownButton.module.css';

interface ScrollDownButtonProps {
  targetId: string;
}

const ScrollDownButton: React.FC<ScrollDownButtonProps> = ({ targetId }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Enhanced smooth scrolling with better easing
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 1000; // Longer duration for smoother scroll
      let startTime: number | null = null;

      function animation(currentTime: number) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function: easeInOutQuad for smoother acceleration/deceleration
        const easeInOutQuad = (t: number) => {
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        };

        window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }

      requestAnimationFrame(animation);
    }
  };

  return (
    <a href={`#${targetId}`} className={styles.scrollDown} onClick={handleClick}>
      <span className={styles.scrollDownText}>Scroll Down</span>
      <div className={styles.scrollDownArrow}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </a>
  );
};

export default ScrollDownButton;