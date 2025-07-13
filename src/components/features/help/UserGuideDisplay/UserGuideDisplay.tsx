'use client';

import React, { useState, useEffect } from 'react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer/MarkdownRenderer';
import Button from '@/components/ui/Button/Button';
import styles from './UserGuideDisplay.module.css';

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  level: number; // For heading levels (1-6)
}

interface UserGuideDisplayProps {
  title: string;
  content: string;
  className?: string;
  showTableOfContents?: boolean;
  showPrintButton?: boolean;
}

const UserGuideDisplay: React.FC<UserGuideDisplayProps> = ({
  title,
  content,
  className = '',
  showTableOfContents = true,
  showPrintButton = true,
}) => {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Parse markdown content to extract sections
    const parseContent = () => {
      const lines = content.split('\n');
      const parsedSections: GuideSection[] = [];
      let currentSection: GuideSection | null = null;
      let currentContent: string[] = [];

      const saveCurrentSection = () => {
        if (currentSection) {
          const sectionWithContent: GuideSection = {
            id: currentSection.id,
            title: currentSection.title,
            level: currentSection.level,
            content: currentContent.join('\n').trim()
          };
          parsedSections.push(sectionWithContent);
        }
      };

      lines.forEach((line) => {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        
        if (headingMatch) {
          // Save previous section if exists
          saveCurrentSection();

          // Start new section
          const level = headingMatch[1].length;
          const sectionTitle = headingMatch[2];
          const sectionId = sectionTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');

          currentSection = {
            id: sectionId,
            title: sectionTitle,
            content: '',
            level,
          };
          currentContent = [];
        } else {
          currentContent.push(line);
        }
      });

      // Add last section
      saveCurrentSection();

      setSections(parsedSections);
      setIsLoading(false);
    };

    parseContent();
  }, [content]);

  useEffect(() => {
    // Set up intersection observer for active section tracking
    const observerOptions = {
      rootMargin: '-20% 0px -35% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all section headings
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const processContentForDisplay = (content: string) => {
    // Add IDs to headings for navigation
    return content.replace(
      /^(#{1,6})\s+(.+)$/gm,
      (match, hashes, title) => {
        const id = title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-');
        return `${hashes} <span id="${id}">${title}</span>`;
      }
    );
  };

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {showPrintButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            iconLeft="🖨️"
            className={styles.printButton}
          >
            Print Guide
          </Button>
        )}
      </div>

      <div className={styles.layout}>
        {showTableOfContents && sections.length > 1 && (
          <nav className={styles.tableOfContents}>
            <h3 className={styles.tocTitle}>Table of Contents</h3>
            <ul className={styles.tocList}>
              {sections.map((section) => (
                <li key={section.id} className={styles.tocItem}>
                  <button
                    className={`${styles.tocLink} ${
                      activeSection === section.id ? styles.tocActive : ''
                    } ${styles[`tocLevel${section.level}`]}`}
                    onClick={() => scrollToSection(section.id)}
                    type="button"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <main className={styles.content}>
          <article className={styles.guide}>
            <MarkdownRenderer 
              markdownContent={processContentForDisplay(content)} 
            />
          </article>

          {sections.length > 0 && (
            <nav className={styles.pagination}>
              <div className={styles.paginationContent}>
                <p className={styles.progressText}>
                  {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length} sections
                </p>
                <div className={styles.paginationButtons}>
                  {sections.map((section, index) => {
                    const prevSection = sections[index - 1];
                    const nextSection = sections[index + 1];
                    
                    if (section.id !== activeSection) return null;
                    
                    return (
                      <div key={section.id} className={styles.navigationButtons}>
                        {prevSection && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => scrollToSection(prevSection.id)}
                            iconLeft="←"
                          >
                            {prevSection.title}
                          </Button>
                        )}
                        {nextSection && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => scrollToSection(nextSection.id)}
                            iconRight="→"
                          >
                            {nextSection.title}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserGuideDisplay;