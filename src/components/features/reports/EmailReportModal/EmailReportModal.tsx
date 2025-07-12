'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  emailReportThunk,
  selectEmailSending,
  selectEmailResult,
  selectReportsError,
  clearEmailResult
} from '@/lib/features/reports/reportsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledTextarea from '@/components/ui/LabeledTextarea/LabeledTextarea';
import Card from '@/components/ui/Card/Card';
import { ReportResponse } from '@/lib/api/reports';
import styles from './EmailReportModal.module.css';

interface EmailReportModalProps {
  isOpen: boolean;
  report: ReportResponse | null;
  onClose: () => void;
}

export function EmailReportModal({ isOpen, report, onClose }: EmailReportModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isEmailSending = useSelector(selectEmailSending);
  const emailResult = useSelector(selectEmailResult);
  const error = useSelector(selectReportsError);

  const [formData, setFormData] = useState({
    recipient_emails: [''],
    subject: '',
    message: '',
    include_attachment: true
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (report && isOpen) {
      // Set default subject based on report
      const reportTypeLabel = report.report_type.replace('_', ' ').toUpperCase();
      const dateRange = `${report.date_range_start} to ${report.date_range_end}`;
      setFormData(prev => ({
        ...prev,
        subject: `${reportTypeLabel} Report - ${dateRange}`,
        message: `Please find attached the ${reportTypeLabel.toLowerCase()} report for the period ${dateRange}.\n\nThis report includes data for ${report.total_students_included} students.\n\nBest regards,\nTeacherly AI`
      }));
    }
  }, [report, isOpen]);

  useEffect(() => {
    if (emailResult) {
      // Auto-close modal after successful email send
      const timer = setTimeout(() => {
        // Reset form
        setFormData({
          recipient_emails: [''],
          subject: '',
          message: '',
          include_attachment: true
        });
        setValidationErrors({});
        dispatch(clearEmailResult());
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [emailResult, onClose, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.recipient_emails];
    newEmails[index] = value;
    setFormData(prev => ({
      ...prev,
      recipient_emails: newEmails
    }));

    // Clear validation error
    if (validationErrors.recipient_emails) {
      setValidationErrors(prev => ({ ...prev, recipient_emails: '' }));
    }
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      recipient_emails: [...prev.recipient_emails, '']
    }));
  };

  const removeEmailField = (index: number) => {
    if (formData.recipient_emails.length > 1) {
      const newEmails = formData.recipient_emails.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        recipient_emails: newEmails
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate emails
    const validEmails = formData.recipient_emails.filter(email => email.trim() !== '');
    if (validEmails.length === 0) {
      errors.recipient_emails = 'At least one recipient email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = validEmails.filter(email => !emailRegex.test(email.trim()));
      if (invalidEmails.length > 0) {
        errors.recipient_emails = 'Please enter valid email addresses';
      }
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (formData.subject.trim().length > 200) {
      errors.subject = 'Subject must be 200 characters or less';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!report || !validateForm()) {
      return;
    }

    try {
      const validEmails = formData.recipient_emails
        .map(email => email.trim())
        .filter(email => email !== '');

      await dispatch(emailReportThunk({
        report_id: report.report_id,
        recipient_emails: validEmails,
        subject: formData.subject.trim(),
        message: formData.message.trim() || undefined,
        include_attachment: formData.include_attachment
      })).unwrap();

    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      recipient_emails: [''],
      subject: '',
      message: '',
      include_attachment: true
    });
    setValidationErrors({});
    dispatch(clearEmailResult());
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <Card className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <h3>Email Report</h3>
            <button 
              className={styles.closeButton}
              onClick={handleClose}
              disabled={isEmailSending}
            >
              ×
            </button>
          </div>

          {emailResult ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✓</div>
              <h4>Email Sent Successfully!</h4>
              <p>
                Report sent to {emailResult.emails_sent} recipient{emailResult.emails_sent !== 1 ? 's' : ''}.
                {emailResult.failed_emails > 0 && (
                  <span className={styles.failureNote}>
                    {emailResult.failed_emails} email{emailResult.failed_emails !== 1 ? 's' : ''} failed to send.
                  </span>
                )}
              </p>
              {emailResult.details && emailResult.details.length > 0 && (
                <div className={styles.emailDetails}>
                  <p><strong>Details:</strong></p>
                  <ul>
                    {emailResult.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Report Info */}
              {report && (
                <div className={styles.reportInfo}>
                  <h4>Report Details</h4>
                  <div className={styles.reportSummary}>
                    <span><strong>Type:</strong> {report.report_type.replace('_', ' ')}</span>
                    <span><strong>Period:</strong> {report.date_range_start} to {report.date_range_end}</span>
                    <span><strong>Students:</strong> {report.total_students_included}</span>
                  </div>
                </div>
              )}

              {/* Email Recipients */}
              <div className={styles.emailSection}>
                <label className={styles.sectionLabel}>Recipients</label>
                {formData.recipient_emails.map((email, index) => (
                  <div key={index} className={styles.emailRow}>
                    <LabeledInput
                      label={`Email ${index + 1}`}
                      id={`email_${index}`}
                      name={`email_${index}`}
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="Enter email address"
                      required={index === 0}
                    />
                    {formData.recipient_emails.length > 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeEmailField(index)}
                        className={styles.removeButton}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addEmailField}
                  className={styles.addButton}
                >
                  Add Another Email
                </Button>
                {validationErrors.recipient_emails && (
                  <div className={styles.fieldError}>{validationErrors.recipient_emails}</div>
                )}
              </div>

              {/* Subject */}
              <LabeledInput
                label="Subject"
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter email subject"
                required
              />
              {validationErrors.subject && (
                <div className={styles.fieldError}>{validationErrors.subject}</div>
              )}

              {/* Message */}
              <LabeledTextarea
                label="Message (Optional)"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter additional message..."
                rows={4}
              />

              {/* Options */}
              <div className={styles.options}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="include_attachment"
                    checked={formData.include_attachment}
                    onChange={handleInputChange}
                  />
                  Include Excel file attachment
                </label>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isEmailSending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEmailSending || !report}
                >
                  {isEmailSending ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default EmailReportModal;