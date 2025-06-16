'use client';

import React from 'react';
import AnimatedElement from '../AnimatedElement/AnimatedElement';

interface AnimatedSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
  animation?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'none';
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  id,
  className = '',
  staggerChildren = false,
  staggerDelay = 0.1,
  animation = 'up',
}) => {
  // If staggerChildren is true, we'll add a delay to each child
  if (staggerChildren && React.Children.count(children) > 0) {
    return (
      <section id={id} className={className}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          
          return (
            <AnimatedElement 
              animation={animation} 
              delay={index * staggerDelay}
              key={index}
            >
              {child}
            </AnimatedElement>
          );
        })}
      </section>
    );
  }

  // If not staggering, just wrap the entire section
  return (
    <AnimatedElement animation={animation}>
      <section id={id} className={className}>
        {children}
      </section>
    </AnimatedElement>
  );
};

export default AnimatedSection;