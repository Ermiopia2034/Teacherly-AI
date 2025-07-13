'use client';

import React, { useState } from 'react';
import HelpNavigation, { HelpCategory } from '@/components/features/help/HelpNavigation';
import FAQAccordion from '@/components/features/help/FAQAccordion';
import UserGuideDisplay from '@/components/features/help/UserGuideDisplay';
import HelpSearch, { SearchResult } from '@/components/features/help/HelpSearch';
import ContactInfo from '@/components/features/help/ContactInfo';
import styles from './help.module.css';

// Import help content
import faqsData from '@/content/help/faqs.json';

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    description: 'New to Teacherly AI? Start here for setup and basics.'
  },
  {
    id: 'grades-management',
    title: 'Grades Management',
    icon: '📊',
    description: 'Learn how to manage and track student grades effectively.'
  },
  {
    id: 'attendance',
    title: 'Attendance Tracking',
    icon: '📅',
    description: 'Track student attendance and generate reports.'
  },
  {
    id: 'grading',
    title: 'AI Grading System',
    icon: '🤖',
    description: 'Use AI to grade assignments and provide feedback.'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    description: 'Common issues and solutions to keep you running smoothly.'
  },
  {
    id: 'contact',
    title: 'Contact Support',
    icon: '💬',
    description: 'Get in touch with our support team for additional help.'
  }
];

