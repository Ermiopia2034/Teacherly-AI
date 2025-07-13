'use client';

import React from 'react';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import styles from './ContactInfo.module.css';

export interface ContactMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: {
    type: 'email' | 'phone' | 'link' | 'form';
    value: string;
    label: string;
  };
  availability?: string;
  responseTime?: string;
}

interface ContactInfoProps {
  contactMethods?: ContactMethod[];
  showFeedbackForm?: boolean;
  className?: string;
}

const defaultContactMethods: ContactMethod[] = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Get help with your account, technical issues, or general questions.',
    icon: '📧',
    action: {
      type: 'email',
      value: 'support@teacherly-ai.com',
      label: 'Send Email'
    },
    availability: 'Available 24/7',
    responseTime: 'Response within 24 hours'
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Browse our comprehensive guides and tutorials.',
    icon: '📚',
    action: {
      type: 'link',
      value: '/help',
      label: 'View Documentation'
    },
    availability: 'Always available',
    responseTime: 'Instant access'
  },
  {
    id: 'community',
    title: 'Community Forum',
    description: 'Connect with other teachers and get peer support.',
    icon: '👥',
    action: {
      type: 'link',
      value: 'https://community.teacherly-ai.com',
      label: 'Join Community'
    },
    availability: 'Active community',
    responseTime: 'Community response times vary'
  },
  {
    id: 'live-chat',
    title: 'Live Chat',
    description: 'Chat with our support team in real-time.',
    icon: '💬',
    action: {
      type: 'form',
      value: 'chat',
      label: 'Start Chat'
    },
    availability: 'Mon-Fri, 9 AM - 6 PM EST',
    responseTime: 'Immediate response'
  }
];

const ContactInfo: React.FC<ContactInfoProps> = ({
  contactMethods = defaultContactMethods,
  showFeedbackForm = true,
  className = '',
}) => {
  const handleContactAction = (contactMethod: ContactMethod) => {
    const { action } = contactMethod;
    
    switch (action.type) {
      case 'email':
        window.open(`mailto:${action.value}?subject=Teacherly AI Support Request`, '_blank');
        break;
      case 'phone':
        window.open(`tel:${action.value}`, '_self');
        break;
      case 'link':
        if (action.value.startsWith('http')) {
          window.open(action.value, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = action.value;
        }
        break;
      case 'form':
        // Handle form actions (chat, feedback, etc.)
        handleFormAction(action.value);
        break;
      default:
        console.warn('Unsupported contact action type:', action.type);
    }
  };

  const handleFormAction = (formType: string) => {
    switch (formType) {
      case 'chat':
        // Initialize chat widget or open chat modal
        console.log('Opening chat...');
        // In a real implementation, this would open a chat widget
        alert('Chat feature coming soon! Please use email support for now.');
        break;
      case 'feedback':
        // Open feedback form
        console.log('Opening feedback form...');
        break;
      default:
        console.warn('Unsupported form type:', formType);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const feedback = {
      type: formData.get('type'),
      message: formData.get('message'),
      email: formData.get('email')
    };
    
    console.log('Feedback submitted:', feedback);
    // In a real implementation, this would send the feedback to your backend
    alert('Thank you for your feedback! We\'ll review it and get back to you if needed.');
    
    // Reset form
    e.currentTarget.reset();
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Contact & Support</h2>
        <p className={styles.description}>
          We&apos;re here to help! Choose the best way to get in touch with our support team.
        </p>
      </div>

      <div className={styles.contactMethods}>
        {contactMethods.map((method) => (
          <Card key={method.id} className={styles.contactCard}>
            <div className={styles.contactHeader}>
              <span className={styles.contactIcon}>{method.icon}</span>
              <div className={styles.contactTitleGroup}>
                <h3 className={styles.contactTitle}>{method.title}</h3>
                {method.availability && (
                  <span className={styles.availability}>{method.availability}</span>
                )}
              </div>
            </div>
            
            <p className={styles.contactDescription}>{method.description}</p>
            
            {method.responseTime && (
              <div className={styles.responseTime}>
                <span className={styles.responseTimeIcon}>⏱️</span>
                <span>{method.responseTime}</span>
              </div>
            )}
            
            <Button
              variant="primary"
              onClick={() => handleContactAction(method)}
              className={styles.contactButton}
            >
              {method.action.label}
            </Button>
          </Card>
        ))}
      </div>

      {showFeedbackForm && (
        <Card className={styles.feedbackCard}>
          <h3 className={styles.feedbackTitle}>Quick Feedback</h3>
          <p className={styles.feedbackDescription}>
            Have a suggestion or found an issue? Let us know!
          </p>
          
          <form onSubmit={handleFeedbackSubmit} className={styles.feedbackForm}>
            <div className={styles.formGroup}>
              <label htmlFor="feedback-type" className={styles.label}>
                Feedback Type
              </label>
              <select
                id="feedback-type"
                name="type"
                className={styles.select}
                required
              >
                <option value="">Select feedback type</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="general">General Feedback</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="feedback-message" className={styles.label}>
                Message
              </label>
              <textarea
                id="feedback-message"
                name="message"
                rows={4}
                className={styles.textarea}
                placeholder="Tell us about your experience, suggestion, or issue..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="feedback-email" className={styles.label}>
                Email (optional)
              </label>
              <input
                type="email"
                id="feedback-email"
                name="email"
                className={styles.input}
                placeholder="your@email.com"
              />
              <div className={styles.inputHint}>
                Only needed if you want us to follow up with you
              </div>
            </div>

            <Button type="submit" variant="primary" className={styles.submitButton}>
              Send Feedback
            </Button>
          </form>
        </Card>
      )}

      <div className={styles.additionalInfo}>
        <Card className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Before You Contact Us</h3>
          <ul className={styles.infoList}>
            <li>Check our <strong>FAQ section</strong> for quick answers</li>
            <li>Browse the <strong>User Guides</strong> for step-by-step instructions</li>
            <li>Try clearing your browser cache and cookies</li>
            <li>Make sure you&apos;re using a supported browser version</li>
          </ul>
        </Card>

        <Card className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Emergency Support</h3>
          <p className={styles.emergencyText}>
            For critical issues affecting your teaching or student data, 
            please email us immediately at <strong>urgent@teacherly-ai.com</strong> 
            with &quot;URGENT&quot; in the subject line.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ContactInfo;