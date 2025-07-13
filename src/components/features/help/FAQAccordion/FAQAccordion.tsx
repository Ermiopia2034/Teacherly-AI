'use client';

import React, { useState } from 'react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer/MarkdownRenderer';
import styles from './FAQAccordion.module.css';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  searchTerm?: string;
  className?: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({
  faqs,
  searchTerm = '',
  className = '',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const filteredFAQs = faqs.filter(faq => 
    !searchTerm || 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expandAll = () => {
    setExpandedItems(new Set(filteredFAQs.map(faq => faq.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  if (filteredFAQs.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.noResults}>
          <p>No FAQs found matching &quot;{searchTerm}&quot;</p>
          <p className={styles.noResultsSubtext}>
            Try adjusting your search terms or browse all categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {filteredFAQs.length > 1 && (
        <div className={styles.controls}>
          <button
            onClick={expandAll}
            className={`${styles.controlButton} ${styles.expandButton}`}
            type="button"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className={`${styles.controlButton} ${styles.collapseButton}`}
            type="button"
          >
            Collapse All
          </button>
        </div>
      )}

      <div className={styles.accordion} role="list">
        {filteredFAQs.map((faq) => {
          const isExpanded = expandedItems.has(faq.id);
          const highlightedQuestion = highlightText(faq.question, searchTerm);
          const highlightedAnswer = highlightText(faq.answer, searchTerm);

          return (
            <div
              key={faq.id}
              className={`${styles.item} ${isExpanded ? styles.expanded : ''}`}
              role="listitem"
            >
              <button
                className={styles.trigger}
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isExpanded}
                aria-controls={`faq-content-${faq.id}`}
                id={`faq-trigger-${faq.id}`}
                type="button"
              >
                <span 
                  className={styles.question}
                  dangerouslySetInnerHTML={{ __html: highlightedQuestion }}
                />
                <span className={styles.icon} aria-hidden="true">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>
              
              <div
                id={`faq-content-${faq.id}`}
                className={styles.content}
                role="region"
                aria-labelledby={`faq-trigger-${faq.id}`}
                aria-hidden={!isExpanded}
              >
                <div className={styles.answer}>
                  {searchTerm ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: highlightedAnswer }}
                    />
                  ) : (
                    <MarkdownRenderer markdownContent={faq.answer} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {searchTerm && (
        <div className={styles.searchSummary}>
          Found {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''} 
          matching &quot;{searchTerm}&quot;
        </div>
      )}
    </div>
  );
};

export default FAQAccordion;