// Guide content - in a real app, this would be loaded from markdown files
const guideContent: Record<string, string> = {
  'getting-started': `# Getting Started with Teacherly AI

Welcome to Teacherly AI! This guide will help you get up and running quickly with our platform.

## Initial Setup

### 1. Account Creation
- Create your account using your institutional email
- Verify your email address through the confirmation link
- Complete your profile setup with basic information

### 2. Profile Configuration
Navigate to **Settings > Profile** to:
- Add your full name and contact information
- Upload a profile picture (optional)
- Set your teaching preferences
- Configure notification settings

### 3. Security Settings
Ensure your account is secure by:
- Setting a strong password
- Enabling two-factor authentication (recommended)
- Reviewing login activity regularly

## Adding Your First Students

### Step 1: Navigate to Students Section
- Click on "Students" in the main navigation
- Select "Add New Student" button

### Step 2: Student Information
Fill in the required details:
- Student name
- Student ID/number
- Email address (if available)
- Grade level or class

### Step 3: Bulk Import (Optional)
For multiple students:
- Download the CSV template
- Fill in student information
- Upload the completed file

## Setting Up Your First Class

### Creating Grade Categories
1. Go to **Grades > Settings**
2. Create categories like:
   - Homework (30% weight)
   - Quizzes (20% weight)
   - Exams (40% weight)
   - Participation (10% weight)

### Attendance Setup
1. Navigate to **Attendance**
2. Set up your class schedule
3. Configure attendance policies

## Exploring AI Features

### Content Generation
- Visit **Generation Hub**
- Try creating exam questions
- Generate educational materials
- Customize content for your curriculum

### AI Grading
- Upload sample assignments
- Review grading accuracy
- Adjust rubrics as needed

## Tips for Success

- **Start Small**: Begin with one class or subject
- **Regular Updates**: Keep attendance and grades current
- **Explore Features**: Try new tools gradually
- **Backup Data**: Export important information regularly

## Next Steps

Once you've completed the initial setup:
1. Explore the **Reports** section for insights
2. Set up **Email Notifications** for parents
3. Customize your **Dashboard** layout
4. Join our **Community Forums** for tips and support

## Need Help?

- Check our **FAQ** section for common questions
- Contact support through the **Help** menu
- Watch video tutorials in our **Learning Center**
- Join teacher community discussions

---

*Remember: Take your time exploring the platform. Each feature is designed to make your teaching more efficient and effective.*`,

  'grades-management': `# Grades Management Guide

Master the grade management system to track student progress effectively and generate meaningful reports.

## Understanding Grade Categories

### Setting Up Categories
1. Navigate to **Grades > Settings**
2. Click **"Add Category"**
3. Define category properties:
   - Name (e.g., "Homework", "Exams")
   - Weight percentage
   - Grading scale
   - Drop lowest scores option

### Recommended Category Structure
- **Homework**: 30% (Drop 2 lowest)
- **Quizzes**: 20% (Drop 1 lowest)
- **Exams**: 40% (No drops)
- **Participation**: 10% (No drops)

## Adding Individual Grades

### Quick Entry Method
1. Go to **Grades > Add Grade**
2. Select student from dropdown
3. Choose category and assignment
4. Enter grade value
5. Add optional notes
6. Click **"Save"**

### Batch Grading
For multiple students on the same assignment:
1. Click **"Batch Grade"**
2. Select assignment details
3. Enter grades for all students
4. Review and submit

## Best Practices

### Grading Consistency
- Use clear rubrics
- Apply policies uniformly
- Document special circumstances
- Regular grade book reviews

### Timely Updates
- Enter grades within 48 hours
- Provide prompt feedback
- Update students regularly
- Maintain communication

---

*Remember: Consistent grading practices help students understand their progress and improve learning outcomes.*`,

  'attendance': `# Attendance Tracking Guide

Efficiently track and manage student attendance with our comprehensive attendance system.

## Quick Attendance Entry

### Daily Attendance
1. Navigate to **Attendance** section
2. Select current date (defaults to today)
3. Choose your class/section
4. Mark each student:
   - ✅ **Present**: Student is in class
   - ❌ **Absent**: Student is not present
   - 🕐 **Late**: Student arrived after start time
   - 🏠 **Excused**: Absent with valid reason

### Keyboard Shortcuts
Speed up entry with shortcuts:
- **P** = Present
- **A** = Absent
- **L** = Late
- **E** = Excused
- **Tab** = Move to next student

## Attendance Reports

### Standard Reports
Generate reports for:
- **Daily Summary**: Today's attendance overview
- **Weekly Report**: 7-day attendance pattern
- **Monthly Analysis**: Full month breakdown
- **Semester Summary**: Long-term trends

## Best Practices

### Daily Routine
- Take attendance at consistent times
- Review and correct immediately
- Add notes for context
- Communicate concerns promptly

### Weekly Review
- Analyze attendance patterns
- Follow up on chronic issues
- Update parent communications
- Coordinate with counselors

---

*Remember: Consistent attendance tracking is crucial for student success and regulatory compliance.*`,

  'grading': `# AI Grading System Guide

Learn how to leverage our advanced AI grading system to streamline assessment and provide consistent, fair grading.

## Understanding AI Grading

### What It Does
Our AI grading system can:
- **Analyze handwritten responses** with OCR technology
- **Grade multiple choice questions** automatically
- **Evaluate essay structure and content**
- **Provide detailed feedback** on submissions
- **Ensure consistent grading** across all students

### Supported Assignment Types
- Multiple choice tests
- Short answer questions
- Essay assignments
- Math problems with work shown
- Fill-in-the-blank exercises
- Diagram labeling

## Setting Up AI Grading

### Creating an Assessment
1. Navigate to **Grading > New Assessment**
2. Fill in assessment details:
   - Assessment name
   - Subject/course
   - Total points possible
   - Due date
   - Grading rubric

### Upload Methods
Choose your upload method:
- **Bulk Upload**: Multiple student submissions at once
- **Individual Upload**: One submission at a time
- **Batch Scanning**: Multiple pages per student
- **Photo Import**: Mobile device captures

## Best Practices

### Preparation
- **Clear instructions**: Provide specific formatting guidelines
- **Sample submissions**: Show students proper format
- **Practice runs**: Test system with sample work
- **Backup plans**: Have manual grading ready

### Implementation
- **Start gradually**: Begin with simple assignments
- **Monitor closely**: Review early results carefully
- **Adjust settings**: Fine-tune based on results
- **Communicate changes**: Keep students informed

---

*Remember: AI grading is a powerful tool that supplements, not replaces, thoughtful teacher assessment and feedback.*`
};

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  // Perform search across all help content
  const performSearch = (query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase().trim();

    // Search through FAQs
    Object.values(faqsData.categories).forEach((category) => {
      category.faqs.forEach((faq) => {
        const questionMatch = faq.question.toLowerCase().includes(searchTerm);
        const answerMatch = faq.answer.toLowerCase().includes(searchTerm);
        
        if (questionMatch || answerMatch) {
          results.push({
            id: `faq-${faq.id}`,
            title: faq.question,
            content: faq.answer,
            category: category.title,
            type: 'faq',
            matchedText: answerMatch ? 
              faq.answer.substring(0, 150) + '...' : 
              faq.question
          });
        }
      });
    });

    // Search through guides
    Object.entries(guideContent).forEach(([guideKey, content]) => {
      const categoryInfo = helpCategories.find(cat => cat.id === guideKey);
      if (!categoryInfo) return;

      if (content.toLowerCase().includes(searchTerm)) {
        // Find the specific section that matches
        const lines = content.split('\n');
        let matchedSection = '';
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(searchTerm)) {
            // Get context around the match
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 3);
            matchedSection = lines.slice(start, end).join('\n');
            break;
          }
        }

        results.push({
          id: `guide-${guideKey}`,
          title: categoryInfo.title,
          content: content,
          category: 'User Guides',
          type: 'guide',
          matchedText: matchedSection.substring(0, 200) + '...'
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = performSearch(query);
    return results;
  };

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.type === 'faq') {
      // Find the category containing this FAQ
      const foundCategoryKey = Object.keys(faqsData.categories).find(key =>
        faqsData.categories[key as keyof typeof faqsData.categories].faqs.some(faq => faq.id === result.id.replace('faq-', ''))
      );
      if (foundCategoryKey) {
        setActiveCategory(foundCategoryKey);
      }
    } else if (result.type === 'guide') {
      const guideKey = result.id.replace('guide-', '');
      setActiveCategory(guideKey);
    }
    setSearchQuery('');
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'contact':
        return <ContactInfo />;
      
      case 'getting-started':
      case 'grades-management':
      case 'attendance':
      case 'grading':
        const guideData = guideContent[activeCategory];
        const categoryInfo = helpCategories.find(cat => cat.id === activeCategory);
        
        if (guideData && categoryInfo) {
          return (
            <UserGuideDisplay
              title={categoryInfo.title}
              content={guideData}
              showTableOfContents={true}
              showPrintButton={true}
            />
          );
        }
        return <div>Guide content not found</div>;
      
      default:
        // Show FAQs for the category
        const categoryData = faqsData.categories[activeCategory as keyof typeof faqsData.categories];
        if (categoryData) {
          return (
            <div className={styles.faqSection}>
              <div className={styles.faqHeader}>
                <h2>{categoryData.title}</h2>
                <p>Frequently asked questions about {categoryData.title.toLowerCase()}</p>
              </div>
              <FAQAccordion 
                faqs={categoryData.faqs}
                searchTerm={searchQuery}
              />
            </div>
          );
        }
        return <div>Category not found</div>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Help & Support</h1>
        <p className={styles.subtitle}>
          Find answers to your questions and learn how to make the most of Teacherly AI
        </p>
        
        <div className={styles.searchContainer}>
          <HelpSearch
            onSearch={handleSearch}
            onResultClick={handleSearchResultClick}
            placeholder="Search help articles, FAQs, and guides..."
          />
        </div>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <HelpNavigation
            categories={helpCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </aside>

        <main className={styles.mainContent}>
          {renderContent()}
        </main>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <h3>Still need help?</h3>
          <p>
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className={styles.footerActions}>
            <button 
              className={styles.contactButton}
              onClick={() => setActiveCategory('contact')}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}