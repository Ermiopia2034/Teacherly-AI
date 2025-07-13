'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './HelpSearch.module.css';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'faq' | 'guide' | 'section';
  matchedText?: string;
}

interface HelpSearchProps {
  onSearch: (query: string) => SearchResult[];
  onResultClick: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const HelpSearch: React.FC<HelpSearchProps> = ({
  onSearch,
  onResultClick,
  placeholder = "Search help articles, FAQs, and guides...",
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('teacherly-help-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('teacherly-help-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const searchResults = onSearch(query.trim());
          setResults(searchResults);
          setIsOpen(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    saveRecentSearch(query);
    onResultClick(result);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  }, [query, onResultClick, saveRecentSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (query.trim().length >= 2 && results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('teacherly-help-recent-searches');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'faq': return '❓';
      case 'guide': return '📖';
      case 'section': return '📄';
      default: return '📝';
    }
  };

  return (
    <div className={`${styles.container} ${className}`} ref={searchRef}>
      <div className={styles.inputContainer}>
        <div className={styles.searchIcon}>🔍</div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={styles.input}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {query && (
          <button
            onClick={clearSearch}
            className={styles.clearButton}
            aria-label="Clear search"
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdown} ref={resultsRef} role="listbox" id="search-results">
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className={styles.resultsHeader}>
                <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
              </div>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  className={`${styles.resultItem} ${
                    index === selectedIndex ? styles.selected : ''
                  }`}
                  onClick={() => handleResultClick(result)}
                  role="option"
                  aria-selected={index === selectedIndex}
                  type="button"
                >
                  <div className={styles.resultIcon}>
                    {getResultIcon(result.type)}
                  </div>
                  <div className={styles.resultContent}>
                    <div 
                      className={styles.resultTitle}
                      dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(result.title, query) 
                      }}
                    />
                    <div className={styles.resultMeta}>
                      <span className={styles.resultCategory}>{result.category}</span>
                      <span className={styles.resultType}>{result.type}</span>
                    </div>
                    {result.matchedText && (
                      <div 
                        className={styles.resultSnippet}
                        dangerouslySetInnerHTML={{ 
                          __html: highlightMatch(result.matchedText, query) 
                        }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </>
          ) : query.trim().length >= 2 ? (
            <div className={styles.noResults}>
              <p>No results found for &quot;{query}&quot;</p>
              <p className={styles.noResultsSubtext}>
                Try different keywords or browse our help categories
              </p>
            </div>
          ) : (
            recentSearches.length > 0 && (
              <div className={styles.recentSearches}>
                <div className={styles.recentHeader}>
                  <span>Recent Searches</span>
                  <button
                    onClick={clearRecentSearches}
                    className={styles.clearRecent}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((searchTerm, index) => (
                  <button
                    key={index}
                    className={styles.recentItem}
                    onClick={() => handleRecentSearchClick(searchTerm)}
                    type="button"
                  >
                    <span className={styles.recentIcon}>🕐</span>
                    <span className={styles.recentText}>{searchTerm}</span>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default HelpSearch;