'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './AnimatedElement.module.css';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'none';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: AnimationDirection;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  animation = 'up',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is in view
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  // Define animation styles based on direction
  const getAnimationClass = () => {
    switch (animation) {
      case 'up':
        return styles.slideUp;
      case 'down':
        return styles.slideDown;
      case 'left':
        return styles.slideLeft;
      case 'right':
        return styles.slideRight;
      case 'fade':
        return styles.fade;
      case 'scale':
        return styles.scale;
      case 'none':
        return '';
      default:
        return styles.slideUp;
    }
  };

  const style = {
    opacity: 0,
    transform: animation === 'none' ? 'none' : getInitialTransform(animation),
    transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
    transitionDelay: `${delay}s`,
    ...(isVisible && {
      opacity: 1,
      transform: 'translate3d(0, 0, 0) scale(1)',
    }),
  };

  return (
    <div
      ref={elementRef}
      className={`${styles.animatedElement} ${className} ${isVisible ? styles.isVisible : ''} ${getAnimationClass()}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Helper function to get initial transform based on animation direction
function getInitialTransform(animation: AnimationDirection): string {
  switch (animation) {
    case 'up':
      return 'translate3d(0, 50px, 0)';
    case 'down':
      return 'translate3d(0, -50px, 0)';
    case 'left':
      return 'translate3d(50px, 0, 0)';
    case 'right':
      return 'translate3d(-50px, 0, 0)';
    case 'scale':
      return 'scale(0.8)';
    case 'fade':
    default:
      return 'translate3d(0, 0, 0)';
  }
}

export default AnimatedElement;